
import React from 'react';
import { Transaction, RecordType } from '../types';
import { Trash2, ShoppingBag, CreditCard, Home, Zap, DollarSign, Wallet } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
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

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onDelete }) => {
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-800 px-2">Recent Records</h2>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
          <p className="text-slate-400">No transactions recorded yet.</p>
        </div>
      ) : (
        sorted.map((t) => (
          <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className={`p-3 rounded-xl ${
              t.recordType === RecordType.INCOME ? 'bg-emerald-50 text-emerald-600' : 
              t.recordType === RecordType.INVESTMENT ? 'bg-indigo-50 text-indigo-600' : 
              'bg-rose-50 text-rose-600'
            }`}>
              {getCategoryIcon(t.mainCategory)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-800">{t.mainCategory}</h4>
                  <p className="text-xs text-slate-500 uppercase font-medium">{t.subCategory}</p>
                </div>
                <p className={`font-bold ${
                  t.recordType === RecordType.INCOME ? 'text-emerald-600' : 'text-slate-800'
                }`}>
                  {t.recordType === RecordType.EXPENSE ? '-' : '+'}₹{t.amount.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-slate-400 italic">{t.description || 'No description'}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold uppercase tracking-wider">
                    {t.paymentMode}
                  </span>
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
