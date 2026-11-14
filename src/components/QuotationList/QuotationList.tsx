import React, { useState } from 'react';
import { CompanyDetails, Quotation, TemplateConfig } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadQuotationPDF, printQuotationPDF } from '../../services/pdfGenerator';
import { db } from '../../db/db';
import { 
  Search, 
  FileText, 
  Edit3, 
  Trash2, 
  Download, 
  Printer, 
  Plus, 
  Calendar 
} from 'lucide-react';

interface QuotationListProps {
  quotations: Quotation[];
  company: CompanyDetails;
  template: TemplateConfig;
  onEditQuotation: (quote: Quotation) => void;
  onCreateNew: () => void;
}

export const QuotationList: React.FC<QuotationListProps> = ({
  quotations,
  company,
  template,
  onEditQuotation,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.refNo && q.refNo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (quote: Quotation) => {
    if (confirm(`Delete Quotation ${quote.quotationNo} for ${quote.customerName}?`)) {
      if (quote.id) {
        await db.quotations.delete(quote.id);
        setSelectedQuote(null);
      }
    }
  };

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by quote #, customer, or ref..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {['ALL', 'Approved', 'Sent', 'Draft'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition active:scale-95 ${
                statusFilter === st
                  ? 'bg-[#0F2C59] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Quotes' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotation List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No quotations found</p>
            <p className="text-xs text-slate-400 mb-4">
              {searchQuery ? 'Try another search query' : 'Create your first quotation in under 2 mins'}
            </p>
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2C59] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#1E3A8A] active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quote</span>
            </button>
          </div>
        ) : (
          filtered.map((quote) => (
            <div
              key={quote.id || quote.quotationNo}
              onClick={() => setSelectedQuote(quote)}
              className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 hover:border-sky-400 transition cursor-pointer active:scale-[0.99] space-y-2"
            >
              {/* Card Header: Q No & Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#0F2C59] tracking-tight">
                    {quote.quotationNo}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(quote.quotationDate)}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    quote.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : quote.status === 'Sent'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {quote.status || 'Draft'}
                </span>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">
                  {quote.customerName}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {quote.customerAddress}
                </p>
              </div>

              {/* Card Footer: Items & Grand Total */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  {quote.items?.length || 0} {quote.items?.length === 1 ? 'item' : 'items'}
                </span>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total:</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{formatCurrency(quote.subtotal || quote.grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Menu / Bottom Sheet for Selected Quote */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-4 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-sky-700 block">
                  {selectedQuote.quotationNo}
                </span>
                <h3 className="font-bold text-slate-800 text-base line-clamp-1">
                  {selectedQuote.customerName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Exactly 4 Clean Action Buttons */}
            <div className="space-y-2.5">
              {/* 1. Edit Quotation */}
              <button
                type="button"
                onClick={() => {
                  onEditQuotation(selectedQuote);
                  setSelectedQuote(null);
                }}
                className="w-full py-3.5 px-4 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Edit3 className="w-4 h-4 text-sky-300" />
                <span>Edit Quotation</span>
              </button>

              {/* 2. Download PDF & 3. Print PDF (Grid) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Download PDF */}
                <button
                  type="button"
                  onClick={() => {
                    downloadQuotationPDF(selectedQuote, company, template, 'full');
                    setSelectedQuote(null);
                  }}
                  className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <Download className="w-4 h-4 text-[#0F2C59]" />
                  <span>Download PDF</span>
                </button>

                {/* Print PDF */}
                <button
                  type="button"
                  onClick={() => {
                    printQuotationPDF(selectedQuote, company, template, 'full');
                    setSelectedQuote(null);
                  }}
                  className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span>Print Document</span>
                </button>
              </div>

              {/* 4. Delete Quotation */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedQuote)}
                  className="w-full py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Quotation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
