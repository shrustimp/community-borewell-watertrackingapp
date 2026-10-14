import React from 'react';
import { Logo } from '../common/Logo';
import { Shield, Droplets, MapPin, Heart, BookOpen } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="text-white">
              <Logo size="md" showTagline={false} />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              JalaConnect connects residents, gated communities, and local businesses with certified water tanker suppliers and provides community borewell usage accountability.
            </p>
            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-teal-400 mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>College Community PBL Project</span>
              </div>
              <p className="text-slate-400">
                Developed for Project-Based Learning in smart municipal & community resource management.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Water Services
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('new-request')}
                  className="hover:text-sky-400 transition cursor-pointer"
                >
                  Book Water Tanker
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('supplier-discovery')}
                  className="hover:text-sky-400 transition cursor-pointer"
                >
                  Verified Suppliers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('borewell')}
                  className="hover:text-sky-400 transition cursor-pointer"
                >
                  Community Borewell Meter Logs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('register')}
                  className="hover:text-sky-400 transition cursor-pointer"
                >
                  Become a Tanker Supplier
                </button>
              </li>
            </ul>
          </div>

          {/* Guidelines & Community */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Community & Governance
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Verified Supplier Audits</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span>Safe Water TDS Standardisation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Service Locality Cluster Routing</span>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="hover:text-sky-400 transition text-slate-400 cursor-pointer"
                >
                  Administrative Monitoring Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Project Details */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Project Demonstration
            </h4>
            <div className="space-y-2 text-slate-400 text-xs">
              <p>
                <strong>Focus Areas:</strong> Urban water shortage mitigation, anti-price gouging transparency, and shared community aquifer metering.
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Notice: Testimonials and simulated routes are demonstration examples prepared for academic project review.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-3">
          <p>© 2026 JalaConnect Community Project. Built for academic review & community benefit.</p>
          <div className="flex items-center gap-4">
            <span>Water Conservation Initiative</span>
            <span>·</span>
            <span>Zero Data Leak Guarantee</span>
            <span>·</span>
            <span className="text-teal-400 font-medium">College PBL MVP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
