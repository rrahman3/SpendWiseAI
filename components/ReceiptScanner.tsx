
import React, { useState, useRef, useEffect } from 'react';
import { extractReceiptData } from '../services/geminiService.ts';
import { Receipt } from '../types.ts';
import EditModal from './EditModal.tsx';

interface ReceiptScannerProps {
  onReceiptProcessed: (receipt: Receipt) => void;
  onFinished: () => void;
  receipts: Receipt[];
}

interface QueuedItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'verified' | 'error';
  fullData?: Receipt;
  error?: string;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onReceiptProcessed, onFinished, receipts }) => {
  const [queue, setQueue] = useState<QueuedItem[]>([]);
  const [isAnyProcessing, setIsAnyProcessing] = useState(false);
  const [editingItem, setEditingItem] = useState<QueuedItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } }
        else { if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; } }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Failed to get canvas context')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = (e) => reject(e);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length === 0) return;
    // Fix: explicitly type the mapped objects to QueuedItem to prevent status widening to string
    setQueue(prev => [...prev, ...selectedFiles.map(file => ({ 
      id: Math.random().toString(36).substr(2, 9), 
      file, 
      preview: URL.createObjectURL(file), 
      status: 'pending' as 'pending'
    }))]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processQueue = async () => {
    if (isAnyProcessing) return;
    const nextItem = queue.find(item => item.status === 'pending');
    if (!nextItem) return;
    setIsAnyProcessing(true);
    setQueue(prev => prev.map(item => item.id === nextItem.id ? { ...item, status: 'processing' } : item));
    try {
      const originalBase64 = await new Promise<string>((resolve) => { const r = new FileReader(); r.onloadend = () => resolve(r.result as string); r.readAsDataURL(nextItem.file); });
      const resizedDataUrl = await resizeImage(originalBase64);
      const extracted = await extractReceiptData(resizedDataUrl.split(',')[1], receipts);
      const newReceipt: Receipt = { id: Math.random().toString(36).substr(2, 9), type: (extracted.type as 'purchase' | 'refund') || 'purchase', storeName: extracted.storeName || 'Unknown Store', date: extracted.date || new Date().toISOString().split('T')[0], total: extracted.total || 0, currency: extracted.currency || 'USD', items: extracted.items || [], imageUrl: resizedDataUrl, createdAt: Date.now() };
      onReceiptProcessed(newReceipt);
      setQueue(prev => prev.map(item => item.id === nextItem.id ? { ...item, status: 'verified', fullData: newReceipt } : item));
    } catch (err) {
      console.error(err);
      setQueue(prev => prev.map(item => item.id === nextItem.id ? { ...item, status: 'error', error: 'Extraction failed' } : item));
    } finally { setIsAnyProcessing(false); }
  };

  useEffect(() => { processQueue(); }, [queue, isAnyProcessing]);

  return (
    <div className="flex flex-col items-center min-h-[600px] space-y-8 max-w-6xl mx-auto w-full pb-32">
      <div className="w-full bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden relative text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-8">Batch Analyzer</h2>
        {queue.length === 0 ? (
          <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed border-gray-100 rounded-[3.5rem] p-32 cursor-pointer hover:bg-blue-50/20 transition-all flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 text-white"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
            <p className="text-2xl font-black text-gray-800">Upload Batch</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {queue.map(item => (
                <div key={item.id} className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden relative border group cursor-pointer" onClick={() => item.status === 'verified' && setEditingItem(item)}>
                  <img src={item.preview} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 flex flex-col items-center justify-center text-white ${item.status === 'processing' ? 'bg-blue-600/70' : 'bg-black/20 opacity-0 group-hover:opacity-100'} transition-all`}>
                    {item.status === 'processing' ? <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" /> : <span className="text-[10px] font-black uppercase">View Details</span>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={onFinished} className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-200">Finalize Records</button>
          </div>
        )}
        <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      </div>
      {editingItem?.fullData && <EditModal receipt={editingItem.fullData} onSave={(updated) => onReceiptProcessed(updated)} onClose={() => setEditingItem(null)} />}
    </div>
  );
};

export default ReceiptScanner;
