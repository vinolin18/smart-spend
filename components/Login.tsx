
import React, { useState } from 'react';
import { User } from '../types';
import { Wallet, ShieldCheck, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Hardcoded credentials logic
    // user1: vinolin18, pswd:1234
    // user2: robin27, pswd:1234
    
    if (username === 'vinolin18' && password === '1234') {
      const user = users.find(u => u.name === 'vinolin18');
      if (user) onLogin(user);
    } else if (username === 'robin27' && password === '1234') {
      const user = users.find(u => u.name === 'robin27');
      if (user) onLogin(user);
    } else {
      setError('Invalid username or password');
    }
  };

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
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Secure Login</h2>
            <p className="text-xs text-slate-400">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            
            <div className="text-left space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="text-left space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 p-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] mt-2"
            >
              <LogIn size={18} />
              Sign In
            </button>
          </form>

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
