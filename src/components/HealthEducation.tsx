import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Bug,
  Search,
} from 'lucide-react';
import { Language, HealthArticle } from '../types';
import { translations } from '../translations';
import { defaultHealthArticles } from '../services/storageService';
import { speechService } from '../services/speechService';
import { DiseaseKnowledgeBase } from './DiseaseKnowledgeBase';

interface HealthEducationProps {
  language: Language;
  onOpenVoiceAssistant?: () => void;
}

export const HealthEducation: React.FC<HealthEducationProps> = ({ language, onOpenVoiceAssistant }) => {
  const t = translations[language];

  const [activeTabSection, setActiveTabSection] = useState<'knowledge_base' | 'articles'>('knowledge_base');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const articles = defaultHealthArticles.filter((art) => {
    const matchesCategory = activeCategory === 'all' || art.category === activeCategory;
    const titleStr = (art.titleTe + ' ' + art.titleHi + ' ' + art.titleEn).toLowerCase();
    const matchesSearch = !searchQuery || titleStr.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleReadAloud = (art: HealthArticle) => {
    let title = art.titleEn;
    let content = art.contentEn;

    if (language === 'te') {
      title = art.titleTe;
      content = art.contentTe;
    } else if (language === 'hi') {
      title = art.titleHi;
      content = art.contentHi;
    } else if (language === 'multi') {
      title = `${art.titleTe} | ${art.titleHi} | ${art.titleEn}`;
      content = `తెలుగు: ${art.contentTe}. हिन्दी: ${art.contentHi}. English: ${art.contentEn}.`;
    }

    speechService.speak(`${title}. ${content}`, language);
  };

  const diseaseGuideList = [
    {
      diseaseTe: 'జ్వరం (Fever)',
      diseaseHi: 'बुखार (Fever)',
      diseaseEn: 'Fever',
      relatedTe: 'డెంగ్యూ, మలేరియా, టైఫాయిడ్, వైరల్ జ్వరం, చికెన్‌గున్యా',
      relatedHi: 'डेंगू, मलेरिया, टाइफाइड, वायरल बुखार, चिकनगुनिया',
      relatedEn: 'Dengue, Malaria, Typhoid, Viral Flu, Chikungunya',
      symptomsTe: 'శరీర ఉష్ణోగ్రత పెరుగుట, చలి, ఒళ్ళు నొప్పులు, తలనొప్పి',
      symptomsHi: 'तेज बुखार, ठंड लगना, बदन दर्द, सिरदर्द',
      symptomsEn: 'High body temperature, chills, joint body pain, headache',
      careTe: 'కాచి చల్లార్చిన నీరు తాగండి. తడి గుడ్డ అద్దండి. 2 రోజుల కంటే ఎక్కువ జ్వరం ఉంటే PHC లో రక్తపరీక్ష చేయించుకోండి.',
      careHi: 'उबला पानी पिएं। ठंडी पट्टी रखें। 2 दिन से ज्यादा बुखार हो तो पीएचसी में खून जांच कराएं।',
      careEn: 'Drink boiled cooled water. Apply cold sponge. Get free blood tests at PHC if fever lasts over 2 days.',
    },
    {
      diseaseTe: 'మధుమేహం / షుగర్ (Diabetes)',
      diseaseHi: 'मधुमेह / शुगर (Diabetes)',
      diseaseEn: 'Diabetes (High Blood Sugar)',
      relatedTe: 'బిపి (రక్తపోటు), గుండె జబ్బులు, కిడ్నీ సమస్యలు, కంటి చూపు మందగించడం',
      relatedHi: 'हाई बीपी, हृदय रोग, गुर्दे की बीमारी, आंखों की कमजोरी',
      relatedEn: 'Hypertension (High BP), Heart Disease, Kidney Disease, Diabetic Retinopathy',
      symptomsTe: 'అధిక దాహం, తరచూ మూత్రవిసర్జన, నీరసం, గాయాలు ఆలస్యంగా మానడం',
      symptomsHi: 'बार-बार पेशाब आना, अत्यधिक प्यास, थकान, घाव देर से भरना',
      symptomsEn: 'Frequent urination, excessive thirst, extreme fatigue, slow healing wounds',
      careTe: 'క్రమం తప్పకుండా షుగర్ తనిఖీ చేయించుకోండి. రోజువారీ నడక, తియ్యని పదార్థాలు తక్కువ తినండి.',
      careHi: 'नियमित शुगर जांच कराएं। मीठा कम खाएं और रोजाना टहलें।',
      careEn: 'Monitor blood sugar regularly. Limit sweets and walk daily.',
    },
    {
      diseaseTe: 'అధిక రక్తపోటు / బిపి (Hypertension / High BP)',
      diseaseHi: 'उच्च रक्तचाप / बीपी (Hypertension)',
      diseaseEn: 'High Blood Pressure (Hypertension)',
      relatedTe: 'పక్షవాతం (Stroke), గుండెపోటు (Heart Attack), కిడ్నీ విఫలం, మధుమేహం',
      relatedHi: 'लकवा (Stroke), दिल का दौरा (Heart Attack), किडनी खराबी, शुगर',
      relatedEn: 'Stroke, Heart Attack, Kidney Failure, Diabetes',
      symptomsTe: 'తలతిరగడం, తలనొప్పి, గుండె దడ, కళ్ళు తిరగడం',
      symptomsHi: 'चक्कर आना, सिरदर्द, घबराहट, धुंधला दिखना',
      symptomsEn: 'Dizziness, headache, chest tightness, blurred vision',
      careTe: 'ఆహారంలో ఉప్పు తగ్గించండి. డాక్టర్ సూచించిన బిపి మాత్రలను రోజూ వేసుకోండి.',
      careHi: 'भोजन में नमक घटाएं। डॉक्टर की बीपी दवा रोज लें।',
      careEn: 'Reduce salt intake. Take prescribed BP tablets daily without fail.',
    },
    {
      diseaseTe: 'విరేచనాలు & నీరసం (Diarrhea & Dehydration)',
      diseaseHi: 'दस्त और उल्टी (Diarrhea)',
      diseaseEn: 'Diarrhea & Gastroenteritis',
      relatedTe: 'తీవ్రమైన డిహైడ్రేషన్ (నీరు తగ్గడం), కలరా, ఫుడ్ పాయిజనింగ్',
      relatedHi: 'गंभीर निर्जलीकरण (पानी की कमी), हैजा, फूड प्वाइजनिंग',
      relatedEn: 'Severe Dehydration, Cholera, Food Poisoning',
      symptomsTe: 'పల్చటి విరేచనాలు, నోరు ఎండిపోవుట, విపరీతమైన నీరసం, కండరాల నొప్పులు',
      symptomsHi: 'पतले दस्त, मुंह सूखना, अत्यधिक थकान, ऐंठन',
      symptomsEn: 'Loose watery stools, dry mouth, extreme tiredness, cramps',
      careTe: 'వెంటనే ఓఆర్ఎస్ (ORS) ద్రావణం తాగించండి. కొబ్బరి నీళ్ళు, మజ్జిగ ఇవ్వండి.',
      careHi: 'तुरंत ओआरएस घोल, नारियल पानी या छाछ दें।',
      careEn: 'Give ORS solution, coconut water, or buttermilk immediately.',
    },
    {
      diseaseTe: 'రక్తహీనత (Anemia - Low Hemoglobin)',
      diseaseHi: 'एनीमिया - खून की कमी (Anemia)',
      diseaseEn: 'Anemia (Low Hemoglobin)',
      relatedTe: 'పోషకాహార లోపం, గర్భిణీలలో బలహీనత, కడుపులో పురుగులు, అలసట',
      relatedHi: 'कुपोषण, गर्भावस्था में कमजोरी, पेट के कीड़े, अत्यधिक थकान',
      relatedEn: 'Malnutrition, Maternal Weakness, Worm Infection, Chronic Fatigue',
      symptomsTe: 'తెల్లబారిన చర్మం, తలతిరగడం, ఆయాసం, గోళ్ళు తెల్లగా ఉండుట',
      symptomsHi: 'त्वचा का पीला/सफेद होना, चक्कर, सांस फूलना',
      symptomsEn: 'Pale skin, dizziness, shortness of breath, weakness',
      careTe: 'తోటకూర, పాలు, గుడ్లు, రాగి జావ, ఐరన్ మాత్రలు (IFA) రోజూ వాడండి.',
      careHi: 'हरी पत्तेदार सब्जियां, गुड़, रागी और आयरन गोलियां लें।',
      careEn: 'Eat leafy greens, jaggery, ragi and take Iron-Folic acid tablets.',
    },
    {
      diseaseTe: 'దీర్ఘకాలిక దగ్గు & ఆయాసం (Cough & Breathing Issues)',
      diseaseHi: 'खांसी और सांस फूलना (Cough & Asthma)',
      diseaseEn: 'Chronic Cough, Asthma & TB',
      relatedTe: 'క్షయ వ్యాధి (TB), న్యుమోనియా, ఆస్తమా (ఉబ్బసం), బ్రోన్కైటిస్',
      relatedHi: 'टीबी (तपेदिक), निमोनिया, दमा (Asthma), ब्रोंकाइटिस',
      relatedEn: 'Tuberculosis (TB), Pneumonia, Asthma, Bronchitis',
      symptomsTe: '2 వారాలకు పైగా దగ్గు, సాయంత్రం జ్వరం, బరువు తగ్గడం, ఆయాసం',
      symptomsHi: '2 हफ्ते से अधिक खांसी, शाम को बुखार, वजन घटना, सांस फूलना',
      symptomsEn: 'Coughing over 2 weeks, evening fever, weight loss, breathlessness',
      careTe: '2 వారాల దగ్గు ఉంటే ఉచిత TB క్షయ పరీక్ష కోసం PHC ని సంప్రదించండి.',
      careHi: '2 सप्ताह से ज्यादा खांसी पर नि:शुल्क टीबी जांच पीएचसी में कराएं।',
      careEn: 'Visit local PHC for free TB testing if cough lasts over 2 weeks.',
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Top Section Nav Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setActiveTabSection('knowledge_base')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTabSection === 'knowledge_base'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>
            {language === 'te'
              ? 'వ్యాధుల విజ్ఞాన వేదిక (12 అంశాలు)'
              : language === 'hi'
              ? 'बीमारी ज्ञान कोष (12 बिंदु)'
              : 'Disease Knowledge Base'}
          </span>
        </button>

        <button
          onClick={() => setActiveTabSection('articles')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTabSection === 'articles'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>
            {language === 'te'
              ? 'ఆడియో హెల్త్ గైడ్స్'
              : language === 'hi'
              ? 'ऑडियो हेल्थ गाइड्स'
              : 'Audio Health Guides'}
          </span>
        </button>
      </div>

      {activeTabSection === 'knowledge_base' ? (
        <DiseaseKnowledgeBase language={language} onOpenVoiceAssistant={onOpenVoiceAssistant} />
      ) : (
        <>
          {/* Title Header */}
          <div className="bg-gradient-to-r from-indigo-800 to-emerald-800 text-white p-5 rounded-3xl shadow-lg border border-indigo-600">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl">
                <BookOpen className="w-7 h-7 text-indigo-200" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t.navEducation}</h2>
                <p className="text-xs text-indigo-100/90 mt-0.5">
                  Audio health guides in Telugu, Hindi & English for villagers
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-indigo-200 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topic (Fever, Snake bite, ORS, Pregnancy)..."
                  className="w-full bg-white/15 text-white placeholder-indigo-100/70 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {['all', 'emergency', 'maternal', 'disease', 'hygiene'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                    activeCategory === cat
                      ? 'bg-white text-indigo-950 shadow-xs'
                      : 'bg-white/10 text-indigo-100 hover:bg-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

      {/* Articles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((art) => {
          return (
            <div
              key={art.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 hover:border-indigo-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {art.category}
                  </span>

                  <button
                    onClick={() => handleReadAloud(art)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl flex items-center gap-1.5 text-xs font-bold"
                    title={t.readAloud}
                  >
                    <Volume2 className="w-4 h-4 text-emerald-700" />
                    <span>{t.readAloud}</span>
                  </button>
                </div>

                {language === 'multi' ? (
                  <div className="space-y-2 pt-1">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">🇮🇳 {art.titleTe}</h3>
                      <p className="text-xs text-slate-700 mt-0.5">{art.contentTe}</p>
                    </div>
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">🇮🇳 {art.titleHi}</h3>
                      <p className="text-xs text-slate-700 mt-0.5">{art.contentHi}</p>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">🇬🇧 {art.titleEn}</h3>
                      <p className="text-xs text-slate-700 mt-0.5">{art.contentEn}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {language === 'te' ? art.titleTe : language === 'hi' ? art.titleHi : art.titleEn}
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans pt-1">
                      {language === 'te' ? art.contentTe : language === 'hi' ? art.contentHi : art.contentEn}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disease & Related Conditions Guide */}
      <div className="mt-8 bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
            <Bug className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold">
              {language === 'multi'
                ? 'వ్యాధులు & సంబంధిత వ్యాధుల మార్గదర్శకాలు / बीमारियों और संबंधित रोगों की जानकारी / Disease & Related Conditions Directory'
                : language === 'te'
                ? 'వ్యాధులు & సంబంధిత వ్యాధుల మార్గదర్శకాలు'
                : language === 'hi'
                ? 'बीमारियों और संबंधित रोगों की जानकारी'
                : 'Diseases & Related Conditions Directory'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Multilingual guidance on disease links, symptoms & PHC care
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diseaseGuideList.map((item, index) => (
            <div
              key={index}
              className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-2 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <h4 className="font-extrabold text-emerald-400 text-sm">
                  {language === 'multi'
                    ? `${item.diseaseTe} / ${item.diseaseHi} / ${item.diseaseEn}`
                    : language === 'te'
                    ? item.diseaseTe
                    : language === 'hi'
                    ? item.diseaseHi
                    : item.diseaseEn}
                </h4>
                <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                  PHC Guide
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-amber-300">
                  🔗 {language === 'te' ? 'సంబంధిత వ్యాధులు:' : language === 'hi' ? 'संबंधित बीमारियां:' : 'Related Diseases:'}
                </p>
                <p className="text-xs text-slate-200 mt-0.5">
                  {language === 'multi'
                    ? `${item.relatedTe} | ${item.relatedHi} | ${item.relatedEn}`
                    : language === 'te'
                    ? item.relatedTe
                    : language === 'hi'
                    ? item.relatedHi
                    : item.relatedEn}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-sky-300">
                  ⚠️ {language === 'te' ? 'లక్షణాలు:' : language === 'hi' ? 'लक्षण:' : 'Key Symptoms:'}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {language === 'multi'
                    ? `${item.symptomsTe} | ${item.symptomsHi} | ${item.symptomsEn}`
                    : language === 'te'
                    ? item.symptomsTe
                    : language === 'hi'
                    ? item.symptomsHi
                    : item.symptomsEn}
                </p>
              </div>

              <div className="pt-1 border-t border-slate-700/60">
                <p className="text-xs font-bold text-emerald-300">
                  💡 {language === 'te' ? 'జాగ్రత్తలు & సలహాలు:' : language === 'hi' ? 'देखभाल व सलाह:' : 'Care & Prevention:'}
                </p>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {language === 'multi'
                    ? `🇮🇳 ${item.careTe}\n🇮🇳 ${item.careHi}\n🇬🇧 ${item.careEn}`
                    : language === 'te'
                    ? item.careTe
                    : language === 'hi'
                    ? item.careHi
                    : item.careEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
