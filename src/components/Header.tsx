import React, { useState } from 'react';
import {
  Activity,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  PhoneCall,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  Type,
  Settings,
} from 'lucide-react';
import { Language, UserRole, UserProfile } from '../types';
import { translations } from '../translations';
import { speechService } from '../services/speechService';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isOnline: boolean;
  onSync: () => void;
  userProfile: UserProfile;
  onRoleChange?: (role: UserRole) => void;
  onOpenSOS: () => void;
  onToggleHighContrast: () => void;
  isHighContrast: boolean;
  textSize: 'normal' | 'large';
  onToggleTextSize: () => void;
  onOpenSettings: () => void;
  aiLanguageMode?: 'single' | 'multi';
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  isOnline,
  onSync,
  userProfile,
  onOpenSOS,
  onToggleHighContrast,
  isHighContrast,
  textSize,
  onToggleTextSize,
  onOpenSettings,
  aiLanguageMode = 'single',
}) => {
  const t = translations[language];
  const [isTestingTeluguVoice, setIsTestingTeluguVoice] = useState(false);

  return (
    <header
      id="app-header"
      className={`sticky top-0 z-40 border-b shadow-xs transition-colors ${
        isHighContrast
          ? 'bg-black text-white border-yellow-400'
          : 'bg-emerald-800 text-white border-emerald-700'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Title */}
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner ${
              isHighContrast ? 'bg-yellow-400 text-black' : 'bg-white text-emerald-800'
            }`}
          >
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight leading-none">
                {t.appName}
              </h1>
              <span className="bg-emerald-600/80 text-emerald-100 text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase border border-emerald-500/50">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/90 hidden sm:block leading-snug">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Badge */}
          <button
            onClick={onSync}
            title={isOnline ? t.onlineStatus : t.offlineStatus}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              isOnline
                ? 'bg-emerald-900/60 border-emerald-400/50 text-emerald-200 hover:bg-emerald-900'
                : 'bg-amber-900/80 border-amber-400 text-amber-200 animate-pulse'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span className="hidden md:inline">
              {isOnline ? t.onlineStatus : t.offlineStatus}
            </span>
            <RefreshCw className="w-3 h-3 ml-0.5 opacity-75 hover:rotate-180 transition-transform" />
          </button>

          {/* Accessibility Controls */}
          <div className="hidden lg:flex items-center gap-1 bg-emerald-900/50 p-1 rounded-lg border border-emerald-600/40">
            <button
              onClick={onToggleHighContrast}
              title={t.highContrast}
              className={`p-1.5 rounded-md text-xs font-semibold ${
                isHighContrast ? 'bg-yellow-400 text-black' : 'text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleTextSize}
              title={t.textSize}
              className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                textSize === 'large' ? 'bg-white text-emerald-900' : 'text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Patient Health Profile Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-xs text-white border border-emerald-500/40 transition-all active:scale-95 shadow-xs"
            title={language === 'te' ? 'ఆరోగ్య ప్రొఫైల్ & సెట్టింగ్స్' : language === 'hi' ? 'स्वास्थ्य प्रोफ़ाइल और सेटिंग्स' : 'Health Profile & Settings'}
          >
            <User className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden sm:inline font-bold">
              {userProfile.name ? userProfile.name.split(' ')[0] : (language === 'te' ? 'ప్రొఫైల్' : 'Profile')}
            </span>
          </button>

          {/* Unified Language & AI Mode Control Bar - ONE Position */}
          <div className="flex items-center bg-emerald-950/70 p-1 rounded-2xl border border-emerald-600/60 shadow-inner gap-1">
            <div className="flex items-center gap-0.5">
              <Globe className="w-3.5 h-3.5 text-emerald-300 ml-1 mr-0.5 hidden sm:inline" />
              <button
                onClick={() => {
                  onLanguageChange('te');
                }}
                className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                  language === 'te' && aiLanguageMode === 'single'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
                }`}
                title="Single Language Mode: Telugu (తెలుగు)"
              >
                తెలుగు
              </button>
              <button
                onClick={() => {
                  onLanguageChange('hi');
                }}
                className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                  language === 'hi' && aiLanguageMode === 'single'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
                }`}
                title="Single Language Mode: Hindi (हिंदी)"
              >
                हिंदी
              </button>
              <button
                onClick={() => {
                  onLanguageChange('en');
                }}
                className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                  language === 'en' && aiLanguageMode === 'single'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
                }`}
                title="Single Language Mode: English"
              >
                EN
              </button>
            </div>

            <div className="h-4 w-px bg-emerald-700/60 my-auto"></div>

            {/* Multi-Language Mode Button at same position */}
            <button
              onClick={() => {
                onLanguageChange('multi');
              }}
              title="Multi-Language Mode: Telugu + Hindi + English"
              className={`px-2 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
                aiLanguageMode === 'multi' || language === 'multi'
                  ? 'bg-amber-400 text-slate-950 shadow-sm ring-1 ring-amber-300'
                  : 'text-amber-200 hover:text-white hover:bg-amber-900/30'
              }`}
            >
              <span>🌐</span>
              <span>Multi-Lang</span>
            </button>

            <div className="h-4 w-px bg-emerald-700/60 my-auto"></div>

            {/* Direct Telugu AI Voice Button */}
            <button
              onClick={() => {
                onLanguageChange('te');
                if (isTestingTeluguVoice) {
                  speechService.stopSpeaking();
                  setIsTestingTeluguVoice(false);
                } else {
                  setIsTestingTeluguVoice(true);
                  speechService.testTeluguVoice(() => setIsTestingTeluguVoice(false));
                }
              }}
              className={`px-2 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                isTestingTeluguVoice
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
              }`}
              title="తెలుగు వాయిస్ వినండి (Listen to Telugu AI Voice)"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isTestingTeluguVoice ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isTestingTeluguVoice ? 'వింటున్నారు...' : 'తెలుగు వాయిస్'}</span>
              <span className="sm:hidden">తెలుగు</span>
            </button>

            <div className="h-4 w-px bg-emerald-700/60 my-auto"></div>

            {/* Gear Icon for Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition-all"
              title="Language Settings & AI Preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Emergency SOS Pill Button */}
          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all animate-bounce"
            title={t.sosButton}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
