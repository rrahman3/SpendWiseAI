
import React, { useState, useEffect, useRef } from 'react';
import { View, PublicView, Receipt, UserProfile } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import ReceiptScanner from './components/ReceiptScanner.tsx';
import EmailSync from './components/EmailSync.tsx';
import PurchaseHistory from './components/PurchaseHistory.tsx';
import AIChat from './components/AIChat.tsx';
import Login from './components/Login.tsx';
import AllItems from './components/AllItems.tsx';
import LandingPage from './components/LandingPage.tsx';
import CSVImporter from './components/CSVImporter.tsx';
import DuplicateReview from './components/DuplicateReview.tsx';
import { authService } from './services/authService.ts';
import { dbService } from './services/dbService.ts';

const App: React.FC = () => {
  // Navigation & UI State
  const [view, setView] = useState<View>('dashboard');
  const [publicView, setPublicView] = useState<PublicView>('home');
  const [showApp, setShowApp] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Data State
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Duplicate Detection State
  const [pendingDuplicate, setPendingDuplicate] = useState<Receipt | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize App: Check for existing session
  useEffect(() => {
    const initApp = async () => {
      const savedProfile = localStorage.getItem('spendwise_profile');
      if (savedProfile) {
        try {
          const user = JSON.parse(savedProfile);
          setProfile(user);
          setShowApp(true);
          const data = await dbService.getReceipts(user.id);
          setReceipts(data);
        } catch (e) {
          console.error("Session restoration failed", e);
          localStorage.removeItem('spendwise_profile');
        }
      }
      setIsLoading(false);
    };
    initApp();
  }, []);

  // Sync user profile stats whenever receipts change
  useEffect(() => {
    if (profile && receipts.length >= 0) {
      const netTotal = receipts.reduce((sum, r) => r.type === 'refund' ? sum - r.total : sum + r.total, 0);
      if (profile.totalSpent !== netTotal || profile.receiptCount !== receipts.length) {
        const updatedProfile = { ...profile, totalSpent: netTotal, receiptCount: receipts.length };
        setProfile(updatedProfile);
        localStorage.setItem('spendwise_profile', JSON.stringify(updatedProfile));
      }
    }
  }, [receipts]);

  const handleLogin = async (userData?: UserProfile) => {
    try {
      const user = userData || await authService.signInWithGoogle();
      setProfile(user);
      localStorage.setItem('spendwise_profile', JSON.stringify(user));
      const data = await dbService.getReceipts(user.id);
      setReceipts(data);
      setShowApp(true);
      setView('dashboard');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Sign out of SpendWise AI? Make sure you have backed up your records if needed.")) {
      setIsLoggingOut(true);
      try {
        await authService.logout(profile?.id);
      } catch (err) {
        console.error("Logout error", err);
      } finally {
        setProfile(null);
        setReceipts([]);
        setShowApp(false);
        setPublicView('home');
        setView('dashboard');
        setIsLoggingOut(false);
      }
    }
  };

  const checkIsDuplicate = (newReceipt: Receipt): boolean => {
    const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
    const newTime = newReceipt.time || '00:00:00';
    const newFingerprint = `${normalize(newReceipt.storeName)}|${newReceipt.date}|${newTime}|${newReceipt.total.toFixed(2)}`;
    
    return receipts.some(r => {
      const existingTime = r.time || '00:00:00';
      const existingFingerprint = `${normalize(r.storeName)}|${r.date}|${existingTime}|${r.total.toFixed(2)}`;
      return newFingerprint === existingFingerprint;
    });
  };

  const saveReceiptToDb = async (receipt: Receipt) => {
    if (!profile) return;
    await dbService.saveReceipt(profile.id, receipt);
    setReceipts(prev => [receipt, ...prev]);
    setPendingDuplicate(null);
  };

  const handleReceiptProcessed = async (newReceipt: Receipt) => {
    if (checkIsDuplicate(newReceipt)) {
      setPendingDuplicate(newReceipt);
    } else {
      await saveReceiptToDb(newReceipt);
    }
  };

  const handleBatchReceipts = async (newReceipts: Receipt[]) => {
    if (!profile) return;
    const current = await dbService.getReceipts(profile.id);
    const updated = [...newReceipts, ...current];
    localStorage.setItem(`receipts_${profile.id}`, JSON.stringify(updated));
    setReceipts(updated);
  };

  const handleReceiptUpdated = async (updated: Receipt) => {
    if (!profile) return;
    await dbService.updateReceipt(profile.id, updated);
    setReceipts(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const handleDeleteReceipt = async (id: string) => {
    if (!profile) return;
    const updated = receipts.filter(r => r.id !== id);
    localStorage.setItem(`receipts_${profile.id}`, JSON.stringify(updated));
    setReceipts(updated);
  };

  const handleBatchFinished = () => {
    setView('history');
  };

  const handleExport = () => {
    if (profile) dbService.exportData(profile.id, profile);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imported = await dbService.importData(file);
      if (imported) {
        setProfile(imported.profile);
        setReceipts(imported.receipts);
        setShowApp(true);
        alert('Data successfully restored!');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!showApp) {
    if (publicView === 'login') {
      return <Login onLogin={handleLogin} onBackToHome={() => setPublicView('home')} />;
    }
    return <LandingPage view={publicView} onNavigate={setPublicView} onLogin={() => setPublicView('login')} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: (
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
      <div className="bg-blue-600 p-3 rounded-full shadow-lg shadow-blue-200 text-white transition-transform active:scale-90 ring-4 ring-white">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>
    )},
    { id: 'items', label: 'Items', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
    { id: 'chat', label: 'AI', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )},
  ];

  const handleScanClick = () => setView('scan');

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 pb-28 lg:pb-0 lg:pl-24">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">SpendWise<span className="text-blue-600">AI</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              type="button" 
              onClick={() => setView('csv-import')}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m3.236 4a2 2 0 001.764 1h12a2 2 0 001.764-1l1.618-3.236A2 2 0 0019.592 13H4.408a2 2 0 00-1.764 1L1 17.236z" />
               </svg>
               <span>Bulk CSV</span>
            </button>
            <button type="button" onClick={() => setView('profile')} className="relative focus:outline-none group">
              <img src={profile?.avatar} alt="Profile" className="w-10 h-10 rounded-xl border-2 border-white shadow-sm transition-transform group-hover:scale-105" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoggingOut && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-6"></div>
             <p className="font-black text-xs uppercase tracking-widest text-gray-900">Clearing Session Intelligence...</p>
          </div>
        )}

        {view === 'dashboard' && <Dashboard receipts={receipts} onScanClick={handleScanClick} onRequestDuplicateCheck={() => setView('duplicate-review')} />}
        {view === 'scan' && <ReceiptScanner receipts={receipts} onReceiptProcessed={handleReceiptProcessed} onFinished={handleBatchFinished} />}
        {view === 'history' && <PurchaseHistory receipts={receipts} onScanClick={handleScanClick} onUpdateReceipt={handleReceiptUpdated} />}
        {view === 'items' && <AllItems receipts={receipts} onUpdateReceipt={handleReceiptUpdated} />}
        {view === 'chat' && <AIChat receipts={receipts} />}
        {view === 'csv-import' && <CSVImporter onBatchProcessed={handleBatchReceipts} onFinished={() => setView('dashboard')} />}
        {view === 'duplicate-review' && <DuplicateReview receipts={receipts} onDeleteReceipt={handleDeleteReceipt} onFinished={() => setView('dashboard')} />}
        
        {view === 'profile' && profile && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <img src={profile.avatar} alt="Profile" className="w-32 h-32 rounded-[2rem] border-4 border-blue-50 shadow-lg" />
                <div>
                  <h2 className="text-3xl font-black text-gray-900">{profile.name}</h2>
                  <p className="text-gray-400 font-medium">{profile.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Scans</p>
                    <p className="text-3xl font-black text-gray-900">{profile.receiptCount}</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Net Spending</p>
                    <p className="text-3xl font-black text-blue-600">${profile.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 space-y-6">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Data Management</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button type="button" onClick={handleExport} className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-3xl border border-blue-100 transition-all group">
                  <svg className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="text-xs font-black text-blue-600 uppercase">Download Backup</span>
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 rounded-3xl border border-gray-100 transition-all group">
                  <svg className="w-8 h-8 text-gray-500 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-xs font-black text-gray-500 uppercase">Restore Backup</span>
                </button>
                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
              </div>
              <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="w-full py-5 px-6 bg-white hover:bg-red-50 text-red-600 font-black rounded-2xl transition-all border border-red-100 active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest">
                Logout Account
              </button>
            </div>
          </div>
        )}
      </main>

      {pendingDuplicate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10 text-center space-y-6">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Potential Duplicate</h3>
            <p className="text-sm text-gray-400 font-medium">Record for <span className="text-gray-900 font-bold">{pendingDuplicate.storeName}</span> on <span className="text-gray-900 font-bold">{pendingDuplicate.date}</span> already exists.</p>
            <div className="flex flex-col space-y-3">
              <button type="button" onClick={() => setPendingDuplicate(null)} className="w-full py-4 bg-gray-100 text-gray-900 font-black rounded-2xl uppercase text-[10px] tracking-widest">Skip</button>
              <button type="button" onClick={() => saveReceiptToDb(pendingDuplicate)} className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest">Save Anyway</button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pt-2 pb-8 flex justify-around items-center z-[60] lg:hidden shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => (
          <button key={item.id} type="button" onClick={() => setView(item.id as View)} className={`flex flex-col items-center justify-center p-3 min-w-[64px] transition-all ${view === item.id ? 'text-blue-600' : 'text-gray-400'} ${item.id === 'scan' ? '-translate-y-4' : ''}`}>
            <div className={`${item.id === 'scan' ? 'bg-blue-600 text-white p-3 rounded-full shadow-lg' : ''}`}>{item.icon}</div>
            {item.id !== 'scan' && <span className="text-[8px] font-black uppercase tracking-widest mt-1">{item.label}</span>}
          </button>
        ))}
      </nav>

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 bg-white border-r border-gray-100 flex-col items-center py-10 space-y-8 z-30">
        <div className="mb-8 cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg></div>
        </div>
        {navItems.filter(i => i.id !== 'scan').map((item) => (
          <button key={item.id} type="button" onClick={() => setView(item.id as View)} className={`p-4 rounded-2xl transition-all relative group ${view === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}>{item.icon}</button>
        ))}
        <div className="flex-1"></div>
        <button type="button" onClick={handleScanClick} className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95 mb-4"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></button>
      </aside>
    </div>
  );
};

export default App;
