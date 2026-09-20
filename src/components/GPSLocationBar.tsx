import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, AlertCircle, Edit3 } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import LocationSelectorModal from './LocationSelectorModal';

export interface LocationData {
  city: string;
  district: string;
  state: string;
  postcode: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface GPSLocationBarProps {
  onLocationDetected?: (loc: LocationData) => void;
  compact?: boolean;
}

export default function GPSLocationBar({ onLocationDetected, compact = false }: GPSLocationBarProps) {
  const { currentLocation, isLoadingGps, gpsError, updateLocationFromGps } = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (onLocationDetected) {
      onLocationDetected(currentLocation);
    }
  }, [currentLocation, onLocationDetected]);

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-200">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold text-cyan-300">{currentLocation.city}</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">({currentLocation.district}, {currentLocation.state})</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-auto text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
          >
            Change
          </button>
        </div>
        <LocationSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md font-mono" id="gps_location_bar">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  {currentLocation.isGpsVerified ? "📡 LIVE GPS LOCATION" : "📍 SELECTED LOCATION"}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                {currentLocation.address}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentLocation.city} • District: {currentLocation.district} • State: {currentLocation.state}, {currentLocation.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => updateLocationFromGps()}
              disabled={isLoadingGps}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              id="gps_bar_use_location_btn"
            >
              {isLoadingGps ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>{isLoadingGps ? "Detecting GPS..." : "Use My Location"}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              id="gps_bar_change_location_btn"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Change Location</span>
            </button>
          </div>
        </div>

        {gpsError && (
          <div className="mt-3 p-2 bg-amber-950/40 border border-amber-900/50 rounded text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      <LocationSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
