
import React, { useState, useEffect } from 'react';
import { RecipientStatus } from '../types';

const STORAGE_KEYS = {
  PURPOSE: 'voxai_outbound_purpose',
  AGENT: 'voxai_outbound_agent',
  SCRIPT: 'voxai_outbound_script',
  RECIPIENTS: 'voxai_outbound_recipients'
};

export const OutboundCallsPage: React.FC = () => {
  const [purpose, setPurpose] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.PURPOSE) || 'Information Delivery'
  );
  const [agent, setAgent] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.AGENT) || 'VoxAI General Agent'
  );
  const [script, setScript] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.SCRIPT) || 'Hello, this is VoxAI reaching out regarding your account security update. Are you able to talk for a moment?'
  );
  const [recipients, setRecipients] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.RECIPIENTS) || '+1 (555) 012-3456, +1 (555) 098-7654'
  );
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [callStatuses, setCallStatuses] = useState<RecipientStatus[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURPOSE, purpose);
    localStorage.setItem(STORAGE_KEYS.AGENT, agent);
    localStorage.setItem(STORAGE_KEYS.SCRIPT, script);
    localStorage.setItem(STORAGE_KEYS.RECIPIENTS, recipients);
  }, [purpose, agent, script, recipients]);

  const startSimulation = () => {
    const phoneList = recipients.split(',').map(p => p.trim()).filter(p => p.length > 0);
    const initialStatuses: RecipientStatus[] = phoneList.map((phone, idx) => ({
      id: `call-${idx}-${Date.now()}`,
      phone,
      state: 'idle',
      transcript: []
    }));

    setCallStatuses(initialStatuses);
    setIsSimulating(true);

    initialStatuses.forEach((recipient, idx) => {
      setTimeout(() => {
        updateRecipient(recipient.id, { state: 'calling' });
      }, 500 + (idx * 800));

      setTimeout(() => {
        updateRecipient(recipient.id, { 
          state: 'connected', 
          transcript: ['[VoxAI] ' + script]
        });
        if (idx === 0) {
          const utterance = new SpeechSynthesisUtterance(script);
          window.speechSynthesis.speak(utterance);
        }
      }, 3000 + (idx * 1200));

      setTimeout(() => {
        updateRecipient(recipient.id, { 
          state: 'completed',
          transcript: [
            '[VoxAI] ' + script,
            '[User] Yes, I am listening.',
            '[VoxAI] Great. Your security patch has been applied successfully.'
          ]
        });
      }, 7000 + (idx * 1500));
    });
  };

  const updateRecipient = (id: string, updates: Partial<RecipientStatus>) => {
    setCallStatuses(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-1000 h-full overflow-y-auto custom-scroll">
      <div className="flex flex-col mb-4">
        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Orchestration_Interface</h1>
        <h2 className="text-4xl font-black tracking-tighter text-white">Campaign_Console</h2>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="glass rounded-[2rem] p-7 border border-white/[0.04] space-y-6">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center space-x-3">
              <span className="w-1 h-1 rounded-full bg-violet-500"></span>
              <span>Context_Settings</span>
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Primary_Purpose</label>
                <select 
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] font-medium text-zinc-300 transition-all cursor-pointer"
                >
                  <option>Information Delivery</option>
                  <option>Survey Analysis</option>
                  <option>Appointment Sync</option>
                  <option>Security Protocol</option>
                </select>
              </div>

              <div>
                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Agent_Identity</label>
                <select 
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] font-medium text-zinc-300 transition-all cursor-pointer"
                >
                  <option>VoxAI General Agent</option>
                  <option>VoxAI Support Pro</option>
                  <option>VoxAI Concierge</option>
                </select>
              </div>

              <div>
                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Initialization_Script</label>
                <textarea 
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-950/60 border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] font-medium text-zinc-300 transition-all resize-none leading-relaxed"
                  placeholder="Script content..."
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-[2rem] p-7 border border-white/[0.04] space-y-6">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center space-x-3">
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
              <span>Target_Matrix</span>
            </h3>
            <div>
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Recipients_List</label>
              <textarea 
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                rows={3}
                className="w-full bg-zinc-950/60 border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] font-medium text-zinc-300 transition-all resize-none leading-relaxed tabular-nums"
                placeholder="+1 (555) 000-0000..."
              />
              <p className="text-[8px] text-zinc-700 mt-2.5 font-bold uppercase tracking-tight opacity-60">Comma-separated international E.164</p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="glass rounded-[2rem] p-6 border border-white/[0.04] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">Command_Console</span>
              <p className="text-zinc-400 text-[11px] font-medium">Verify configuration and engage call pulse.</p>
            </div>
            <button 
              onClick={startSimulation}
              disabled={isSimulating}
              className="px-8 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-xl transition-all active:scale-95 glow-violet"
            >
              {isSimulating ? 'Processing_Pulse' : 'Engage_Dispatch'}
            </button>
          </div>

          <div className="glass rounded-[2.5rem] p-8 border border-white/[0.04] min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center space-x-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    <span>Live_Stream_Monitor</span>
                </h3>
                {isSimulating && <span className="text-[8px] font-mono text-emerald-500 animate-pulse uppercase font-black">Link Active</span>}
            </div>

            {callStatuses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-800 space-y-5 opacity-40">
                <div className="w-20 h-20 rounded-full border border-dashed border-zinc-800 flex items-center justify-center text-4xl">📡</div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Standby_Mode</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {callStatuses.map((call) => (
                  <div key={call.id} className="bg-zinc-950/40 border border-white/[0.04] rounded-[1.75rem] p-6 space-y-5 animate-in slide-in-from-top-4 duration-700">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white/90 tabular-nums">{call.phone}</span>
                        <span className="text-[8px] font-bold text-zinc-600 uppercase mt-1 tracking-tighter">Handshake_Stable_200</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase transition-all duration-500 ${
                        call.state === 'calling' ? 'bg-amber-500/10 text-amber-500 animate-pulse' :
                        call.state === 'connected' ? 'bg-emerald-500/10 text-emerald-500' :
                        call.state === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-zinc-900 text-zinc-600'
                      }`}>
                        {call.state}
                      </span>
                    </div>

                    <div className="h-40 overflow-y-auto custom-scroll space-y-3 bg-black/30 rounded-2xl p-4 font-mono text-[10px] border border-white/[0.02]">
                      {call.transcript.length === 0 ? (
                        <div className="flex items-center space-x-2 text-zinc-700 italic uppercase">
                            <span className="w-1 h-1 bg-zinc-800 rounded-full animate-pulse"></span>
                            <span>Awaiting Link...</span>
                        </div>
                      ) : (
                        call.transcript.map((line, i) => (
                          <div key={i} className={`flex space-x-2 ${line.startsWith('[VoxAI]') ? 'text-violet-400' : 'text-zinc-400'}`}>
                            <span className="opacity-20">&gt;</span>
                            <span className="leading-relaxed">{line}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 opacity-70">
                      <div className="flex space-x-1.5 h-1">
                        {[...Array(6)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-3 h-full rounded-full transition-all duration-700 ${
                              call.state === 'completed' ? 'bg-blue-500' : 
                              (call.state === 'connected' && i < 5) ? 'bg-emerald-500' :
                              (call.state === 'calling' && i < 3) ? 'bg-amber-500' :
                              'bg-zinc-900'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Hi-Def_Sync</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
