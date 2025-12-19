
import React, { useState, useEffect, useMemo } from 'react';
import { 
  RecordType, Transaction, MasterSetting, AppTab, CategorySummary, AppConfig, User 
} from './types';
import { DEFAULT_MASTER_SETTINGS } from './constants';
import { 
  loadTransactions, saveTransactions, 
  loadSettings, saveSettings, 
  loadAppConfig, saveAppConfig,
  downloadCSV, mergeTransactions
} from './utils/storage';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Summary } from './components/Summary';
import { Settings } from './components/Settings';
import { Trends } from './components/Trends';
import { AddTransactionModal } from './components/AddTransactionModal';
import { Login } from './components/Login';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Settings as SettingsIcon,
  Plus,
  Download,
  TrendingUp,
  ChevronDown,
  CloudLightning,
  RefreshCcw,
  AlertTriangle,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';

const USERS: User[] = [
  { id: 'user_a', name: 'User A' },
  { id: 'user_b', name: 'User B' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartspend_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<MasterSetting[]>([]);
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = loadAppConfig();
    return { ...saved, theme: saved.theme || 'light' };
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  
  const todayKey = new Date().toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-');
  const [selectedMonth, setSelectedMonth] = useState(todayKey);

  // Apply theme to body
  useEffect(() => {
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.theme]);

  // Initial Data Load
  useEffect(() => {
    const storedTransactions = loadTransactions();
    const storedSettings = loadSettings();
    
    setTransactions(storedTransactions);
    
    if (storedSettings.length > 0) {
      setSettings(storedSettings);
    } else {
      setSettings(DEFAULT_MASTER_SETTINGS);
      saveSettings(DEFAULT_MASTER_SETTINGS);
    }

    if (config.googleSheetUrl) {
      performFullSync(config.googleSheetUrl, storedTransactions, storedSettings)
        .finally(() => setIsInitialLoadDone(true));
    } else {
      setIsInitialLoadDone(true);
    }
  }, [config.googleSheetUrl]);

  const performFullSync = async (
    url: string, 
    currentLocalTxs: Transaction[], 
    currentLocalSets: MasterSetting[],
    actionToApply?: { 
      txUpdate?: (txs: Transaction[]) => Transaction[], 
      setUpdate?: (sets: MasterSetting[]) => MasterSetting[] 
    }
  ) => {
    if (!url) return;
    setIsSyncing(true);
    
    let latestTxs = [...currentLocalTxs];
    let latestSets = [...currentLocalSets];

    try {
      const response = await fetch(url);
      if (response.ok) {
        const cloudData = await response.json();
        if (cloudData.transactions) {
          latestTxs = mergeTransactions(currentLocalTxs, cloudData.transactions);
        }
        if (cloudData.settings && cloudData.settings.length > 0) {
          latestSets = cloudData.settings;
        }
      }
    } catch (error) {
      console.warn("Pull failed, using local merge.");
    }

    if (actionToApply?.txUpdate) latestTxs = actionToApply.txUpdate(latestTxs);
    if (actionToApply?.setUpdate) latestSets = actionToApply.setUpdate(latestSets);

    setTransactions(latestTxs);
    setSettings(latestSets);
    saveTransactions(latestTxs);
    saveSettings(latestSets);

    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          transactions: latestTxs,
          settings: latestSets
        })
      });
      
      const newConfig = { ...config, lastSync: new Date().toISOString() };
      setConfig(newConfig);
      saveAppConfig(newConfig);
    } catch (error) {
      console.error("Push failed", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddTransaction = (t: Transaction) => {
    if (!currentUser) return;
    const enrichedTransaction = { 
      ...t, 
      userId: currentUser.id, 
      userName: currentUser.name 
    };
    performFullSync(config.googleSheetUrl, transactions, settings, {
      txUpdate: (current) => [enrichedTransaction, ...current]
    });
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx || !currentUser) return;
    
    if (tx.userId !== currentUser.id) {
      alert("You can only delete your own records!");
      return;
    }

    performFullSync(config.googleSheetUrl, transactions, settings, {
      txUpdate: (current) => current.filter(t => t.id !== id)
    });
  };

  const handleUpdateSettings = (newSettings: MasterSetting[]) => {
    performFullSync(config.googleSheetUrl, transactions, settings, {
      setUpdate: () => newSettings
    });
  };

  const handleUpdateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    saveAppConfig(newConfig);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('smartspend_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('smartspend_user');
  };

  const toggleTheme = () => {
    const newTheme = config.theme === 'light' ? 'dark' : 'light';
    handleUpdateConfig({ ...config, theme: newTheme });
  };

  const monthList = useMemo(() => {
    const list = new Set<string>();
    list.add(todayKey);
    transactions.forEach(t => list.add(t.monthYear));
    return Array.from(list).sort((a, b) => {
      const dateA = new Date(a.replace('-', ' '));
      const dateB = new Date(b.replace('-', ' '));
      return dateB.getTime() - dateA.getTime();
    });
  }, [transactions, todayKey]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.monthYear === selectedMonth);
  }, [transactions, selectedMonth]);

  const categorySummary = useMemo<CategorySummary[]>(() => {
    const relevantTransactions = filteredTransactions.filter(t => t.recordType === RecordType.EXPENSE);
    const mainCategories = Array.from(new Set(settings
      .filter(s => s.recordType === RecordType.EXPENSE)
      .map(s => s.mainCategory)));

    return mainCategories.map(cat => {
      const actualSpend = relevantTransactions
        .filter(t => t.mainCategory === cat)
        .reduce((sum, t) => sum + t.amount, 0);
      const plannedCap = settings
        .filter(s => s.mainCategory === cat && s.recordType === RecordType.EXPENSE)
        .reduce((sum, s) => sum + s.monthlyCap, 0);
      const variance = plannedCap - actualSpend;
      const status = actualSpend > plannedCap ? 'ALERT' : 'OK';

      return { mainCategory: cat, actualSpend, plannedCap, variance, status };
    });
  }, [filteredTransactions, settings]);

  if (!currentUser) {
    return <Login users={USERS} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-slate-50 dark:bg-slate-950 flex flex-col relative shadow-xl shadow-slate-200 dark:shadow-none transition-colors">
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm">
        <div className="pt-safe">
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            SmartSpend
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest">PRO</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="relative inline-block">
              <select 
                className="appearance-none bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold py-1 px-3 pr-6 rounded-full border-none focus:ring-1 focus:ring-indigo-300"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              >
                {monthList.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1.5 w-3 h-3 text-indigo-400 pointer-events-none" />
            </div>
            {isSyncing && (
              <div className="flex items-center gap-1 animate-pulse">
                <CloudLightning className="w-3 h-3 text-amber-500" />
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Syncing...</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 pt-safe">
          <button 
            onClick={toggleTheme}
            className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {config.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button 
            onClick={() => performFullSync(config.googleSheetUrl, transactions, settings)}
            disabled={isSyncing}
            className={`p-2.5 rounded-xl transition-all ${isSyncing ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
          >
            <RefreshCcw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {!config.googleSheetUrl && isInitialLoadDone && activeTab !== 'settings' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30 px-6 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase">Cloud Sync Required in Setup</p>
        </div>
      )}

      <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
        {activeTab === 'dashboard' && <Dashboard summary={categorySummary} transactions={filteredTransactions} />}
        {activeTab === 'trends' && <Trends transactions={transactions} />}
        {activeTab === 'transactions' && <Transactions transactions={filteredTransactions} onDelete={handleDeleteTransaction} currentUserId={currentUser.id} />}
        {activeTab === 'summary' && <Summary summary={categorySummary} />}
        {activeTab === 'settings' && (
          <Settings 
            settings={settings} 
            onUpdate={handleUpdateSettings} 
            config={config} 
            onUpdateConfig={handleUpdateConfig}
            onSync={() => performFullSync(config.googleSheetUrl, transactions, settings)}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex justify-around items-center h-20 px-2 z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="Board" />
        <NavButton active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} icon={<TrendingUp />} label="Trends" />
        
        <div className="relative -top-8">
          <button 
            disabled={!isInitialLoadDone || isSyncing}
            onClick={() => setIsModalOpen(true)}
            className={`w-16 h-16 rounded-3xl shadow-xl flex items-center justify-center transition-all border-4 border-white dark:border-slate-900 ${
              !isInitialLoadDone || isSyncing 
              ? 'bg-slate-300 dark:bg-slate-800 text-slate-100 dark:text-slate-700' 
              : 'bg-indigo-600 text-white shadow-indigo-300 dark:shadow-indigo-900/20 hover:scale-105 active:scale-90'
            }`}
          >
            <Plus className={`w-8 h-8 ${isSyncing ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        <NavButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={<ReceiptText />} label="Daily" />
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon />} label="Setup" />
      </nav>

      {isModalOpen && (
        <AddTransactionModal 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddTransaction} 
          settings={settings}
        />
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all flex-1 py-2 active:scale-95 ${
      active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
    </div>
    <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
