import { CompanyDetails, Quotation, PurchaseOrder, ProformaInvoice } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

/**
 * Dynamic Auto-Fit Text Helper for HTML5 Canvas
 * Dynamically shrinks font size so that large text never spills outside its box
 */
function drawAutoScaledCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number = 11,
  fontWeight: string = 'bold',
  fontFamily: string = '"Segoe UI", Inter, Arial, sans-serif'
): void {
  if (!text) return;
  let fontSize = maxFontSize;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && fontSize > minFontSize) {
    fontSize -= 0.5;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  }
  ctx.fillText(text, x, y);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = (text || '').split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

interface CommonDocData {
  type: 'quotation' | 'purchase' | 'proforma';
  docNo: string;
  docDate: string;
  refNo: string;
  refDate: string;
  customerName: string;
  customerAddress: string;
  items: Array<{ srNo?: number; description: string; quantity: number; unitRate: number; amount: number }>;
  warranty: string;
  packingForwarding: string;
  freight: string;
  paymentTerms: string;
  validity: string;
  deliveryPeriod: string;
  gstRate: number;
  subtotal: number;
  grandTotal: number;
}

async function renderDocToCanvasBlob(
  data: CommonDocData,
  company: CompanyDetails,
  format: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<Blob> {
  const scale = 2; // 2x Retina for crystal clear text
  const width = 1240 * scale;
  const height = 1754 * scale; // Standard A4 proportion

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');

  // Clean White Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.scale(scale, scale);

  // Coordinate mapping constants (base width: 1240, height: 1754)
  const leftX = 60;
  const rightX = 1180;
  const topY = 190;
  const boxWidth = rightX - leftX; // 1120

  // 1. TOP HEADER
  ctx.fillStyle = '#0F2C59';
  ctx.font = 'bold 36px "Segoe UI", Inter, Arial, sans-serif';
  ctx.textAlign = 'center';

  let titleText = 'QUOTATION';
  let underlineStart = 490;
  let underlineEnd = 750;
  let metaDocLabel = 'Q. No.';

  if (data.type === 'purchase') {
    titleText = 'PURCHASE ORDER';
    underlineStart = 440;
    underlineEnd = 800;
    metaDocLabel = 'P.O. No.';
  } else if (data.type === 'proforma') {
    titleText = 'PROFORMA INVOICE';
    underlineStart = 420;
    underlineEnd = 820;
    metaDocLabel = 'P.I. No.';
  }

  ctx.fillText(titleText, 620, 130);

  // Underline
  ctx.strokeStyle = '#0F2C59';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(underlineStart, 145);
  ctx.lineTo(underlineEnd, 145);
  ctx.stroke();

  // 2. MAIN OUTER BORDER
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 3;
  ctx.strokeRect(leftX, topY, boxWidth, 1420);

  // 3. COMPANY HEADER BOX (Y: 190 to 360)
  ctx.fillStyle = '#0F2C59';
  ctx.font = 'bold 32px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(company.name || 'APEX INDUSTRIES', 620, 235);

  ctx.fillStyle = '#334155';
  ctx.font = '20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(company.address || 'E-9, MIDC, Kupwad, SANGLI – 416436 (MS)', 620, 268);
  ctx.fillText(`Mobile No – ${company.phones || '9850060698 / 8855003009'}`, 620, 298);
  ctx.fillText(`e-mail ${company.email || 'apexindustries92@gmail.com'}`, 620, 326);

  ctx.fillStyle = '#0F2C59';
  ctx.font = 'bold 22px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(`GSTN No -${company.gstn || '27ABDPM6031D1Z1'}`, 620, 355);

  // Horizontal line below header (Y = 370)
  ctx.beginPath();
  ctx.moveTo(leftX, 370);
  ctx.lineTo(rightX, 370);
  ctx.stroke();

  // 4. CUSTOMER & METADATA BOX (Y: 370 to 520)
  const metaSplitX = 690;
  const dateSplitX = 990;
  ctx.beginPath();
  ctx.moveTo(metaSplitX, 370);
  ctx.lineTo(metaSplitX, 520);
  ctx.moveTo(metaSplitX, 445);
  ctx.lineTo(rightX, 445);
  ctx.moveTo(dateSplitX, 370);
  ctx.lineTo(dateSplitX, 520);
  ctx.stroke();

  // Customer details (Left side: 60 to 690)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 22px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText('To,', leftX + 24, 405);

  ctx.fillStyle = '#0F2C59';
  drawAutoScaledCanvasText(ctx, data.customerName || '', leftX + 24, 440, 580, 24, 15, 'bold');

  ctx.fillStyle = '#475569';
  ctx.font = '19px "Segoe UI", Inter, Arial, sans-serif';
  const addrLines = wrapText(ctx, data.customerAddress, 580);
  addrLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, leftX + 24, 470 + i * 24);
  });

  // Metadata (Right side)
  ctx.font = '20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText(metaDocLabel, metaSplitX + 15, 415);
  ctx.fillStyle = '#0F2C59';
  drawAutoScaledCanvasText(ctx, data.docNo || '', metaSplitX + 95, 415, 195, 22, 12, 'bold');

  // Date 1
  ctx.fillStyle = '#64748B';
  ctx.font = '20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText('Date :', dateSplitX + 15, 415);
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(formatDate(data.docDate), dateSplitX + 75, 415);

  // Ref. No.
  ctx.fillStyle = '#64748B';
  ctx.font = '20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText('Ref. No. :', metaSplitX + 15, 490);
  ctx.fillStyle = '#1E293B';
  drawAutoScaledCanvasText(ctx, data.refNo || '-', metaSplitX + 105, 490, 185, 20, 12, 'bold');

  // Date 2
  ctx.fillStyle = '#64748B';
  ctx.font = '20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText('Date :', dateSplitX + 15, 490);
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(formatDate(data.refDate) || '-', dateSplitX + 75, 490);

  // 5. SALUTATION SECTION (Y: 520 to 600)
  ctx.beginPath();
  ctx.moveTo(leftX, 520);
  ctx.lineTo(rightX, 520);
  ctx.stroke();

  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText('Dear Sir,', leftX + 24, 555);
  ctx.font = '20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText('With reference to your above mentioned enquiry, we submit our lowest offer as follows.', leftX + 80, 585);

  // 6. TABLE HEADER & COLUMN GRID (Y: 605 to 1260)
  const colX = [60, 140, 730, 830, 985, 1180];

  ctx.beginPath();
  ctx.moveTo(leftX, 605);
  ctx.lineTo(rightX, 605);
  ctx.moveTo(leftX, 650);
  ctx.lineTo(rightX, 650);
  ctx.stroke();

  colX.forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 605);
    ctx.lineTo(x, 1215);
    ctx.stroke();
  });

  // Header labels
  ctx.fillStyle = '#0F2C59';
  ctx.font = 'bold 20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('S. No.', 100, 636);
  ctx.fillText('Description', 435, 636);
  ctx.fillText('Qty.', 780, 636);
  ctx.fillText('Unit Rate', 907, 636);
  ctx.fillText('Amount', 1082, 636);

  // Line items rendering
  let rowY = 690;
  data.items.forEach((item, idx) => {
    if (rowY > 1180) return;

    ctx.fillStyle = '#334155';
    ctx.font = '20px "Segoe UI", Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(item.srNo || idx + 1), 100, rowY);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px "Segoe UI", Inter, Arial, sans-serif';
    const descLines = wrapText(ctx, item.description, 560);
    descLines.forEach((dl, di) => {
      ctx.fillText(dl, 155, rowY + di * 26);
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 20px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(String(item.quantity || 1), 780, rowY);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#334155';
    ctx.font = '20px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(formatCurrency(item.unitRate), 970, rowY);

    ctx.fillStyle = '#0F2C59';
    ctx.font = 'bold 21px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(formatCurrency(item.amount), 1165, rowY);

    rowY += Math.max(descLines.length * 28 + 15, 45);
  });

  // Table items bottom line (Y = 1215)
  ctx.beginPath();
  ctx.moveTo(leftX, 1215);
  ctx.lineTo(rightX, 1215);
  ctx.stroke();

  // TOTAL Row (Y: 1215 to 1260)
  ctx.beginPath();
  ctx.moveTo(colX[4], 1215);
  ctx.lineTo(colX[4], 1260);
  ctx.moveTo(leftX, 1260);
  ctx.lineTo(rightX, 1260);
  ctx.stroke();

  const totalAmount =
    data.items && data.items.length > 0
      ? data.items.reduce((s, it) => s + (Number(it.amount) || 0), 0)
      : (data.subtotal || data.grandTotal);

  ctx.fillStyle = '#0F2C59';
  ctx.font = 'bold 22px "Segoe UI", Inter, Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('TOTAL', 970, 1246);
  ctx.fillText(`₹ ${formatCurrency(totalAmount)}`, 1165, 1246);

  // 7. TERMS & CONDITIONS AND SIGNATURE (Y: 1260 to 1610)
  ctx.beginPath();
  ctx.moveTo(metaSplitX, 1260);
  ctx.lineTo(metaSplitX, 1610);
  ctx.stroke();

  // Left terms
  ctx.textAlign = 'left';

  const termRows = [
    { label: 'Warranty -', val: data.warranty || '12 Months against manufacturing defects', y: 1295 },
    { label: 'Packing forwarding : -', val: data.packingForwarding || 'Included in above rates', y: 1335 },
    { label: 'Freight :-', val: data.freight || 'Extra at actual / To Pay', y: 1375 },
    { label: 'Payment:-', val: data.paymentTerms || '100% against delivery', y: 1415 },
  ];

  termRows.forEach((tr) => {
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 18px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(tr.label, leftX + 20, tr.y);

    ctx.fillStyle = '#0F172A';
    drawAutoScaledCanvasText(ctx, tr.val, leftX + 215, tr.y, 440, 18, 12, 'normal');

    ctx.beginPath();
    ctx.moveTo(leftX, tr.y + 10);
    ctx.lineTo(metaSplitX, tr.y + 10);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Dedicated Bank Details for Proforma, or Note for Quote/PO
  if (data.type === 'proforma') {
    ctx.fillStyle = '#0F2C59';
    ctx.font = 'bold 18px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('BANK DETAILS :', leftX + 20, 1465);

    ctx.fillStyle = '#334155';
    ctx.font = '16px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(`Bank Name : ${company.bankName || 'State Bank of India'}`, leftX + 20, 1495);
    ctx.fillText(`A/c No.     : ${company.accountNo || '-'}`, leftX + 20, 1525);
    ctx.fillText(`IFSC Code : ${company.ifscCode || '-'}`, leftX + 20, 1555);
    ctx.fillText(`Branch      : ${company.branchName || '-'}`, leftX + 20, 1585);
  } else {
    ctx.fillStyle = '#64748B';
    ctx.font = '16px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('We hope our offer is in line with your exact requirement.', leftX + 20, 1485);
    ctx.fillText('Kindly feel free to ask us any details.', leftX + 20, 1515);
  }

  // Right terms & Sign
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;

  const rightRows = [
    { label: 'Validity –', val: data.validity || '30 Days', y: 1295 },
    { label: 'Sales Tax :- GST @', val: `${data.gstRate}% Extra`, y: 1335 },
    { label: 'Delivery Period :-', val: data.deliveryPeriod || '1 to 2 Weeks', y: 1375 },
  ];

  rightRows.forEach((rr) => {
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 18px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(rr.label, metaSplitX + 20, rr.y);

    ctx.fillStyle = '#0F172A';
    drawAutoScaledCanvasText(ctx, rr.val, metaSplitX + 200, rr.y, 250, 18, 12, 'bold');

    ctx.beginPath();
    ctx.moveTo(metaSplitX, rr.y + 10);
    ctx.lineTo(rightX, rr.y + 10);
    ctx.stroke();
  });

  // Signatory
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 19px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText('Thanking you,', 945, 1435);

  ctx.fillStyle = '#0F2C59';
  ctx.font = 'bold 21px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(`For ${company.name || 'APEX INDUSTRIES'}`, 945, 1465);

  // Stamp circle & signature
  ctx.save();
  ctx.strokeStyle = '#4338CA';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(945, 1515, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#4338CA';
  ctx.font = 'bold 8px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText('APEX INDUSTRIES', 945, 1512);
  ctx.fillText('SANGLI', 945, 1528);
  ctx.restore();

  ctx.fillStyle = '#0F2C59';
  ctx.font = 'bold 22px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(company.signatoryName || 'Mr. Dilip Mulay', 945, 1585);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create image blob'));
    }, format, 0.95);
  });
}

