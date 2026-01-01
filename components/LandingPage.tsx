
import React from 'react';
import { PublicView } from '../types';

interface LandingPageProps {
  view: PublicView;
  onNavigate: (view: PublicView) => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ view, onNavigate, onLogin }) => {
  return (
    <div className="min-h-screen bg-white font-['Inter',_sans-serif]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-[100] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0F172A]">SpendWise<span className="text-[#0052FF]">AI</span></span>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            {['HOME', 'PRICING', 'BLOG', 'CONTACT'].map((item) => (
              <button 
                key={item}
                onClick={() => onNavigate(item.toLowerCase() === 'home' ? 'home' : item.toLowerCase() as PublicView)}
                className={`text-[11px] font-bold tracking-widest transition-all ${
                  view === item.toLowerCase() ? 'text-[#0052FF]' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button 
            onClick={onLogin}
            className="px-8 py-2.5 bg-[#0F172A] text-white text-[11px] font-bold tracking-widest rounded-lg hover:bg-[#1E293B] transition-all shadow-lg active:scale-95"
          >
            GET STARTED
          </button>
        </div>
      </nav>

      <main className="pt-20">
        {view === 'home' && <HomeSection onLogin={onLogin} />}
        {view === 'pricing' && <PricingSection onLogin={onLogin} />}
        {view === 'blog' && <BlogSection />}
        {view === 'contact' && <ContactSection />}
      </main>

      {/* Footer */}
      <footer className="bg-white py-24 px-6 border-t border-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
             <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight text-[#0F172A]">SpendWise AI</span>
             </div>
             <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-[240px]">
               The world's most intelligent financial auditor, powered by Gemini 2.5 Flash.
             </p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-[#0F172A] mb-6">PRODUCT</h4>
            <div className="flex flex-col space-y-3">
               <button onClick={() => onNavigate('home')} className="text-sm text-gray-400 hover:text-[#0052FF] text-left transition-colors">Features</button>
               <button onClick={() => onNavigate('pricing')} className="text-sm text-gray-400 hover:text-[#0052FF] text-left transition-colors">Pricing</button>
               <button className="text-sm text-gray-400 hover:text-[#0052FF] text-left transition-colors">API</button>
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-[#0F172A] mb-6">COMPANY</h4>
            <div className="flex flex-col space-y-3">
               <button onClick={() => onNavigate('blog')} className="text-sm text-gray-400 hover:text-[#0052FF] text-left transition-colors">Blog</button>
               <button className="text-sm text-gray-400 hover:text-[#0052FF] text-left transition-colors">Careers</button>
               <button onClick={() => onNavigate('contact')} className="text-sm text-gray-400 hover:text-[#0052FF] text-left transition-colors">Contact</button>
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-[#0F172A] mb-6">LEGAL</h4>
            <div className="flex flex-col space-y-3">
               <button className="text-sm text-gray-400 hover:text-[#0052FF] text-left transition-colors">Privacy Policy</button>
               <button className="text-sm text-gray-400 hover:text-[#0052FF] text-left transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-50 text-center">
           <p className="text-xs text-gray-400 font-medium">© 2024 SpendWise AI. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const HomeSection: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="space-y-0">
    {/* Hero Section */}
    <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center text-center px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] right-[15%] w-[300px] h-[300px] bg-[#0052FF]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[250px] h-[250px] bg-indigo-500/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center px-4 py-1 bg-blue-50 border border-blue-100 rounded-full mb-12">
          <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">NEW: GEMINI 2.5 FLASH LITE INTEGRATION</span>
        </div>
        
        <h1 className="text-5xl md:text-[84px] font-[900] text-[#0F172A] tracking-tighter leading-[1.05] max-w-4xl mb-8">
          Audit Your Life with <br/><span className="text-[#0052FF]">Surgical</span> Precision.
        </h1>

        <p className="text-lg text-gray-400 font-medium max-w-xl mx-auto leading-relaxed mb-12">
          Stop manually entry. Our AI extracts line-items, calculates taxes, and builds financial trends from a single photo.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={onLogin}
            className="px-10 py-4 bg-[#0052FF] text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#0041CC] transition-all shadow-[0_15px_30px_rgba(0,82,255,0.2)] active:scale-95"
          >
            START AUDITING FREE
          </button>
          <button className="px-10 py-4 bg-white border border-gray-200 text-gray-600 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all">
            WATCH DEMO
          </button>
        </div>
      </div>

      {/* Visual Component Section */}
      <div className="mt-32 w-full max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
         {/* Real-time Extraction Card */}
         <div className="bg-[#0F172A] rounded-[40px] p-12 text-left relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[440px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="space-y-4">
               <h3 className="text-3xl font-bold text-white tracking-tight">Real-time Extraction</h3>
               <p className="text-gray-400 text-base font-medium max-w-sm leading-relaxed">
                 Our specialized Gemini model identifies quantity, unit prices, and subcategories in milliseconds.
               </p>
            </div>
            
            <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">PROCESSING...</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">99.2% Accuracy</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-[#0052FF] rounded-full"></div>
               </div>
            </div>
         </div>

         {/* Trend Analysis Card */}
         <div className="bg-[#F1F7FF] rounded-[40px] p-12 text-left flex flex-col justify-between shadow-sm min-h-[440px]">
            <div className="w-14 h-14 bg-[#0052FF] rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-200">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
            </div>
            <div className="space-y-4">
               <h3 className="text-3xl font-bold text-[#0F172A] tracking-tight">Trend Analysis</h3>
               <p className="text-gray-500 text-base font-medium max-w-sm leading-relaxed">
                 Automatic category mapping for items like 'tax 1' and 'grocery fees'.
               </p>
            </div>
            <div className="mt-8">
               {/* Just a decorative spacer for layout matching */}
               <div className="h-2 w-12 bg-[#0052FF]/10 rounded-full"></div>
            </div>
         </div>
      </div>
    </section>
  </div>
);

const PricingSection: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <section className="px-6 py-32 max-w-7xl mx-auto space-y-20 flex flex-col items-center">
    <div className="text-center space-y-4">
      <h2 className="text-5xl font-bold text-[#0F172A] tracking-tight">Simple Pricing.</h2>
      <p className="text-gray-400 text-lg font-medium">Free during initial deployment.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
      <div className="p-12 rounded-[32px] bg-white border border-gray-100 shadow-sm flex flex-col justify-between space-y-10">
         <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#0F172A]">Core Individual</h3>
            <p className="text-5xl font-black text-[#0F172A]">$0</p>
            <ul className="space-y-4">
               {['Neural OCR (100/mo)', 'Tactical HUD', 'Export Protocols'].map(f => (
                 <li key={f} className="flex items-center space-x-3 text-sm font-medium text-gray-500">
                    <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    <span>{f}</span>
                 </li>
               ))}
            </ul>
         </div>
         <button onClick={onLogin} className="w-full py-4 bg-[#0F172A] text-white text-[11px] font-bold tracking-widest rounded-xl hover:bg-gray-800 transition-all">DEPOY CORE</button>
      </div>

      <div className="p-12 rounded-[32px] bg-[#0F172A] text-white shadow-2xl flex flex-col justify-between space-y-10 relative">
         <div className="absolute top-0 right-0 p-8">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">POPULAR</span>
         </div>
         <div className="space-y-6">
            <h3 className="text-2xl font-bold">Neural Executive</h3>
            <p className="text-5xl font-black">$29</p>
            <ul className="space-y-4">
               {['Unlimited Audits', 'Fuzzy Reconciliation', 'Gemini Pro Access', 'Audit-Ready Reporting'].map(f => (
                 <li key={f} className="flex items-center space-x-3 text-sm font-medium text-gray-400">
                    <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    <span>{f}</span>
                 </li>
               ))}
            </ul>
         </div>
         <button onClick={onLogin} className="w-full py-4 bg-[#0052FF] text-white text-[11px] font-bold tracking-widest rounded-xl hover:bg-blue-600 transition-all">INITIALIZE EXECUTIVE</button>
      </div>
    </div>
  </section>
);

const BlogSection: React.FC = () => (
  <section className="px-6 py-32 max-w-7xl mx-auto space-y-16">
    <div className="border-b border-gray-100 pb-12">
      <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">R&D Intelligence.</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      {[
        { title: 'The Death of the Manual Ledger', category: 'Compliance', img: 'https://images.unsplash.com/photo-1611974717537-8054b8d7831d?w=800&auto=format&fit=crop' },
        { title: 'Neural Tickers and Real-time Audits', category: 'Technology', img: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?w=800&auto=format&fit=crop' },
        { title: 'Fuzzy Logic in Enterprise ERP', category: 'Infrastructure', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop' }
      ].map((post) => (
        <article key={post.title} className="group cursor-pointer">
           <div className="aspect-[3/4] rounded-[32px] overflow-hidden bg-gray-100 border border-gray-100 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
              <img src={post.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 to-transparent flex flex-col justify-end p-8">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-[#0052FF] mb-2">{post.category}</span>
                 <h3 className="text-xl font-bold text-white leading-tight">{post.title}</h3>
              </div>
           </div>
        </article>
      ))}
    </div>
  </section>
);

const ContactSection: React.FC = () => (
  <section className="px-6 py-32 flex flex-col items-center">
    <div className="max-w-4xl w-full bg-gray-50 p-16 rounded-[48px] border border-gray-100 space-y-12">
       <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">Initialize Comms.</h2>
          <p className="text-gray-400 text-lg font-medium max-w-lg mx-auto">Discuss custom deployment or enterprise-wide node deployment.</p>
       </div>

       <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" className="w-full bg-white border border-gray-100 rounded-xl p-5 outline-none font-bold text-gray-900 shadow-sm focus:border-[#0052FF]" placeholder="Name" />
          <input type="email" className="w-full bg-white border border-gray-100 rounded-xl p-5 outline-none font-bold text-gray-900 shadow-sm focus:border-[#0052FF]" placeholder="Email" />
          <textarea rows={5} className="md:col-span-2 w-full bg-white border border-gray-100 rounded-2xl p-6 outline-none font-medium text-gray-900 resize-none shadow-sm focus:border-[#0052FF]" placeholder="Requirement Brief"></textarea>
          <button type="button" className="md:col-span-2 py-5 bg-[#0F172A] text-white font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-[#0052FF] transition-all active:scale-95 shadow-lg">
             SUBMIT DATA INQUIRY
          </button>
       </form>
    </div>
  </section>
);

export default LandingPage;
