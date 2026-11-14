import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  db, 
  initializeDatabase, 
  getCompanyDetails, 
  getActiveTemplateConfig 
} from './db/db';
import { CompanyDetails, Quotation, PurchaseOrder, ProformaInvoice, TemplateConfig } from './types';
import { DEFAULT_COMPANY_DETAILS, DEFAULT_TEMPLATE_CONFIG, SAMPLE_QUOTATIONS } from './db/defaultData';
import { Header } from './components/Navigation/Header';
import { BottomNav, NavTab } from './components/Navigation/BottomNav';

// Quotation
import { QuotationWizard } from './components/QuotationWizard/QuotationWizard';
import { QuotationList } from './components/QuotationList/QuotationList';

// Purchase Order
import { PurchaseOrderWizard } from './components/PurchaseOrderWizard/PurchaseOrderWizard';
import { PurchaseOrderList } from './components/PurchaseOrderList/PurchaseOrderList';

// Proforma Invoice
import { ProformaWizard } from './components/ProformaWizard/ProformaWizard';
import { ProformaList } from './components/ProformaList/ProformaList';

// Settings
import { SettingsView } from './components/Settings/SettingsView';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('quotation');

  // Sub-views within each tab: 'wizard' | 'list'
  const [quotationView, setQuotationView] = useState<'list' | 'wizard'>('list');
  const [purchaseView, setPurchaseView] = useState<'list' | 'wizard'>('list');
  const [proformaView, setProformaView] = useState<'list' | 'wizard'>('list');

  // Active items being edited
  const [activeQuotation, setActiveQuotation] = useState<Quotation | null>(null);
  const [activePo, setActivePo] = useState<PurchaseOrder | null>(null);
  const [activePi, setActivePi] = useState<ProformaInvoice | null>(null);

  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(DEFAULT_COMPANY_DETAILS);
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>(DEFAULT_TEMPLATE_CONFIG);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Reactive live queries
  const quotations = useLiveQuery(async () => {
    try { return await db.quotations.orderBy('createdAt').reverse().toArray(); }
    catch { try { return await db.quotations.toArray(); } catch { return SAMPLE_QUOTATIONS; } }
  }, []) || [];

  const purchaseOrders = useLiveQuery(async () => {
    try { return await db.purchaseOrders.orderBy('createdAt').reverse().toArray(); }
    catch { try { return await db.purchaseOrders.toArray(); } catch { return []; } }
  }, []) || [];

  const proformaInvoices = useLiveQuery(async () => {
    try { return await db.proformaInvoices.orderBy('createdAt').reverse().toArray(); }
    catch { try { return await db.proformaInvoices.toArray(); } catch { return []; } }
  }, []) || [];

  const customers = useLiveQuery(async () => {
    try { return await db.customers.orderBy('name').toArray(); }
    catch { try { return await db.customers.toArray(); } catch { return []; } }
  }, []) || [];

  // Init DB
  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase();
        const comp = await getCompanyDetails();
        const tmpl = await getActiveTemplateConfig();
        setCompanyDetails(comp);
        setTemplateConfig(tmpl);
      } catch (err) {
        console.error('App initialization error:', err);
        setCompanyDetails(DEFAULT_COMPANY_DETAILS);
        setTemplateConfig(DEFAULT_TEMPLATE_CONFIG);
      } finally {
        setIsInitialized(true);
      }
    }
    loadData();
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F2C59] text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-sky-200">Starting Apex Industries App...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-3 sm:px-4 py-2">

        {/* ========== QUOTATION TAB ========== */}
        {activeTab === 'quotation' && quotationView === 'list' && (
          <div>
            {/* New Quote button at top */}
            <div className="mb-3 pt-2">
              <button
                onClick={() => { setActiveQuotation(null); setQuotationView('wizard'); }}
                className="w-full py-3 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                <span>＋ New Quotation</span>
              </button>
            </div>
            <QuotationList
              quotations={quotations}
              company={companyDetails}
              template={templateConfig}
              onEditQuotation={(q) => { setActiveQuotation(q); setQuotationView('wizard'); }}
              onCreateNew={() => { setActiveQuotation(null); setQuotationView('wizard'); }}
            />
          </div>
        )}

        {activeTab === 'quotation' && quotationView === 'wizard' && (
          <QuotationWizard
            key={activeQuotation ? activeQuotation.id || 'edit-q' : 'new-q'}
            initialQuotation={activeQuotation}
            company={companyDetails}
            template={templateConfig}
            savedCustomers={customers}
            onFinish={() => { setActiveQuotation(null); setQuotationView('list'); }}
          />
        )}

        {/* ========== PURCHASE ORDER TAB ========== */}
        {activeTab === 'purchase' && purchaseView === 'list' && (
          <div>
            <div className="mb-3 pt-2">
              <button
                onClick={() => { setActivePo(null); setPurchaseView('wizard'); }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                <span>＋ New Purchase Order</span>
              </button>
            </div>
            <PurchaseOrderList
              purchaseOrders={purchaseOrders}
              company={companyDetails}
              onEditPo={(po) => { setActivePo(po); setPurchaseView('wizard'); }}
              onCreateNew={() => { setActivePo(null); setPurchaseView('wizard'); }}
            />
          </div>
        )}

        {activeTab === 'purchase' && purchaseView === 'wizard' && (
          <PurchaseOrderWizard
            key={activePo ? activePo.id || 'edit-po' : 'new-po'}
            initialPo={activePo}
            company={companyDetails}
            savedCustomers={customers}
            onFinish={() => { setActivePo(null); setPurchaseView('list'); }}
          />
        )}

        {/* ========== PROFORMA INVOICE TAB ========== */}
        {activeTab === 'proforma' && proformaView === 'list' && (
          <div>
            <div className="mb-3 pt-2">
              <button
                onClick={() => { setActivePi(null); setProformaView('wizard'); }}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                <span>＋ New Proforma Invoice</span>
              </button>
            </div>
            <ProformaList
              proformaInvoices={proformaInvoices}
              company={companyDetails}
              onEditPi={(pi) => { setActivePi(pi); setProformaView('wizard'); }}
              onCreateNew={() => { setActivePi(null); setProformaView('wizard'); }}
            />
          </div>
        )}

        {activeTab === 'proforma' && proformaView === 'wizard' && (
          <ProformaWizard
            key={activePi ? activePi.id || 'edit-pi' : 'new-pi'}
            initialPi={activePi}
            company={companyDetails}
            savedCustomers={customers}
            onFinish={() => { setActivePi(null); setProformaView('list'); }}
          />
        )}

        {/* ========== SETTINGS TAB ========== */}
        {activeTab === 'settings' && (
          <SettingsView
            company={companyDetails}
            onCompanyUpdated={(details) => setCompanyDetails(details)}
            onDataRestored={async () => {
              const comp = await getCompanyDetails();
              const tmpl = await getActiveTemplateConfig();
              setCompanyDetails(comp);
              setTemplateConfig(tmpl);
            }}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          // Reset to list view when switching tabs
          if (tab === 'quotation') setQuotationView('list');
          if (tab === 'purchase') setPurchaseView('list');
          if (tab === 'proforma') setProformaView('list');
          handleTabChange(tab);
        }}
        quotationCount={quotations.length}
        poCount={purchaseOrders.length}
        piCount={proformaInvoices.length}
      />
    </div>
  );
}

export default App;
