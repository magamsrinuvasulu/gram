import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  PhoneCall,
  Navigation,
  Clock,
  ShieldCheck,
  Building2,
  Footprints,
  Car,
  Siren,
  Compass,
  Crosshair,
  RefreshCw,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';
import { Language, HealthcareFacility } from '../types';
import { translations } from '../translations';
import { defaultFacilities } from '../services/storageService';
import { speechService } from '../services/speechService';
import {
  Coordinates,
  VILLAGE_COORDINATE_PRESETS,
  DEFAULT_VILLAGE_COORDINATES,
  calculateTravelEstimate,
  getGoogleMapsWalkingUrl,
  getGoogleMapsDrivingUrl,
  TravelEstimate,
} from '../services/distanceService';

interface HealthcareLocatorProps {
  language: Language;
}

interface FacilityWithTravel extends HealthcareFacility {
  travel: TravelEstimate;
  isNearestPhc?: boolean;
}

const STORAGE_KEY_USER_COORDS = 'rural_health_user_coords_v1';

export const HealthcareLocator: React.FC<HealthcareLocatorProps> = ({ language }) => {
  const t = translations[language];

  // Geolocation states
  const [userCoords, setUserCoords] = useState<Coordinates>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_COORDS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_VILLAGE_COORDINATES;
  });

  const [geoStatus, setGeoStatus] = useState<'idle' | 'detecting' | 'active' | 'denied' | 'fallback'>('idle');
  const [geoMessage, setGeoMessage] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('rampur');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSpeakingDirections, setIsSpeakingDirections] = useState(false);

  // Attempt GPS detection on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('fallback');
      setGeoMessage('Geolocation is not supported by your browser or environment. Using village reference coordinates.');
      return;
    }

    setGeoStatus('detecting');
    setGeoMessage('Connecting to satellite GPS / network triangulation...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords: Coordinates = {
          latitude: Number(position.coords.latitude.toFixed(5)),
          longitude: Number(position.coords.longitude.toFixed(5)),
          accuracy: Math.round(position.coords.accuracy || 15),
          source: 'gps',
          label: 'Live Device GPS',
        };
        setUserCoords(newCoords);
        setGeoStatus('active');
        setGeoMessage(`GPS active (±${newCoords.accuracy}m accuracy)`);
        setSelectedPresetId('live_gps');
        try {
          localStorage.setItem(STORAGE_KEY_USER_COORDS, JSON.stringify(newCoords));
        } catch (e) {
          // ignore
        }
      },
      (error) => {
        setGeoStatus('denied');
        let errorReason = 'GPS signal unavailable';
        if (error.code === 1) {
          errorReason = 'Location permission denied by browser';
        } else if (error.code === 3) {
          errorReason = 'Location request timed out';
        }
        setGeoMessage(`${errorReason}. Using village center coordinates.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'live_gps') {
      detectLocation();
      return;
    }

    const preset = VILLAGE_COORDINATE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setUserCoords(preset.coords);
      setGeoStatus('fallback');
      setGeoMessage(`Coordinates set to ${preset.name}`);
      try {
        localStorage.setItem(STORAGE_KEY_USER_COORDS, JSON.stringify(preset.coords));
      } catch (e) {
        // ignore
      }
    }
  };

  // Calculate distances for all facilities from current user coordinates
  const facilitiesWithTravel = useMemo<FacilityWithTravel[]>(() => {
    const list: FacilityWithTravel[] = defaultFacilities.map((fac): FacilityWithTravel => {
      const travel = calculateTravelEstimate(
        userCoords.latitude,
        userCoords.longitude,
        fac.latitude,
        fac.longitude
      );
      return {
        ...fac,
        travel,
      };
    });

    // Sort by road distance
    list.sort((a, b) => a.travel.roadDistanceKm - b.travel.roadDistanceKm);

    // Identify the closest PHC
    const firstPhc = list.find((f) => f.type === 'phc');
    if (firstPhc) {
      firstPhc.isNearestPhc = true;
    }

    return list;
  }, [userCoords]);

  // Nearest Local PHC (Primary Health Center)
  const nearestPhc = useMemo(() => {
    return facilitiesWithTravel.find((f) => f.type === 'phc');
  }, [facilitiesWithTravel]);

  // Filtered facilities for general list
  const filteredFacilities = useMemo(() => {
    return facilitiesWithTravel.filter((fac) => {
      const matchesFilter = filterType === 'all' || fac.type === filterType;
      const nameStr = (fac.name + ' ' + fac.nameTe + ' ' + fac.nameHi + ' ' + fac.address).toLowerCase();
      const matchesQuery = !searchQuery || nameStr.includes(searchQuery.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [facilitiesWithTravel, filterType, searchQuery]);

  // Audio voice directions playback
  const handleToggleVoiceDirections = (phc: FacilityWithTravel) => {
    if (isSpeakingDirections) {
      speechService.stop();
      setIsSpeakingDirections(false);
      return;
    }

    const facName =
      language === 'te'
        ? phc.nameTe
        : language === 'hi'
        ? phc.nameHi
        : phc.name;

    let text = '';
    if (language === 'te') {
      text = `మీ ప్రస్తుత స్థానం నుండి సమీప ప్రాథమిక ఆరోగ్య కేంద్రం ${facName}. రోడ్డు దూరం సుమారు ${phc.travel.roadDistanceKm} కిలోమీటర్లు. నడక ద్వారా వెళ్తే సుమారు ${phc.travel.walking.minutes} నిమిషాలు పడుతుంది, ఇది దాదాపు ${phc.travel.walking.steps} అడుగులు. ఆటో లేదా ద్విచక్ర వాహనం ద్వారా సుమారు ${phc.travel.vehicle.minutes} నిమిషాల్లో చేరుకోవచ్చు. అత్యవసర 108 అంబులెన్స్ ప్రయాణ సమయం సుమారు ${phc.travel.ambulance.minutes} నిమిషాలు. ఈ కేంద్రంలో 24 గంటల అత్యవసర విభాగం మరియు పాముకాటు విషహర మందు అందుబాటులో ఉంది.`;
    } else if (language === 'hi') {
      text = `आपके वर्तमान स्थान से निकटतम प्राथमिक स्वास्थ्य केंद्र ${facName} है। सड़क मार्ग से दूरी लगभग ${phc.travel.roadDistanceKm} किलोमीटर है। पैदल चलने में लगभग ${phc.travel.walking.minutes} मिनट का समय लगेगा। ऑटो या बाइक द्वारा लगभग ${phc.travel.vehicle.minutes} मिनट लगेंगे। आपातकालीन 108 एम्बुलेंस से लगभग ${phc.travel.ambulance.minutes} मिनट का समय लगेगा। यहां 24 घंटे आपातकालीन सेवा और एंटी-स्नेक वेनम उपलब्ध है।`;
    } else {
      text = `The nearest Primary Health Centre from your location is ${facName}. Road distance is approximately ${phc.travel.roadDistanceKm} kilometers. Estimated walking time is ${phc.travel.walking.formatted} (about ${phc.travel.walking.steps} steps). Travel time by auto or motorcycle is ${phc.travel.vehicle.formatted}. Emergency 108 ambulance transit time is ${phc.travel.ambulance.formatted}. 24x7 emergency medical officers and anti-snake venom are available here.`;
    }

    setIsSpeakingDirections(true);
    speechService.speak(text, language, () => {
      setIsSpeakingDirections(false);
    });
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-teal-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Building2 className="w-7 h-7 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{t.navLocator}</h2>
                <span className="bg-teal-400/20 text-teal-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-teal-300/30">
                  GPS Proximity Engine
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Real-time walking & transit distances to local PHCs and government hospitals
              </p>
            </div>
          </div>

          {/* Quick Refresh GPS Button */}
          <button
            onClick={detectLocation}
            disabled={geoStatus === 'detecting'}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-75 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${geoStatus === 'detecting' ? 'animate-spin text-teal-700' : 'text-teal-700'}`} />
            <span>{geoStatus === 'detecting' ? 'Detecting GPS...' : t.refreshLocation}</span>
          </button>
        </div>

        {/* Geolocation Coordinates & Village Preset Selector Bar */}
        <div className="mt-5 pt-4 border-t border-white/15">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Active Coordinates Display */}
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${geoStatus === 'active' ? 'bg-emerald-400 text-emerald-950 animate-pulse' : 'bg-amber-400 text-amber-950'}`}>
                <Crosshair className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span>
                    {userCoords.source === 'gps' ? '📍 Live GPS Location:' : '📍 Selected Reference Center:'}
                  </span>
                  <span className="font-mono bg-black/20 px-2 py-0.5 rounded-md text-[11px] text-teal-200">
                    {userCoords.latitude.toFixed(4)}°N, {userCoords.longitude.toFixed(4)}°E
                  </span>
                </div>
                {geoMessage && (
                  <p className="text-[11px] text-teal-200/80 mt-0.5 flex items-center gap-1">
                    <span>{geoMessage}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Village Presets for easy switching & demonstration */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] text-teal-200/90 font-medium whitespace-nowrap">
                {t.usePresetLocation}:
              </span>
              {VILLAGE_COORDINATE_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                const nameToShow =
                  language === 'te'
                    ? preset.nameTe
                    : language === 'hi'
                    ? preset.nameHi
                    : preset.name;

                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-teal-300 text-teal-950 shadow-xs'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-teal-950" />}
                    <span>{nameToShow.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 HERO CARD: NEAREST LOCAL PHC (PRIMARY HEALTH CENTER) SPOTLIGHT */}
      {/* ========================================================================= */}
      {nearestPhc && (
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-3xl p-5 sm:p-7 border-2 border-emerald-500 shadow-xl space-y-5 relative overflow-hidden">
          {/* Subtle decorative background watermarks */}
          <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
            <Building2 className="w-64 h-64 text-emerald-900" />
          </div>

          {/* Top Tag & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.nearestPhcTitle}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Open 24x7</span>
              </span>
            </div>

            {/* Audio Directions Trigger */}
            <button
              onClick={() => handleToggleVoiceDirections(nearestPhc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                isSpeakingDirections
                  ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
              }`}
            >
              {isSpeakingDirections ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-800" />
                  <span>{t.listenDirections}</span>
                </>
              )}
            </button>
          </div>

          {/* PHC Identity */}
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {language === 'te'
                ? nearestPhc.nameTe
                : language === 'hi'
                ? nearestPhc.nameHi
                : nearestPhc.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{nearestPhc.address}</span>
              <span className="font-semibold text-slate-400">•</span>
              <span className="text-emerald-800 font-bold">Bearing: {nearestPhc.travel.bearing}</span>
            </p>
          </div>

          {/* Travel Metrics Grid: Walking vs Vehicle vs Ambulance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
            {/* 1. Walking Distance & Duration */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-emerald-800 flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-emerald-600" />
                  <span>{t.walkingTime}</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Pedestrian Route
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-black text-slate-900">
                  {nearestPhc.travel.walking.formatted}
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                  {nearestPhc.travel.roadDistanceKm} km road distance
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                  <span>~{nearestPhc.travel.walking.steps.toLocaleString()} steps</span>
                  <span>•</span>
                  <span>~{nearestPhc.travel.walking.calories} kcal</span>
                </div>
              </div>
            </div>

            {/* 2. Vehicle / Auto / Two-Wheeler Time */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-teal-200/80 shadow-xs flex flex-col justify-between hover:border-teal-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-teal-800 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-teal-600" />
                  <span>{t.vehicleTime}</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
                  Auto / Bike
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-black text-slate-900">
                  {nearestPhc.travel.vehicle.formatted}
                </div>
                <div className="text-xs font-semibold text-teal-700 mt-0.5">
                  Via village link road (~25 km/h)
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Direct motorable paved road
                </div>
              </div>
            </div>

            {/* 3. Emergency 108 Ambulance Transit */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-red-200/80 shadow-xs flex flex-col justify-between hover:border-red-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-red-800 flex items-center gap-1.5">
                  <Siren className="w-4 h-4 text-red-600" />
                  <span>108 Ambulance</span>
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-red-100 text-red-800">
                  Emergency
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-black text-red-700">
                  {nearestPhc.travel.ambulance.formatted}
                </div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">
                  Free 108 Ambulance Dispatch
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Equipped with oxygen & trained EMT
                </div>
              </div>
            </div>
          </div>

          {/* Key PHC Facilities Checklist */}
          <div className="p-3.5 bg-emerald-900/5 rounded-2xl border border-emerald-200 text-xs relative z-10">
            <div className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Verified Primary Healthcare Services at this PHC:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700 font-medium">
              <span className="flex items-center gap-1 text-emerald-900 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Anti-Snake Venom (ASV)</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-900 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Rabies Vaccine (ARV)</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-900 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>24x7 Delivery Room</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-900 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Free Aarogyasri Meds</span>
              </span>
            </div>
          </div>

          {/* Direct Action Buttons: Walk, Drive, Call Desk, Call 108 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 relative z-10">
            <a
              href={getGoogleMapsWalkingUrl(
                userCoords.latitude,
                userCoords.longitude,
                nearestPhc.latitude,
                nearestPhc.longitude
              )}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 text-center"
            >
              <Footprints className="w-4 h-4" />
              <span>{t.walkRoute}</span>
            </a>

            <a
              href={getGoogleMapsDrivingUrl(
                userCoords.latitude,
                userCoords.longitude,
                nearestPhc.latitude,
                nearestPhc.longitude
              )}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 text-center"
            >
              <Car className="w-4 h-4" />
              <span>{t.driveRoute}</span>
            </a>

            <a
              href={`tel:${nearestPhc.phone}`}
              className="py-3 px-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 text-center"
            >
              <PhoneCall className="w-4 h-4 text-emerald-700" />
              <span>Call PHC Desk</span>
            </a>

            <a
              href="tel:108"
              className="py-3 px-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 text-center"
            >
              <Siren className="w-4 h-4" />
              <span>108 Ambulance</span>
            </a>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FILTER & SEARCH CONTROLS FOR ALL NEARBY HEALTHCARE FACILITIES */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PHC, hospital, sub-centre, village or pharmacy..."
              className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Facility Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Facilities' },
              { id: 'phc', label: 'PHCs' },
              { id: 'hospital', label: 'Hospitals' },
              { id: 'clinic', label: 'Sub-Centres / Clinics' },
              { id: 'pharmacy', label: 'Pharmacies' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  filterType === type.id
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
          <span>
            Showing <strong>{filteredFacilities.length}</strong> facilities sorted by proximity to your coordinates
          </span>
          <span className="flex items-center gap-1 text-teal-800 font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>Circuity factor applied: ~1.26x rural roads</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FACILITIES DIRECTORY GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFacilities.map((fac) => {
          const nameToShow =
            language === 'te'
              ? fac.nameTe
              : language === 'hi'
              ? fac.nameHi
              : fac.name;

          return (
            <div
              key={fac.id}
              className={`bg-white rounded-3xl p-5 border shadow-xs space-y-4 transition-all flex flex-col justify-between ${
                fac.isNearestPhc
                  ? 'border-2 border-emerald-500 ring-2 ring-emerald-100'
                  : 'border-slate-200/90 hover:border-teal-400'
              }`}
            >
              <div className="space-y-3">
                {/* Header Tags */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-200">
                        {fac.isGovt ? 'Government' : 'Private'}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {fac.type.toUpperCase()}
                      </span>
                      {fac.isNearestPhc && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Nearest PHC</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {nameToShow}
                    </h3>
                  </div>

                  {/* Distance Pill */}
                  <div className="shrink-0 text-right">
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 font-black text-xs px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{fac.travel.roadDistanceKm} km</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                      {fac.travel.bearing}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{fac.address}</span>
                </p>

                {/* Transit Badges: Walking vs Auto */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {fac.travel.walking.formatted}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        ~{fac.travel.walking.steps.toLocaleString()} walking steps
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                    <Car className="w-4 h-4 text-teal-700 shrink-0" />
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {fac.travel.vehicle.formatted}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Auto / Motorbike
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{fac.openHours}</span>
                  </span>

                  {fac.hasEmergency24x7 && (
                    <span className="flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>24x7 Emergency</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${fac.phone}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t.callNow}</span>
                </a>

                <a
                  href={getGoogleMapsWalkingUrl(
                    userCoords.latitude,
                    userCoords.longitude,
                    fac.latitude,
                    fac.longitude
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  title="Walking directions on Google Maps"
                >
                  <Footprints className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Walk Route</span>
                </a>

                <a
                  href={getGoogleMapsDrivingUrl(
                    userCoords.latitude,
                    userCoords.longitude,
                    fac.latitude,
                    fac.longitude
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center border border-slate-300 transition-colors"
                  title="Vehicle driving directions"
                >
                  <Navigation className="w-3.5 h-3.5 text-slate-700" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
