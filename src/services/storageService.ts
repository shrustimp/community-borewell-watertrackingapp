import {
  UserProfile,
  SupplierProfile,
  WaterRequest,
  Booking,
  Borewell,
  BorewellUsage,
  Review,
  Complaint,
  NotificationItem,
  BookingStatus,
  ComplaintStatus,
  SupplierApprovalStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SUPPLIERS,
  INITIAL_REQUESTS,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_COMPLAINTS,
  INITIAL_BOREWELLS,
  INITIAL_BOREWELL_USAGE,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'jalaconnect_users_v1',
  SUPPLIERS: 'jalaconnect_suppliers_v1',
  REQUESTS: 'jalaconnect_requests_v1',
  BOOKINGS: 'jalaconnect_bookings_v1',
  REVIEWS: 'jalaconnect_reviews_v1',
  COMPLAINTS: 'jalaconnect_complaints_v1',
  BOREWELLS: 'jalaconnect_borewells_v1',
  BOREWELL_USAGE: 'jalaconnect_borewell_usage_v1',
  NOTIFICATIONS: 'jalaconnect_notifications_v1',
  CURRENT_USER_ID: 'jalaconnect_active_uid_v1',
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage`, e);
  }
}

// Initialize default data if missing
export function initLocalStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOREWELLS)) {
    localStorage.setItem(STORAGE_KEYS.BOREWELLS, JSON.stringify(INITIAL_BOREWELLS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOREWELL_USAGE)) {
    localStorage.setItem(STORAGE_KEYS.BOREWELL_USAGE, JSON.stringify(INITIAL_BOREWELL_USAGE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
}

// Reset all store data back to clean initial demo state
export function resetStoreToDefaults(): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
  localStorage.setItem(STORAGE_KEYS.BOREWELLS, JSON.stringify(INITIAL_BOREWELLS));
  localStorage.setItem(STORAGE_KEYS.BOREWELL_USAGE, JSON.stringify(INITIAL_BOREWELL_USAGE));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  notifyListeners();
}

// ---------------- USER OPERATIONS ---------------- //
export function getUsers(): UserProfile[] {
  return getItem<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getUserById(uid: string): UserProfile | undefined {
  return getUsers().find((u) => u.uid === uid);
}

export function getUserByEmail(email: string): UserProfile | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function saveUser(user: UserProfile): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.uid === user.uid);
  if (index >= 0) {
    users[index] = { ...user, updatedAt: new Date().toISOString() };
  } else {
    users.push(user);
  }
  setItem(STORAGE_KEYS.USERS, users);
}

export function updateUserAccountStatus(uid: string, status: 'active' | 'suspended'): void {
  const users = getUsers();
  const user = users.find((u) => u.uid === uid);
  if (user) {
    user.accountStatus = status;
    user.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.USERS, users);
  }
}

// ---------------- SUPPLIER OPERATIONS ---------------- //
export function getSuppliers(): SupplierProfile[] {
  return getItem<SupplierProfile[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
}

export function getSupplierById(uid: string): SupplierProfile | undefined {
  return getSuppliers().find((s) => s.uid === uid);
}

export function saveSupplier(supplier: SupplierProfile): void {
  const suppliers = getSuppliers();
  const index = suppliers.findIndex((s) => s.uid === supplier.uid);
  if (index >= 0) {
    suppliers[index] = { ...supplier, updatedAt: new Date().toISOString() };
  } else {
    suppliers.push(supplier);
  }
  setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
}

export function updateSupplierApproval(
  uid: string,
  approvalStatus: SupplierApprovalStatus,
  rejectionReason?: string
): void {
  const suppliers = getSuppliers();
  const sup = suppliers.find((s) => s.uid === uid);
  if (sup) {
    sup.approvalStatus = approvalStatus;
    if (rejectionReason) sup.rejectionReason = rejectionReason;
    sup.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.SUPPLIERS, suppliers);

    // Notify supplier
    addNotification({
      recipientId: uid,
      title:
        approvalStatus === 'approved'
          ? 'Supplier Profile Approved!'
          : approvalStatus === 'rejected'
          ? 'Supplier Registration Not Approved'
          : `Supplier Status Updated: ${approvalStatus}`,
      message:
        approvalStatus === 'approved'
          ? 'Congratulations! Your tanker business has been verified. You can now accept open water delivery requests.'
          : rejectionReason || 'Your supplier profile status was updated by the administrator.',
      type: 'supplier',
      relatedEntityId: uid,
    });
  }
}

// ---------------- WATER REQUEST OPERATIONS ---------------- //
export function getWaterRequests(): WaterRequest[] {
  return getItem<WaterRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
}

export function getWaterRequestById(requestId: string): WaterRequest | undefined {
  return getWaterRequests().find((r) => r.requestId === requestId);
}

export function createWaterRequest(data: Omit<WaterRequest, 'requestId' | 'createdAt' | 'updatedAt' | 'requestStatus'>): WaterRequest {
  const requests = getWaterRequests();
  const count = requests.length + 101;
  const requestId = `JC-REQ-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;

  const newRequest: WaterRequest = {
    ...data,
    requestId,
    requestStatus: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  requests.unshift(newRequest);
  setItem(STORAGE_KEYS.REQUESTS, requests);

  // Notify customer
  addNotification({
    recipientId: data.customerId,
    title: 'Water Request Submitted',
    message: `Your request ${requestId} for ${data.totalQuantityLiters.toLocaleString()}L in ${data.deliveryAddress.locality} has been broadcast to verified suppliers.`,
    type: 'booking',
    relatedEntityId: requestId,
  });

  // Notify matching approved suppliers
  const suppliers = getSuppliers().filter(
    (s) =>
      s.approvalStatus === 'approved' &&
      s.serviceAreas.some(
        (area) => area.toLowerCase() === data.deliveryAddress.locality.toLowerCase()
      )
  );

  suppliers.forEach((sup) => {
    addNotification({
      recipientId: sup.uid,
      title: data.priority === 'urgent' ? '🚨 URGENT Water Request in your area' : 'New Water Request Available',
      message: `${data.customerName} needs ${data.totalQuantityLiters.toLocaleString()}L in ${data.deliveryAddress.locality} for ${data.preferredDate}.`,
      type: 'booking',
      relatedEntityId: requestId,
    });
  });

  return newRequest;
}

export function cancelWaterRequest(requestId: string, customerId: string): boolean {
  const requests = getWaterRequests();
  const req = requests.find((r) => r.requestId === requestId);
  if (!req || req.customerId !== customerId || req.requestStatus === 'ACCEPTED') {
    return false;
  }
  req.requestStatus = 'CANCELLED';
  req.updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.REQUESTS, requests);
  return true;
}

