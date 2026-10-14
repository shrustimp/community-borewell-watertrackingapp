import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createWaterRequest, getSuppliers } from '../../services/storageService';
import {
  RequestType,
  WaterCategory,
  RequestPriority,
  WaterRequest,
} from '../../types';
import {
  Droplets,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  Shield,
  Truck,
  DollarSign,
  ChevronLeft,
} from 'lucide-react';

interface NewWaterRequestPageProps {
  onNavigate: (view: string, param?: string) => void;
  preselectedSupplierId?: string;
}

export const NewWaterRequestPage: React.FC<NewWaterRequestPageProps> = ({
  onNavigate,
  preselectedSupplierId,
}) => {
  const { currentUser } = useAuth();

  // Form State
  const [requestType, setRequestType] = useState<RequestType>('household');
  const [numberOfTankers, setNumberOfTankers] = useState<number>(1);
  const [tankerCapacityLiters, setTankerCapacityLiters] = useState<number>(6000);
  const [waterCategory, setWaterCategory] = useState<WaterCategory>('potable');
  const [categoryNotes, setCategoryNotes] = useState<string>('');

  // Address
  const [buildingName, setBuildingName] = useState<string>(
    currentUser?.address || 'Green Glen Residency Flat 402'
  );
  const [street, setStreet] = useState<string>('Outer Ring Road, Near EcoSpace');
  const [locality, setLocality] = useState<string>(currentUser?.locality || 'Bellandur');
  const [city, setCity] = useState<string>(currentUser?.city || 'Bengaluru');
  const [district, setDistrict] = useState<string>(currentUser?.district || 'Bengaluru Urban');
  const [state, setState] = useState<string>(currentUser?.state || 'Karnataka');
  const [pinCode, setPinCode] = useState<string>(currentUser?.pinCode || '560103');
  const [landmark, setLandmark] = useState<string>('Behind Central Mall');

  // Schedule (today or future)
  const todayStr = new Date().toISOString().split('T')[0];
  const [preferredDate, setPreferredDate] = useState<string>(todayStr);
  const [preferredTime, setPreferredTime] = useState<string>('08:00 AM - 10:00 AM');
  const [alternativeTime, setAlternativeTime] = useState<string>('10:00 AM - 12:00 PM');
  const [priority, setPriority] = useState<RequestPriority>('normal');
  const [instructions, setInstructions] = useState<string>(
    'Underground sump intake valve next to main driveway. Please bring 2.5-inch hose pipe.'
  );
  const [customerPhone, setCustomerPhone] = useState<string>(
    currentUser?.phone || '+91 98765 43210'
  );

  // Modal / Review state
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<WaterRequest | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculate totals & estimates
  const totalQuantityLiters = numberOfTankers * tankerCapacityLiters;

  // Approximate base rate based on actual supplier pricing
  const calculateEstimate = () => {
    let ratePerTanker = 850;
    if (tankerCapacityLiters <= 4000) ratePerTanker = 650;
    else if (tankerCapacityLiters === 6000) ratePerTanker = 850;
    else if (tankerCapacityLiters === 10000) ratePerTanker = 1350;
    else if (tankerCapacityLiters >= 12000) ratePerTanker = 1600;

    let total = ratePerTanker * numberOfTankers;
    if (priority === 'urgent') total += 100 * numberOfTankers; // Urgent surcharge
    return total;
  };

  const estimatedPrice = calculateEstimate();

  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!buildingName.trim()) return setValidationError('Building or house address is required');
    if (!locality.trim()) return setValidationError('Locality is required');
    if (!preferredDate) return setValidationError('Preferred delivery date is required');
    if (preferredDate < todayStr) return setValidationError('Delivery date cannot be in the past');
    if (!customerPhone.trim()) return setValidationError('Contact phone number is required');

    setShowReviewModal(true);
  };

  const handleFinalSubmit = () => {
    if (!currentUser) {
      alert('Please sign in to place an order');
      return;
    }

    const newReq = createWaterRequest({
      customerId: currentUser.uid,
      customerName: currentUser.fullName,
      customerPhone: customerPhone,
      requestType,
      numberOfTankers,
      tankerCapacityLiters,
      totalQuantityLiters,
      waterCategory,
      deliveryAddress: {
        buildingName,
        street,
        locality,
        city,
        district,
        state,
        pinCode,
        landmark,
      },
      preferredDate,
      preferredTime,
      alternativeTime,
      priority,
      instructions: categoryNotes ? `${instructions} | Water note: ${categoryNotes}` : instructions,
      estimatedBudget: estimatedPrice,
    });

    setSubmittedRequest(newReq);
    setShowReviewModal(false);
  };

  if (submittedRequest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Request Broadcast Active
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">
              Water Request #{submittedRequest.requestId} Placed!
            </h2>
            <p className="text-slate-600 text-xs mt-1 max-w-md mx-auto">
              Your request for <strong>{submittedRequest.totalQuantityLiters.toLocaleString()} Liters</strong> of {submittedRequest.waterCategory} water has been broadcast to approved suppliers serving <strong>{submittedRequest.deliveryAddress.locality}</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Scheduled Date:</span>
              <strong className="text-slate-800">{submittedRequest.preferredDate} ({submittedRequest.preferredTime})</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Delivery Locality:</span>
              <strong className="text-slate-800">{submittedRequest.deliveryAddress.buildingName}, {submittedRequest.deliveryAddress.locality}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Priority:</span>
              <span className={`font-bold ${submittedRequest.priority === 'urgent' ? 'text-red-600' : 'text-slate-800'}`}>
                {submittedRequest.priority.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Estimated Price:</span>
              <strong className="text-blue-700 text-sm">₹{submittedRequest.estimatedBudget}</strong>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs text-left">
            <strong>What happens next?</strong> As soon as a local tanker operator accepts your request, your status will update to <em>Accepted</em> and the driver's contact number will appear in your live tracking dashboard.
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => onNavigate('customer-dashboard')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Go to Customer Dashboard
            </button>
            <button
              onClick={() => {
                setSubmittedRequest(null);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Book Another Tanker
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-800">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => onNavigate('customer-dashboard')}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-2 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Schedule Water Tanker Delivery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify quantity, tanker size, schedule, and delivery instructions
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Transparent Pricing</span>
        </div>
      </div>

      {validationError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleOpenReview} className="space-y-8 text-xs text-left">
        {/* 1. Request Type */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
            Request Type
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { id: 'household', label: 'Household (Individual)' },
              { id: 'apartment_community', label: 'Apartment / Society' },
              { id: 'commercial', label: 'Commercial' },
              { id: 'event', label: 'Event / Gathering' },
              { id: 'emergency', label: 'Emergency Supply' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRequestType(t.id as RequestType)}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  requestType === t.id
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Water Quantity & Tanker Size */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
            Water Quantity & Tanker Capacity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanker Capacity (Per Vehicle)
              </label>
              <select
                value={tankerCapacityLiters}
                onChange={(e) => setTankerCapacityLiters(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="4000">4,000 Liters (Mini Tanker)</option>
                <option value="6000">6,000 Liters (Standard Tanker)</option>
                <option value="10000">10,000 Liters (Heavy Multi-Axle)</option>
                <option value="12000">12,000 Liters (Large Community Tanker)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Number of Tankers</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfTankers}
                  onChange={(e) => setNumberOfTankers(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-500">tanker(s)</span>
              </div>
            </div>

            <div className="bg-sky-50 p-3 rounded-xl border border-sky-100 flex flex-col justify-center">
              <span className="text-[11px] text-sky-800 font-medium">Total Quantity Calculated:</span>
              <strong className="text-lg text-blue-900 font-black">
                {totalQuantityLiters.toLocaleString()} Liters
              </strong>
              <span className="text-[10px] text-slate-500">
                {(totalQuantityLiters / 1000).toFixed(1)} Kiloliters (kL)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Water Category Requirements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">3</span>
            Water Category & Purpose
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'potable',
                title: 'Potable Water (Filtered)',
                desc: 'Clean domestic use, sump refill, kitchen prep.',
              },
              {
                id: 'utility',
                title: 'Utility / Construction Water',
                desc: 'Gardening, washing, overhead non-potable flushing.',
              },
              {
                id: 'drinking_certified',
                title: 'Drinking Certified (Low TDS)',
                desc: 'Certified water test lab batch for direct treatment.',
              },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setWaterCategory(cat.id as WaterCategory)}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  waterCategory === cat.id
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{cat.title}</span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border ${
                      waterCategory === cat.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-500">{cat.desc}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Specific Water Requirement Notes (Optional)
            </label>
            <input
              type="text"
              value={categoryNotes}
              onChange={(e) => setCategoryNotes(e.target.value)}
              placeholder="e.g. Needs TDS below 200, or specific pipe length"
              className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
            />
          </div>
        </div>

        {/* 4. Delivery Address */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">4</span>
            Delivery Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                House / Building / Apartment Name *
              </label>
              <input
                type="text"
                required
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                placeholder="e.g. Green Glen Residency, Flat 402"
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Street / Road *
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Outer Ring Road, Near EcoSpace"
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Locality / Village *</label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Bellandur"
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PIN Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="560103"
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Landmark / Delivery Instructions</label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Opposite Community Hall Gate 2"
              className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
            />
          </div>
        </div>

        {/* 5. Schedule & Priority */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">5</span>
            Schedule & Delivery Priority
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Delivery Date *</label>
              <input
                type="date"
                required
                min={todayStr}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Time Window *</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
              >
                <option value="06:00 AM - 08:00 AM">Early Morning (06:00 AM - 08:00 AM)</option>
                <option value="08:00 AM - 10:00 AM">Morning Peak (08:00 AM - 10:00 AM)</option>
                <option value="10:00 AM - 12:00 PM">Mid Day (10:00 AM - 12:00 PM)</option>
                <option value="02:00 PM - 04:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                <option value="04:00 PM - 06:00 PM">Evening (04:00 PM - 06:00 PM)</option>
                <option value="06:00 PM - 08:30 PM">Night (06:00 PM - 08:30 PM)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alternative Slot</label>
              <input
                type="text"
                value={alternativeTime}
                onChange={(e) => setAlternativeTime(e.target.value)}
                placeholder="e.g. Next day 7 AM if delayed"
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-2">Priority Level</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  priority === 'normal'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <span className="block text-xs">Standard Scheduling</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Standard queue based on driver availability
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  priority === 'urgent'
                    ? 'border-red-600 bg-red-50 text-red-900 font-bold'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <span className="flex items-center gap-1.5 text-xs text-red-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Urgent Delivery (Emergency Sump Refill)
                </span>
                <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                  Flags incoming alert on supplier dashboards (does not guarantee instant arrival)
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 6. Contact & Driver Instructions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">6</span>
            Contact & Pumping Instructions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Phone Number (For Driver on Acceptance) *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sump / Pipe Instructions
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Sump is 20m from gate; bring 2.5 inch hose"
                className="w-full px-3 py-2 border rounded-lg text-slate-900 border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Estimated Price Lock Preview */}
        <div className="bg-gradient-to-r from-blue-900 to-sky-900 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-sky-300 font-medium uppercase tracking-wider">
              Transparent Estimate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black">₹{estimatedPrice}</span>
              <span className="text-xs text-slate-300">
                ({numberOfTankers} tanker × {tankerCapacityLiters.toLocaleString()}L)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Based on verified average supplier rates in {locality}. Excludes unusual excess hose extension fees.
            </p>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-teal-400 hover:bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            Review & Broadcast Request
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Review Screen Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800 text-xs">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-sky-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Review Water Delivery Request</h3>
                <p className="text-[11px] text-sky-200">Verify details before broadcast to suppliers</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-white hover:text-slate-300 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Request Type:</span>
                  <strong className="text-slate-800 capitalize">{requestType.replace('_', ' ')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Quantity:</span>
                  <strong className="text-blue-700">{totalQuantityLiters.toLocaleString()} Liters ({numberOfTankers} × {tankerCapacityLiters}L)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Water Category:</span>
                  <strong className="text-slate-800 capitalize">{waterCategory.replace('_', ' ')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Priority:</span>
                  <span className={`font-bold ${priority === 'urgent' ? 'text-red-600' : 'text-slate-800'}`}>
                    {priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Delivery Destination</h4>
                <p className="text-slate-700">
                  {buildingName}, {street}, {locality}, {city} - {pinCode}
                </p>
                {landmark && <p className="text-slate-500 text-[11px]">Landmark: {landmark}</p>}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Schedule</h4>
                <p className="text-slate-700">
                  {preferredDate} between {preferredTime}
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-600 text-[11px] block">Estimated Locked Total:</span>
                  <strong className="text-base text-blue-900">₹{estimatedPrice}</strong>
                </div>
                <span className="text-[11px] text-blue-700 font-semibold bg-white px-2 py-1 rounded border border-blue-200">
                  Cash or UPI on Delivery
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-100 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition cursor-pointer"
              >
                Confirm & Broadcast Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
