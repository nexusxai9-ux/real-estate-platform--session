import React, { useState, useEffect } from 'react';
import { UserProfile, Property, PropertyType } from './types';
import { authService } from './lib/firebase';
import { dbService } from './data/mockData';

// Component Imports
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import FirebaseConfigGuide from './components/FirebaseConfigGuide';
import SearchFilters from './components/SearchFilters';
import PropertyCard from './components/PropertyCard';
import PropertyDetailsModal from './components/PropertyDetailsModal';
import RolePortals from './components/RolePortals';
import ChatDrawer from './components/ChatDrawer';

// Icon Imports
import { 
  Sparkles, 
  Building2, 
  Compass, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Key, 
  ArrowRight,
  PlusCircle,
  HelpCircle,
  X
} from 'lucide-react';

export default function App() {
  // Current session user profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Authentication states
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<'buyer' | 'seller'>('buyer');
  const [authPhone, setAuthPhone] = useState('');
  const [authCompany, setAuthCompany] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Modal Auth Trigger State
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup' | null>(null);

  // Listing directory filters state
  const [filters, setFilters] = useState({
    searchQuery: '',
    type: 'All' as 'All' | PropertyType,
    minPrice: '',
    maxPrice: '',
    city: 'All',
    bedrooms: 'All',
    bathrooms: 'All',
    onlyFeatured: false
  });

  // Overlay states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPropertyContext, setChatPropertyContext] = useState<Property | null>(null);

  // Load current session on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, [refreshTrigger]);

  // Helper to force-refresh data arrays across child components
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Auth Operations
  const handleAuthSubmit = async (e: React.FormEvent, overrideMode?: 'signin' | 'signup') => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    const activeMode = overrideMode || authMode;

    if (!authEmail) {
      setAuthError('Email address is required.');
      setAuthLoading(false);
      return;
    }

    try {
      if (activeMode === 'signup') {
        if (!authName) {
          setAuthError('Full name is required to register.');
          setAuthLoading(false);
          return;
        }
        
        const { user, error, providerAlert } = await authService.signUp(
          authEmail.trim(),
          authName.trim(),
          authRole,
          authPhone.trim() || undefined,
          authRole === 'seller' ? authCompany.trim() || undefined : undefined
        );

        if (error) {
          setAuthError(error);
        } else if (user) {
          if (providerAlert) {
            setAuthSuccess('Signed Up in Sandbox Mode! Note: To use real passwords, please enable the Email/Password provider in your Firebase Authentication console.');
          } else {
            setAuthSuccess('Registration completed successfully!');
          }
          setCurrentUser(user);
          setTimeout(() => {
            setAuthModalTab(null); // Close modal
          }, 1500);
          triggerRefresh();
        }
      } else {
        // Sign In mode
        const { user, error, providerAlert } = await authService.signIn(authEmail.trim());
        if (error) {
          setAuthError(error);
        } else if (user) {
          if (providerAlert) {
            setAuthSuccess('Signed In in Sandbox Mode! Note: To use real passwords, please enable the Email/Password provider in your Firebase Authentication console.');
          } else {
            setAuthSuccess('Sign In successful!');
          }
          setCurrentUser(user);
          setTimeout(() => {
            setAuthModalTab(null); // Close modal
          }, 1500);
          triggerRefresh();
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Google Sign In via Firebase Popup (fully enabled by default on Google AI Studio!)
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);
    try {
      const { user, error } = await authService.signInWithGoogle();
      if (error) {
        setAuthError(error);
      } else if (user) {
        setAuthSuccess('Google Sign-In successful!');
        setCurrentUser(user);
        setTimeout(() => {
          setAuthModalTab(null);
        }, 1200);
        triggerRefresh();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Quick Sign In helper for reviewers
  const handleQuickSignIn = (role: 'buyer' | 'seller' | 'admin') => {
    const emailMap = {
      buyer: 'buyer@example.com',
      seller: 'seller@example.com',
      admin: 'admin@example.com'
    };
    setAuthError(null);
    setAuthEmail(emailMap[role]);
    setAuthMode('signin');
    
    // Auto submit simulated
    setTimeout(async () => {
      const { user } = await authService.signIn(emailMap[role]);
      if (user) {
        setCurrentUser(user);
        setAuthModalTab(null); // Ensure modal is closed
        triggerRefresh();
      }
    }, 100);
  };

  // Open Chat with custom property context
  const handleStartChat = (property: Property) => {
    setChatPropertyContext(property);
    setIsChatOpen(true);
  };

  const handleOpenGeneralChat = () => {
    setChatPropertyContext(null);
    setIsChatOpen(true);
  };

  // FILTER LOGIC FOR AUTHENTICATED USERS
  const properties = dbService.getProperties();
  
  const filteredProperties = properties.filter(p => {
    if (!currentUser) return false;
    
    // Admins see everything
    if (currentUser.role === 'admin') {
      // Allow viewing all
    } 
    // Sellers see active listings + their own pending listings
    else if (currentUser.role === 'seller') {
      if (p.status === 'pending_approval' && p.sellerId !== currentUser.id) {
        return false;
      }
    } 
    // Buyers only see approved active market listings
    else {
      if (p.status !== 'active') return false;
    }

    // Filter by text search
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchesTitle = p.title.toLowerCase().includes(q);
      const matchesDesc = p.description.toLowerCase().includes(q);
      const matchesCity = p.city.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesCity) return false;
    }

    // Filter by property type
    if (filters.type !== 'All' && p.type !== filters.type) {
      return false;
    }

    // Filter by city
    if (filters.city !== 'All' && p.city !== filters.city) {
      return false;
    }

    // Filter by max price
    if (filters.maxPrice) {
      const maxPriceNum = Number(filters.maxPrice);
      if (p.price > maxPriceNum) return false;
    }

    // Filter by bedrooms
    if (filters.bedrooms !== 'All') {
      const minBeds = Number(filters.bedrooms);
      if (p.bedrooms < minBeds) return false;
    }

    // Filter by bathrooms
    if (filters.bathrooms !== 'All') {
      const minBaths = Number(filters.bathrooms);
      if (p.bathrooms < minBaths) return false;
    }

    // Filter by featured
    if (filters.onlyFeatured && !p.featured) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col antialiased text-gray-800">
      
      {/* 1. HEADER CO-ORDINATOR */}
      <Navbar 
        currentUser={currentUser} 
        onUserChange={setCurrentUser} 
        openChatDrawer={handleOpenGeneralChat}
        refreshTrigger={refreshTrigger}
        openAuthModal={(mode) => setAuthModalTab(mode)}
      />

      {/* 2. DYNAMIC WORKSPACE VIEWER */}
      {!currentUser ? (
        /* LANDING PAGE (FOR GUESTS) */
        <LandingPage 
          onOpenAuth={(mode) => setAuthModalTab(mode)}
          onQuickSignIn={handleQuickSignIn}
          onViewDetails={(p) => setSelectedProperty(p)}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        /* AUTHENTICATED PORTALS */
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          
          {/* GUIDE BANNER */}
          <FirebaseConfigGuide />

          {/* HERO PORTAL TITLE BANNER */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 py-10 px-6 sm:px-12 text-white shadow-xl animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
            <div className="relative z-10 max-w-xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                <span>Dynamic Portal Active</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">Find Your Architectural Sanctuary</h2>
              <p className="text-xs sm:text-sm text-white/95 leading-normal">
                Welcome back, <strong>{currentUser.name}</strong>. Explore verified listings, schedule private showing walkthroughs, leave customer reviews, and converse with our AI assistant.
              </p>
            </div>
          </section>

          {/* ADVANCED ROLE SECTIONS (PORTAL WORKFLOWS) */}
          <RolePortals 
            currentUser={currentUser} 
            refreshTrigger={refreshTrigger} 
            onRefresh={triggerRefresh}
            onSelectProperty={(p) => setSelectedProperty(p)}
          />

          {/* ADVANCED SEARCH DIRECTORY FILTERS */}
          <SearchFilters 
            filters={filters} 
            onFilterChange={setFilters} 
          />

          {/* PUBLIC DIRECTORY DISPLAY LISTINGS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} /> Verified Estates Directory
                </h3>
                <p className="text-[11px] text-gray-400 font-medium">Showing {filteredProperties.length} active matching options on the market</p>
              </div>
              
              {currentUser.role === 'seller' && (
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase tracking-wider font-mono">
                  My Listings are Highlighted
                </span>
              )}
            </div>

            {/* DIRECTORY DISPLAY GRID */}
            {filteredProperties.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-150 rounded-2xl shadow-xs">
                <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800">No properties found</p>
                <p className="text-xs text-gray-400 mt-0.5">Try resetting or loosening your search query filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((prop) => (
                  <PropertyCard 
                    key={prop.id} 
                    property={prop} 
                    currentUser={currentUser}
                    onViewDetails={(p) => setSelectedProperty(p)}
                    onRefresh={triggerRefresh}
                  />
                ))}
              </div>
            )}
          </section>

        </main>
      )}

      {/* 3. FOOTER REGISTRY */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Real Estate Platform. All rights reserved.</p>
          <div className="flex gap-4 font-semibold text-gray-500">
            <span className="hover:text-indigo-600 cursor-pointer">Security Protocol</span>
            <span className="hover:text-indigo-600 cursor-pointer">Public Terms</span>
            <span className="hover:text-indigo-600 cursor-pointer">Supabase Integration Guide</span>
          </div>
        </div>
      </footer>

      {/* 4. OVERLAYS, DRAWERS, AND DIALOGS */}

      {/* AUTH OVERLAY DIALOG */}
      {authModalTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl text-white animate-in zoom-in-95 duration-200">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => { setAuthModalTab(null); setAuthError(null); setAuthSuccess(null); }}
              className="absolute right-4 top-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* BRAND TITLE HERO */}
            <div className="text-center space-y-2 mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 animate-pulse">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-indigo-100">Aura Estates Portal</h2>
              <p className="text-xs text-gray-300 max-w-xs mx-auto">Access the leading premium portal for buyers, verified agents, and administrators.</p>
            </div>

            {/* TAB SELECTOR */}
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl mb-6">
              <button 
                type="button"
                onClick={() => { setAuthModalTab('signin'); setAuthError(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authModalTab === 'signin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => { setAuthModalTab('signup'); setAuthError(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authModalTab === 'signup' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* ERROR & SUCCESS */}
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/25 border border-rose-500/30 text-rose-200 text-xs font-medium">
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 text-xs font-medium">
                {authSuccess}
              </div>
            )}

            {/* GOOGLE SIGN IN BUTTON */}
            <div className="mb-4">
              <button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs transition-colors hover:bg-gray-100 disabled:opacity-50 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Continue with Google</span>
              </button>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-slate-900 px-3.5 text-gray-400 font-bold tracking-wider">Or continue with email</span></div>
              </div>
            </div>

            {/* AUTH FORM */}
            <form onSubmit={(e) => handleAuthSubmit(e, authModalTab)} className="space-y-4">
              
              {/* FULL NAME */}
              {authModalTab === 'signup' && (
                <div>
                  <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Alex Johnson"
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white placeholder-gray-400 outline-hidden focus:border-indigo-500 focus:bg-white/10 transition-all"
                  />
                </div>
              )}

              {/* EMAIL */}
              <div>
                <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white placeholder-gray-400 outline-hidden focus:border-indigo-500 focus:bg-white/10 transition-all"
                />
              </div>

              {/* ROLE & DETAILS */}
              {authModalTab === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block mb-1">Account Role</label>
                      <select 
                        value={authRole}
                        onChange={e => setAuthRole(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-slate-800 px-2.5 py-2 text-xs font-medium text-white outline-hidden focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="buyer">Buyer mode</option>
                        <option value="seller">Seller mode</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block mb-1">Phone (Optional)</label>
                      <input 
                        type="tel" 
                        placeholder="+1 (555) 000-0000"
                        value={authPhone}
                        onChange={e => setAuthPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-medium text-white outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {authRole === 'seller' && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block mb-1">Real Estate Agency Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Horizon Premium Homes"
                        value={authCompany}
                        onChange={e => setAuthCompany(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white placeholder-gray-400 outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  )}
                </>
              )}

              {/* REGISTER/LOGIN SUBMIT BUTTON */}
              <button 
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-extrabold text-xs tracking-wide uppercase transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {authLoading ? 'Authenticating...' : authModalTab === 'signup' ? 'Register Account' : 'Sign In To Platform'}
              </button>

            </form>

          </div>
        </div>
      )}

      {/* PROPERTY DETAILS OVERLAY */}
      {selectedProperty && (
        <PropertyDetailsModal 
          property={selectedProperty}
          currentUser={currentUser}
          onClose={() => setSelectedProperty(null)}
          onStartChat={handleStartChat}
          onRefresh={triggerRefresh}
          onAuthRequired={() => {
            setAuthModalTab('signin');
          }}
        />
      )}

      {/* CHAT HUB DRAWER */}
      <ChatDrawer 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={currentUser}
        selectedPropertyContext={chatPropertyContext}
        refreshTrigger={refreshTrigger}
        onRefresh={triggerRefresh}
      />

    </div>
  );
}
