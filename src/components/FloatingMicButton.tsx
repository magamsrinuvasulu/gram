import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';

interface FloatingMicButtonProps {
  language: Language;
  onClick: () => void;
  isListening?: boolean;
}

export const FloatingMicButton: React.FC<FloatingMicButtonProps> = ({
  language,
  onClick,
  isListening = false,
}) => {
  const t = translations[language];

  return (
    <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 flex flex-col items-end gap-2">
      {/* Tooltip or Active Audio Waveform Pill */}
      {isListening ? (
        <AudioWaveformVisualizer
          isListening={true}
          mode="pill"
          colorTheme="red"
          label="Listening Live (వినబడుతోంది)..."
        />
      ) : (
        <div className="bg-emerald-900/95 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-emerald-500/50 flex items-center gap-1.5 animate-pulse">
          <Sparkles className="w-3 h-3 text-yellow-300" />
          <span>{t.wakeWordHelp}</span>
        </div>
      )}

      {/* Main Mic Floating Button with Soundwave Concentric Rings */}
      <div className="relative flex items-center justify-center">
        {/* Animated Concentric Soundwave Pulse Rings when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping scale-150 pointer-events-none"></span>
            <span className="absolute -inset-3 rounded-full border-2 border-red-400/50 animate-ring-pulse pointer-events-none"></span>
            <span className="absolute -inset-6 rounded-full border border-red-300/30 animate-ring-pulse pointer-events-none delay-300"></span>
          </>
        )}

        <button
          onClick={onClick}
          id="floating-mic-button"
          className={`relative group p-4 sm:p-5 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${
            isListening
              ? 'bg-red-600 text-white ring-4 ring-red-400/60 shadow-red-500/50'
              : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-4 ring-emerald-300/50 hover:ring-emerald-400'
          }`}
          title={t.tapToSpeak}
        >
          {/* Subtle background pulse */}
          <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 group-hover:animate-ping" />

          <div className="flex items-center gap-1.5 relative z-10">
            <Mic className={`w-8 h-8 sm:w-9 sm:h-9 ${isListening ? 'animate-bounce' : ''}`} />
            
            {/* Embedded Mini Waveform Bars on Mic when listening */}
            {isListening && (
              <div className="hidden sm:flex items-center gap-0.5 h-6 ml-1">
                <span className="w-1 bg-white rounded-full animate-waveform-bar" style={{ animationDuration: '0.5s' }} />
                <span className="w-1 bg-white rounded-full animate-waveform-bar" style={{ animationDuration: '0.7s', animationDelay: '0.15s' }} />
                <span className="w-1 bg-white rounded-full animate-waveform-bar" style={{ animationDuration: '0.4s', animationDelay: '0.3s' }} />
              </div>
            )}
          </div>

          <span className="sr-only">{t.tapToSpeak}</span>
        </button>
      </div>
    </div>
  );
};

