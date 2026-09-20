import React, { useState } from 'react';
import { 
  Landmark, 
  Search, 
  ExternalLink, 
  CheckCircle, 
  FileText, 
  ShieldCheck, 
  Building, 
  Coins, 
  HelpCircle,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import PageHeader from '../console/PageHeader';
import StatusChip from '../console/StatusChip';
import MetricCard from '../console/MetricCard';

export default function GovernmentSchemesView() {
  const [activeTab, setActiveTab] = useState<'schemes' | 'advisories'>('schemes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisaster, setSelectedDisaster] = useState('ALL');

  const schemes = [
    {
      id: 'sdrf-01',
      name: 'State Disaster Response Fund (SDRF)',
      authority: 'Disaster Management Division, Ministry of Home Affairs / AP SDMA',
      disasterType: 'Flood, Cyclone, Drought, Earthquake, Fire',
      scope: 'Statewide (Andhra Pradesh & all States)',
      eligibility: 'Loss of life (₹4.0 Lakh), grievous injury (₹40,000 - ₹2.0 Lakh), housing destruction (up to ₹1.2 Lakh), agricultural input subsidy (>33% loss).',
      officialUrl: 'https://ndma.gov.in/Governance/Guidelines/SDRF',
      status: 'Active',
      sanctionSpeed: 'Immediate 48h Direct Benefit Transfer (DBT)',
    },
    {
      id: 'ndrf-02',
      name: 'National Disaster Response Fund (NDRF)',
      authority: 'National Disaster Management Authority (NDMA), Govt of India',
      disasterType: 'Severe Calamity Beyond State Resources',
      scope: 'National Emergency Augmentation',
      eligibility: 'Inter-ministerial central team (IMCT) verified loss when SDRF state allocation is exhausted during severe inundation or cyclone.',
      officialUrl: 'https://ndma.gov.in',
      status: 'Active',
      sanctionSpeed: 'Central Cabinet Sanction',
    },
    {
      id: 'pmnrf-03',
      name: 'Prime Minister’s National Relief Fund (PMNRF)',
      authority: 'Prime Minister’s Office (PMO), New Delhi',
      disasterType: 'Natural Calamities, Floods, Cyclones, Major Accidents',
      scope: 'All-India Coverage',
      eligibility: 'Ex-gratia relief of ₹2,00,000 to next of kin of deceased; ₹50,000 to seriously injured persons in declared disaster incidents.',
      officialUrl: 'https://pmnrf.gov.in',
      status: 'Active',
      sanctionSpeed: 'Expedited Direct Transfer',
    },
    {
      id: 'pmfby-04',
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      authority: 'Ministry of Agriculture & Farmers Welfare',
      disasterType: 'Inundation, Cyclone, Drought, Hailstorm, Pest Attack',
      scope: 'All Enrolled Farmers (Sharecroppers & Tenant Farmers Included)',
      eligibility: 'Post-harvest losses up to 14 days and localized standing crop inundation verified via satellite telemetry and crop cutting experiments (CCE).',
      officialUrl: 'https://pmfby.gov.in',
      status: 'Active',
      sanctionSpeed: 'Direct Aadhaar-Linked DBT',
    },
    {
      id: 'ysr-05',
      name: 'YSR Rythu Bharosa & Natural Calamity Compensation',
      authority: 'Department of Agriculture, Government of Andhra Pradesh',
      disasterType: 'Godavari Basin Floods, Drought, Saline Ingress',
      scope: 'Andhra Pradesh Statewide',
      eligibility: 'Input subsidy for submerged paddy and horticulture crops at ₹10,000 per hectare in Godavari and Krishna delta districts.',
      officialUrl: 'https://ysrrythubharosa.ap.gov.in',
      status: 'Active',
      sanctionSpeed: 'State Disaster Treasury Verification',
    },
    {
      id: 'pmay-06',
      name: 'PMAY - Gramin Disaster Reconstruction Grant',
      authority: 'Ministry of Rural Development, Govt of India',
      disasterType: 'Complete House Washout / Foundation Collapse',
      scope: 'Rural Inundation Victims',
      eligibility: '₹1,30,000 pucca house reconstruction financial assistance for verified fully damaged houses with geo-tagged photographic evidence.',
      officialUrl: 'https://pmayg.nic.in',
      status: 'Active',
      sanctionSpeed: 'Phased Construction Milestones',
    },
    {
      id: 'ncrmp-07',
      name: 'National Cyclone Risk Mitigation Project (NCRMP)',
      authority: 'NDMA & World Bank Partnership',
      disasterType: 'Coastal Cyclones & Storm Surge Inundation',
      scope: 'Coastal Andhra Pradesh & Odisha Corridors',
      eligibility: 'Access to Multi-Purpose Cyclone Shelters (MPCS), saline embankment restoration, and early warning disseminations.',
      officialUrl: 'https://ncrmp.gov.in',
      status: 'Active',
      sanctionSpeed: 'Infrastructure & Evacuation Free Access',
    }
  ];

  const filteredSchemes = schemes.filter(s => {
    const matchesSearch = !searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.disasterType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.eligibility.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDisaster = selectedDisaster === 'ALL' || s.disasterType.toLowerCase().includes(selectedDisaster.toLowerCase());
    return matchesSearch && matchesDisaster;
  });

  return (
    <div className="space-y-5" id="government_schemes_view">
      <PageHeader
        breadcrumbs={['Emergency Console', 'Governance & System', 'Government Schemes']}
        title="Official Disaster Relief & Compensation Programs"
        subtitle="Searchable Directory of Verified State and National Disaster Relief Schemes (NDRF, SDRF, PMNRF, PMFBY, YSR Rythu Bharosa)"
        actions={
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
            <button
              onClick={() => setActiveTab('schemes')}
              className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer ${
                activeTab === 'schemes'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Relief Schemes Directory
            </button>
            <button
              onClick={() => setActiveTab('advisories')}
              className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer ${
                activeTab === 'advisories'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Eligibility & Documents Checklist
            </button>
          </div>
        }
      />

      {activeTab === 'schemes' ? (
        <>
          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              title="Verified Schemes"
              value={schemes.length}
              subtitle="Statutory relief funds"
              icon={Landmark}
            />
            <MetricCard
              title="State Focus"
              value="Andhra Pradesh"
              subtitle="Godavari Delta priority"
              icon={Building}
            />
            <MetricCard
              title="Direct Benefit"
              value="Aadhaar DBT"
              subtitle="Zero intermediary leakage"
              statusBadge={<StatusChip status="SUCCESS" label="DBT Verified" />}
            />
            <MetricCard
              title="SDRF Corpus"
              value="₹1,480 Cr"
              subtitle="Annual state allocation"
              icon={Coins}
            />
          </div>

          {/* Search & Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scheme name, eligibility, crop or flood keywords..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1 text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Disaster Category:</span>
              {['ALL', 'Flood', 'Cyclone', 'Drought', 'Reconstruction'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedDisaster(cat)}
                  className={`px-2.5 py-1 rounded text-xs transition ${
                    selectedDisaster === cat
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Schemes Directory Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                Statutory Relief & Compensation Programs ({filteredSchemes.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Verified against Official Gazette Guidelines
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Program Name & Authority</th>
                    <th className="p-3">Covered Hazards</th>
                    <th className="p-3">Jurisdiction</th>
                    <th className="p-3">Statutory Eligibility & Scale</th>
                    <th className="p-3">Disbursement</th>
                    <th className="p-3">Official Portal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredSchemes.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-850 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-100 text-xs">{s.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{s.authority}</div>
                      </td>
                      <td className="p-3 font-mono text-cyan-300 text-[11px]">
                        {s.disasterType}
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">
                        {s.scope}
                      </td>
                      <td className="p-3 max-w-xs text-slate-300 text-[11px] leading-relaxed">
                        {s.eligibility}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <StatusChip status="SUCCESS" label={s.sanctionSpeed} size="sm" />
                      </td>
                      <td className="p-3">
                        <a
                          href={s.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-mono text-[11px]"
                        >
                          <span>Apply / Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Statutory Advisories & Documentation Checklist */
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-bold text-slate-100 font-mono mb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Mandatory Documents for SDRF / NDRF Direct Relief Transfer</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              All claims must be submitted to the Mandal Revenue Officer (MRO) / Tahsildar or via the Grama/Ward Sachivalayam portal within 30 days of disaster notification.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-300 font-mono block">1. Identification & Banking</span>
                <ul className="text-xs font-mono text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Aadhaar Card (linked to NPCI bank account for DBT)</li>
                  <li>Ration Card / Rice Card (for household head verification)</li>
                  <li>Bank Passbook copy showing IFSC & Account number</li>
                  <li>Active mobile number registered with Aadhaar OTP</li>
                </ul>
              </div>

              <div className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-300 font-mono block">2. Loss & Physical Verification</span>
                <ul className="text-xs font-mono text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Geo-tagged photos of damaged property / submerged crops</li>
                  <li>Pattadar Passbook / 1-B Namuna (for farmers & crop compensation)</li>
                  <li>Verification certificate signed by Village Revenue Officer (VRO)</li>
                  <li>AI-Based Disaster Prediction & Emergency Response Damage Audit PDF Report</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-bold text-slate-100 font-mono mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Government Helplines & Portals</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">AP SDMA STATE CONTROL ROOM</span>
                <span className="text-slate-200 font-bold block mt-1">1070 / 112 (Toll Free)</span>
                <span className="text-[11px] text-cyan-400 mt-1 block">apsdma.ap.gov.in</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">NDMA NATIONAL EMERGENCY</span>
                <span className="text-slate-200 font-bold block mt-1">1078 (Disaster Helpline)</span>
                <span className="text-[11px] text-cyan-400 mt-1 block">ndma.gov.in</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">EAST GODAVARI DISTRICT EOC</span>
                <span className="text-slate-200 font-bold block mt-1">0883-2442344</span>
                <span className="text-[11px] text-cyan-400 mt-1 block">Collectorate Emergency Desk</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
