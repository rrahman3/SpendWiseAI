
import React, { useState, useRef, useEffect } from 'react';
import { chatWithHistory } from '../services/geminiService';
import { Receipt, ChatMessage } from '../types';

interface AIChatProps {
  receipts: Receipt[];
}

const AIChat: React.FC<AIChatProps> = ({ receipts }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hi! I'm your SpendWise assistant. I can help you analyze your spending. Ask me things like 'What's the most expensive item I bought?' or 'How much did I spend on groceries this week?'" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithHistory(receipts, userMessage);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I had trouble processing that. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Financial Assistant</h3>
          <p className="text-xs text-green-500 font-medium flex items-center">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
            Analyzing your {receipts.length} receipts
          </p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-100' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              <div className="prose prose-sm max-w-none">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-4 rounded-3xl rounded-tl-none flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="How much have I spent on coffee?"
            className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
