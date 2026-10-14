import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  addReview,
  createComplaint,
  getReviews,
  getComplaints,
  subscribeToStore,
} from '../../services/storageService';
import { Booking, Review, Complaint } from '../../types';
import {
  ChevronLeft,
  Truck,
  Droplets,
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle,
  Star,
  MessageSquare,
  FileWarning,
  X,
  CreditCard,
  Shield,
} from 'lucide-react';

interface BookingDetailsPageProps {
  bookingId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const BookingDetailsPage: React.FC<BookingDetailsPageProps> = ({
  bookingId,
  onNavigate,
}) => {
  const { currentUser, role } = useAuth();
  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const [existingReview, setExistingReview] = useState<Review | undefined>(undefined);
  const [existingComplaint, setExistingComplaint] = useState<Complaint | undefined>(undefined);

  // Modals & Inputs
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Punctual Delivery',
    'Clean Tanker Equipment',
  ]);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState<Complaint['category']>('late_delivery');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = () => {
    const b = getBookingById(bookingId);
    setBooking(b);
    if (b) {
      const revs = getReviews().find((r) => r.bookingId === b.bookingId);
      setExistingReview(revs);
      const cmps = getComplaints().find((c) => c.bookingId === b.bookingId);
      setExistingComplaint(cmps);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore(loadData);
    return unsub;
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Booking Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The requested booking ID {bookingId} does not exist or was removed.</p>
        <button
          onClick={() => onNavigate('customer-dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isCustomer = currentUser?.uid === booking.customerId;
  const isAssignedSupplier = currentUser?.uid === booking.supplierId;
  const canCancel =
    ['REQUESTED', 'ACCEPTED', 'SCHEDULED'].includes(booking.bookingStatus) &&
    (isCustomer || isAssignedSupplier);

  const handleCancelSubmit = () => {
    if (!cancelReason.trim()) {
      setActionError('Please provide a reason for cancellation');
      return;
    }
    const res = cancelBooking(booking.bookingId, cancelReason, currentUser?.fullName || 'User');
    if (res.success) {
      setShowCancelModal(false);
      setCancelReason('');
    } else {
      setActionError(res.error || 'Failed to cancel');
    }
  };

  const handleReviewSubmit = () => {
    if (!currentUser) return;
    if (!reviewComment.trim()) {
      setActionError('Please enter a brief written comment');
      return;
    }

    const res = addReview({
      bookingId: booking.bookingId,
      customerId: currentUser.uid,
      customerName: currentUser.fullName,
      supplierId: booking.supplierId,
      rating: reviewRating,
      feedbackCategories: selectedTags,
      comment: reviewComment,
    });

    if (res.success) {
      setShowReviewModal(false);
      setReviewComment('');
    } else {
      setActionError(res.error || 'Failed to submit review');
    }
  };

  const handleComplaintSubmit = () => {
    if (!currentUser) return;
    if (!complaintDesc.trim()) {
      setActionError('Please describe the issue in detail');
      return;
    }

    createComplaint({
      bookingId: booking.bookingId,
      customerId: currentUser.uid,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phone,
      supplierId: booking.supplierId,
      supplierName: booking.supplierBusinessName,
      category: complaintCategory,
      description: complaintDesc,
    });

    setShowComplaintModal(false);
    setComplaintDesc('');
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800 text-left">
      {/* Back button */}
      <button
        onClick={() => {
          if (role === 'supplier') onNavigate('supplier-dashboard');
          else if (role === 'admin') onNavigate('admin-dashboard');
          else onNavigate('customer-dashboard');
        }}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-4 cursor-pointer"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                #{booking.bookingId}
              </span>
              {booking.priority === 'urgent' && (
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  URGENT ORDER
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Water Tanker Delivery Details
            </h1>
            <p className="text-xs text-slate-500">
              Placed on {new Date(booking.createdAt).toLocaleDateString()} at{' '}
              {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Agreed Price</span>
            <strong className="text-2xl font-black text-blue-700">₹{booking.agreedPrice}</strong>
            <span className="text-[10px] text-slate-400 block capitalize">
              {booking.paymentMode.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Essential Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block">Water Volume</span>
            <strong className="text-slate-800 text-sm">
              {booking.totalQuantityLiters.toLocaleString()} Liters
            </strong>
            <span className="text-slate-500 text-[11px] block">
              ({booking.numberOfTankers} tanker × {booking.tankerCapacityLiters}L)
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">Water Category</span>
            <strong className="text-slate-800 text-sm capitalize">
              {booking.waterCategory.replace(/_/g, ' ')}
            </strong>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">Scheduled Time</span>
            <strong className="text-slate-800 text-sm">{booking.scheduledDate}</strong>
            <span className="text-slate-500 text-[11px] block">{booking.scheduledTime}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">Current Status</span>
            <span className="inline-block mt-0.5 text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              {booking.bookingStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Live Route & Dispatch Visual Simulation */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dispatch Route Visualization</h3>
              <p className="text-[11px] text-slate-500">Transit corridor from supplier yard to delivery address</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Preview Simulation Mode (Zero-cost Maps)
          </span>
        </div>

        {/* SVG Route Graphic */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-3 right-3 text-[10px] text-teal-300 font-mono bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
            {booking.bookingStatus === 'OUT_FOR_DELIVERY' ? '● EN ROUTE · ETA 15m' : booking.bookingStatus === 'DELIVERED' ? '✓ RUN COMPLETED' : 'STATUS: ' + booking.bookingStatus}
          </div>

          <svg viewBox="0 0 600 160" className="w-full h-auto" fill="none">
            {/* Grid Lines */}
            <path d="M0 40 H600 M0 80 H600 M0 120 H600" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M100 0 V160 M200 0 V160 M300 0 V160 M400 0 V160 M500 0 V160" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

            {/* Road Curve */}
            <path
              d="M 50 110 C 180 110, 220 50, 320 50 C 420 50, 480 110, 550 110"
              stroke="#334155"
              strokeWidth="18"
              strokeLinecap="round"
            />
            {/* Active route highlight */}
            <path
              d="M 50 110 C 180 110, 220 50, 320 50 C 420 50, 480 110, 550 110"
              stroke="#0284c7"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={booking.bookingStatus === 'DELIVERED' ? 'none' : '10 8'}
            />

            {/* Origin Node: Supplier Yard */}
            <circle cx="50" cy="110" r="14" fill="#0369a1" stroke="#38bdf8" strokeWidth="3" />
            <text x="50" y="145" fill="#bae6fd" fontSize="10" textAnchor="middle" fontWeight="bold">Yard / Filling Point</text>
            <text x="50" y="114" fill="#ffffff" fontSize="11" textAnchor="middle" fontWeight="bold">A</text>

            {/* Destination Node: Sump */}
            <circle cx="550" cy="110" r="14" fill="#0d9488" stroke="#2dd4bf" strokeWidth="3" />
            <text x="550" y="145" fill="#99f6e4" fontSize="10" textAnchor="middle" fontWeight="bold">{booking.deliveryAddress.locality} Sump</text>
            <text x="550" y="114" fill="#ffffff" fontSize="11" textAnchor="middle" fontWeight="bold">B</text>

            {/* Moving Tanker Truck Position */}
            {booking.bookingStatus === 'OUT_FOR_DELIVERY' ? (
              <g transform="translate(320, 50)">
                <circle cx="0" cy="0" r="16" fill="#38bdf8" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="12" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="4" fill="#ffffff" fontSize="10" textAnchor="middle">🚚</text>
                <rect x="-40" y="-32" width="80" height="20" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />
                <text x="0" y="-18" fill="#38bdf8" fontSize="8" textAnchor="middle" fontWeight="bold">IN TRANSIT</text>
              </g>
            ) : booking.bookingStatus === 'DELIVERED' ? (
              <g transform="translate(550, 110)">
                <circle cx="0" cy="0" r="16" fill="#10b981" opacity="0.4" />
                <text x="0" y="-22" fill="#34d399" fontSize="9" textAnchor="middle" fontWeight="bold">PUMPED & VERIFIED</text>
              </g>
            ) : (
              <g transform="translate(130, 95)">
                <rect x="-35" y="-25" width="70" height="18" rx="5" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                <text x="0" y="-13" fill="#cbd5e1" fontSize="8" textAnchor="middle">SCHEDULED</text>
              </g>
            )}
          </svg>

          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Supplier: {booking.supplierBusinessName}</span>
            <span>Est Transit: ~5.4 km via Outer Ring Rd</span>
            <span>Destination: {booking.deliveryAddress.buildingName}</span>
          </div>
        </div>
      </div>

      {/* Visual Timeline Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Delivery Progression Timeline</h3>
        <p className="text-xs text-slate-500 mb-6">Live verified state transitions and actor audit trail</p>

        <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-6 text-xs">
          {booking.statusHistory.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  item.status === 'DELIVERED'
                    ? 'bg-emerald-500 ring-4 ring-emerald-100'
                    : item.status === 'CANCELLED'
                    ? 'bg-red-500 ring-4 ring-red-100'
                    : 'bg-blue-600 ring-4 ring-blue-100'
                }`}
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-slate-900 text-xs">
                  {item.status.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(item.timestamp).toLocaleDateString()} ·{' '}
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">{item.note}</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">Updated by: {item.updatedBy}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier & Delivery Address Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs">
        {/* Supplier Info (Revealed per spec once accepted) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Assigned Supplier</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
            <strong className="text-slate-900 text-sm block">
              {booking.supplierBusinessName}
            </strong>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{booking.supplierPhone}</span>
            </div>
            <p className="text-[11px] text-teal-700 font-medium">✓ Verified Supplier Tanker Fleet</p>
          </div>
        </div>

        {/* Destination Address */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Delivery Destination</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
            <strong className="text-slate-900 block">{booking.deliveryAddress.buildingName}</strong>
            <p className="text-slate-600">
              {booking.deliveryAddress.street}, {booking.deliveryAddress.locality}
            </p>
            <p className="text-slate-500 text-[11px]">
              {booking.deliveryAddress.city}, {booking.deliveryAddress.state} - {booking.deliveryAddress.pinCode}
            </p>
            {booking.deliveryAddress.landmark && (
              <p className="text-blue-700 text-[11px] pt-1">
                Landmark: {booking.deliveryAddress.landmark}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Post-Delivery Actions: Review & Complaint */}
      {booking.bookingStatus === 'DELIVERED' && isCustomer && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-200 rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Delivery Complete!
              </h3>
              <p className="text-xs text-emerald-800">
                Delivered at {booking.deliveredAt ? new Date(booking.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}. Please rate your experience.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!existingReview && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Leave Rating
                </button>
              )}
              {!existingComplaint && (
                <button
                  onClick={() => setShowComplaintModal(true)}
                  className="px-3.5 py-2 bg-white text-slate-700 hover:text-red-700 hover:border-red-300 font-semibold text-xs rounded-xl border border-slate-300 transition cursor-pointer flex items-center gap-1.5"
                >
                  <FileWarning className="w-3.5 h-3.5" />
                  File Issue
                </button>
              )}
            </div>
          </div>

          {/* Render Existing Review if present */}
          {existingReview && (
            <div className="p-4 bg-white rounded-xl border border-emerald-200 text-xs space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < existingReview.rating ? 'fill-current' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">
                  Reviewed on {new Date(existingReview.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-700 italic">"{existingReview.comment}"</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {existingReview.feedbackCategories.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Render Existing Complaint if present */}
          {existingComplaint && (
            <div className="p-4 bg-white rounded-xl border border-amber-200 text-xs space-y-2 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-800">
                  Issue Report #{existingComplaint.complaintId}
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {existingComplaint.complaintStatus}
                </span>
              </div>
              <p className="text-slate-700">{existingComplaint.description}</p>
              {existingComplaint.resolutionDetails && (
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-md text-[11px]">
                  <strong>Admin Resolution:</strong> {existingComplaint.resolutionDetails}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cancellation Section */}
      {canCancel && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-slate-900 block">Need to cancel this booking?</span>
            <p className="text-slate-500 text-[11px]">
              Cancellation is permitted before the tanker driver departs for your locality.
            </p>
          </div>
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-semibold rounded-xl border border-red-200 transition cursor-pointer"
          >
            Cancel Booking
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Confirm Booking Cancellation</h3>
            <p className="text-slate-600">
              Please enter the reason for cancelling delivery #{booking.bookingId}.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Municipal water restored / Rescheduling for tomorrow"
              className="w-full p-2.5 border rounded-xl text-slate-900 border-slate-300 focus:ring-2 focus:ring-red-500"
            />
            {actionError && <p className="text-red-600">{actionError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleCancelSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate & Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Rate Delivery Experience</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            {/* Star selector */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewRating(s)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      s <= reviewRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Quick tags */}
            <div>
              <label className="block font-semibold text-slate-700 mb-2">Service Highlights</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Punctual Delivery',
                  'Clean Tanker Equipment',
                  'Clear Water / Low TDS',
                  'Courteous Driver',
                  'Accurate Pumping Meter',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-50 border-blue-400 text-blue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Written Review *</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share feedback on water cleanliness, hose length, or arrival speed..."
                className="w-full p-2.5 border rounded-xl text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">File Service Issue or Complaint</h3>
              <button onClick={() => setShowComplaintModal(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Complaint Category</label>
              <select
                value={complaintCategory}
                onChange={(e) => setComplaintCategory(e.target.value as Complaint['category'])}
                className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
              >
                <option value="late_delivery">Late Delivery / Significant Delay</option>
                <option value="water_quality_issue">Water Quality / Sediment / Odor</option>
                <option value="price_dispute">Price Dispute / Extra Demands</option>
                <option value="unprofessional_behavior">Unprofessional Driver Conduct</option>
                <option value="non_delivery">Non-Delivery</option>
                <option value="other">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                rows={4}
                value={complaintDesc}
                onChange={(e) => setComplaintDesc(e.target.value)}
                placeholder="Explain what happened with dates, driver statements, or water condition..."
                className="w-full p-2.5 border rounded-xl text-slate-900 border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowComplaintModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleComplaintSubmit}
                className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md"
              >
                Submit to Admin Desk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
