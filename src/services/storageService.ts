import {
  UserProfile,
  PatientProfile,
  AshaProfile,
  UserRole,
  FamilyMember,
  HealthVital,
  MedicineReminder,
  EmergencyContact,
  ChatMessage,
  HealthcareFacility,
  HealthArticle,
  Language,
  SymptomDraft,
  PatientVisitNote,
  PatientHistoryRecord,
} from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'gram_health_user_profile',
  ROLE_PATIENT_PROFILE: 'gram_health_profile_patient',
  ROLE_ASHA_PROFILE: 'gram_health_profile_asha',
  FAMILY_MEMBERS: 'gram_health_family_members',
  HEALTH_VITALS: 'gram_health_vitals',
  MEDICINE_REMINDERS: 'gram_health_medicine_reminders',
  EMERGENCY_CONTACTS: 'gram_health_emergency_contacts',
  CHAT_HISTORY: 'gram_health_chat_history',
  PENDING_SYNC: 'gram_health_pending_sync',
  PREFERRED_LANGUAGE: 'gram_health_preferred_language',
  AI_LANGUAGE_MODE: 'gram_health_ai_language_mode',
  SYMPTOM_DRAFT: 'gram_health_symptom_draft',
  PATIENT_VISIT_NOTES: 'gram_health_patient_visit_notes',
};

// 1. PATIENT / VILLAGER PROFILE
export const defaultPatientProfile: PatientProfile = {
  id: 'usr-patient-1',
  name: 'Ramesh Kumar',
  phone: '9876543210',
  age: 42,
  gender: 'male',
  role: 'villager',
  village: 'Rampur',
  mandal: 'Gannavaram',
  district: 'Krishna',
  bloodGroup: 'O+',
  emergencyContactName: 'Lakshmi (Wife)',
  emergencyContactPhone: '9876543211',
  isLoggedIn: true,
  abhaId: '91-4523-8891-0421',
  aarogyasriNo: 'AS-KR-2024-8841',
  rationCardNo: 'WAP084128912',
  chronicConditions: ['Mild Hypertension'],
  allergies: ['Dust', 'Sulfa drugs'],
  assignedAshaName: 'Sunitha Kumari (ASHA Worker #42)',
  assignedPhcName: 'Gannavaram Primary Health Centre',
  occupation: 'Farmer / Agricultural worker',
  notes: 'Regular checkups required for morning blood pressure monitoring',
};

// 2. ASHA HEALTH WORKER PROFILE
export const defaultAshaProfile: AshaProfile = {
  id: 'usr-asha-1',
  name: 'Sunitha Kumari',
  phone: '9440123456',
  age: 36,
  gender: 'female',
  role: 'asha',
  village: 'Rampur',
  mandal: 'Gannavaram',
  district: 'Krishna',
  bloodGroup: 'B+',
  emergencyContactName: 'Ravi (Husband)',
  emergencyContactPhone: '9440123457',
  isLoggedIn: true,
  ashaId: 'ASHA-AP-KRI-042',
  subCentre: 'Gannavaram Sub-Centre #2',
  assignedVillages: ['Rampur', 'Gudavalli', 'Kanchikacherla East'],
  assignedHouseholdsCount: 185,
  assignedPopulation: 820,
  supervisorAnmName: 'K. Mary Prasanna (ANM)',
  supervisorPhone: '9440876543',
  medicalOfficerName: 'Dr. M. Prasad Rao, MBBS (MO)',
  experienceYears: 8,
  activeAncCount: 6,
  immunizationDueCount: 4,
  kitStatus: {
    bpMonitor: 'functional',
    glucometer: 'functional',
    digitalThermometer: 'functional',
    weighingScale: 'functional',
    hbStripsStatus: 'in_stock',
    orsPacketsCount: 18,
    ifaTabletsCount: 45,
    zincTabletsCount: 30,
    pregnancyTestKitsCount: 5,
  },
};

// Initial default profile points to PatientProfile
const defaultUserProfile: UserProfile = defaultPatientProfile;

