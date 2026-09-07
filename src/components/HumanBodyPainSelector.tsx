import React, { useState } from 'react';
import {
  BodyPartId,
  BodyPartPain,
  PainType,
  PainSeverity,
  PainDuration,
  Language,
} from '../types';
import {
  Activity,
  AlertCircle,
  Check,
  RotateCcw,
  Trash2,
  Plus,
  X,
  Info,
} from 'lucide-react';

interface HumanBodyPainSelectorProps {
  language: Language;
  selectedPains: BodyPartPain[];
  onAddPain: (pain: BodyPartPain) => void;
  onRemovePain: (partId: BodyPartId) => void;
}

interface BodyPartMeta {
  id: BodyPartId;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  icon: string;
  view: 'front' | 'back' | 'both';
  descriptionEn: string;
  descriptionTe: string;
  descriptionHi: string;
}

const BODY_PARTS: BodyPartMeta[] = [
  {
    id: 'head',
    nameEn: 'Head',
    nameTe: 'తల (Head)',
    nameHi: 'सिर (Head)',
    icon: '🧠',
    view: 'both',
    descriptionEn: 'Headaches, migraines, forehead, or temples',
    descriptionTe: 'తలనొప్పి, పార్శ్వపు నొప్పి, నుదిటి నొప్పి',
    descriptionHi: 'सिरदर्द, माइग्रेन, माथा या कनपटी का दर्द',
  },
  {
    id: 'eyes',
    nameEn: 'Eyes',
    nameTe: 'కళ్ళు (Eyes)',
    nameHi: 'आंखें (Eyes)',
    icon: '👁️',
    view: 'front',
    descriptionEn: 'Eye strain, burning, redness, or vision pain',
    descriptionTe: 'కళ్ళ మంట, ఎరుపు, కంటి నొప్పి',
    descriptionHi: 'आंखों में जलन, लालिमा या दर्द',
  },
  {
    id: 'ears',
    nameEn: 'Ears',
    nameTe: 'చెవులు (Ears)',
    nameHi: 'कान (Ears)',
    icon: '👂',
    view: 'both',
    descriptionEn: 'Earache, ringing, ear pressure, or infection',
    descriptionTe: 'చెవిపోటు, హోరు, చెవిలో నొప్పి',
    descriptionHi: 'कान का दर्द, संक्रमण या भारीपन',
  },
  {
    id: 'throat',
    nameEn: 'Throat',
    nameTe: 'గొంతు (Throat / Neck)',
    nameHi: 'गला (Throat / Neck)',
    icon: '🗣️',
    view: 'front',
    descriptionEn: 'Sore throat, difficulty swallowing, or neck pain',
    descriptionTe: 'గొంతు నొప్పి, మింగడంలో నొప్పి, గొంతు రాపిడి',
    descriptionHi: 'गले में खराश, निगलने में दर्द या टॉन्सिल',
  },
  {
    id: 'chest',
    nameEn: 'Chest',
    nameTe: 'ఛాతీ / గుండె (Chest)',
    nameHi: 'छाती / सीना (Chest)',
    icon: '🫀',
    view: 'front',
    descriptionEn: 'Chest tightness, stabbing chest pain, or breath pain',
    descriptionTe: 'ఛాతీ నొప్పి, భారంగా ఉండడం, గుండెల్లో మంట',
    descriptionHi: 'सीने में दर्द, भारीपन या दबाव',
  },
  {
    id: 'stomach',
    nameEn: 'Stomach',
    nameTe: 'కడుపు (Stomach / Abdomen)',
    nameHi: 'पेट (Stomach / Abdomen)',
    icon: '🫄',
    view: 'front',
    descriptionEn: 'Abdominal cramps, acidity, bloating, or stomach ache',
    descriptionTe: 'కడుపునొప్పి, గ్యాస్, ఉబ్బరం, అజీర్ణం',
    descriptionHi: 'पेट दर्द, गैस, अपच, मरोड़ या एसिडिटी',
  },
  {
    id: 'back',
    nameEn: 'Back',
    nameTe: 'వీపు / నడుము (Back / Spine)',
    nameHi: 'पीठ / कमर (Back / Spine)',
    icon: '🦴',
    view: 'back',
    descriptionEn: 'Upper back, lower back (lumbar), or spine pain',
    descriptionTe: 'నడుము నొప్పి, వెన్నెముక నొప్పి, వీపు పట్టేయడం',
    descriptionHi: 'कमर दर्द, रीढ़ की हड्डी या पीठ की ऐंठन',
  },
  {
    id: 'arms',
    nameEn: 'Arms',
    nameTe: 'చేతులు / భుజాలు (Arms / Shoulders)',
    nameHi: 'बाहें / कंधे (Arms / Shoulders)',
    icon: '💪',
    view: 'both',
    descriptionEn: 'Shoulder ache, biceps, elbow, or arm numbness',
    descriptionTe: 'భుజాల నొప్పి, చేతులు లాగడం, మోచేయి నొప్పి',
    descriptionHi: 'कंधे का दर्द, बाहों में जकड़न या खिंचाव',
  },
  {
    id: 'hands',
    nameEn: 'Hands',
    nameTe: 'అరచేతులు / వేళ్లు (Hands / Wrists)',
    nameHi: 'हाथ / कलाई (Hands / Wrists)',
    icon: '🖐️',
    view: 'both',
    descriptionEn: 'Wrist pain, finger joints, palm tingling, or arthritis',
    descriptionTe: 'మణికట్టు నొప్పి, వేళ్ళ కీళ్ళ నొప్పులు, తిమ్మిర్లు',
    descriptionHi: 'कलाई का दर्द, उंगलियों के जोड़ या झनझनाहट',
  },
  {
    id: 'legs',
    nameEn: 'Legs',
    nameTe: 'కాళ్ళు / పిక్కలు (Legs / Knees)',
    nameHi: 'टांगें / घुटने (Legs / Knees)',
    icon: '🦵',
    view: 'both',
    descriptionEn: 'Knee joint pain, thigh ache, calf cramps, or swelling',
    descriptionTe: 'మోకాళ్ళ నొప్పులు, పిక్కలు పట్టేయడం, కాళ్ళ వాపు',
    descriptionHi: 'घुटनों का दर्द, पिंडलियों में ऐंठन या सूजन',
  },
  {
    id: 'feet',
    nameEn: 'Feet',
    nameTe: 'పాదాలు (Feet / Ankles)',
    nameHi: 'पैर (Feet / Ankles)',
    icon: '🦶',
    view: 'both',
    descriptionEn: 'Ankle sprain, heel pain, sole burning, or swollen feet',
    descriptionTe: 'మడమ నొప్పి, పాదాల మంటలు, చీలమండ బెణుకు',
    descriptionHi: 'एड़ी का दर्द, पंजों में जलन या टखने में मोच',
  },
];

