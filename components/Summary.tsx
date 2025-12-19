
import React from 'react';
import { CategorySummary } from '../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface SummaryProps {
  summary: CategorySummary[];
}

export const Summary: React.FC<SummaryProps> = ({ summary }) => {
  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actual</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {summary.map((s) => (
              <tr key={s.mainCategory} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-800">{s.mainCategory}</p>
                  <p className="text-xs text-slate-400">Cap: ₹{s.plannedCap.toLocaleString()}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold text-slate-700">₹{s.actualSpend.toLocaleString()}</p>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.status === 'ALERT' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min((s.actualSpend / (s.plannedCap || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  {s.status === 'ALERT' ? (
                    <div className="flex flex-col items-end">
                      <AlertCircle className="w-5 h-5 text-rose-500 mb-1" />
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        +{ (s.actualSpend - s.plannedCap).toLocaleString() }
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1" />
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        OK
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Monthly caps are based on your Master Settings. Exceeding a cap will trigger an alert status and highlight the category in red.
        </p>
      </div>
    </div>
  );
};
