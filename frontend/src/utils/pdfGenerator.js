import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePdfReport = (filteredRows, riskThreshold, suspiciousThreshold, batchId) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark Gray
  const dangerColor = [192, 57, 43]; // Red
  
  // Header Branding Background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('PlagShield Dossier', 14, 25);
  
  // Subtitle / Brand
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Advanced Code Plagiarism Detection', 14, 32);

  // Meta data
  doc.setFontSize(10);
  doc.setTextColor(100);
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  doc.text(`Generated: ${currentDate} ${currentTime}`, 14, 50);
  if (batchId) {
    doc.text(`Batch ID: ${batchId}`, 14, 56);
  }

  // Summary Cards (simulated with autoTable)
  const highRiskCount = filteredRows.filter(r => r.score >= riskThreshold).length;
  const suspiciousCount = filteredRows.filter(r => r.score >= suspiciousThreshold && r.score < riskThreshold).length;
  
  doc.autoTable({
    startY: 65,
    head: [['Total Comparisons', 'High Risk Matches', 'Suspicious Matches']],
    body: [
      [filteredRows.length, highRiskCount, suspiciousCount]
    ],
    theme: 'grid',
    headStyles: { fillColor: secondaryColor, textColor: 255, halign: 'center' },
    bodyStyles: { halign: 'center', fontSize: 14, fontStyle: 'bold' },
    margin: { top: 65 }
  });

  // Highest Risk Matches Table
  const highRiskData = filteredRows
    .filter(row => row.score >= riskThreshold)
    .sort((a, b) => b.score - a.score)
    .map((row, index) => [index + 1, row.fileA, row.fileB, `${row.score.toFixed(1)}%`]);

  if (highRiskData.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Highest-Risk Matches', 14, doc.lastAutoTable.finalY + 15);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['#', 'Source File A', 'Source File B', 'Match Score']],
      body: highRiskData,
      theme: 'striped',
      headStyles: { fillColor: dangerColor, textColor: 255 },
      styles: { cellPadding: 3, fontSize: 10, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 25, halign: 'center', fontStyle: 'bold', textColor: dangerColor }
      },
      didDrawPage: function (data) {
        // Footer with page number
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} | PlagShield Dossier`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'italic');
    doc.text('No high-risk pairs detected above the defined threshold.', 14, doc.lastAutoTable.finalY + 20);
  }

  // Footer for the first page if there's no table stretching to multiple pages
  if (highRiskData.length === 0) {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page 1 | PlagShield Dossier`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const fileName = `PlagShield_Dossier${batchId ? '_' + batchId : ''}.pdf`;
  doc.save(fileName);
};
