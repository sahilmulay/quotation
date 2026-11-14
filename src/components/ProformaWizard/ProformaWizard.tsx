import React, { useState, useEffect } from 'react';
import { Customer, CompanyDetails, ProformaInvoice, QuotationItem } from '../../types';
import { Step1Customer } from '../QuotationWizard/Step1Customer';
import { Step3LineItems } from '../QuotationWizard/Step3LineItems';
import { Step4Terms } from '../QuotationWizard/Step4Terms';
import { db, getNextSuggestedPiNo, incrementPiCounter } from '../../db/db';
import { downloadProformaInvoicePDF, printProformaInvoicePDF } from '../../services/proformaInvoicePdfGenerator';
import { downloadProformaInvoiceJPG, generateProformaInvoiceImageBlob } from '../../services/imageGenerator';
import { openProformaInvoiceShareSheet } from '../../services/shareService';
import {
  ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, AlertTriangle,
  Hash, Calendar, FileCode, Clock, FileDown, Printer, Eye, Share2, FileCheck, Landmark, Check
} from 'lucide-react';

interface ProformaWizardProps {
  initialPi?: ProformaInvoice | null;
  company: CompanyDetails;
  savedCustomers: Customer[];
  onFinish: () => void;
}

export const ProformaWizard: React.FC<ProformaWizardProps> = ({
  initialPi,
  company,
  savedCustomers,
  onFinish,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [stepError, setStepError] = useState<string | null>(null);

  const [piId, setPiId] = useState<number | undefined>(initialPi?.id);
  const [customerName, setCustomerName] = useState(initialPi?.customerName || '');
  const [customerAddress, setCustomerAddress] = useState(initialPi?.customerAddress || '');
  const [piNo, setPiNo] = useState(initialPi?.piNo || '');
  const [piDate, setPiDate] = useState(initialPi?.piDate || new Date().toISOString().split('T')[0]);
  const [refNo, setRefNo] = useState(initialPi?.refNo || '');
  const [refDate, setRefDate] = useState(initialPi?.refDate || '');
  const [items, setItems] = useState<QuotationItem[]>(
    initialPi?.items || [{ id: 'item-1', srNo: 1, description: '', quantity: 1, unitRate: 0, amount: 0 }]
  );
  const [warranty, setWarranty] = useState(initialPi?.warranty || '12 Months against manufacturing defects');
  const [packingForwarding, setPackingForwarding] = useState(initialPi?.packingForwarding || 'Included in above rates');
  const [freight, setFreight] = useState(initialPi?.freight || 'Extra at actual / To Pay');
  const [paymentTerms, setPaymentTerms] = useState(initialPi?.paymentTerms || '100% against delivery');
  const [validity, setValidity] = useState(initialPi?.validity || '30 Days');
  const [deliveryPeriod, setDeliveryPeriod] = useState(initialPi?.deliveryPeriod || '1 to 2 Weeks');
  const [gstRate, setGstRate] = useState(initialPi?.gstRate ?? 18);

  useEffect(() => {
    if (!initialPi && !piNo) {
      getNextSuggestedPiNo().then(setPiNo);
    }
  }, [initialPi]);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const gstAmount = Math.round((subtotal * (gstRate || 0)) / 100);
  const grandTotal = subtotal;

  const currentPi: ProformaInvoice = {
    id: piId,
    piNo, piDate, refNo, refDate, customerName, customerAddress,
    items, warranty, packingForwarding, freight, paymentTerms,
    validity, deliveryPeriod, gstRate, subtotal, gstAmount, grandTotal,
    status: initialPi?.status || 'Draft',
    createdAt: initialPi?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  const handleSave = async (): Promise<void> => {
    if (customerName.trim()) {
      const existing = await db.customers.where('name').equalsIgnoreCase(customerName.trim()).first();
      if (!existing) {
        await db.customers.add({ name: customerName.trim(), address: customerAddress.trim(), createdAt: Date.now() });
      }
    }
    if (piId) {
      await db.proformaInvoices.put({ ...currentPi, id: piId, updatedAt: Date.now() });
    } else {
      const newId = await db.proformaInvoices.add({ ...currentPi, createdAt: Date.now(), updatedAt: Date.now() });
      setPiId(Number(newId));
      await incrementPiCounter();
    }
  };

  const validateStep = (step: number): { valid: boolean; error?: string } => {
    if (step === 1) {
      if (!customerName.trim()) return { valid: false, error: 'Please enter Customer / Company Name.' };
      if (!customerAddress.trim()) return { valid: false, error: 'Please enter Customer Address.' };
    }
    if (step === 2) {
      if (!piNo.trim()) return { valid: false, error: 'Please enter Proforma Invoice Number.' };
    }
    if (step === 3) {
      if (!items.some(it => it.description.trim().length > 0))
        return { valid: false, error: 'Please add at least one line item.' };
      const missing = items.filter(it => it.description.trim() && (!it.unitRate || it.unitRate <= 0));
      if (missing.length > 0)
        return { valid: false, error: `Enter Unit Rate for item #${missing[0].srNo}.` };
    }
    return { valid: true };
  };

  const handleNext = async () => {
    const check = validateStep(currentStep);
    if (!check.valid) { setStepError(check.error || 'Please complete required fields.'); return; }
    setStepError(null);
    if (currentStep === 4) await handleSave();
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setStepError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJump = async (step: number) => {
    if (step > currentStep) {
      for (let i = 1; i < step; i++) {
        const check = validateStep(i);
        if (!check.valid) { setStepError(check.error || `Please complete Step ${i} first.`); return; }
      }
      if (step === 5) await handleSave();
    }
    setStepError(null);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (confirm('Reset Proforma Invoice form?')) {
      setPiId(undefined); setCustomerName(''); setCustomerAddress('');
      getNextSuggestedPiNo().then(setPiNo);
      setPiDate(new Date().toISOString().split('T')[0]);
      setRefNo(''); setRefDate('');
      setItems([{ id: 'item-1', srNo: 1, description: '', quantity: 1, unitRate: 0, amount: 0 }]);
      setCurrentStep(1); setStepError(null);
    }
  };

  const stepLabel = ['Customer', 'PI Info', 'Line Items', 'Terms & Tax', 'Generate & Share'][currentStep - 1];

  return (
    <div className="pb-28 pt-2">
      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0F2C59]">Step {currentStep} of {totalSteps}</span>
            <span className="text-xs text-slate-400 font-medium">• {stepLabel}</span>
          </div>
          <button onClick={handleReset} className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 active:scale-95">
            <RotateCcw className="w-3 h-3" /><span>Reset</span>
          </button>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex gap-1 p-0.5">
          {[1,2,3,4,5].map(step => (
            <button key={step} onClick={() => handleJump(step)}
              className={`flex-1 h-full rounded-full transition-all duration-300 ${step <= currentStep ? 'bg-purple-600' : 'bg-slate-200 hover:bg-slate-300'}`}
            />
          ))}
        </div>
      </div>

      {stepError && (
        <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1"><p className="font-bold">Warning</p><p className="mt-0.5">{stepError}</p></div>
          <button onClick={() => setStepError(null)} className="text-amber-700 font-bold px-1.5">✕</button>
        </div>
      )}

      {currentStep === 1 && (
        <Step1Customer
          customerName={customerName} customerAddress={customerAddress}
          onUpdate={({ customerName, customerAddress }) => {
            setCustomerName(customerName); setCustomerAddress(customerAddress);
            if (stepError) setStepError(null);
          }}
          savedCustomers={savedCustomers}
        />
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5 bg-purple-50 border border-purple-200 rounded-2xl p-3.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Proforma Invoice Info</h3>
              <p className="text-xs text-slate-500">PI number, dates, and reference info</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-purple-600" /> PI Number <span className="text-red-500">*</span>
                </label>
                <input type="text" value={piNo} onChange={e => { setPiNo(e.target.value); if (stepError) setStepError(null); }}
                  placeholder="e.g. PI-101"
                  className="w-full text-base font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50/50 outline-none" />
                <span className="text-[11px] text-slate-400 mt-1 block">Auto-incremented</span>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" /> PI Date <span className="text-red-500">*</span>
                </label>
                <input type="date" value={piDate} onChange={e => setPiDate(e.target.value)}
                  className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50/50 outline-none" />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-purple-600" /> Reference No.
                </label>
                <input type="text" value={refNo} onChange={e => setRefNo(e.target.value)}
                  placeholder="e.g. ENQ/2026/089"
                  className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50/50 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" /> Reference Date
                </label>
                <input type="date" value={refDate} onChange={e => setRefDate(e.target.value)}
                  className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50/50 outline-none" />
              </div>
            </div>
          </div>

          {/* Bank Details Preview */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Landmark className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-purple-800">Company Bank Details (Included in Proforma)</span>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <div><span className="font-semibold">Bank:</span> {company.bankName || 'State Bank of India'}</div>
              <div><span className="font-semibold">Account No:</span> {company.accountNo || '-'}</div>
              <div><span className="font-semibold">IFSC:</span> {company.ifscCode || '-'}</div>
              <div><span className="font-semibold">Branch:</span> {company.branchName || '-'}</div>
            </div>
            <p className="text-[10px] text-purple-600 mt-2">These details are shown in the official document & PDF. Update anytime in the Settings tab.</p>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <Step3LineItems items={items} onUpdateItems={newItems => { setItems(newItems); if (stepError) setStepError(null); }} />
      )}

      {currentStep === 4 && (
        <Step4Terms
          warranty={warranty} packingForwarding={packingForwarding} freight={freight}
          paymentTerms={paymentTerms} validity={validity} deliveryPeriod={deliveryPeriod}
          gstRate={gstRate} subtotal={subtotal}
          onUpdate={({ warranty, packingForwarding, freight, paymentTerms, validity, deliveryPeriod, gstRate }) => {
            setWarranty(warranty); setPackingForwarding(packingForwarding); setFreight(freight);
            setPaymentTerms(paymentTerms); setValidity(validity); setDeliveryPeriod(deliveryPeriod);
            setGstRate(gstRate);
          }}
        />
      )}

      {currentStep === 5 && (
        <PiStep5Generate pi={currentPi} company={company} onSave={handleSave} onFinish={onFinish} />
      )}

      {/* Nav Buttons */}
      <div className="mt-6 flex items-center justify-between gap-3 pt-2">
        {currentStep > 1 && (
          <button onClick={handlePrev}
            className="flex-1 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition">
            <ArrowLeft className="w-4 h-4" /><span>Previous Step</span>
          </button>
        )}
        {currentStep < totalSteps ? (
          <button onClick={handleNext}
            className="flex-1 py-3.5 font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition bg-purple-600 hover:bg-purple-700 text-white">
            <span>Next Step ({currentStep + 1}/{totalSteps})</span><ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={async () => { await handleSave(); onFinish(); }}
            className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition">
            <CheckCircle2 className="w-4 h-4" /><span>Save & Finish</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Step 5 component for PI with crisp visual document preview
interface PiStep5Props {
  pi: ProformaInvoice;
  company: CompanyDetails;
  onSave: () => Promise<void>;
  onFinish: () => void;
}

const PiStep5Generate: React.FC<PiStep5Props> = ({ pi, company, onSave, onFinish }) => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-save upon arriving at Step 5
  useEffect(() => {
    onSave().then(() => setIsSaved(true)).catch(console.error);
  }, []);

  // Generate crisp visual image preview
  useEffect(() => {
    let active = true;
    let urlToRevoke: string | null = null;

    generateProformaInvoiceImageBlob(pi, company, 'image/jpeg')
      .then((blob) => {
        if (!active) return;
        const url = URL.createObjectURL(blob);
        urlToRevoke = url;
        setPreviewImageUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate PI preview:', err);
      });

    return () => {
      active = false;
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [pi, company]);

  const handleDownloadPhotoAndPDF = async () => {
    try {
      await onSave();
      setIsSaved(true);

      downloadProformaInvoicePDF(pi, company);
      await downloadProformaInvoiceJPG(pi, company);

      setToastMessage('📸 Photo & 📄 PDF downloaded & saved to Proforma Invoices!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Error downloading PI:', err);
      downloadProformaInvoicePDF(pi, company);
      setToastMessage('📄 PDF downloaded & saved to Proforma Invoices!');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleShare = async () => {
    try {
      await onSave();
      setIsSaved(true);
      await openProformaInvoiceShareSheet(pi, company);
    } catch (err) {
      console.error('Share PI error:', err);
    }
  };

  const handlePrint = async () => {
    try {
      await onSave();
      setIsSaved(true);
      printProformaInvoicePDF(pi, company);
    } catch (err) {
      console.error('Print PI error:', err);
    }
  };

  const handleSaveAndDone = async () => {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => {
      onFinish();
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-2xl p-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">5</div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Download & Share Proforma Invoice</h3>
            <p className="text-xs text-slate-500">Auto-saved to Proforma Invoices • Includes Bank Details</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-extrabold rounded-full border flex items-center gap-1 ${isSaved ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-sky-100 text-sky-800 border-sky-300'}`}>
          <FileCheck className="w-3.5 h-3.5" /><span>{isSaved ? 'Auto-Saved' : 'Saving...'}</span>
        </span>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="bg-purple-50 border border-purple-300 text-purple-950 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 shadow-xs">
          <Check className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Action Buttons: Download & Share */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleDownloadPhotoAndPDF}
          className="py-3.5 px-4 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98] transition"
        >
          <FileDown className="w-5 h-5 text-sky-300" />
          <span>Download Photo & PDF</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98] transition"
        >
          <Share2 className="w-5 h-5 text-purple-100" />
          <span>Share Proforma Invoice</span>
        </button>
      </div>

      {/* Secondary Actions: Print & Save */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handlePrint}
          className="py-3 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          <span>Print Document</span>
        </button>

        <button
          type="button"
          onClick={handleSaveAndDone}
          disabled={isSaving}
          className="py-3 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition active:scale-[0.98] bg-purple-600 text-white border-purple-600 shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{isSaving ? 'Saving...' : 'Saved • View All'}</span>
        </button>
      </div>

      {/* Preview Section Header */}
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 px-1 pt-1">
        <Eye className="w-4 h-4 text-purple-600" />
        <span>Proforma Invoice Preview</span>
      </div>

      {/* Visual Document Preview */}
      {previewImageUrl ? (
        <div className="bg-white rounded-2xl border-2 border-slate-300 overflow-hidden shadow-lg p-1 sm:p-2">
          <img
            src={previewImageUrl}
            alt="Proforma Invoice Preview"
            className="w-full h-auto rounded-xl shadow-xs object-contain"
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Generating crisp proforma invoice preview...</p>
        </div>
      )}
    </div>
  );
};
