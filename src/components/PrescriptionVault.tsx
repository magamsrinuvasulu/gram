import React, { useState, useRef } from 'react';
import {
  FileText,
  Camera,
  Upload,
  Volume2,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { speechService } from '../services/speechService';

interface PrescriptionVaultProps {
  language: Language;
}

export const PrescriptionVault: React.FC<PrescriptionVaultProps> = ({ language }) => {
  const t = translations[language];

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        analyzePrescription(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePrescription = async (base64: string) => {
    setIsScanning(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/health-ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          language,
          documentType: 'prescription',
        }),
      });

      const data = await response.json();
      setAnalysisResult(data.analysis);

      // Auto read aloud
      speechService.speak(data.analysis, language);
    } catch (err) {
      console.error('Prescription OCR error:', err);
      setAnalysisResult('Failed to analyze document. Please ensure photo is clear and well-lit.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 rounded-3xl shadow-lg border border-emerald-600">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl">
            <FileText className="w-7 h-7 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t.navPrescriptions}</h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              AI Prescription & Report Scanner with Audio Guide
            </p>
          </div>
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-emerald-300 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl text-emerald-700 flex items-center justify-center">
          <Camera className="w-8 h-8" />
        </div>

        <div>
          <h3 className="font-bold text-slate-900 text-base">{t.attachPrescription}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Upload prescription slip, lab report, or medicine packaging photo.
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-2 mx-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload or Take Photo</span>
        </button>
      </div>

      {/* Image Preview & OCR Analysis */}
      {imagePreview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Uploaded Document</h4>
            <img
              src={imagePreview}
              alt="Uploaded Document"
              className="rounded-2xl max-h-72 w-full object-contain bg-slate-50 border border-slate-200"
            />
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-700" />
                <span>AI Health Analysis</span>
              </h4>

              {analysisResult && (
                <button
                  onClick={() => speechService.speak(analysisResult, language)}
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl flex items-center gap-1 text-xs font-bold"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{t.readAloud}</span>
                </button>
              )}
            </div>

            {isScanning ? (
              <div className="py-8 text-center space-y-2 text-slate-500">
                <Sparkles className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs font-bold">Scanning prescription text with AI OCR...</p>
              </div>
            ) : analysisResult ? (
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                {analysisResult}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
