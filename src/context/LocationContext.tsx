import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserLocation } from '../types.ts';

export const PRESET_INDIAN_LOCATIONS: UserLocation[] = [
  {
    latitude: 16.6624,
    longitude: 80.7374,
    address: "Gopalapuram, Agiripalle, Eluru, Andhra Pradesh, India",
    state: "Andhra Pradesh",
    district: "Eluru",
    city: "Agiripalle",
    village: "Gopalapuram",
    pincode: "521211",
    source: "manual"
  },
  {
    latitude: 16.6850,
    longitude: 80.7810,
    address: "Agiripalle Mandal Center, Eluru, Andhra Pradesh, India",
    state: "Andhra Pradesh",
    district: "Eluru",
    city: "Agiripalle",
    village: "Agiripalle",
    pincode: "521211",
    source: "selector"
  },
  {
    latitude: 16.5062,
    longitude: 80.6480,
    address: "MG Road, Vijayawada, Krishna, Andhra Pradesh, India",
    state: "Andhra Pradesh",
    district: "Krishna",
    city: "Vijayawada",
    pincode: "520010",
    source: "selector"
  },
  {
    latitude: 17.0050,
    longitude: 81.7820,
    address: "Rajahmundry Transit Central, East Godavari, Andhra Pradesh, India",
    state: "Andhra Pradesh",
    district: "East Godavari",
    city: "Rajahmundry",
    pincode: "533103",
    source: "selector"
  },
  {
    latitude: 17.7120,
    longitude: 83.3150,
    address: "Beach Road, Visakhapatnam, Andhra Pradesh, India",
    state: "Andhra Pradesh",
    district: "Visakhapatnam",
    city: "Visakhapatnam",
    pincode: "530002",
    source: "selector"
  },
  {
    latitude: 17.4010,
    longitude: 78.4740,
    address: "Basheerbagh, Hyderabad, Telangana, India",
    state: "Telangana",
    district: "Hyderabad",
    city: "Hyderabad",
    pincode: "500029",
    source: "selector"
  },
  {
    latitude: 17.6690,
    longitude: 80.8930,
    address: "Bhadrachalam Temple Road, Bhadradri Kothagudem, Telangana, India",
    state: "Telangana",
    district: "Bhadradri Kothagudem",
    city: "Bhadrachalam",
    pincode: "507111",
    source: "selector"
  },
  {
    latitude: 13.0836,
    longitude: 80.2747,
    address: "Periamet / Central, Chennai, Tamil Nadu, India",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    pincode: "600003",
    source: "selector"
  },
  {
    latitude: 11.7510,
    longitude: 79.7740,
    address: "Devanampattinam Beach Road, Cuddalore, Tamil Nadu, India",
    state: "Tamil Nadu",
    district: "Cuddalore",
    city: "Cuddalore",
    pincode: "607001",
    source: "selector"
  },
  {
    latitude: 28.6520,
    longitude: 77.2610,
    address: "Yamuna Pushta / Geeta Colony, East Delhi, Delhi, India",
    state: "Delhi",
    district: "East Delhi",
    city: "New Delhi",
    pincode: "110031",
    source: "selector"
  },
  {
    latitude: 19.8130,
    longitude: 85.8310,
    address: "VIP Road / Marine Drive, Puri, Odisha, India",
    state: "Odisha",
    district: "Puri",
    city: "Puri",
    pincode: "752001",
    source: "selector"
  }
];

export const DEFAULT_USER_LOCATION: UserLocation = PRESET_INDIAN_LOCATIONS[0];

