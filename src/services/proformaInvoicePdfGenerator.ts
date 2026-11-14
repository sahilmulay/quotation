import { jsPDF } from 'jspdf';
import { CompanyDetails, ProformaInvoice } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

/**
 * Dynamic Auto-Fit Text Helper for jsPDF
 * Dynamically shrinks font size so that large text never spills outside its box
 */
function drawAutoScaledText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number = 6,
  options: { align?: 'left' | 'center' | 'right' } = {}
): void {
  if (!text) return;
  let size = maxFontSize;
  doc.setFontSize(size);
  while (doc.getTextWidth(text) > maxWidth && size > minFontSize) {
    size -= 0.4;
    doc.setFontSize(size);
  }
  doc.text(text, x, y, options);
}

/**
 * High-Precision Vector PDF Generator for Proforma Invoice
 * Exact 1:1 reproduction with dedicated Company Bank Details in Commercial Terms
 */
export function generateProformaInvoicePDF(
  pi: ProformaInvoice,
  company: CompanyDetails
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Standard Page Bounds: 210mm x 297mm
  const leftX = 10;
  const rightX = 200;
  const topY = 28;
  const pageWidth = rightX - leftX; // 190mm

  // ==========================================
  // 1. TOP HEADER: "PROFORMA INVOICE"
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 44, 89); // Deep Apex Navy
  doc.text('PROFORMA INVOICE', 105, 20, { align: 'center' });

  // Underline below PROFORMA INVOICE
  doc.setLineWidth(0.4);
  doc.setDrawColor(15, 44, 89);
  doc.line(74, 22, 136, 22);

  // ==========================================
  // 2. MAIN OUTER BORDER (190mm x 244mm) -> Y: 28 to 272
  // ==========================================
  doc.setDrawColor(30, 41, 59); // Slate-800
  doc.setLineWidth(0.5);
  doc.rect(leftX, topY, pageWidth, 244);

  // ==========================================
  // 3. COMPANY HEADER BOX (Y: 28 to 63)
  // ==========================================
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

  // ==========================================
  // 4. CUSTOMER & PI DETAILS BOX (Y: 63 to 89)
  // ==========================================
  // Vertical split at X = 120 (Left = Customer, Right = PI Meta)
  doc.line(120, 63, 120, 89);
  // Horizontal split in Right box (Y = 76)
  doc.line(120, 76, rightX, 76);
  // Vertical split for Dates in Right box: at 166
  doc.line(166, 63, 166, 89);

  // Static Customer Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('To,', 14, 68.5);

  // Static PI Details Labels
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('P.I. No.', 122.5, 70);
  doc.text('Date :', 168.5, 70);
  doc.text('Ref. No.', 122.5, 83);
  doc.text('Date :', 168.5, 83);

  // Dynamic Customer Details
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  drawAutoScaledText(doc, pi.customerName || '', 14, 73.5, 102, 10.5, 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const splitAddress = doc.splitTextToSize(pi.customerAddress || '', 102);
  doc.text(splitAddress, 14, 79);

  // Dynamic PI Metadata
  doc.setFont('helvetica', 'bold');
  drawAutoScaledText(doc, pi.piNo || '', 134, 70, 30.5, 9.5, 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(formatDate(pi.piDate), 179, 70);

  drawAutoScaledText(doc, pi.refNo || '-', 136, 83, 28.5, 9, 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(formatDate(pi.refDate) || '-', 179, 83);

  // ==========================================
  // 5. SALUTATION SECTION (Y: 89 to 102)
  // ==========================================
  doc.line(leftX, 89, rightX, 89);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Dear Sir,', 14, 94.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    'With reference to your above mentioned enquiry, we submit our lowest offer as follows.',
    24,
    99.5
  );

  // ==========================================
  // 6. TABLE HEADER & COLUMN STRUCTURE (Y: 102 to 218)
  // ==========================================
  doc.line(leftX, 102, rightX, 102);
  doc.line(leftX, 110, rightX, 110);

  const colX = [10, 25, 125, 144, 168, 200];

  colX.forEach((x) => {
    doc.line(x, 102, x, 210);
  });

  // Table Header Labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 44, 89);
  doc.text('S. No.', 17.5, 107, { align: 'center' });
  doc.text('Description', 75, 107, { align: 'center' });
  doc.text('Qty.', 134.5, 107, { align: 'center' });
  doc.text('Unit Rate', 156, 107, { align: 'center' });
  doc.text('Amount', 184, 107, { align: 'center' });

  // Table items bottom line (Y = 210)
  doc.line(leftX, 210, rightX, 210);

  // TOTAL Row (Y: 210 to 218)
  doc.line(colX[0], 210, colX[0], 218);
  doc.line(colX[4], 210, colX[4], 218);
  doc.line(colX[5], 210, colX[5], 218);
  doc.line(leftX, 218, rightX, 218);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL', 165, 215.5, { align: 'right' });

  // ==========================================
  // DYNAMIC LINE ITEMS (Y: 116.5 to 208)
  // ==========================================
  let currentY = 116.5;
  const rowMaxY = 208;

  pi.items.forEach((item, index) => {
    if (currentY >= rowMaxY) return;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text(String(item.srNo || index + 1), 17.5, currentY, { align: 'center' });

    const descWidth = 96;
    const descLines = doc.splitTextToSize(item.description || '', descWidth);
    doc.text(descLines, 27, currentY);

    doc.text(String(item.quantity || 1), 134.5, currentY, { align: 'center' });

    drawAutoScaledText(doc, formatCurrency(item.unitRate), 166, currentY, 21, 9.5, 7, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    drawAutoScaledText(doc, formatCurrency(item.amount), 198, currentY, 29, 9.5, 7, { align: 'right' });

    const linesCount = Array.isArray(descLines) ? descLines.length : 1;
    currentY += Math.max(linesCount * 4.5 + 2.5, 7.5);
  });

  const piTotal =
    pi.items && pi.items.length > 0
      ? pi.items.reduce((s, it) => s + (Number(it.amount) || 0), 0)
      : (pi.subtotal || pi.grandTotal);

  doc.setFont('helvetica', 'bold');
  drawAutoScaledText(doc, formatCurrency(piTotal), 198, 215.5, 30, 10.5, 7.5, { align: 'right' });

  // ==========================================
  // 7. TERMS, BANK DETAILS & SIGNATURE (Y: 218 to 272)
  // ==========================================
  doc.line(120, 218, 120, 272); // Vertical divider

  // Left Column: Terms + Bank Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text('Warranty -', 14, 223.5);
  doc.line(10, 225.5, 120, 225.5);

  doc.text('Packing forwarding : -', 14, 229.5);
  doc.line(10, 231.5, 120, 231.5);

  doc.text('Freight :-', 14, 235.5);
  doc.line(10, 237.5, 120, 237.5);

  doc.text('Payment:-', 14, 241.5);
  doc.line(10, 243.5, 120, 243.5);

  // Dedicated Bank Details Box in Left Column (Y: 244 to 272)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 44, 89);
  doc.text('BANK DETAILS :', 14, 249);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const bankName = company.bankName || 'State Bank of India';
  const acNo = company.accountNo || '-';
  const ifsc = company.ifscCode || '-';
  const branch = company.branchName || '-';

  doc.text(`Bank Name : ${bankName}`, 14, 254.5);
  doc.text(`A/c No.     : ${acNo}`, 14, 259.5);
  doc.text(`IFSC Code : ${ifsc}`, 14, 264.5);
  doc.text(`Branch      : ${branch}`, 14, 269.5);

  // Dynamic values for Left terms
  if (pi.warranty) {
    drawAutoScaledText(doc, pi.warranty, 31, 223.5, 87, 8.5, 6);
  }
  if (pi.packingForwarding) {
    drawAutoScaledText(doc, pi.packingForwarding, 48, 229.5, 70, 8.5, 6);
  }
  if (pi.freight) {
    drawAutoScaledText(doc, pi.freight, 29, 235.5, 89, 8.5, 6);
  }
  if (pi.paymentTerms) {
    drawAutoScaledText(doc, pi.paymentTerms, 31, 241.5, 87, 8.5, 6);
  }

  // Right Column: Validity, Tax, Delivery & Signatures
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.text('Validity –', 123, 224);
  doc.line(120, 226.5, 200, 226.5);

  doc.text('Sales Tax :- GST @', 123, 230.5);
  doc.text('% Extra', 162, 230.5);
  doc.line(120, 233, 200, 233);

  doc.text('Delivery Period :-', 123, 237);
  doc.line(120, 239.5, 200, 239.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 44, 89);
  doc.text('Thanking you,', 160, 244, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`For ${company.name || 'APEX INDUSTRIES'}`, 160, 249, { align: 'center' });

  // Right column dynamic values
  doc.setFont('helvetica', 'normal');
  if (pi.validity) {
    drawAutoScaledText(doc, pi.validity, 138, 224, 60, 9, 6.5);
  }
  doc.setFont('helvetica', 'bold');
  doc.text(String(pi.gstRate ?? 18), 154, 230.5);

  doc.setFont('helvetica', 'normal');
  if (pi.deliveryPeriod) {
    drawAutoScaledText(doc, pi.deliveryPeriod, 150, 237, 48, 9, 6.5);
  }

  // Signatory Stamp & Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 44, 89);
  doc.text(company.signatoryName || 'Mr. Dilip Mulay', 160, 269, { align: 'center' });

  if (company.showStamp) {
    drawStampSeal(doc, 160, 258);
  }

  return doc;
}

function drawStampSeal(doc: jsPDF, centerX: number, centerY: number) {
  try {
    doc.saveGraphicsState();
    doc.setDrawColor(59, 7, 100);
    doc.setTextColor(59, 7, 100);
    doc.setLineWidth(0.4);

    doc.circle(centerX, centerY, 7.5, 'S');
    doc.circle(centerX, centerY, 6.2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.2);
    doc.text('APEX INDUSTRIES', centerX, centerY - 2.5, { align: 'center' });
    doc.text('SANGLI', centerX, centerY + 4.5, { align: 'center' });

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

export function downloadProformaInvoicePDF(pi: ProformaInvoice, company: CompanyDetails): void {
  const doc = generateProformaInvoicePDF(pi, company);
  doc.save(`ProformaInvoice_${pi.piNo || 'draft'}.pdf`);
}

export function printProformaInvoicePDF(pi: ProformaInvoice, company: CompanyDetails): void {
  const doc = generateProformaInvoicePDF(pi, company);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => {
      win.focus();
      win.print();
    });
  }
}

export function getProformaInvoicePDFBlob(pi: ProformaInvoice, company: CompanyDetails): Blob {
  const doc = generateProformaInvoicePDF(pi, company);
  return doc.output('blob');
}
