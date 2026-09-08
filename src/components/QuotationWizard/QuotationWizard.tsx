import React, { useState, useEffect } from 'react';
import { Customer, CompanyDetails, Quotation, QuotationItem, TemplateConfig } from '../../types';
import { Step1Customer } from './Step1Customer';
import { Step2QuotationDetails } from './Step2QuotationDetails';
import { Step3LineItems } from './Step3LineItems';
import { Step4Terms } from './Step4Terms';
import { Step5GenerateReview } from './Step5GenerateReview';
import { db, getNextSuggestedQuotationNo, incrementQuotationCounter } from '../../db/db';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

interface QuotationWizardProps {
  initialQuotation?: Quotation | null;
  company: CompanyDetails;
  template: TemplateConfig;
  savedCustomers: Customer[];
  onFinish: () => void;
}

export const QuotationWizard: React.FC<QuotationWizardProps> = ({
  initialQuotation,
  company,
  template,
  savedCustomers,
  onFinish,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;
  const [stepError, setStepError] = useState<string | null>(null);

  // Form State
  const [quotationId, setQuotationId] = useState<number | undefined>(initialQuotation?.id);
  const [customerName, setCustomerName] = useState<string>(initialQuotation?.customerName || '');
  const [customerAddress, setCustomerAddress] = useState<string>(initialQuotation?.customerAddress || '');
  const [quotationNo, setQuotationNo] = useState<string>(initialQuotation?.quotationNo || '');
  const [quotationDate, setQuotationDate] = useState<string>(
    initialQuotation?.quotationDate || new Date().toISOString().split('T')[0]
  );
  const [refNo, setRefNo] = useState<string>(initialQuotation?.refNo || '');
  const [refDate, setRefDate] = useState<string>(initialQuotation?.refDate || '');
  
  const [items, setItems] = useState<QuotationItem[]>(
    initialQuotation?.items || [
      {
        id: 'item-1',
        srNo: 1,
        description: '',
        quantity: 1,
        unitRate: 0,
        amount: 0,
      },
    ]
  );

  const [warranty, setWarranty] = useState<string>(
    initialQuotation?.warranty || '12 Months against manufacturing defects'
  );
  const [packingForwarding, setPackingForwarding] = useState<string>(
    initialQuotation?.packingForwarding || 'Included in above rates'
  );
  const [freight, setFreight] = useState<string>(
    initialQuotation?.freight || 'Extra at actual / To Pay'
  );
  const [paymentTerms, setPaymentTerms] = useState<string>(
    initialQuotation?.paymentTerms || '100% against delivery'
  );
  const [validity, setValidity] = useState<string>(initialQuotation?.validity || '30 Days');
  const [deliveryPeriod, setDeliveryPeriod] = useState<string>(
    initialQuotation?.deliveryPeriod || '1 to 2 Weeks'
  );
  const [gstRate, setGstRate] = useState<number>(initialQuotation?.gstRate ?? 18);
  const [status] = useState<'Draft' | 'Sent' | 'Approved' | 'Rejected'>(
    initialQuotation?.status || 'Draft'
  );

  // Auto-fetch next quotation number if creating new
  useEffect(() => {
    if (!initialQuotation && !quotationNo) {
      getNextSuggestedQuotationNo().then((nextNo) => {
        setQuotationNo(nextNo);
      });
    }
  }, [initialQuotation]);

  // Financial calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const gstAmount = Math.round((subtotal * (gstRate || 0)) / 100);
  const grandTotal = subtotal + gstAmount;

  // Composite Quotation Object
  const currentQuote: Quotation = {
    id: quotationId,
    quotationNo,
    quotationDate,
    refNo,
    refDate,
    customerName,
    customerAddress,
    items,
    warranty,
    packingForwarding,
    freight,
    paymentTerms,
    validity,
    deliveryPeriod,
    gstRate,
    subtotal,
    gstAmount,
    grandTotal,
    status,
    createdAt: initialQuotation?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  // Robust Save Quotation to Dexie DB (ensures every new quotation is saved into history)
  const handleSaveQuotation = async (): Promise<void> => {
    // 1. Auto-save / link customer
    if (customerName.trim()) {
      const existingCustomer = await db.customers.where('name').equalsIgnoreCase(customerName.trim()).first();
      if (!existingCustomer) {
        await db.customers.add({
          name: customerName.trim(),
          address: customerAddress.trim(),
          createdAt: Date.now(),
        });
      }
    }

    // 2. Save or update quotation in DB history
    if (quotationId) {
      // Update existing record
      await db.quotations.put({
        ...currentQuote,
        id: quotationId,
        updatedAt: Date.now(),
      });
    } else {
      // Brand new quotation: always add a new record to history!
      const newId = await db.quotations.add({
        ...currentQuote,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const numId = Number(newId);
      setQuotationId(numId);
      await incrementQuotationCounter();
    }
  };

  const handleResetForm = () => {
    if (confirm('Start a fresh quotation? Current unsaved entries will be cleared.')) {
      setQuotationId(undefined);
      setCustomerName('');
      setCustomerAddress('');
      getNextSuggestedQuotationNo().then(setQuotationNo);
      setQuotationDate(new Date().toISOString().split('T')[0]);
      setRefNo('');
      setRefDate('');
      setItems([{ id: 'item-1', srNo: 1, description: '', quantity: 1, unitRate: 0, amount: 0 }]);
      setCurrentStep(1);
      setStepError(null);
    }
  };

  const validateStep = (step: number): { valid: boolean; error?: string } => {
    if (step === 1) {
      if (!customerName.trim()) {
        return { valid: false, error: 'Please enter the Customer / Company Name.' };
      }
      if (!customerAddress.trim()) {
        return { valid: false, error: 'Please enter the Customer Address.' };
      }
    }

    if (step === 2) {
      if (!quotationNo.trim()) {
        return { valid: false, error: 'Please enter Quotation Number.' };
      }
    }

    if (step === 3) {
      if (items.length === 0 || !items.some((it) => it.description.trim().length > 0)) {
        return { valid: false, error: 'Please add at least one line item description.' };
      }

      const missingPrices = items.filter(
        (it) => it.description.trim().length > 0 && (!it.unitRate || it.unitRate <= 0)
      );

      if (missingPrices.length > 0) {
        return {
          valid: false,
          error: `Please enter Unit Rate / Price for item #${missingPrices[0].srNo} (${missingPrices[0].description}). Prices cannot be empty or zero.`,
        };
      }
    }

    return { valid: true };
  };

  const isCurrentStepValid = validateStep(currentStep).valid;

  const handleNextStep = async () => {
    const check = validateStep(currentStep);
    if (!check.valid) {
      setStepError(check.error || 'Please fill required fields before proceeding.');
      return;
    }
    setStepError(null);

    // Auto-save whenever proceeding to the last step (Step 5)
    if (currentStep === 4) {
      await handleSaveQuotation();
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStepError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepJump = async (stepNum: number) => {
    if (stepNum > currentStep) {
      // Validate up to target
      for (let i = 1; i < stepNum; i++) {
        const check = validateStep(i);
        if (!check.valid) {
          setStepError(check.error || `Please complete Step ${i} first.`);
          return;
        }
      }
      if (stepNum === 5) {
        await handleSaveQuotation();
      }
    }
    setStepError(null);
    setCurrentStep(stepNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-28 pt-2">
      {/* Top Progress Step Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0F2C59]">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • {currentStep === 1 && 'Customer'}
              {currentStep === 2 && 'Quotation Info'}
              {currentStep === 3 && 'Line Items'}
              {currentStep === 4 && 'Terms & Tax'}
              {currentStep === 5 && 'Generate & Share'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetForm}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 active:scale-95"
            title="Reset Form"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Clickable Progress Line */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex gap-1 p-0.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => handleStepJump(step)}
              className={`flex-1 h-full rounded-full transition-all duration-300 cursor-pointer ${
                step <= currentStep ? 'bg-[#0F2C59]' : 'bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Jump to Step ${step}`}
            />
          ))}
        </div>
      </div>

      {/* Validation Warning Alert */}
      {stepError && (
        <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 shadow-xs animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-amber-950">Warning: Incomplete Information</p>
            <p className="mt-0.5 text-amber-800">{stepError}</p>
          </div>
          <button
            type="button"
            onClick={() => setStepError(null)}
            className="text-amber-700 hover:text-amber-900 font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Step Content */}
      <div className="transition-all duration-200">
        {currentStep === 1 && (
          <Step1Customer
            customerName={customerName}
            customerAddress={customerAddress}
            onUpdate={({ customerName, customerAddress }) => {
              setCustomerName(customerName);
              setCustomerAddress(customerAddress);
              if (stepError) setStepError(null);
            }}
            savedCustomers={savedCustomers}
          />
        )}

        {currentStep === 2 && (
          <Step2QuotationDetails
            quotationNo={quotationNo}
            quotationDate={quotationDate}
            refNo={refNo}
            refDate={refDate}
            onUpdate={({ quotationNo, quotationDate, refNo, refDate }) => {
              setQuotationNo(quotationNo);
              setQuotationDate(quotationDate);
              setRefNo(refNo);
              setRefDate(refDate);
              if (stepError) setStepError(null);
            }}
          />
        )}

        {currentStep === 3 && (
          <Step3LineItems
            items={items}
            onUpdateItems={(newItems) => {
              setItems(newItems);
              if (stepError) setStepError(null);
            }}
          />
        )}

        {currentStep === 4 && (
          <Step4Terms
            warranty={warranty}
            packingForwarding={packingForwarding}
            freight={freight}
            paymentTerms={paymentTerms}
            validity={validity}
            deliveryPeriod={deliveryPeriod}
            gstRate={gstRate}
            subtotal={subtotal}
            onUpdate={({
              warranty,
              packingForwarding,
              freight,
              paymentTerms,
              validity,
              deliveryPeriod,
              gstRate,
            }) => {
              setWarranty(warranty);
              setPackingForwarding(packingForwarding);
              setFreight(freight);
              setPaymentTerms(paymentTerms);
              setValidity(validity);
              setDeliveryPeriod(deliveryPeriod);
              setGstRate(gstRate);
            }}
          />
        )}

        {currentStep === 5 && (
          <Step5GenerateReview
            quote={currentQuote}
            company={company}
            template={template}
            onSave={handleSaveQuotation}
            onFinish={onFinish}
          />
        )}
      </div>

      {/* Single Clean Navigation Buttons at end of content */}
      <div className="mt-6 flex items-center justify-between gap-3 pt-2">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrevStep}
            className="flex-1 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={handleNextStep}
            className={`flex-1 py-3.5 font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition ${
              isCurrentStepValid
                ? 'bg-[#0F2C59] hover:bg-[#1E3A8A] text-white cursor-pointer'
                : 'bg-slate-300 text-slate-600 cursor-pointer'
            }`}
          >
            <span>Next Step ({currentStep + 1}/{totalSteps})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={async () => {
              await handleSaveQuotation();
              onFinish();
            }}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Finish</span>
          </button>
        )}
      </div>
    </div>
  );
};
