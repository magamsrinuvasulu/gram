import { Language } from '../types';

export type DetectedScript = 'te' | 'hi' | 'en' | 'mixed';

export interface LanguageSegment {
  langKey: 'te' | 'hi' | 'en';
  label: string;
  flag: string;
  content: string;
}

/**
 * Parses multi-language AI response text into structured language segments (Telugu, Hindi, English)
 */
export function parseMultiLangSegments(text: string): LanguageSegment[] | null {
  if (!text || !text.trim()) return null;

  const matches: { key: 'te' | 'hi' | 'en'; index: number; length: number; label: string; flag: string }[] = [];

  const mTe = text.match(/(?:🇮🇳\s*)?(?:\*\*)?(?:తెలుగు|Telugu)(?:\s*\([^)]*\))?:?\s*(?:\*\*)?/i);
  if (mTe && mTe.index !== undefined) {
    matches.push({ key: 'te', index: mTe.index, length: mTe[0].length, label: 'తెలుగు (Telugu)', flag: '🇮🇳' });
  }

  const mHi = text.match(/(?:🇮🇳\s*)?(?:\*\*)?(?:హిందీ|हिन्दी|Hindi)(?:\s*\([^)]*\))?:?\s*(?:\*\*)?/i);
  if (mHi && mHi.index !== undefined) {
    matches.push({ key: 'hi', index: mHi.index, length: mHi[0].length, label: 'हिन्दी (Hindi)', flag: '🇮🇳' });
  }

  const mEn = text.match(/(?:🇬🇧\s*|🇺🇸\s*)?(?:\*\*)?English(?:\s*\([^)]*\))?:?\s*(?:\*\*)?/i);
  if (mEn && mEn.index !== undefined) {
    matches.push({ key: 'en', index: mEn.index, length: mEn[0].length, label: 'English', flag: '🇬🇧' });
  }

  matches.sort((a, b) => a.index - b.index);

  if (matches.length >= 2) {
    const segments: LanguageSegment[] = [];
    for (let i = 0; i < matches.length; i++) {
      const cur = matches[i];
      const startIndex = cur.index + cur.length;
      const endIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const rawContent = text.slice(startIndex, endIndex).trim();
      const cleanContent = rawContent.replace(/^[\s:*#_]+/, '').replace(/[\s:*#_]+$/, '').trim();
      if (cleanContent) {
        segments.push({
          langKey: cur.key,
          label: cur.label,
          flag: cur.flag,
          content: cleanContent,
        });
      }
    }
    if (segments.length >= 2) {
      return segments;
    }
  }

  return null;
}


/**
 * Detects the predominant language script from user text input
 */
export function detectLanguage(text: string): DetectedScript {
  if (!text || !text.trim()) return 'en';

  const teluguCount = (text.match(/[\u0C00-\u0C7F]/g) || []).length;
  const hindiCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const englishCount = (text.match(/[a-zA-Z]/g) || []).length;

  const total = teluguCount + hindiCount + englishCount;
  if (total === 0) return 'en';

  const teluguRatio = teluguCount / total;
  const hindiRatio = hindiCount / total;
  const englishRatio = englishCount / total;

  if (teluguRatio > 0.4) return 'te';
  if (hindiRatio > 0.4) return 'hi';
  if (englishRatio > 0.6) return 'en';

  return 'mixed';
}

/**
 * Normalizes and strips markdown formatting symbols (bold, asterisks, emojis) for TTS speech synthesis
 */
export function cleanForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/[*#_`~]/g, '')
    .replace(/🇮🇳|🇬🇧|🚨|🏥|💡|⚠️|🔗|💊|👨‍⚕️|👩‍⚕️/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Prepares the translation wrapper meta prompt for the AI assistant request
 */
export function buildTranslationWrapperPrompt(
  userQuery: string,
  targetInterfaceLanguage: Language,
  aiLanguageMode: 'single' | 'multi' | string = 'single'
): {
  detectedScript: DetectedScript;
  enhancedMessage: string;
} {
  const detected = detectLanguage(userQuery);

  const langLabels: Record<Language, string> = {
    te: 'Telugu (తెలుగు)',
    hi: 'Hindi (हिन्दी)',
    en: 'English',
    multi: 'Multiple Languages (Telugu, Hindi & English)',
  };

  const targetName = langLabels[targetInterfaceLanguage] || 'Telugu';

  let enhancedMessage = userQuery;

  const isMulti = targetInterfaceLanguage === 'multi' || aiLanguageMode === 'multi';

  if (!isMulti) {
    if (detected !== targetInterfaceLanguage) {
      enhancedMessage = `[User input detected in ${detected.toUpperCase()} script. FORCED OUTPUT LANGUAGE REQUIREMENT: You MUST respond completely in ${targetName}]: ${userQuery}`;
    }
  } else {
    enhancedMessage = `[MULTILINGUAL MODE ACTIVE: Provide response in Telugu, Hindi, and English simultaneously with clear language headings]: ${userQuery}`;
  }

  return {
    detectedScript: detected,
    enhancedMessage,
  };
}

/**
 * Extracts or prepares spoken text for a specific language from a potentially multi-language or formatted response
 */
export function extractSpokenTextForLanguage(text: string, targetLang: 'te' | 'hi' | 'en'): string {
  if (!text) return '';

  const segments = parseMultiLangSegments(text);
  if (segments && segments.length > 0) {
    const matched = segments.find((s) => s.langKey === targetLang);
    if (matched && matched.content.trim()) {
      return cleanForSpeech(matched.content);
    }
  }

  // Check for inline headings like "**Telugu:**" or "తెలుగు:"
  if (targetLang === 'te') {
    const teMatch = text.match(/(?:తెలుగు|Telugu)[^:\n]*:([\s\S]*?)(?=(?:హిందీ|Hindi|English|\n\n\*\*|$))/i);
    if (teMatch && teMatch[1]?.trim()) {
      return cleanForSpeech(teMatch[1]);
    }
  } else if (targetLang === 'hi') {
    const hiMatch = text.match(/(?:हिन्दी|Hindi)[^:\n]*:([\s\S]*?)(?=(?:తెలుగు|Telugu|English|\n\n\*\*|$))/i);
    if (hiMatch && hiMatch[1]?.trim()) {
      return cleanForSpeech(hiMatch[1]);
    }
  } else if (targetLang === 'en') {
    const enMatch = text.match(/(?:English)[^:\n]*:([\s\S]*?)(?=(?:తెలుగు|Telugu|हिन्दी|Hindi|\n\n\*\*|$))/i);
    if (enMatch && enMatch[1]?.trim()) {
      return cleanForSpeech(enMatch[1]);
    }
  }

  return cleanForSpeech(text);
}
