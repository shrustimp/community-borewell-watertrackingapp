import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SupplierProfile, UserRole } from '../types';
import {
  initLocalStorage,
  getUsers,
  getUserById,
  getUserByEmail,
  saveUser,
  getSupplierById,
  saveSupplier,
  subscribeToStore,
} from '../services/storageService';

interface RegisterCustomerData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  password?: string;
}

interface RegisterSupplierData {
  ownerName: string;
  businessName: string;
  email: string;
  phone: string;
  businessAddress: string;
  serviceAreas: string[];
  tankerCapacityLiters: number;
  numberOfTankers: number;
  vehicleRegistrationNumber?: string;
  pricePerTanker: number;
  pricePerKiloliter?: number;
  waterCategories: Array<'potable' | 'utility' | 'drinking_certified' | 'ro_purified'>;
  waterSourceInfo: string;
  operatingHours: string;
  password?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  supplierProfile: SupplierProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string) => { success: boolean; error?: string };
  registerCustomer: (data: RegisterCustomerData) => { success: boolean; user?: UserProfile; error?: string };
  registerSupplier: (data: RegisterSupplierData) => { success: boolean; user?: UserProfile; error?: string };
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'jalaconnect_active_uid_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUid, setCurrentUid] = useState<string | null>(() => {
    initLocalStorage();
    return localStorage.getItem(CURRENT_USER_KEY) || 'user-cust-1'; // Default to Rahul Sharma for instant MVP exploration
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);

  const syncUser = () => {
    if (!currentUid) {
      setCurrentUser(null);
      setSupplierProfile(null);
      return;
    }

    const user = getUserById(currentUid);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'supplier') {
        const sup = getSupplierById(user.uid);
        setSupplierProfile(sup || null);
      } else {
        setSupplierProfile(null);
      }
    } else {
      // Fallback
      const allUsers = getUsers();
      if (allUsers.length > 0) {
        setCurrentUid(allUsers[0].uid);
        localStorage.setItem(CURRENT_USER_KEY, allUsers[0].uid);
      }
    }
  };

  useEffect(() => {
    syncUser();
    const unsubscribe = subscribeToStore(() => {
      syncUser();
    });
    return unsubscribe;
  }, [currentUid]);

  const login = (email: string): { success: boolean; error?: string } => {
    const user = getUserByEmail(email.trim());
    if (!user) {
      return { success: false, error: 'No account found with this email address' };
    }
    if (user.accountStatus === 'suspended') {
      return { success: false, error: 'This account has been suspended by administration' };
    }

    setCurrentUid(user.uid);
    localStorage.setItem(CURRENT_USER_KEY, user.uid);
    return { success: true };
  };

  const registerCustomer = (data: RegisterCustomerData): { success: boolean; user?: UserProfile; error?: string } => {
    const existing = getUserByEmail(data.email.trim());
    if (existing) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const newUid = `user-cust-${Date.now()}`;
    const newUser: UserProfile = {
      uid: newUid,
      fullName: data.fullName,
      email: data.email.trim(),
      phone: data.phone,
      role: 'customer',
      address: data.address,
      locality: data.locality,
      city: data.city || 'Bengaluru',
      district: data.district || 'Bengaluru Urban',
      state: data.state || 'Karnataka',
      pinCode: data.pinCode,
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setCurrentUid(newUid);
    localStorage.setItem(CURRENT_USER_KEY, newUid);

    return { success: true, user: newUser };
  };

  const registerSupplier = (data: RegisterSupplierData): { success: boolean; user?: UserProfile; error?: string } => {
    const existing = getUserByEmail(data.email.trim());
    if (existing) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const newUid = `user-supp-${Date.now()}`;
    const newUser: UserProfile = {
      uid: newUid,
      fullName: data.ownerName,
      email: data.email.trim(),
      phone: data.phone,
      role: 'supplier',
      address: data.businessAddress,
      locality: data.serviceAreas[0] || 'Whitefield',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pinCode: '560066',
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newSupplier: SupplierProfile = {
      uid: newUid,
      businessName: data.businessName,
      ownerName: data.ownerName,
      phone: data.phone,
      email: data.email.trim(),
      businessAddress: data.businessAddress,
      serviceAreas: data.serviceAreas,
      tankerCapacityLiters: Number(data.tankerCapacityLiters),
      numberOfTankers: Number(data.numberOfTankers) || 1,
      vehicleRegistrationNumber: data.vehicleRegistrationNumber,
      pricingModel: 'per_tanker',
      pricePerTanker: Number(data.pricePerTanker),
      pricePerKiloliter: data.pricePerKiloliter ? Number(data.pricePerKiloliter) : undefined,
      waterCategories: data.waterCategories,
      waterSourceInfo: data.waterSourceInfo,
      operatingHours: data.operatingHours,
      approvalStatus: 'pending', // Starts in pending approval per requirements
      averageRating: 0,
      totalRatingsCount: 0,
      completedDeliveriesCount: 0,
      isAvailableToday: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveUser(newUser);
    saveSupplier(newSupplier);
    setCurrentUid(newUid);
    localStorage.setItem(CURRENT_USER_KEY, newUid);

    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUid(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
    setSupplierProfile(null);
  };

  const switchDemoRole = (role: UserRole) => {
    const allUsers = getUsers();
    const targetUser = allUsers.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUid(targetUser.uid);
      localStorage.setItem(CURRENT_USER_KEY, targetUser.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        supplierProfile,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        login,
        registerCustomer,
        registerSupplier,
        logout,
        switchDemoRole,
        refreshUserData: syncUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
