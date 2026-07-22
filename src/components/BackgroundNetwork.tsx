"use client";

import React from "react";

export const BackgroundNetwork: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Network constellation lines matching reference image */}
        <g stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="3 3">
          {/* Top constellation */}
          <line x1="15%" y1="12%" x2="38%" y2="8%" />
          <line x1="38%" y1="8%" x2="45%" y2="22%" />
          <line x1="45%" y1="22%" x2="78%" y2="15%" />
          
          {/* Mid constellation */}
          <line x1="10%" y1="32%" x2="22%" y2="44%" />
          <line x1="22%" y1="44%" x2="52%" y2="38%" />
          <line x1="52%" y1="38%" x2="85%" y2="34%" />
          <line x1="60%" y1="25%" x2="68%" y2="42%" />
          <line x1="68%" y1="42%" x2="90%" y2="38%" />

          {/* Lower constellation */}
          <line x1="18%" y1="68%" x2="42%" y2="72%" />
          <line x1="42%" y1="72%" x2="48%" y2="64%" />
          <line x1="48%" y1="64%" x2="72%" y2="82%" />
          <line x1="28%" y1="88%" x2="48%" y2="84%" />
          <line x1="48%" y1="84%" x2="62%" y2="92%" />
        </g>

        {/* Constellation node dots */}
        <g fill="#94a3b8">
          <circle cx="15%" cy="12%" r="2" />
          <circle cx="38%" cy="8%" r="2" />
          <circle cx="45%" cy="22%" r="2.5" />
          <circle cx="78%" cy="15%" r="2" />
          <circle cx="10%" cy="32%" r="2" />
          <circle cx="22%" cy="44%" r="2.5" />
          <circle cx="52%" cy="38%" r="3" fill="#64748b" />
          <circle cx="85%" cy="34%" r="2" />
          <circle cx="60%" cy="25%" r="2" />
          <circle cx="68%" cy="42%" r="2.5" />
          <circle cx="90%" cy="38%" r="2" />
          <circle cx="18%" cy="68%" r="2" />
          <circle cx="42%" cy="72%" r="3" fill="#64748b" />
          <circle cx="48%" cy="64%" r="2.5" />
          <circle cx="72%" cy="82%" r="2" />
          <circle cx="28%" cy="88%" r="2" />
          <circle cx="48%" cy="84%" r="2.5" />
          <circle cx="62%" cy="92%" r="2" />
        </g>
      </svg>
    </div>
  );
};
