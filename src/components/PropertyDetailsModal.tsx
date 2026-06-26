import React, { useState } from 'react';
import { Property, Review, VisitRequest, UserProfile } from '../types';
import { dbService } from '../data/mockData';
import { 
  X, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Calendar, 
  Clock, 
  Star, 
  Send, 
  Check, 
  Info, 
  Building2,
  Phone,
  MessageSquare,
  Sparkles,
  Calculator,
  Compass,
  Footprints,
  Activity,
  DollarSign
} from 'lucide-react';

interface PropertyDetailsModalProps {
  property: Property;
  currentUser: UserProfile | null;
  onClose: () => void;
  onStartChat: (property: Property) => void;
  onRefresh: () => void;
  onAuthRequired?: () => void;
}

// Preset dynamic galleries to enrich user visual interactivity
const PROPERTY_GALLERIES: Record<string, string[]> = {
  'prop-1': [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80', // Exterior Sunset
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80', // Gourmet Kitchen
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80', // Architectural Living
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80'  // Infinity Pool
  ],
  'prop-2': [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80', // Pre-war Loft Living
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop&q=80', // Exposed Brick Bed
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80', // Industrial Kitchen
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=80'  // Open Lounge
  ],
  'prop-3': [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80', // Coastline Sun Deck
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=80', // Master Ocean View Bed
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop&q=80', // Spa Marble Bath
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&auto=format&fit=crop&q=80'  // Beach Walkway
  ],
  'prop-4': [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80', // Monolithic concrete exterior
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&auto=format&fit=crop&q=80', // Indoor Zen Greenhouse
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=80', // Concrete Lounge
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'  // Minimalist Workspace
  ],
  'prop-5': [
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80', // Pine Chalet Exterior
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80', // Log beams lounge
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80', // Stone Fireplace hearth
    'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&auto=format&fit=crop&q=80'  // A-Frame Loft Bed
  ]
};

