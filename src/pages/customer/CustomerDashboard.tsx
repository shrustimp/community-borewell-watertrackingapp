import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getBookings,
  getWaterRequests,
  getSuppliers,
  subscribeToStore,
} from '../../services/storageService';
import { Booking, WaterRequest, SupplierProfile } from '../../types';
import {
  Droplets,
  Clock,
  CheckCircle,
  Truck,
  Plus,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

interface CustomerDashboardProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<WaterRequest[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);

  const loadData = () => {
    if (!currentUser) return;
    const allBookings = getBookings().filter((b) => b.customerId === currentUser.uid);
    const allRequests = getWaterRequests().filter((r) => r.customerId === currentUser.uid);
    setBookings(allBookings);
    setRequests(allRequests);
    setSuppliers(getSuppliers().filter((s) => s.approvalStatus === 'approved'));
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore(loadData);
    return unsub;
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-600 mb-4">Please log in to access your customer dashboard.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // Summary Metrics
  const activeBookings = bookings.filter(
    (b) => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(b.bookingStatus)
  );
  const pendingRequests = requests.filter((r) => r.requestStatus === 'OPEN');
  const completedDeliveries = bookings.filter((b) => b.bookingStatus === 'DELIVERED');
  const totalWaterOrderedLiters = bookings
    .filter((b) => b.bookingStatus === 'DELIVERED')
    .reduce((sum, b) => sum + b.totalQuantityLiters, 0);

  // Most recent active booking to feature in the tracker
  const currentActiveBooking = activeBookings[0] || bookings[0];

  const getStatusBadge = (status: Booking['bookingStatus']) => {
    switch (status) {
      case 'REQUESTED':
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">Awaiting Supplier</span>;
      case 'ACCEPTED':
        return <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">Supplier Accepted</span>;
      case 'SCHEDULED':
        return <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">Scheduled</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />Out for Delivery</span>;
      case 'DELIVERED':
        return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">Delivered</span>;
      case 'CANCELLED':
        return <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">Cancelled</span>;
      default:
        return <span className="text-xs text-slate-600">{status}</span>;
    }
  };

  const [dashboardTab, setDashboardTab] = useState<'overview' | 'active' | 'requests' | 'history'>('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-900 to-sky-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-800/80 text-sky-300 text-xs font-medium mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{currentUser.locality}, {currentUser.city}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.fullName}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Manage your residential water tanker orders, track incoming deliveries, and check neighborhood borewell pump records.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('new-request')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Book Water Delivery
          </button>
          <button
            onClick={() => onNavigate('supplier-discovery')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition cursor-pointer"
          >
            <Truck className="w-4 h-4 text-sky-300" />
            Find Tankers
          </button>
        </div>
      </div>

      {/* Responsive Filter Tab Navigation */}
      <div className="flex border-b border-slate-200 mb-6 space-x-2 sm:space-x-4 overflow-x-auto text-xs">
        <button
          onClick={() => setDashboardTab('overview')}
          className={`py-2.5 px-3.5 font-semibold border-b-2 transition-colors cursor-pointer ${
            dashboardTab === 'overview'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setDashboardTab('active')}
          className={`py-2.5 px-3.5 font-semibold border-b-2 transition-colors cursor-pointer ${
            dashboardTab === 'active'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Active Deliveries ({activeBookings.length})
        </button>
        <button
          onClick={() => setDashboardTab('requests')}
          className={`py-2.5 px-3.5 font-semibold border-b-2 transition-colors cursor-pointer ${
            dashboardTab === 'requests'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Broadcast Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setDashboardTab('history')}
          className={`py-2.5 px-3.5 font-semibold border-b-2 transition-colors cursor-pointer ${
            dashboardTab === 'history'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Booking History ({bookings.length})
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Active Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{activeBookings.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">In progress or scheduled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{pendingRequests.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting supplier bids</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Completed Deliveries</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{completedDeliveries.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Successfully pumped</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Water Ordered</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {(totalWaterOrderedLiters / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-500">kL</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{totalWaterOrderedLiters.toLocaleString()} Liters total</p>
        </div>
      </div>

      {/* Main Grid: Active Tracker + Open Broadcasts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Column: Active Delivery Tracker */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 text-left">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Delivery Status Tracker</h2>
                <p className="text-xs text-slate-500">Live progression of your water dispatch</p>
              </div>
              {currentActiveBooking && getStatusBadge(currentActiveBooking.bookingStatus)}
            </div>

            {currentActiveBooking ? (
              <div className="space-y-6">
                {/* Visual Step Timeline */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-semibold text-slate-900">
                      Booking #{currentActiveBooking.bookingId}
                    </span>
                    <span className="text-slate-500">
                      {currentActiveBooking.scheduledDate} · {currentActiveBooking.scheduledTime}
                    </span>
                  </div>

                  {/* 5-step progression */}
                  <div className="relative mt-6 mb-4">
                    <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-slate-200">
                      <div
                        style={{
                          width:
                            currentActiveBooking.bookingStatus === 'REQUESTED'
                              ? '15%'
                              : currentActiveBooking.bookingStatus === 'ACCEPTED'
                              ? '40%'
                              : currentActiveBooking.bookingStatus === 'SCHEDULED'
                              ? '65%'
                              : currentActiveBooking.bookingStatus === 'OUT_FOR_DELIVERY'
                              ? '85%'
                              : '100%',
                        }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-medium text-slate-500 text-center">
                      <div className="w-16">Request Sent</div>
                      <div className="w-16">Accepted</div>
                      <div className="w-16">Scheduled</div>
                      <div className="w-16">Out for Run</div>
                      <div className="w-16">Delivered</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Supplier</span>
                      <strong className="text-slate-800">{currentActiveBooking.supplierBusinessName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Quantity</span>
                      <strong className="text-slate-800">{currentActiveBooking.totalQuantityLiters.toLocaleString()} L</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Locked Price</span>
                      <strong className="text-blue-700">₹{currentActiveBooking.agreedPrice}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate max-w-xs">{currentActiveBooking.deliveryAddress.buildingName}, {currentActiveBooking.deliveryAddress.locality}</span>
                  </div>

                  <button
                    onClick={() => onNavigate('booking-details', currentActiveBooking.bookingId)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    View Timeline & Actions
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <Droplets className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs">You have no active water deliveries right now.</p>
                <button
                  onClick={() => onNavigate('new-request')}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition"
                >
                  Create Your First Booking
                </button>
              </div>
            )}
          </div>

          {/* Pending Broadcast Requests */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 text-left">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Broadcast Requests ({pendingRequests.length})</h3>
                <p className="text-[11px] text-slate-500">Open requests waiting for local supplier acceptance</p>
              </div>
              <button
                onClick={() => onNavigate('new-request')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + New Request
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                No open broadcast requests. Need water? Click above to request.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{req.requestId}</span>
                        {req.priority === 'urgent' && (
                          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                            URGENT
                          </span>
                        )}
                        <span className="text-slate-500 capitalize">· {req.waterCategory}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {req.totalQuantityLiters.toLocaleString()} Liters ({req.numberOfTankers} tanker) · {req.preferredDate} ({req.preferredTime})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block text-[11px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded">
                        Broadcasting
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">Est. ₹{req.estimatedBudget || 850}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Verified Local Suppliers in Service Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 text-left">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Local Verified Suppliers</h3>
                <p className="text-[11px] text-slate-500">Suppliers serving {currentUser.locality}</p>
              </div>
              <button
                onClick={() => onNavigate('supplier-discovery')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {suppliers.slice(0, 3).map((sup) => (
                <div
                  key={sup.uid}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-white space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900">{sup.businessName}</h4>
                      <p className="text-[11px] text-slate-500">{sup.operatingHours}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-700 block">₹{sup.pricePerTanker}</span>
                      <span className="text-[10px] text-slate-400">per {sup.tankerCapacityLiters}L</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1 text-amber-500 font-medium">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{sup.averageRating > 0 ? sup.averageRating : 'New'} ({sup.completedDeliveriesCount} trips)</span>
                    </div>
                    <button
                      onClick={() => onNavigate('new-request')}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Book Now →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Borewell Summary Link */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm text-left space-y-3">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold">
              <Activity className="w-4 h-4" />
              <span>Community Groundwater Watch</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Are you monitoring your apartment's borewell pump meter? Check recorded readings and avoid unexpected pump burnouts.
            </p>
            <button
              onClick={() => onNavigate('borewell')}
              className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              Check Borewell Logs & Reports →
            </button>
          </div>
        </div>
      </div>

      {/* Booking History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 text-left">
        <h3 className="text-base font-bold text-slate-900 mb-1">Booking History</h3>
        <p className="text-xs text-slate-500 mb-4">Complete audit trail of previous tanker orders</p>

        {bookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">No bookings recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Booking ID</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 font-semibold text-slate-900">{b.bookingId}</td>
                    <td className="py-3 px-3">{b.supplierBusinessName}</td>
                    <td className="py-3 px-3">{b.totalQuantityLiters.toLocaleString()} L</td>
                    <td className="py-3 px-3">{b.scheduledDate} · {b.scheduledTime}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">₹{b.agreedPrice}</td>
                    <td className="py-3 px-3">{getStatusBadge(b.bookingStatus)}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('booking-details', b.bookingId)}
                        className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
