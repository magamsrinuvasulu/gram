import { Language } from '../types';
import {
  normalizeTeluguForSpeech,
  TeluguVoicePersona,
  TELUGU_VOICE_CONFIGS,
} from './teluguPhonetics';

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export type AudioToneType =
  | 'record_start'
  | 'record_end'
  | 'message_sent'
  | 'message_received'
  | 'alert_chime'
  | 'tap';

class SpeechService {
  private recognition: any = null;
  private synth: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private audioCtx: AudioContext | null = null;
  private progressInterval: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private teluguPersona: TeluguVoicePersona = 'sumitra';
  private teluguSpeechRate: number = 0.88; // 0.88x provides crystal-clear rural Telugu articulation

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
          window.speechSynthesis.onvoiceschanged = () => {
            this.loadVoices();
          };
        }
      }

      // Load saved Telugu persona preference
      try {
        const savedPersona = localStorage.getItem('gram_health_telugu_persona') as TeluguVoicePersona;
        if (savedPersona && TELUGU_VOICE_CONFIGS[savedPersona]) {
          this.teluguPersona = savedPersona;
        }
        const savedRate = localStorage.getItem('gram_health_telugu_rate');
        if (savedRate) {
          const parsed = parseFloat(savedRate);
          if (!isNaN(parsed) && parsed >= 0.7 && parsed <= 1.4) {
            this.teluguSpeechRate = parsed;
          }
        }
      } catch (e) {
        // Local storage inaccessible
      }
    }
  }

  public getTeluguPersona(): TeluguVoicePersona {
    return this.teluguPersona;
  }

  public setTeluguPersona(persona: TeluguVoicePersona) {
    if (TELUGU_VOICE_CONFIGS[persona]) {
      this.teluguPersona = persona;
      try {
        localStorage.setItem('gram_health_telugu_persona', persona);
      } catch (e) {
        // Ignore
      }
    }
  }

  public getTeluguSpeechRate(): number {
    return this.teluguSpeechRate;
  }

  public setTeluguSpeechRate(rate: number) {
    this.teluguSpeechRate = Math.max(0.75, Math.min(1.3, rate));
    try {
      localStorage.setItem('gram_health_telugu_rate', String(this.teluguSpeechRate));
    } catch (e) {
      // Ignore
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    try {
      this.availableVoices = this.synth.getVoices();
    } catch (e) {
      console.warn('Could not load speech voices:', e);
    }
  }

  public isSpeechSupported(): boolean {
    return !!this.recognition;
  }

  public isSynthesizerSupported(): boolean {
    return !!this.synth;
  }

  /**
   * Check if browser has a native Telugu TTS voice
   */
  public hasNativeTeluguVoice(): boolean {
    if (this.availableVoices.length === 0) {
      this.loadVoices();
    }
    return this.availableVoices.some(
      (v) =>
        v.lang.toLowerCase().includes('te') ||
        v.name.toLowerCase().includes('telugu') ||
        v.name.includes('తెలుగు')
    );
  }

  /**
   * Initializes or gets the Web Audio context safely
   */
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays functional auditory UI tones
   */
  public playAudioTone(tone: AudioToneType) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (tone === 'record_start') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (tone === 'record_end') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (tone === 'message_sent') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.18);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (tone === 'message_received') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now);
        osc2.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.12);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.3);
      } else if (tone === 'alert_chime') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  /**
   * Start listening for voice input
   */
  public startListening(
    language: Language,
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    const langMap: Record<Language, string> = {
      te: 'te-IN',
      hi: 'hi-IN',
      en: 'en-IN',
      multi: 'te-IN',
    };

    this.recognition.lang = langMap[language] || 'te-IN';

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResult({
        transcript: finalTranscript || interimTranscript,
        isFinal: !!finalTranscript,
      });
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.isListening = true;
      this.recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      this.isListening = false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Speech recognition stop error:', err);
      }
      this.isListening = false;
    }
  }

  /**
   * Estimates audio duration in seconds based on text length and speech rate
   */
  public estimateDuration(text: string, rate: number = 0.95): number {
    if (!text || !text.trim()) return 0;
    const clean = this.formatForVoiceMessage(text, 'en');
    const words = clean.split(/\s+/).filter(Boolean).length;
    const baseSeconds = words / (2.16 * rate);
    return Math.max(3, Math.round(baseSeconds));
  }

  /**
   * Cleans text to sound natural when read as an authentic voice message
   */
  public formatForVoiceMessage(text: string, language: Language): string {
    if (!text) return '';

    // If Telugu or multi-language, apply comprehensive phonetic & rural dialect normalization
    if (language === 'te' || language === 'multi') {
      return normalizeTeluguForSpeech(text);
    }

    let clean = text
      .replace(/[\*\_~`#]/g, '')
      .replace(/🚨/g, language === 'hi' ? 'आपातकालीन चेतावनी! ' : 'Emergency alert! ')
      .replace(/🩺|⚠️|📊|💡|🏥|📋|🔗|💊/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/http[s]?:\/\/\S+/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (language === 'hi') {
      clean = clean
        .replace(/\bPHC\b/gi, 'प्राथमिक स्वास्थ्य केंद्र')
        .replace(/\bBP\b/gi, 'रक्तचाप बीपी')
        .replace(/\bORS\b/gi, 'ओआरएस घोल')
        .replace(/\bASHA\b/gi, 'आशा कार्यकर्ता');
    }

    return clean;
  }

  /**
   * Primary Speech entry point:
   * 1. Attempts High-Fidelity Gemini AI Voice via /api/health-ai/tts (authentic Telugu/Hindi audio)
   * 2. Seamlessly falls back to local browser SpeechSynthesis
   */
  public async speak(
    text: string,
    language: Language,
    onEnd?: () => void,
    onProgress?: (currentTime: number, totalDuration: number, progressRatio: number) => void,
    rate?: number
  ) {
    this.stopSpeaking();

    const cleanText = this.formatForVoiceMessage(text, language);
    if (!cleanText.trim()) {
      if (onEnd) onEnd();
      return;
    }

    const personaConfig = TELUGU_VOICE_CONFIGS[this.teluguPersona] || TELUGU_VOICE_CONFIGS.sumitra;
    const baseRate = rate !== undefined ? rate : (language === 'te' || language === 'multi' ? this.teluguSpeechRate : 0.95);
    const effectiveRate = (language === 'te' || language === 'multi')
      ? baseRate * personaConfig.rateMultiplier
      : baseRate;

    const estimatedSec = this.estimateDuration(cleanText, effectiveRate);

    // 1. Try High-Fidelity Server-side Gemini AI Voice (produces authentic Telugu speech with selected persona)
    try {
      const response = await fetch('/api/health-ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          language: language === 'multi' ? 'te' : language,
          voiceName: personaConfig.geminiVoice,
        }),
      });

      const data = await response.json();
      if (data.success && data.audioDataUrl) {
        this.playAudioDataUrl(data.audioDataUrl, onEnd, onProgress, effectiveRate);
        return;
      }
    } catch {
      // Remote TTS unavailable, fallback immediately to local browser speech synthesis
    }

    // 2. Fallback to client browser SpeechSynthesis with prioritized neural Telugu voices
    this.speakWithBrowserSynth(cleanText, language, onEnd, onProgress, effectiveRate, estimatedSec);
  }

  /**
   * Plays generated audio data URL with real-time progress updates
   */
  private playAudioDataUrl(
    audioUrl: string,
    onEnd?: () => void,
    onProgress?: (currentTime: number, totalDuration: number, progressRatio: number) => void,
    rate: number = 0.95
  ) {
    try {
      const audio = new Audio(audioUrl);
      audio.playbackRate = Math.max(0.75, Math.min(1.5, rate));
      this.currentAudioElement = audio;

      audio.onloadedmetadata = () => {
        const totalDuration = audio.duration || 10;
        if (onProgress) onProgress(0, totalDuration, 0);
      };

      audio.ontimeupdate = () => {
        if (onProgress && audio.duration) {
          const curr = audio.currentTime;
          const total = audio.duration;
          onProgress(curr, total, Math.min(1, curr / total));
        }
      };

      audio.onended = () => {
        this.currentAudioElement = null;
        if (onProgress && audio.duration) {
          onProgress(audio.duration, audio.duration, 1);
        }
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        this.currentAudioElement = null;
        if (onEnd) onEnd();
      };

      audio.play().catch((err) => {
        console.warn('Audio play prevented:', err);
        if (onEnd) onEnd();
      });
    } catch (err) {
      console.warn('Audio creation error:', err);
      if (onEnd) onEnd();
    }
  }

  /**
   * Browser SpeechSynthesis implementation with prioritized Neural Telugu voices
   */
  private speakWithBrowserSynth(
    cleanText: string,
    language: Language,
    onEnd?: () => void,
    onProgress?: (currentTime: number, totalDuration: number, progressRatio: number) => void,
    rate: number = 0.95,
    estimatedSec: number = 10
  ) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    const langCodes: Record<Language, string> = {
      te: 'te-IN',
      hi: 'hi-IN',
      en: 'en-IN',
      multi: 'te-IN',
    };

    const targetLangCode = langCodes[language] || 'te-IN';
    utterance.lang = targetLangCode;
    utterance.rate = Math.max(0.7, Math.min(1.8, rate));
    utterance.pitch = 1.0;

    if (this.availableVoices.length === 0) {
      this.loadVoices();
    }

    const personaConfig = TELUGU_VOICE_CONFIGS[this.teluguPersona] || TELUGU_VOICE_CONFIGS.sumitra;

    // Filter and prioritize high-clarity Telugu voices
    const sortedTeluguVoices = this.availableVoices
      .filter(
        (v) =>
          v.lang.toLowerCase().replace('_', '-') === 'te-in' ||
          v.lang.toLowerCase().startsWith('te') ||
          v.name.toLowerCase().includes('telugu') ||
          v.name.includes('తెలుగు')
      )
      .sort((a, b) => {
        // Priority 1: Google Natural / Online / Neural
        const aGoogle = a.name.toLowerCase().includes('google') || a.name.toLowerCase().includes('natural');
        const bGoogle = b.name.toLowerCase().includes('google') || b.name.toLowerCase().includes('natural');
        if (aGoogle && !bGoogle) return -1;
        if (!aGoogle && bGoogle) return 1;

        // Priority 2: Microsoft Mohan / Shruti
        const aMs = a.name.toLowerCase().includes('microsoft');
        const bMs = b.name.toLowerCase().includes('microsoft');
        if (aMs && !bMs) return -1;
        if (!aMs && bMs) return 1;

        return 0;
      });

    const teluguVoice = sortedTeluguVoices[0] || null;

    const exactVoice = this.availableVoices.find(
      (v) => v.lang.toLowerCase().replace('_', '-') === targetLangCode.toLowerCase()
    );

    const prefixVoice = this.availableVoices.find((v) =>
      v.lang.toLowerCase().startsWith(targetLangCode.toLowerCase().split('-')[0])
    );

    const indianVoice = this.availableVoices.find((v) =>
      v.lang.toLowerCase().includes('in')
    );

    if (language === 'te' || language === 'multi') {
      utterance.pitch = personaConfig.pitchMultiplier;
      utterance.rate = rate;
      if (teluguVoice) {
        utterance.voice = teluguVoice;
      } else if (indianVoice) {
        utterance.voice = indianVoice;
      }
    } else if (exactVoice) {
      utterance.voice = exactVoice;
    } else if (prefixVoice) {
      utterance.voice = prefixVoice;
    } else if (indianVoice) {
      utterance.voice = indianVoice;
    }

    const startTime = Date.now();

    if (onProgress) {
      this.progressInterval = setInterval(() => {
        const elapsedSec = (Date.now() - startTime) / 1000;
        const progress = Math.min(1, elapsedSec / estimatedSec);
        onProgress(Math.min(elapsedSec, estimatedSec), estimatedSec, progress);
      }, 100);
    }

    const cleanup = () => {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
      this.currentUtterance = null;
    };

    utterance.onend = () => {
      cleanup();
      if (onProgress) {
        onProgress(estimatedSec, estimatedSec, 1);
      }
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      cleanup();
      if (onEnd) onEnd();
    };

    try {
      this.synth.speak(utterance);
    } catch {
      cleanup();
      if (onEnd) onEnd();
    }
  }

  /**
   * One-tap test for Telugu voice: speaks sample greeting in selected persona
   */
  public testTeluguVoice(
    personaOrOnEnd?: TeluguVoicePersona | (() => void),
    onEndCallback?: () => void
  ) {
    let persona: TeluguVoicePersona | undefined;
    let onEnd: (() => void) | undefined;

    if (typeof personaOrOnEnd === 'function') {
      onEnd = personaOrOnEnd;
    } else {
      persona = personaOrOnEnd;
      onEnd = onEndCallback;
    }

    if (persona) {
      this.setTeluguPersona(persona);
    }
    const config = TELUGU_VOICE_CONFIGS[this.teluguPersona];
    const greeting = `నమస్కారం! నేను ${config.displayNameTe}. రూరల్ హెల్త్ మానిటరింగ్ ఏఐ తెలుగు వాయిస్ యాక్టివ్ చేయబడింది. గ్రామీణ ప్రజల ఆరోగ్యం మరియు రక్షణ మా ప్రథమ ప్రాధాన్యత.`;
    this.speak(greeting, 'te', onEnd);
  }

  public isSpeaking(): boolean {
    const synthSpeaking = !!this.synth && this.synth.speaking;
    const audioSpeaking = !!this.currentAudioElement && !this.currentAudioElement.paused;
    return synthSpeaking || audioSpeaking;
  }

  public pauseSpeaking() {
    if (this.currentAudioElement && !this.currentAudioElement.paused) {
      this.currentAudioElement.pause();
    }
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resumeSpeaking() {
    if (this.currentAudioElement && this.currentAudioElement.paused) {
      this.currentAudioElement.play().catch(console.warn);
    }
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stopSpeaking() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    this.currentUtterance = null;
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public stop() {
    this.stopSpeaking();
  }
}

export const speechService = new SpeechService();
