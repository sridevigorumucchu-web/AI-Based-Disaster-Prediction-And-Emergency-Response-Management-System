import React, { useState } from 'react';
import { Building2, FileText, CheckCircle, ShieldCheck, Download, Printer, Plus } from 'lucide-react';
import PageHeader from '../console/PageHeader';
import StatusChip from '../console/StatusChip';
import DamageAssessmentSection from '../DamageAssessmentSection';
import { generateDamagePDFReport, PDFReportData } from '../DamageReportPDFGenerator';
import { useLocation } from '../../context/LocationContext';

export default function DamageAssessmentView() {
  const { currentLocation } = useLocation();
  const [activeTab, setActiveTab] = useState<'assessment' | 'pdf-generator'>('assessment');

  // PDF Report Form State
  const [reportData, setReportData] = useState<PDFReportData>({
    reportId: `NDMA-AP-${Math.floor(100000 + Math.random() * 900000)}`,
    userName: 'Duty Field Disaster Officer',
    userEmail: 'response-officer@disaster-response.gov.in',
    locationName: `${currentLocation.city || 'District Headquarters'}, ${currentLocation.district}, ${currentLocation.state}`,
    gpsCoords: `${currentLocation.latitude.toFixed(4)}° N, ${currentLocation.longitude.toFixed(4)}° E`,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    disasterType: 'Riverine Flood Surge',
    damageCategory: 'Residential & Agricultural Infrastructure',
    damageLevel: 'MODERATE',
    severity: 'Tier-2 Critical Flood Alert',
    confidence: 94.2,
    aiExplanation: 'Field observation, computer vision and satellite telemetry confirm inundation across low-lying agricultural acreage and residential structures. Structural footings remain stable but silt deposits and road washout require immediate SDRF intervention.',
    visualEvidence: ['Standing water > 1.2 meters', 'Paddy crop submergence', 'Submerged rural access culvert', 'Silt accumulation in household perimeters'],
    damagePercent: 45,
    recommendedCompensation: 175000
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      generateDamagePDFReport({
        ...reportData,
        locationName: `${currentLocation.city || 'Regional Center'}, ${currentLocation.district}, ${currentLocation.state}`,
        gpsCoords: `${currentLocation.latitude.toFixed(4)}° N, ${currentLocation.longitude.toFixed(4)}° E`,
      });
      setGeneratedSuccess(true);
      setTimeout(() => setGeneratedSuccess(false), 4000);
    } catch (e) {
      console.error('PDF generation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const recentReports = [
    { id: 'NDMA-AP-849201', location: `${currentLocation.city || 'East Godavari'}`, type: 'River Flood', damage: 'MODERATE', officer: 'Field Officer S. Rao', date: 'Today, 08:30 IST' },
    { id: 'NDMA-AP-729104', location: 'Coastal Inundation Zone', type: 'Storm Surge', damage: 'SEVERE', officer: 'R. K. Verma', date: 'Yesterday, 14:15 IST' },
    { id: 'NDMA-AP-638202', location: 'Low-Lying Canal Basin', type: 'Flash Inundation', damage: 'MINOR', officer: 'P. Lakshman', date: '12 Sep 2026' },
  ];

  return (
    <div className="space-y-5" id="damage_assessment_view">
      <PageHeader
        breadcrumbs={['Emergency Console', 'AI & Multimodal', 'Damage Assessment & PDF Reports']}
        title="Damage Assessment & Disaster Report Generation"
        subtitle="Computer Vision Structural & Agricultural Loss Analysis • NDMA Standard PDF Disaster Report Generation"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Standard: NDMA Loss Estimation Matrix</span>
            <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-[11px] font-mono text-amber-300">
              Audit Grade
            </span>
          </div>
        }
      />

      {/* Sub-tabs for Damage Assessment & PDF Report Generation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('assessment')}
          className={`px-3.5 py-1.5 rounded text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'assessment'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="tab_damage_assessment"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Structural Damage Assessment (CV)</span>
        </button>

        <button
          onClick={() => setActiveTab('pdf-generator')}
          className={`px-3.5 py-1.5 rounded text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'pdf-generator'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="tab_pdf_reports"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Official PDF Incident Report Generator</span>
        </button>
      </div>

      {activeTab === 'assessment' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden p-2 sm:p-5">
          <DamageAssessmentSection />
        </div>
      ) : (
        /* Merged PDF Disaster Report Generation Section */
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Configuration / Form */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono">Incident Metadata & Relief Audit Form</h3>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  {reportData.reportId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono mb-4">
                <div>
                  <label className="block text-slate-400 mb-1">Inspecting Officer / User</label>
                  <input
                    type="text"
                    value={reportData.userName}
                    onChange={(e) => setReportData({ ...reportData, userName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Official Email ID</label>
                  <input
                    type="email"
                    value={reportData.userEmail}
                    onChange={(e) => setReportData({ ...reportData, userEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Incident Type</label>
                  <select
                    value={reportData.disasterType}
                    onChange={(e) => setReportData({ ...reportData, disasterType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Riverine Flood Surge">Riverine Flood Surge</option>
                    <option value="Severe Cyclonic Influx">Severe Cyclonic Influx</option>
                    <option value="Urban Flash Waterlogging">Urban Flash Waterlogging</option>
                    <option value="Structural Collapse">Structural Collapse</option>
                    <option value="Industrial Fire Outbreak">Industrial Fire Outbreak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Damage Classification</label>
                  <select
                    value={reportData.damageLevel}
                    onChange={(e) => setReportData({ ...reportData, damageLevel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="MINOR">MINOR (&lt;25% loss)</option>
                    <option value="MODERATE">MODERATE (25–60% loss)</option>
                    <option value="SEVERE">SEVERE (60–90% loss)</option>
                    <option value="CRITICAL">CRITICAL / TOTAL LOSS (&gt;90%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Damage Percentage: {reportData.damagePercent}%</label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={reportData.damagePercent}
                    onChange={(e) => setReportData({ ...reportData, damagePercent: parseInt(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Recommended SDRF Relief (INR)</label>
                  <input
                    type="number"
                    value={reportData.recommendedCompensation}
                    onChange={(e) => setReportData({ ...reportData, recommendedCompensation: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="text-xs font-mono mb-4">
                <label className="block text-slate-400 mb-1">AI Field Observation & Technical Audit Notes</label>
                <textarea
                  rows={3}
                  value={reportData.aiExplanation}
                  onChange={(e) => setReportData({ ...reportData, aiExplanation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[11px] font-mono text-slate-400">
                  Location: {currentLocation.city || 'Region'}, {currentLocation.district} ({currentLocation.latitude.toFixed(2)}°, {currentLocation.longitude.toFixed(2)}°)
                </span>
                <button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  id="btn_download_official_pdf"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGenerating ? 'Rendering PDF...' : 'Download Official PDF'}</span>
                </button>
              </div>

              {generatedSuccess && (
                <div className="mt-3 p-2.5 rounded bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 font-mono">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PDF successfully compiled and downloaded to your local device.</span>
                </div>
              )}
            </div>

            {/* Right: PDF Preview & Archive */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Official NDMA/SDMA Verification
                </h4>
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">DOCUMENT TEMPLATE</span>
                    <span className="font-semibold text-slate-200">NDMA Form 7-A (Disaster Damage Audit)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">VERIFIED JURISDICTION</span>
                    <span className="text-cyan-300">{currentLocation.district}, {currentLocation.state}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">LEGAL ADMISSIBILITY</span>
                    <span className="text-emerald-300">Approved for SDRF Sec 12 direct bank transfer</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-3">
                  Recent Incident Reports
                </h4>
                <div className="space-y-2">
                  {recentReports.map(r => (
                    <div key={r.id} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{r.id}</span>
                        <StatusChip status={r.damage} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{r.location} • {r.type}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{r.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

