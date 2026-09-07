import React, { useState } from 'react';
import { Activity, X, Heart, Droplet, Thermometer, Save, User } from 'lucide-react';
import { Language, FamilyMember, HealthVital } from '../types';
import { translations } from '../translations';

interface VitalsLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  familyMembers: FamilyMember[];
  onSaveVital: (vital: Omit<HealthVital, 'id'>) => void;
}

export const VitalsLogger: React.FC<VitalsLoggerProps> = ({
  isOpen,
  onClose,
  language,
  familyMembers,
  onSaveVital,
}) => {
  const t = translations[language];

  const [selectedFamilyMember, setSelectedFamilyMember] = useState(
    familyMembers[0]?.name || 'Self'
  );
  const [systolicBP, setSystolicBP] = useState<string>('120');
  const [diastolicBP, setDiastolicBP] = useState<string>('80');
  const [bloodSugar, setBloodSugar] = useState<string>('110');
  const [sugarType, setSugarType] = useState<'fasting' | 'post-meal' | 'random'>('fasting');
  const [pulseRate, setPulseRate] = useState<string>('72');
  const [spo2, setSpo2] = useState<string>('98');
  const [temperature, setTemperature] = useState<string>('98.4');
  const [weight, setWeight] = useState<string>('60');
  const [height, setHeight] = useState<string>('165');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) {
      return parseFloat((w / (h * h)).toFixed(1));
    }
    return undefined;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const bmi = calculateBMI();

    onSaveVital({
      familyMemberName: selectedFamilyMember,
      timestamp: new Date().toISOString(),
      systolicBP: systolicBP ? parseInt(systolicBP) : undefined,
      diastolicBP: diastolicBP ? parseInt(diastolicBP) : undefined,
      bloodSugar: bloodSugar ? parseInt(bloodSugar) : undefined,
      sugarType,
      pulseRate: pulseRate ? parseInt(pulseRate) : undefined,
      spo2: spo2 ? parseInt(spo2) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
      bmi,
      notes,
    });

    onClose();
  };

  return (
    <div
      id="vitals-logger-modal"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-emerald-100">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between border-b border-emerald-700">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-200" />
            <h2 className="font-bold text-lg">{t.logVitals}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-emerald-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Family Member Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>Select Person</span>
            </label>
            <select
              value={selectedFamilyMember}
              onChange={(e) => setSelectedFamilyMember(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="Self">Self (Ramesh)</option>
              {familyMembers.map((fam) => (
                <option key={fam.id} value={fam.name}>
                  {fam.name} ({fam.relation})
                </option>
              ))}
            </select>
          </div>

          {/* BP Input Group */}
          <div className="p-3.5 bg-red-50/50 rounded-2xl border border-red-100 space-y-2">
            <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs">
              <Heart className="w-4 h-4 text-red-600" />
              <span>{t.bp} (Systolic / Diastolic mmHg)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-0.5">
                  Systolic (High)
                </label>
                <input
                  type="number"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(e.target.value)}
                  placeholder="120"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-0.5">
                  Diastolic (Low)
                </label>
                <input
                  type="number"
                  value={diastolicBP}
                  onChange={(e) => setDiastolicBP(e.target.value)}
                  placeholder="80"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Blood Sugar Input Group */}
          <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
            <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs">
              <Droplet className="w-4 h-4 text-blue-600" />
              <span>{t.bloodSugar} (mg/dL)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  placeholder="110"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
                />
              </div>
              <select
                value={sugarType}
                onChange={(e: any) => setSugarType(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="fasting">Fasting</option>
                <option value="post-meal">Post Meal</option>
                <option value="random">Random</option>
              </select>
            </div>
          </div>

          {/* Pulse & SpO2 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.pulseRate} (bpm)</label>
              <input
                type="number"
                value={pulseRate}
                onChange={(e) => setPulseRate(e.target.value)}
                placeholder="72"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.spo2} (%)</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="98"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Weight, Height & Temp */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">{t.weight}</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="60"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">{t.height}</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="165"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">{t.temperature}</label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="98.4"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Symptoms</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mild headache after morning work"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
