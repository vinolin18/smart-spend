
import React, { useState, useEffect, useMemo } from 'react';
import { 
  RecordType, Transaction, MasterSetting, AppTab, CategorySummary, AppConfig 
} from './types';
import { DEFAULT_MASTER_SETTINGS } from './constants';
import { 
  loadTransactions, saveTransactions, 
  loadSettings, saveSettings, 
  loadAppConfig, saveAppConfig,
  downloadCSV 
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
  BarChart3, 
  Settings as SettingsIcon,
  Plus,
  Download,
  TrendingUp,
  ChevronDown,
  CloudLightning
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<MasterSetting[]>([]);
  const [config, setConfig] = useState<AppConfig>({ googleSheetUrl: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Current month for filtering
  const todayKey = new Date().toLocaleString('default', { month: 'short', year: 'numeric' }).replace(' ', '-');
  const [selectedMonth, setSelectedMonth] = useState(todayKey);

  // Initialize data
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
  }, []);

  // Centralized Sync Function that can be called programmatically
  const performSync = async (txs: Transaction[], sets: MasterSetting[]) => {
    if (!config.googleSheetUrl) return;
    
    setIsSyncing(true);
    try {
      await fetch(config.googleSheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          transactions: txs,
          settings: sets
        })
      });
      
      const now = new Date().toISOString();
      const newConfig = { ...config, lastSync: now };
      setConfig(newConfig);
      saveAppConfig(newConfig);
    } catch (error) {
      console.error('Auto-sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddTransaction = (t: Transaction) => {
    const updated = [t, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
    // Auto-sync
    performSync(updated, settings);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
    // Auto-sync
    performSync(updated, settings);
  };

  const handleUpdateSettings = (newSettings: MasterSetting[]) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    // Settings changes also trigger sync
    performSync(transactions, newSettings);
  };

  const handleUpdateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    saveAppConfig(newConfig);
  };

  const handleManualSync = async () => {
    if (!config.googleSheetUrl) {
      alert('Please provide a Google Sheet URL in Setup first.');
      return;
    }
    await performSync(transactions, settings);
    alert('Cloud sync completed!');
  };

  // Month list for dropdown
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

  // Derived filtered data
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

      return {
        mainCategory: cat,
        actualSpend,
        plannedCap,
        variance,
        status
      };
    });
  }, [filteredTransactions, settings]);

  const handleDownload = () => {
    if (activeTab === 'transactions') {
      downloadCSV(filteredTransactions, `transactions_${selectedMonth}`);
    } else if (activeTab === 'summary' || activeTab === 'dashboard') {
      downloadCSV(categorySummary, `summary_${selectedMonth}`);
    }
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-slate-50 flex flex-col relative shadow-xl shadow-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center shadow-sm shadow-slate-50">
        <div>
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
        
        <div className="flex gap-2">
          {(activeTab === 'dashboard' || activeTab === 'transactions' || activeTab === 'summary') && (
            <button 
              onClick={handleDownload}
              className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors"
              title="Download Report"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
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

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around items-center h-20 px-2 z-40 pb-2">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="Board" />
        <NavButton active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} icon={<TrendingUp />} label="Trends" />
        
        {/* FAB */}
        <div className="relative -top-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white rotate-45"
          >
            <Plus className="w-8 h-8 -rotate-45" />
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
    className={`flex flex-col items-center gap-1 transition-all flex-1 py-2 ${
      active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-500'
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    </div>
    <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
