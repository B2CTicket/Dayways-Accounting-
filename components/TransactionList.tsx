
import React, { useState, useMemo } from 'react';
import { Transaction, Category, CurrencyConfig } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  categories: {
    income: Category[];
    expense: Category[];
  };
  currency: CurrencyConfig;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit, categories, currency }) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const formatValue = (val: number) => {
    const formatted = val.toLocaleString('bn-BD');
    return currency.position === 'prefix' ? `${currency.symbol} ${formatted}` : `${formatted} ${currency.symbol}`;
  };

  const availableCategories = useMemo(() => {
    if (typeFilter === 'all') {
      return [...categories.income, ...categories.expense];
    }
    return categories[typeFilter];
  }, [typeFilter, categories]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesSearch = searchTerm === '' || 
        (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const tDate = new Date(t.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      const matchesStartDate = !start || tDate >= start;
      const matchesEndDate = !end || tDate <= end;

      return matchesType && matchesCategory && matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm, startDate, endDate]);

  const getCategoryIcon = (categoryName: string, type: 'income' | 'expense') => {
    const cat = categories[type].find(c => c.name === categoryName);
    return cat?.icon || 'fa-tag';
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'bKash': return 'fa-mobile-screen-button';
      case 'Nagad': return 'fa-mobile-button';
      case 'Bank': return 'fa-building-columns';
      default: return 'fa-money-bill-wave';
    }
  };

  const handleShare = async (t: Transaction) => {
    const dateStr = new Date(t.date).toLocaleDateString('bn-BD');
    const summary = `📌 লেনদেন বিবরণ:\n🔹 টাইপ: ${t.type === 'income' ? 'আয়' : 'ব্যয়'}\n📂 ক্যাটাগরি: ${t.category}\n💰 পরিমাণ: ${formatValue(t.amount)}\n💳 পেমেন্ট: ${t.paymentMethod}\n📅 তারিখ: ${dateStr}\n(খরচ খাতা)`;
    if (navigator.share) {
      try { await navigator.share({ title: 'লেনদেন বিবরণ', text: summary }); } catch (err) {}
    } else {
      await navigator.clipboard.writeText(summary);
      alert('কপি করা হয়েছে!');
    }
  };

  const downloadCSV = () => {
    const headers = ['তারিখ', 'বিবরণ', 'ক্যাটাগরি', 'টাইপ', 'পেমেন্ট', `পরিমাণ (${currency.symbol})` ];
    const csvContent = [headers.join(','), ...filtered.map(t => [new Date(t.date).toLocaleDateString('bn-BD'), t.note || '', t.category, t.type, t.paymentMethod, t.amount].join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report-${new Date().toLocaleDateString()}.csv`;
    link.click();
    setShowExportMenu(false);
  };

  const handleReset = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">লেনদেন ইতিহাস</h2>
          <p className="text-sm text-slate-500 font-bold mt-1">সব জমানো হিসাবের তালিকা</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button onClick={() => setShowExportMenu(!showExportMenu)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all text-indigo-400 shadow-lg">
            <i className="fa-solid fa-file-export text-lg"></i>
          </button>
          {showExportMenu && (
            <div className="absolute right-8 mt-28 w-56 glass-card rounded-[2rem] p-3 shadow-2xl z-50 border border-white/5">
              <button onClick={downloadCSV} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                <i className="fa-solid fa-file-csv text-green-500 text-lg"></i> CSV ডাউনলোড
              </button>
              <button onClick={() => { window.print(); setShowExportMenu(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                <i className="fa-solid fa-print text-indigo-400 text-lg"></i> প্রিন্ট রিপোর্ট
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <div className="no-print glass-card rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Keyword Search */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">লেনদেন খুঁজুন</label>
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
              <input 
                type="text" 
                placeholder="নাম বা বিবরণ দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">লেনদেন ধরণ</label>
            <div className="relative">
              <i className="fa-solid fa-filter absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
              <select 
                value={typeFilter} 
                onChange={(e) => { setTypeFilter(e.target.value as any); setCategoryFilter('all'); }} 
                className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl pl-14 pr-10 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer shadow-inner"
              >
                <option value="all">সব ধরনের লেনদেন</option>
                <option value="income">শুধুমাত্র আয়</option>
                <option value="expense">শুধুমাত্র ব্যয়</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-xs text-slate-600 pointer-events-none"></i>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">ক্যাটাগরি</label>
            <div className="relative">
              <i className="fa-solid fa-tags absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)} 
                className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl pl-14 pr-10 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer shadow-inner"
              >
                <option value="all">সব ক্যাটাগরি</option>
                {availableCategories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-xs text-slate-600 pointer-events-none"></i>
            </div>
          </div>

          {/* Date Range Start */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">শুরু তারিখ</label>
            <div className="relative">
              <i className="fa-solid fa-calendar-day absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Date Range End */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">শেষ তারিখ</label>
            <div className="relative">
              <i className="fa-solid fa-calendar-check absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Info & Reset */}
          <div className="flex items-end justify-between gap-4 pb-1">
             <div className="px-6 py-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm shadow-sm flex-1">
               মোট: <span className="text-lg">{filtered.length}</span> টি লেনদেন
             </div>
             {(typeFilter !== 'all' || categoryFilter !== 'all' || searchTerm !== '' || startDate !== '' || endDate !== '') && (
               <button 
                onClick={handleReset}
                className="px-6 py-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black text-xs uppercase hover:bg-rose-500 hover:text-white transition-all shadow-sm"
               >
                 রিসেট
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block glass-card rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/40">
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">তারিখ</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">ক্যাটাগরি</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">বিবরণ</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">পেমেন্ট</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest text-right">পরিমাণ</th>
                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest no-print text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-slate-400">{new Date(t.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="inline-flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800/60 text-slate-200 border border-white/5 shadow-sm">
                      <i className={`fa-solid ${getCategoryIcon(t.category, t.type)} theme-text-accent`}></i> {t.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-slate-400 max-w-[200px] truncate">{t.note || '-'}</td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <i className={`fa-solid ${getPaymentIcon(t.paymentMethod)} text-indigo-400`}></i> {t.paymentMethod}
                    </span>
                  </td>
                  <td className={`px-8 py-6 whitespace-nowrap font-black text-lg text-right ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatValue(t.amount)}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap no-print">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleShare(t)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:theme-bg-accent hover:text-white transition-all"><i className="fa-solid fa-share-nodes"></i></button>
                      <button onClick={() => onEdit(t)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:theme-bg-accent hover:text-white transition-all"><i className="fa-solid fa-pen-to-square"></i></button>
                      <button onClick={() => onDelete(t.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white transition-all"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-6">
        {filtered.map(t => (
          <div key={t.id} className="glass-card p-6 rounded-[2.5rem] border border-white/5 flex flex-col gap-6 shadow-xl active:scale-[0.98] transition-transform">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} shadow-inner`}>
                  <i className={`fa-solid ${getCategoryIcon(t.category, t.type)}`}></i>
                </div>
                <div>
                  <p className="text-lg font-black text-slate-100">{t.category}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.paymentMethod}</p>
                </div>
              </div>
              <p className={`font-black text-xl ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {t.type === 'income' ? '+' : '-'} {formatValue(t.amount)}
              </p>
            </div>
            
            <div className="flex items-center justify-between py-4 border-t border-white/5">
               <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400">{new Date(t.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  {t.note && <p className="text-xs text-slate-500 italic truncate max-w-[200px]">{t.note}</p>}
               </div>
               <div className="flex gap-2">
                  <button onClick={() => handleShare(t)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 shadow-sm"><i className="fa-solid fa-share-nodes text-sm"></i></button>
                  <button onClick={() => onEdit(t)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 shadow-sm"><i className="fa-solid fa-pen-to-square text-sm"></i></button>
                  <button onClick={() => onDelete(t.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 shadow-sm"><i className="fa-solid fa-trash-can text-sm"></i></button>
               </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-20 text-center glass-card rounded-[3rem] border border-dashed border-slate-800">
             <i className="fa-solid fa-magnifying-glass-chart text-4xl text-slate-700 mb-4 opacity-30"></i>
             <p className="text-sm font-bold text-slate-600 uppercase tracking-[0.3em]">কোনো লেনদেন পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
