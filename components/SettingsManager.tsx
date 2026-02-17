
import React, { useRef, useState } from 'react';
import { CurrencyConfig, NotificationSettings } from '../types';

interface SettingsManagerProps {
  currency: CurrencyConfig;
  accentColor: string;
  notificationSettings: NotificationSettings;
  onUpdateNotifications: (settings: NotificationSettings) => void;
  onUpdateAccent: (color: string) => void;
  onUpdateCurrency: (currency: CurrencyConfig) => void;
  onBackup: () => void;
  onRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportSyncCode: (code: string) => void;
  fullState: any;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ 
  currency, accentColor, notificationSettings, onUpdateNotifications, onUpdateAccent, onUpdateCurrency, onBackup, onRestore, onImportSyncCode, fullState 
}) => {
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [syncCode, setSyncCode] = useState('');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const commonCurrencies = [
    { symbol: '৳', label: 'টাকা (BDT)' },
    { symbol: '$', label: 'Dollar (USD)' },
    { symbol: '₹', label: 'Rupee (INR)' },
    { symbol: '€', label: 'Euro (EUR)' },
  ];

  const themeColors = [
    { name: 'Indigo', value: '99, 102, 241', class: 'bg-indigo-500' },
    { name: 'Emerald', value: '16, 185, 129', class: 'bg-emerald-500' },
    { name: 'Rose', value: '244, 63, 94', class: 'bg-rose-500' },
    { name: 'Amber', value: '245, 158, 11', class: 'bg-amber-500' },
    { name: 'Cyan', value: '6, 182, 212', class: 'bg-cyan-500' },
    { name: 'Violet', value: '139, 92, 246', class: 'bg-violet-500' },
  ];

  const generateSyncCode = () => {
    const jsonStr = JSON.stringify(fullState);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    setSyncCode(encoded);
    setShowSyncModal(true);
  };

  const copySyncCode = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    const inputCode = prompt("আপনার অন্য ডিভাইসের 'সিঙ্ক কোড'টি এখানে পেস্ট করুন:");
    if (inputCode) {
      onImportSyncCode(inputCode);
    }
  };

  const togglePreference = (key: keyof Omit<NotificationSettings, 'sounds'>) => {
    onUpdateNotifications({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-6 duration-700 pb-28 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black gradient-text tracking-tighter">কন্ট্রোল সেন্টার</h2>
      </div>

      {/* 🔄 Sync & Cloud Center */}
      <div className="glass-card rounded-[3.5rem] border border-indigo-500/20 p-10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-indigo-600/5 to-transparent">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-600/30">
              <i className="fa-solid fa-arrows-rotate animate-spin-slow"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">ডিভাইস সিনক্রোনাইজেশন</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">অন্য ডিভাইসে ডাটা ট্রান্সফার করুন</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={generateSyncCode}
              className="flex-1 md:flex-none px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg active:scale-95"
            >
              কোড জেনারেট করুন
            </button>
            <button 
              onClick={handleImport}
              className="flex-1 md:flex-none px-8 py-4 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-widest border border-white/5 hover:bg-slate-700 transition-all shadow-lg active:scale-95"
            >
              কোড ইমপোর্ট করুন
            </button>
          </div>
        </div>
      </div>

      {/* 🎨 Theme & Appearance */}
      <div className="glass-card rounded-[3.5rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-4 text-slate-100">
          <i className="fa-solid fa-palette text-indigo-400"></i> অ্যাপ কালার থিম
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {themeColors.map(color => (
            <button
              key={color.value}
              onClick={() => onUpdateAccent(color.value)}
              className={`flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all ${
                accentColor === color.value ? 'border-white bg-white/5' : 'border-transparent'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${color.class} shadow-lg`}></div>
              <span className="text-[9px] font-black text-slate-500 uppercase">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 💾 Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={onBackup}
          className="flex items-center gap-6 p-8 rounded-[3rem] glass-card border border-emerald-500/20 hover:bg-emerald-500/5 transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-xl">
            <i className="fa-solid fa-file-export"></i>
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-100">ব্যাকআপ ফাইল ডাউনলোড</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">JSON format</p>
          </div>
        </button>

        <button 
          onClick={() => backupInputRef.current?.click()}
          className="flex items-center gap-6 p-8 rounded-[3rem] glass-card border border-indigo-500/20 hover:bg-indigo-500/5 transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl">
            <i className="fa-solid fa-file-import"></i>
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-100">ফাইল থেকে রিস্টোর</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Select JSON file</p>
          </div>
          <input type="file" ref={backupInputRef} className="hidden" accept=".json" onChange={onRestore} />
        </button>
      </div>

      {/* Sync Code Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-4 mb-8">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-400 text-3xl">
                <i className="fa-solid fa-key-skeleton"></i>
              </div>
              <h3 className="text-2xl font-black text-white">আপনার সিঙ্ক কোড</h3>
              <p className="text-sm text-slate-400 leading-relaxed px-4">
                এই কোডটি কপি করে অন্য ফোনের অ্যাপে পেস্ট করলে আপনার সব লেনদেন এবং প্রোফাইল সেখানে চলে যাবে। এটি কারো সাথে শেয়ার করবেন না।
              </p>
            </div>
            
            <div className="relative mb-8">
              <textarea 
                readOnly
                value={syncCode}
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-[10px] font-mono text-indigo-300 break-all focus:outline-none resize-none"
              />
              <button 
                onClick={copySyncCode}
                className={`absolute bottom-4 right-4 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
              >
                {copied ? <><i className="fa-solid fa-check mr-2"></i> কপিড!</> : <><i className="fa-solid fa-copy mr-2"></i> কপি করুন</>}
              </button>
            </div>

            <button 
              onClick={() => setShowSyncModal(false)}
              className="w-full py-5 rounded-3xl bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-all"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsManager;
