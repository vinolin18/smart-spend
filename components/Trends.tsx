
import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Transaction, RecordType } from '../types';

interface TrendsProps {
  transactions: Transaction[];
}

export const Trends: React.FC<TrendsProps> = ({ transactions }) => {
  const monthlyData = React.useMemo(() => {
    const months: Record<string, { month: string; spend: number; count: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-');
      months[key] = { month: key, spend: 0, count: 0 };
    }
    transactions.forEach(t => {
      if (t.recordType === RecordType.EXPENSE && months[t.monthYear]) {
        months[t.monthYear].spend += t.amount;
        months[t.monthYear].count += 1;
      }
    });
    return Object.values(months);
  }, [transactions]);

  const totalPeriodSpend = monthlyData.reduce((acc, m) => acc + m.spend, 0);
  const avgSpend = totalPeriodSpend / (monthlyData.length || 1);

  const highestSpendMonth = monthlyData.length > 0 
    ? monthlyData.reduce((prev, curr) => prev.spend > curr.spend ? prev : curr).month 
    : 'N/A';

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Spending Trend</h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1 mb-6">Historical Analysis</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} 
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#fff' }}
                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Spent']}
              />
              <Area 
                type="monotone" 
                dataKey="spend" 
                stroke="#6366f1" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorSpend)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Monthly Avg</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-200">₹{Math.round(avgSpend).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Total Flow</p>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{totalPeriodSpend.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="bg-slate-900 dark:bg-indigo-900/20 p-6 rounded-[2rem] text-white">
        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Spend Insights</h4>
        <ul className="space-y-3">
          <li className="text-[11px] text-slate-300 dark:text-indigo-300 font-bold flex gap-3">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
            Highest financial activity peak recorded in {highestSpendMonth}.
          </li>
          <li className="text-[11px] text-slate-300 dark:text-indigo-300 font-bold flex gap-3">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
            Successfully tracked {monthlyData.reduce((acc, m) => acc + m.count, 0)} events across the period.
          </li>
        </ul>
      </div>
    </div>
  );
};
