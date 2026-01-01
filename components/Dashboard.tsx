
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Receipt, ReceiptItem } from '../types';

interface DashboardProps {
  receipts: Receipt[];
  onScanClick?: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type Timeframe = 'monthly' | 'yearly';

const Dashboard: React.FC<DashboardProps> = ({ receipts, onScanClick }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedStaple, setSelectedStaple] = useState<string>('');

  // Extract available years from receipts
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    receipts.forEach(r => years.add(new Date(r.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [receipts]);

  const stats = useMemo(() => {
    const now = new Date();
    
    // 1. Filter receipts based on timeframe
    const filteredReceipts = receipts.filter(r => {
      const d = new Date(r.date);
      if (timeframe === 'yearly') {
        return d.getFullYear() === selectedYear;
      }
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    // 2. Aggregate Stats for the period
    const periodTotal = filteredReceipts.reduce((sum, r) => r.type === 'refund' ? sum - r.total : sum + r.total, 0);
    const periodRefunds = filteredReceipts.filter(r => r.type === 'refund').reduce((sum, r) => sum + r.total, 0);
    
    // 3. Velocity & Forecasting (Only truly accurate for current month/year)
    const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
    const isCurrentYear = selectedYear === now.getFullYear();
    
    let burnMetric = 0;
    let forecast = 0;
    let burnLabel = "Daily Average";
    let forecastLabel = "Predicted End";

    if (timeframe === 'monthly') {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const currentDay = isCurrentMonth ? now.getDate() : daysInMonth;
      burnMetric = periodTotal / currentDay;
      forecast = burnMetric * daysInMonth;
      burnLabel = "Daily Average";
      forecastLabel = "Predicted Month End";
    } else {
      const currentMonthIndex = isCurrentYear ? now.getMonth() + 1 : 12;
      burnMetric = periodTotal / currentMonthIndex;
      forecast = burnMetric * 12;
      burnLabel = "Monthly Average";
      forecastLabel = "Predicted Year End";
    }

    // 4. Merchant Loyalty (Share of Wallet for period)
    const merchantMap: Record<string, number> = {};
    filteredReceipts.forEach(r => {
      if (r.type === 'purchase') {
        merchantMap[r.storeName] = (merchantMap[r.storeName] || 0) + r.total;
      }
    });
    const merchantData = Object.entries(merchantMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // 5. Category Data for period
    const categoryDataMap: Record<string, number> = {};
    filteredReceipts.forEach(r => {
      r.items.forEach(item => {
        const cat = item.category || 'Other';
        const value = item.price * item.quantity;
        categoryDataMap[cat] = r.type === 'refund' 
          ? (categoryDataMap[cat] || 0) - value 
          : (categoryDataMap[cat] || 0) + value;
      });
    });
    const categoryData = Object.entries(categoryDataMap)
      .map(([name, value]) => ({ name, value: Math.max(0, value) }))
      .filter(d => d.value > 0);

    // 6. Price Volatility (Staples) - This uses full history to show trends
    const allPurchasedItems: { name: string, price: number, date: string, store: string }[] = [];
    const itemFrequency: Record<string, number> = {};

    receipts.forEach(r => {
      if (r.type === 'purchase') {
        r.items.forEach(i => {
          const name = i.name.toLowerCase().trim();
          allPurchasedItems.push({ name, price: i.price, date: r.date, store: r.storeName });
          itemFrequency[name] = (itemFrequency[name] || 0) + 1;
        });
      }
    });

    const staples = Object.entries(itemFrequency)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    const activeStaple = selectedStaple || staples[0] || '';
    const priceHistory = allPurchasedItems
      .filter(i => i.name === activeStaple)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(i => ({
        date: i.date,
        price: i.price,
        store: i.store
      }));

    return { 
      periodTotal, 
      periodRefunds,
      burnMetric, 
      forecast, 
      categoryData, 
      merchantData, 
      staples, 
      activeStaple, 
      priceHistory,
      burnLabel,
      forecastLabel
    };
  }, [receipts, selectedStaple, timeframe, selectedMonth, selectedYear]);

  return (
    <div className="space-y-8 pb-12">
      {/* Timeframe Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setTimeframe('monthly')}
            className={`flex-1 md:flex-none px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${timeframe === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setTimeframe('yearly')}
            className={`flex-1 md:flex-none px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${timeframe === 'yearly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Yearly
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {timeframe === 'monthly' && (
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="flex-1 md:flex-none bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          )}
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="flex-1 md:flex-none bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight">
              {timeframe === 'monthly' ? `${MONTHS[selectedMonth]} ${selectedYear}` : `${selectedYear} Overview`}
            </h2>
            <p className="text-blue-200/80 font-medium max-w-md">Gemini has processed your records for this period to build your financial profile.</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/5">
                {stats.staples.length} Price Staples
              </span>
              <span className="bg-emerald-500/20 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-500/20 text-emerald-400">
                ${stats.periodRefunds.toFixed(2)} Refunded
              </span>
            </div>
          </div>
          <button 
            onClick={onScanClick}
            className="bg-white text-gray-900 px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center space-x-3 group"
          >
            <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span>Scan Receipt</span>
          </button>
        </div>
      </div>

      {/* Velocity & Forecasting Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-48 h-48 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="70" className="stroke-gray-50 fill-none" strokeWidth="15" />
                <circle 
                  cx="50%" cy="50%" r="70" 
                  className="stroke-blue-600 fill-none" 
                  strokeWidth="15" 
                  strokeLinecap="round"
                  strokeDasharray={`${(Math.min(stats.periodTotal / (stats.forecast || 1), 1)) * 440} 440`}
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Period Spend</p>
                <p className="text-2xl font-black text-gray-900">${stats.periodTotal.toFixed(0)}</p>
             </div>
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-xl font-black text-gray-900">Spending Velocity</h3>
              <p className="text-sm text-gray-400 font-medium italic">"Current trajectory suggests a total of ${stats.forecast.toFixed(2)} for this period."</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest mb-1">{stats.burnLabel}</p>
                  <p className="text-xl font-black text-blue-600">${stats.burnMetric.toFixed(2)}</p>
               </div>
               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">{stats.forecastLabel}</p>
                  <p className="text-xl font-black text-gray-900">${stats.forecast.toFixed(0)}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-4">
           <h3 className="text-lg font-black text-gray-900">Net Period</h3>
           <div className="space-y-1">
             <p className="text-4xl font-black text-blue-600 tracking-tighter">${stats.periodTotal.toFixed(2)}</p>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                {timeframe === 'monthly' ? `Total for ${MONTHS[selectedMonth]}` : `Total for ${selectedYear}`}
             </p>
           </div>
           <div className="pt-4 border-t border-gray-50">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-black uppercase text-gray-400">Activity Level</span>
                 <span className="text-[10px] font-black text-gray-900">Normal</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 w-1/2"></div>
              </div>
           </div>
        </div>
      </div>

      {/* Share of Wallet & Category Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900">Merchant Loyalty</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Share of Wallet in {selectedYear}</p>
              </div>
              <div className="bg-blue-50 px-3 py-1 rounded-xl text-blue-600 text-[10px] font-black uppercase">Period Top 5</div>
           </div>
           <div className="h-64">
              {stats.merchantData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.merchantData} layout="vertical" margin={{ left: -20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} width={100} fontWeight="bold" />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(val: number) => [`$${val.toFixed(2)}`, 'Total Spent']}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest">No merchant data for this period</div>
              )}
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900">Category Mix</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Spending Profile</p>
              </div>
          </div>
          <div className="h-64 flex flex-col md:flex-row items-center">
            {stats.categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {stats.categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(val: number) => `$${val.toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full md:w-48 flex flex-col space-y-2 mt-4 md:mt-0">
                   {stats.categoryData.slice(0, 4).map((d, i) => (
                     <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                           <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                           <span className="font-bold text-gray-600 truncate max-w-[80px]">{d.name}</span>
                        </div>
                        <span className="font-black text-gray-900">${d.value.toFixed(0)}</span>
                     </div>
                   ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest">No items found for this period</div>
            )}
          </div>
        </div>
      </div>

      {/* Price Volatility Watch - Always based on full history */}
      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Lifetime Price Pulse</h3>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Historical stability of staple items</p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {stats.staples.slice(0, 5).map(staple => (
                <button
                  key={staple}
                  onClick={() => setSelectedStaple(staple)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    stats.activeStaple === staple 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {staple}
                </button>
              ))}
            </div>
         </div>

         {stats.priceHistory.length > 0 ? (
           <div className="space-y-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.priceHistory}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{data.store}</p>
                              <p className="text-xl font-black text-blue-600">${data.price.toFixed(2)}</p>
                              <p className="text-[9px] font-bold text-gray-400 mt-1">{new Date(data.date).toLocaleDateString()}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Market Low</p>
                    <p className="text-xl font-black text-emerald-600">${Math.min(...stats.priceHistory.map(h => h.price)).toFixed(2)}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Market High</p>
                    <p className="text-xl font-black text-red-500">${Math.max(...stats.priceHistory.map(h => h.price)).toFixed(2)}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Price Volatility</p>
                    <p className="text-xl font-black text-gray-900">
                      {(((Math.max(...stats.priceHistory.map(h => h.price)) - Math.min(...stats.priceHistory.map(h => h.price))) / Math.min(...stats.priceHistory.map(h => h.price))) * 100).toFixed(1)}%
                    </p>
                 </div>
              </div>
           </div>
         ) : (
           <div className="h-72 flex flex-col items-center justify-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                 <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                 </svg>
              </div>
              <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Add items to track price pulse</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default Dashboard;
