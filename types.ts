
export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Bank';

export interface Transaction {
  id: string;
  profileId: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  note: string;
  paymentMethod: PaymentMethod;
}

export interface Reminder {
  id: string;
  profileId: string;
  task: string;
  date: string; // Format: YYYY-MM-DD
  isCompleted: boolean;
  remindTime?: string; // Format: HH:mm
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  email?: string; // Added email field
  image?: string; // Base64 image string
  color: string;
  budgets?: Record<string, number>; // Category name -> budget amount
}

export type DateFilterType = 'today' | 'this_week' | 'this_month' | 'last_month' | 'all' | 'custom';

export interface DateRange {
  type: DateFilterType;
  start?: string;
  end?: string;
}

export interface Category {
  name: string;
  icon: string;
}

export interface CurrencyConfig {
  symbol: string;
  position: 'prefix' | 'suffix';
}

export interface NotificationSettings {
  enableDailySummary: boolean;
  enableBudgetAlerts: boolean;
  enableReminders: boolean;
  sounds: {
    reminder: string | undefined;
    budget: string | undefined;
    system: string | undefined;
  };
}

export interface AppState {
  profiles: Profile[];
  activeProfileId: string;
  transactions: Transaction[];
  reminders: Reminder[];
  notificationSettings: NotificationSettings;
  categories: {
    income: Category[];
    expense: Category[];
  };
  theme: 'light' | 'dark';
  accentColor: string; // RGB values like "99, 102, 241"
  currency: CurrencyConfig;
}

export const DEFAULT_CATEGORIES: { income: Category[], expense: Category[] } = {
  expense: [
    { name: 'খাদ্য', icon: 'fa-utensils' },
    { name: 'পরিবহন', icon: 'fa-bus' },
    { name: 'বাজার', icon: 'fa-shopping-cart' },
    { name: 'বিল', icon: 'fa-file-invoice-dollar' },
    { name: 'ডিপিএস পেমেন্ট', icon: 'fa-piggy-bank' },
    { name: 'লোন পেমেন্ট', icon: 'fa-hand-holding-dollar' },
    { name: 'বিনোদন', icon: 'fa-gamepad' },
    { name: 'শিক্ষা', icon: 'fa-graduation-cap' },
    { name: 'স্বাস্থ্য', icon: 'fa-heartbeat' },
    { name: 'অন্যান্য', icon: 'fa-ellipsis' }
  ],
  income: [
    { name: 'বেতন', icon: 'fa-briefcase' },
    { name: 'বোনাস', icon: 'fa-gift' },
    { name: 'উপহার', icon: 'fa-hand-holding-heart' },
    { name: 'বিনিয়োগ', icon: 'fa-chart-line' },
    { name: 'অন্যান্য', icon: 'fa-plus-circle' }
  ]
};
