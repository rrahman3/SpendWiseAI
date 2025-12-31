
import React, { useState, useRef } from 'react';
import { extractReceiptData } from '../services/geminiService';
import { Receipt } from '../types';

interface ReceiptScannerProps {
  onReceiptProcessed: (receipt: Receipt) => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onReceiptProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      setPreview(reader.result as string);

      try {
        const extracted = await extractReceiptData(base64String);
        
        const newReceipt: Receipt = {
          id: Math.random().toString(36).substr(2, 9),
          storeName: extracted.storeName || 'Unknown Store',
          date: extracted.date || new Date().toISOString().split('T')[0],
          total: extracted.total || 0,
          currency: extracted.currency || 'USD',
          items: extracted.items || [],
          imageUrl: reader.result as string,
          createdAt: Date.now(),
        };

        onReceiptProcessed(newReceipt);
        setPreview(null);
      } catch (err) {
        console.error(err);
        setError('Failed to extract information. Please try a clearer photo.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        {!preview ? (
          <>
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Your Receipt</h2>
            <p className="text-gray-500 mb-8">Take a photo or upload an image of your receipt to automatically extract items and prices.</p>
            
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              Capture Receipt
            </button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="relative group">
              <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-2xl shadow-inner border border-gray-200" />
              {isProcessing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-blue-600 font-semibold">Gemini AI is analyzing...</p>
                  <p className="text-xs text-blue-400 mt-2 italic px-8">Extracting items, store name, and prices</p>
                </div>
              )}
            </div>
            
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            
            <button
              onClick={() => { setPreview(null); setError(null); }}
              disabled={isProcessing}
              className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      <div className="text-gray-400 text-xs text-center max-w-md">
        Supported formats: JPG, PNG, WEBP. For best results, ensure the receipt is flat and well-lit.
      </div>
    </div>
  );
};

export default ReceiptScanner;
