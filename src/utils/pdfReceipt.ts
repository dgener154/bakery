import { jsPDF } from 'jspdf';
import { DigitalReceipt, StoreSettings } from '../types/bakery';
import { formatDateTimeIndo, formatRupiah, getOrderStatusLabel, getPaymentMethodLabel, getPaymentStatusLabel } from './formatters';

export function generateReceiptPdf(receipt: DigitalReceipt, settings: StoreSettings): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(61, 37, 30); // Warm chocolate
  doc.text(settings.storeName.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110, 90, 85);
  doc.text(settings.slogan, pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.text(`${settings.address}, ${settings.city}`, pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text(`Telp: ${settings.phone} | WA: ${settings.whatsapp}`, pageWidth / 2, y, { align: 'center' });

  // Divider line
  y += 6;
  doc.setDrawColor(210, 180, 160);
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);

  // Title
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  doc.text('STRUK PEMBELIAN RESMI', pageWidth / 2, y, { align: 'center' });

  // Transaction Info (2 columns)
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const colLeft = 20;
  const colRight = 110;

  doc.text(`No. Struk    : ${receipt.receiptNumber}`, colLeft, y);
  doc.text(`Tanggal     : ${formatDateTimeIndo(receipt.createdAt)}`, colRight, y);

  y += 5;
  doc.text(`No. Pesanan  : ${receipt.orderNumber}`, colLeft, y);
  doc.text(`Pelanggan   : ${receipt.customerName} (${receipt.customerPhone})`, colRight, y);

  y += 5;
  doc.text(`Kanal Order : ${receipt.channel === 'kasir_pos' ? 'Kasir POS Toko' : 'Pemesanan Online'}`, colLeft, y);
  doc.text(`Kasir / Staf : ${receipt.cashierName || 'Kasir Bakery'}`, colRight, y);

  if (receipt.deliveryType === 'delivery' && receipt.deliveryAddress) {
    y += 5;
    doc.text(`Alamat Kirim : ${receipt.deliveryAddress.substring(0, 60)}`, colLeft, y);
  }

  // Table header
  y += 8;
  doc.setFillColor(248, 243, 237);
  doc.rect(15, y, pageWidth - 30, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);

  doc.text('ITEM & INFORMASI BATCH', 20, y + 5.5);
  doc.text('QTY', 120, y + 5.5, { align: 'center' });
  doc.text('HARGA', 150, y + 5.5, { align: 'right' });
  doc.text('SUBTOTAL', pageWidth - 20, y + 5.5, { align: 'right' });

  y += 10;
  doc.setFont('helvetica', 'normal');

  // Items
  for (const item of receipt.items) {
    // Check if new page needed
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(item.productName, 20, y);

    doc.setFont('helvetica', 'normal');
    doc.text(`${item.qty}x`, 120, y, { align: 'center' });
    doc.text(formatRupiah(item.unitPrice), 150, y, { align: 'right' });
    doc.text(formatRupiah(item.subtotal), pageWidth - 20, y, { align: 'right' });

    // Batch and expiry info
    y += 4;
    doc.setFontSize(8);
    doc.setTextColor(110, 100, 95);
    const batchDetails = item.allocatedBatches
      .map(b => `[Batch ${b.batchCode} | Exp: ${new Date(b.expiryDate).toLocaleDateString('id-ID')}]`)
      .join('; ');
    doc.text(`Batch Alokasi: ${batchDetails}`, 25, y);

    if (item.storageInstructions) {
      y += 3.5;
      doc.text(`Penyimpanan: ${item.storageInstructions.substring(0, 75)}`, 25, y);
    }

    y += 5;
    doc.setFontSize(9);
    doc.setDrawColor(240, 235, 230);
    doc.line(20, y - 1, pageWidth - 20, y - 1);
    y += 2;
  }

  // Totals section
  y += 4;
  doc.setDrawColor(180, 160, 150);
  doc.line(110, y, pageWidth - 15, y);
  y += 5;

  const printRow = (label: string, value: string, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(isBold ? 40 : 80, isBold ? 40 : 80, isBold ? 40 : 80);
    doc.text(label, 115, y);
    doc.text(value, pageWidth - 20, y, { align: 'right' });
    y += 5;
  };

  printRow('Subtotal Belanja', formatRupiah(receipt.subtotal));

  if (receipt.discountAmount > 0) {
    printRow('Diskon Voucher', `-${formatRupiah(receipt.discountAmount)}`);
  }

  if (receipt.deliveryFee > 0) {
    printRow('Ongkos Kirim', formatRupiah(receipt.deliveryFee));
  }

  if (receipt.taxAmount > 0) {
    printRow('Pajak (PB1)', formatRupiah(receipt.taxAmount));
  }

  // Grand Total Highlight
  y += 2;
  doc.setFillColor(250, 240, 230);
  doc.rect(110, y - 4, pageWidth - 125, 9, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150, 60, 20);
  doc.text('TOTAL PEMBAYARAN', 115, y + 2);
  doc.text(formatRupiah(receipt.totalAmount), pageWidth - 20, y + 2, { align: 'right' });
  doc.setFontSize(9);
  y += 9;

  // Payment Details
  printRow('Metode Pembayaran', getPaymentMethodLabel(receipt.paymentMethod));
  printRow('Status Pembayaran', getPaymentStatusLabel(receipt.paymentStatus).label);

  if (receipt.paidAmount && receipt.paidAmount > 0) {
    printRow('Uang Diterima', formatRupiah(receipt.paidAmount));
    printRow('Uang Kembalian', formatRupiah(receipt.changeAmount || 0));
  }

  // Footer notes
  y += 10;
  doc.setDrawColor(210, 180, 160);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(80, 60, 50);
  doc.text(`"${settings.receiptFooterMessage}"`, pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 110, 105);
  doc.text(settings.complaintPolicy, pageWidth / 2, y, { align: 'center', maxWidth: pageWidth - 40 });

  y += 6;
  doc.text(`Struk Digital Otentik dari ${settings.storeName} - Dicetak: ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, y, { align: 'center' });

  // Trigger download
  doc.save(`${receipt.receiptNumber}_BakeryHouse.pdf`);
}

/**
 * Generates formatted WhatsApp text message for instant customer sharing
 */
export function generateWhatsAppMessage(receipt: DigitalReceipt, settings: StoreSettings): string {
  const itemsText = receipt.items
    .map(it => `• ${it.productName} (${it.qty}x) = ${formatRupiah(it.subtotal)}`)
    .join('\n');

  const text = `*${settings.storeName.toUpperCase()} - STRUK PEMBELIAN*\n` +
    `---------------------------------------\n` +
    `No. Struk : *${receipt.receiptNumber}*\n` +
    `No. Order : ${receipt.orderNumber}\n` +
    `Tanggal   : ${formatDateTimeIndo(receipt.createdAt)}\n` +
    `Pelanggan : ${receipt.customerName}\n` +
    `Metode    : ${getPaymentMethodLabel(receipt.paymentMethod)}\n` +
    `Status    : ${getPaymentStatusLabel(receipt.paymentStatus).label}\n` +
    `---------------------------------------\n` +
    `*Rincian Pesanan:*\n${itemsText}\n` +
    `---------------------------------------\n` +
    `Subtotal   : ${formatRupiah(receipt.subtotal)}\n` +
    (receipt.discountAmount > 0 ? `Diskon     : -${formatRupiah(receipt.discountAmount)}\n` : '') +
    (receipt.deliveryFee > 0 ? `Ongkir     : ${formatRupiah(receipt.deliveryFee)}\n` : '') +
    `*TOTAL AKHIR : ${formatRupiah(receipt.totalAmount)}*\n` +
    (receipt.changeAmount && receipt.changeAmount > 0 ? `Kembalian  : ${formatRupiah(receipt.changeAmount)}\n` : '') +
    `---------------------------------------\n` +
    `_${settings.receiptFooterMessage}_\n` +
    `Info Toko: ${settings.phone} | WA: ${settings.whatsapp}`;

  const cleanPhone = receipt.customerPhone.replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Export data array to CSV format file
 */
export function exportToCsv(data: Record<string, unknown>[], filename: string): void {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers
      .map(header => {
        const val = item[header];
        if (val === null || val === undefined) return '""';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
