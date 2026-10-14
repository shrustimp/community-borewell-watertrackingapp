import React, { useState, useRef, useEffect } from 'react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  Truck,
  ShieldCheck,
  Menu,
  X,
  Droplets,
  Calendar,
  Search,
  Check,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/storageService';
import { NotificationItem } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { currentUser, role, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      setNotifications(getNotifications(currentUser.uid));
    } else {
      setNotifications([]);
    }
  }, [currentUser, currentView]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationRead(item.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setShowNotifications(false);

    if (item.type === 'booking') {
      if (role === 'customer') {
        onNavigate('customer-dashboard');
      } else if (role === 'supplier') {
        onNavigate('supplier-dashboard');
      } else {
        onNavigate('admin-dashboard');
      }
    } else if (item.type === 'supplier' && role === 'admin') {
      onNavigate('admin-dashboard');
    }
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      markAllNotificationsRead(currentUser.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-7 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('landing')}
              className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg cursor-pointer"
            >
              <Logo size="md" showTagline={false} />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => onNavigate('landing')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  currentView === 'landing'
                    ? 'text-blue-700 bg-blue-50/70 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => onNavigate('supplier-discovery')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'supplier-discovery'
                    ? 'text-blue-700 bg-blue-50/70 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className="w-4 h-4 text-slate-400" />
                Find Tankers
              </button>

              <button
                onClick={() => onNavigate('new-request')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'new-request'
                    ? 'text-blue-700 bg-blue-50/70 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Droplets className="w-4 h-4 text-blue-500" />
                Book Water
              </button>

              <button
                onClick={() => onNavigate('borewell')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'borewell'
                    ? 'text-blue-700 bg-blue-50/70 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-teal-600" />
                Community Borewells
              </button>

              {currentUser && (
                <button
                  onClick={() => {
                    if (role === 'customer') onNavigate('customer-dashboard');
                    else if (role === 'supplier') onNavigate('supplier-dashboard');
                    else onNavigate('admin-dashboard');
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    ['customer-dashboard', 'supplier-dashboard', 'admin-dashboard'].includes(currentView)
                      ? 'text-blue-700 bg-blue-50/70 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Right Header Area */}
          <div className="flex items-center gap-3">
            {/* Quick Request CTA if Customer or Visitor */}
            <button
              onClick={() => onNavigate('new-request')}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5 fill-current" />
              Get Water Now
            </button>

            {currentUser ? (
              <>
                {/* Notifications Button */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    aria-label="View notifications"
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-800">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-[11px] bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-xs">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <button
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer ${
                                !n.isRead ? 'bg-sky-50/50' : ''
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                  !n.isRead ? 'bg-blue-600' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {currentUser.fullName.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left text-xs">
                      <p className="font-semibold text-slate-900 truncate max-w-[120px]">
                        {currentUser.fullName}
                      </p>
                      <span className="text-[10px] text-slate-500 capitalize">{currentUser.role}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-100 text-xs">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900">{currentUser.fullName}</p>
                        <p className="text-slate-500 truncate text-[11px]">{currentUser.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          {role === 'customer' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              <User className="w-3 h-3" /> Resident Customer
                            </span>
                          )}
                          {role === 'supplier' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                              <Truck className="w-3 h-3" /> Tanker Supplier
                            </span>
                          )}
                          {role === 'admin' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              <ShieldCheck className="w-3 h-3" /> Administrator
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            if (role === 'customer') onNavigate('customer-dashboard');
                            else if (role === 'supplier') onNavigate('supplier-dashboard');
                            else onNavigate('admin-dashboard');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          Dashboard
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('profile');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          My Profile & Saved Address
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('supplier-discovery');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          Find Suppliers
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('borewell');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          Community Borewells
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                            onNavigate('login');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open mobile menu"
                className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('new-request');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Book Water Delivery
          </button>
          <button
            onClick={() => {
              onNavigate('supplier-discovery');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
          >
            Find Water Tankers
          </button>
          <button
            onClick={() => {
              onNavigate('borewell');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
          >
            Community Borewells
          </button>
          {currentUser && (
            <button
              onClick={() => {
                if (role === 'customer') onNavigate('customer-dashboard');
                else if (role === 'supplier') onNavigate('supplier-dashboard');
                else onNavigate('admin-dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
            >
              My Dashboard ({role})
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
