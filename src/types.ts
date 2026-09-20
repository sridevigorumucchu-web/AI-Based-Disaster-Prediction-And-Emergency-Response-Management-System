/**
 * AI-Based Disaster Prediction & Emergency Response Management System
 * Shared Type Definitions
 */

export type DisasterType = 'Flood' | 'Wildfire' | 'Hurricane' | 'Earthquake' | 'None';

export type RiskLevel = 'Green' | 'Yellow' | 'Orange' | 'Red'; // Safe, Low, Elevated, Severe

export interface WeatherMetrics {
  temp: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  pressure: number; // hPa
  rainfall: number; // mm
}

export interface DisasterPrediction {
  id: string;
  type: DisasterType;
  probability: number; // 0 to 100
  riskLevel: RiskLevel;
  location: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  metrics: WeatherMetrics;
  mlMethod: 'Random Forest' | 'XGBoost' | 'LSTM';
  confidence: number; // %
  evacuationTriggered: boolean;
  notes: string;
}

export interface EmergencyRequest {
  id: string;
  uid: string;
  userName: string;
  contact: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
  status: 'Pending' | 'Dispatched' | 'Resolved';
  needsRescue: boolean;
  medicalRequired: boolean;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
  state: string;
  district: string;
  city: string;
  village?: string;
  pincode?: string;
  source: 'gps' | 'selector' | 'manual';
  accuracy?: number;
  isGpsVerified?: boolean;
}

export interface Shelter {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  totalCapacity?: number;
  occupied: number;
  status: 'Open' | 'Full' | 'Closed' | 'Near Full';
  contact: string;
  phone?: string;
  country: string; // Must be "India"
  // Extended fields
  state: string;
  district: string;
  city: string;
  address: string;
  googleMapsUrl: string;
  availableBeds: number;
  availableRooms: number;
  availableFood: 'Yes' | 'No' | 'Limited';
  foodAvailable?: string;
  drinkingWater: 'Yes' | 'No' | 'Limited';
  waterAvailable?: string;
  medicalTeam: boolean;
  doctorsCount: number;
  doctorsAvailable?: number;
  nursesCount: number;
  nursesAvailable?: number;
  ambulanceAvailable: boolean;
  electricityStatus: 'Stable' | 'Intermittent' | 'Generator' | 'Outage';
  internetAvailable: boolean;
  washroomsCount: number;
  womenChildrenFriendly: boolean;
  womenSafe?: boolean;
  childrenSupport?: boolean;
  seniorSupport?: boolean;
  elderlyFriendly: boolean;
  wheelchairAccessible: boolean;
  wheelchairAccess?: boolean;
  petFriendly: boolean;
  parkingAvailable: boolean;
  generatorBackup: boolean;
  securityStatus: 'Secure' | 'Guard Present' | 'Unmonitored' | 'Vulnerable';
  managerName: string;
  lastUpdated: string;
  // Scenario & Point of Interest details
  predictedDisaster?: string;
  disasterRiskLevel?: 'High' | 'Medium' | 'Low' | 'None';
  timeRemainingHours?: number;
  nearestHospital?: string;
  nearestPoliceStation?: string;
  nearestFireStation?: string;
  emergencyNumbers?: string[];
  atmAvailable?: boolean;
  petrolPumpAvailable?: boolean;
  pharmacyAvailable?: boolean;
  groceryStoreAvailable?: boolean;
  bloodBankAvailable?: boolean;
  reliefCampAvailable?: boolean;
  ngoSupportAvailable?: boolean;
  // Calculated live metrics relative to user's selected location
  distanceKm?: number;
  estimatedTimeMin?: number;
  safetyScore?: number;
  scoreReasons?: string[];
  isRecommended?: boolean;
  routeRisk?: 'Low' | 'Medium' | 'High';
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  bedsAvailable: number;
  bedsTotal: number;
  status: 'Normal' | 'Overwhelmed';
  contact: string;
  address?: string;
  emergencyBeds?: number;
  icuAvailable?: boolean;
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'Info' | 'Warning' | 'Emergency' | string;
  timestamp: string;
  location: string;
  active: boolean;
  source?: string;
}

// Graph structures for A* Pathfinding in Leaflet / Interactive Map
export interface PathNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'intersection' | 'shelter' | 'hospital' | 'blocked' | 'flooded' | 'traffic';
  isSafeZone?: boolean;
}

export interface PathEdge {
  id: string;
  from: string;
  to: string;
  distance: number; // kilometers / units
  trafficDelay: number; // additional cost multiplier (0 = normal, 2 = heavy traffic)
  hazardLevel: number; // additional risk factor (0 = dry/safe, 3 = high flood risk)
  isBlocked: boolean;
}
