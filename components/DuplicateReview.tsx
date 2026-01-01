
import React, { useState, useMemo } from 'react';
import { Receipt } from '../types.ts';

interface DuplicateReviewProps {
  receipts: Receipt[];
  onDeleteReceipt: (id: string) => void;
  onFinished: () => void;
}

interface DuplicateGroup {
  id: string;
  receipts: Receipt[];
  reason: 'exact' | 'fuzzy';
}

const DuplicateReview: React.FC<DuplicateReviewProps> = ({ receipts, onDeleteReceipt, onFinished }) => {
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const duplicateGroups = useMemo(() => {
    const groups: DuplicateGroup[] = [];
    const processedIds = new Set<string>();

    const sorted = [...receipts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (let i = 0; i < sorted.length; i++) {
      const r1 = sorted[i];
      if (processedIds.has(r1.id)) continue;

      const group: Receipt[] = [r1];
      let matchType: 'exact' | 'fuzzy' = 'exact';

      for (let j = i + 1; j < sorted.length; j++) {
        const r2 = sorted[j];
        if (processedIds.has(r2.id)) continue;

        const isExact = r1.storeName.toLowerCase().trim() === r2.storeName.toLowerCase().trim() &&
                        r1.date === r2.date &&
                        Math.abs(r1.total - r2.total) < 0.01;

        const isFuzzy = r1.storeName.toLowerCase().trim() === r2.storeName.toLowerCase().trim() &&
                        r1.date === r2.date &&
                        Math.abs(r1.total - r2.total) / Math.max(r1.total, 1) < 0.15; // 15% price diff on same day/store

        if (isExact || isFuzzy) {
          group.push(r2);
          if (!isExact) matchType = 'fuzzy';
        }
      }

      if (group.length > 1) {
        group.forEach(r => processedIds.add(r.id));
        groups.push({
          id: `group-${r1.id}`,
          receipts: group,
          reason: matchType
        });
      }
    }
    return groups;
  }, [receipts]);

  const activeGroups = duplicateGroups.filter(g => !resolvedIds.has(g.id));

  const handleResolve = (groupId: string, keepId: string, deleteIds: string[]) => {
    deleteIds.forEach(id => onDeleteReceipt(id));
    setResolvedIds(prev => new Set([...prev, groupId]));
  };

  const handleKeepAll = (groupId: string) => {
    setResolvedIds(prev => new Set([...prev, groupId]));
  };

  if (activeGroups.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Records are Optimized</h2>
          <p className="text-gray-400 font-medium">No suspicious duplicate clusters were identified in your current history.</p>
        </div>
        <button 
          onClick={onFinished}
          className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-32 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Duplicate Intelligence</h2>
          <p className="text-xs font-black text-amber-500 uppercase tracking-widest">Reviewing {activeGroups.length} suspicious clusters</p>
        </div>
        <button 
          onClick={onFinished}
          className="text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest"
        >
          Exit Review
        </button>
      </div>

      <div className="space-y-8">
        {activeGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className={`px-8 py-4 flex items-center justify-between ${group.reason === 'exact' ? 'bg-red-50' : 'bg-amber-50'}`}>
               <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${group.reason === 'exact' ? 'bg-red-500' : 'bg-amber-500'} animate-pulse`}></div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${group.reason === 'exact' ? 'text-red-600' : 'text-amber-600'}`}>
                    {group.reason === 'exact' ? 'Exact Match Detected' : 'Likely Duplicate (Fuzzy Match)'}
                  </span>
               </div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{group.receipts.length} Possible Duplicates</span>
            </div>

            <div className="p-10 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {group.receipts.map((r, idx) => (
                    <div key={r.id} className="p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-blue-100 transition-all flex flex-col justify-between">
                       <div className="space-y-4">
                          <div className="flex justify-between items-start">
                             <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Record #{idx + 1}</p>
                                <h4 className="text-xl font-black text-gray-900">{r.storeName}</h4>
                                <p className="text-sm font-bold text-gray-500">{new Date(r.date).toLocaleDateString()}</p>
                             </div>
                             <p className="text-2xl font-black text-gray-900">${r.total.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[9px] font-black uppercase bg-white px-2 py-1 rounded-md border border-gray-100 text-gray-500">Source: {r.source || 'scan'}</span>
                            <span className="text-[9px] font-black uppercase bg-white px-2 py-1 rounded-md border border-gray-100 text-gray-500">{r.items.length} Items</span>
                          </div>
                       </div>
                       
                       <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                          <button 
                            onClick={() => {
                              const others = group.receipts.filter(o => o.id !== r.id).map(o => o.id);
                              handleResolve(group.id, r.id, others);
                            }}
                            className="flex-1 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all"
                          >
                            Keep This One
                          </button>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => handleKeepAll(group.id)}
                    className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>These are different transactions</span>
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DuplicateReview;
