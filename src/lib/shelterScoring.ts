import { Shelter } from '../types.ts';

export type RankedShelter = Shelter;

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using Haversine formula
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates estimated travel time in minutes based on disaster transit speed (~35 km/h + staging delay)
 */
export function computeTravelTimeMin(distanceKm: number): number {
  if (distanceKm <= 0.5) return 2;
  if (distanceKm <= 1.0) return 4;
  return Math.round((distanceKm / 32) * 60 + 4);
}

/**
 * Computes a transparent Safety & Recommendation Score (0-100) based on:
 * - Distance from citizen (Max 30 pts)
 * - Capacity availability & open beds (Max 25 pts)
 * - Medical support & emergency doctors (Max 15 pts)
 * - Utilities, food rations & drinking water (Max 15 pts)
 * - Inclusivity, safety for women & wheelchair access (Max 10 pts)
 * - Hazard exposure & route inundation penalty (-12 to -30 pts)
 */
export function calculateShelterSafetyScore(
  shelter: Shelter,
  userLat: number,
  userLng: number,
  radiusKm: number = 25
): {
  distanceKm: number;
  estimatedTimeMin: number;
  safetyScore: number;
  scoreReasons: string[];
  routeRisk: 'Low' | 'Medium' | 'High';
} {
  const distanceKm = parseFloat(
    haversineDistanceKm(userLat, userLng, shelter.latitude, shelter.longitude).toFixed(2)
  );
  const estimatedTimeMin = computeTravelTimeMin(distanceKm);

  let score = 0;
  const scoreReasons: string[] = [];

  // 1. Distance Component (Max 30 points)
  // Closer shelters get higher points, scaling linearly within current search radius
  const maxSearchRadius = Math.max(radiusKm, 10);
  const distanceFactor = Math.max(0, 1 - distanceKm / maxSearchRadius);
  const distanceScore = distanceFactor * 30;
  score += distanceScore;
  scoreReasons.push(`✓ ${distanceKm.toFixed(1)} km away (~${estimatedTimeMin} min travel)`);

  // 2. Capacity & Occupancy Availability (Max 25 points)
  const totalCap = shelter.totalCapacity || shelter.capacity || 100;
  const occ = shelter.occupied || 0;
  const availableBeds = shelter.availableBeds !== undefined ? shelter.availableBeds : Math.max(0, totalCap - occ);
  const occRatio = totalCap > 0 ? occ / totalCap : 1;

  if (shelter.status === 'Closed') {
    score = 0;
    scoreReasons.push(`❌ Facility is currently closed by local administration`);
  } else if (shelter.status === 'Full' || availableBeds <= 0 || occRatio >= 1.0) {
    score = Math.max(10, score * 0.2); // Heavy penalty for full capacity
    scoreReasons.push(`⚠️ Facility is at maximum capacity (0 beds available)`);
  } else if (occRatio < 0.50) {
    score += 25;
    scoreReasons.push(`✓ High availability (${availableBeds} beds open, ${(occRatio * 100).toFixed(0)}% occupancy)`);
  } else if (occRatio < 0.80) {
    score += 18;
    scoreReasons.push(`✓ Shelter has available capacity (${availableBeds} beds left)`);
  } else {
    score += 8;
    scoreReasons.push(`⚠️ Limited capacity remaining (${availableBeds} beds left)`);
  }

  // 3. Medical Infrastructure & Doctors (Max 15 points)
  let medScore = 0;
  if (shelter.medicalTeam) medScore += 5;
  const doctors = shelter.doctorsAvailable || shelter.doctorsCount || 0;
  if (doctors > 0) medScore += 5;
  if (shelter.ambulanceAvailable) medScore += 3;
  const nurses = shelter.nursesAvailable || shelter.nursesCount || 0;
  if (nurses > 0) medScore += 2;
  score += medScore;

  if (medScore >= 10) {
    scoreReasons.push(`✓ Active medical team with ${doctors} doctor(s) & ambulance on standby`);
  } else if (medScore > 0) {
    scoreReasons.push(`✓ First-aid and paramedical care active on site`);
  } else {
    scoreReasons.push(`ℹ️ Basic medical supplies only; no dedicated physician`);
  }

  // 4. Utilities, Rations & Clean Drinking Water (Max 15 points)
  let utilScore = 0;
  const water = shelter.drinkingWater === 'Yes' || shelter.waterAvailable === 'Available';
  const food = shelter.availableFood === 'Yes' || shelter.foodAvailable === 'Available';
  if (water) utilScore += 6;
  if (food) utilScore += 6;
  if (shelter.electricityStatus === 'Stable' || shelter.generatorBackup) utilScore += 3;
  score += utilScore;

  if (water && food) {
    scoreReasons.push(`✓ Clean drinking water and hot food rations verified`);
  } else if (water) {
    scoreReasons.push(`✓ Clean drinking water supply active; dry rations only`);
  }

  // 5. Inclusivity & Protection (Max 10 points)
  let incScore = 0;
  if (shelter.womenChildrenFriendly || shelter.womenSafe) incScore += 4;
  if (shelter.elderlyFriendly || shelter.seniorSupport) incScore += 3;
  if (shelter.wheelchairAccessible || shelter.wheelchairAccess) incScore += 3;
  score += incScore;

  if (incScore >= 7) {
    scoreReasons.push(`✓ Safe zone for women, children & wheelchair accessible`);
  }

  // 6. Hazard Exposure & Route Safety Penalty
  let routeRisk: 'Low' | 'Medium' | 'High' = 'Low';
  if (shelter.disasterRiskLevel === 'High') {
    score -= 28;
    routeRisk = 'High';
    scoreReasons.push(`⚠️ Located in active high flood/hazard warning sector`);
  } else if (shelter.disasterRiskLevel === 'Medium') {
    score -= 10;
    routeRisk = 'Medium';
    scoreReasons.push(`ℹ️ Moderate weather advisory in local sector`);
  } else {
    scoreReasons.push(`✓ Low disaster hazard exposure (elevated high ground)`);
  }

  const finalScore = shelter.status === 'Closed' ? 0 : Math.min(100, Math.max(10, Math.round(score)));

  return {
    distanceKm,
    estimatedTimeMin,
    safetyScore: finalScore,
    scoreReasons,
    routeRisk
  };
}

