export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export type BodyPartId =
  | 'head'
  | 'eyes'
  | 'ears'
  | 'throat'
  | 'chest'
  | 'stomach'
  | 'back'
  | 'arms'
  | 'legs'
  | 'hands'
  | 'feet';

export type PainType =
  | 'sharp'
  | 'dull'
  | 'throbbing'
  | 'burning'
  | 'cramping'
  | 'pressure';

export type PainSeverity = 'mild' | 'moderate' | 'severe';

export type PainDuration =
  | 'few_hours'
  | '1_day'
  | '2_3_days'
  | 'more_than_week';

export interface BodyPartPain {
  id: BodyPartId;
  partName: string;
  partNameTe: string;
  partNameHi: string;
  painType: PainType;
  severity: PainSeverity;
  duration: PainDuration;
  notes?: string;
}

export interface PossibleCause {
  condition: string;
  conditionTe?: string;
  conditionHi?: string;
  description: string;
  descriptionTe?: string;
  descriptionHi?: string;
  probability?: 'possible' | 'likely' | 'rare';
}

export interface SymptomAnalysisResult {
  symptomsDetected: string[];
  possibleCauses: PossibleCause[];
  urgencyLevel: UrgencyLevel;
  generalGuidance: string[];
  recommendedAction: {
    actionType: 'monitor_home' | 'visit_doctor' | 'seek_urgent_care' | 'call_ambulance';
    label: string;
    explanation: string;
  };
  isEmergency: boolean;
  emergencyAlertText?: string;
  disclaimer: string;
  spokenSummary: string;
  timestamp: string;
}

export interface SymptomDraft {
  textInput: string;
  selectedQuickSymptoms: string[];
  selectedBodyPains: BodyPartPain[];
  analysisResult: SymptomAnalysisResult | null;
  savedAt: string;
}

export type Language = 'te' | 'hi' | 'en' | 'multi';

export type UserRole = 'villager' | 'asha';

export interface BaseUserProfile {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  role: UserRole;
  village: string;
  mandal: string;
  district: string;
  bloodGroup?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  isLoggedIn: boolean;
}

export interface PatientProfile extends BaseUserProfile {
  role: 'villager';
  abhaId?: string; // Ayushman Bharat Health Account ID (e.g. 91-4523-8891-0421)
  aarogyasriNo?: string;
  rationCardNo?: string;
  chronicConditions?: string[];
  allergies?: string[];
  assignedAshaName?: string;
  assignedPhcName?: string;
  occupation?: string;
  notes?: string;
}

export interface AshaKitStatus {
  bpMonitor: 'functional' | 'needs_calibration' | 'broken';
  glucometer: 'functional' | 'battery_low' | 'out_of_order';
  digitalThermometer: 'functional' | 'broken';
  weighingScale: 'functional' | 'faulty';
  hbStripsStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  orsPacketsCount: number;
  ifaTabletsCount: number;
  zincTabletsCount: number;
  pregnancyTestKitsCount: number;
}

export interface AshaProfile extends BaseUserProfile {
  role: 'asha';
  ashaId: string; // e.g. ASHA-AP-KRI-042
  subCentre: string; // e.g. Gannavaram Sub-Centre #2
  assignedVillages: string[];
  assignedHouseholdsCount: number;
  assignedPopulation: number;
  supervisorAnmName: string;
  supervisorPhone: string;
  medicalOfficerName: string;
  kitStatus: AshaKitStatus;
  activeAncCount: number;
  immunizationDueCount: number;
  experienceYears: number;
}

export type UserProfile = PatientProfile;

export interface FamilyMember {
  id: string;
  name: string;
  relation: string; // e.g., 'Mother', 'Father', 'Child', 'Spouse', 'Grandmother'
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  abhaId?: string; // e.g., 91-4523-8891-0422
  phone?: string;
  allergies?: string[];
  village?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  lastCheckupDate?: string;
  isPregnant?: boolean;
  pregnancyMonth?: number;
  expectedDeliveryDate?: string;
  hasChildVaccinationPending?: boolean;
  nextVaccineName?: string;
  nextVaccineDate?: string;
  chronicConditions?: string[]; // e.g., 'Hypertension', 'Diabetes', 'Asthma'
}

export interface FamilyMemberQRPayload {
  type: 'GRAM_HEALTH_QR_V1';
  memberId: string;
  name: string;
  relation: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  abhaId?: string;
  village?: string;
  district?: string;
  chronicConditions?: string[];
  isPregnant?: boolean;
  pregnancyMonth?: number;
  expectedDeliveryDate?: string;
  hasChildVaccinationPending?: boolean;
  nextVaccineName?: string;
  nextVaccineDate?: string;
  allergies?: string[];
  emergencyContactPhone?: string;
  generatedAt: string;
}

