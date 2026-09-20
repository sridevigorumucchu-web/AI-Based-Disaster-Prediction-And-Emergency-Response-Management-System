import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';

// Developer Console Core Shell
import AppShell from './components/console/AppShell';
import { NavTabId } from './components/console/Sidebar';

// Views for Core Modules
import DashboardView from './components/views/DashboardView';
import WeatherPredictionView from './components/views/WeatherPredictionView';
import AIAnalyzerView from './components/views/AIAnalyzerView';
import EvacuationView from './components/views/EvacuationView';
import VerifiedSheltersView from './components/views/VerifiedSheltersView';
import EmergencyResponseView from './components/views/EmergencyResponseView';
import DisasterAlertsView from './components/views/DisasterAlertsView';
import DamageAssessmentView from './components/views/DamageAssessmentView';
import GovernmentSchemesView from './components/views/GovernmentSchemesView';
import IndiaMapHotspotView from './components/views/IndiaMapHotspotView';
import AIChatbotView from './components/views/AIChatbotView';
import SettingsView from './components/views/SettingsView';

// Existing Sub-components & Overlays
import EmergencyTacticalDashboard from './components/EmergencyTacticalDashboard';
import { UserAccount } from './components/GoogleAuthModal';
import { PathNode, PathEdge, DisasterPrediction, EmergencyRequest, Shelter, Hospital, SystemAlert } from './types';

