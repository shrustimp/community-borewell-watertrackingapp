import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import {
  User,
  Truck,
  Mail,
  Phone,
  Lock,
  MapPin,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Clock,
  Droplet,
} from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { registerCustomer, registerSupplier } = useAuth();
  const [roleTab, setRoleTab] = useState<'customer' | 'supplier'>('customer');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Customer state
  const [custForm, setCustForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    locality: '',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pinCode: '',
  });

  // Supplier state
  const [suppForm, setSuppForm] = useState({
    ownerName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessAddress: '',
    serviceAreasInput: 'Whitefield, Bellandur, Marathahalli',
    tankerCapacityLiters: '6000',
    numberOfTankers: '1',
    vehicleRegistrationNumber: '',
    pricePerTanker: '850',
    pricePerKiloliter: '140',
    waterSourceInfo: 'Certified deep aquifer wellhead with sediment and UV filtration.',
    operatingHours: '06:00 AM - 09:00 PM',
  });

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!custForm.fullName.trim()) return setError('Full name is required');
    if (!custForm.email.includes('@')) return setError('Valid email is required');
    if (custForm.phone.replace(/\D/g, '').length < 10) return setError('Valid 10-digit phone number is required');
    if (custForm.password.length < 6) return setError('Password must be at least 6 characters');
    if (custForm.password !== custForm.confirmPassword) return setError('Passwords do not match');
    if (!custForm.address.trim()) return setError('Default delivery address is required');
    if (!custForm.locality.trim()) return setError('Locality / Village is required');
    if (!/^\d{6}$/.test(custForm.pinCode.trim())) return setError('PIN code must be exactly 6 digits');

    const res = registerCustomer({
      fullName: custForm.fullName,
      email: custForm.email,
      phone: custForm.phone,
      address: custForm.address,
      locality: custForm.locality,
      city: custForm.city,
      district: custForm.district,
      state: custForm.state,
      pinCode: custForm.pinCode,
    });

    if (res.success) {
      setSuccessMsg('Customer account created successfully!');
      setTimeout(() => onNavigate('customer-dashboard'), 1200);
    } else {
      setError(res.error || 'Failed to register account');
    }
  };

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!suppForm.ownerName.trim()) return setError('Owner name is required');
    if (!suppForm.businessName.trim()) return setError('Business or Tanker name is required');
    if (!suppForm.email.includes('@')) return setError('Valid email is required');
    if (suppForm.phone.replace(/\D/g, '').length < 10) return setError('Valid 10-digit phone number is required');
    if (suppForm.password.length < 6) return setError('Password must be at least 6 characters');
    if (suppForm.password !== suppForm.confirmPassword) return setError('Passwords do not match');
    if (!suppForm.businessAddress.trim()) return setError('Business yard address is required');
    if (Number(suppForm.tankerCapacityLiters) <= 0) return setError('Tanker capacity must be greater than zero');
    if (Number(suppForm.pricePerTanker) <= 0) return setError('Price per tanker must be greater than zero');

    const serviceAreas = suppForm.serviceAreasInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (serviceAreas.length === 0) return setError('Enter at least one service area or locality');

    const res = registerSupplier({
      ownerName: suppForm.ownerName,
      businessName: suppForm.businessName,
      email: suppForm.email,
      phone: suppForm.phone,
      businessAddress: suppForm.businessAddress,
      serviceAreas,
      tankerCapacityLiters: Number(suppForm.tankerCapacityLiters),
      numberOfTankers: Number(suppForm.numberOfTankers),
      vehicleRegistrationNumber: suppForm.vehicleRegistrationNumber || 'KA-53-MC-XXXX',
      pricePerTanker: Number(suppForm.pricePerTanker),
      pricePerKiloliter: Number(suppForm.pricePerKiloliter) || undefined,
      waterCategories: ['potable', 'utility'],
      waterSourceInfo: suppForm.waterSourceInfo,
      operatingHours: suppForm.operatingHours,
    });

    if (res.success) {
      setSuccessMsg('Supplier profile submitted! Account is currently in Pending Approval state for admin verification.');
      setTimeout(() => onNavigate('supplier-dashboard'), 2000);
    } else {
      setError(res.error || 'Failed to submit supplier registration');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Logo size="lg" showTagline={false} />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900">
            Join the JalaConnect Network
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Register as a community resident customer or a verified water tanker supplier
          </p>

          {/* Role Tabs */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-xl bg-slate-200/80 p-1 border border-slate-300">
              <button
                type="button"
                onClick={() => {
                  setRoleTab('customer');
                  setError(null);
                }}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  roleTab === 'customer'
                    ? 'bg-white text-blue-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-blue-600" />
                Customer (Household / Community)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoleTab('supplier');
                  setError(null);
                }}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  roleTab === 'supplier'
                    ? 'bg-white text-sky-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-4 h-4 text-sky-600" />
                Water Tanker Supplier
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2 text-xs text-teal-800 font-semibold">
              <CheckCircle className="w-4 h-4 shrink-0 text-teal-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {roleTab === 'customer' ? (
            /* CUSTOMER REGISTRATION FORM */
            <form onSubmit={handleCustomerSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={custForm.fullName}
                    onChange={(e) => setCustForm({ ...custForm, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={custForm.email}
                    onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={custForm.phone}
                    onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Locality / Village *</label>
                  <input
                    type="text"
                    required
                    value={custForm.locality}
                    onChange={(e) => setCustForm({ ...custForm, locality: e.target.value })}
                    placeholder="e.g. Bellandur / Whitefield"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Delivery Address (Building / Society / Street) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={custForm.address}
                  onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
                  placeholder="Flat No, Apartment Name, Street, Landmark"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={custForm.city}
                    onChange={(e) => setCustForm({ ...custForm, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={custForm.district}
                    onChange={(e) => setCustForm({ ...custForm, district: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={custForm.pinCode}
                    onChange={(e) => setCustForm({ ...custForm, pinCode: e.target.value })}
                    placeholder="560103"
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={custForm.password}
                    onChange={(e) => setCustForm({ ...custForm, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={custForm.confirmPassword}
                    onChange={(e) => setCustForm({ ...custForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
              >
                Register Customer Account
              </button>
            </form>
          ) : (
            /* SUPPLIER REGISTRATION FORM */
            <form onSubmit={handleSupplierSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                <strong>Supplier Verification Policy:</strong> Newly registered supplier accounts are placed in <em>Pending Approval</em> status. An administrator reviews your water source documentation and tanker details before order acceptance is activated.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={suppForm.ownerName}
                    onChange={(e) => setSuppForm({ ...suppForm, ownerName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanker / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={suppForm.businessName}
                    onChange={(e) => setSuppForm({ ...suppForm, businessName: e.target.value })}
                    placeholder="e.g. Kaveri Fresh Water Tankers"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={suppForm.email}
                    onChange={(e) => setSuppForm({ ...suppForm, email: e.target.value })}
                    placeholder="owner@tankers.com"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={suppForm.phone}
                    onChange={(e) => setSuppForm({ ...suppForm, phone: e.target.value })}
                    placeholder="+91 94480 12345"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Yard Address *</label>
                <input
                  type="text"
                  required
                  value={suppForm.businessAddress}
                  onChange={(e) => setSuppForm({ ...suppForm, businessAddress: e.target.value })}
                  placeholder="Yard address, filling station location"
                  className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Tanker Liters *</label>
                  <select
                    value={suppForm.tankerCapacityLiters}
                    onChange={(e) => setSuppForm({ ...suppForm, tankerCapacityLiters: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
                  >
                    <option value="4000">4,000 Liters (Mini)</option>
                    <option value="6000">6,000 Liters (Standard)</option>
                    <option value="10000">10,000 Liters (Heavy)</option>
                    <option value="12000">12,000 Liters (Bulk)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price per Tanker (₹) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={suppForm.pricePerTanker}
                    onChange={(e) => setSuppForm({ ...suppForm, pricePerTanker: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price / kL (Optional)</label>
                  <input
                    type="number"
                    value={suppForm.pricePerKiloliter}
                    onChange={(e) => setSuppForm({ ...suppForm, pricePerKiloliter: e.target.value })}
                    placeholder="140"
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Service Localities (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={suppForm.serviceAreasInput}
                  onChange={(e) => setSuppForm({ ...suppForm, serviceAreasInput: e.target.value })}
                  placeholder="Whitefield, Bellandur, Marathahalli, Varthur"
                  className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={suppForm.operatingHours}
                    onChange={(e) => setSuppForm({ ...suppForm, operatingHours: e.target.value })}
                    placeholder="06:00 AM - 09:30 PM"
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehicle Registration #</label>
                  <input
                    type="text"
                    value={suppForm.vehicleRegistrationNumber}
                    onChange={(e) => setSuppForm({ ...suppForm, vehicleRegistrationNumber: e.target.value })}
                    placeholder="KA-53-MC-XXXX"
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Water Source Information *</label>
                <textarea
                  rows={2}
                  required
                  value={suppForm.waterSourceInfo}
                  onChange={(e) => setSuppForm({ ...suppForm, waterSourceInfo: e.target.value })}
                  placeholder="Details regarding aquifer source, filtration, TDS check frequency"
                  className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={suppForm.password}
                    onChange={(e) => setSuppForm({ ...suppForm, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={suppForm.confirmPassword}
                    onChange={(e) => setSuppForm({ ...suppForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900 border-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
              >
                Submit Supplier Registration for Verification
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered on JalaConnect?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Sign in to your account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
