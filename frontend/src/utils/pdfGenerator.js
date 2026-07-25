import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePdfReport = (filteredRows, riskThreshold, suspiciousThreshold, batchId) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('PlagShield Analysis Report', 14, 22);
  
  // Meta data
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
  if (batchId) {
    doc.text(`Batch ID: ${batchId}`, 14, 36);
  }

  // Summary Table
  const highRiskCount = filteredRows.filter(r => r.score >= riskThreshold).length;
  doc.autoTable({
    startY: 45,
    head: [['Metric', 'Value']],
    body: [
      ['Total Files Compared', filteredRows.length],
      ['High Risk Pairs', highRiskCount]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  // High Risk Pairs Table
  const highRiskData = filteredRows
    .filter(row => row.score >= riskThreshold)
    .sort((a, b) => b.score - a.score)
    .map(row => [row.fileA, row.fileB, `${row.score.toFixed(1)}%`]);

  if (highRiskData.length > 0) {
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['File A', 'File B', 'Score (%)']],
      body: highRiskData,
      theme: 'grid',
      headStyles: { fillColor: [192, 57, 43] },
      styles: { cellPadding: 2, fontSize: 10, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 80 },
        2: { cellWidth: 'auto', halign: 'center' }
      }
    });
  } else {
    doc.text('No high risk pairs detected above the threshold.', 14, doc.lastAutoTable.finalY + 15);
  }

  doc.save(`PlagShield_Report${batchId ? '_' + batchId : ''}.pdf`);
};
