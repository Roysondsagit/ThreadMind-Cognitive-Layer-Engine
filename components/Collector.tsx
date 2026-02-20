
import React, { useState, useRef } from 'react';
import { processContent } from '../services/geminiService';
import { saveThread } from '../services/vaultService';
import { Category, Intent, Thread } from '../types';
import { Loader2, Plus, Link, Type, Mic, CheckCircle2, Instagram, Twitter, Globe, Sparkles, Square, FileText } from 'lucide-react';

interface CollectorProps {
  onSaved: () => void;
}

const Collector: React.FC<CollectorProps> = ({ onSaved }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<'text' | 'url' | 'voice'>('url');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleTextProcess = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setError(null);
    
    if (mode === 'url') {
      const lower = input.toLowerCase();
      if (lower.includes('instagram.com')) {
        setProcessStep('Extracting Instagram Caption & Tags...');
      } else if (lower.includes('twitter.com') || lower.includes('x.com')) {
        setProcessStep('Parsing Twitter Thread Narrative...');
      } else if (lower.includes('blog') || lower.includes('.html') || lower.includes('article')) {
        setProcessStep('Scraping Main Article Text...');
      } else {
        setProcessStep('Analyzing Web Metadata...');
      }
      
      await new Promise(r => setTimeout(r, 1200));
      setProcessStep('Running Cognitive Analysis...');
    } else {
      setProcessStep('Processing Raw Note...');
    }

    try {
      const analysis = await processContent(input, mode);
      await finalizeSave(analysis, mode, input);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(msg);
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsProcessing(true);
        setProcessStep('Transcribing Voice Note...');
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          setProcessStep('Gemini Intelligence Layer...');
          const analysis = await processContent({ data: base64data, mimeType: 'audio/webm' }, 'voice');
          await finalizeSave(analysis, 'voice', '[Voice Rescue]');
        };
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert("Mic required for Voice Rescue."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const finalizeSave = async (analysis: any, sourceMode: string, original: string) => {
    const newThread: Thread = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'current-user',
      contentType: sourceMode as any,
      originalContent: original,
      title: analysis.title,
      summary: analysis.summary,
      extractedText: analysis.extractedText, // Now saving the full main text/caption
      tags: analysis.tags,
      intent: analysis.intent,
      category: analysis.category,
      viewCount: 0,
      lastViewed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    await saveThread(newThread);
    setInput('');
    setSuccess(true);
    setIsProcessing(false);
    setProcessStep('');
    setTimeout(() => setSuccess(false), 3000);
    onSaved();
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8 md:p-10 mb-16 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -mr-32 -mt-32"></div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button 
            onClick={() => setMode('url')}
            className={`px-8 py-3.5 rounded-2xl text-sm font-black flex items-center space-x-3 transition-all ${mode === 'url' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-500'}`}
          >
            <Link size={18} /> <span>Rescue Link</span>
          </button>
          <button 
            onClick={() => setMode('text')}
            className={`px-8 py-3.5 rounded-2xl text-sm font-black flex items-center space-x-3 transition-all ${mode === 'text' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-500'}`}
          >
            <Type size={18} /> <span>Quick Spark</span>
          </button>
          <button 
            onClick={() => setMode('voice')}
            className={`px-8 py-3.5 rounded-2xl text-sm font-black flex items-center space-x-3 transition-all ${mode === 'voice' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-500'}`}
          >
            <Mic size={18} /> <span>Voice Rescue</span>
          </button>
        </div>

        <div className="relative min-h-[160px] flex items-center justify-center">
          {mode === 'voice' ? (
            <div className="w-full flex flex-col items-center justify-center space-y-6 py-10">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform active:scale-95 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-600'} text-white shadow-2xl`}
              >
                {isRecording ? <Square size={32} /> : <Mic size={32} />}
              </button>
              <div className="text-center">
                <h4 className="text-xl font-black text-slate-900">{isRecording ? "Listening..." : "Speak your idea"}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Captured via ThreadMind Ear</p>
              </div>
            </div>
          ) : (
            <div className="w-full relative">
              <div className="absolute top-5 left-5 z-10 flex space-x-3 opacity-30">
                {input.includes('instagram') ? <Instagram size={18} className="text-pink-500" /> :
                 input.includes('twitter') || input.includes('x.com') ? <Twitter size={18} className="text-blue-400" /> :
                 input.includes('blog') ? <FileText size={18} className="text-emerald-500" /> : <Globe size={18} />}
              </div>
              <textarea
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(null); }}
                placeholder={mode === 'url' ? '     Paste Instagram, Twitter, or Blog URL...' : 'What is worth remembering?'}
                className="w-full h-40 p-8 pt-12 bg-slate-50 border border-slate-100 rounded-[32px] focus:ring-4 focus:ring-indigo-100/50 focus:bg-white transition-all resize-none text-slate-900 font-bold text-lg placeholder:text-slate-300"
              />
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-[32px] flex flex-col items-center justify-center z-20">
              <div className="bg-slate-900 p-4 rounded-3xl shadow-2xl mb-4">
                <Loader2 className="animate-spin text-white" size={32} />
              </div>
              <p className="text-slate-900 font-black uppercase tracking-[0.2em] text-xs">{processStep}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold">
            {error}
          </div>
        )}
        {mode !== 'voice' && (
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3 text-[10px] text-indigo-400 font-black uppercase tracking-widest">
              <Sparkles size={14} />
              <span>Deep Scraping Intelligence Active</span>
            </div>
            
            <button
              onClick={handleTextProcess}
              disabled={isProcessing || !input.trim()}
              className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-xl hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center space-x-4 transition-all transform active:scale-95"
            >
              {success ? (
                <><CheckCircle2 size={24} className="text-emerald-400" /> <span>Rescued!</span></>
              ) : (
                <><Plus size={24} /> <span>Process Content</span></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collector;
