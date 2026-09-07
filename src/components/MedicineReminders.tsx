import React, { useState } from 'react';
import { Pill, Plus, CheckCircle2, Volume2, Clock, Calendar, X, Save } from 'lucide-react';
import { Language, MedicineReminder, FamilyMember } from '../types';
import { translations } from '../translations';
import { speechService } from '../services/speechService';

interface MedicineRemindersProps {
  language: Language;
  reminders: MedicineReminder[];
  familyMembers: FamilyMember[];
  onToggleTaken: (id: string, timeSlot: 'morning' | 'afternoon' | 'night') => void;
  onAddReminder: (reminder: Omit<MedicineReminder, 'id' | 'isTakenToday'>) => void;
}

export const MedicineReminders: React.FC<MedicineRemindersProps> = ({
  language,
  reminders,
  familyMembers,
  onToggleTaken,
  onAddReminder,
}) => {
  const t = translations[language];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personName, setPersonName] = useState(familyMembers[0]?.name || 'Self');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [beforeOrAfter, setBeforeOrAfter] = useState<'before' | 'after'>('after');
  const [timeMorning, setTimeMorning] = useState(true);
  const [timeAfternoon, setTimeAfternoon] = useState(false);
  const [timeNight, setTimeNight] = useState(true);

  const handleReadReminder = (reminder: MedicineReminder) => {
    const text =
      language === 'te'
        ? `${reminder.familyMemberName} గారు ${reminder.medicineName}, ${reminder.dosage} భోజనం ${reminder.beforeOrAfterFood === 'after' ? 'తర్వాత' : 'ముందు'} వేసుకోవాలి.`
        : language === 'hi'
        ? `${reminder.familyMemberName} जी, ${reminder.medicineName} ${reminder.dosage} खाना ${reminder.beforeOrAfterFood === 'after' ? 'बाद' : 'पहले'} लें।`
        : `${reminder.familyMemberName}, take ${reminder.medicineName} ${reminder.dosage} ${reminder.beforeOrAfterFood} food.`;

    speechService.speak(text, language);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) return;

    const timings: ('morning' | 'afternoon' | 'night')[] = [];
    if (timeMorning) timings.push('morning');
    if (timeAfternoon) timings.push('afternoon');
    if (timeNight) timings.push('night');

    onAddReminder({
      familyMemberName: personName,
      medicineName,
      dosage,
      frequency: timings.length === 1 ? 'once' : timings.length === 2 ? 'twice' : 'thrice',
      timing: timings,
      beforeOrAfterFood: beforeOrAfter,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
    });

    setMedicineName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 rounded-3xl shadow-lg border border-emerald-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Pill className="w-7 h-7 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t.navReminders}</h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Daily dosage schedule & missed medicine alerts
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-emerald-800" />
          <span>{t.addReminder}</span>
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3.5">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 hover:border-emerald-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {rem.familyMemberName}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-1.5">
                  {rem.medicineName}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Dosage: <strong className="text-slate-800">{rem.dosage}</strong> ({rem.beforeOrAfterFood} food)
                </p>
              </div>

              <button
                onClick={() => handleReadReminder(rem)}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl"
                title={t.readAloud}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Time Slot Buttons */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
              {/* Morning */}
              <button
                onClick={() => onToggleTaken(rem.id, 'morning')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  rem.isTakenToday.morning
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Morning {rem.isTakenToday.morning ? '(Done)' : ''}</span>
              </button>

              {/* Afternoon */}
              <button
                onClick={() => onToggleTaken(rem.id, 'afternoon')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  rem.isTakenToday.afternoon
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Afternoon</span>
              </button>

              {/* Night */}
              <button
                onClick={() => onToggleTaken(rem.id, 'night')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  rem.isTakenToday.night
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Night</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-emerald-100">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between border-b border-emerald-700">
              <h3 className="font-bold text-base">{t.addReminder}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-emerald-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">For Whom?</label>
                <select
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="Self">Self (Ramesh)</option>
                  {familyMembers.map((fam) => (
                    <option key={fam.id} value={fam.name}>
                      {fam.name} ({fam.relation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="1 Tablet"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Food Timing</label>
                  <select
                    value={beforeOrAfter}
                    onChange={(e: any) => setBeforeOrAfter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="after">After Food</option>
                    <option value="before">Before Food</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Timing Slots</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 p-2 rounded-xl flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timeMorning}
                      onChange={(e) => setTimeMorning(e.target.checked)}
                    />
                    <span>Morning</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 p-2 rounded-xl flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timeAfternoon}
                      onChange={(e) => setTimeAfternoon(e.target.checked)}
                    />
                    <span>Afternoon</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 p-2 rounded-xl flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timeNight}
                      onChange={(e) => setTimeNight(e.target.checked)}
                    />
                    <span>Night</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
