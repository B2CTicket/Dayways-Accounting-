
import React, { useState } from 'react';
import { DateFilterType, DateRange } from '../types';

interface DateRangeSelectorProps {
  currentRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ currentRange, onRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options: { value: DateFilterType; label: string }[] = [
    { value: 'today', label: 'আজ' },
    { value: 'this_week', label: 'এই সপ্তাহ' },
    { value: 'this_month', label: 'এই মাস' },
    { value: 'last_month', label: 'গত মাস' },
    { value: 'all', label: 'সব সময়' },
    { value: 'custom', label: 'কাস্টম রেঞ্জ' },
  ];

  const handlePresetClick = (type: DateFilterType) => {
    if (type === 'custom') {
      setIsOpen(true);
      return;
    }
    onRangeChange({ type });
    setIsOpen(false);
  };

  const currentLabel = options.find(o => o.value === currentRange.type)?.label || 'ফিল্টার';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all text-xs font-medium text-slate-300"
      >
        <i className="fa-solid fa-calendar-days text-indigo-400"></i>
        <span>{currentLabel}</span>
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2 shadow-2xl z-50 border border-slate-700 animate-in zoom-in-95 duration-200">
          <div className="space-y-1">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handlePresetClick(opt.value)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  currentRange.type === opt.value ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {currentRange.type === 'custom' && (
            <div className="mt-2 p-3 border-t border-slate-700 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">শুরু</label>
                <input
                  type="date"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={currentRange.start || ''}
                  onChange={(e) => onRangeChange({ ...currentRange, start: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">শেষ</label>
                <input
                  type="date"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={currentRange.end || ''}
                  onChange={(e) => onRangeChange({ ...currentRange, end: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
