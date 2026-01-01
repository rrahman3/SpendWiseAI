
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Receipt, ReceiptItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to wait for a specific amount of time
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper to handle API calls with exponential backoff for 429 errors
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isRateLimit = String(err).includes("429") || 
                          String(err).toLowerCase().includes("quota") || 
                          String(err).toLowerCase().includes("exhausted");
      
      if (isRateLimit && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i + 1) * 1000;
        console.warn(`Rate limit hit. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(waitTime);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Validates and corrects item prices based on the reported total.
 */
const sanitizeExtractedData = (data: any): Partial<Receipt> => {
  if (!data.items || !Array.isArray(data.items)) return data;

  const reportedTotal = data.total || 0;
  
  const correctedItems = data.items.map((item: any) => {
    const qty = item.quantity || 1;
    const price = item.price || 0;
    const lineTotal = item.lineTotal || (price * qty);

    let correctedPrice = price;
    if (qty > 1 && Math.abs(price - lineTotal) < 0.01 && price > 0) {
      correctedPrice = price / qty;
    }

    return {
      ...item,
      price: correctedPrice,
      quantity: qty
    };
  });

  const calculatedSum = correctedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  if (calculatedSum > reportedTotal * 1.5 && reportedTotal > 0) {
    correctedItems.forEach(item => {
      if (item.quantity > 1) {
        item.price = item.price / item.quantity;
      }
    });
  }

  return { ...data, items: correctedItems };
};

export const extractReceiptData = async (base64Image: string): Promise<Partial<Receipt>> => {
  // Using flash-lite for higher quota during batch processing
  const model = 'gemini-flash-lite-latest';
  
  const prompt = `You are a world-class financial auditor. Extract data from this receipt with surgical precision.
  
  FIELD INSTRUCTIONS:
  1. type: 'purchase' or 'refund'.
  2. storeName: The trade name of the merchant.
  3. items: Array of objects. For each item:
     - name: Descriptive product name.
     - quantity: Number of units.
     - price: THE UNIT PRICE (Price for exactly ONE unit).
     - lineTotal: The total cost for that line (qty * unit price).
     - category: High-level group (e.g., Groceries, Dining, Electronics, Health, Apparel, Home).
     - subcategory: Specific type (e.g., Dairy, Produce, Fast Food, Pharmacy, Cleaning Supplies).
  
  CRITICAL MATH LOGIC:
  - If a receipt shows "2 @ 5.00 ... 10.00", the 'price' is 5.00 and 'quantity' is 2.
  - If it ONLY shows "2 x MILK ... 12.00", you MUST divide 12 by 2 and set 'price' to 6.00.
  - DO NOT put the total line cost in the 'price' field if quantity is > 1.
  
  INTELLIGENT CATEGORIZATION:
  - Use the Store Name and Item Name to determine the most logical Category and Subcategory. 
  - Be specific. "Grocery > Produce" is better than just "Food".
  
  Return strictly valid JSON.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['purchase', 'refund'] },
            storeName: { type: Type.STRING },
            date: { type: Type.STRING },
            total: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER, description: "Unit price for 1 item" },
                  lineTotal: { type: Type.NUMBER, description: "Total for line (qty * price)" },
                  category: { type: Type.STRING },
                  subcategory: { type: Type.STRING }
                },
                required: ["name", "quantity", "price", "category", "subcategory"]
              }
            }
          },
          required: ["type", "storeName", "date", "total", "items"]
        }
      }
    });

    const rawData = JSON.parse(response.text || '{}');
    return sanitizeExtractedData(rawData);
  });
};

export const chatWithHistory = async (history: Receipt[], userQuestion: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  
  const context = JSON.stringify(history.map(r => ({
    type: r.type,
    store: r.storeName,
    date: r.date,
    total: r.total,
    items: r.items
  })));

  const systemPrompt = `You are SpendWise AI, a financial assistant. 
  History: ${context}. 
  Provide helpful, accurate summaries and answers. Use Markdown. If asked about trends, look at categories and subcategories.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: userQuestion,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });
    return response.text || "I couldn't process that.";
  });
};