const defaultFamilyMembers: FamilyMember[] = [
  {
    id: 'fam-0',
    name: 'Ramesh Kumar (Self)',
    relation: 'Family Head / Self',
    age: 42,
    gender: 'male',
    bloodGroup: 'O+',
    abhaId: '91-4523-8891-0421',
    phone: '9876543210',
    village: 'Rampur Village',
    allergies: ['Dust Allergy', 'Sulfa Drugs'],
    chronicConditions: ['Mild Hypertension'],
    emergencyContactName: 'Lakshmi Devi (Wife)',
    emergencyContactPhone: '9876543211',
    lastCheckupDate: '2026-09-02',
  },
  {
    id: 'fam-1',
    name: 'Lakshmi Devi',
    relation: 'Wife',
    age: 38,
    gender: 'female',
    bloodGroup: 'B+',
    abhaId: '91-4523-8891-0422',
    phone: '9876543211',
    village: 'Rampur Village',
    allergies: ['None Reported'],
    isPregnant: true,
    pregnancyMonth: 6,
    expectedDeliveryDate: '2026-10-15',
    emergencyContactName: 'Ramesh Kumar',
    emergencyContactPhone: '9876543210',
    lastCheckupDate: '2026-08-25',
  },
  {
    id: 'fam-2',
    name: 'Venkateswarlu (Grandfather)',
    relation: 'Father',
    age: 68,
    gender: 'male',
    bloodGroup: 'A+',
    abhaId: '91-4523-8891-0423',
    phone: '9876543212',
    village: 'Rampur Village',
    allergies: ['Sulfa Drugs'],
    chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    emergencyContactName: 'Ramesh Kumar',
    emergencyContactPhone: '9876543210',
    lastCheckupDate: '2026-08-28',
  },
  {
    id: 'fam-3',
    name: 'Ananya (Child)',
    relation: 'Daughter',
    age: 2,
    gender: 'female',
    bloodGroup: 'O+',
    abhaId: '91-4523-8891-0424',
    phone: '9876543210',
    village: 'Rampur Village',
    allergies: ['None Reported'],
    hasChildVaccinationPending: true,
    nextVaccineName: 'DPT Booster & Measles 2',
    nextVaccineDate: '2026-09-15',
    emergencyContactName: 'Lakshmi Devi',
    emergencyContactPhone: '9876543211',
    lastCheckupDate: '2026-07-20',
  },
];

const defaultVisitNotes: PatientVisitNote[] = [
  {
    id: 'note-1',
    memberId: 'fam-1',
    memberName: 'Lakshmi Devi',
    timestamp: '2026-08-25T10:30:00.000Z',
    ashaName: 'Sunitha Kumari (ASHA Worker)',
    visitType: 'anc_maternal',
    bpReading: '118/76 mmHg',
    weightOrFetalHeart: 'Fetal Heart: 142 bpm, Wt: 58 kg',
    notes: '2nd Trimester ANC home visit. Supplied 30 IFA tablets and Calcium. Nutritional counseling provided regarding green leafy vegetables and dal. Weight gain steady.',
    referredToDoctor: false,
  },
  {
    id: 'note-2',
    memberId: 'fam-2',
    memberName: 'Venkateswarlu (Grandfather)',
    timestamp: '2026-08-28T09:15:00.000Z',
    ashaName: 'Sunitha Kumari (ASHA Worker)',
    visitType: 'vital_monitoring',
    bpReading: '142/90 mmHg',
    bloodSugar: '148 mg/dL (fasting)',
    notes: 'BP slightly high today. Patient missed evening Amlodipine dosage 2 days ago. Emphasized taking medications after morning and night meals regularly. Advised reducing salt in curries.',
    referredToDoctor: false,
  },
];

const defaultVitals: HealthVital[] = [
  {
    id: 'vit-1',
    familyMemberName: 'Venkateswarlu (Grandfather)',
    timestamp: new Date().toISOString(),
    systolicBP: 135,
    diastolicBP: 88,
    bloodSugar: 142,
    sugarType: 'fasting',
    pulseRate: 74,
    spo2: 98,
    temperature: 98.4,
    weight: 62,
    height: 165,
    bmi: 22.8,
    notes: 'Morning BP check at home',
  },
  {
    id: 'vit-2',
    familyMemberName: 'Lakshmi Devi',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    systolicBP: 118,
    diastolicBP: 76,
    pulseRate: 78,
    spo2: 99,
    weight: 58,
    height: 158,
    bmi: 23.2,
    notes: '6th Month ANC checkup',
  },
];

