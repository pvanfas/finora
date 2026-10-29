import { Transaction } from '@/types';

export function exportCsvReport(transactions: Transaction[], type: 'ALL' | 'EXPENSE' | 'INCOME', title: string) {
  let filtered = transactions;
  if (type === 'EXPENSE') filtered = transactions.filter((t) => t.amount < 0);
  else if (type === 'INCOME') filtered = transactions.filter((t) => t.amount > 0);

  const headers = [
    'ID',
    'Date',
    'Description',
    'Category',
    'Account',
    'Payment Method',
    'Remarks',
    'Amount (INR)',
  ];

  const rows = filtered.map((t) => [
    t.id,
    `"${t.date}"`,
    `"${t.name.replace(/"/g, '""')}"`,
    t.category,
    `"${(t.account || 'Standard General Account').replace(/"/g, '""')}"`,
    `"${(t.paymentMethod || 'Bank Transfer').replace(/"/g, '""')}"`,
    `"${(t.remarks || '').replace(/"/g, '""')}"`,
    t.amount,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportPdfReport(transactions: Transaction[], type: 'ALL' | 'EXPENSE' | 'INCOME', title: string) {
  const { jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default || autoTableModule;

  let filtered = transactions;
  if (type === 'EXPENSE') filtered = transactions.filter((t) => t.amount < 0);
  else if (type === 'INCOME') filtered = transactions.filter((t) => t.amount > 0);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // 1. Top Brand Header Bar
  doc.setFillColor(255, 92, 22); // Brand primary accent
  doc.rect(0, 0, pageWidth, 3.5, 'F');

  doc.setFillColor(17, 24, 39); // Deep obsidian
  doc.rect(0, 3.5, pageWidth, 52, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('FINORA', 36, 37);

  doc.setFillColor(255, 92, 22);
  doc.circle(115, 33, 3, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(156, 163, 175);
  doc.text('Financial Intelligence & Statement Ledger', 126, 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL STATEMENT', pageWidth - 36, 29, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(156, 163, 175);
  doc.text('Currency: INR', pageWidth - 36, 43, { align: 'right' });

  // 2. Report Title & Meta (Left Column)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(17, 24, 39);
  doc.text(title, 36, 82);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128);
  const dateStr = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Generated on: ${dateStr}   •   Total Records: ${filtered.length}`, 36, 97);

  const scopeText =
    type === 'EXPENSE'
      ? 'Scope: Outflows Only (Expense Audit)'
      : type === 'INCOME'
      ? 'Scope: Inflows Only (Capital & Revenue)'
      : 'Scope: Complete Dual-Entry Ledger';
  doc.text(scopeText, 36, 111);

  // 3. Summary KPI Box (Right Column)
  const inflows = filtered.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const outflows = filtered.filter((t) => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const netTotal = filtered.reduce((acc, t) => acc + t.amount, 0);

  const kpiBoxX = 270;
  const kpiBoxY = 66;
  const kpiBoxWidth = pageWidth - 36 - kpiBoxX;
  const kpiBoxHeight = 54;

  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.75);
  doc.roundedRect(kpiBoxX, kpiBoxY, kpiBoxWidth, kpiBoxHeight, 5, 5, 'FD');

  const colW = kpiBoxWidth / 3;

  // Inflow KPI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text('TOTAL INFLOW', kpiBoxX + 10, kpiBoxY + 18);
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105);
  doc.text(`+INR ${Math.round(inflows).toLocaleString('en-IN')}`, kpiBoxX + 10, kpiBoxY + 36);

  // Outflow KPI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text('TOTAL OUTFLOW', kpiBoxX + colW + 6, kpiBoxY + 18);
  doc.setFontSize(8.5);
  doc.setTextColor(220, 38, 38);
  doc.text(`-INR ${Math.round(outflows).toLocaleString('en-IN')}`, kpiBoxX + colW + 6, kpiBoxY + 36);

  // Net KPI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text('NET POSITION', kpiBoxX + colW * 2 + 6, kpiBoxY + 18);
  doc.setFontSize(8.5);
  if (netTotal >= 0) {
    doc.setTextColor(17, 24, 39);
  } else {
    doc.setTextColor(220, 38, 38);
  }
  doc.text(
    `${netTotal < 0 ? '-' : '+'}INR ${Math.abs(Math.round(netTotal)).toLocaleString('en-IN')}`,
    kpiBoxX + colW * 2 + 6,
    kpiBoxY + 36
  );

  // 4. Tabular Ledger Data
  const tableBody = filtered.map((t) => [
    t.date,
    t.name,
    t.category,
    t.account || 'General Account',
    t.remarks || '—',
    `${t.amount < 0 ? '-' : '+'}INR ${Math.abs(t.amount).toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: 132,
    head: [['Date', 'Description', 'Category', 'Account', 'Remarks', 'Amount']],
    body: tableBody,
    margin: { top: 55, bottom: 45, left: 36, right: 36 },
    tableWidth: 'auto',
    styles: {
      font: 'helvetica',
      fontSize: 7.8,
      cellPadding: 5,
      textColor: [31, 41, 55],
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.2,
      cellPadding: 5.5,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 65 },
      3: { cellWidth: 75 },
      4: { cellWidth: 80 },
      5: { cellWidth: 80, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const raw = String(data.cell.raw || '');
        if (raw.startsWith('+')) {
          data.cell.styles.textColor = [5, 150, 105];
        } else {
          data.cell.styles.textColor = [31, 41, 55];
        }
      }
    },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 92, 22);
        doc.text('FINORA', 36, 30);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text(`•  ${title}  •  Continued`, 80, 30);

        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.5);
        doc.line(36, 38, pageWidth - 36, 38);
      }
    },
  });

  // 5. Running Footer for ALL Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(36, pageHeight - 32, pageWidth - 36, pageHeight - 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text('Finora Statement  •  Confidential  •  Generated for Authorized User', 36, pageHeight - 18);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 36, pageHeight - 18, { align: 'right' });
  }

  doc.save(`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`);
}
