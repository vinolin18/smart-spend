
import React from 'react';
import { Transaction, RecordType } from '../types';
import { Trash2, ShoppingBag, CreditCard, Home, Zap, DollarSign, Wallet, User as UserIcon } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currentUserId: string;
}

const getCategoryIcon = (cat: string) => {
  const c = cat.toLowerCase();
  if (c.includes('food')) return <ShoppingBag className="w-5 h-5" />;
  if (c.includes('rent') || c.includes('emi')) return <Home className="w-5 h-5" />;
  if (c.includes('utility')) return <Zap className="w-5 h-5" />;
  if (c.includes('credit')) return <CreditCard className="w-5 h-5" />;
  if (c.includes('salary')) return <DollarSign className="w-5 h-5" />;
  return <Wallet className="w-5 h-5" />;
};

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onDelete, currentUserId }) => {
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 px-2">Recent Records</h2>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-400 dark:text-slate-600 font-medium">No transactions recorded yet.</p>
        </div>
      ) : (
        sorted.map((t) => (
          <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:shadow-md dark:hover:border-slate-700">
            <div className={`p-3 rounded-xl ${
              t.recordType === RecordType.INCOME ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 
              t.recordType === RecordType.INVESTMENT ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 
              'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
            }`}>
              {getCategoryIcon(t.mainCategory)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.mainCategory}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t.subCategory}</p>
                    <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">
                      <UserIcon size={10} /> {t.userName || 'Unknown'}
                    </div>
                  </div>
                </div>
                <p className={`font-black text-lg ${
                  t.recordType === RecordType.INCOME ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'
                }`}>
                  {t.recordType === RecordType.EXPENSE ? '-' : '+'}₹{t.amount.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                <p className="text-xs text-slate-400 dark:text-slate-500 italic max-w-[150px] truncate">{t.description || 'No description'}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                    {t.paymentMode}
                  </span>
                  {t.userId === currentUserId ? (
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="text-slate-300 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-4 h-4" /> // Spacing for alignment
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
