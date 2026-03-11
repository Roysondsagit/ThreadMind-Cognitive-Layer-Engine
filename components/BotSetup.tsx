
import React, { useState } from 'react';
import { MessageCircle, Copy, CheckCircle2, QrCode, Smartphone, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { processContent } from '../services/geminiService';
import { saveThread } from '../services/vaultService';
import { Thread } from '../types';

interface BotSetupProps {
  onRescueComplete: () => void;
}

const BotSetup: React.FC<BotSetupProps> = ({ onRescueComplete }) => {
  const [copied, setCopied] = useState(false);
  const [simInput, setSimInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLog, setSimLog] = useState<{ sender: 'user' | 'bot', text: string }[]>([
    { sender: 'bot', text: '👋 Welcome to ThreadMind! Send me any Reel, Tweet, or Voice Note and I\'ll save it to your Cognitive Vault.' }
  ]);

  const botNumber = "+1 (555) 942-MIND";

  const copyNumber = () => {
    navigator.clipboard.writeText(botNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSimulation = async () => {
    if (!simInput.trim()) return;

    const userMsg = simInput;
    setSimLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setSimInput('');
    setIsSimulating(true);

    try {
      const analysis = await processContent(userMsg, 'url');
      const newThread: Thread = {
        id: Math.random().toString(36).substr(2, 9),
        userId: 'current-user',
        contentType: 'url',
        originalContent: userMsg,
        title: analysis.title,
        summary: analysis.summary,
        extractedText: analysis.extractedText,
        tags: analysis.tags,
        intent: analysis.intent,
        category: analysis.category,
        viewCount: 0,
        lastViewed: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      await saveThread(newThread);

      setSimLog(prev => [...prev, {
        sender: 'bot',
        text: `🔥 Rescued to Vault!\n\n📌 Title: ${analysis.title}\n🧠 Summary: ${analysis.summary}\n🏷️ Tags: ${analysis.tags.map(t => '#' + t).join(' ')}`
      }]);
      onRescueComplete();
    } catch (e) {
      setSimLog(prev => [...prev, { sender: 'bot', text: '⚠️ Processing error. Please try a different link.' }]);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
          <MessageCircle size={14} className="mr-2" />
          No App Required
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Connect Your Brain to <span className="text-emerald-500">WhatsApp</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto text-lg">
          ThreadMind lives in your contact list. Save the number, send your messy links, and we'll organize them into your cognitive layer instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step-by-Step Guide */}
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-10 shadow-sm space-y-10 transition-colors duration-300">
          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center font-black shrink-0">1</div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Save the Bot Number</h4>
                <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="font-mono font-bold text-lg text-slate-700 dark:text-slate-200">{botNumber}</span>
                  <button
                    onClick={copyNumber}
                    className="ml-auto p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-indigo-600 dark:text-indigo-400"
                  >
                    {copied ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center font-black shrink-0">2</div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Send Any Link</h4>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  Instagram Reels, Twitter Threads, or even a voice note describing an idea. Just hit "Send".
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center font-black shrink-0">3</div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Receive AI Summary</h4>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  Our Cognitive Engine replies instantly with a breakdown. The data is now safe in your web vault.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[32px] border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-indigo-600 dark:text-indigo-400">
                  <QrCode size={32} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Direct Connect</span>
                  <p className="font-black text-indigo-900 dark:text-indigo-200">Scan QR to chat</p>
                </div>
              </div>
              <button className="bg-white dark:bg-slate-800 p-3 rounded-full text-indigo-600 dark:text-indigo-400 shadow-sm hover:scale-110 transition-transform">
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp Simulator — already dark themed, minor refinements */}
        <div className="bg-slate-900 dark:bg-slate-950 rounded-[50px] p-4 shadow-2xl relative overflow-hidden flex flex-col h-[650px]">
          <div className="absolute top-0 inset-x-0 h-16 bg-slate-800 dark:bg-slate-900 flex items-center px-8 border-b border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 mr-4 flex items-center justify-center text-white">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-white font-black text-sm">ThreadMind Bot</p>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Online</p>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-4 overflow-y-auto mt-16">
            {simLog.map((log, i) => (
              <div key={i} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-bold leading-relaxed ${log.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none'}`}>
                  {log.text.split('\n').map((line, j) => <p key={j}>{line}</p>)}
                </div>
              </div>
            ))}
            {isSimulating && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-4 rounded-3xl rounded-tl-none flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-800 dark:bg-slate-900 border-t border-slate-700/50">
            <div className="flex items-center space-x-3 bg-slate-900 dark:bg-slate-950 p-2 pl-4 rounded-full border border-slate-700">
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runSimulation()}
                placeholder="Paste Instagram/Twitter link..."
                className="bg-transparent border-none focus:ring-0 text-white text-sm font-bold flex-1 outline-none placeholder:text-slate-600"
              />
              <button
                onClick={runSimulation}
                disabled={isSimulating || !simInput.trim()}
                className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-500 disabled:opacity-50 transition-all"
              >
                {isSimulating ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotSetup;
