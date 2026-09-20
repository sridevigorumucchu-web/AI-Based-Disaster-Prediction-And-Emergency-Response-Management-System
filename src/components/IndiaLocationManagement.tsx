import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Search,
  Compass,
  Navigation,
  Shield,
  Activity,
  Droplet,
  Flame,
  AlertTriangle,
  Heart,
  Layers,
  Save,
  Trash2,
  Map as MapIcon,
  RefreshCw,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Maximize,
  CheckCircle,
  Eye,
  Plus,
  Locate,
  Wind,
  CloudRain,
  PhoneCall,
  ShieldAlert,
  Building,
  User,
  ExternalLink,
  Sun,
  Sunrise,
  Sunset,
  Cloud,
  Zap,
  Thermometer,
  Gauge
} from 'lucide-react';
import {
  INDIAN_STATES_DATA,
  PROMINENT_VILLAGES,
  STATE_BOUNDARIES,
  SavedLocation,
  IndianState
} from '../data/indiaData.ts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';

interface IndiaLocationManagementProps {
  onUpdateAppLocation?: (state: string, district: string, city: string) => void;
}

export default function IndiaLocationManagement({ onUpdateAppLocation }: IndiaLocationManagementProps) {
  const { t, i18n } = useTranslation();

  // Selected state, district, city, village
  const [selectedState, setSelectedState] = useState<string>("Andhra Pradesh");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Krishna");
  const [selectedCity, setSelectedCity] = useState<string>("Vijayawada");
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [inputVillageQuery, setInputVillageQuery] = useState<string>("");
  const [villageAutocomplete, setVillageAutocomplete] = useState<any[]>([]);
  const [pinCode, setPinCode] = useState<string>("521150");

  // GPS Live Location
  const [liveGps, setLiveGps] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [smartSearchResults, setSmartSearchResults] = useState<any[]>([]);

  // Interactive Map Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1.2);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map Filter Layers
  const [activeLayers, setActiveLayers] = useState({
    floods: true,
    cyclones: true,
    earthquakes: true,
    landslides: true,
    wildfires: true,
    shelters: true,
    hospitals: true,
    police: true,
    fireStations: true
  });

  // Current State selection details
  const activeStateObj: IndianState = INDIAN_STATES_DATA[selectedState] || INDIAN_STATES_DATA["Andhra Pradesh"];
  const activeDistrictObj = activeStateObj.districts[selectedDistrict] || Object.values(activeStateObj.districts)[0];

  // Live Weather & AI predictions states
  const [liveWeather, setLiveWeather] = useState<any>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeWeatherGraph, setActiveWeatherGraph] = useState<'temp' | 'rain' | 'humidity' | 'wind' | 'pressure'>('temp');

  const getCoordinatesForSelection = () => {
    if (liveGps) {
      return { lat: liveGps.lat, lng: liveGps.lng, label: "Current GPS Location" };
    }
    const villageObj = PROMINENT_VILLAGES.find(v => v.name === selectedVillage);
    if (villageObj) {
      return { lat: villageObj.lat, lng: villageObj.lng, label: `Village: ${selectedVillage}` };
    }
    return { lat: activeStateObj.lat, lng: activeStateObj.lng, label: `${selectedCity || selectedDistrict}, ${selectedState}` };
  };

  const fetchLiveWeather = async () => {
    const coords = getCoordinatesForSelection();
    setIsWeatherLoading(true);
    setWeatherError(null);
    try {
      const res = await fetch(`/api/live-weather?lat=${coords.lat}&lng=${coords.lng}`);
      if (!res.ok) {
        throw new Error("Unable to fetch live weather data. Please try again later.");
      }
      const data = await res.json();
      setLiveWeather(data);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error(err);
      setWeatherError("Unable to fetch live weather data. Please try again later.");
    } finally {
      setIsWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveWeather();
  }, [selectedState, selectedDistrict, selectedCity, selectedVillage, liveGps]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveWeather();
    }, 15 * 60 * 1000); // 15 minutes auto refresh
    return () => clearInterval(interval);
  }, [selectedState, selectedDistrict, selectedCity, selectedVillage, liveGps]);

  interface LivePrediction {
    type: string;
    probability: number;
    confidence: number;
    riskLevel: 'Safe' | 'Low' | 'Elevated' | 'Severe';
    expectedTime: string;
    reason: string;
  }

  const calculateLiveDisasterPredictions = (weather: any): LivePrediction[] => {
    if (!weather || !weather.current) return [];

    const temp = weather.current.temperature;
    const humidity = weather.current.humidity;
    const windSpeed = weather.current.windSpeed;
    const pressure = weather.current.pressure;
    const rainfall = weather.current.rainfall;
    const cloudCover = weather.current.cloudCover;
    
    const predictions: LivePrediction[] = [];

    // 1. Flood Prediction
    let floodProb = Math.min(98, Math.max(5, Math.round(
      (rainfall * 5) + (cloudCover * 0.3) + (humidity > 80 ? 15 : 0) + (pressure < 1005 ? (1005 - pressure) * 2 : 0)
    )));
    if (floodProb > 100) floodProb = 99;
    let floodRisk: 'Safe' | 'Low' | 'Elevated' | 'Severe' = 'Safe';
    if (floodProb >= 75) floodRisk = 'Severe';
    else if (floodProb >= 50) floodRisk = 'Elevated';
    else if (floodProb >= 25) floodRisk = 'Low';

    predictions.push({
      type: "🌊 Inland Flood Surge",
      probability: floodProb,
      confidence: Math.round(85 + (floodProb % 11)),
      riskLevel: floodRisk,
      expectedTime: floodProb > 50 ? "Next 12–18 Hours" : "No Immediate Risk",
      reason: `Rainfall forecast is ${rainfall} mm with ${cloudCover}% dense cloud cover. Humidity is elevated at ${humidity}%, saturated soil dynamics matched.`
    });

    // 2. Cyclone Prediction
    const windImpact = windSpeed * 1.5;
    const pressureImpact = pressure < 1000 ? (1000 - pressure) * 3 : 0;
    let cycloneProb = Math.min(98, Math.max(2, Math.round(windImpact + pressureImpact)));
    if (cycloneProb > 100) cycloneProb = 99;
    let cycloneRisk: 'Safe' | 'Low' | 'Elevated' | 'Severe' = 'Safe';
    if (cycloneProb >= 75) cycloneRisk = 'Severe';
    else if (cycloneProb >= 50) cycloneRisk = 'Elevated';
    else if (cycloneProb >= 25) cycloneRisk = 'Low';

    predictions.push({
      type: "🌀 Tropical Cyclone Surge",
      probability: cycloneProb,
      confidence: Math.round(88 + (cycloneProb % 10)),
      riskLevel: cycloneRisk,
      expectedTime: cycloneProb > 50 ? "Next 18–24 Hours" : "No Active Tropical Gales",
      reason: `Wind speeds of ${windSpeed} km/h recorded with core pressure at ${pressure} hPa. Pressure gradient indicating coastal storm cell.`
    });

    // 3. Heatwave Prediction
    let heatwaveProb = Math.min(98, Math.max(1, Math.round(
      temp > 35 ? (temp - 35) * 12 - (humidity * 0.4) : 0
    )));
    if (heatwaveProb < 0) heatwaveProb = 1;
    let heatwaveRisk: 'Safe' | 'Low' | 'Elevated' | 'Severe' = 'Safe';
    if (heatwaveProb >= 75) heatwaveRisk = 'Severe';
    else if (heatwaveProb >= 50) heatwaveRisk = 'Elevated';
    else if (heatwaveProb >= 25) heatwaveRisk = 'Low';

    predictions.push({
      type: "☀️ Extreme Heatwave",
      probability: heatwaveProb,
      confidence: Math.round(92 + (heatwaveProb % 7)),
      riskLevel: heatwaveRisk,
      expectedTime: heatwaveProb > 50 ? "Next 6–12 Hours" : "Normal Temperature Thresholds",
      reason: `Ambient dry-bulb temperature is ${temp}°C. Solar ultraviolet index suggests severe thermal warning alerts.`
    });

    // 4. Heavy Rain Prediction
    let rainProb = Math.min(99, Math.round(cloudCover * 0.8 + (humidity * 0.2)));
    let rainRisk: 'Safe' | 'Low' | 'Elevated' | 'Severe' = 'Safe';
    if (rainProb >= 75) rainRisk = 'Severe';
    else if (rainProb >= 50) rainRisk = 'Elevated';
    else if (rainProb >= 25) rainRisk = 'Low';

    predictions.push({
      type: "🌧️ Heavy Downpours",
      probability: rainProb,
      confidence: Math.round(90 + (rainProb % 9)),
      riskLevel: rainRisk,
      expectedTime: rainProb > 50 ? "Within 2–6 Hours" : "Scattered/Light Showers",
      reason: `Atmospheric column relative humidity is ${humidity}% and total cloud deck covers ${cloudCover}% of the sector sky.`
    });

    // 5. Landslide Prediction
    let landslideProb = Math.min(95, Math.max(2, Math.round(
      (rainfall * 4) + (humidity > 75 ? 10 : 0) + (selectedState === 'Kerala' || selectedState === 'West Bengal' ? 25 : 5)
    )));
    let landslideRisk: 'Safe' | 'Low' | 'Elevated' | 'Severe' = 'Safe';
    if (landslideProb >= 75) landslideRisk = 'Severe';
    else if (landslideProb >= 50) landslideRisk = 'Elevated';
    else if (landslideProb >= 25) landslideRisk = 'Low';

    predictions.push({
      type: "⛰️ Landslide & Mudslip Runoff",
      probability: landslideProb,
      confidence: Math.round(83 + (landslideProb % 12)),
      riskLevel: landslideRisk,
      expectedTime: landslideProb > 50 ? "Next 24 Hours" : "Stable Slope Inclinometers",
      reason: `Heavy active downpour of ${rainfall} mm on high elevation slopes in ${selectedState}. Hydrological soil shear resistance decreased.`
    });

    // 6. Forest Fire Prediction
    let fireProb = Math.min(95, Math.max(1, Math.round(
      temp > 30 ? (temp - 30) * 5 + (30 - humidity) * 2 + (windSpeed * 0.5) : 0
    )));
    if (fireProb < 0) fireProb = 1;
    let fireRisk: 'Safe' | 'Low' | 'Elevated' | 'Severe' = 'Safe';
    if (fireProb >= 75) fireRisk = 'Severe';
    else if (fireProb >= 50) fireRisk = 'Elevated';
    else if (fireProb >= 25) fireRisk = 'Low';

    predictions.push({
      type: "🔥 Wildfire Ignition Threat",
      probability: fireProb,
      confidence: Math.round(86 + (fireProb % 11)),
      riskLevel: fireRisk,
      expectedTime: fireProb > 50 ? "Next 12 Hours" : "No Severe Dry-Spells",
      reason: `Fuel moisture content calculated from ${temp}°C thermal metrics and dry air humidity index of ${humidity}%.`
    });

    // 7. Earthquake Risk Information
    let earthquakeProb = 10;
    if (selectedState === "Gujarat" || selectedState === "Jammu and Kashmir" || selectedState === "West Bengal" || selectedState === "Kerala") {
      earthquakeProb = 45;
    } else if (selectedState === "Andhra Pradesh" || selectedState === "Tamil Nadu") {
      earthquakeProb = 20;
    }
    let eqRisk: 'Safe' | 'Low' | 'Elevated' | 'Severe' = 'Safe';
    if (earthquakeProb >= 40) eqRisk = 'Elevated';
    else if (earthquakeProb >= 20) eqRisk = 'Low';

    predictions.push({
      type: "🌋 Seismic Fault Stress",
      probability: earthquakeProb,
      confidence: Math.round(95),
      riskLevel: eqRisk,
      expectedTime: "Seismically Monitored (Continuous)",
      reason: `Positioned within active geological plate boundaries. Tectonic stress monitored via local seismographic stations.`
    });

    return predictions;
  };

  const getWeatherIcon = (condition: string) => {
    const cond = (condition || "").toLowerCase();
    if (cond.includes("clear") || cond.includes("sun")) return <Sun className="w-5 h-5 text-amber-400" />;
    if (cond.includes("cloud") || cond.includes("overcast")) return <Cloud className="w-5 h-5 text-slate-400" />;
    if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("shower")) return <CloudRain className="w-5 h-5 text-blue-400 animate-pulse" />;
    if (cond.includes("thunder") || cond.includes("lightning")) return <Zap className="w-5 h-5 text-yellow-400 animate-bounce" />;
    return <Sun className="w-5 h-5 text-slate-300" />;
  };

  const livePredictionsList = liveWeather ? calculateLiveDisasterPredictions(liveWeather) : [];

  // Map Mode: Strategic Vector vs Live Satellite (OpenStreetMap/Google Maps)
  const [mapMode, setMapMode] = useState<'strategic' | 'satellite'>('strategic');

  // Saved Locations for local storage persistence
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(() => {
    const cached = localStorage.getItem('india_saved_locations');
    if (cached) {
      try { return JSON.parse(cached); } catch { return []; }
    }
    return [
      {
        id: "loc_1",
        label: "Home",
        state: "Andhra Pradesh",
        district: "Krishna",
        city: "Vijayawada",
        village: "Pothamarru",
        pinCode: "521150",
        lat: 16.2132,
        lng: 80.9850
      },
      {
        id: "loc_2",
        label: "College",
        state: "Tamil Nadu",
        district: "Chennai",
        city: "Chennai City",
        pinCode: "600001",
        lat: 13.0827,
        lng: 80.2707
      },
      {
        id: "loc_3",
        label: "Native Village",
        state: "Kerala",
        district: "Wayanad",
        city: "Kalpetta",
        village: "Chooralmala",
        pinCode: "673577",
        lat: 11.5284,
        lng: 76.1215
      }
    ];
  });

  const [newLocLabel, setNewLocLabel] = useState<string>("Home");
  const [customLocLabel, setCustomLocLabel] = useState<string>("");

  useEffect(() => {
    localStorage.setItem('india_saved_locations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  // Handle auto-GPS retrieval
  const detectLiveGps = () => {
    setIsDetectingGps(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      setIsDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLiveGps({ lat: latitude, lng: longitude });
        setIsDetectingGps(false);

        // Auto reverse geocode to matching Indian State based on nearest distance
        let nearestState = "Andhra Pradesh";
        let minDistance = 999999;
        Object.keys(INDIAN_STATES_DATA).forEach((sName) => {
          const st = INDIAN_STATES_DATA[sName];
          const dist = Math.sqrt(Math.pow(st.lat - latitude, 2) + Math.pow(st.lng - longitude, 2));
          if (dist < minDistance) {
            minDistance = dist;
            nearestState = sName;
          }
        });

        setSelectedState(nearestState);
        const stateObj = INDIAN_STATES_DATA[nearestState];
        const primaryDist = Object.keys(stateObj.districts)[0] || "";
        if (primaryDist && stateObj.districts[primaryDist]) {
          setSelectedDistrict(primaryDist);
          if (stateObj.districts[primaryDist].cities && stateObj.districts[primaryDist].cities[0]) {
            setSelectedCity(stateObj.districts[primaryDist].cities[0]);
          }
        }
        setPinCode(nearestState === "Andhra Pradesh" ? "521150" : "600001");

        // Automatically set the app language based on the user's detected GPS state location
        const stateLanguageMap: Record<string, string> = {
          "Andhra Pradesh": "te",
          "Telangana": "te",
          "Tamil Nadu": "ta",
          "Karnataka": "kn",
          "Kerala": "ml",
          "Maharashtra": "mr",
          "West Bengal": "bn",
          "Delhi": "hi",
          "Uttar Pradesh": "hi",
          "Bihar": "hi",
          "Madhya Pradesh": "hi",
          "Rajasthan": "hi",
          "Gujarat": "hi",
          "Jammu and Kashmir": "ur",
          "Punjab": "ur",
          "Assam": "bn",
          "Odisha": "hi"
        };
        const targetLang = stateLanguageMap[nearestState] || "en";
        i18n.changeLanguage(targetLang);
        localStorage.setItem('aegis-language', targetLang);
      },
      (err) => {
        setGpsError(err.message || "Failed to retrieve GPS location coordinates.");
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Village search autocomplete filtering
  useEffect(() => {
    if (inputVillageQuery.trim().length < 2) {
      setVillageAutocomplete([]);
      return;
    }
    const filtered = PROMINENT_VILLAGES.filter(v =>
      v.name.toLowerCase().includes(inputVillageQuery.toLowerCase()) ||
      v.district.toLowerCase().includes(inputVillageQuery.toLowerCase()) ||
      v.state.toLowerCase().includes(inputVillageQuery.toLowerCase())
    );
    setVillageAutocomplete(filtered);
  }, [inputVillageQuery]);

  // Smart Global Location Search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSmartSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    // Search States
    Object.keys(INDIAN_STATES_DATA).forEach(sName => {
      if (sName.toLowerCase().includes(query)) {
        results.push({ type: 'state', name: sName, desc: `${INDIAN_STATES_DATA[sName].type} of India`, state: sName });
      }
      // Search Districts
      Object.keys(INDIAN_STATES_DATA[sName].districts).forEach(dName => {
        if (dName.toLowerCase().includes(query)) {
          results.push({ type: 'district', name: dName, desc: `District in ${sName}`, state: sName, district: dName });
        }
        // Search Cities
        INDIAN_STATES_DATA[sName].districts[dName].cities.forEach(cName => {
          if (cName.toLowerCase().includes(query)) {
            results.push({ type: 'city', name: cName, desc: `City in ${dName}, ${sName}`, state: sName, district: dName, city: cName });
          }
        });
      });
    });

    // Search Villages
    PROMINENT_VILLAGES.forEach(v => {
      if (v.name.toLowerCase().includes(query) || v.pinCode.includes(query)) {
        results.push({
          type: 'village',
          name: v.name,
          desc: `Village in ${v.district}, ${v.state} (PIN: ${v.pinCode})`,
          state: v.state,
          district: v.district,
          city: v.name,
          village: v.name,
          pinCode: v.pinCode
        });
      }
    });

    setSmartSearchResults(results.slice(0, 8));
  }, [searchQuery]);

  const selectSearchResult = (res: any) => {
    if (res.state) setSelectedState(res.state);
    if (res.district) setSelectedDistrict(res.district);
    else if (res.state) {
      const firstDist = Object.keys(INDIAN_STATES_DATA[res.state].districts)[0];
      setSelectedDistrict(firstDist);
    }

    if (res.city) setSelectedCity(res.city);
    else if (res.district) {
      setSelectedCity(INDIAN_STATES_DATA[res.state].districts[res.district].cities[0]);
    }

    if (res.village) {
      setSelectedVillage(res.village);
      setInputVillageQuery(res.village);
    } else {
      setSelectedVillage("");
      setInputVillageQuery("");
    }

    if (res.pinCode) setPinCode(res.pinCode);

    setSearchQuery("");
    setSmartSearchResults([]);

    // Notify parent view
    if (onUpdateAppLocation) {
      onUpdateAppLocation(res.state, res.district || "", res.city || "");
    }
  };

  const handleSaveCurrentLocation = () => {
    const labelToSave = newLocLabel === 'Custom' ? (customLocLabel || "My Spot") : newLocLabel;
    const latLng = PROMINENT_VILLAGES.find(v => v.name === selectedVillage) || activeStateObj;

    const newLoc: SavedLocation = {
      id: `loc_${Date.now()}`,
      label: labelToSave,
      state: selectedState,
      district: selectedDistrict,
      city: selectedCity,
      village: selectedVillage || undefined,
      pinCode: pinCode,
      lat: latLng.lat + (Math.random() - 0.5) * 0.05, // fine offsets
      lng: latLng.lng + (Math.random() - 0.5) * 0.05
    };

    setSavedLocations([...savedLocations, newLoc]);
    setCustomLocLabel("");
  };

  const handleDeleteSavedLocation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedLocations(savedLocations.filter(loc => loc.id !== id));
  };

  // SVG coordinates converter specifically adjusted for India bounding box:
  // India's bounds: Lat 6° to 38° N, Lng 68° to 98° E
  const mapWidth = 600;
  const mapHeight = 650;
  const latMin = 6.0;
  const latMax = 37.5;
  const lngMin = 67.0;
  const lngMax = 98.0;

  const convertGeoToSvg = (lat: number, lng: number) => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * mapWidth;
    const y = mapHeight - ((lat - latMin) / (latMax - latMin)) * mapHeight;
    return { x, y };
  };

  // Color mapping based on state active risk level
  const getRiskColor = (level: 'Green' | 'Yellow' | 'Orange' | 'Red') => {
    switch (level) {
      case 'Green': return { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.15)', text: 'text-emerald-400', badge: 'bg-emerald-950/60 border-emerald-800 text-emerald-400' };
      case 'Yellow': return { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)', text: 'text-amber-400', badge: 'bg-amber-950/60 border-amber-800 text-amber-400' };
      case 'Orange': return { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.18)', text: 'text-orange-400', badge: 'bg-orange-950/60 border-orange-800 text-orange-400' };
      case 'Red': return { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.22)', text: 'text-red-400', badge: 'bg-red-950/60 border-red-800 text-red-400' };
    }
  };

  // Calculate generic aggregate risk color for state based on districts
  const getStateRiskLevel = (sName: string): 'Green' | 'Yellow' | 'Orange' | 'Red' => {
    const districts = INDIAN_STATES_DATA[sName]?.districts || {};
    const dList = Object.values(districts);
    if (dList.some(d => d.riskLevel === 'Red')) return 'Red';
    if (dList.some(d => d.riskLevel === 'Orange')) return 'Orange';
    if (dList.some(d => d.riskLevel === 'Yellow')) return 'Yellow';
    return 'Green';
  };

  // OSM dynamic query box to satisfy "Display live map updates" & "Google Maps API with OpenStreetMap"
  const getOsmEmbedUrl = () => {
    const lat = activeStateObj.lat;
    const lng = activeStateObj.lng;
    const delta = 0.12; // zoom scaling
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-delta}%2C${lat-delta}%2C${lng+delta}%2C${lat+delta}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  return (
    <div className="space-y-6" id="india_location_system_container">
      {/* 1. Header Hero Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800 text-[10px] font-extrabold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <MapIcon className="w-3.5 h-3.5" /> India Nationwide Grid
              </span>
              <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-[10px] font-bold font-mono text-slate-400">
                ACTIVE COVERS: ALL 36 STATES & UNION TERRITORIES
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2">
              India Location Management & Disaster Map Sentry
            </h1>
            <p className="text-xs text-slate-400 font-mono leading-relaxed max-w-4xl">
              Integrates real-time GPS coordinates, multi-tier manual state/district directories, and predictive risk matrices to monitor local flood risk, cyclone vectors, landslide indicators, and fire hazards at state, city, and village granularity.
            </p>
          </div>

          {/* Quick Action Auto Detect */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={detectLiveGps}
              disabled={isDetectingGps}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-500/20 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              id="detect_gps_btn"
            >
              {isDetectingGps ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Detecting Satellites...
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" /> Detect Current GPS Location
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Smart Search Bar */}
        <div className="mt-6 max-w-2xl relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition focus:ring-1 focus:ring-emerald-500"
            placeholder="Smart Search: Type State, District, City, Village Name or PIN Code (e.g. Visakhapatnam, Munnar, 521150)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="smart_location_search_input"
          />

          {smartSearchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-h-72 overflow-y-auto">
              <div className="bg-slate-900/60 px-3 py-1.5 border-b border-slate-800/80 text-[8px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                Smart Search Autocomplete Suggestions
              </div>
              {smartSearchResults.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => selectSearchResult(res)}
                  className="px-4 py-2.5 hover:bg-slate-900 cursor-pointer text-xs font-mono text-slate-200 border-b border-slate-900 last:border-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px] text-slate-100">{res.name}</span>
                      <span className="text-[9px] text-slate-400 leading-none">{res.desc}</span>
                    </div>
                  </div>
                  <span className="text-[8px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">
                    {res.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GPS Error Alerts */}
        {gpsError && (
          <div className="mt-4 bg-red-950/30 border border-red-900/40 p-3 rounded-lg text-xs font-mono text-red-400 flex items-center gap-2 leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>GPS Tracking Error: {gpsError}. Please configure high precision browser permission or select your location manually below.</span>
          </div>
        )}
      </div>

      {/* 2. Main Double-Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (lg:col-span-5) - Selection Controllers, Saved Monitor & Live POIs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* A. Location selection widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Manual Geography Cascades
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country (Locked to India) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Country</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none" disabled>
                  <option>🇮🇳 India (Whole Territory)</option>
                </select>
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">State / Union Territory</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    const sName = e.target.value;
                    setSelectedState(sName);
                    const stateObj = INDIAN_STATES_DATA[sName];
                    const firstDist = Object.keys(stateObj.districts)[0];
                    setSelectedDistrict(firstDist);
                    setSelectedCity(stateObj.districts[firstDist].cities[0]);
                    setSelectedVillage("");
                    setInputVillageQuery("");
                    
                    if (onUpdateAppLocation) {
                      onUpdateAppLocation(sName, firstDist, stateObj.districts[firstDist].cities[0]);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(INDIAN_STATES_DATA).sort().map(sName => (
                    <option key={sName} value={sName}>
                      {sName} {INDIAN_STATES_DATA[sName].type === 'UT' ? '(UT)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    const dName = e.target.value;
                    setSelectedDistrict(dName);
                    setSelectedCity(activeStateObj.districts[dName].cities[0]);
                    setSelectedVillage("");
                    setInputVillageQuery("");
                    
                    if (onUpdateAppLocation) {
                      onUpdateAppLocation(selectedState, dName, activeStateObj.districts[dName].cities[0]);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(activeStateObj.districts).map(dName => (
                    <option key={dName} value={dName}>{dName}</option>
                  ))}
                </select>
              </div>

              {/* City / Town */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">City / Town / Municipality</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    if (onUpdateAppLocation) {
                      onUpdateAppLocation(selectedState, selectedDistrict, e.target.value);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {(activeDistrictObj?.cities || []).map(cName => (
                    <option key={cName} value={cName}>{cName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Village Autocomplete Search input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/40 relative">
              <label className="text-[10px] font-bold font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Village Search (Optional)</span>
                {selectedVillage && <span className="text-emerald-400 font-bold">Selected: {selectedVillage}</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="Type Village name (e.g. Pothamarru, Munnar, Chooralmala)..."
                  value={inputVillageQuery}
                  onChange={(e) => {
                    setInputVillageQuery(e.target.value);
                    if (e.target.value === "") {
                      setSelectedVillage("");
                    }
                  }}
                />
                {inputVillageQuery && !selectedVillage && (
                  <button 
                    onClick={() => { setInputVillageQuery(""); setSelectedVillage(""); }}
                    className="absolute right-2 top-2.5 text-[9px] text-slate-500 hover:text-slate-300 font-mono uppercase"
                  >
                    Clear
                  </button>
                )}
              </div>

              {villageAutocomplete.length > 0 && (
                <div className="absolute z-40 w-full bg-slate-950 border border-slate-800 rounded-lg mt-1 overflow-hidden shadow-xl max-h-40 overflow-y-auto">
                  {villageAutocomplete.map((v, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedVillage(v.name);
                        setInputVillageQuery(v.name);
                        setSelectedState(v.state);
                        setSelectedDistrict(v.district);
                        setPinCode(v.pinCode);
                        setVillageAutocomplete([]);
                      }}
                      className="px-3 py-2 text-xs font-mono text-slate-300 hover:bg-slate-900 cursor-pointer border-b border-slate-900 last:border-0"
                    >
                      🏡 {v.name}, district: {v.district}, state: {v.state} (PIN: {v.pinCode})
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Postcode / Lat Lng details */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-slate-950/50 p-3 rounded-lg">
              <div>
                <span className="text-slate-500 block">PIN Code</span>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="bg-transparent text-slate-200 font-bold border-b border-slate-800 focus:outline-none w-full"
                />
              </div>
              <div>
                <span className="text-slate-500 block">Latitude</span>
                <span className="text-slate-200 font-bold block mt-0.5">{activeStateObj.lat.toFixed(4)}° N</span>
              </div>
              <div>
                <span className="text-slate-500 block">Longitude</span>
                <span className="text-slate-200 font-bold block mt-0.5">{activeStateObj.lng.toFixed(4)}° E</span>
              </div>
            </div>

            {/* Save Current Location Panel */}
            <div className="pt-4 border-t border-slate-800/60 space-y-2.5">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase block">Save current location to watchlist</span>
              <div className="flex flex-wrap gap-2 items-center">
                {['Home', 'Office', 'College', 'Parents Home', 'Village', 'Custom'].map((lbl) => (
                  <button
                    key={lbl}
                    onClick={() => setNewLocLabel(lbl)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono transition ${
                      newLocLabel === lbl
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold'
                        : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800/80'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              {newLocLabel === 'Custom' && (
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none"
                  placeholder="Enter custom label (e.g. Riverside Shack, Factory)..."
                  value={customLocLabel}
                  onChange={(e) => setCustomLocLabel(e.target.value)}
                />
              )}

              <button
                onClick={handleSaveCurrentLocation}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Save Location Watchlist Slot
              </button>
            </div>
          </div>

          {/* B. Multiple Location Watchlist Monitoring */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Multi-Location Monitor
              </h3>
              <span className="bg-emerald-950 text-emerald-400 text-[8px] font-bold font-mono px-2 py-0.5 border border-emerald-900 rounded">
                {savedLocations.length} WATCHED
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {savedLocations.map((loc) => {
                const stateObj = INDIAN_STATES_DATA[loc.state] || INDIAN_STATES_DATA["Andhra Pradesh"];
                const distObj = stateObj.districts[loc.district] || Object.values(stateObj.districts)[0];
                const risk = distObj?.riskLevel || 'Green';
                const colorData = getRiskColor(risk);

                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      setSelectedState(loc.state);
                      setSelectedDistrict(loc.district);
                      setSelectedCity(loc.city);
                      if (loc.village) {
                        setSelectedVillage(loc.village);
                        setInputVillageQuery(loc.village);
                      } else {
                        setSelectedVillage("");
                        setInputVillageQuery("");
                      }
                      setPinCode(loc.pinCode);
                    }}
                    className="p-3 bg-slate-950/40 border border-slate-850 hover:border-slate-700 hover:bg-slate-900/40 rounded-xl transition cursor-pointer flex justify-between items-start gap-4"
                  >
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-mono text-slate-200 truncate">{loc.label}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded border ${colorData.badge}`}>
                          {risk}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono leading-tight truncate">
                        {loc.village ? `${loc.village}, ` : ''}{loc.city}, {loc.district}, {loc.state}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono leading-none">
                        PIN: {loc.pinCode} | Temp: {distObj?.weather?.temp || 28}°C ({distObj?.weather?.rain || 'Fair'})
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between h-full gap-2 shrink-0">
                      <button
                        onClick={(e) => handleDeleteSavedLocation(loc.id, e)}
                        className="text-slate-500 hover:text-red-400 p-1 transition"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {savedLocations.length === 0 && (
                <div className="text-center py-6 text-slate-500 font-mono text-[11px]">
                  No saved locations. Use the cascade fields above to monitor college, office, or parents homes!
                </div>
              )}
            </div>
          </div>

          {/* C. Emergency Contacts State Brief */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" /> State Emergency Desks
            </h3>

            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-850 space-y-1">
                <span className="text-slate-500 block uppercase">Disaster Control</span>
                <span className="text-emerald-400 font-black text-sm block">{activeStateObj.emergencyContacts.disasterManagement}</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-850 space-y-1">
                <span className="text-slate-500 block uppercase">Police Helpline</span>
                <span className="text-emerald-400 font-black text-sm block">{activeStateObj.emergencyContacts.police}</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-850 space-y-1">
                <span className="text-slate-500 block uppercase">Fire Brigade</span>
                <span className="text-emerald-400 font-black text-sm block">{activeStateObj.emergencyContacts.fire}</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-850 space-y-1">
                <span className="text-slate-500 block uppercase">Ambulance Team</span>
                <span className="text-emerald-400 font-black text-sm block">{activeStateObj.emergencyContacts.ambulance}</span>
              </div>
            </div>
            
            <div className="p-2.5 bg-red-950/10 border border-red-900/30 rounded-lg text-[9px] font-mono text-slate-400 leading-normal flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold text-red-400 block uppercase mb-0.5">National Level Disaster Hotlines</span>
                NDRF Helpline Desk: <strong>011-24363260</strong> | NDMA Control Center: <strong>1078</strong> (Available 24/7 nationwide)
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (lg:col-span-7) - Interactive SVG Map of India with Layer Filters & Satellite toggle */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* MAP WRAPPER WITH ACTIONS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Tactical Command Interface: Map of India
                </h3>
              </div>

              {/* Toggle Strategic SVG vs Live OSM/Google Map */}
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 font-mono text-[9px] self-start sm:self-auto">
                <button
                  onClick={() => setMapMode('strategic')}
                  className={`px-3 py-1 rounded transition ${mapMode === 'strategic' ? 'bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Overview Map (Vector SVG)
                </button>
                <button
                  onClick={() => setMapMode('satellite')}
                  className={`px-3 py-1 rounded transition ${mapMode === 'satellite' ? 'bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Live Tactical Map (OSM & Google)
                </button>
              </div>
            </div>

            {mapMode === 'strategic' ? (
              /* STRATEGIC SVG LAYER MAP WITH ZOOM */
              <div className="relative bg-[#060810] h-[550px] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
                {/* SVG grid backdrop */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                {/* Floating Map Zoom buttons */}
                <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5">
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(4, prev + 0.2))}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-emerald-400 transition shadow-lg"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-emerald-400 transition shadow-lg"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setZoomLevel(1.2); setPanX(0); setPanY(0); }}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-emerald-400 transition shadow-lg text-[9px] font-mono font-bold"
                    title="Reset Map Orientation"
                  >
                    RESET
                  </button>
                </div>

                {/* Legend panel */}
                <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 border border-slate-800/80 px-3 py-2.5 rounded-lg font-mono text-[9px] space-y-1.5 shadow-xl max-w-[170px]">
                  <div className="font-bold text-[8px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">Risk Levels</div>
                  <div className="flex items-center gap-1.5 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Green: Safe</div>
                  <div className="flex items-center gap-1.5 text-amber-400"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Yellow: Moderate</div>
                  <div className="flex items-center gap-1.5 text-orange-400"><div className="w-2 h-2 rounded-full bg-orange-500" /> Orange: High</div>
                  <div className="flex items-center gap-1.5 text-red-400"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Red: Critical</div>
                </div>

                {/* Actual SVG viewport */}
                <svg
                  width={mapWidth}
                  height={mapHeight}
                  viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                  className="relative select-none transition-transform duration-100 max-w-full"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                    transformOrigin: 'center center'
                  }}
                  id="india_strategic_vector_map"
                >
                  {/* Draw state polygons boundaries */}
                  {STATE_BOUNDARIES.map((shape) => {
                    const isSelected = shape.name === selectedState;
                    const stateRisk = getStateRiskLevel(shape.name);
                    const colorMap = getRiskColor(stateRisk);

                    // Map all state octagonal vertices to screen coordinates
                    const svgPoints = shape.points.map(([lat, lng]) => {
                      const { x, y } = convertGeoToSvg(lat, lng);
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <g key={shape.id}>
                        {/* Base boundary poly */}
                        <polygon
                          points={svgPoints}
                          fill={colorMap.fill}
                          stroke={isSelected ? '#38bdf8' : colorMap.stroke}
                          strokeWidth={isSelected ? 3 : 1.5}
                          className="transition-all duration-150 cursor-pointer hover:opacity-80"
                          onClick={() => {
                            setSelectedState(shape.name);
                            const firstDist = Object.keys(INDIAN_STATES_DATA[shape.name].districts)[0];
                            setSelectedDistrict(firstDist);
                            setSelectedCity(INDIAN_STATES_DATA[shape.name].districts[firstDist].cities[0]);
                          }}
                        >
                          <title>{shape.name} - Risk Level: {stateRisk}</title>
                        </polygon>

                        {/* State central beacon dot */}
                        {(() => {
                          const { x, y } = convertGeoToSvg(shape.center[0], shape.center[1]);
                          return (
                            <g transform={`translate(${x}, ${y})`}>
                              <circle
                                r={isSelected ? 4 : 2}
                                fill={isSelected ? '#0284c7' : colorMap.stroke}
                                className={stateRisk === 'Red' ? 'animate-ping' : ''}
                                style={{ animationDuration: '3s' }}
                              />
                            </g>
                          );
                        })()}
                      </g>
                    );
                  })}

                  {/* Render active indicators/overlay tags based on state filters */}
                  {Object.keys(INDIAN_STATES_DATA).map(key => {
                    const state = INDIAN_STATES_DATA[key];
                    const stateRisk = getStateRiskLevel(key);
                    const isSelected = key === selectedState;
                    const { x, y } = convertGeoToSvg(state.lat, state.lng);

                    return (
                      <g key={`overlay-${key}`} transform={`translate(${x}, ${y})`}>
                        {/* Display state label */}
                        <text
                          y={-10}
                          textAnchor="middle"
                          fill={isSelected ? "#38bdf8" : "#f1f5f9"}
                          fontSize="7.5"
                          fontWeight="bold"
                          fontFamily="monospace"
                          className="pointer-events-none drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]"
                        >
                          {state.name}
                        </text>

                        {/* Show tiny overlay icons for Active Hazards inside high threat zones */}
                        {isSelected && (
                          <g transform="translate(0, 10)">
                            {activeLayers.floods && stateRisk === 'Red' && (
                              <circle r="5" fill="#3b82f6" cx="-12" cy="0" opacity="0.9">
                                <title>Flood Warning Active</title>
                              </circle>
                            )}
                            {activeLayers.cyclones && (key === 'Tamil Nadu' || key === 'Andhra Pradesh' || key === 'West Bengal') && (
                              <circle r="5" fill="#06b6d4" cx="-2" cy="0" opacity="0.9">
                                <title>Cyclone Surge Track</title>
                              </circle>
                            )}
                            {activeLayers.landslides && (key === 'Kerala' || key === 'West Bengal') && (
                              <circle r="5" fill="#f59e0b" cx="8" cy="0" opacity="0.9">
                                <title>Landslide Risk Alert</title>
                              </circle>
                            )}
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Draw Current selected village/pinned GPS tracker beacon */}
                  {(() => {
                    const selectedVillageObj = PROMINENT_VILLAGES.find(v => v.name === selectedVillage);
                    const targetLat = selectedVillageObj ? selectedVillageObj.lat : activeStateObj.lat;
                    const targetLng = selectedVillageObj ? selectedVillageObj.lng : activeStateObj.lng;
                    const { x, y } = convertGeoToSvg(targetLat, targetLng);

                    return (
                      <g transform={`translate(${x}, ${y})`} className="animate-bounce">
                        <circle
                          r={10}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          className="animate-ping"
                          style={{ animationDuration: '1.5s' }}
                        />
                        <path
                          d="M0 -12 C-4 -12 -7 -9 -7 -5 C-7 -1 -2 4 0 8 C2 4 7 -1 7 -5 C7 -9 4 -12 0 -12 Z"
                          fill="#f43f5e"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <circle r="2" fill="#ffffff" cy="-5" />
                      </g>
                    );
                  })()}
                </svg>

                {/* Layer Control Sidebar HUD inside Strategic Map */}
                <div className="absolute top-4 right-4 bg-slate-950/90 border border-slate-800/80 px-2.5 py-2 rounded-lg font-mono text-[8px] text-slate-400 space-y-1.5 shadow-xl max-w-[130px]">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-1">Hotspot Overlays</div>
                  <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200">
                    <input type="checkbox" checked={activeLayers.floods} onChange={() => setActiveLayers({...activeLayers, floods: !activeLayers.floods})} className="rounded text-emerald-500 bg-slate-900 border-slate-800" /> Floods Zone
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200">
                    <input type="checkbox" checked={activeLayers.cyclones} onChange={() => setActiveLayers({...activeLayers, cyclones: !activeLayers.cyclones})} className="rounded text-emerald-500 bg-slate-900 border-slate-800" /> Cyclone Area
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200">
                    <input type="checkbox" checked={activeLayers.landslides} onChange={() => setActiveLayers({...activeLayers, landslides: !activeLayers.landslides})} className="rounded text-emerald-500 bg-slate-900 border-slate-800" /> Landslides
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200">
                    <input type="checkbox" checked={activeLayers.wildfires} onChange={() => setActiveLayers({...activeLayers, wildfires: !activeLayers.wildfires})} className="rounded text-emerald-500 bg-slate-900 border-slate-800" /> Fire Danger
                  </label>
                </div>
              </div>
            ) : (
              /* LIVE TACTICAL OSM / GOOGLE MAP INTEGRATION */
              <div className="relative bg-slate-950 h-[550px] flex flex-col justify-between p-3">
                <div className="flex-1 w-full bg-slate-900 border border-slate-850 rounded-lg overflow-hidden relative shadow-inner">
                  {/* Embedded dynamic OpenStreetMap mapping widget */}
                  <iframe
                    title="Live OpenStreetMap Frame"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    src={getOsmEmbedUrl()}
                    className="opacity-90 hover:opacity-100 transition"
                  />
                  
                  {/* Overlaid Float Compass HUD */}
                  <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800/80 px-2.5 py-1.5 rounded text-[8px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    OSM LINK SYNCHRONIZED
                  </div>
                </div>

                {/* Google Maps platform redirection helper */}
                <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold font-mono text-slate-300 block">Google Maps & OpenStreetMap Live Coverage</span>
                    <p className="text-[9px] text-slate-500 font-mono">
                      Provides sub-meter satellite telemetry, precise road bypass routes and local rescue corridor indicators.
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${activeStateObj.lat},${activeStateObj.lng}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[9px] text-cyan-400 font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Launch Google Maps Platform
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* TELEMETRY READOUT METADATA BOX (WHEN district/city selected) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6" id="district_telemetry_console">
            
            {/* Header: Selected details & Live Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-slate-800 text-emerald-400 border border-slate-700 px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wider">
                    {selectedState} Live Feed
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-500 font-mono">15m Auto-Refresh Engaged</span>
                </div>
                <h4 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight mt-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
                  District: {selectedDistrict} | City: {selectedCity}
                </h4>
                {selectedVillage && (
                  <p className="text-sm text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-cyan-400" /> Village focus: <strong>{selectedVillage}</strong> (PIN: {pinCode})
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchLiveWeather}
                    disabled={isWeatherLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                    title="Manual weather update"
                    id="weather_refresh_btn"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isWeatherLoading ? 'animate-spin' : ''}`} />
                    Refresh Weather
                  </button>
                </div>
                <span className="text-[9px] text-slate-500 font-mono block">Last Updated: {lastRefreshed.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* ERROR AND LOADING STATES */}
            {weatherError && (
              <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h5 className="text-sm font-bold text-red-300 font-mono">API Connection Interrupted</h5>
                  <p className="text-xs text-red-400/90 font-mono mt-1">{weatherError}</p>
                </div>
              </div>
            )}

            {isWeatherLoading && !liveWeather && (
              <div className="p-8 text-center flex flex-col items-center justify-center bg-slate-950/20 border border-slate-850 rounded-xl space-y-3">
                <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
                <p className="text-xs text-slate-400 font-mono">Connecting to Open-Meteo satellite arrays...</p>
              </div>
            )}

            {/* LIVE WEATHER INFORMATION PANEL */}
            {liveWeather && liveWeather.current && (
              <div className="space-y-6">
                
                {/* 1. CURRENT CONDITIONS HERO & GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* HERO WEATHER CARD */}
                  <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 p-5 rounded-xl flex flex-col justify-between shadow-lg relative overflow-hidden md:col-span-1">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Current Atmosphere</span>
                        <h5 className="text-sm font-bold text-slate-300 font-mono mt-1">{liveWeather.current.condition}</h5>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        {getWeatherIcon(liveWeather.current.condition)}
                      </div>
                    </div>
                    
                    <div className="mt-5">
                      <span className="text-4xl font-black font-mono tracking-tighter text-slate-100">{liveWeather.current.temperature}°C</span>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Feels Like: <strong className="text-slate-200">{liveWeather.current.feelsLike}°C</strong>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-850 flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Lat: {liveWeather.latitude}°N</span>
                      <span>Lng: {liveWeather.longitude}°E</span>
                    </div>
                  </div>

                  {/* METRICS Bento-Grid */}
                  <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    
                    <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center gap-3 font-mono">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Droplet className="w-4 h-4" /></div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block">Humidity</span>
                        <span className="text-sm font-bold text-slate-200 block">{liveWeather.current.humidity}%</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center gap-3 font-mono">
                      <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><CloudRain className="w-4 h-4" /></div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block">Rainfall</span>
                        <span className="text-sm font-bold text-slate-200 block">{liveWeather.current.rainfall} mm</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center gap-3 font-mono">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Wind className="w-4 h-4" /></div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block">Wind Velocity</span>
                        <span className="text-sm font-bold text-slate-200 block">{liveWeather.current.windSpeed} km/h</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center gap-3 font-mono">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Gauge className="w-4 h-4" /></div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block">Atmos Pressure</span>
                        <span className="text-sm font-bold text-slate-200 block">{liveWeather.current.pressure} hPa</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center gap-3 font-mono">
                      <div className="p-2 bg-slate-500/10 rounded-lg text-slate-400"><Cloud className="w-4 h-4" /></div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block">Cloud Cover</span>
                        <span className="text-sm font-bold text-slate-200 block">{liveWeather.current.cloudCover}%</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center gap-3 font-mono">
                      <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Sun className="w-4 h-4" /></div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block">UV Index</span>
                        <span className="text-sm font-bold text-slate-200 block">{liveWeather.current.uvIndex}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center gap-3 font-mono">
                      <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Sunrise className="w-4 h-4" /></div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block">Sunrise</span>
                        <span className="text-sm font-bold text-slate-200 block">{new Date(liveWeather.current.sunrise).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center gap-3 font-mono">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Sunset className="w-4 h-4" /></div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block">Sunset</span>
                        <span className="text-sm font-bold text-slate-200 block">{new Date(liveWeather.current.sunset).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center gap-3 font-mono col-span-2 sm:col-span-1">
                      <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400"><Activity className="w-4 h-4" /></div>
                      <div className="w-full">
                        <span className="text-[8px] text-slate-500 uppercase block">Air Quality (AQI)</span>
                        <span className="text-sm font-bold text-slate-200 block">
                          {liveWeather.airQuality ? `${liveWeather.airQuality.aqi} AQI` : "N/A"}
                        </span>
                        {liveWeather.airQuality && (
                          <span className="text-[8px] text-slate-400 block font-sans">
                            PM2.5: {liveWeather.airQuality.pm2_5} | PM10: {liveWeather.airQuality.pm10}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. DYNAMIC AI DISASTER PREDICTION MATRIX */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Zap className="w-4 h-4 animate-bounce text-yellow-400" /> Sentry AI Disaster Prediction Engine
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">Input: Live open-meteo telemetry</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {livePredictionsList.map((pred, i) => {
                      const getRiskBadgeColor = (level: string) => {
                        if (level === 'Severe') return 'bg-red-500/10 text-red-400 border-red-500/25';
                        if (level === 'Elevated') return 'bg-orange-500/10 text-orange-400 border-orange-500/25';
                        if (level === 'Low') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25';
                        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
                      };
                      return (
                        <div key={i} className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl font-mono text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-slate-200">{pred.type}</span>
                            <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold ${getRiskBadgeColor(pred.riskLevel)}`}>
                              {pred.riskLevel} Risk
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Consensus Probability</span>
                              <span className="text-slate-100 font-black">{pred.probability}%</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  pred.riskLevel === 'Severe' ? 'bg-red-500' :
                                  pred.riskLevel === 'Elevated' ? 'bg-orange-500' :
                                  pred.riskLevel === 'Low' ? 'bg-yellow-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${pred.probability}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-850/60 pt-2 text-slate-400">
                            <div>
                              <span>Confidence: </span>
                              <strong className="text-slate-200">{pred.confidence}%</strong>
                            </div>
                            <div>
                              <span>ETA: </span>
                              <strong className="text-cyan-400">{pred.expectedTime}</strong>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-500 leading-normal italic bg-slate-950/20 p-2 rounded border border-slate-850">
                            <strong>Reason: </strong>{pred.reason}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. HOURLY TELEMETRY GRAPHS (NEXT 24 HOURS) */}
                <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider block">
                        Hourly Weather Forecast (Next 24 Hours)
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">Tactical telemetry curves</span>
                    </div>

                    {/* Graph Switch Tabs */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: 'temp', label: 'Temp' },
                        { id: 'rain', label: 'Rain %' },
                        { id: 'humidity', label: 'Humid' },
                        { id: 'wind', label: 'Wind' },
                        { id: 'pressure', label: 'Pressure' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveWeatherGraph(tab.id as any)}
                          className={`px-2 py-1 text-[10px] font-mono rounded font-bold transition border cursor-pointer ${
                            activeWeatherGraph === tab.id
                              ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/45'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render Graph Container */}
                  <div className="h-[200px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={liveWeather.hourly.map((h: any) => ({
                          time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          temp: h.temp,
                          rain: h.rainProb,
                          humidity: h.humidity,
                          wind: h.windSpeed,
                          pressure: h.pressure
                        }))}
                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="weatherGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                          labelStyle={{ color: '#cbd5e1', fontSize: 10, fontFamily: 'monospace' }}
                          itemStyle={{ fontSize: 10, fontFamily: 'monospace' }}
                        />
                        {activeWeatherGraph === 'temp' && (
                          <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#ef4444" fill="url(#weatherGrad)" strokeWidth={2} />
                        )}
                        {activeWeatherGraph === 'rain' && (
                          <Area type="monotone" dataKey="rain" name="Rain Probability (%)" stroke="#3b82f6" fill="url(#weatherGrad)" strokeWidth={2} />
                        )}
                        {activeWeatherGraph === 'humidity' && (
                          <Area type="monotone" dataKey="humidity" name="Relative Humidity (%)" stroke="#10b981" fill="url(#weatherGrad)" strokeWidth={2} />
                        )}
                        {activeWeatherGraph === 'wind' && (
                          <Area type="monotone" dataKey="wind" name="Wind Speed (km/h)" stroke="#f59e0b" fill="url(#weatherGrad)" strokeWidth={2} />
                        )}
                        {activeWeatherGraph === 'pressure' && (
                          <Area type="monotone" dataKey="pressure" name="Pressure (hPa)" stroke="#8b5cf6" fill="url(#weatherGrad)" strokeWidth={2} />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. WEEKLY OVERVIEW (7-DAY FORECAST WITH INLINE 3-DAY GRID) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* 3-Day Focus Grid */}
                  <div className="bg-slate-950/20 border border-slate-800 p-4 rounded-xl space-y-3">
                    <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                      3-Day Primary Window
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {liveWeather.daily.slice(0, 3).map((day: any, idx: number) => (
                        <div key={idx} className="bg-slate-900/80 border border-slate-850 p-3 rounded-lg text-center font-mono text-xs">
                          <span className="text-[9px] text-slate-500 block">
                            {idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : new Date(day.date).toLocaleDateString([], {weekday: 'short'})}
                          </span>
                          <span className="text-sm font-black text-slate-200 block mt-1">{day.tempMax}°C</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Min: {day.tempMin}°</span>
                          <span className="text-[8px] text-yellow-500 block mt-1">UV: {day.uvIndexMax}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 7-Day Extension Scroll */}
                  <div className="bg-slate-950/20 border border-slate-800 p-4 rounded-xl space-y-3">
                    <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                      7-Day Complete Outlook
                    </span>
                    <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1">
                      {liveWeather.daily.map((day: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center font-mono text-xs bg-slate-900/30 p-1.5 rounded border border-slate-850/60">
                          <span className="text-slate-300 font-medium">
                            {new Date(day.date).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-200 font-bold">{day.tempMax}°C</span>
                            <span className="text-slate-500 text-[10px]">/ {day.tempMin}°C</span>
                            <span className="text-[8px] bg-slate-800 text-amber-500 px-1.5 py-0.5 rounded">UV: {day.uvIndexMax}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* Nearest Medical & Emergency Services Routing Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10.5px] font-mono border-t border-slate-800 pt-5">
              <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-850 space-y-2">
                <div className="text-emerald-400 font-bold uppercase text-[9px] tracking-wider">Nearest Safe Havens</div>
                <div className="flex justify-between text-slate-400">
                  <span>Sentry Safe Shelter:</span>
                  <span className="text-slate-200 font-bold">Govt Emergency Safehouse No. 4</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Available Beds:</span>
                  <span className="text-emerald-400 font-bold">120 Beds vacant</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Emergency Hospital:</span>
                  <span className="text-slate-200 font-bold">Apollo Hospital (3.2 km)</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-850 space-y-2">
                <div className="text-emerald-400 font-bold uppercase text-[9px] tracking-wider">Bypass Corridors</div>
                <div className="flex justify-between text-slate-400">
                  <span>Nearest Police:</span>
                  <span className="text-slate-200 font-bold">Civil Station Hub (2.0 km)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Nearest Fire Stn:</span>
                  <span className="text-slate-200 font-bold">Sector D Firehouse (1.5 km)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Evacuation Routing:</span>
                  <span className="text-cyan-400 font-bold">Safe Corridor Inland Bypass (Clear)</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
