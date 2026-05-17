import React from 'react';
import { Plus, MessageSquare, Trash2, Settings, Github, LayoutGrid, Terminal } from 'lucide-react';
import { ChatSession } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}) => {
  return (
    <div id="sidebar" className="w-72 h-full bg-slate-900/50 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="font-bold text-white text-sm">G</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Nexus AI</h1>
        </div>

        <button
          id="new-chat-btn"
          onClick={onNewChat}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20 mb-8 font-medium"
        >
          <span>New Chat</span>
          <Plus size={18} />
        </button>

        <nav className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Recent activity</p>
          <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[calc(100vh-320px)] px-1">
            <AnimatePresence initial={false}>
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="group relative mb-1"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectSession(session.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectSession(session.id);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-200 cursor-pointer outline-none group/item ${
                      currentSessionId === session.id
                        ? 'bg-slate-800/50 text-white border border-slate-700/50'
                        : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <MessageSquare size={16} className={currentSessionId === session.id ? 'text-blue-400' : 'text-slate-500'} />
                    <span className="truncate flex-1 text-sm">{session.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=NexusUser" alt="avatar" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">Nexus Explorer</p>
            <p className="text-xs text-slate-500 truncate">nexus@build.ai</p>
          </div>
          <Settings size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
  );
};
