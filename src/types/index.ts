export interface QuotationItem {
  id: string;
  srNo: number;
  description: string;
  quantity: number;
  unitRate: number;
  amount: number;
}

export interface Customer {
  id?: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  gstn?: string;
  createdAt?: number;
}

export interface Quotation {
  id?: number;
  quotationNo: string;
  quotationDate: string;
  refNo: string;
  refDate: string;
  customerId?: number;
  customerName: string;
  customerAddress: string;
  items: QuotationItem[];
  warranty: string;
  packingForwarding: string;
  freight: string;
  paymentTerms: string;
  validity: string;
  deliveryPeriod: string;
  gstRate: number;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  createdAt: number;
  updatedAt: number;
}

export interface CompanyDetails {
  name: string;
  address: string;
  phones: string;
  email: string;
  gstn: string;
  signatoryName: string;
  designation: string;
  showStamp: boolean;
  stampImage?: string; // base64 or SVG
  logoImage?: string;
  nextQuoteNumber: number;
  quotePrefix: string;
}

export interface FieldPosition {
  id: string;
  label: string;
  x: number; // in mm
  y: number; // in mm
  width: number; // in mm
  height: number; // in mm
  fontSize: number; // in pt
  fontWeight: 'normal' | 'bold';
  align: 'left' | 'center' | 'right';
  visible: boolean;
}

export interface TemplateConfig {
  id?: number;
  name: string;
  isDefault: boolean;
  paperSize: 'a4';
  orientation: 'portrait';
  printMode: 'full' | 'overlay'; // full = render everything, overlay = only values for pre-printed letterheads
  positions: Record<string, FieldPosition>;
  updatedAt?: number;
}

export interface AppBackup {
  version: string;
  exportDate: string;
  quotations: Quotation[];
  customers: Customer[];
  companyDetails: CompanyDetails;
  templateConfig: TemplateConfig;
}
