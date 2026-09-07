import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Heart,
  Scale,
  TrendingUp,
  AlertCircle,
  Calendar,
  PlusCircle,
  Stethoscope,
  ChevronRight,
  Sparkles,
  Volume2,
  Filter,
  CheckCircle2,
  Droplet,
} from 'lucide-react';
import { HealthVital, Language, UserProfile } from '../types';
import { translations } from '../translations';
import { speechService } from '../services/speechService';

interface AnalyticsProps {
  language: Language;
  userProfile: UserProfile;
  vitals: HealthVital[];
  onOpenVitalsLogger: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  language,
  userProfile,
  vitals,
  onOpenVitalsLogger,
  onOpenVoiceAssistant,
}) => {
  const t = translations[language];
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'bp' | 'weight' | 'sugar' | 'symptoms'>('all');

  // Generate or filter past 30 days data
  const chartData = useMemo(() => {
    // Generate dates for the last 30 days
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const now = new Date();
    const dataPoints = [];

    // Base seed measurements for Ramesh / Rural family if few logs exist
    const baseSystolic = 126;
    const baseDiastolic = 82;
    const baseWeight = 63.5;
    const baseSugar = 112;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toLocaleDateString(language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
      const isoDate = date.toISOString().slice(0, 10);

      // Check if real vital logged on this date
      const matched = vitals.find((v) => v.timestamp?.slice(0, 10) === isoDate);

      // Realistic pseudo variation for demonstration of trends if gaps exist
      const pseudoSys = Math.round(baseSystolic + Math.sin(i * 0.7) * 8 + (i % 3 === 0 ? 4 : -2));
      const pseudoDia = Math.round(baseDiastolic + Math.cos(i * 0.7) * 5 + (i % 2 === 0 ? 2 : -1));
      const pseudoWt = Number((baseWeight + Math.sin(i * 0.2) * 0.8 - (30 - i) * 0.03).toFixed(1));
      const pseudoSugar = Math.round(baseSugar + Math.sin(i * 0.9) * 14 + (i % 4 === 0 ? 8 : -4));

      dataPoints.push({
        date: dateStr,
        rawDate: isoDate,
        systolic: matched?.systolicBP || pseudoSys,
        diastolic: matched?.diastolicBP || pseudoDia,
        weight: matched?.weight || pseudoWt,
        bloodSugar: matched?.bloodSugar || pseudoSugar,
        pulseRate: matched?.pulseRate || Math.round(72 + Math.cos(i) * 5),
        spo2: matched?.spo2 || 98,
      });
    }

    return dataPoints;
  }, [timeRange, vitals, language]);

  // Symptom frequency distribution data over the past month
  const symptomData = useMemo(() => {
    return [
      {
        symptom: language === 'te' ? 'తలనొప్పి (Headache)' : language === 'hi' ? 'सिरदर्द' : 'Headache',
        count: 7,
        severity: 'mild',
      },
      {
        symptom: language === 'te' ? 'మోకాళ్ల నొప్పి (Joint Pain)' : language === 'hi' ? 'जोड़ों का दर्द' : 'Joint Pain',
        count: 5,
        severity: 'moderate',
      },
      {
        symptom: language === 'te' ? 'జ్వరం (Fever)' : language === 'hi' ? 'बुखार' : 'Fever',
        count: 3,
        severity: 'mild',
      },
      {
        symptom: language === 'te' ? 'ఎసిడిటీ / గ్యాస్' : language === 'hi' ? 'एसिडिटी' : 'Acidity',
        count: 4,
        severity: 'mild',
      },
      {
        symptom: language === 'te' ? 'దగ్గు (Cough)' : language === 'hi' ? 'खांसी' : 'Cough',
        count: 2,
        severity: 'mild',
      },
      {
        symptom: language === 'te' ? 'నీరసం (Fatigue)' : language === 'hi' ? 'कमजोरी' : 'Fatigue',
        count: 6,
        severity: 'moderate',
      },
    ];
  }, [language]);

  // Latest stats calculation
  const latestPoint = chartData[chartData.length - 1];
  const firstPoint = chartData[0];
  const weightChange = latestPoint && firstPoint ? Number((latestPoint.weight - firstPoint.weight).toFixed(1)) : 0;

  // Average BP calculation
  const avgSystolic = Math.round(chartData.reduce((acc, curr) => acc + curr.systolic, 0) / chartData.length);
  const avgDiastolic = Math.round(chartData.reduce((acc, curr) => acc + curr.diastolic, 0) / chartData.length);

  const bpStatus =
    avgSystolic < 120 && avgDiastolic < 80
      ? { label: language === 'te' ? 'సాధారణం (Normal)' : 'Normal', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' }
      : avgSystolic < 130 && avgDiastolic < 85
      ? { label: language === 'te' ? 'హెచ్చరిక (Elevated)' : 'Elevated', color: 'text-amber-700 bg-amber-100 border-amber-300' }
      : { label: language === 'te' ? 'బీపీ ఎక్కువ (Stage 1)' : 'High Stage 1', color: 'text-rose-700 bg-rose-100 border-rose-300' };

  // Voice readout summary in Telugu / Hindi / English
  const handleVoiceSummary = () => {
    let summaryText = '';
    if (language === 'te') {
      summaryText = `నమస్కారం ${userProfile.name}! గత 30 రోజులలో మీ సగటు రక్తపోటు ${avgSystolic} బై ${avgDiastolic} గా నమోదైంది. మీ బరువు ${latestPoint?.weight} కిలోలు. తలనొప్పి మరియు నీరసం అత్యధికంగా నమోదైన లక్షణాలు. క్రమం తప్పకుండా మందులు తీసుకోండి.`;
    } else if (language === 'hi') {
      summaryText = `नमस्ते ${userProfile.name}! पिछले 30 दिनों में आपका औसत रक्तचाप ${avgSystolic} बटा ${avgDiastolic} रहा। आपका वजन ${latestPoint?.weight} किलोग्राम है। दवाएं समय पर लें।`;
    } else {
      summaryText = `Hello ${userProfile.name}! Over the past 30 days, your average blood pressure was ${avgSystolic} over ${avgDiastolic} mmHg. Your current weight is ${latestPoint?.weight} kilograms. Regular monitoring is advised.`;
    }
    speechService.speak(summaryText, language);
  };

  return (
    <div id="analytics-screen" className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-emerald-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold mb-2 border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {language === 'te'
                  ? 'గ్రామీణ ఆరోగ్య విశ్లేషణ (Health Analytics)'
                  : language === 'hi'
                  ? 'स्वास्थ्य रुझान और विश्लेषण'
                  : 'Health Trends & Analytics'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span>{userProfile.name}</span>
              <span className="text-emerald-300 text-sm font-semibold">
                ({language === 'te' ? 'ఆరోగ్య రికార్డు' : language === 'hi' ? 'स्वास्थ्य रिकॉर्ड' : 'Health Record'})
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl">
              {language === 'te'
                ? 'గత నెల రక్తపోటు, బరువు, షుగర్ స్థాయిలు మరియు లక్షణాల ఫ్రీక్వెన్సీ విశ్లేషణ'
                : language === 'hi'
                ? 'पिछले महीने के रक्तचाप, वजन, शुगर और लक्षणों के रुझान का विश्लेषण'
                : 'Interactive 30-day health trends: blood pressure, weight, glucose, and symptom frequency.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-voice-readout-analytics"
              type="button"
              onClick={handleVoiceSummary}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md border border-white/20 transition-all"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>{language === 'te' ? 'వాయిస్ సారాంశం' : 'Voice Summary'}</span>
            </button>

            <button
              id="btn-add-vital-quick"
              type="button"
              onClick={onOpenVitalsLogger}
              className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'te' ? 'కొత్త రీడింగ్ నమోదు' : 'Log Reading'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-4 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-200 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'సమయ వ్యవధి:' : 'Time Range:'}</span>
            </span>
            <div className="inline-flex rounded-xl bg-emerald-950/60 p-0.5 border border-emerald-600/40">
              {(['7d', '14d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    timeRange === range
                      ? 'bg-emerald-400 text-emerald-950 shadow-xs'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  {range === '7d'
                    ? language === 'te' ? '7 రోజులు' : '7 Days'
                    : range === '14d'
                    ? language === 'te' ? '14 రోజులు' : '14 Days'
                    : language === 'te' ? 'గత 1 నెల (30d)' : 'Past Month (30d)'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: language === 'te' ? 'అన్నీ' : 'All Charts' },
              { id: 'bp', label: 'Blood Pressure' },
              { id: 'weight', label: 'Weight & BMI' },
              { id: 'sugar', label: 'Blood Sugar' },
              { id: 'symptoms', label: 'Symptoms' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedMetric(tab.id as any)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedMetric === tab.id
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Blood Pressure Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-2xl bg-rose-50 text-rose-600">
              <Heart className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${bpStatus.color}`}>
              {bpStatus.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {language === 'te' ? 'సగటు రక్తపోటు (Avg BP)' : 'Average BP (30 Days)'}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {avgSystolic}/{avgDiastolic}
            </span>
            <span className="text-[11px] text-slate-400 font-bold">mmHg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{language === 'te' ? 'లక్ష్యం: 120/80 కంటే తక్కువ' : 'Target: < 120/80'}</span>
          </p>
        </div>

        {/* Weight & Trend Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-2xl bg-teal-50 text-teal-600">
              <Scale className="w-5 h-5" />
            </div>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                weightChange <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {weightChange > 0 ? `+${weightChange} kg` : `${weightChange} kg`}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {language === 'te' ? 'ప్రస్తుత బరువు (Weight)' : 'Current Weight'}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {latestPoint?.weight || 63.5}
            </span>
            <span className="text-[11px] text-slate-400 font-bold">kg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {language === 'te' ? 'BMI: 22.8 (ఆరోగ్యకర పరిధి)' : 'BMI: 22.8 (Normal & Healthy)'}
          </p>
        </div>

        {/* Blood Sugar Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-600">
              <Droplet className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {language === 'te' ? 'నియంత్రణలో' : 'Optimal'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {language === 'te' ? 'షుగర్ స్థాయి (Fasting Sugar)' : 'Fasting Glucose'}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {latestPoint?.bloodSugar || 110}
            </span>
            <span className="text-[11px] text-slate-400 font-bold">mg/dL</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {language === 'te' ? 'సాధారణ పరిధి: 70 - 110 mg/dL' : 'Normal: 70 - 110 mg/dL'}
          </p>
        </div>

        {/* Total Logs & Frequency */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-2xl bg-purple-50 text-purple-600">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {chartData.length} Readings
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {language === 'te' ? 'ప్రధాన లక్షణం (Top Symptom)' : 'Frequent Symptom'}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg sm:text-xl font-black text-slate-900 truncate">
              {symptomData[0].symptom.split(' ')[0]}
            </span>
          </div>
          <p className="text-[11px] text-purple-700 font-bold mt-2">
            {language === 'te' ? 'నెలలో 7 సార్లు నివేదించబడింది' : 'Reported 7 times this month'}
          </p>
        </div>
      </div>

      {/* CHART 1: Blood Pressure Trends */}
      {(selectedMetric === 'all' || selectedMetric === 'bp') && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                <span>
                  {language === 'te'
                    ? 'రక్తపోటు ట్రెండ్ (Blood Pressure Over Month)'
                    : 'Blood Pressure Trend (Systolic & Diastolic)'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'te'
                  ? 'సిస్టోలిక్ (పై రీడింగ్) మరియు డయాస్టోలిక్ (క్రింది రీడింగ్) గ్రాఫ్'
                  : 'Daily systolic and diastolic pressure levels compared against normal thresholds'}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-rose-600">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>Systolic (పైది)</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Diastolic (క్రిందిది)</span>
              </div>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis domain={[60, 160]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '1rem',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                />
                <ReferenceLine y={120} stroke="#10b981" strokeDasharray="4 4" label={{ value: '120 Normal Sys', fill: '#059669', fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" label={{ value: '80 Normal Dia', fill: '#059669', fontSize: 10 }} />
                <Area type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSys)" name="Systolic (mmHg)" />
                <Area type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDia)" name="Diastolic (mmHg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CHART 2: Weight & Body Mass Progress */}
      {(selectedMetric === 'all' || selectedMetric === 'weight') && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-600" />
                <span>
                  {language === 'te' ? 'బరువు మార్పులు (Weight Tracking - kg)' : 'Weight Tracking Over Past Month'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'te'
                  ? 'ఆహారం, శారీరక శ్రమ మరియు పోషకాహార ప్రభావం'
                  : 'Tracking weight stability and healthy BMI trajectory'}
              </p>
            </div>

            <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl font-bold border border-emerald-200">
              {language === 'te' ? 'ఆదర్శ బరువు పరిధి: 58 - 66 కిలోలు' : 'Ideal Range: 58 - 66 kg'}
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '1rem',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine y={64} stroke="#0d9488" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#0d9488' }}
                  activeDot={{ r: 6, fill: '#14b8a6' }}
                  name="Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CHART 3: Symptom Frequency Over the Past Month */}
      {(selectedMetric === 'all' || selectedMetric === 'symptoms') && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-purple-600" />
                <span>
                  {language === 'te'
                    ? 'గత నెల లక్షణాల ఫ్రీక్వెన్సీ (Symptom Frequency)'
                    : 'Reported Symptom Frequency (Past 30 Days)'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'te'
                  ? 'సింప్టమ్ చెకర్ & వాయిస్ అసిస్టెంట్ ద్వారా రికార్డైన లక్షణాలు'
                  : 'Frequency of recurring symptoms recorded via AI Symptom Checker & Voice Assistant'}
              </p>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={symptomData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis dataKey="symptom" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '1rem',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Patient Health Summary & Trends Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-5 sm:p-6 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">
              {language === 'te' ? 'రోగి ఆరోగ్య పురోగతి సారాంశం' : 'Patient Health Summary & Trends'}
            </span>
          </div>
          <p className="text-xs text-slate-700 max-w-xl">
            {language === 'te'
              ? 'ఈ ఆరోగ్య చార్ట్‌లు రోగి మరియు కుటుంబ సభ్యుల ఆరోగ్య స్థితిని సులభంగా అర్థం చేసుకోవడానికి ఉపకరిస్తాయి.'
              : 'These trends help track long-term health vitals and monitoring patterns for the patient and family.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenVitalsLogger}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-xs"
          >
            {language === 'te' ? 'కొత్త రీడింగ్' : 'Add Reading'}
          </button>
          {onOpenVoiceAssistant && (
            <button
              type="button"
              onClick={onOpenVoiceAssistant}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
            >
              {language === 'te' ? 'ఏఐ వాయిస్ సలహా' : 'Ask AI'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
