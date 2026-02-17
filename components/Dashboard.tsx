
import React from 'react';
import { Transaction, Profile, Category, CurrencyConfig } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  profile: Profile;
  categories: {
    income: Category[];
    expense: Category[];
  };
  onEdit: (transaction: Transaction) => void;
  onQuickPayment: (category: string) => void;
  currency: CurrencyConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, profile, categories, onEdit, onQuickPayment, currency }) => {
  const stats = React.useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const formatValue = (val: number) => {
    const formatted = val.toLocaleString('bn-BD');
    return currency.position === 'prefix' ? `${currency.symbol} ${formatted}` : `${formatted} ${currency.symbol}`;
  };

  const now = new Date();
  const currentMonthTransactions = React.useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [transactions, now.getMonth(), now.getFullYear()]);

  const categoryData = React.useMemo(() => {
    const data: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const budgetProgress = React.useMemo(() => {
    const budgets: Record<string, number> = profile.budgets || {};
    const expenseSummary: Record<string, number> = {};
    currentMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
      expenseSummary[t.category] = (expenseSummary[t.category] || 0) + t.amount;
    });

    return Object.entries(budgets)
      .filter(([_, limit]) => (limit as number) > 0)
      .map(([cat, limit]) => {
        const spent = expenseSummary[cat] || 0;
        const limitValue = limit as number;
        const percent = Math.min((spent / limitValue) * 100, 100);
        return { category: cat, limit: limitValue, spent, percent };
      });
  }, [profile.budgets, currentMonthTransactions]);

  const COLORS = ['#818cf8', '#c084fc', '#f472b6', '#fb7185', '#fb923c', '#fbbf24', '#4ade80', '#2dd4bf'];

  const getCategoryIcon = (categoryName: string, type: 'income' | 'expense') => {
    const cat = categories[type].find(c => c.name === categoryName);
    return cat?.icon || 'fa-tag';
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-7 rounded-[2.5rem] relative overflow-hidden group border-indigo-500/20 shadow-indigo-500/10 shadow-2xl">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-slate-400 text-[11px] uppercase font-bold tracking-[0.2em] mb-3">মোট ব্যয় (খরচ)</p>
          <h3 className="text-5xl font-extrabold font-heading tracking-tight text-white mb-2">{formatValue(stats.expense)}</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">This Month Activity</span>
          </div>
        </div>
        
        <div className="glass-card p-7 rounded-[2.5rem] border-emerald-500/10">
          <p className="text-slate-400 text-[11px] uppercase font-bold tracking-[0.2em] mb-3">মোট আয়</p>
          <h3 className="text-4xl font-bold font-heading tracking-tight text-emerald-400">{formatValue(stats.income)}</h3>
          <div className="mt-4 flex items-center gap-2">
            <i className="fa-solid fa-arrow-trend-up text-emerald-500 text-[10px]"></i>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Income Growth</span>
          </div>
        </div>

        <div className="glass-card p-7 rounded-[2.5rem] border-blue-500/10 sm:col-span-2 lg:col-span-1">
          <p className="text-slate-400 text-[11px] uppercase font-bold tracking-[0.2em] mb-3">বর্তমান ব্যালেন্স</p>
          <h3 className={`text-4xl font-bold font-heading tracking-tight ${stats.balance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
            {formatValue(stats.balance)}
          </h3>
          <div className="mt-4 flex items-center gap-2">
            <i className="fa-solid fa-wallet text-blue-500 text-[10px]"></i>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Current Savings</span>
          </div>
        </div>
      </div>

      {/* Quick Actions (DPS & Loan) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button 
          onClick={() => onQuickPayment('ডিপিএস পেমেন্ট')}
          className="glass-card p-5 rounded-[2rem] flex flex-col items-center gap-3 border-amber-500/20 hover:bg-amber-500/10 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-piggy-bank"></i>
          </div>
          <span className="text-xs font-bold text-slate-300">ডিপিএস জমা</span>
        </button>
        <button 
          onClick={() => onQuickPayment('লোন পেমেন্ট')}
          className="glass-card p-5 rounded-[2rem] flex flex-col items-center gap-3 border-rose-500/20 hover:bg-rose-500/10 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-hand-holding-dollar"></i>
          </div>
          <span className="text-xs font-bold text-slate-300">লোন পেমেন্ট</span>
        </button>
        <button 
          onClick={() => onQuickPayment('বিল')}
          className="glass-card p-5 rounded-[2rem] flex flex-col items-center gap-3 border-cyan-500/20 hover:bg-cyan-500/10 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <span className="text-xs font-bold text-slate-300">বিল পেমেন্ট</span>
        </button>
        <button 
          onClick={() => onQuickPayment('বাজার')}
          className="glass-card p-5 rounded-[2rem] flex flex-col items-center gap-3 border-emerald-500/20 hover:bg-emerald-500/10 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-cart-shopping"></i>
          </div>
          <span className="text-xs font-bold text-slate-300">দৈনিক বাজার</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Breakdown */}
        <div className="glass-card p-8 rounded-[3rem]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold font-heading flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              ব্যয়ের ধরন
            </h4>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="h-64 w-full sm:w-1/2">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-700">
                  <i className="fa-solid fa-chart-pie text-4xl mb-3 opacity-30"></i>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No Data</p>
                </div>
              )}
            </div>
            <div className="w-full sm:w-1/2 space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] transition-all border border-white/[0.05]">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-lg" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm font-semibold text-slate-300 truncate">{entry.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{formatValue(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budgets */}
        <div className="glass-card p-8 rounded-[3rem]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold font-heading flex items-center gap-3">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
              বাজেট ট্র্যাকিং
            </h4>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{now.toLocaleDateString('bn-BD', { month: 'long' })}</span>
          </div>
          <div className="space-y-7 max-h-64 overflow-y-auto pr-3 custom-scrollbar">
            {budgetProgress.length > 0 ? (
              budgetProgress.map(item => (
                <div key={item.category} className="space-y-3 group">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                        <i className={`fa-solid ${getCategoryIcon(item.category, 'expense')} text-xs`}></i>
                      </div>
                      <span className="font-bold text-sm text-slate-200">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-300">{formatValue(item.spent)}</span>
                      <span className="text-[10px] font-bold text-slate-500"> / {formatValue(item.limit)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        item.percent > 90 ? 'bg-rose-500' : 
                        item.percent > 70 ? 'bg-amber-500' : 
                        'bg-indigo-500'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest italic">বাজেট সেট করা নেই</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-8 rounded-[3rem] overflow-hidden">
        <h4 className="text-xl font-bold font-heading mb-8 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
          সাম্প্রতিক লেনদেন
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.slice(0, 6).map(t => (
            <div 
              key={t.id} 
              className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.06] transition-all cursor-pointer group" 
              onClick={() => onEdit(t)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <i className={`fa-solid ${getCategoryIcon(t.category, t.type)}`}></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200 mb-0.5">{t.category}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{new Date(t.date).toLocaleDateString('bn-BD')}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-bold">{t.paymentMethod}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={`text-lg font-bold font-heading ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.type === 'income' ? '+' : '-'} {formatValue(t.amount)}
                </p>
                <i className="fa-solid fa-chevron-right text-[10px] text-slate-700 group-hover:text-slate-400 group-hover:translate-x-1 transition-all"></i>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="col-span-2 py-16 text-center text-slate-700 font-bold uppercase tracking-[0.3em]">
              লেনদেন নেই
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
