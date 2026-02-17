
import React from 'react';
import { Profile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  activeProfile: Profile;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, activeProfile }) => {
  const tabs = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: 'fa-gauge-high' },
    { id: 'transactions', label: 'লেনদেন ইতিহাস', icon: 'fa-receipt' },
    { id: 'reminders', label: 'রিমাইন্ডার', icon: 'fa-bell' },
    { id: 'insights', label: 'AI পরামর্শ', icon: 'fa-wand-magic-sparkles' },
    { id: 'categories', label: 'ক্যাটাগরি সেটিংস', icon: 'fa-tags' },
    { id: 'settings', label: 'অ্যাপ সেটিংস', icon: 'fa-gear' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6">
      <div className="mb-10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-[1.2rem] overflow-hidden bg-slate-800 flex items-center justify-center text-2xl border border-white/10 shadow-xl">
          {activeProfile.image ? (
            <img src={activeProfile.image} alt="" className="w-full h-full object-cover" />
          ) : (
            activeProfile.avatar
          )}
        </div>
        <div>
          <h2 className="font-extrabold text-slate-100 text-sm truncate max-w-[120px]">{activeProfile.name}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Smart Track</span>
          </div>
        </div>
      </div>

      <nav className="space-y-1.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all border ${
              activeTab === tab.id 
                ? 'bg-indigo-600/10 theme-text-accent theme-border-accent shadow-sm' 
                : 'text-slate-500 border-transparent hover:bg-white/[0.03] hover:text-slate-300'
            } ${tab.id === 'insights' && activeTab !== 'insights' ? 'relative overflow-hidden' : ''}`}
          >
            <i className={`fa-solid ${tab.icon} w-5 text-base ${tab.id === 'insights' ? 'text-purple-400' : ''}`}></i>
            <span className="font-bold text-[13px]">{tab.label}</span>
            {tab.id === 'insights' && (
               <span className="absolute top-1 right-2 flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
               </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="p-4 rounded-3xl bg-indigo-500/[0.03] border border-white/[0.03]">
          <p className="text-[10px] theme-text-accent font-bold uppercase tracking-widest mb-1.5">সিস্টেম তথ্য</p>
          <p className="text-[11px] text-slate-500 leading-relaxed italic">আপনার ডাটা আপনার হাতে। নিয়মিত ব্যাকআপ নিন।</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
