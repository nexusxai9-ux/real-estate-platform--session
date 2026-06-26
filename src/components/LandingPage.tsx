import React from 'react';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  Users, 
  Key,
  Flame,
  ArrowUpRight
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onQuickSignIn: (role: 'buyer' | 'seller' | 'admin') => void;
  onViewDetails: (property: any) => void;
  refreshTrigger: number;
}

export default function LandingPage({ 
  onOpenAuth 
}: LandingPageProps) {
  return (
    <div className="flex-1 bg-gradient-to-br from-amber-50/70 via-white to-indigo-50/50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* CENTRAL HERO CARD */}
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-3xl border border-indigo-100/60 p-8 sm:p-12 md:p-16 text-center space-y-8 shadow-xl shadow-indigo-100/30 animate-in fade-in duration-500">
        
        {/* Sparkle badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 border border-indigo-100 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>Elite Real Estate Platform</span>
        </div>

        {/* Dynamic Title */}
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-slate-900">
            The Architecture <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500">
              of Distinction
            </span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Welcome to the premier platform for curated architectural masterpieces. Browse certified luxury estates, schedule walkthroughs, leave customer reviews, and converse with our AI assistant.
          </p>
        </div>

        {/* AUTHENTICATION ACTION CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] duration-200"
            id="landing-btn-signup"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => onOpenAuth('signin')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-black tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] duration-200"
            id="landing-btn-signin"
          >
            <span>Sign In to Account</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-slate-100 text-left">
          
          <div className="space-y-2">
            <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">100% Verified Directory</h4>
            <p className="text-xs text-slate-500 leading-normal">
              Every home, apartment, and penthouse in our index is rigorously evaluated and verified before posting.
            </p>
          </div>

          <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-6 sm:pt-0 sm:pl-6">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Direct Agent Channels</h4>
            <p className="text-xs text-slate-500 leading-normal">
              Schedule direct in-person and virtual showing tours, and coordinate with experienced agency sellers instantly.
            </p>
          </div>

          <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-6 sm:pt-0 sm:pl-6">
            <div className="h-9 w-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">AI Concierge Services</h4>
            <p className="text-xs text-slate-500 leading-normal">
              Get immediate architectural, structural, and neighborhood summaries with our intelligent on-site chatbot.
            </p>
          </div>

        </div>

      </div>

      {/* Trust Quote */}
      <p className="text-slate-400 text-[11px] font-bold tracking-wide uppercase mt-8 flex items-center gap-1.5">
        <Award className="w-4 h-4 text-amber-500" />
        <span>Endorsed Architectural Standards</span>
      </p>

    </div>
  );
}
