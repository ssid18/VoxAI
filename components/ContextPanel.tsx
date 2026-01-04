
import React from 'react';
import { CallContext, CallStatus } from '../types';

interface Props {
  context: CallContext;
}

const ContextRow: React.FC<{ label: string; value: string; color?: string; subValue?: string }> = ({ label, value, color, subValue }) => (
  <div className="flex flex-col space-y-1.5 group">
    <span className="text-[8px] uppercase font-black tracking-[0.3em] text-zinc-600 transition-colors group-hover:text-zinc-500">{label}</span>
    <div className="flex items-baseline justify-between">
        <span className={`text-sm font-bold tracking-tight ${color || 'text-zinc-200'} leading-tight`}>{value}</span>
        {subValue && <span className="text-[8px] font-mono text-zinc-700 tracking-tighter uppercase font-bold">{subValue}</span>}
    </div>
  </div>
);

export const ContextPanel: React.FC<Props> = ({ context }) => {
  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case CallStatus.LISTENING: return 'text-blue-500';
      case CallStatus.SPEAKING: return 'text-emerald-500';
      case CallStatus.THINKING: return 'text-violet-500';
      case CallStatus.OUTBOUND: return 'text-amber-500';
      default: return 'text-zinc-700';
    }
  };

  return (
    <div className="glass rounded-[2rem] p-7 space-y-7 border border-white/[0.04] relative overflow-hidden">
      <div className="flex items-center space-x-3 mb-1">
        <div className="w-1 h-1 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
        <h3 className="font-black text-[9px] uppercase tracking-[0.3em] text-zinc-500">Intel_Matrix</h3>
      </div>
      
      <div className="space-y-6">
        <ContextRow 
            label="Target Intent" 
            value={context.intent === 'None' ? 'Calibrating...' : context.intent} 
            color="text-violet-400" 
            subValue="Confidence 98%"
        />
        <ContextRow label="Session Hub" value={context.email} subValue="ID_ALPHA" />
        <ContextRow label="State Engine" value={context.status} color={getStatusColor(context.status)} />
        <ContextRow label="Sync Pulse" value={context.timestamp === '--:--' ? 'Establishing...' : context.timestamp} />
      </div>

      <div className="pt-6 border-t border-white/[0.03]">
        <div className="flex items-center justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-3">
          <span>Signal Integrity</span>
          <span className="text-zinc-500 mono">98%</span>
        </div>
        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden p-[2px] border border-white/[0.03]">
          <div className="bg-gradient-to-r from-violet-600 to-blue-500 h-full w-[98%] rounded-full shadow-[0_0_10px_rgba(139,92,246,0.2)]"></div>
        </div>
      </div>
    </div>
  );
};
