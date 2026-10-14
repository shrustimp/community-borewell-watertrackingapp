import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getWaterRequests,
  getBookings,
  getSupplierById,
  acceptWaterRequestAndCreateBooking,
  updateBookingStatus,
  getReviews,
  subscribeToStore,
} from '../../services/storageService';
import { WaterRequest, Booking, Review, BookingStatus } from '../../types';
import {
  Truck,
  Droplets,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Phone,
  DollarSign,
  Star,
  ArrowRight,
  ShieldAlert,
  Play,
  Check,
} from 'lucide-react';

interface SupplierDashboardProps {
  onNavigate: (view: string, param?: string) => void;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ onNavigate }) => {
  const { currentUser, supplierProfile } = useAuth();
  const [openRequests, setOpenRequests] = useState<WaterRequest[]>([]);
  const [assignedBookings, setAssignedBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Accept modal state
  const [acceptingRequest, setAcceptingRequest] = useState<WaterRequest | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(850);
  const [scheduledSlot, setScheduledSlot] = useState<string>('08:30 AM');

  const loadData = () => {
    if (!currentUser) return;
    const allRequests = getWaterRequests();
    // Filter open requests
    const open = allRequests.filter((r) => r.requestStatus === 'OPEN');
    setOpenRequests(open);

    // Bookings for this supplier
    const allBookings = getBookings().filter((b) => b.supplierId === currentUser.uid);
    setAssignedBookings(allBookings);

    // Reviews for this supplier
    const allRevs = getReviews().filter((r) => r.supplierId === currentUser.uid);
    setReviews(allRevs);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore(loadData);
    return unsub;
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <p className="text-slate-600 mb-4">Please log in to access the supplier dashboard.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const isApproved = supplierProfile?.approvalStatus === 'approved';
  const isPending = supplierProfile?.approvalStatus === 'pending';

  // Metrics
  const activeBookings = assignedBookings.filter(
    (b) => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(b.bookingStatus)
  );
  const inProgressDeliveries = assignedBookings.filter(
    (b) => b.bookingStatus === 'OUT_FOR_DELIVERY'
  );
  const completedDeliveries = assignedBookings.filter(
    (b) => b.bookingStatus === 'DELIVERED'
  );
  const totalEarnings = completedDeliveries.reduce((sum, b) => sum + b.agreedPrice, 0);

  const handleOpenAcceptModal = (req: WaterRequest) => {
    if (!isApproved) {
      setActionMessage({
        type: 'error',
        text: 'Your account is pending admin approval. You cannot accept requests until approved.',
      });
      return;
    }
    setAcceptingRequest(req);
    // Suggest price based on supplier's rate
    setCustomPrice(
      supplierProfile?.pricePerTanker
        ? supplierProfile.pricePerTanker * req.numberOfTankers
        : req.estimatedBudget || 850
    );
    setScheduledSlot(req.preferredTime || '08:30 AM');
  };

  const handleConfirmAccept = () => {
    if (!acceptingRequest) return;

    const res = acceptWaterRequestAndCreateBooking({
      requestId: acceptingRequest.requestId,
      supplierId: currentUser.uid,
      agreedPrice: Number(customPrice),
      scheduledTime: scheduledSlot,
    });

    if (res.success) {
      setActionMessage({
        type: 'success',
        text: `Successfully accepted request ${acceptingRequest.requestId}! Booking ${res.booking?.bookingId} created.`,
      });
      setAcceptingRequest(null);
    } else {
      setActionMessage({
        type: 'error',
        text: res.error || 'Failed to accept request',
      });
    }
  };

  const handleStatusUpdate = (bookingId: string, nextStatus: BookingStatus, note: string) => {
    const res = updateBookingStatus(
      bookingId,
      nextStatus,
      note,
      supplierProfile?.businessName || currentUser.fullName
    );

    if (res.success) {
      setActionMessage({
        type: 'success',
        text: `Booking status updated to ${nextStatus}`,
      });
    } else {
      setActionMessage({
        type: 'error',
        text: res.error || 'Failed to advance status',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800 text-left">
      {/* Pending Approval Banner if applicable */}
      {isPending && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <strong>Registration Verification Pending:</strong> Your supplier profile is currently under review by the platform administrator. You can view open market requests below, but order acceptance will be enabled once your vehicle and water source credentials are approved.
          </div>
        </div>
      )}

      {/* Action feedback */}
      {actionMessage && (
        <div
          className={`mb-6 p-3 rounded-xl border text-xs flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-500 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Supplier Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-sky-300 text-xs font-medium mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Supplier Operations Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {supplierProfile?.businessName || currentUser.fullName}
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Owner: {supplierProfile?.ownerName || currentUser.fullName} · Phone: {currentUser.phone} · Base: {supplierProfile?.tankerCapacityLiters}L Fleet
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/20 text-center">
            <span className="text-[10px] text-slate-300 block uppercase tracking-wider">Estimated Revenue</span>
            <strong className="text-xl text-teal-300 font-black">₹{totalEarnings.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Open Market Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{openRequests.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Available to accept</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Accepted & Scheduled</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{activeBookings.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Ready for dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Out for Delivery</span>
            <Play className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{inProgressDeliveries.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Tankers en route</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Delivered Trips</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{completedDeliveries.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Completed successfully</p>
        </div>
      </div>

      {/* Main Sections: Incoming Open Requests + Active Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Incoming Open Requests */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Incoming Water Delivery Requests ({openRequests.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Broadcasted demand from nearby residents and communities
                </p>
              </div>
              <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-1 rounded font-medium border border-teal-200">
                Live Broadcast Feed
              </span>
            </div>

            {openRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No open delivery requests currently broadcasting. Check back shortly.
              </div>
            ) : (
              <div className="space-y-4">
                {openRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/50 text-xs space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{req.requestId}</span>
                          {req.priority === 'urgent' && (
                            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                              URGENT
                            </span>
                          )}
                          <span className="text-slate-500 capitalize">· {req.requestType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Locality: <strong>{req.deliveryAddress.locality}</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-blue-700 block">
                          {req.totalQuantityLiters.toLocaleString()} Liters
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {req.numberOfTankers} tanker ({req.tankerCapacityLiters}L)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-white rounded-lg border border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Requested Slot:</span>
                        <span className="font-semibold text-slate-800">
                          {req.preferredDate} ({req.preferredTime})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Water Type:</span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {req.waterCategory.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {req.instructions && (
                      <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded border border-slate-100">
                        <strong>Customer Note:</strong> {req.instructions}
                      </p>
                    )}

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400">
                        *Full address & phone revealed upon acceptance
                      </span>
                      <button
                        onClick={() => handleOpenAcceptModal(req)}
                        disabled={!isApproved}
                        className={`px-4 py-2 font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                          isApproved
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Accept & Lock Slot
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assigned Bookings & Status Control */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Active Assigned Bookings ({activeBookings.length})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Advance dispatch status as your tanker delivers water
            </p>

            {activeBookings.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No active bookings right now. Accept open requests on the left to start runs.
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((b) => (
                  <div
                    key={b.bookingId}
                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs shadow-2xs"
                  >
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{b.bookingId}</span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {b.bookingStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {b.scheduledDate} · {b.scheduledTime}
                        </p>
                      </div>

                      <div className="text-right">
                        <strong className="text-blue-700 text-sm font-black">₹{b.agreedPrice}</strong>
                      </div>
                    </div>

                    {/* Customer Contact Details (Authorized disclosure upon acceptance per spec) */}
                    <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{b.customerName}</span>
                        <a
                          href={`tel:${b.customerPhone}`}
                          className="flex items-center gap-1 text-blue-700 hover:underline"
                        >
                          <Phone className="w-3 h-3" /> {b.customerPhone}
                        </a>
                      </div>
                      <p className="text-slate-600">
                        {b.deliveryAddress.buildingName}, {b.deliveryAddress.street}, {b.deliveryAddress.locality}
                      </p>
                      {b.deliveryAddress.landmark && (
                        <p className="text-slate-500 text-[10px]">Landmark: {b.deliveryAddress.landmark}</p>
                      )}
                    </div>

                    {/* Status Advance Controls */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onNavigate('booking-details', b.bookingId)}
                        className="text-slate-500 hover:text-slate-800 text-[11px] underline"
                      >
                        View Full Timeline
                      </button>

                      <div className="flex items-center gap-1.5">
                        {b.bookingStatus === 'ACCEPTED' && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                b.bookingId,
                                'SCHEDULED',
                                `Driver locked for run slot ${b.scheduledTime}`
                              )
                            }
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px] rounded-lg transition"
                          >
                            Mark Scheduled
                          </button>
                        )}

                        {b.bookingStatus === 'SCHEDULED' && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                b.bookingId,
                                'OUT_FOR_DELIVERY',
                                'Tanker filled and dispatched to location'
                              )
                            }
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] rounded-lg transition flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Start Run (Dispatch)
                          </button>
                        )}

                        {b.bookingStatus === 'OUT_FOR_DELIVERY' && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                b.bookingId,
                                'DELIVERED',
                                'Water pumped into sump and verified'
                              )
                            }
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg transition flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Reviews for this supplier */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900">Customer Ratings & Reviews</h3>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{supplierProfile?.averageRating || 4.8} / 5</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400">No reviews received yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 3).map((r) => (
                  <div key={r.reviewId} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">{r.customerName}</span>
                      <div className="flex text-amber-400">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic text-[11px]">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accept Request Modal */}
      {acceptingRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Accept Water Delivery Request</h3>
              <button
                onClick={() => setAcceptingRequest(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Request ID:</span>
                <strong className="text-slate-800">{acceptingRequest.requestId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Locality:</span>
                <strong className="text-slate-800">{acceptingRequest.deliveryAddress.locality}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Volume:</span>
                <strong className="text-blue-700 font-bold">
                  {acceptingRequest.totalQuantityLiters.toLocaleString()} Liters
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Date:</span>
                <strong className="text-slate-800">{acceptingRequest.preferredDate}</strong>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Agreed Total Price (₹) *
              </label>
              <input
                type="number"
                min="100"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300 font-bold"
              />
              <span className="text-[10px] text-slate-400">
                Customer's estimated budget: ₹{acceptingRequest.estimatedBudget || 850}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirmed Delivery Slot *
              </label>
              <input
                type="text"
                value={scheduledSlot}
                onChange={(e) => setScheduledSlot(e.target.value)}
                placeholder="e.g. 08:30 AM"
                className="w-full px-3 py-2 border rounded-xl text-slate-900 border-slate-300"
              />
            </div>

            <div className="p-2.5 bg-amber-50 text-amber-800 rounded-lg text-[11px]">
              <strong>Atomic Lock:</strong> Accepting locks this request exclusively to your business fleet and creates a verified booking.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAcceptingRequest(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md"
              >
                Confirm Acceptance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
