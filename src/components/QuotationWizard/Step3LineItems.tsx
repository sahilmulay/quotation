import React from 'react';
import { QuotationItem } from '../../types';
import { Plus, Trash2, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface Step3LineItemsProps {
  items: QuotationItem[];
  onUpdateItems: (items: QuotationItem[]) => void;
}

const COMMON_PRESETS = [
  'VFD Control Panel 5 HP',
  'PLC Automation Panel',
  'Digital Temperature Controller',
  'AC Drive 3-Phase',
  'RTD PT-100 Sensor',
  'Installation & Commissioning Charges',
  'Panel Wiring & Testing Charges',
];

export const Step3LineItems: React.FC<Step3LineItemsProps> = ({
  items,
  onUpdateItems,
}) => {
  const handleAddItem = (presetDescription?: string) => {
    // If there is only 1 item and it is empty, fill it instead of creating a 2nd item
    if (
      items.length === 1 &&
      !items[0].description.trim() &&
      (!items[0].unitRate || items[0].unitRate === 0)
    ) {
      const updated = [
        {
          ...items[0],
          description: presetDescription || '',
        },
      ];
      onUpdateItems(updated);
      return;
    }

    const newItem: QuotationItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      srNo: items.length + 1,
      description: presetDescription || '',
      quantity: 1,
      unitRate: 0,
      amount: 0,
    };
    onUpdateItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items
      .filter((_, i) => i !== index)
      .map((item, i) => ({
        ...item,
        srNo: i + 1,
      }));
    onUpdateItems(updated);
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitRate') {
      const qty = field === 'quantity' ? Number(value) || 0 : item.quantity;
      const rate = field === 'unitRate' ? Number(value) || 0 : item.unitRate;
      item.amount = qty * rate;
    }

    updated[index] = item;
    onUpdateItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const hasIncompletePrices = items.some(
    (it) => it.description.trim().length > 0 && (!it.unitRate || it.unitRate <= 0)
  );

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-2xl p-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
            3
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Line Items & Rates</h3>
            <p className="text-xs text-slate-500">Add products, parts & automated calculations</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Subtotal</span>
          <span className="text-sm font-extrabold text-[#0F2C59]">₹{formatCurrency(subtotal)}</span>
        </div>
      </div>

      {/* Warning message if prices are missing */}
      {hasIncompletePrices && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Please enter Unit Rate (₹) for all items before continuing to Next Step.</span>
        </div>
      )}

      {/* Quick Preset Chips */}
      <div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Add Popular Items</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAddItem(preset)}
              className="text-xs bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 text-slate-700 font-medium px-2.5 py-1 rounded-lg transition active:scale-95 flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3 h-3 text-sky-600" />
              <span>{preset}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Line Items List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No items added yet</p>
            <p className="text-xs text-slate-400 mb-4">Click the button below to add your first line item</p>
            <button
              type="button"
              onClick={() => handleAddItem()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2C59] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#1E3A8A] active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Item</span>
            </button>
          </div>
        ) : (
          items.map((item, index) => {
            const isMissingRate = item.description.trim().length > 0 && (!item.unitRate || item.unitRate <= 0);

            return (
              <div
                key={item.id || index}
                className={`bg-white rounded-2xl p-3.5 shadow-sm border space-y-3 relative group transition ${
                  isMissingRate ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-slate-200/90'
                }`}
              >
                {/* Item Card Header */}
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    #{item.srNo}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Row Amount</span>
                      <div className="text-sm font-bold text-slate-900">
                        ₹{formatCurrency(item.amount)}
                      </div>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition active:scale-90"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Item Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="e.g. 5 HP AC Drive Panel with Schneider VFD and Enclosure"
                    className="w-full text-sm font-medium px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none resize-none"
                  />
                </div>

                {/* Quantity & Unit Rate Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Quantity */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="1"
                      className="w-full text-base font-bold px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50/50 outline-none text-center"
                    />
                  </div>

                  {/* Unit Rate */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Unit Rate (₹) <span className="text-red-500">*</span></span>
                      {isMissingRate && <span className="text-amber-600 text-[10px]">Required</span>}
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={item.unitRate ? item.unitRate : ''}
                      onChange={(e) => handleItemChange(index, 'unitRate', parseFloat(e.target.value) || 0)}
                      placeholder="Enter price..."
                      className={`w-full text-base font-bold px-3 py-2 rounded-xl border outline-none text-right transition ${
                        isMissingRate
                          ? 'border-amber-400 bg-amber-50/40 focus:ring-2 focus:ring-amber-500'
                          : 'border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-sky-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Add More Items Button */}
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => handleAddItem()}
            className="w-full py-3 bg-sky-50 hover:bg-sky-100 border-2 border-dashed border-sky-300 text-sky-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 text-sky-600" />
            <span>Add Another Item</span>
          </button>
        )}
      </div>
    </div>
  );
};