const defaultReminders: MedicineReminder[] = [
  {
    id: 'med-1',
    familyMemberName: 'Venkateswarlu (Grandfather)',
    medicineName: 'Amlodipine 5mg (BP Tablet)',
    dosage: '1 Tablet',
    frequency: 'once',
    timing: ['morning'],
    beforeOrAfterFood: 'after',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isTakenToday: { morning: true },
  },
  {
    id: 'med-2',
    familyMemberName: 'Lakshmi Devi',
    medicineName: 'Iron & Folic Acid (IFA) + Calcium',
    dosage: '1 Tablet each',
    frequency: 'twice',
    timing: ['morning', 'night'],
    beforeOrAfterFood: 'after',
    startDate: '2026-03-01',
    endDate: '2026-10-30',
    isTakenToday: { morning: true, night: false },
  },
  {
    id: 'med-3',
    familyMemberName: 'Ananya (Child)',
    medicineName: 'Vitamin A Syrup',
    dosage: '2 ml',
    frequency: 'once',
    timing: ['morning'],
    beforeOrAfterFood: 'after',
    startDate: '2026-07-20',
    endDate: '2026-08-01',
    isTakenToday: { morning: false },
  },
];

const defaultEmergencyContacts: EmergencyContact[] = [
  {
    id: 'ec-1',
    name: 'State Health Emergency Ambulance',
    role: 'Government Ambulance',
    phone: '108',
    type: 'ambulance',
  },
  {
    id: 'ec-2',
    name: 'Mandal Primary Health Centre (PHC)',
    role: 'Primary Health Centre Helpdesk',
    phone: '0866-2456789',
    type: 'phc',
  },
  {
    id: 'ec-3',
    name: 'Savitri (Local Village ASHA Worker)',
    role: 'ASHA Health Worker',
    phone: '9440123456',
    type: 'asha',
  },
  {
    id: 'ec-4',
    name: 'National Health Helpline / Tele-MANAS',
    role: '24x7 Health Advisory',
    phone: '104',
    type: 'phc',
  },
];

