
import React from 'react';
import { CallStatus } from '../types';

interface VoiceCardProps {
  status: CallStatus;
  isSessionActive: boolean;
  onToggle: () => void;
  onHangUp: () => void;
  timer: string;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({ status, isSessionActive, onToggle, onHangUp, timer }) => {
  return (
    <div className="glass rounded-[2rem] p-7 flex flex-col items-center justify-center space-y-7 relative overflow-hidden group transition-all duration-700 border-white/[0.04] hover:border-violet-500/20 shadow-2xl">
      <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[120px] transition-all duration-1000 ${isSessionActive ? 'bg-violet-600/15 scale-110 opacity-100' : 'bg-transparent opacity-0 scale-75'}`} />
      <div className={`absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[120px] transition-all duration-1000 ${isSessionActive ? 'bg-blue-600/10 scale-110 opacity-100' : 'bg-transparent opacity-0 scale-75'}`} />

      <div className="w-full relative z-10">
        <div className="flex justify-between items-center mb-5">
            <div className="flex flex-col">
                <span className="text-[8px] font-black tracking-[0.4em] text-zinc-500 uppercase leading-none mb-1">Live_Node</span>
                <span className="text-[10px] font-bold text-zinc-500 tracking-tight">ID: VX-992-ALPHA</span>
            </div>
            <div className={`px-2.5 py-0.5 rounded-full text-[8px] font-black border transition-all duration-700 ${isSessionActive ? 'bg-violet-600 text-white border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.3)]' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                {isSessionActive ? 'ENCRYPTED' : 'STANDBY'}
            </div>
        </div>
        
        <div className="flex flex-col items-center py-2">
            <div className="relative group/timer">
                <span className={`text-6xl font-black tracking-tighter transition-all duration-700 tabular-nums mono ${isSessionActive ? 'text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.15)]' : 'text-zinc-800'}`}>
                    {timer}
                </span>
                {isSessionActive && (
                    <div className="absolute -right-3 top-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                )}
            </div>
            <p className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-[0.25em] mt-3 h-4 flex items-center justify-center">
                {status === CallStatus.LISTENING ? "User Input Detected" : 
                 status === CallStatus.THINKING ? "AI Processing..." : 
                 status === CallStatus.SPEAKING ? "Transmitting Audio" : 
                 isSessionActive ? "Uplink Stable" : "Waiting for Node"}
            </p>
        </div>
      </div>

      <div className="flex items-center space-x-5 relative z-10">
        <button
            onClick={onToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 group/btn shadow-2xl ${
            status === CallStatus.IDLE 
                ? 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-800/80 hover:border-violet-500/40' 
                : 'bg-violet-600 text-white scale-110 glow-violet'
            }`}
        >
            <span className="text-2xl transition-all duration-500 group-hover/btn:scale-110">
                {status === CallStatus.IDLE ? '🎙️' : (status === CallStatus.LISTENING ? '⏸️' : '🎙️')}
            </span>
        </button>

        {isSessionActive && (
            <button
                // Fix: Corrected function name from handleHangUp to onHangUp
                onClick={onHangUp}
                className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 animate-in zoom-in"
                title="Disconnect"
            >
                <span className="text-lg">✕</span>
            </button>
        )}
      </div>

      <div className="w-full pt-4 relative z-10">
        <div className="flex items-center justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2.5">
            <span>Fidelity_Band</span>
            <span className="text-zinc-500">48kHz</span>
        </div>
        <div className="flex space-x-1 h-1.5 w-full items-end">
            {[...Array(16)].map((_, i) => (
                <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-all duration-500 ${isSessionActive ? 'bg-violet-500/40' : 'bg-zinc-800'}`}
                    style={{ 
                        opacity: isSessionActive ? 0.4 + (Math.random() * 0.6) : 0.8,
                        height: isSessionActive ? `${40 + Math.random() * 60}%` : '20%'
                    }}
                />
            ))}
        </div>
      </div>
    </div>
  );
};
