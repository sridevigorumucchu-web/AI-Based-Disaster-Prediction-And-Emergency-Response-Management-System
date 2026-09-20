import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Building2, 
  Car, 
  Home, 
  Wheat, 
  Hospital, 
  School,
  Share2
} from 'lucide-react';
import { generateDamagePDFReport } from './DamageReportPDFGenerator';

export default function DamageAssessmentSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [damageResult, setDamageResult] = useState<{
    disasterType: string;
    damageCategory: string;
    damageLevel: string;
    severity: string;
    confidence: number;
    visualEvidence: string[];
    aiExplanation: string;
  } | null>(null);

  const [assetType, setAssetType] = useState<string>('Residential Houses');

  const ASSET_TYPES = [
    { id: 'Houses', label: 'Residential Houses', icon: Home },
    { id: 'Roads', label: 'Roads & Bridges', icon: Building2 },
    { id: 'Crops', label: 'Agricultural Crops', icon: Wheat },
    { id: 'Vehicles', label: 'Vehicles & Transport', icon: Car },
    { id: 'Schools', label: 'Schools & Education', icon: School },
    { id: 'Hospitals', label: 'Hospitals & Medical', icon: Hospital },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setDamageResult(null);
      setErrorMsg(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleRunAssessment = async () => {
    if (!selectedFile && !imagePreview) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      let b64 = "";
      let detectedMime = "image/jpeg";
      if (selectedFile) {
        b64 = await fileToBase64(selectedFile);
        detectedMime = selectedFile.type || "image/jpeg";
      } else if (imagePreview && imagePreview.startsWith("data:")) {
        b64 = imagePreview;
        const match = imagePreview.match(/^data:([a-zA-Z0-9/.-]+);base64,/);
        if (match) detectedMime = match[1];
      }

      if (!b64) {
        setErrorMsg("Please select or upload a visual image file first.");
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch("/api/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile?.name || "inspected_media.jpg",
          mimeType: detectedMime,
          videoData: b64,
          frames: [{ timestamp: 0, base64: b64 }],
          assetType
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const res = data.result;

      if (!res) {
        throw new Error("No analysis result received from server");
      }

      setDamageResult({
        disasterType: res.disaster_type || "UNKNOWN",
        damageCategory: assetType,
        damageLevel: res.damage_level || "NONE",
        severity: res.severity_label || String(res.severity) || "LOW",
        confidence: res.confidence ?? 0,
        visualEvidence: Array.isArray(res.visual_evidence) ? res.visual_evidence : [],
        aiExplanation: res.damage_explanation || res.reason || "Visual inspection completed."
      });
    } catch (err: any) {
      console.error("Damage assessment failed:", err);
      setErrorMsg("Assessment request failed. Please try again with a clear image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!damageResult) return;

    const savedUser = localStorage.getItem('aegis_google_account');
    let name = "Field Surveyor";
    let email = "surveyor@disaster-response.gov.in";
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) name = u.name;
        if (u.email) email = u.email;
      } catch (e) {}
    }

    generateDamagePDFReport({
      reportId: `NDMA-DM-${Math.floor(100000 + Math.random() * 900000)}`,
      userName: name,
      userEmail: email,
      locationName: "Regional Operations Node",
      gpsCoords: "17.6868° N, 83.2185° E",
      timestamp: new Date().toLocaleString(),
      disasterType: damageResult.disasterType,
      damageCategory: damageResult.damageCategory,
      damageLevel: damageResult.damageLevel,
      severity: damageResult.severity,
      confidence: damageResult.confidence,
      visualEvidence: damageResult.visualEvidence,
      aiExplanation: damageResult.aiExplanation
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6" id="damage_assessment_section_root">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-black block">
            📸 COMPUTER VISION DAMAGE ASSESSMENT & PDF REPORT
          </span>
          <h2 className="text-lg font-black tracking-tight text-slate-100 font-sans mt-0.5">
            AI INFRASTRUCTURE & PROPERTY DAMAGE ESTIMATOR
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Upload images or videos of damaged property to receive real-time AI visual disaster classification and visible damage assessment for official survey documentation.
          </p>
        </div>
      </div>

      {/* Select Asset Category */}
      <div className="space-y-2 font-mono">
        <label className="text-xs font-bold text-slate-300 block">Select Damaged Property Category:</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {ASSET_TYPES.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => {
                  setAssetType(a.label);
                  setDamageResult(null);
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  assetType === a.label
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] text-center leading-tight">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl p-6 text-center space-y-3 font-mono">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
            id="damage_file_input"
          />
          <label htmlFor="damage_file_input" className="cursor-pointer space-y-2 block">
            <UploadCloud className="w-10 h-10 text-cyan-400 mx-auto animate-bounce" />
            <span className="text-xs font-bold text-slate-200 block">
              Click or drag damage photos/videos here
            </span>
            <span className="text-[10px] text-slate-500 block">
              Supports JPEG, PNG, MP4 files up to 500MB
            </span>
          </label>
        </div>

        {/* Preview & Action */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase">Selected Asset Media Preview</h4>
          {imagePreview ? (
            <img src={imagePreview} alt="Damage Preview" className="w-full h-40 object-cover rounded-lg border border-slate-800" />
          ) : (
            <div className="w-full h-40 bg-slate-900 border border-slate-800/80 rounded-lg flex items-center justify-center text-slate-600 text-xs">
              No media selected yet
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-900/60 p-2.5 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleRunAssessment}
            disabled={isAnalyzing || (!selectedFile && !imagePreview)}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Running Computer Vision Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Analyze Disaster & Property Damage</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Assessment Result & PDF Download Card */}
      {damageResult && (
        <div className="bg-slate-950 border border-cyan-500/50 rounded-xl p-5 space-y-4 font-mono shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase">
                AI Assessment Complete: {damageResult.damageCategory}
              </h3>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded font-bold border ${
              damageResult.severity === 'CRITICAL'
                ? 'bg-red-950 text-red-300 border-red-800'
                : damageResult.severity === 'HIGH'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : damageResult.severity === 'MEDIUM'
                ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}>
              {damageResult.severity} SEVERITY
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Disaster Type</span>
              <strong className={`font-bold text-sm ${
                damageResult.disasterType === 'FIRE' ? 'text-amber-400' :
                damageResult.disasterType === 'FLOOD' ? 'text-blue-400' :
                damageResult.disasterType === 'EARTHQUAKE' ? 'text-orange-400' :
                damageResult.disasterType === 'CYCLONE' ? 'text-cyan-400' :
                damageResult.disasterType === 'LANDSLIDE' ? 'text-emerald-400' :
                'text-slate-300'
              }`}>{damageResult.disasterType}</strong>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Visible Damage Level</span>
              <strong className="text-red-400 font-bold text-sm">{damageResult.damageLevel}</strong>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">AI Model Confidence</span>
              <strong className="text-emerald-400 font-bold text-sm">{damageResult.confidence}%</strong>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Severity Rating</span>
              <strong className="text-cyan-300 font-bold text-sm">{damageResult.severity}</strong>
            </div>
          </div>

          {damageResult.visualEvidence.length > 0 && (
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Verified Visual Evidence:
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-200">
                {damageResult.visualEvidence.map((ev, idx) => (
                  <li key={idx}>{ev}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
            <strong>AI Field Note:</strong> {damageResult.aiExplanation}
          </p>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleDownloadPDF}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 transition shadow-xl cursor-pointer uppercase tracking-wider"
              id="download_damage_pdf_button"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download Official PDF Damage Report</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
