
import React from 'react';

interface Props {
  onTriggerOutbound: () => void;
  onSendEmail: () => void;
  isProcessing: boolean;
}

export const ActionPanel: React.FC<Props> = ({ onTriggerOutbound, onSendEmail, isProcessing }) => {
  return (
    <div className="bg-zinc-950/40 border border-white/[0.04] rounded-[1.75rem] p-6 space-y-5 shadow-xl">
      <div className="flex items-center space-x-2">
          <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
          <h3 className="font-black text-[9px] uppercase tracking-[0.3em] text-zinc-500">Operational_Hub</h3>
      </div>
      <div className="grid grid-cols-1 gap-2.5">
        <button 
          onClick={onTriggerOutbound}
          disabled={isProcessing}
          className="w-full py-3 px-4 bg-zinc-900/40 hover:bg-zinc-800/80 disabled:opacity-40 disabled:cursor-not-allowed border border-white/[0.04] rounded-xl text-[11px] font-bold text-zinc-200 flex items-center justify-between transition-all group"
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">🛰️</span>
            <span className="uppercase tracking-tight">Init Outbound Pulse</span>
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">→</span>
        </button>

        <button 
          onClick={onSendEmail}
          disabled={isProcessing}
          className="w-full py-3 px-4 bg-zinc-900/40 hover:bg-zinc-800/80 disabled:opacity-40 disabled:cursor-not-allowed border border-white/[0.04] rounded-xl text-[11px] font-bold text-zinc-200 flex items-center justify-between transition-all group"
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">📧</span>
            <span className="uppercase tracking-tight">Sync PDF Manifest</span>
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">→</span>
        </button>
      </div>
    </div>
  );
};
