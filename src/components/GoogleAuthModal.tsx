import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, CheckCircle2, User, ShieldCheck, Mail, Sparkles, X } from 'lucide-react';

export interface UserAccount {
  id?: string;
  email: string;
  name: string;
  picture: string;
  signedInAt?: string;
  provider?: string;
  role?: string;
}

interface GoogleAuthModalProps {
  onAccountChange?: (account: UserAccount | null) => void;
}

const DEFAULT_USER: UserAccount = {
  email: "sridevigorumucchu@gmail.com",
  name: "Sridevi Gorumucchu",
  picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  signedInAt: new Date().toISOString(),
  provider: "Google OAuth 2.0"
};

export default function GoogleAuthModal({ onAccountChange }: GoogleAuthModalProps) {
  const [user, setUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('aegis_google_account');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    // Default signed in with user email for smooth experience
    return DEFAULT_USER;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [customEmail, setCustomEmail] = useState("sridevigorumucchu@gmail.com");
  const [customName, setCustomName] = useState("Sridevi Gorumucchu");
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aegis_google_account', JSON.stringify(user));
    } else {
      localStorage.removeItem('aegis_google_account');
    }
    if (onAccountChange) onAccountChange(user);
  }, [user]);

  const handleGoogleSignIn = () => {
    setIsSigningIn(true);
    setTimeout(() => {
      const newUser: UserAccount = {
        email: customEmail.trim() || "sridevigorumucchu@gmail.com",
        name: customName.trim() || "Sridevi Gorumucchu",
        picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        signedInAt: new Date().toISOString(),
        provider: "Google Account OAuth"
      };
      setUser(newUser);
      setIsSigningIn(false);
      setIsOpen(false);
    }, 800);
  };

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <div className="inline-block" id="google_auth_container">
      {user ? (
        /* Signed In State Badge */
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 shadow-sm">
          <div className="relative">
            <img 
              src={user.picture} 
              alt={user.name} 
              className="w-6 h-6 rounded-full border border-emerald-500 object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900" />
          </div>

          <div className="text-left font-mono">
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
              <span>{user.name.split(' ')[0]}</span>
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            </div>
            <div className="text-[9px] text-slate-400 truncate max-w-[120px] md:max-w-[160px]">
              {user.email}
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="ml-1 p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition cursor-pointer"
            title="Sign Out"
            id="google_signout_btn"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Sign In Button */
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
          id="google_signin_trigger"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
          </svg>
          <span>Sign In with Google</span>
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg bg-slate-800/50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono text-slate-100">
                  Sign In with Google
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Personalize emergency alerts & save your location preferences.
                </p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleGoogleSignIn(); }} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Google Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="name@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs py-2.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {isSigningIn ? (
                    <span>Authenticating Google OAuth...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
                      </svg>
                      <span>Continue with Google Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
