/**
 * Telugu Phonetic Normalizer & Locale-Aware Speech Enhancer
 * Optimized for rural Andhra Pradesh & Telangana healthcare dialect comprehension.
 *
 * Expands clinical abbreviations, converts English loanwords into natural Telugu script,
 * handles numbers & doses, and structures sentence pauses for smooth prosody.
 */

// Mapping of medical and everyday loanwords to natural spoken Telugu phonetics
const TELUGU_PHONETIC_REPLACEMENTS: [RegExp, string][] = [
  // Clinical Acronyms & Health Systems
  [/\b108\b/g, 'నూరు ఎనిమిది'],
  [/\b104\b/g, 'నూరు నాలుగు'],
  [/\bPHC\b/gi, 'పీహెచ్‌సీ ప్రాథమిక ఆరోగ్య కేంద్రం'],
  [/\bCHC\b/gi, 'సామాజిక ఆరోగ్య కేంద్రం'],
  [/\bASHA\b/gi, 'ఆశా కార్యకర్త'],
  [/\bANM\b/gi, 'ఏఎన్‌ఎం ఆరోగ్య కార్యకర్త'],
  [/\bBP\b/gi, 'బీపీ రక్తపోటు'],
  [/\bB\.P\.\b/gi, 'బీపీ రక్తపోటు'],
  [/\bSugar\b/gi, 'షుగర్ మధుమేహం'],
  [/\bORS\b/gi, 'ఓఆర్ఎస్ ద్రవం'],
  [/\bO\.R\.S\.\b/gi, 'ఓఆర్ఎస్ ద్రవం'],
  [/\bANC\b/gi, 'గర్భిణీ ఆరోగ్య పరీక్ష'],
  [/\bOPD\b/gi, 'ఓపీడీ రోగుల విభాగం'],
  [/\bICU\b/gi, 'ఐసీయూ అత్యవసర విభాగం'],
  [/\bECG\b/gi, 'ఈసీజీ గుండె పరీక్ష'],
  [/\bIV\b/gi, 'సలైన్ బాటిల్'],
  [/\bI\.V\.\b/gi, 'సలైన్'],
  [/\bCOVID\b/gi, 'కరోనా వైరస్'],
  [/\bCovid-19\b/gi, 'కరోనా వైరస్'],

  // Dosages and Units
  [/\bmg\b/gi, 'మిల్లీగ్రాములు'],
  [/\bml\b/gi, 'మిల్లీలీటర్లు'],
  [/\bgm\b/gi, 'గ్రాములు'],
  [/\bkg\b/gi, 'కిలోలు'],
  [/\bkm\b/gi, 'కిలోమీటర్లు'],
  [/\bOD\b/gi, 'రోజుకు ఒకసారి'],
  [/\bBD\b/gi, 'రోజుకు రెండుసార్లు'],
  [/\bTDS\b/gi, 'రోజుకు మూడుసార్లు'],
  [/\bSOS\b/gi, 'అవసరమైనప్పుడు మాత్రమే'],

  // Common Clinical Words & Medications
  [/\bDoctor\b/gi, 'డాక్టర్ గారు'],
  [/\bDoctors\b/gi, 'వైద్యులు'],
  [/\bHospital\b/gi, 'ఆసుపత్రి'],
  [/\bHospitals\b/gi, 'ఆసుపత్రులు'],
  [/\bClinic\b/gi, 'క్లినిక్'],
  [/\bNurse\b/gi, 'నర్సు గారు'],
  [/\bAmbulance\b/gi, 'అంబులెన్స్ వాహనం'],
  [/\bTablet\b/gi, 'మాత్ర'],
  [/\bTablets\b/gi, 'మాత్రలు'],
  [/\bCapsule\b/gi, 'క్యాప్సూల్ మాత్ర'],
  [/\bCapsules\b/gi, 'క్యాప్సూల్ మాత్రలు'],
  [/\bInjection\b/gi, 'సూది ఇంజక్షన్'],
  [/\bInjections\b/gi, 'ఇంజక్షన్లు'],
  [/\bSyrup\b/gi, 'సిరప్ మందు'],
  [/\bParacetamol\b/gi, 'పారాసిటమాల్ మాత్ర'],
  [/\bInsulin\b/gi, 'ఇన్సులిన్'],
  [/\bAntibiotic\b/gi, 'యాంటీబయాటిక్ మందు'],
  [/\bVaccine\b/gi, 'టీకా వ్యాక్సిన్'],
  [/\bVaccination\b/gi, 'టీకా వేయడం'],
  [/\bBlood test\b/gi, 'రక్త పరీక్ష'],
  [/\bUrine test\b/gi, 'మూత్ర పరీక్ష'],
  [/\bX-ray\b/gi, 'ఎక్స్-రే పరీక్ష'],
  [/\bScan\b/gi, 'స్కాన్ పరీక్ష'],
  [/\bCheckup\b/gi, 'ఆరోగ్య తనిఖీ'],
  [/\bEmergency\b/gi, 'అత్యవసరం'],
  [/\bFirst aid\b/gi, 'ప్రథమ చికిత్స'],
  [/\bDiet\b/gi, 'ఆహార నియమాలు'],
  [/\bRest\b/gi, 'తగినంత విశ్రాంతి'],

  // Common Symptoms in Mixed Script
  [/\bFever\b/gi, 'జ్వరం'],
  [/\bCold\b/gi, 'జలుబు'],
  [/\bCough\b/gi, 'దగ్గు'],
  [/\bHeadache\b/gi, 'తలనొప్పి'],
  [/\bStomach pain\b/gi, 'కడుపునొప్పి'],
  [/\bChest pain\b/gi, 'ఛాతీ నొప్పి'],
  [/\bVomiting\b/gi, 'వాంతులు'],
  [/\bVomit\b/gi, 'వాంతి'],
  [/\bLoose motions\b/gi, 'విరేచనాలు'],
  [/\bDiarrhea\b/gi, 'విరేచనాలు'],
  [/\bWeakness\b/gi, 'నీరసం'],
  [/\bInfection\b/gi, 'ఇన్ఫెక్షన్ సంక్రమణ'],
  [/\bAllergy\b/gi, 'ఎలర్జీ'],
  [/\bSwelling\b/gi, 'వాపు'],
  [/\bBleeding\b/gi, 'రక్తస్రావం'],
  [/\bBite\b/gi, 'కాటు'],
  [/\bSnake\b/gi, 'పాము'],
  [/\bDog\b/gi, 'కుక్క'],

  // Numbers combined with units & timings
  [/1\s*-\s*2\s*రోజులు/g, 'ఒకటి నుండి రెండు రోజులు'],
  [/2\s*-\s*3\s*రోజులు/g, 'రెండు నుండి మూడు రోజులు'],
  [/3\s*-\s*4\s*రోజులు/g, 'మూడు నుండి నాలుగు రోజులు'],
  [/1\s*సారి/g, 'ఒక సారి'],
  [/2\s*సార్లు/g, 'రెండు సార్లు'],
  [/3\s*సార్లు/g, 'మూడు సార్లు'],
  [/4\s*సార్లు/g, 'నాలుగు సార్లు'],
  [/1\s*మాత్ర/g, 'ఒక మాత్ర'],
  [/2\s*మాత్రలు/g, 'రెండు మాత్రలు'],
  [/1\s*లీటర్/g, 'ఒక లీటర్'],
  [/2\s*లీటర్లు/g, 'రెండు లీటర్లు'],
];

