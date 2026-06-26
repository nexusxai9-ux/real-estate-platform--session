import React, { useState, useEffect } from 'react';
import { Property, VisitRequest, UserProfile, Review, PropertyType } from '../types';
import { dbService } from '../data/mockData';
import { authService } from '../lib/firebase';
import { 
  Plus, 
  Trash, 
  Check, 
  X, 
  MapPin, 
  UserPlus, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Calendar,
  Layers,
  Users,
  Star,
  FileText,
  AlertTriangle,
  Building,
  DollarSign,
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface RolePortalsProps {
  currentUser: UserProfile | null;
  refreshTrigger: number;
  onRefresh: () => void;
  onSelectProperty: (property: Property) => void;
}

export default function RolePortals({ currentUser, refreshTrigger, onRefresh, onSelectProperty }: RolePortalsProps) {
  if (!currentUser) return null;

  // Render dashboard based on role
  switch (currentUser.role) {
    case 'seller':
      return <SellerDashboard currentUser={currentUser} refreshTrigger={refreshTrigger} onRefresh={onRefresh} />;
    case 'admin':
      return <AdminDashboard currentUser={currentUser} refreshTrigger={refreshTrigger} onRefresh={onRefresh} onSelectProperty={onSelectProperty} />;
    case 'buyer':
      return <BuyerDashboard currentUser={currentUser} refreshTrigger={refreshTrigger} onRefresh={onRefresh} onSelectProperty={onSelectProperty} />;
    default:
      return null;
  }
}

// ==========================================
// SELLER DASHBOARD VIEW
// ==========================================
function SellerDashboard({ currentUser, refreshTrigger, onRefresh }: { currentUser: UserProfile; refreshTrigger: number; onRefresh: () => void }) {
  const [activeTab, setActiveTab] = useState<'listings' | 'visits' | 'add'>('listings');
  const [properties, setProperties] = useState<Property[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);

  // Form states for adding property
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PropertyType>('House');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [sqft, setSqft] = useState('2000');
  const [yearBuilt, setYearBuilt] = useState('2022');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [amenitiesString, setAmenitiesString] = useState('Garage, Modern Kitchen, Air Conditioning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Preset images to help the seller list quickly and make it look beautiful
  const PRESET_IMAGES = [
    { name: 'Luxury Glass Villa', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop&q=80' },
    { name: 'Modern Apartment', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80' },
    { name: 'Cozy Townhouse', url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&auto=format&fit=crop&q=80' },
    { name: 'Highrise Penthouse', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80' }
  ];

  useEffect(() => {
    // Get seller properties
    const allProps = dbService.getProperties();
    setProperties(allProps.filter(p => p.sellerId === currentUser.id));

    // Get seller visits
    setVisits(dbService.getVisits(currentUser.id, 'seller'));
  }, [currentUser, refreshTrigger]);

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !location || !city || !description) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const selectedImg = imageUrl || PRESET_IMAGES[0].url;
      const amenities = amenitiesString
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      dbService.saveProperty({
        title,
        description,
        price: Number(price),
        location,
        city,
        type,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        sqft: Number(sqft),
        imageUrl: selectedImg,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        sellerEmail: currentUser.email,
        yearBuilt: Number(yearBuilt),
        featured: false,
        amenities
      });

      setIsSubmitting(false);
      setFormSuccess(true);
      
      // Reset Form
      setTitle('');
      setPrice('');
      setLocation('');
      setCity('');
      setDescription('');
      
      onRefresh();

      setTimeout(() => {
        setFormSuccess(false);
        setActiveTab('listings');
      }, 3000);
    }, 1000);
  };

  const handleTourAction = (visitId: string, status: 'approved' | 'rejected') => {
    dbService.updateVisitStatus(visitId, status);
    onRefresh();
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden mt-6">
      
      {/* SELLER HEADER */}
      <div className="bg-slate-900 px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 font-mono">Seller Dashboard</span>
          </div>
          <h3 className="text-lg font-extrabold tracking-tight">Manage Your Properties & Inquiries</h3>
        </div>
        
        {/* TAB NAVIGATION */}
        <div className="flex bg-white/10 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('listings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'listings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            My Listings ({properties.length})
          </button>
          <button 
            onClick={() => setActiveTab('visits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'visits' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Tour Requests ({visits.filter(v => v.status === 'pending').length})
            {visits.some(v => v.status === 'pending') && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-indigo-400 border border-slate-900" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'add' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add Property
          </button>
        </div>
      </div>

      {/* DASHBOARD BODY */}
      <div className="p-6">
        
        {/* TAB 1: PROPERTIES LIST */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Portfolio</h4>
            {properties.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed border-gray-100">
                <Building className="w-10 h-10 text-slate-200 mx-auto mb-1.5" />
                <p className="text-xs text-gray-500 font-medium">You haven't listed any properties yet</p>
                <button 
                  onClick={() => setActiveTab('add')}
                  className="mt-3 inline-flex items-center gap-1 bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Create First Listing
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold tracking-wider font-mono">
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Asking Price</th>
                      <th className="py-3 px-4">Specs</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {properties.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-gray-900">
                          <div className="flex items-center gap-3">
                            <img 
                              src={p.imageUrl} 
                              alt={p.title} 
                              referrerPolicy="no-referrer"
                              className="w-12 h-8 object-cover rounded-md border"
                            />
                            <div>
                              <p className="font-bold leading-tight">{p.title}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{p.type} • Built {p.yearBuilt}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-500">
                          <p>{p.location}</p>
                          <p className="text-[10px]">{p.city}</p>
                        </td>
                        <td className="py-4 px-4 font-extrabold text-indigo-600">${p.price.toLocaleString()}</td>
                        <td className="py-4 px-4 text-gray-500 font-medium">
                          {p.bedrooms}bds • {p.bathrooms}ba • {p.sqft.toLocaleString()} sqft
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : p.status === 'pending_approval' 
                                ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {p.status === 'pending_approval' ? 'Pending Admin Approval' : p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VISIT REQUESTS */}
        {activeTab === 'visits' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scheduled Physical & Virtual Inquiries</h4>
            {visits.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed border-gray-100">
                <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-1.5" />
                <p className="text-xs text-gray-500 font-medium">No tour bookings received yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visits.map(v => (
                  <div key={v.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-white transition-all gap-4">
                    <div className="flex gap-4">
                      <img 
                        src={v.propertyImageUrl} 
                        alt={v.propertyTitle} 
                        referrerPolicy="no-referrer"
                        className="w-16 h-12 object-cover rounded-lg shrink-0 border"
                      />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-900 leading-tight">{v.propertyTitle}</p>
                        <p className="text-xs text-gray-500 font-semibold">
                          Client: {v.buyerName} <span className="font-normal text-gray-400">({v.buyerEmail})</span>
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1 font-semibold text-gray-600 uppercase text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">
                            {v.type} Tour
                          </span>
                          <span className="flex items-center gap-1 font-medium text-gray-500">
                            <Calendar className="w-3.5 h-3.5" /> {v.date}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-gray-500">
                            <Clock className="w-3.5 h-3.5" /> {v.time}
                          </span>
                        </div>
                        {v.notes && <p className="text-xs italic bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md border border-gray-100/50 mt-1">Notes: "{v.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 md:border-l md:pl-4">
                      {v.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleTourAction(v.id, 'approved')}
                            className="flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-bold transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve Tour
                          </button>
                          <button 
                            onClick={() => handleTourAction(v.id, 'rejected')}
                            className="flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 text-xs font-bold transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </button>
                        </>
                      ) : (
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            v.status === 'approved' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}>
                            {v.status === 'approved' ? 'Tour Scheduled' : v.status}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1 font-mono">Request ID: {v.id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADD PROPERTY FORM */}
        {activeTab === 'add' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="border-b border-gray-100 pb-2">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">List New Property</h4>
              <p className="text-xs text-gray-500">All submissions enter a pending state and must be approved by our Admin moderators before showing on the public listings panel.</p>
            </div>

            {formSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center text-emerald-800 space-y-2">
                <CheckCircle className="w-12 h-12 mx-auto text-emerald-600" />
                <p className="text-sm font-extrabold">Listing Saved successfully!</p>
                <p className="text-xs opacity-90">Your property has been submitted to the Admin approval queue. You will receive an alert notification when reviewed.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateProperty} className="space-y-4">
                
                {/* PROPERTY TITLE */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Property Name / Heading *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Modern Sunset Ocean View Villa"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-3 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                  />
                </div>

                {/* SPECS BLOCK */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Property Type *</label>
                    <select 
                      value={type}
                      onChange={e => setType(e.target.value as PropertyType)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500"
                    >
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Condo">Condo</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Penthouse">Penthouse</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Asking Price ($) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 1150000"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Bedrooms *</label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      value={bedrooms}
                      onChange={e => setBedrooms(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Bathrooms *</label>
                    <input 
                      type="number" 
                      required
                      step="0.5"
                      min={0}
                      value={bathrooms}
                      onChange={e => setBathrooms(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* ADDRESS BLOCK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Street Address *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 128 Ocean Crest Boulevard"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">City, State *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Miami, FL"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* SQUARE FOOTAGE & YEAR */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Sq Footage (sqft) *</label>
                    <input 
                      type="number" 
                      required
                      value={sqft}
                      onChange={e => setSqft(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Year Built *</label>
                    <input 
                      type="number" 
                      required
                      value={yearBuilt}
                      onChange={e => setYearBuilt(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* CHOOSE IMAGE HELPER */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Property Image Selection *</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {PRESET_IMAGES.map((img, i) => (
                      <button 
                        type="button" 
                        key={i}
                        onClick={() => setImageUrl(img.url)}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          imageUrl === img.url ? 'border-indigo-600 scale-95 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 inset-x-1 text-[8px] bg-black/60 text-white font-bold py-0.5 rounded truncate leading-none text-center">
                          {img.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <input 
                    type="url" 
                    placeholder="Or enter custom image URL directly (optional)"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* AMENITIES */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Amenities (Comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Heated Pool, Wine Cellar, Smart AC, Central Heating"
                    value={amenitiesString}
                    onChange={e => setAmenitiesString(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Listing Description *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Provide a comprehensive summary describing architecture features, appliances, proximity to locations, etc..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 resize-none"
                  />
                </div>

                {/* SUBMIT */}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gray-950 hover:bg-black text-white py-2.5 text-xs font-extrabold shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing Request...' : 'Submit Property for Approval'}
                </button>

              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ==========================================
// ADMIN DASHBOARD VIEW
// ==========================================
interface AdminDashboardProps {
  currentUser: UserProfile;
  refreshTrigger: number;
  onRefresh: () => void;
  onSelectProperty: (property: Property) => void;
}

function AdminDashboard({ currentUser, refreshTrigger, onRefresh, onSelectProperty }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'reviews'>('approvals');
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setProperties(dbService.getProperties());
    setUsers(authService.getAllUsers());
    setReviews(dbService.getReviews());
  }, [refreshTrigger]);

  const handleApprove = (propId: string) => {
    dbService.approveProperty(propId);
    onRefresh();
  };

  const handleDecline = (propId: string) => {
    if (confirm('Are you sure you want to decline this listing?')) {
      dbService.rejectProperty(propId);
      onRefresh();
    }
  };

  const handleUserRoleChange = (userId: string, currentRole: any) => {
    // Cycles roles: buyer -> seller -> admin -> buyer
    const roleCycle: Record<string, any> = { buyer: 'seller', seller: 'admin', admin: 'buyer' };
    const nextRole = roleCycle[currentRole];
    authService.updateUserRole(userId, nextRole);
    onRefresh();
  };

  const pendingApprovals = properties.filter(p => p.status === 'pending_approval');
  const activeListingsCount = properties.filter(p => p.status === 'active').length;
  const totalMeetingsCount = dbService.getVisits().length;

  return (
    <div className="rounded-2xl border border-rose-100 bg-white shadow-sm overflow-hidden mt-6">
      
      {/* ADMIN HEADER */}
      <div className="bg-rose-950 px-6 py-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-rose-400 font-mono">Platform Admin Monitoring Panel</span>
          </div>
          <h3 className="text-lg font-extrabold tracking-tight">System Administration & Moderate Operations</h3>
        </div>

        {/* TAB CONTROLLERS */}
        <div className="flex bg-white/10 p-1 rounded-xl shrink-0">
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'approvals' ? 'bg-white text-rose-950 shadow-sm' : 'text-rose-100 hover:text-white'
            }`}
          >
            Review Queue ({pendingApprovals.length})
            {pendingApprovals.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white border border-rose-950">
                {pendingApprovals.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-white text-rose-950 shadow-sm' : 'text-rose-100 hover:text-white'
            }`}
          >
            Users Manager ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reviews' ? 'bg-white text-rose-950 shadow-sm' : 'text-rose-100 hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* ADMIN STATS CAROUSEL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-rose-50/20 border-b border-rose-50/60">
        <div className="p-4 bg-white rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Building className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Active Listings</p>
            <p className="text-lg font-extrabold text-gray-900 leading-tight">{activeListingsCount}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase font-sans">Pending Moderation</p>
            <p className="text-lg font-extrabold text-gray-900 leading-tight">{pendingApprovals.length}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Registered users</p>
            <p className="text-lg font-extrabold text-gray-900 leading-tight">{users.length}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Tour Bookings</p>
            <p className="text-lg font-extrabold text-gray-900 leading-tight">{totalMeetingsCount}</p>
          </div>
        </div>
      </div>

      {/* DASHBOARD BODY */}
      <div className="p-6">
        
        {/* TAB 1: LISTINGS APPROVAL QUEUE */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unapproved Listing Proposals</h4>
            
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-800">Clear queue!</p>
                <p className="text-[11px] text-gray-500 mt-0.5">All submitted properties have been reviewed and moderated.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingApprovals.map(p => (
                  <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl gap-4 hover:border-rose-200 transition-colors">
                    <div 
                      onClick={() => onSelectProperty(p)}
                      className="flex gap-4 cursor-pointer hover:opacity-85 transition-opacity"
                    >
                      <img 
                        src={p.imageUrl} 
                        alt={p.title} 
                        referrerPolicy="no-referrer"
                        className="w-20 h-14 object-cover rounded-lg shrink-0 border"
                      />
                      <div className="space-y-0.5">
                        <p className="text-xs font-extrabold text-gray-900 flex items-center gap-1">
                          {p.title} <span className="text-[9px] font-bold font-mono bg-amber-50 border border-amber-200 px-1 rounded text-amber-700 uppercase">{p.type}</span>
                        </p>
                        <p className="text-[11px] text-gray-500 leading-none flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> {p.location}, {p.city}</p>
                        <p className="text-xs font-extrabold text-indigo-600 mt-1">${p.price.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Submitted by Seller: <strong>{p.sellerName}</strong> ({p.sellerEmail})</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4 shrink-0">
                      <button 
                        onClick={() => handleApprove(p.id)}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Listing
                      </button>
                      <button 
                        onClick={() => handleDecline(p.id)}
                        className="flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-bold transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SIMULATED USER ACCOUNT MANAGER */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform Registered User Profiles</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-rose-50/50 text-gray-400 font-bold uppercase font-mono">
                    <th className="py-2.5 px-3">Avatar & Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Assigned Permissions</th>
                    <th className="py-2.5 px-3">Contact info</th>
                    <th className="py-2.5 px-3 text-right">Moderator Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={u.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`}
                            alt={u.name} 
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full bg-slate-100 object-cover border border-gray-100"
                          />
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-500">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                          u.role === 'admin' 
                            ? 'bg-rose-50 border-rose-200 text-rose-700' 
                            : u.role === 'seller' 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500">{u.phone || 'N/A'}</td>
                      <td className="py-3 px-3 text-right">
                        <button 
                          onClick={() => handleUserRoleChange(u.id, u.role)}
                          className="text-[10px] font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-1 rounded-md transition-colors"
                        >
                          Modify Permission
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM AUDIT / REVIEWS LOG */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent User Reviews System Audit</h4>
            
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="p-4 rounded-xl border border-gray-100 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 leading-none flex items-center gap-1">
                        Reviewer: {r.authorName} <span className="text-[10px] text-gray-400 font-mono capitalize">({r.authorRole})</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                        Target Listing: <strong>{r.propertyTitle}</strong> (ID: {r.propertyId})
                      </p>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-slate-100'}`} />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-600 italic bg-gray-50/50 p-2.5 rounded-lg border border-gray-50 mt-1 leading-relaxed">
                    "{r.comment}"
                  </p>
                  
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-1">
                    <span>Published: {new Date(r.createdAt).toLocaleString()}</span>
                    <span className="text-rose-600 cursor-not-allowed hover:underline">Flag review</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ==========================================
// BUYER PORTFOLIO VIEW
// ==========================================
interface BuyerDashboardProps {
  currentUser: UserProfile;
  refreshTrigger: number;
  onRefresh: () => void;
  onSelectProperty: (property: Property) => void;
}

function BuyerDashboard({ currentUser, refreshTrigger, onRefresh, onSelectProperty }: BuyerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'tours' | 'reviews'>('tours');
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Fetch user visits
    setVisits(dbService.getVisits(currentUser.id, 'buyer'));
    
    // Fetch user reviews
    const allReviews = dbService.getReviews();
    setReviews(allReviews.filter(r => r.authorId === currentUser.id));
  }, [currentUser, refreshTrigger]);

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden mt-6">
      
      {/* BUYER HEADER */}
      <div className="bg-emerald-950 px-6 py-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 font-mono">My Buyer Portfolio</span>
          </div>
          <h3 className="text-lg font-extrabold tracking-tight">Track Booked Visits & Feedback Reviews</h3>
        </div>

        {/* CONTROLLER */}
        <div className="flex bg-white/10 p-1 rounded-xl shrink-0">
          <button 
            onClick={() => setActiveTab('tours')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tours' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-100 hover:text-white'
            }`}
          >
            My Tour Appointments ({visits.length})
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reviews' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-100 hover:text-white'
            }`}
          >
            My Feedback Submissions ({reviews.length})
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6">
        
        {/* TAB 1: VISITS */}
        {activeTab === 'tours' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scheduled Tours Tracking</h4>
            
            {visits.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <p className="text-xs text-gray-500 font-medium">No tours scheduled yet.</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Explore properties and click "Schedule Private Visit" to see them here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visits.map(v => (
                  <div key={v.id} className="p-4 rounded-xl border border-gray-100 bg-white flex gap-4 hover:border-emerald-200 transition-colors">
                    <img 
                      src={v.propertyImageUrl} 
                      alt={v.propertyTitle} 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-lg border shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <p className="font-extrabold text-gray-900 leading-tight truncate">{v.propertyTitle}</p>
                      
                      <div className="flex items-center gap-1.5 text-gray-500 font-medium font-sans">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {v.date}
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1.5" /> {v.time}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 font-mono text-[9px] uppercase font-bold text-gray-600 bg-gray-100 rounded">
                          {v.type}
                        </span>

                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                          v.status === 'approved' 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700 animate-pulse' 
                            : v.status === 'pending' 
                              ? 'bg-amber-50 border-amber-100 text-amber-700' 
                              : 'bg-gray-100 border-gray-200 text-gray-700'
                        }`}>
                          {v.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Submitted Feedbacks</h4>
            
            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Star className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <p className="text-xs text-gray-500 font-medium">You haven't left any reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="p-4 rounded-xl border border-gray-100 bg-white text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-gray-900 truncate">Property: {r.propertyTitle}</p>
                      <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'text-slate-100'}`} />
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-600 italic bg-gray-50/30 p-2.5 rounded-lg border border-gray-50 leading-relaxed">
                      "{r.comment}"
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono text-right">
                      Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
