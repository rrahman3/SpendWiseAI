
import React, { useState } from 'react';
import { Receipt } from '../types';

interface PurchaseHistoryProps {
  receipts: Receipt[];
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ receipts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const filteredReceipts = receipts
    .filter(r => 
      r.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6 pb-20">
      <div className="relative">
        <input
          type="text"
          placeholder="Search stores or items..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReceipts.map(receipt => (
          <div 
            key={receipt.id}
            onClick={() => setSelectedReceipt(receipt)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{receipt.storeName}</h4>
                <p className="text-xs text-gray-500">{new Date(receipt.date).toLocaleDateString()}</p>
              </div>
              <span className="text-lg font-bold text-gray-900">${receipt.total.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-2 mb-4">
              {Array.from(new Set(receipt.items.map(i => i.category))).slice(0, 2).map(cat => (
                <span key={cat} className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {cat || 'Item'}
                </span>
              ))}
              {receipt.items.length > 2 && <span className="text-[10px] text-gray-400 font-medium self-center">+{receipt.items.length - 2} more</span>}
            </div>

            <div className="flex items-center text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Scanned {new Date(receipt.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">{selectedReceipt.storeName}</h3>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-500 font-medium">Date of Purchase: {selectedReceipt.date}</p>
                <p className="text-2xl font-black text-gray-900">${selectedReceipt.total.toFixed(2)}</p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Items Purchased</h5>
                {selectedReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} • {item.category}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {selectedReceipt.imageUrl && (
                <div className="pt-4">
                  <h5 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2">Original Receipt</h5>
                  <img src={selectedReceipt.imageUrl} alt="Receipt Scan" className="w-full rounded-2xl border border-gray-100 shadow-sm" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
