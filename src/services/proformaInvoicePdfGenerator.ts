import { jsPDF } from 'jspdf';
import { CompanyDetails, ProformaInvoice } from '../types';
import { formatCurrency, formatDate, numberToWordsIndian } from '../utils/formatters';

/**
 * Dynamic Auto-Fit Text Helper for jsPDF
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
 * Exact 1:1 reproduction of the official physical Apex Industries Proforma Invoice template
 * with 6-row financial breakdown:
 * 1. TOTAL -
 * 2. Add: Other Taxes & Levies (Packing, Forwarding, Freight)
 * 3. Less: Deductions / Discount Etc. (%)
 * 4. Balance Sub. Total
 * 5. Add: GST @ %
 * 6. GRAND TOTAL
 * + Rs in words
 * + Company's Bank Details
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

  // Line below header (Y = 63)
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(leftX, 63, rightX, 63);

  // ==========================================
  // 4. CUSTOMER & PI DETAILS BOX (Y: 63 to 89)
  // ==========================================
  doc.line(120, 63, 120, 89); // Vertical split
  doc.line(120, 76, rightX, 76); // Horizontal split
  doc.line(166, 63, 166, 89); // Date column split

  // Customer Label & Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('To,', 14, 68.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  drawAutoScaledText(doc, pi.customerName || '', 14, 73.5, 102, 10.5, 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const splitAddress = doc.splitTextToSize(pi.customerAddress || '', 102);
  doc.text(splitAddress, 14, 79);

  // PI Details Labels & Values
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('P.I. No.', 122.5, 70);
  doc.text('Date :', 168.5, 70);
  doc.text('P.O. No.', 122.5, 83);
  doc.text('Date :', 168.5, 83);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 44, 89);
  drawAutoScaledText(doc, pi.piNo || '', 136, 70, 28.5, 9.5, 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text(formatDate(pi.piDate), 180, 70);

  drawAutoScaledText(doc, pi.poNo || pi.refNo || '-', 136, 83, 28.5, 9, 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(formatDate(pi.poDate || pi.refDate) || '-', 180, 83);

  // ==========================================
  // 5. SALUTATION SECTION (Y: 89 to 100)
  // ==========================================
  doc.line(leftX, 89, rightX, 89);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Dear Sir,', 14, 93.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    'With reference to your above PO no., we submit our proforma invoice as follows.',
    24,
    97.5
  );

  // ==========================================
  // 6. TABLE HEADER & COLUMN STRUCTURE (Y: 100 to 180)
  // ==========================================
  doc.line(leftX, 100, rightX, 100);
  doc.line(leftX, 107, rightX, 107);

  const colX = [10, 25, 125, 144, 168, 200];

  // Draw vertical column grid lines down to table end (Y = 180)
  colX.forEach((x) => {
    doc.line(x, 100, x, 180);
  });

  // Table Header Labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 44, 89);
  doc.text('S. No.', 17.5, 105, { align: 'center' });
  doc.text('Description', 75, 105, { align: 'center' });
  doc.text('Qty.', 134.5, 105, { align: 'center' });
  doc.text('Rate', 156, 105, { align: 'center' });
  doc.text('Amount', 184, 105, { align: 'center' });

  // Table items bottom line (Y = 180)
  doc.line(leftX, 180, rightX, 180);

  // ==========================================
  // LINE ITEMS RENDERING (Y: 112 to 178)
  // ==========================================
  let currentY = 113;
  const rowMaxY = 177;

  pi.items.forEach((item, index) => {
    if (currentY >= rowMaxY) return;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(String(item.srNo || index + 1), 17.5, currentY, { align: 'center' });

    const descWidth = 96;
    const descLines = doc.splitTextToSize(item.description || '', descWidth);
    doc.text(descLines, 27, currentY);

    doc.text(String(item.quantity || 1), 134.5, currentY, { align: 'center' });

    drawAutoScaledText(doc, formatCurrency(item.unitRate), 166, currentY, 21, 9, 7, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    drawAutoScaledText(doc, formatCurrency(item.amount), 198, currentY, 29, 9, 7, { align: 'right' });

    const linesCount = Array.isArray(descLines) ? descLines.length : 1;
    currentY += Math.max(linesCount * 4.2 + 2, 6.5);
  });

  // ==========================================
  // 7. FINANCIAL BREAKDOWN ROWS (Y: 180 to 222) - Exact Physical Template
  // ==========================================
  // Row Heights: 7mm each -> 6 rows = 42mm total (180 to 222)
  const itemsSubtotal = pi.items && pi.items.length > 0
    ? pi.items.reduce((s, it) => s + (Number(it.amount) || 0), 0)
    : pi.subtotal;

  const pkgFreight = Number(pi.packagingFreightAmount) || 0;
  const discPercent = Number(pi.discountPercent) || 0;
  const discAmount = pi.discountAmount !== undefined
    ? Number(pi.discountAmount)
    : Math.round((itemsSubtotal * discPercent) / 100);

  const balanceSubTotal = pi.balanceSubTotal !== undefined
    ? Number(pi.balanceSubTotal)
    : Math.max(0, itemsSubtotal + pkgFreight - discAmount);

  const gstRateVal = pi.gstRate ?? 18;
  const gstAmountVal = pi.gstAmount !== undefined
    ? Number(pi.gstAmount)
    : Math.round((balanceSubTotal * gstRateVal) / 100);

  const finalGrandTotal = pi.grandTotal !== undefined
    ? Number(pi.grandTotal)
    : balanceSubTotal + gstAmountVal;

  const amountColX = 168;

  // Single continuous vertical line for Amount column (Y: 180 to 223)
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(amountColX, 180, amountColX, 223);

  // --- Row 1: TOTAL - (Basic items sum) --- Y: 180 to 187
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 44, 89);
  doc.text('TOTAL -', 165, 185, { align: 'right' });
  drawAutoScaledText(doc, formatCurrency(itemsSubtotal), 198, 185, 28, 9.5, 7, { align: 'right' });
  doc.line(leftX, 187, rightX, 187);

  // --- Row 2: Add : Other Taxes & Levies --- Y: 187 to 194
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Add : Other Taxes & Levies', 14, 192);

  doc.setFont('helvetica', 'italic');
  doc.text('Packing, Forwarding, Freight', 70, 192);

  doc.setFont('helvetica', 'normal');
  drawAutoScaledText(doc, pkgFreight > 0 ? formatCurrency(pkgFreight) : '0.00', 198, 192, 28, 9, 7, { align: 'right' });
  doc.line(leftX, 194, rightX, 194);

  // --- Row 3: Less : Deductions/Discount Etc. --- Y: 194 to 201
  doc.setFont('helvetica', 'normal');
  doc.text('Less : Deductions/Discount Etc.', 14, 199);

  doc.setFont('helvetica', 'italic');
  doc.text(`${discPercent}%`, 70, 199);

  doc.setFont('helvetica', 'normal');
  const discText = discAmount > 0 ? `- ${formatCurrency(discAmount)}` : '0.00';
  drawAutoScaledText(doc, discText, 198, 199, 28, 9, 7, { align: 'right' });
  doc.line(leftX, 201, rightX, 201);

  // --- Row 4: Balance Sub. Total --- Y: 201 to 208
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 44, 89);
  doc.text('Balance Sub. Total', 14, 206);
  drawAutoScaledText(doc, formatCurrency(balanceSubTotal), 198, 206, 28, 9.5, 7, { align: 'right' });
  doc.line(leftX, 208, rightX, 208);

  // --- Row 5: Add : GST --- Y: 208 to 215
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Add : GST', 14, 213);

  doc.setFont('helvetica', 'italic');
  doc.text(`GST @ ${gstRateVal}%`, 70, 213);

  doc.setFont('helvetica', 'normal');
  drawAutoScaledText(doc, formatCurrency(gstAmountVal), 198, 213, 28, 9, 7, { align: 'right' });
  doc.line(leftX, 215, rightX, 215);

  // --- Row 6: GRAND TOTAL : --- Y: 215 to 223
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 44, 89);
  doc.text('GRAND TOTAL :', 14, 221);
  drawAutoScaledText(doc, formatCurrency(finalGrandTotal), 198, 221, 28, 10.5, 8, { align: 'right' });
  doc.line(leftX, 223, rightX, 223);

  // ==========================================
  // 8. RS IN WORDS (Y: 223 to 231)
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 44, 89);
  doc.text('Rs in words -', 14, 228.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const wordsText = numberToWordsIndian(finalGrandTotal);
  drawAutoScaledText(doc, wordsText, 38, 228.5, 158, 8.5, 6.5);
  doc.line(leftX, 231, rightX, 231);

  // ==========================================
  // 9. COMPANY'S BANK DETAILS & SIGNATURE (Y: 231 to 272)
  // ==========================================
  // Vertical divider at X = 120 (Left = Bank Details, Right = Signature)
  doc.line(120, 231, 120, 272);

  // --- Left Side: Company's Bank Details ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 44, 89);
  doc.text("Company's Bank Details", 14, 237.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const bankName = company.bankName || 'ICICI Bank';
  const acNo = company.accountNo || '636305000164';
  const branchIfsc = `${company.branchName || 'Kavalapur'} & ${company.ifscCode || 'ICIC0006363'}`;

  doc.text('Bank Name', 14, 244.5);
  doc.text(`–   ${bankName}`, 45, 244.5);

  doc.text('Current A/c No.', 14, 251.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`–   ${acNo}`, 45, 251.5);

  doc.setFont('helvetica', 'normal');
  doc.text('Branch & IFS Code', 14, 258.5);
  doc.text(`–   ${branchIfsc}`, 45, 258.5);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('* Subject to Sangli Jurisdiction', 14, 267.5);

  // --- Right Side: Signature Block ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Thanking you,', 160, 237.5, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setTextColor(15, 44, 89);
  doc.text(`For ${company.name || 'APEX INDUSTRIES'}`, 160, 242.5, { align: 'center' });

  // Stamp Seal with clean vertical spacing (no text collision)
  if (company.showStamp) {
    drawStampSeal(doc, 160, 253);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 44, 89);
  doc.text('Authorised Signatory', 160, 264.5, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(company.signatoryName || 'Mr. Dilip Mulay', 160, 269, { align: 'center' });

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
