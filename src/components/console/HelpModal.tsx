import React from 'react';
import { X, ShieldAlert, PhoneCall, HelpCircle, BookOpen, ExternalLink, Activity, Info } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  const helplines = [
    { service: 'National Emergency Helpline', number: '112', coverage: 'All-India 24x7 integrated emergency service' },
    { service: 'Ambulance & Medical Emergency', number: '108', coverage: 'Statewide emergency medical response' },
    { service: 'Disaster Management Authority (NDMA)', number: '1078', coverage: 'National disaster control room' },
    { service: 'State Disaster Management (AP SDMA)', number: '1070', coverage: 'Andhra Pradesh state disaster helpline' },
    { service: 'Fire & Rescue Services', number: '101', coverage: 'Immediate fire fighting & flood rescue' },
    { service: 'Police Assistance', number: '100', coverage: 'Law enforcement & evacuation cordoning' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-950/60 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                AI-Based Disaster Prediction and Emergency Response Management System Reference
              </h2>
              <p className="text-xs text-slate-400">
                Operational Guidelines & National Emergency Directories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Quick Helplines */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              Verified Government Helplines (India)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {helplines.map((hl) => (
                <div key={hl.service} className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-slate-200">{hl.service}</div>
                    <div className="text-[11px] text-slate-400">{hl.coverage}</div>
                  </div>
                  <a
                    href={`tel:${hl.number}`}
                    className="font-mono font-bold text-sm text-cyan-400 hover:underline bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/60"
                  >
                    {hl.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Core System Architecture */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Console Workflows & Algorithms
            </h3>
            <div className="space-y-2">
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-slate-200">A* Evacuation Algorithm: </span>
                <span>
                  Evaluates distance, inundation levels, road blockage status, and traffic congestion to compute the safest civilian path to verified relief centers.
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-slate-200">AI Computer Vision Fallback: </span>
                <span>
                  Uses primary and secondary multimodal vision models (gemini-3.6-flash / gemini-3.5-flash) with server-side frame extraction to assess flood, fire, and structural damage without downtime.
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-slate-200">Real-Time Telemetry: </span>
                <span>
                  Polls atmospheric metrics from IMD-grounded endpoints and computes dynamic flood, cyclone, and heat risks across Indian districts.
                </span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Quick Navigation Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Dashboard</span>
                <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Alt + 1</kbd>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Weather</span>
                <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Alt + 2</kbd>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Emergency SOS</span>
                <kbd className="bg-red-950 border border-red-800 px-1.5 py-0.5 rounded text-red-300">Alt + E</kbd>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">AI Analyzer</span>
                <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Alt + A</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            AI-Based Disaster Prediction & Emergency Response Management System v2.4 • India Operations
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
