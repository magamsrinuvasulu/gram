import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import {
  SymptomAnalysisResult,
  BodyPartPain,
  Language,
  UserProfile,
  FamilyMember,
} from '../types';

export interface ExportReportOptions {
  analysisResult: SymptomAnalysisResult;
  userStatement: string;
  selectedQuickSymptoms: string[];
  bodyPains: BodyPartPain[];
  language: Language;
  patientProfile?: {
    name: string;
    age?: number | string;
    gender?: string;
    relation?: string;
    village?: string;
    mandal?: string;
    district?: string;
    emergencyContact?: string;
    bloodGroup?: string;
  };
  doctorNotes?: string;
  reportId?: string;
}

export function generateReportId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AROGYA-${dateStr}-${randomSuffix}`;
}

export function formatDateTime(isoOrDate?: string | Date): string {
  const d = isoOrDate ? new Date(isoOrDate) : new Date();
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Builds a clean, highly structured, human-readable clinical summary in Plain Text
 * suitable for printing, saving as .txt, attaching to EMR/WhatsApp, or sending to doctors.
 */
export function generateTextReport(options: ExportReportOptions): string {
  const {
    analysisResult,
    userStatement,
    selectedQuickSymptoms,
    bodyPains,
    language,
    patientProfile,
    doctorNotes,
    reportId = generateReportId(),
  } = options;

  const dateTime = formatDateTime(analysisResult.timestamp);
  const urgencyUpper = (analysisResult.urgencyLevel || 'MEDIUM').toUpperCase();

  const lines: string[] = [];

  lines.push('================================================================================');
  lines.push('               AROGYASATHI - RURAL HEALTH CLINICAL TRIAGE REPORT                ');
  lines.push('                    ఆరోగ్య సాథి - లక్షణాల పరిశీలన & ట్రయేజ్ నివేదిక               ');
  lines.push('================================================================================');
  lines.push(`Report Reference ID : ${reportId}`);
  lines.push(`Generated On        : ${dateTime}`);
  lines.push(`Interface Language  : ${language === 'te' ? 'Telugu (తెలుగు)' : language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}`);
  lines.push(`Clinical Purpose    : Patient Health Record & Clinical Triage Summary`);
  lines.push('--------------------------------------------------------------------------------');
  lines.push('1. PATIENT DEMOGRAPHICS / రోగి వివరాలు');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(`Patient Name        : ${patientProfile?.name || 'Self (Registered User)'}`);
  if (patientProfile?.relation) {
    lines.push(`Relation to Head    : ${patientProfile.relation}`);
  }
  lines.push(`Age / Gender        : ${patientProfile?.age || 'Not specified'} yrs | ${patientProfile?.gender || 'Not specified'}`);
  if (patientProfile?.bloodGroup) {
    lines.push(`Blood Group         : ${patientProfile.bloodGroup}`);
  }
  lines.push(`Location            : ${[patientProfile?.village, patientProfile?.mandal, patientProfile?.district].filter(Boolean).join(', ') || 'Rural Community'}`);
  if (patientProfile?.emergencyContact) {
    lines.push(`Emergency Contact   : ${patientProfile.emergencyContact}`);
  }

  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('2. CHIEF COMPLAINTS & REPORTED SYMPTOMS / రోగి తెలిపిన సమస్యలు');
  lines.push('--------------------------------------------------------------------------------');
  if (userStatement) {
    lines.push(`Patient Description : "${userStatement.trim()}"`);
  }
  if (selectedQuickSymptoms && selectedQuickSymptoms.length > 0) {
    lines.push(`Quick Symptoms      : ${selectedQuickSymptoms.join(', ')}`);
  }

  if (bodyPains && bodyPains.length > 0) {
    lines.push('Specific Body Pain Points:');
    bodyPains.forEach((p, idx) => {
      const bilingualPart = p.partNameTe ? `${p.partName} (${p.partNameTe})` : p.partName;
      lines.push(
        `  [${idx + 1}] Location: ${bilingualPart} | Type: ${p.painType} | Severity: ${p.severity.toUpperCase()} | Duration: ${p.duration.replace(/_/g, ' ')}${p.notes ? `\n      Notes: ${p.notes}` : ''}`
      );
    });
  }

  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('3. AI CLINICAL ASSESSMENT & TRIAGE EVALUATION / ఏఐ విశ్లేషణ');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(`Urgency Category    : [ ${urgencyUpper} ]`);
  if (analysisResult.isEmergency) {
    lines.push(`*** CRITICAL ALERT *** : ${analysisResult.emergencyAlertText || 'Emergency symptoms detected! Immediate clinical evaluation required.'}`);
    lines.push('Action Protocol     : DIAL 108 AMBULANCE OR REACH NEAREST HOSPITAL EMERGENCY');
  }

  if (analysisResult.symptomsDetected && analysisResult.symptomsDetected.length > 0) {
    lines.push(`Identified Symptoms : ${analysisResult.symptomsDetected.join(', ')}`);
  }

  if (analysisResult.possibleCauses && analysisResult.possibleCauses.length > 0) {
    lines.push('Differential Possibilities (Not Confirmed Diagnosis):');
    analysisResult.possibleCauses.forEach((cause, idx) => {
      const label = cause.conditionTe ? `${cause.condition} (${cause.conditionTe})` : cause.condition;
      const prob = cause.probability ? ` [${cause.probability.toUpperCase()}]` : '';
      lines.push(`  ${idx + 1}. ${label}${prob}`);
      lines.push(`     Description: ${cause.description}`);
    });
  }

  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('4. RECOMMENDED CLINICAL PATHWAY / సిఫార్సు చేసిన తదుపరి చర్య');
  lines.push('--------------------------------------------------------------------------------');
  if (analysisResult.recommendedAction) {
    lines.push(`Primary Action      : ${analysisResult.recommendedAction.label}`);
    lines.push(`Clinical Rationale  : ${analysisResult.recommendedAction.explanation}`);
  }

  if (analysisResult.generalGuidance && analysisResult.generalGuidance.length > 0) {
    lines.push('');
    lines.push('Immediate Self-Care & Hydration Precautions:');
    analysisResult.generalGuidance.forEach((g, idx) => {
      lines.push(`  • ${g}`);
    });
  }

  if (doctorNotes && doctorNotes.trim()) {
    lines.push('');
    lines.push('--------------------------------------------------------------------------------');
    lines.push('5. PATIENT OBSERVATIONS & HEALTH NOTES');
    lines.push('--------------------------------------------------------------------------------');
    lines.push(doctorNotes.trim());
  }

  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('6. EMERGENCY & HEALTHCARE HELPLINES');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('• National Medical Emergency / Ambulance : 108');
  lines.push('• National Tele-Health / Tele-MANAS       : 14416 / 104');
  lines.push('• Local Primary Health Center (PHC)       : Contact via Rural Health Directory');

  lines.push('');
  lines.push('================================================================================');
  lines.push('IMPORTANT MEDICAL DISCLAIMER:');
  lines.push(analysisResult.disclaimer ||
    'This report is generated by ArogyaSathi AI triage tool for medical handover and consultation preparation. It does NOT replace clinical diagnosis, physical examination, or laboratory investigations by a certified physician.'
  );
  lines.push('================================================================================');

  return lines.join('\n');
}

/**
 * Downloads the text report as a UTF-8 .txt file
 */
export function downloadTextReport(options: ExportReportOptions, customFilename?: string) {
  const textContent = generateTextReport(options);
  const patientNameClean = (options.patientProfile?.name || 'Patient')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 20);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `ArogyaSathi-Symptom-Report-${patientNameClean}-${dateStr}.txt`;

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies formatted text report or short summary to clipboard
 */
export async function copyReportToClipboard(options: ExportReportOptions): Promise<boolean> {
  const text = generateTextReport(options);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Generates a concise WhatsApp friendly summary message
 */
export function generateWhatsAppMessage(options: ExportReportOptions): string {
  const { analysisResult, userStatement, patientProfile, doctorNotes } = options;
  const urgency = (analysisResult.urgencyLevel || 'MEDIUM').toUpperCase();
  const alertIcon = analysisResult.isEmergency ? '🚨 *CRITICAL EMERGENCY*' : urgency === 'HIGH' ? '⚠️ *HIGH PRIORITY*' : 'ℹ️ *HEALTH UPDATE*';

  const parts = [
    `🏥 *ArogyaSathi Health Summary*`,
    `${alertIcon}`,
    `👤 *Patient:* ${patientProfile?.name || 'Self'} (${patientProfile?.age || '-'}y, ${patientProfile?.gender || '-'})`,
    `📍 *Location:* ${[patientProfile?.village, patientProfile?.mandal].filter(Boolean).join(', ') || 'Rural'}`,
    `📅 *Date:* ${formatDateTime(analysisResult.timestamp)}`,
    ``,
    `🩺 *Reported Complaints:*`,
    userStatement ? `"${userStatement.trim()}"` : 'Symptom check via ArogyaSathi',
    ``,
    `📊 *Triage Level:* ${urgency}`,
    `🔍 *Symptoms Identified:* ${analysisResult.symptomsDetected.join(', ')}`,
    ``,
    `🏥 *Recommended Action:*`,
    `*${analysisResult.recommendedAction.label}* - ${analysisResult.recommendedAction.explanation}`,
  ];

  if (doctorNotes && doctorNotes.trim()) {
    parts.push(``);
    parts.push(`📝 *Patient Health Note:* ${doctorNotes.trim()}`);
  }

  parts.push(``);
  parts.push(`_ArogyaSathi Clinical AI Triage. Call 108 for emergency._`);

  return parts.join('\n');
}

/**
 * Direct PDF generator fallback using jsPDF vector text API
 * Ensures PDF generation always succeeds even if DOM/canvas rendering fails
 */
export function generateDirectTextPdf(
  options: ExportReportOptions,
  customFilename?: string
): boolean {
  try {
    const patientNameClean = (options.patientProfile?.name || 'Patient')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 20);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = customFilename || `ArogyaSathi-Symptom-Report-${patientNameClean}-${dateStr}.pdf`;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // Header
    doc.setFontSize(16);
    doc.setTextColor(5, 150, 105); // emerald
    doc.text('Rural Health Monitoring AI - Clinical Summary Report', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString()} | ID: ${options.reportId || 'RPT-' + Date.now()}`, margin, y);
    y += 10;

    // Horizontal line
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Patient Info
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Patient Demographics:', margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const p = options.patientProfile;
    doc.text(`Name: ${p?.name || 'Patient'} | Age: ${p?.age || 'N/A'} | Gender: ${p?.gender || 'N/A'}`, margin, y);
    y += 6;
    if (p?.village || p?.mandal || p?.district) {
      doc.text(`Location: ${[p?.village, p?.mandal, p?.district].filter(Boolean).join(', ')}`, margin, y);
      y += 6;
    }
    y += 4;

    // Symptoms
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Reported Symptoms & Body Pain:', margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    if (options.userStatement) {
      const splitStatement = doc.splitTextToSize(`Statement: "${options.userStatement}"`, pageWidth - 2 * margin);
      doc.text(splitStatement, margin, y);
      y += splitStatement.length * 5 + 3;
    }

    if (options.selectedQuickSymptoms?.length) {
      doc.text(`Quick Symptoms: ${options.selectedQuickSymptoms.join(', ')}`, margin, y);
      y += 6;
    }

    if (options.bodyPains?.length) {
      const painText = options.bodyPains.map(b => `${b.partName} (${b.severity} severity, ${b.duration})`).join('; ');
      const splitPain = doc.splitTextToSize(`Pain Locations: ${painText}`, pageWidth - 2 * margin);
      doc.text(splitPain, margin, y);
      y += splitPain.length * 5 + 3;
    }
    y += 4;

    // Clinical Analysis
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('AI Triage Assessment:', margin, y);
    y += 6;

    const res = options.analysisResult;
    doc.setFontSize(10);
    doc.setTextColor(res.isEmergency ? 220 : 15, res.isEmergency ? 38 : 23, res.isEmergency ? 38 : 42);
    doc.text(`Urgency Level: ${res.urgencyLevel?.toUpperCase() || 'NORMAL'} ${res.isEmergency ? ' - [EMERGENCY ACTION REQUIRED]' : ''}`, margin, y);
    y += 6;

    if (res.possibleCauses?.length) {
      doc.setTextColor(51, 65, 85);
      doc.text('Possible Causes / Conditions:', margin, y);
      y += 5;
      res.possibleCauses.forEach(c => {
        const splitCause = doc.splitTextToSize(`• ${c.condition}: ${c.description || ''}`, pageWidth - 2 * margin);
        doc.text(splitCause, margin + 4, y);
        y += splitCause.length * 5;
      });
      y += 3;
    }

    if (res.recommendedAction) {
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`Recommended Action: ${res.recommendedAction.label}`, margin, y);
      y += 5;
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const splitAction = doc.splitTextToSize(res.recommendedAction.explanation || '', pageWidth - 2 * margin);
      doc.text(splitAction, margin, y);
      y += splitAction.length * 5 + 4;
    }

    // Patient Health Notes
    if (options.doctorNotes) {
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Patient Health Notes & Observations:', margin, y);
      y += 5;
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const splitNotes = doc.splitTextToSize(options.doctorNotes, pageWidth - 2 * margin);
      doc.text(splitNotes, margin, y);
      y += splitNotes.length * 5 + 4;
    }

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const disclaimer = 'Disclaimer: This report is generated by Rural Health Monitoring AI for informational and triage guidance only. It does not replace clinical diagnosis by a licensed medical practitioner. In emergency call 108 immediately.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
    doc.text(splitDisclaimer, margin, 280);

    doc.save(filename);
    return true;
  } catch (err) {
    console.error('Direct PDF generation error:', err);
    return false;
  }
}

/**
 * Exports the HTML report DOM element as a high-quality PDF using html2canvas-pro (with OKLCH color support) and jsPDF
 */
export async function exportReportToPdf(
  reportElement: HTMLElement,
  options: ExportReportOptions,
  customFilename?: string
): Promise<boolean> {
  const patientNameClean = (options.patientProfile?.name || 'Patient')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 20);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `ArogyaSathi-Symptom-Report-${patientNameClean}-${dateStr}.pdf`;

  try {
    // Render DOM node to high-res canvas (scale 2 for crisp 300dpi printing)
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: reportElement.scrollWidth || 800,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Standard A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Add additional pages if the report extends beyond 1 A4 page
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.warn('Visual canvas PDF render failed, falling back to direct vector PDF generator:', error);
    const directPdfSuccess = generateDirectTextPdf(options, filename);
    if (directPdfSuccess) {
      return true;
    }

    // Final fallback: download text report so user isn't stranded
    console.error('All PDF generation methods failed, falling back to text report:', error);
    downloadTextReport(options);
    return false;
  }
}