/**
 * Filter and rank shelters by transparent safety score and proximity
 */
export function rankAndFilterShelters(
  shelters: Shelter[],
  userLat: number,
  userLng: number,
  radiusKm: number = 25,
  options?: {
    statusFilter?: 'ALL' | 'OPEN_ONLY' | 'MEDICAL_ONLY' | 'HIGH_CAPACITY';
    maxResults?: number;
  }
): Shelter[] {
  const scoredList: Shelter[] = shelters.map(s => {
    const metrics = calculateShelterSafetyScore(s, userLat, userLng, radiusKm);
    return {
      ...s,
      country: 'India',
      distanceKm: metrics.distanceKm,
      estimatedTimeMin: metrics.estimatedTimeMin,
      safetyScore: metrics.safetyScore,
      scoreReasons: metrics.scoreReasons,
      routeRisk: metrics.routeRisk,
      availableBeds: s.availableBeds !== undefined ? s.availableBeds : Math.max(0, (s.totalCapacity || s.capacity) - s.occupied),
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`
    };
  });

  // Filter within radius
  let filtered = scoredList.filter(s => (s.distanceKm ?? 9999) <= radiusKm);

  // Apply optional UI filters
  if (options?.statusFilter === 'OPEN_ONLY') {
    filtered = filtered.filter(s => s.status === 'Open');
  } else if (options?.statusFilter === 'MEDICAL_ONLY') {
    filtered = filtered.filter(s => s.medicalTeam && ((s.doctorsAvailable || s.doctorsCount) > 0));
  } else if (options?.statusFilter === 'HIGH_CAPACITY') {
    filtered = filtered.filter(s => (s.availableBeds ?? 0) > 100);
  }

  // Sort order:
  // 1. Available over Full/Closed
  // 2. Safety Score (highest first)
  // 3. Distance (closest first)
  filtered.sort((a, b) => {
    const aAvailable = a.status === 'Open' && (a.availableBeds ?? 0) > 0;
    const bAvailable = b.status === 'Open' && (b.availableBeds ?? 0) > 0;
    if (aAvailable && !bAvailable) return -1;
    if (!aAvailable && bAvailable) return 1;

    // Compare safety score
    const scoreDiff = (b.safetyScore ?? 0) - (a.safetyScore ?? 0);
    if (Math.abs(scoreDiff) > 2) return scoreDiff;

    // Compare distance
    return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
  });

  // Tag top available shelter as recommended
  if (filtered.length > 0) {
    const topAvailableIndex = filtered.findIndex(s => s.status === 'Open' && (s.availableBeds ?? 0) > 0);
    if (topAvailableIndex !== -1) {
      filtered[topAvailableIndex].isRecommended = true;
    } else {
      filtered[0].isRecommended = true;
    }
  }

  if (options?.maxResults) {
    return filtered.slice(0, options.maxResults);
  }

  return filtered;
}

/**
 * Generate official Google Maps search query link
 */
export function getGoogleMapsSearchUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

/**
 * Generate official Google Maps direction navigation link
 */
export function getGoogleMapsDirectionsUrl(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destLat},${destLng}`;
}
