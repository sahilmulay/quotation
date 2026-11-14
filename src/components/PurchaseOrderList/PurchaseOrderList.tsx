import React, { useState } from 'react';
import { CompanyDetails, PurchaseOrder } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadPurchaseOrderPDF, printPurchaseOrderPDF } from '../../services/purchaseOrderPdfGenerator';
import { db } from '../../db/db';
import { Search, FileText, Edit3, Trash2, Download, Printer, Plus, Calendar } from 'lucide-react';

interface PurchaseOrderListProps {
  purchaseOrders: PurchaseOrder[];
  company: CompanyDetails;
  onEditPo: (po: PurchaseOrder) => void;
  onCreateNew: () => void;
}

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  purchaseOrders, company, onEditPo, onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  const filtered = purchaseOrders.filter(p =>
    p.poNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.refNo && p.refNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (po: PurchaseOrder) => {
    if (confirm(`Delete Purchase Order ${po.poNo} for ${po.customerName}?`)) {
      if (po.id) { await db.purchaseOrders.delete(po.id); setSelectedPo(null); }
    }
  };

  return (
    <div className="space-y-4 pb-20 pt-2">
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search PO #, customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
      </div>

      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No purchase orders found</p>
            <p className="text-xs text-slate-400 mb-4">{searchQuery ? 'Try another search' : 'Create your first purchase order'}</p>
            <button onClick={onCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 active:scale-95 transition">
              <Plus className="w-4 h-4" /><span>New Purchase Order</span>
            </button>
          </div>
        ) : (
          filtered.map(po => (
            <div key={po.id || po.poNo} onClick={() => setSelectedPo(po)}
              className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 hover:border-emerald-400 transition cursor-pointer active:scale-[0.99] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-emerald-700 tracking-tight">{po.poNo}</span>
                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />{formatDate(po.poDate)}
                  </span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                  po.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                  po.status === 'Sent' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'}`}>
                  {po.status || 'Draft'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">{po.customerName}</h4>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{po.customerAddress}</p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  {po.items?.length || 0} {po.items?.length === 1 ? 'item' : 'items'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total:</span>
                  <span className="text-sm font-extrabold text-slate-900">₹{formatCurrency(po.subtotal || po.grandTotal)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-4 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-emerald-700 block">{selectedPo.poNo}</span>
                <h3 className="font-bold text-slate-800 text-base line-clamp-1">{selectedPo.customerName}</h3>
              </div>
              <button onClick={() => setSelectedPo(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">✕</button>
            </div>
            <div className="space-y-2.5">
              <button onClick={() => { onEditPo(selectedPo); setSelectedPo(null); }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition">
                <Edit3 className="w-4 h-4 text-emerald-200" /><span>Edit Purchase Order</span>
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => { downloadPurchaseOrderPDF(selectedPo, company); setSelectedPo(null); }}
                  className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition">
                  <Download className="w-4 h-4 text-emerald-700" /><span>Download PDF</span>
                </button>
                <button onClick={() => { printPurchaseOrderPDF(selectedPo, company); setSelectedPo(null); }}
                  className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition">
                  <Printer className="w-4 h-4 text-slate-700" /><span>Print Document</span>
                </button>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button onClick={() => handleDelete(selectedPo)}
                  className="w-full py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95">
                  <Trash2 className="w-4 h-4" /><span>Delete Purchase Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
