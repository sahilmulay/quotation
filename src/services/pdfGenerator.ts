import { jsPDF } from 'jspdf';
import { CompanyDetails, Quotation, TemplateConfig } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

/**
 * High-Precision Vector PDF Generator
 * Exact 1:1 reproduction of the original Apex Industries physical quotation format.
 */
export function generateQuotationPDF(
  quote: Quotation,
  company: CompanyDetails,
  template: TemplateConfig,
  mode: 'full' | 'overlay' = 'full'
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isFull = mode === 'full';
  const pos = template.positions || {};

  // Standard Page Bounds: 210mm x 297mm
  const leftX = 10;
  const rightX = 200;
  const topY = 28;
  const pageWidth = rightX - leftX; // 190mm

  // ==========================================
  // STATIC TEMPLATE FRAMEWORK (Only in FULL mode)
  // ==========================================
  if (isFull) {
    // 1. TOP HEADER: "QUOTATION"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 44, 89); // Deep Apex Navy
    doc.text('QUOTATION', 105, 20, { align: 'center' });

    // Underline below QUOTATION
    doc.setLineWidth(0.4);
    doc.setDrawColor(15, 44, 89);
    doc.line(88, 22, 122, 22);

    // 2. MAIN OUTER BORDER (190mm x 244mm)
    doc.setDrawColor(30, 41, 59); // Slate-800
    doc.setLineWidth(0.5);
    doc.rect(leftX, topY, pageWidth, 244);

    // 3. COMPANY HEADER BOX (Y: 28 to 63)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14.5);
    doc.setTextColor(15, 44, 89);
    doc.text(company.name || 'APEX INDUSTRIES', 105, 36, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(company.address || 'E-9, MIDC, Kupwad, SANGLI – 416436 (MS)', 105, 41.5, { align: 'center' });
    doc.text(`Mobile No – ${company.phones || '9850060698 / 8855003009'}`, 105, 46.5, { align: 'center' });
    doc.text(`e-mail ${company.email || 'apexindustries92@gmail.com'}`, 105, 51.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 44, 89);
    doc.text(`GSTN No -${company.gstn || '27ABDPM6031D1Z1'}`, 105, 57, { align: 'center' });

    // Horizontal line below header (Y = 63)
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.4);
    doc.line(leftX, 63, rightX, 63);

    // 4. CUSTOMER & QUOTATION DETAILS BOX (Y: 63 to 89)
    // Vertical split at X = 120 (Left = Customer, Right = Quotation Meta)
    doc.line(120, 63, 120, 89);
    // Horizontal split in Right box (Y = 76)
    doc.line(120, 76, rightX, 76);
    // Vertical splits for Dates in Right box
    doc.line(160, 63, 160, 89);

    // Static Customer Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('To,', 14, 68.5);

    // Static Quotation Details Labels
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Q. No.', 123, 70);
    doc.text('Date :', 163, 70);
    doc.text('Ref. No.', 123, 83);
    doc.text('Date :', 163, 83);

    // 5. SALUTATION SECTION (Y: 89 to 102)
    doc.line(leftX, 89, rightX, 89);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Dear Sir,', 14, 94.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      'With reference to your above mentioned enquiry, we submit our lowest offer as follows.',
      24,
      99.5
    );

    // 6. TABLE HEADER & COLUMN STRUCTURE (Y: 102 to 218)
    doc.line(leftX, 102, rightX, 102); // Top table header line
    doc.line(leftX, 110, rightX, 110); // Bottom table header line

    // Column horizontal positions
    // S.No: 10 to 26 (16mm)
    // Description: 26 to 135 (109mm)
    // Qty: 135 to 153 (18mm)
    // Unit Rate: 153 to 177 (24mm)
    // Amount: 177 to 200 (23mm)
    const colX = [10, 26, 135, 153, 177, 200];

    // Draw vertical column grid lines from Y = 102 to 210
    colX.forEach(x => {
      doc.line(x, 102, x, 210);
    });

    // Table Header Labels
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('S. No.', 18, 107, { align: 'center' });
    doc.text('Description', 80, 107, { align: 'center' });
    doc.text('Qty.', 144, 107, { align: 'center' });
    doc.text('Unit Rate', 165, 107, { align: 'center' });
    doc.text('Amount', 188.5, 107, { align: 'center' });

    // Table items bottom line (Y = 210)
    doc.line(leftX, 210, rightX, 210);

    // TOTAL Row (Y: 210 to 218)
    doc.line(colX[0], 210, colX[0], 218);
    doc.line(colX[4], 210, colX[4], 218);
    doc.line(colX[5], 210, colX[5], 218);
    doc.line(leftX, 218, rightX, 218); // Bottom of Total row

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL', 174, 215.5, { align: 'right' });

    // 7. TERMS & SIGNATURE SECTION (Y: 218 to 272)
    // Vertical divider at X = 120 from Y = 218 to 272
    doc.line(120, 218, 120, 272);

    // Left Column Static Labels & Grid Lines
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Warranty -', 14, 224);
    doc.line(10, 226.5, 120, 226.5);

    doc.text('Packing forwarding : -', 14, 230.5);
    doc.line(10, 233, 120, 233);

    doc.text('Freight :-', 14, 237);
    doc.line(10, 239.5, 120, 239.5);

    doc.text('Payment:-', 14, 243.5);
    doc.line(10, 246, 120, 246);

    doc.setFontSize(8);
    doc.text('We hope our offer is in line with your exact requirement.', 14, 250);
    doc.text('Kindly feel free to ask us any details.', 14, 254);

    // Right Column Static Labels & Lines
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Validity –', 123, 224);
    doc.line(120, 226.5, 200, 226.5);

    doc.text('Sales Tax :- GST @', 123, 230.5);
    doc.text('% Extra', 162, 230.5);
    doc.line(120, 233, 200, 233);

    doc.text('Delivery Period :-', 123, 237);
    doc.line(120, 239.5, 200, 239.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Thanking you,', 160, 244, { align: 'center' });
    doc.setFontSize(10);
    doc.text('For APEX INDUSTRIES', 160, 249, { align: 'center' });
  }

  // ==========================================
  // DYNAMIC DATA RENDERING (Uses template positions)
  // ==========================================

  // Customer Details
  const cNamePos = pos.customerName || { x: 14, y: 73.5, fontSize: 10.5 };
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(cNamePos.fontSize || 10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(quote.customerName || '', cNamePos.x, cNamePos.y);

  const cAddrPos = pos.customerAddress || { x: 14, y: 79, fontSize: 9 };
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(cAddrPos.fontSize || 9);
  const splitAddress = doc.splitTextToSize(quote.customerAddress || '', cAddrPos.width || 98);
  doc.text(splitAddress, cAddrPos.x, cAddrPos.y);

  // Quotation Metadata
  const qNoPos = pos.quoteNo || { x: 135, y: 70, fontSize: 9.5 };
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(qNoPos.fontSize || 9.5);
  doc.text(quote.quotationNo || '', qNoPos.x, qNoPos.y);

  const qDatePos = pos.quoteDate || { x: 175, y: 70, fontSize: 9.5 };
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(qDatePos.fontSize || 9.5);
  doc.text(formatDate(quote.quotationDate), qDatePos.x, qDatePos.y);

  const rNoPos = pos.refNo || { x: 136, y: 83, fontSize: 9.5 };
  doc.text(quote.refNo || '-', rNoPos.x, rNoPos.y);

  const rDatePos = pos.refDate || { x: 175, y: 83, fontSize: 9.5 };
  doc.text(formatDate(quote.refDate) || '-', rDatePos.x, rDatePos.y);

  // Line Items in Table (Generous padding below header line Y = 110)
  let currentY = 116.5;
  const rowMaxY = 208; // Stay within table bounds

  quote.items.forEach((item, index) => {
    if (currentY >= rowMaxY) return; // Prevent overflowing outside table box

    // S.No
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(String(item.srNo || index + 1), 18, currentY, { align: 'center' });

    // Description (Word wrapped)
    const descWidth = 104; // 135 - 26 - padding
    const descLines = doc.splitTextToSize(item.description || '', descWidth);
    doc.text(descLines, 28, currentY);

    // Qty
    doc.text(String(item.quantity || 1), 144, currentY, { align: 'center' });

    // Unit Rate
    doc.text(formatCurrency(item.unitRate), 174, currentY, { align: 'right' });

    // Amount
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(item.amount), 198, currentY, { align: 'right' });

    // Advance Y coordinate based on number of lines in description
    const linesCount = Array.isArray(descLines) ? descLines.length : 1;
    currentY += Math.max(linesCount * 4.5 + 2.5, 7.5);
  });

  // Grand Total in Amount column
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(formatCurrency(quote.grandTotal), 198, 215.5, { align: 'right' });

  // Terms & Conditions Dynamic Values
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Warranty
  if (quote.warranty) {
    doc.text(quote.warranty, 31, 224);
  }

  // Packing & Forwarding
  if (quote.packingForwarding) {
    doc.text(quote.packingForwarding, 48, 230.5);
  }

  // Freight
  if (quote.freight) {
    doc.text(quote.freight, 29, 237);
  }

  // Payment
  if (quote.paymentTerms) {
    doc.text(quote.paymentTerms, 31, 243.5);
  }

  // Validity
  if (quote.validity) {
    doc.text(quote.validity, 138, 224);
  }

  // GST %
  doc.setFont('helvetica', 'bold');
  doc.text(String(quote.gstRate ?? 18), 154, 230.5);

  // Delivery Period
  doc.setFont('helvetica', 'normal');
  if (quote.deliveryPeriod) {
    doc.text(quote.deliveryPeriod, 150, 237);
  }

  // Signature Stamp & Name
  const signPos = pos.signatoryName || { x: 160, y: 269, fontSize: 10 };
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(signPos.fontSize || 10);
  doc.text(company.signatoryName || 'Mr. Dilip Mulay', signPos.x, signPos.y, { align: 'center' });

  // Draw vectorized Stamp / Seal if enabled
  if (company.showStamp && isFull) {
    drawStampSeal(doc, 160, 258);
  }

  return doc;
}

