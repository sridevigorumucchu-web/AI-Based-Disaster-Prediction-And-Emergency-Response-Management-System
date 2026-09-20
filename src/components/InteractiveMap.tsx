import React, { useState, useEffect } from 'react';
import { PathNode, PathEdge, RiskLevel } from '../types.ts';
import { findSafestRoute } from '../lib/astar.ts';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, AlertTriangle, Hospital as HospitalIcon, Shield, CheckCircle2, Navigation, Flame, Droplet, RefreshCw } from 'lucide-react';

interface InteractiveMapProps {
  nodes: PathNode[];
  edges: PathEdge[];
  riskLevels: Record<string, RiskLevel>;
  onToggleBlock?: (edgeId: string) => void;
  selectedStartNode: string;
  setSelectedStartNode: (id: string) => void;
  selectedGoalNode: string;
  setSelectedGoalNode: (id: string) => void;
}

export default function InteractiveMap({
  nodes,
  edges,
  riskLevels,
  onToggleBlock,
  selectedStartNode,
  setSelectedStartNode,
  selectedGoalNode,
  setSelectedGoalNode,
}: InteractiveMapProps) {
  const { t } = useTranslation();
  const [routeResult, setRouteResult] = useState<any>(null);
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);
  const [mapHoverInfo, setMapHoverInfo] = useState<string | null>(null);
  const [avoidBlocked, setAvoidBlocked] = useState(true);
  const [hazardWeight, setHazardWeight] = useState(5.0);
  const [trafficWeight, setTrafficWeight] = useState(2.0);

  // Re-calculate route whenever node selections or weights change
  useEffect(() => {
    if (selectedStartNode && selectedGoalNode) {
      const res = findSafestRoute(
        nodes,
        edges,
        selectedStartNode,
        selectedGoalNode,
        avoidBlocked,
        hazardWeight,
        trafficWeight
      );
      setRouteResult(res);
    } else {
      setRouteResult(null);
    }
  }, [selectedStartNode, selectedGoalNode, nodes, edges, avoidBlocked, hazardWeight, trafficWeight]);

  // Google Maps API integration handling
  const googleMapsKey =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    "";
  const hasGoogleKey = Boolean(googleMapsKey) && googleMapsKey !== "YOUR_API_KEY";

  // Dynamic layout dimensions for SVG grid mapping
  // Map lat/lng coordinates to SVG x/y coordinates dynamically based on active nodes
  const mapWidth = 800;
  const mapHeight = 500;

  const validNodes = nodes.filter(n => n.lat && n.lng);
  const lats = validNodes.length > 0 ? validNodes.map(n => n.lat) : [17.00, 17.15];
  const lngs = validNodes.length > 0 ? validNodes.map(n => n.lng) : [81.45, 81.85];
  const latMin = Math.min(...lats) - 0.03;
  const latMax = Math.max(...lats) + 0.03;
  const lngMin = Math.min(...lngs) - 0.03;
  const lngMax = Math.max(...lngs) + 0.03;

  const convertCoords = (lat: number, lng: number) => {
    const lngSpan = lngMax - lngMin || 0.1;
    const latSpan = latMax - latMin || 0.1;
    const x = ((lng - lngMin) / lngSpan) * mapWidth;
    // SVG 0,0 is top-left, so flip Y axis
    const y = mapHeight - ((lat - latMin) / latSpan) * mapHeight;
    return { x: Math.max(20, Math.min(mapWidth - 20, x)), y: Math.max(20, Math.min(mapHeight - 20, y)) };
  };

  // Color mappings for Risk Heatmaps (Green, Yellow, Orange, Red)
  const riskColorMap: Record<RiskLevel, { stroke: string; fill: string; glow: string; text: string }> = {
    Green: { stroke: 'rgba(34, 197, 94, 0.5)', fill: 'rgba(34, 197, 94, 0.08)', glow: '#22c55e', text: 'text-green-500' },
    Yellow: { stroke: 'rgba(234, 179, 8, 0.5)', fill: 'rgba(234, 179, 8, 0.12)', glow: '#eab308', text: 'text-yellow-500' },
    Orange: { stroke: 'rgba(249, 115, 22, 0.5)', fill: 'rgba(249, 115, 22, 0.16)', glow: '#f97316', text: 'text-orange-500' },
    Red: { stroke: 'rgba(239, 68, 68, 0.6)', fill: 'rgba(239, 68, 68, 0.22)', glow: '#ef4444', text: 'text-red-500' },
  };

  // Get zone threat label
  const getSectorThreatText = (sectorId: string, risk: RiskLevel) => {
    if (sectorId === 'sec_c' && (risk === 'Orange' || risk === 'Red')) return 'Storm Surge / Coastal Gale';
    if (sectorId === 'sec_d' && (risk === 'Orange' || risk === 'Red')) return 'Heavy Inundation Zone';
    if (risk === 'Red') return 'Severe Threat Area';
    if (risk === 'Orange') return 'Elevated Risk Corridor';
    return 'Stable Environment';
  };

  // Define static risk zones / sectors overlay circles
  const sectors = [
    { id: 'sec_a', name: 'Gopalapuram Basin', lat: 17.1044, lng: 81.5434, radius: 90 },
    { id: 'sec_b', name: 'Rajahmundry Godavari Basin', lat: 17.0050, lng: 81.7820, radius: 90 },
    { id: 'sec_c', name: 'Kakinada Deep Sea Port', lat: 16.9891, lng: 82.2475, radius: 100 },
    { id: 'sec_d', name: 'Visakhapatnam Bay Coast', lat: 17.6868, lng: 83.2185, radius: 110 },
    { id: 'sec_e', name: 'Papikonda Forest Range', lat: 17.5380, lng: 81.2560, radius: 80 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full" id="tactical_map_view">
      {/* Top Header Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse" />
          <h2 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono">
            Tactical Evacuation Grid & Pathfinding Engine
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {hasGoogleKey && (
            <button
              onClick={() => setUseGoogleMaps(!useGoogleMaps)}
              className={`px-3 py-1.5 rounded font-mono font-medium transition ${
                useGoogleMaps
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              id="map_toggle_btn"
            >
              {useGoogleMaps ? 'Switch to Vector Grid' : 'Switch to Google Maps'}
            </button>
          )}

          <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded border border-slate-700 font-mono">
            A* Solver Weighting: Hazard ({hazardWeight}x), Traffic ({trafficWeight}x)
          </span>
        </div>
      </div>

      {/* Main Map Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-4 flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* SVG Interactive Canvas Map */}
        <div className="lg:col-span-3 relative bg-[#0B0F19] overflow-hidden min-h-[400px] flex items-center justify-center">
          {useGoogleMaps && hasGoogleKey ? (
            // Google Maps iframe fallback with custom styled overlay if live library isn't loaded
            <div className="absolute inset-0 w-full h-full flex flex-col bg-slate-900 justify-center items-center text-center p-4">
              <Navigation className="w-12 h-12 text-blue-500 animate-spin mb-3" />
              <p className="text-sm text-slate-300 font-mono">Google Maps API Layer Loaded Successfully</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Rendering active satellite layers at Centroid {nodes[0]?.lat || 17.1044}, {nodes[0]?.lng || 81.5434}.
              </p>
              {/* Fallback frame demonstrating active key */}
              <iframe
                title="Google Map Evacuation"
                width="100%"
                height="100%"
                className="absolute inset-0 opacity-45 pointer-events-none"
                src={`https://www.google.com/maps/embed/v1/view?key=${googleMapsKey}&center=17.1044,81.5434&zoom=13`}
              />
              <button
                onClick={() => setUseGoogleMaps(false)}
                className="mt-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs font-mono relative z-10"
              >
                Show Tactical Path Node Overlay
              </button>
            </div>
          ) : (
            // Tactical SVG Vector Grid (Perfect for illustrating A* steps with no external load failures)
            <div className="w-full h-full relative flex items-center justify-center overflow-auto p-4">
              {/* Tactical Sci-Fi HUD background elements */}
              <div className="absolute top-3 left-4 text-[10px] text-cyan-600 font-mono pointer-events-none">
                SYS_LOC: SAN_FRANCISCO_CORRIDOR // SCANNING_SAT_ALT: 320KM
              </div>
              <div className="absolute bottom-3 right-4 text-[10px] text-cyan-600 font-mono pointer-events-none">
                GRID_SCALE: 1UNIT = 100M // GRID_STATE: STABLE_FLUID
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.3)_1px,transparent_1px)] bg-[size:20px_20px] opacity-60 pointer-events-none" />

              <svg
                width={mapWidth}
                height={mapHeight}
                viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                className="relative select-none max-w-full"
                id="tactical_grid_svg"
              >
                {/* Risk Heatmap Overlays */}
                {sectors.map(sec => {
                  const coords = convertCoords(sec.lat, sec.lng);
                  const risk = riskLevels[sec.id] || 'Green';
                  const style = riskColorMap[risk];
                  return (
                    <g key={sec.id}>
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={sec.radius}
                        fill={style.fill}
                        stroke={style.stroke}
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        className="transition-all duration-700"
                        onMouseEnter={() => setMapHoverInfo(`${sec.name} (Disaster threat: ${getSectorThreatText(sec.id, risk)})`)}
                        onMouseLeave={() => setMapHoverInfo(null)}
                      />
                      {/* Warning indicators inside high-hazard zones */}
                      {(risk === 'Red' || risk === 'Orange') && (
                        <g transform={`translate(${coords.x - 10}, ${coords.y - sec.radius + 20})`}>
                          <animateTransform
                            attributeName="transform"
                            type="translate"
                            values={`${coords.x - 10} ${coords.y - sec.radius + 15}; ${coords.x - 10} ${coords.y - sec.radius + 25}; ${coords.x - 10} ${coords.y - sec.radius + 15}`}
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          {sec.id === 'sec_c' ? (
                            <Droplet className="w-5 h-5 text-blue-400 opacity-80" />
                          ) : (
                            <Flame className="w-5 h-5 text-orange-500 opacity-80" />
                          )}
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Road Edges (Normal, Blocked, Flooded, Traversed) */}
                {edges.map(edge => {
                  const fromNode = nodes.find(n => n.id === edge.from);
                  const toNode = nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const p1 = convertCoords(fromNode.lat, fromNode.lng);
                  const p2 = convertCoords(toNode.lat, toNode.lng);

                  // Check if this edge is part of the calculated path
                  const isTraversed =
                    routeResult &&
                    routeResult.path.includes(edge.from) &&
                    routeResult.path.includes(edge.to) &&
                    Math.abs(routeResult.path.indexOf(edge.from) - routeResult.path.indexOf(edge.to)) === 1;

                  let strokeColor = "rgba(71, 85, 105, 0.4)"; // Default slate gray road
                  let strokeWidth = "2";
                  let dashArray = "";

                  if (edge.isBlocked) {
                    strokeColor = "rgba(239, 68, 68, 0.8)"; // Red blocked road
                    strokeWidth = "3";
                    dashArray = "4 4";
                  } else if (edge.hazardLevel >= 2) {
                    strokeColor = "rgba(59, 130, 246, 0.7)"; // Blue flooded road
                    strokeWidth = "2.5";
                    dashArray = "1 3";
                  } else if (edge.trafficDelay >= 1.0) {
                    strokeColor = "rgba(249, 115, 22, 0.7)"; // Orange traffic road
                    strokeWidth = "2.5";
                  }

                  // Override style if this edge is the calculated safest path
                  if (isTraversed) {
                    strokeColor = "#06b6d4"; // Bright cyan
                    strokeWidth = "5";
                    dashArray = "";
                  }

                  return (
                    <g key={edge.id}>
                      {/* Interactive click zone for administrators */}
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke="transparent"
                        strokeWidth="12"
                        className="cursor-pointer"
                        onClick={() => onToggleBlock && onToggleBlock(edge.id)}
                        onMouseEnter={() =>
                          setMapHoverInfo(
                            `Road Segment: ${fromNode.name} to ${toNode.name} (${edge.distance}km). ${
                              edge.isBlocked ? '⚠️ BLOCKED' : `Traffic: ${edge.trafficDelay > 1 ? 'Heavy' : 'Light'}, Hazard: ${edge.hazardLevel > 1 ? 'High' : 'Low'}`
                            }. Click to toggle blockage.`
                          )
                        }
                        onMouseLeave={() => setMapHoverInfo(null)}
                      />
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={dashArray}
                        className="transition-all duration-300"
                      />

                      {/* Animated path flows */}
                      {isTraversed && (
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke="#ffffff"
                          strokeWidth="5"
                          strokeDasharray="10 30"
                          strokeLinecap="round"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            values="300;0"
                            dur="4s"
                            repeatCount="indefinite"
                          />
                        </line>
                      )}
                    </g>
                  );
                })}

                {/* Nodes rendering (Intersections, Shelters, Hospitals) */}
                {nodes.map(node => {
                  const { x, y } = convertCoords(node.lat, node.lng);
                  const isStart = node.id === selectedStartNode;
                  const isGoal = node.id === selectedGoalNode;
                  const isOnPath = routeResult?.path.includes(node.id);

                  let size = 8;
                  let color = "#475569"; // Gray default intersection
                  let border = "#1e293b";

                  if (node.type === 'shelter') {
                    size = 14;
                    color = "#22c55e"; // Green shelter
                    border = "#ffffff";
                  } else if (node.type === 'hospital') {
                    size = 14;
                    color = "#ef4444"; // Red hospital
                    border = "#ffffff";
                  }

                  if (isOnPath) {
                    border = "#22d3ee"; // Glow neon cyan border
                  }

                  if (isStart) {
                    color = "#3b82f6"; // Primary blue start
                    size = 13;
                  }

                  return (
                    <g key={node.id} transform={`translate(${x}, ${y})`}>
                      {/* Hover / Select ring */}
                      <circle
                        r={size + 6}
                        fill="transparent"
                        stroke={isStart ? '#3b82f6' : isGoal ? '#10b981' : 'transparent'}
                        strokeWidth="2"
                        className="cursor-pointer"
                        onClick={() => {
                          if (node.type === 'shelter' || node.type === 'hospital') {
                            setSelectedGoalNode(node.id);
                          } else {
                            setSelectedStartNode(node.id);
                          }
                        }}
                        onMouseEnter={() =>
                          setMapHoverInfo(
                            `${node.name} [${node.type.toUpperCase()}]. Lat:${node.lat.toFixed(4)}, Lng:${node.lng.toFixed(
                              4
                            )}. Click to select as ${node.type === 'shelter' || node.type === 'hospital' ? 'destination shelter' : 'start point'}.`
                          )
                        }
                        onMouseLeave={() => setMapHoverInfo(null)}
                      />

                      <circle
                        r={size}
                        fill={color}
                        stroke={border}
                        strokeWidth={isOnPath ? "2.5" : "1.5"}
                        className="transition-all duration-300 cursor-pointer shadow-lg"
                        onClick={() => {
                          if (node.type === 'shelter' || node.type === 'hospital') {
                            setSelectedGoalNode(node.id);
                          } else {
                            setSelectedStartNode(node.id);
                          }
                        }}
                      />

                      {/* Icons inside larger shelter/hospital nodes */}
                      {node.type === 'shelter' && (
                        <Shield className="w-3.5 h-3.5 text-white absolute -translate-x-1.5 -translate-y-1.5 pointer-events-none" />
                      )}
                      {node.type === 'hospital' && (
                        <HospitalIcon className="w-3.5 h-3.5 text-white absolute -translate-x-1.5 -translate-y-1.5 pointer-events-none" />
                      )}

                      {/* Pulse effect for selected start / goal */}
                      {(isStart || isGoal) && (
                        <circle
                          r={size + 10}
                          fill="none"
                          stroke={isStart ? '#3b82f6' : '#10b981'}
                          strokeWidth="1.5"
                          className="animate-ping opacity-40 pointer-events-none"
                        />
                      )}

                      {/* Display names next to special nodes */}
                      {(node.type === 'shelter' || node.type === 'hospital' || isStart) && (
                        <text
                          y={-size - 4}
                          textAnchor="middle"
                          className="fill-slate-300 font-mono text-[9px] font-semibold bg-slate-950 px-1 rounded pointer-events-none"
                        >
                          {isStart ? '📍 Start Point' : node.name.split(' ')[0]}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Real-time map status tooltip */}
              {mapHoverInfo && (
                <div className="absolute bottom-4 left-4 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 shadow-xl max-w-sm pointer-events-none z-10 transition-all">
                  <p className="text-xs text-cyan-400 font-mono tracking-tight">{mapHoverInfo}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar Control Column - A* Calculations Details */}
        <div className="p-4 bg-slate-950 flex flex-col justify-between h-full lg:col-span-1 text-slate-300">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center gap-1">
              <Navigation className="w-4 h-4 text-cyan-500" /> {t('pathfinder.solver_title')}
            </h3>

            {/* Routing Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">
                  {t('pathfinder.start_label')}
                </label>
                <select
                  value={selectedStartNode}
                  onChange={(e) => setSelectedStartNode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- {t('pathfinder.start_label')} --</option>
                  {nodes.filter(n => n.type === 'intersection').map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">
                  {t('pathfinder.dest_label')}
                </label>
                <select
                  value={selectedGoalNode}
                  onChange={(e) => setSelectedGoalNode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- {t('pathfinder.dest_label')} --</option>
                  {nodes.filter(n => n.type === 'shelter' || n.type === 'hospital').map(n => (
                    <option key={n.id} value={n.id}>
                      {n.type === 'hospital' ? '🏥' : '🛡️'} {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">{t('pathfinder.avoid_blocked')}</span>
                  <input
                    type="checkbox"
                    checked={avoidBlocked}
                    onChange={(e) => setAvoidBlocked(e.target.checked)}
                    className="w-3.5 h-3.5 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono uppercase mb-1">
                    <span>{t('pathfinder.hazard_weight')}</span>
                    <span className="text-cyan-400 font-bold">{hazardWeight.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={hazardWeight}
                    onChange={(e) => setHazardWeight(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono uppercase mb-1">
                    <span>{t('pathfinder.traffic_weight')}</span>
                    <span className="text-cyan-400 font-bold">{trafficWeight.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={trafficWeight}
                    onChange={(e) => setTrafficWeight(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic solver outputs */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            {routeResult ? (
              <div className="space-y-3">
                <div className="bg-cyan-950/20 border border-cyan-800/40 p-2.5 rounded">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs font-semibold uppercase mb-1">
                    <CheckCircle2 className="w-4 h-4" /> {t('pathfinder.route_found')}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                    A* calculated route minimizing flood hazard risk and congestion delays.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                    <div className="text-[9px] text-slate-500 uppercase font-mono">{t('pathfinder.distance')}</div>
                    <div className="text-sm font-bold text-slate-100 font-mono">{routeResult.totalDistance.toFixed(2)} km</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                    <div className="text-[9px] text-slate-500 uppercase font-mono">{t('pathfinder.weighted_cost')}</div>
                    <div className="text-sm font-bold text-cyan-400 font-mono">{routeResult.totalCost.toFixed(1)}</div>
                  </div>
                </div>

                {/* Path corridor list */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block mb-1.5">
                    {t('pathfinder.corridor')}
                  </span>
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
                    {routeResult.path.map((nodeId: string, idx: number) => {
                      const name = nodes.find(n => n.id === nodeId)?.name.split(' ')[0] || nodeId;
                      return (
                        <span key={nodeId} className="flex items-center gap-1">
                          {idx > 0 && <span className="text-slate-600">→</span>}
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              nodeId.startsWith('S')
                                ? 'bg-green-950 text-green-400 border border-green-800'
                                : nodeId.startsWith('H')
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : 'bg-slate-900 text-slate-300'
                            }`}
                          >
                            {name}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Google Maps Live Directions Button */}
                {(() => {
                  const startNodeObj = nodes.find(n => n.id === selectedStartNode);
                  const goalNodeObj = nodes.find(n => n.id === selectedGoalNode);
                  if (startNodeObj && goalNodeObj) {
                    return (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${startNodeObj.lat},${startNodeObj.lng}&destination=${goalNodeObj.lat},${goalNodeObj.lng}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        rel="noreferrer"
                        className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
                        id="interactive_map_gmaps_btn"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Launch Live Navigation in Google Maps</span>
                      </a>
                    );
                  }
                  return null;
                })()}
              </div>
            ) : selectedStartNode && selectedGoalNode ? (
              <div className="bg-red-950/20 border border-red-900/40 p-3 rounded text-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <div className="text-xs font-semibold text-red-400 uppercase font-mono mb-1">NO SAFE PATH FOUND</div>
                <p className="text-[9px] text-slate-500 leading-relaxed font-mono">
                  All interconnected road corridors between selected locations are blocked by debris, firelines, or severe floodwaters. Use Admin dashboard to clear road blockages.
                </p>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-600 border border-dashed border-slate-800 rounded font-mono text-xs">
                Select start coordinates and safe-haven goal to initiate solver.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
