import { jsPDF } from 'jspdf';
import { CompanyDetails, PurchaseOrder } from '../types';
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
 * High-Precision Vector PDF Generator for Purchase Order
 * Exact 1:1 reproduction of the Apex Industries layout with dynamic margins
 */
export function generatePurchaseOrderPDF(
  po: PurchaseOrder,
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
  // 1. TOP HEADER: "PURCHASE ORDER"
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 44, 89); // Deep Apex Navy
  doc.text('PURCHASE ORDER', 105, 20, { align: 'center' });

  // Underline below PURCHASE ORDER
  doc.setLineWidth(0.4);
  doc.setDrawColor(15, 44, 89);
  doc.line(78, 22, 132, 22);

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
  // 4. CUSTOMER & PO DETAILS BOX (Y: 63 to 89)
  // ==========================================
  // Vertical split at X = 120 (Left = Customer, Right = PO Meta)
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

  // Static PO Details Labels
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('P.O. No.', 122.5, 70);
  doc.text('Date :', 168.5, 70);
  doc.text('Ref. No.', 122.5, 83);
  doc.text('Date :', 168.5, 83);

  // Dynamic Customer Details
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  drawAutoScaledText(doc, po.customerName || '', 14, 73.5, 102, 10.5, 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const splitAddress = doc.splitTextToSize(po.customerAddress || '', 102);
  doc.text(splitAddress, 14, 79);

  // Dynamic PO Metadata
  doc.setFont('helvetica', 'bold');
  drawAutoScaledText(doc, po.poNo || '', 134, 70, 30.5, 9.5, 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(formatDate(po.poDate), 179, 70);

  drawAutoScaledText(doc, po.refNo || '-', 136, 83, 28.5, 9, 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(formatDate(po.refDate) || '-', 179, 83);

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
  doc.line(leftX, 102, rightX, 102); // Top table header line
  doc.line(leftX, 110, rightX, 110); // Bottom table header line

  // Column horizontal positions
  // S.No: 10 to 25 (15mm)
  // Description: 25 to 125 (100mm)
  // Qty: 125 to 144 (19mm)
  // Unit Rate: 144 to 168 (24mm)
  // Amount: 168 to 200 (32mm)
  const colX = [10, 25, 125, 144, 168, 200];

  // Draw vertical column grid lines from Y = 102 to 210
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
  doc.line(leftX, 218, rightX, 218); // Bottom of Total row

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL', 165, 215.5, { align: 'right' });

  // ==========================================
  // DYNAMIC LINE ITEMS (Y: 116.5 to 208)
  // ==========================================
  let currentY = 116.5;
  const rowMaxY = 208;

  po.items.forEach((item, index) => {
    if (currentY >= rowMaxY) return;

    // S.No
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text(String(item.srNo || index + 1), 17.5, currentY, { align: 'center' });

    // Description
    const descWidth = 96;
    const descLines = doc.splitTextToSize(item.description || '', descWidth);
    doc.text(descLines, 27, currentY);

    // Qty
    doc.text(String(item.quantity || 1), 134.5, currentY, { align: 'center' });

    // Unit Rate
    drawAutoScaledText(doc, formatCurrency(item.unitRate), 166, currentY, 21, 9.5, 7, { align: 'right' });

    // Amount
    doc.setFont('helvetica', 'bold');
    drawAutoScaledText(doc, formatCurrency(item.amount), 198, currentY, 29, 9.5, 7, { align: 'right' });

    const linesCount = Array.isArray(descLines) ? descLines.length : 1;
    currentY += Math.max(linesCount * 4.5 + 2.5, 7.5);
  });

  // Total in Amount column
  const poTotal =
    po.items && po.items.length > 0
      ? po.items.reduce((s, it) => s + (Number(it.amount) || 0), 0)
      : (po.subtotal || po.grandTotal);

  doc.setFont('helvetica', 'bold');
  drawAutoScaledText(doc, formatCurrency(poTotal), 198, 215.5, 30, 10.5, 7.5, { align: 'right' });

  // ==========================================
  // 7. TERMS & SIGNATURE SECTION (Y: 218 to 272)
  // ==========================================
  doc.line(120, 218, 120, 272); // Vertical divider

  // Left Column Static Labels & Grid Lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
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
  doc.setTextColor(15, 44, 89);
  doc.text('Thanking you,', 160, 244, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`For ${company.name || 'APEX INDUSTRIES'}`, 160, 249, { align: 'center' });

  // Dynamic Terms Values
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  if (po.warranty) {
    drawAutoScaledText(doc, po.warranty, 31, 224, 87, 9, 6.5);
  }
  if (po.packingForwarding) {
    drawAutoScaledText(doc, po.packingForwarding, 48, 230.5, 70, 9, 6.5);
  }
  if (po.freight) {
    drawAutoScaledText(doc, po.freight, 29, 237, 89, 9, 6.5);
  }
  if (po.paymentTerms) {
    drawAutoScaledText(doc, po.paymentTerms, 31, 243.5, 87, 9, 6.5);
  }
  if (po.validity) {
    drawAutoScaledText(doc, po.validity, 138, 224, 60, 9, 6.5);
  }
  doc.setFont('helvetica', 'bold');
  doc.text(String(po.gstRate ?? 18), 154, 230.5);

  doc.setFont('helvetica', 'normal');
  if (po.deliveryPeriod) {
    drawAutoScaledText(doc, po.deliveryPeriod, 150, 237, 48, 9, 6.5);
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

// Vectorized official stamp seal
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

export function downloadPurchaseOrderPDF(po: PurchaseOrder, company: CompanyDetails): void {
  const doc = generatePurchaseOrderPDF(po, company);
  doc.save(`PurchaseOrder_${po.poNo || 'draft'}.pdf`);
}

export function printPurchaseOrderPDF(po: PurchaseOrder, company: CompanyDetails): void {
  const doc = generatePurchaseOrderPDF(po, company);
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

export function getPurchaseOrderPDFBlob(po: PurchaseOrder, company: CompanyDetails): Blob {
  const doc = generatePurchaseOrderPDF(po, company);
  return doc.output('blob');
}
