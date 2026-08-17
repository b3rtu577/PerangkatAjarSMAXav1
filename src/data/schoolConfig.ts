// School Identity Configuration for SMA Xaverius 1 Palembang

// SVG Vector Crest Logo of SMA Xaverius 1 Palembang (encoded as clean SVG Data URI)
export const SCHOOL_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%">
  <defs>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>

  <!-- Outer Shield Border -->
  <path d="M 20 25 C 50 15, 150 15, 180 25 C 190 25, 195 40, 185 60 C 185 140, 160 195, 100 230 C 40 195, 15 140, 15 60 C 5 40, 10 25, 20 25 Z"
        fill="#ffffff" stroke="#6366f1" stroke-width="4" stroke-linejoin="round"/>
  
  <!-- Shield Inner Border line -->
  <path d="M 24 29 C 52 20, 148 20, 176 29 C 184 30, 188 43, 180 60 C 180 135, 156 188, 100 222 C 44 188, 20 135, 20 60 C 12 43, 16 30, 24 29 Z"
        fill="none" stroke="#818cf8" stroke-width="2"/>

  <!-- Top Red Banner "PPSK" -->
  <path d="M 28 32 L 172 32 L 160 62 L 40 62 Z" fill="url(#redGrad)" stroke="#b91c1c" stroke-width="1.5"/>
  <text x="100" y="53" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle" letter-spacing="3">PPSK</text>

  <!-- Top Left Quadrant: Yellow (Quill Pen & Inkwell) -->
  <path d="M 40 62 L 100 62 L 100 130 L 22 130 C 22 100, 28 78, 40 62 Z" fill="url(#yellowGrad)" stroke="#1e293b" stroke-width="1.5"/>
  <g transform="translate(30, 68)">
    <rect x="18" y="22" width="22" height="18" fill="#334155" rx="3" stroke="#0f172a" stroke-width="1.5"/>
    <ellipse cx="29" cy="22" rx="11" ry="4" fill="#64748b"/>
    <path d="M 42 6 C 30 15, 18 28, 8 40 L 14 42 C 24 30, 36 18, 46 10 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
    <path d="M 12 36 L 2 46 L 8 44 Z" fill="#0f172a"/>
  </g>

  <!-- Top Right Quadrant: Blue (Torch) -->
  <path d="M 100 62 L 160 62 C 172 78, 178 100, 178 130 L 100 130 Z" fill="url(#blueGrad)" stroke="#1e293b" stroke-width="1.5"/>
  <g transform="translate(108, 68)">
    <path d="M 10 38 L 38 10" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
    <path d="M 10 38 L 38 10" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
    <path d="M 32 16 L 46 6 L 42 22 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
    <path d="M 44 4 C 52 -2, 56 6, 48 12 C 44 10, 42 6, 44 4 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/>
  </g>

  <!-- Bottom Left Quadrant: Blue (3 Interlocking Rings) -->
  <path d="M 22 130 L 100 130 L 100 222 C 60 200, 32 165, 22 130 Z" fill="url(#blueGrad)" stroke="#1e293b" stroke-width="1.5"/>
  <g transform="translate(30, 138)">
    <circle cx="20" cy="18" r="13" fill="none" stroke="#ef4444" stroke-width="4.5"/>
    <circle cx="34" cy="28" r="13" fill="none" stroke="#ef4444" stroke-width="4.5"/>
    <circle cx="20" cy="38" r="13" fill="none" stroke="#ef4444" stroke-width="4.5"/>
  </g>

  <!-- Bottom Right Quadrant: Yellow (Chain) -->
  <path d="M 100 130 L 178 130 C 168 165, 140 200, 100 222 Z" fill="url(#yellowGrad)" stroke="#1e293b" stroke-width="1.5"/>
  <g transform="translate(112, 138)">
    <rect x="10" y="8" width="26" height="16" rx="8" fill="none" stroke="#ffffff" stroke-width="4"/>
    <rect x="10" y="8" width="26" height="16" rx="8" fill="none" stroke="#0f172a" stroke-width="1.5"/>
    <rect x="18" y="22" width="26" height="16" rx="8" fill="none" stroke="#ffffff" stroke-width="4"/>
    <rect x="18" y="22" width="26" height="16" rx="8" fill="none" stroke="#0f172a" stroke-width="1.5"/>
    <rect x="10" y="36" width="26" height="16" rx="8" fill="none" stroke="#ffffff" stroke-width="4"/>
    <rect x="10" y="36" width="26" height="16" rx="8" fill="none" stroke="#0f172a" stroke-width="1.5"/>
  </g>

  <!-- Center Circle: Red Rim, White Fill -->
  <circle cx="100" cy="125" r="28" fill="#ffffff" stroke="#ef4444" stroke-width="4"/>
  <circle cx="100" cy="125" r="24" fill="#ffffff" stroke="#dc2626" stroke-width="1.5"/>
  
  <!-- Center Text "SMA" -->
  <text x="100" y="128" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="16" fill="#ef4444" text-anchor="middle">SMA</text>

  <!-- Text Along Curved Bottom Ring "XAVERIUS 1" -->
  <path id="circleTextPath" d="M 76 138 A 22 22 0 0 0 124 138" fill="none"/>
  <text font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="8.5" fill="#dc2626" letter-spacing="1">
    <textPath href="#circleTextPath" startOffset="50%" text-anchor="middle">
      XAVERIUS 1
    </textPath>
  </text>
</svg>
`)}`;

export const SCHOOL_IDENTITY = {
  name: 'SMA Xaverius 1 Palembang',
  shortName: 'SMA XAVERIUS 1 PALEMBANG',
  logo: SCHOOL_LOGO,
};

export default SCHOOL_IDENTITY;
