export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Escudo Municipal"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logo-gradient)" />
      {/* Roofline */}
      <path d="M12 20 L24 12 L36 20 Z" fill="white" fillOpacity="0.95" />
      {/* Base */}
      <rect x="12" y="20" width="24" height="15" rx="1.5" fill="white" fillOpacity="0.95" />
      {/* Columns */}
      <rect x="16" y="23" width="2.4" height="9" rx="1" fill="var(--primary)" />
      <rect x="22.8" y="23" width="2.4" height="9" rx="1" fill="var(--primary)" />
      <rect x="29.6" y="23" width="2.4" height="9" rx="1" fill="var(--primary)" />
      {/* Base step */}
      <rect x="10" y="35" width="28" height="2.5" rx="1.25" fill="white" fillOpacity="0.95" />
    </svg>
  );
}
