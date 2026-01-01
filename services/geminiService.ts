
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Receipt, ReceiptItem } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getHistoricalContext = (history: Receipt[]) => {
  if (!history || history.length === 0) return "";
  
  const storeSpecific: Record<string, Record<string, string>> = {};
  const globalItems: Record<string, string> = {};

  // Process history from newest to oldest to capture latest preference
  [...history].reverse().forEach(r => {
    const store = r.storeName.toLowerCase().trim();
    if (!storeSpecific[store]) storeSpecific[store] = {};
    
    r.items.forEach(i => {
      const itemName = i.name.toLowerCase().trim();
      if (i.subcategory) {
        if (!storeSpecific[store][itemName]) storeSpecific[store][itemName] = i.subcategory;
        if (!globalItems[itemName]) globalItems[itemName] = i.subcategory;
      }
    });
  });

  const rules: string[] = [];
  
  // 1. Store-specific rules (high priority)
  Object.entries(storeSpecific).slice(0, 15).forEach(([store, items]) => {
    Object.entries(items).slice(0, 5).forEach(([item, sub]) => {
      rules.push(`- Store: "${store}" | Item: "${item}" -> Subcategory: "${sub}"`);
    });
  });

  // 2. Global item rules (fallback)
  Object.entries(globalItems).slice(0, 20).forEach(([item, sub]) => {
    rules.push(`- Global | Item: "${item}" -> Subcategory: "${sub}"`);
  });

  if (rules.length === 0) return "";

  return `
HISTORICAL SUBCATEGORY PREFERENCES (Follow these rules strictly for consistency):
${rules.join('\n')}
  `.trim();
};

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try { return await fn(); }
    catch (err: any) {
      lastError = err;
      if (String(err).includes("429") && i < maxRetries - 1) { await sleep(Math.pow(2, i + 1) * 1000); continue; }
      throw err;
    }
  }
  throw lastError;
}

const sanitizeExtractedData = (data: any): Partial<Receipt> => ({
  type: data.type === 'refund' ? 'refund' : 'purchase',
  storeName: String(data.storeName || 'Unknown Merchant'),
  date: String(data.date || new Date().toISOString().split('T')[0]),
  total: Number(data.total) || 0,
  currency: String(data.currency || 'USD'),
  items: Array.isArray(data.items) ? data.items.map((i: any) => ({ 
    name: String(i.name || 'Item'), 
    quantity: Number(i.quantity) || 1, 
    price: Number(i.price) || 0, 
    category: String(i.category || 'General'), 
    subcategory: String(i.subcategory || '') 
  })) : []
});

const PROMPT_CORE = `Extract receipt data accurately. Cross-verify quantities and unit prices against the total. Identify taxes as category 'fee'. Use the provided historical preferences for subcategories to ensure 100% consistency with previous labels. If a new item doesn't have a rule, categorize it logically based on similar existing rules. Return valid JSON.`;

export const extractReceiptData = async (base64Image: string, history: Receipt[] = []): Promise<Partial<Receipt>> => {
  const model = 'gemini-flash-lite-latest';
  const historyText = getHistoricalContext(history);
  const prompt = `Extract receipt data from image. ${PROMPT_CORE}\n\n${historyText}`;
  
  return withRetry(async () => {
    const res = await ai.models.generateContent({ 
      model, 
      contents: { 
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } }, 
          { text: prompt }
        ] 
      }, 
      config: { responseMimeType: "application/json" } 
    });
    return sanitizeExtractedData(JSON.parse(res.text || '{}'));
  });
};

export const processCSVData = async (csvSnippet: string): Promise<Partial<Receipt>[]> => {
  const model = 'gemini-3-flash-preview';
  const prompt = `Convert the following CSV data into an array of SpendWise Receipt objects. 
  Logic: Identify which columns represent Store Name, Date, Total, and optionally Item Names/Prices.
  Return an array of objects matching this schema: 
  [{ 
    "storeName": string, 
    "date": string (YYYY-MM-DD), 
    "total": number, 
    "type": "purchase" | "refund",
    "items": [{ "name": string, "price": number, "quantity": number, "category": string, "subcategory": string }]
  }]
  CSV DATA:
  ${csvSnippet}`;

  return withRetry(async () => {
    const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
    const parsed = JSON.parse(res.text || '[]');
    return Array.isArray(parsed) ? parsed.map(sanitizeExtractedData) : [];
  });
};

export const extractEmailData = async (text: string, history: Receipt[] = []): Promise<Partial<Receipt>> => {
  const model = 'gemini-3-flash-preview';
  const historyText = getHistoricalContext(history);
  const prompt = `Extract receipt data from email content. ${PROMPT_CORE}\n\n${historyText}`;
  
  return withRetry(async () => {
    const res = await ai.models.generateContent({ 
      model, 
      contents: [
        { text: prompt }, 
        { text }
      ], 
      config: { responseMimeType: "application/json" } 
    });
    return sanitizeExtractedData(JSON.parse(res.text || '{}'));
  });
};

export const chatWithHistory = async (history: Receipt[], userQuestion: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const context = JSON.stringify(history.map(r => ({ 
    s: r.storeName, 
    d: r.date, 
    t: r.total, 
    i: r.items.map(item => ({ n: item.name, p: item.price, c: item.category, sc: item.subcategory })) 
  })));
  
  return withRetry(async () => {
    const res = await ai.models.generateContent({ 
      model, 
      contents: userQuestion, 
      config: { systemInstruction: `You are SpendWise AI, a financial assistant. Use the following context for analysis: ${context}. Help the user reconcile and understand their spending.` } 
    });
    return res.text || "I couldn't process that.";
  });
};
