
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  RecordType, Transaction, MasterSetting, AppTab, CategorySummary, AppConfig, User 
} from './types';
import { DEFAULT_MASTER_SETTINGS } from './constants';
import { 
  loadTransactions, saveTransactions, 
  loadSettings, saveSettings, 
  loadAppConfig, saveAppConfig,
  mergeTransactions
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
  TrendingUp,
  ChevronDown,
  CloudLightning,
  RefreshCcw,
  AlertTriangle,
  Moon,
  Sun
} from 'lucide-react';

const USERS: User[] = [
  { id: 'user_1', name: 'vinolin18' },
  { id: 'user_2', name: 'robin27' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartspend_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<MasterSetting[]>([]);
  const [config, setConfig] = useState<AppConfig>(() => loadAppConfig());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  
  const todayKey = new Date().toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-');
  const [selectedMonth, setSelectedMonth] = useState(todayKey);

  useEffect(() => {
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.theme]);

  // Robust Atomic Sync: Pull -> Merge -> Push
  const performFullSync = useCallback(async (
    url: string, 
    actionToApply?: { 
      txUpdate?: (txs: Transaction[]) => Transaction[], 
      setUpdate?: (sets: MasterSetting[]) => MasterSetting[] 
    }
  ) => {
    if (!url || isSyncing) return;
    setIsSyncing(true);
    
    let currentTxs = loadTransactions();
    let currentSets = loadSettings();

    try {
      // 1. PULL absolute latest from Source of Truth (Cloud)
      const response = await fetch(`${url}?t=${Date.now()}`);
      if (response.ok) {
        const cloudData = await response.json();
        if (cloudData) {
          if (cloudData.transactions) {
            currentTxs = mergeTransactions(currentTxs, cloudData.transactions);
          }
          if (cloudData.settings && cloudData.settings.length > 0) {
            currentSets = cloudData.settings;
          }
        }
      }
    } catch (error) {
      console.warn("Pull phase failed, relying on local state.");
    }

    // 2. APPLY local change to the pulled truth
    if (actionToApply?.txUpdate) currentTxs = actionToApply.txUpdate(currentTxs);
    if (actionToApply?.setUpdate) currentSets = actionToApply.setUpdate(currentSets);

    // 3. PERSIST LOCALLY
    setTransactions(currentTxs);
    setSettings(currentSets);
    saveTransactions(currentTxs);
    saveSettings(currentSets);

    // 4. PUSH combined truth back to Cloud
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          transactions: currentTxs,
          settings: currentSets
        })
      });
      
      const newConfig = { ...config, lastSync: new Date().toISOString() };
      setConfig(newConfig);
      saveAppConfig(newConfig);
    } catch (error) {
      console.error("Cloud push failed", error);
    } finally {
      setIsSyncing(false);
    }
  }, [config, isSyncing]);

  // Initial Pull on startup
  useEffect(() => {
    const storedTransactions = loadTransactions();
    const storedSettings = loadSettings().length > 0 ? loadSettings() : DEFAULT_MASTER_SETTINGS;
    
    setTransactions(storedTransactions);
    setSettings(storedSettings);

    if (config.googleSheetUrl) {
      performFullSync(config.googleSheetUrl)
        .finally(() => setIsInitialLoadDone(true));
    } else {
      setIsInitialLoadDone(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.googleSheetUrl]);

  // Removed the Tab-switch auto-sync to stop the loop

  const handleAddTransaction = (t: Transaction) => {
    if (!currentUser) return;
    const enrichedTransaction = { ...t, userId: currentUser.id, userName: currentUser.name };
    performFullSync(config.googleSheetUrl, {
      txUpdate: (current) => [enrichedTransaction, ...current]
    });
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx || !currentUser || tx.userId !== currentUser.id) {
      if (tx && tx.userId !== currentUser?.id) alert("Cannot delete other user's records.");
      return;
    }

    performFullSync(config.googleSheetUrl, {
      txUpdate: (current) => current.filter(t => t.id !== id)
    });
  };

  const handleHardReset = async () => {
    if (!config.googleSheetUrl) return;
    if (!confirm("Wipe all cloud data? This clears the sheet for EVERYONE.")) return;

    setIsSyncing(true);
    try {
      await fetch(config.googleSheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
      setTransactions([]);
      setSettings(DEFAULT_MASTER_SETTINGS);
      saveTransactions([]);
      saveSettings(DEFAULT_MASTER_SETTINGS);
      alert("Cloud reset complete.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateSettings = (newSettings: MasterSetting[]) => {
    performFullSync(config.googleSheetUrl, { setUpdate: () => newSettings });
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
    transactions.forEach(t => { if(t.monthYear) list.add(t.monthYear) });
    return Array.from(list).sort((a, b) => {
      const dateA = new Date(a.replace('-', ' '));
      const dateB = new Date(b.replace('-', ' '));
      return dateB.getTime() - dateA.getTime();
    });
  }, [transactions, todayKey]);

  const filteredTransactions = useMemo(() => transactions.filter(t => t.monthYear === selectedMonth), [transactions, selectedMonth]);

  const categorySummary = useMemo<CategorySummary[]>(() => {
    const relevantTransactions = filteredTransactions.filter(t => t.recordType === RecordType.EXPENSE);
    const mainCategories = Array.from(new Set(settings.filter(s => s.recordType === RecordType.EXPENSE).map(s => s.mainCategory)));

    return mainCategories.map(cat => {
      const actualSpend = relevantTransactions.filter(t => t.mainCategory === cat).reduce((sum, t) => sum + t.amount, 0);
      const plannedCap = settings.filter(s => s.mainCategory === cat && s.recordType === RecordType.EXPENSE).reduce((sum, s) => sum + s.monthlyCap, 0);
      const variance = plannedCap - actualSpend;
      const status = actualSpend > plannedCap ? 'ALERT' : 'OK';
      return { mainCategory: cat, actualSpend, plannedCap, variance, status };
    });
  }, [filteredTransactions, settings]);

  if (!currentUser) return <Login users={USERS} onLogin={handleLogin} />;

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-slate-50 dark:bg-slate-950 flex flex-col relative shadow-xl transition-colors">
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm">
        <div className="pt-safe">
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            SmartSpend <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest">PRO</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="relative inline-block">
              <select 
                className="appearance-none bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold py-1 px-3 pr-6 rounded-full border-none"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              >
                {monthList.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1.5 w-3 h-3 text-indigo-400 pointer-events-none" />
            </div>
            {isSyncing && <CloudLightning className="w-3 h-3 text-amber-500 animate-pulse" />}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl">
            {config.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button 
            disabled={isSyncing}
            onClick={() => performFullSync(config.googleSheetUrl)} 
            className={`p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl transition-all ${isSyncing ? 'opacity-50' : 'active:scale-90'}`}
          >
            <RefreshCcw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
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
            onSync={() => performFullSync(config.googleSheetUrl)}
            onLogout={handleLogout}
            currentUser={currentUser}
            onHardReset={handleHardReset}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t flex justify-around items-center h-20 px-2 pb-safe z-40">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="Board" />
        <NavButton active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} icon={<TrendingUp />} label="Trends" />
        <div className="relative -top-8">
          <button 
            disabled={isSyncing}
            onClick={() => setIsModalOpen(true)} 
            className="w-16 h-16 rounded-3xl bg-indigo-600 text-white shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-900 active:scale-90 transition-transform disabled:bg-slate-300"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
        <NavButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={<ReceiptText />} label="Daily" />
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon />} label="Setup" />
      </nav>

      {isModalOpen && <AddTransactionModal onClose={() => setIsModalOpen(false)} onAdd={handleAddTransaction} settings={settings} />}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all flex-1 py-2 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
    {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
    <span className="text-[9px] font-bold uppercase">{label}</span>
  </button>
);

export default App;
