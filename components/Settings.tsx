import React, { useState } from 'react';
import { MasterSetting, RecordType, AppConfig, User } from '../types';
import { Plus, Edit2, Check, Cloud, RefreshCw, LogOut, Trash2, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  settings: MasterSetting[];
  onUpdate: (settings: MasterSetting[]) => void;
  config: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
  onSync: () => Promise<void>;
  onLogout: () => void;
  currentUser: User;
  onHardReset: () => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({ 
  settings, onUpdate, config, onUpdateConfig, onSync, onLogout, currentUser, onHardReset 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MasterSetting>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(config.googleSheetUrl);

  const startEdit = (s: MasterSetting) => {
    setEditingId(s.id);
    setEditForm(s);
  };

  const saveEdit = () => {
    if (editingId) {
      const updated = settings.map(s => s.id === editingId ? { ...s, ...editForm } as MasterSetting : s);
      onUpdate(updated);
      setEditingId(null);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const addRow = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newSetting: MasterSetting = {
      id: newId,
      recordType: RecordType.EXPENSE,
      mainCategory: 'New Category',
      subCategory: 'Sub category',
      paymentMode: 'UPI',
      accountCard: 'Account',
      monthlyCap: 1000,
      active: true,
    };
    onUpdate([...settings, newSetting]);
    startEdit(newSetting);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Section */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              {currentUser.name[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{currentUser.name}</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Active Member</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-3 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </section>

      {/* Cloud Sync Section */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Cloud Sync</h3>
          </div>
          {config.lastSync && (
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
              Last: {new Date(config.lastSync).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Apps Script URL</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                placeholder="https://script.google.com/..."
                value={sheetUrl}
                onChange={e => {
                  setSheetUrl(e.target.value);
                  onUpdateConfig({ ...config, googleSheetUrl: e.target.value });
                }}
              />
              <button 
                onClick={handleSync}
                disabled={isSyncing || !sheetUrl}
                className={`p-4 rounded-2xl transition-all ${
                  isSyncing ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 active:scale-95'
                }`}
              >
                <RefreshCw className={`w-6 h-6 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Master Settings Section */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Master Setup</h2>
        <button 
          onClick={addRow}
          className="w-10 h-10 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95 flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="grid gap-4">
        {settings.map((s) => (
          <div key={s.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
            {editingId === s.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm dark:text-slate-200"
                    value={editForm.recordType}
                    onChange={e => setEditForm({...editForm, recordType: e.target.value as RecordType})}
                  >
                    {Object.values(RecordType).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <input 
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm dark:text-slate-200"
                    placeholder="Category"
                    value={editForm.mainCategory}
                    onChange={e => setEditForm({...editForm, mainCategory: e.target.value})}
                  />
                  <input 
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm dark:text-slate-200 col-span-2"
                    placeholder="Sub-category"
                    value={editForm.subCategory}
                    onChange={e => setEditForm({...editForm, subCategory: e.target.value})}
                  />
                  <input 
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm dark:text-slate-200"
                    type="number"
                    placeholder="Monthly Cap"
                    value={editForm.monthlyCap}
                    onChange={e => setEditForm({...editForm, monthlyCap: Number(e.target.value)})}
                  />
                  <input 
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm dark:text-slate-200"
                    placeholder="Account"
                    value={editForm.accountCard}
                    onChange={e => setEditForm({...editForm, accountCard: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-3 rounded-xl text-xs font-black uppercase">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${
                      s.recordType === RecordType.INCOME ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {s.recordType}
                    </span>
                    <h4 className="font-black text-slate-800 dark:text-slate-100">{s.mainCategory}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{s.subCategory}</p>
                  <p className="text-[10px] font-black text-indigo-600">Cap: ₹{s.monthlyCap.toLocaleString()} • {s.accountCard}</p>
                </div>
                <button onClick={() => startEdit(s)} className="p-2 text-slate-300 hover:text-indigo-600">
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <section className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-[2rem] border border-rose-100 dark:border-rose-900/20">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest">Danger Zone</h3>
        </div>
        <button 
          onClick={onHardReset}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <Trash2 size={16} /> Hard Reset Cloud Data
        </button>
      </section>
    </div>
  );
};