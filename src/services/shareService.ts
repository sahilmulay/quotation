import { CompanyDetails, Quotation, TemplateConfig } from '../types';
import { downloadQuotationPDF, getQuotationPDFBlob } from './pdfGenerator';
import { generateQuotationImageBlob } from './imageGenerator';
import { formatCurrency, formatDate } from '../utils/formatters';

/**
 * Share PDF Directly via Web Share API or WhatsApp Document Helper
 */
export async function shareQuotationPDF(
  quote: Quotation,
  company: CompanyDetails,
  template: TemplateConfig
): Promise<{ success: boolean; method: 'native' | 'download_whatsapp' }> {
  const cleanCustomer = (quote.customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${quote.quotationNo || 'Quotation'}_${cleanCustomer}.pdf`;
  const blob = getQuotationPDFBlob(quote, company, template, 'full');
  const file = new File([blob], filename, { type: 'application/pdf' });

  // 1. Try Native Web Share API with actual PDF file (Works on HTTPS / Native)
  if (typeof navigator.share === 'function' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Quotation ${quote.quotationNo}`,
      });
      return { success: true, method: 'native' };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return { success: true, method: 'native' };
      }
      console.warn('Native PDF share failed, falling back:', err);
    }
  }

  // 2. Fallback for HTTP / Desktop: Auto-download PDF + Open WhatsApp
  try {
    downloadQuotationPDF(quote, company, template, 'full');
  } catch (e) {
    console.warn('PDF download failed:', e);
  }

  const itemsText = quote.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.description}*\n   Qty: ${item.quantity} × ₹${formatCurrency(item.unitRate)} = *₹${formatCurrency(item.amount)}*`
    )
    .join('\n\n');

  const text =
    `*QUOTATION: ${quote.quotationNo}*\n` +
    `*From:* ${company.name || 'APEX INDUSTRIES'}, Sangli\n` +
    `*To:* ${quote.customerName}\n` +
    `*Date:* ${formatDate(quote.quotationDate)}\n` +
    `--------------------------------\n` +
    `*ITEMS:*\n${itemsText}\n` +
    `--------------------------------\n` +
    `*GRAND TOTAL: ₹${formatCurrency(quote.grandTotal)}*\n` +
    `--------------------------------\n` +
    `📎 _Official PDF (${filename}) has been downloaded to device._`;

  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');

  return { success: true, method: 'download_whatsapp' };
}

/**
 * Share Quotation Image Directly (Option C)
 */
export async function shareQuotationImage(
  quote: Quotation,
  company: CompanyDetails
): Promise<{ success: boolean; method: 'native' | 'download_whatsapp' }> {
  const cleanCustomer = (quote.customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${quote.quotationNo || 'Quotation'}_${cleanCustomer}.png`;
  const imageBlob = await generateQuotationImageBlob(quote, company);
  const file = new File([imageBlob], filename, { type: 'image/png' });

  if (typeof navigator.share === 'function' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Quotation ${quote.quotationNo}`,
      });
      return { success: true, method: 'native' };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return { success: true, method: 'native' };
      }
      console.warn('Image share failed, falling back:', err);
    }
  }

  // Fallback download image & open WhatsApp
  const url = URL.createObjectURL(imageBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  const text = `*QUOTATION: ${quote.quotationNo}* for ${quote.customerName} - Total: ₹${formatCurrency(quote.grandTotal)} from ${company.name || 'Apex Industries'}`;
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');

  return { success: true, method: 'download_whatsapp' };
}

export const shareQuotationOnWhatsApp = shareQuotationPDF;
