import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Bell, AlertTriangle, ShieldAlert, CheckCircle2, Play, Sparkles } from 'lucide-react';

interface WeatherAudioAlertSystemProps {
  currentWeather?: any;
  locationName?: string;
}

export default function WeatherAudioAlertSystem({
  currentWeather,
  locationName = "Your Exact GPS Location"
}: WeatherAudioAlertSystemProps) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [activeAlert, setActiveAlert] = useState<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    severity: 'High' | 'Critical' | 'Info';
  } | null>(null);

  const prevMetricsRef = useRef<{
    temp: number;
    wind: number;
    pressure: number;
    rainfall: number;
  } | null>(null);

  // Play synthesized alarm siren sound using browser AudioContext
  const playSirenSound = () => {
    if (!isSoundEnabled) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      
      // Dual oscillator siren effect
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sawtooth';

      // Siren frequency modulation sweep
      const now = ctx.currentTime;
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.3);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.6);

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(220, now + 0.6);

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.8);
      osc2.stop(now + 0.8);
    } catch (err) {
      console.warn("AudioContext playback hindered:", err);
    }
  };

  // Compare live weather metrics on every update to catch changes
  useEffect(() => {
    if (!currentWeather || !currentWeather.current) return;

    const curr = currentWeather.current;
    const temp = curr.temperature ?? 28;
    const wind = curr.windSpeed ?? 18;
    const pressure = curr.pressure ?? 1012;
    const rainfall = curr.rainfall ?? 0;

    if (prevMetricsRef.current) {
      const prev = prevMetricsRef.current;
      const tempDiff = Math.abs(temp - prev.temp);
      const windDiff = wind - prev.wind;
      const pressureDrop = prev.pressure - pressure;

      let detectedChange = false;
      let changeTitle = "";
      let changeDesc = "";

      if (windDiff >= 5) {
        detectedChange = true;
        changeTitle = "🚨 Sudden Wind Velocity Shift Detected!";
        changeDesc = `Wind speed increased from ${prev.wind} km/h to ${wind} km/h in ${locationName}.`;
      } else if (pressureDrop >= 3) {
        detectedChange = true;
        changeTitle = "⚡ Barometric Pressure Drop Warning!";
        changeDesc = `Pressure dropped by ${pressureDrop.toFixed(1)} hPa in ${locationName}. High likelihood of storm formation.`;
      } else if (tempDiff >= 2) {
        detectedChange = true;
        changeTitle = "🌡️ Temperature Telemetry Shift!";
        changeDesc = `Temperature shifted by ${tempDiff.toFixed(1)}°C to ${temp}°C in ${locationName}.`;
      } else if (rainfall > prev.rainfall + 5) {
        detectedChange = true;
        changeTitle = "🌧️ Heavy Rain Accumulation Alert!";
        changeDesc = `Precipitation rate surged to ${rainfall} mm in ${locationName}.`;
      }

      if (detectedChange) {
        setActiveAlert({
          id: `alert_${Date.now()}`,
          title: changeTitle,
          description: changeDesc,
          timestamp: new Date().toLocaleTimeString(),
          severity: 'High'
        });

        playSirenSound();
      }
    }

    // Save current as reference for next update
    prevMetricsRef.current = { temp, wind, pressure, rainfall };
  }, [currentWeather, locationName]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3" id="weather_audio_alert_system">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-950 border border-amber-800 rounded-xl text-amber-400">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                🔊 AUDIBLE WEATHER CHANGE MONITOR
              </span>
              <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-bold">
                AUTO-POLLING ACTIVE
              </span>
            </div>
            <p className="text-xs font-mono text-slate-300 font-bold">
              Continuous weather report monitoring with audible siren triggers on sudden shifts
            </p>
          </div>
        </div>

        {/* Sound Controls */}
        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-2 transition cursor-pointer ${
              isSoundEnabled
                ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{isSoundEnabled ? "Alert Sound ENABLED" : "Sound MUTED"}</span>
          </button>

          <button
            onClick={playSirenSound}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            title="Test Siren Chime Sound"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Sound</span>
          </button>
        </div>
      </div>

      {/* Active Weather Shift Banner */}
      {activeAlert && (
        <div className="bg-gradient-to-r from-red-950/80 to-amber-950/80 border border-red-700/80 rounded-xl p-3 shadow-xl flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-red-200 uppercase">
                {activeAlert.title}
              </h4>
              <span className="text-[10px] text-red-300">{activeAlert.timestamp}</span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5">
              {activeAlert.description}
            </p>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="text-xs text-red-400 hover:text-red-200 font-mono font-bold px-1.5 py-0.5"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
