import React, { useState } from 'react';
import { Users, UserPlus, Baby, Calendar, Heart, X, Save, QrCode, Droplet, Trash2 } from 'lucide-react';
import { Language, FamilyMember } from '../types';
import { translations } from '../translations';

interface FamilyProfilesProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  familyMembers: FamilyMember[];
  onAddFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  onDeleteFamilyMember?: (id: string) => void;
  onOpenQRModal?: (memberId?: string) => void;
}

export const FamilyProfiles: React.FC<FamilyProfilesProps> = ({
  isOpen,
  onClose,
  language,
  familyMembers,
  onAddFamilyMember,
  onDeleteFamilyMember,
  onOpenQRModal,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Spouse');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [abhaId, setAbhaId] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);
  const [pregnancyMonth, setPregnancyMonth] = useState('5');
  const [hasChildVaccine, setHasChildVaccine] = useState(false);
  const [vaccineName, setVaccineName] = useState('Polio & DPT Dose 2');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddFamilyMember({
      name,
      relation,
      age: parseInt(age) || 25,
      gender,
      bloodGroup: bloodGroup || 'O+',
      abhaId: abhaId.trim() || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      isPregnant: gender === 'female' ? isPregnant : false,
      pregnancyMonth: isPregnant ? parseInt(pregnancyMonth) : undefined,
      hasChildVaccinationPending: hasChildVaccine,
      nextVaccineName: hasChildVaccine ? vaccineName : undefined,
      nextVaccineDate: hasChildVaccine ? '2026-08-15' : undefined,
    });

    setName('');
    setAbhaId('');
    setActiveTab('manage');
  };

  const handleConfirmDelete = (id: string) => {
    if (onDeleteFamilyMember) {
      onDeleteFamilyMember(id);
    }
    setMemberToDelete(null);
  };

  return (
    <div
      id="family-profiles-modal"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-emerald-100 relative">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between border-b border-emerald-700">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-200" />
            <h2 className="font-bold text-lg">{t.familyMembers}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onOpenQRModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQRModal();
                }}
                className="px-2.5 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="View All Family QR Cards"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                <span>QR Cards</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-emerald-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`py-2 px-4 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'add'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.addFamilyMember}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-4 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'manage'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.familyMembers} ({familyMembers.length})</span>
          </button>
        </div>

        {/* Manage / Delete Tab */}
        {activeTab === 'manage' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Profiles ({familyMembers.length})
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ {t.addFamilyMember}</span>
              </button>
            </div>

            {familyMembers.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No family members recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{member.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {member.relation}
                        </span>
                        {member.bloodGroup && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800">
                            {member.bloodGroup}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {member.age} Yrs • {member.gender}
                        {member.abhaId && <span className="font-mono ml-2 font-medium">ABHA: {member.abhaId}</span>}
                      </div>
                      {member.isPregnant && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-pink-700 font-semibold mt-1">
                          <Baby className="w-3 h-3" /> Pregnant (Month {member.pregnancyMonth})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onOpenQRModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenQRModal(member.id);
                          }}
                          className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="View QR Card"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setMemberToDelete(member)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={t.deleteFamilyMember}
                        aria-label="Delete family member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Tab */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Reddy"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relation</label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="Self">Self (నేను / स्वयं)</option>
                  <option value="Spouse">Spouse (భార్య / భర్త)</option>
                  <option value="Child">Child (బిడ్డ / పిల్లలు)</option>
                  <option value="Parent">Parent (తల్లి / తండ్రి)</option>
                  <option value="Grandparent">Grandparent (నానమ్మ / తాతయ్య)</option>
                  <option value="Other">Other Family Member</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="female">Female (స్త్రీ)</option>
                  <option value="male">Male (పురుషుడు)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ABHA Health ID (Optional)
              </label>
              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="e.g. 91-4829-1928-3019"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
              />
            </div>

            {/* Special Pregnancy Toggle for Females */}
            {gender === 'female' && (
              <div className="p-3.5 bg-pink-50 border border-pink-200 rounded-2xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded"
                  />
                  <span className="font-bold text-xs text-pink-900 flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-pink-600" />
                    Currently Pregnant? ( ANC Care Tracker )
                  </span>
                </label>

                {isPregnant && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-pink-900 mb-1">
                      Pregnancy Month (1-9)
                    </label>
                    <select
                      value={pregnancyMonth}
                      onChange={(e) => setPregnancyMonth(e.target.value)}
                      className="w-full bg-white border border-pink-300 rounded-xl px-3 py-2 text-xs font-bold text-pink-900"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                        <option key={m} value={m}>
                          Month {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Child Vaccine Tracker */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasChildVaccine}
                  onChange={(e) => setHasChildVaccine(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Track Immunization & Vaccination Schedule?
                </span>
              </label>

              {hasChildVaccine && (
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">
                    Next Vaccine Name
                  </label>
                  <input
                    type="text"
                    value={vaccineName}
                    onChange={(e) => setVaccineName(e.target.value)}
                    placeholder="e.g. Measles & Rubella Dose 1"
                    className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  />
                </div>
              )}
            </div>

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
        )}

        {/* Delete Confirmation Dialog */}
        {memberToDelete && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-rose-100 shadow-2xl space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
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
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(memberToDelete.id)}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.delete}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
