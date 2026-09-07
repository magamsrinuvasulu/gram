import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Droplet,
  Thermometer,
  Pill,
  Users,
  ShieldAlert,
  MapPin,
  Baby,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  PhoneCall,
  Calendar,
  FileText,
  UserPlus,
  TrendingUp,
  Stethoscope,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  QrCode,
  Camera,
  Trash2,
  Bot,
  MessageSquare,
} from 'lucide-react';
import {
  Language,
  UserProfile,
  PatientProfile,
  FamilyMember,
  HealthVital,
  MedicineReminder,
  DiseaseAlert,
} from '../types';
import { translations } from '../translations';
import { speechService } from '../services/speechService';

interface DashboardProps {
  language: Language;
  userProfile: UserProfile;
  familyMembers: FamilyMember[];
  vitals: HealthVital[];
  medicineReminders: MedicineReminder[];
  diseaseAlerts: DiseaseAlert[];
  onOpenVoiceAssistant: () => void;
  onOpenVitalsLogger: () => void;
  onOpenFamilyModal: () => void;
  onOpenSOS: () => void;
  onOpenLocator: () => void;
  onOpenQRModal?: (memberId?: string) => void;
  onOpenQRScanner?: () => void;
  onToggleMedicineTaken: (id: string, timeSlot: 'morning' | 'afternoon' | 'night') => void;
  onNavigateTab: (tab: string) => void;
  onDeleteFamilyMember?: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  language,
  userProfile,
  familyMembers,
  vitals,
  medicineReminders,
  diseaseAlerts,
  onOpenVoiceAssistant,
  onOpenVitalsLogger,
  onOpenFamilyModal,
  onOpenSOS,
  onOpenLocator,
  onOpenQRModal,
  onOpenQRScanner,
  onToggleMedicineTaken,
  onNavigateTab,
  onDeleteFamilyMember,
}) => {
  const t = translations[language];

  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);

  const latestVital = vitals[0];

  const getBPStatus = (sys?: number, dia?: number) => {
    if (!sys || !dia) return { label: 'Not Logged', color: 'bg-slate-100 text-slate-600' };
    if (sys > 140 || dia > 90) return { label: t.high, color: 'bg-red-100 text-red-800 border-red-200' };
    if (sys < 90 || dia < 60) return { label: t.low, color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { label: t.normal, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const getSugarStatus = (sugar?: number) => {
    if (!sugar) return { label: 'Not Logged', color: 'bg-slate-100 text-slate-600' };
    if (sugar > 140) return { label: t.high, color: 'bg-red-100 text-red-800 border-red-200' };
    if (sugar < 70) return { label: t.low, color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { label: t.normal, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const bpStatus = getBPStatus(latestVital?.systolicBP, latestVital?.diastolicBP);
  const sugarStatus = getSugarStatus(latestVital?.bloodSugar);

  const handleReadVoice = (text: string) => {
    speechService.speak(text, language);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome & Quick Action Header */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden border border-emerald-600">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-600/80 text-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                {userProfile.village}, {userProfile.mandal} Mandal
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'te'
                ? `నమస్తే, ${userProfile.name} గారూ!`
                : language === 'hi'
                ? `नमस्ते, ${userProfile.name} जी!`
                : `Welcome, ${userProfile.name}!`}
            </h2>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
              {language === 'te'
                ? 'మీ కుటుంబ సభ్యుల ఆరోగ్యం, మందుల వేళలు మరియు సమీప పి.హెచ్.సి వివరాలు ఇక్కడ ఉన్నాయి.'
                : language === 'hi'
                ? 'आपके परिवार का स्वास्थ्य, दवा रिमाइंडर्स और निकटतम अस्पताल की जानकारी।'
                : 'Monitor family health records, medicine reminders, and nearby government health centers.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* AI Health Chatbot (Text & Voice) Button */}
            <button
              onClick={() => onNavigateTab('chatbot')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm transition-all transform hover:scale-105 active:scale-95 border border-emerald-300"
            >
              <Bot className="w-5 h-5 text-slate-950" />
              <span>{t.chatbotTitle}</span>
              <span className="text-[10px] bg-slate-950/15 text-slate-900 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                Text & Voice
              </span>
            </button>

            {/* Quick Voice Ask Button */}
            <button
              onClick={onOpenVoiceAssistant}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm transition-all transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-slate-900" />
              <span>{t.tapToSpeak}</span>
            </button>

            {/* Log Vitals Button */}
            <button
              onClick={onOpenVitalsLogger}
              className="bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-3 rounded-2xl backdrop-blur-md border border-white/20 flex items-center gap-2 text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.logVitals}</span>
            </button>

            {/* Health Trends Button */}
            <button
              id="btn-goto-analytics"
              onClick={() => onNavigateTab('analytics')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm transition-all active:scale-95 border border-emerald-400/40"
            >
              <TrendingUp className="w-4 h-4 text-emerald-200" />
              <span>{language === 'te' ? 'ఆరోగ్య ట్రెండ్స్' : 'Analytics'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PATIENT & FAMILY HEALTH PROFILE BANNER */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {language === 'te' ? 'ఆరోగ్య ప్రొఫైల్' : language === 'hi' ? 'स्वास्थ्य प्रोफ़ाइल' : 'Patient Profile'}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  ABHA: {(userProfile as PatientProfile).abhaId || '91-4523-8891-0421'}
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mt-0.5">
                {userProfile.name} • Blood: {userProfile.bloodGroup || 'O+'} • {userProfile.age} Yrs
              </h3>
              <p className="text-xs text-slate-500">
                Assigned ASHA: {(userProfile as PatientProfile).assignedAshaName || 'Sunitha Kumari'} | PHC: {(userProfile as PatientProfile).assignedPhcName || 'Gannavaram PHC'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {onOpenQRModal && (
              <button
                onClick={() => onOpenQRModal('fam-0')}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                title="View and Download Digital Health QR Card"
              >
                <QrCode className="w-4 h-4 text-emerald-200" />
                <span>{t.healthQrCard}</span>
              </button>
            )}
            {onOpenQRScanner && (
              <button
                onClick={onOpenQRScanner}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition-all active:scale-95"
                title="Scan Prescription or Patient QR"
              >
                <Camera className="w-4 h-4 text-slate-600" />
                <span>{t.scanPatientQr}</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('analytics')}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{language === 'te' ? 'నెలవారీ హెల్త్ చార్ట్‌లు' : 'Monthly Trends'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Disease Outbreak & Health Camp Alert Banners */}
      {diseaseAlerts.length > 0 && (
        <div className="space-y-3">
          {diseaseAlerts.map((alert) => {
            const alertTitle =
              language === 'te'
                ? alert.titleTe
                : language === 'hi'
                ? alert.titleHi
                : alert.title;
            const alertMsg =
              language === 'te'
                ? alert.messageTe
                : language === 'hi'
                ? alert.messageHi
                : alert.message;

            return (
              <div
                key={alert.id}
                className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm">{alertTitle}</h3>
                    <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">{alertMsg}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleReadVoice(`${alertTitle}. ${alertMsg}`)}
                  className="p-2 text-amber-800 hover:bg-amber-100 rounded-xl shrink-0"
                  title={t.readAloud}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Health Status Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-700" />
            <span>{t.healthSummary}</span>
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'విశ్లేషణ చార్ట్‌లు' : '30-Day Trends'}</span>
            </button>
            <button
              onClick={onOpenVitalsLogger}
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.logVitals}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* BP Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{t.bp}</span>
              <div className="p-1.5 bg-red-50 text-red-600 rounded-xl">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {latestVital?.systolicBP && latestVital?.diastolicBP
                  ? `${latestVital.systolicBP}/${latestVital.diastolicBP}`
                  : '--/--'}
                <span className="text-xs font-medium text-slate-400 ml-1">mmHg</span>
              </div>
              <span
                className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1.5 ${bpStatus.color}`}
              >
                {bpStatus.label}
              </span>
            </div>
          </div>

          {/* Blood Sugar Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{t.bloodSugar}</span>
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl">
                <Droplet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {latestVital?.bloodSugar ? latestVital.bloodSugar : '--'}
                <span className="text-xs font-medium text-slate-400 ml-1">mg/dL</span>
              </div>
              <span
                className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1.5 ${sugarStatus.color}`}
              >
                {sugarStatus.label}
              </span>
            </div>
          </div>

          {/* SpO2 Oxygen Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{t.spo2}</span>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {latestVital?.spo2 ? `${latestVital.spo2}%` : '--%'}
              </div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 mt-1.5">
                {latestVital?.spo2 ? t.normal : 'Normal'}
              </span>
            </div>
          </div>

          {/* BMI / Temp Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{t.bmi}</span>
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-xl">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {latestVital?.bmi ? latestVital.bmi : '22.8'}
              </div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 mt-1.5">
                Healthy BMI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Medicine Checklist Widget */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t.todaysMedicines}</h3>
              <p className="text-xs text-slate-500">Daily dose checklist & voice guide</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('reminders')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            {t.viewAll}
          </button>
        </div>

        <div className="space-y-2.5">
          {medicineReminders.map((med) => (
            <div
              key={med.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleMedicineTaken(med.id, 'morning')}
                  className={`p-2 rounded-xl transition-all ${
                    med.isTakenToday.morning
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{med.medicineName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                    <span className="font-semibold text-emerald-800">{med.familyMemberName}</span>
                    <span>•</span>
                    <span>{med.dosage} ({med.beforeOrAfterFood} food)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  handleReadVoice(
                    `${med.familyMemberName} గారు ${med.medicineName} మందు ఉదయం వేసుకోవాలి.`
                  )
                }
                className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-xl shrink-0"
                title={t.readAloud}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Family Member Health Profiles Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>{t.familyMembers}</span>
          </h3>

          <div className="flex items-center gap-2">
            {onOpenQRModal && (
              <button
                onClick={() => onOpenQRModal()}
                className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t.healthQrCard}</span>
              </button>
            )}
            <button
              onClick={onOpenFamilyModal}
              className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl hover:bg-emerald-200 flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.addFamilyMember}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5 hover:border-emerald-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{member.name}</h4>
                    <span className="text-xs text-slate-500">
                      {member.relation} • {member.age} Yrs
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {member.bloodGroup && (
                      <span className="p-1 px-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-black text-[11px] flex items-center gap-1">
                        <Droplet className="w-3 h-3 fill-rose-600 text-rose-600" />
                        <span>{member.bloodGroup}</span>
                      </span>
                    )}
                    <span className="p-1.5 bg-slate-100 rounded-xl text-slate-700 font-bold text-xs">
                      {member.gender === 'female' ? 'Female' : 'Male'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMemberToDelete(member)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title={t.deleteFamilyMember}
                      aria-label="Delete member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ABHA ID Tag */}
                {member.abhaId && (
                  <div className="text-[11px] text-slate-500 font-mono font-medium">
                    ABHA: <span className="font-bold text-slate-700">{member.abhaId}</span>
                  </div>
                )}

                {/* Special Pregnancy Tracking Tag */}
                {member.isPregnant && (
                  <div className="p-2.5 bg-pink-50 border border-pink-200 rounded-xl text-xs text-pink-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-pink-700">
                      <Baby className="w-4 h-4" />
                      <span>{t.pregnancyTracker}</span>
                    </div>
                    <p>Month {member.pregnancyMonth} • Delivery: {member.expectedDeliveryDate || 'Oct 2026'}</p>
                  </div>
                )}

                {/* Special Vaccination Tag for Children */}
                {member.hasChildVaccinationPending && (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-blue-700">
                      <Calendar className="w-4 h-4" />
                      <span>{t.childVaccination}</span>
                    </div>
                    <p>Next: {member.nextVaccineName} ({member.nextVaccineDate})</p>
                  </div>
                )}

                {member.chronicConditions && member.chronicConditions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {member.chronicConditions.map((cond, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons on Member Card */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {onOpenQRModal && (
                  <button
                    onClick={() => onOpenQRModal(member.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-all active:scale-98"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                    <span>View QR Card</span>
                  </button>
                )}
                <button
                  onClick={() => setMemberToDelete(member)}
                  className="py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-98"
                  title={t.deleteFamilyMember}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.delete}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Category Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <button
          onClick={() => onNavigateTab('chatbot')}
          className="p-4 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl shadow-md text-left flex flex-col justify-between h-28 group transition-all ring-2 ring-emerald-400/40"
        >
          <div className="flex items-center justify-between">
            <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full uppercase">AI</span>
          </div>
          <div>
            <span className="font-extrabold text-sm block">{t.chatbotTitle}</span>
            <span className="text-[11px] text-emerald-100 opacity-90">Text & Voice</span>
          </div>
        </button>

        <button
          onClick={onOpenSOS}
          className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-md text-left flex flex-col justify-between h-28 group transition-all"
        >
          <PhoneCall className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <div>
            <span className="font-extrabold text-base block">{t.sosButton}</span>
            <span className="text-[11px] text-red-100 opacity-90">108 Ambulance</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('analytics')}
          className="p-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl shadow-md text-left flex flex-col justify-between h-28 group transition-all"
        >
          <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <div>
            <span className="font-extrabold text-base block">{t.navAnalytics}</span>
            <span className="text-[11px] text-emerald-100 opacity-90">Recharts 30-Day Trends</span>
          </div>
        </button>

        <button
          onClick={onOpenLocator}
          className="p-4 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl shadow-md text-left flex flex-col justify-between h-28 group transition-all"
        >
          <MapPin className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <div>
            <span className="font-extrabold text-base block">{t.navLocator}</span>
            <span className="text-[11px] text-teal-100 opacity-90">PHCs & Hospitals</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('prescriptions')}
          className="p-4 bg-cyan-700 hover:bg-cyan-800 text-white rounded-2xl shadow-md text-left flex flex-col justify-between h-28 group transition-all"
        >
          <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <div>
            <span className="font-extrabold text-base block">{t.navPrescriptions}</span>
            <span className="text-[11px] text-cyan-100 opacity-90">OCR Scanner</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('education')}
          className="p-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-2xl shadow-md text-left flex flex-col justify-between h-28 group transition-all col-span-2 sm:col-span-1"
        >
          <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <div>
            <span className="font-extrabold text-base block">{t.navEducation}</span>
            <span className="text-[11px] text-indigo-100 opacity-90">Audio Health Guides</span>
          </div>
        </button>
      </div>

      {/* Family Member Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-rose-100 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">{t.deleteFamilyMember}</h3>
              <p className="text-xs text-slate-600">
                {t.confirmDeleteFamilyMember}
              </p>
              <p className="text-sm font-bold text-rose-700 mt-1">
                {memberToDelete.name} ({memberToDelete.relation})
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteFamilyMember?.(memberToDelete.id);
                  setMemberToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.delete}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