export interface PatientVisitNote {
  id: string;
  memberId: string;
  memberName: string;
  timestamp: string;
  ashaName: string;
  visitType: 'routine_checkup' | 'anc_maternal' | 'immunization' | 'vital_monitoring' | 'emergency_referral';
  bpReading?: string;
  bloodSugar?: string;
  weightOrFetalHeart?: string;
  notes: string;
  referredToDoctor?: boolean;
  referralReason?: string;
}

export interface PatientHistoryRecord {
  member: FamilyMember;
  vitals: HealthVital[];
  reminders: MedicineReminder[];
  visitNotes: PatientVisitNote[];
}

export interface HealthVital {
  id: string;
  familyMemberId?: string; // if for family member
  familyMemberName?: string;
  timestamp: string;
  systolicBP?: number;
  diastolicBP?: number;
  bloodSugar?: number; // mg/dL
  sugarType?: 'fasting' | 'post-meal' | 'random';
  pulseRate?: number; // bpm
  spo2?: number; // %
  temperature?: number; // °F
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
  notes?: string;
}

export interface MedicineReminder {
  id: string;
  familyMemberName: string;
  medicineName: string;
  dosage: string; // e.g., '1 Tablet'
  frequency: 'once' | 'twice' | 'thrice' | 'as-needed';
  timing: ('morning' | 'afternoon' | 'night')[];
  beforeOrAfterFood: 'before' | 'after';
  startDate: string;
  endDate: string;
  isTakenToday: {
    morning?: boolean;
    afternoon?: boolean;
    night?: boolean;
  };
  audioGuideUrl?: string;
}

export interface VaccinationRecord {
  id: string;
  childName: string;
  ageInMonths: number;
  vaccineName: string;
  dueDate: string;
  status: 'completed' | 'due' | 'overdue';
  description: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  type: 'ambulance' | 'phc' | 'asha' | 'police' | 'personal';
}

export interface HealthcareFacility {
  id: string;
  name: string;
  nameTe: string;
  nameHi: string;
  type: 'hospital' | 'phc' | 'clinic' | 'pharmacy' | 'lab' | 'camp';
  distanceKm: number;
  address: string;
  phone: string;
  openHours: string;
  latitude: number;
  longitude: number;
  isGovt: boolean;
  hasEmergency24x7: boolean;
}

export interface HealthArticle {
  id: string;
  category: 'emergency' | 'maternal' | 'child' | 'disease' | 'nutrition' | 'hygiene';
  titleEn: string;
  titleTe: string;
  titleHi: string;
  contentEn: string;
  contentTe: string;
  contentHi: string;
  iconName: string;
  audioKeyWords: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  audioSpoken?: boolean;
  attachmentUrl?: string;
  documentType?: string;
  isVoiceMessage?: boolean;
  audioDurationSeconds?: number;
  voiceLanguage?: Language;
  voiceSummaryTe?: string;
  voiceSummaryHi?: string;
  voiceSummaryEn?: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface DiseaseInfo {
  id: string;
  categoryId: string;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  definitionEn: string;
  definitionTe: string;
  definitionHi: string;
  symptomsEn: string[];
  symptomsTe: string[];
  symptomsHi: string[];
  causesEn: string[];
  causesTe: string[];
  causesHi: string[];
  riskFactorsEn: string[];
  riskFactorsTe: string[];
  riskFactorsHi: string[];
  preventionTipsEn: string[];
  preventionTipsTe: string[];
  preventionTipsHi: string[];
  homeCareEn: string[];
  homeCareTe: string[];
  homeCareHi: string[];
  whenToSeeDoctorEn: string[];
  whenToSeeDoctorTe: string[];
  whenToSeeDoctorHi: string[];
  emergencySignsEn: string[];
  emergencySignsTe: string[];
  emergencySignsHi: string[];
  recommendedTestsEn: string[];
  recommendedTestsTe: string[];
  recommendedTestsHi: string[];
  treatmentOverviewEn: string;
  treatmentOverviewTe: string;
  treatmentOverviewHi: string;
  faqsEn: FAQItem[];
  faqsTe: FAQItem[];
  faqsHi: FAQItem[];
  isEmergencyCondition?: boolean;
}

export interface DiseaseCategory {
  id: string;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  iconName: string;
  descriptionEn: string;
  descriptionTe: string;
  descriptionHi: string;
}

export interface DiseaseAlert {
  id: string;
  title: string;
  titleTe: string;
  titleHi: string;
  message: string;
  messageTe: string;
  messageHi: string;
  severity: 'info' | 'warning' | 'danger';
  date: string;
}
