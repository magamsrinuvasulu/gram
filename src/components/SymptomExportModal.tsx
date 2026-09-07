import React, { useState, useRef, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileDown,
  FileText,
  HeartPulse,
  Info,
  Loader2,
  MapPin,
  PhoneCall,
  Printer,
  Share2,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  Language,
  SymptomAnalysisResult,
  BodyPartPain,
  UserProfile,
  FamilyMember,
} from '../types';
import {
  storageService,
  defaultFacilities,
} from '../services/storageService';
import {
  ExportReportOptions,
  generateReportId,
  formatDateTime,
  generateTextReport,
  downloadTextReport,
  copyReportToClipboard,
  exportReportToPdf,
  generateWhatsAppMessage,
} from '../utils/symptomExportUtil';

interface SymptomExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: SymptomAnalysisResult;
  userStatement: string;
  selectedQuickSymptoms: string[];
  bodyPains: BodyPartPain[];
  language: Language;
}

export const SymptomExportModal: React.FC<SymptomExportModalProps> = ({
  isOpen,
  onClose,
  analysisResult,
  userStatement,
  selectedQuickSymptoms,
  bodyPains,
  language,
}) => {
  const [reportId] = useState<string>(() => generateReportId());
  const reportRef = useRef<HTMLDivElement>(null);

  // User Profile & Family Profiles from storage
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => storageService.getFamilyMembers());

  // Selected patient mode: 'self' | familyMemberId | 'custom'
  const [selectedPatientTarget, setSelectedPatientTarget] = useState<string>('self');
  const [customPatientName, setCustomPatientName] = useState('');
  const [customAge, setCustomAge] = useState<number | string>(35);
  const [customGender, setCustomGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  // Doctor / ASHA Handover Notes
  const [doctorNotes, setDoctorNotes] = useState('');

  // Export State Feedback
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isDownloadingText, setIsDownloadingText] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [whatsappCopied, setWhatsappCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'text'>('preview');

  // Keep profiles updated
  useEffect(() => {
    if (isOpen) {
      setUserProfile(storageService.getUserProfile());
      setFamilyMembers(storageService.getFamilyMembers());
      setCopiedSuccess(false);
      setWhatsappCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Resolve current patient details
  const getResolvedPatient = () => {
    if (selectedPatientTarget === 'self') {
      return {
        name: userProfile.name || 'Ramesh Kumar (Self)',
        relation: 'Self',
        age: userProfile.age || 42,
        gender: userProfile.gender === 'female' ? 'Female' : 'Male',
        village: userProfile.village || 'Rampur',
        mandal: userProfile.mandal || 'Gannavaram',
        district: userProfile.district || 'Krishna',
        bloodGroup: userProfile.bloodGroup || 'O+',
        emergencyContact: `${userProfile.emergencyContactName} (${userProfile.emergencyContactPhone})`,
      };
    }

    if (selectedPatientTarget === 'custom') {
      return {
        name: customPatientName.trim() || 'Patient',
        relation: 'Relative / Community Member',
        age: customAge || '-',
        gender: customGender,
        village: userProfile.village || 'Rampur',
        mandal: userProfile.mandal || 'Gannavaram',
        district: userProfile.district || 'Krishna',
        bloodGroup: 'Not specified',
        emergencyContact: `${userProfile.name} (${userProfile.phone})`,
      };
    }

    const member = familyMembers.find((m) => m.id === selectedPatientTarget);
    if (member) {
      return {
        name: member.name,
        relation: member.relation,
        age: member.age,
        gender: member.gender === 'female' ? 'Female' : 'Male',
        village: userProfile.village || 'Rampur',
        mandal: userProfile.mandal || 'Gannavaram',
        district: userProfile.district || 'Krishna',
        bloodGroup: userProfile.bloodGroup,
        emergencyContact: `${userProfile.name} (${userProfile.phone})`,
      };
    }

    return {
      name: userProfile.name,
      relation: 'Self',
      age: userProfile.age,
      gender: userProfile.gender,
      village: userProfile.village,
      mandal: userProfile.mandal,
      district: userProfile.district,
      bloodGroup: userProfile.bloodGroup,
      emergencyContact: `${userProfile.emergencyContactName} (${userProfile.emergencyContactPhone})`,
    };
  };

  const patient = getResolvedPatient();

  const exportOptions: ExportReportOptions = {
    analysisResult,
    userStatement,
    selectedQuickSymptoms,
    bodyPains,
    language,
    patientProfile: patient,
    doctorNotes,
    reportId,
  };

  // 1. Download PDF
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    try {
      await exportReportToPdf(reportRef.current, exportOptions);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 2. Download Text file (.txt)
  const handleDownloadText = () => {
    setIsDownloadingText(true);
    try {
      downloadTextReport(exportOptions);
    } finally {
      setTimeout(() => setIsDownloadingText(false), 800);
    }
  };

  // 3. Copy full clinical summary
  const handleCopySummary = async () => {
    const success = await copyReportToClipboard(exportOptions);
    if (success) {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    }
  };

  // 4. Share on WhatsApp / SMS
  const handleShareWhatsApp = async () => {
    const message = generateWhatsAppMessage(exportOptions);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(message);
      setWhatsappCopied(true);
      setTimeout(() => setWhatsappCopied(false), 3000);
    }
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // 5. Print
  const handlePrint = () => {
    window.print();
  };

  const textReportPreview = generateTextReport(exportOptions);
  const urgencyUpper = (analysisResult.urgencyLevel || 'medium').toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-sky-800 via-sky-700 to-blue-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <FileDown className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  {language === 'te'
                    ? 'వైద్య నివేదిక ఎగుమతి & భాగస్వామ్యం'
                    : language === 'hi'
                    ? 'चिकित्सा रिपोर्ट निर्यात एवं साझाकरण'
                    : 'Export Symptom Analysis & Clinical Triage Report'}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-sky-500/40 text-sky-100 border border-sky-400/30">
                  PDF & Text
                </span>
              </div>
              <p className="text-xs text-sky-100 font-medium">
                {language === 'te'
                  ? 'రోగి ఆరోగ్య పరిశీలన మరియు నివేదిక భద్రపరచుకోవడానికి'
                  : language === 'hi'
                  ? 'रोगी स्वास्थ्य सारांश और डिजिटल रिपोर्ट रिकॉर्ड'
                  : 'Patient health summary and clinical triage record'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-sky-100 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Controls & Patient Selection Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Patient Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <Users className="w-4 h-4 text-sky-700" />
                <span>{language === 'te' ? 'రోగి:' : language === 'hi' ? 'रोगी:' : 'Patient:'}</span>
              </span>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedPatientTarget('self')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedPatientTarget === 'self'
                      ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {userProfile.name} (Self)
                </button>

                {familyMembers.map((fm) => (
                  <button
                    key={fm.id}
                    type="button"
                    onClick={() => setSelectedPatientTarget(fm.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedPatientTarget === fm.id
                        ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {fm.name} ({fm.relation})
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setSelectedPatientTarget('custom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedPatientTarget === 'custom'
                      ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  + Other Patient
                </button>
              </div>
            </div>

            {/* View Mode Toggle: Visual PDF Preview vs Plain Text */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Clinical Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'text'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Raw Text (.txt)</span>
              </button>
            </div>
          </div>

          {/* Custom Patient Input if selected */}
          {selectedPatientTarget === 'custom' && (
            <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100 grid grid-cols-1 sm:grid-cols-3 gap-2 animate-in fade-in">
              <input
                type="text"
                placeholder="Patient Full Name"
                value={customPatientName}
                onChange={(e) => setCustomPatientName(e.target.value)}
                className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-sky-600"
              />
              <input
                type="number"
                placeholder="Age in years"
                value={customAge}
                onChange={(e) => setCustomAge(e.target.value)}
                className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-sky-600"
              />
              <select
                value={customGender}
                onChange={(e) => setCustomGender(e.target.value as any)}
                className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-sky-600"
              >
                <option value="Male">Male (పురుషుడు)</option>
                <option value="Female">Female (మహిళ)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {/* Patient Health Notes Input */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-xs font-bold text-slate-700 shrink-0">
              {language === 'te'
                ? 'రోగి ఆరోగ్య గమనికలు (Patient Health Notes):'
                : language === 'hi'
                ? 'रोगी स्वास्थ्य टिप्पणी (Patient Notes):'
                : 'Patient Health Notes / Observations:'}
            </label>
            <input
              type="text"
              placeholder={
                language === 'te'
                  ? 'ఉదా: ఉదయం 101°F జ్వరం ఉంది, పారాసిటమాల్ వేశాము...'
                  : language === 'hi'
                  ? 'उदा: सुबह 101°F बुखार था, पेरासिटामोल ली...'
                  : 'e.g., Temp was 101°F, Took 1 Paracetamol at 10 AM, onset 2 days...'
              }
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-sky-600 font-medium"
            />
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
          {activeTab === 'preview' ? (
            /* PRINTABLE / EXPORTABLE CLINICAL A4 REPORT CONTAINER */
            <div
              ref={reportRef}
              id="arogya-printable-report"
              className="bg-white mx-auto max-w-[780px] w-full p-6 sm:p-8 rounded-2xl shadow-md border border-slate-300 text-slate-900 space-y-6 print:m-0 print:p-6 print:border-none print:shadow-none"
              style={{ minHeight: '850px', backgroundColor: '#ffffff' }}
            >
              {/* Document Letterhead */}
              <div className="border-b-2 border-sky-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-800 text-white flex items-center justify-center font-black text-2xl shadow-xs">
                    ⚕️
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-sky-950 uppercase tracking-tight">
                      AROGYASATHI RURAL HEALTH CLINIC
                    </h1>
                    <p className="text-xs font-bold text-sky-800">
                      ఆరోగ్య సాథి - లక్షణాల పరిశీలన & ట్రయేజ్ నివేదిక
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      National Rural Tele-Triage & Community Health Support Network
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs space-y-0.5">
                  <div className="font-extrabold text-slate-900">
                    Ref ID: <span className="font-mono text-sky-800">{reportId}</span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    Date: {formatDateTime(analysisResult.timestamp)}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block border border-emerald-200">
                    Patient Health Record
                  </div>
                </div>
              </div>

              {/* Patient Demographics Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Patient Name</span>
                  <span className="font-extrabold text-slate-900 text-sm">{patient.name}</span>
                  {patient.relation && (
                    <span className="text-[10px] text-sky-700 font-semibold block">({patient.relation})</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Age & Gender</span>
                  <span className="font-extrabold text-slate-900">{patient.age} yrs • {patient.gender}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Blood: {patient.bloodGroup || 'O+'}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Village / Location</span>
                  <span className="font-bold text-slate-900">{patient.village}, {patient.mandal}</span>
                  <span className="text-[10px] text-slate-500 block">{patient.district} Dist</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Emergency Contact</span>
                  <span className="font-bold text-slate-900">{patient.emergencyContact}</span>
                </div>
              </div>

              {/* Triage Urgency Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  analysisResult.isEmergency || analysisResult.urgencyLevel === 'emergency'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : analysisResult.urgencyLevel === 'high'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : analysisResult.urgencyLevel === 'medium'
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  {analysisResult.isEmergency ? (
                    <AlertOctagon className="w-8 h-8 text-red-600 shrink-0" />
                  ) : analysisResult.urgencyLevel === 'high' ? (
                    <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
                  ) : (
                    <HeartPulse className="w-7 h-7 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider">Clinical Triage Level:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase text-white ${
                          analysisResult.isEmergency || analysisResult.urgencyLevel === 'emergency'
                            ? 'bg-red-600'
                            : analysisResult.urgencyLevel === 'high'
                            ? 'bg-amber-600'
                            : analysisResult.urgencyLevel === 'medium'
                            ? 'bg-yellow-600'
                            : 'bg-emerald-600'
                        }`}
                      >
                        {urgencyUpper} PRIORITY
                      </span>
                    </div>
                    <p className="text-xs font-medium mt-0.5">
                      {analysisResult.isEmergency
                        ? analysisResult.emergencyAlertText || 'Emergency care required. Immediate clinical stabilization advised.'
                        : analysisResult.urgencyLevel === 'high'
                        ? 'High priority clinical consultation at Primary Health Center advised.'
                        : 'Moderate clinical observation and supportive outpatient care.'}
                    </p>
                  </div>
                </div>

                {analysisResult.isEmergency && (
                  <div className="shrink-0 text-center bg-red-600 text-white px-3 py-1.5 rounded-xl font-black text-xs">
                    CALL 108
                  </div>
                )}
              </div>

              {/* Section 1: Chief Complaints & Symptoms */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="text-base">🩺</span>
                  <h3 className="font-black text-sm uppercase text-slate-800 tracking-wide">
                    1. Primary Complaints & Symptoms Reported
                  </h3>
                </div>

                {userStatement && (
                  <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 text-xs text-slate-800">
                    <span className="font-extrabold text-sky-950 block mb-1">Patient Statement / Voice Transcript:</span>
                    <p className="italic">"{userStatement}"</p>
                  </div>
                )}

                {/* Quick Symptoms Badges */}
                {selectedQuickSymptoms.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">Selected Quick Symptoms:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedQuickSymptoms.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold"
                        >
                          • {s.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Body Pain Points Table */}
                {bodyPains.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-600 block">Interactive Body Pain Map Findings:</span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-extrabold text-[11px]">
                          <tr>
                            <th className="p-2 border-b border-slate-200">Body Location</th>
                            <th className="p-2 border-b border-slate-200">Pain Type</th>
                            <th className="p-2 border-b border-slate-200">Severity</th>
                            <th className="p-2 border-b border-slate-200">Duration</th>
                            <th className="p-2 border-b border-slate-200">Clinical Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bodyPains.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 font-bold text-slate-900">
                                {p.partName} {p.partNameTe && `(${p.partNameTe})`}
                              </td>
                              <td className="p-2 capitalize text-slate-700">{p.painType}</td>
                              <td className="p-2">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                    p.severity === 'severe'
                                      ? 'bg-red-100 text-red-800'
                                      : p.severity === 'moderate'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {p.severity}
                                </span>
                              </td>
                              <td className="p-2 text-slate-600">{p.duration.replace(/_/g, ' ')}</td>
                              <td className="p-2 text-slate-500 italic">{p.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: AI Clinical Differential Analysis */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="text-base">🔍</span>
                  <h3 className="font-black text-sm uppercase text-slate-800 tracking-wide">
                    2. AI Clinical Triage Findings & Differentials
                  </h3>
                </div>

                {analysisResult.symptomsDetected.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-600 mr-1">Engine Identified:</span>
                    {analysisResult.symptomsDetected.map((sym, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-sky-50 text-sky-900 border border-sky-200 rounded-lg text-xs font-bold"
                      >
                        ✓ {sym}
                      </span>
                    ))}
                  </div>
                )}

                {/* Possible Causes List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {analysisResult.possibleCauses.map((cause, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">
                          {cause.condition} {cause.conditionTe && `(${cause.conditionTe})`}
                        </span>
                        {cause.probability && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold bg-slate-200 text-slate-800">
                            {cause.probability}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {cause.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Recommended Clinical Action */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="text-base">🏥</span>
                  <h3 className="font-black text-sm uppercase text-slate-800 tracking-wide">
                    3. Recommended Care Pathway & Follow-Up
                  </h3>
                </div>

                <div className="p-3.5 bg-sky-50/80 rounded-xl border border-sky-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sky-950 text-sm">
                      {analysisResult.recommendedAction.label}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {analysisResult.recommendedAction.explanation}
                  </p>
                </div>

                {/* General Guidance */}
                {analysisResult.generalGuidance.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-600 block">General Precautions & Supportive Care:</span>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-1">
                      {analysisResult.generalGuidance.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Section 4: Notes for Doctor / ASHA Worker if provided */}
              {doctorNotes.trim() && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                    <span className="text-base">📝</span>
                    <h3 className="font-black text-sm uppercase text-slate-800 tracking-wide">
                      4. Patient Health Notes & Observations
                    </h3>
                  </div>
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium">
                    {doctorNotes.trim()}
                  </div>
                </div>
              )}

              {/* Healthcare Contacts Footer */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">Emergency & PHC Support:</span>
                  <p className="text-slate-600 text-[11px]">
                    National Ambulance: <strong>108</strong> • Medical Helpline: <strong>104</strong> • PHC Directory Connected
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 sm:text-right font-medium">
                  Verified by ArogyaSathi Triage Engine
                </div>
              </div>

              {/* Medical Disclaimer */}
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed">
                <strong className="text-slate-700">Official Disclaimer: </strong>
                {analysisResult.disclaimer ||
                  'This triage report is generated by ArogyaSathi AI triage tool for medical handover and consultation preparation. It does NOT replace clinical diagnosis, physical examination, or laboratory investigations by a certified physician.'}
              </div>
            </div>
          ) : (
            /* RAW TEXT REPORT PREVIEW */
            <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-slate-400 font-bold">Structured Plain Text File (.txt)</span>
                <span className="text-[11px] text-slate-400 font-bold">
                  {textReportPreview.length} characters
                </span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed select-all">
                {textReportPreview}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions: Download PDF, Download Text, Share WhatsApp, Copy */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>{whatsappCopied ? 'Copied for WhatsApp!' : 'Share WhatsApp'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Download Text Button */}
            <button
              type="button"
              onClick={handleDownloadText}
              disabled={isDownloadingText}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xs"
            >
              <FileText className="w-4 h-4 text-sky-300" />
              <span>{isDownloadingText ? 'Saving...' : 'Download .TXT'}</span>
            </button>

            {/* Download PDF Primary Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
