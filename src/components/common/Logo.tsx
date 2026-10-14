import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-sky-500 shadow-md shadow-blue-500/20 text-white ${iconSizes[size]}`}>
        {/* Droplet & Water Wave SVG */}
        <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="rgba(255,255,255,0.2)" />
          <path d="M7 16c2.5-1 3.5 1 5 1s2.5-2 5-1" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-teal-400 border-2 border-white rounded-full"></span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-tight">
          <span className={`font-bold tracking-tight text-slate-900 ${textSizes[size]}`}>
            Jala<span className="text-blue-600">Connect</span>
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 tracking-wide">
            Reliable Water. Right When You Need It.
          </span>
        )}
      </div>
    </div>
  );
};
