import React from 'react';
import { Property, Review, UserProfile } from '../types';
import { dbService } from '../data/mockData';
import { 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  Star, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Sparkles,
  Eye,
  Check,
  X
} from 'lucide-react';

interface PropertyCardProps {
  key?: string;
  property: Property;
  currentUser: UserProfile | null;
  onViewDetails: (property: Property) => void;
  onRefresh: () => void;
}

export default function PropertyCard({ property, currentUser, onViewDetails, onRefresh }: PropertyCardProps) {
  // Calculate average rating
  const reviews = dbService.getReviews(property.id);
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const isOwner = currentUser && currentUser.role === 'seller' && property.sellerId === currentUser.id;
  const isAdmin = currentUser && currentUser.role === 'admin';

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dbService.approveProperty(property.id);
    onRefresh();
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to decline and remove "${property.title}"?`)) {
      dbService.rejectProperty(property.id);
      onRefresh();
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    dbService.updatePropertyStatus(property.id, e.target.value as any);
    onRefresh();
  };

  const getStatusBadge = (status: Property['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> Active Market
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Review Pending
          </span>
        );
      case 'sold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            Sold Out
          </span>
        );
      case 'rented':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Rented
          </span>
        );
    }
  };

  return (
    <div 
      onClick={() => onViewDetails(property)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-md cursor-pointer"
    >
      {/* CARD IMAGE & TAGS */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* TOP OVERLAYS */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 bg-gradient-to-b from-black/50 to-transparent">
          <div>
            <span className="rounded-lg bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-gray-900 shadow-xs">
              {property.type}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {getStatusBadge(property.status)}
            {property.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                <Sparkles className="w-2.5 h-2.5" /> Featured
              </span>
            )}
          </div>
        </div>

        {/* PRICE LABEL */}
        <div className="absolute bottom-3 left-3 rounded-xl bg-gray-950/90 backdrop-blur-xs px-3 py-1.5 text-white">
          <p className="text-[10px] font-bold tracking-wider uppercase opacity-75 leading-none">Asking Price</p>
          <p className="text-sm font-bold tracking-tight mt-0.5">${property.price.toLocaleString()}</p>
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="flex flex-1 flex-col p-4">
        {/* REVIEW SUMMARY & YEAR */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            {avgRating ? (
              <>
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-bold text-gray-800">{avgRating}</span>
                <span className="opacity-70">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
              </>
            ) : (
              <span className="italic text-gray-400 text-[11px]">No reviews yet</span>
            )}
          </div>
          <span className="text-[11px] font-mono">Built {property.yearBuilt}</span>
        </div>

        {/* TITLE & LOCATION */}
        <div className="mt-2.5 flex-1">
          <h3 className="text-sm font-bold tracking-tight text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {property.title}
          </h3>
          
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{property.city}</span>
          </p>
        </div>

        {/* SPECIFICATIONS */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-700">{property.bedrooms}</span> Beds
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-700">{property.bathrooms}</span> Baths
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-700">{property.sqft.toLocaleString()}</span> Sq Ft
          </div>
        </div>

        {/* SPECIAL CONTEXT ACTIONS (ADMIN & SELLER) */}
        {(isAdmin || isOwner) && (
          <div className="mt-4 border-t border-gray-100 pt-3" onClick={e => e.stopPropagation()}>
            {/* ADMIN ACTIONS: APPROVE / REJECT */}
            {isAdmin && property.status === 'pending_approval' && (
              <div className="flex gap-2">
                <button 
                  onClick={handleApprove}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 text-xs font-bold transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Approve Listing
                </button>
                <button 
                  onClick={handleReject}
                  className="flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-bold transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Decline
                </button>
              </div>
            )}

            {/* SELLER STATE SWITCH */}
            {isOwner && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Status:</span>
                <select 
                  value={property.status} 
                  onChange={handleStatusChange}
                  className="rounded-lg border border-gray-200 bg-gray-50 py-1 px-2 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  <option value="pending_approval" disabled>Pending Approval</option>
                  <option value="active">Active Market</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* DEFAULT HOVER CARD BUTTON FOR BUYERS */}
        {!isAdmin && !isOwner && (
          <div className="mt-4 border-t border-gray-50 pt-3">
            <button className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gray-50 group-hover:bg-indigo-600 py-2 text-xs font-bold text-gray-700 group-hover:text-white transition-all duration-300">
              <Eye className="w-3.5 h-3.5" />
              <span>Explore Details</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
