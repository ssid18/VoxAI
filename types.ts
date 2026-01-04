
export type Role = 'user' | 'agent';

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
}

export enum CallStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  OUTBOUND = 'OUTBOUND'
}

export interface CallContext {
  intent: string;
  email: string;
  status: CallStatus;
  timestamp: string;
}

export type View = 'DASHBOARD' | 'OUTBOUND';

export interface RecipientStatus {
  id: string;
  phone: string;
  state: 'idle' | 'calling' | 'connected' | 'completed' | 'failed';
  transcript: string[];
}
