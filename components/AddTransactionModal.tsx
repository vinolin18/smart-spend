
import React, { useState, useEffect } from 'react';
import { MasterSetting, RecordType, Transaction } from '../types';
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
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Log Activity</h3>
            <p className="text-indigo-100 text-xs mt-1">Select category and enter amount</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
              <select 
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 transition-shadow appearance-none"
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Amount (₹)</label>
              <input 
                autoFocus
                type="number"
                placeholder="0.00"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-3xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. Weekly grocery run"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-6 h-6" /> Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
};
