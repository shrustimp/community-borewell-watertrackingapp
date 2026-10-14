import React, { useState, useEffect } from 'react';
import { getSuppliers, getReviews, subscribeToStore } from '../../services/storageService';
import { SupplierProfile } from '../../types';
import {
  Search,
  Filter,
  Truck,
  Star,
  MapPin,
  Clock,
  Droplets,
  CheckCircle,
  Phone,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface SupplierDiscoveryPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const SupplierDiscoveryPage: React.FC<SupplierDiscoveryPageProps> = ({ onNavigate }) => {
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  const loadData = () => {
    // Only approved suppliers are visible to customers per spec
    const all = getSuppliers().filter((s) => s.approvalStatus === 'approved');
    setSuppliers(all);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore(loadData);
    return unsub;
  }, []);

  // Filter logic
  const filteredSuppliers = suppliers.filter((s) => {
    // Search query matches business name, owner name, or service areas
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.businessName.toLowerCase().includes(q) ||
      s.serviceAreas.some((area) => area.toLowerCase().includes(q)) ||
      s.businessAddress.toLowerCase().includes(q);

    // Capacity filter
    const matchesCapacity =
      selectedCapacity === 'all' || s.tankerCapacityLiters === Number(selectedCapacity);

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' || s.waterCategories.includes(selectedCategory as any);

    // Price filter
    const matchesPrice = s.pricePerTanker <= maxPrice;

    return matchesSearch && matchesCapacity && matchesCategory && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800 text-left">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
          Verified Water Logistics
        </span>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-1">
          Find Local Water Tanker Suppliers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Browse verified tanker fleets in your locality. Compare published rates, verified water sources, and neighborhood customer reviews.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by locality, area (e.g. Whitefield, Bellandur)..."
              className="w-full pl-10 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Capacity Dropdown */}
          <div>
            <select
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="all">All Tanker Sizes</option>
              <option value="4000">4,000 Liters</option>
              <option value="6000">6,000 Liters</option>
              <option value="10000">10,000 Liters</option>
              <option value="12000">12,000 Liters</option>
            </select>
          </div>

          {/* Water Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="all">All Water Categories</option>
              <option value="potable">Potable Water</option>
              <option value="utility">Utility Water</option>
              <option value="drinking_certified">Drinking Certified</option>
            </select>
          </div>
        </div>

        {/* Price Slider */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-3">
            <span>Max Tanker Price: <strong>₹{maxPrice}</strong></span>
            <input
              type="range"
              min="500"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-36 sm:w-48 accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="text-[11px] text-slate-500">
            Showing {filteredSuppliers.length} approved local supplier(s)
          </div>
        </div>
      </div>

      {/* Supplier Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-xl mx-auto space-y-4">
          <Droplets className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Direct Supplier Match Found</h3>
          <p className="text-xs text-slate-500">
            No supplier currently matches all active filters for this locality. You can still broadcast an open water delivery request to all nearby suppliers.
          </p>
          <button
            onClick={() => onNavigate('new-request')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            Submit General Water Broadcast
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((s) => (
            <div
              key={s.uid}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between text-xs space-y-4"
            >
              <div>
                {/* Supplier Header */}
                <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.businessName}</h3>
                    <p className="text-[11px] text-slate-500">Fleet: {s.numberOfTankers} tanker(s)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-blue-700 block">
                      ₹{s.pricePerTanker}
                    </span>
                    <span className="text-[10px] text-slate-400">per {s.tankerCapacityLiters}L</span>
                  </div>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center gap-3 py-2 text-[11px]">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{s.averageRating > 0 ? s.averageRating : 'New'}</span>
                    <span className="text-slate-400 font-normal">({s.totalRatingsCount})</span>
                  </div>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">
                    <strong>{s.completedDeliveriesCount}</strong> trips completed
                  </span>
                </div>

                {/* Service Localities */}
                <div className="space-y-1.5 py-1">
                  <div className="flex items-start gap-1.5 text-slate-600 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      Servicing: {s.serviceAreas.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Hours: {s.operatingHours}</span>
                  </div>
                </div>

                {/* Water Source & Hygiene */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 mt-2 text-[11px] text-slate-600">
                  <strong className="text-slate-800 block mb-0.5">Water Source:</strong>
                  <p className="line-clamp-2">{s.waterSourceInfo}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Approved
                </span>
                <button
                  onClick={() => onNavigate('new-request')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  Book Water
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
