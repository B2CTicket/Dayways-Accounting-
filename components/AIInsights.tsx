
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Transaction, CurrencyConfig } from '../types';

interface AIInsightsProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
}

const AIInsights: React.FC<AIInsightsProps> = ({ transactions, currency }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const formatValue = (val: number) => {
    const formatted = val.toLocaleString('bn-BD');
    return currency.position === 'prefix' ? `${currency.symbol} ${formatted}` : `${formatted} ${currency.symbol}`;
  };

  const performDataAnalysis = () => {
    if (transactions.length === 0) return null;

    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Category totals
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    // Weekend vs Weekday analysis
    let weekendSpending = 0;
    let weekdaySpending = 0;
    
    expenses.forEach(t => {
      const day = new Date(t.date).getDay();
      const isWeekend = day === 5 || day === 6; // Friday and Saturday in BD context
      if (isWeekend) weekendSpending += t.amount;
      else weekdaySpending += t.amount;
    });

    // Daily average
    const uniqueDates = new Set(expenses.map(t => t.date)).size;
    const dailyAverage = expenses.reduce((sum, t) => sum + t.amount, 0) / (uniqueDates || 1);

    // Identify top spending category
    const topCategory = Object.entries(categoryTotals).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);

    return {
      categoryTotals,
      weekendSpending,
      weekdaySpending,
      dailyAverage,
      topCategory,
      totalExpenses: expenses.reduce((sum, t) => sum + t.amount, 0)
    };
  };

  const generateInsight = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const analysis = performDataAnalysis();
      if (!analysis) return;

      const summary = transactions.map(t => `${t.date} (${new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' })}): ${t.type} of ${formatValue(t.amount)} for ${t.category} (${t.note})`).join('\n');
      
      const prompt = `
        এখানে আমার সাম্প্রতিক আর্থিক লেনদেনের তথ্য দেওয়া হলো:
        ${summary}

        আমার খরচের ধরণ বিশ্লেষণ করে নিচের বিষয়গুলো সম্পর্কে বিস্তারিত বাংলা পরামর্শ দিন:
        ১. সাপ্তাহিক ছুটির দিন (শুক্রবার ও শনিবার) বনাম সপ্তাহের অন্য দিনগুলোর খরচের তুলনা এবং প্যাটার্ন।
        ২. কোন ক্যাটাগরিতে সবচেয়ে বেশি অপচয় হচ্ছে এবং কেন।
        ৩. খরচ কমানোর জন্য ৩টি সুনির্দিষ্ট এবং বাস্তবমুখী পদক্ষেপ।

        উত্তরটি বন্ধুত্বপূর্ণ এবং প্রেরণাদায়ক ভাষায় লিখুন। কারেন্সি হিসেবে '${currency.symbol}' ব্যবহার করুন।
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are an expert financial strategist and behavior analyst for Bangladeshi families. You analyze spending patterns to identify psychological triggers and wastage. Your advice is culturally relevant (e.g., mentioning bazaar, snacks/nasta, or family responsibilities). Speak exclusively in Bengali."
        }
      });

      setInsight(response.text || 'কোনো পরামর্শ পাওয়া যায়নি।');
      setAnalysisData(analysis);
    } catch (error) {
      console.error(error);
      setInsight('দুঃখিত, বর্তমানে AI পরামর্শ পাওয়া যাচ্ছে না। অনুগ্রহ করে পরে চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const transactionCount = transactions.length;
  const isLocked = transactionCount < 5;
  const progressPercent = Math.min((transactionCount / 5) * 100, 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/20 text-center relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full"></div>

        <div className="relative z-10">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl text-white shadow-xl transition-all duration-500 ${isLocked ? 'bg-slate-800 scale-90' : 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-600/20'}`}>
            <i className={`fa-solid ${isLocked ? 'fa-lock-open text-slate-600' : 'fa-wand-magic-sparkles animate-pulse'}`}></i>
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center gap-3">
            <i className="fa-solid fa-microchip text-indigo-400 text-2xl"></i>
            স্মার্ট খরচ বিশ্লেষণ
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
            Gemini AI আপনার লেনদেনের প্রতিটি ধাপ বিশ্লেষণ করে খুঁজে বের করবে কোথায় আপনার অজান্তেই টাকা অপচয় হচ্ছে এবং দেবে সঞ্চয়ের গোপন টিপস।
          </p>
          
          {isLocked && (
            <div className="max-w-xs mx-auto mb-8 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">ডেটা প্রগ্রেস</span>
                <span className="text-xs font-bold text-slate-500">{transactionCount} / 5</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                সঠিক প্যাটার্ন খুঁজে পাওয়ার জন্য কমপক্ষে ৫টি লেনদেনের ডাটা প্রয়োজন। আরও {5 - transactionCount}টি লেনদেন যোগ করে AI এনালাইসিস আনলক করুন!
              </p>
            </div>
          )}

          <button
            disabled={loading || isLocked}
            onClick={generateInsight}
            className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-2xl flex items-center gap-3 mx-auto ${
              loading || isLocked
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-microchip animate-spin"></i> প্যাটার্ন বিশ্লেষণ হচ্ছে...
              </>
            ) : isLocked ? (
              <>
                <i className="fa-solid fa-lock text-sm"></i> আনলক করতে ডাটা যোগ করুন
              </>
            ) : (
              <>
                <i className="fa-solid fa-sparkles"></i> এনালাইসিস শুরু করুন
              </>
            )}
          </button>
        </div>
      </div>

      {analysisData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-6 duration-500">
          <div className="glass-card p-6 rounded-3xl border-slate-800/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <i className="fa-solid fa-calendar-week"></i>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">ছুটির দিন খরচ</p>
              <p className="text-lg font-bold text-slate-200">{formatValue(analysisData.weekendSpending)}</p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl border-slate-800/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">দৈনিক গড় খরচ</p>
              <p className="text-lg font-bold text-slate-200">{formatValue(Math.round(analysisData.dailyAverage))}</p>
            </div>
          </div>
        </div>
      )}

      {insight && (
        <div className="glass-card p-8 rounded-[2.5rem] border-indigo-500/20 shadow-2xl animate-in slide-in-from-top-6 duration-700 bg-slate-900/40">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400 text-xl">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">AI জেনারেটেড রিপোর্ট</h3>
                <p className="text-xs text-slate-500">প্যাটার্ন এবং ট্রেন্ড এনালাইসিস</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500/40"></div>)}
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm sm:text-base font-ui">
              {insight}
            </div>
          </div>
          
          <div className="mt-10 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
            <div className="text-indigo-400 text-xl shrink-0">
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <p className="text-xs text-slate-400 leading-tight">
              এই এনালাইসিসটি সম্পূর্ণ আপনার নিজস্ব ডাটার উপর ভিত্তি করে তৈরি। Gemini AI আপনার গোপনীয়তা বজায় রেখে তথ্য বিশ্লেষণ করে।
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
