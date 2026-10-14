import React from 'react';
import {
  Droplets,
  Truck,
  CheckCircle,
  Clock,
  Shield,
  MapPin,
  TrendingUp,
  FileText,
  AlertCircle,
  Star,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Activity,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { role } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/80 via-white to-slate-50 pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold">
                <Droplets className="w-4 h-4 text-blue-600 fill-blue-600" />
                <span>Reliable Water. Right When You Need It.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.12]">
                Water Delivery <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-600 to-teal-600">
                  Made Simple
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Book water tankers, schedule deliveries, and connect with trusted local suppliers through one simple community platform. Plus, monitor shared borewell usage responsibly.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('new-request')}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Droplets className="w-4 h-4 fill-current" />
                  Book Water Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-sky-600" />
                  Become a Supplier
                </button>

                <button
                  onClick={() => onNavigate('borewell')}
                  className="px-5 py-3.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-sm rounded-xl border border-teal-200 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-teal-600" />
                  Borewell Logs
                </button>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-left">
                <div>
                  <p className="text-xl font-bold text-slate-900">100%</p>
                  <p className="text-xs text-slate-500">Fixed & Fair Pricing</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">4,000L - 12kL</p>
                  <p className="text-xs text-slate-500">Flexible Capacities</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">Live Status</p>
                  <p className="text-xs text-slate-500">Dispatch Tracking</p>
                </div>
              </div>
            </div>

            {/* Right Graphic: Water Tanker & Community Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl shadow-blue-500/10 border border-slate-200/80">
                {/* Visual Header Mock */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Kaveri Fresh Tankers</h2>
                      <p className="text-[11px] text-teal-700 font-medium">✓ Verified Supplier · KA-53-MC-4219</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    ₹850 / 6000L
                  </span>
                </div>

                {/* SVG Visual Representation of Tanker, Droplets & Residential House */}
                <div className="bg-gradient-to-b from-sky-50 to-blue-50/50 rounded-2xl p-4 mb-4 border border-sky-100">
                  <svg viewBox="0 0 400 200" className="w-full h-auto drop-shadow-sm" fill="none">
                    {/* Road */}
                    <rect x="0" y="160" width="400" height="40" fill="#cbd5e1" />
                    <line x1="10" y1="180" x2="390" y2="180" stroke="#f8fafc" strokeWidth="4" strokeDasharray="16 12" />

                    {/* House */}
                    <rect x="30" y="80" width="90" height="80" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                    <polygon points="20,80 75,35 130,80" fill="#0284c7" />
                    <rect x="45" y="115" width="22" height="45" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
                    <rect x="80" y="95" width="25" height="25" rx="3" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1.5" />
                    {/* Underground Sump */}
                    <rect x="35" y="165" width="50" height="25" rx="3" fill="#0284c7" opacity="0.3" />
                    <text x="40" y="180" fontSize="9" fill="#0369a1" fontWeight="bold">SUMP</text>

                    {/* Water Pipe Connection */}
                    <path d="M90 175 Q160 178 200 160" stroke="#0284c7" strokeWidth="4" strokeDasharray="6 4" />

                    {/* Water Tanker Truck */}
                    {/* Tank */}
                    <rect x="180" y="85" width="130" height="65" rx="20" fill="#0284c7" />
                    <rect x="195" y="95" width="100" height="45" rx="12" fill="#0369a1" />
                    <text x="210" y="122" fill="#ffffff" fontSize="12" fontWeight="bold" letterSpacing="1">POTABLE WATER</text>
                    {/* Droplet on Tank */}
                    <path d="M 285 110 C 285 106 280 100 280 100 C 280 100 275 106 275 110 C 275 113 277 115 280 115 C 283 115 285 113 285 110 Z" fill="#38bdf8" />

                    {/* Truck Cabin */}
                    <path d="M310 100 L345 100 L360 125 L360 150 L310 150 Z" fill="#0f172a" />
                    {/* Window */}
                    <path d="M318 106 L340 106 L348 122 L318 122 Z" fill="#e0f2fe" />

                    {/* Wheels */}
                    <circle cx="210" cy="155" r="16" fill="#1e293b" />
                    <circle cx="210" cy="155" r="7" fill="#94a3b8" />
                    <circle cx="270" cy="155" r="16" fill="#1e293b" />
                    <circle cx="270" cy="155" r="7" fill="#94a3b8" />
                    <circle cx="340" cy="155" r="16" fill="#1e293b" />
                    <circle cx="340" cy="155" r="7" fill="#94a3b8" />
                  </svg>
                </div>

                {/* Live Delivery Progress Pill */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">Dispatch Order #JC-BK-8801</span>
                    <span className="text-teal-700 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                      Out for Delivery
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-teal-500 h-full w-3/4 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Bellandur Outer Ring Rd</span>
                    <span>ETA: 15 mins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              The Community Problem & The Solution
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Ending Informal Phone Calls & Spot Surges
            </h3>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              When ground aquifers run low, residents and communities scramble across informal phone contacts, leading to unpredictable pricing, unverified water quality, and missing drivers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Old Way */}
            <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span>The Traditional Chaos</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Endless calling of 5-8 different phone numbers during water shortages.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Arbitrary spot pricing with no transparency or receipts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>No confirmation of tanker arrival time or driver contact until the last minute.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Unchecked community borewells running dry with zero meter accountability.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-red-100 text-red-600 text-[11px] font-medium">
                Results in dry community sumps, inflated costs, and resident disputes.
              </div>
            </div>

            {/* The JalaConnect Way */}
            <div className="bg-blue-50/60 rounded-2xl p-6 border border-blue-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-4">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span>The JalaConnect Platform</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">✓</span>
                    <span>One-click digital requests broadcast to vetted, verified suppliers in your locality.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">✓</span>
                    <span>Transparent published rates per tanker (4kL, 6kL, 10kL) with agreed price locks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">✓</span>
                    <span>Real-time status transitions: Requested → Accepted → Scheduled → Out for Delivery → Delivered.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">✓</span>
                    <span>Integrated Community Borewell meter logging with daily consumption analytics.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-blue-200 text-blue-700 text-[11px] font-medium">
                Equitable, dependable water allocation with community peace of mind.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (6 steps) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              Simple Workflow
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">How JalaConnect Works</h3>
            <p className="mt-2 text-slate-600 text-sm">
              From water shortage to full sump in 6 transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Create an Account',
                desc: 'Sign up as a Household, Apartment Committee, Commercial user, or Tanker Supplier.',
              },
              {
                step: '02',
                title: 'Enter Water Needs',
                desc: 'Select capacity (e.g., 6,000L), water type (potable vs utility), schedule, and delivery address.',
              },
              {
                step: '03',
                title: 'Choose or Broadcast',
                desc: 'Pick your preferred local supplier or submit a broadcast request for instant supplier bids.',
              },
              {
                step: '04',
                title: 'Confirm Booking',
                desc: 'Review locked pricing and scheduled delivery slot. No hidden spot surcharges.',
              },
              {
                step: '05',
                title: 'Track Dispatch to Delivery',
                desc: 'Receive live updates as the tanker is filled, dispatched, and pumps into your sump.',
              },
              {
                step: '06',
                title: 'Rate & Review',
                desc: 'Rate water cleanliness, driver punctuality, and TDS quality to maintain community trust.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all text-left space-y-2.5"
              >
                <span className="text-2xl font-black text-blue-600">{item.step}</span>
                <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Borewell Management Spotlight */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4 text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/80 text-teal-300 border border-teal-700 text-xs font-semibold">
                  <Activity className="w-3.5 h-3.5" />
                  Separate Community Resource Feature
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Community Borewell Metering & Groundwater Logs
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Responsible management of shared groundwater assets. Keep accurate opening and closing meter readings for apartment and village borewells, track kiloliters pumped, prevent pump burnouts, and download CSV compliance reports for resident welfare meetings.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => onNavigate('borewell')}
                    className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Open Community Borewell Registry
                  </button>
                  <span className="text-xs text-slate-400 self-center">
                    *Recorded meter readings, not ungrounded sensor claims.
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="font-semibold text-sky-300">Borewell #1 (North Gate Aquifer)</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Today's Pumping</span>
                    <strong className="text-base text-white">12,000 Liters</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Meter</span>
                    <strong className="text-base text-white">1456.0 kL</strong>
                  </div>
                </div>
                <div className="p-2.5 bg-black/20 rounded-lg text-[11px] text-slate-300">
                  Purpose: Blocks A & B Domestic Overhead Tanks refill. Flow rate verified normal.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Suppliers Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                Partner with JalaConnect
              </span>
              <h3 className="text-3xl font-extrabold text-slate-900">
                Grow Your Water Tanker Business
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Are you a licensed water tanker operator? Say goodbye to unorganized phone queues and missed deliveries. JalaConnect gives you a digital command center to receive bookings in your defined localities, manage delivery slots, and build a trusted 5-star reputation.
              </p>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-sky-600" />
                  <span>Receive nearby requests matching your exact tanker capacities (4kL, 6kL, 10kL).</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-sky-600" />
                  <span>Set your own transparent pricing per tanker or per kiloliter.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-sky-600" />
                  <span>Customer phone & full address revealed only upon acceptance for privacy.</span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Register as a Tanker Supplier
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-left">
              <h4 className="font-bold text-slate-900 text-sm">Supplier Verification Guarantee</h4>
              <p className="text-xs text-slate-500">
                All supplier accounts undergo administrative review of vehicle registration and water source hygiene before acceptance privileges are granted.
              </p>
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800">Kaveri Fresh Tankers</span>
                  <span className="text-teal-700 font-bold">Approved</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  "We have cut dead mileage by 35% by taking batch orders in Bellandur and Whitefield rather than random cross-town calls."
                </p>
                <div className="text-[10px] text-slate-400">
                  — Ramesh Kumar, Fleet Owner (3 Tankers)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demonstration Testimonials (Marked clearly per guidelines) */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
              Demonstration Testimonials
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              Feedback from Community Pilots
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sample simulation data prepared for academic review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic">
                "Our apartment complex needed 12,000L on urgent notice when the municipal line broke. The urgent tag alerted Kaveri Tankers and delivery was at our gate in 45 minutes."
              </p>
              <div>
                <strong className="text-xs text-slate-900 block">Rahul Sharma</strong>
                <span className="text-[11px] text-slate-500">Green Glen Residency RWA</span>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic">
                "Logging our daily borewell pump readings in JalaConnect revealed a hidden pipe leakage under Block C before our motor burned out. Invaluable tool for community management."
              </p>
              <div>
                <strong className="text-xs text-slate-900 block">Suresh Varma</strong>
                <span className="text-[11px] text-slate-500">Water Committee Secretary</span>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic">
                "No more arguments over verbal rates. Residents see our verified prices upfront and we receive scheduled runs that match our drivers' shifts perfectly."
              </p>
              <div>
                <strong className="text-xs text-slate-900 block">Girish Patel</strong>
                <span className="text-[11px] text-slate-500">Nandi Pure Aqua Services</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-12 bg-gradient-to-r from-blue-700 to-sky-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to Schedule Water for Your Community?</h3>
          <p className="text-blue-100 text-sm max-w-xl mx-auto">
            Experience reliable, transparent water deliveries and proactive borewell accountability today.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onNavigate('new-request')}
              className="px-6 py-3 bg-white hover:bg-slate-100 text-blue-900 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Request Water Tanker Now
            </button>
            <button
              onClick={() => onNavigate('supplier-discovery')}
              className="px-6 py-3 bg-blue-900/40 hover:bg-blue-900/60 text-white font-semibold text-xs rounded-xl border border-white/20 transition cursor-pointer"
            >
              Browse Local Suppliers
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
