
import React, { useState, useRef } from 'react';

interface OnboardingProps {
  onComplete: (name: string, avatar: string, image: string | undefined, currency: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('😊');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState('৳');
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

  const nextStep = () => {
    if (step === 1 && !name.trim()) return;
    setStep(prev => prev + 1);
  };

  const finish = () => {
    onComplete(name, avatar, image, currency);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-6 overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative glass-card w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-500">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}></div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto text-indigo-400 text-3xl mb-4">
                <i className="fa-solid fa-hand-wave animate-bounce"></i>
              </div>
              <h2 className="text-3xl font-black gradient-text">স্বাগতম খরচ খাতায়!</h2>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">আপনার ডিজিটাল হিসাবের খাতা</p>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] ml-2">আপনার নাম</label>
              <input
                autoFocus
                type="text"
                placeholder="আপনার পূর্ণ নাম লিখুন..."
                className="w-full bg-slate-900/60 border-2 border-slate-800 rounded-3xl px-8 py-6 text-xl font-bold focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-700 shadow-inner"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && nextStep()}
              />
            </div>
            
            <button
              onClick={nextStep}
              disabled={!name.trim()}
              className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              পরবর্তী ধাপ <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white">প্রোফাইল সাজান</h2>
              <p className="text-xs text-slate-500 mt-2">একটি ছবি বা ইমোজি বেছে নিন</p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-[3rem] bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all overflow-hidden relative group"
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

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-slate-900 text-slate-500 py-6 rounded-[2rem] font-bold text-xs uppercase tracking-widest">পিছনে</button>
              <button onClick={nextStep} className="flex-1 bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl">চালিয়ে যান</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white">কারেন্সি সেটআপ</h2>
              <p className="text-xs text-slate-500 mt-2">আপনার পছন্দের মুদ্রার চিহ্ন বেছে নিন</p>
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

            <div className="pt-4">
              <button
                onClick={finish}
                className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-circle-check"></i> সেটআপ সম্পন্ন করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
