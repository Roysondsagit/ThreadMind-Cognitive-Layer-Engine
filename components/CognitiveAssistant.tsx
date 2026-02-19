
import React, { useState } from 'react';
import { Thread } from '../types';
import { queryVault } from '../services/geminiService';
import { BrainCircuit, X, Send, Loader2, Sparkles } from 'lucide-react';

interface CognitiveAssistantProps {
  threads: Thread[];
}

const CognitiveAssistant: React.FC<CognitiveAssistantProps> = ({ threads }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;
    
    const userMsg = query;
    setQuery('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const answer = await queryVault(userMsg, threads);
      setHistory(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'assistant', content: "I'm having trouble accessing the cognitive layer right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[200]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all group flex items-center space-x-3"
        >
          <BrainCircuit size={28} />
          <span className="hidden group-hover:inline font-black uppercase tracking-widest text-xs pr-2">Ask Vault</span>
        </button>
      ) : (
        <div className="bg-white w-[350px] md:w-[450px] h-[550px] rounded-[40px] shadow-3xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="text-yellow-400" size={20} />
              <div>
                <h4 className="font-black text-sm tracking-tight">Cognitive Assistant</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Gemini 3</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {history.length === 0 && (
              <div className="text-center py-10">
                <BrainCircuit size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold text-sm">"What was that pasta recipe I saved?"</p>
                <p className="text-slate-300 font-bold text-xs mt-1 italic">Ask me anything about your vault.</p>
              </div>
            )}
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[24px] text-sm font-bold leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex items-center space-x-2 bg-slate-50 p-2 pl-4 rounded-2xl border border-slate-100">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Talk to your vault..."
                className="bg-transparent border-none focus:ring-0 flex-1 font-bold text-sm text-slate-900"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !query.trim()}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CognitiveAssistant;
