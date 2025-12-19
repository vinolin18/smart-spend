
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  RecordType, Transaction, MasterSetting, AppTab, CategorySummary, AppConfig 
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
  AlertTriangle
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<MasterSetting[]>([]);
  const [config, setConfig] = useState<AppConfig>({ googleSheetUrl: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  
  const todayKey = new Date().toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-');
  const [selectedMonth, setSelectedMonth] = useState(todayKey);

  // Load local data immediately on mount
  useEffect(() => {
    const storedTransactions = loadTransactions();
    const storedSettings = loadSettings();
    const storedConfig = loadAppConfig();
    
    setTransactions(storedTransactions);
    setConfig(storedConfig);
    
    if (storedSettings.length > 0) {
      setSettings(storedSettings);
    } else {
      setSettings(DEFAULT_MASTER_SETTINGS);
      saveSettings(DEFAULT_MASTER_SETTINGS);
    }

    // Initial sync
    if (storedConfig.googleSheetUrl) {
      performFullSync(storedConfig.googleSheetUrl, storedTransactions, storedSettings)
        .finally(() => setIsInitialLoadDone(true));
    } else {
      setIsInitialLoadDone(true);
    }
  }, []);

  /**
   * The "Golden Rule" for Multi-User Sync:
   * 1. Pull latest from Cloud
   * 2. Merge with local state
   * 3. Apply the user's change (if any)
   * 4. Save Locally
   * 5. Push result to Cloud
   */
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
      // 1. PULL
      const response = await fetch(url);
      if (response.ok) {
        const cloudData = await response.json();
        
        // 2. MERGE
        if (cloudData.transactions) {
          latestTxs = mergeTransactions(currentLocalTxs, cloudData.transactions);
        }
        if (cloudData.settings && cloudData.settings.length > 0) {
          latestSets = cloudData.settings; // Settings usually overwrite for simplicity
        }
      }
    } catch (error) {
      console.warn("Pull failed, proceeding with local merge only.", error);
    }

    // 3. APPLY CHANGE
    if (actionToApply?.txUpdate) {
      latestTxs = actionToApply.txUpdate(latestTxs);
    }
    if (actionToApply?.setUpdate) {
      latestSets = actionToApply.setUpdate(latestSets);
    }

    // 4. SAVE LOCALLY
    setTransactions(latestTxs);
    setSettings(latestSets);
    saveTransactions(latestTxs);
    saveSettings(latestSets);

    // 5. PUSH
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
    performFullSync(config.googleSheetUrl, transactions, settings, {
      txUpdate: (current) => [t, ...current]
    });
  };

  const handleDeleteTransaction = (id: string) => {
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
    // If URL changed, sync immediately
    if (newConfig.googleSheetUrl) {
      performFullSync(newConfig.googleSheetUrl, transactions, settings);
    }
  };

  const handleManualSync = () => performFullSync(config.googleSheetUrl, transactions, settings);

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

  const handleDownload = () => {
    if (activeTab === 'transactions') {
      downloadCSV(filteredTransactions, `transactions_${selectedMonth}`);
    } else {
      downloadCSV(categorySummary, `summary_${selectedMonth}`);
    }
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-slate-50 flex flex-col relative shadow-xl shadow-slate-200">
      <header className="sticky top-0 z-30 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center shadow-sm">
        <div className="pt-safe">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">SmartSpend</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="relative inline-block">
              <select 
                className="appearance-none bg-indigo-50 text-indigo-600 text-[10px] font-bold py-1 px-3 pr-6 rounded-full border-none focus:ring-1 focus:ring-indigo-300"
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
                <span className="text-[8px] font-bold text-slate-400 uppercase">Syncing...</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 pt-safe">
          <button 
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`p-2.5 rounded-xl transition-all ${isSyncing ? 'bg-indigo-50 text-indigo-400' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
          >
            <RefreshCcw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
          {(activeTab === 'dashboard' || activeTab === 'transactions' || activeTab === 'summary') && (
            <button 
              onClick={handleDownload}
              className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 active:bg-indigo-50 transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Warning if sync URL is missing */}
      {!config.googleSheetUrl && isInitialLoadDone && activeTab !== 'settings' && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <p className="text-[10px] font-bold text-amber-700 uppercase">Offline Mode: Sync URL not set in Setup</p>
        </div>
      )}

      <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
        {activeTab === 'dashboard' && <Dashboard summary={categorySummary} transactions={filteredTransactions} />}
        {activeTab === 'trends' && <Trends transactions={transactions} />}
        {activeTab === 'transactions' && <Transactions transactions={filteredTransactions} onDelete={handleDeleteTransaction} />}
        {activeTab === 'summary' && <Summary summary={categorySummary} />}
        {activeTab === 'settings' && (
          <Settings 
            settings={settings} 
            onUpdate={handleUpdateSettings} 
            config={config} 
            onUpdateConfig={handleUpdateConfig}
            onSync={handleManualSync}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around items-center h-20 px-2 z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="Board" />
        <NavButton active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} icon={<TrendingUp />} label="Trends" />
        
        <div className="relative -top-8">
          <button 
            disabled={!isInitialLoadDone || isSyncing}
            onClick={() => setIsModalOpen(true)}
            className={`w-16 h-16 rounded-3xl shadow-xl flex items-center justify-center transition-all border-4 border-white ${
              !isInitialLoadDone || isSyncing 
              ? 'bg-slate-300 text-slate-100' 
              : 'bg-indigo-600 text-white shadow-indigo-300 hover:scale-105 active:scale-90'
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

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all flex-1 py-2 active:scale-95 ${
      active ? 'text-indigo-600' : 'text-slate-400'
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
    </div>
    <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
