/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, UserRole, UserProfile, FamilyMember, HealthVital, MedicineReminder, DiseaseAlert } from './types';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { FloatingMicButton } from './components/FloatingMicButton';
import { VitalsLogger } from './components/VitalsLogger';
import { FamilyProfiles } from './components/FamilyProfiles';
import { EmergencySOS } from './components/EmergencySOS';
import { HealthcareLocator } from './components/HealthcareLocator';
import { MedicineReminders } from './components/MedicineReminders';
import { HealthEducation } from './components/HealthEducation';
import { PrescriptionVault } from './components/PrescriptionVault';
import { SymptomChecker } from './components/SymptomChecker';
import { Analytics } from './components/Analytics';
import { BottomNav } from './components/BottomNav';
import { SettingsModal } from './components/SettingsModal';
import { FamilyMemberQRModal } from './components/FamilyMemberQRModal';
import { ASHAQRScannerModal } from './components/ASHAQRScannerModal';
import { Chatbot } from './components/Chatbot';

export default function App() {
  const [language, setLanguageState] = useState<Language>(
    () => (storageService.getPreferredLanguage() as Language) || 'te'
  );

  const [aiLanguageMode, setAiLanguageMode] = useState<'single' | 'multi'>(
    () => storageService.getAiLanguageMode()
  );

  const handleLanguageChange = (newLang: Language) => {
    setLanguageState(newLang);
    storageService.savePreferredLanguage(newLang);
  };

  const handleAiLanguageModeChange = (mode: 'single' | 'multi') => {
    setAiLanguageMode(mode);
    storageService.saveAiLanguageMode(mode);
  };
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => storageService.getFamilyMembers());
  const [vitals, setVitals] = useState<HealthVital[]>(() => storageService.getVitals());
  const [medicineReminders, setMedicineReminders] = useState<MedicineReminder[]>(() => storageService.getMedicineReminders());
  const [emergencyContacts] = useState(() => storageService.getEmergencyContacts());

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isVitalsLoggerOpen, setIsVitalsLoggerOpen] = useState<boolean>(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [selectedQRMemberId, setSelectedQRMemberId] = useState<string | undefined>(undefined);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);

  const handleOpenQRModal = (memberId?: string) => {
    setSelectedQRMemberId(memberId || familyMembers[0]?.id || 'fam-0');
    setIsQRModalOpen(true);
  };

  const handleOpenQRScanner = () => {
    setIsQRScannerOpen(true);
  };

  const [diseaseAlerts, setDiseaseAlerts] = useState<DiseaseAlert[]>([]);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial fetch for offline sync data
    fetchSyncData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchSyncData = async () => {
    try {
      const res = await fetch('/api/offline-sync-data');
      if (res.ok) {
        const data = await res.json();
        setDiseaseAlerts(data.diseaseAlerts || []);
      }
    } catch (err) {
      console.warn('Offline mode: Using cached health advisories.');
    }
  };

  const handleSyncData = async () => {
    await fetchSyncData();
    const msg =
      language === 'te'
        ? 'సమాచారం విజయవంతంగా సింక్ చేయబడింది!'
        : language === 'hi'
        ? 'डेटा सफलतापूर्वक सिंक हो गया!'
        : 'Health data synchronized successfully!';
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleAddVital = (vital: Omit<HealthVital, 'id'>) => {
    const newVital = storageService.addVital(vital);
    setVitals([newVital, ...vitals]);
  };

  const handleAddFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMem = storageService.addFamilyMember(member);
    setFamilyMembers([...familyMembers, newMem]);
  };

  const handleDeleteFamilyMember = (id: string) => {
    storageService.deleteFamilyMember(id);
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleToggleMedicineTaken = (id: string, timeSlot: 'morning' | 'afternoon' | 'night') => {
    const updated = storageService.toggleMedicineTaken(id, timeSlot);
    setMedicineReminders(updated);
  };

  const handleAddMedicineReminder = (reminder: Omit<MedicineReminder, 'id' | 'isTakenToday'>) => {
    const newRem = storageService.addMedicineReminder(reminder);
    setMedicineReminders([...medicineReminders, newRem]);
  };

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors ${
        isHighContrast
          ? 'bg-black text-white'
          : 'bg-gradient-to-b from-emerald-50/60 via-slate-50 to-teal-50/30 text-slate-900'
      } ${textSize === 'large' ? 'text-lg' : 'text-base'}`}
    >
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl border border-emerald-400 animate-in fade-in slide-in-from-top-4">
          {syncToast}
        </div>
      )}

      {/* Header Bar */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        isOnline={isOnline}
        onSync={handleSyncData}
        userProfile={userProfile}
        onOpenSOS={() => setActiveTab('emergency')}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        isHighContrast={isHighContrast}
        textSize={textSize}
        onToggleTextSize={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        aiLanguageMode={aiLanguageMode}
      />

      {/* Main Screen Views Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            language={language}
            userProfile={userProfile}
            familyMembers={familyMembers}
            vitals={vitals}
            medicineReminders={medicineReminders}
            diseaseAlerts={diseaseAlerts}
            onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
            onOpenVitalsLogger={() => setIsVitalsLoggerOpen(true)}
            onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
            onOpenSOS={() => setActiveTab('emergency')}
            onOpenLocator={() => setActiveTab('locator')}
            onOpenQRModal={handleOpenQRModal}
            onOpenQRScanner={handleOpenQRScanner}
            onToggleMedicineTaken={handleToggleMedicineTaken}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onDeleteFamilyMember={handleDeleteFamilyMember}
          />
        )}

        {activeTab === 'chatbot' && (
          <Chatbot
            language={language}
            userProfile={userProfile}
            aiLanguageMode={aiLanguageMode}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics
            language={language}
            userProfile={userProfile}
            vitals={vitals}
            onOpenVitalsLogger={() => setIsVitalsLoggerOpen(true)}
            onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
          />
        )}

        {activeTab === 'symptoms' && (
          <SymptomChecker
            language={language}
            onLanguageChange={handleLanguageChange}
            onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'reminders' && (
          <MedicineReminders
            language={language}
            reminders={medicineReminders}
            familyMembers={familyMembers}
            onToggleTaken={handleToggleMedicineTaken}
            onAddReminder={handleAddMedicineReminder}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencySOS
            language={language}
            contacts={emergencyContacts}
            onClose={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'locator' && <HealthcareLocator language={language} />}

        {activeTab === 'education' && (
          <HealthEducation
            language={language}
            onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
          />
        )}

        {activeTab === 'prescriptions' && <PrescriptionVault language={language} />}
      </main>

      {/* Floating Microphone Button */}
      <FloatingMicButton
        language={language}
        onClick={() => setIsVoiceModalOpen(true)}
      />

      {/* Voice Assistant Modal Overlay */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        language={language}
        userProfile={userProfile}
        aiLanguageMode={aiLanguageMode}
      />

      {/* Settings & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
        aiLanguageMode={aiLanguageMode}
        onAiLanguageModeChange={handleAiLanguageModeChange}
        userProfile={userProfile}
        onProfileUpdate={setUserProfile}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        textSize={textSize}
        onToggleTextSize={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')}
      />

      {/* Log Vitals Modal */}
      <VitalsLogger
        isOpen={isVitalsLoggerOpen}
        onClose={() => setIsVitalsLoggerOpen(false)}
        language={language}
        familyMembers={familyMembers}
        onSaveVital={handleAddVital}
      />

      {/* Add Family Member Modal */}
      <FamilyProfiles
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        language={language}
        familyMembers={familyMembers}
        onAddFamilyMember={handleAddFamilyMember}
        onDeleteFamilyMember={handleDeleteFamilyMember}
        onOpenQRModal={handleOpenQRModal}
      />

      {/* Family Member Digital Health QR Card Modal */}
      <FamilyMemberQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        language={language}
        familyMembers={familyMembers}
        selectedMemberId={selectedQRMemberId}
      />

      {/* ASHA Field QR Code Scanner & Patient History Modal */}
      <ASHAQRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        language={language}
        familyMembers={familyMembers}
        onOpenVitalsLogger={(memberId) => {
          setIsQRScannerOpen(false);
          setIsVitalsLoggerOpen(true);
        }}
      />

      {/* Bottom Mobile-first Navigation Bar */}
      <BottomNav
        language={language}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userProfile.role}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />
    </div>
  );
}
