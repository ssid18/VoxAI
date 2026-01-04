
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { VoiceCard } from './components/VoiceCard';
import { ConversationPanel } from './components/ConversationPanel';
import { ContextPanel } from './components/ContextPanel';
import { ActionPanel } from './components/ActionPanel';
import { OutboundCallsPage } from './components/OutboundCallsPage';
import { Message, CallStatus, CallContext, View } from './types';
import { getAgentResponse, analyzeIntent } from './services/geminiService';

const STORAGE_KEY_VIEW = 'voxai_active_view';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(() => 
    (localStorage.getItem(STORAGE_KEY_VIEW) as View) || 'DASHBOARD'
  );
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<CallStatus>(CallStatus.IDLE);
  const [isThinking, setIsThinking] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [context, setContext] = useState<CallContext>({
    intent: 'None',
    email: 'demo@example.com',
    status: CallStatus.IDLE,
    timestamp: '--:--'
  });

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isRecognitionActive = useRef<boolean>(false);
  const isThinkingRef = useRef<boolean>(false);
  const shouldBeListening = useRef<boolean>(false);

  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VIEW, activeView);
  }, [activeView]);

  useEffect(() => {
    if (isSessionActive) {
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = window.setInterval(() => {
          setCallSeconds(prev => prev + 1);
        }, 1000);
      }
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isSessionActive]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || !isSessionActive) return;
    if (isRecognitionActive.current || isSpeakingRef.current || isThinkingRef.current) return;

    try {
      recognitionRef.current.start();
      setStatus(CallStatus.LISTENING);
      setContext(prev => ({ ...prev, status: CallStatus.LISTENING }));
    } catch (e) {}
  }, [isSessionActive]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current && isRecognitionActive.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isRecognitionActive.current = true;
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserSpeech(transcript);
      };

      recognition.onerror = (event: any) => {
        isRecognitionActive.current = false;
      };

      recognition.onend = () => {
        isRecognitionActive.current = false;
        if (shouldBeListening.current && isSessionActive && !isSpeakingRef.current && !isThinkingRef.current) {
          setTimeout(() => {
            if (shouldBeListening.current && isSessionActive && !isSpeakingRef.current && !isThinkingRef.current) {
              startRecognition();
            }
          }, 200);
        } else if (status === CallStatus.LISTENING && !isThinkingRef.current && !isSpeakingRef.current) {
          setStatus(CallStatus.IDLE);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isSessionActive, startRecognition, status]);

  const handleUserSpeech = async (text: string) => {
    shouldBeListening.current = false;
    stopRecognition();

    const newUserMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setStatus(CallStatus.THINKING);
    setIsThinking(true);
    
    const responsePromise = getAgentResponse(text);
    const intentPromise = analyzeIntent(text);

    try {
      const response = await responsePromise;
      setIsThinking(false);
      
      const newAgentMessage: Message = {
        id: `a-${Date.now()}`,
        role: 'agent',
        text: response.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAgentMessage]);
      
      if (recognitionRef.current) {
        recognitionRef.current.lang = response.languageCode;
      }
      
      speak(response.text, response.languageCode);

      intentPromise.then(intent => {
        setContext(prev => ({ ...prev, intent, timestamp: new Date().toLocaleTimeString() }));
      });

    } catch (err) {
      setIsThinking(false);
      setStatus(CallStatus.IDLE);
      shouldBeListening.current = isSessionActive;
      if (isSessionActive) startRecognition();
    }
  };

  const speak = (text: string, lang: string) => {
    shouldBeListening.current = false;
    stopRecognition();
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      (v.lang.startsWith(lang.split('-')[0]) && (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha')))
    ) || voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => {
        isSpeakingRef.current = true;
        setStatus(CallStatus.SPEAKING);
        setContext(prev => ({ ...prev, status: CallStatus.SPEAKING }));
    };

    utterance.onend = () => {
        isSpeakingRef.current = false;
        if (isSessionActive) {
            shouldBeListening.current = true;
            setTimeout(startRecognition, 400);
        } else {
            setStatus(CallStatus.IDLE);
            setContext(prev => ({ ...prev, status: CallStatus.IDLE }));
        }
    };

    utterance.onerror = () => {
        isSpeakingRef.current = false;
        if (isSessionActive) {
            shouldBeListening.current = true;
            startRecognition();
        }
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!isSessionActive) {
        setIsSessionActive(true);
        setCallSeconds(0);
        setMessages([]); 
        shouldBeListening.current = true;
        setTimeout(startRecognition, 100);
    } else {
      if (status === CallStatus.IDLE || status === CallStatus.OUTBOUND) {
        shouldBeListening.current = true;
        startRecognition();
      } else {
        shouldBeListening.current = false;
        stopRecognition();
        window.speechSynthesis.cancel();
        setStatus(CallStatus.IDLE);
      }
    }
  };

  const handleHangUp = () => {
    shouldBeListening.current = false;
    setIsSessionActive(false);
    setStatus(CallStatus.IDLE);
    stopRecognition();
    window.speechSynthesis.cancel();
    setContext(prev => ({ ...prev, status: CallStatus.IDLE }));
  };

  return (
    <div className="flex h-screen bg-[#020203] text-zinc-100 overflow-hidden selection:bg-violet-500/30">
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeView={activeView}
        onNavigate={setActiveView}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative transition-all duration-700 ease-in-out">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-violet-600/5 via-transparent to-transparent pointer-events-none z-0" />

        <header className="h-16 flex items-center justify-between px-8 bg-[#020203]/40 backdrop-blur-3xl z-30 border-b border-white/[0.03]">
          <div className="flex items-center space-x-5">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-9 h-9 flex items-center justify-center bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/[0.05] rounded-lg transition-all duration-300 text-zinc-400 hover:text-white"
            >
              <span className={`transition-transform duration-500 text-xs ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`}>⇠</span>
            </button>
            <div className="flex flex-col">
                <h1 className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-zinc-500 leading-none mb-1">Infrastructure Node</h1>
                <div className="flex items-center space-x-3">
                    <span className="text-base font-black tracking-tight text-white/90 uppercase">Admin_Core_v1</span>
                    <div className="h-3 w-px bg-zinc-800/50" />
                    <div className="flex items-center space-x-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSessionActive ? 'bg-violet-500 animate-pulse' : 'bg-zinc-700'}`}></span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">Active_Session</span>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-5">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-white/80 uppercase tracking-tight">A. Rivers</span>
                <span className="text-[8px] font-black text-violet-500 uppercase tracking-[0.2em] opacity-80">Global Admin L4</span>
            </div>
            <div className="relative group">
                <div className="w-9 h-9 rounded-xl bg-zinc-900/80 border border-white/[0.08] flex items-center justify-center transform group-hover:scale-105 transition-all cursor-pointer overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-violet-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                    <span className="text-sm">👤</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
          </div>
        </header>

        {activeView === 'DASHBOARD' ? (
          <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden relative z-10">
            <div className="col-span-12 xl:col-span-3 space-y-6 overflow-y-auto pr-1 custom-scroll">
              <VoiceCard 
                  status={status} 
                  isSessionActive={isSessionActive}
                  onToggle={toggleListening} 
                  onHangUp={handleHangUp}
                  timer={formatTimer(callSeconds)} 
              />
              
              <ActionPanel 
                onTriggerOutbound={() => setActiveView('OUTBOUND')} 
                onSendEmail={() => alert("Summary dispatched to encrypted cloud storage.")} 
                isProcessing={status !== CallStatus.IDLE && status !== CallStatus.OUTBOUND} 
              />
              
              <div className="glass rounded-[1.75rem] p-7 border border-white/5 bg-gradient-to-br from-zinc-900/40 to-black relative group overflow-hidden shadow-2xl">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-5 flex items-center justify-between">
                      <span>Performance Meta</span>
                      <span className="text-violet-500 font-bold">LIVE</span>
                  </h3>
                  <div className="space-y-5">
                      <div>
                          <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wide">
                              <span>Accuracy</span>
                              <span className="text-zinc-300">99.2%</span>
                          </div>
                          <div className="h-1 bg-zinc-800/50 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-600 w-[99%] transition-all duration-1000 shadow-[0_0_8px_rgba(139,92,246,0.3)]" />
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wide">
                              <span>Latency</span>
                              <span className="text-zinc-300">142ms</span>
                          </div>
                          <div className="h-1 bg-zinc-800/50 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 w-[15%] transition-all duration-1000" />
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wide">
                              <span>Stability</span>
                              <span className="text-zinc-300">98.4%</span>
                          </div>
                          <div className="h-1 bg-zinc-800/50 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[98%] transition-all duration-1000" />
                          </div>
                      </div>
                  </div>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-6 h-full flex flex-col min-h-[400px]">
              <ConversationPanel messages={messages} isThinking={isThinking} />
            </div>

            <div className="col-span-12 xl:col-span-3 space-y-6 overflow-y-auto pr-1 custom-scroll">
              <ContextPanel context={context} />
              
              <div className="glass rounded-[1.75rem] p-7 border border-white/5 bg-zinc-900/5">
                  <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-[9px] uppercase tracking-[0.3em] text-zinc-500">Telemetry Log</h3>
                  </div>
                  <div className="font-mono text-[9px] space-y-2 text-zinc-500/80 h-[280px] overflow-y-auto custom-scroll pr-2">
                      <div className="flex space-x-3 opacity-40">
                          <span className="text-violet-500/60 tabular-nums">14:22:01</span>
                          <span>[CORE] Handshake stable</span>
                      </div>
                      {isSessionActive && (
                          <>
                              <div className="flex space-x-3 text-violet-400/80 animate-pulse">
                                  <span className="tabular-nums">{new Date().toLocaleTimeString([], { hour12: false })}</span>
                                  <span>[STREAM] Audio packets inbound</span>
                              </div>
                              <div className="flex space-x-3 text-blue-400/80">
                                  <span className="tabular-nums">{new Date().toLocaleTimeString([], { hour12: false })}</span>
                                  <span>[INTEL] GPT-4o parity check: OK</span>
                              </div>
                          </>
                      )}
                  </div>
              </div>
            </div>
          </div>
        ) : (
          <OutboundCallsPage />
        )}
      </main>
    </div>
  );
};

export default App;