export default function PropertyDetailsModal({ 
  property, 
  currentUser, 
  onClose, 
  onStartChat, 
  onRefresh,
  onAuthRequired 
}: PropertyDetailsModalProps) {
  
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  
  // Interactive Mortgage Calculator State
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Visit Booking States
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00');
  const [visitType, setVisitType] = useState<'virtual' | 'in-person'>('in-person');
  const [visitNotes, setVisitNotes] = useState('');
  const [isBookingVisit, setIsBookingVisit] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch reviews for this property
  const reviews = dbService.getReviews(property.id);
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  // Get photo collection
  const propertyPhotos = PROPERTY_GALLERIES[property.id] || [property.imageUrl];

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onAuthRequired?.();
      return;
    }
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    
    setTimeout(() => {
      dbService.addReview({
        propertyId: property.id,
        propertyTitle: property.title,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        authorAvatar: currentUser.avatarUrl,
        rating,
        comment: reviewComment.trim()
      });

      setIsSubmittingReview(false);
      setReviewComment('');
      setReviewSuccess(true);
      onRefresh();

      setTimeout(() => {
        setReviewSuccess(false);
      }, 3000);
    }, 800);
  };

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onAuthRequired?.();
      return;
    }
    if (!visitDate) {
      return;
    }

    setIsBookingVisit(true);

    setTimeout(() => {
      dbService.addVisitRequest({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImageUrl: property.imageUrl,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        buyerEmail: currentUser.email,
        sellerId: property.sellerId,
        date: visitDate,
        time: visitTime,
        type: visitType,
        notes: visitNotes.trim()
      });

      setIsBookingVisit(false);
      setBookingSuccess(true);
      setVisitNotes('');
      onRefresh();

      setTimeout(() => {
        setBookingSuccess(false);
      }, 4000);
    }, 1000);
  };

  const handleAgentContact = () => {
    if (!currentUser) {
      onAuthRequired?.();
    } else {
      onStartChat(property);
    }
  };

  // MORTGAGE CALCULATOR FORMULAS
  const calculateMortgage = () => {
    const principal = property.price * (1 - downPaymentPercent / 100);
    const monthlyRate = (interestRate / 100) / 12;
    const totalPayments = loanTerm * 12;

    if (monthlyRate === 0) {
      return (principal / totalPayments).toFixed(0);
    }

    const monthlyPayment = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    return isNaN(monthlyPayment) ? '0' : monthlyPayment.toFixed(0);
  };

  const isBuyer = currentUser && currentUser.role === 'buyer';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex justify-center items-start p-4 sm:p-6 md:p-10">
      
      {/* MODAL CARD */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-250 my-auto">
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-20 p-2 rounded-full bg-white/90 text-gray-700 hover:bg-gray-100 hover:text-black shadow-md transition-colors border border-gray-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* TOP HERO PICTURE GALLERY SECTION */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full shrink-0 bg-slate-900 group">
          <img 
            src={propertyPhotos[activePhotoIndex]} 
            alt={`${property.title} - View ${activePhotoIndex + 1}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-6">
            
            {/* Top Type Indicator */}
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {property.type}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                Built {property.yearBuilt}
              </span>
            </div>

            {/* Bottom Title Info & Photo Thumbnail Clicker */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                  {property.title}
                </h2>
                <p className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm text-gray-300">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  <span>{property.location}, {property.city}</span>
                </p>
              </div>

              {/* Photo Thumbnail Chooser Row */}
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                {propertyPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIndex === idx 
                        ? 'border-indigo-500 scale-105 shadow-md' 
                        : 'border-white/40 hover:border-white'
                    }`}
                  >
                    <img 
                      src={photo} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* DETAIL CONTROLLER & MAIN PANELS */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-6 shrink-0">
          <button 
            onClick={() => setActiveTab('info')}
            className={`py-3.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all leading-none ${
              activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-950'
            }`}
          >
            Overview & Tools
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all leading-none flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-950'
            }`}
          >
            Reviews & Feedback
            <span className="bg-gray-150 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
              {reviews.length}
            </span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 bg-white">
          {activeTab === 'info' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: OVERVIEW, WALK SCORE, MORTGAGE */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* CORE SPEC GRID */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-center">
                  <div>
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-1">
                      <Bed className="w-4 h-4" />
                    </div>
                    <p className="text-base font-extrabold text-gray-900 leading-none">{property.bedrooms}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Bedrooms</p>
                  </div>
                  <div className="border-x border-gray-150">
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-1">
                      <Bath className="w-4 h-4" />
                    </div>
                    <p className="text-base font-extrabold text-gray-900 leading-none">{property.bathrooms}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Bathrooms</p>
                  </div>
                  <div>
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-1">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                    <p className="text-base font-extrabold text-gray-900 leading-none">{property.sqft.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Sq Footage</p>
                  </div>
                </div>

                {/* PRICE & STATS */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Listing Price</p>
                    <p className="text-2xl font-black text-indigo-600">${property.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Property Rating</p>
                    <p className="text-base font-extrabold text-gray-900 flex items-center justify-end gap-1 mt-1 leading-none">
                      <Star className="w-4 h-4 text-amber-400 fill-current" /> {avgRating}
                    </p>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">About This Property</h4>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{property.description}</p>
                </div>

                {/* AMENITIES */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Premium Conveniences</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {property.amenities.map((amenity, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* INTERACTIVE NEIGHBORHOOD WALK SCORECARD */}
                <div className="p-4 rounded-xl border border-gray-100 bg-indigo-50/10 space-y-3">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Neighborhood Analytics</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-gray-700">
                        <span className="flex items-center gap-1"><Footprints className="w-3.5 h-3.5 text-indigo-500" /> Walk Score</span>
                        <span className="text-indigo-600">88/100</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '88%' }} />
                      </div>
                      <p className="text-[9px] text-gray-400 font-medium">Very walkable area - daily errands don't require a vehicle.</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-gray-700">
                        <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-indigo-500" /> Transit Quality</span>
                        <span className="text-indigo-600">92/100</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                      <p className="text-[9px] text-gray-400 font-medium">Outstanding transit links with easy railway access.</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-gray-700">
                        <span>🛡️ Safety Index</span>
                        <span className="text-indigo-600">Grade A+</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '95%' }} />
                      </div>
                      <p className="text-[9px] text-gray-400 font-medium">Top tier security rating with proactive patrol coverage.</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-gray-700">
                        <span>🌲 Quiet Zone Rating</span>
                        <span className="text-indigo-600">90% Quiet</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '90%' }} />
                      </div>
                      <p className="text-[9px] text-gray-400 font-medium">Shielded from vehicle noise for absolute serene living.</p>
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE MORTGAGE CALCULATOR COMPONENT */}
                <div className="p-4 rounded-xl border border-gray-150 bg-gray-50/50 space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Estimated Cost Estimator</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {/* Down Payment slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-700 font-semibold">
                          <span>Down Payment</span>
                          <span>{downPaymentPercent}% (${((property.price * downPaymentPercent) / 100).toLocaleString()})</span>
                        </div>
                        <input 
                          type="range" 
                          min={5} 
                          max={50} 
                          step={1}
                          value={downPaymentPercent} 
                          onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      {/* Interest Rate slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-700 font-semibold">
                          <span>Interest Rate</span>
                          <span>{interestRate}%</span>
                        </div>
                        <input 
                          type="range" 
                          min={2.5} 
                          max={10} 
                          step={0.1}
                          value={interestRate} 
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      {/* Loan term buttons */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Amortization Period</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setLoanTerm(15)}
                            className={`py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              loanTerm === 15 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            15 Years
                          </button>
                          <button
                            type="button"
                            onClick={() => setLoanTerm(30)}
                            className={`py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              loanTerm === 30 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            30 Years
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Result Payment Display */}
                    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-gray-100 text-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Monthly Cost</span>
                      <p className="text-3xl font-black text-indigo-600 mt-1">${Number(calculateMortgage()).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 mt-2 max-w-[150px] leading-normal font-medium">Principal & interest calculations, excluding taxes and local insurance premiums.</p>
                    </div>
                  </div>
                </div>

                {/* SELLER AGENT DETAILS */}
                <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/30">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Listing Representative</p>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950 text-white font-bold text-sm">
                        <Building2 className="w-5 h-5 text-gray-150" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-gray-900 leading-none">{property.sellerName}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{property.sellerEmail}</p>
                      </div>
                    </div>

                    <button 
                      onClick={handleAgentContact}
                      className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Ask Agent
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: VISIT SCHEDULER OR PUBLIC ANONYMOUS ADVICE */}
              <div className="lg:col-span-5">
                {currentUser ? (
                  isBuyer ? (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-5 shadow-xs sticky top-0">
                      <div className="flex items-center gap-1.5 mb-4">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 leading-none uppercase">Schedule Private Tour</h4>
                          <p className="text-[10px] text-gray-500 mt-1 font-medium">Select dates and representative type</p>
                        </div>
                      </div>

                      {bookingSuccess ? (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center text-emerald-800 space-y-2">
                          <Check className="w-8 h-8 mx-auto text-emerald-600" />
                          <p className="text-xs font-bold">Tour Requested Successfully!</p>
                          <p className="text-[10px] opacity-90 leading-normal">The agent has been notified. Check your notifications dashboard for booking confirmations.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleBookVisit} className="space-y-4">
                          
                          {/* TOUR TYPE TOGGLE */}
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Tour Type</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button 
                                type="button"
                                onClick={() => setVisitType('in-person')}
                                className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                  visitType === 'in-person' 
                                    ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs' 
                                    : 'bg-transparent border-gray-200 text-gray-650 hover:bg-white/50'
                                }`}
                              >
                                In-Person Tour
                              </button>
                              <button 
                                type="button"
                                onClick={() => setVisitType('virtual')}
                                className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                  visitType === 'virtual' 
                                    ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs' 
                                    : 'bg-transparent border-gray-200 text-gray-650 hover:bg-white/50'
                                }`}
                              >
                                Virtual (Video Chat)
                              </button>
                            </div>
                          </div>

                          {/* DATE & TIME */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Date</label>
                              <input 
                                type="date" 
                                required
                                value={visitDate}
                                onChange={e => setVisitDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 cursor-pointer"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Preferred Time</label>
                              <select 
                                value={visitTime}
                                onChange={e => setVisitTime(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 cursor-pointer"
                              >
                                <option value="09:00">09:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="13:00">01:00 PM</option>
                                <option value="14:00">02:00 PM</option>
                                <option value="15:00">03:00 PM</option>
                                <option value="16:00">04:00 PM</option>
                              </select>
                            </div>
                          </div>

                          {/* VISITING NOTES */}
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Special Inquiries</label>
                            <textarea 
                              rows={3}
                              placeholder="e.g., questions about pre-approval options, specific design characteristics..."
                              value={visitNotes}
                              onChange={e => setVisitNotes(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none"
                            />
                          </div>

                          {/* SUBMIT BUTTON */}
                          <button 
                            type="submit"
                            disabled={isBookingVisit}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-extrabold shadow-xs transition-all cursor-pointer"
                          >
                            {isBookingVisit ? 'Scheduling...' : 'Request Showing Appointment'}
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-4">
                      <div className="flex gap-2 text-amber-600 shrink-0">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold leading-none">Tour Booking Advisory</p>
                          <p className="text-[11px] text-gray-500 leading-normal">
                            Only authenticated <strong>Buyers</strong> are permitted to book tours on this interface.
                          </p>
                        </div>
                      </div>
                      
                      <div className="border border-dashed border-gray-200 rounded-xl p-3.5 bg-white space-y-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">To Test Booking:</p>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          Use the role switcher in the header to enter <strong>Buyer View</strong>. This activates the booking calendar forms instantly!
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  /* PUBLIC ACCESS TOUR GATEWAY */
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-5 space-y-4 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Unlock Private Showings</h4>
                      <p className="text-[11px] text-gray-500 leading-normal max-w-xs mx-auto">
                        Join the platform to request private showing walkthroughs, video consultations, and coordinate directly with licensed brokers.
                      </p>
                    </div>

                    <button
                      onClick={onAuthRequired}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-colors shadow-xs cursor-pointer"
                    >
                      Sign In / Register To Book Tours
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* TAB: REVIEWS */
            <div className="space-y-6">
              
              {/* FEEDBACK LIST */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Client Reviews & Ratings</h4>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border border-dashed border-gray-100">
                    <Star className="w-8 h-8 text-slate-200 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">No client reviews yet. Be the first to provide feedback!</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-xl border border-gray-50 bg-gray-50/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img 
                              src={rev.authorAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.authorName}`}
                              alt={rev.authorName}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full bg-slate-100 object-cover"
                            />
                            <div>
                              <p className="text-xs font-bold text-gray-900 leading-none">{rev.authorName}</p>
                              <p className="text-[9px] text-gray-400 mt-0.5 capitalize">{rev.authorRole}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < rev.rating ? 'fill-current text-amber-400' : 'text-slate-200'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed pl-9">{rev.comment}</p>
                        <p className="text-[9px] text-gray-400 pl-9 font-mono font-medium">
                          {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WRITE A REVIEW FORM */}
              {currentUser ? (
                <div className="rounded-xl border border-gray-100 p-5 bg-white space-y-4">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Leave Public Review</h5>
                  </div>

                  {reviewSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center text-emerald-800 text-xs font-semibold">
                      Review added successfully! Thank you for sharing your experience.
                    </div>
                  ) : (
                    <form onSubmit={handleAddReview} className="space-y-3.5">
                      
                      {/* STAR SELECTION */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">Your Rating:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button 
                              key={i}
                              type="button"
                              onClick={() => setRating(i + 1)}
                              className="text-amber-400 focus:outline-hidden transition-transform active:scale-125 cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${i < rating ? 'fill-current' : 'text-slate-200'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* COMMENT */}
                      <div>
                        <textarea 
                          rows={3}
                          required
                          placeholder="What did you think of the design, location, features, or showing tour?..."
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                        />
                      </div>

                      {/* SUBMIT */}
                      <button 
                        type="submit"
                        disabled={isSubmittingReview}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 hover:bg-black text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingReview ? 'Posting...' : 'Post Review'}</span>
                      </button>

                    </form>
                  )}
                </div>
              ) : (
                <div className="text-center py-5 bg-gray-50 rounded-xl text-xs text-gray-500 font-medium border border-gray-100">
                  <p>Want to share your review on this listing?</p>
                  <button
                    onClick={onAuthRequired}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Sign In or Register Now
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4 shrink-0">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono">ESTATE REF: {property.id}</p>
          <button 
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 py-1.5 px-4 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
