import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { MessageList } from './components/MessageList';
import { ChatSession, ChatMessage } from './types';
import { geminiService } from './services/geminiService';
import { Send, Plus, Share, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'Standard' | 'Experimental' | 'Creative'>('Standard');

  const { isListening, startListening, stopListening, error } = useSpeechRecognition((transcript) => {
    setInput(prev => prev + (prev.length > 0 ? ' ' : '') + transcript);
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, loading]);


  // Initialize with a default session if none exist
  useEffect(() => {
    const saved = localStorage.getItem('nexus_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
      }
    } else {
      const firstSession: ChatSession = {
        id: crypto.randomUUID(),
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
      };
      setSessions([firstSession]);
      setCurrentSessionId(firstSession.id);
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('nexus_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading || !currentSessionId) return;

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: input }]
    };

    const updatedSessions = sessions.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMessage],
          title: s.messages.length === 0 ? (input.slice(0, 30) + (input.length > 30 ? '...' : '')) : s.title
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    setInput('');
    setLoading(true);

    try {
      let fullResponse = '';
      const modelMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: '' }]
      };

      // Add placeholder model message
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, modelMessage] };
        }
        return s;
      }));

      const systemPrompt = mode === 'Creative' 
        ? "You are a highly creative AI poet and storyteller. Use rich metaphors and vivid descriptions."
        : mode === 'Experimental'
        ? "You are a cutting-edge technical architect. Use strict logic, focus on efficiency, and always provide code examples."
        : undefined;

      const history = currentSession?.messages || [];
      const stream = geminiService.chatStream(input, history, systemPrompt);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            const msgs = [...s.messages];
            msgs[msgs.length - 1] = {
              role: 'model',
              parts: [{ text: fullResponse }]
            };
            return { ...s, messages: msgs };
          }
          return s;
        }));
      }
    } catch (error) {
      console.error('Chat failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (id: string) => {
    const remaining = sessions.filter(s => s.id !== id);
    setSessions(remaining);
    if (currentSessionId === id) {
      setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  return (
    <div id="nexus-app" className="flex h-screen w-screen bg-slate-950 overflow-hidden font-sans text-slate-200">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewChat}
        onDeleteSession={deleteSession}
      />

      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-slate-950/80 backdrop-blur-md shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700 flex items-center gap-2 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-sm shadow-green-400/50"></span>
              Nexus Prime v4
            </div>
            <div className="flex gap-1">
              {(['Standard', 'Experimental', 'Creative'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`text-[10px] px-3 py-1 rounded-lg transition-all font-bold uppercase tracking-wider ${
                    mode === m ? 'bg-white/10 text-white border border-white/10' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-6 items-center">
             <button className="text-[10px] text-slate-400 hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest transition-colors">
               <Share size={14} className="text-blue-400" />
               Share result
             </button>
             <button className="text-[10px] text-slate-200 hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest bg-blue-600 px-4 py-1.5 rounded-lg shadow-lg shadow-blue-600/20 transition-all">
               Upgrade
             </button>
          </div>
        </header>

        {/* Chat Area */}
        <MessageList messages={currentSession?.messages || []} loading={loading} messagesEndRef={messagesEndRef} />

        {/* Input Area */}
        <footer className="p-8 pb-10 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
          {/* Status indicator for voice input */}
        <AnimatePresence>
          {(isListening || error) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="max-w-4xl mx-auto mb-2 px-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {isListening ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Listening...
                  </div>
                ) : error ? (
                  <div className="text-xs font-medium text-red-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {error}
                  </div>
                ) : null}
              </div>
              {isListening && (
                <button 
                  onClick={stopListening}
                  className="text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-15 group-focus-within:opacity-30 transition duration-1000"></div>
            <form 
              onSubmit={handleSend}
              className="relative bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center shadow-2xl backdrop-blur-xl"
            >
              <button type="button" className="p-3 text-slate-500 hover:text-slate-300 transition-colors">
                <Plus size={20} />
              </button>
              
              <button 
                type="button" 
                onClick={isListening ? stopListening : startListening}
                className={`p-3 transition-all rounded-lg relative ${
                  isListening 
                    ? 'text-red-500 bg-red-500/10' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? (
                  <>
                    <Mic size={20} />
                    <motion.span 
                      layoutId="mic-pulse"
                      className="absolute inset-0 rounded-lg bg-red-500/20"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </>
                ) : (
                  <Mic size={20} />
                )}
              </button>

              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Send a message or type '/' for commands..."
                className="flex-1 bg-transparent border-none text-slate-200 placeholder-slate-500 focus:ring-0 text-sm px-4 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() && !loading 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-100 active:scale-95' 
                    : 'bg-slate-800 text-slate-500 scale-95'
                }`}
              >
                <Send size={18} className="rotate-[15deg]" />
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-600 mt-4 tracking-[0.2em] uppercase font-bold">
              Powered by Aether Core v4.1 • Processing 128k Tokens Context
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