export const defaultFacilities: HealthcareFacility[] = [
  {
    id: 'fac-1',
    name: 'Gannavaram Primary Health Centre (PHC)',
    nameTe: 'గన్నవరం ప్రాథమిక ఆరోగ్య కేంద్రం (PHC)',
    nameHi: 'गन्नावरम प्राथमिक स्वास्थ्य केंद्र (PHC)',
    type: 'phc',
    distanceKm: 2.4,
    address: 'Near Bus Stand, Main Road, Gannavaram',
    phone: '0866-2456789',
    openHours: '24x7 Emergency / Outpatient: 8 AM - 4 PM',
    latitude: 16.5412,
    longitude: 80.8012,
    isGovt: true,
    hasEmergency24x7: true,
  },
  {
    id: 'fac-2',
    name: 'Area Government Hospital',
    nameTe: 'ఏరియా ప్రభుత్వ వైద్యశాల',
    nameHi: 'क्षेत्रीय सरकारी अस्पताल',
    type: 'hospital',
    distanceKm: 8.5,
    address: 'Hospital Road, Vijayawada Rural',
    phone: '0866-2580108',
    openHours: '24x7 Emergency & Surgery',
    latitude: 16.5062,
    longitude: 80.648,
    isGovt: true,
    hasEmergency24x7: true,
  },
  {
    id: 'fac-3',
    name: 'Jan Aushadhi Kendra (Govt Pharmacy)',
    nameTe: 'జనౌషధి జనరల్ మెడికల్ షాప్',
    nameHi: 'जन औषधि केंद्र (सरकारी मेडिकल)',
    type: 'pharmacy',
    distanceKm: 1.1,
    address: 'Panchayat Office Complex, Rampur',
    phone: '9848123456',
    openHours: '8:00 AM - 9:00 PM',
    latitude: 16.538,
    longitude: 80.798,
    isGovt: true,
    hasEmergency24x7: false,
  },
  {
    id: 'fac-4',
    name: 'Sanjeevani Village Health Clinic',
    nameTe: 'సంజీవని విలేజ్ హెల్త్ క్లినిక్',
    nameHi: 'संजीवनी ग्राम स्वास्थ्य क्लिनिक',
    type: 'clinic',
    distanceKm: 0.5,
    address: 'Community Center, Village Square',
    phone: '9440011223',
    openHours: '9:00 AM - 2:00 PM',
    latitude: 16.539,
    longitude: 80.800,
    isGovt: false,
    hasEmergency24x7: false,
  },
  {
    id: 'fac-5',
    name: 'Mustabada 24x7 Primary Health Centre (PHC)',
    nameTe: 'ముస్తాబాద 24x7 ప్రాథమిక ఆరోగ్య కేంద్రం (PHC)',
    nameHi: 'मुस्तबादा 24x7 प्राथमिक स्वास्थ्य केंद्र (PHC)',
    type: 'phc',
    distanceKm: 4.8,
    address: 'Main Road, Near Panchayat Office, Mustabada',
    phone: '0866-2489100',
    openHours: '24x7 Emergency & Delivery / Outpatient: 8 AM - 4 PM',
    latitude: 16.5824,
    longitude: 80.7415,
    isGovt: true,
    hasEmergency24x7: true,
  },
  {
    id: 'fac-6',
    name: 'Telaprolu Model Primary Health Centre (PHC)',
    nameTe: 'తేలప్రోలు మోడల్ ప్రాథమిక ఆరోగ్య కేంద్రం (PHC)',
    nameHi: 'तेलाप्रोलु मॉडल प्राथमिक स्वास्थ्य केंद्र (PHC)',
    type: 'phc',
    distanceKm: 7.2,
    address: 'Opp. Zilla Parishad High School, Telaprolu',
    phone: '0866-2498211',
    openHours: '24x7 Emergency / 108 Ambulance Hub',
    latitude: 16.5742,
    longitude: 80.8711,
    isGovt: true,
    hasEmergency24x7: true,
  },
  {
    id: 'fac-7',
    name: 'Ayushman Arogya Mandir (Sub-Centre Atkur)',
    nameTe: 'ఆయుష్మాన్ ఆరోగ్య మందిర్ (ఉపకేంద్రం ఆత్కూరు)',
    nameHi: 'आयुष्मान आरोग्य मंदिर (उप-केंद्र आकूर)',
    type: 'clinic',
    distanceKm: 3.1,
    address: 'Sub-Centre Building, Near Water Tank, Atkur',
    phone: '9440128944',
    openHours: '9:00 AM - 4:00 PM (CHO / ANM on duty)',
    latitude: 16.512,
    longitude: 80.8432,
    isGovt: true,
    hasEmergency24x7: false,
  },
];

