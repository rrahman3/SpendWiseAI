
import React, { useState, useRef } from 'react';
import { processCSVData } from '../services/geminiService.ts';
import { Receipt } from '../types.ts';

interface CSVImporterProps {
  onBatchProcessed: (receipts: Receipt[]) => void;
  onFinished: () => void;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onBatchProcessed, onFinished }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Receipt>[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setIsProcessing(true);
      try {
        // We take the first 100 lines to give Gemini enough context without hitting token limits
        const snippet = content.split('\n').slice(0, 100).join('\n');
        const results = await processCSVData(snippet);
        setExtractedData(results);
      } catch (err) {
        alert("Failed to process CSV. Ensure it has headers like 'Store', 'Date', and 'Amount'.");
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const finalReceipts: Receipt[] = extractedData.map(data => ({
      id: Math.random().toString(36).substr(2, 9),
      type: data.type || 'purchase',
      storeName: data.storeName || 'Unknown Store',
      date: data.date || new Date().toISOString().split('T')[0],
      total: data.total || 0,
      currency: data.currency || 'USD',
      items: data.items || [],
      createdAt: Date.now(),
      source: 'csv'
    }));

    onBatchProcessed(finalReceipts);
    onFinished();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 space-y-10">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Bulk Purchase Importer</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">AI-Powered CSV Reconciliation</p>
          </div>
          <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-100 text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m3.236 4a2 2 0 001.764 1h12a2 2 0 001.764-1l1.618-3.236A2 2 0 0019.592 13H4.408a2 2 0 00-1.764 1L1 17.236z" />
            </svg>
          </div>
        </div>

        {!fileName ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-gray-100 rounded-[3rem] p-24 text-center cursor-pointer hover:bg-indigo-50/30 transition-all flex flex-col items-center group"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-2xl font-black text-gray-800">Drop CSV File</p>
            <p className="text-sm text-gray-400 font-medium mt-2 italic">Bank statements, app exports, or custom sheets.</p>
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <div>
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Active File</p>
                    <p className="text-lg font-black text-gray-900">{fileName}</p>
                  </div>
               </div>
               <button onClick={() => { setFileName(null); setExtractedData([]); }} className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">Change File</button>
            </div>

            {isProcessing ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Gemini is Mapping Schema...</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100/50">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Store</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {extractedData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white transition-colors">
                          <td className="px-6 py-4 text-sm font-black text-gray-900">{item.storeName}</td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-500">{item.date}</td>
                          <td className="px-6 py-4 text-sm font-black text-gray-900 text-right">${item.total?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4">
                   <button 
                    onClick={onFinished}
                    className="flex-1 py-5 bg-gray-100 text-gray-900 font-black rounded-3xl uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={handleConfirmImport}
                    className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-3xl uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                   >
                     Import {extractedData.length} Records
                   </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVImporter;
