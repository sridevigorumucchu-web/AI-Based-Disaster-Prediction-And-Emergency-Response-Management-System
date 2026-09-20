import React from 'react';
import { ChevronRight, RefreshCw } from 'lucide-react';

interface PageHeaderProps {
  breadcrumbs: string[];
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  actions,
  onRefresh,
  isRefreshing
}: PageHeaderProps) {
  return (
    <div className="border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mb-1">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb}>
              <span className={i === breadcrumbs.length - 1 ? 'text-slate-300 font-medium' : 'hover:text-slate-400 cursor-pointer'}>
                {crumb}
              </span>
              {i < breadcrumbs.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-600" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-xl font-bold font-display text-slate-100 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans">
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-mono text-slate-300 hover:text-slate-100 disabled:opacity-50 transition"
            title="Refresh Data"
            id="page_header_refresh_btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span>Sync</span>
          </button>
        )}
        {actions}
      </div>
    </div>
  );
}
