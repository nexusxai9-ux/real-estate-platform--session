import React from 'react';
import { PropertyType } from '../types';
import { Search, MapPin, DollarSign, Home, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface FilterState {
  searchQuery: string;
  type: 'All' | PropertyType;
  minPrice: string;
  maxPrice: string;
  city: string;
  bedrooms: string;
  bathrooms: string;
  onlyFeatured: boolean;
}

interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  
  const handleChange = (field: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      type: 'All',
      minPrice: '',
      maxPrice: '',
      city: 'All',
      bedrooms: 'All',
      bathrooms: 'All',
      onlyFeatured: false
    });
  };

  const CITIES = ['All', 'Los Angeles, CA', 'New York, NY', 'Malibu, CA', 'Austin, TX', 'Lake Tahoe, CA'];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <div className="flex items-center gap-2 text-gray-900">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Search & Filter Directory</h3>
        </div>

        <button 
          onClick={handleReset}
          className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50 px-2 py-1 rounded-md border border-gray-100"
        >
          <RefreshCw className="w-3 h-3" /> Reset Filters
        </button>
      </div>

      {/* FILTER GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KEYWORD SEARCH */}
        <div className="relative">
          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Search Keyword</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g. Skyline, Vista, Pool..."
              value={filters.searchQuery}
              onChange={e => handleChange('searchQuery', e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* PROPERTY TYPE */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Property Type</label>
          <div className="relative">
            <Home className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <select 
              value={filters.type}
              onChange={e => handleChange('type', e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-2 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Penthouse">Penthouse</option>
            </select>
          </div>
        </div>

        {/* PRICE RANGE (MIN - MAX) */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Max Price Limit</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <select 
              value={filters.maxPrice}
              onChange={e => handleChange('maxPrice', e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-2 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
            >
              <option value="">Any Price</option>
              <option value="1000000">Under $1.0M</option>
              <option value="1500000">Under $1.5M</option>
              <option value="2500000">Under $2.5M</option>
              <option value="4000000">Under $4.0M</option>
            </select>
          </div>
        </div>

        {/* LOCATION SELECT */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Location City</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <select 
              value={filters.city}
              onChange={e => handleChange('city', e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-2 text-xs font-semibold text-gray-700 outline-hidden focus:border-indigo-500 focus:bg-white cursor-pointer"
            >
              {CITIES.map((c, i) => (
                <option key={i} value={c}>{c === 'All' ? 'All Locations' : c.split(',')[0]}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* LOWER ROW: SPEC DETAILS & FEATURED SLIDER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-50 pt-3 text-xs">
        
        {/* ROOM DETAILS SELECTS */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Beds:</span>
            <select 
              value={filters.bedrooms}
              onChange={e => handleChange('bedrooms', e.target.value)}
              className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-700 outline-hidden"
            >
              <option value="All">Any</option>
              <option value="1">1+ Bed</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
              <option value="4">4+ Beds</option>
              <option value="5">5+ Beds</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Baths:</span>
            <select 
              value={filters.bathrooms}
              onChange={e => handleChange('bathrooms', e.target.value)}
              className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-700 outline-hidden"
            >
              <option value="All">Any</option>
              <option value="1">1+ Bath</option>
              <option value="2">2+ Baths</option>
              <option value="3">3+ Baths</option>
              <option value="4">4+ Baths</option>
            </select>
          </div>
        </div>

        {/* FEATURED TOGGLE */}
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={filters.onlyFeatured}
              onChange={e => handleChange('onlyFeatured', e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-2 text-xs font-semibold text-gray-700">Display Featured Only</span>
          </label>
        </div>

      </div>

    </div>
  );
}
