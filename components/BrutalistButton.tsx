import React from 'react';

interface Props {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  disabled?: boolean;
}

export const BrutalistButton: React.FC<Props> = ({ onClick, children, active, className = '', disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-4 text-lg font-bold uppercase tracking-widest no-radius border-4 transition-all duration-100
        font-mono group overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed border-gray-600 text-gray-600' : ''}
        ${active 
          ? 'bg-neon-magenta border-neon-magenta text-berlin-black' 
          : 'bg-transparent border-berlin-white text-berlin-white hover:bg-white hover:text-black'}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-between w-full gap-4">
        {children}
        {!active && !disabled && <span className="text-neon-magenta opacity-0 group-hover:opacity-100 transition-opacity">→</span>}
      </span>
      
      {/* Hover Glitch Effect Background */}
      <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-0 mix-blend-difference"></div>
    </button>
  );
};