import { jsPDF } from 'jspdf';
import { CompanyDetails, PurchaseOrder } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

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

export function generatePurchaseOrderPDF(po: PurchaseOrder, company: CompanyDetails): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const leftX = 10;
  const rightX = 200;
  const topY = 28;
  const pageWidth = rightX - leftX;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 44, 89);
  doc.text('PURCHASE ORDER', 105, 20, { align: 'center' });
  doc.setLineWidth(0.4);
  doc.setDrawColor(15, 44, 89);
  doc.line(80, 22, 130, 22);

  // Outer border
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.rect(leftX, topY, pageWidth, 244);

  // Company Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(15, 44, 89);
  doc.text(company.name || 'APEX INDUSTRIES', 105, 36, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(company.address || '', 105, 41.5, { align: 'center' });
  doc.text(`Mobile No – ${company.phones || ''}`, 105, 46.5, { align: 'center' });
  doc.text(`e-mail ${company.email || ''}`, 105, 51.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 44, 89);
  doc.text(`GSTN No -${company.gstn || ''}`, 105, 57, { align: 'center' });

  // Line below header
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(leftX, 63, rightX, 63);

  // Customer / PO details box (Y: 63 to 89)
  doc.line(120, 63, 120, 89);

  // "To,"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('To,', 14, 69);

  // Customer name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 44, 89);
  drawAutoScaledText(doc, po.customerName || '', 14, 75, 100, 10.5, 7);

  // Customer address (multiline)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const addrLines = doc.splitTextToSize(po.customerAddress || '', 100);
  doc.text(addrLines.slice(0, 2), 14, 81);

  // PO No & Date (right box)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('P.O. No.', 122, 69);
  doc.line(120, 74, rightX, 74);

  doc.setFont('helvetica', 'normal');
  doc.text('Ref. No. :', 122, 81);
  doc.line(120, 85, rightX, 85);

  // PO No value
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 44, 89);
  drawAutoScaledText(doc, po.poNo || '', 138, 69, 28, 9.5, 6.5);

  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Date :', 165, 69);
  doc.setFont('helvetica', 'bold');
  drawAutoScaledText(doc, formatDate(po.poDate) || '', 177, 69, 20, 9, 6.5);

  // Ref No
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 44, 89);
  drawAutoScaledText(doc, po.refNo || '', 138, 81, 28, 9.5, 6.5);

  // Ref Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Date :', 165, 81);
  doc.setFont('helvetica', 'bold');
  drawAutoScaledText(doc, po.refDate ? formatDate(po.refDate) : '', 177, 81, 20, 9, 6.5);

  // Horizontal line at Y = 89
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(leftX, 89, rightX, 89);

  // "Dear Sir" line (Y = 89 to 97)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Dear Sir,', 14, 93.5);
  doc.text('With reference to your above mentioned enquiry, we submit our lowest offer as follows.', 25, 97, {});
  doc.line(leftX, 99, rightX, 99);

  // Items Table Header (Y = 99 to 106)
  const colSNo = leftX;
  const colDesc = 23;
  const colQty = 128;
  const colRate = 148;
  const colAmt = 175;

  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.3);
  doc.line(colDesc - 1, 99, colDesc - 1, 272);
  doc.line(colQty - 1, 99, colQty - 1, 272);
  doc.line(colRate - 1, 99, colRate - 1, 272);
  doc.line(colAmt - 1, 99, colAmt - 1, 272);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 44, 89);
  doc.text('S. No.', colSNo + 1, 104, { maxWidth: 12 });
  doc.text('Description', 75, 104, { align: 'center', maxWidth: 100 });
  doc.text('Qty.', colQty + 8, 104, { align: 'center' });
  doc.text('Unit Rate', colRate + 10, 104, { align: 'center' });
  doc.text('Amount', colAmt + 11, 104, { align: 'center' });

  doc.line(leftX, 106, rightX, 106);

  // Items
  let currentY = 112;
  const lineHeight = 7;
  const maxDescWidth = colQty - colDesc - 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  po.items.forEach((item, _idx) => {
    if (!item.description.trim()) return;
    const descLines = doc.splitTextToSize(item.description, maxDescWidth);
    const rowHeight = Math.max(lineHeight, descLines.length * 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(String(item.srNo), colSNo + 3, currentY, { align: 'left' });

    doc.setFont('helvetica', 'bold');
    doc.text(descLines, colDesc + 1, currentY);

    doc.setFont('helvetica', 'normal');
    doc.text(String(item.quantity), colQty + 10, currentY, { align: 'center' });
    doc.text(`${formatCurrency(item.unitRate)}`, colRate + 20, currentY, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text(`${formatCurrency(item.amount)}`, rightX - 2, currentY, { align: 'right' });

    currentY += rowHeight;
  });

  // TOTAL row (Y = 272)
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(leftX, 272, rightX, 272);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 44, 89);
  doc.text('TOTAL', colAmt - 2, 278, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  drawAutoScaledText(doc, `\u20B9 ${formatCurrency(po.subtotal)}`, rightX - 2, 278, 28, 10.5, 7, { align: 'right' });

  // Terms footer (Y = 272 to end)
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(leftX, 282, rightX, 282);

  // Footer vertical split at X = 100
  doc.line(100, 272, 100, 282);

  const leftTerms = [
    [`Warranty -`, po.warranty || ''],
    [`Packing forwarding :`, po.packingForwarding || ''],
    [`Freight :-`, po.freight || ''],
    [`Payment:-`, po.paymentTerms || ''],
  ];

  const rightTerms = [
    [`Validity –`, po.validity || '30 Days'],
    [`Sales Tax :- GST @`, `${po.gstRate}% Extra`],
    [`Delivery Period :-`, po.deliveryPeriod || ''],
  ];

  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  leftTerms.forEach(([label, value], i) => {
    const y = 275.5 + i * 4.5;
    doc.setFont('helvetica', 'bold');
    doc.text(label, leftX + 1, y);
    doc.setFont('helvetica', 'normal');
    drawAutoScaledText(doc, value, leftX + 32, y, 65, 8, 6);
  });

  rightTerms.forEach(([label, value], i) => {
    const y = 275.5 + i * 4.5;
    doc.setFont('helvetica', 'bold');
    doc.text(label, 102, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 125, y);
  });

  // Thanking you / signature block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Thanking you,', 160, 283, { align: 'center' });
  doc.text(`For ${company.name || 'APEX INDUSTRIES'}`, 160, 288, { align: 'center' });

  // Stamp circle
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.circle(160, 299, 7);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 44, 89);
  doc.text(company.name || 'APEX INDUSTRIES', 160, 297.5, { align: 'center', maxWidth: 11 });
  doc.text('SANGLI', 160, 301.5, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 44, 89);
  doc.text(company.signatoryName || 'Mr. Dilip Mulay', 160, 309, { align: 'center' });

  return doc;
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
