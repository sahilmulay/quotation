import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  db, 
  initializeDatabase, 
  getCompanyDetails, 
  getActiveTemplateConfig 
} from './db/db';
import { CompanyDetails, Customer, Quotation, TemplateConfig } from './types';
import { DEFAULT_COMPANY_DETAILS, DEFAULT_TEMPLATE_CONFIG, SAMPLE_QUOTATIONS } from './db/defaultData';
import { Header } from './components/Navigation/Header';
import { BottomNav, NavTab } from './components/Navigation/BottomNav';
import { QuotationWizard } from './components/QuotationWizard/QuotationWizard';
import { QuotationList } from './components/QuotationList/QuotationList';
import { CustomerManager } from './components/CustomerManager/CustomerManager';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('create');
  const [activeQuotationToEdit, setActiveQuotationToEdit] = useState<Quotation | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(DEFAULT_COMPANY_DETAILS);
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>(DEFAULT_TEMPLATE_CONFIG);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Reactive queries via Dexie with fallback
  const quotations = useLiveQuery(async () => {
    try {
      return await db.quotations.orderBy('createdAt').reverse().toArray();
    } catch {
      try {
        return await db.quotations.toArray();
      } catch {
        return SAMPLE_QUOTATIONS;
      }
    }
  }, []) || [];

  const customers = useLiveQuery(async () => {
    try {
      return await db.customers.orderBy('name').toArray();
    } catch {
      try {
        return await db.customers.toArray();
      } catch {
        return [];
      }
    }
  }, []) || [];

  // Database initialization & load settings
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

  const handleEditQuotation = (quote: Quotation) => {
    setActiveQuotationToEdit(quote);
    setActiveTab('create');
  };

  const handleSelectCustomerForQuote = (cust: Customer) => {
    setActiveQuotationToEdit({
      quotationNo: '',
      quotationDate: new Date().toISOString().split('T')[0],
      refNo: '',
      refDate: '',
      customerName: cust.name,
      customerAddress: cust.address,
      items: [{ id: 'item-1', srNo: 1, description: '', quantity: 1, unitRate: 0, amount: 0 }],
      warranty: '12 Months against manufacturing defects',
      packingForwarding: 'Included in above rates',
      freight: 'Extra / To Pay',
      paymentTerms: '100% against delivery',
      validity: '30 Days',
      deliveryPeriod: '1 to 2 Weeks',
      gstRate: 18,
      subtotal: 0,
      gstAmount: 0,
      grandTotal: 0,
      status: 'Draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setActiveTab('create');
  };

  const handleFinishWizard = () => {
    setActiveQuotationToEdit(null);
    setActiveTab('list');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F2C59] text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-sky-200">Starting Apex Quotation App...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Mobile Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-3 sm:px-4 py-2">
        {activeTab === 'create' && (
          <QuotationWizard
            key={activeQuotationToEdit ? activeQuotationToEdit.id || 'edit' : 'new'}
            initialQuotation={activeQuotationToEdit}
            company={companyDetails}
            template={templateConfig}
            savedCustomers={customers}
            onFinish={handleFinishWizard}
          />
        )}

        {activeTab === 'list' && (
          <QuotationList
            quotations={quotations}
            company={companyDetails}
            template={templateConfig}
            onEditQuotation={handleEditQuotation}
            onCreateNew={() => {
              setActiveQuotationToEdit(null);
              setActiveTab('create');
            }}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManager
            customers={customers}
            onSelectForQuote={handleSelectCustomerForQuote}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'create' && activeTab !== 'create') {
            setActiveQuotationToEdit(null);
          }
          setActiveTab(tab);
        }}
        quotationCount={quotations.length}
      />
    </div>
  );
}
export default App;
