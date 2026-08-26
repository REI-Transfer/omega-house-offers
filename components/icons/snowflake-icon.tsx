interface SnowflakeIconProps {
  className?: string
}

export function SnowflakeIcon({ className }: SnowflakeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Main vertical line */}
      <line x1="12" y1="2" x2="12" y2="22" />
      {/* Top branches */}
      <line x1="12" y1="2" x2="9" y2="5" />
      <line x1="12" y1="2" x2="15" y2="5" />
      {/* Bottom branches */}
      <line x1="12" y1="22" x2="9" y2="19" />
      <line x1="12" y1="22" x2="15" y2="19" />
      {/* Main diagonal lines */}
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
      {/* Top-left diagonal branches */}
      <line x1="4.93" y1="4.93" x2="4.93" y2="8" />
      <line x1="4.93" y1="4.93" x2="8" y2="4.93" />
      {/* Top-right diagonal branches */}
      <line x1="19.07" y1="4.93" x2="19.07" y2="8" />
      <line x1="19.07" y1="4.93" x2="16" y2="4.93" />
      {/* Bottom-left diagonal branches */}
      <line x1="4.93" y1="19.07" x2="4.93" y2="16" />
      <line x1="4.93" y1="19.07" x2="8" y2="19.07" />
      {/* Bottom-right diagonal branches */}
      <line x1="19.07" y1="19.07" x2="19.07" y2="16" />
      <line x1="19.07" y1="19.07" x2="16" y2="19.07" />
      {/* Horizontal line */}
      <line x1="2" y1="12" x2="22" y2="12" />
      {/* Left branches */}
      <line x1="2" y1="12" x2="5" y2="9" />
      <line x1="2" y1="12" x2="5" y2="15" />
      {/* Right branches */}
      <line x1="22" y1="12" x2="19" y2="9" />
      <line x1="22" y1="12" x2="19" y2="15" />
    </svg>
  )
}
