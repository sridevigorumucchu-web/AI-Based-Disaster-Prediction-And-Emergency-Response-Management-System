import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  PhoneCall, 
  MapPin, 
  Users, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Send,
  Building,
  RefreshCw,
  Hospital as HospitalIcon
} from 'lucide-react';
import PageHeader from '../console/PageHeader';
import StatusChip from '../console/StatusChip';
import MetricCard from '../console/MetricCard';
import { EmergencyRequest, Shelter, Hospital } from '../../types';

interface EmergencyResponseViewProps {
  emergencyRequests: EmergencyRequest[];
  shelters: Shelter[];
  hospitals: Hospital[];
  onTriggerSOS: (sosData: any) => Promise<any>;
  onUpdateStatus?: (id: string, status: 'Pending' | 'Dispatched' | 'Resolved') => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

export default function EmergencyResponseView({
  emergencyRequests,
  shelters,
  hospitals,
  onTriggerSOS,
  onUpdateStatus,
  onRefresh,
  isSyncing
}: EmergencyResponseViewProps) {
  const [sosName, setSosName] = useState('Sridevi Gorumucchu');
  const [sosContact, setSosContact] = useState('+91 98765 43210');
  const [sosLocation, setSosLocation] = useState('Gopalapuram Mandal Center, East Godavari');
  const [sosSeverity, setSosSeverity] = useState<'Critical' | 'Severe' | 'Moderate'>('Critical');
  const [sosDescription, setSosDescription] = useState('Rising floodwaters breaching agricultural dyke near Godavari tributary. Immediate boat rescue required.');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Government Helplines
  const helplines = [
    { name: 'National Emergency', number: '112', type: 'All-Services' },
    { name: 'Ambulance & Trauma', number: '108', type: 'Medical' },
    { name: 'Fire & Rescue', number: '101', type: 'Rescue' },
    { name: 'Police Control', number: '100', type: 'Security' },
    { name: 'National Disaster (NDMA)', number: '1078', type: 'Disaster' },
    { name: 'State Disaster (AP SDMA)', number: '1070', type: 'Disaster' },
  ];

  const handleSendSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await onTriggerSOS({
        userName: sosName,
        contact: sosContact,
        location: sosLocation,
        latitude: 17.1044 + (Math.random() - 0.5) * 0.01,
        longitude: 81.5434 + (Math.random() - 0.5) * 0.01,
        description: sosDescription,
        severity: sosSeverity,
        disasterType: 'Flood / Inundation'
      });
      setFeedback('SOS signal dispatched to NDRF 10th Battalion & District Disaster Control Room.');
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback('Error transmitting SOS: ' + (err.message || 'Check network connection'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = emergencyRequests.filter(r => r.status === 'Pending').length;
  const dispatchedCount = emergencyRequests.filter(r => r.status === 'Dispatched').length;
  const resolvedCount = emergencyRequests.filter(r => r.status === 'Resolved').length;

  return (
    <div className="space-y-5" id="emergency_response_view">
      <PageHeader
        breadcrumbs={['Emergency Console', 'Response & Rescue', 'Emergency SOS & Response']}
        title="Emergency SOS Command & Disaster Dispatch"
        subtitle="1-Click GPS SOS Dispatch to National Disaster Response Force (NDRF), SDRF, and District Disaster Management Authorities"
        onRefresh={onRefresh}
        isRefreshing={isSyncing}
      />

      {/* Metric Cards for Dispatch Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          title="Active SOS Signals"
          value={emergencyRequests.length}
          subtitle="Total logged events"
          icon={Radio}
        />
        <MetricCard
          title="Pending Response"
          value={pendingCount}
          subtitle="Immediate dispatch queue"
          statusBadge={<StatusChip status={pendingCount > 0 ? 'CRITICAL' : 'SAFE'} label={`${pendingCount} Pending`} />}
        />
        <MetricCard
          title="Units En Route"
          value={dispatchedCount}
          subtitle="NDRF & SDRF teams"
          statusBadge={<StatusChip status="DISPATCHED" label={`${dispatchedCount} Active`} />}
        />
        <MetricCard
          title="Resolved Rescues"
          value={resolvedCount}
          subtitle="Civilians evacuated safely"
          statusBadge={<StatusChip status="RESOLVED" label={`${resolvedCount} Rescued`} />}
        />
      </div>

      {/* Verified Indian Emergency Helplines Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          Verified Government 24x7 Emergency Helplines
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {helplines.map((h) => (
            <a
              key={h.number}
              href={`tel:${h.number}`}
              className="p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500/60 transition group flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] text-slate-400 truncate">{h.name}</div>
                <div className="text-base font-bold font-mono text-cyan-400 group-hover:text-cyan-300">
                  {h.number}
                </div>
              </div>
              <div className="mt-1 text-[9px] font-mono text-slate-500 uppercase">
                {h.type} • Direct Call
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Two Column Grid: SOS Dispatch Form + Live Emergency Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 1-Click SOS Trigger Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-red-900/60 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              Transmit Priority SOS Signal
            </h3>
            <span className="text-[10px] font-mono text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800">
              GPS Encrypted
            </span>
          </div>

          <form onSubmit={handleSendSOS} className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Citizen / Reporter Name *</label>
              <input
                type="text"
                required
                value={sosName}
                onChange={(e) => setSosName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Emergency Contact Number *</label>
              <input
                type="tel"
                required
                value={sosContact}
                onChange={(e) => setSosContact(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Incident Location (Mandal / Landmark) *</label>
              <input
                type="text"
                required
                value={sosLocation}
                onChange={(e) => setSosLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Threat Severity Level *</label>
              <select
                value={sosSeverity}
                onChange={(e) => setSosSeverity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-red-500"
              >
                <option value="Critical">Critical (Life Threatening / Immediate Rescue)</option>
                <option value="Severe">Severe (Trapped / Rising Water)</option>
                <option value="Moderate">Moderate (Supply Shortage / Medical Evac)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Situation Description *</label>
              <textarea
                required
                rows={3}
                value={sosDescription}
                onChange={(e) => setSosDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/40"
              id="submit_emergency_sos_btn"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Broadcast Emergency SOS to Responders</span>
            </button>

            {feedback && (
              <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px]">
                {feedback}
              </div>
            )}
          </form>
        </div>

        {/* Right: Live Emergency Dispatch Feed (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                Active Emergency Request Queue ({emergencyRequests.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Auto-refreshes every 10s
              </span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {emergencyRequests.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-mono text-xs">
                  No emergency requests currently active.
                </div>
              ) : (
                emergencyRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-100">
                          {req.userName}
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400">
                          {req.contact}
                        </span>
                      </div>
                      <StatusChip status={req.status || 'Pending'} size="sm" />
                    </div>

                    <p className="text-xs text-slate-300 font-sans line-clamp-2 my-1">
                      {req.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-850 gap-2">
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3 text-red-400" />
                        {req.location}
                      </span>
                      <span>
                        Coords: {req.latitude?.toFixed(4) || '17.1044'}, {req.longitude?.toFixed(4) || '81.5434'}
                      </span>
                      <span>
                        {new Date(req.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Primary Dispatch Center: Rajahmundry SDRF Depot (18 mins ETA)</span>
          </div>
        </div>
      </div>

      {/* Verified Nearby Facilities Summary (Shelters & Hospitals) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
          <HospitalIcon className="w-3.5 h-3.5 text-cyan-400" />
          Verified Critical Infrastructure Available in Andhra Pradesh Basin
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hospitals.slice(0, 3).map((h) => (
            <div key={h.id} className="p-3 rounded bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="font-semibold text-slate-200 text-xs">{h.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{h.address}</div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400 font-bold">{h.emergencyBeds} Beds Ready</span>
                <span className="text-slate-400">ICU: {h.icuAvailable ? 'YES' : 'NO'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
