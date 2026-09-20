import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Filter, 
  Search, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  ExternalLink,
  CheckCircle,
  Radio
} from 'lucide-react';
import PageHeader from '../console/PageHeader';
import StatusChip from '../console/StatusChip';
import MetricCard from '../console/MetricCard';
import { SystemAlert } from '../../types';

interface DisasterAlertsViewProps {
  alerts: SystemAlert[];
  onRefresh: () => void;
  isSyncing: boolean;
}

export default function DisasterAlertsView({
  alerts,
  onRefresh,
  isSyncing
}: DisasterAlertsViewProps) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredAlerts = alerts.filter(a => {
    const matchesSeverity = severityFilter === 'ALL' || a.severity.toUpperCase() === severityFilter;
    const matchesSearch = !searchFilter || 
      a.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.message.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.location.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const criticalCount = alerts.filter(a => a.severity.toUpperCase() === 'CRITICAL' || a.severity.toUpperCase() === 'HIGH').length;
  const warningCount = alerts.filter(a => a.severity.toUpperCase() === 'WARNING' || a.severity.toUpperCase() === 'MODERATE').length;

  return (
    <div className="space-y-5" id="disaster_alerts_view">
      <PageHeader
        breadcrumbs={['Emergency Console', 'Monitoring', 'Disaster Alerts']}
        title="Official Disaster Alerts & Weather Bulletins"
        subtitle="Real-Time Bulletins Issued by India Meteorological Department (IMD), NDMA, and State Disaster Authorities"
        onRefresh={onRefresh}
        isRefreshing={isSyncing}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          title="Active Bulletins"
          value={alerts.length}
          subtitle="Currently broadcasted"
          icon={Bell}
        />
        <MetricCard
          title="Severe / Critical"
          value={criticalCount}
          subtitle="Urgent action required"
          statusBadge={<StatusChip status="CRITICAL" label={`${criticalCount} Critical`} />}
        />
        <MetricCard
          title="Advisory / Moderate"
          value={warningCount}
          subtitle="Precautionary watches"
          statusBadge={<StatusChip status="MODERATE" label={`${warningCount} Warnings`} />}
        />
        <MetricCard
          title="Issuing Authorities"
          value="3 Agencies"
          subtitle="IMD, NDMA, AP SDMA"
          statusBadge={<StatusChip status="INFO" label="Verified Feeds" />}
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by district, keyword, or advisory..."
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1 text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Severity Filter:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded text-xs transition ${
                severityFilter === sev
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid / Cards */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-500 font-mono text-xs">
            No hazard alerts match the specified filter criteria.
          </div>
        ) : (
          filteredAlerts.map((al) => (
            <div
              key={al.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100">{al.title}</span>
                  <StatusChip status={al.severity} size="sm" pulse={al.severity.toUpperCase() === 'CRITICAL' || al.severity.toUpperCase() === 'HIGH'} />
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(al.timestamp).toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-cyan-400">
                    {al.source || 'IMD / AP SDMA'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {al.message}
              </p>

              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Affected District: <strong className="text-slate-100">{al.location}</strong></span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Authorized Broadcast • CAP v1.2 Protocol
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
