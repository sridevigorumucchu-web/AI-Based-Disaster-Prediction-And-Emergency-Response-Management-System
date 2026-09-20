import React, { useState } from 'react';
import TopBar from './TopBar';
import Sidebar, { NavTabId } from './Sidebar';
import HelpModal from './HelpModal';
import ProfileModal from './ProfileModal';
import { UserAccount } from '../GoogleAuthModal';
import { SystemAlert } from '../../types';

interface AppShellProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  currentLang: string;
  onSelectLanguage: (lang: string) => void;
  alerts: SystemAlert[];
  activeSosCount: number;
  children: React.ReactNode;
}

export default function AppShell({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  currentLang,
  onSelectLanguage,
  alerts,
  activeSosCount,
  children
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const q = query.toLowerCase().trim();
    if (q.includes('weather') || q.includes('rain') || q.includes('temp')) {
      onSelectTab('weather');
    } else if (q.includes('shelter') || q.includes('camp')) {
      onSelectTab('shelters');
    } else if (q.includes('alert') || q.includes('warning') || q.includes('bulletin')) {
      onSelectTab('alerts');
    } else if (q.includes('sos') || q.includes('emergency') || q.includes('rescue')) {
      onSelectTab('emergency');
    } else if (q.includes('route') || q.includes('evac') || q.includes('map')) {
      onSelectTab('evacuation');
    } else if (q.includes('scheme') || q.includes('relief') || q.includes('sdrf') || q.includes('ndrf')) {
      onSelectTab('government-schemes');
    } else if (q.includes('damage') || q.includes('audit')) {
      onSelectTab('damage-assessment');
    } else if (q.includes('pdf') || q.includes('report')) {
      onSelectTab('pdf-reports');
    } else if (q.includes('ai') || q.includes('video') || q.includes('image')) {
      onSelectTab('ai-analyzer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Application Bar */}
      <TopBar
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onSelectLanguage={onSelectLanguage}
        currentLang={currentLang}
        alerts={alerts}
        onNavigate={(tab) => onSelectTab(tab as NavTabId)}
        onToggleSidebar={() => setCollapsed(!collapsed)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Main Body with Left Sidebar + Scrollable Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Console Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          activeSosCount={activeSosCount}
          activeAlertsCount={alerts.length}
        />

        {/* Center Main Content Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-950 px-3 sm:px-6 py-4 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Technical Reference & Helplines Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Google User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLogout={onLogout}
      />
    </div>
  );
}
