import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  X,
  Camera,
  Upload,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Activity,
  Baby,
  Calendar,
  Pill,
  Droplet,
  MapPin,
  Phone,
  Volume2,
  VolumeX,
  FileText,
  Plus,
  Send,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Printer,
  ChevronRight,
  User,
} from 'lucide-react';
import {
  Language,
  FamilyMember,
  PatientHistoryRecord,
  FamilyMemberQRPayload,
  PatientVisitNote,
  HealthVital,
} from '../types';
import { translations } from '../translations';
import { storageService } from '../services/storageService';
import { speechService } from '../services/speechService';

interface ASHAQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  familyMembers: FamilyMember[];
  onOpenVitalsLogger?: (memberId?: string) => void;
}

export const ASHAQRScannerModal: React.FC<ASHAQRScannerModalProps> = ({
  isOpen,
  onClose,
  language,
  familyMembers,
  onOpenVitalsLogger,
}) => {
  const t = translations[language];

  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'test'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanned history state
  const [patientHistory, setPatientHistory] = useState<PatientHistoryRecord | null>(null);
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Inline Visit Note Form
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [visitType, setVisitType] = useState<
    'routine_checkup' | 'anc_maternal' | 'immunization' | 'vital_monitoring' | 'emergency_referral'
  >('routine_checkup');
  const [noteBp, setNoteBp] = useState('');
  const [noteSugar, setNoteSugar] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteReferral, setNoteReferral] = useState(false);
  const [referralReason, setReferralReason] = useState('High BP & ANC Review');
  const [noteSaveSuccess, setNoteSaveSuccess] = useState(false);

  // Camera video and canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream helper
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Start camera scanning
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setIsScanning(true);

    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // iOS compatibility
        await videoRef.current.play();
        scanVideoFrame();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        language === 'te'
          ? 'కెమెరా ప్రారంభించడంలో లోపం. దయచేసి క్రింద ఉన్న వేగవంతమైన టెస్ట్ లేదా ఫైల్ అప్‌లోడ్ ఉపయోగించండి.'
          : 'Could not access camera. Please use File Upload or Quick Test Patient below.'
      );
      setIsScanning(false);
    }
  };

  // Frame scanner loop using jsQR
  const scanVideoFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      handleDecodedData(code.data);
      stopCamera();
      return;
    }

    animationFrameId.current = requestAnimationFrame(scanVideoFrame);
  };

  // Process decoded QR data
  const handleDecodedData = (rawData: string) => {
    try {
      // Check if JSON
      let memberId = '';
      let memberName = '';

      if (rawData.trim().startsWith('{')) {
        const parsed: FamilyMemberQRPayload = JSON.parse(rawData);
        memberId = parsed.memberId || '';
        memberName = parsed.name || '';
      } else {
        // Raw string or ABHA ID
        memberId = rawData.trim();
      }

      // Retrieve full history
      const history = storageService.getPatientHistory(memberId, memberName);
      setPatientHistory(history);
      setScanSuccessMessage(
        `${history.member.name} (${history.member.relation}) - History Retrieved`
      );

      // Pre-fill note vitals if available
      if (history.vitals.length > 0) {
        const last = history.vitals[0];
        if (last.systolicBP && last.diastolicBP) {
          setNoteBp(`${last.systolicBP}/${last.diastolicBP}`);
        }
        if (last.bloodSugar) {
          setNoteSugar(`${last.bloodSugar} mg/dL`);
        }
      }
    } catch (e) {
      console.error('Failed to parse QR payload:', e);
      // Fallback to first member
      const fallback = storageService.getPatientHistory(familyMembers[0]?.id || 'fam-1');
      setPatientHistory(fallback);
    }
  };

  // Image Upload Decode
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleDecodedData(code.data);
        } else {
          alert(
            language === 'te'
              ? 'చిత్రంలో QR కోడ్ గుర్తించబడలేదు. దయచేసి స్పష్టమైన చిత్రాన్ని ఎంచుకోండి.'
              : 'No valid QR code found in this image. Please try another clear photo.'
          );
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Quick Test Simulation
  const handleQuickTestScan = (memberId: string) => {
    stopCamera();
    const history = storageService.getPatientHistory(memberId);
    setPatientHistory(history);
    setScanSuccessMessage(
      `${history.member.name} (${history.member.relation}) - Retrieved Instantly`
    );

    if (history.vitals.length > 0) {
      const last = history.vitals[0];
      if (last.systolicBP && last.diastolicBP) {
        setNoteBp(`${last.systolicBP}/${last.diastolicBP}`);
      }
    }
  };

  // Save new ASHA field checkup note
  const handleSaveVisitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientHistory) return;

    const newNote = storageService.addPatientVisitNote({
      memberId: patientHistory.member.id,
      memberName: patientHistory.member.name,
      ashaName: 'Sunitha Kumari (ASHA Worker)',
      visitType,
      bpReading: noteBp.trim() || undefined,
      bloodSugar: noteSugar.trim() || undefined,
      notes: noteText.trim() || 'Routine health checkup and counseling provided.',
      referredToDoctor: noteReferral,
      referralReason: noteReferral ? referralReason : undefined,
    });

    // Refresh history
    setPatientHistory({
      ...patientHistory,
      visitNotes: [newNote, ...patientHistory.visitNotes],
    });

    setNoteSaveSuccess(true);
    setIsAddingNote(false);
    setNoteText('');
    setTimeout(() => setNoteSaveSuccess(false), 3000);
  };

  // Toggle voice readout of patient dossier
  const handleToggleVoice = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }

    if (!patientHistory) return;
    const { member, vitals, reminders } = patientHistory;

    let text = '';
    if (language === 'te') {
      text = `రోగి రికార్డు: ${member.name}, వయస్సు ${member.age} సంవత్సరాలు, బ్లడ్ గ్రూప్ ${member.bloodGroup || 'O పాజిటివ్'}. గ్రామం ${member.village || 'రాంపురం'}.`;
      if (member.isPregnant) {
        text += ` గర్భధారణ నెల ${member.pregnancyMonth}, ప్రసవ తేదీ ${member.expectedDeliveryDate || 'అక్టోబర్ 2026'}.`;
      }
      if (vitals.length > 0) {
        const v = vitals[0];
        text += ` తాజా రీడింగ్స్: రక్తపోటు ${v.systolicBP} పై ${v.diastolicBP}. షుగర్ ${v.bloodSugar || 130}.`;
      }
      if (reminders.length > 0) {
        text += ` ప్రస్తుత మందులు: ${reminders.map((r) => r.medicineName).join(', ')}.`;
      }
    } else if (language === 'hi') {
      text = `मरीज़ का इतिहास: ${member.name}, उम्र ${member.age} वर्ष, ब्लड ग्रुप ${member.bloodGroup || 'O+'}।`;
      if (member.isPregnant) {
        text += ` गर्भावस्था महीना ${member.pregnancyMonth}।`;
      }
      if (vitals.length > 0) {
        const v = vitals[0];
        text += ` हालिया बीपी ${v.systolicBP} बाई ${v.diastolicBP}।`;
      }
    } else {
      text = `Patient History for ${member.name}, age ${member.age}, blood group ${member.bloodGroup || 'O+'}, village ${member.village || 'Rampur'}.`;
      if (member.isPregnant) {
        text += ` Maternal ANC month ${member.pregnancyMonth}, EDD ${member.expectedDeliveryDate || 'October 2026'}.`;
      }
      if (vitals.length > 0) {
        const v = vitals[0];
        text += ` Recent BP: ${v.systolicBP} over ${v.diastolicBP}. Sugar: ${v.bloodSugar || 130} mg/dL.`;
      }
    }

    setIsSpeaking(true);
    speechService.speak(
      text,
      language,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  // Start camera on modal open if camera mode
  useEffect(() => {
    if (isOpen && scanMode === 'camera' && !patientHistory) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, scanMode, patientHistory]);

  if (!isOpen) return null;

  return (
    <div
      id="asha-qr-scanner-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden border border-teal-200 my-auto">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-teal-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/50 flex items-center justify-center border border-teal-400/40">
              <QrCode className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <span>{t.scanPatientQr}</span>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30">
                  ASHA Portal
                </span>
              </h2>
              <p className="text-xs text-teal-200/90 mt-0.5">
                {language === 'te'
                  ? 'క్యూఆర్ కోడ్ స్కాన్ చేసి రోగి పూర్తి హిస్టరీ మరియు విజిట్ వివరాలు చూడండి'
                  : 'Scan patient QR card to instantly retrieve complete medical history'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-scanner-modal"
            onClick={() => {
              stopCamera();
              speechService.stop();
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner when history retrieved */}
        {scanSuccessMessage && patientHistory && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs text-emerald-900 font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{scanSuccessMessage}</span>
            </div>
            <button
              onClick={() => {
                setPatientHistory(null);
                setScanSuccessMessage(null);
                startCamera();
              }}
              className="text-[11px] text-emerald-800 underline flex items-center gap-1 hover:text-emerald-950"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'te' ? 'మరొకరిని స్కాన్ చేయండి' : 'Scan Another'}</span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {!patientHistory ? (
            /* SCANNER VIEW */
            <div className="space-y-4">
              {/* Scan Mode Switcher */}
              <div className="flex items-center justify-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setScanMode('camera');
                    startCamera();
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    scanMode === 'camera'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Live Camera Scan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setScanMode('upload');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    scanMode === 'upload'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image</span>
                </button>
              </div>

              {/* Camera Scanner Container */}
              {scanMode === 'camera' && (
                <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-4/3 max-h-72 sm:max-h-80 flex items-center justify-center border-2 border-teal-600 shadow-inner">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Target Finder Overlay with Laser Bar */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-400/80 rounded-2xl shadow-2xl flex flex-col justify-between p-2">
                      {/* Corner Accents */}
                      <div className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1" />
                      <div className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 self-end" />
                      <div className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1" />
                      <div className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 self-end" />

                      {/* Animated Laser Scanning Line */}
                      <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Floating Status Badge */}
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <span className="bg-slate-900/90 text-teal-300 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-teal-500/40 backdrop-blur-md">
                      Point camera at Patient's Health QR Card
                    </span>
                  </div>

                  {cameraError && (
                    <div className="absolute inset-0 bg-slate-900/95 p-4 flex flex-col items-center justify-center text-center text-white space-y-3">
                      <AlertTriangle className="w-8 h-8 text-amber-400" />
                      <p className="text-xs text-slate-300 max-w-sm">{cameraError}</p>
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                      >
                        Retry Camera
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Upload QR File Container */}
              {scanMode === 'upload' && (
                <div className="border-2 border-dashed border-teal-300 rounded-3xl p-6 sm:p-8 text-center bg-teal-50/40 hover:bg-teal-50/80 transition-all flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      Upload QR Card Photo / Snapshot
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select or drag & drop photo of patient's digital health card
                    </p>
                  </div>

                  <label className="cursor-pointer px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md transition-all">
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Instant 1-Click Test Scanners (Crucial for Preview & Field Testing) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    ⚡ Quick Test: Scan Registered Village Patients
                  </span>
                  <span className="text-[11px] text-slate-500">1-Click Instant Scan</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {familyMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleQuickTestScan(member.id)}
                      className="p-2.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-left transition-all active:scale-95 shadow-2xs group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500">
                          {member.relation}
                        </span>
                        {member.isPregnant && (
                          <span className="text-[9px] font-black bg-pink-100 text-pink-700 px-1.5 py-0.2 rounded">
                            ANC
                          </span>
                        )}
                        {member.hasChildVaccinationPending && (
                          <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">
                            Vaccine
                          </span>
                        )}
                      </div>
                      <div className="font-extrabold text-xs text-slate-900 group-hover:text-teal-900 truncate">
                        {member.name}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {member.age} Yrs • Blood: {member.bloodGroup || 'O+'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* SCANNED PATIENT HISTORY DOSSIER VIEW */
            <div className="space-y-4">
              {/* Patient Profile Card */}
              <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-white rounded-3xl p-5 border-2 border-teal-600 shadow-sm relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-200/80 text-teal-950">
                          Scanned Patient
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-600">
                          ABHA: {patientHistory.member.abhaId || '91-4523-8891-0422'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mt-0.5">
                        {patientHistory.member.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-600">
                        {patientHistory.member.relation} • {patientHistory.member.age} Years •{' '}
                        {patientHistory.member.gender === 'female' ? 'Female' : 'Male'} •{' '}
                        <span className="text-teal-900 font-extrabold">
                          Blood: {patientHistory.member.bloodGroup || 'O+'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      id="btn-voice-read-dossier"
                      onClick={handleToggleVoice}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        isSpeaking
                          ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-700" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                          <span>{language === 'te' ? 'చదివి వినిపించు' : 'Read History'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>
                  </div>
                </div>

                {/* Priority Clinical Alerts Strip */}
                <div className="mt-3.5 pt-3 border-t border-teal-200/80 flex flex-wrap gap-2">
                  {patientHistory.member.isPregnant && (
                    <div className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-900 font-extrabold text-xs px-3 py-1 rounded-xl border border-pink-300">
                      <Baby className="w-4 h-4 text-pink-600" />
                      <span>
                        Active ANC: Trimester Month {patientHistory.member.pregnancyMonth} (EDD:{' '}
                        {patientHistory.member.expectedDeliveryDate || 'Oct 2026'})
                      </span>
                    </div>
                  )}

                  {patientHistory.member.hasChildVaccinationPending && (
                    <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-900 font-extrabold text-xs px-3 py-1 rounded-xl border border-blue-300">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>
                        Vaccine Due: {patientHistory.member.nextVaccineName} (
                        {patientHistory.member.nextVaccineDate})
                      </span>
                    </div>
                  )}

                  {patientHistory.member.chronicConditions?.map((cond, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-xl border border-amber-300"
                    >
                      <Activity className="w-3.5 h-3.5 text-amber-700" />
                      <span>{cond}</span>
                    </span>
                  ))}

                  {patientHistory.member.allergies && (
                    <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 font-extrabold text-xs px-2.5 py-1 rounded-xl border border-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Allergies: {patientHistory.member.allergies.join(', ')}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Vitals History & Active Trends */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    <span>Recent Recorded Vitals & Diagnostics</span>
                  </h4>
                  {onOpenVitalsLogger && (
                    <button
                      onClick={() => onOpenVitalsLogger(patientHistory.member.id)}
                      className="text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-xl border border-teal-200 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log New Vitals</span>
                    </button>
                  )}
                </div>

                {patientHistory.vitals.length === 0 ? (
                  <div className="text-center py-4 bg-slate-50 rounded-2xl text-xs text-slate-500">
                    No vitals logged yet for this patient. Click "Log New Vitals" above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <th className="p-2.5">Date & Time</th>
                          <th className="p-2.5">Blood Pressure</th>
                          <th className="p-2.5">Blood Sugar</th>
                          <th className="p-2.5">Pulse / SpO2</th>
                          <th className="p-2.5">Weight</th>
                          <th className="p-2.5">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {patientHistory.vitals.slice(0, 4).map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50">
                            <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                              {new Date(v.timestamp).toLocaleDateString('en-GB')}
                            </td>
                            <td className="p-2.5">
                              {v.systolicBP && v.diastolicBP ? (
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                                    v.systolicBP >= 140 || v.diastolicBP >= 90
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {v.systolicBP}/{v.diastolicBP} mmHg
                                </span>
                              ) : (
                                '--'
                              )}
                            </td>
                            <td className="p-2.5">
                              {v.bloodSugar ? (
                                <span className="font-bold text-slate-900">
                                  {v.bloodSugar} mg/dL ({v.sugarType || 'fasting'})
                                </span>
                              ) : (
                                '--'
                              )}
                            </td>
                            <td className="p-2.5">
                              {v.pulseRate ? `${v.pulseRate} bpm` : '--'} /{' '}
                              {v.spo2 ? `${v.spo2}%` : '--'}
                            </td>
                            <td className="p-2.5">{v.weight ? `${v.weight} kg` : '--'}</td>
                            <td className="p-2.5 text-[11px] text-slate-600 max-w-xs truncate">
                              {v.notes || 'Routine check'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Active Prescriptions & Medications */}
              {patientHistory.reminders.length > 0 && (
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <span>Current Prescribed Medications ({patientHistory.reminders.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {patientHistory.reminders.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between"
                      >
                        <div>
                          <h5 className="font-extrabold text-xs text-slate-900">{r.medicineName}</h5>
                          <span className="text-[11px] text-slate-500">
                            {r.dosage} • {r.timing.join(', ')} ({r.beforeOrAfterFood} food)
                          </span>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ASHA Field Visit Notes & Logs */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-700" />
                    <span>
                      ASHA Field Checkup Records ({patientHistory.visitNotes.length})
                    </span>
                  </h4>

                  <button
                    onClick={() => setIsAddingNote(!isAddingNote)}
                    className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingNote ? 'Cancel' : 'Add Checkup Note'}</span>
                  </button>
                </div>

                {noteSaveSuccess && (
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Field visit checkup note saved to patient record!</span>
                  </div>
                )}

                {/* Inline Add Visit Form */}
                {isAddingNote && (
                  <form
                    onSubmit={handleSaveVisitNote}
                    className="p-4 bg-teal-50/70 border-2 border-teal-500 rounded-2xl space-y-3 animate-in fade-in"
                  >
                    <h5 className="font-black text-teal-950 text-xs uppercase tracking-wide">
                      Record New ASHA Field Visit
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Visit Type
                        </label>
                        <select
                          value={visitType}
                          onChange={(e: any) => setVisitType(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                        >
                          <option value="routine_checkup">Routine Household Visit</option>
                          <option value="anc_maternal">ANC Maternal Health Check</option>
                          <option value="immunization">Child Immunization Visit</option>
                          <option value="vital_monitoring">BP / Sugar Monitoring</option>
                          <option value="emergency_referral">Emergency Referral</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            BP (mmHg)
                          </label>
                          <input
                            type="text"
                            value={noteBp}
                            onChange={(e) => setNoteBp(e.target.value)}
                            placeholder="e.g. 120/80"
                            className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Blood Sugar
                          </label>
                          <input
                            type="text"
                            value={noteSugar}
                            onChange={(e) => setNoteSugar(e.target.value)}
                            placeholder="e.g. 110 mg/dL"
                            className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Clinical & Counseling Notes
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Provided IFA tablets, advised high-iron diet and salt restriction..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                      />
                    </div>

                    {/* Refer to Doctor Toggle */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noteReferral}
                          onChange={(e) => setNoteReferral(e.target.checked)}
                          className="w-4 h-4 text-teal-600 rounded"
                        />
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Stethoscope className="w-4 h-4 text-teal-700" />
                          Refer Patient to PHC Medical Officer (Dr. Prasad Rao)
                        </span>
                      </label>

                      {noteReferral && (
                        <input
                          type="text"
                          value={referralReason}
                          onChange={(e) => setReferralReason(e.target.value)}
                          placeholder="Reason for referral..."
                          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 font-medium"
                        />
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingNote(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Previous Notes List */}
                <div className="space-y-2.5">
                  {patientHistory.visitNotes.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 rounded-2xl text-xs text-slate-500">
                      No previous visit notes on file. Use the button above to add one.
                    </div>
                  ) : (
                    patientHistory.visitNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 hover:border-teal-300 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 capitalize">
                              {note.visitType.replace('_', ' ')}
                            </span>
                            <span className="text-slate-500 font-medium">• {note.ashaName}</span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-500">
                            {new Date(note.timestamp).toLocaleDateString('en-GB')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {note.notes}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {note.bpReading && (
                            <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                              BP: {note.bpReading}
                            </span>
                          )}
                          {note.bloodSugar && (
                            <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                              Sugar: {note.bloodSugar}
                            </span>
                          )}
                          {note.referredToDoctor && (
                            <span className="text-[10px] font-black bg-rose-100 border border-rose-300 text-rose-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Stethoscope className="w-3 h-3 text-rose-700" />
                              Referred: {note.referralReason || 'Specialist Evaluation'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    setPatientHistory(null);
                    startCamera();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-teal-300 text-teal-900 bg-teal-50 hover:bg-teal-100 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Scan Next Patient</span>
                </button>

                <button
                  onClick={() => {
                    stopCamera();
                    speechService.stop();
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
