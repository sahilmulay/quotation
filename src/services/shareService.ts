import { CompanyDetails, Quotation, PurchaseOrder, ProformaInvoice, TemplateConfig } from '../types';
import { downloadQuotationPDF, getQuotationPDFBlob } from './pdfGenerator';
import { downloadPurchaseOrderPDF, getPurchaseOrderPDFBlob } from './purchaseOrderPdfGenerator';
import { downloadProformaInvoicePDF, getProformaInvoicePDFBlob } from './proformaInvoicePdfGenerator';
import {
  generateQuotationImageBlob,
  generatePurchaseOrderImageBlob,
  generateProformaInvoiceImageBlob,
} from './imageGenerator';
import { formatCurrency } from '../utils/formatters';

/**
 * Invokes the Native Mobile Share Sheet for Quotation
 */
export async function openSystemShareSheet(
  quote: Quotation,
  company: CompanyDetails,
  template: TemplateConfig
): Promise<{ success: boolean; method: 'native_pdf' | 'native_image' | 'native_text' | 'fallback' }> {
  const cleanCustomer = (quote.customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${quote.quotationNo || 'Quotation'}_${cleanCustomer}`;

  try {
    const blob = getQuotationPDFBlob(quote, company, template, 'full');
    const pdfFile = new File([blob], `${filename}.pdf`, { type: 'application/pdf' });

    if (typeof navigator.share === 'function' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        files: [pdfFile],
        title: `Quotation ${quote.quotationNo}`,
        text: `Quotation ${quote.quotationNo} - ${quote.customerName}`,
      });
      return { success: true, method: 'native_pdf' };
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return { success: true, method: 'native_pdf' };
    console.warn('Native PDF file share failed:', err);
  }

  try {
    const imageBlob = await generateQuotationImageBlob(quote, company, 'image/jpeg');
    const imageFile = new File([imageBlob], `${filename}.jpg`, { type: 'image/jpeg' });

    if (typeof navigator.share === 'function' && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
      await navigator.share({
        files: [imageFile],
        title: `Quotation ${quote.quotationNo}`,
        text: `Quotation ${quote.quotationNo} - ${quote.customerName}`,
      });
      return { success: true, method: 'native_image' };
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return { success: true, method: 'native_image' };
    console.warn('Native image file share failed:', err);
  }

  const quotationTotal =
    quote.items && quote.items.length > 0
      ? quote.items.reduce((s, it) => s + (Number(it.amount) || 0), 0)
      : (quote.subtotal || quote.grandTotal);

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: `Quotation ${quote.quotationNo}`,
        text: `Quotation ${quote.quotationNo} for ${quote.customerName} - Total: ₹${formatCurrency(quotationTotal)} (+ GST ${quote.gstRate}% Extra) from ${company.name || 'Apex Industries'}`,
      });
      return { success: true, method: 'native_text' };
    } catch (err) {
      if ((err as Error).name === 'AbortError') return { success: true, method: 'native_text' };
    }
  }

  try {
    downloadQuotationPDF(quote, company, template, 'full');
  } catch (e) {
    console.warn('Auto download error:', e);
  }

  return { success: true, method: 'fallback' };
}

/**
 * Invokes the Native Mobile Share Sheet for Purchase Order
 */
export async function openPurchaseOrderShareSheet(
  po: PurchaseOrder,
  company: CompanyDetails
): Promise<{ success: boolean; method: string }> {
  const cleanCustomer = (po.customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${po.poNo || 'PurchaseOrder'}_${cleanCustomer}`;

  try {
    const blob = getPurchaseOrderPDFBlob(po, company);
    const pdfFile = new File([blob], `${filename}.pdf`, { type: 'application/pdf' });

    if (typeof navigator.share === 'function' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        files: [pdfFile],
        title: `Purchase Order ${po.poNo}`,
        text: `Purchase Order ${po.poNo} - ${po.customerName}`,
      });
      return { success: true, method: 'native_pdf' };
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return { success: true, method: 'native_pdf' };
  }

  try {
    const imageBlob = await generatePurchaseOrderImageBlob(po, company, 'image/jpeg');
    const imageFile = new File([imageBlob], `${filename}.jpg`, { type: 'image/jpeg' });

    if (typeof navigator.share === 'function' && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
      await navigator.share({
        files: [imageFile],
        title: `Purchase Order ${po.poNo}`,
        text: `Purchase Order ${po.poNo} - ${po.customerName}`,
      });
      return { success: true, method: 'native_image' };
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return { success: true, method: 'native_image' };
  }

  const poTotal =
    po.items && po.items.length > 0
      ? po.items.reduce((s, it) => s + (Number(it.amount) || 0), 0)
      : (po.subtotal || po.grandTotal);

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: `Purchase Order ${po.poNo}`,
        text: `Purchase Order ${po.poNo} for ${po.customerName} - Total: ₹${formatCurrency(poTotal)} (+ GST ${po.gstRate}% Extra) from ${company.name || 'Apex Industries'}`,
      });
      return { success: true, method: 'native_text' };
    } catch (err) {
      if ((err as Error).name === 'AbortError') return { success: true, method: 'native_text' };
    }
  }

  downloadPurchaseOrderPDF(po, company);
  return { success: true, method: 'fallback' };
}

/**
 * Invokes the Native Mobile Share Sheet for Proforma Invoice
 */
export async function openProformaInvoiceShareSheet(
  pi: ProformaInvoice,
  company: CompanyDetails
): Promise<{ success: boolean; method: string }> {
  const cleanCustomer = (pi.customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${pi.piNo || 'ProformaInvoice'}_${cleanCustomer}`;

  try {
    const blob = getProformaInvoicePDFBlob(pi, company);
    const pdfFile = new File([blob], `${filename}.pdf`, { type: 'application/pdf' });

    if (typeof navigator.share === 'function' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        files: [pdfFile],
        title: `Proforma Invoice ${pi.piNo}`,
        text: `Proforma Invoice ${pi.piNo} - ${pi.customerName}`,
      });
      return { success: true, method: 'native_pdf' };
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return { success: true, method: 'native_pdf' };
  }

  try {
    const imageBlob = await generateProformaInvoiceImageBlob(pi, company, 'image/jpeg');
    const imageFile = new File([imageBlob], `${filename}.jpg`, { type: 'image/jpeg' });

    if (typeof navigator.share === 'function' && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
      await navigator.share({
        files: [imageFile],
        title: `Proforma Invoice ${pi.piNo}`,
        text: `Proforma Invoice ${pi.piNo} - ${pi.customerName}`,
      });
      return { success: true, method: 'native_image' };
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return { success: true, method: 'native_image' };
  }

  const piTotal =
    pi.items && pi.items.length > 0
      ? pi.items.reduce((s, it) => s + (Number(it.amount) || 0), 0)
      : (pi.subtotal || pi.grandTotal);

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: `Proforma Invoice ${pi.piNo}`,
        text: `Proforma Invoice ${pi.piNo} for ${pi.customerName} - Total: ₹${formatCurrency(piTotal)} (+ GST ${pi.gstRate}% Extra) from ${company.name || 'Apex Industries'}`,
      });
      return { success: true, method: 'native_text' };
    } catch (err) {
      if ((err as Error).name === 'AbortError') return { success: true, method: 'native_text' };
    }
  }

  downloadProformaInvoicePDF(pi, company);
  return { success: true, method: 'fallback' };
}
