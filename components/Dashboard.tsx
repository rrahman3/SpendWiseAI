
import React, { useMemo, useState } from 'react';
import { Receipt } from '../types.ts';

interface DashboardProps {
  receipts: Receipt[];
  onScanClick?: () => void;
  onRequestDuplicateCheck?: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type Timeframe = 'MONTHLY' | 'YEARLY';

const Dashboard: React.FC<DashboardProps> = ({ receipts, onScanClick }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    receipts.forEach(r => {
      const d = new Date(r.date);
      if (!isNaN(d.getTime())) years.add(d.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [receipts]);

  const stats = useMemo(() => {
    const filteredReceipts = receipts.filter(r => {
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return false;
      if (timeframe === 'YEARLY') return d.getFullYear() === selectedYear;
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const periodTotal = filteredReceipts.reduce((sum, r) => r.type === 'refund' ? sum - (Number(r.total) || 0) : sum + (Number(r.total) || 0), 0);
    const refunds = filteredReceipts.filter(r => r.type === 'refund').reduce((sum, r) => sum + r.total, 0);

    return { 
      periodTotal, 
      refunds,
      stapleCount: 0 // Placeholder as in screenshot
    };
  }, [receipts, timeframe, selectedMonth, selectedYear]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700 max-w-7xl mx-auto px-4 sm:px-0">
      
      {/* Timeframe and Date Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 p-2 rounded-3xl border border-gray-100/50 backdrop-blur-sm shadow-sm">
        <div className="bg-[#F1F5F9] p-1.5 rounded-2xl flex space-x-1">
          {['MONTHLY', 'YEARLY'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t as Timeframe)}
              className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                timeframe === t 
                  ? 'bg-white text-[#0052FF] shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {timeframe === 'MONTHLY' && (
            <div className="relative flex-1 sm:flex-none">
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-3 text-xs font-black text-gray-900 outline-none appearance-none pr-12 shadow-sm"
              >
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          )}
          <div className="relative flex-1 sm:flex-none">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
              className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-3 text-xs font-black text-gray-900 outline-none appearance-none pr-12 shadow-sm"
            >
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Hero Card - Gradient Blue */}
      <div className="relative bg-gradient-to-br from-[#0A1D4E] via-[#0D2663] to-[#122F77] rounded-[2.5rem] p-12 overflow-hidden shadow-2xl shadow-blue-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-6 flex-1">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              {timeframe === 'MONTHLY' ? MONTHS[selectedMonth] : ''} {selectedYear}
            </h2>
            <p className="text-blue-200/60 font-medium text-lg max-w-md leading-relaxed">
              Gemini has processed your records for this period to build your financial profile.
            </p>
            <div className="flex items-center space-x-4">
               <div className="px-6 py-2.5 bg-white/10 border border-white/5 rounded-full text-[10px] font-black text-white uppercase tracking-widest backdrop-blur-md">
                 {stats.stapleCount} PRICE STAPLES
               </div>
               <div className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest backdrop-blur-md">
                 ${stats.refunds.toFixed(2)} REFUNDED
               </div>
            </div>
          </div>

          <button 
            onClick={onScanClick}
            className="flex-shrink-0 bg-white group hover:bg-blue-50 transition-all p-2 rounded-[2.5rem] flex items-center shadow-2xl"
          >
            <div className="bg-[#0052FF] w-14 h-14 rounded-full flex items-center justify-center text-white mr-6 group-hover:scale-110 transition-transform">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-[#0F172A] font-[900] text-lg pr-10 tracking-tight">Scan Receipt</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Spending Velocity Card */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-gray-50 shadow-sm flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-44 h-44 flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="80" className="stroke-gray-50 fill-none" strokeWidth="12" />
              <circle 
                cx="50%" cy="50%" r="80" 
                className="stroke-[#0052FF] fill-none transition-all duration-1000" 
                strokeWidth="12" 
                strokeLinecap="round" 
                strokeDasharray="502"
                strokeDashoffset="480"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">PERIOD SPEND</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">${stats.periodTotal.toLocaleString()}</p>
            </div>
            {/* The little blue dot on the chart */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0052FF] border-4 border-white rounded-full shadow-lg"></div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Spending Velocity</h3>
              <p className="text-xs text-gray-400 italic mt-1 font-medium">"Current trajectory suggests a total of $0.00 for this period."</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F1F7FF] p-6 rounded-2xl border border-blue-50">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#0052FF]/60 mb-2">DAILY AVERAGE</p>
                <p className="text-xl font-black text-[#0052FF]">$0.00</p>
              </div>
              <div className="bg-[#F9FAFB] p-6 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">PREDICTED MONTH END</p>
                <p className="text-xl font-black text-gray-900">$0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Net Period Card */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-gray-50 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Net Period</h3>
            <div className="space-y-1">
               <p className="text-4xl font-black text-[#0052FF] tracking-tighter">${stats.periodTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
               <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">TOTAL FOR {MONTHS[selectedMonth].toUpperCase()}</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-50">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">ACTIVITY LEVEL</span>
                <span className="text-[10px] font-black uppercase text-gray-900">Normal</span>
             </div>
             <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-[#0052FF] rounded-full"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Secondary Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Merchant Loyalty Card */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-50 shadow-sm min-h-[400px] flex flex-col">
           <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Merchant Loyalty</h3>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">SHARE OF WALLET IN {selectedYear}</p>
              </div>
              <div className="px-4 py-1.5 bg-blue-50 text-[#0052FF] text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                PERIOD TOP 5
              </div>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">NO MERCHANT DATA FOR THIS PERIOD</p>
           </div>
        </div>

        {/* Category Mix Card */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-50 shadow-sm min-h-[400px] flex flex-col">
           <div className="mb-12">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Category Mix</h3>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">SPENDING PROFILE</p>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">NO ITEMS FOUND FOR THIS PERIOD</p>
           </div>
        </div>
      </div>

      {/* Lifetime Price Pulse */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-50 shadow-sm">
        <div className="mb-12">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Lifetime Price Pulse</h3>
          <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">HISTORICAL STABILITY OF STAPLE ITEMS</p>
        </div>
        
        <div className="bg-gray-50/50 rounded-[2.5rem] p-24 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
           <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-200 shadow-sm mb-4 border border-gray-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">ADD ITEMS TO TRACK PRICE PULSE</p>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
