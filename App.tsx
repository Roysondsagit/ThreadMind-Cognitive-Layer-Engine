
import React, { useState, useEffect, useRef } from 'react';
import { Search, BrainCircuit, LayoutGrid, BarChart3, ShieldCheck, Zap, Mic, Square, Loader2, Filter, Trash2 } from 'lucide-react';
import Collector from './components/Collector';
import ThreadCard from './components/ThreadCard';
import SmartResurfacer from './components/SmartResurfacer';
import Insights from './components/Insights';
import BotSetup from './components/BotSetup';
import CognitiveAssistant from './components/CognitiveAssistant';
import { getThreads, saveThread, deleteThread } from './services/vaultService';
import { processContent, semanticSearch, transcribeAudio } from './services/geminiService';
import { Thread, Category } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'vault' | 'insights' | 'settings'>('vault');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Thread[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [isSearching, setIsSearching] = useState(false);
  const [isDemoing, setIsDemoing] = useState(false);

  // Voice Search States
  const [isRecordingSearch, setIsRecordingSearch] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    refreshThreads();
  }, []);

  const refreshThreads = async () => {
    const data = await getThreads();
    setThreads(data);
  };

  const handleDelete = async (id: string) => {
    await deleteThread(id);
    refreshThreads();
  };

  const handleSearch = async (queryOverride?: string) => {
    const query = queryOverride !== undefined ? queryOverride : searchQuery;
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const relevantIds = await semanticSearch(query, threads);
      const matched = threads.filter(t => relevantIds.includes(t.id));
      setSearchResults(matched);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const startVoiceSearch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          setIsSearching(true);
          try {
            const transcription = await transcribeAudio(base64data, 'audio/webm');
            setSearchQuery(transcription);
            handleSearch(transcription);
          } finally { setIsSearching(false); }
        };
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecordingSearch(true);
    } catch (err) { console.error("Mic error:", err); }
  };

  const stopVoiceSearch = () => {
    if (mediaRecorderRef.current && isRecordingSearch) {
      mediaRecorderRef.current.stop();
      setIsRecordingSearch(false);
    }
  };

  const filteredThreads = threads.filter(t => activeCategory === 'All' || t.category === activeCategory);
  const displayedThreads = searchQuery ? searchResults : filteredThreads;

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col bg-white border-r border-slate-100 fixed h-full z-20">
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center space-x-3 mb-12">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-200">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">ThreadMind</h1>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1.5 flex items-center">
                <ShieldCheck size={10} className="mr-1" /> Cognitive Layer
              </p>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            <button 
              onClick={() => setView('vault')}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${view === 'vault' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <div className="flex items-center space-x-3">
                <LayoutGrid size={18} />
                <span>Knowledge Vault</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${view === 'vault' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {threads.length}
              </span>
            </button>
            <button 
              onClick={() => setView('insights')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${view === 'insights' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <BarChart3 size={18} />
              <span>Cognitive Trends</span>
            </button>
            <button 
              onClick={() => setView('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${view === 'settings' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Zap size={18} />
              <span>Bot Demo</span>
            </button>
          </nav>

          <div className="mt-auto p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Build Status</p>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>MVP Ready for Demo</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 p-4 lg:p-12 min-w-0">
        <div className="max-w-6xl mx-auto">
          {view === 'vault' ? (
            <>
              <header className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
                    Your Cognitive <span className="text-indigo-600">Vault.</span>
                  </h1>
                  <p className="text-slate-500 font-bold">Rescuing your scattered thoughts from the digital void.</p>
                </div>

                <div className="relative w-full xl:w-[400px]">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-300" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search memories..."
                    className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none font-bold placeholder:text-slate-300 transition-all"
                  />
                  <button 
                    onClick={isRecordingSearch ? stopVoiceSearch : startVoiceSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
                  >
                    {isRecordingSearch ? <Square size={18} className="text-red-500 animate-pulse" /> : <Mic size={18} />}
                  </button>
                  {isSearching && <Loader2 className="absolute right-12 top-1/2 transform -translate-y-1/2 animate-spin text-indigo-500" size={16} />}
                </div>
              </header>

              <Collector onSaved={() => refreshThreads()} />
              
              {!searchQuery && threads.length > 0 && (
                <SmartResurfacer threads={threads} onViewed={refreshThreads} />
              )}

              {/* Filtering */}
              <div className="flex items-center space-x-3 mb-8 overflow-x-auto pb-2">
                <Filter size={16} className="text-slate-400" />
                {['All', ...Object.values(Category)].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat as any)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all shrink-0 ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {displayedThreads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                  {displayedThreads.map((thread) => (
                    <div key={thread.id} className="relative group">
                      <ThreadCard thread={thread} />
                      <button 
                        onClick={() => handleDelete(thread.id)}
                        className="absolute top-4 right-16 p-2 bg-white/80 backdrop-blur rounded-xl text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100">
                  <p className="text-slate-400 font-bold">No threads found in this sector of your mind.</p>
                </div>
              )}
            </>
          ) : view === 'insights' ? (
            <Insights threads={threads} />
          ) : (
            <BotSetup onRescueComplete={refreshThreads} />
          )}
        </div>
      </main>

      <CognitiveAssistant threads={threads} />
    </div>
  );
};

export default App;
