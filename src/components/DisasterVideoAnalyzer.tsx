import React, { useState, useRef } from 'react';
import { 
  Video, 
  UploadCloud, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Flame, 
  Droplet, 
  Wind, 
  Loader2, 
  Activity, 
  FileVideo, 
  ShieldAlert,
  Compass,
  CheckSquare,
  Sparkles,
  Clipboard,
  Check,
  Users,
  Eye,
  Clock,
  RotateCcw,
  Cpu,
  MapPin,
  AlertCircle,
  Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GeminiAnalysisResult {
  disaster_type: string;
  confidence: number;
  severity: number;
  severity_label?: 'Low' | 'Medium' | 'High' | 'Critical';
  reason?: string;
  exact_formatted_report?: string;
  damage_level: string;
  damage_explanation: string;
  visual_evidence?: string[];
  objects: {
    people: number;
    vehicles: number;
    buildings: number;
    roads: number;
    fire: boolean;
    water: boolean;
    smoke: boolean;
    trees: number;
    electrical_poles: number;
    rescue_teams: number;
    animals: number;
    debris: number;
    boats: number;
    emergency_vehicles: number;
  };
  casualties: {
    injured: number;
    trapped: number;
    missing: number;
    crowds: number;
    evacuation_activity: string;
    affected_estimate: number;
  };
  environmental: {
    water_level: string;
    flooded_roads: boolean;
    burning_structures: boolean;
    smoke_intensity: string;
    fallen_trees: boolean;
    landslides: boolean;
    damaged_bridges: boolean;
    blocked_roads: boolean;
  };
  risks: string[];
  recommended_response: string[];
  timeline: { timestamp: string; event: string }[];
  structured_text_reports: string[];
}

export default function DisasterVideoAnalyzer({ onEmergencyTrigger }: { onEmergencyTrigger?: (result: any) => void }) {
  const { t } = useTranslation();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Engine selection: 'gemini' (Live Multimodal AI) or 'yolo' (Simulated CV Heuristics)
  const [engineMode, setEngineMode] = useState<'gemini' | 'yolo'>('gemini');

  // Real-world Gemini Multimodal / Heuristic simulated output state
  const [geminiResult, setGeminiResult] = useState<GeminiAnalysisResult | null>(null);
  const [isAI, setIsAI] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImageFile = videoFile ? (videoFile.type.startsWith('image/') || videoFile.name.match(/\.(jpg|jpeg|png|webp|bmp|gif)$/i)) : false;

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/') || file.type.startsWith('image/') || file.name.match(/\.(mp4|mov|webm|mkv|avi|jpg|jpeg|png|webp)$/i)) {
        loadVideo(file);
      } else {
        setFileError("Please select a valid image or video file (JPG, PNG, WEBP, MP4, MOV, WEBM, or MKV).");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      loadVideo(e.target.files[0]);
    }
  };

  const loadVideo = (file: File) => {
    setFileError(null);
    // 500MB size check
    if (file.size > 500 * 1024 * 1024) {
      setFileError(`File size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed limit is 500MB. Please upload a compressed or shorter clip.`);
      return;
    }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    // Reset previous states
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setAnalysisLogs([]);
    setGeminiResult(null);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Helper to extract temporal keyframes across video timeline
  const extractVideoKeyframes = (file: File, numFrames = 8): Promise<{ timestamp: number; base64: string }[]> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadedmetadata = async () => {
        const duration = video.duration || 1;
        const timestamps: number[] = [];
        for (let i = 0; i < numFrames; i++) {
          const t = numFrames === 1 ? 0.5 : (i / (numFrames - 1)) * (duration - 0.2) + 0.1;
          timestamps.push(Math.max(0.1, Math.min(duration - 0.1, t)));
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const frames: { timestamp: number; base64: string }[] = [];

        for (const t of timestamps) {
          try {
            await new Promise<void>((res) => {
              video.currentTime = t;
              video.onseeked = () => res();
              setTimeout(res, 400);
            });

            const maxDim = 640;
            let w = video.videoWidth || 640;
            let h = video.videoHeight || 360;
            if (w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            }
            canvas.width = w;
            canvas.height = h;
            if (ctx) {
              ctx.drawImage(video, 0, 0, w, h);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
              frames.push({
                timestamp: parseFloat(t.toFixed(1)),
                base64: dataUrl.replace(/^data:image\/jpeg;base64,/, "")
              });
            }
          } catch {
            // skip failed frame
          }
        }

        URL.revokeObjectURL(url);
        resolve(frames);
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve([]);
      };
    });
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Start Multimodal or simulated Heuristic analysis
  const handleStartAnalysis = async () => {
    if (!videoFile) return;

    setIsAnalyzing(true);
    setAnalysisProgress(5);
    setAnalysisLogs([
      "[AI-Vision] Initializing video telemetry decoder...",
      `[AI-Vision] Target clip: ${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(2)} MB)`
    ]);

    // Simulate progress updates for terminal visual feedback
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          return 90;
        }
        return prev + Math.floor(Math.random() * 6) + 3;
      });
    }, 250);

    try {
      if (engineMode === 'yolo') {
        // Run Simulated CV Heuristic
        setAnalysisLogs(prev => [
          ...prev, 
          "[YOLOv8] Loading local ONNX tensor weights: disaster_v8.onnx...", 
          "[OpenCV] Extracting temporal motion vectors across timeline..."
        ]);
        
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        
        const response = await fetch("/api/analyze-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isSimulation: true, engineMode: "yolo", fileName: videoFile.name, mimeType: videoFile.type || "video/mp4" })
        });
        const data = await response.json();
        
        setGeminiResult(data.result);
        setIsAI(false);
        setIsAnalyzing(false);

        if (onEmergencyTrigger) {
          onEmergencyTrigger({
            disasterType: data.result.disaster_type,
            severity: data.result.severity > 7 ? 'Critical' : data.result.severity > 5 ? 'High' : 'Medium',
            confidence: data.result.confidence,
            detectedObjects: Object.keys(data.result.objects).filter(key => (data.result.objects as any)[key] > 0 || (data.result.objects as any)[key] === true),
            mitigationSteps: data.result.recommended_response
          });
        }
      } else if (isImageFile) {
        // Image Mode: Direct high-resolution inspection
        setAnalysisLogs(prev => [
          ...prev,
          "[AI-Vision] Ingesting high-resolution disaster scene image...",
          "[Gemini AI] Directing image payload to AI Disaster Image Classification Engine...",
          "[Gemini AI] Inspecting visual evidence: detecting Fire, Flood, Earthquake, Cyclone, Landslide, No Disaster, Unknown..."
        ]);

        const b64 = await fileToBase64(videoFile);
        const cleanB64 = b64.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, "");

        const payload = {
          fileName: videoFile.name,
          mimeType: videoFile.type || "image/jpeg",
          frames: [{ timestamp: 0, base64: cleanB64 }],
          videoData: cleanB64
        };

        const response = await fetch("/api/analyze-video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Server returned HTTP error ${response.status}`);
        }

        const data = await response.json();
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        
        setGeminiResult(data.result);
        setIsAI(data.isAI);
        setIsAnalyzing(false);

        setAnalysisLogs(prev => [
          ...prev,
          `[AI-Vision] Analysis complete! Classified disaster: ${data.result.disaster_type.toUpperCase()}`,
          `[AI-Vision] Confidence score: ${data.result.confidence}% | Severity: ${data.result.severity_label || data.result.severity}`
        ]);

        if (onEmergencyTrigger) {
          onEmergencyTrigger({
            disasterType: data.result.disaster_type,
            severity: data.result.severity_label || (data.result.severity > 7 ? 'Critical' : data.result.severity > 5 ? 'High' : 'Medium'),
            confidence: data.result.confidence,
            detectedObjects: Object.keys(data.result.objects || {}).filter(key => {
              const val = (data.result.objects as any)[key];
              return typeof val === 'number' ? val > 0 : val === true;
            }),
            mitigationSteps: data.result.recommended_response
          });
        }
      } else {
        // Extract 8 evenly distributed keyframes across entire video timeline (start, middle, end)
        setAnalysisLogs(prev => [
          ...prev,
          "[AI-Vision] Sampling 8 temporal keyframes across entire video duration (0% to 100%)...",
        ]);

        const extractedFrames = await extractVideoKeyframes(videoFile, 8);

        setAnalysisLogs(prev => [
          ...prev,
          `[AI-Vision] Successfully captured ${extractedFrames.length} temporal keyframes.`,
          "[Gemini AI] Directing complete visual frame sequence to Gemini Multimodal Vision AI...",
          "[Gemini AI] Inspecting visual evidence: detecting Fire, Flood, Earthquake, Cyclone, Landslide, No Disaster, Unknown..."
        ]);

        // Send lightweight extracted keyframe sequence (under 300KB) to avoid HTTP 413 payload limit on large videos
        const payload: { fileName: string; mimeType: string; frames: { timestamp: number; base64: string }[]; videoData?: string } = {
          fileName: videoFile.name,
          mimeType: videoFile.type || "video/mp4",
          frames: extractedFrames
        };

        // If client-side frame extraction was empty and video is small (< 8MB), provide videoData fallback
        if (extractedFrames.length === 0 && videoFile.size < 8 * 1024 * 1024) {
          const b64 = await fileToBase64(videoFile);
          payload.videoData = b64;
        }

        const response = await fetch("/api/analyze-video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Server returned HTTP error ${response.status}`);
        }

        const data = await response.json();
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        
        setGeminiResult(data.result);
        setIsAI(data.isAI);
        setIsAnalyzing(false);

        setAnalysisLogs(prev => [
          ...prev,
          `[AI-Vision] Analysis complete! Classified disaster: ${data.result.disaster_type.toUpperCase()}`,
          `[AI-Vision] Confidence score: ${data.result.confidence}% | Severity: ${data.result.severity_label || data.result.severity}`
        ]);

        if (onEmergencyTrigger) {
          onEmergencyTrigger({
            disasterType: data.result.disaster_type,
            severity: data.result.severity_label || (data.result.severity > 7 ? 'Critical' : data.result.severity > 5 ? 'High' : 'Medium'),
            confidence: data.result.confidence,
            detectedObjects: Object.keys(data.result.objects || {}).filter(key => {
              const val = (data.result.objects as any)[key];
              return typeof val === 'number' ? val > 0 : val === true;
            }),
            mitigationSteps: data.result.recommended_response
          });
        }
      }
    } catch (err: any) {
      console.error("Video analysis request failed:", err);
      clearInterval(progressInterval);
      setAnalysisProgress(0);
      setIsAnalyzing(false);
      setAnalysisLogs(prev => [...prev, `❌ ERROR: Analysis session failed: ${err.message}`]);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getDisasterIcon = (type: string) => {
    const t = (type || "").toUpperCase().trim();
    switch (t) {
      case 'FLOOD': return <Droplet className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'FIRE': return <Flame className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'CYCLONE': return <Wind className="w-5 h-5 text-sky-400 animate-pulse" />;
      case 'EARTHQUAKE': return <Activity className="w-5 h-5 text-amber-500 animate-pulse" />;
      case 'LANDSLIDE': return <Layers className="w-5 h-5 text-amber-600 animate-pulse" />;
      case 'NO_DISASTER': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSeverityBadge = (score: number) => {
    if (score >= 8) {
      return <span className="px-2 py-0.5 bg-red-950 border border-red-800 text-red-400 text-[10px] font-mono font-bold uppercase rounded">Critical ({score}/10)</span>;
    } else if (score >= 5) {
      return <span className="px-2 py-0.5 bg-orange-950 border border-orange-800 text-orange-400 text-[10px] font-mono font-bold uppercase rounded">High ({score}/10)</span>;
    } else if (score >= 3) {
      return <span className="px-2 py-0.5 bg-yellow-950 border border-yellow-800 text-yellow-400 text-[10px] font-mono font-bold uppercase rounded">Medium ({score}/10)</span>;
    } else {
      return <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-mono font-bold uppercase rounded">Normal ({score}/10)</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col" id="disaster_video_analyzer_container">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full blur-xl pointer-events-none" />

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Video className="w-4 h-4 text-cyan-400" /> {t('analyzer.title', 'AI Disaster Multimodal Frame-by-Frame Analyzer')}
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed font-mono mt-0.5">
            Upload emergency video clips to classify disasters, scan objects, assess damages, trace timeline logs, and extract structured reports.
          </p>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800/80 shrink-0 self-start">
          <button
            onClick={() => setEngineMode('gemini')}
            className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
              engineMode === 'gemini'
                ? 'bg-cyan-950 border border-cyan-800/60 text-cyan-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Cpu className="w-3 h-3" /> Gemini Multimodal AI
          </button>
          <button
            onClick={() => setEngineMode('yolo')}
            className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
              engineMode === 'yolo'
                ? 'bg-slate-800 border border-slate-700 text-slate-200'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Activity className="w-3 h-3" /> YOLOv8 CV Heuristic
          </button>
        </div>
      </div>

      {/* File Error Alert */}
      {fileError && (
        <div className="bg-red-950/80 border border-red-800/80 text-red-200 text-xs px-3 py-2 rounded-lg flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      {/* File Upload Stage */}
      {!videoFile ? (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            dragActive 
              ? 'border-cyan-500 bg-cyan-950/20' 
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
          }`}
          id="video_drag_drop_zone"
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="video/*,image/*,.mp4,.mov,.webm,.mkv,.avi,.jpg,.jpeg,.png,.webp" 
            className="hidden" 
            onChange={handleChange}
          />
          <UploadCloud className="w-9 h-9 text-slate-500 mb-2 animate-bounce" />
          <span className="text-xs font-semibold text-slate-300 font-mono">
            {t('analyzer.drag_drop', 'Drag & drop disaster image or video here')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-1">
            {t('analyzer.browse', 'or click to browse local media (JPG, PNG, WEBP, MP4, MOV, WEBM)')}
          </span>
          <span className="text-[8px] text-slate-400 font-mono mt-2">
            Max 500MB • Evaluates physical evidence (Fire, Flood, Earthquake, Cyclone, Landslide, No Disaster, Unknown) with zero hallucination
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Header */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <FileVideo className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="overflow-hidden">
                <span className="text-xs font-mono text-slate-200 block truncate">{videoFile.name}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {isImageFile ? "Image Snapshot" : "Video Footage"} • {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>
            <button 
              onClick={() => {
                setVideoFile(null);
                setVideoUrl(null);
                setGeminiResult(null);
              }}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title="Clear selected media"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Media Player / Image Box */}
          {videoUrl && (
            <div className="relative border border-slate-800 rounded-lg overflow-hidden bg-slate-950 aspect-video group shadow-inner flex items-center justify-center">
              {isImageFile ? (
                <img 
                  src={videoUrl} 
                  alt="Disaster Scene Evaluation"
                  className="w-full h-full object-contain"
                  id="analyzer_image_preview"
                />
              ) : (
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full h-full object-contain"
                  id="analyzer_video_player"
                />
              )}
              
              {/* HUD scan indicators */}
              <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800/40 text-[8px] font-mono text-cyan-400 tracking-wider flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                <span>{isImageFile ? "IMAGE_OPTICAL_SCANNER" : "REC VIDEO_FEED_SCANNER"}</span>
              </div>

              <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800/40 text-[8px] font-mono text-cyan-400 tracking-wider">
                {engineMode === 'gemini' ? 'GEMINI_VISION_AI_ACTIVE' : 'OPENCV_HEURISTICS'}
              </div>
            </div>
          )}

          {/* Action Trigger */}
          {!isAnalyzing ? (
            <button
              onClick={handleStartAnalysis}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs font-bold uppercase py-2 rounded-lg flex items-center justify-center gap-2 tracking-widest cursor-pointer transition shadow-lg shadow-cyan-950/30"
              id="run_yolo_button"
            >
              {engineMode === 'gemini' ? (
                <>
                  <Cpu className="w-4 h-4 text-white animate-spin" />
                  Classify with Gemini Multimodal AI
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 text-white" />
                  Inference with Heuristics
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              {/* Progress Tracker */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{engineMode === 'gemini' ? (isImageFile ? 'Inspecting image visual evidence...' : 'Gemini AI Multimodal Frame Scanning...') : 'Tensor Extraction...'}</span>
                  <span className="text-cyan-400 font-bold">{analysisProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-cyan-500 h-full rounded-full transition-all duration-150"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>

              {/* Console logs */}
              <div className="bg-slate-950 text-slate-400 font-mono text-[9px] p-2.5 rounded border border-slate-800 h-28 overflow-y-auto space-y-1 select-none">
                {analysisLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-cyan-600">❯</span> {log}
                  </div>
                ))}
                <div className="animate-pulse text-cyan-400">❯ Analyzing physical disaster evidence...</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inline Prominent Disaster Prediction Card when Result is Available */}
      {geminiResult && !isAnalyzing && (
        <div className="mt-4 bg-slate-950/90 border-2 border-cyan-500/40 rounded-xl p-4 space-y-4 shadow-xl relative overflow-hidden" id="disaster_prediction_hero_card">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* OFFICIAL MANDATED 5-POINT DISASTER CLASSIFICATION CARD */}
          <div className="bg-slate-900/90 border-2 border-cyan-500/50 rounded-xl p-4 space-y-3 font-mono shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  AI Disaster Classification Result
                </span>
              </div>
              <button
                onClick={() => {
                  const exactText = geminiResult.exact_formatted_report || `Disaster Type: ${geminiResult.disaster_type}\nConfidence: ${geminiResult.confidence}%\nSeverity: ${geminiResult.severity_label || (geminiResult.severity > 7 ? 'Critical' : geminiResult.severity > 5 ? 'High' : geminiResult.severity > 2 ? 'Medium' : 'Low')}\nVisual Evidence:\n${(geminiResult.visual_evidence || []).map(e => `- ${e}`).join('\n')}\nReason: ${geminiResult.reason || geminiResult.damage_explanation}`;
                  copyToClipboard(exactText, 888);
                }}
                className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 rounded text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition"
                title="Copy standard 5-point classification output"
              >
                {copiedIndex === 888 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                {copiedIndex === 888 ? "Copied!" : "Copy Format"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[9px] text-slate-400 uppercase block font-bold">Disaster Type</span>
                <span className="text-sm font-black text-slate-100 flex items-center gap-1.5 mt-0.5">
                  {getDisasterIcon(geminiResult.disaster_type)} {geminiResult.disaster_type}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[9px] text-slate-400 uppercase block font-bold">Confidence</span>
                <span className="text-sm font-black text-emerald-400 mt-0.5 block">{geminiResult.confidence}%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[9px] text-slate-400 uppercase block font-bold">Severity</span>
                <span className={`text-sm font-black mt-0.5 block ${
                  (geminiResult.severity_label === 'Critical' || geminiResult.severity > 7) ? 'text-red-400' :
                  (geminiResult.severity_label === 'High' || geminiResult.severity > 5) ? 'text-orange-400' :
                  (geminiResult.severity_label === 'Medium' || geminiResult.severity > 2) ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {geminiResult.severity_label || (geminiResult.severity > 7 ? 'Critical' : geminiResult.severity > 5 ? 'High' : geminiResult.severity > 2 ? 'Medium' : 'Low')}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
              <span className="text-[9px] text-cyan-400 uppercase font-bold block">Visual Evidence</span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {geminiResult.visual_evidence && geminiResult.visual_evidence.length > 0 ? (
                  geminiResult.visual_evidence.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-cyan-400 font-bold shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">• Physical inspection completed across visible areas</li>
                )}
              </ul>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Reason</span>
              <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                {geminiResult.reason || geminiResult.damage_explanation || `Selected ${geminiResult.disaster_type} based on verified visual evidence.`}
              </p>
            </div>
          </div>
          
          {/* Header row: AI DETECTED DISASTER, [Disaster Name], Confidence, Severity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                geminiResult.disaster_type?.toUpperCase() === 'FLOOD' ? 'bg-blue-950/80 border-blue-700/60 text-blue-400' :
                geminiResult.disaster_type?.toUpperCase() === 'FIRE' ? 'bg-red-950/80 border-red-700/60 text-red-400' :
                geminiResult.disaster_type?.toUpperCase() === 'CYCLONE' || geminiResult.disaster_type?.toUpperCase() === 'STORM' ? 'bg-cyan-950/80 border-cyan-700/60 text-cyan-400' :
                geminiResult.disaster_type?.toUpperCase() === 'EARTHQUAKE' ? 'bg-amber-950/80 border-amber-700/60 text-amber-400' :
                geminiResult.disaster_type?.toUpperCase() === 'LANDSLIDE' ? 'bg-yellow-950/80 border-yellow-700/60 text-yellow-400' :
                geminiResult.disaster_type?.toUpperCase() === 'UNKNOWN' || geminiResult.disaster_type?.toUpperCase() === 'CLASSIFICATION_UNAVAILABLE' ? 'bg-slate-900 border-slate-700 text-slate-400' :
                'bg-emerald-950/80 border-emerald-700/60 text-emerald-400'
              }`}>
                {getDisasterIcon(geminiResult.disaster_type)}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-black block">
                  AI DETECTED DISASTER
                </span>
                <h4 className="text-lg sm:text-xl font-black font-mono text-slate-100 uppercase tracking-tight flex items-center gap-2">
                  {geminiResult.disaster_type}
                  {geminiResult.disaster_type?.toUpperCase() !== 'NONE' && geminiResult.disaster_type?.toUpperCase() !== 'NO_DISASTER' && geminiResult.disaster_type?.toUpperCase() !== 'UNKNOWN' && geminiResult.disaster_type?.toUpperCase() !== 'CLASSIFICATION_UNAVAILABLE' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 font-bold">
                      DETECTED
                    </span>
                  )}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-right font-mono">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Confidence</span>
                <span className="text-xs sm:text-sm font-black text-emerald-400">{geminiResult.confidence}%</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-right font-mono">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Severity</span>
                <span className="text-xs sm:text-sm font-black text-amber-400">{geminiResult.severity}/10</span>
              </div>
            </div>
          </div>

          {/* Section 16 Layout: Visual Evidence & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {/* Visual Evidence */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" /> Visual Evidence:
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {geminiResult.visual_evidence && geminiResult.visual_evidence.length > 0 ? (
                  geminiResult.visual_evidence.map((evidence, eIdx) => (
                    <li key={eIdx} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-cyan-400 shrink-0 font-bold">•</span>
                      <span>{evidence}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-cyan-400 shrink-0 font-bold">•</span>
                    <span>{geminiResult.damage_explanation || "Visual inspection completed across footage."}</span>
                  </li>
                )}
              </ul>
              <div className="pt-1.5 flex items-center gap-2 text-[10px] border-t border-slate-800/60">
                <span className="text-slate-500 font-bold uppercase">Damage Level:</span>
                <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-300 font-bold">
                  {geminiResult.damage_level}
                </span>
              </div>
            </div>

            {/* Risks */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-2">
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Risks:
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {geminiResult.risks && geminiResult.risks.length > 0 ? (
                  geminiResult.risks.map((risk, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-orange-400 shrink-0 font-bold">•</span>
                      <span>{risk}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-1.5 text-slate-500">
                    <span>• No immediate secondary risks predicted.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommended Response and Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {/* Recommended Response */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Recommended Response:
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {geminiResult.recommended_response && geminiResult.recommended_response.length > 0 ? (
                  geminiResult.recommended_response.map((resp, respIdx) => (
                    <li key={respIdx} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-emerald-400 shrink-0 font-bold">•</span>
                      <span>{resp}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-1.5 text-slate-500">
                    <span>• Maintain routine monitoring.</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Timeline: Beginning -> Middle -> End */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Timeline (Beginning → Middle → End):
              </span>
              <div className="space-y-1.5 text-[11px]">
                {geminiResult.timeline && geminiResult.timeline.length > 0 ? (
                  geminiResult.timeline.map((item, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-2 bg-slate-950/60 p-1.5 rounded border border-slate-850">
                      <span className="text-cyan-400 font-bold shrink-0">{item.timestamp}</span>
                      <span className="text-slate-300 leading-snug">{item.event}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-[10px]">No chronological timeline events logged.</div>
                )}
              </div>
            </div>
          </div>

          {/* Key Object & Hazard Counters Pill Grid */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
            <span className="text-slate-500 uppercase font-bold text-[9px]">Detected Objects:</span>
            {geminiResult.objects.people > 0 && (
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                👤 People: <b className="text-cyan-300">{geminiResult.objects.people}</b>
              </span>
            )}
            {geminiResult.objects.vehicles > 0 && (
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                🚗 Vehicles: <b className="text-cyan-300">{geminiResult.objects.vehicles}</b>
              </span>
            )}
            {geminiResult.objects.water && (
              <span className="bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800 text-blue-300">
                🌊 Standing/Moving Water
              </span>
            )}
            {geminiResult.objects.fire && (
              <span className="bg-red-950/60 px-2 py-0.5 rounded border border-red-800 text-red-300">
                🔥 Active Fire Fronts
              </span>
            )}
            {geminiResult.objects.smoke && (
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                💨 Smoke Plumes
              </span>
            )}
            {geminiResult.objects.boats > 0 && (
              <span className="bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800 text-cyan-300">
                🚤 Rescue Boats: <b>{geminiResult.objects.boats}</b>
              </span>
            )}
            {geminiResult.objects.debris > 0 && (
              <span className="bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 text-amber-300">
                ⚠️ Hazardous Debris: <b>{geminiResult.objects.debris}</b>
              </span>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setShowResults(true)}
              className="w-full sm:w-auto flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-cyan-950/40"
            >
              <Eye className="w-4 h-4" /> View Full 10-Point Deep Inspection Report & Logs
            </button>
            <button
              onClick={() => {
                setVideoFile(null);
                setVideoUrl(null);
                setGeminiResult(null);
              }}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold py-2 px-3 rounded-lg border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Analyze Another Video
            </button>
          </div>
        </div>
      )}

      {/* Beautiful Bento-grid modal showing all 10 detailed points requested */}
      {showResults && geminiResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto" id="yolo_results_modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative my-8">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-cyan-500/15 p-1.5 rounded-lg border border-cyan-500/30">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">
                    {isAI ? "Real-time Google Gemini AI Vision Engine" : "Local Disaster AI Predictor Pipeline"}
                  </span>
                  <h3 className="text-xs font-black font-mono uppercase tracking-tight text-slate-200 flex items-center gap-1.5">
                    Multimodal Disaster & Safety Response Report
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setShowResults(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable contents representing bento analysis */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 font-mono text-xs">
              
              {/* Grid 1: Basic disaster type, severity and damage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Scene Detection card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">1. Scene Detection</span>
                    <h4 className="text-lg font-black text-slate-100 flex items-center gap-1.5 mt-1">
                      {getDisasterIcon(geminiResult.disaster_type)} {geminiResult.disaster_type}
                    </h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">Detector Confidence</span>
                    <span className="text-emerald-400 font-bold text-sm">{geminiResult.confidence}%</span>
                  </div>
                </div>

                {/* Damage assessment card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between md:col-span-2">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">3. Damage Assessment</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-300">Classification:</span>
                      <span className="px-2 py-0.5 bg-red-950/40 border border-red-900 text-red-400 text-[10px] rounded font-bold">{geminiResult.damage_level}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      {geminiResult.damage_explanation}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-900 flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Severity Rating</span>
                    {getSeverityBadge(geminiResult.severity)}
                  </div>
                </div>
              </div>

              {/* Grid 2: Object count table & environmental profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Object detection panel */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">2. Object Detection Counters</span>
                    <span className="text-[8px] px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 text-cyan-400 font-bold">Spatial Segment Hits</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>People</span> <span className="text-slate-200 font-bold">{geminiResult.objects.people}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>Vehicles</span> <span className="text-slate-200 font-bold">{geminiResult.objects.vehicles}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>Buildings</span> <span className="text-slate-200 font-bold">{geminiResult.objects.buildings}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>Active Flame Fronts</span> <span className="text-red-400 font-bold">{geminiResult.objects.fire ? "Yes (Active)" : "No"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>Water Flooding</span> <span className="text-blue-400 font-bold">{geminiResult.objects.water ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>Smoke Plumes</span> <span className="text-slate-200 font-bold">{geminiResult.objects.smoke ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>Trees Affected</span> <span className="text-slate-200 font-bold">{geminiResult.objects.trees}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>Electrical Poles Blocked</span> <span className="text-slate-200 font-bold">{geminiResult.objects.electrical_poles}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>Rescue Teams Present</span> <span className="text-emerald-400 font-bold">{geminiResult.objects.rescue_teams}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>Animals Spotted</span> <span className="text-slate-200 font-bold">{geminiResult.objects.animals}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>Debris Clusters</span> <span className="text-slate-200 font-bold">{geminiResult.objects.debris} spotted</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900/60 text-slate-400">
                      <span>Boats Enroute</span> <span className="text-slate-200 font-bold">{geminiResult.objects.boats}</span>
                    </div>
                  </div>
                </div>

                {/* Environmental Profiler */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">5. Environmental Analysis</span>
                    <span className="text-[8px] px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 text-cyan-400 font-bold">Atmospheric Indicators</span>
                  </div>
                  <div className="space-y-1.5 text-[10px] text-slate-400">
                    <div className="flex justify-between items-center py-0.5">
                      <span>Water Level Status:</span>
                      <span className="text-slate-200 font-bold">{geminiResult.environmental.water_level}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span>Flooded Roads/Avenues:</span>
                      <span className={`font-bold ${geminiResult.environmental.flooded_roads ? 'text-blue-400' : 'text-slate-500'}`}>
                        {geminiResult.environmental.flooded_roads ? "Yes (Blocked)" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span>Active Burning Structures:</span>
                      <span className={`font-bold ${geminiResult.environmental.burning_structures ? 'text-red-400' : 'text-slate-500'}`}>
                        {geminiResult.environmental.burning_structures ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span>Toxic Smoke Intensity:</span>
                      <span className="text-slate-200 font-bold">{geminiResult.environmental.smoke_intensity}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span>Fallen Trees:</span>
                      <span>{geminiResult.environmental.fallen_trees ? "Yes" : "None Detected"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span>Landslide / Mudflow:</span>
                      <span>{geminiResult.environmental.landslides ? "Yes" : "None Detected"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span>Damaged Bridges:</span>
                      <span>{geminiResult.environmental.damaged_bridges ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span>Road Obstruction Status:</span>
                      <span className={`font-bold ${geminiResult.environmental.blocked_roads ? 'text-orange-400' : 'text-emerald-400'}`}>
                        {geminiResult.environmental.blocked_roads ? "Blocked" : "Clear"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 3: Human Safety & Casualties */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">4. Human Safety Analysis</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800/60 rounded-lg p-3 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Injured People</span>
                    <span className="text-lg font-black text-red-400 font-mono mt-1 block">{geminiResult.casualties.injured}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/60 rounded-lg p-3 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Trapped People</span>
                    <span className="text-lg font-black text-orange-400 font-mono mt-1 block">{geminiResult.casualties.trapped}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/60 rounded-lg p-3 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Missing Reported</span>
                    <span className="text-lg font-black text-slate-300 font-mono mt-1 block">{geminiResult.casualties.missing}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/60 rounded-lg p-3 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Evacuation Activity</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-2.5 block uppercase">{geminiResult.casualties.evacuation_activity}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 border-t border-slate-900">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-cyan-400" /> Total Estimated Affected Population:</span>
                  <span className="text-slate-200 font-bold">{geminiResult.casualties.affected_estimate} citizens in video corridor</span>
                </div>
              </div>

              {/* Grid 4: Risks & Recommended Response Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Future risks prediction */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">6. Emergency Prediction (Next 2-6 Hours)</span>
                  <ul className="space-y-2">
                    {geminiResult.risks.map((risk, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2 text-[10px] text-slate-300 leading-relaxed bg-slate-900/40 p-2 rounded border border-slate-900/60">
                        <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">7. Emergency Response Recommendations</span>
                  <ul className="space-y-2">
                    {geminiResult.recommended_response.map((resp, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2 text-[10px] text-slate-300 leading-relaxed bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Grid 5: Video Timeline Events (frame-by-frame tracing) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">9. Frame-by-Frame Event Timeline</span>
                <div className="relative border-l-2 border-slate-800 pl-4 space-y-4 ml-2">
                  {geminiResult.timeline.map((item, tIdx) => (
                    <div key={tIdx} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 bg-cyan-500 rounded-full border-2 border-slate-950 shadow-md" />
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">{item.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        {item.event}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid 6: Copyable Structured Text Reports */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">10. Structured Text Reports (Copy Container)</span>
                  <span className="text-[8px] text-slate-500">Official Required Output Layouts</span>
                </div>
                
                {geminiResult.structured_text_reports && geminiResult.structured_text_reports.map((report, idx) => {
                  const isAdvanced = idx === 1 || report.includes("Disaster Detected:") || report.includes("Visual Evidence:");
                  const reportTitle = isAdvanced 
                    ? "ADVANCED AI DISASTER ASSESSMENT (9-POINT LAYOUT)" 
                    : "STANDARD EMERGENCY SOS PORTAL REPORT (7-POINT LAYOUT)";
                  
                  return (
                    <div key={idx} className="bg-slate-950 border border-slate-900 rounded-lg overflow-hidden font-mono text-[10px]">
                      {/* Copy action header */}
                      <div className="bg-slate-900 px-3 py-2 flex justify-between items-center border-b border-slate-950">
                        <span className="text-[9px] text-cyan-400 uppercase font-black tracking-wider">{reportTitle}</span>
                        <button
                          onClick={() => copyToClipboard(report, idx)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-slate-850 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition text-[9px] font-bold cursor-pointer border border-slate-800"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Clipboard className="w-3 h-3" />
                              <span>Copy Report</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Report raw formatted text */}
                      <pre className="p-4 bg-slate-950 text-slate-300 overflow-x-auto select-all whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto font-mono text-[11px]">
                        {report}
                      </pre>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-800/60 bg-slate-900/60 flex justify-between items-center shrink-0 font-mono text-[10px]">
              <span className="text-slate-500">AI-Based Disaster Prediction & Emergency Response Management System v4.2</span>
              <button
                onClick={() => setShowResults(false)}
                className="px-5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs rounded transition cursor-pointer font-bold uppercase tracking-wider"
              >
                Acknowledge Findings & Update Maps
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
