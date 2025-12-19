
import React from 'react';
import { CategorySummary } from '../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface SummaryProps {
  summary: CategorySummary[];
}

export const Summary: React.FC<SummaryProps> = ({ summary }) => {
  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Category</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Actual</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {summary.map((s) => (
              <tr key={s.mainCategory} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-5">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{s.mainCategory}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider mt-0.5">Limit ₹{s.plannedCap.toLocaleString()}</p>
                </td>
                <td className="px-5 py-5">
                  <p className="font-black text-slate-800 dark:text-slate-100">₹{s.actualSpend.toLocaleString()}</p>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.status === 'ALERT' ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min((s.actualSpend / (s.plannedCap || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-5 py-5 text-right">
                  {s.status === 'ALERT' ? (
                    <div className="flex flex-col items-end">
                      <AlertCircle className="w-5 h-5 text-rose-500 mb-1" />
                      <span className="text-[9px] font-black text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md uppercase">
                        Over By ₹{(s.actualSpend - s.plannedCap).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mb-1" />
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md uppercase">
                        On Track
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex gap-3">
        <AlertCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
        <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">
          Budget statuses are shared between users. Your collective spending contributes to the category caps defined in Master Setup.
        </p>
      </div>
    </div>
  );
};
