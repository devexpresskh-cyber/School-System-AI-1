import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  branchNumber?: string | number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = false, 
  branchNumber = '2',
  className = '' 
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} shrink-0 rounded-full flex items-center justify-center shadow-xs`}>
        {/* SVG emblem matching FBIS seal with gear, book, torch, laurel */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Outer circle */}
          <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#0052CC" strokeWidth="2.5" />
          
          {/* Outer Gear */}
          <circle cx="50" cy="50" r="43" fill="none" stroke="#D32F2F" strokeWidth="2" strokeDasharray="3 2" />
          
          {/* Inner ring */}
          <circle cx="50" cy="50" r="38" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          
          {/* Cog teeth wheel */}
          <path 
            d="M50 16 L53 22 L59 21 L60 27 L66 28 L65 34 L71 37 L68 42 L73 47 L69 51 L72 57 L67 60 L68 66 L62 67 L61 73 L55 72 L53 78 L47 78 L45 72 L39 73 L38 67 L32 66 L33 60 L28 57 L31 51 L27 47 L32 42 L29 37 L35 34 L34 28 L40 27 L41 21 L47 22 Z" 
            fill="#D32F2F" 
            opacity="0.9"
          />
          <circle cx="50" cy="50" r="26" fill="#0D47A1" />
          
          {/* Book */}
          <path 
            d="M32 58 C 40 54, 46 56, 50 60 C 54 56, 60 54, 68 58 L68 44 C 60 40, 54 42, 50 46 C 46 42, 40 40, 32 44 Z" 
            fill="#FFFFFF" 
            stroke="#1E3A8A" 
            strokeWidth="1.2"
          />
          <line x1="50" y1="46" x2="50" y2="60" stroke="#1E3A8A" strokeWidth="1" />
          
          {/* Torch of wisdom in the center */}
          <path d="M48 42 L52 42 L51 51 L49 51 Z" fill="#F59E0B" />
          <path d="M47 38 C 47 33, 50 30, 50 30 C 50 30, 53 33, 53 38 C 53 41, 51.5 42, 50 42 C 48.5 42, 47 41, 47 38 Z" fill="#EF4444" />
          <circle cx="50" cy="38" r="2" fill="#FDE047" />

          {/* Text in arc FBIS */}
          <text x="50" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="sans-serif">FBIS</text>
        </svg>

        {branchNumber && (
          <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {branchNumber}
          </span>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-blue-900 tracking-wide font-khmer leading-tight">
            សាលា អន្តរជាតិ ភ្លឺរស្មីក្រោយ
          </span>
          <span className="text-[11px] font-bold text-red-600 tracking-wider leading-tight">
            FUTURE BRIGHT INTERNATIONAL SCHOOL
          </span>
        </div>
      )}
    </div>
  );
};
