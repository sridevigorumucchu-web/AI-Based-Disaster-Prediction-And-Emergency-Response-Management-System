import React from 'react';
import { MessageSquare, Bot, Sparkles } from 'lucide-react';
import PageHeader from '../console/PageHeader';
import AIChatbot from '../AIChatbot';

export default function AIChatbotView() {
  return (
    <div className="space-y-5" id="ai_chatbot_view">
      <PageHeader
        breadcrumbs={['Emergency Console', 'AI & Multimodal', 'Disaster AI Assistant']}
        title="Disaster Preparedness & Response Conversational AI"
        subtitle="Conversational guidance for evacuation instructions, flood safety, SDRF compensation procedures, and first-aid triage in English, Telugu, and Hindi"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Model: Gemini Multilingual Grounded</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[11px] font-mono text-cyan-300">
              NDMA SOP Grounded
            </span>
          </div>
        }
      />

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden p-2 sm:p-4">
        <AIChatbot />
      </div>
    </div>
  );
}
