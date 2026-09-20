import React, { useState } from 'react';
import { Sparkles, Video, Image as ImageIcon, Cpu, CheckCircle, ShieldAlert } from 'lucide-react';
import PageHeader from '../console/PageHeader';
import DisasterVideoAnalyzer from '../DisasterVideoAnalyzer';

interface AIAnalyzerViewProps {
  onTriggerEmergency?: (data: any) => void;
}

export default function AIAnalyzerView({ onTriggerEmergency }: AIAnalyzerViewProps) {
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'image'>('video');

  return (
    <div className="space-y-5" id="ai_analyzer_view">
      <PageHeader
        breadcrumbs={['Emergency Console', 'AI & Multimodal', 'AI Disaster Analyzer']}
        title="Multimodal Computer Vision Disaster Analyzer"
        subtitle="Automatic classification of Fire, Flood, Cyclone, Landslide, and Structural Collapses with server-side resilient inference"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Primary Engine: gemini-3.6-flash</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[11px] font-mono text-emerald-300">
              Zero-Quota Failure Fallback
            </span>
          </div>
        }
      />

      {/* Embedded High-Precision Multimodal Video & Image Analyzer */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden p-2 sm:p-4">
        <DisasterVideoAnalyzer onEmergencyTrigger={onTriggerEmergency} />
      </div>
    </div>
  );
}
