import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Volume2,
  ShieldAlert,
  Stethoscope,
  ChevronRight,
  X,
  Bot,
  Info,
  Activity,
  Heart,
  Droplet,
  Brain,
  Eye,
  Smile,
  Baby,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Pill,
  Utensils,
  Wind,
} from 'lucide-react';
import { Language, DiseaseInfo } from '../types';
import { DISEASE_CATEGORIES, SAMPLE_DISEASES } from '../data/diseaseDatabase';
import { speechService } from '../services/speechService';

interface DiseaseKnowledgeBaseProps {
  language: Language;
  onOpenVoiceAssistant?: () => void;
}

export const DiseaseKnowledgeBase: React.FC<DiseaseKnowledgeBaseProps> = ({
  language,
  onOpenVoiceAssistant,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseInfo | null>(null);

  const filteredDiseases = SAMPLE_DISEASES.filter((disease) => {
    const matchesCategory = selectedCategory === 'all' || disease.categoryId === selectedCategory;
    const combinedStr = `${disease.nameEn} ${disease.nameTe} ${disease.nameHi} ${disease.definitionEn} ${disease.definitionTe} ${disease.definitionHi}`.toLowerCase();
    const matchesSearch = !searchQuery || combinedStr.includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bug':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'Wind':
        return <Wind className="w-4 h-4 text-sky-600" />;
      case 'Heart':
        return <Heart className="w-4 h-4 text-rose-600" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-purple-600" />;
      case 'Droplet':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'Brain':
        return <Brain className="w-4 h-4 text-indigo-600" />;
      case 'Eye':
        return <Eye className="w-4 h-4 text-teal-600" />;
      case 'Baby':
        return <Baby className="w-4 h-4 text-pink-600" />;
      case 'Smile':
        return <Smile className="w-4 h-4 text-yellow-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  const handleReadAloud = (d: DiseaseInfo) => {
    let text = '';
    if (language === 'te') {
      text = `${d.nameTe}. వివరణ: ${d.definitionTe}. ప్రధాన లక్షణాలు: ${d.symptomsTe.join(', ')}. ఇంటి వద్ద జాగ్రత్తలు: ${d.homeCareTe.join(', ')}.`;
    } else if (language === 'hi') {
      text = `${d.nameHi}. विवरण: ${d.definitionHi}. प्रमुख लक्षण: ${d.symptomsHi.join(', ')}. घरेलू देखभाल: ${d.homeCareHi.join(', ')}.`;
    } else {
      text = `${d.nameEn}. Description: ${d.definitionEn}. Symptoms: ${d.symptomsEn.join(', ')}. Home care: ${d.homeCareEn.join(', ')}.`;
    }
    speechService.speak(text, language);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {language === 'te'
                  ? 'గ్రామీణ ఆరోగ్య సమాచార నిధి'
                  : language === 'hi'
                  ? 'ग्रामीण स्वास्थ्य ज्ञान कोष'
                  : 'AI Rural Health Knowledge Base'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {language === 'te'
                ? 'వ్యాధుల సమగ్ర విజ్ఞాన కేంద్రం (12 ముఖ్యాంశాలు)'
                : language === 'hi'
                ? 'बीमारियों का संपूर्ण ज्ञान केंद्र (12 मुख्य बिंदु)'
                : 'Disease Knowledge Base (12-Point Guide)'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              {language === 'te'
                ? 'లక్షణాలు, కారణాలు, నివారణ, ప్రథమ చికిత్స, డాక్టర్ సలహా మరియు అత్యవసర హెచ్చరికల సమగ్ర సమాచారం.'
                : language === 'hi'
                ? 'लक्षण, कारण, बचाव, घरेलू देखभाल और आपातकालीन चेतावनियों की पूरी जानकारी।'
                : 'Simple language guides for infectious, chronic, emergency, maternal & childhood conditions.'}
            </p>
          </div>

          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="hidden sm:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-2xl shadow-lg transition-transform active:scale-95 shrink-0 text-xs"
            >
              <Bot className="w-4 h-4" />
              <span>{language === 'te' ? 'ఏఐని అడగండి' : language === 'hi' ? 'एआई से पूछें' : 'Ask AI'}</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="mt-5 relative z-10">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'te'
                  ? 'వ్యాధి పేరు లేదా లక్షణాలు వెతకండి (డెంగ్యూ, షుగర్, పాము కాటు, బిపి)...'
                  : language === 'hi'
                  ? 'बीमारी या लक्षण खोजें (डेंगू, शुगर, सांप काटना, बीपी)...'
                  : 'Search any disease (Dengue, Diabetes, Snake bite, High BP)...'
              }
              className="w-full bg-slate-800/90 border border-emerald-700/50 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories Horizontal Pill Filter */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          {language === 'te' ? 'విభాగాలు (Categories)' : language === 'hi' ? 'श्रेणियां (Categories)' : 'Disease Categories'}
        </h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
              selectedCategory === 'all'
                ? 'bg-emerald-800 text-white border-emerald-700 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {language === 'te' ? 'అన్ని వ్యాధులు (All)' : language === 'hi' ? 'सभी बीमारियां (All)' : 'All Categories'}
          </button>

          {DISEASE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-700 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>
                  {language === 'te' ? cat.nameTe : language === 'hi' ? cat.nameHi : cat.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Diseases Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDiseases.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {language === 'te'
                ? 'మీరు వెతికిన వ్యాధి సమాచారం దొరకలేదు. దయచేసి ఏఐ అసిస్టెంట్ ని అడగండి.'
                : language === 'hi'
                ? 'कोई परिणाम नहीं मिला। कृपया एआई से पूछें।'
                : 'No specific local disease card found for this search.'}
            </p>
            {onOpenVoiceAssistant && (
              <button
                onClick={onOpenVoiceAssistant}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-emerald-700"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI Voice Assistant Directly</span>
              </button>
            )}
          </div>
        ) : (
          filteredDiseases.map((disease) => {
            return (
              <div
                key={disease.id}
                className={`bg-white rounded-3xl p-5 border transition-all hover:shadow-md flex flex-col justify-between space-y-4 ${
                  disease.isEmergencyCondition
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {disease.isEmergencyCondition && (
                          <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase animate-pulse">
                            Emergency
                          </span>
                        )}
                        <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                          {language === 'te'
                            ? disease.nameTe
                            : language === 'hi'
                            ? disease.nameHi
                            : disease.nameEn}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {disease.nameEn}
                      </p>
                    </div>

                    <button
                      onClick={() => handleReadAloud(disease)}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl flex items-center gap-1 text-xs font-bold shrink-0 border border-emerald-200"
                      title="Read Aloud"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-700" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                    {language === 'te'
                      ? disease.definitionTe
                      : language === 'hi'
                      ? disease.definitionHi
                      : disease.definitionEn}
                  </p>

                  {/* Highlights */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2">
                    <div>
                      <span className="text-[11px] font-extrabold text-indigo-900 block mb-1">
                        ⚠️ {language === 'te' ? 'లక్షణాలు (Symptoms):' : language === 'hi' ? 'लक्षण (Symptoms):' : 'Key Symptoms:'}
                      </span>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                        {(language === 'te'
                          ? disease.symptomsTe
                          : language === 'hi'
                          ? disease.symptomsHi
                          : disease.symptomsEn
                        )
                          .slice(0, 3)
                          .map((sym, i) => (
                            <li key={i}>{sym}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedDisease(disease)}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-200/80 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {language === 'te' ? '12 ముఖ్యాంశాల పూర్తి మార్గదర్శి' : language === 'hi' ? '12 मुख्य बिंदुओं की पूरी गाइड' : 'View Full 12-Point Guide'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Disease Detail Modal with 12 Points */}
      {selectedDisease && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-6 relative animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    12-Point Medical Guide
                  </span>
                  {selectedDisease.isEmergencyCondition && (
                    <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full animate-pulse">
                      EMERGENCY ALERT
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {language === 'te'
                    ? selectedDisease.nameTe
                    : language === 'hi'
                    ? selectedDisease.nameHi
                    : selectedDisease.nameEn}
                </h3>
                <p className="text-xs text-slate-500">{selectedDisease.nameEn}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReadAloud(selectedDisease)}
                  className="p-2 bg-emerald-50 text-emerald-800 rounded-xl hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 text-xs font-bold"
                  title="Read Aloud"
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span className="hidden sm:inline">Listen</span>
                </button>
                <button
                  onClick={() => setSelectedDisease(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 12 Sections Content */}
            <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-slate-800 font-sans">
              {/* 1. Disease Name & Overview */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>1 & 2. What is this condition? (పరిచయం / వివరణ)</span>
                </h4>
                <p className="text-slate-700">
                  {language === 'te'
                    ? selectedDisease.definitionTe
                    : language === 'hi'
                    ? selectedDisease.definitionHi
                    : selectedDisease.definitionEn}
                </p>
              </div>

              {/* 3. Common Symptoms */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                <h4 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-700" />
                  <span>3. Common Symptoms (ప్రధాన లక్షణాలు)</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-amber-950">
                  {(language === 'te'
                    ? selectedDisease.symptomsTe
                    : language === 'hi'
                    ? selectedDisease.symptomsHi
                    : selectedDisease.symptomsEn
                  ).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* 4. Causes & 5. Risk Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-sky-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-sky-700" />
                    <span>4. Possible Causes (సాధ్యమయ్యే కారణాలు)</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sky-950">
                    {(language === 'te'
                      ? selectedDisease.causesTe
                      : language === 'hi'
                      ? selectedDisease.causesHi
                      : selectedDisease.causesEn
                    ).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-purple-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-700" />
                    <span>5. Risk Factors (ప్రమాద కారకాలు)</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-purple-950">
                    {(language === 'te'
                      ? selectedDisease.riskFactorsTe
                      : language === 'hi'
                      ? selectedDisease.riskFactorsHi
                      : selectedDisease.riskFactorsEn
                    ).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 6. Prevention Tips & 7. Home Care */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>6. Prevention Tips (నివారణ జాగ్రత్తలు)</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-emerald-950">
                    {(language === 'te'
                      ? selectedDisease.preventionTipsTe
                      : language === 'hi'
                      ? selectedDisease.preventionTipsHi
                      : selectedDisease.preventionTipsEn
                    ).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-teal-900 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-teal-700" />
                    <span>7. Home Care (ఇంటి వద్ద జాగ్రత్తలు)</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-teal-950">
                    {(language === 'te'
                      ? selectedDisease.homeCareTe
                      : language === 'hi'
                      ? selectedDisease.homeCareHi
                      : selectedDisease.homeCareEn
                    ).map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 8. When to Seek Medical Care & 9. Emergency Red Flags */}
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-blue-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>8. When to Seek Medical Care (వైద్య సహాయం ఎప్పుడు పొందాలి)</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-950">
                    {(language === 'te'
                      ? selectedDisease.whenToSeeDoctorTe
                      : language === 'hi'
                      ? selectedDisease.whenToSeeDoctorHi
                      : selectedDisease.whenToSeeDoctorEn
                    ).map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-100/90 p-4 rounded-2xl border border-rose-300 space-y-2">
                  <h4 className="font-black text-sm text-rose-950 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-700 animate-bounce" />
                    <span>9. 🚨 Emergency Warning Signs (అత్యవసర ప్రమాద హెచ్చరికలు)</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-rose-950 font-bold">
                    {(language === 'te'
                      ? selectedDisease.emergencySignsTe
                      : language === 'hi'
                      ? selectedDisease.emergencySignsHi
                      : selectedDisease.emergencySignsEn
                    ).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 10. Recommended Medical Tests & 11. Basic Treatment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-indigo-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-700" />
                    <span>10. Recommended Medical Tests</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-indigo-950">
                    {(language === 'te'
                      ? selectedDisease.recommendedTestsTe
                      : language === 'hi'
                      ? selectedDisease.recommendedTestsHi
                      : selectedDisease.recommendedTestsEn
                    ).map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-slate-700" />
                    <span>11. Basic Treatment Overview</span>
                  </h4>
                  <p className="text-slate-800 leading-relaxed">
                    {language === 'te'
                      ? selectedDisease.treatmentOverviewTe
                      : language === 'hi'
                      ? selectedDisease.treatmentOverviewHi
                      : selectedDisease.treatmentOverviewEn}
                  </p>
                </div>
              </div>

              {/* 12. Frequently Asked Questions (FAQs) */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-3">
                <h4 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  <span>12. Frequently Asked Questions (FAQs)</span>
                </h4>
                <div className="space-y-2">
                  {(language === 'te'
                    ? selectedDisease.faqsTe
                    : language === 'hi'
                    ? selectedDisease.faqsHi
                    : selectedDisease.faqsEn
                  ).map((faq, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-amber-100 space-y-1">
                      <p className="font-bold text-amber-950">Q: {faq.q}</p>
                      <p className="text-slate-700">A: {faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-slate-900 text-slate-300 p-3.5 rounded-2xl text-[11px] leading-relaxed border border-slate-800">
                <p className="font-bold text-amber-300 mb-0.5">⚠️ Medical Disclaimer / గమనిక:</p>
                This health information is for educational purposes only and not a substitute for professional medical advice, diagnosis, or treatment. Always visit your nearest Primary Health Centre (PHC) doctor or consult your local ASHA worker.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setSelectedDisease(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs hover:bg-slate-200"
              >
                Close
              </button>

              {onOpenVoiceAssistant && (
                <button
                  onClick={() => {
                    setSelectedDisease(null);
                    onOpenVoiceAssistant();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white font-extrabold rounded-2xl text-xs shadow-md hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask AI Assistant About This Condition</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
