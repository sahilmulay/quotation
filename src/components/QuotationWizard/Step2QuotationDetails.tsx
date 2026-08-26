import React from 'react';
import { Hash, Calendar, FileCode, Clock } from 'lucide-react';

interface Step2QuotationDetailsProps {
  quotationNo: string;
  quotationDate: string;
  refNo: string;
  refDate: string;
  onUpdate: (fields: {
    quotationNo: string;
    quotationDate: string;
    refNo: string;
    refDate: string;
  }) => void;
}

export const Step2QuotationDetails: React.FC<Step2QuotationDetailsProps> = ({
  quotationNo,
  quotationDate,
  refNo,
  refDate,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="flex items-center space-x-2.5 bg-sky-50 border border-sky-200 rounded-2xl p-3.5">
        <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
          2
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Quotation & Ref Info</h3>
          <p className="text-xs text-slate-500">Quotation number, dates, and client enquiry reference</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
        {/* Quotation Number & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Quotation No */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-sky-600" />
              Quotation No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={quotationNo}
              onChange={(e) => onUpdate({ quotationNo: e.target.value, quotationDate, refNo, refDate })}
              placeholder="e.g. Q-101"
              className="w-full text-base font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Auto-incremented sequentially</span>
          </div>

          {/* Quotation Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              Quotation Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={quotationDate}
              onChange={(e) => onUpdate({ quotationNo, quotationDate: e.target.value, refNo, refDate })}
              className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3"></div>

        {/* Ref Number & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Reference No */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-sky-600" />
              Reference No.
            </label>
            <input
              type="text"
              value={refNo}
              onChange={(e) => onUpdate({ quotationNo, quotationDate, refNo: e.target.value, refDate })}
              placeholder="e.g. ENQ/2026/089 or Oral"
              className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none"
            />
          </div>

          {/* Reference Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              Reference Date
            </label>
            <input
              type="date"
              value={refDate}
              onChange={(e) => onUpdate({ quotationNo, quotationDate, refNo, refDate: e.target.value })}
              className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
