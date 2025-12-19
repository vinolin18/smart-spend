
export enum RecordType {
  EXPENSE = 'Expense',
  INCOME = 'Income',
  INVESTMENT = 'Investment'
}

export interface User {
  id: string;
  name: string;
}

export interface MasterSetting {
  id: string;
  recordType: RecordType;
  mainCategory: string;
  subCategory: string;
  paymentMode: string;
  accountCard: string;
  monthlyCap: number;
  active: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  userId: string; // The user who created this record
  userName: string; // Friendly name for display
  recordType: RecordType;
  mainCategory: string;
  subCategory: string;
  description: string;
  amount: number;
  paymentMode: string;
  accountCard: string;
  monthYear: string; // e.g., "Feb-2025"
}

export interface CategorySummary {
  mainCategory: string;
  actualSpend: number;
  plannedCap: number;
  variance: number;
  status: 'OK' | 'ALERT';
}

export type AppTab = 'dashboard' | 'trends' | 'transactions' | 'summary' | 'settings';

export interface AppConfig {
  googleSheetUrl: string;
  lastSync?: string;
  theme: 'light' | 'dark';
}
