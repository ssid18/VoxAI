
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface Props {
  messages: Message[];
  isThinking: boolean;
}

export const ConversationPanel: React.FC<Props> = ({ messages, isThinking }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="glass rounded-[2rem] flex flex-col h-full overflow-hidden shadow-2xl border border-white/[0.04]">
      <div className="px-7 py-4 border-b border-white/[0.03] flex items-center justify-between bg-zinc-900/[0.08]">
        <div className="flex items-center space-x-3">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></div>
            <h3 className="font-extrabold text-[9px] uppercase tracking-[0.3em] text-zinc-500">Interaction_Stream</h3>
        </div>
        <div className="flex space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white/5"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/5"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/5"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-7 custom-scroll">
        {messages.length === 0 && !isThinking ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600/50 space-y-5">
            <div className="w-14 h-14 rounded-2xl border border-dashed border-zinc-800 flex items-center justify-center">
                <span className="text-xl opacity-40">⚡</span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-center max-w-[140px] leading-relaxed">System Idle<br/>Waiting for Input</p>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} transition-all animate-in fade-in slide-in-from-bottom-2 duration-700`}
              >
                <div className="flex items-center space-x-2 mb-2 px-1 opacity-60">
                  <span className={`text-[8px] uppercase font-black tracking-widest ${m.role === 'user' ? 'text-zinc-400' : 'text-violet-400'}`}>
                    {m.role === 'user' ? 'Source.Audio' : 'VoxAI.Agent'}
                  </span>
                  <span className="text-[8px] text-zinc-600 mono tabular-nums">
                      {m.timestamp.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed font-medium transition-all ${
                  m.role === 'user' 
                    ? 'bg-zinc-900/60 text-zinc-100 rounded-tr-none border border-white/[0.04] shadow-xl' 
                    : 'bg-violet-600/[0.06] text-violet-100 rounded-tl-none border border-violet-500/20 shadow-inner'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex flex-col items-start animate-in fade-in duration-500">
                <div className="flex items-center space-x-2 mb-2 px-1 opacity-60">
                  <span className="text-[8px] uppercase font-black tracking-widest text-violet-400">VoxAI.Agent</span>
                </div>
                <div className="bg-violet-600/[0.06] px-5 py-3.5 rounded-2xl rounded-tl-none border border-violet-500/10 flex space-x-1.5 items-center">
                  <div className="w-1 h-1 bg-violet-400 rounded-full typing-dot"></div>
                  <div className="w-1 h-1 bg-violet-400 rounded-full typing-dot"></div>
                  <div className="w-1 h-1 bg-violet-400 rounded-full typing-dot"></div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};
