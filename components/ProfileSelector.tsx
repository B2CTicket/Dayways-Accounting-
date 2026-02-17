
import React, { useState, useRef } from 'react';
import { Profile } from '../types';

interface ProfileSelectorProps {
  profiles: Profile[];
  activeId: string;
  onSwitch: (id: string) => void;
  onAdd: (name: string, avatar: string, color: string, image?: string) => void;
  onUpdate: (id: string, name: string, avatar: string, color: string, image?: string) => void;
  onDelete: (id: string) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profiles, activeId, onSwitch, onAdd, onUpdate, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({ name: '', avatar: '😊', color: 'indigo', image: '' as string | undefined });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatars = [
    '😊', '😎', '🤑', '🤠', '😇', '💼', '🏠', '🏢', 
    '🚗', '🛵', '🚲', '🍔', '🍕', '🍜', '🍱', '☕',
    '✈️', '🚢', '🎮', '⚽', '🏀', '💡', '🎨', '🎬'
  ];
  
  const activeProfile = profiles.find(p => p.id === activeId);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAdd(formData.name, formData.avatar, formData.color, formData.image);
    resetForm();
    setIsAdding(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingId) return;
    onUpdate(editingId, formData.name, formData.avatar, formData.color, formData.image);
    resetForm();
    setEditingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      onDelete(editingId);
      setEditingId(null);
      setShowConfirmDelete(false);
      resetForm();
      if (profiles.length <= 1) setIsOpen(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', avatar: '😊', color: 'indigo', image: undefined });
    setShowConfirmDelete(false);
  };

  const startEditing = (p: Profile) => {
    setEditingId(p.id);
    setFormData({ name: p.name, avatar: p.avatar, color: p.color, image: p.image });
    setIsAdding(false);
    setShowConfirmDelete(false);
  };

  const startAdding = () => {
    resetForm();
    setIsAdding(true);
    setEditingId(null);
  };

  // Find the profile name that is being considered for deletion
  const deletingProfileName = editingId ? profiles.find(p => p.id === editingId)?.name : '';

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden theme-bg-accent flex items-center justify-center border border-white/10 shadow-lg">
          {activeProfile?.image ? (
            <img src={activeProfile.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{activeProfile?.avatar}</span>
          )}
        </div>
        <i className={`fa-solid fa-chevron-down text-[10px] text-slate-500 px-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 glass-card rounded-[2.5rem] p-6 shadow-2xl z-50 border border-white/5 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">প্রোফাইল সেটিংস</h3>
            {(isAdding || editingId) && (
               <button onClick={() => { setIsAdding(false); setEditingId(null); setShowConfirmDelete(false); }} className="text-[10px] theme-text-accent font-bold hover:underline">ফিরে যান</button>
            )}
          </div>
          
          {!(isAdding || editingId) && (
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto custom-scrollbar">
              {profiles.map(p => (
                <div key={p.id} className="group relative">
                  <button
                    onClick={() => { onSwitch(p.id); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                      p.id === activeId ? 'theme-bg-accent-soft border theme-border-accent' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center border border-white/5">
                        {p.image ? (
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{p.avatar}</span>
                        )}
                      </div>
                      <span className={`font-bold text-sm truncate max-w-[120px] ${p.id === activeId ? 'theme-text-accent' : 'text-slate-300'}`}>
                        {p.name}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEditing(p); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-white transition-all"
                  >
                    <i className="fa-solid fa-pen text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {(isAdding || editingId) ? (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase">
                  {editingId ? 'এডিট করুন' : 'নতুন ছবি ও নাম'}
                </h4>
                
                {editingId && profiles.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    title="প্রোফাইল ডিলিট করুন"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                )}
              </div>
              
              {!showConfirmDelete && (
                <form onSubmit={editingId ? handleEditSubmit : handleAddSubmit} className="space-y-5">
                  
                  {/* Image Upload Area */}
                  <div className="flex flex-col items-center gap-3">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-[2rem] bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:theme-border-accent hover:theme-bg-accent-soft transition-all overflow-hidden relative group"
                    >
                      {formData.image ? (
                        <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <i className="fa-solid fa-camera text-slate-500 text-xl mb-1 group-hover:scale-110 transition-transform"></i>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">ছবি দিন</span>
                        </>
                      )}
                      {formData.image && (
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <i className="fa-solid fa-rotate text-white"></i>
                         </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest text-center">ছবি অথবা নিচের ইমোজি বেছে নিন</p>
                  </div>

                  <input
                    required
                    type="text"
                    placeholder="আপনার নাম লিখুন..."
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none theme-border-accent text-slate-200 shadow-inner"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-7 gap-1.5 p-3 bg-slate-950/40 rounded-2xl max-h-32 overflow-y-auto custom-scrollbar">
                      {avatars.map(a => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => { setFormData({ ...formData, avatar: a, image: undefined }); }}
                          className={`w-8 h-8 flex items-center justify-center rounded-xl text-lg transition-all ${
                            formData.avatar === a && !formData.image ? 'theme-bg-accent scale-110 shadow-lg' : 'hover:bg-slate-800'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full theme-bg-accent hover:opacity-90 py-4 rounded-[1.5rem] text-sm font-bold text-white transition-all active:scale-95 shadow-xl theme-ring-accent"
                  >
                    {editingId ? 'আপডেট করুন' : 'প্রোফাইল তৈরি করুন'}
                  </button>
                </form>
              )}
              
              {showConfirmDelete && (
                <div className="py-6 text-center space-y-5 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-rose-500 text-3xl">
                    <i className="fa-solid fa-circle-exclamation"></i>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-100">নিশ্চিত তো?</p>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed px-4">
                      আপনি কি নিশ্চিতভাবে <span className="text-rose-400 font-bold">"{deletingProfileName}"</span> প্রোফাইলটি মুছে ফেলতে চান? এর সাথে থাকা সব লেনদেনের ডাটা চিরস্থায়ীভাবে মুছে যাবে!
                    </p>
                  </div>
                  <div className="flex gap-3 px-2">
                    <button 
                      onClick={handleConfirmDelete}
                      className="flex-1 bg-rose-600 py-3.5 rounded-2xl text-xs font-bold text-white shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
                    >
                      হ্যাঁ, ডিলিট করুন
                    </button>
                    <button 
                      onClick={() => setShowConfirmDelete(false)}
                      className="flex-1 bg-slate-800 py-3.5 rounded-2xl text-xs font-bold text-slate-400 active:scale-95 transition-all"
                    >
                      না, ফিরে যাই
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={startAdding}
              className="w-full py-4 rounded-[1.5rem] border border-dashed border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <i className="fa-solid fa-plus group-hover:rotate-90 transition-transform"></i> নতুন প্রোফাইল
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
