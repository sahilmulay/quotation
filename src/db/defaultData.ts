import { CompanyDetails, Customer, Quotation, TemplateConfig } from '../types';

export const DEFAULT_COMPANY_DETAILS: CompanyDetails = {
  name: 'APEX INDUSTRIES',
  address: 'E-9, MIDC, Kupwad, SANGLI – 416436 (MS)',
  phones: '9850060698 / 8855003009',
  email: 'apexindustries92@gmail.com',
  gstn: '27ABDPM6031D1Z1',
  signatoryName: 'Mr. Dilip Mulay',
  designation: 'Authorized Signatory',
  showStamp: true,
  nextQuoteNumber: 101,
  quotePrefix: 'Q-',
};

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  name: 'Official Apex Industries Standard',
  isDefault: true,
  paperSize: 'a4',
  orientation: 'portrait',
  printMode: 'full',
  positions: {
    // Header & Company
    quotationTitle: { id: 'quotationTitle', label: 'Quotation Title', x: 105, y: 22, width: 80, height: 8, fontSize: 16, fontWeight: 'bold', align: 'center', visible: true },
    companyName: { id: 'companyName', label: 'Company Name', x: 105, y: 39, width: 140, height: 7, fontSize: 15, fontWeight: 'bold', align: 'center', visible: true },
    companyAddress: { id: 'companyAddress', label: 'Company Address', x: 105, y: 45, width: 140, height: 5, fontSize: 9.5, fontWeight: 'normal', align: 'center', visible: true },
    companyPhones: { id: 'companyPhones', label: 'Company Phone', x: 105, y: 50, width: 140, height: 5, fontSize: 9.5, fontWeight: 'normal', align: 'center', visible: true },
    companyEmail: { id: 'companyEmail', label: 'Company Email', x: 105, y: 54.5, width: 140, height: 5, fontSize: 9.5, fontWeight: 'normal', align: 'center', visible: true },
    companyGstn: { id: 'companyGstn', label: 'Company GSTN', x: 105, y: 59.5, width: 140, height: 5, fontSize: 10, fontWeight: 'bold', align: 'center', visible: true },
    
    // Customer Info Box
    customerToLabel: { id: 'customerToLabel', label: '"To," Label', x: 14, y: 67, width: 15, height: 5, fontSize: 10, fontWeight: 'bold', align: 'left', visible: true },
    customerName: { id: 'customerName', label: 'Customer Name', x: 14, y: 73, width: 98, height: 6, fontSize: 10.5, fontWeight: 'bold', align: 'left', visible: true },
    customerAddress: { id: 'customerAddress', label: 'Customer Address', x: 14, y: 79, width: 98, height: 12, fontSize: 9, fontWeight: 'normal', align: 'left', visible: true },
    
    // Quotation Details Box
    quoteNo: { id: 'quoteNo', label: 'Quotation No Value', x: 135, y: 69, width: 28, height: 5, fontSize: 9.5, fontWeight: 'bold', align: 'left', visible: true },
    quoteDate: { id: 'quoteDate', label: 'Quotation Date Value', x: 177, y: 69, width: 20, height: 5, fontSize: 9.5, fontWeight: 'normal', align: 'left', visible: true },
    refNo: { id: 'refNo', label: 'Ref No Value', x: 135, y: 81, width: 28, height: 5, fontSize: 9.5, fontWeight: 'normal', align: 'left', visible: true },
    refDate: { id: 'refDate', label: 'Ref Date Value', x: 177, y: 81, width: 20, height: 5, fontSize: 9.5, fontWeight: 'normal', align: 'left', visible: true },
    
    // Salutation
    salutation1: { id: 'salutation1', label: 'Salutation Line 1', x: 14, y: 93, width: 50, height: 5, fontSize: 9.5, fontWeight: 'bold', align: 'left', visible: true },
    salutation2: { id: 'salutation2', label: 'Salutation Line 2', x: 26, y: 99, width: 160, height: 5, fontSize: 9.5, fontWeight: 'normal', align: 'left', visible: true },
    
    // Table content start (Y coordinate of first item row with clean margin below header line)
    tableStartY: { id: 'tableStartY', label: 'Table Content Start', x: 10, y: 116.5, width: 190, height: 95, fontSize: 9.5, fontWeight: 'normal', align: 'left', visible: true },
    
    // Terms & Conditions Left
    warranty: { id: 'warranty', label: 'Warranty Value', x: 31, y: 224, width: 85, height: 5, fontSize: 9, fontWeight: 'normal', align: 'left', visible: true },
    packing: { id: 'packing', label: 'Packing & Forwarding', x: 48, y: 230.5, width: 70, height: 5, fontSize: 9, fontWeight: 'normal', align: 'left', visible: true },
    freight: { id: 'freight', label: 'Freight Value', x: 29, y: 237, width: 85, height: 5, fontSize: 9, fontWeight: 'normal', align: 'left', visible: true },
    payment: { id: 'payment', label: 'Payment Terms Value', x: 31, y: 243.5, width: 85, height: 5, fontSize: 9, fontWeight: 'normal', align: 'left', visible: true },
    noteMsg: { id: 'noteMsg', label: 'Footer Notice Note', x: 14, y: 250, width: 100, height: 8, fontSize: 8, fontWeight: 'normal', align: 'left', visible: true },
    
    // Terms & Conditions Right
    validity: { id: 'validity', label: 'Validity Value', x: 138, y: 224, width: 55, height: 5, fontSize: 9, fontWeight: 'normal', align: 'left', visible: true },
    salesTaxGst: { id: 'salesTaxGst', label: 'GST % Value', x: 154, y: 230.5, width: 40, height: 5, fontSize: 9, fontWeight: 'bold', align: 'left', visible: true },
    deliveryPeriod: { id: 'deliveryPeriod', label: 'Delivery Period Value', x: 150, y: 237, width: 45, height: 5, fontSize: 9, fontWeight: 'normal', align: 'left', visible: true },
    
    // Signature Area
    signThanking: { id: 'signThanking', label: '"Thanking you,"', x: 160, y: 245, width: 40, height: 5, fontSize: 9.5, fontWeight: 'bold', align: 'center', visible: true },
    signCompany: { id: 'signCompany', label: '"For APEX INDUSTRIES"', x: 160, y: 250, width: 50, height: 5, fontSize: 10, fontWeight: 'bold', align: 'center', visible: true },
    signStampArea: { id: 'signStampArea', label: 'Stamp & Sign Box', x: 142, y: 252, width: 36, height: 18, fontSize: 8, fontWeight: 'normal', align: 'center', visible: true },
    signatoryName: { id: 'signatoryName', label: 'Signatory Name', x: 160, y: 271, width: 45, height: 5, fontSize: 10, fontWeight: 'bold', align: 'center', visible: true },
  }
};

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    name: 'Kirloskar Brothers Limited',
    address: 'Plot No. 12, Kirloskarwadi, Dist. Sangli - 416308, Maharashtra',
    phone: '02346-222301',
    email: 'purchase@kirloskar.com',
    gstn: '27AAACK1234F1Z9',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    name: 'Rajaram Sugar Factory Ltd.',
    address: 'Bawada, Post Box No. 4, Kolhapur - 416006, Maharashtra',
    phone: '9822012345',
    email: 'info@rajaramsugar.com',
    gstn: '27AABCR5678P1ZQ',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    name: 'Shree Renuka Sugars Ltd.',
    address: 'Unit 2, Athani Road, Havalga, Belagavi - 591230',
    phone: '9448098765',
    email: 'procurement@renukasugars.com',
    gstn: '29AABCS9999M1Z5',
    createdAt: Date.now() - 86400000 * 1,
  }
];

