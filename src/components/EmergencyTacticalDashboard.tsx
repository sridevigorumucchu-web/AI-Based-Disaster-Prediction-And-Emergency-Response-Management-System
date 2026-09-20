import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertOctagon, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Send, 
  Radio, 
  MapPin, 
  Users, 
  CheckSquare, 
  RefreshCw, 
  Sliders, 
  Compass, 
  Loader2, 
  Shield, 
  Bell, 
  Wifi, 
  WifiOff, 
  Eye, 
  Check, 
  ShieldAlert, 
  Layers, 
  Database, 
  Truck, 
  Phone,
  Video,
  X,
  FileVideo,
  ExternalLink,
  ChevronRight,
  Mic,
  MicOff,
  Square
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface EmergencyTacticalDashboardProps {
  activeEmergency: {
    disasterType: string;
    severity: string;
    confidence: number;
    detectedObjects?: string[];
    mitigationSteps?: string[];
    location?: string;
    timestamp?: string;
  } | null;
  onCloseEmergency: () => void;
  selectedLanguage: string;
}

export default function EmergencyTacticalDashboard({
  activeEmergency,
  onCloseEmergency,
  selectedLanguage
}: EmergencyTacticalDashboardProps) {
  const { t, i18n } = useTranslation();
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState<'citizen' | 'rescue'>('citizen');
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [isFlashlightBlinking, setIsFlashlightBlinking] = useState(false);
  const [isVibrationActive, setIsVibrationActive] = useState(false);
  const [communityRadius, setCommunityRadius] = useState<1 | 5 | 10>(1);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // UI Strobe
  const [strobeColor, setStrobeColor] = useState(false);
  
  // System logs
  const [systemLogs, setSystemLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'warn' | 'success' }>>([
    { time: new Date().toLocaleTimeString(), msg: "Emergency Response Core initialized.", type: 'info' }
  ]);

  // Peer-to-peer offline mesh nodes
  const [p2pNodes, setP2pNodes] = useState<Array<{ id: string; name: string; status: string; hops: number; range: string }>>([
    { id: "NODE-C1", name: "Emergency Repeater Terminal - Tower Road", status: "Active P2P Mesh Relay", hops: 1, range: "450m" },
    { id: "NODE-C2", name: "Citizen Device - Grid Alpha", status: "Relaying SOS Beacons", hops: 2, range: "120m" },
    { id: "NODE-C3", name: "Community Shelter Gateway - Sub-sector B", status: "Active P2P Mesh Relay", hops: 1, range: "810m" },
    { id: "NODE-C4", name: "Citizen Device - High-rise Block D", status: "Stale Signal - Retrying link", hops: 3, range: "1.2km" }
  ]);

  // Rescue distress signals
  const [rescueCases, setRescueCases] = useState<Array<{
    id: string;
    name: string;
    contact: string;
    loc: string;
    disaster: string;
    urgency: 'Critical' | 'High' | 'Medium';
    status: 'Pending' | 'Dispatched' | 'Resolved';
    needsAmbulance: boolean;
    description: string;
  }>>([
    { 
      id: "SOS-801", 
      name: "Ramesh Kumar (Family of 4)", 
      contact: "+91 98452-11024", 
      loc: "Vijayawada River Canal Block F", 
      disaster: "Flood", 
      urgency: "Critical", 
      status: "Dispatched", 
      needsAmbulance: true, 
      description: "Water level is above chest-high. Family trapped on the concrete rooftop with an elderly patient." 
    },
    { 
      id: "SOS-802", 
      name: "Priya Chandran", 
      contact: "+91 94432-88711", 
      loc: "Mundakkai High Slopes Sector 2", 
      disaster: "Landslide", 
      urgency: "Critical", 
      status: "Pending", 
      needsAmbulance: false, 
      description: "Sub-road collapsed. House structure showing structural cracks. Need urgent slope support team." 
    },
    { 
      id: "SOS-803", 
      name: "Anil Deshmukh", 
      contact: "+91 91204-77443", 
      loc: "Vijayawada Sector B Block C", 
      disaster: "Flood", 
      urgency: "High", 
      status: "Pending", 
      needsAmbulance: true, 
      description: "Critical oxygen concentrator depleted due to power backup failure. Needs immediate clinical delivery." 
    },
    { 
      id: "SOS-804", 
      name: "Sunitha Reddi", 
      contact: "+91 88712-44551", 
      loc: "Gorumucchu Colony, Lane 3", 
      disaster: "Wildfire Proximity", 
      urgency: "Medium", 
      status: "Resolved", 
      needsAmbulance: false, 
      description: "Surrounding brushwood cleared. Shelter evacuation path was checked, successfully relocated." 
    }
  ]);

  const [newDistressForm, setNewDistressForm] = useState({
    name: '',
    contact: '',
    loc: 'Vijayawada Sector B',
    disaster: 'Flood',
    urgency: 'High' as 'Critical' | 'High' | 'Medium',
    description: '',
    needsAmbulance: false
  });

  const [isDistressListening, setIsDistressListening] = useState(false);
  const distressRecognitionRef = useRef<any>(null);

  const toggleDistressVoiceToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice-to-Text is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isDistressListening) {
      if (distressRecognitionRef.current) {
        try { distressRecognitionRef.current.stop(); } catch (e) {}
      }
      setIsDistressListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => setIsDistressListening(true);
      recognition.onresult = (event: any) => {
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          }
        }
        if (final) {
          setNewDistressForm(prev => ({
            ...prev,
            description: prev.description ? `${prev.description.trim()} ${final.trim()}` : final.trim()
          }));
        }
      };
      recognition.onerror = () => setIsDistressListening(false);
      recognition.onend = () => setIsDistressListening(false);

      distressRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsDistressListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (distressRecognitionRef.current) {
        try { distressRecognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Audio Synthesizer refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sirenIntervalRef = useRef<number | null>(null);

  // Vibration timer ref
  const vibrationIntervalRef = useRef<number | null>(null);

  const threatType = activeEmergency?.disasterType || "Flood";
  const threatSeverity = activeEmergency?.severity || "High";
  const threatConfidence = activeEmergency?.confidence || 94.2;
  const detectedObjects = activeEmergency?.detectedObjects || ['Submerged Vehicle', 'Debris Flow', 'Water Contours', 'Damaged Infrastructure'];
  const mitigationSteps = activeEmergency?.mitigationSteps || [
    'Seek higher ground immediately; do not wait for water levels to rise.',
    'Never drive or walk through active flood streams (Turn Around, Don\'t Drown).',
    'Use local maps pathfinder to secure high-elevation routes to Safety Shelters.',
    'Log an SOS Beacon with medical alerts if trapped or injured.'
  ];

  // System Consensus Status
  const [verificationConsensus, setVerificationConsensus] = useState({
    yolo: { checked: true, label: "YOLOv8 Frame Segmentation Core", confidence: "94.2%" },
    opencv: { checked: true, label: "OpenCV Optical Flow Velocity Radar", confidence: "Velocity vector verified" },
    weather: { checked: true, label: "Doppler Satellite Cloud & Heat Sensors", confidence: "Severe precipitation drift" },
    govt: { checked: true, label: "National Disaster Management Authority API", confidence: "Red Alert Level Active" }
  });

  // Trigger TTS Text speech warnings
  const speakWarning = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech synthesis not supported in this browser environment.");
      return;
    }
    window.speechSynthesis.cancel();
    
    const textMap: Record<string, string> = {
      en: `Emergency! High ${threatType} risk detected nearby. Please evacuate immediately using the suggested safe route.`,
      hi: `आपातकाल! पास में उच्च ${threatType === 'Flood' ? 'बाढ़' : threatType === 'Wildfire' ? 'जंगल की आग' : 'चक्रवात'} का खतरा पाया गया है। कृपया सुझाए गए सुरक्षित मार्ग का उपयोग करके तुरंत सुरक्षित स्थान पर जाएं।`,
      te: `అత్యవసర పరిస్థితి! సమీపంలో అధిక ${threatType === 'Flood' ? 'వరద' : threatType === 'Wildfire' ? 'దావానలం' : 'తుఫాను'} ప్రమాదం కనుగొనబడింది. దయచేసి సూచించిన సురక్షిత మార్గాన్ని ఉపయోగించి వెంటనే ఖाళీ చేయండి.`,
      ta: `அவசரநிலை! அருகில் அதிக ${threatType === 'Flood' ? 'வெள்ள' : threatType === 'Wildfire' ? 'காட்டுத்தீ' : 'புயல்'} அபாயம் கண்டறியப்பட்டுள்ளது. பரிந்துரைக்கப்பட்ட பாதுகாப்பான வழியைப் பயன்படுத்தி உடனடியாக வெளியேறவும்.`,
      kn: `ತುರ್ತು ಪರಿಸ್ಥಿತಿ! ಹತ್ತಿರದಲ್ಲಿ ಹೆಚ್ಚಿನ ${threatType === 'Flood' ? 'ಪ್ರವಾಹದ' : threatType === 'Wildfire' ? 'ಕಾಳ್ಗಿಚ್ಚು' : 'ಚಂಡಮಾರುತ'} ಅಪಾಯ ಕಂಡುಬಂದಿದೆ. ದಯವಿಟ್ಟು ಸೂಚಿಸಲಾದ ಸುರಕ್ಷಿತ ಮಾರ್ಗವನ್ನು ಬಳಸಿಕೊಂಡು ತಕ್ಷಣವೇ ಸ್ಥಳಾಂತರಿಸಿ.`,
      ml: `അടിയന്തിര സാഹചര്യം! സമീപത്ത് ഉയർന്ന ${threatType === 'Flood' ? 'പ്രളയസാധ്യത' : threatType === 'Wildfire' ? 'കാട്ടുതീ' : 'ചുഴലിക്കാറ്റ്'} കണ്ടെത്തിയിരിക്കുന്നു. ദയവായി നിർദ്ദേശിച്ച സുരക്ഷിത പാതയിലൂടെ ഉടൻ തന്നെ സുരക്ഷിത സ്ഥാനത്തേക്ക് മാറുക.`,
      mr: `आणीबाणी! जवळच उच्च ${threatType === 'Flood' ? 'पूर' : threatType === 'Wildfire' ? 'वणवा' : 'वादळ'} धोका आढळला आहे. कृपया सुचवलेल्या सुरक्षित मार्गाचा वापर करून त्वरित बाहेर पडा.`,
      bn: `জরুরি অবস্থা! কাছাকাছি উচ্চ ${threatType === 'Flood' ? 'বন্যার' : threatType === 'Wildfire' ? 'দাবানল' : 'ঘূর্ণিঝড়ের'} ঝুঁকি সনাক্ত করা হয়েছে। অনুগ্রহ করে প্রস্তাবিত নিরাপদ রুট ব্যবহার করে অবিলম্বে নিরাপদ স্থানে চলে যান।`,
      ur: `ہنگامی صورتحال! قریب ہی ${threatType === 'Flood' ? 'سیلاب' : threatType === 'Wildfire' ? 'جنگل کی آگ' : 'طوفان'} کا شدید خطرہ پایا گیا ہے۔ براہ کرم تجویز کردہ محفوظ راستہ استعمال کرتے ہوئے فوری طور پر یہاں سے نکل جائیں۔`
    };

    const text = textMap[selectedLanguage] || textMap['en'];
    const utterance = new SpeechSynthesisUtterance(text);
    // Bind current locale
    const langVoiceMap: Record<string, string> = {
      en: "en-US",
      hi: "hi-IN",
      te: "te-IN",
      ta: "ta-IN",
      kn: "kn-IN",
      ml: "ml-IN",
      mr: "mr-IN",
      bn: "bn-IN",
      ur: "ur-PK"
    };
    utterance.lang = langVoiceMap[selectedLanguage] || "en-US";
    utterance.pitch = 1.05;
    utterance.rate = 0.9;
    
    setSystemLogs(curr => [...curr, {
      time: new Date().toLocaleTimeString(),
      msg: `Broadcasting warning TTS in ${selectedLanguage.toUpperCase()}: "${text.substring(0, 45)}..."`,
      type: 'info'
    }]);

    window.speechSynthesis.speak(utterance);
  };

  // Turn Siren ON / OFF
  const toggleSirenAlarm = () => {
    if (isAlarmActive) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      if (sirenIntervalRef.current) {
        clearInterval(sirenIntervalRef.current);
        sirenIntervalRef.current = null;
      }
      setIsAlarmActive(false);
      setSystemLogs(curr => [...curr, {
        time: new Date().toLocaleTimeString(),
        msg: "High-volume Siren Alarm deactivated.",
        type: 'info'
      }]);
    } else {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(850, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
      setIsAlarmActive(true);

      let up = true;
      sirenIntervalRef.current = window.setInterval(() => {
        try {
          if (up) {
            osc.frequency.setValueAtTime(1250, ctx.currentTime);
            up = false;
          } else {
            osc.frequency.setValueAtTime(650, ctx.currentTime);
            up = true;
          }
        } catch (e) {}
      }, 200);

      setSystemLogs(curr => [...curr, {
        time: new Date().toLocaleTimeString(),
        msg: "Continuous oscillating hazard siren activated.",
        type: 'warn'
      }]);
    }
  };

  // Handle continuous haptic device vibration loop
  const toggleDeviceVibration = () => {
    if (isVibrationActive) {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
      if (navigator.vibrate) {
        navigator.vibrate(0);
      }
      setIsVibrationActive(false);
      setSystemLogs(curr => [...curr, {
        time: new Date().toLocaleTimeString(),
        msg: "Tactical device haptics disabled.",
        type: 'info'
      }]);
    } else {
      setIsVibrationActive(true);
      const vibratePattern = () => {
        if (navigator.vibrate) {
          navigator.vibrate([600, 300, 600, 300]);
        }
      };
      vibratePattern();
      vibrationIntervalRef.current = window.setInterval(vibratePattern, 1800);
      
      setSystemLogs(curr => [...curr, {
        time: new Date().toLocaleTimeString(),
        msg: "Continuous emergency haptic pulses started.",
        type: 'warn'
      }]);
    }
  };

  // Strobe effect interval
  useEffect(() => {
    let interval: number;
    if (isFlashlightBlinking) {
      interval = window.setInterval(() => {
        setStrobeColor(prev => !prev);
      }, 150);
    } else {
      setStrobeColor(false);
    }
    return () => clearInterval(interval);
  }, [isFlashlightBlinking]);

  // Handle auto-triggering on load if activeEmergency exists
  useEffect(() => {
    if (activeEmergency) {
      // Auto-speak warning
      speakWarning();
      
      // Auto-trigger alarms to ensure safety response is highly noticeable
      if (!isAlarmActive) toggleSirenAlarm();
      if (!isVibrationActive) toggleDeviceVibration();
      setIsFlashlightBlinking(true);

      setSystemLogs(curr => [...curr, {
        time: new Date().toLocaleTimeString(),
        msg: `AUTOMATED THREAT EMERGENCY PROTOCOL: High-risk ${threatType} confirmed. Siren, screen strobe, haptics, and GPS trackers mobilized.`,
        type: 'warn'
      }]);
    }
    
    return () => {
      // Clean up sound on destroy
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
    };
  }, [activeEmergency]);

  // Stop all active alarms immediately
  const handleAcknowledgeAndStopAlarms = () => {
    if (isAlarmActive) toggleSirenAlarm();
    if (isVibrationActive) toggleDeviceVibration();
    setIsFlashlightBlinking(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    setSystemLogs(curr => [...curr, {
      time: new Date().toLocaleTimeString(),
      msg: "Operator pressed 'I am Safe / Stop Alarm'. All sirens, TTS, and flashlight strobes halted.",
      type: 'success'
    }]);
  };

  // Submit community alerts simulation
  const handleSendCommunityAlert = () => {
    setSystemLogs(curr => [...curr, {
      time: new Date().toLocaleTimeString(),
      msg: `COMMUNITY BROADCAST INTENT: Emitting push alerts within ${communityRadius}km radius to all cell networks.`,
      type: 'info'
    }]);

    setTimeout(() => {
      setSystemLogs(curr => [...curr, {
        time: new Date().toLocaleTimeString(),
        msg: `SUCCESS: Distributed emergency alert to 142 devices in 1km zone, 584 devices in 5km, and 2,410 devices in 10km. Loud alarms & flash blinking triggered client-side.`,
        type: 'success'
      }]);
      alert(`⚠️ COMMUNITY ALERT SENT SUCCESS\n\nEmergency warning has been broadcast to all users within ${communityRadius} km.\n\nSimulating local cell tower broadcast overrides...`);
    }, 1000);
  };

  // Handle local SOS Distress form submission
  const handleSOSDistressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistressForm.name || !newDistressForm.contact || !newDistressForm.description) {
      alert("Please fill out Name, Contact, and Case Description.");
      return;
    }

    const newSOS = {
      id: "SOS-" + Math.floor(805 + Math.random() * 500),
      name: newDistressForm.name,
      contact: newDistressForm.contact,
      loc: newDistressForm.loc,
      disaster: newDistressForm.disaster,
      urgency: newDistressForm.urgency,
      status: 'Pending' as const,
      needsAmbulance: newDistressForm.needsAmbulance,
      description: newDistressForm.description
    };

    setRescueCases([newSOS, ...rescueCases]);
    setNewDistressForm({
      name: '',
      contact: '',
      loc: 'Vijayawada Sector B',
      disaster: 'Flood',
      urgency: 'High',
      description: '',
      needsAmbulance: false
    });

    setSystemLogs(curr => [...curr, {
      time: new Date().toLocaleTimeString(),
      msg: `NEW DISTRESS SIGNAL CAPTURED: ${newSOS.name} logged case ${newSOS.id} in ${newSOS.loc}. Saved locally.`,
      type: 'warn'
    }]);
  };

  // Sync offline mode status
  const toggleOfflineSwitch = () => {
    const toState = !isOfflineMode;
    setIsOfflineMode(toState);
    if (toState) {
      setSystemLogs(curr => [...curr, {
        time: new Date().toLocaleTimeString(),
        msg: "Internet Connection Lost. Automatically switched to offline emergency communications backplane (Bluetooth Mesh & Wi-Fi Direct peer networks).",
        type: 'warn'
      }]);
    } else {
      setSystemLogs(curr => [...curr, {
        time: new Date().toLocaleTimeString(),
        msg: "Internet Link Reestablished. Synchronizing local beacons & distress registers with central database servers.",
        type: 'success'
      }]);
    }
  };

  // Resolve or dispatch rescue status
  const updateRescueCaseStatus = (id: string, status: 'Pending' | 'Dispatched' | 'Resolved') => {
    setRescueCases(curr => curr.map(item => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    }));
    setSystemLogs(curr => [...curr, {
      time: new Date().toLocaleTimeString(),
      msg: `Rescue Case ${id} state altered to: [${status.toUpperCase()}]`,
      type: 'info'
    }]);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 transition-all duration-300 ${
        strobeColor ? 'bg-red-950/95' : 'bg-slate-950/90'
      } backdrop-blur-md`}
      id="emergency_tactical_dashboard_overlay"
    >
      {/* Outer border flashes if flashlight active */}
      <div className={`bg-slate-900 border-2 rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl relative ${
        isFlashlightBlinking ? 'border-red-500 shadow-red-900/50' : 'border-slate-800'
      }`}>
        
        {/* FLASH STROBE SIMULATOR BACKGROUND GLOW */}
        {isFlashlightBlinking && (
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 animate-pulse z-20" />
        )}

        {/* HEADER BRANDING BANNER */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-600/10 p-2.5 rounded-xl border border-red-500/30 animate-pulse">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/80 px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase animate-pulse">
                  TACTICAL OVERRIDE SYSTEM ACTIVE
                </span>
                {isOfflineMode && (
                  <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-mono font-bold uppercase flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> OFFLINE MESH RELAY MODE
                  </span>
                )}
              </div>
              <h2 className="text-sm font-black font-mono uppercase text-slate-100 tracking-wider">
                AI-BASED DISASTER PREDICTION & EMERGENCY RESPONSE CONTROL CENTRE
              </h2>
            </div>
          </div>

          {/* Quick Stats Banner & Stop All */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={speakWarning}
              title="Repeat warning reading aloud"
              className="px-3 py-1.5 rounded-lg bg-purple-950/80 border border-purple-800 hover:bg-purple-900 text-purple-300 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Play TTS Voice ({selectedLanguage.toUpperCase()})
            </button>

            <button
              onClick={handleAcknowledgeAndStopAlarms}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/30"
              id="acknowledge_safety_button"
            >
              <Check className="w-4 h-4" /> I am Safe / Stop Alarm
            </button>

            <button 
              onClick={onCloseEmergency}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title="Minimize panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TABS SELECTOR - CITIZEN vs RESCUE PANEL */}
        <div className="bg-slate-900/60 border-b border-slate-800/70 px-6 py-2 flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('citizen')}
              className={`text-xs font-bold uppercase tracking-wider font-mono py-2 transition flex items-center gap-2 border-b-2 ${activeTab === 'citizen' ? 'text-red-400 border-red-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
              id="switch_citizen_emergency_tab"
            >
              <AlertOctagon className="w-3.5 h-3.5" /> Citizen Survival Portal
            </button>
            <button
              onClick={() => setActiveTab('rescue')}
              className={`text-xs font-bold uppercase tracking-wider font-mono py-2 transition flex items-center gap-2 border-b-2 ${activeTab === 'rescue' ? 'text-cyan-400 border-cyan-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
              id="switch_rescue_dashboard_tab"
            >
              <Truck className="w-3.5 h-3.5" /> Rescue Responder Panel
            </button>
          </div>

          {/* Connection backplane toggle simulator */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">Simulate Telecom Outage:</span>
            <button
              onClick={toggleOfflineSwitch}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-black border transition cursor-pointer ${
                isOfflineMode 
                  ? 'bg-red-950 text-red-400 border-red-800' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {isOfflineMode ? "OUTAGE: NO INTERNET" : "TELECOM LINK: ACTIVE"}
            </button>
          </div>
        </div>

        {/* BODY AREA */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* CITIZEN EMERGENCY VIEW */}
          {activeTab === 'citizen' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: ACTIVE DISASTER DETAIL HUD & ACCESSIBILITY ALARMS */}
              <div className="lg:col-span-4 space-y-5">
                
                {/* RADAR ALERTS DETAILED CRITICAL THREAT BANNER */}
                <div className="bg-red-950/40 border border-red-900/80 p-4 rounded-xl space-y-3 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 text-red-950 opacity-20 pointer-events-none">
                    <AlertOctagon className="w-32 h-32" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      SEVERITY: {threatSeverity.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Detected via YOLOv8 ONNX</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black font-sans text-red-200 tracking-tight uppercase flex items-center gap-1">
                      {threatType} Classified
                    </h3>
                    <p className="text-xs font-mono text-red-400 mt-0.5 font-bold">
                      Core AI Detector Confidence: {threatConfidence}%
                    </p>
                  </div>

                  <p className="text-[11px] font-mono text-slate-300 leading-normal bg-slate-950/80 p-3 rounded border border-red-900/30">
                    <strong>Critical Vector Location:</strong> Vijayawada Sector B Lowlands (Near River Basin Canal). Recommended Action: Evacuate along secure elevation contours immediately.
                  </p>
                </div>

                {/* ACCESSIBILITY & STROBE TRIGGER SYSTEM CONTROLS */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                    Accessibility Alarms & Physical Indicators
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {/* SIREN PANEL CONTROL */}
                    <button
                      onClick={toggleSirenAlarm}
                      className={`p-3 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-2 cursor-pointer text-center ${
                        isAlarmActive 
                          ? 'bg-red-950 text-red-400 border-red-800 animate-pulse' 
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      {isAlarmActive ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-slate-400" />}
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase">Emergency Siren</span>
                        <span className="text-[8px] text-slate-500">{isAlarmActive ? 'ON (850Hz Warble)' : 'OFF'}</span>
                      </div>
                    </button>

                    {/* FLASHLIGHT / STROBE PANEL CONTROL */}
                    <button
                      onClick={() => setIsFlashlightBlinking(!isFlashlightBlinking)}
                      className={`p-3 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-2 cursor-pointer text-center ${
                        isFlashlightBlinking 
                          ? 'bg-amber-950 text-amber-400 border-amber-800 animate-pulse' 
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <Eye className={`w-5 h-5 ${isFlashlightBlinking ? 'text-amber-400 animate-spin' : 'text-slate-400'}`} />
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase">Flashlight Strobe</span>
                        <span className="text-[8px] text-slate-500">{isFlashlightBlinking ? 'ACTIVE (150ms Loop)' : 'OFF'}</span>
                      </div>
                    </button>

                    {/* DEVICE VIBRATION CONTROL */}
                    <button
                      onClick={toggleDeviceVibration}
                      className={`p-3 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-2 cursor-pointer text-center col-span-2 ${
                        isVibrationActive 
                          ? 'bg-orange-950 text-orange-400 border-orange-800' 
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <Smartphone className={`w-5 h-5 ${isVibrationActive ? 'text-orange-400 animate-bounce' : 'text-slate-400'}`} />
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase">Mobile Haptic Vibrator</span>
                        <span className="text-[8px] text-slate-500">{isVibrationActive ? 'CONTINUOUS PULSE ENGAGED' : 'OFF'}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* EMERGENCY CONTACTS LIST */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-rose-400" /> Dial-Activated Emergency Contacts
                  </span>

                  <div className="space-y-1.5 text-xs">
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-200 block">NDRF Disaster Response</span>
                        <span className="text-[9px] text-slate-500">National Management Command</span>
                      </div>
                      <a href="tel:011-24363260" className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] font-bold">
                        011-24363260
                      </a>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-200 block">State Emergency Services (Police)</span>
                        <span className="text-[9px] text-slate-500">Andhra Pradesh Control Panel</span>
                      </div>
                      <a href="tel:100" className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] font-bold">
                        Call 100
                      </a>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-200 block">Ambulance & Medical Dispatch</span>
                        <span className="text-[9px] text-slate-500">Direct Trauma Response Link</span>
                      </div>
                      <a href="tel:108" className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] font-bold">
                        Call 108
                      </a>
                    </div>
                  </div>
                </div>

              </div>

              {/* CENTER COLUMN: LIVE EMERGENCY DASHBOARD MAP & ACCESSIBILITY INSTRUCTIONS */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* MAIN GRID: TACTICAL PROGRESS STATS, MAP, AND RADIUS ALERTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* REAL-TIME EMERGENCY STATUS & RESCUE PROGRESS */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 font-mono">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-cyan-400" /> Sector Command Telemetry
                    </h3>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Evacuation Progress Zone B</span>
                          <span className="text-cyan-400 font-bold">82% Completed</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div className="bg-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: '82%' }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-center">
                          <span className="text-[9px] text-slate-500 uppercase block">People Nearby</span>
                          <span className="text-sm font-black text-slate-200">142 citizens</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-center">
                          <span className="text-[9px] text-slate-500 uppercase block">Rescue Crew Dispatched</span>
                          <span className="text-sm font-black text-cyan-400">14 officers</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded border border-slate-800/80 space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Nearest Secure Shelter:</span>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-200 font-bold">Vijayawada Central relief Camp</span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                            Capacity: 450/600
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 block">Suggested Evacuation Path: Kanakadurga Varadhi Safe Pathway (Elevation +14m)</span>
                      </div>
                    </div>
                  </div>

                  {/* COMMUNITY ALERT RADAR SETTINGS AND EMITTER */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 font-mono flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-purple-400 animate-bounce" /> Community Alert System
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        Configure local cell tower coordinates to automatically broadcast loud override sirens, push alerts, and path vectors to nearby devices.
                      </p>

                      {/* RADIUS SELECTOR SLIDER */}
                      <div className="space-y-3 mt-4">
                        <div className="flex justify-between text-xs text-slate-300 font-bold">
                          <span>Target Broadcast Proximity:</span>
                          <span className="text-purple-400 font-black">{communityRadius} Kilometer Zone</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                          {[1, 5, 10].map((radius) => (
                            <button
                              key={radius}
                              type="button"
                              onClick={() => setCommunityRadius(radius as any)}
                              className={`flex-1 py-1 text-xs font-mono font-black rounded-md transition ${
                                communityRadius === radius 
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {radius} km
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSendCommunityAlert}
                      className="w-full mt-4 py-2.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-800 hover:border-purple-600 text-purple-200 font-bold transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-purple-300" /> Broadcast Broadcast Alerts to Public
                    </button>
                  </div>

                </div>

                {/* DOUBLE COLUMN PANELS: FALSE ALARM CHECKER vs OFFLINE COMM RELAY GRAPH */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* FALSE ALARM PREVENTION & VERIFICATION GRID */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 font-mono">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-400" /> False Alarm Prevention Panel
                    </h3>
                    
                    <p className="text-[10px] text-slate-500 leading-normal">
                      To prevent mass public panic, the system cross-checks video uploads against government feeds, weather radars, and multiple AI neural models.
                    </p>

                    <div className="space-y-2 text-[11px]">
                      {(Object.entries(verificationConsensus) as [string, { checked: boolean; label: string; confidence: string }][]).map(([key, item]) => (
                        <div key={key} className="flex items-start justify-between p-2 bg-slate-950 rounded border border-slate-800/80">
                          <div className="flex items-start gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <span className="text-slate-300 font-medium">{item.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold text-right shrink-0">{item.confidence}</span>
                        </div>
                      ))}

                      <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-center font-bold text-xs text-emerald-400">
                        Consensus Score: 98.2% CONFIRMED (Verified Match)
                      </div>
                    </div>
                  </div>

                  {/* OFFLINE P2P RELAY ROUTER NODES */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 font-mono">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-amber-400 animate-pulse" /> Offline Emergency Relay (P2P)
                      </h3>
                      {isOfflineMode ? (
                        <span className="text-[9px] text-red-400 font-extrabold animate-pulse">Mesh Active</span>
                      ) : (
                        <span className="text-[9px] text-slate-500">Standby (Using Internet)</span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal">
                      If internet networks collapse, Bluetooth Mesh & Wi-Fi Direct automatically compile offline warning chains between nearby active handsets.
                    </p>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto">
                      {p2pNodes.map((node) => (
                        <div key={node.id} className="p-2 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-slate-300 block">{node.name}</span>
                            <span className="text-[9px] text-slate-500">Node ID: {node.id} | Hop Distance: {node.hops}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-400 font-bold border border-amber-900/20">
                            {node.range}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg text-[10px] text-slate-500 italic">
                      {isOfflineMode ? (
                        <span className="text-red-400 font-bold animate-pulse">● Mesh active: Relaying 3 pending local SOS signals to surrounding gateways.</span>
                      ) : (
                        <span>Standard online mode active. Alerts synchronized with state disaster management dashboards.</span>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* RESCUE COMMAND PANEL */}
          {activeTab === 'rescue' && (
            <div className="space-y-6">
              
              {/* RESCUE SUMMARY HUD */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Total Captured Distress Signals</span>
                  <span className="text-2xl font-black text-red-500">{rescueCases.length}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Pending Search & Rescue</span>
                  <span className="text-2xl font-black text-amber-400">{rescueCases.filter(c => c.status === 'Pending').length}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Crew Dispatched Cases</span>
                  <span className="text-2xl font-black text-cyan-400">{rescueCases.filter(c => c.status === 'Dispatched').length}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Safely Resolved / Rescued</span>
                  <span className="text-2xl font-black text-emerald-400">{rescueCases.filter(c => c.status === 'Resolved').length}</span>
                </div>
              </div>

              {/* GRID: LIVE DISTRESS MONITORING vs SOS LOGGER REGISTRY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LIST OF LIVE USER BEACONS & DETECTED VIDEOS */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 font-mono">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-red-400" /> Live Distress Signals & Coordinate Registry
                    </h3>
                    <span className="text-[10px] text-slate-500">Auto-Refreshed: Real-time</span>
                  </div>

                  <div className="space-y-3 max-h-[480px] overflow-y-auto">
                    {rescueCases.map((cas) => (
                      <div 
                        key={cas.id} 
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                          cas.urgency === 'Critical' 
                            ? 'bg-red-950/20 border-red-900/60' 
                            : cas.urgency === 'High' 
                              ? 'bg-orange-950/20 border-orange-900/40' 
                              : 'bg-slate-950/40 border-slate-800/80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-200 text-xs">{cas.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                cas.urgency === 'Critical' 
                                  ? 'bg-red-950 text-red-400 border border-red-800' 
                                  : cas.urgency === 'High' 
                                    ? 'bg-orange-950 text-orange-400 border border-orange-800' 
                                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                              }`}>
                                {cas.urgency} Priority
                              </span>
                              {cas.needsAmbulance && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] bg-rose-950 text-rose-300 border border-rose-800 font-extrabold uppercase">
                                  Ambulance Required
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Location: {cas.loc} | Contact: {cas.contact}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-slate-500 uppercase font-bold mr-1">Status:</span>
                            {(['Pending', 'Dispatched', 'Resolved'] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => updateRescueCaseStatus(cas.id, st)}
                                className={`px-2 py-1 rounded text-[9px] font-black transition cursor-pointer ${
                                  cas.status === st
                                    ? st === 'Resolved' 
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                                      : st === 'Dispatched' 
                                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' 
                                        : 'bg-red-950 text-red-400 border border-red-800'
                                    : 'bg-slate-950 text-slate-500 hover:text-slate-300 border border-transparent'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-normal bg-slate-950/80 p-2.5 rounded border border-slate-800/40">
                          <strong>Situation:</strong> "{cas.description}"
                        </p>

                        <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-900 pt-2">
                          <span>YOLO Target matching: {threatType} (Confidence: {threatConfidence}%)</span>
                          <span>Coordinates Locked: 16.506°N, 80.648°E</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MANUAL SOS DISTRESS INJECTION LOGGER */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 font-mono flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-cyan-400" /> Log Rescue Distress Case
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      Manual logging panel for emergency call operators receiving 100/108 satellite telephone signals.
                    </p>

                    <form onSubmit={handleSOSDistressSubmit} className="space-y-3 text-xs mt-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Citizen Full Name</label>
                        <input
                          type="text"
                          required
                          value={newDistressForm.name}
                          onChange={(e) => setNewDistressForm({ ...newDistressForm, name: e.target.value })}
                          placeholder="e.g. Sridevi Gorumucchu"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-1">Contact Phone</label>
                          <input
                            type="text"
                            required
                            value={newDistressForm.contact}
                            onChange={(e) => setNewDistressForm({ ...newDistressForm, contact: e.target.value })}
                            placeholder="e.g. +91 94411-XXXXX"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Priority</label>
                          <select
                            value={newDistressForm.urgency}
                            onChange={(e) => setNewDistressForm({ ...newDistressForm, urgency: e.target.value as any })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                          >
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Geographic Location</label>
                        <input
                          type="text"
                          required
                          value={newDistressForm.loc}
                          onChange={(e) => setNewDistressForm({ ...newDistressForm, loc: e.target.value })}
                          placeholder="e.g. Vijayawada Sector B Lowlands"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-slate-400">Case Description & Trapped Status</label>
                          <button
                            type="button"
                            onClick={toggleDistressVoiceToText}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition cursor-pointer ${
                              isDistressListening
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
                            }`}
                            title="Voice-to-Text Dictation"
                          >
                            {isDistressListening ? (
                              <>
                                <Square className="w-2.5 h-2.5 fill-white" />
                                <span>Stop Recording</span>
                              </>
                            ) : (
                              <>
                                <Mic className="w-2.5 h-2.5" />
                                <span>🎙️ Voice-to-Text</span>
                              </>
                            )}
                          </button>
                        </div>
                        <textarea
                          required
                          rows={2}
                          value={newDistressForm.description}
                          onChange={(e) => setNewDistressForm({ ...newDistressForm, description: e.target.value })}
                          placeholder="e.g. Roof flooded, needs water and rescue boat..."
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="needs_ambulance_box"
                          checked={newDistressForm.needsAmbulance}
                          onChange={(e) => setNewDistressForm({ ...newDistressForm, needsAmbulance: e.target.checked })}
                          className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="needs_ambulance_box" className="text-[10px] text-slate-400 cursor-pointer font-bold uppercase select-none">
                          Trauma Patient / Needs Ambulance
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 hover:border-cyan-600 text-cyan-300 font-bold rounded uppercase transition text-xs cursor-pointer"
                      >
                        Register SOS distress Case
                      </button>
                    </form>
                  </div>

                  {/* RESTORE STATS */}
                  <div className="pt-4 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Safe Evacuation Corridors</span>
                    <div className="space-y-1.5 text-[10px] text-slate-400">
                      <div className="flex justify-between p-1.5 bg-slate-950 rounded border border-slate-900">
                        <span>OMR Elevated Corridor</span>
                        <span className="text-emerald-400 font-bold">CLEAR</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-slate-950 rounded border border-slate-900">
                        <span>Anna Salai High-Way</span>
                        <span className="text-orange-400 font-bold">SLIGHT WATERLOG</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* REAL-TIME SIMULATOR CONSOLE LOGGER */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              System Protocol Console Logs
            </span>
            <div className="font-mono text-[9px] text-slate-400 max-h-[100px] overflow-y-auto space-y-1 bg-black/50 p-2.5 rounded border border-slate-900">
              {systemLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-slate-600">[{log.time}]</span>{' '}
                  <span className={
                    log.type === 'warn' ? 'text-red-400 font-bold' : 
                    log.type === 'success' ? 'text-emerald-400 font-bold' : 'text-slate-300'
                  }>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
