import React from 'react';

export type StatusType = 
  | 'LOW' 
  | 'MODERATE' 
  | 'HIGH' 
  | 'CRITICAL' 
  | 'UNKNOWN' 
  | 'SUCCESS' 
  | 'WARNING' 
  | 'DANGER' 
  | 'INFO' 
  | 'NEUTRAL'
  | 'OPEN'
  | 'FULL'
  | 'CLOSED'
  | 'DISPATCHED'
  | 'PENDING'
  | 'RESOLVED';

interface StatusChipProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
  pulse?: boolean;
}

export default function StatusChip({
  status,
  label,
  size = 'md',
  className = '',
  pulse = false
}: StatusChipProps) {
  const norm = (status || 'UNKNOWN').toUpperCase();

  let bg = 'bg-slate-800/80';
  let border = 'border-slate-700';
  let text = 'text-slate-300';
  let dot = 'bg-slate-400';

  if (norm === 'LOW' || norm === 'SUCCESS' || norm === 'OPEN' || norm === 'RESOLVED' || norm === 'SAFE') {
    bg = 'bg-emerald-950/50';
    border = 'border-emerald-800/60';
    text = 'text-emerald-300';
    dot = 'bg-emerald-400';
  } else if (norm === 'MODERATE' || norm === 'WARNING' || norm === 'DISPATCHED' || norm === 'MEDIUM') {
    bg = 'bg-amber-950/50';
    border = 'border-amber-800/60';
    text = 'text-amber-300';
    dot = 'bg-amber-400';
  } else if (norm === 'HIGH' || norm === 'PENDING') {
    bg = 'bg-orange-950/50';
    border = 'border-orange-800/60';
    text = 'text-orange-300';
    dot = 'bg-orange-400';
  } else if (norm === 'CRITICAL' || norm === 'DANGER' || norm === 'FULL' || norm === 'DESTROYED' || norm === 'SEVERE') {
    bg = 'bg-red-950/60';
    border = 'border-red-800/70';
    text = 'text-red-300';
    dot = 'bg-red-400';
  } else if (norm === 'INFO' || norm === 'ACTIVE') {
    bg = 'bg-blue-950/50';
    border = 'border-blue-800/60';
    text = 'text-blue-300';
    dot = 'bg-blue-400';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border ${bg} ${border} ${text} ${padding} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{label || status}</span>
    </span>
  );
}
