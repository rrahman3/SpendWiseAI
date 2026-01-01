
import React, { useState, useRef, useEffect } from 'react';
import { chatWithHistory } from '../services/geminiService.ts';
import { Receipt, ChatMessage } from '../types.ts';

const MarkdownText: React.FC<{ content: string }> = ({ content }) => {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  const formatted = text.split('\n').map((line, i) => {
    const bolded = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-black text-inherit">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return <p key={i} className="mb-2 last:mb-0 leading-relaxed">{bolded}</p>;
  });
  return <div className="text-sm font-medium">{formatted}</div>;
};

const AIChat: React.FC<{ receipts: Receipt[] }> = ({ receipts }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      content: "Neural interface synchronized. I've processed your " + receipts.length + " ledger nodes. What specific spending vectors should we analyze today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    
    try {
      const response = await chatWithHistory(receipts, userMsg);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "CRITICAL ERROR: Neural handshake interrupted. Please verify connection protocols." }]);
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-5xl mx-auto bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      {/* HUD Header */}
      <div className="px-12 py-8 border-b border-gray-100 bg-gray-900 flex justify-between items-center text-white">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-gray-900 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tighter">SPENDWISE_OS</h3>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">Ledger Protocol v3.04.1</span>
              <span className="text-[9px] text-gray-500 font-mono tracking-tighter">CTX_{receipts.length}_ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex space-x-4">
           <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400">
             Neural Engine: Gemini Pro
           </div>
        </div>
      </div>

      {/* Terminal Canvas */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 bg-[#fcfcfc]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'} items-start space-x-5`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${
                msg.role === 'user' ? 'bg-white border-gray-200 text-gray-400' : 'bg-gray-900 border-gray-800 text-blue-400'
              }`}>
                {msg.role === 'user' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )}
              </div>
              <div className={`px-8 py-6 rounded-[2.5rem] shadow-xl ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 text-gray-900 rounded-tl-none'
              }`}>
                <MarkdownText content={msg.content} />
                <div className={`mt-4 pt-4 border-t text-[8px] font-black uppercase tracking-[0.2em] ${msg.role === 'user' ? 'border-white/10 text-gray-500' : 'border-gray-50 text-gray-300'}`}>
                  {msg.role === 'user' ? 'Command Received' : 'Neural Analysis Result'} • {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex items-center space-x-5">
               <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-blue-400 shadow-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />
               </div>
               <div className="px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2.5rem] rounded-tl-none flex items-center space-x-4">
                  <div className="flex space-x-1">
                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Cross-Referencing Transactions...</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Console */}
      <div className="p-10 bg-gray-50 border-t border-gray-100">
        <div className="relative max-w-4xl mx-auto flex items-center gap-5 bg-white p-3 rounded-[2.5rem] border border-gray-200 shadow-2xl shadow-gray-200/50 focus-within:ring-8 focus-within:ring-blue-50 transition-all">
          <input 
            type="text" 
            placeholder="Search spending vectors (e.g., 'Analyze grocery inflation since June')" 
            className="flex-1 px-8 py-4 bg-transparent outline-none font-bold text-gray-900 placeholder:text-gray-300 text-base" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center shadow-xl transition-all active:scale-90 ${
              !input.trim() || isLoading 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        <div className="max-w-4xl mx-auto flex justify-center mt-6 space-x-10">
           <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Encryption Active</span>
           </div>
           <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Context Loaded</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