const PAIN_TYPES: {
  id: PainType;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  descEn: string;
}[] = [
  {
    id: 'sharp',
    nameEn: 'Sharp / Stabbing',
    nameTe: 'తీవ్రమైన కుచ్చుతున్న నొప్పి',
    nameHi: 'तेज चुभने वाला दर्द',
    descEn: 'Sudden, piercing sensation like a needle or knife',
  },
  {
    id: 'dull',
    nameEn: 'Dull Ache',
    nameTe: 'మొద్దుబారిన నిరంతర నొప్పి',
    nameHi: 'हल्का लगातार दर्द',
    descEn: 'Constant, low-grade lingering soreness',
  },
  {
    id: 'throbbing',
    nameEn: 'Throbbing / Pulsating',
    nameTe: 'దడదడలాడే నొప్పి (తుమ్మెదలా కొట్టుకోవడం)',
    nameHi: 'धड़कने वाला दर्द (टीस मारना)',
    descEn: 'Pulsing rhythm like a heartbeat',
  },
  {
    id: 'burning',
    nameEn: 'Burning / Heat',
    nameTe: 'మంట / అగ్గిలా కాలడం',
    nameHi: 'जलन / ताप लगना',
    descEn: 'Hot, scorching or acidic sensation',
  },
  {
    id: 'cramping',
    nameEn: 'Cramping / Spasm',
    nameTe: 'తిమ్మిరి / పట్టేసిన నొప్పి',
    nameHi: 'ऐंठन / मरोड़',
    descEn: 'Muscle seizing, squeezing or knotting',
  },
  {
    id: 'pressure',
    nameEn: 'Pressure / Tightness',
    nameTe: 'ఒత్తిడి / పట్టేసి బరువుగా ఉండటం',
    nameHi: 'दबाव / भारीपन व जकड़न',
    descEn: 'Heavy crushing weight or tight band feeling',
  },
];

