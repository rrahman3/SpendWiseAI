
import React, { useState, useEffect } from 'react';
import { View, Receipt, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import ReceiptScanner from './components/ReceiptScanner';
import PurchaseHistory from './components/PurchaseHistory';
import AIChat from './components/AIChat';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    avatar: 'https://picsum.photos/seed/alex/200',
    totalSpent: 0,
    receiptCount: 0
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedReceipts = localStorage.getItem('spendwise_receipts');
    if (savedReceipts) {
      const parsed = JSON.parse(savedReceipts);
      setReceipts(parsed);
      
      const total = parsed.reduce((sum: number, r: Receipt) => sum + r.total, 0);
      setProfile(prev => ({
        ...prev,
        totalSpent: total,
        receiptCount: parsed.length
      }));
    }
  }, []);

  // Save to localStorage whenever receipts change
  useEffect(() => {
    localStorage.setItem('spendwise_receipts', JSON.stringify(receipts));
    const total = receipts.reduce((sum, r) => sum + r.total, 0);
    setProfile(prev => ({
      ...prev,
      totalSpent: total,
      receiptCount: receipts.length
    }));
  }, [receipts]);

  const handleReceiptProcessed = (newReceipt: Receipt) => {
    setReceipts(prev => [newReceipt, ...prev]);
    setView('history');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { id: 'history', label: 'History', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: 'scan', label: 'Scan', icon: (
      <div className="bg-blue-600 p-3 rounded-full -mt-8 shadow-lg shadow-blue-200 text-white transition-transform active:scale-95">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>
    )},
    { id: 'chat', label: 'Assistant', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )},
    { id: 'profile', label: 'Profile', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 pb-24 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">SpendWise<span className="text-blue-600">AI</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Credit</p>
              <p className="text-sm font-bold">$12,450.00</p>
            </div>
            <img src={profile.avatar} alt="Profile" className="w-10 h-10 rounded-xl border-2 border-white shadow-sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && <Dashboard receipts={receipts} />}
        {view === 'scan' && <ReceiptScanner onReceiptProcessed={handleReceiptProcessed} />}
        {view === 'history' && <PurchaseHistory receipts={receipts} />}
        {view === 'chat' && <AIChat receipts={receipts} />}
        {view === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <img src={profile.avatar} alt="Big Profile" className="w-32 h-32 rounded-full border-4 border-blue-50" />
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-gray-500">{profile.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-8">
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-gray-500 font-medium">Receipts</p>
                  <p className="text-2xl font-bold">{profile.receiptCount}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-gray-500 font-medium">Total Saved</p>
                  <p className="text-2xl font-bold text-green-600">$428.12</p>
                </div>
              </div>
              <button className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all">
                Edit Profile
              </button>
              <button className="w-full py-4 px-6 text-red-600 font-bold rounded-2xl transition-all border border-red-100">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 lg:hidden shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`flex flex-col items-center justify-center space-y-1 transition-all ${
              view === item.id ? 'text-blue-600 scale-110' : 'text-gray-400'
            }`}
          >
            {item.icon}
            {item.id !== 'scan' && <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Desktop Navigation (Sidebar on large screens) */}
      <aside className="hidden lg:flex fixed left-0 top-20 bottom-0 w-24 bg-white border-r border-gray-100 flex-col items-center py-10 space-y-8 z-30">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`p-4 rounded-2xl transition-all relative group ${
              view === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            } ${item.id === 'scan' ? '!p-0' : ''}`}
          >
            {item.id === 'scan' ? (
              <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-200 text-white transform hover:scale-105 transition-transform active:scale-95">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            ) : item.icon}
            
            <span className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </span>
          </button>
        ))}
      </aside>
    </div>
  );
};

export default App;
