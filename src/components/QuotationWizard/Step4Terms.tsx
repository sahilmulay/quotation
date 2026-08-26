import React from 'react';
import { ShieldCheck, Package, Truck, CreditCard, Clock, Calendar, Percent } from 'lucide-react';
import { formatCurrency, numberToWordsIndian } from '../../utils/formatters';

interface Step4TermsProps {
  warranty: string;
  packingForwarding: string;
  freight: string;
  paymentTerms: string;
  validity: string;
  deliveryPeriod: string;
  gstRate: number;
  subtotal: number;
  onUpdate: (fields: {
    warranty: string;
    packingForwarding: string;
    freight: string;
    paymentTerms: string;
    validity: string;
    deliveryPeriod: string;
    gstRate: number;
  }) => void;
}

export const Step4Terms: React.FC<Step4TermsProps> = ({
  warranty,
  packingForwarding,
  freight,
  paymentTerms,
  validity,
  deliveryPeriod,
  gstRate,
  subtotal,
  onUpdate,
}) => {
  const gstAmount = Math.round((subtotal * (gstRate || 0)) / 100);
  const grandTotal = subtotal + gstAmount;

  const handleField = (key: string, val: any) => {
    onUpdate({
      warranty,
      packingForwarding,
      freight,
      paymentTerms,
      validity,
      deliveryPeriod,
      gstRate,
      [key]: val,
    });
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="flex items-center space-x-2.5 bg-sky-50 border border-sky-200 rounded-2xl p-3.5">
        <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
          4
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Terms & Tax Summary</h3>
          <p className="text-xs text-slate-500">Commercial conditions and automated tax calculation</p>
        </div>
      </div>

      {/* Live Financial Summary Card */}
      <div className="bg-gradient-to-br from-[#0F2C59] to-[#1E3A8A] text-white rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-sky-400/20 pb-2.5">
          <span className="text-xs font-medium text-sky-200">Subtotal ({subtotal > 0 ? 'Taxable Value' : '0 Items'})</span>
          <span className="text-sm font-bold tracking-tight">₹{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between border-b border-sky-400/20 pb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-sky-200">GST ({gstRate}%)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-400/20 text-sky-200 border border-sky-400/30">
              CGST + SGST
            </span>
          </div>
          <span className="text-sm font-bold text-sky-200">₹{formatCurrency(gstAmount)}</span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300 block">Grand Total</span>
            <span className="text-[11px] text-sky-200/80 italic line-clamp-1 max-w-[200px] sm:max-w-xs">
              {numberToWordsIndian(grandTotal)}
            </span>
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            ₹{formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* Commercial Terms Form */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
        {/* GST Rate Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-sky-600" />
            GST Tax Percentage <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[0, 5, 12, 18, 28].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleField('gstRate', rate)}
                className={`py-2 rounded-xl text-xs font-bold border transition active:scale-95 ${
                  gstRate === rate
                    ? 'bg-[#0F2C59] border-[#0F2C59] text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* Warranty */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            Warranty
          </label>
          <input
            type="text"
            value={warranty}
            onChange={(e) => handleField('warranty', e.target.value)}
            placeholder="e.g. 12 Months against manufacturing defects"
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none"
          />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {['12 Months', '18 Months', '6 Months', 'No Warranty'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleField('warranty', opt)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Packing & Forwarding */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-sky-600" />
            Packing & Forwarding
          </label>
          <input
            type="text"
            value={packingForwarding}
            onChange={(e) => handleField('packingForwarding', e.target.value)}
            placeholder="e.g. Included in above rates"
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none"
          />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {['Included', 'Extra at actual', '2% Extra', '3% Extra'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleField('packingForwarding', opt)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Freight */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            Freight
          </label>
          <input
            type="text"
            value={freight}
            onChange={(e) => handleField('freight', e.target.value)}
            placeholder="e.g. Extra / To Pay"
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none"
          />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {['Extra / To Pay', 'Included / Door Delivery', 'At Actual'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleField('freight', opt)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Terms */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-sky-600" />
            Payment Terms
          </label>
          <input
            type="text"
            value={paymentTerms}
            onChange={(e) => handleField('paymentTerms', e.target.value)}
            placeholder="e.g. 100% Against Delivery"
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none"
          />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {['100% against delivery', '30% Adv, 70% against delivery', '100% Advance', '30 Days Credit'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleField('paymentTerms', opt)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Period & Validity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Delivery Period */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              Delivery Period
            </label>
            <input
              type="text"
              value={deliveryPeriod}
              onChange={(e) => handleField('deliveryPeriod', e.target.value)}
              placeholder="e.g. 1 to 2 Weeks"
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['1 to 2 Weeks', '2 to 3 Weeks', 'Ready Stock'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleField('deliveryPeriod', opt)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Validity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              Offer Validity
            </label>
            <input
              type="text"
              value={validity}
              onChange={(e) => handleField('validity', e.target.value)}
              placeholder="e.g. 30 Days"
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['30 Days', '15 Days', '45 Days'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleField('validity', opt)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
