
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { ReceiptText, TrendingDown, TrendingUp } from 'lucide-react';
import { CategorySummary } from '../types';

interface DashboardProps {
  summary: CategorySummary[];
  transactions: any[]; 
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];

export const Dashboard: React.FC<DashboardProps> = ({ summary }) => {
  const pieData = summary
    .filter(s => s.actualSpend > 0)
    .map((s, index) => ({
      name: s.mainCategory,
      value: s.actualSpend,
      color: COLORS[index % COLORS.length]
    }));

  const totalSpend = summary.reduce((acc, s) => acc + s.actualSpend, 0);
  const totalBudget = summary.reduce((acc, s) => acc + s.plannedCap, 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Spent</p>
          <div className="flex items-end gap-1 mt-1">
             <p className="text-2xl font-black text-slate-800 dark:text-slate-100">₹{totalSpend.toLocaleString()}</p>
          </div>
          <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
             <div 
               className={`h-full rounded-full transition-all duration-1000 ${budgetUtilization > 100 ? 'bg-rose-500' : 'bg-indigo-500'}`}
               style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
             />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Cap Status</p>
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-2xl font-black ${budgetUtilization > 100 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
              {Math.round(budgetUtilization)}%
            </p>
            {budgetUtilization > 100 ? <TrendingUp size={16} className="text-rose-500" /> : <TrendingDown size={16} className="text-indigo-500" />}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2 font-bold uppercase tracking-wider">Of ₹{totalBudget.toLocaleString()} limit</p>
        </div>
      </div>

      {/* Pie Chart Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-black mb-6 text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center justify-between">
          Breakdown
          <span className="text-[9px] text-slate-400 dark:text-slate-600 font-bold lowercase italic">by category</span>
        </h3>
        <div className="h-64 w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
              <p className="text-slate-300 dark:text-slate-700 text-xs font-bold uppercase tracking-widest">No activity found</p>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Progress Bars */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-black mb-6 text-slate-800 dark:text-slate-200 uppercase tracking-widest">Active Caps</h3>
        <div className="space-y-5">
          {summary.slice(0, 5).map(s => (
            <div key={s.mainCategory}>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{s.mainCategory}</span>
                <span className={`text-[10px] font-black ${s.status === 'ALERT' ? 'text-rose-600' : 'text-slate-400 dark:text-slate-500'}`}>
                  ₹{s.actualSpend.toLocaleString()} / <span className="text-slate-300 dark:text-slate-700">₹{s.plannedCap.toLocaleString()}</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${s.status === 'ALERT' ? 'bg-rose-500' : 'bg-indigo-400'}`}
                  style={{ width: `${Math.min((s.actualSpend / (s.plannedCap || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
