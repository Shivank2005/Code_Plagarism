import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePdfReport = (filteredRows, riskThreshold, suspiciousThreshold, batchId, rings = []) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  const primaryColor = [41, 128, 185];
  const secondaryColor = [52, 73, 94];
  const dangerColor = [192, 57, 43];
  const warningColor = [211, 84, 0];
  const ringColor = [142, 68, 173]; // Purple for rings

  // Helper to add footer
  const addFooter = (data) => {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${data.pageNumber} | PlagShield Report`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  // Header Branding Background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('PlagShield Report', 14, 25);
  
  // Subtitle / Brand
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Advanced Code Plagiarism Detection', 14, 32);

  // Meta data
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  
  const dateOpts = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const niceDate = new Date().toLocaleDateString('en-US', dateOpts);
  doc.text(`Date Generated:  ${niceDate}`, 14, 50);
  
  if (batchId) {
    const shortId = batchId.split('-')[0].toUpperCase();
    doc.text(`Tracking Reference:  #${shortId}`, 14, 56);
  }

  // Summary Cards
  const highRiskCount = filteredRows.filter(r => r.score >= riskThreshold).length;
  const suspiciousCount = filteredRows.filter(r => r.score >= suspiciousThreshold && r.score < riskThreshold).length;
  
  autoTable(doc, {
    startY: 65,
    head: [['Total Comparisons', 'High Risk Matches', 'Suspicious Matches', 'Rings Detected']],
    body: [[filteredRows.length, highRiskCount, suspiciousCount, rings.length]],
    theme: 'grid',
    headStyles: { fillColor: secondaryColor, textColor: 255, halign: 'center' },
    bodyStyles: { halign: 'center', fontSize: 14, fontStyle: 'bold' },
    margin: { top: 65 }
  });

  // Map Row Helper (Adds AI Insights)
  const mapRow = (row, index) => {
    let insight = '';
    if (row.isAnomaly) insight += '⚠️ ANOMALY\n';
    if (row.featureImportance && Object.keys(row.featureImportance).length > 0) {
      const topFactor = Object.entries(row.featureImportance).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]))[0][0];
      insight += `Top: ${topFactor}`;
    }
    return [index + 1, row.fileA, row.fileB, `${row.score.toFixed(1)}%`, insight];
  };

  // 1. High Risk Matches
  const highRiskData = filteredRows.filter(row => row.score >= riskThreshold).sort((a, b) => b.score - a.score).map(mapRow);
  
  if (highRiskData.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('High-Risk Matches', 14, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['#', 'Source File A', 'Source File B', 'Match', 'AI Insights']],
      body: highRiskData,
      theme: 'striped',
      headStyles: { fillColor: dangerColor, textColor: 255 },
      styles: { cellPadding: 3, fontSize: 9, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        3: { cellWidth: 20, halign: 'center', fontStyle: 'bold', textColor: dangerColor },
        4: { cellWidth: 40, fontStyle: 'italic', textColor: 100 }
      },
      didDrawPage: addFooter
    });
  }

  // 2. Suspicious Matches
  const suspiciousData = filteredRows.filter(row => row.score >= suspiciousThreshold && row.score < riskThreshold).sort((a, b) => b.score - a.score).map(mapRow);

  if (suspiciousData.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Suspicious Matches', 14, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['#', 'Source File A', 'Source File B', 'Match', 'AI Insights']],
      body: suspiciousData,
      theme: 'striped',
      headStyles: { fillColor: warningColor, textColor: 255 },
      styles: { cellPadding: 3, fontSize: 9, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        3: { cellWidth: 20, halign: 'center', fontStyle: 'bold', textColor: warningColor },
        4: { cellWidth: 40, fontStyle: 'italic', textColor: 100 }
      },
      didDrawPage: addFooter
    });
  }

  // 3. Plagiarism Rings
  if (rings && rings.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Plagiarism Rings Detected', 14, doc.lastAutoTable.finalY + 15);

    const ringData = rings.map((ring, idx) => [
      idx + 1,
      ring.classification || 'Suspicious Cluster',
      `${ring.averageSimilarity?.toFixed(1) || 0}%`,
      ring.members.join('\n')
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['#', 'Classification', 'Avg Match', 'Involved Students/Files']],
      body: ringData,
      theme: 'striped',
      headStyles: { fillColor: ringColor, textColor: 255 },
      styles: { cellPadding: 3, fontSize: 9, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 40, fontStyle: 'bold' },
        2: { cellWidth: 25, halign: 'center', fontStyle: 'bold', textColor: ringColor },
        3: { cellWidth: 'auto' }
      },
      didDrawPage: addFooter
    });
  }

  // Backup Footer if no tables spanned
  if (highRiskData.length === 0 && suspiciousData.length === 0 && rings.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'italic');
    doc.text('No matches or rings detected above the defined thresholds.', 14, doc.lastAutoTable.finalY + 20);
    addFooter({ pageNumber: 1 });
  }

  const fileName = `PlagShield_Report${batchId ? '_' + batchId : ''}.pdf`;
  doc.save(fileName);
};
