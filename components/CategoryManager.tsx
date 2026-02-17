
import React, { useState, useEffect } from 'react';
import { Category, Profile, CurrencyConfig } from '../types';

interface CategoryManagerProps {
  categories: {
    income: Category[];
    expense: Category[];
  };
  onUpdate: (type: 'income' | 'expense', newCategories: Category[]) => void;
  activeProfile: Profile;
  onUpdateBudget: (categoryName: string, amount: number) => void;
  currency: CurrencyConfig;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, onUpdate, activeProfile, onUpdateBudget, currency
}) => {
  const [activeType, setActiveType] = useState<'income' | 'expense'>('expense');
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('fa-tag');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
  const budgets = activeProfile.budgets || {};

  const iconList = [
    'fa-tag', 'fa-utensils', 'fa-bus', 'fa-shopping-cart', 'fa-file-invoice-dollar', 
    'fa-heartbeat', 'fa-graduation-cap', 'fa-home', 'fa-briefcase', 'fa-car', 
    'fa-gift', 'fa-wallet', 'fa-piggy-bank', 'fa-hand-holding-dollar', 'fa-phone',
    'fa-bolt', 'fa-water', 'fa-wifi', 'fa-shirt', 'fa-laptop', 'fa-film', 
    'fa-dumbbell', 'fa-stethoscope', 'fa-plane', 'fa-taxi', 'fa-receipt'
  ];

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCategory) {
      const updated = categories[activeType].map(c => 
        c.name === editingCategory ? { name: categoryName.trim(), icon: selectedIcon } : c
      );
      onUpdate(activeType, updated);
      setEditingCategory(null);
    } else {
      if (categories[activeType].some(c => c.name.toLowerCase() === categoryName.trim().toLowerCase())) {
        alert('এই নামে ক্যাটাগরি ইতিমধ্যে আছে!');
        return;
      }
      onUpdate(activeType, [...categories[activeType], { name: categoryName.trim(), icon: selectedIcon }]);
    }
    setCategoryName('');
    setSelectedIcon('fa-tag');
  };

  const handleEditInit = (cat: Category) => {
    setEditingCategory(cat.name);
    setCategoryName(cat.name);
    setSelectedIcon(cat.icon);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
    setSelectedIcon('fa-tag');
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      onUpdate(activeType, categories[activeType].filter(c => c.name !== categoryToDelete));
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-heading">ক্যাটাগরি ও বাজেট</h2>
        <div className="flex p-1 bg-slate-900 rounded-2xl gap-1 border border-white/5">
          <button
            onClick={() => { setActiveType('expense'); cancelEdit(); }}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeType === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}
          >
            ব্যয়
          </button>
          <button
            onClick={() => { setActiveType('income'); cancelEdit(); }}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeType === 'income' ? 'bg-green-500 text-white' : 'text-slate-500'}`}
          >
            আয়
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
             {editingCategory ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি যোগ করুন'}
           </h3>
           {editingCategory && (
             <button onClick={cancelEdit} className="text-[10px] text-rose-400 font-bold hover:underline">বাতিল করুন</button>
           )}
        </div>
        
        <form onSubmit={handleSaveCategory} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
               <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                  <i className={`fa-solid ${selectedIcon}`}></i>
               </div>
               <input
                type="text"
                placeholder="ক্যাটাগরির নাম..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-16 pr-6 py-4 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={`${editingCategory ? 'bg-emerald-600' : 'bg-indigo-600'} text-white px-10 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20`}
            >
              {editingCategory ? 'আপডেট' : 'যোগ করুন'}
            </button>
          </div>

          <div className="space-y-3">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">আইকন বেছে নিন</p>
             <div className="grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-14 gap-2">
                {iconList.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${selectedIcon === icon ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 scale-110 shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <i className={`fa-solid ${icon} text-sm`}></i>
                  </button>
                ))}
             </div>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories[activeType].map(cat => (
          <div key={cat.name} className="glass-card p-5 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-indigo-400 border border-white/5 shadow-inner">
                  <i className={`fa-solid ${cat.icon}`}></i>
                </div>
                <span className="font-bold text-slate-200">{cat.name}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => handleEditInit(cat)}
                  className="p-2.5 text-slate-500 hover:text-indigo-400 bg-slate-900 rounded-xl border border-white/5"
                >
                  <i className="fa-solid fa-pen text-xs"></i>
                </button>
                <button 
                  onClick={() => setCategoryToDelete(cat.name)}
                  className="p-2.5 text-slate-500 hover:text-rose-500 bg-slate-900 rounded-xl border border-white/5"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>

            {activeType === 'expense' && (
              <div className="space-y-2 px-1">
                <div className="flex justify-between items-center mb-1">
                   <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">মাসিক বাজেট</label>
                   {budgets[cat.name] > 0 && <span className="text-[9px] font-bold text-indigo-500">সেট করা আছে</span>}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{currency.symbol}</span>
                  <input
                    type="number"
                    placeholder="বাজেট নেই"
                    className="w-full bg-slate-950/30 border border-slate-800/50 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-300"
                    value={budgets[cat.name] || ''}
                    onChange={(e) => onUpdateBudget(cat.name, parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-rose-500 text-3xl">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="text-center space-y-3 mb-8">
              <h3 className="text-xl font-bold text-slate-100">নিশ্চিত তো?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                <span className="text-rose-400 font-bold">"{categoryToDelete}"</span> ক্যাটাগরি ডিলিট করলে এটি আর ফিরে পাওয়া যাবে না।
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl text-xs font-bold text-slate-400 transition-all active:scale-95"
              >
                বাতিল
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-500 py-4 rounded-2xl text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition-all active:scale-95"
              >
                ডিলিট
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
