import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  statusBadge?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  onClick?: () => void;
  className?: string;
  id?: string;
}

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  statusBadge,
  trend,
  onClick,
  className = '',
  id
}: MetricCardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 rounded-lg p-4 transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-850' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-slate-400 font-sans tracking-wide uppercase">
          {title}
        </span>
        {statusBadge ? (
          statusBadge
        ) : Icon ? (
          <div className="w-7 h-7 rounded bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
            <Icon className="w-3.5 h-3.5" />
          </div>
        ) : null}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-slate-400 font-medium">
            {unit}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          {trend && (
            <span
              className={`font-mono text-[11px] font-semibold ${
                trend.isNeutral
                  ? 'text-slate-400'
                  : trend.isPositive
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="truncate text-slate-400 text-[11px]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
