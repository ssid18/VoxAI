
import React from 'react';
import { View } from '../types';

const NavItem: React.FC<{ 
  icon: string; 
  label: string; 
  active?: boolean; 
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ icon, label, active, isCollapsed, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center space-x-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
      active 
        ? 'bg-violet-600/10 text-violet-400 shadow-[inset_0_0_12px_rgba(139,92,246,0.08)]' 
        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40'
    } ${isCollapsed ? 'justify-center px-0' : ''}`}>
    <span className={`text-base transition-all duration-300 filter grayscale opacity-70 ${active ? 'grayscale-0 opacity-100 scale-110' : 'group-hover:grayscale-0 group-hover:opacity-90'} ${isCollapsed ? 'scale-110' : ''}`}>{icon}</span>
    {!isCollapsed && (
      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-500">
        {label}
      </span>
    )}
  </div>
);

interface SidebarProps {
  isOpen: boolean;
  activeView: View;
  onNavigate: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeView, onNavigate }) => {
  return (
    <aside className={`${isOpen ? 'w-60' : 'w-20'} border-r border-white/[0.04] flex flex-col h-screen bg-[#020203] z-40 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
      <div className={`p-8 pb-10 flex items-center ${isOpen ? 'justify-start' : 'justify-center px-0'}`}>
        <div className="flex items-center space-x-3 group cursor-pointer shrink-0" onClick={() => onNavigate('DASHBOARD')}>
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center font-black text-white shadow-[0_4px_16px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-all duration-500 shrink-0">V</div>
          {isOpen && (
            <span className="text-xl font-black tracking-tighter text-white uppercase animate-in fade-in zoom-in-95 duration-500">
              VoxAI
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        <NavItem 
          icon="💎" 
          label="Dashboard" 
          active={activeView === 'DASHBOARD'} 
          isCollapsed={!isOpen} 
          onClick={() => onNavigate('DASHBOARD')}
        />
        <NavItem 
          icon="🛰️" 
          label="Outbound" 
          active={activeView === 'OUTBOUND'} 
          isCollapsed={!isOpen} 
          onClick={() => onNavigate('OUTBOUND')}
        />
        <NavItem icon="🌊" label="Analytics" isCollapsed={!isOpen} onClick={() => {}} />
        <NavItem icon="🎭" label="Agents" isCollapsed={!isOpen} onClick={() => {}} />
        <NavItem icon="⚙️" label="Config" isCollapsed={!isOpen} onClick={() => {}} />
      </nav>

      <div className={`p-6 transition-all duration-500 ${!isOpen ? 'px-2' : ''}`}>
        <div className={`glass rounded-2xl p-4 border border-white/[0.05] bg-zinc-950 transition-all duration-500 overflow-hidden ${!isOpen ? 'opacity-0 translate-y-4 pointer-events-none h-0 p-0' : 'opacity-100 translate-y-0'}`}>
          <div className="flex items-center justify-between mb-2">
             <span className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-600">Core_Status</span>
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          </div>
          <p className="text-[10px] font-bold text-zinc-400">Stable Node</p>
          <p className="text-[8px] font-mono text-zinc-700 mt-1 uppercase tracking-tighter">BUILD_1.2.9_PRO</p>
        </div>
        {!isOpen && (
            <div className="flex justify-center py-2 animate-in fade-in duration-700">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
            </div>
        )}
      </div>
    </aside>
  );
};
