import React, { useState } from 'react';
import { MapPin, Navigation, Search, Check, X, AlertCircle, Compass, Shield } from 'lucide-react';
import { useLocation } from '../context/LocationContext.tsx';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationSelectorModal({ isOpen, onClose }: LocationSelectorModalProps) {
  const {
    currentLocation,
    setCurrentLocation,
    presetLocations,
    updateLocationFromGps,
    isDetectingGps,
    gpsError,
    setGpsError,
    setCustomLocation
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPresets = presetLocations.filter(loc =>
    loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPreset = (loc: typeof presetLocations[0]) => {
    setCurrentLocation(loc);
    onClose();
  };

  const handleApplyCustomCoords = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);

    if (isNaN(lat) || isNaN(lng)) {
      setValidationError("Please enter valid numerical latitude and longitude.");
      return;
    }

    // Validate India bounds (Lat: 6 to 38.5, Lng: 68 to 98)
    if (lat < 6.0 || lat > 38.5 || lng < 68.0 || lng > 98.0) {
      setValidationError("Coordinates must fall inside India (Latitude: 6.0° to 38.5°N, Longitude: 68.0° to 98.0°E).");
      return;
    }

    setCustomLocation({
      latitude: lat,
      longitude: lng,
      address: customLabel.trim() || `Custom Indian Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
      city: "Selected Location"
    });
    onClose();
  };

  const handleGpsClick = async () => {
    const success = await updateLocationFromGps();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wide">
                Select Indian Operational Location
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Safe shelters & emergency evacuation will calculate from this point
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 font-mono">
          {/* GPS Quick Action */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Auto-Detect via GPS
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Uses device browser geolocation inside India
              </div>
            </div>
            <button
              type="button"
              onClick={handleGpsClick}
              disabled={isDetectingGps}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white rounded text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              {isDetectingGps ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Detecting GPS...
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" /> Use My Location
                </>
              )}
            </button>
          </div>

          {/* GPS or General Error Banner */}
          {(gpsError || validationError) && (
            <div className="p-3 bg-red-950/50 border border-red-900/60 rounded-lg text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>{gpsError || validationError}</div>
            </div>
          )}

          {/* Search Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
              Search Verified Indian Regions & Districts
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Gopalapuram, Agiripalle, Eluru, Vijayawada, etc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Preset Locations Grid */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Verified Indian Locations ({filteredPresets.length})
            </span>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredPresets.map((loc, idx) => {
                const isSelected =
                  Math.abs(loc.latitude - currentLocation.latitude) < 0.001 &&
                  Math.abs(loc.longitude - currentLocation.longitude) < 0.001;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(loc)}
                    className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{loc.address}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {loc.district}, {loc.state} • Lat {loc.latitude.toFixed(4)}, Lng {loc.longitude.toFixed(4)}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 bg-cyan-900/60 border border-cyan-700 text-[10px] font-bold text-cyan-200 rounded shrink-0 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </button>
                );
              })}
              {filteredPresets.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500">
                  No matching preset found. Use custom coordinate input below.
                </div>
              )}
            </div>
          </div>

          {/* Custom Coordinates Input */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-2">
              Or Enter Precise Indian Coordinates
            </span>
            <form onSubmit={handleApplyCustomCoords} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Latitude (6.0° to 38.5°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 16.6624"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Longitude (68.0° to 98.0°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 80.7374"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Location Description / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Gopalapuram Village Center, Agiripalle"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-cyan-400" /> Apply Coordinates & Update Shelters
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div>
            Active: <strong className="text-slate-200">{currentLocation.city}, {currentLocation.state}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
