
import React, { useRef } from 'react';
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
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ 
  currency, accentColor, notificationSettings, onUpdateNotifications, onUpdateAccent, onUpdateCurrency, onBackup, onRestore 
}) => {
  const backupInputRef = useRef<HTMLInputElement>(null);
  const soundRefs = {
    reminder: useRef<HTMLInputElement>(null),
    budget: useRef<HTMLInputElement>(null),
    system: useRef<HTMLInputElement>(null),
  };
  
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

  const handleSoundUpload = (type: keyof NotificationSettings['sounds'], e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("ফাইলটি ২ মেগাবাইটের বেশি বড় হওয়া যাবে না।");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateNotifications({
          ...notificationSettings,
          sounds: { ...notificationSettings.sounds, [type]: reader.result as string }
        });
      };
      reader.readAsDataURL(file);
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

      {/* 🔔 Notification Control Center */}
      <div className="glass-card rounded-[3.5rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 theme-bg-accent opacity-5 blur-[80px] -mr-16 -mt-16"></div>
        <div className="flex items-center gap-4 mb-10">
           <div className="w-14 h-14 rounded-2xl theme-bg-accent-soft theme-text-accent flex items-center justify-center text-xl shadow-inner">
              <i className="fa-solid fa-bell-ring animate-pulse"></i>
           </div>
           <div>
              <h3 className="text-2xl font-bold text-slate-100">নোটিফিকেশন ও সাউন্ড</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">আপনার এলার্ট পছন্দমতো সাজান</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Preferences Column */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 mb-6">প্রেফারেন্স সেটিংস</h4>
            
            {[
              { id: 'enableDailySummary', label: 'দৈনিক খরচের সামারি', icon: 'fa-chart-mixed' },
              { id: 'enableBudgetAlerts', label: 'বাজেট সীমা অতিক্রম এলার্ট', icon: 'fa-triangle-exclamation' },
              { id: 'enableReminders', label: 'নির্ধারিত রিমাইন্ডার এলার্ট', icon: 'fa-clock' }
            ].map(pref => (
              <div key={pref.id} className="flex items-center justify-between p-5 rounded-3xl bg-slate-950/40 border border-white/5 group-hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${notificationSettings[pref.id as keyof NotificationSettings] ? 'theme-bg-accent-soft theme-text-accent' : 'bg-slate-900 text-slate-700'}`}>
                    <i className={`fa-solid ${pref.icon}`}></i>
                  </div>
                  <span className={`text-sm font-bold ${notificationSettings[pref.id as keyof NotificationSettings] ? 'text-slate-100' : 'text-slate-500'}`}>{pref.label}</span>
                </div>
                <button 
                  onClick={() => togglePreference(pref.id as any)}
                  className={`w-12 h-7 rounded-full relative transition-all duration-500 ${notificationSettings[pref.id as keyof NotificationSettings] ? 'theme-bg-accent' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-md ${notificationSettings[pref.id as keyof NotificationSettings] ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>

          {/* Sounds Column */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 mb-6">সাউন্ড গ্যালারি</h4>
            
            {[
              { id: 'reminder', label: 'রিমাইন্ডার সাউন্ড', icon: 'fa-music' },
              { id: 'budget', label: 'বাজেট এলার্ট সাউন্ড', icon: 'fa-waveform-lines' },
              { id: 'system', label: 'সিস্টেম নোটিফিকেশন', icon: 'fa-volume' }
            ].map(sound => (
              <div key={sound.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-900/30 border border-slate-800 transition-all">
                <div className="flex items-center gap-4">
                  <i className={`fa-solid ${sound.icon} text-slate-600 text-xs`}></i>
                  <span className="text-xs font-bold text-slate-400">{sound.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="file" ref={soundRefs[sound.id as keyof typeof soundRefs]} className="hidden" accept="audio/*" onChange={(e) => handleSoundUpload(sound.id as any, e)} />
                  {notificationSettings.sounds[sound.id as keyof NotificationSettings['sounds']] ? (
                    <div className="flex gap-2">
                       <button className="w-8 h-8 rounded-lg theme-bg-accent text-white text-[10px]" onClick={() => {
                          const audio = new Audio(notificationSettings.sounds[sound.id as keyof NotificationSettings['sounds']]!);
                          audio.play();
                       }}><i className="fa-solid fa-play"></i></button>
                       <button onClick={() => onUpdateNotifications({...notificationSettings, sounds: {...notificationSettings.sounds, [sound.id]: undefined}})} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 text-[10px]"><i className="fa-solid fa-rotate-left"></i></button>
                    </div>
                  ) : (
                    <button onClick={() => soundRefs[sound.id as keyof typeof soundRefs].current?.click()} className="text-[10px] font-bold theme-text-accent uppercase hover:underline">আপলোড</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🎨 Theme Customization Section */}
      <div className="glass-card rounded-[3.5rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-bg-accent-soft opacity-10 blur-[100px] -mr-32 -mt-32"></div>
        <h3 className="text-2xl font-bold mb-10 flex items-center gap-4">
          <div className="w-1.5 h-8 theme-bg-accent rounded-full"></div>
          অ্যাপ সিগনেচার কালার
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {themeColors.map(color => (
            <button
              key={color.value}
              onClick={() => onUpdateAccent(color.value)}
              className={`flex flex-col items-center gap-4 p-5 rounded-[2.5rem] border transition-all duration-500 ${
                accentColor === color.value 
                  ? 'border-white bg-white/10 scale-105 shadow-2xl' 
                  : 'border-transparent hover:bg-white/5'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl ${color.class} shadow-2xl shadow-black/40 rotate-12`}></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 💳 Currency Settings Section */}
      <div className="glass-card rounded-[3.5rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[120px] -ml-32 -mt-32"></div>
        <h3 className="text-2xl font-bold mb-10 flex items-center gap-4">
          <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
          কারেন্সি কনফিগারেশন
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] ml-2">গ্লোবাল কারেন্সি</p>
            <div className="grid grid-cols-1 gap-3">
              {commonCurrencies.map(cur => (
                <button
                  key={cur.symbol}
                  onClick={() => onUpdateCurrency({ ...currency, symbol: cur.symbol })}
                  className={`flex items-center justify-between px-8 py-5 rounded-3xl border transition-all duration-500 ${
                    currency.symbol === cur.symbol 
                      ? 'bg-amber-600/10 border-amber-500/50 text-amber-400 shadow-xl' 
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                >
                  <span className="text-sm font-bold">{cur.label}</span>
                  <span className="text-2xl font-black">{cur.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-end gap-10">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] ml-2">চিহ্নের অবস্থান</p>
              <div className="relative flex p-1.5 bg-slate-900 rounded-[2rem] border border-white/5 w-full h-16">
                <div 
                  className={`absolute inset-y-1.5 w-[48%] theme-bg-accent rounded-2xl shadow-2xl shadow-indigo-500/20 transition-transform duration-700 ${
                    currency.position === 'suffix' ? 'translate-x-[104%]' : 'translate-x-0'
                  }`}
                ></div>
                <button
                  onClick={() => onUpdateCurrency({ ...currency, position: 'prefix' })}
                  className={`relative z-10 flex-1 py-4 text-xs font-black uppercase transition-colors duration-500 ${currency.position === 'prefix' ? 'text-white' : 'text-slate-600'}`}
                >
                  আগে ({currency.symbol})
                </button>
                <button
                  onClick={() => onUpdateCurrency({ ...currency, position: 'suffix' })}
                  className={`relative z-10 flex-1 py-4 text-xs font-black uppercase transition-colors duration-500 ${currency.position === 'suffix' ? 'text-white' : 'text-slate-600'}`}
                >
                  পরে ({currency.symbol})
                </button>
              </div>
            </div>

            <div className="p-10 rounded-[2.5rem] theme-bg-accent-soft border-2 border-dashed theme-border-accent flex flex-col items-center justify-center gap-3">
               <p className="text-[9px] theme-text-accent font-black uppercase tracking-[0.5em]">লাইভ প্রিভিউ</p>
               <p className="text-4xl font-black gradient-text">
                 {currency.position === 'prefix' ? `${currency.symbol} ৫,৬০০` : `৫,৬০০ ${currency.symbol}`}
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* 💾 Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={onBackup}
          className="flex items-center gap-6 p-8 rounded-[3rem] glass-card border-2 border-dashed border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all group shadow-xl"
        >
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 group-hover:rotate-12 transition-transform">
            <i className="fa-solid fa-cloud-arrow-down text-2xl"></i>
          </div>
          <div className="text-left">
            <p className="font-black text-lg text-slate-100 uppercase tracking-tight">ব্যাকআপ ফাইল</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Export Data</p>
          </div>
        </button>

        <button 
          onClick={() => backupInputRef.current?.click()}
          className="flex items-center gap-6 p-8 rounded-[3rem] glass-card border-2 border-dashed border-indigo-500/20 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all group shadow-xl"
        >
          <div className="w-16 h-16 rounded-3xl theme-bg-accent flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 group-hover:-rotate-12 transition-transform">
            <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
          </div>
          <div className="text-left">
            <p className="font-black text-lg text-slate-100 uppercase tracking-tight">রিস্টোর ডাটা</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Import File</p>
          </div>
          <input type="file" ref={backupInputRef} className="hidden" accept=".json" onChange={onRestore} />
        </button>
      </div>
    </div>
  );
};

export default SettingsManager;
