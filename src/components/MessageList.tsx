import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types';
import { User, Bot, Copy, Terminal, Sparkles, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatMessageProps {
  message: ChatMessage;
}

export const MessageItem: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';
  const text = message.parts[0].text;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-6 max-w-4xl group"
    >
      <div className={`shrink-0 w-9 h-9 rounded flex items-center justify-center font-bold text-sm text-white ${isModel ? 'bg-blue-500' : 'bg-indigo-600'}`}>
        {isModel ? <Bot size={20} /> : 'ME'}
      </div>
      
      <div className={`flex-1 min-w-0 pt-1.5 ${isModel ? 'space-y-4' : ''}`}>
        {!isModel && (
           <p className="text-lg leading-relaxed text-slate-100 mb-4 font-light">
             {text}
           </p>
        )}

        {isModel && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-blue-400 text-[10px] font-bold mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
              Intelligence Engine
            </h3>
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {text}
              </ReactMarkdown>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-slate-800/50 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Aether Core v4.1</span>
               <button className="text-slate-500 hover:text-white transition-colors">
                 <Copy size={14} />
               </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface MessageListProps {
  messages: ChatMessage[];
  loading?: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, loading, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center mt-32 text-center">
            <div className="w-16 h-16 bg-blue-500 shadow-2xl shadow-blue-500/20 text-white rounded-2xl flex items-center justify-center mb-8">
              <Sparkles size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white tracking-tight">How can I help you?</h2>
            <p className="text-slate-400 max-w-sm mb-12 text-lg font-light leading-relaxed">
              Explore complex datasets, write production-grade code, or draft high-impact strategies.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              <SuggestionCard icon={<Terminal size={14}/>} title="Architecture" desc="Design a distributed microservices environment." />
              <SuggestionCard icon={<BrainCircuit size={14}/>} title="Data Science" desc="Analyze last month's growth and churn metrics." />
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <MessageItem key={i} message={msg} />
        ))}
        
        {loading && (
          <div className="flex gap-6 max-w-4xl animate-pulse">
            <div className="shrink-0 w-9 h-9 rounded bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Bot size={20} />
            </div>
            <div className="flex-1 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
               <div className="h-2 bg-slate-800 rounded w-1/4"></div>
               <div className="space-y-2">
                 <div className="h-2 bg-slate-800 rounded w-full"></div>
                 <div className="h-2 bg-slate-800 rounded w-5/6"></div>
               </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
};

const SuggestionCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-nexus-surface border border-nexus-border p-4 rounded-xl text-left hover:border-nexus-accent/50 cursor-pointer transition-all group">
    <div className="flex items-center gap-2 mb-2 text-nexus-accent uppercase font-bold text-[10px] tracking-widest">
      {icon}
      {title}
    </div>
    <p className="text-xs text-nexus-text-muted group-hover:text-nexus-text transition-colors">{desc}</p>
  </div>
);
