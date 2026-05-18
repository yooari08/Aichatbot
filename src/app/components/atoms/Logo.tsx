export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="10" fill="url(#logoGradient)" />
      {/* Chat bubble shape */}
      <rect x="9" y="11" width="22" height="15" rx="4" fill="white" fillOpacity="0.2" />
      <rect x="9" y="11" width="22" height="15" rx="4" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
      {/* M letter mark */}
      <path
        d="M15 21V16L17.8 19.5L20 16L22.2 19.5L25 16V21"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chat tail */}
      <path
        d="M15 26L12 29V26H11C10 26 9 25 9 24V24H15"
        fill="white"
        fillOpacity="0.3"
      />
      <defs>
        <linearGradient
          id="logoGradient"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
