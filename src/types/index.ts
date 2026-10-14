export type UserRole = 'customer' | 'supplier' | 'admin';

export type AccountStatus = 'active' | 'suspended' | 'pending';

export type SupplierApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type WaterCategory = 'potable' | 'utility' | 'drinking_certified' | 'ro_purified';

export type RequestType = 'household' | 'apartment_community' | 'commercial' | 'event' | 'emergency';

export type RequestPriority = 'normal' | 'urgent';

export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'SCHEDULED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type ComplaintStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  address: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

export interface SupplierProfile {
  uid: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  businessAddress: string;
  serviceAreas: string[]; // e.g. ["Whitefield", "Marathahalli", "Kadugodi"]
  tankerCapacityLiters: number; // e.g. 6000
  numberOfTankers: number;
  vehicleRegistrationNumber?: string;
  pricingModel: 'per_tanker' | 'per_kiloliter';
  pricePerTanker: number; // in INR
  pricePerKiloliter?: number;
  waterCategories: WaterCategory[];
  waterSourceInfo: string; // e.g. "Govt approved deep aquifer, regularly lab-tested"
  operatingHours: string; // e.g. "06:00 AM - 10:00 PM"
  approvalStatus: SupplierApprovalStatus;
  rejectionReason?: string;
  averageRating: number;
  totalRatingsCount: number;
  completedDeliveriesCount: number;
  isAvailableToday: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WaterRequest {
  requestId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  requestType: RequestType;
  numberOfTankers: number;
  tankerCapacityLiters: number;
  totalQuantityLiters: number;
  waterCategory: WaterCategory;
  deliveryAddress: {
    buildingName: string;
    street: string;
    locality: string;
    city: string;
    district: string;
    state: string;
    pinCode: string;
    landmark?: string;
    coordinates?: { lat: number; lng: number };
  };
  preferredDate: string;
  preferredTime: string;
  alternativeTime?: string;
  priority: RequestPriority;
  instructions?: string;
  estimatedBudget?: number;
  requestStatus: 'OPEN' | 'ACCEPTED' | 'CANCELLED' | 'EXPIRED';
  assignedSupplierId?: string;
  assignedBookingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryItem {
  status: BookingStatus;
  timestamp: string;
  note?: string;
  updatedBy: string;
}

export interface Booking {
  bookingId: string;
  requestId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  supplierId: string;
  supplierBusinessName: string;
  supplierPhone: string;
  agreedPrice: number;
  scheduledDate: string;
  scheduledTime: string;
  waterCategory: WaterCategory;
  totalQuantityLiters: number;
  numberOfTankers: number;
  tankerCapacityLiters: number;
  deliveryAddress: WaterRequest['deliveryAddress'];
  priority: RequestPriority;
  bookingStatus: BookingStatus;
  statusHistory: StatusHistoryItem[];
  cancellationReason?: string;
  deliveredAt?: string;
  paymentMode: 'cash_on_delivery' | 'upi_on_delivery' | 'community_account';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  reviewId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  supplierId: string;
  rating: number; // 1 to 5
  feedbackCategories: string[]; // e.g. ["Punctual", "Clean Tanker", "Good Water Quality"]
  comment: string;
  createdAt: string;
}

export interface Complaint {
  complaintId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  supplierId: string;
  supplierName: string;
  category: 'late_delivery' | 'water_quality_issue' | 'price_dispute' | 'unprofessional_behavior' | 'non_delivery' | 'other';
  description: string;
  complaintStatus: ComplaintStatus;
  adminNotes?: string;
  resolutionDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'booking' | 'system' | 'supplier' | 'complaint' | 'borewell';
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Borewell {
  borewellId: string;
  name: string;
  communityName: string;
  location: string;
  depthFeet?: number;
  totalEstimatedCapacityLiters?: number;
  responsibleManager: string;
  managerPhone: string;
  operationalStatus: 'active' | 'maintenance' | 'low_yield' | 'dry';
  lastInspectionDate?: string;
  pumpHorsepower?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BorewellUsage {
  usageId: string;
  borewellId: string;
  borewellName: string;
  date: string;
  time: string;
  openingMeterReading: number; // in Kiloliters or units
  closingMeterReading: number;
  quantityUsedLiters: number;
  purpose: 'overhead_tank' | 'drinking_supply' | 'gardening_groundwater' | 'emergency_community' | 'construction_maintenance';
  householdOrWingRef: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}