const SEVERITIES: {
  id: PainSeverity;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  color: string;
  bgActive: string;
  borderActive: string;
}[] = [
  {
    id: 'mild',
    nameEn: 'Mild (1 - 3)',
    nameTe: 'తేలికపాటి (Mild)',
    nameHi: 'हल्का (Mild)',
    color: 'text-emerald-700',
    bgActive: 'bg-emerald-600 text-white',
    borderActive: 'border-emerald-600',
  },
  {
    id: 'moderate',
    nameEn: 'Moderate (4 - 6)',
    nameTe: 'మధ్యస్థ (Moderate)',
    nameHi: 'मध्यम (Moderate)',
    color: 'text-amber-700',
    bgActive: 'bg-amber-600 text-white',
    borderActive: 'border-amber-600',
  },
  {
    id: 'severe',
    nameEn: 'Severe (7 - 10)',
    nameTe: 'తీవ్రమైన (Severe)',
    nameHi: 'गंभीर / तेज (Severe)',
    color: 'text-red-700',
    bgActive: 'bg-red-600 text-white',
    borderActive: 'border-red-600',
  },
];

const DURATIONS: {
  id: PainDuration;
  nameEn: string;
  nameTe: string;
  nameHi: string;
}[] = [
  {
    id: 'few_hours',
    nameEn: 'Few hours',
    nameTe: 'కొన్ని గంటలు (Few hours)',
    nameHi: 'कुछ घंटे (Few hours)',
  },
  {
    id: '1_day',
    nameEn: '1 day',
    nameTe: '1 రోజు (1 day)',
    nameHi: '1 दिन (1 day)',
  },
  {
    id: '2_3_days',
    nameEn: '2–3 days',
    nameTe: '2–3 రోజులు (2–3 days)',
    nameHi: '2–3 दिन (2–3 days)',
  },
  {
    id: 'more_than_week',
    nameEn: 'More than a week',
    nameTe: 'వారం కంటే ఎక్కువ (> 1 week)',
    nameHi: 'एक सप्ताह से अधिक (> 1 week)',
  },
];