// ==========================================
// QUOTATION EXPORTS
// ==========================================
export async function generateQuotationImageBlob(
  quote: Quotation,
  company: CompanyDetails,
  format: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<Blob> {
  return renderDocToCanvasBlob(
    {
      type: 'quotation',
      docNo: quote.quotationNo,
      docDate: quote.quotationDate,
      refNo: quote.refNo,
      refDate: quote.refDate,
      customerName: quote.customerName,
      customerAddress: quote.customerAddress,
      items: quote.items,
      warranty: quote.warranty,
      packingForwarding: quote.packingForwarding,
      freight: quote.freight,
      paymentTerms: quote.paymentTerms,
      validity: quote.validity,
      deliveryPeriod: quote.deliveryPeriod,
      gstRate: quote.gstRate,
      subtotal: quote.subtotal,
      grandTotal: quote.grandTotal,
    },
    company,
    format
  );
}

export async function downloadQuotationJPG(
  quote: Quotation,
  company: CompanyDetails
): Promise<void> {
  const cleanCustomer = (quote.customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${quote.quotationNo || 'Quotation'}_${cleanCustomer}.jpg`;
  const blob = await generateQuotationImageBlob(quote, company, 'image/jpeg');
  triggerDownload(blob, filename);
}

// ==========================================
// PURCHASE ORDER EXPORTS
// ==========================================
export async function generatePurchaseOrderImageBlob(
  po: PurchaseOrder,
  company: CompanyDetails,
  format: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<Blob> {
  return renderDocToCanvasBlob(
    {
      type: 'purchase',
      docNo: po.poNo,
      docDate: po.poDate,
      refNo: po.refNo,
      refDate: po.refDate,
      customerName: po.customerName,
      customerAddress: po.customerAddress,
      items: po.items,
      warranty: po.warranty,
      packingForwarding: po.packingForwarding,
      freight: po.freight,
      paymentTerms: po.paymentTerms,
      validity: po.validity,
      deliveryPeriod: po.deliveryPeriod,
      gstRate: po.gstRate,
      subtotal: po.subtotal,
      grandTotal: po.grandTotal,
    },
    company,
    format
  );
}

export async function downloadPurchaseOrderJPG(
  po: PurchaseOrder,
  company: CompanyDetails
): Promise<void> {
  const cleanCustomer = (po.customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${po.poNo || 'PurchaseOrder'}_${cleanCustomer}.jpg`;
  const blob = await generatePurchaseOrderImageBlob(po, company, 'image/jpeg');
  triggerDownload(blob, filename);
}

// ==========================================
// PROFORMA INVOICE EXPORTS
// ==========================================
export async function generateProformaInvoiceImageBlob(
  pi: ProformaInvoice,
  company: CompanyDetails,
  format: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<Blob> {
  return renderDocToCanvasBlob(
    {
      type: 'proforma',
      docNo: pi.piNo,
      docDate: pi.piDate,
      refNo: pi.refNo,
      refDate: pi.refDate,
      customerName: pi.customerName,
      customerAddress: pi.customerAddress,
      items: pi.items,
      warranty: pi.warranty,
      packingForwarding: pi.packingForwarding,
      freight: pi.freight,
      paymentTerms: pi.paymentTerms,
      validity: pi.validity,
      deliveryPeriod: pi.deliveryPeriod,
      gstRate: pi.gstRate,
      subtotal: pi.subtotal,
      grandTotal: pi.grandTotal,
    },
    company,
    format
  );
}

export async function downloadProformaInvoiceJPG(
  pi: ProformaInvoice,
  company: CompanyDetails
): Promise<void> {
  const cleanCustomer = (pi.customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${pi.piNo || 'ProformaInvoice'}_${cleanCustomer}.jpg`;
  const blob = await generateProformaInvoiceImageBlob(pi, company, 'image/jpeg');
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
