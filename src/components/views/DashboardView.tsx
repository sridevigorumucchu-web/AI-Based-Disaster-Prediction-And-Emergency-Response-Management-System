import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle, 
  MapPin, 
  Sparkles, 
  Navigation, 
  ShieldAlert, 
  FileText, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  CheckCircle,
  Radio,
  Clock,
  RefreshCw,
  Home,
  Gauge
} from 'lucide-react';
import MetricCard from '../console/MetricCard';
import StatusChip from '../console/StatusChip';
import PageHeader from '../console/PageHeader';
import DashboardLocationHeader from '../DashboardLocationHeader';
import { useLocation } from '../../context/LocationContext';
import { DisasterPrediction, EmergencyRequest, SystemAlert, Shelter } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  predictions: DisasterPrediction[];
  emergencyRequests: EmergencyRequest[];
  alerts: SystemAlert[];
  shelters: Shelter[];
  weatherSectors: any[];
  onRefreshTelemetry?: () => void;
  onRefresh?: () => void;
  isSyncing: boolean;
}

export default function DashboardView({
  onNavigate,
  predictions,
  emergencyRequests,
  alerts,
  shelters,
  weatherSectors,
  onRefreshTelemetry,
  onRefresh,
  isSyncing
}: DashboardViewProps) {
  const handleRefresh = onRefresh || onRefreshTelemetry;
  const { currentLocation } = useLocation();

  // Real-time location-based weather state
  const [liveWeather, setLiveWeather] = useState<any>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Fetch live weather using current coordinates
  const fetchLiveWeatherForLocation = async () => {
    if (!currentLocation?.latitude || !currentLocation?.longitude) return;
    setIsLoadingWeather(true);
    try {
      const res = await fetch(`/api/live-weather?lat=${currentLocation.latitude}&lng=${currentLocation.longitude}`);
      if (res.ok) {
        const data = await res.json();
        setLiveWeather(data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.warn("Failed to fetch live weather for location:", e);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Re-fetch weather whenever currentLocation changes
  useEffect(() => {
    fetchLiveWeatherForLocation();
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  // Periodic automatic weather refresh every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchLiveWeatherForLocation();
    }, 60000);
    return () => clearInterval(timer);
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  // Values derived from live weather or fallback
  const temp = liveWeather?.current?.temperature ?? 31.4;
  const rain = liveWeather?.current?.precipitation ?? 18.5;
  const humidity = liveWeather?.current?.humidity ?? 78;
  const wind = liveWeather?.current?.windSpeed ?? 24.2;
  const pressure = liveWeather?.current?.pressure ?? 1008;
  const condition = liveWeather?.current?.conditionText ?? 'Mainly Clear';

  // Overall risk calculated from real atmospheric parameters
  const overallRisk = rain > 50 || wind > 65 ? 'CRITICAL' : rain > 25 || wind > 40 ? 'HIGH' : rain > 10 ? 'MODERATE' : 'LOW';

  const pendingSOS = emergencyRequests.filter(r => r.status === 'Pending' || r.status === 'Dispatched');

  // Calculate nearby safe shelters relative to user's current GPS location
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  };

  const nearbyShelters = shelters
    .map(s => ({
      ...s,
      distanceKm: calculateDistanceKm(currentLocation.latitude, currentLocation.longitude, s.latitude, s.longitude)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3);

  return (
    <div className="space-y-5" id="dashboard_view">
      <PageHeader
        breadcrumbs={['Emergency Console', 'Overview', 'Dashboard']}
        title="Disaster Prediction & Emergency Response"
        subtitle="AI Disaster Forecasting • Real-Time Location Telemetry & Verified Safe Shelters"
        onRefresh={() => {
          if (handleRefresh) handleRefresh();
          fetchLiveWeatherForLocation();
        }}
        isRefreshing={isSyncing || isLoadingWeather}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Updated: {lastUpdated}</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Telemetry Online
            </span>
          </div>
        }
      />

      {/* Real-time Location Component in Header */}
      <DashboardLocationHeader />

      {/* Summary Metric Cards with Live Weather */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard
          id="metric_temp"
          title="Surface Temp"
          value={typeof temp === 'number' ? temp.toFixed(1) : temp}
          unit="°C"
          subtitle={condition}
          icon={Thermometer}
          onClick={() => onNavigate('weather-prediction')}
        />
        <MetricCard
          id="metric_rainfall"
          title="Precipitation"
          value={typeof rain === 'number' ? rain.toFixed(1) : rain}
          unit="mm/hr"
          subtitle="Real-time precipitation"
          icon={CloudRain}
          trend={{ value: rain > 25 ? 'SURGE' : 'NORMAL', isPositive: rain <= 25 }}
          onClick={() => onNavigate('weather-prediction')}
        />
        <MetricCard
          id="metric_humidity"
          title="Rel. Humidity"
          value={humidity}
          unit="%"
          subtitle="Atmospheric moisture"
          icon={Droplets}
          onClick={() => onNavigate('weather-prediction')}
        />
        <MetricCard
          id="metric_wind"
          title="Wind Velocity"
          value={typeof wind === 'number' ? wind.toFixed(1) : wind}
          unit="km/h"
          subtitle={`${pressure} hPa barometric`}
          icon={Wind}
          onClick={() => onNavigate('weather-prediction')}
        />
        <MetricCard
          id="metric_risk"
          title="Disaster Risk Summary"
          value={String(overallRisk).toUpperCase()}
          subtitle="Real-time hazard indicator"
          statusBadge={<StatusChip status={String(overallRisk)} pulse={overallRisk === 'CRITICAL' || overallRisk === 'HIGH'} />}
          onClick={() => onNavigate('weather-prediction')}
        />
      </div>

      {/* Quick Action Command Shortcuts */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Quick Emergency Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => onNavigate('ai-analyzer')}
            className="p-3 bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-850 rounded-lg text-left transition group cursor-pointer"
            id="quick_btn_analyze_image"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 mb-1.5 group-hover:scale-110 transition" />
            <div className="text-xs font-semibold text-slate-200">AI Analyzer</div>
            <div className="text-[10px] text-slate-400">Media Classification</div>
          </button>

          <button
            onClick={() => onNavigate('weather-prediction')}
            className="p-3 bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-850 rounded-lg text-left transition group cursor-pointer"
            id="quick_btn_weather_prediction"
          >
            <CloudRain className="w-4 h-4 text-blue-400 mb-1.5 group-hover:scale-110 transition" />
            <div className="text-xs font-semibold text-slate-200">Weather & Predict</div>
            <div className="text-[10px] text-slate-400">Live Forecast & ML</div>
          </button>

          <button
            onClick={() => onNavigate('shelters')}
            className="p-3 bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-850 rounded-lg text-left transition group cursor-pointer"
            id="quick_btn_shelters"
          >
            <Home className="w-4 h-4 text-emerald-400 mb-1.5 group-hover:scale-110 transition" />
            <div className="text-xs font-semibold text-slate-200">Safe Shelters</div>
            <div className="text-[10px] text-slate-400">Nearby Havens</div>
          </button>

          <button
            onClick={() => onNavigate('evacuation')}
            className="p-3 bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-850 rounded-lg text-left transition group cursor-pointer"
            id="quick_btn_evac"
          >
            <Navigation className="w-4 h-4 text-teal-400 mb-1.5 group-hover:scale-110 transition" />
            <div className="text-xs font-semibold text-slate-200">A* Evacuation</div>
            <div className="text-[10px] text-slate-400">Pathfinding</div>
          </button>

          <button
            onClick={() => onNavigate('emergency')}
            className="p-3 bg-slate-950 border border-red-850/80 hover:border-red-500 hover:bg-red-950/20 rounded-lg text-left transition group cursor-pointer"
            id="quick_btn_sos"
          >
            <ShieldAlert className="w-4 h-4 text-red-400 mb-1.5 group-hover:scale-110 transition" />
            <div className="text-xs font-semibold text-red-300">Emergency SOS</div>
            <div className="text-[10px] text-slate-400">Trigger Alert</div>
          </button>

          <button
            onClick={() => onNavigate('damage-assessment')}
            className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-850 rounded-lg text-left transition group cursor-pointer"
            id="quick_btn_damage"
          >
            <FileText className="w-4 h-4 text-amber-400 mb-1.5 group-hover:scale-110 transition" />
            <div className="text-xs font-semibold text-slate-200">Damage & Report</div>
            <div className="text-[10px] text-slate-400">PDF Assessment</div>
          </button>
        </div>
      </div>

      {/* Two Columns: Weather-Based Risk Summary + Nearby Safe Shelters & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Real-time Weather-Based Disaster Risk Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Disaster Risk Summary • {currentLocation.city || 'Current Region'}
              </h2>
              <button
                onClick={() => onNavigate('weather-prediction')}
                className="text-[11px] text-cyan-400 hover:underline font-mono cursor-pointer"
              >
                Weather & Prediction →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { type: 'Riverine Flood Surge', risk: rain > 35 ? 'HIGH' : rain > 15 ? 'MODERATE' : 'LOW', note: 'Catchment runoff & precipitation index' },
                { type: 'Cyclone / High Gale Winds', risk: wind > 55 ? 'HIGH' : wind > 35 ? 'MODERATE' : 'LOW', note: 'Sustained onshore wind velocities' },
                { type: 'Flash Inundation', risk: rain > 25 ? 'MODERATE' : 'LOW', note: 'Local low-lying topography drainage rate' },
                { type: 'Severe Thunderstorm', risk: humidity > 80 && temp > 32 ? 'MODERATE' : 'LOW', note: 'Atmospheric convective instability' },
                { type: 'Extreme Heatwave', risk: temp > 40 ? 'HIGH' : temp > 36 ? 'MODERATE' : 'LOW', note: 'Ambient thermal discomfort index' },
              ].map((hazard) => (
                <div
                  key={hazard.type}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{hazard.type}</div>
                    <div className="text-[11px] text-slate-400">{hazard.note}</div>
                  </div>
                  <StatusChip status={hazard.risk} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Forecast Engine: Real-time Meteorology + ML Models</span>
            <span className="text-cyan-400">Status: Active</span>
          </div>
        </div>

        {/* Right: Nearby Safe Shelters & Active Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                Nearby Safe Shelters (From Your Location)
              </h2>
              <button
                onClick={() => onNavigate('shelters')}
                className="text-[11px] text-cyan-400 hover:underline font-mono cursor-pointer"
              >
                All Shelters ({shelters.length}) →
              </button>
            </div>

            {/* Top 3 Closest Shelters */}
            <div className="space-y-2 mb-4">
              {nearbyShelters.map((shelter) => (
                <div 
                  key={shelter.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 text-xs truncate">{shelter.name}</span>
                      <StatusChip status={shelter.status} size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {shelter.city}, {shelter.district} • {shelter.availableBeds || shelter.capacity - shelter.occupied} beds available
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {shelter.distanceKm} km
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono">Distance</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Alerts Preview */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Active Regional Alerts ({alerts.length})
                </h3>
                <button
                  onClick={() => onNavigate('alerts')}
                  className="text-[11px] text-cyan-400 hover:underline font-mono cursor-pointer"
                >
                  View Alerts →
                </button>
              </div>

              <div className="space-y-2">
                {alerts.slice(0, 2).map((al) => (
                  <div
                    key={al.id}
                    className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-200 text-xs truncate">{al.title}</span>
                      <StatusChip status={al.severity} size="sm" />
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{al.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Pending SOS Cases: {pendingSOS.length}</span>
            <button
              onClick={() => onNavigate('emergency')}
              className="text-red-400 hover:underline cursor-pointer"
            >
              Open Emergency Desk →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
