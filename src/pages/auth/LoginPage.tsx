import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { Mail, Lock, AlertCircle, ArrowRight, UserCheck, Shield, Truck } from 'lucide-react';
import { ForgotPasswordModal } from '../../components/common/ForgotPasswordModal';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email);
      setLoading(false);
      if (res.success) {
        onNavigate('customer-dashboard');
      } else {
        setError(res.error || 'Failed to login');
      }
    }, 300);
  };

  const handleQuickDemoLogin = (role: 'customer' | 'supplier' | 'admin') => {
    switchDemoRole(role);
    if (role === 'customer') onNavigate('customer-dashboard');
    else if (role === 'supplier') onNavigate('supplier-dashboard');
    else onNavigate('admin-dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <Logo size="lg" showTagline={false} />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
          Sign In to JalaConnect
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your water bookings, tanker dispatch, or community borewells
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="resident@jalaconnect.org"
                  className="block w-full pl-10 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                />
              </div>
            </div>

            <ForgotPasswordModal
              isOpen={showForgotPassword}
              onClose={() => setShowForgotPassword(false)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              {loading ? 'Verifying...' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Logins for Faculty / Examiner Viva */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Role Demonstration
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 text-center transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-slate-900 block">Customer</span>
                <span className="text-[9px] text-slate-500 block">Rahul Sharma</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('supplier')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50 hover:bg-sky-50/50 text-center transition cursor-pointer"
              >
                <Truck className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-slate-900 block">Supplier</span>
                <span className="text-[9px] text-slate-500 block">Kaveri Tankers</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 text-center transition cursor-pointer"
              >
                <Shield className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-slate-900 block">Admin</span>
                <span className="text-[9px] text-slate-500 block">Dr. Ananya</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
