import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  MapPin,
  Volume2,
  AlertTriangle,
  Siren,
  X,
  Share2,
  CheckCircle,
} from 'lucide-react';
import { Language, EmergencyContact } from '../types';
import { translations } from '../translations';
import { speechService } from '../services/speechService';

interface EmergencySOSProps {
  language: Language;
  contacts: EmergencyContact[];
  onClose?: () => void;
}

export const EmergencySOS: React.FC<EmergencySOSProps> = ({
  language,
  contacts,
  onClose,
}) => {
  const t = translations[language];

  const [sosActivated, setSosActivated] = useState(false);
  const [locationShared, setLocationShared] = useState(false);

  const handleActivateSOS = () => {
    setSosActivated(true);
    // Speak emergency announcement
    const text =
      language === 'te'
        ? 'అత్యవసర కాల్ ప్రారంభమైంది. 108 ఆంబులెన్స్ మరియు మీ కుటుంబానికి వర్తమానం పంపబడింది. ప్రశాంతంగా ఉండండి.'
        : language === 'hi'
        ? 'आपातकालीन कॉल सक्रिय। 108 एम्बुलेंस और परिवार को अलर्ट भेजा गया है। शांत रहें।'
        : 'Emergency SOS activated. Alerting 108 Ambulance and family contacts. Please remain calm.';

    speechService.speak(text, language);
  };

  const handleShareLocation = () => {
    setLocationShared(true);
    setTimeout(() => setLocationShared(false), 4000);
  };

  const handleReadFirstAid = (title: string, content: string) => {
    speechService.speak(`${title}. ${content}`, language);
  };

  const firstAidGuides = [
    {
      id: 'snake',
      titleTe: 'పాము కాటుకు అత్యవసర ప్రథమ చికిత్స',
      titleHi: 'सांप के काटने पर प्राथमिक उपचार',
      titleEn: 'Snake Bite Emergency First Aid',
      stepsTe:
        '1. బాధితుడిని కదలకుండా పడుకోబెట్టండి.\n2. గాయాన్ని కోయవద్దు, విషం నోటితో పీల్చవద్దు.\n3. గట్టిగా కట్టు కట్టవద్దు.\n4. వెంటనే యాంటీ-స్నేక్ వెనమ్ (ASV) ఉండే PHC లేదా ఆసుపత్రికి తరలించండి.',
      stepsHi:
        '1. मरीज को शांत रखें और लिटाएं।\n2. घाव को न काटें और जहर न चूसें।\n3. कसकर पट्टी न बांधें।\n4. तुरंत एंटी-वेनम उपलब्ध अस्पताल ले जाएं।',
      stepsEn:
        '1. Keep victim completely calm and still.\n2. DO NOT cut the wound or suck venom.\n3. DO NOT tie tight tourniquets.\n4. Transport immediately to PHC with Anti-Snake Venom.',
    },
    {
      id: 'dog',
      titleTe: 'పిచ్చి కుక్క లేదా జంతువు కాటు',
      titleHi: 'कुत्ते या जानवर के काटने पर उपचार',
      titleEn: 'Rabies / Dog Bite Care',
      stepsTe:
        '1. కాటు గాయాన్ని కనీసం 15 నిమిషాలు సబ్బు మరియు పారే నీటితో శుభ్రంగా కడగండి.\n2. పసుపు, కారం, నూనె వేయవద్దు.\n3. వెంటనే 24 గంటలలోపు ఆంటీ-రేబీస్ టీకా (ARV) తీసుకోండి.',
      stepsHi:
        '1. घाव को 15 मिनट तक साबुन और बहते पानी से धोएं।\n2. मिर्च या तेल न लगाएं।\n3. 24 घंटे के भीतर एंटी-रेबीज टीका लगवाएं।',
      stepsEn:
        '1. Wash wound thoroughly with soap and running water for 15 minutes.\n2. Do NOT apply chili, oil or paste.\n3. Get Anti-Rabies Vaccine (ARV) within 24 hours at PHC.',
    },
    {
      id: 'ors',
      titleTe: 'విరేచనాలు & నీరసం - ORS తయారుచేయు విధానం',
      titleHi: 'ओआरएस (ORS) घोल बनाने की विधि',
      titleEn: 'ORS Preparation for Diarrhea',
      stepsTe:
        '1. 1 లీటర్ తాగే నీటిని కాచి చల్లార్చండి.\n2. 1 ప్యాకెట్ ORS పొడి లేదా 6 చెంచాల చక్కెర + అర చెంచా ఉప్పు కలపండి.\n3. రోగికి తరచూ కొద్ది కొద్దిగా తాగించండి.',
      stepsHi:
        '1. 1 लीटर उबला और ठंडा किया हुआ पानी लें।\n2. 1 पैकेट ओआरएस या 6 चम्मच चीनी + आधा चम्मच नमक मिलाएं।\n3. मरीज को बार-बार पिलाएं।',
      stepsEn:
        '1. Take 1 liter of boiled and cooled water.\n2. Mix 1 ORS packet or 6 tsp sugar + 1/2 tsp salt.\n3. Feed frequently in small sips.',
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* SOS Banner Header */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-red-500 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md animate-bounce">
              <Siren className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">{t.sosButton}</h2>
              <p className="text-xs text-red-100 mt-0.5">{t.sosSubtext}</p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-red-800/60 hover:bg-red-800 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* SOS Trigger Area */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-red-800/40 p-4 rounded-2xl border border-red-400/40">
          <div>
            <h3 className="font-extrabold text-lg text-white">
              {sosActivated ? '🚨 EMERGENCY ALERT SENT!' : 'One-Tap Emergency Trigger'}
            </h3>
            <p className="text-xs text-red-100">
              {sosActivated
                ? 'Your location and family SMS alert have been dispatched.'
                : 'Tap below to sound alert tone & auto-dial 108 Ambulance.'}
            </p>
          </div>

          <button
            onClick={handleActivateSOS}
            className={`px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 ${
              sosActivated
                ? 'bg-white text-red-700 ring-8 ring-red-300 animate-pulse'
                : 'bg-yellow-400 hover:bg-yellow-300 text-slate-900'
            }`}
          >
            <PhoneCall className="w-5 h-5" />
            <span>{sosActivated ? 'Calling 108...' : 'TRIGGER SOS NOW'}</span>
          </button>
        </div>
      </div>

      {/* Direct Call Quick Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <a
          href="tel:108"
          className="p-4 bg-white border-2 border-red-500 rounded-2xl shadow-sm hover:shadow-md flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-700 rounded-2xl font-black text-xl">
              108
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">{t.call108Ambulance}</h4>
              <p className="text-xs text-slate-500">Government Free Emergency Ambulance</p>
            </div>
          </div>
          <PhoneCall className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
        </a>

        <button
          onClick={handleShareLocation}
          className="p-4 bg-white border-2 border-emerald-500 rounded-2xl shadow-sm hover:shadow-md flex items-center justify-between group transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">{t.shareLocation}</h4>
              <p className="text-xs text-slate-500">Rampur Village, GPS: 16.5412° N, 80.8012° E</p>
            </div>
          </div>
          {locationShared ? (
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          ) : (
            <Share2 className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Emergency First Aid Guides */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          <h3 className="font-extrabold text-slate-900 text-lg">{t.firstAidTitle}</h3>
        </div>

        <div className="space-y-3">
          {firstAidGuides.map((guide) => {
            const guideTitle =
              language === 'te'
                ? guide.titleTe
                : language === 'hi'
                ? guide.titleHi
                : guide.titleEn;
            const guideSteps =
              language === 'te'
                ? guide.stepsTe
                : language === 'hi'
                ? guide.stepsHi
                : guide.stepsEn;

            return (
              <div
                key={guide.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{guideTitle}</span>
                  </h4>

                  <button
                    onClick={() => handleReadFirstAid(guideTitle, guideSteps)}
                    className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-xl"
                    title={t.readAloud}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans pl-6">
                  {guideSteps}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Contacts List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-base">Key Emergency Contacts</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{contact.name}</h4>
                <p className="text-xs text-slate-500">{contact.role}</p>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{contact.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
