import React from 'react';

interface AudioWaveformVisualizerProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  mode?: 'full' | 'compact' | 'pill';
  barCount?: number;
  label?: string;
  colorTheme?: 'emerald' | 'amber' | 'red';
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  isListening = false,
  isSpeaking = false,
  mode = 'full',
  barCount = 7,
  label,
  colorTheme = 'emerald',
}) => {
  if (!isListening && !isSpeaking) return null;

  const getThemeColors = () => {
    if (colorTheme === 'amber') {
      return {
        dot: 'bg-amber-500',
        ping: 'bg-amber-400',
        bars: ['bg-amber-400', 'bg-amber-500', 'bg-yellow-400', 'bg-amber-300', 'bg-orange-400', 'bg-amber-500', 'bg-amber-400'],
      };
    }
    if (colorTheme === 'red') {
      return {
        dot: 'bg-red-500',
        ping: 'bg-red-400',
        bars: ['bg-red-400', 'bg-rose-500', 'bg-red-500', 'bg-pink-400', 'bg-red-400', 'bg-rose-400', 'bg-red-500'],
      };
    }
    return {
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      bars: ['bg-emerald-400', 'bg-teal-400', 'bg-cyan-400', 'bg-emerald-500', 'bg-teal-300', 'bg-cyan-500', 'bg-emerald-400'],
    };
  };

  const theme = getThemeColors();

  if (mode === 'pill') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-white text-xs font-bold shadow-md border border-slate-700/80 backdrop-blur-md">
        <span className="relative flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.ping} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${theme.dot}`}></span>
        </span>
        <span>{label || (isSpeaking ? 'AI Speaking...' : 'Listening...')}</span>
        <div className="flex items-center gap-0.5 h-3 ml-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={`w-0.5 rounded-full ${theme.bars[i % theme.bars.length]} animate-waveform-bar`}
              style={{
                animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'compact') {
    return (
      <div className="flex items-center gap-1 h-5">
        {Array.from({ length: barCount }).map((_, i) => (
          <span
            key={i}
            className={`w-1 rounded-full ${theme.bars[i % theme.bars.length]} animate-waveform-bar`}
            style={{
              animationDuration: `${0.45 + (i % 4) * 0.15}s`,
              animationDelay: `${(i * 0.1) % 0.4}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3">
        {/* Pulsing Visual Indicator */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${theme.ping}`}></span>
          <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${theme.dot}`}></span>
        </div>

        <div>
          <h4 className="text-xs font-black tracking-wide uppercase flex items-center gap-1.5 text-slate-100">
            <span>{label || (isSpeaking ? 'AI Voice Speaking' : isListening ? 'AI Assistant Listening' : 'Audio Active')}</span>
          </h4>
          <p className="text-[11px] text-slate-300/80 font-medium leading-tight">
            {isSpeaking
              ? 'Reading response aloud in selected language...'
              : 'Speak your symptom query or notes clearly into mic...'}
          </p>
        </div>
      </div>

      {/* Vertical Animated Equalizer Bars */}
      <div className="flex items-center gap-1 h-7 px-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 shrink-0">
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full ${theme.bars[i % theme.bars.length]} animate-waveform-bar`}
            style={{
              animationDuration: `${0.35 + (i % 4) * 0.18}s`,
              animationDelay: `${(i * 0.12) % 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