// ---------------- BOOKING OPERATIONS ---------------- //
export function getBookings(): Booking[] {
  return getItem<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
}

export function getBookingById(bookingId: string): Booking | undefined {
  return getBookings().find((b) => b.bookingId === bookingId);
}

export function acceptWaterRequestAndCreateBooking(params: {
  requestId: string;
  supplierId: string;
  agreedPrice: number;
  scheduledTime: string;
}): { success: boolean; booking?: Booking; error?: string } {
  const requests = getWaterRequests();
  const req = requests.find((r) => r.requestId === params.requestId);
  if (!req) return { success: false, error: 'Request not found' };

  if (req.requestStatus !== 'OPEN') {
    return { success: false, error: 'Request has already been accepted or cancelled by another party' };
  }

  const supplier = getSupplierById(params.supplierId);
  if (!supplier || supplier.approvalStatus !== 'approved') {
    return { success: false, error: 'Only approved suppliers can accept water requests' };
  }

  const bookings = getBookings();
  const bookingCount = bookings.length + 8802;
  const bookingId = `JC-BK-${new Date().getFullYear()}-${bookingCount}`;

  const newBooking: Booking = {
    bookingId,
    requestId: req.requestId,
    customerId: req.customerId,
    customerName: req.customerName,
    customerPhone: req.customerPhone,
    supplierId: supplier.uid,
    supplierBusinessName: supplier.businessName,
    supplierPhone: supplier.phone,
    agreedPrice: params.agreedPrice,
    scheduledDate: req.preferredDate,
    scheduledTime: params.scheduledTime || req.preferredTime,
    waterCategory: req.waterCategory,
    totalQuantityLiters: req.totalQuantityLiters,
    numberOfTankers: req.numberOfTankers,
    tankerCapacityLiters: req.tankerCapacityLiters,
    deliveryAddress: req.deliveryAddress,
    priority: req.priority,
    bookingStatus: 'ACCEPTED',
    paymentMode: 'upi_on_delivery',
    statusHistory: [
      {
        status: 'REQUESTED',
        timestamp: req.createdAt,
        note: 'Customer created water delivery request',
        updatedBy: req.customerName,
      },
      {
        status: 'ACCEPTED',
        timestamp: new Date().toISOString(),
        note: `Accepted by ${supplier.businessName}. Agreed price ₹${params.agreedPrice}`,
        updatedBy: supplier.businessName,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Mark request as ACCEPTED
  req.requestStatus = 'ACCEPTED';
  req.assignedSupplierId = supplier.uid;
  req.assignedBookingId = bookingId;
  req.updatedAt = new Date().toISOString();

  bookings.unshift(newBooking);

  setItem(STORAGE_KEYS.REQUESTS, requests);
  setItem(STORAGE_KEYS.BOOKINGS, bookings);

  // Notify customer
  addNotification({
    recipientId: req.customerId,
    title: 'Supplier Accepted Your Water Request! 🚰',
    message: `${supplier.businessName} has accepted your order for ₹${params.agreedPrice}. Scheduled for ${req.preferredDate}.`,
    type: 'booking',
    relatedEntityId: bookingId,
  });

  return { success: true, booking: newBooking };
}

export function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  note: string,
  updatedBy: string
): { success: boolean; error?: string } {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.bookingId === bookingId);
  if (!booking) return { success: false, error: 'Booking not found' };

  // Status progression validation
  const validTransitions: Record<BookingStatus, BookingStatus[]> = {
    REQUESTED: ['ACCEPTED', 'CANCELLED', 'REJECTED'],
    ACCEPTED: ['SCHEDULED', 'OUT_FOR_DELIVERY', 'CANCELLED'],
    SCHEDULED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
    REJECTED: [],
  };

  if (!validTransitions[booking.bookingStatus]?.includes(newStatus)) {
    return {
      success: false,
      error: `Invalid status transition from ${booking.bookingStatus} to ${newStatus}`,
    };
  }

  booking.bookingStatus = newStatus;
  booking.updatedAt = new Date().toISOString();
  if (newStatus === 'DELIVERED') {
    booking.deliveredAt = new Date().toISOString();

    // Increment completed deliveries for supplier
    const suppliers = getSuppliers();
    const sup = suppliers.find((s) => s.uid === booking.supplierId);
    if (sup) {
      sup.completedDeliveriesCount = (sup.completedDeliveriesCount || 0) + 1;
      setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
    }
  }

  booking.statusHistory.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    note,
    updatedBy,
  });

  setItem(STORAGE_KEYS.BOOKINGS, bookings);

  // Notifications
  const isDelivered = newStatus === 'DELIVERED';
  const isOut = newStatus === 'OUT_FOR_DELIVERY';
  addNotification({
    recipientId: booking.customerId,
    title: isDelivered
      ? 'Water Tanker Delivered! 💧'
      : isOut
      ? 'Tanker Out for Delivery 🚚'
      : `Booking Status: ${newStatus}`,
    message: isDelivered
      ? `Your water delivery from ${booking.supplierBusinessName} has been completed. Please rate the service!`
      : isOut
      ? `${booking.supplierBusinessName} tanker is on the way to ${booking.deliveryAddress.buildingName}.`
      : `Update: ${note}`,
    type: 'booking',
    relatedEntityId: bookingId,
  });

  return { success: true };
}

