
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Transaction, RecordType } from '../types';

interface TrendsProps {
  transactions: Transaction[];
}

export const Trends: React.FC<TrendsProps> = ({ transactions }) => {
  // Aggregate data for the last 6 months
  const monthlyData = React.useMemo(() => {
    const months: Record<string, { month: string; spend: number; count: number }> = {};
    
    // Get last 6 months list
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

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold mb-1 text-slate-800">Monthly Trends</h3>
        <p className="text-xs text-slate-400 mb-6">Total spend trajectory over last 6 months</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
              />
              <Area 
                type="monotone" 
                dataKey="spend" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSpend)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg. Monthly</p>
          <p className="text-xl font-bold text-slate-800">₹{Math.round(avgSpend).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Period Total</p>
          <p className="text-xl font-bold text-indigo-600">₹{totalPeriodSpend.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
        <h4 className="text-sm font-bold text-indigo-900 mb-2">Insights</h4>
        <ul className="space-y-2">
          <li className="text-xs text-indigo-700 flex gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1 shrink-0"></span>
            Your highest spend was in {monthlyData.reduce((prev, curr) => prev.spend > curr.spend ? prev : curr).month}.
          </li>
          <li className="text-xs text-indigo-700 flex gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1 shrink-0"></span>
            Total period activity: {monthlyData.reduce((acc, m) => acc + m.count, 0)} transactions recorded.
          </li>
        </ul>
      </div>
    </div>
  );
};
