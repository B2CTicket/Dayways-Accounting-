
import React, { useState, useEffect, useRef } from 'react';
import { Reminder, NotificationSettings } from '../types';

interface ReminderManagerProps {
  reminders: Reminder[];
  notificationSettings: NotificationSettings;
  onAdd: (task: string, date: string, remindTime?: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const ReminderManager: React.FC<ReminderManagerProps> = ({ reminders, notificationSettings, onAdd, onDelete, onToggle }) => {
  const [task, setTask] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('09:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (!notificationSettings.enableReminders) return;
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    } else if (!notificationSettings.sounds.reminder) {
      // Beep sound fallback
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 440;
      gain.gain.setValueAtTime(0.5, context.currentTime);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.5);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!notificationSettings.enableReminders) return;

      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      reminders.forEach(r => {
        if (!r.isCompleted && r.date === currentDate && r.remindTime === currentTime) {
          playSound();
          if (Notification.permission === "granted") {
            new Notification("রিমাইন্ডার এলার্ট", {
              body: r.task,
              icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png"
            });
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders, notificationSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    onAdd(task, date, time);
    setTask('');
  };

  const setQuickDate = (daysFromNow: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    setDate(target.toISOString().split('T')[0]);
  };

  const timeSlots = [
    { label: 'সকাল', time: '08:00', icon: 'fa-sun-bright' },
    { label: 'দুপুর', time: '13:00', icon: 'fa-sun' },
    { label: 'বিকাল', time: '17:00', icon: 'fa-sunset' },
    { label: 'রাত', time: '21:00', icon: 'fa-moon-stars' },
  ];

  const sortedReminders = [...reminders].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return (a.remindTime || '').localeCompare(b.remindTime || '');
  });

  const isToday = (d: string) => d === new Date().toISOString().split('T')[0];
  const isTomorrow = (d: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d === tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-28 max-w-5xl mx-auto">
      {notificationSettings.sounds.reminder && <audio ref={audioRef} src={notificationSettings.sounds.reminder} preload="auto" />}
      
      {/* 🔮 Header: Schedule Hub */}
      <div className="glass-card p-10 rounded-[3.5rem] border theme-border-accent relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 theme-bg-accent-soft blur-[120px] -mr-32 -mt-32 opacity-40"></div>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-[2.5rem] theme-bg-accent flex items-center justify-center text-white text-5xl shadow-2xl shadow-indigo-500/20 rotate-6">
              <i className="fa-solid fa-calendar-circle-plus"></i>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center border-2 border-slate-950 theme-text-accent">
               <i className="fa-solid fa-sparkles text-sm"></i>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-black gradient-text leading-tight">স্মার্ট সিডিউল গেটওয়ে</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">ভবিষ্যতের পরিকল্পনা করুন নিশ্চিন্তে</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 space-y-10">
          <div className="space-y-3">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] ml-2">কাজের শিরোনাম</label>
             <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="যেমন: মাসিক ফ্ল্যাট ভাড়া দিতে হবে..."
                  className="w-full bg-slate-950/40 border-2 border-slate-800/50 rounded-[2.5rem] px-10 py-7 text-xl font-bold focus:outline-none theme-border-accent focus:bg-slate-900 transition-all shadow-inner placeholder:text-slate-700"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                />
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <div className="space-y-6">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] ml-2 block">সময় এবং স্লট</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {timeSlots.map(slot => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => setTime(slot.time)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-3xl border transition-all ${time === slot.time ? 'theme-bg-accent text-white border-transparent shadow-lg scale-105' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <i className={`fa-solid ${slot.icon} text-lg`}></i>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{slot.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="relative flex items-center bg-slate-950/80 border border-slate-800 rounded-3xl p-3 pr-5">
                    <div className="w-12 h-12 rounded-2xl theme-bg-accent-soft theme-text-accent flex items-center justify-center shrink-0">
                       <i className="fa-solid fa-calendar-check"></i>
                    </div>
                    <div className="flex-1 flex flex-col pl-4">
                       <span className="text-[9px] font-bold text-slate-600 uppercase">তারিখ</span>
                       <input type="date" className="bg-transparent text-sm font-bold theme-text-accent focus:outline-none w-full cursor-pointer" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                 </div>

                 <div className="relative flex items-center bg-slate-950/80 border border-slate-800 rounded-3xl p-3 pr-5">
                    <div className="w-12 h-12 rounded-2xl theme-bg-accent-soft theme-text-accent flex items-center justify-center shrink-0">
                       <i className="fa-solid fa-clock-three"></i>
                    </div>
                    <div className="flex-1 flex flex-col pl-4">
                       <span className="text-[9px] font-bold text-slate-600 uppercase">সময়</span>
                       <input type="time" className="bg-transparent text-sm font-bold theme-text-accent focus:outline-none w-full cursor-pointer" value={time} onChange={(e) => setTime(e.target.value)} />
                    </div>
                 </div>
              </div>

              <div className="flex gap-2 pl-2">
                 <button type="button" onClick={() => setQuickDate(0)} className={`px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${isToday(date) ? 'theme-bg-accent text-white shadow-xl' : 'bg-slate-900 text-slate-500 border border-white/5 hover:border-slate-700'}`}>আজ</button>
                 <button type="button" onClick={() => setQuickDate(1)} className={`px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${isTomorrow(date) ? 'theme-bg-accent text-white shadow-xl' : 'bg-slate-900 text-slate-500 border border-white/5 hover:border-slate-700'}`}>আগামীকাল</button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full theme-bg-accent text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all shadow-2xl shadow-indigo-500/30 active:scale-[0.98] flex items-center justify-center gap-4 h-[76px]"
            >
              <i className="fa-solid fa-bolt-auto text-base"></i>
              কনফার্ম শিডিউল
            </button>
          </div>
        </form>
      </div>

      {/* 📍 List Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-6 mb-4">
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em]">শিডিউল টাইমলাইন</h3>
           <div className="w-24 h-1 bg-slate-900 rounded-full"></div>
        </div>

        {sortedReminders.length > 0 ? (
          sortedReminders.map((r, idx) => (
            <div 
              key={r.id} 
              className={`relative group animate-in slide-in-from-bottom-8 duration-700`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`glass-card p-8 rounded-[3rem] border transition-all duration-500 flex flex-col sm:flex-row items-center gap-8 ${r.isCompleted ? 'opacity-40 grayscale-[0.8] border-white/5' : 'theme-border-accent hover:border-opacity-100 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-slate-900/60 to-slate-950/60'}`}>
                
                <button 
                  onClick={() => onToggle(r.id)}
                  className={`shrink-0 w-16 h-16 rounded-[1.8rem] flex items-center justify-center border-2 transition-all duration-700 ${r.isCompleted ? 'theme-bg-accent border-transparent text-white scale-90' : 'bg-slate-950 border-slate-800 text-slate-800 hover:theme-border-accent hover:text-indigo-400'}`}
                >
                  <i className={`fa-solid ${r.isCompleted ? 'fa-check-double text-2xl' : 'fa-circle-dashed text-2xl'}`}></i>
                </button>

                <div className="flex-1 text-center sm:text-left">
                  <h4 className={`text-xl font-bold tracking-tight transition-all duration-500 ${r.isCompleted ? 'line-through text-slate-600' : 'text-slate-100'}`}>
                    {r.task}
                  </h4>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-3">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/60 border border-white/5">
                      <i className={`fa-solid fa-calendar-star text-[11px] ${isToday(r.date) ? 'theme-text-accent' : 'text-slate-500'}`}></i>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isToday(r.date) ? 'আজ' : isTomorrow(r.date) ? 'কাল' : new Date(r.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    {r.remindTime && (
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${r.isCompleted ? 'bg-slate-800/30' : 'theme-bg-accent-soft border theme-border-accent'}`}>
                        <i className="fa-solid fa-bell-on text-[10px] theme-text-accent animate-swing"></i>
                        <span className="text-[10px] font-black theme-text-accent tracking-widest">{r.remindTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => onDelete(r.id)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <i className="fa-solid fa-trash-can text-base"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center glass-card rounded-[4rem] border-2 border-dashed border-slate-800 bg-slate-950/20">
            <div className="w-24 h-24 bg-slate-900/50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-800 shadow-inner">
              <i className="fa-solid fa-calendar-xmark text-4xl"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-600 mb-2">শিডিউল একদম ফাঁকা</h3>
            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.5em]">নতুন কোনো পরিকল্পনা যোগ করুন</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderManager;
