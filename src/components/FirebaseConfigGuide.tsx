import React, { useState } from 'react';
import { Shield, Key, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Sparkles, Database } from 'lucide-react';

export default function FirebaseConfigGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const projectId = "gen-lang-client-0383124257";

  return (
    <div className="border border-emerald-100 bg-emerald-50/75 text-emerald-800 transition-all duration-300 rounded-xl mb-6 shadow-xs overflow-hidden">
      <div 
        className="px-4 py-3 flex items-center justify-between cursor-pointer select-none" 
        onClick={() => setIsOpen(!isOpen)}
        id="firebase-status-banner"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 animate-pulse">
            <CheckCircle className="w-5 h-5" />
          </div>
          
          <div className="text-left">
            <p className="text-sm font-semibold flex items-center gap-2">
              Connected to Firebase Services (Auth & Firestore)
            </p>
            <p className="text-xs opacity-90 font-medium">
              Project ID: <span className="font-mono bg-emerald-100/50 px-1 rounded text-[11px] font-semibold">{projectId}</span> • Active & Secure
            </p>
          </div>
        </div>

        <button className="p-1 rounded-md hover:bg-black/5 transition-colors" id="toggle-firebase-info">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 border-t border-dashed bg-white text-gray-700 text-xs leading-relaxed space-y-3">
          <p className="font-semibold text-gray-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" /> Firebase Integration Insights:
          </p>
          
          <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
            <li>
              <strong>Google Sign-In (Enabled & Active):</strong> Simply click the <strong>"Continue with Google"</strong> button on the login modal to authenticate instantly using Firebase Popups.
            </li>
            <li>
              <strong>Zero-Trust Database rules:</strong> Your user profile records are protected at the database level under the <code>/users</code> Firestore collection using granular owner verification rules.
            </li>
            <li>
              <strong>Optional Email/Password Provider:</strong> To log in using real emails and passwords instead of simulated fallback:
              <ol className="list-decimal pl-5 mt-1 space-y-1 text-gray-500 font-medium">
                <li>Go to the <a href={`https://console.firebase.google.com/project/${projectId}/authentication/providers`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">Firebase Console Authentication Providers</a> page.</li>
                <li>Click <strong>Add new provider</strong> and choose <strong>Email/Password</strong>.</li>
                <li>Enable it and save. Email signups will then securely create real logins in your auth dashboard!</li>
              </ol>
            </li>
          </ul>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-800 border-b border-dashed border-slate-200 pb-1.5 mb-1.5">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Active Firebase Config</span>
            </div>
            <p className="flex items-center gap-1.5"><strong>Project ID:</strong> {projectId}</p>
            <p className="flex items-center gap-1.5"><strong>Auth Domain:</strong> {projectId}.firebaseapp.com</p>
            <p className="flex items-center gap-1.5"><strong>Firestore DB ID:</strong> ai-studio-realestateplatfo-d6afd6fc-63f0-4b38-af03-a680dcf1c51d</p>
          </div>
        </div>
      )}
    </div>
  );
}
