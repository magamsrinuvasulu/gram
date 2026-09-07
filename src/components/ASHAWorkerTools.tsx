import React, { useState } from 'react';
import {
  Users,
  Baby,
  Heart,
  Send,
  Plus,
  CheckCircle,
  FileSpreadsheet,
  PhoneCall,
  Calendar,
  QrCode,
  Camera,
  Activity,
  UserCheck,
  FileText,
  Droplet,
} from 'lucide-react';
import { Language, FamilyMember } from '../types';
import { translations } from '../translations';

interface ASHAWorkerToolsProps {
  language: Language;
  familyMembers: FamilyMember[];
  onOpenQRScanner?: () => void;
  onOpenQRModal?: (memberId?: string) => void;
  onOpenVitalsLogger?: (memberId?: string) => void;
}

export const ASHAWorkerTools: React.FC<ASHAWorkerToolsProps> = ({
  language,
  familyMembers,
  onOpenQRScanner,
  onOpenQRModal,
  onOpenVitalsLogger,
}) => {
  const t = translations[language];

  const [alertMessage, setAlertMessage] = useState('');
  const [alertSent, setAlertSent] = useState(false);

  const pregnantMembers = familyMembers.filter((m) => m.isPregnant);
  const childrenMembers = familyMembers.filter((m) => m.hasChildVaccinationPending);

  const handleSendCommunityAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMessage.trim()) return;
    setAlertSent(true);
    setTimeout(() => {
      setAlertSent(false);
      setAlertMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 text-white p-5 rounded-3xl shadow-lg border border-emerald-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl">
              <FileSpreadsheet className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.roleAsha} Portal</h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Village Health Survey, ANC Maternal Register & Child Immunization
              </p>
            </div>
          </div>

          {/* Quick Scanner Action in Header */}
          {onOpenQRScanner && (
            <button
              onClick={onOpenQRScanner}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-teal-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
            >
              <Camera className="w-4 h-4 text-teal-950" />
              <span>{t.scanPatientQr}</span>
            </button>
          )}
        </div>
      </div>

      {/* QUICK ASHA FIELD TOOLS HUB */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-white rounded-3xl p-5 border-2 border-teal-500 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-200 text-teal-900">
                New Feature
              </span>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                <QrCode className="w-5 h-5 text-teal-700" />
                <span>Field QR Code Scanner & Patient History</span>
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              {language === 'te'
                ? 'రోగుల డిజిటల్ హెల్త్ కార్డ్‌ల QR కోడ్‌ని స్కాన్ చేసి, గత బీపీ, షుగర్ రికార్డులు, మందులు మరియు ఆశా చెకప్ హిస్టరీని తక్షణమే పొందండి.'
                : 'Instantly retrieve patient vitals, medications, pregnancy stage, and previous checkup logs by scanning their Digital Health QR code.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenQRScanner && (
              <button
                onClick={onOpenQRScanner}
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Patient QR</span>
              </button>
            )}

            {onOpenQRModal && (
              <button
                onClick={() => onOpenQRModal()}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <QrCode className="w-4 h-4 text-teal-700" />
                <span>View / Print QR Cards</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ANC High Risk Pregnancy Register */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Baby className="w-5 h-5 text-pink-600" />
            <span>Maternal ANC Tracking Register (Village Households)</span>
          </h3>
          <span className="bg-pink-50 text-pink-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-pink-200">
            {pregnantMembers.length} Active ANC Cases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="p-2.5">Name</th>
                <th className="p-2.5">Relation</th>
                <th className="p-2.5">Trimester Month</th>
                <th className="p-2.5">Expected Delivery</th>
                <th className="p-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pregnantMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 font-medium text-slate-800">
                  <td className="p-2.5 font-bold">{m.name}</td>
                  <td className="p-2.5 text-slate-500">{m.relation}</td>
                  <td className="p-2.5">
                    <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded-md font-bold">
                      Month {m.pregnancyMonth}
                    </span>
                  </td>
                  <td className="p-2.5">{m.expectedDeliveryDate || 'Oct 2026'}</td>
                  <td className="p-2.5">
                    <div className="flex items-center gap-1.5">
                      {onOpenQRModal && (
                        <button
                          onClick={() => onOpenQRModal(m.id)}
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-bold text-[11px] flex items-center gap-1"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>QR Card</span>
                        </button>
                      )}
                      {onOpenVitalsLogger && (
                        <button
                          onClick={() => onOpenVitalsLogger(m.id)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px]"
                        >
                          Log Checkup
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Child Vaccination Due Register */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Child Immunization Due List</span>
          </h3>
          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
            {childrenMembers.length} Children Due
          </span>
        </div>

        <div className="space-y-2.5">
          {childrenMembers.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                <p className="text-xs text-slate-500">
                  Pending Vaccine: <strong className="text-blue-800">{c.nextVaccineName}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onOpenQRModal && (
                  <button
                    onClick={() => onOpenQRModal(c.id)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-700" />
                    <span>QR Card</span>
                  </button>
                )}
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs">
                  Mark Vaccinated
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Village Patients Directory with QR Access */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            <span>Village Patients Roster & Digital QR Records ({familyMembers.length})</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-teal-300 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-slate-900 text-xs">{member.name}</h4>
                  <span className="text-[10px] font-bold text-slate-500">({member.relation})</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {member.age} Yrs • Blood: <strong className="text-slate-800">{member.bloodGroup || 'O+'}</strong>
                </div>
                {member.abhaId && (
                  <div className="text-[10px] text-teal-800 font-mono">
                    ABHA: {member.abhaId}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {onOpenQRModal && (
                  <button
                    onClick={() => onOpenQRModal(member.id)}
                    className="p-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-teal-900 text-xs font-bold flex items-center gap-1 shadow-2xs"
                    title="View QR Card"
                  >
                    <QrCode className="w-3.5 h-3.5 text-teal-700" />
                    <span>QR Card</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community SMS Broadcast Generator */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-extrabold text-slate-900 text-base">
          Broadcast Health Advisory to Village Households
        </h3>

        <form onSubmit={handleSendCommunityAlert} className="space-y-3">
          <textarea
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            placeholder="Type health camp announcement or vaccine reminder for households in Rampur Village..."
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            rows={3}
          />

          <div className="flex items-center justify-between">
            {alertSent && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Alert broadcasted to 142 Village Families via Voice SMS!</span>
              </span>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 ml-auto shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Send Voice Advisory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

