import React, { useState, useMemo } from 'react';
import {
  Home,
  ShieldCheck,
  Phone,
  Search,
  Users,
  MapPin,
  Navigation,
  RotateCw,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Clock,
  Bed,
  HeartPulse,
  Zap,
  CheckCircle2,
  AlertCircle,
  Accessibility,
  Baby,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import PageHeader from '../console/PageHeader';
import SmartShelterRecommendation from '../SmartShelterRecommendation';
import LocationSelectorModal from '../LocationSelectorModal';
import { useLocation } from '../../context/LocationContext';
import { VERIFIED_INDIAN_SHELTERS } from '../../data/indianShelters';
import {
  haversineDistanceKm,
  computeTravelTimeMin,
  calculateShelterSafetyScore
} from '../../lib/shelterScoring';
import { Shelter, PathNode, PathEdge } from '../../types';

interface VerifiedSheltersViewProps {
  shelters?: Shelter[];
  nodes: PathNode[];
  edges?: PathEdge[];
  selectedStartNode?: string;
  onSelectStartNode?: (id: string) => void;
}

type SortOption = 'distance-asc' | 'distance-desc' | 'safety-desc' | 'capacity-desc' | 'name-asc';
type RadiusOption = 5 | 10 | 25 | 50 | 100 | 'all';
type ViewMode = 'cards' | 'map';

export default function VerifiedSheltersView({
  shelters = [],
  nodes,
  edges = [],
  selectedStartNode = 'N1',
  onSelectStartNode = () => {}
}: VerifiedSheltersViewProps) {
  const { currentLocation, isLoadingGps, updateLocationFromGps, gpsStatus } = useLocation();

  // Internal state
  const [startNode, setStartNode] = useState(selectedStartNode);
  const [goalNode, setGoalNode] = useState('S_AP_GOP_ELU');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadius, setSelectedRadius] = useState<RadiusOption>(25);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'high-capacity'>('all');
  const [filterMedical, setFilterMedical] = useState(false);
  const [filterWomenSafe, setFilterWomenSafe] = useState(false);
  const [filterWheelchair, setFilterWheelchair] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('distance-asc');

  const handleSetStart = (id: string) => {
    setStartNode(id);
    onSelectStartNode(id);
  };

  // Base shelters source: fallback to authentic verified shelters directory if props list is empty
  const rawShelters = useMemo(() => {
    return shelters && shelters.length > 0 ? shelters : VERIFIED_INDIAN_SHELTERS;
  }, [shelters]);

  // Real-time calculation: Compute exact great-circle distance & safety metrics for every shelter
  // from the current latitude/longitude stored in LocationContext (no static placeholders)
  const sheltersWithRealtimeDistance = useMemo(() => {
    const userLat = currentLocation.latitude;
    const userLng = currentLocation.longitude;

    return rawShelters.map(shelter => {
      // Haversine formula calculation using live coordinates
      const dist = haversineDistanceKm(userLat, userLng, shelter.latitude, shelter.longitude);
      const roundedDist = parseFloat(dist.toFixed(2));
      const estTime = computeTravelTimeMin(roundedDist);

      // Scoring based on live distance and facilities
      const scoreResult = calculateShelterSafetyScore(
        shelter,
        userLat,
        userLng,
        selectedRadius === 'all' ? 100 : selectedRadius
      );

      return {
        ...shelter,
        distanceKm: roundedDist,
        estimatedTimeMin: estTime,
        safetyScore: scoreResult.safetyScore,
        scoreReasons: scoreResult.scoreReasons,
        routeRisk: scoreResult.routeRisk
      };
    });
  }, [rawShelters, currentLocation.latitude, currentLocation.longitude, selectedRadius]);

  // Apply User Distance Radius & Attribute Filters
  const filteredShelters = useMemo(() => {
    return sheltersWithRealtimeDistance.filter(shelter => {
      // 1. Distance Radius Filter
      if (selectedRadius !== 'all') {
        if (shelter.distanceKm > selectedRadius) return false;
      }

      // 2. Search query (name, address, city, district)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = shelter.name.toLowerCase().includes(q);
        const matchesAddress = (shelter.address || '').toLowerCase().includes(q);
        const matchesCity = (shelter.city || '').toLowerCase().includes(q);
        const matchesDistrict = (shelter.district || '').toLowerCase().includes(q);
        const matchesLocation = (shelter.location || '').toLowerCase().includes(q);
        if (!matchesName && !matchesAddress && !matchesCity && !matchesDistrict && !matchesLocation) {
          return false;
        }
      }

      // 3. Status filter
      if (statusFilter === 'open') {
        if (shelter.status === 'Closed' || shelter.status === 'Full' || (shelter.availableBeds !== undefined && shelter.availableBeds <= 0)) {
          return false;
        }
      } else if (statusFilter === 'high-capacity') {
        const beds = shelter.availableBeds !== undefined ? shelter.availableBeds : (shelter.capacity - shelter.occupied);
        if (beds < 100) return false;
      }

      // 4. Medical filter
      if (filterMedical && !shelter.medicalTeam && (!shelter.doctorsCount || shelter.doctorsCount <= 0)) {
        return false;
      }

      // 5. Inclusivity & Accessibility filters
      if (filterWomenSafe && !shelter.womenChildrenFriendly && !shelter.womenSafe) {
        return false;
      }
      if (filterWheelchair && !shelter.wheelchairAccessible && !shelter.wheelchairAccess) {
        return false;
      }

      return true;
    });
  }, [
    sheltersWithRealtimeDistance,
    selectedRadius,
    searchQuery,
    statusFilter,
    filterMedical,
    filterWomenSafe,
    filterWheelchair
  ]);

  // Sort shelters dynamically based on real-time calculated metrics
  const sortedShelters = useMemo(() => {
    const list = [...filteredShelters];
    list.sort((a, b) => {
      switch (sortBy) {
        case 'distance-asc':
          return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
        case 'distance-desc':
          return (b.distanceKm ?? 0) - (a.distanceKm ?? 0);
        case 'safety-desc':
          return (b.safetyScore ?? 0) - (a.safetyScore ?? 0);
        case 'capacity-desc': {
          const bedsA = a.availableBeds !== undefined ? a.availableBeds : (a.capacity - a.occupied);
          const bedsB = b.availableBeds !== undefined ? b.availableBeds : (b.capacity - b.occupied);
          return bedsB - bedsA;
        }
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    return list;
  }, [filteredShelters, sortBy]);

  // Telemetry Summary derived from real-time distance calculations
  const nearestShelter = useMemo(() => {
    if (sheltersWithRealtimeDistance.length === 0) return null;
    return [...sheltersWithRealtimeDistance].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))[0];
  }, [sheltersWithRealtimeDistance]);

  const totalOpenFacilities = useMemo(() => {
    return sortedShelters.filter(s => s.status === 'Open' && (s.availableBeds === undefined || s.availableBeds > 0)).length;
  }, [sortedShelters]);

  const totalAvailableBeds = useMemo(() => {
    return sortedShelters.reduce((sum, s) => {
      const beds = s.availableBeds !== undefined ? s.availableBeds : Math.max(0, s.capacity - s.occupied);
      return sum + beds;
    }, 0);
  }, [sortedShelters]);

  const averageDistanceKm = useMemo(() => {
    if (sortedShelters.length === 0) return 0;
    const totalDist = sortedShelters.reduce((sum, s) => sum + s.distanceKm, 0);
    return parseFloat((totalDist / sortedShelters.length).toFixed(1));
  }, [sortedShelters]);

  // Select shelter as evacuation target
  const handleSelectForEvacuation = (shelter: Shelter) => {
    setGoalNode(shelter.id);
    setViewMode('map');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedRadius !== 25 || statusFilter !== 'all' || filterMedical || filterWomenSafe || filterWheelchair || sortBy !== 'distance-asc';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRadius(25);
    setStatusFilter('all');
    setFilterMedical(false);
    setFilterWomenSafe(false);
    setFilterWheelchair(false);
    setSortBy('distance-asc');
  };

  return (
    <div className="space-y-5" id="verified_shelters_view">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={['Emergency Console', 'Response & Rescue', 'Verified Shelters']}
        title="Verified Safe Shelters & Relief Camps"
        subtitle="Real-Time Distance Calculation & Dynamic Routing Engine Powered by LocationContext"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Showing {sortedShelters.length} of {rawShelters.length}
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-[11px] font-mono text-emerald-300 font-semibold">
              {totalOpenFacilities} Open in Range
            </span>
          </div>
        }
      />

      {/* 1. REAL-TIME LOCATION & ORIGIN TELEMETRY BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden" id="shelter_realtime_telemetry_banner">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-cyan-950/80 border border-cyan-800 rounded-lg text-cyan-400 shrink-0">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Live Origin Reference:
                </span>
                <span className="text-[11px] font-mono bg-slate-950 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 font-bold">
                  {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E
                </span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  Status: {gpsStatus}
                </span>
                {currentLocation.isGpsVerified && (
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                    GPS Locked
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
                {currentLocation.address}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {currentLocation.city || currentLocation.district} • {currentLocation.district} District • {currentLocation.state}
              </p>
            </div>
          </div>

          {/* Location Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => updateLocationFromGps()}
              disabled={isLoadingGps}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow"
              id="shelter_gps_refresh_btn"
              title="Refresh GPS Coordinates from Device"
            >
              {isLoadingGps ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>{isLoadingGps ? 'Locking GPS...' : 'Update GPS'}</span>
            </button>

            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
              id="shelter_change_origin_btn"
              title="Select a different Mandal or Indian Location"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Change Location</span>
            </button>
          </div>
        </div>

        {/* Real-Time Distance KPI Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Nearest Shelter
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base font-bold font-mono text-emerald-400">
                {nearestShelter ? `${nearestShelter.distanceKm} km` : '—'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {nearestShelter ? `(~${nearestShelter.estimatedTimeMin}m)` : ''}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {nearestShelter ? nearestShelter.name : 'None found'}
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Shelters in Range
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base font-bold font-mono text-cyan-400">
                {sortedShelters.length}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {selectedRadius === 'all' ? 'All India' : `< ${selectedRadius} km`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {totalOpenFacilities} currently accepting evacuees
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Available Beds
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base font-bold font-mono text-indigo-400">
                {totalAvailableBeds.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-slate-400">vacancies</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Across filtered safe facilities
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Average Distance
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base font-bold font-mono text-amber-400">
                {averageDistanceKm} km
              </span>
              <span className="text-[11px] font-mono text-slate-400">from user</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Calculated Great-Circle path
            </p>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SORT CONTROLS BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-3.5" id="shelter_filter_controls">
        {/* Row 1: Search, Radius & Sort */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search shelters by name, mandal, district, or address..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-sans"
              id="shelter_search_input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Distance Radius Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase px-2 font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              Radius:
            </span>
            {([5, 10, 25, 50, 100, 'all'] as RadiusOption[]).map(radius => (
              <button
                key={String(radius)}
                onClick={() => setSelectedRadius(radius)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                  selectedRadius === radius
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {radius === 'all' ? 'All' : `${radius}km`}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer pr-2"
              id="shelter_sort_select"
            >
              <option value="distance-asc" className="bg-slate-900 text-slate-100">
                Nearest First (Distance ↑)
              </option>
              <option value="distance-desc" className="bg-slate-900 text-slate-100">
                Farthest First (Distance ↓)
              </option>
              <option value="safety-desc" className="bg-slate-900 text-slate-100">
                Safety Score (Highest First)
              </option>
              <option value="capacity-desc" className="bg-slate-900 text-slate-100">
                Available Beds (Most First)
              </option>
              <option value="name-asc" className="bg-slate-900 text-slate-100">
                Alphabetical (A - Z)
              </option>
            </select>
          </div>
        </div>

        {/* Row 2: Status & Feature Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mr-1">
              Filters:
            </span>

            {/* Status options */}
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition cursor-pointer border ${
                statusFilter === 'all'
                  ? 'bg-slate-800 border-slate-600 text-slate-100'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Statuses
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'open' ? 'all' : 'open')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition cursor-pointer border flex items-center gap-1 ${
                statusFilter === 'open'
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Open Facilities Only
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'high-capacity' ? 'all' : 'high-capacity')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition cursor-pointer border flex items-center gap-1 ${
                statusFilter === 'high-capacity'
                  ? 'bg-indigo-950 border-indigo-700 text-indigo-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bed className="w-3 h-3 text-indigo-400" />
              High Capacity (&gt;100 Beds)
            </button>

            {/* Feature Toggles */}
            <button
              onClick={() => setFilterMedical(!filterMedical)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition cursor-pointer border flex items-center gap-1 ${
                filterMedical
                  ? 'bg-rose-950 border-rose-700 text-rose-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <HeartPulse className="w-3 h-3 text-rose-400" />
              Medical Team Present
            </button>

            <button
              onClick={() => setFilterWomenSafe(!filterWomenSafe)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition cursor-pointer border flex items-center gap-1 ${
                filterWomenSafe
                  ? 'bg-pink-950 border-pink-700 text-pink-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Baby className="w-3 h-3 text-pink-400" />
              Women & Children Safe
            </button>

            <button
              onClick={() => setFilterWheelchair(!filterWheelchair)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition cursor-pointer border flex items-center gap-1 ${
                filterWheelchair
                  ? 'bg-amber-950 border-amber-700 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Accessibility className="w-3 h-3 text-amber-400" />
              Wheelchair Accessible
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1 rounded-md text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer ml-1"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* View Mode Toggle: Cards vs. Map Console */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="shelter_view_cards_btn"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Distance Directory ({sortedShelters.length})</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'map'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="shelter_view_map_btn"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>A* Routing & Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      {viewMode === 'cards' ? (
        <div className="space-y-4" id="shelter_cards_container">
          {sortedShelters.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No Shelters Match Current Distance Criteria</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No verified facilities found within {selectedRadius === 'all' ? 'the selected criteria' : `${selectedRadius} km of your location`}.
                Try expanding the search radius or resetting feature filters.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedRadius('all')}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                >
                  Expand Radius to All India
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedShelters.map((shelter, idx) => {
                const totalCap = shelter.totalCapacity || shelter.capacity || 100;
                const occ = shelter.occupied || 0;
                const availableBeds = shelter.availableBeds !== undefined ? shelter.availableBeds : Math.max(0, totalCap - occ);
                const occPercent = totalCap > 0 ? Math.min(100, Math.round((occ / totalCap) * 100)) : 0;
                const isClosest = idx === 0 && sortBy === 'distance-asc';

                // Distance category styling
                const isVeryClose = shelter.distanceKm <= 5.0;
                const isModerate = shelter.distanceKm <= 25.0;

                return (
                  <div
                    key={shelter.id}
                    className={`bg-slate-900 border rounded-xl p-4 transition duration-150 flex flex-col justify-between relative overflow-hidden ${
                      isClosest
                        ? 'border-cyan-500/80 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/40'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                    id={`shelter_card_${shelter.id}`}
                  >
                    {/* Top Status & Distance Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Real-time Distance Pill */}
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 border ${
                              isVeryClose
                                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                                : isModerate
                                ? 'bg-cyan-950/90 text-cyan-300 border-cyan-800'
                                : 'bg-slate-950 text-slate-300 border-slate-800'
                            }`}
                          >
                            <MapPin className="w-3 h-3 shrink-0" />
                            {shelter.distanceKm} km
                          </span>

                          {/* Real-time Travel Time */}
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            ~{shelter.estimatedTimeMin} min
                          </span>

                          {isClosest && (
                            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                              ★ Nearest
                            </span>
                          )}
                        </div>

                        {/* Facility Status */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            shelter.status === 'Open'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : shelter.status === 'Near Full'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}
                        >
                          {shelter.status}
                        </span>
                      </div>

                      {/* Shelter Name & Location */}
                      <h3 className="text-sm font-bold text-slate-100 line-clamp-2 mt-1">
                        {shelter.name}
                      </h3>

                      <p className="text-xs text-slate-400 font-mono mt-1 flex items-start gap-1">
                        <span className="text-slate-500 shrink-0">📍</span>
                        <span className="line-clamp-2">
                          {shelter.address || shelter.location}, {shelter.city || shelter.district}, {shelter.state}
                        </span>
                      </p>

                      {/* Occupancy Progress Bar */}
                      <div className="mt-3.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-indigo-400" />
                            Available Beds:
                          </span>
                          <span className="font-bold text-slate-200">
                            {availableBeds} / {totalCap}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              occPercent > 85
                                ? 'bg-rose-500'
                                : occPercent > 65
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${occPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                          <span>{occ} Occupied ({occPercent}%)</span>
                          <span>{availableBeds > 0 ? 'Space Available' : 'At Capacity'}</span>
                        </div>
                      </div>

                      {/* Facility Features Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {shelter.medicalTeam && (
                          <span className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800/60 text-[10px] font-mono text-rose-300 flex items-center gap-1">
                            <HeartPulse className="w-3 h-3 text-rose-400" />
                            Medical Team ({shelter.doctorsCount || 1} Dr)
                          </span>
                        )}

                        {shelter.generatorBackup && (
                          <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" />
                            Generator Backup
                          </span>
                        )}

                        {(shelter.womenChildrenFriendly || shelter.womenSafe) && (
                          <span className="px-2 py-0.5 rounded bg-pink-950/70 border border-pink-800/60 text-[10px] font-mono text-pink-300 flex items-center gap-1">
                            <Baby className="w-3 h-3 text-pink-400" />
                            Women & Child Safe
                          </span>
                        )}

                        {(shelter.wheelchairAccessible || shelter.wheelchairAccess) && (
                          <span className="px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/60 text-[10px] font-mono text-blue-300 flex items-center gap-1">
                            <Accessibility className="w-3 h-3 text-blue-400" />
                            Wheelchair Access
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      {shelter.contact || shelter.phone ? (
                        <a
                          href={`tel:${shelter.contact || shelter.phone}`}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono flex items-center gap-1 transition"
                          title="Call shelter emergency desk"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{shelter.contact || shelter.phone}</span>
                        </a>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          {shelter.managerName || 'Relief Officer Incharge'}
                        </span>
                      )}

                      <div className="flex items-center gap-1.5">
                        {shelter.googleMapsUrl && (
                          <a
                            href={shelter.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded transition"
                            title="Open in Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => handleSelectForEvacuation(shelter)}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer shadow"
                          title="Calculate safe A* evacuation path from current coordinates"
                        >
                          <span>A* Route</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Map and A* Evacuation Engine Mode */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-2 sm:p-4">
          <SmartShelterRecommendation
            shelters={sortedShelters}
            nodes={nodes}
            edges={edges}
            selectedStartNode={startNode}
            setSelectedStartNode={handleSetStart}
            selectedGoalNode={goalNode}
            setSelectedGoalNode={setGoalNode}
          />
        </div>
      )}

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
}
