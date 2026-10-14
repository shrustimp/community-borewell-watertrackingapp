import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resetStoreToDefaults } from '../../services/storageService';
import { ShieldCheck, User, Truck, Sparkles, RefreshCw, Info, X, Database, CheckCircle2 } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { currentUser, role, switchDemoRole } = useAuth();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all bookings, borewell logs, and requests back to initial college presentation state?')) {
      resetStoreToDefaults();
      setResetFeedback(true);
      setTimeout(() => setResetFeedback(false), 2000);
    }
  };

  return (
    <>
      <aside aria-label="Demo Mode Bar" className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-slate-200 text-xs px-3 sm:px-4 py-2 border-b border-blue-800/40 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Tag & Context */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              College PBL Project MVP
            </span>
            <span className="hidden md:inline text-slate-300">
              Persistent Local Storage DB Active
            </span>
            <button
              onClick={() => setShowInfoModal(true)}
              className="text-slate-400 hover:text-white underline inline-flex items-center gap-0.5 ml-1 transition-colors cursor-pointer"
            >
              <Info className="w-3 h-3" />
              Backend Architecture
            </button>
          </div>

          {/* Quick Role Switcher for College Presentation Viva */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 hidden sm:inline">Presentation Switcher:</span>
            <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60">
              <button
                onClick={() => switchDemoRole('customer')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  role === 'customer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <User className="w-3 h-3" />
                Customer
              </button>
              <button
                onClick={() => switchDemoRole('supplier')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  role === 'supplier'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Truck className="w-3 h-3" />
                Supplier
              </button>
              <button
                onClick={() => switchDemoRole('admin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                Admin
              </button>
            </div>

            <button
              onClick={handleReset}
              title="Reset sample community data"
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${resetFeedback ? 'animate-spin text-teal-400' : ''}`} />
              <span className="hidden sm:inline">Reset Data</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-sky-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-sky-400" />
                <h3 className="font-semibold text-lg">JalaConnect Architecture & Database</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sky-950">Active Persistence Mode</h4>
                  <p className="text-sky-800 text-xs mt-1">
                    Currently utilizing a complete, fully-functional browser-persisted relational repository simulating Cloud Firestore collections. All actions (creating water bookings, accepting deliveries, advancing status, adding borewell readings, filing complaints) are permanently saved and survive page reloads.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Firestore Collections Schema Implemented:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="font-semibold text-blue-700">/users</span>
                    <p className="text-slate-600 font-sans text-[11px]">Customers, Suppliers, Admins</p>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="font-semibold text-blue-700">/suppliers</span>
                    <p className="text-slate-600 font-sans text-[11px]">Fleets, service areas, prices</p>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="font-semibold text-blue-700">/waterRequests</span>
                    <p className="text-slate-600 font-sans text-[11px]">Open broadcast demand</p>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="font-semibold text-blue-700">/bookings</span>
                    <p className="text-slate-600 font-sans text-[11px]">Timeline & state machine</p>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="font-semibold text-blue-700">/borewells</span>
                    <p className="text-slate-600 font-sans text-[11px]">Community wellhead assets</p>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="font-semibold text-blue-700">/borewellUsage</span>
                    <p className="text-slate-600 font-sans text-[11px]">Meter readings & kL logs</p>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="font-semibold text-blue-700">/reviews</span>
                    <p className="text-slate-600 font-sans text-[11px]">Ratings & tags</p>
                  </div>
                  <div className="p-2 bg-slate-50 border rounded-lg">
                    <span className="font-semibold text-blue-700">/complaints</span>
                    <p className="text-slate-600 font-sans text-[11px]">Resolution tracking desk</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-semibold text-slate-900 mb-1">Production Firebase Integration</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To switch this app to a live Google Cloud Firestore & Firebase Auth project, configure your Firebase Web App credentials in <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">firebase-applet-config.json</code> and enable Email/Password & Google Sign-in providers in the Firebase Console.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border text-xs flex justify-between items-center">
                <span>Active User: <strong>{currentUser?.fullName}</strong> ({currentUser?.role})</span>
                <span className="text-slate-400 text-[11px]">ID: {currentUser?.uid}</span>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-100 border-t flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
