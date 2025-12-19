
import React, { useState } from 'react';
import { MasterSetting, Transaction } from '../types';
import { X, Check } from 'lucide-react';

interface AddTransactionModalProps {
  onClose: () => void;
  onAdd: (t: Transaction) => void;
  settings: MasterSetting[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onAdd, settings }) => {
  const activeSettings = settings.filter(s => s.active);
  const [selectedSettingId, setSelectedSettingId] = useState(activeSettings[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const setting = settings.find(s => s.id === selectedSettingId);
    if (!setting || !amount) return;

    const date = new Date();
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-');

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: date.toISOString(),
      userId: '', // Populated by App.tsx
      userName: '', // Populated by App.tsx
      recordType: setting.recordType,
      mainCategory: setting.mainCategory,
      subCategory: setting.subCategory,
      description: description,
      amount: parseFloat(amount),
      paymentMode: setting.paymentMode,
      accountCard: setting.accountCard,
      monthYear: monthYear,
    };

    onAdd(newTransaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black tracking-tight">Add Record</h3>
            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">Shared ledger update</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Source Category</label>
              <select 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-indigo-500 transition-shadow appearance-none"
                value={selectedSettingId}
                onChange={e => setSelectedSettingId(e.target.value)}
              >
                {activeSettings.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.recordType}: {s.mainCategory} ({s.subCategory})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Amount (₹)</label>
              <input 
                autoFocus
                type="number"
                placeholder="0.00"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-4xl font-black text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Reference Description</label>
              <input 
                type="text"
                placeholder="Where or what?"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 transition-shadow"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-6 h-6" /> Confirm Record
          </button>
        </form>
      </div>
    </div>
  );
};
