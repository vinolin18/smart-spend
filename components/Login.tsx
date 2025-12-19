
import React from 'react';
import { User } from '../types';
import { Wallet, ShieldCheck, ChevronRight } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  return (
    <div className="min-h-screen max-w-lg mx-auto bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-300 dark:shadow-indigo-900/30 flex items-center justify-center">
            <Wallet size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">SmartSpend</h1>
            <p className="text-slate-400 dark:text-slate-500 font-medium mt-2">Personal Expense Tracker Pro</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Welcome Back</h2>
            <p className="text-xs text-slate-400">Please select your profile to continue</p>
          </div>

          <div className="space-y-3">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => onLogin(user)}
                className="w-full group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold group-hover:scale-110 transition-transform">
                    {user.name[user.name.length - 1]}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{user.name}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold pt-2">
            <ShieldCheck size={12} />
            Secure Private Access
          </div>
        </div>
        
        <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">
          Multi-device sync enabled via Google Sheets Cloud
        </p>
      </div>
    </div>
  );
};
