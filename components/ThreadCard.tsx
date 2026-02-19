
import React, { useState } from 'react';
import { Thread, Category } from '../types';
import { 
  Calendar, 
  BrainCircuit, 
  Instagram, 
  Twitter, 
  MessageSquare, 
  Globe, 
  ArrowUpRight, 
  Dumbbell, 
  Code, 
  Utensils, 
  Plane, 
  Palette, 
  HelpCircle,
  Quote,
  Maximize2,
  X,
  FileText,
  Link2
} from 'lucide-react';

interface ThreadCardProps {
  thread: Thread;
}

const CategoryBadge: React.FC<{ category: Category }> = ({ category }) => {
  const styles = {
    [Category.FITNESS]: 'bg-orange-50 text-orange-600 border-orange-100',
    [Category.CODING]: 'bg-blue-50 text-blue-600 border-blue-100',
    [Category.FOOD]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [Category.TRAVEL]: 'bg-sky-50 text-sky-600 border-sky-100',
    [Category.DESIGN]: 'bg-purple-50 text-purple-600 border-purple-100',
    [Category.OTHER]: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  const icons = {
    [Category.FITNESS]: <Dumbbell size={10} />,
    [Category.CODING]: <Code size={10} />,
    [Category.FOOD]: <Utensils size={10} />,
    [Category.TRAVEL]: <Plane size={10} />,
    [Category.DESIGN]: <Palette size={10} />,
    [Category.OTHER]: <HelpCircle size={10} />,
  };

  return (
    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest flex items-center gap-1.5 ${styles[category]}`}>
      {icons[category]}
      {category}
    </span>
  );
};

const ThreadCard: React.FC<ThreadCardProps> = ({ thread }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isInstagram = thread.originalContent.toLowerCase().includes('instagram.com');
  const isTwitter = thread.originalContent.toLowerCase().includes('twitter.com') || thread.originalContent.toLowerCase().includes('x.com');
  const isBlog = thread.originalContent.toLowerCase().includes('blog') || thread.originalContent.toLowerCase().includes('article');

  const getSourceDetails = () => {
    if (thread.contentType !== 'url') return { icon: <MessageSquare size={16} />, label: 'Thought Log', color: 'text-indigo-400' };
    if (isInstagram) return { icon: <Instagram size={16} />, label: 'Insta Rescue', color: 'text-pink-500' };
    if (isTwitter) return { icon: <Twitter size={16} />, label: 'X Capture', color: 'text-blue-400' };
    if (isBlog) return { icon: <FileText size={16} />, label: 'Web Article', color: 'text-emerald-500' };
    return { icon: <Globe size={16} />, label: 'Web Source', color: 'text-slate-400' };
  };

  const { icon, label, color } = getSourceDetails();

  return (
    <>
      <div className="group bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
        {/* Visual Header / "Embed" Simulator */}
        <div className={`h-24 p-6 flex items-start justify-between relative overflow-hidden ${isInstagram ? 'bg-gradient-to-br from-pink-50 to-orange-50' : isTwitter ? 'bg-slate-50' : 'bg-slate-50'}`}>
          <div className="flex items-center space-x-3 z-10">
            <div className={`p-2.5 rounded-2xl bg-white shadow-sm ${color}`}>{icon}</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
              <p className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]">{thread.originalContent}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsExpanded(true)}
            className="p-2.5 bg-white/80 backdrop-blur rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm z-10"
          >
            <Maximize2 size={16} />
          </button>
          
          {/* Abstract platform decorations */}
          {isInstagram && <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl"></div>}
          {isTwitter && <div className="absolute bottom-0 right-10 w-20 h-20 bg-blue-500/5 rotate-45"></div>}
        </div>

        <div className="p-8 flex flex-col h-full">
          <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
            {thread.title}
          </h3>
          
          <div className="relative mb-6">
            <Quote size={14} className="absolute -left-2 -top-1 text-indigo-200" />
            <p className="pl-6 text-sm text-slate-600 font-bold leading-relaxed italic">
              {thread.summary}
            </p>
          </div>
          
          <div className="mt-auto pt-6 flex flex-col space-y-4">
            <div className="flex flex-wrap gap-2">
              <CategoryBadge category={thread.category} />
              {thread.tags.map(tag => (
                <span key={tag} className="text-[9px] font-black text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 uppercase tracking-tight">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center space-x-1.5 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                <BrainCircuit size={14} className="text-indigo-400" />
                <span>Memories: {thread.viewCount}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                <Calendar size={12} />
                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expansion Modal: Cognitive Inspection */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsExpanded(false)}></div>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            
            <div className="p-8 md:p-12 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-[24px] bg-white shadow-sm ${color}`}>{icon}</div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <CategoryBadge category={thread.category} />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cognitive Core</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{thread.title}</h2>
                </div>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-4 bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-xl hover:rotate-90 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <BrainCircuit size={20} className="text-indigo-600" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">AI Distillation</h4>
                </div>
                <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[32px] relative overflow-hidden">
                  <Quote size={40} className="absolute -top-2 -left-2 text-indigo-100 opacity-50" />
                  <p className="text-xl md:text-2xl font-bold text-indigo-900 leading-relaxed relative z-10">
                    {thread.summary}
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Link2 size={20} className="text-slate-400" />
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Rescued Content</h4>
                  </div>
                  <a 
                    href={thread.originalContent} 
                    target="_blank" 
                    rel="noopener"
                    className="flex items-center space-x-2 text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase"
                  >
                    <span>Visit Source</span>
                    <ArrowUpRight size={16} />
                  </a>
                </div>
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {thread.extractedText || "No additional text extracted."}
                </div>
              </section>
            </div>

            <div className="p-8 bg-slate-50/80 border-t border-slate-100 flex flex-wrap gap-4 items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Fingerprint:</span>
              <div className="flex flex-wrap gap-2">
                {thread.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThreadCard;