export const defaultHealthArticles: HealthArticle[] = [
  {
    id: 'art-1',
    category: 'emergency',
    titleEn: 'Snake Bite Emergency First Aid',
    titleTe: 'పాము కాటుకు తక్షణ ప్రథమ చికిత్స',
    titleHi: 'सांप के काटने पर तुरंत प्राथमिक उपचार',
    contentEn: '1. Keep victim calm and motionless. 2. Remove shoes or jewelry. 3. DO NOT cut the wound, suck venom, or tie tight tourniquets. 4. Transport immediately to PHC with Anti-Snake Venom (ASV).',
    contentTe: '1. బాధితుడిని ప్రశాంతంగా ఉంచండి, కదలకుండా పడుకోబెట్టండి. 2. కంగారు పడకండి. 3. గాయాన్ని కోయడం, విషం పీల్చడం లేదా గట్టిగా కట్టడం చేయకూడదు. 4. వెంటనే యాంటీ-స్నేక్ వెనమ్ (ASV) ఉన్న PHC లేదా ఆసుపత్రికి తరలించండి.',
    contentHi: '1. मरीज को शांत रखें और हिलने न दें। 2. जूते या गहने उतार दें। 3. घाव को काटें नहीं, जहर न चूसें और कसकर न बांधें। 4. तुरंत एंटी-स्नेक वेनम उपलब्ध अस्पताल ले जाएं।',
    iconName: 'ShieldAlert',
    audioKeyWords: ['snake', 'bite', 'పాము', 'सांप'],
  },
  {
    id: 'art-2',
    category: 'maternal',
    titleEn: 'Maternal Nutrition & IFA Tablets',
    titleTe: 'గర్భిణీ స్త్రీల పోషకాహారం & ఐరన్ మాత్రలు',
    titleHi: 'गर्भवती महिलाओं के लिए पोषण और आयरन गोलियां',
    contentEn: 'Pregnant women should take 1 Iron Folic Acid (IFA) tablet daily after food with lemon water. Eat green leafy vegetables, milk, eggs, pulses, and ragi malt.',
    contentTe: 'గర్భిణులు రోజువారీ భోజనం తర్వాత 1 ఐరన్ ఫోలిక్ యాసిడ్ (IFA) మాత్ర వేసుకోవాలి. తోటకూర, పాలకూర, పాలు, గుడ్లు, రాగి జావ, పప్పుధాన్యాలు సమృద్ధిగా తీసుకోండి.',
    contentHi: 'गर्भवती महिलाएं भोजन के बाद रोज 1 आयरन फोलिक एसिड गोली लें। हरी पत्तेदार सब्जियां, दूध, अंडे, दालें और रागी का सेवन करें।',
    iconName: 'HeartHandshake',
    audioKeyWords: ['pregnant', 'maternal', 'గర్భిణి', 'गर्भवती'],
  },
  {
    id: 'art-3',
    category: 'emergency',
    titleEn: 'ORS Preparation for Diarrhea & Dehydration',
    titleTe: 'విరేచనాలు, నీరసానికి ORS తయారుచేసే విధానం',
    titleHi: 'दस्त और डिहाइड्रेशन के लिए ओआरएस बनाने का तरीका',
    contentEn: 'Boil 1 liter of drinking water, cool it down. Add 1 packet of ORS powder or 6 teaspoons sugar + 1/2 teaspoon salt. Mix well and drink frequently.',
    contentTe: '1 లీటర్ తాగే నీటిని కాచి చల్లార్చండి. అందులో 1 ప్యాకెట్ ORS పొడి లేదా 6 చెంచాల చక్కెర + అర చెంచా ఉప్పు కలిపి బాగా కరిగించి తరచూ తాగించండి.',
    contentHi: '1 लीटर पानी उबालकर ठंडा करें। इसमें 1 पैकेट ओआरएस या 6 चम्मच चीनी + आधा चम्मच नमक मिलाकर बार-बार पिलाएं।',
    iconName: 'Droplet',
    audioKeyWords: ['ors', 'dehydration', 'విరేచనాలు', 'दस्त'],
  },
  {
    id: 'art-4',
    category: 'disease',
    titleEn: 'Fever, Dengue & Malaria Prevention',
    titleTe: 'డెంగ్యూ, మలేరియా జ్వరాల నివారణ',
    titleHi: 'डेंगू और मलेरिया बुखार से बचाव',
    contentEn: 'Prevent water stagnation near houses. Use mosquito nets at night. For fever lasting over 2 days, get a free blood smear test at local PHC.',
    contentTe: 'ఇంటి పరిసరాల్లో నీరు నిలవకుండా చూడండి. రాత్రి పూట దోమతెరలు వాడండి. 2 రోజులకంటే ఎక్కువ జ్వరం ఉంటే వెంటనే PHC లో ఉచిత రక్తపరీక్ష చేయించుకోండి.',
    contentHi: 'घर के आसपास पानी जमा न होने दें। रात में मच्छरदानी लगाएं। 2 दिन से ज्यादा बुखार होने पर पीएचसी में खून की जांच कराएं।',
    iconName: 'Bug',
    audioKeyWords: ['fever', 'dengue', 'జ్వరం', 'बुखार'],
  },
];

