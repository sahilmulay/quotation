import React, { useState } from 'react';
import { Customer } from '../../types';
import { db } from '../../db/db';
import { 
  Users, 
  Search, 
  Plus, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileBadge, 
  Edit2, 
  Trash2, 
  PlusCircle,
  PackagePlus
} from 'lucide-react';

interface CustomerManagerProps {
  customers: Customer[];
  onSelectForQuote: (cust: Customer) => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  customers,
  onSelectForQuote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Form state for Add / Edit
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstn, setGstn] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
  );

  const openNewCustomerModal = () => {
    setName('');
    setAddress('');
    setPhone('');
    setEmail('');
    setGstn('');
    setEditingCustomer(null);
    setIsNewModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setAddress(cust.address);
    setPhone(cust.phone || '');
    setEmail(cust.email || '');
    setGstn(cust.gstn || '');
    setIsNewModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    if (editingCustomer && editingCustomer.id) {
      await db.customers.update(editingCustomer.id, {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        gstn: gstn.trim().toUpperCase() || undefined,
      });
    } else {
      await db.customers.add({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        gstn: gstn.trim().toUpperCase() || undefined,
        createdAt: Date.now(),
      });
    }

    setIsNewModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async (cust: Customer) => {
    if (confirm(`Are you sure you want to delete "${cust.name}"?`)) {
      if (cust.id) {
        await db.customers.delete(cust.id);
      }
    }
  };

  const handleOpenAddItemPicker = () => {
    if (customers.length === 1) {
      onSelectForQuote(customers[0]);
    } else {
      setIsAddItemModalOpen(true);
    }
  };

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Top Header & Search */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            <h2 className="font-bold text-slate-800 text-base">Customer Directory</h2>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Add Items Button */}
            <button
              type="button"
              onClick={handleOpenAddItemPicker}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition"
              title="Add Items for a customer"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>Add Items</span>
            </button>

            {/* Add Customer Button */}
            <button
              type="button"
              onClick={openNewCustomerModal}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, city, phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-400 mb-4">Add frequent client companies for one-tap quotation filling</p>
            <button
              type="button"
              onClick={openNewCustomerModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2C59] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#1E3A8A] active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Customer</span>
            </button>
          </div>
        ) : (
          filtered.map((cust) => (
            <div
              key={cust.id || cust.name}
              className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 space-y-2.5"
            >
              {/* Customer Title */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{cust.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{cust.address}</span>
                  </p>
                </div>

                {/* Prominent Add Items Option for this Customer */}
                <button
                  type="button"
                  onClick={() => onSelectForQuote(cust)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 flex items-center gap-1.5 shrink-0 active:scale-95 transition shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Add Items</span>
                </button>
              </div>

              {/* Contact Meta Details */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100">
                {cust.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-sky-600" />
                    {cust.phone}
                  </span>
                )}
                {cust.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-sky-600" />
                    {cust.email}
                  </span>
                )}
                {cust.gstn && (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                    <FileBadge className="w-3 h-3 text-sky-600" />
                    GSTIN: {cust.gstn}
                  </span>
                )}
              </div>

              {/* Edit / Delete Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openEditModal(cust)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCustomer(cust)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-800 px-2 py-1 rounded-md hover:bg-rose-50 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Select Customer to Add Items Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Select Customer to Add Items</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 max-h-[60vh]">
              {customers.map((c) => (
                <button
                  key={c.id || c.name}
                  type="button"
                  onClick={() => {
                    setIsAddItemModalOpen(false);
                    onSelectForQuote(c);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center justify-between gap-2 active:scale-[0.99]"
                >
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{c.name}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{c.address}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold shrink-0">
                    + Add Items
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveCustomer} className="p-4 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Customer / Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kirloskar Brothers Limited"
                  className="w-full text-sm font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot No, Industrial Area, City, PIN Code, State"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  value={gstn}
                  onChange={(e) => setGstn(e.target.value.toUpperCase())}
                  placeholder="27XXXXXXXXXXXXX"
                  className="w-full text-xs font-mono font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50 outline-none uppercase"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