export function cancelBooking(bookingId: string, reason: string, cancelledBy: string): { success: boolean; error?: string } {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.bookingId === bookingId);
  if (!booking) return { success: false, error: 'Booking not found' };

  if (booking.bookingStatus === 'DELIVERED' || booking.bookingStatus === 'CANCELLED') {
    return { success: false, error: 'Completed or already cancelled bookings cannot be cancelled' };
  }

  booking.bookingStatus = 'CANCELLED';
  booking.cancellationReason = reason;
  booking.updatedAt = new Date().toISOString();
  booking.statusHistory.push({
    status: 'CANCELLED',
    timestamp: new Date().toISOString(),
    note: `Cancelled: ${reason}`,
    updatedBy: cancelledBy,
  });

  setItem(STORAGE_KEYS.BOOKINGS, bookings);

  // Notify counterparty
  const recipient = cancelledBy === booking.customerName ? booking.supplierId : booking.customerId;
  addNotification({
    recipientId: recipient,
    title: 'Booking Cancelled',
    message: `Booking ${bookingId} has been cancelled by ${cancelledBy}. Reason: ${reason}`,
    type: 'booking',
    relatedEntityId: bookingId,
  });

  return { success: true };
}

// ---------------- REVIEWS ---------------- //
export function getReviews(): Review[] {
  return getItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
}