/**
 * Normalizes and enriches Telugu text for human-like, clear pronunciation
 * by Text-to-Speech engines.
 */
export function normalizeTeluguForSpeech(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';

  let text = rawText;

  // 1. Remove Markdown and noisy formatting symbols that TTS engines read awkwardly
  text = text
    .replace(/[*_~`#]/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/http[s]?:\/\/\S+/g, '')
    .replace(/🇮🇳|🇬🇧|🚨|🏥|💡|⚠️|🔗|💊|👨‍⚕️|👩‍⚕️|🩺|📊|📋|❤️/g, '');

  // 2. Normalize bullet points & numbered lists to natural spoken pauses
  text = text
    .replace(/^\s*[-*•]\s+/gm, '. ')
    .replace(/^\s*\d+\.\s+/gm, '. ')
    .replace(/;\s*/g, '. ')
    .replace(/:/g, '. ');

  // 3. Apply Telugu phonetic & medical loanword transformations
  for (const [pattern, replacement] of TELUGU_PHONETIC_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  // 4. Ensure clear sentence break cadence with comma & period spacing
  text = text
    .replace(/\s*([.,?!])\s*/g, '$1 ')
    .replace(/\s+/g, ' ')
    .replace(/\.{2,}/g, '.')
    .trim();

  return text;
}

export type TeluguVoicePersona = 'sumitra' | 'srinivas' | 'gayatri';

export interface TeluguVoiceConfig {
  persona: TeluguVoicePersona;
  displayNameTe: string;
  displayNameEn: string;
  roleDescription: string;
  geminiVoice: string; // Prebuilt voice on Gemini TTS: 'Kore' | 'Puck' | 'Aoede'
  rateMultiplier: number;
  pitchMultiplier: number;
}

export const TELUGU_VOICE_CONFIGS: Record<TeluguVoicePersona, TeluguVoiceConfig> = {
  sumitra: {
    persona: 'sumitra',
    displayNameTe: 'సుమిత్ర (ఆశా వర్కర్ శైలి)',
    displayNameEn: 'Sumitra (Warm Health Guide)',
    roleDescription: 'దయతో కూడిన గ్రామీణ మహిళా వాయిస్ - తల్లులు, పెద్దలకు అనుకూలం',
    geminiVoice: 'Kore',
    rateMultiplier: 0.88, // Slightly relaxed rate for clear Telugu syllable enunciation
    pitchMultiplier: 1.02,
  },
  srinivas: {
    persona: 'srinivas',
    displayNameTe: 'శ్రీనివాస్ (గంభీరమైన స్వరం)',
    displayNameEn: 'Srinivas (Calm Voice)',
    roleDescription: 'స్పష్టమైన ఆరోగ్య సమాధానం - గంభీరమైన & భరోసా ఇచ్చే స్వరం',
    geminiVoice: 'Puck',
    rateMultiplier: 0.9,
    pitchMultiplier: 0.98,
  },
  gayatri: {
    persona: 'gayatri',
    displayNameTe: 'గాయత్రి (స్పష్టమైన శైలి)',
    displayNameEn: 'Gayatri (Melodic Clarity)',
    roleDescription: 'మధురమైన ఉచ్ఛారణ - ఆరోగ్య పాఠాలు & అత్యవసర సూచనలకు అనుకూలం',
    geminiVoice: 'Aoede',
    rateMultiplier: 0.86,
    pitchMultiplier: 1.05,
  },
};
