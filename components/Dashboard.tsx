
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { ReceiptText } from 'lucide-react';
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
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5">
             <ReceiptText size={48} />
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Spent</p>
          <p className="text-2xl font-black text-slate-800 mt-1">₹{totalSpend.toLocaleString()}</p>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
             <div 
               className={`h-full rounded-full transition-all duration-1000 ${budgetUtilization > 100 ? 'bg-rose-500' : 'bg-indigo-500'}`}
               style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
             />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Budget Utilization</p>
          <p className={`text-2xl font-black mt-1 ${budgetUtilization > 100 ? 'text-rose-500' : 'text-slate-800'}`}>
            {Math.round(budgetUtilization)}%
          </p>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Of ₹{totalBudget.toLocaleString()} cap</p>
        </div>
      </div>

      {/* Pie Chart Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold mb-6 text-slate-800 uppercase tracking-wider flex items-center justify-between">
          Spend Breakdown
          <span className="text-[10px] text-slate-400 font-medium lowercase italic">by category</span>
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
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-slate-300 text-xs">No data for this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Bar Chart for Status */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold mb-6 text-slate-800 uppercase tracking-wider">Cap Status</h3>
        <div className="space-y-4">
          {summary.slice(0, 5).map(s => (
            <div key={s.mainCategory}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-700">{s.mainCategory}</span>
                <span className={`text-[10px] font-bold ${s.status === 'ALERT' ? 'text-rose-600' : 'text-slate-400'}`}>
                  ₹{s.actualSpend.toLocaleString()} / ₹{s.plannedCap.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${s.status === 'ALERT' ? 'bg-rose-500' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min((s.actualSpend / (s.plannedCap || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
          {summary.length > 5 && (
            <p className="text-[10px] text-center text-slate-400 pt-2 italic">See all in Status tab</p>
          )}
        </div>
      </div>
    </div>
  );
};
