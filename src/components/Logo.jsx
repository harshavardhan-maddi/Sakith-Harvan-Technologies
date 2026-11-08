import React from 'react';
import logoImg from '../assets/logo.png';

export const Logo = ({ size = 'md', showTagline = false, className = '' }) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const logoHeight = isSmall ? 'h-10 sm:h-12' : isLarge ? 'h-20 sm:h-24' : 'h-14 sm:h-16';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Company Logo Image */}
      <img
        src={logoImg}
        alt="Sakith Harvan Technologies"
        className={`${logoHeight} w-auto object-contain transition-transform duration-300 hover:scale-105 filter drop-shadow-[0_4px_12px_rgba(37,99,235,0.16)]`}
        onError={(e) => {
          e.target.src = '/SAKITH_HARVAN.png';
        }}
      />

      {showTagline && (
        <span className="text-xs tracking-wide text-blue-600 font-medium italic">
          "Innovate. Integrate. Elevate."
        </span>
      )}
    </div>
  );
};
