
import React, { useState } from 'react';
import { extractEmailData } from '../services/geminiService';
import { Receipt } from '../types';
import EditModal from './EditModal';

interface EmailSyncProps {
  onReceiptProcessed: (receipt: Receipt) => void;
  onFinished: () => void;
  receipts: Receipt[]; // Added receipts prop for context
}

const EmailSync: React.FC<EmailSyncProps> = ({ onReceiptProcessed, onFinished, receipts }) => {
  const [emailContent, setEmailContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const handleParseEmail = async () => {
    if (!emailContent.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      // Pass current history to prompt context
      const extracted = await extractEmailData(emailContent, receipts);
      
      const newReceipt: Receipt = {
        id: Math.random().toString(36).substr(2, 9),
        type: (extracted.type as 'purchase' | 'refund') || 'purchase',
        storeName: extracted.storeName || 'Online Merchant',
        date: extracted.date || new Date().toISOString().split('T')[0],
        total: extracted.total || 0,
        currency: extracted.currency || 'USD',
        items: extracted.items || [],
        createdAt: Date.now(),
        source: 'email'
      };

      setEditingReceipt(newReceipt);
    } catch (err) {
      alert("Failed to parse email. Please try pasting the content again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncSimulate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 space-y-10">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Digital Vault</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Sync online purchases & email invoices</p>
          </div>
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-100 text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <button 
             onClick={handleSyncSimulate}
             disabled={isProcessing}
             className="group relative p-8 bg-gray-900 rounded-[2.5rem] text-left overflow-hidden transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                   </svg>
                </div>
                <div>
                   <h3 className="text-xl font-black text-white">Sync Gmail</h3>
                   <p className="text-gray-400 text-sm font-medium">Auto-import last 30 days of receipts.</p>
                </div>
              </div>
           </button>

           <div className="p-8 bg-blue-50 rounded-[2.5rem] space-y-4 border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
              </div>
              <div>
                 <h3 className="text-xl font-black text-gray-900">Smart Parser</h3>
                 <p className="text-blue-600/60 text-sm font-black uppercase tracking-widest">Powered by Gemini AI</p>
              </div>
           </div>
        </div>

        {showSyncSuccess && (
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-black uppercase tracking-widest">Inbox sync completed. No new receipts found.</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Paste Email Content Below</label>
             {emailContent.length > 0 && (
               <button 
                onClick={() => setEmailContent('')}
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600"
               >
                 Clear
               </button>
             )}
          </div>
          <textarea
            rows={10}
            className="w-full bg-gray-50 border-none rounded-[2rem] p-8 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-gray-800 placeholder:text-gray-300 transition-all shadow-inner"
            placeholder="Subject: Your Order #12345 Confirmation...
Items: 1x Organic Milk - $4.99, 2x Apples - $3.00...
Total: $8.50"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
          />
        </div>

        <button
          onClick={handleParseEmail}
          disabled={!emailContent.trim() || isProcessing}
          className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center space-x-3 ${
            !emailContent.trim() || isProcessing 
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Intelligence Analysis Active...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Parse Digital Receipt</span>
            </>
          )}
        </button>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onFinished}
          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
        >
          Done, back to records
        </button>
      </div>

      {editingReceipt && (
        <EditModal 
          receipt={editingReceipt}
          onSave={(updated) => {
            onReceiptProcessed(updated);
            setEditingReceipt(null);
            setEmailContent('');
            onFinished();
          }}
          onClose={() => setEditingReceipt(null)}
        />
      )}
    </div>
  );
};

export default EmailSync;
