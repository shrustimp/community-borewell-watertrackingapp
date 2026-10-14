/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoBanner } from './components/common/DemoBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { NewWaterRequestPage } from './pages/customer/NewWaterRequestPage';
import { BookingDetailsPage } from './pages/customer/BookingDetailsPage';
import { SupplierDiscoveryPage } from './pages/customer/SupplierDiscoveryPage';
import { SupplierDashboard } from './pages/supplier/SupplierDashboard';
import { BorewellManagementPage } from './pages/borewell/BorewellManagementPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProfilePage } from './pages/profile/ProfilePage';

function MainApp() {
  const { role, currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        const [view, param] = hash.split('/');
        setCurrentView(view || 'landing');
        setViewParam(param);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    if (param) {
      window.location.hash = `#/${view}/${param}`;
    } else {
      window.location.hash = `#/${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* College PBL Presentation Bar */}
      <DemoBanner />

      {/* Main Navigation */}
      <Navbar currentView={currentView} onNavigate={navigateTo} />

      {/* Body View Container */}
      <main className="flex-1">
        {currentView === 'landing' && <LandingPage onNavigate={navigateTo} />}
        {currentView === 'login' && <LoginPage onNavigate={navigateTo} />}
        {currentView === 'register' && <RegisterPage onNavigate={navigateTo} />}
        {currentView === 'customer-dashboard' && (
          <CustomerDashboard onNavigate={navigateTo} />
        )}
        {currentView === 'new-request' && (
          <NewWaterRequestPage onNavigate={navigateTo} preselectedSupplierId={viewParam} />
        )}
        {currentView === 'booking-details' && (
          <BookingDetailsPage
            bookingId={viewParam || 'JC-BK-2026-8801'}
            onNavigate={navigateTo}
          />
        )}
        {currentView === 'supplier-discovery' && (
          <SupplierDiscoveryPage onNavigate={navigateTo} />
        )}
        {currentView === 'supplier-dashboard' && (
          <SupplierDashboard onNavigate={navigateTo} />
        )}
        {currentView === 'borewell' && <BorewellManagementPage />}
        {currentView === 'profile' && <ProfilePage onNavigate={navigateTo} />}
        {currentView === 'admin-dashboard' && (
          <AdminDashboard onNavigate={navigateTo} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