export const HumanBodyPainSelector: React.FC<HumanBodyPainSelectorProps> = ({
  language,
  selectedPains,
  onAddPain,
  onRemovePain,
}) => {
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front');
  const [activePartForModal, setActivePartForModal] = useState<BodyPartMeta | null>(null);

  // Modal configuration states
  const [selectedPainType, setSelectedPainType] = useState<PainType>('dull');
  const [selectedSeverity, setSelectedSeverity] = useState<PainSeverity>('moderate');
  const [selectedDuration, setSelectedDuration] = useState<PainDuration>('1_day');
  const [notes, setNotes] = useState<string>('');

  const openConfigModal = (part: BodyPartMeta) => {
    // If this part is already in selectedPains, load its settings
    const existing = selectedPains.find((p) => p.id === part.id);
    if (existing) {
      setSelectedPainType(existing.painType);
      setSelectedSeverity(existing.severity);
      setSelectedDuration(existing.duration);
      setNotes(existing.notes || '');
    } else {
      setSelectedPainType('dull');
      setSelectedSeverity('moderate');
      setSelectedDuration('1_day');
      setNotes('');
    }
    setActivePartForModal(part);
  };

  const handleSavePain = () => {
    if (!activePartForModal) return;

    const painData: BodyPartPain = {
      id: activePartForModal.id,
      partName: activePartForModal.nameEn,
      partNameTe: activePartForModal.nameTe,
      partNameHi: activePartForModal.nameHi,
      painType: selectedPainType,
      severity: selectedSeverity,
      duration: selectedDuration,
      notes: notes.trim() || undefined,
    };

    onAddPain(painData);
    setActivePartForModal(null);
  };

  const isPartSelected = (partId: BodyPartId) => {
    return selectedPains.some((p) => p.id === partId);
  };

  const getPartPainData = (partId: BodyPartId) => {
    return selectedPains.find((p) => p.id === partId);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-5">
      {/* Header with Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              {language === 'te'
                ? 'శరీర నొప్పి ప్రాంతాన్ని ఎంచుకోండి (Interactive Body Map)'
                : language === 'hi'
                ? 'शरीर में दर्द का स्थान चुनें (Interactive Body Map)'
                : 'Interactive Human Body Pain Selection'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'te'
              ? 'నొప్పి ఉన్న శరీర భాగాన్ని క్లిక్ చేసి నొప్పి రకం, తీవ్రత మరియు వ్యవధిని నమోదు చేయండి.'
              : language === 'hi'
              ? 'दर्द वाले हिस्से पर क्लिक करें और दर्द का प्रकार, तीव्रता और अवधि बताएं।'
              : 'Click on any body part to describe pain type, severity, and duration.'}
          </p>
        </div>

        {/* Front / Back View Toggle Button */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrentView('front')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'front'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'te' ? 'ముందు భాగం (Front)' : language === 'hi' ? 'सामने (Front)' : 'Front View'}
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('back')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'back'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'te' ? 'వెనుక భాగం (Back)' : language === 'hi' ? 'पीछे (Back)' : 'Back View'}
          </button>
        </div>
      </div>

      {/* Main Visual Layout: Interactive SVG Model & Quick Part Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center: Interactive SVG Diagram Container */}
        <div className="lg:col-span-6 flex flex-col items-center bg-gradient-to-b from-slate-50 to-sky-50/40 rounded-2xl p-4 border border-slate-200/80 relative">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 font-semibold px-2 mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
              {currentView === 'front' ? 'Anterior (Front View)' : 'Posterior (Back View)'}
            </span>
            <span>{selectedPains.length} Area(s) Selected</span>
          </div>

          {/* SVG Body Diagram with Clickable Zones */}
          <div className="relative w-full max-w-[280px] h-[400px] flex items-center justify-center select-none">
            <svg
              viewBox="0 0 200 380"
              className="w-full h-full drop-shadow-md"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Gradient for body silhouette */}
                <linearGradient id="bodySkin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>

                <linearGradient id="selectedRed" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>

                <linearGradient id="selectedAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                <linearGradient id="selectedGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
              </defs>

              {/* Base Human Silhouette Drawing */}
              {/* Head */}
              <path
                d="M 100 20 C 85 20 78 35 78 50 C 78 68 86 80 100 82 C 114 80 122 68 122 50 C 122 35 115 20 100 20 Z"
                fill={
                  isPartSelected('head')
                    ? getPartPainData('head')?.severity === 'severe'
                      ? 'url(#selectedRed)'
                      : getPartPainData('head')?.severity === 'moderate'
                      ? 'url(#selectedAmber)'
                      : 'url(#selectedGreen)'
                    : '#cbd5e1'
                }
                stroke={isPartSelected('head') ? '#ef4444' : '#94a3b8'}
                strokeWidth={isPartSelected('head') ? '2.5' : '1.5'}
                className="cursor-pointer transition-all hover:opacity-85"
                onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'head')!)}
              />

              {/* Front Face features: Eyes */}
              {currentView === 'front' && (
                <g
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openConfigModal(BODY_PARTS.find((p) => p.id === 'eyes')!);
                  }}
                >
                  <circle
                    cx="93"
                    cy="45"
                    r="4"
                    fill={isPartSelected('eyes') ? '#ef4444' : '#64748b'}
                    className="hover:scale-125 transition-transform"
                  />
                  <circle
                    cx="107"
                    cy="45"
                    r="4"
                    fill={isPartSelected('eyes') ? '#ef4444' : '#64748b'}
                    className="hover:scale-125 transition-transform"
                  />
                </g>
              )}

              {/* Ears (Both views) */}
              <g
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openConfigModal(BODY_PARTS.find((p) => p.id === 'ears')!);
                }}
              >
                <path
                  d="M 77 45 C 72 45 72 56 77 56"
                  stroke={isPartSelected('ears') ? '#ef4444' : '#64748b'}
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 123 45 C 128 45 128 56 123 56"
                  stroke={isPartSelected('ears') ? '#ef4444' : '#64748b'}
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>

              {/* Throat / Neck (Front View) */}
              {currentView === 'front' && (
                <path
                  d="M 91 80 L 109 80 L 112 95 L 88 95 Z"
                  fill={
                    isPartSelected('throat')
                      ? getPartPainData('throat')?.severity === 'severe'
                        ? 'url(#selectedRed)'
                        : 'url(#selectedAmber)'
                      : '#94a3b8'
                  }
                  stroke={isPartSelected('throat') ? '#ef4444' : '#64748b'}
                  strokeWidth="1.5"
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'throat')!)}
                />
              )}

              {/* Torso: Chest (Front) vs Upper Back (Back) */}
              {currentView === 'front' ? (
                <path
                  d="M 72 98 C 65 100 60 110 65 140 L 135 140 C 140 110 135 100 128 98 C 118 95 82 95 72 98 Z"
                  fill={
                    isPartSelected('chest')
                      ? getPartPainData('chest')?.severity === 'severe'
                        ? 'url(#selectedRed)'
                        : 'url(#selectedAmber)'
                      : '#cbd5e1'
                  }
                  stroke={isPartSelected('chest') ? '#ef4444' : '#94a3b8'}
                  strokeWidth={isPartSelected('chest') ? '2.5' : '1.5'}
                  className="cursor-pointer hover:opacity-85 transition-all"
                  onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'chest')!)}
                />
              ) : (
                <path
                  d="M 72 98 C 65 100 60 110 65 145 L 135 145 C 140 110 135 100 128 98 C 118 95 82 95 72 98 Z"
                  fill={
                    isPartSelected('back')
                      ? getPartPainData('back')?.severity === 'severe'
                        ? 'url(#selectedRed)'
                        : 'url(#selectedAmber)'
                      : '#cbd5e1'
                  }
                  stroke={isPartSelected('back') ? '#ef4444' : '#94a3b8'}
                  strokeWidth={isPartSelected('back') ? '2.5' : '1.5'}
                  className="cursor-pointer hover:opacity-85 transition-all"
                  onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'back')!)}
                />
              )}

              {/* Torso: Stomach / Abdomen (Front) vs Lower Back (Back) */}
              {currentView === 'front' ? (
                <path
                  d="M 66 142 L 134 142 L 130 195 C 115 202 85 202 70 195 Z"
                  fill={
                    isPartSelected('stomach')
                      ? getPartPainData('stomach')?.severity === 'severe'
                        ? 'url(#selectedRed)'
                        : 'url(#selectedAmber)'
                      : '#cbd5e1'
                  }
                  stroke={isPartSelected('stomach') ? '#ef4444' : '#94a3b8'}
                  strokeWidth={isPartSelected('stomach') ? '2.5' : '1.5'}
                  className="cursor-pointer hover:opacity-85 transition-all"
                  onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'stomach')!)}
                />
              ) : (
                <path
                  d="M 66 145 L 134 145 L 130 198 C 115 205 85 205 70 198 Z"
                  fill={
                    isPartSelected('back')
                      ? getPartPainData('back')?.severity === 'severe'
                        ? 'url(#selectedRed)'
                        : 'url(#selectedAmber)'
                      : '#e2e8f0'
                  }
                  stroke={isPartSelected('back') ? '#ef4444' : '#94a3b8'}
                  strokeWidth={isPartSelected('back') ? '2.5' : '1.5'}
                  className="cursor-pointer hover:opacity-85 transition-all"
                  onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'back')!)}
                />
              )}

              {/* Arms (Left & Right) */}
              {/* Left Arm */}
              <path
                d="M 62 102 C 50 115 45 150 42 190 L 52 192 C 56 155 60 120 70 106 Z"
                fill={
                  isPartSelected('arms')
                    ? getPartPainData('arms')?.severity === 'severe'
                      ? 'url(#selectedRed)'
                      : 'url(#selectedAmber)'
                    : '#cbd5e1'
                }
                stroke={isPartSelected('arms') ? '#ef4444' : '#94a3b8'}
                strokeWidth={isPartSelected('arms') ? '2.5' : '1.5'}
                className="cursor-pointer hover:opacity-85"
                onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'arms')!)}
              />

              {/* Right Arm */}
              <path
                d="M 138 102 C 150 115 155 150 158 190 L 148 192 C 144 155 140 120 130 106 Z"
                fill={
                  isPartSelected('arms')
                    ? getPartPainData('arms')?.severity === 'severe'
                      ? 'url(#selectedRed)'
                      : 'url(#selectedAmber)'
                    : '#cbd5e1'
                }
                stroke={isPartSelected('arms') ? '#ef4444' : '#94a3b8'}
                strokeWidth={isPartSelected('arms') ? '2.5' : '1.5'}
                className="cursor-pointer hover:opacity-85"
                onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'arms')!)}
              />

              {/* Hands (Left & Right) */}
              <circle
                cx="40"
                cy="204"
                r="9"
                fill={
                  isPartSelected('hands')
                    ? getPartPainData('hands')?.severity === 'severe'
                      ? 'url(#selectedRed)'
                      : 'url(#selectedAmber)'
                    : '#94a3b8'
                }
                stroke={isPartSelected('hands') ? '#ef4444' : '#64748b'}
                strokeWidth={isPartSelected('hands') ? '2.5' : '1.5'}
                className="cursor-pointer hover:scale-110 transition-all"
                onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'hands')!)}
              />
              <circle
                cx="160"
                cy="204"
                r="9"
                fill={
                  isPartSelected('hands')
                    ? getPartPainData('hands')?.severity === 'severe'
                      ? 'url(#selectedRed)'
                      : 'url(#selectedAmber)'
                    : '#94a3b8'
                }
                stroke={isPartSelected('hands') ? '#ef4444' : '#64748b'}
                strokeWidth={isPartSelected('hands') ? '2.5' : '1.5'}
                className="cursor-pointer hover:scale-110 transition-all"
                onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'hands')!)}
              />

              {/* Legs (Left & Right) */}
              {/* Left Leg */}
              <path
                d="M 72 200 C 70 230 72 280 75 330 L 88 330 C 89 285 89 240 96 204 Z"
                fill={
                  isPartSelected('legs')
                    ? getPartPainData('legs')?.severity === 'severe'
                      ? 'url(#selectedRed)'
                      : 'url(#selectedAmber)'
                    : '#cbd5e1'
                }
                stroke={isPartSelected('legs') ? '#ef4444' : '#94a3b8'}
                strokeWidth={isPartSelected('legs') ? '2.5' : '1.5'}
                className="cursor-pointer hover:opacity-85"
                onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'legs')!)}
              />

              {/* Right Leg */}
              <path
                d="M 128 200 C 130 230 128 280 125 330 L 112 330 C 111 285 111 240 104 204 Z"
                fill={
                  isPartSelected('legs')
                    ? getPartPainData('legs')?.severity === 'severe'
                      ? 'url(#selectedRed)'
                      : 'url(#selectedAmber)'
                    : '#cbd5e1'
                }
                stroke={isPartSelected('legs') ? '#ef4444' : '#94a3b8'}
                strokeWidth={isPartSelected('legs') ? '2.5' : '1.5'}
                className="cursor-pointer hover:opacity-85"
                onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'legs')!)}
              />

              {/* Feet (Left & Right) */}
              <ellipse
                cx="78"
                cy="344"
                rx="10"
                ry="7"
                fill={
                  isPartSelected('feet')
                    ? getPartPainData('feet')?.severity === 'severe'
                      ? 'url(#selectedRed)'
                      : 'url(#selectedAmber)'
                    : '#94a3b8'
                }
                stroke={isPartSelected('feet') ? '#ef4444' : '#64748b'}
                strokeWidth={isPartSelected('feet') ? '2.5' : '1.5'}
                className="cursor-pointer hover:scale-110 transition-all"
                onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'feet')!)}
              />
              <ellipse
                cx="122"
                cy="344"
                rx="10"
                ry="7"
                fill={
                  isPartSelected('feet')
                    ? getPartPainData('feet')?.severity === 'severe'
                      ? 'url(#selectedRed)'
                      : 'url(#selectedAmber)'
                    : '#94a3b8'
                }
                stroke={isPartSelected('feet') ? '#ef4444' : '#64748b'}
                strokeWidth={isPartSelected('feet') ? '2.5' : '1.5'}
                className="cursor-pointer hover:scale-110 transition-all"
                onClick={() => openConfigModal(BODY_PARTS.find((p) => p.id === 'feet')!)}
              />

              {/* Visual Labels & Pinpoints for Selected Areas */}
              {selectedPains.map((p) => {
                let coords = { cx: 100, cy: 50 };
                if (p.id === 'head') coords = { cx: 100, cy: 50 };
                if (p.id === 'eyes') coords = { cx: 100, cy: 45 };
                if (p.id === 'ears') coords = { cx: 125, cy: 50 };
                if (p.id === 'throat') coords = { cx: 100, cy: 88 };
                if (p.id === 'chest') coords = { cx: 100, cy: 120 };
                if (p.id === 'stomach') coords = { cx: 100, cy: 170 };
                if (p.id === 'back') coords = { cx: 100, cy: 155 };
                if (p.id === 'arms') coords = { cx: 55, cy: 145 };
                if (p.id === 'hands') coords = { cx: 40, cy: 204 };
                if (p.id === 'legs') coords = { cx: 80, cy: 260 };
                if (p.id === 'feet') coords = { cx: 78, cy: 344 };

                return (
                  <g key={p.id} className="pointer-events-none">
                    <circle
                      cx={coords.cx}
                      cy={coords.cy}
                      r="12"
                      fill="none"
                      stroke={p.severity === 'severe' ? '#ef4444' : '#f59e0b'}
                      strokeWidth="2"
                      className="animate-ping opacity-60"
                    />
                    <circle
                      cx={coords.cx}
                      cy={coords.cy}
                      r="4"
                      fill={p.severity === 'severe' ? '#ef4444' : '#f59e0b'}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 text-center">
            💡 {language === 'te' ? 'చిత్రంపై లేదా కుడివైపు ఉన్న భాగాలపై నొక్కండి' : language === 'hi' ? 'चित्र या दाईं सूची पर क्लिक करें' : 'Click directly on body zones or the list to specify pain details'}
          </p>
        </div>

        {/* Right: Body Part Quick Selector Grid & Config */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {language === 'te'
                ? 'శరీర భాగాలు (Body Parts)'
                : language === 'hi'
                ? 'शारीरिक अंग (Body Parts)'
                : 'Body Parts Directory'}
            </span>
            <span className="text-xs text-sky-700 font-semibold">
              {selectedPains.length} {language === 'te' ? 'జోడించబడ్డాయి' : language === 'hi' ? 'चुने गए' : 'added'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BODY_PARTS.map((part) => {
              const isSelected = isPartSelected(part.id);
              const painData = getPartPainData(part.id);
              const partName =
                language === 'te'
                  ? part.nameTe
                  : language === 'hi'
                  ? part.nameHi
                  : part.nameEn;

              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => openConfigModal(part)}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all ${
                    isSelected
                      ? painData?.severity === 'severe'
                        ? 'bg-red-50/90 border-red-300 ring-2 ring-red-400 text-red-950'
                        : painData?.severity === 'moderate'
                        ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400 text-amber-950'
                        : 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-400 text-emerald-950'
                      : 'bg-slate-50 hover:bg-sky-50/60 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-lg">{part.icon}</span>
                    {isSelected && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                          painData?.severity === 'severe'
                            ? 'bg-red-600 text-white'
                            : painData?.severity === 'moderate'
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {painData?.severity}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs block leading-tight truncate">
                      {partName}
                    </span>
                    {isSelected && painData && (
                      <span className="text-[10px] text-slate-500 font-medium block truncate">
                        {painData.painType} • {painData.duration.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Pain Summary Chips */}
          {selectedPains.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                {language === 'te'
                  ? 'ఎంచుకున్న నొప్పులు (Selected Pain Locations):'
                  : language === 'hi'
                  ? 'चुने गए दर्द के स्थान:'
                  : 'Selected Pain Locations:'}
              </span>

              <div className="flex flex-wrap gap-2">
                {selectedPains.map((p) => {
                  const partMeta = BODY_PARTS.find((m) => m.id === p.id);
                  const name =
                    language === 'te'
                      ? p.partNameTe
                      : language === 'hi'
                      ? p.partNameHi
                      : p.partName;

                  return (
                    <div
                      key={p.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs ${
                        p.severity === 'severe'
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : p.severity === 'moderate'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}
                    >
                      <span>{partMeta?.icon || '📍'}</span>
                      <span>
                        {name} ({p.severity})
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemovePain(p.id)}
                        className="hover:bg-black/10 rounded-full p-0.5 text-slate-500 hover:text-slate-900"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Detail Modal: When Body Part Clicked */}
      {activePartForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-sky-50 rounded-2xl border border-sky-100">
                  {activePartForModal.icon}
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg sm:text-xl leading-tight">
                    {language === 'te'
                      ? activePartForModal.nameTe
                      : language === 'hi'
                      ? activePartForModal.nameHi
                      : activePartForModal.nameEn}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === 'te'
                      ? activePartForModal.descriptionTe
                      : language === 'hi'
                      ? activePartForModal.descriptionHi
                      : activePartForModal.descriptionEn}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePartForModal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pain Type Selection */}
            <div className="space-y-2">
              <label className="font-bold text-xs text-slate-700 block uppercase tracking-wider">
                1. {language === 'te' ? 'నొప్పి రకం (Describe Type of Pain)' : language === 'hi' ? 'दर्द का प्रकार (Type of Pain)' : 'Describe the Type of Pain'}:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAIN_TYPES.map((type) => {
                  const label =
                    language === 'te'
                      ? type.nameTe
                      : language === 'hi'
                      ? type.nameHi
                      : type.nameEn;

                  const isChecked = selectedPainType === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedPainType(type.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        isChecked
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <span className="block truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Selection */}
            <div className="space-y-2">
              <label className="font-bold text-xs text-slate-700 block uppercase tracking-wider">
                2. {language === 'te' ? 'నొప్పి తీవ్రత (Pain Severity)' : language === 'hi' ? 'दर्द की तीव्रता (Pain Severity)' : 'Select Severity'}:
              </label>

              <div className="grid grid-cols-3 gap-2">
                {SEVERITIES.map((sev) => {
                  const label =
                    language === 'te'
                      ? sev.nameTe
                      : language === 'hi'
                      ? sev.nameHi
                      : sev.nameEn;

                  const isChecked = selectedSeverity === sev.id;

                  return (
                    <button
                      key={sev.id}
                      type="button"
                      onClick={() => setSelectedSeverity(sev.id)}
                      className={`py-2.5 px-2 rounded-xl border text-center text-xs font-extrabold transition-all ${
                        isChecked
                          ? sev.bgActive + ' ' + sev.borderActive + ' shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <label className="font-bold text-xs text-slate-700 block uppercase tracking-wider">
                3. {language === 'te' ? 'ఎంత కాలం నుండి ఉంది? (Duration)' : language === 'hi' ? 'दर्द की अवधि (Duration)' : 'Pain Duration'}:
              </label>

              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map((dur) => {
                  const label =
                    language === 'te'
                      ? dur.nameTe
                      : language === 'hi'
                      ? dur.nameHi
                      : dur.nameEn;

                  const isChecked = selectedDuration === dur.id;

                  return (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() => setSelectedDuration(dur.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        isChecked
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-medium">
                {language === 'te' ? 'మరిన్ని వివరాలు (ఐచ్ఛికం)' : language === 'hi' ? 'अतिरिक्त विवरण (वैकल्पिक)' : 'Additional details (optional)'}:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  language === 'te'
                    ? 'ఉదా: తిన్న తర్వాత వస్తుంది, దగ్గినప్పుడు పెరుగుతుంది...'
                    : language === 'hi'
                    ? 'जैसे: खाने के बाद, खांसने पर बढ़ता है...'
                    : 'e.g., occurs after eating, worse when coughing...'
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              {isPartSelected(activePartForModal.id) ? (
                <button
                  type="button"
                  onClick={() => {
                    onRemovePain(activePartForModal.id);
                    setActivePartForModal(null);
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{language === 'te' ? 'తొలగించు' : language === 'hi' ? 'हटाएं' : 'Remove'}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePartForModal(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {language === 'te' ? 'రద్దు' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSavePain}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'te' ? 'నొప్పి నమోదు చేయి' : language === 'hi' ? 'जोड़ें' : 'Save Pain Details'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
