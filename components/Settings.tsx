
import React, { useState } from 'react';
import { MasterSetting, RecordType, AppConfig } from '../types';
import { Plus, Edit2, X, Check, Cloud, RefreshCw, Info, ExternalLink } from 'lucide-react';

interface SettingsProps {
  settings: MasterSetting[];
  onUpdate: (settings: MasterSetting[]) => void;
  config: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
  onSync: () => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, config, onUpdateConfig, onSync }) => {
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
      {/* Cloud Sync Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800">Cloud Sync</h3>
          </div>
          {config.lastSync && (
            <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
              Last Sync: {new Date(config.lastSync).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Google Apps Script URL</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
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
                className={`p-3 rounded-xl transition-all ${
                  isSyncing ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 active:scale-95'
                }`}
              >
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-2xl">
            <div className="flex gap-2 items-start mb-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Multi-User Sync Setup</p>
            </div>
            <p className="text-[10px] text-indigo-700 leading-relaxed">
              To sync between phones, your Apps Script must support <strong>doGet</strong> (to send data back to the phone) and <strong>doPost</strong> (to save data from the phone). 
            </p>
            <a 
              href="https://developers.google.com/apps-script/guides/web" 
              target="_blank" 
              className="text-[9px] text-indigo-500 font-bold flex items-center gap-1 mt-2 hover:underline"
            >
              Learn about Apps Script <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Master Settings Section */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-slate-800">Master Categories</h2>
        <button 
          onClick={addRow}
          className="p-2 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid gap-4">
        {settings.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all hover:border-indigo-100">
            {editingId === s.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="bg-slate-50 border-none rounded-lg p-2 text-sm"
                    value={editForm.recordType}
                    onChange={e => setEditForm({...editForm, recordType: e.target.value as RecordType})}
                  >
                    {Object.values(RecordType).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <input 
                    className="bg-slate-50 border-none rounded-lg p-2 text-sm"
                    placeholder="Main Category"
                    value={editForm.mainCategory}
                    onChange={e => setEditForm({...editForm, mainCategory: e.target.value})}
                  />
                  <input 
                    className="bg-slate-50 border-none rounded-lg p-2 text-sm col-span-2"
                    placeholder="Sub Category"
                    value={editForm.subCategory}
                    onChange={e => setEditForm({...editForm, subCategory: e.target.value})}
                  />
                  <input 
                    className="bg-slate-50 border-none rounded-lg p-2 text-sm"
                    type="number"
                    placeholder="Monthly Cap"
                    value={editForm.monthlyCap}
                    onChange={e => setEditForm({...editForm, monthlyCap: Number(e.target.value)})}
                  />
                   <input 
                    className="bg-slate-50 border-none rounded-lg p-2 text-sm"
                    placeholder="Account/Card"
                    value={editForm.accountCard}
                    onChange={e => setEditForm({...editForm, accountCard: e.target.value})}
                  />
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <button onClick={saveEdit} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-indigo-100">
                    <Check className="w-3.5 h-3.5" /> Apply
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      s.recordType === RecordType.INCOME ? 'bg-emerald-100 text-emerald-700' : 
                      s.recordType === RecordType.INVESTMENT ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {s.recordType}
                    </span>
                    <h4 className="font-bold text-slate-800">{s.mainCategory}</h4>
                  </div>
                  <p className="text-xs text-slate-400">{s.subCategory}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="px-2 py-0.5 bg-slate-50 rounded border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-600">Cap: <span className="text-indigo-600">₹{s.monthlyCap.toLocaleString()}</span></p>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400">Via {s.accountCard}</p>
                  </div>
                </div>
                <button 
                  onClick={() => startEdit(s)}
                  className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
