import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Bed, 
  Utensils, 
  Stethoscope, 
  Zap, 
  ExternalLink,
  Search,
  ChevronRight
} from 'lucide-react';
import { Shelter } from '../types.ts';

interface NearbySheltersListProps {
  userLat: number;
  userLng: number;
  shelters: Shelter[];
  onUpdateShelter?: (id: string, occupied: number) => void;
}

export default function NearbySheltersList({
  userLat,
  userLng,
  shelters,
  onUpdateShelter
}: NearbySheltersListProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Haversine distance calculation in kilometers
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  };

  // Enhance shelters with distance and sort closest first
  const sortedShelters = shelters.map(s => {
    const sLat = s.latitude;
    const sLng = s.longitude;
    const dist = calculateDistanceKm(userLat, userLng, sLat, sLng);
    return { ...s, calculatedDistance: dist };
  }).sort((a, b) => a.calculatedDistance - b.calculatedDistance);

  const filteredShelters = sortedShelters.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          (s.address || s.location || '').toLowerCase().includes(searchFilter.toLowerCase());
    const matchesAvailability = !onlyAvailable || (s.capacity - s.occupied) > 0;
    return matchesSearch && matchesAvailability;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6" id="nearby_shelters_root">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400">
            <Building2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black">
                📍 GEO-SPATIAL DISTANCE MATRIX
              </span>
              <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                SORTED CLOSEST FIRST
              </span>
            </div>
            <h2 className="text-base font-black tracking-tight text-slate-100 font-sans mt-0.5">
              NEARBY EMERGENCY RELIEF SHELTERS
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Calculated distances relative to your selected location ({userLat.toFixed(4)}°, {userLng.toFixed(4)}°)
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search shelter name..."
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span>Beds Available Only</span>
          </label>
        </div>
      </div>

      {/* Shelters List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredShelters.map((shelter, idx) => {
          const availableBeds = Math.max(0, shelter.capacity - shelter.occupied);
          const percentOccupied = Math.min(100, Math.round((shelter.occupied / shelter.capacity) * 100));
          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${shelter.latitude},${shelter.longitude}`;

          return (
            <div
              key={shelter.id}
              className={`border rounded-xl p-5 shadow-lg relative transition-all duration-300 hover:border-emerald-500/80 ${
                idx === 0 ? 'bg-gradient-to-br from-slate-900 to-emerald-950/30 border-emerald-700/80 shadow-emerald-950/30' : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              {/* Distance Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-lg font-mono text-xs font-black">
                    📍 {shelter.calculatedDistance} KM
                  </span>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-1.5">
                      <span>{shelter.name}</span>
                      {shelter.status === 'Open' && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified Safe Zone" />
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">
                      {shelter.address || shelter.location}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  availableBeds > 50 ? 'bg-emerald-900/60 text-emerald-300' :
                  availableBeds > 0 ? 'bg-amber-900/60 text-amber-300' : 'bg-red-900/60 text-red-300'
                }`}>
                  {availableBeds > 0 ? `${availableBeds} Beds Free` : 'FULL'}
                </span>
              </div>

              {/* Occupancy Progress */}
              <div className="space-y-1 font-mono text-[10px] mb-3">
                <div className="flex justify-between text-slate-400">
                  <span>Capacity: {shelter.occupied} / {shelter.capacity} Occupied</span>
                  <span>{percentOccupied}% Full</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      percentOccupied > 90 ? 'bg-red-500' :
                      percentOccupied > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentOccupied}%` }}
                  />
                </div>
              </div>

              {/* Facilities Icons */}
              <div className="flex flex-wrap gap-2 text-[10px] font-mono mb-4">
                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300 flex items-center gap-1">
                  <Utensils className="w-3 h-3 text-amber-400" /> Food & Water: {shelter.availableFood || 'Yes'}
                </span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-cyan-400" /> Medical Team: {shelter.medicalTeam ? 'Present' : 'Available'}
                </span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" /> Power: {shelter.generatorBackup ? 'Solar Generator' : 'Grid'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 font-mono text-xs">
                <a
                  href={`tel:${shelter.contact || '+91-800-425-0000'}`}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Shelter</span>
                </a>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition shadow-md"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get GPS Directions</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
