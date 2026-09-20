import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  MapPin, 
  Globe, 
  Bell, 
  CloudRain, 
  Cpu, 
  Layers, 
  Save, 
  CheckCircle,
  Shield,
  Volume2
} from 'lucide-react';
import PageHeader from '../console/PageHeader';
import StatusChip from '../console/StatusChip';
import { UserAccount } from '../GoogleAuthModal';

interface SettingsViewProps {
  currentUser: UserAccount | null;
  currentLang: string;
  onSelectLanguage: (lang: string) => void;
}

export default function SettingsView({
  currentUser,
  currentLang,
  onSelectLanguage
}: SettingsViewProps) {
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings State loaded from localStorage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('aegis_console_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      // Account
      officerName: currentUser?.name || 'Sridevi Gorumucchu',
      officerEmail: currentUser?.email || 'sridevigorumucchu@gmail.com',
      role: 'Emergency Operations Director',
      // Location
      defaultState: 'Andhra Pradesh',
      defaultDistrict: 'East Godavari',
      defaultMandal: 'Gopalapuram',
      gpsAutoDetect: true,
      // Notifications
      enableAudioAlarms: true,
      enableBrowserPush: true,
      criticalSeverityOnly: false,
      // Weather & Telemetry
      telemetryPollingRate: '10s',
      temperatureUnit: 'Celsius',
      pressureUnit: 'hPa',
      // AI & Map
      primaryMLModel: 'XGBoost',
      mapProvider: 'Tactical SVG Grid',
      confidenceThreshold: 75,
      autoTriggerEvacAt70Risk: true,
    };
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('aegis_console_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5" id="settings_view">
      <PageHeader
        breadcrumbs={['Emergency Console', 'Governance & System', 'Console Settings']}
        title="Console Configuration & Preferences"
        subtitle="Manage Account Permissions, Jurisdiction Defaults, Telemetry Polling Frequencies, Audio Alarms, and Machine Learning Confidence Thresholds"
        actions={
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        }
      />

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Settings successfully persisted to local profile store.
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs font-mono">
        {/* Section 1: Account & Identity */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-semibold uppercase tracking-wider">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Authorized Officer Profile</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Director / Officer Name:</label>
              <input
                type="text"
                value={settings.officerName}
                onChange={(e) => setSettings({ ...settings, officerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Google Authorized Account:</label>
              <input
                type="email"
                disabled
                value={settings.officerEmail}
                className="w-full bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1.5 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Security Role / Clearance:</label>
              <input
                type="text"
                disabled
                value="Emergency Operations Director (Level-4 Incident Commander)"
                className="w-full bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1.5 text-cyan-300 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Jurisdiction & Location */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-semibold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Default Operational Jurisdiction</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Primary State:</label>
              <select
                value={settings.defaultState}
                onChange={(e) => setSettings({ ...settings, defaultState: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Odisha">Odisha</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Target District:</label>
              <select
                value={settings.defaultDistrict}
                onChange={(e) => setSettings({ ...settings, defaultDistrict: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="East Godavari">East Godavari</option>
                <option value="West Godavari">West Godavari</option>
                <option value="Kakinada">Kakinada</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-300">Auto-Detect GPS on Launch:</span>
              <input
                type="checkbox"
                checked={settings.gpsAutoDetect}
                onChange={(e) => setSettings({ ...settings, gpsAutoDetect: e.target.checked })}
                className="w-4 h-4 accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Audio & Alert Notifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-semibold uppercase tracking-wider">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Alerts & Emergency Dispatch Sounds</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-medium">Audible Emergency Siren:</div>
                <div className="text-[11px] text-slate-400 font-sans">Plays sound when a Critical SOS or Severe Flood is detected</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableAudioAlarms}
                onChange={(e) => setSettings({ ...settings, enableAudioAlarms: e.target.checked })}
                className="w-4 h-4 accent-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-medium">Browser Desktop Notifications:</div>
                <div className="text-[11px] text-slate-400 font-sans">Push alerts when app is in the background</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableBrowserPush}
                onChange={(e) => setSettings({ ...settings, enableBrowserPush: e.target.checked })}
                className="w-4 h-4 accent-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-medium">Filter Only Critical Alerts:</div>
                <div className="text-[11px] text-slate-400 font-sans">Silence minor advisory notices</div>
              </div>
              <input
                type="checkbox"
                checked={settings.criticalSeverityOnly}
                onChange={(e) => setSettings({ ...settings, criticalSeverityOnly: e.target.checked })}
                className="w-4 h-4 accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Machine Learning & Telemetry */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-semibold uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Inference & Telemetry Calibration</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Default Risk Model:</label>
              <select
                value={settings.primaryMLModel}
                onChange={(e) => setSettings({ ...settings, primaryMLModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="XGBoost">XGBoost Ensemble (Recommended - 95.2% Acc)</option>
                <option value="Random Forest">Random Forest Classifier (93.8% Acc)</option>
                <option value="LSTM">Long Short-Term Memory Sequence (94.6% Acc)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Telemetry Polling Interval:</label>
              <select
                value={settings.telemetryPollingRate}
                onChange={(e) => setSettings({ ...settings, telemetryPollingRate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="5s">Every 5 Seconds (High Priority)</option>
                <option value="10s">Every 10 Seconds (Standard Balanced)</option>
                <option value="30s">Every 30 Seconds (Low Bandwidth)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Risk Threshold for Evacuation Alarm ({settings.confidenceThreshold}%):
              </label>
              <input
                type="range"
                min="50"
                max="90"
                value={settings.confidenceThreshold}
                onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseInt(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
