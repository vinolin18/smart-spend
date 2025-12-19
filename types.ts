
export enum RecordType {
  EXPENSE = 'Expense',
  INCOME = 'Income',
  INVESTMENT = 'Investment'
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
}
