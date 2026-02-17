
import React, { useState, useEffect, useMemo } from 'react';
import { Profile, Transaction, AppState, DEFAULT_CATEGORIES, DateRange, Category, CurrencyConfig, Reminder, NotificationSettings } from './types';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import ProfileSelector from './components/ProfileSelector';
import AddTransactionModal from './components/AddTransactionModal';
import AIInsights from './components/AIInsights';
import Sidebar from './components/Sidebar';
import CategoryManager from './components/CategoryManager';
import DateRangeSelector from './components/DateRangeSelector';
import ReminderManager from './components/ReminderManager';
import SettingsManager from './components/SettingsManager';
import Onboarding from './components/Onboarding';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const initialState: AppState = {
      profiles: [],
      activeProfileId: '',
      transactions: [],
      reminders: [],
      notificationSettings: {
        enableDailySummary: true,
        enableBudgetAlerts: true,
        enableReminders: true,
        sounds: { reminder: undefined, budget: undefined, system: undefined }
      },
      categories: DEFAULT_CATEGORIES,
      theme: 'dark',
      accentColor: '99, 102, 241',
      currency: { symbol: '৳', position: 'prefix' }
    };

    try {
      const saved = localStorage.getItem('khoroch_khata_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed };
      }
    } catch (e) {
      console.error("Failed to parse local storage data:", e);
    }
    return initialState;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'insights' | 'categories' | 'reminders' | 'settings'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [quickPaymentCategory, setQuickPaymentCategory] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange>({ type: 'this_month' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    localStorage.setItem('khoroch_khata_data', JSON.stringify(state));
    document.body.classList.toggle('light', state.theme === 'light');
    document.documentElement.style.setProperty('--accent-color', state.accentColor);
  }, [state]);

  const activeProfile = useMemo(() => 
    state.profiles.find(p => p.id === state.activeProfileId) || state.profiles[0],
    [state.profiles, state.activeProfileId]
  );

  const filteredTransactions = useMemo(() => {
    if (!activeProfile) return [];
    let list = state.transactions.filter(t => t.profileId === state.activeProfileId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return list.filter(t => {
      const tDate = new Date(t.date);
      switch (dateRange.type) {
        case 'today': return tDate >= today;
        case 'this_week': {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          return tDate >= startOfWeek;
        }
        case 'this_month': return tDate >= new Date(now.getFullYear(), now.getMonth(), 1);
        case 'last_month': {
          const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const end = new Date(now.getFullYear(), now.getMonth(), 0);
          return tDate >= start && tDate <= end;
        }
        case 'custom': {
          const start = dateRange.start ? new Date(dateRange.start) : null;
          const end = dateRange.end ? new Date(dateRange.end) : null;
          return (!start || tDate >= start) && (!end || tDate <= end);
        }
        default: return true;
      }
    });
  }, [state.transactions, state.activeProfileId, dateRange, activeProfile]);

  const generateId = () => {
    return typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);
  };

  const handleSyncCodeImport = (code: string) => {
    try {
      const decoded = decodeURIComponent(escape(atob(code)));
      const parsed = JSON.parse(decoded);
      if (parsed.profiles && Array.isArray(parsed.profiles)) {
        setState(parsed);
        alert('সফলভাবে আপনার সব একাউন্টের ডাটা সিঙ্ক হয়েছে!');
      } else {
        throw new Error("Invalid sync code");
      }
    } catch (err) {
      alert('ভুল সিঙ্ক কোড! দয়া করে সঠিক কোডটি কপি করে আনুন।');
    }
  };

  const saveTransaction = (data: any) => {
    if (editingTransaction) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === editingTransaction.id ? { ...data, id: t.id, profileId: t.profileId } : t)
      }));
    } else {
      const newT = { ...data, id: generateId(), profileId: state.activeProfileId };
      setState(prev => ({ ...prev, transactions: [newT, ...prev.transactions] }));
    }
    setEditingTransaction(null);
    setQuickPaymentCategory(undefined);
  };

  const handleQuickPayment = (category: string) => {
    setQuickPaymentCategory(category);
    setIsAddModalOpen(true);
  };

  const handleBackup = () => {
    try {
      const data = JSON.stringify(state, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `khoroch-khata-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('সফলভাবে ব্যাকআপ ফাইলটি ডাউনলোড হয়েছে!');
    } catch (err) {
      alert('ব্যাকআপ নিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string);
          if (imported.profiles && Array.isArray(imported.profiles)) {
            setState(imported);
            alert('রিস্টোর সফল হয়েছে!');
          } else {
            throw new Error("Invalid format");
          }
        } catch (err) {
          alert('ভুল ফাইল! সঠিক ব্যাকআপ ফাইল নির্বাচন করুন।');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleOnboardingComplete = (name: string, avatar: string, image: string | undefined, currencySymbol: string, email: string, password?: string) => {
    const existingProfile = state.profiles.find(p => p.email === email);
    
    if (existingProfile) {
      setState(prev => ({
        ...prev,
        activeProfileId: existingProfile.id
      }));
    } else {
      const newProfile: Profile = {
        id: generateId(),
        name,
        avatar,
        image,
        email, 
        password,
        color: '99, 102, 241',
        budgets: {}
      };
      setState(prev => ({
        ...prev,
        profiles: [...prev.profiles, newProfile],
        activeProfileId: newProfile.id,
        currency: { ...prev.currency, symbol: currencySymbol }
      }));
    }
    setIsLoggedIn(true);
  };

  const handleResetPassword = (email: string, newPassword: string) => {
    setState(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.email === email ? { ...p, password: newPassword } : p)
    }));
  };

  if (!isLoggedIn) {
    return <Onboarding onComplete={handleOnboardingComplete} onResetPassword={handleResetPassword} existingProfiles={state.profiles} onImportSyncCode={handleSyncCodeImport} />;
  }

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${state.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} activeProfile={activeProfile} />
      <main className="flex-1 overflow-y-auto pb-28 md:pb-0">
        <header className="px-5 py-6 md:px-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 sticky top-0 z-30 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl theme-bg-accent-soft flex items-center justify-center theme-text-accent">
              <i className="fa-solid fa-wallet text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text tracking-tight">খরচ খাতা</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Smart Wallet Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            {(activeTab === 'dashboard' || activeTab === 'transactions') && (
              <DateRangeSelector currentRange={dateRange} onRangeChange={setDateRange} />
            )}
            <button onClick={() => setState(p => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' }))} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-800 border border-white/5 theme-text-accent"><i className={`fa-solid ${state.theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i></button>
            <ProfileSelector profiles={state.profiles} activeId={state.activeProfileId} onSwitch={id => setState(p => ({ ...p, activeProfileId: id }))} onAdd={(n, a, c, i) => { const np = { id: generateId(), name: n, avatar: a, color: c, budgets: {}, image: i }; setState(p => ({ ...p, profiles: [...p.profiles, np], activeProfileId: np.id })); }} onUpdate={(id, n, a, c, i) => setState(p => ({ ...p, profiles: p.profiles.map(pr => pr.id === id ? { ...pr, name: n, avatar: a, color: c, image: i } : pr) }))} onDelete={id => setState(p => { const filtered = p.profiles.filter(pr => pr.id !== id); return { ...p, profiles: filtered, activeProfileId: filtered[0]?.id || '' }; })} />
          </div>
        </header>
        <div className="p-5 md:p-10 max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard transactions={filteredTransactions} profile={activeProfile} categories={state.categories} onEdit={setEditingTransaction} onQuickPayment={handleQuickPayment} currency={state.currency} />}
          {activeTab === 'transactions' && <TransactionList transactions={filteredTransactions} onDelete={id => setState(p => ({ ...p, transactions: p.transactions.filter(t => t.id !== id) }))} onEdit={t => { setEditingTransaction(t); setIsAddModalOpen(true); }} categories={state.categories} currency={state.currency} />}
          {activeTab === 'insights' && <AIInsights transactions={filteredTransactions} currency={state.currency} />}
          {activeTab === 'reminders' && <ReminderManager reminders={state.reminders.filter(r => r.profileId === state.activeProfileId)} notificationSettings={state.notificationSettings} onAdd={(t, d, rt) => { const nr = { id: generateId(), profileId: state.activeProfileId, task: t, date: d, remindTime: rt, isCompleted: false }; setState(p => ({ ...p, reminders: [...p.reminders, nr] })); }} onDelete={id => setState(p => ({ ...p, reminders: p.reminders.filter(r => r.id !== id) }))} onToggle={id => setState(p => ({ ...p, reminders: p.reminders.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r) }))} />}
          {activeTab === 'categories' && <CategoryManager categories={state.categories} onUpdate={(ty, cs) => setState(p => ({ ...p, categories: { ...p.categories, [ty]: cs } }))} activeProfile={activeProfile} onUpdateBudget={(c, a) => setState(p => ({ ...p, profiles: p.profiles.map(pr => pr.id === state.activeProfileId ? { ...pr, budgets: { ...pr.budgets, [c]: a } } : pr) }))} currency={state.currency} />}
          {activeTab === 'settings' && <SettingsManager currency={state.currency} accentColor={state.accentColor} notificationSettings={state.notificationSettings} onUpdateNotifications={n => setState(p => ({ ...p, notificationSettings: n }))} onUpdateAccent={c => setState(p => ({ ...p, accentColor: c }))} onUpdateCurrency={c => setState(p => ({ ...p, currency: c }))} onBackup={handleBackup} onRestore={handleRestore} onImportSyncCode={handleSyncCodeImport} fullState={state} />}
        </div>
      </main>
      <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 theme-bg-accent rounded-[2rem] shadow-2xl flex items-center justify-center z-40 group ring-4 theme-ring-accent transition-all"><i className="fa-solid fa-plus text-2xl text-white group-hover:rotate-90 transition-transform"></i></button>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-22 bg-slate-900/90 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center px-4 z-40 pb-2">
        {[
          { id: 'dashboard', icon: 'fa-chart-pie', label: 'হোম' }, 
          { id: 'transactions', icon: 'fa-list-ul', label: 'লেনদেন' }, 
          { id: 'insights', icon: 'fa-wand-magic-sparkles', label: 'AI পরামর্শ' }, 
          { id: 'reminders', icon: 'fa-bell', label: 'ঘণ্টা' }, 
          { id: 'settings', icon: 'fa-gear', label: 'সেটিিংস' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`relative flex flex-col items-center py-2 transition-all ${activeTab === tab.id ? 'theme-text-accent scale-110' : 'text-slate-500'}`}>
            <i className={`fa-solid ${tab.icon} text-lg mb-1.5 ${tab.id === 'insights' ? 'text-purple-400' : ''}`}></i>
            <span className="text-[9px] font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
      {isAddModalOpen && <AddTransactionModal onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); setQuickPaymentCategory(undefined); }} onSubmit={saveTransaction} categories={state.categories} transactions={state.transactions} initialData={editingTransaction || undefined} currency={state.currency} defaultCategory={quickPaymentCategory} />}
    </div>
  );
};

export default App;
