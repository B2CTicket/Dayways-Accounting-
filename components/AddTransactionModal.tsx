
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TransactionType, Category, Transaction, CurrencyConfig, PaymentMethod } from '../types';

interface AddTransactionModalProps {
  onClose: () => void;
  onSubmit: (transaction: { type: TransactionType, amount: number, category: string, date: string, note: string, paymentMethod: PaymentMethod }) => void;
  categories: {
    income: Category[];
    expense: Category[];
  };
  transactions: Transaction[];
  initialData?: Transaction;
  currency: CurrencyConfig;
  defaultCategory?: string;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onSubmit, categories, transactions, initialData, currency, defaultCategory }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || defaultCategory || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(initialData?.note || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || 'Cash');
  const [showLookupHint, setShowLookupHint] = useState(false);
  const [historicalMatch, setHistoricalMatch] = useState<Transaction | null>(null);

  const paymentMethods: { value: PaymentMethod, label: string, icon: string }[] = [
    { value: 'Cash', label: 'ক্যাশ', icon: 'fa-money-bill-wave' },
    { value: 'bKash', label: 'বিকাশ', icon: 'fa-mobile-screen-button' },
    { value: 'Nagad', label: 'নগদ', icon: 'fa-mobile-button' },
    { value: 'Bank', label: 'ব্যাংক', icon: 'fa-building-columns' },
  ];

  const keywordMap: Record<TransactionType, Record<string, string[]>> = {
    expense: {
      'খাদ্য': ['খাবার', 'রেস্টুরেন্ট', 'বিরিয়ানি', 'লাঞ্চ', 'ডিনার', 'পিৎজা', 'বার্গার', 'নাস্তা', 'food', 'restaurant', 'lunch', 'dinner', 'pizza', 'burger', 'nasta', 'snacks', 'kfc', 'cafe', 'biryani', 'tehari', 'tea', 'coffee', 'চা', 'কফি', 'মিষ্টি'],
      'পরিবহন': ['রিকশা', 'বাস', 'ট্রেন', 'সিএনজি', 'উবার', 'পাঠাও', 'ভাড়া', 'তেল', 'অকটেন', 'rickshaw', 'bus', 'train', 'cng', 'uber', 'pathao', 'bike', 'transport', 'fare', 'fuel', 'petrol', 'parking', 'টোল', 'toll'],
      'বাজার': ['চাল', 'ডাল', 'তেল', 'সবজি', 'মাছ', 'মাংস', 'মুদি', 'groceries', 'bazaar', 'market', 'super shop', 'egg', 'chicken', 'fish', 'meat', 'potato', 'swapno', 'shwapno', 'agora', 'meenabazar', 'লবণ', 'চিনি', 'পেয়াজ', 'মরিচ'],
      'বিল': ['কারেন্ট', 'বিদ্যুৎ', 'গ্যাস', 'ওয়াসা', 'पानी', 'ইন্টারনেট', 'ওয়াইফাই', 'রিচার্জ', 'লোড', 'bill', 'electricity', 'gas', 'water', 'internet', 'wifi', 'recharge', 'load', 'utility', 'desco', 'dpdc', 'titas', 'broadband', 'btcl'],
      'ডিপিএস পেমেন্ট': ['dps', 'সঞ্চয়', 'deposit', 'savings', 'ডিপিএস'],
      'লোন পেমেন্ট': ['loan', 'কিস্তি', 'emi', 'ঋণ', 'brac', 'asha', 'installment'],
      'বিনোদন': ['সিনেমা', 'মুভি', 'গেম', 'আড্ডা', 'ভ্রমণ', 'ট্যুর', 'ঘুরতে', 'পার্ক', 'movie', 'cinema', 'game', 'netflix', 'tour', 'travel', 'park', 'concert', 'পিকনিক', 'picnic', 'zoo'],
      'শিক্ষা': ['বই', 'খাতা', 'কলম', 'টিউশন', 'ফিস', 'কোর্স', 'পড়াশোনা', 'স্কুল', 'কলেজ', 'ইউনিভার্সিটি', 'book', 'pen', 'tuition', 'fees', 'course', 'education', 'school', 'college', 'udemy', 'exam', 'খাতা'],
      'স্বাস্থ্য': ['ঔষধ', 'ডাক্তার', 'ফি', 'চেকআপ', 'মেডিসিন', 'হাসপাতাল', 'ক্লিনিক', 'medicine', 'doctor', 'health', 'checkup', 'hospital', 'clinic', 'pharma', 'surgery', 'tablet', 'সিরাপ', 'napa', 'প্যারাসিটামল'],
    },
    income: {
      'বেতন': ['বেতন', 'স্যালারি', 'অফিস', 'চাকরি', 'salary', 'office', 'paycheck', 'work', 'job', 'remittance', 'রেমিট্যান্স'],
      'বোনাস': ['বোনাস', 'ইভেন্ট', 'উৎসব', 'bonus', 'extra', 'festival', 'eid', 'ইদ'],
      'উপহার': ['উপহার', 'গিফট', 'হাদিয়া', 'সালামি', 'বখশিশ', 'gift', 'present', 'salami', 'tips', 'prize', 'পারিতোষিক'],
      'বিনিয়োগ': ['শেয়ার', 'লাভ', 'ডিভিডেন্ড', 'সুদ', 'profit', 'investment', 'stock', 'dividend', 'interest', 'profit share'],
    }
  };

  const smartLookup = useCallback((currentNote: string, currentType: TransactionType) => {
    if (!currentNote.trim()) {
      setHistoricalMatch(null);
      setShowLookupHint(false);
      return;
    }

    const lowerNote = currentNote.toLowerCase();

    // 1. Historical Lookup (Most Powerful)
    const match = transactions.find(t => 
      t.note && t.note.toLowerCase().includes(lowerNote)
    );

    if (match) {
      setHistoricalMatch(match);
      // Don't auto-fill everything immediately to avoid jarring UX, 
      // but suggest it prominently.
    } else {
      setHistoricalMatch(null);
    }

    // 2. Keyword Map Lookup
    const typeKeywords = keywordMap[currentType];
    let found = false;
    for (const [categoryName, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => lowerNote.includes(keyword.toLowerCase()))) {
        if (categories[currentType].some(c => c.name === categoryName)) {
          if (selectedCategory !== categoryName) {
            setSelectedCategory(categoryName);
            setShowLookupHint(true);
            setTimeout(() => setShowLookupHint(false), 2000);
          }
          found = true;
          break;
        }
      }
    }
  }, [categories, transactions, selectedCategory]);

  const applyHistoricalMatch = () => {
    if (historicalMatch) {
      setAmount(historicalMatch.amount.toString());
      setSelectedCategory(historicalMatch.category);
      setType(historicalMatch.type);
      setPaymentMethod(historicalMatch.paymentMethod);
      setHistoricalMatch(null);
    }
  };

  useEffect(() => {
    if (defaultCategory) {
      setSelectedCategory(defaultCategory);
    }
  }, [defaultCategory]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNote(val);
    smartLookup(val, type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedCategory) return;
    onSubmit({
      type,
      amount: parseFloat(amount),
      category: selectedCategory,
      date,
      note,
      paymentMethod
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative glass-card w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-white/5 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-4 duration-500 max-h-[95vh] overflow-y-auto custom-scrollbar">
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6"></div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black">{initialData ? 'লেনদেন আপডেট' : 'নতুন লেনদেন'}</h2>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">স্মার্ট ইনপুট সক্রিয়</p>
               {showLookupHint && (
                 <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-black animate-pulse">ক্যাটাগরি সাজেস্ট করা হয়েছে!</span>
               )}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Historical Match Hint */}
        {historicalMatch && (
          <div className="mb-6 animate-in zoom-in-95 duration-300">
            <button 
              type="button"
              onClick={applyHistoricalMatch}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                  <i className="fa-solid fa-wand-sparkles text-xs"></i>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">স্মার্ট লুকআপ রেজাল্ট</p>
                  <p className="text-xs font-bold text-slate-300">আগের মতো "{historicalMatch.category}" ({currency.symbol}{historicalMatch.amount}) পূরণ করুন?</p>
                </div>
              </div>
              <i className="fa-solid fa-arrow-right text-indigo-400 group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex p-1 bg-slate-950/50 rounded-2xl gap-1 border border-white/5">
            <button
              type="button"
              onClick={() => { setType('expense'); setSelectedCategory(''); }}
              className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${
                type === 'expense' ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              খরচ
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setSelectedCategory(''); }}
              className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${
                type === 'income' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              আয়
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2">লেনদেন পরিমাণ</label>
              <div className="relative group">
                <span className={`absolute ${currency.position === 'prefix' ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 text-3xl font-black transition-colors`}>{currency.symbol}</span>
                <input
                  required
                  autoFocus
                  type="number"
                  placeholder="0.00"
                  className={`w-full bg-slate-900/60 border-2 border-slate-800/50 rounded-3xl ${currency.position === 'prefix' ? 'pl-16 pr-8' : 'pl-8 pr-16'} py-6 text-4xl font-black focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner placeholder:text-slate-800`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">পেমেন্ট মেথড</label>
              <div className="grid grid-cols-4 gap-2">
                {paymentMethods.map(pm => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setPaymentMethod(pm.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all active:scale-90 ${
                      paymentMethod === pm.value 
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400 shadow-lg' 
                        : 'bg-slate-900/40 border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-400'
                    }`}
                  >
                    <i className={`fa-solid ${pm.icon} text-xs`}></i>
                    <span className="text-[9px] font-bold">{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 mb-2">তারিখ</label>
                  <div className="relative">
                    <i className="fa-solid fa-calendar-day absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                    <input
                      type="date"
                      className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl pl-14 pr-4 py-4 text-xs font-bold focus:outline-none focus:border-indigo-500/50 text-slate-300"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 mb-2">নোট / বিবরণ</label>
                  <div className="relative">
                    <i className="fa-solid fa-quote-left absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                    <input
                      type="text"
                      placeholder="বিস্তারিত লিখুন (যেমন: বাজার)..."
                      className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl pl-14 pr-4 py-4 text-xs font-bold focus:outline-none focus:border-indigo-500/50 text-slate-300"
                      value={note}
                      onChange={handleNoteChange}
                    />
                  </div>
                </div>
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 mb-4">ক্যাটাগরি নির্বাচন</label>
              <div className="grid grid-cols-4 gap-3">
                {categories[type].map(cat => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-3xl border transition-all duration-300 relative group active:scale-95 ${
                        isSelected 
                          ? (type === 'income' 
                              ? 'bg-emerald-600/10 border-emerald-500/60 text-emerald-400 scale-105 shadow-[0_15px_30px_-5px_rgba(16,185,129,0.3)]' 
                              : 'bg-rose-600/10 border-rose-500/60 text-rose-400 scale-105 shadow-[0_15px_30px_-5px_rgba(244,63,94,0.3)]') 
                          : 'bg-slate-900/30 border-slate-800/50 text-slate-600 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-400'
                      }`}
                    >
                      {/* Selection Ambient Glow */}
                      {isSelected && (
                        <div className={`absolute inset-0 blur-xl opacity-20 rounded-full ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      )}
                      
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base transition-all duration-300 ${isSelected ? 'theme-bg-accent-soft theme-text-accent animate-selected-icon' : 'bg-slate-800/50 group-hover:scale-110'}`}>
                        <i className={`fa-solid ${cat.icon}`}></i>
                      </div>
                      <span className="text-[10px] font-black text-center truncate w-full relative z-10">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full ${initialData ? 'bg-emerald-600' : 'theme-bg-accent'} text-white font-black uppercase tracking-[0.2em] text-xs py-6 rounded-[2rem] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 hover:opacity-90 h-[72px]`}
          >
            <i className={`fa-solid ${initialData ? 'fa-floppy-disk' : 'fa-circle-plus'} text-base`}></i>
            {initialData ? 'আপডেট সেভ করুন' : 'নতুন হিসাব যোগ করুন'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