class StorageService {
  public getUserProfile(): UserProfile {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && parsed.role && parsed.role !== 'villager') {
          parsed.role = 'villager';
          localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        // fallback
      }
    }
    return defaultUserProfile;
  }

  public saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.ROLE_PATIENT_PROFILE, JSON.stringify(profile));
  }

  public getProfileForRole(role: UserRole): UserProfile {
    const data = localStorage.getItem(STORAGE_KEYS.ROLE_PATIENT_PROFILE);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        // fallback
      }
    }
    return defaultPatientProfile;
  }

  public switchRole(targetRole: UserRole): UserProfile {
    const current = this.getUserProfile();
    localStorage.setItem(STORAGE_KEYS.ROLE_PATIENT_PROFILE, JSON.stringify(current));
    const targetProfile = this.getProfileForRole(targetRole);
    this.saveUserProfile(targetProfile);
    return targetProfile;
  }

  public getFamilyMembers(): FamilyMember[] {
    const data = localStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS);
    if (!data) return defaultFamilyMembers;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : defaultFamilyMembers;
    } catch {
      return defaultFamilyMembers;
    }
  }

  public saveFamilyMembers(members: FamilyMember[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
    } catch (e) {
      console.warn('Could not save family members:', e);
    }
  }

  public addFamilyMember(member: Omit<FamilyMember, 'id'>): FamilyMember {
    const members = this.getFamilyMembers();
    const newMember: FamilyMember = {
      ...member,
      id: 'fam-' + Date.now(),
    };
    members.push(newMember);
    this.saveFamilyMembers(members);
    return newMember;
  }

  public deleteFamilyMember(id: string): FamilyMember[] {
    const members = this.getFamilyMembers().filter((m) => m.id !== id);
    this.saveFamilyMembers(members);
    return members;
  }

  public getVitals(): HealthVital[] {
    const data = localStorage.getItem(STORAGE_KEYS.HEALTH_VITALS);
    if (!data) return defaultVitals;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : defaultVitals;
    } catch {
      return defaultVitals;
    }
  }

  public addVital(vital: Omit<HealthVital, 'id'>): HealthVital {
    const vitals = this.getVitals();
    const newVital: HealthVital = {
      ...vital,
      id: 'vit-' + Date.now(),
      timestamp: vital.timestamp || new Date().toISOString(),
    };
    vitals.unshift(newVital);
    try {
      localStorage.setItem(STORAGE_KEYS.HEALTH_VITALS, JSON.stringify(vitals));
    } catch (e) {
      console.warn('Could not save vitals:', e);
    }
    return newVital;
  }

  public getMedicineReminders(): MedicineReminder[] {
    const data = localStorage.getItem(STORAGE_KEYS.MEDICINE_REMINDERS);
    if (!data) return defaultReminders;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : defaultReminders;
    } catch {
      return defaultReminders;
    }
  }

  public saveMedicineReminders(reminders: MedicineReminder[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICINE_REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.warn('Could not save reminders:', e);
    }
  }

  public addMedicineReminder(reminder: Omit<MedicineReminder, 'id' | 'isTakenToday'>): MedicineReminder {
    const reminders = this.getMedicineReminders();
    const newReminder: MedicineReminder = {
      ...reminder,
      id: 'med-' + Date.now(),
      isTakenToday: { morning: false, afternoon: false, night: false },
    };
    reminders.push(newReminder);
    this.saveMedicineReminders(reminders);
    return newReminder;
  }

  public toggleMedicineTaken(id: string, timeSlot: 'morning' | 'afternoon' | 'night'): MedicineReminder[] {
    const reminders = this.getMedicineReminders();
    const updated = reminders.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          isTakenToday: {
            ...r.isTakenToday,
            [timeSlot]: !r.isTakenToday[timeSlot],
          },
        };
      }
      return r;
    });
    this.saveMedicineReminders(updated);
    return updated;
  }

  public getEmergencyContacts(): EmergencyContact[] {
    const data = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
    if (!data) return defaultEmergencyContacts;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : defaultEmergencyContacts;
    } catch {
      return defaultEmergencyContacts;
    }
  }

  public getChatHistory(): ChatMessage[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public saveChatHistory(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat history:', e);
    }
  }

  public addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const history = this.getChatHistory();
    const newMsg: ChatMessage = {
      ...msg,
      id: 'msg-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    history.push(newMsg);
    this.saveChatHistory(history);
    return newMsg;
  }

  public clearChatHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    } catch (e) {
      console.warn('Could not clear chat history:', e);
    }
  }

  public getPreferredLanguage(): Language {
    const saved = localStorage.getItem(STORAGE_KEYS.PREFERRED_LANGUAGE);
    if (saved === 'te' || saved === 'hi' || saved === 'en' || saved === 'multi') {
      return saved;
    }
    return 'te';
  }

  public savePreferredLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEYS.PREFERRED_LANGUAGE, lang);
  }

  public getAiLanguageMode(): 'single' | 'multi' {
    const saved = localStorage.getItem(STORAGE_KEYS.AI_LANGUAGE_MODE);
    return saved === 'multi' ? 'multi' : 'single';
  }

  public saveAiLanguageMode(mode: 'single' | 'multi'): void {
    localStorage.setItem(STORAGE_KEYS.AI_LANGUAGE_MODE, mode);
  }

  // Auto-saved symptom checker draft
  public getSymptomDraft(): SymptomDraft | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYMPTOM_DRAFT);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return parsed as SymptomDraft;
      }
      return null;
    } catch (e) {
      console.error('Failed to load symptom draft from localStorage:', e);
      return null;
    }
  }

  public saveSymptomDraft(draft: SymptomDraft): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYMPTOM_DRAFT, JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save symptom draft to localStorage:', e);
    }
  }

  public clearSymptomDraft(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SYMPTOM_DRAFT);
    } catch (e) {
      console.error('Failed to clear symptom draft from localStorage:', e);
    }
  }

  // Patient Visit Notes (for ASHA field visits and QR retrievals)
  public getPatientVisitNotes(memberId?: string): PatientVisitNote[] {
    const data = localStorage.getItem(STORAGE_KEYS.PATIENT_VISIT_NOTES);
    let notes: PatientVisitNote[] = defaultVisitNotes;
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) notes = parsed;
      } catch {
        notes = defaultVisitNotes;
      }
    }
    if (memberId) {
      return notes.filter((n) => n.memberId === memberId);
    }
    return notes;
  }

  public savePatientVisitNotes(notes: PatientVisitNote[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENT_VISIT_NOTES, JSON.stringify(notes));
    } catch (e) {
      console.warn('Could not save patient visit notes:', e);
    }
  }

  public addPatientVisitNote(note: Omit<PatientVisitNote, 'id' | 'timestamp'>): PatientVisitNote {
    const notes = this.getPatientVisitNotes();
    const newNote: PatientVisitNote = {
      ...note,
      id: 'note-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    notes.unshift(newNote);
    this.savePatientVisitNotes(notes);
    return newNote;
  }

  // Complete Patient History aggregator for QR scan retrieval
  public getPatientHistory(memberId: string, memberName?: string): PatientHistoryRecord {
    const familyMembers = this.getFamilyMembers();
    let member = familyMembers.find((m) => m.id === memberId);
    
    // Fallback search by name if ID was not matched
    if (!member && memberName) {
      member = familyMembers.find((m) => m.name.toLowerCase().includes(memberName.toLowerCase()));
    }

    // Default fallback if brand new or unscanned
    if (!member) {
      member = {
        id: memberId,
        name: memberName || 'Rural Patient',
        relation: 'Family Member',
        age: 35,
        gender: 'female',
        village: 'Rampur Village',
        bloodGroup: 'B+',
        abhaId: '91-4523-8891-9999',
      };
    }

    const allVitals = this.getVitals();
    const vitals = allVitals.filter(
      (v) => (v.familyMemberId && v.familyMemberId === member?.id) || 
             (v.familyMemberName && member?.name && v.familyMemberName.toLowerCase().includes(member.name.toLowerCase()))
    );

    const allReminders = this.getMedicineReminders();
    const reminders = allReminders.filter(
      (r) => r.familyMemberName && member?.name && r.familyMemberName.toLowerCase().includes(member.name.toLowerCase())
    );

    const visitNotes = this.getPatientVisitNotes(member.id);

    return {
      member,
      vitals,
      reminders,
      visitNotes,
    };
  }
}

export const storageService = new StorageService();
