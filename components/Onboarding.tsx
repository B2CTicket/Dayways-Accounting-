
import React, { useState, useRef } from 'react';
import { Profile } from '../types';

interface OnboardingProps {
  onComplete: (name: string, avatar: string, image: string | undefined, currency: string, email: string, password?: string) => void;
  onResetPassword: (email: string, newPassword: string) => void;
  existingProfiles: Profile[];
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onResetPassword, existingProfiles }) => {
  const [mode, setMode] = useState<'signup' | 'login' | 'recovery'>('login');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('😊');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState('৳');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatars = ['😊', '😎', '💼', '🏠', '💰', '📉', '🛒', '🍔', '✈️', '🎮'];
  const currencies = [
    { s: '৳', l: 'টাকা (BDT)' },
    { s: '$', l: 'Dollar (USD)' },
    { s: '₹', l: 'Rupee (INR)' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('সঠিক ইমেল ঠিকানা দিন।');
      return;
    }

    if (mode === 'login') {
      if (password.length < 6) {
        setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        return;
      }

      const profile = existingProfiles.find((p: any) => p.email === email);
      
      if (profile) {
        if (profile.password === password) {
           onComplete(profile.name, profile.avatar, profile.image, '৳', email, password);
        } else {
           setError('পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।');
        }
      } else {
        setError('এই ইমেল দিয়ে কোনো একাউন্ট পাওয়া যায়নি।');
      }
    } else if (mode === 'signup') {
      if (password.length < 6) {
        setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        return;
      }
      if (existingProfiles.some(p => p.email === email)) {
        setError('এই ইমেল দিয়ে ইতিমধ্যে একাউন্ট রয়েছে।');
        return;
      }
      setStep(2);
    } else if (mode === 'recovery') {
      const profile = existingProfiles.find(p => p.email === email);
      if (profile) {
        setStep(2); // Go to Reset Password step
      } else {
        setError('এই ইমেলটি আমাদের রেকর্ডে নেই।');
      }
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড দুটি মিলছে না।');
      return;
    }

    onResetPassword(email, password);
    setSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন লগইন করুন।');
    setTimeout(() => {
      setMode('login');
      setStep(1);
      setSuccess('');
      setPassword('');
      setConfirmPassword('');
    }, 2000);
  };

  const finish = () => {
    onComplete(name, avatar, image, currency, email, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-6 overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative glass-card w-full max-w-lg rounded-[3.5rem] p-8 sm:p-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-500">
        
        {mode === 'signup' && (
          <div className="flex gap-2 mb-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}></div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto text-indigo-400 text-3xl mb-4">
                <i className={`fa-solid ${mode === 'login' ? 'fa-lock' : mode === 'signup' ? 'fa-user-plus' : 'fa-shield-keyhole'} animate-pulse`}></i>
              </div>
              <h2 className="text-3xl font-black gradient-text">
                {mode === 'login' ? 'স্বাগতম!' : mode === 'signup' ? 'নতুন একাউন্ট' : 'পাসওয়ার্ড উদ্ধার'}
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                {mode === 'recovery' ? 'আপনার রেজিস্টার্ড ইমেলটি দিন' : 'নিরাপদে হিসাব রাখুন খরচ খাতায়'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">ইমেল এড্রেস</label>
                <div className="relative">
                  <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                  <input
                    required
                    type="email"
                    placeholder="example@mail.com"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl pl-14 pr-6 py-5 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {mode !== 'recovery' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">পাসওয়ার্ড</label>
                  <div className="relative">
                    <i className="fa-solid fa-key absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl pl-14 pr-14 py-5 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-700"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {mode === 'login' && (
                    <div className="text-right px-2">
                      <button 
                        type="button"
                        onClick={() => { setMode('recovery'); setError(''); }}
                        className="text-[10px] font-bold text-indigo-400 hover:underline"
                      >
                        পাসওয়ার্ড ভুলে গেছেন?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="text-rose-500 text-[10px] font-bold text-center animate-bounce">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all"
              >
                {mode === 'login' ? 'লগইন করুন' : mode === 'signup' ? 'পরবর্তী ধাপ' : 'ভেরিফাই করুন'} <i className="fa-solid fa-arrow-right ml-2"></i>
              </button>
            </form>

            <div className="text-center">
              <button 
                onClick={() => {
                   setMode(mode === 'login' ? 'signup' : 'login');
                   setError('');
                }}
                className="text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors"
              >
                {mode === 'login' ? 'নতুন একাউন্ট খুলতে চান? সাইন আপ করুন' : 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন'}
              </button>
            </div>
          </div>
        )}

        {mode === 'recovery' && step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
             <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-emerald-600/20 rounded-3xl flex items-center justify-center mx-auto text-emerald-400 text-3xl mb-4">
                <i className="fa-solid fa-lock-open"></i>
              </div>
              <h2 className="text-2xl font-black text-white">নতুন পাসওয়ার্ড</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">একটি শক্তিশালী পাসওয়ার্ড সেট করুন</p>
            </div>

            <form onSubmit={handleReset} className="space-y-5">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">নতুন পাসওয়ার্ড</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all text-white shadow-inner"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">নিশ্চিত করুন</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all text-white shadow-inner"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
               </div>

               {error && <p className="text-rose-500 text-[10px] font-bold text-center">{error}</p>}
               {success && <p className="text-emerald-500 text-[10px] font-bold text-center">{success}</p>}

               <button
                  type="submit"
                  disabled={!!success}
                  className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  পাসওয়ার্ড আপডেট করুন
                </button>
            </form>
          </div>
        )}

        {mode === 'signup' && step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white">আপনার পরিচয়</h2>
              <p className="text-xs text-slate-500 mt-2">অ্যাপে আপনাকে কি নামে ডাকব?</p>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] ml-2">আপনার নাম</label>
              <input
                autoFocus
                type="text"
                placeholder="আপনার পূর্ণ নাম..."
                className="w-full bg-slate-900/60 border-2 border-slate-800 rounded-3xl px-8 py-5 text-lg font-bold focus:outline-none focus:border-indigo-500 transition-all text-white shadow-inner"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setStep(3)}
              disabled={!name.trim()}
              className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50 transition-all"
            >
              চালিয়ে যান
            </button>
          </div>
        )}

        {mode === 'signup' && step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white">প্রোফাইল ছবি</h2>
              <p className="text-xs text-slate-500 mt-2">আপনার প্রোফাইলের জন্য একটি ছবি দিন</p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-[3rem] bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all overflow-hidden relative"
              >
                {image ? (
                  <img src={image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <i className="fa-solid fa-camera text-slate-600 text-2xl mb-1"></i>
                    <p className="text-[9px] font-bold text-slate-600 uppercase">আপলোড</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

              <div className="grid grid-cols-5 gap-3 p-4 bg-slate-900/40 rounded-3xl">
                {avatars.map(a => (
                  <button
                    key={a}
                    onClick={() => { setAvatar(a); setImage(undefined); }}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl text-2xl transition-all ${avatar === a && !image ? 'bg-indigo-600 shadow-lg scale-110' : 'hover:bg-slate-800'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setStep(4)} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl">পরবর্তী ধাপ</button>
          </div>
        )}

        {mode === 'signup' && step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white">কারেন্সি সেটআপ</h2>
              <p className="text-xs text-slate-500 mt-2">হিসাবের জন্য মুদ্রা বেছে নিন</p>
            </div>

            <div className="space-y-3">
              {currencies.map(cur => (
                <button
                  key={cur.s}
                  onClick={() => setCurrency(cur.s)}
                  className={`w-full flex items-center justify-between px-8 py-5 rounded-3xl border-2 transition-all ${currency === cur.s ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-slate-900/60 border-transparent text-slate-500 hover:bg-slate-800'}`}
                >
                  <span className="font-bold text-sm">{cur.l}</span>
                  <span className="text-2xl font-black">{cur.s}</span>
                </button>
              ))}
            </div>

            <button
              onClick={finish}
              className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-circle-check"></i> সেটআপ সম্পন্ন করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
