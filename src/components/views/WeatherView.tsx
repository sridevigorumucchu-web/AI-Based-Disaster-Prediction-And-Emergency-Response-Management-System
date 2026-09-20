import React, { useState } from 'react';
import { 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  Compass, 
  Eye, 
  MapPin, 
  RefreshCw, 
  Calendar,
  AlertTriangle,
  LocateFixed,
  TrendingUp
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import MetricCard from '../console/MetricCard';
import StatusChip from '../console/StatusChip';
import PageHeader from '../console/PageHeader';

interface WeatherViewProps {
  weatherSectors?: any[];
  onRefresh?: () => void;
  isSyncing?: boolean;
  currentLang?: string;
}

export default function WeatherView({
  weatherSectors = [],
  onRefresh = () => {},
  isSyncing = false,
  currentLang = 'en'
}: WeatherViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'hourly' | 'daily' | 'monthly'>('overview');
  const [currentLocation, setCurrentLocation] = useState('Gopalapuram, Andhra Pradesh, India');
  const [isLocating, setIsLocating] = useState(false);

  // Hourly Forecast Data (24 hours)
  const hourlyData = [
    { time: '00:00', temp: 26.5, rain: 2.1, humidity: 88, wind: 14 },
    { time: '03:00', temp: 25.8, rain: 4.5, humidity: 91, wind: 16 },
    { time: '06:00', temp: 27.2, rain: 8.2, humidity: 86, wind: 19 },
    { time: '09:00', temp: 30.1, rain: 14.8, humidity: 80, wind: 22 },
    { time: '12:00', temp: 33.4, rain: 22.4, humidity: 76, wind: 26 },
    { time: '15:00', temp: 32.1, rain: 28.0, humidity: 79, wind: 31 },
    { time: '18:00', temp: 29.8, rain: 19.5, humidity: 84, wind: 24 },
    { time: '21:00', temp: 27.9, rain: 8.0, humidity: 87, wind: 18 },
  ];

  // 7-day Daily Forecast Data
  const dailyData = [
    { day: 'Mon', tempMax: 33.2, tempMin: 25.4, rain: 18.5, wind: 24 },
    { day: 'Tue', tempMax: 34.0, tempMin: 26.0, rain: 35.2, wind: 38 },
    { day: 'Wed', tempMax: 32.5, tempMin: 25.0, rain: 48.0, wind: 45 },
    { day: 'Thu', tempMax: 30.8, tempMin: 24.2, rain: 26.5, wind: 30 },
    { day: 'Fri', tempMax: 31.4, tempMin: 25.1, rain: 12.0, wind: 20 },
    { day: 'Sat', tempMax: 33.6, tempMin: 26.3, rain: 6.4, wind: 16 },
    { day: 'Sun', tempMax: 34.5, tempMin: 26.8, rain: 4.0, wind: 15 },
  ];

  // 30-day Precipitation Trend
  const monthlyData = [
    { week: 'Wk 1', rainfall: 68, avgTemp: 32 },
    { week: 'Wk 2', rainfall: 142, avgTemp: 30 },
    { week: 'Wk 3', rainfall: 95, avgTemp: 31 },
    { week: 'Wk 4', rainfall: 54, avgTemp: 33 },
  ];

  const handleDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setCurrentLocation(`Gopalapuram Sub-District (Lat ${pos.coords.latitude.toFixed(2)}, Lng ${pos.coords.longitude.toFixed(2)})`);
        },
        () => {
          setIsLocating(false);
          setCurrentLocation('Gopalapuram, Andhra Pradesh, India (GPS default)');
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  return (
    <div className="space-y-5" id="weather_view">
      <PageHeader
        breadcrumbs={['Emergency Console', 'Monitoring', 'Weather Intelligence']}
        title="Atmospheric Telemetry & Forecasts"
        subtitle="IMD Radar, Godavari Basin Sensor Feeds & Multi-Disaster Hazard Corroboration"
        onRefresh={onRefresh}
        isRefreshing={isSyncing}
      />

      {/* Location Strip with Change & Detect */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-300">Monitored Station:</span>
          <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/60">
            {currentLocation}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-mono text-slate-300 transition"
          >
            <LocateFixed className={`w-3.5 h-3.5 text-cyan-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : 'Detect My Location'}</span>
          </button>
          <button
            onClick={() => {
              const loc = prompt('Enter District or Mandal in India:', currentLocation);
              if (loc) setCurrentLocation(loc);
            }}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition"
          >
            Change Location
          </button>
        </div>
      </div>

      {/* Comprehensive Current Weather Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wide">
              Live Station Telemetry • 17.1044° N, 81.5434° E
            </div>
            <div className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
              <span>Partly Cloudy with Monsoon Influx</span>
              <StatusChip status="MODERATE" label="Runoff Alert" size="sm" />
            </div>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            Updated: {new Date().toLocaleTimeString()} IST
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Surface Temp</span>
            <div className="text-2xl font-bold font-mono text-slate-100">31.4 <span className="text-sm text-slate-400 font-sans">°C</span></div>
            <div className="text-[11px] text-slate-400">Feels like 36.2°C</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Precipitation</span>
            <div className="text-2xl font-bold font-mono text-cyan-400">18.5 <span className="text-sm text-slate-400 font-sans">mm/h</span></div>
            <div className="text-[11px] text-slate-400">Rain Prob: 82%</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Humidity</span>
            <div className="text-2xl font-bold font-mono text-slate-100">78 <span className="text-sm text-slate-400 font-sans">%</span></div>
            <div className="text-[11px] text-slate-400">Dew Point: 24.8°C</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Wind Velocity</span>
            <div className="text-2xl font-bold font-mono text-slate-100">24.2 <span className="text-sm text-slate-400 font-sans">km/h</span></div>
            <div className="text-[11px] text-slate-400">Direction: ENE (68°)</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Pressure</span>
            <div className="text-2xl font-bold font-mono text-slate-100">1008 <span className="text-sm text-slate-400 font-sans">hPa</span></div>
            <div className="text-[11px] text-slate-400">Depression trend: -1.2</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Visibility</span>
            <div className="text-2xl font-bold font-mono text-slate-100">6.8 <span className="text-sm text-slate-400 font-sans">km</span></div>
            <div className="text-[11px] text-slate-400">Precipitation haze</div>
          </div>
        </div>
      </div>

      {/* Tabs & Charts */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
            {(['overview', 'hourly', 'daily', 'monthly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-xs font-mono transition ${
                  activeTab === tab
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'hourly' && '24 Hours'}
                {tab === 'daily' && '7 Days'}
                {tab === 'monthly' && '30 Days'}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-slate-400">
            Source: IMD Radar Ground Station AP-04
          </span>
        </div>

        {/* Chart View */}
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'overview' || activeTab === 'hourly' ? (
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="rain" name="Rainfall (mm/h)" stroke="#06b6d4" fillOpacity={1} fill="url(#rainGrad)" />
                <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f59e0b" fillOpacity={1} fill="url(#tempGrad)" />
              </AreaChart>
            ) : activeTab === 'daily' ? (
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="rain" name="Rainfall (mm)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tempMax" name="Max Temp (°C)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="rainfall" name="Accumulated Rainfall (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weather-Based Disaster Risk Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Hazard Threat Levels Based on Atmospheric Telemetry
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { disaster: 'River Flood', level: 'HIGH', desc: 'Inundation risk near Godavari banks due to upstream reservoir discharge.', trigger: 'Rainfall > 35mm/h' },
            { disaster: 'Cyclone / Coastal Gale', level: 'MODERATE', desc: 'Depression forming in Central Bay of Bengal with squally wind speeds.', trigger: 'Wind > 45km/h' },
            { disaster: 'Wildfire / Field Fire', level: 'LOW', desc: 'Moisture content exceeds ignition safety limits.', trigger: 'Humidity 78%' },
            { disaster: 'Landslide', level: 'MODERATE', desc: 'Papikonda hill slopes saturated by continuous rain.', trigger: 'Slope soil saturation' },
            { disaster: 'Agricultural Heatwave', level: 'LOW', desc: 'Temperatures moderated by monsoon cloud cover.', trigger: 'Temp < 35°C' },
            { disaster: 'Severe Thunderstorm', level: 'MODERATE', desc: 'Convective cell activity detected in Kovvur-Gopalapuram corridor.', trigger: 'CAPE Index 1850' },
          ].map((item) => (
            <div
              key={item.disaster}
              className="p-3.5 rounded bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs">{item.disaster}</span>
                <StatusChip status={item.level} size="sm" />
              </div>
              <p className="text-[11px] text-slate-400">{item.desc}</p>
              <div className="text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-1.5 flex justify-between">
                <span>Trigger:</span>
                <span className="text-cyan-400">{item.trigger}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
