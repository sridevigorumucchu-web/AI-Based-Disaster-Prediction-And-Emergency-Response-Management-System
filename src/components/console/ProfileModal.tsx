import React from 'react';
import { X, User, Mail, Shield, CheckCircle, LogOut, Building, Calendar, Globe } from 'lucide-react';
import { UserAccount } from '../GoogleAuthModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  onLogout
}: ProfileModalProps) {
  if (!isOpen) return null;

  const email = currentUser?.email || 'sridevigorumucchu@gmail.com';
  const name = currentUser?.name || 'Sridevi Gorumucchu';
  const role = currentUser?.role || 'Emergency Operations Director';
  const avatar = currentUser?.picture;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <h2 className="text-sm font-semibold text-slate-100">
            Google Developer Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full border-2 border-cyan-500/50 object-cover shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 border-2 border-cyan-400 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-slate-100">{name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{email}</p>
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/80 text-[10px] font-mono text-cyan-300 uppercase font-semibold">
                <Shield className="w-3 h-3" />
                {role}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                Jurisdiction
              </span>
              <span className="text-slate-200 font-medium">Andhra Pradesh / India</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                Command Node
              </span>
              <span className="text-slate-200 font-medium">Gopalapuram Operations Center</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Security Clearance
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">Level 4 (Disaster Incident Commander)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Active Session
              </span>
              <span className="text-slate-200 font-mono text-[11px]">Verified OAuth 2.0 Token</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded text-xs font-medium flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