export interface LocationContextType {
  currentLocation: UserLocation;
  setCurrentLocation: (loc: UserLocation) => void;
  updateLocationFromGps: () => Promise<boolean>;
  isDetectingGps: boolean;
  isLoadingGps: boolean;
  gpsStatus: 'Live' | 'Unavailable' | 'Detecting' | 'Manual';
  gpsError: string | null;
  setGpsError: (err: string | null) => void;
  presetLocations: UserLocation[];
  setCustomLocation: (data: {
    latitude: number;
    longitude: number;
    address: string;
    state?: string;
    district?: string;
    city?: string;
    village?: string;
  }) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocationState] = useState<UserLocation>(() => {
    try {
      const saved = localStorage.getItem('aegis_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
          // Validate India bounds (Lat: 6 to 38.5, Lng: 68 to 98)
          if (parsed.latitude >= 6.0 && parsed.latitude <= 38.5 && parsed.longitude >= 68.0 && parsed.longitude <= 98.0) {
            return parsed;
          }
        }
      }
    } catch {
      // Ignore parse error and fall back to default
    }
    return DEFAULT_USER_LOCATION;
  });

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'Live' | 'Unavailable' | 'Detecting' | 'Manual'>(() => {
    return currentLocation.source === 'gps' ? 'Live' : 'Manual';
  });

  const setCurrentLocation = (loc: UserLocation) => {
    // Validate India bounds
    if (loc.latitude < 6.0 || loc.latitude > 38.5 || loc.longitude < 68.0 || loc.longitude > 98.0) {
      setGpsError("Selected coordinates are outside India. The AI-Based Disaster Prediction and Emergency Response Management System operates within India only.");
      return;
    }
    setGpsError(null);
    if (loc.source === 'gps') {
      setGpsStatus('Live');
    } else {
      setGpsStatus('Manual');
    }
    setCurrentLocationState(loc);
    try {
      localStorage.setItem('aegis_user_location', JSON.stringify(loc));
    } catch {
      // Ignore storage error
    }
  };

  const setCustomLocation = (data: {
    latitude: number;
    longitude: number;
    address: string;
    state?: string;
    district?: string;
    city?: string;
    village?: string;
  }) => {
    const newLoc: UserLocation = {
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      state: data.state || "Andhra Pradesh",
      district: data.district || "Eluru",
      city: data.city || "Agiripalle",
      village: data.village,
      source: "manual",
      isGpsVerified: false
    };
    setCurrentLocation(newLoc);
  };

  // Reverse geocode latitude and longitude to real Indian address
  const fetchAddressDetails = async (lat: number, lng: number): Promise<{
    city: string;
    district: string;
    state: string;
    address: string;
  }> => {
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        return {
          city: data.city || "Current Location",
          district: data.district || data.state_district || "District Area",
          state: data.state || "India",
          address: data.address || `${data.city || 'Location'}, ${data.state || 'India'}`
        };
      }
    } catch (e) {
      console.warn("Reverse geocode failed, using coordinate fallback", e);
    }
    return {
      city: "Current Coordinates",
      district: "Local Region",
      state: "India",
      address: `Live Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`
    };
  };

  const updateLocationFromGps = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setGpsError("Geolocation is not supported by your browser. Please select an Indian location manually.");
        setGpsStatus('Unavailable');
        resolve(false);
        return;
      }

      setIsDetectingGps(true);
      setGpsStatus('Detecting');
      setGpsError(null);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setIsDetectingGps(false);
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = pos.coords.accuracy;

          // Check if coordinates fall inside India bounding box
          if (lat < 6.0 || lat > 38.5 || lng < 68.0 || lng > 98.0) {
            setGpsError(`Detected GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°) is outside India. The system operates in India.`);
            setGpsStatus('Unavailable');
            resolve(false);
            return;
          }

          // Reverse geocode to get real Indian place names
          const details = await fetchAddressDetails(lat, lng);

          const gpsLoc: UserLocation = {
            latitude: parseFloat(lat.toFixed(4)),
            longitude: parseFloat(lng.toFixed(4)),
            address: details.address,
            state: details.state,
            district: details.district,
            city: details.city,
            source: "gps",
            isGpsVerified: true,
            accuracy: Math.round(acc)
          };

          setGpsStatus('Live');
          setCurrentLocation(gpsLoc);
          resolve(true);
        },
        (err) => {
          setIsDetectingGps(false);
          setGpsStatus('Unavailable');
          if (err.code === err.PERMISSION_DENIED) {
            setGpsError("Location permission was denied. Select your location manually or enable browser location.");
          } else if (err.code === err.TIMEOUT) {
            setGpsError("GPS request timed out. Please retry or choose a preset location.");
          } else {
            setGpsError("Unable to retrieve device location. Using selected location.");
          }
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  // Attempt auto-detection on first visit if no saved manual location or if GPS was previously used
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      if (currentLocation.source === 'gps') {
        updateLocationFromGps();
      }
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        updateLocationFromGps,
        isDetectingGps,
        isLoadingGps: isDetectingGps,
        gpsStatus,
        gpsError,
        setGpsError,
        presetLocations: PRESET_INDIAN_LOCATIONS,
        setCustomLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
