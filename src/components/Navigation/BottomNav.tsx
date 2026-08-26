import React from 'react';
import { PlusCircle, FileSpreadsheet, Users } from 'lucide-react';

export type NavTab = 'create' | 'list' | 'customers';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  quotationCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  quotationCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg pb-safe">
      <div className="max-w-xl mx-auto px-4 py-2 flex items-center justify-around">
        {/* Create Quote (Primary Tab) */}
        <button
          onClick={() => onTabChange('create')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-150 active:scale-95 ${
            activeTab === 'create'
              ? 'text-[#0F2C59] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'create' ? 'bg-sky-100 text-[#0F2C59]' : ''}`}>
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-xs mt-0.5 tracking-tight">New Quote</span>
        </button>

        {/* Quotes List */}
        <button
          onClick={() => onTabChange('list')}
          className={`relative flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-150 active:scale-95 ${
            activeTab === 'list'
              ? 'text-[#0F2C59] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'list' ? 'bg-sky-100 text-[#0F2C59]' : ''}`}>
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          {quotationCount > 0 && (
            <span className="absolute top-0 right-3 px-1.5 py-0.2 text-[10px] font-extrabold bg-[#0F2C59] text-white rounded-full">
              {quotationCount}
            </span>
          )}
          <span className="text-xs mt-0.5 tracking-tight">Quotations</span>
        </button>

        {/* Customers */}
        <button
          onClick={() => onTabChange('customers')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-150 active:scale-95 ${
            activeTab === 'customers'
              ? 'text-[#0F2C59] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'customers' ? 'bg-sky-100 text-[#0F2C59]' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs mt-0.5 tracking-tight">Add Items/Customers</span>
        </button>
      </div>
    </nav>
  );
};
