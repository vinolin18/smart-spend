
import { Transaction, MasterSetting, AppConfig } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'smartspend_transactions',
  SETTINGS: 'smartspend_settings',
  CONFIG: 'smartspend_config',
};

export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const loadTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

// Merge two sets of transactions based on unique ID
export const mergeTransactions = (local: Transaction[], remote: Transaction[]): Transaction[] => {
  const map = new Map<string, Transaction>();
  
  // Add remote first
  remote.forEach(t => {
    if (t && t.id) map.set(t.id, t);
  });
  
  // Local records take priority if there's a collision (same ID)
  local.forEach(t => {
    if (t && t.id) map.set(t.id, t);
  });

  return Array.from(map.values()).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const saveSettings = (settings: MasterSetting[]) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const loadSettings = (): MasterSetting[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : [];
};

export const saveAppConfig = (config: AppConfig) => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

export const loadAppConfig = (): AppConfig => {
  const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
  return data ? JSON.parse(data) : { googleSheetUrl: '' };
};

export const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => JSON.stringify(row[header] ?? '')).join(',')
    )
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
