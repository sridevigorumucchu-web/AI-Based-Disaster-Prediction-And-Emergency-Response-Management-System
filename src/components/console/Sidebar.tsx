import React from 'react';
import {
  LayoutDashboard,
  CloudRain,
  Cpu,
  MapPin,
  Sparkles,
  Building,
  FileText,
  ShieldAlert,
  Home,
  Navigation,
  Bell,
  Landmark,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio
} from 'lucide-react';

export type NavTabId =
  | 'dashboard'
  | 'weather-prediction'
  | 'weather'
  | 'prediction'
  | 'ai-analyzer'
  | 'damage-assessment'
  | 'pdf-reports'
  | 'emergency'
  | 'shelters'
  | 'evacuation'
  | 'alerts'
  | 'government-schemes'
  | 'chatbot'
  | 'settings';

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'danger' | 'warning' | 'info';
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeSosCount: number;
  activeAlertsCount: number;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  activeSosCount,
  activeAlertsCount
}: SidebarProps) {
  const groups: NavGroup[] = [
    {
      title: 'Real-Time Monitoring',
      items: [
        { id: 'dashboard', label: 'Dashboard & Telemetry', icon: LayoutDashboard },
        { id: 'weather-prediction', label: 'Weather & Prediction', icon: CloudRain },
        { 
          id: 'alerts', 
          label: 'Active Alerts & Warnings', 
          icon: Bell, 
          badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
          badgeType: 'warning'
        }
      ]
    },
    {
      title: 'AI Multimodal Intelligence',
      items: [
        { id: 'ai-analyzer', label: 'AI Disaster Analyzer', icon: Sparkles },
        { id: 'damage-assessment', label: 'Damage & PDF Reports', icon: Building },
        { id: 'chatbot', label: 'Emergency Assistant AI', icon: MessageSquare }
      ]
    },
    {
      title: 'Emergency Response & Rescue',
      items: [
        { 
          id: 'emergency', 
          label: 'Emergency SOS & Dispatch', 
          icon: ShieldAlert, 
          badge: activeSosCount > 0 ? activeSosCount : undefined,
          badgeType: 'danger'
        },
        { id: 'shelters', label: 'Verified Safe Shelters', icon: Home },
        { id: 'evacuation', label: 'A* Evacuation Route', icon: Navigation }
      ]
    },
    {
      title: 'Governance & Operations',
      items: [
        { id: 'government-schemes', label: 'Relief Schemes & SDRF', icon: Landmark },
        { id: 'settings', label: 'System Configuration', icon: Settings }
      ]
    }
  ];

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-200 select-none z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      id="console_sidebar"
    >
      {/* Scrollable Navigation Items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {groups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                let badgeClass = 'bg-slate-800 text-slate-300';
                if (item.badgeType === 'danger') badgeClass = 'bg-red-950 text-red-400 border border-red-800';
                else if (item.badgeType === 'warning') badgeClass = 'bg-amber-950 text-amber-400 border border-amber-800';

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-sans font-medium transition group ${
                      isActive
                        ? 'bg-slate-850 text-cyan-400 border-l-2 border-cyan-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-l-2 border-transparent'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                    id={`nav_${item.id}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />

                    {!collapsed && (
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                    )}

                    {!collapsed && item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${badgeClass}`}>
                        {item.badge}
                      </span>
                    )}

                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer with Collapse Toggle */}
      <div className="p-2 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 text-[11px] text-slate-400 font-mono">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Telemetry Live</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition ${
            collapsed ? 'mx-auto' : ''
          }`}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          id="sidebar_collapse_btn"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
