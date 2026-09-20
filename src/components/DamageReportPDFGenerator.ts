import jsPDF from 'jspdf';

export interface PDFReportData {
  reportId: string;
  userName: string;
  userEmail: string;
  locationName: string;
  gpsCoords: string;
  timestamp: string;
  disasterType: string;
  damageCategory: string;
  damageLevel: string;
  severity: string;
  confidence: number;
  aiExplanation: string;
  visualEvidence?: string[];
  damagePercent?: number;
  recommendedCompensation?: number;
  imageUrl?: string;
}

export function generateDamagePDFReport(data: PDFReportData) {
  const doc = new jsPDF();

  // Color Palette
  const darkNavy = '#0f172a';
  const cyanPrimary = '#0284c7';
  const redAlert = '#dc2626';

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NATIONAL DISASTER MANAGEMENT & DAMAGE ASSESSMENT', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(56, 189, 248);
  doc.text('AI-BASED DISASTER PREDICTION & EMERGENCY RESPONSE SYSTEM // OFFICIAL FIELD SURVEY VERIFICATION REPORT', 14, 22);

  // Document Info Meta Table
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 40, 182, 36, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 40, 182, 36, 'S');

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');

  doc.text(`REPORT REFERENCE ID:`, 18, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(data.reportId, 65, 48);

  doc.setFont('helvetica', 'bold');
  doc.text(`SURVEY DATE & TIME:`, 18, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(data.timestamp, 65, 56);

  doc.setFont('helvetica', 'bold');
  doc.text(`APPLICANT NAME:`, 18, 64);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.userName} (${data.userEmail})`, 65, 64);

  doc.setFont('helvetica', 'bold');
  doc.text(`GPS LOCATION NODE:`, 18, 72);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.locationName} [${data.gpsCoords}]`, 65, 72);

  // AI Assessment Matrix Section
  doc.setFillColor(2, 132, 199);
  doc.rect(14, 84, 182, 8, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('AI COMPUTER VISION & DISASTER LOSS ANALYTICS', 18, 90);

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  let y = 100;
  doc.setFont('helvetica', 'bold');
  doc.text('Disaster Classification:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.disasterType, 70, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Damaged Property Category:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.damageCategory, 70, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Visible Damage Level:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 38, 38);
  doc.text(data.damageLevel, 70, y);

  y += 8;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Severity Assessment:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.severity, 70, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('AI Model Confidence:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text(`${data.confidence.toFixed(1)}%`, 70, y);

  // Explanation Box
  y += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 34, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 182, 34, 'S');

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED VISUAL EVIDENCE & FIELD NOTE:', 18, y + 8);

  doc.setFont('helvetica', 'normal');
  const evidenceSummary = (data.visualEvidence && data.visualEvidence.length > 0)
    ? `Evidence: ${data.visualEvidence.join("; ")}. Note: ${data.aiExplanation}`
    : data.aiExplanation;
  const splitText = doc.splitTextToSize(evidenceSummary, 174);
  doc.text(splitText, 18, y + 16);

  // Recommended Government Schemes Section
  y += 42;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, 182, 8, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('INSTITUTIONAL RELIEF RESOURCES & GUIDANCE', 18, y + 6);

  y += 14;
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Pradhan Mantri Fasal Bima Yojana (PMFBY)', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.text('- Agricultural crop damage assessment and insurance relief via official department claim.', 22, y + 5);

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('2. SDRF / NDRF Emergency Assistance Framework', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.text('- State & National Disaster Response Fund structural restoration subject to field verification.', 22, y + 5);

  // Official Seal & Sign Block
  y += 24;
  doc.setDrawColor(148, 163, 184);
  doc.line(14, y, 196, y);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('This document is electronically generated by the AI-Based Disaster Prediction System.', 14, y + 6);
  doc.text('Official sanctioning decisions remain subject to Revenue Department verification.', 14, y + 10);

  // Save / Trigger Download
  doc.save(`Damage_Report_${data.reportId}.pdf`);
}
