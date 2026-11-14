import React, { useState, useEffect } from 'react';
import { Customer, CompanyDetails, PurchaseOrder, QuotationItem } from '../../types';
import { Step1Customer } from '../QuotationWizard/Step1Customer';
import { Step3LineItems } from '../QuotationWizard/Step3LineItems';
import { Step4Terms } from '../QuotationWizard/Step4Terms';
import { db, getNextSuggestedPoNo, incrementPoCounter } from '../../db/db';
import { downloadPurchaseOrderPDF, printPurchaseOrderPDF } from '../../services/purchaseOrderPdfGenerator';
import {
  ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, AlertTriangle,
  Hash, Calendar, FileCode, Clock, FileDown, Printer, Eye, Share2, FileCheck
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface PurchaseOrderWizardProps {
  initialPo?: PurchaseOrder | null;
  company: CompanyDetails;
  savedCustomers: Customer[];
  onFinish: () => void;
}

export const PurchaseOrderWizard: React.FC<PurchaseOrderWizardProps> = ({
  initialPo,
  company,
  savedCustomers,
  onFinish,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [stepError, setStepError] = useState<string | null>(null);

  const [poId, setPoId] = useState<number | undefined>(initialPo?.id);
  const [customerName, setCustomerName] = useState(initialPo?.customerName || '');
  const [customerAddress, setCustomerAddress] = useState(initialPo?.customerAddress || '');
  const [poNo, setPoNo] = useState(initialPo?.poNo || '');
  const [poDate, setPoDate] = useState(initialPo?.poDate || new Date().toISOString().split('T')[0]);
  const [refNo, setRefNo] = useState(initialPo?.refNo || '');
  const [refDate, setRefDate] = useState(initialPo?.refDate || '');
  const [items, setItems] = useState<QuotationItem[]>(
    initialPo?.items || [{ id: 'item-1', srNo: 1, description: '', quantity: 1, unitRate: 0, amount: 0 }]
  );
  const [warranty, setWarranty] = useState(initialPo?.warranty || '12 Months against manufacturing defects');
  const [packingForwarding, setPackingForwarding] = useState(initialPo?.packingForwarding || 'Included in above rates');
  const [freight, setFreight] = useState(initialPo?.freight || 'Extra at actual / To Pay');
  const [paymentTerms, setPaymentTerms] = useState(initialPo?.paymentTerms || '100% against delivery');
  const [validity, setValidity] = useState(initialPo?.validity || '30 Days');
  const [deliveryPeriod, setDeliveryPeriod] = useState(initialPo?.deliveryPeriod || '1 to 2 Weeks');
  const [gstRate, setGstRate] = useState(initialPo?.gstRate ?? 18);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!initialPo && !poNo) {
      getNextSuggestedPoNo().then(setPoNo);
    }
  }, [initialPo]);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const gstAmount = Math.round((subtotal * (gstRate || 0)) / 100);
  const grandTotal = subtotal;

  const currentPo: PurchaseOrder = {
    id: poId,
    poNo, poDate, refNo, refDate, customerName, customerAddress,
    items, warranty, packingForwarding, freight, paymentTerms,
    validity, deliveryPeriod, gstRate, subtotal, gstAmount, grandTotal,
    status: initialPo?.status || 'Draft',
    createdAt: initialPo?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  const handleSave = async (): Promise<void> => {
    if (customerName.trim()) {
      const existing = await db.customers.where('name').equalsIgnoreCase(customerName.trim()).first();
      if (!existing) {
        await db.customers.add({ name: customerName.trim(), address: customerAddress.trim(), createdAt: Date.now() });
      }
    }
    if (poId) {
      await db.purchaseOrders.put({ ...currentPo, id: poId, updatedAt: Date.now() });
    } else {
      const newId = await db.purchaseOrders.add({ ...currentPo, createdAt: Date.now(), updatedAt: Date.now() });
      setPoId(Number(newId));
      await incrementPoCounter();
    }
    setIsSaved(true);
  };

  const validateStep = (step: number): { valid: boolean; error?: string } => {
    if (step === 1) {
      if (!customerName.trim()) return { valid: false, error: 'Please enter Customer / Company Name.' };
      if (!customerAddress.trim()) return { valid: false, error: 'Please enter Customer Address.' };
    }
    if (step === 2) {
      if (!poNo.trim()) return { valid: false, error: 'Please enter Purchase Order Number.' };
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
    if (confirm('Reset Purchase Order form?')) {
      setPoId(undefined); setCustomerName(''); setCustomerAddress('');
      getNextSuggestedPoNo().then(setPoNo);
      setPoDate(new Date().toISOString().split('T')[0]);
      setRefNo(''); setRefDate('');
      setItems([{ id: 'item-1', srNo: 1, description: '', quantity: 1, unitRate: 0, amount: 0 }]);
      setCurrentStep(1); setStepError(null);
    }
  };

  const stepLabel = ['Customer', 'PO Info', 'Line Items', 'Terms & Tax', 'Generate & Share'][currentStep - 1];

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
              className={`flex-1 h-full rounded-full transition-all duration-300 ${step <= currentStep ? 'bg-emerald-600' : 'bg-slate-200 hover:bg-slate-300'}`}
            />
          ))}
        </div>
      </div>

      {stepError && (
        <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Warning</p>
            <p className="mt-0.5">{stepError}</p>
          </div>
          <button onClick={() => setStepError(null)} className="text-amber-700 font-bold px-1.5">✕</button>
        </div>
      )}

      {/* Step Content */}
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
          <div className="flex items-center space-x-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">2</div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Purchase Order Info</h3>
              <p className="text-xs text-slate-500">PO number, dates, and reference info</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-emerald-600" /> PO Number <span className="text-red-500">*</span>
                </label>
                <input type="text" value={poNo} onChange={e => { setPoNo(e.target.value); if (stepError) setStepError(null); }}
                  placeholder="e.g. PO-101"
                  className="w-full text-base font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 outline-none" />
                <span className="text-[11px] text-slate-400 mt-1 block">Auto-incremented</span>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> PO Date <span className="text-red-500">*</span>
                </label>
                <input type="date" value={poDate} onChange={e => setPoDate(e.target.value)}
                  className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 outline-none" />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-emerald-600" /> Reference No.
                </label>
                <input type="text" value={refNo} onChange={e => setRefNo(e.target.value)}
                  placeholder="e.g. ENQ/2026/089"
                  className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> Reference Date
                </label>
                <input type="date" value={refDate} onChange={e => setRefDate(e.target.value)}
                  className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 outline-none" />
              </div>
            </div>
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
        <PoStep5Generate po={currentPo} company={company} onSave={handleSave} onFinish={onFinish} isSaved={isSaved} />
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
            className="flex-1 py-3.5 font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition bg-emerald-600 hover:bg-emerald-700 text-white">
            <span>Next Step ({currentStep + 1}/{totalSteps})</span><ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={async () => { await handleSave(); onFinish(); }}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition">
            <CheckCircle2 className="w-4 h-4" /><span>Save & Finish</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Step 5 component for PO
