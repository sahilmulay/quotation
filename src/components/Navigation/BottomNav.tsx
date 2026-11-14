import React from 'react';
import { FileText, ShoppingCart, Receipt, Settings } from 'lucide-react';

export type NavTab = 'quotation' | 'purchase' | 'proforma' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  quotationCount?: number;
  poCount?: number;
  piCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  quotationCount = 0,
  poCount = 0,
  piCount = 0,
}) => {
  const tabs: { key: NavTab; label: string; icon: React.ReactNode; color: string; activeBg: string }[] = [
    {
      key: 'quotation',
      label: 'Quotation',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-[#0F2C59]',
      activeBg: 'bg-sky-100',
    },
    {
      key: 'purchase',
      label: 'Purchase',
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'text-emerald-700',
      activeBg: 'bg-emerald-100',
    },
    {
      key: 'proforma',
      label: 'Proforma',
      icon: <Receipt className="w-5 h-5" />,
      color: 'text-purple-700',
      activeBg: 'bg-purple-100',
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      color: 'text-slate-700',
      activeBg: 'bg-slate-100',
    },
  ];

  const counts: Record<NavTab, number> = {
    quotation: quotationCount,
    purchase: poCount,
    proforma: piCount,
    settings: 0,
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg pb-safe">
      <div className="max-w-xl mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive ? tab.color + ' font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? tab.activeBg + ' ' + tab.color : ''}`}>
                {tab.icon}
              </div>
              {count > 0 && (
                <span className="absolute top-0 right-1 px-1.5 text-[10px] font-extrabold bg-[#0F2C59] text-white rounded-full">
                  {count}
                </span>
              )}
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
