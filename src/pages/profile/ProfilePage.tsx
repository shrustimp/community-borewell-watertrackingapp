import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveUser, saveSupplier } from '../../services/storageService';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Shield,
  Truck,
  CheckCircle,
  Save,
  ArrowLeft,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { currentUser, supplierProfile, role, refreshUserData } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [locality, setLocality] = useState(currentUser?.locality || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [pinCode, setPinCode] = useState(currentUser?.pinCode || '');

  // Supplier specific
  const [businessName, setBusinessName] = useState(supplierProfile?.businessName || '');
  const [tankerCapacity, setTankerCapacity] = useState(
    supplierProfile?.tankerCapacityLiters?.toString() || '6000'
  );
  const [pricePerTanker, setPricePerTanker] = useState(
    supplierProfile?.pricePerTanker?.toString() || '850'
  );
  const [serviceAreas, setServiceAreas] = useState(
    supplierProfile?.serviceAreas?.join(', ') || ''
  );
  const [operatingHours, setOperatingHours] = useState(
    supplierProfile?.operatingHours || '06:00 AM - 09:30 PM'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center text-xs">
        <p className="text-slate-600 mb-4">Please log in to manage your profile.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Update user profile
    saveUser({
      ...currentUser,
      fullName,
      phone,
      address,
      locality,
      city,
      pinCode,
    });

    // If supplier, also update supplier profile
    if (role === 'supplier' && supplierProfile) {
      saveSupplier({
        ...supplierProfile,
        businessName,
        tankerCapacityLiters: Number(tankerCapacity),
        pricePerTanker: Number(pricePerTanker),
        serviceAreas: serviceAreas
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        operatingHours,
      });
    }

    refreshUserData();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-slate-800 text-left">
      <button
        onClick={() => {
          if (role === 'customer') onNavigate('customer-dashboard');
          else if (role === 'supplier') onNavigate('supplier-dashboard');
          else onNavigate('admin-dashboard');
        }}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold capitalize bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                {role} Profile
              </span>
              <span className="text-xs text-slate-400">UID: {currentUser.uid}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Profile & Address Settings</h1>
            <p className="text-xs text-slate-500">
              Manage your default water delivery location and contact details
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
            {currentUser.fullName.charAt(0)}
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-center gap-2 font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <span>Profile and delivery address updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Personal Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 border rounded-xl text-slate-500 bg-slate-50 border-slate-200 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Email is tied to your account authentication identity.
              </span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Default Delivery Location</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Flat / House / Street Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat 402, Green Glen Residency, Outer Ring Road"
                className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Locality</label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Supplier Specific Profile Fields */}
          {role === 'supplier' && supplierProfile && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Tanker Fleet Configuration</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Tanker Size (L)</label>
                  <select
                    value={tankerCapacity}
                    onChange={(e) => setTankerCapacity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300"
                  >
                    <option value="4000">4,000 Liters</option>
                    <option value="6000">6,000 Liters</option>
                    <option value="10000">10,000 Liters</option>
                    <option value="12000">12,000 Liters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price per Tanker (₹)</label>
                  <input
                    type="number"
                    required
                    value={pricePerTanker}
                    onChange={(e) => setPricePerTanker(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Localities</label>
                <input
                  type="text"
                  value={serviceAreas}
                  onChange={(e) => setServiceAreas(e.target.value)}
                  placeholder="e.g. Whitefield, Bellandur, Marathahalli"
                  className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
