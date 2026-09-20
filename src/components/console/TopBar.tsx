import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Bell, 
  HelpCircle, 
  Globe, 
  ChevronDown, 
  LogOut, 
  User, 
  ExternalLink, 
  Check, 
  AlertTriangle,
  Radio,
  Clock,
  MapPin,
  Menu,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../GoogleAuthModal';
import { SystemAlert } from '../../types';

interface TopBarProps {
  currentUser: UserAccount | null;
  onOpenProfile: () => void;
  onOpenHelp: () => void;
  onSelectLanguage: (lang: string) => void;
  currentLang: string;
  alerts: SystemAlert[];
  onNavigate: (tab: string) => void;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function TopBar({
  currentUser,
  onOpenProfile,
  onOpenHelp,
  onSelectLanguage,
  currentLang,
  alerts,
  onNavigate,
  onToggleSidebar,
  searchQuery,
  onSearchChange
}: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
  ];

  const currentLangObj = languages.find(l => l.code === currentLang) || languages[0];

  const userName = currentUser?.name || 'Sridevi Gorumucchu';
  const userEmail = currentUser?.email || 'sridevigorumucchu@gmail.com';
  const userRole = currentUser?.role || 'Emergency Operations Director';

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between gap-2 z-30 sticky top-0">
      {/* Left: Sidebar toggle + Logo + Title + Status */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition"
          id="topbar_menu_btn"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="w-7 h-7 rounded bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 group-hover:border-cyan-600 transition">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="hidden sm:block" title="AI-Based Disaster Prediction and Emergency Response Management System">
            <span className="font-display font-bold text-xs lg:text-sm tracking-tight text-slate-100 flex items-center gap-1.5 whitespace-nowrap">
              AI-Based Disaster Prediction & Emergency Response <span className="text-cyan-400 font-mono text-[10px] uppercase px-1 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">System</span>
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>India Operations</span>
        </div>
      </div>

      {/* Middle: Global Search Input */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search districts, shelters, alerts, telemetry..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-600 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 font-sans focus:outline-none transition"
            id="global_search_input"
          />
        </div>
      </div>

      {/* Right Actions: SOS + Notifs + Language + Help + User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Emergency SOS button */}
        <button
          onClick={() => onNavigate('emergency')}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/70 hover:bg-red-900 border border-red-800/80 text-red-300 text-xs font-mono font-semibold transition"
          id="topbar_sos_btn"
        >
          <Radio className="w-3 h-3 text-red-400 animate-pulse" />
          <span>SOS Command</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 relative transition"
            title="System Alerts & Bulletins"
            id="topbar_notifications_btn"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-slate-950">
                {alerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-50 text-xs">
              <div className="px-3 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Active Weather & Hazard Alerts ({alerts.length})
                </span>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('alerts');
                  }}
                  className="text-cyan-400 hover:underline text-[11px] font-mono"
                >
                  View All
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 font-mono">
                    No active emergency alerts recorded.
                  </div>
                ) : (
                  alerts.map((al) => (
                    <div 
                      key={al.id} 
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('alerts');
                      }}
                      className="p-3 hover:bg-slate-850 cursor-pointer transition"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-slate-200 truncate">{al.title}</span>
                        <span className="px-1.5 py-0.2 rounded bg-red-950/60 border border-red-800/80 text-[10px] font-mono text-red-300">
                          {al.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 line-clamp-2 text-[11px]">{al.message}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{al.location}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-slate-300 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 text-xs font-mono transition"
            title="Change Language"
            id="topbar_language_btn"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{currentLangObj.label}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 z-50 text-xs font-mono">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    onSelectLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 transition ${
                    currentLang === l.code ? 'text-cyan-400 bg-slate-850 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span>{l.label} ({l.native})</span>
                  {currentLang === l.code && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition"
          title="Console Guidelines & Helpline Directory"
          id="topbar_help_btn"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Google User Profile */}
        <div className="relative ml-1" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
            id="topbar_profile_btn"
          >
            {currentUser?.picture ? (
              <img
                src={currentUser.picture}
                alt={userName}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full border border-cyan-500/60 object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-cyan-900/80 border border-cyan-700/80 flex items-center justify-center text-xs font-bold text-cyan-200">
                {userName.charAt(0)}
              </div>
            )}
            <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="font-semibold text-slate-100 truncate">{userName}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{userEmail}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 text-[10px] font-mono text-cyan-300">
                  {userRole}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenProfile();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-300 flex items-center gap-2 transition"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                View Account Details
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('settings');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-300 flex items-center gap-2 transition"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Console Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
