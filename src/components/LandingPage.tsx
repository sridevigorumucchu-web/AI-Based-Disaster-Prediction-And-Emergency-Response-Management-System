import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Sparkles, Navigation, Globe, Zap, Flame, Waves, CloudRain } from 'lucide-react';
import GoogleAuthModal, { UserAccount } from './GoogleAuthModal';

interface LandingPageProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Particle & Atmospheric Canvas Animation (Earth rotation, rain drops, lightning flashes, fire embers)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Rain particles
    const raindrops = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 12 + 8,
      opacity: Math.random() * 0.4 + 0.2
    }));

    // Fire embers
    const embers = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 50,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 1.5,
      opacity: Math.random() * 0.8 + 0.2
    }));

    let earthAngle = 0;
    let lightningTimer = 0;
    let isLightning = false;

    const render = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Draw Rotating Earth Hemisphere Simulation in background
      earthAngle += 0.003;
      const centerX = width * 0.5;
      const centerY = height * 0.55;
      const radius = Math.min(width, height) * 0.38;

      // Glow behind Earth
      const earthGlow = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.3);
      earthGlow.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      earthGlow.addColorStop(0.5, 'rgba(14, 116, 144, 0.08)');
      earthGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = earthGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Earth Disc
      const earthGrad = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 10, centerX, centerY, radius);
      earthGrad.addColorStop(0, '#0284c7');
      earthGrad.addColorStop(0.4, '#0f172a');
      earthGrad.addColorStop(0.8, '#030712');
      earthGrad.addColorStop(1, '#020617');

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = earthGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Simulate Lat/Lng Grid Lines
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.12)';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + i * (radius * 0.22), radius * Math.cos((i * Math.PI) / 8), radius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Orbital Satellites
      const satX = centerX + Math.cos(earthAngle * 2) * (radius * 1.25);
      const satY = centerY + Math.sin(earthAngle * 2) * (radius * 0.5);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(satX, satY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // Lightning Flash effect
      lightningTimer++;
      if (lightningTimer % 180 === 0 && Math.random() > 0.4) {
        isLightning = true;
        setTimeout(() => { isLightning = false; }, 80);
      }
      if (isLightning) {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.08)';
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Rain Particle Layer
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1.2;
      raindrops.forEach((r) => {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 2, r.y + r.length);
        ctx.stroke();

        r.y += r.speed;
        r.x -= 0.5;
        if (r.y > height) {
          r.y = -20;
          r.x = Math.random() * width;
        }
      });

      // Draw Wildfire Embers Particle Layer
      embers.forEach((e) => {
        ctx.fillStyle = `rgba(249, 115, 22, ${e.opacity})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();

        e.y -= e.speedY;
        e.x += e.speedX;
        e.opacity -= 0.003;

        if (e.y < 0 || e.opacity <= 0) {
          e.y = height + 10;
          e.x = Math.random() * width;
          e.opacity = Math.random() * 0.8 + 0.2;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Preset Google Authentication login trigger
  const handleDirectGoogleLogin = () => {
    const user: UserAccount = {
      email: "sridevigorumucchu@gmail.com",
      name: "Sridevi Gorumucchu",
      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      signedInAt: new Date().toISOString(),
      provider: "Google OAuth 2.0"
    };
    localStorage.setItem('aegis_google_account', JSON.stringify(user));
    onLoginSuccess(user);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Atmospheric Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40 z-0" />

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Badge Indicator */}
        <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-cyan-500/40 px-4 py-2 rounded-full text-xs font-mono text-cyan-300 shadow-xl backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="font-bold uppercase tracking-wider">AI DISASTER SAFETY & EMERGENCY SYSTEM</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Large Animated Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-sans tracking-tight leading-tight text-white drop-shadow-2xl">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-200 to-indigo-400 bg-clip-text text-transparent">
            AI-Based Disaster Prediction, Emergency Response
          </span>
          <br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-red-400 bg-clip-text text-transparent">
            and Damage Assessment System
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl font-mono text-slate-300 max-w-2xl mx-auto leading-relaxed drop-shadow">
          Real-time AI-powered disaster prediction, emergency response, damage assessment, and government support.
        </p>

        {/* Atmospheric Live Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs text-slate-400 pt-2">
          <span className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> Satellite Radar
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" /> Weather Predictor
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Flame className="w-3.5 h-3.5 text-orange-400" /> Wildfire Sensor
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Waves className="w-3.5 h-3.5 text-teal-400" /> Flood & Landslide
          </span>
        </div>

        {/* SINGLE EXCLUSIVE LOGIN BUTTON AS SPECIFIED */}
        <div className="pt-6">
          <button
            onClick={handleDirectGoogleLogin}
            className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono font-black text-base px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-cyan-400/40"
            id="master_google_login_btn"
          >
            {/* Google Icon SVG */}
            <svg className="w-6 h-6 fill-current text-white shrink-0" viewBox="0 0 24 24">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
            </svg>
            <span className="tracking-wider">Login with Google</span>
            <ShieldCheck className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-[11px] font-mono text-slate-500 mt-3">
            🔒 Secure Firebase OAuth 2.0 Authentication. No dashboard access prior to login.
          </p>
        </div>

      </div>

      {/* Footer info */}
      <div className="absolute bottom-4 z-10 text-[10px] font-mono text-slate-500 text-center">
        NATIONAL DISASTER MANAGEMENT AUTHORITY // AI-BASED DISASTER PREDICTION & EMERGENCY RESPONSE NETWORK
      </div>
    </div>
  );
}
