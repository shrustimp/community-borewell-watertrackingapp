import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getUsers,
  getSuppliers,
  getWaterRequests,
  getBookings,
  getComplaints,
  getBorewells,
  getBorewellUsage,
  updateSupplierApproval,
  updateUserAccountStatus,
  updateComplaint,
  subscribeToStore,
} from '../../services/storageService';
import {
  UserProfile,
  SupplierProfile,
  WaterRequest,
  Booking,
  Complaint,
  SupplierApprovalStatus,
  ComplaintStatus,
} from '../../types';
import {
  ShieldCheck,
  Users,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Check,
  X,
  Droplets,
  Activity,
  ArrowRight,
  UserX,
  UserCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'suppliers' | 'complaints' | 'customers' | 'bookings' | 'security'
  >('overview');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [requests, setRequests] = useState<WaterRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Search & filter state
  const [userSearch, setUserSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Supplier review modal
  const [reviewingSupplier, setReviewingSupplier] = useState<SupplierProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Complaint review modal
  const [reviewingComplaint, setReviewingComplaint] = useState<Complaint | null>(null);
  const [complaintStatus, setComplaintStatus] = useState<ComplaintStatus>('UNDER_REVIEW');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');

  const loadData = () => {
    setUsers(getUsers());
    setSuppliers(getSuppliers());
    setRequests(getWaterRequests());
    setBookings(getBookings());
    setComplaints(getComplaints());
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore(loadData);
    return unsub;
  }, []);

  if (role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Administrative Access Required</h2>
        <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
          The administrator console is restricted to verified administrative credentials. Use the presentation switcher above to test administrative controls.
        </p>
      </div>
    );
  }

  // Metrics
  const totalCustomers = users.filter((u) => u.role === 'customer').length;
  const pendingApprovals = suppliers.filter((s) => s.approvalStatus === 'pending').length;
  const activeBookingsCount = bookings.filter(
    (b) => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(b.bookingStatus)
  ).length;
  const completedDeliveriesCount = bookings.filter((b) => b.bookingStatus === 'DELIVERED').length;
  const openComplaintsCount = complaints.filter(
    (c) => c.complaintStatus === 'OPEN' || c.complaintStatus === 'UNDER_REVIEW'
  ).length;
  const totalWaterSuppliedLiters = bookings
    .filter((b) => b.bookingStatus === 'DELIVERED')
    .reduce((sum, b) => sum + b.totalQuantityLiters, 0);

  const handleSupplierStatusChange = (
    uid: string,
    status: SupplierApprovalStatus,
    reason?: string
  ) => {
    updateSupplierApproval(uid, status, reason);
    setReviewingSupplier(null);
    setRejectionReason('');
  };

  const handleToggleUserAccount = (uid: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    updateUserAccountStatus(uid, nextStatus);
  };

  const handleSaveComplaint = () => {
    if (!reviewingComplaint) return;
    updateComplaint(
      reviewingComplaint.complaintId,
      complaintStatus,
      adminNotes,
      resolutionDetails
    );
    setReviewingComplaint(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800 text-left">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-900/80 text-indigo-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrative Governance Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Operations & Quality Desk
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Supervise tanker fleet approvals, manage resident disputes, audit water deliveries, and monitor borewells.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/20 text-center">
            <span className="text-[10px] text-slate-300 block uppercase tracking-wider">Total Water Dispatched</span>
            <strong className="text-xl text-teal-300 font-black">
              {(totalWaterSuppliedLiters / 1000).toFixed(1)} kL
            </strong>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-semibold block">Residents</span>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{totalCustomers}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-semibold block">Total Tankers</span>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{suppliers.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-amber-700 font-semibold block">Pending Approvals</span>
          <p className="text-2xl font-black text-amber-600 mt-0.5">{pendingApprovals}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-semibold block">Active Bookings</span>
          <p className="text-2xl font-black text-blue-700 mt-0.5">{activeBookingsCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-semibold block">Completed Deliveries</span>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">{completedDeliveriesCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-red-700 font-semibold block">Open Issues</span>
          <p className="text-2xl font-black text-red-600 mt-0.5">{openComplaintsCount}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-6 space-x-1 sm:space-x-4 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Overview & Reports' },
          { id: 'suppliers', label: `Supplier Approvals (${pendingApprovals})` },
          { id: 'complaints', label: `Complaints & Disputes (${openComplaintsCount})` },
          { id: 'customers', label: 'Resident Directory' },
          { id: 'bookings', label: 'All Booking Logs' },
          { id: 'security', label: 'Security Rules & Schema' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & REPORTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Status Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Bookings by Current State</h3>
              <div className="space-y-3 text-xs">
                {[
                  {
                    status: 'DELIVERED',
                    color: 'bg-emerald-500',
                    count: bookings.filter((b) => b.bookingStatus === 'DELIVERED').length,
                  },
                  {
                    status: 'OUT_FOR_DELIVERY',
                    color: 'bg-teal-500',
                    count: bookings.filter((b) => b.bookingStatus === 'OUT_FOR_DELIVERY').length,
                  },
                  {
                    status: 'SCHEDULED',
                    color: 'bg-sky-500',
                    count: bookings.filter((b) => b.bookingStatus === 'SCHEDULED').length,
                  },
                  {
                    status: 'ACCEPTED',
                    color: 'bg-blue-500',
                    count: bookings.filter((b) => b.bookingStatus === 'ACCEPTED').length,
                  },
                  {
                    status: 'CANCELLED',
                    color: 'bg-slate-400',
                    count: bookings.filter((b) => b.bookingStatus === 'CANCELLED').length,
                  },
                ].map((item) => (
                  <div key={item.status} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">{item.status.replace(/_/g, ' ')}</span>
                      <span className="text-slate-500">{item.count} order(s)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full`}
                        style={{
                          width: `${bookings.length > 0 ? (item.count / bookings.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tanker Fleet Performance */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Supplier Performance Summary</h3>
              <div className="space-y-3 text-xs">
                {suppliers.map((s) => (
                  <div
                    key={s.uid}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-slate-900 block">{s.businessName}</strong>
                      <span className="text-[11px] text-slate-500">
                        {s.serviceAreas.slice(0, 2).join(', ')} · Status: <strong>{s.approvalStatus}</strong>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-700 font-bold block">{s.completedDeliveriesCount} trips</span>
                      <span className="text-[11px] text-amber-500 font-semibold">★ {s.averageRating > 0 ? s.averageRating : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIER MANAGEMENT & APPROVALS */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Supplier Fleet Directory</h3>
              <p className="text-xs text-slate-500">Inspect vehicle registrations and water source compliance</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value as any)}
                className="py-1.5 px-3 text-xs border border-slate-300 rounded-xl"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Business & Owner</th>
                  <th className="py-3 px-3">Fleet Capacity</th>
                  <th className="py-3 px-3">Rate / Tanker</th>
                  <th className="py-3 px-3">Service Areas</th>
                  <th className="py-3 px-3">Approval Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers
                  .filter((s) => supplierFilter === 'all' || s.approvalStatus === supplierFilter)
                  .map((s) => (
                    <tr key={s.uid} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {s.businessName}
                        <span className="text-[11px] text-slate-500 block font-normal">
                          {s.ownerName} · {s.phone}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {s.tankerCapacityLiters.toLocaleString()} L ({s.numberOfTankers} vehicle)
                        <span className="text-[10px] text-slate-400 block">{s.vehicleRegistrationNumber}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-blue-700">₹{s.pricePerTanker}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {s.serviceAreas.join(', ')}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            s.approvalStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.approvalStatus === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {s.approvalStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setReviewingSupplier(s);
                            setRejectionReason(s.rejectionReason || '');
                          }}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg text-xs cursor-pointer"
                        >
                          Review & Verify
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLAINTS & DISPUTES */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1">Resident Complaints Desk</h3>
          <p className="text-xs text-slate-500 mb-6">Investigate service delays, quality issues, or price disputes</p>

          {complaints.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No complaints logged.</p>
          ) : (
            <div className="space-y-4">
              {complaints.map((c) => (
                <div
                  key={c.complaintId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{c.complaintId}</span>
                        <span className="text-slate-500">Booking #{c.bookingId}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.complaintStatus === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.complaintStatus === 'UNDER_REVIEW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {c.complaintStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Resident: <strong>{c.customerName}</strong> ({c.customerPhone}) vs Supplier: <strong>{c.supplierName}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setReviewingComplaint(c);
                        setComplaintStatus(c.complaintStatus);
                        setAdminNotes(c.adminNotes || '');
                        setResolutionDetails(c.resolutionDetails || '');
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Update / Resolve
                    </button>
                  </div>

                  <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700">
                    "{c.description}"
                  </p>

                  {c.resolutionDetails && (
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-[11px]">
                      <strong>Resolution:</strong> {c.resolutionDetails}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CUSTOMERS DIRECTORY */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Resident Customer Accounts</h3>
              <p className="text-xs text-slate-500">View and manage resident accounts</p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search resident name or locality..."
                className="pl-3 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Name & Email</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Locality & City</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users
                  .filter(
                    (u) =>
                      !userSearch ||
                      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.locality.toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {u.fullName}
                        <span className="text-[11px] text-slate-400 block font-normal">{u.email}</span>
                      </td>
                      <td className="py-3 px-3">{u.phone}</td>
                      <td className="py-3 px-3">
                        {u.locality}, {u.city}
                      </td>
                      <td className="py-3 px-3 capitalize font-medium">{u.role}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            u.accountStatus === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.accountStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserAccount(u.uid, u.accountStatus)}
                            className={`px-3 py-1 text-xs rounded-lg font-semibold cursor-pointer ${
                              u.accountStatus === 'active'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ALL BOOKING LOGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1">Global Water Dispatch Records</h3>
          <p className="text-xs text-slate-500 mb-6">Complete platform booking history</p>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Booking ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3">Volume</th>
                  <th className="py-3 px-3">Scheduled</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 font-semibold text-slate-900">{b.bookingId}</td>
                    <td className="py-3 px-3">{b.customerName}</td>
                    <td className="py-3 px-3">{b.supplierBusinessName}</td>
                    <td className="py-3 px-3">{b.totalQuantityLiters.toLocaleString()} L</td>
                    <td className="py-3 px-3">{b.scheduledDate}</td>
                    <td className="py-3 px-3 font-semibold">₹{b.agreedPrice}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('booking-details', b.bookingId)}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY RULES & FIRESTORE SCHEMA */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Security Architecture
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Role-Based Access Control (RBAC) & Security Principles
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Zero-Trust rules preventing role self-escalation, orphaned writes, and unauthorized PII leakage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">1. Anti-Escalation Rule</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Users can never modify their own <code className="text-indigo-600 bg-white px-1 py-0.5 rounded border">role</code>, <code className="text-indigo-600 bg-white px-1 py-0.5 rounded border">accountStatus</code>, or supplier <code className="text-indigo-600 bg-white px-1 py-0.5 rounded border">approvalStatus</code>. Only trusted admin keys can modify privilege claims.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">2. Customer Ownership Barrier</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Customers can only broadcast requests for themselves (<code className="text-indigo-600 bg-white px-1 py-0.5 rounded border">request.auth.uid == resource.data.customerId</code>) and can only cancel before dispatch.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">3. Approved Supplier Gate</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Only suppliers with <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">approvalStatus == 'approved'</code> can accept open requests and schedule tanker dispatches.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">4. PII Isolation</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Customer full phone and street address are masked from the open broadcast feed, revealed only to the authorized supplier upon slot acceptance.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] space-y-2 overflow-x-auto">
              <span className="text-indigo-400 font-bold block">// Sample Production Firestore Rules Guard:</span>
              <pre className="text-slate-300">
{`match /waterRequests/{requestId} {
  allow read: if (isSignedIn() && resource.data.customerId == request.auth.uid) ||
    (isApprovedSupplier() && resource.data.requestStatus == 'OPEN') ||
    isAdmin();
  allow create: if isSignedIn() && request.resource.data.customerId == request.auth.uid;
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Review Supplier Modal */}
      {reviewingSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Verify Supplier Registration</h3>
              <button onClick={() => setReviewingSupplier(null)} className="text-slate-400">✕</button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Business Name:</span>
                <strong className="text-slate-800">{reviewingSupplier.businessName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Owner & Phone:</span>
                <strong className="text-slate-800">{reviewingSupplier.ownerName} ({reviewingSupplier.phone})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanker Capacity:</span>
                <strong>{reviewingSupplier.tankerCapacityLiters} L ({reviewingSupplier.numberOfTankers} tanker)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle Reg #:</span>
                <strong className="font-mono">{reviewingSupplier.vehicleRegistrationNumber || 'KA-53-MC-XXXX'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Base Price:</span>
                <strong className="text-blue-700">₹{reviewingSupplier.pricePerTanker} per tanker</strong>
              </div>
            </div>

            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-900">
              <strong>Water Source Verification:</strong>
              <p className="mt-0.5">{reviewingSupplier.waterSourceInfo}</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Admin Notes / Rejection Reason (if applicable)
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter feedback or requirements for supplier..."
                className="w-full p-2 border rounded-xl text-slate-900 border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReviewingSupplier(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Close
              </button>
              <button
                onClick={() =>
                  handleSupplierStatusChange(reviewingSupplier.uid, 'rejected', rejectionReason)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
              >
                Reject Supplier
              </button>
              <button
                onClick={() => handleSupplierStatusChange(reviewingSupplier.uid, 'approved')}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md"
              >
                Approve Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Complaint Modal */}
      {reviewingComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Resolve Complaint #{reviewingComplaint.complaintId}
              </h3>
              <button onClick={() => setReviewingComplaint(null)} className="text-slate-400">✕</button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Complaint Status</label>
              <select
                value={complaintStatus}
                onChange={(e) => setComplaintStatus(e.target.value as ComplaintStatus)}
                className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
              >
                <option value="OPEN">OPEN (Under Triage)</option>
                <option value="UNDER_REVIEW">UNDER REVIEW (Supplier Contacted)</option>
                <option value="RESOLVED">RESOLVED (Action Taken)</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Internal Admin Notes</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes regarding calls made to driver or resident..."
                className="w-full p-2 border rounded-xl text-slate-900 border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Resolution Details (Visible to Resident)
              </label>
              <textarea
                rows={3}
                value={resolutionDetails}
                onChange={(e) => setResolutionDetails(e.target.value)}
                placeholder="Explain the outcome or remediation steps..."
                className="w-full p-2 border rounded-xl text-slate-900 border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewingComplaint(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComplaint}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md"
              >
                Save Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
