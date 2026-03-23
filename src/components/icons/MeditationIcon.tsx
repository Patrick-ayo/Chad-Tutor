import React from 'react';

export function MeditationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width="1em"
      height="1em"
      fill="currentColor"
      {...props}
    >
      {/* Head */}
      <circle cx="256" cy="80" r="60" stroke="currentColor" strokeWidth="24" fill="none" />
      
      {/* Body */}
      <path
        d="M 180 200 L 180 280 Q 180 320 220 320 L 292 320 Q 332 320 332 280 L 332 200"
        stroke="currentColor"
        strokeWidth="24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Left arm - curved */}
      <path
        d="M 220 220 Q 140 240 120 300"
        stroke="currentColor"
        strokeWidth="24"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Right arm */}
      <line x1="292" y1="220" x2="292" y2="280" stroke="currentColor" strokeWidth="24" strokeLinecap="round" />
      
      {/* Legs/Base */}
      <path
        d="M 200 320 L 200 360 Q 200 380 220 380 L 292 380 Q 312 380 312 360 L 312 320"
        stroke="currentColor"
        strokeWidth="24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Sitting base */}
      <path
        d="M 140 380 Q 140 400 160 400 L 352 400 Q 372 400 372 380"
        stroke="currentColor"
        strokeWidth="24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