// Vectorized official stamp seal
function drawStampSeal(doc: jsPDF, centerX: number, centerY: number) {
  try {
    doc.saveGraphicsState();
    // Stamp Oval/Circle in subtle purple/indigo ink
    doc.setDrawColor(59, 7, 100);
    doc.setTextColor(59, 7, 100);
    doc.setLineWidth(0.4);
    
    // Stamp outer circle
    doc.circle(centerX, centerY, 7.5, 'S');
    // Stamp inner circle
    doc.circle(centerX, centerY, 6.2, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.2);
    doc.text('APEX INDUSTRIES', centerX, centerY - 2.5, { align: 'center' });
    doc.text('SANGLI', centerX, centerY + 4.5, { align: 'center' });

    // Stylized signature wave
    doc.setLineWidth(0.5);
    doc.setDrawColor(20, 40, 120);
    doc.lines(
      [
        [2, -2],
        [3, 3],
        [4, -3],
        [5, 1],
        [-3, 2],
        [8, -2],
      ],
      centerX - 8,
      centerY + 0.5
    );

    doc.restoreGraphicsState();
  } catch (e) {
    console.warn('Stamp rendering fallback:', e);
  }
}

export function getQuotationPDFBlob(
  quote: Quotation,
  company: CompanyDetails,
  template: TemplateConfig,
  mode?: 'full' | 'overlay'
): Blob {
  const doc = generateQuotationPDF(quote, company, template, mode);
  return doc.output('blob');
}

export function getQuotationPDFBlobUrl(
  quote: Quotation,
  company: CompanyDetails,
  template: TemplateConfig,
  mode?: 'full' | 'overlay'
): string {
  const blob = getQuotationPDFBlob(quote, company, template, mode);
  return URL.createObjectURL(blob);
}

export function downloadQuotationPDF(
  quote: Quotation,
  company: CompanyDetails,
  template: TemplateConfig,
  mode?: 'full' | 'overlay'
): void {
  const doc = generateQuotationPDF(quote, company, template, mode);
  const cleanCustomer = (quote.customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${quote.quotationNo || 'Quotation'}_${cleanCustomer}.pdf`;
  doc.save(filename);
}

export function printQuotationPDF(
  quote: Quotation,
  company: CompanyDetails,
  template: TemplateConfig,
  mode?: 'full' | 'overlay'
): void {
  const doc = generateQuotationPDF(quote, company, template, mode);
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  const printWindow = window.open(blobUrl, '_blank');
  if (printWindow) {
    printWindow.focus();
  }
}