export const SAMPLE_QUOTATIONS: Quotation[] = [
  {
    quotationNo: 'Q-101',
    quotationDate: new Date().toISOString().split('T')[0],
    refNo: 'ENQ/2026/089',
    refDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    customerName: 'Kirloskar Brothers Limited',
    customerAddress: 'Plot No. 12, Kirloskarwadi, Dist. Sangli - 416308, Maharashtra',
    items: [
      {
        id: 'item-1',
        srNo: 1,
        description: 'Heavy Duty 5 HP AC Variable Frequency Drive (VFD) Control Panel with Schneider Components',
        quantity: 2,
        unitRate: 42500,
        amount: 85000,
      },
      {
        id: 'item-2',
        srNo: 2,
        description: 'Digital Temperature Controller with PT100 RTD Sensor and 4-20mA Transmitter',
        quantity: 4,
        unitRate: 4800,
        amount: 19200,
      },
      {
        id: 'item-3',
        srNo: 3,
        description: 'Industrial Automation PLC Wiring & On-site Commissioning Charges',
        quantity: 1,
        unitRate: 15000,
        amount: 15000,
      }
    ],
    warranty: '12 Months against manufacturing defects',
    packingForwarding: 'Included in above rates',
    freight: 'Extra at actual / To Pay',
    paymentTerms: '30% Advance, 70% against delivery',
    validity: '30 Days',
    deliveryPeriod: '1 to 2 Weeks',
    gstRate: 18,
    subtotal: 119200,
    gstAmount: 21456,
    grandTotal: 140656,
    status: 'Approved',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  }
];
