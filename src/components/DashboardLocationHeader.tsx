import React, { useState } from 'react';
import { MapPin, Navigation, RefreshCw, AlertCircle, Edit3, CheckCircle2, Radio } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import LocationSelectorModal from './LocationSelectorModal';

export default function DashboardLocationHeader() {
  const { 
    currentLocation, 
    updateLocationFromGps, 
    isDetectingGps, 
    gpsStatus, 
    gpsError 
  } = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status indicator styling & text
  const getStatusBadge = () => {
    switch (gpsStatus) {
      case 'Live':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE GPS
          </span>
        );
      case 'Detecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-700/80 shadow-sm">
            <RefreshCw className="w-2.5 h-2.5 animate-spin text-cyan-400" />
            DETECTING...
          </span>
        );
      case 'Unavailable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/90 text-rose-300 border border-rose-800/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            UNAVAILABLE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            MANUAL (INDIA)
          </span>
        );
    }
  };

  return (
    <div 
      className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-lg mb-5" 
      id="dashboard_location_header"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Left: Location Details */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-cyan-950/70 border border-cyan-800/80 rounded-lg text-cyan-400 shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              <span className="text-[11px] font-mono text-slate-400">
                {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E
              </span>
              {currentLocation.accuracy && (
                <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                  (±{currentLocation.accuracy}m accuracy)
                </span>
              )}
            </div>

            {/* Real-time Location: City, District, State */}
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-1.5">
              <span>{currentLocation.city || 'Current Region'}</span>
              <span className="text-slate-500 font-normal">,</span>
              <span className="text-slate-300">{currentLocation.district || 'District'}</span>
              <span className="text-slate-500 font-normal">,</span>
              <span className="text-cyan-400 font-medium">{currentLocation.state || 'India'}</span>
            </h2>

            <p className="text-xs text-slate-400 font-mono line-clamp-1">
              {currentLocation.address}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <button
            onClick={() => updateLocationFromGps()}
            disabled={isDetectingGps}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            id="dashboard_detect_gps_btn"
            title="Request current device location via browser Geolocation API"
          >
            {isDetectingGps ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>{isDetectingGps ? 'Detecting...' : 'Detect My Location'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer"
            id="dashboard_change_location_btn"
            title="Choose another verified Indian location"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Change Location</span>
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="mt-3 p-2 bg-amber-950/40 border border-amber-800/60 rounded text-xs font-mono text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {isModalOpen && (
        <LocationSelectorModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
