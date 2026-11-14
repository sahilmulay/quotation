import React, { useState, useRef } from 'react';
import { CompanyDetails } from '../../types';
import { exportFullBackup, importFullBackup, saveCompanyDetails } from '../../db/db';
import { 
  Building2, 
  Save, 
  Download, 
  Upload, 
  Check,
  Landmark
} from 'lucide-react';

interface SettingsViewProps {
  company: CompanyDetails;
  onCompanyUpdated: (details: CompanyDetails) => void;
  onDataRestored: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company: initialCompany,
  onCompanyUpdated,
  onDataRestored,
}) => {
  const [formData, setFormData] = useState<CompanyDetails>(initialCompany);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCompanyDetails(formData);
    onCompanyUpdated(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportBackup = async () => {
    try {
      const backup = await exportFullBackup();
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `Apex_Quotation_Backup_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMsg('Backup downloaded successfully!');
      setTimeout(() => setBackupMsg(null), 3000);
    } catch (err) {
      console.error('Backup failed:', err);
      alert('Failed to generate backup.');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Restoring will replace all existing quotations, customers, and settings with the file data. Proceed?')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const success = await importFullBackup(json);
      if (success) {
        setBackupMsg('Database restored successfully!');
        setTimeout(() => setBackupMsg(null), 3000);
        onDataRestored();
      } else {
        alert('Invalid backup file format.');
      }
    } catch (err) {
      console.error('Restore error:', err);
      alert('Failed to read backup file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#0F2C59] text-white flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Company & App Settings</h2>
            <p className="text-[11px] text-slate-500">Configure letterhead information & offline backup</p>
          </div>
        </div>
      </div>

      {backupMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{backupMsg}</span>
        </div>
      )}

      {/* Company Details Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3.5">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Building2 className="w-4 h-4 text-sky-600" />
          Official Company Letterhead Details
        </h3>

        {/* Company Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50 outline-none"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Company Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50 outline-none"
          />
        </div>

        {/* Phones & Email Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Mobile Numbers <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.phones}
              onChange={(e) => setFormData({ ...formData, phones: e.target.value })}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Official Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50 outline-none"
            />
          </div>
        </div>

        {/* GSTIN & Signatory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              GSTN Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.gstn}
              onChange={(e) => setFormData({ ...formData, gstn: e.target.value.toUpperCase() })}
              className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50 outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Signatory Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.signatoryName}
              onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50 outline-none"
            />
          </div>
        </div>

        {/* Quotation Numbering Rules */}
        <div className="border-t border-slate-100 pt-3">
          <h4 className="font-bold text-slate-700 text-xs mb-2">Quotation Auto-Numbering</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Prefix</label>
              <input
                type="text"
                value={formData.quotePrefix}
                onChange={(e) => setFormData({ ...formData, quotePrefix: e.target.value })}
                placeholder="Q-"
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Next Number</label>
              <input
                type="number"
                value={formData.nextQuoteNumber}
                onChange={(e) => setFormData({ ...formData, nextQuoteNumber: parseInt(e.target.value) || 101 })}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 outline-none"
              />
            </div>
          </div>
        </div>

        {/* PO Numbering */}
        <div className="border-t border-slate-100 pt-3">
          <h4 className="font-bold text-slate-700 text-xs mb-2">Purchase Order Auto-Numbering</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Prefix</label>
              <input type="text" value={formData.poPrefix || 'PO-'} onChange={(e) => setFormData({ ...formData, poPrefix: e.target.value })}
                placeholder="PO-" className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Next Number</label>
              <input type="number" value={formData.nextPoNumber || 101} onChange={(e) => setFormData({ ...formData, nextPoNumber: parseInt(e.target.value) || 101 })}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 outline-none" />
            </div>
          </div>
        </div>

        {/* PI Numbering */}
        <div className="border-t border-slate-100 pt-3">
          <h4 className="font-bold text-slate-700 text-xs mb-2">Proforma Invoice Auto-Numbering</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Prefix</label>
              <input type="text" value={formData.piPrefix || 'PI-'} onChange={(e) => setFormData({ ...formData, piPrefix: e.target.value })}
                placeholder="PI-" className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Next Number</label>
              <input type="number" value={formData.nextPiNumber || 101} onChange={(e) => setFormData({ ...formData, nextPiNumber: parseInt(e.target.value) || 101 })}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 outline-none" />
            </div>
          </div>
        </div>

        {/* Seal Stamp Toggle */}
        <div className="border-t border-slate-100 pt-3">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={formData.showStamp}
              onChange={(e) => setFormData({ ...formData, showStamp: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span>Include Official Stamp & Signature Seal in Generated PDF</span>
          </label>
        </div>

        {/* Save Settings Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-95 transition"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Settings Saved Successfully!' : 'Save Company Details'}</span>
          </button>
        </div>
      </form>

      {/* Bank Details Section (for Proforma Invoice) */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3.5">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Landmark className="w-4 h-4 text-purple-600" />
          Bank Details <span className="text-[10px] font-normal text-purple-600 normal-case ml-1">(Used in Proforma Invoice PDF)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Bank Name</label>
            <input type="text" value={formData.bankName || ''} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="e.g. State Bank of India"
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Account Number</label>
            <input type="text" value={formData.accountNo || ''} onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
              placeholder="e.g. 1234567890123"
              className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">IFSC Code</label>
            <input type="text" value={formData.ifscCode || ''} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
              placeholder="e.g. SBIN0001234"
              className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50 outline-none uppercase" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Branch Name</label>
            <input type="text" value={formData.branchName || ''} onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
              placeholder="e.g. Sangli Main Branch"
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50 outline-none" />
          </div>
        </div>
        <button type="button" onClick={async () => {
            await saveCompanyDetails(formData);
            onCompanyUpdated(formData);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
          }}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition">
          <Save className="w-4 h-4" /><span>Save Bank Details</span>
        </button>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Download className="w-4 h-4 text-sky-600" />
          Offline Data Backup & Restore
        </h3>
        <p className="text-xs text-slate-500">
          All your quotations, customers, and template designs are securely saved in your browser's offline IndexedDB. You can export a full backup file anytime.
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Export JSON Backup */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Download className="w-4 h-4 text-[#0F2C59]" />
            <span>Export Backup</span>
          </button>

          {/* Import Backup */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Upload className="w-4 h-4 text-[#0F2C59]" />
            <span>Restore Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportBackup}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