interface PoStep5Props {
  po: PurchaseOrder;
  company: CompanyDetails;
  onSave: () => Promise<void>;
  onFinish: () => void;
  isSaved: boolean;
}

const PoStep5Generate: React.FC<PoStep5Props> = ({ po, company, onSave, onFinish, isSaved: initialSaved }) => {
  const [saved, setSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    onSave().then(() => setSaved(true)).catch(console.error);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const handleDownload = async () => {
    await onSave(); setSaved(true);
    downloadPurchaseOrderPDF(po, company);
    showToast('📄 Purchase Order PDF downloaded!');
  };

  const handlePrint = async () => {
    await onSave(); setSaved(true);
    printPurchaseOrderPDF(po, company);
  };

  const handleShare = async () => {
    await onSave(); setSaved(true);
    const text = `PURCHASE ORDER\n${po.poNo}\nCustomer: ${po.customerName}\nTotal: ₹${po.subtotal.toLocaleString('en-IN')}\nGST ${po.gstRate}% Extra\n\nFrom: ${company.name}`;
    if (navigator.share) {
      await navigator.share({ title: `PO - ${po.poNo}`, text }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(text).catch(() => {});
      showToast('PO details copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">5</div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Download & Share Purchase Order</h3>
            <p className="text-xs text-slate-500">Auto-saved • Download as PDF</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-extrabold rounded-full border flex items-center gap-1 ${saved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-sky-100 text-sky-800 border-sky-300'}`}>
          <FileCheck className="w-3.5 h-3.5" /><span>{saved ? 'Auto-Saved' : 'Saving...'}</span>
        </span>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <span>✅</span><span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button onClick={handleDownload} className="py-3.5 px-4 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98] transition">
          <FileDown className="w-5 h-5 text-sky-300" /><span>Download PDF</span>
        </button>
        <button onClick={handleShare} className="py-3.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98] transition">
          <Share2 className="w-5 h-5 text-sky-100" /><span>Share PO</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={handlePrint} className="py-3 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition active:scale-[0.98]">
          <Printer className="w-4 h-4 text-slate-300" /><span>Print Document</span>
        </button>
        <button onClick={async () => { setIsSaving(true); await onSave(); setIsSaving(false); setSaved(true); setTimeout(onFinish, 500); }}
          disabled={isSaving}
          className="py-3 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition active:scale-[0.98] bg-emerald-600 text-white border-emerald-600 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-white" /><span>{isSaving ? 'Saving...' : 'Saved • View All'}</span>
        </button>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
          <Eye className="w-4 h-4 text-emerald-600" /><span>PO Summary</span>
        </div>
        <div className="flex justify-between text-xs"><span className="text-slate-500">PO No.</span><span className="font-bold">{po.poNo}</span></div>
        <div className="flex justify-between text-xs"><span className="text-slate-500">Customer</span><span className="font-bold">{po.customerName}</span></div>
        <div className="flex justify-between text-xs"><span className="text-slate-500">Date</span><span className="font-bold">{formatDate(po.poDate)}</span></div>
        <div className="flex justify-between text-xs"><span className="text-slate-500">Items</span><span className="font-bold">{po.items.filter(i => i.description.trim()).length}</span></div>
        <div className="flex justify-between text-sm border-t border-slate-100 pt-2 mt-1">
          <span className="font-bold text-slate-700">Total Amount</span>
          <span className="font-extrabold text-[#0F2C59]">₹{po.subtotal.toLocaleString('en-IN')}</span>
        </div>
        <p className="text-[10px] text-slate-400 text-right">+ GST {po.gstRate}% Extra</p>
      </div>
    </div>
  );
};
