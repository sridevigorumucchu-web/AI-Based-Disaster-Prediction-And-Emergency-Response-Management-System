import React from 'react';
import { Navigation, MapPin, Compass, ShieldCheck, Activity } from 'lucide-react';
import PageHeader from '../console/PageHeader';
import InteractiveMap from '../InteractiveMap';
import { PathNode, PathEdge, RiskLevel } from '../../types';

interface EvacuationViewProps {
  nodes: PathNode[];
  edges: PathEdge[];
  riskLevels: Record<string, RiskLevel>;
  onToggleBlock?: (edgeId: string) => void;
  selectedStartNode: string;
  setSelectedStartNode: (id: string) => void;
  selectedGoalNode: string;
  setSelectedGoalNode: (id: string) => void;
}

export default function EvacuationView({
  nodes,
  edges,
  riskLevels,
  onToggleBlock,
  selectedStartNode,
  setSelectedStartNode,
  selectedGoalNode,
  setSelectedGoalNode
}: EvacuationViewProps) {
  return (
    <div className="space-y-5" id="evacuation_view">
      <PageHeader
        breadcrumbs={['Emergency Console', 'Response & Rescue', 'A* Evacuation Planner']}
        title="A* Dynamic Evacuation Pathfinding"
        subtitle="Optimized Routing through Verified High-Ground Corridors while Circumventing Flooded Arteries and Collapsed Bridges"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Target Region: Andhra Pradesh Godavari Basin</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[11px] font-mono text-emerald-300">
              Heuristic Engine Active
            </span>
          </div>
        }
      />

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden p-2 sm:p-4">
        <InteractiveMap
          nodes={nodes}
          edges={edges}
          riskLevels={riskLevels}
          onToggleBlock={onToggleBlock}
          selectedStartNode={selectedStartNode}
          setSelectedStartNode={setSelectedStartNode}
          selectedGoalNode={selectedGoalNode}
          setSelectedGoalNode={setSelectedGoalNode}
        />
      </div>
    </div>
  );
}