export function addReview(data: Omit<Review, 'reviewId' | 'createdAt'>): { success: boolean; error?: string } {
  const reviews = getReviews();
  const alreadyReviewed = reviews.some((r) => r.bookingId === data.bookingId);
  if (alreadyReviewed) {
    return { success: false, error: 'You have already reviewed this delivery' };
  }

  const reviewId = `JC-REV-${Date.now().toString().slice(-4)}`;
  const newReview: Review = {
    ...data,
    reviewId,
    createdAt: new Date().toISOString(),
  };

  reviews.unshift(newReview);
  setItem(STORAGE_KEYS.REVIEWS, reviews);

  // Recalculate average rating for supplier
  const supplierReviews = reviews.filter((r) => r.supplierId === data.supplierId);
  const avg = supplierReviews.reduce((acc, curr) => acc + curr.rating, 0) / supplierReviews.length;

  const suppliers = getSuppliers();
  const sup = suppliers.find((s) => s.uid === data.supplierId);
  if (sup) {
    sup.averageRating = Math.round(avg * 10) / 10;
    sup.totalRatingsCount = supplierReviews.length;
    setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  // Notify supplier
  addNotification({
    recipientId: data.supplierId,
    title: 'New Customer Review Received ⭐',
    message: `${data.customerName} gave you a ${data.rating}-star rating: "${data.comment.slice(0, 80)}..."`,
    type: 'supplier',
    relatedEntityId: reviewId,
  });

  return { success: true };
}

// ---------------- COMPLAINTS ---------------- //
export function getComplaints(): Complaint[] {
  return getItem<Complaint[]>(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
}

export function createComplaint(data: Omit<Complaint, 'complaintId' | 'createdAt' | 'updatedAt' | 'complaintStatus'>): Complaint {
  const complaints = getComplaints();
  const complaintId = `JC-CMP-${Date.now().toString().slice(-4)}`;
  const newComplaint: Complaint = {
    ...data,
    complaintId,
    complaintStatus: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  complaints.unshift(newComplaint);
  setItem(STORAGE_KEYS.COMPLAINTS, complaints);

  // Notify Admin
  const admins = getUsers().filter((u) => u.role === 'admin');
  admins.forEach((adm) => {
    addNotification({
      recipientId: adm.uid,
      title: 'New Resident Complaint Filed',
      message: `${data.customerName} filed a complaint against ${data.supplierName} regarding "${data.category}".`,
      type: 'complaint',
      relatedEntityId: complaintId,
    });
  });

  return newComplaint;
}

export function updateComplaint(
  complaintId: string,
  complaintStatus: ComplaintStatus,
  adminNotes?: string,
  resolutionDetails?: string
): void {
  const complaints = getComplaints();
  const cmp = complaints.find((c) => c.complaintId === complaintId);
  if (cmp) {
    cmp.complaintStatus = complaintStatus;
    if (adminNotes !== undefined) cmp.adminNotes = adminNotes;
    if (resolutionDetails !== undefined) cmp.resolutionDetails = resolutionDetails;
    cmp.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.COMPLAINTS, complaints);

    // Notify customer
    addNotification({
      recipientId: cmp.customerId,
      title: `Complaint Status Updated: ${complaintStatus}`,
      message: resolutionDetails || `Your complaint ${complaintId} status is now ${complaintStatus}.`,
      type: 'complaint',
      relatedEntityId: complaintId,
    });
  }
}

// ---------------- BOREWELL MANAGEMENT ---------------- //
export function getBorewells(): Borewell[] {
  return getItem<Borewell[]>(STORAGE_KEYS.BOREWELLS, INITIAL_BOREWELLS);
}

export function saveBorewell(data: Omit<Borewell, 'borewellId' | 'createdAt' | 'updatedAt'>): Borewell {
  const borewells = getBorewells();
  const borewellId = `BW-BLR-${(borewells.length + 1).toString().padStart(3, '0')}`;
  const newBorewell: Borewell = {
    ...data,
    borewellId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  borewells.push(newBorewell);
  setItem(STORAGE_KEYS.BOREWELLS, borewells);
  return newBorewell;
}

export function getBorewellUsage(): BorewellUsage[] {
  return getItem<BorewellUsage[]>(STORAGE_KEYS.BOREWELL_USAGE, INITIAL_BOREWELL_USAGE);
}

export function logBorewellUsage(
  data: Omit<BorewellUsage, 'usageId' | 'quantityUsedLiters' | 'createdAt'>
): { success: boolean; record?: BorewellUsage; error?: string } {
  if (data.closingMeterReading < data.openingMeterReading) {
    return { success: false, error: 'Closing meter reading cannot be lower than opening reading' };
  }

  const deltaUnits = data.closingMeterReading - data.openingMeterReading;
  const quantityUsedLiters = Math.round(deltaUnits * 1000); // 1 meter unit = 1 Kiloliter = 1000 Liters

  const usageList = getBorewellUsage();
  const usageId = `USG-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

  const newRecord: BorewellUsage = {
    ...data,
    usageId,
    quantityUsedLiters,
    createdAt: new Date().toISOString(),
  };

  usageList.unshift(newRecord);
  setItem(STORAGE_KEYS.BOREWELL_USAGE, usageList);

  return { success: true, record: newRecord };
}

// ---------------- NOTIFICATIONS ---------------- //
export function getNotifications(recipientId: string): NotificationItem[] {
  const all = getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  return all.filter((n) => n.recipientId === recipientId);
}

export function addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): void {
  const all = getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const newNotif: NotificationItem = {
    ...item,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  all.unshift(newNotif);
  setItem(STORAGE_KEYS.NOTIFICATIONS, all);
}

export function markNotificationRead(id: string): void {
  const all = getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const notif = all.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
    setItem(STORAGE_KEYS.NOTIFICATIONS, all);
  }
}

export function markAllNotificationsRead(recipientId: string): void {
  const all = getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  all.forEach((n) => {
    if (n.recipientId === recipientId) n.isRead = true;
  });
  setItem(STORAGE_KEYS.NOTIFICATIONS, all);
}
