import React, { useState } from 'react';
import { Customer } from '../../types';
import { Building2, MapPin, Search, UserCheck } from 'lucide-react';

interface Step1CustomerProps {
  customerName: string;
  customerAddress: string;
  onUpdate: (fields: { customerName: string; customerAddress: string }) => void;
  savedCustomers: Customer[];
  onSaveNewCustomer?: (cust: Customer) => void;
}

export const Step1Customer: React.FC<Step1CustomerProps> = ({
  customerName,
  customerAddress,
  onUpdate,
  savedCustomers,
  onSaveNewCustomer,
}) => {
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveToDb, setSaveToDb] = useState(true);

  const filteredCustomers = savedCustomers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCustomer = (customer: Customer) => {
    onUpdate({
      customerName: customer.name,
      customerAddress: customer.address,
    });
    setShowCustomerPicker(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Picker trigger */}
      <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-2xl p-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Customer Details</h3>
            <p className="text-xs text-slate-500">Enter recipient company & address</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomerPicker(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2C59] text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-[#1E3A8A] active:scale-95 transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Pick Saved</span>
        </button>
      </div>

      {/* Main Input Form */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
        {/* Customer Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            Customer / Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => onUpdate({ customerName: e.target.value, customerAddress })}
            placeholder="e.g. Kirloskar Brothers Limited"
            className="w-full text-base font-semibold px-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 transition outline-none"
          />
        </div>

        {/* Customer Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            Customer Address <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={customerAddress}
            onChange={(e) => onUpdate({ customerName, customerAddress: e.target.value })}
            placeholder="e.g. Plot No. 12, Kirloskarwadi, Dist. Sangli - 416308, Maharashtra"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 transition outline-none resize-none"
          />
        </div>

        {/* Quick Save Customer Checkbox */}
        {onSaveNewCustomer && customerName.trim() && (
          <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-xs text-slate-700 select-none">
            <input
              type="checkbox"
              checked={saveToDb}
              onChange={(e) => setSaveToDb(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="font-medium">Save customer to directory for instant future reuse</span>
          </label>
        )}
      </div>

      {/* Customer Picker Modal Drawer */}
      {showCustomerPicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-800">Select Existing Customer</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomerPicker(false)}
                className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer name or city..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Customer List */}
            <div className="overflow-y-auto p-3 space-y-2 flex-1">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No matching customers found.
                </div>
              ) : (
                filteredCustomers.map((cust) => (
                  <button
                    key={cust.id || cust.name}
                    type="button"
                    onClick={() => handleSelectCustomer(cust)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition flex items-start justify-between gap-2 active:scale-[0.99]"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{cust.name}</div>
                      <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{cust.address}</div>
                      {cust.phone && (
                        <div className="text-[11px] text-sky-700 font-medium mt-1">📞 {cust.phone}</div>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                      Select
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
