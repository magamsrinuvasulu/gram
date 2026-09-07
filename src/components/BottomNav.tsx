import React from 'react';
import {
  LayoutDashboard,
  Mic,
  Stethoscope,
  Pill,
  MapPin,
  PhoneCall,
  BookOpen,
  FileSpreadsheet,
  TrendingUp,
  Bot,
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { translations } from '../translations';

interface BottomNavProps {
  language: Language;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: UserRole;
  onOpenVoiceModal?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  language,
  activeTab,
  onTabChange,
}) => {
  const t = translations[language];

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'chatbot', label: t.navChatbot, icon: Bot },
    { id: 'analytics', label: t.navAnalytics, icon: TrendingUp },
    { id: 'symptoms', label: t.navSymptomChecker, icon: Stethoscope },
    { id: 'reminders', label: t.navReminders, icon: Pill },
    { id: 'locator', label: t.navLocator, icon: MapPin },
    { id: 'emergency', label: t.navEmergency, icon: PhoneCall },
  ];

  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-800 font-extrabold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-[64px]">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
