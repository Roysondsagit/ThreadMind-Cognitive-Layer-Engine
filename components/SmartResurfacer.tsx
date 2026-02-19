
import React, { useState, useEffect } from 'react';
import { Thread } from '../types';
import { getRecommendation, markAsViewed } from '../services/vaultService';
import ThreadCard from './ThreadCard';
import { Sparkles, RefreshCcw, Lightbulb } from 'lucide-react';

interface SmartResurfacerProps {
  threads: Thread[];
}

const SmartResurfacer: React.FC<SmartResurfacerProps> = ({ threads }) => {
  const [recommendation, setRecommendation] = useState<{ thread: Thread, reason: string } | null>(null);

  useEffect(() => {
    // Initial recommendation
    if (threads.length > 0 && !recommendation) {
      setRecommendation(getRecommendation(threads));
    }
  }, [threads]);

  const handleResurface = () => {
    const rec = getRecommendation(threads);
    if (rec) {
      setRecommendation(rec);
      markAsViewed(rec.thread.id);
    }
  };

  if (threads.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[40px] p-10 text-white mb-16 shadow-2xl relative overflow-hidden group">
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
        <div className="max-w-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-yellow-400 p-2 rounded-xl text-indigo-900 shadow-lg shadow-yellow-400/20">
              <Sparkles size={20} />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase tracking-widest">Resurface Smart</h2>
          </div>
          
          <h3 className="text-3xl font-black mb-6 leading-tight">
            {recommendation ? recommendation.reason : "Retrieve a high-signal memory from your vault."}
          </h3>
          
          <p className="text-indigo-100 font-bold opacity-80 text-lg mb-8 leading-relaxed">
            Our algorithm weights semantic relevance against time decay to ensure your "Second Brain" stays active and useful.
          </p>

          <button 
            onClick={handleResurface}
            className="group px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all transform active:scale-95 flex items-center space-x-3 text-lg"
          >
            <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Discover Something New</span>
          </button>
        </div>

        {recommendation && (
          <div className="w-full xl:w-[450px] transform rotate-1 animate-in fade-in zoom-in duration-500 hover:rotate-0 transition-transform relative">
            <div className="absolute -top-4 -right-4 z-20 bg-yellow-400 text-indigo-900 p-3 rounded-2xl shadow-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <Lightbulb size={16} />
              High Signal
            </div>
            <ThreadCard thread={recommendation.thread} />
          </div>
        )}
      </div>

      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default SmartResurfacer;