export default function App() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  // Google User Auth State (Defaults to authenticated Emergency Director)
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('aegis_google_account');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      } catch (e) {}
    }
    return {
      id: "usr_google_sridevi",
      name: "Sridevi Gorumucchu",
      email: "sridevigorumucchu@gmail.com",
      picture: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      role: "Emergency Operations Director"
    };
  });

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');

  // Active tactical emergency modal state
  const [activeEmergency, setActiveEmergency] = useState<{
    disasterType: string;
    severity: string;
    confidence: number;
    detectedObjects?: string[];
    mitigationSteps?: string[];
    location?: string;
    timestamp?: string;
  } | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('aegis_google_account');
    // Set fallback guest profile so user remains in console
    setCurrentUser({
      id: "usr_guest",
      name: "Duty Commander (Guest)",
      email: "duty.officer@disaster-response.gov.in",
      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Operations Watchstander"
    });
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('aegis-language', lang);
  };

  // Core synchronized full-stack state variables
  const [weatherSectors, setWeatherSectors] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<DisasterPrediction[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [nodes, setNodes] = useState<PathNode[]>([]);
  const [edges, setEdges] = useState<PathEdge[]>([]);
  const [mlMetrics, setMlMetrics] = useState<any>(null);

  // Map selections
  const [selectedStartNode, setSelectedStartNode] = useState<string>("N1");
  const [selectedGoalNode, setSelectedGoalNode] = useState<string>("S1");

  // Selection state for which ML Model is active
  const [activeMLModel, setActiveMLModel] = useState<'Random Forest' | 'XGBoost' | 'LSTM'>('XGBoost');

  // Polling / Loading states
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state function from backend API
  const fetchTelemetry = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const [weatherRes, predRes, sosRes, shelterRes, hospitalRes, alertRes, graphRes, mlRes] = await Promise.all([
        fetch(`/api/weather`),
        fetch(`/api/predictions?model=${encodeURIComponent(activeMLModel)}`),
        fetch(`/api/emergency-requests`),
        fetch(`/api/shelters`),
        fetch(`/api/hospitals`),
        fetch(`/api/alerts`),
        fetch(`/api/map-graph`),
        fetch(`/api/ml-metrics`)
      ]);

      const safeParseJson = async (res: Response) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} on ${res.url}`);
        }
        const contentType = res.headers.get("content-type") || "";
        const text = await res.text();
        if (!contentType.includes("application/json")) {
          throw new Error(`Expected JSON from ${res.url} but got ${contentType}`);
        }
        return JSON.parse(text);
      };

      const [weatherData, predData, sosData, shelterData, hospitalData, alertData, graphData, mlData] = await Promise.all([
        safeParseJson(weatherRes),
        safeParseJson(predRes),
        safeParseJson(sosRes),
        safeParseJson(shelterRes),
        safeParseJson(hospitalRes),
        safeParseJson(alertRes),
        safeParseJson(graphRes),
        safeParseJson(mlRes)
      ]);

      setWeatherSectors(weatherData);
      setPredictions(predData.predictions || []);
      setEmergencyRequests(sosData || []);
      setShelters(shelterData || []);
      setHospitals(hospitalData || []);
      setSystemAlerts(alertData || []);
      setNodes(graphData.nodes || []);
      setEdges(graphData.edges || []);
      setMlMetrics(mlData);
    } catch (err) {
      console.error("Telemetry sync error:", err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  // Initial Sync
  useEffect(() => {
    fetchTelemetry();
  }, [activeMLModel]);

  // Periodic background telemetry polling (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTelemetry(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeMLModel]);

  // Action: Submit SOS Alert
  const triggerSOS = async (sosPayload: any) => {
    try {
      const res = await fetch("/api/emergency-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sosPayload)
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = sosPayload;
      }
      await fetchTelemetry(true);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Action: Dispatch / Resolve SOS Cases
  const dispatchSOS = async (id: string, status: 'Pending' | 'Dispatched' | 'Resolved') => {
    try {
      await fetch(`/api/emergency-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      await fetchTelemetry(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Block/Unblock road edge dynamically on map
  const toggleBlockEdge = async (edgeId: string) => {
    try {
      await fetch("/api/map-graph/toggle-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edgeId })
      });
      await fetchTelemetry(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger custom prediction
  const handleTriggerPrediction = async (model: 'XGBoost' | 'Random Forest' | 'LSTM', params: any) => {
    try {
      const res = await fetch(`/api/predictions?model=${encodeURIComponent(model)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.predictions) {
          setPredictions(data.predictions);
        }
      }
    } catch (e) {
      console.error("Prediction trigger error:", e);
    }
  };

  // Sector risk lookup for map
  const sectorRisks = predictions.reduce((acc, p) => {
    const normalizedLoc = p.location.toLowerCase();
    let id = "sec_a";
    if (normalizedLoc.includes("sector b")) id = "sec_b";
    else if (normalizedLoc.includes("sector c")) id = "sec_c";
    else if (normalizedLoc.includes("sector d")) id = "sec_d";
    else if (normalizedLoc.includes("sector e")) id = "sec_e";
    acc[id] = p.riskLevel;
    return acc;
  }, {} as Record<string, any>);

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      currentUser={currentUser}
      onLogout={handleLogout}
      currentLang={currentLang}
      onSelectLanguage={handleLanguageChange}
      alerts={systemAlerts}
      activeSosCount={emergencyRequests.filter(r => r.status === 'Pending').length}
    >
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <DashboardView
              predictions={predictions}
              emergencyRequests={emergencyRequests}
              shelters={shelters}
              alerts={systemAlerts}
              weatherSectors={weatherSectors}
              onNavigate={setActiveTab}
              onRefresh={() => fetchTelemetry()}
              isSyncing={isSyncing}
            />
          </motion.div>
        )}

        {activeTab === 'india-map' && (
          <motion.div
            key="india-map"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <IndiaMapHotspotView onTriggerSOS={triggerSOS} />
          </motion.div>
        )}

        {(activeTab === 'weather-prediction' || activeTab === 'weather' || activeTab === 'predictions') && (
          <motion.div
            key="weather-prediction"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <WeatherPredictionView
              predictions={predictions}
              onTriggerPrediction={handleTriggerPrediction}
              isLoading={isSyncing}
              currentLang={currentLang}
            />
          </motion.div>
        )}

        {activeTab === 'ai-analyzer' && (
          <motion.div
            key="ai-analyzer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <AIAnalyzerView
              onTriggerEmergency={(data) => {
                setActiveEmergency({
                  disasterType: data.disasterType || 'Flood Surge',
                  severity: data.severity || 'Critical',
                  confidence: data.confidence || 94.5,
                  detectedObjects: data.detectedObjects || ['Flood Inundation', 'Trapped Civilian'],
                  mitigationSteps: data.mitigationSteps || ['Dispatch NDRF Boat Unit', 'Evacuate to Gopalapuram Shelter'],
                  location: data.location || 'Gopalapuram Basin, East Godavari',
                  timestamp: new Date().toLocaleTimeString()
                });
              }}
            />
          </motion.div>
        )}

        {activeTab === 'evacuation' && (
          <motion.div
            key="evacuation"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <EvacuationView
              nodes={nodes}
              edges={edges}
              riskLevels={sectorRisks}
              onToggleBlock={toggleBlockEdge}
              selectedStartNode={selectedStartNode}
              setSelectedStartNode={setSelectedStartNode}
              selectedGoalNode={selectedGoalNode}
              setSelectedGoalNode={setSelectedGoalNode}
            />
          </motion.div>
        )}

        {activeTab === 'shelters' && (
          <motion.div
            key="shelters"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <VerifiedSheltersView
              shelters={shelters}
              nodes={nodes}
              edges={edges}
              selectedStartNode={selectedStartNode}
              onSelectStartNode={setSelectedStartNode}
            />
          </motion.div>
        )}

        {activeTab === 'emergency' && (
          <motion.div
            key="emergency"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <EmergencyResponseView
              emergencyRequests={emergencyRequests}
              shelters={shelters}
              hospitals={hospitals}
              onTriggerSOS={triggerSOS}
              onUpdateStatus={dispatchSOS}
              onRefresh={() => fetchTelemetry()}
              isSyncing={isSyncing}
            />
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <DisasterAlertsView
              alerts={systemAlerts}
              onRefresh={() => fetchTelemetry()}
              isSyncing={isSyncing}
            />
          </motion.div>
        )}

        {(activeTab === 'damage-assessment' || activeTab === 'pdf-reports') && (
          <motion.div
            key="damage-assessment"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <DamageAssessmentView />
          </motion.div>
        )}

        {activeTab === 'government-schemes' && (
          <motion.div
            key="government-schemes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <GovernmentSchemesView />
          </motion.div>
        )}

        {(activeTab === 'chatbot' || activeTab === 'ai-chatbot') && (
          <motion.div
            key="ai-chatbot"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <AIChatbotView />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <SettingsView
              currentUser={currentUser}
              currentLang={currentLang}
              onSelectLanguage={handleLanguageChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Tactical Overlay when triggered */}
      {activeEmergency && (
        <EmergencyTacticalDashboard
          activeEmergency={activeEmergency}
          onCloseEmergency={() => setActiveEmergency(null)}
          selectedLanguage={currentLang}
        />
      )}

      {/* Quick SOS Trigger Button (Console bottom right action) */}
      {!activeEmergency && (
        <button
          onClick={() => {
            setActiveEmergency({
              disasterType: 'Riverine Flood Surge',
              severity: 'Critical',
              confidence: 96.5,
              detectedObjects: ['Godavari Flood Ingress', 'Submerged Paddy Fields', 'Cutoff Rural Roads'],
              mitigationSteps: [
                'Mobilize NDRF 10th Battalion from Vijayawada Depot.',
                'Establish high-elevation relief corridor toward Gopalapuram Shelter.'
              ],
              location: "Gopalapuram Mandal Center, East Godavari",
              timestamp: new Date().toLocaleTimeString()
            });
          }}
          className="fixed bottom-5 right-5 z-40 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs px-3.5 py-2.5 rounded shadow-lg flex items-center gap-2 border border-red-400 transition cursor-pointer"
          id="tactical_emergency_override_btn"
        >
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>Simulate Emergency Override</span>
        </button>
      )}
    </AppShell>
  );
}
