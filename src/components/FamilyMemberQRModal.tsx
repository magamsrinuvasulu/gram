import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Download,
  Printer,
  Volume2,
  VolumeX,
  Check,
  Copy,
  Baby,
  Calendar,
  AlertCircle,
  Phone,
  ShieldCheck,
  User,
  Heart,
  Droplet,
  MapPin,
} from 'lucide-react';
import { Language, FamilyMember, FamilyMemberQRPayload } from '../types';
import { translations } from '../translations';
import { speechService } from '../services/speechService';

interface FamilyMemberQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  familyMembers: FamilyMember[];
  selectedMemberId?: string;
  onSelectMember?: (memberId: string) => void;
}

export const FamilyMemberQRModal: React.FC<FamilyMemberQRModalProps> = ({
  isOpen,
  onClose,
  language,
  familyMembers,
  selectedMemberId,
  onSelectMember,
}) => {
  const t = translations[language];

  const [activeMemberId, setActiveMemberId] = useState<string>(
    selectedMemberId || familyMembers[0]?.id || 'fam-0'
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);

  // Sync when prop changes
  useEffect(() => {
    if (selectedMemberId) {
      setActiveMemberId(selectedMemberId);
    } else if (familyMembers.length > 0 && !activeMemberId) {
      setActiveMemberId(familyMembers[0].id);
    }
  }, [selectedMemberId, familyMembers]);

  const activeMember =
    familyMembers.find((m) => m.id === activeMemberId) || familyMembers[0];

  // Generate QR code whenever active member changes
  useEffect(() => {
    if (!activeMember) return;

    setIsGenerating(true);

    const qrPayload: FamilyMemberQRPayload = {
      type: 'GRAM_HEALTH_QR_V1',
      memberId: activeMember.id,
      name: activeMember.name,
      relation: activeMember.relation,
      age: activeMember.age,
      gender: activeMember.gender,
      bloodGroup: activeMember.bloodGroup || 'O+',
      abhaId: activeMember.abhaId || `91-4523-8891-${activeMember.id.replace(/\D/g, '').padEnd(4, '0')}`,
      village: activeMember.village || 'Rampur Village',
      district: 'Krishna District',
      chronicConditions: activeMember.chronicConditions || [],
      isPregnant: activeMember.isPregnant || false,
      pregnancyMonth: activeMember.pregnancyMonth,
      expectedDeliveryDate: activeMember.expectedDeliveryDate,
      hasChildVaccinationPending: activeMember.hasChildVaccinationPending || false,
      nextVaccineName: activeMember.nextVaccineName,
      nextVaccineDate: activeMember.nextVaccineDate,
      allergies: activeMember.allergies || ['None Reported'],
      emergencyContactPhone: activeMember.emergencyContactPhone || '9876543210',
      generatedAt: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(qrPayload);

    QRCode.toDataURL(payloadString, {
      width: 380,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#064e3b', // Deep emerald
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
        setIsGenerating(false);
      });
  }, [activeMember]);

  if (!isOpen || !activeMember) return null;

  const abhaFormatted =
    activeMember.abhaId || `91-4523-8891-${activeMember.id.replace(/\D/g, '').padEnd(4, '0')}`;

  const handleCopyAbha = () => {
    navigator.clipboard.writeText(abhaFormatted);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Health_QR_${activeMember.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleToggleVoice = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }

    let textToSpeak = '';
    if (language === 'te') {
      textToSpeak = `${activeMember.name} గారి డిజిటల్ ఆరోగ్య కార్డ్. వయస్సు ${activeMember.age} సంవత్సరాలు. బ్లడ్ గ్రూప్ ${activeMember.bloodGroup || 'O పాజిటివ్'}. ఆభా ఐడి ${abhaFormatted}.`;
      if (activeMember.isPregnant) {
        textToSpeak += ` ప్రస్తుతం గర్భవతి, ${activeMember.pregnancyMonth}వ నెల.`;
      }
      if (activeMember.hasChildVaccinationPending) {
        textToSpeak += ` వ్యాక్సినేషన్ పెండింగ్: ${activeMember.nextVaccineName}.`;
      }
      if (activeMember.chronicConditions && activeMember.chronicConditions.length > 0) {
        textToSpeak += ` దీర్ఘకాలిక సమస్యలు: ${activeMember.chronicConditions.join(', ')}.`;
      }
    } else if (language === 'hi') {
      textToSpeak = `${activeMember.name} का डिजिटल स्वास्थ्य कार्ड। उम्र ${activeMember.age} वर्ष। ब्लड ग्रुप ${activeMember.bloodGroup || 'O+'}, आभा आईडी ${abhaFormatted}।`;
      if (activeMember.isPregnant) {
        textToSpeak += ` वर्तमान में गर्भवती, महीना ${activeMember.pregnancyMonth}।`;
      }
      if (activeMember.chronicConditions && activeMember.chronicConditions.length > 0) {
        textToSpeak += ` पुरानी बीमारियाँ: ${activeMember.chronicConditions.join(', ')}।`;
      }
    } else {
      textToSpeak = `Digital Health Card for ${activeMember.name}. Age ${activeMember.age}, Blood Group ${activeMember.bloodGroup || 'O positive'}, ABHA ID ${abhaFormatted}.`;
      if (activeMember.isPregnant) {
        textToSpeak += ` Currently pregnant, month ${activeMember.pregnancyMonth}.`;
      }
      if (activeMember.chronicConditions && activeMember.chronicConditions.length > 0) {
        textToSpeak += ` Chronic conditions: ${activeMember.chronicConditions.join(', ')}.`;
      }
    }

    setIsSpeaking(true);
    speechService.speak(
      textToSpeak,
      language,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div
      id="family-member-qr-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden border border-emerald-200 my-auto">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/60 flex items-center justify-center border border-emerald-400/40">
              <QrCode className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <span>{t.healthQrCard}</span>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  ABHA Verified
                </span>
              </h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {language === 'te'
                  ? 'రోగి ఆరోగ్య వివరాల శీఘ్ర QR గుర్తింపు కార్డు'
                  : language === 'hi'
                  ? 'रोगी स्वास्थ्य विवरण का त्वरित डिजिटल पहचान पत्र'
                  : 'Quick patient health identification and vital emergency card'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-qr-modal"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Family Member Switcher Pill Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 uppercase tracking-wide">
            {language === 'te' ? 'సభ్యుడు:' : 'Member:'}
          </span>
          {familyMembers.map((member) => {
            const isSelected = member.id === activeMember.id;
            return (
              <button
                key={member.id}
                onClick={() => {
                  setActiveMemberId(member.id);
                  if (onSelectMember) onSelectMember(member.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs scale-102'
                    : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                <span>{member.name}</span>
                {member.isPregnant && (
                  <Baby className={`w-3.5 h-3.5 ${isSelected ? 'text-pink-200' : 'text-pink-600'}`} />
                )}
                {member.hasChildVaccinationPending && (
                  <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-200' : 'text-blue-600'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Printable Rural Health ID Card */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div
            ref={cardRef}
            id="printable-health-card"
            className="bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 rounded-3xl p-5 border-2 border-emerald-600 shadow-md relative overflow-hidden print:border-black print:shadow-none"
          >
            {/* Card Background Emblem Watermark */}
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-72 h-72 bg-emerald-600/5 rounded-full pointer-events-none" />

            {/* Official Header Banner */}
            <div className="flex items-center justify-between border-b-2 border-emerald-700/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-black text-sm border-2 border-amber-400 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-emerald-950 text-xs sm:text-sm tracking-tight leading-tight">
                    GOVERNMENT OF ANDHRA PRADESH
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-800">
                    National Rural Health Mission • Ayushman Bharat
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                  ABHA Health ID
                </span>
              </div>
            </div>

            {/* Middle Section: Member Details + QR Code */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Left Column: Member Details */}
              <div className="sm:col-span-7 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg shrink-0 border border-emerald-300">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg leading-snug">
                      {activeMember.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-600">
                      {activeMember.relation} • {activeMember.age} Yrs •{' '}
                      {activeMember.gender === 'female' ? 'Female' : 'Male'}
                    </p>
                  </div>
                </div>

                {/* ABHA ID Card Number */}
                <div className="bg-white border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      ABHA Number
                    </span>
                    <span className="font-mono font-extrabold text-emerald-900 text-sm tracking-wider">
                      {abhaFormatted}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyAbha}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition-colors"
                    title="Copy ABHA ID"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Health Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {/* Blood Group */}
                  <span className="inline-flex items-center gap-1 text-xs font-black bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-xl">
                    <Droplet className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                    <span>Blood: {activeMember.bloodGroup || 'O+'}</span>
                  </span>

                  {/* Village */}
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-xl">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeMember.village || 'Rampur Village'}</span>
                  </span>
                </div>

                {/* Special Maternal ANC Alert */}
                {activeMember.isPregnant && (
                  <div className="p-2.5 bg-pink-50 border border-pink-200 rounded-xl text-xs space-y-0.5">
                    <div className="font-extrabold text-pink-900 flex items-center gap-1.5">
                      <Baby className="w-4 h-4 text-pink-600" />
                      <span>ANC Maternal Care Profile</span>
                    </div>
                    <p className="text-[11px] text-pink-800 font-semibold">
                      Trimester Month {activeMember.pregnancyMonth} • Expected Delivery:{' '}
                      {activeMember.expectedDeliveryDate || 'October 2026'}
                    </p>
                  </div>
                )}

                {/* Child Immunization Due */}
                {activeMember.hasChildVaccinationPending && (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-0.5">
                    <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Child Immunization Due</span>
                    </div>
                    <p className="text-[11px] text-blue-800 font-semibold">
                      Vaccine: <strong>{activeMember.nextVaccineName}</strong> (Due:{' '}
                      {activeMember.nextVaccineDate})
                    </p>
                  </div>
                )}

                {/* Chronic Conditions & Allergies */}
                {activeMember.chronicConditions && activeMember.chronicConditions.length > 0 && (
                  <div className="text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Chronic Health Conditions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeMember.chronicConditions.map((cond, i) => (
                        <span
                          key={i}
                          className="bg-amber-100/80 text-amber-900 font-bold text-[11px] px-2 py-0.5 rounded-md border border-amber-300/80"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {activeMember.allergies && activeMember.allergies.length > 0 && (
                  <div className="text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                      Allergies
                    </span>
                    <span className="text-[11px] font-bold text-rose-700">
                      {activeMember.allergies.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: High-Resolution Scannable QR Code */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border-2 border-emerald-500 shadow-sm">
                <div className="relative w-44 h-44 bg-white flex items-center justify-center">
                  {isGenerating || !qrDataUrl ? (
                    <div className="text-center p-4">
                      <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-xs text-slate-500 font-semibold">
                        Generating QR...
                      </span>
                    </div>
                  ) : (
                    <img
                      src={qrDataUrl}
                      alt={`Health QR Code for ${activeMember.name}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="text-center mt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Scan With ASHA Portal
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Instant Vitals, History & Maternal Records
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Emergency Contact & Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  Emergency Contact: {activeMember.emergencyContactName || 'Family Head'} (
                  {activeMember.emergencyContactPhone || '9876543210'})
                </span>
              </div>
              <div className="font-semibold text-emerald-800">
                Gramin Swasthya Seva • Secure QR ID
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {/* Download QR */}
            <button
              id="btn-download-qr"
              onClick={handleDownloadQr}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadQr}</span>
            </button>

            {/* Print Card */}
            <button
              id="btn-print-card"
              onClick={handlePrintCard}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{t.printHealthCard}</span>
            </button>

            {/* Voice Readout */}
            <button
              id="btn-voice-read-card"
              onClick={handleToggleVoice}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                isSpeaking
                  ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-700" />
                  <span>{t.stopVoice}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'te' ? 'వినండి' : 'Read Aloud'}</span>
                </>
              )}
            </button>

            {/* Copy ABHA */}
            <button
              id="btn-copy-abha-bottom"
              onClick={handleCopyAbha}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copy ABHA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
