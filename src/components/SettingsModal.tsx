import React, { useState } from 'react';
import {
  Settings,
  X,
  Globe,
  Sparkles,
  Check,
  User,
  Type,
  Volume2,
  Save,
  Info,
  ShieldCheck,
  Languages,
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { storageService } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  aiLanguageMode: 'single' | 'multi';
  onAiLanguageModeChange: (mode: 'single' | 'multi') => void;
  userProfile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  textSize: 'normal' | 'large';
  onToggleTextSize: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  aiLanguageMode,
  onAiLanguageModeChange,
  userProfile,
  onProfileUpdate,
  isHighContrast,
  onToggleHighContrast,
  textSize,
  onToggleTextSize,
}) => {
  const [profileForm, setProfileForm] = useState<UserProfile>({ ...userProfile });
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleModeSelect = (mode: 'single' | 'multi') => {
    onAiLanguageModeChange(mode);
    storageService.saveAiLanguageMode(mode);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveUserProfile(profileForm);
    onProfileUpdate(profileForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-700 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Settings className="w-6 h-6 text-emerald-200 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight">
                {language === 'te'
                  ? 'యాప్ సెట్టింగ్‌లు & ఏఐ ప్రాధాన్యతలు'
                  : language === 'hi'
                  ? 'ऐप सेटिंग्स और एआई प्राथमिकताएं'
                  : 'App Settings & AI Preferences'}
              </h2>
              <p className="text-xs text-emerald-100/80">
                {language === 'te'
                  ? 'భాష, ఏఐ రెస్పాన్స్ మోడ్, మరియు ప్రొఫైల్ వివరాలను సవరించండి'
                  : language === 'hi'
                  ? 'भाषा, एआई प्रतिक्रिया मोड और प्रोफ़ाइल बदलें'
                  : 'Customize AI language mode, app language, and user profile'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-emerald-700/50 hover:bg-emerald-700 text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 text-slate-800 font-sans">
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'te'
                  ? 'సెట్టింగ్‌లు విజయవంతంగా భద్రపరచబడ్డాయి!'
                  : language === 'hi'
                  ? 'सेटिंग्स सफलतापूर्वक सहेजी गईं!'
                  : 'Settings successfully saved to persistent storage!'}
              </span>
            </div>
          )}

          {/* SECTION 1: AI Response Language Mode (Single vs Multi) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  {language === 'te'
                    ? 'ఏఐ సంభాషణ భాషా మోడ్ (AI Response Mode)'
                    : language === 'hi'
                    ? 'एआई प्रतिक्रिया भाषा मोड (AI Response Mode)'
                    : 'AI Response Language Mode'}
                </span>
              </label>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                Persistent Storage Saved
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'te'
                ? 'ఏఐ అసిస్టెంట్ మరియు వాయిస్ హెల్పర్ మీ ప్రశ్నలకు ఎలా సమాధానం ఇవ్వాలో ఎంచుకోండి:'
                : language === 'hi'
                ? 'चुनें कि एआई सहायक आपकी आवाज और स्वास्थ्य प्रश्नों का उत्तर कैसे दे:'
                : 'Choose how the AI Assistant responds to your health and symptom queries:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Single Language Mode Option */}
              <div
                onClick={() => handleModeSelect('single')}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between space-y-3 ${
                  aiLanguageMode === 'single'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl text-xs font-bold ${
                        aiLanguageMode === 'single'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Languages className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">
                        Single Language Mode
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        (Default Preference)
                      </span>
                    </div>
                  </div>
                  {aiLanguageMode === 'single' && (
                    <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-normal">
                  {language === 'te'
                    ? 'ఏఐ కేవలం మీరు ఎంచుకున్న ఒక్క భాషలో మాత్రమే (తెలుగు / హిందీ / ఇంగ్లీష్) వేగవంతమైన సమాధానం ఇస్తుంది.'
                    : language === 'hi'
                    ? 'एआई केवल आपकी चुनी गई एक भाषा (तेलगु / हिंदी / अंग्रेजी) में उत्तर देगा।'
                    : 'AI responds strictly in your selected app language (Telugu, Hindi, or English).'}
                </p>
              </div>

              {/* Multi-Language Mode Option */}
              <div
                onClick={() => handleModeSelect('multi')}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between space-y-3 ${
                  aiLanguageMode === 'multi'
                    ? 'border-amber-500 bg-amber-50/70 shadow-md ring-2 ring-amber-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl text-xs font-bold ${
                        aiLanguageMode === 'multi'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">
                        Multi-Language Mode
                      </h4>
                      <span className="text-[10px] text-amber-800 font-bold">
                        (Telugu + Hindi + English)
                      </span>
                    </div>
                  </div>
                  {aiLanguageMode === 'multi' && (
                    <div className="w-5 h-5 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-normal">
                  {language === 'te'
                    ? 'ఏఐ ఒకేసారి తెలుగు, హిందీ మరియు ఇంగ్లీష్ లలో స్పష్టమైన సమాధానం ఇస్తుంది. కుటుంబ సభ్యులందరికీ ఉపయోగకరం.'
                    : language === 'hi'
                    ? 'एआई एक साथ तेलुगु, हिंदी और अंग्रेजी में उत्तर देगा। पूरे परिवार के लिए उपयोगी।'
                    : 'AI responds in Telugu, Hindi, and English simultaneously with individual read-aloud buttons.'}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: App Interface Language Selection */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>
                {language === 'te'
                  ? 'యాప్ ప్రదర్శన భాష (App Interface Language)'
                  : language === 'hi'
                  ? 'ऐप इंटरफ़ेस भाषा (App Language)'
                  : 'App Interface Language'}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onLanguageChange('te')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all ${
                  language === 'te'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                తెలుగు (Telugu)
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all ${
                  language === 'hi'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                हिन्दी (Hindi)
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all ${
                  language === 'en'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange('multi')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all ${
                  language === 'multi'
                    ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🌐 Multilingual
              </button>
            </div>
          </div>

          {/* SECTION 3: Accessibility & High Contrast */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4 text-purple-700" />
              <span>
                {language === 'te'
                  ? 'అనుకూలత & అక్షర పరిమాణం (Display & Accessibility)'
                  : language === 'hi'
                  ? 'डिस्प्ले और सुलभता (Display & Accessibility)'
                  : 'Display & Accessibility'}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onToggleHighContrast}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                  isHighContrast
                    ? 'bg-black text-yellow-400 border-yellow-400 font-bold'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>High Contrast Mode</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-800">
                  {isHighContrast ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={onToggleTextSize}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                  textSize === 'large'
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Type className="w-4 h-4" />
                  <span>Large Text Mode (పెద్ద అక్షరాలు)</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-800">
                  {textSize === 'large' ? 'LARGE' : 'NORMAL'}
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 4: Patient & Family Health Profile */}
          <form onSubmit={handleProfileSave} className="space-y-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-700" />
                <span>
                  {language === 'te'
                    ? 'ఆరోగ్య ప్రొఫైల్ వివరాలు (Patient Health Profile)'
                    : language === 'hi'
                    ? 'स्वास्थ्य प्रोफ़ाइल विवरण (Patient Health Profile)'
                    : 'Patient Health Profile'}
                </span>
              </label>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                {language === 'te' ? 'రోగి & కుటుంబం' : language === 'hi' ? 'रोगी और परिवार' : 'Patient & Family'}
              </span>
            </div>

            {/* Common Fields: Name, Phone, Village, Mandal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  {language === 'te' ? 'పేరు (Patient Name)' : language === 'hi' ? 'नाम (Patient Name)' : 'Patient Full Name'}
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value, role: 'villager' })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  {language === 'te' ? 'ఫోన్ నంబర్ (Mobile)' : language === 'hi' ? 'मोबाइल नंबर (Phone)' : 'Mobile Number'}
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  {language === 'te' ? 'గ్రామం (Village / Town)' : language === 'hi' ? 'गाँव / कस्बा (Village)' : 'Village / Town'}
                </label>
                <input
                  type="text"
                  value={profileForm.village}
                  onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  {language === 'te' ? 'మండలం / జిల్లా (Mandal/District)' : language === 'hi' ? 'मंडल / जिला (Mandal/District)' : 'Mandal / District'}
                </label>
                <input
                  type="text"
                  value={profileForm.mandal}
                  onChange={(e) => setProfileForm({ ...profileForm, mandal: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Health IDs & Healthcare Links */}
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/80 space-y-3 text-xs">
              <div className="font-extrabold text-emerald-950 flex items-center justify-between">
                <span>
                  {language === 'te'
                    ? '🧑 ఆరోగ్య కార్డు & గుర్తింపు వివరాలు (Health IDs & PHC)'
                    : language === 'hi'
                    ? '🧑 स्वास्थ्य कार्ड और अस्पताल विवरण (Health IDs & PHC)'
                    : '🧑 Health Card IDs & Government Healthcare Links'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">ABHA Active</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">ABHA Health ID (ఆయుష్మాన్ భారత్ / आयुष्मान भारत)</label>
                  <input
                    type="text"
                    value={(profileForm as any).abhaId || '91-4523-8891-0421'}
                    onChange={(e) => setProfileForm({ ...profileForm, abhaId: e.target.value } as any)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Aarogyasri Card No (ఆరోగ్యశ్రీ / स्वास्थ्य कार्ड)</label>
                  <input
                    type="text"
                    value={(profileForm as any).aarogyasriNo || 'AS-KR-2024-8841'}
                    onChange={(e) => setProfileForm({ ...profileForm, aarogyasriNo: e.target.value } as any)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    {language === 'te' ? 'కేటాయించిన ఆశా కార్యకర్త (Assigned ASHA)' : language === 'hi' ? 'संबंधित आशा कार्यकर्ता (Assigned ASHA)' : 'Assigned ASHA Worker'}
                  </label>
                  <input
                    type="text"
                    value={(profileForm as any).assignedAshaName || 'Sunitha Kumari (ASHA Worker)'}
                    onChange={(e) => setProfileForm({ ...profileForm, assignedAshaName: e.target.value } as any)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    {language === 'te' ? 'సమీప ప్రాథమిక ఆరోగ్య కేంద్రం (PHC Centre)' : language === 'hi' ? 'निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC)' : 'Assigned PHC Centre'}
                  </label>
                  <input
                    type="text"
                    value={(profileForm as any).assignedPhcName || 'Gannavaram PHC'}
                    onChange={(e) => setProfileForm({ ...profileForm, assignedPhcName: e.target.value } as any)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>
                {language === 'te'
                  ? 'ప్రొఫైల్ సేవ్ చేయండి'
                  : language === 'hi'
                  ? 'प्रोफ़ाइल सहेजें'
                  : 'Save Profile & Preferences'}
              </span>
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Stored in secure client LocalStorage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
