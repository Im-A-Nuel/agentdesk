// AgentDesk brand mark: a scoped session key with a keyhole, set on the brass gradient tile.
// Mirrors public/icon.svg so the header wordmark and the favicon are the same mark.

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="brand-brass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7d4300" />
          <stop offset="52%" stopColor="#ad6807" />
          <stop offset="100%" stopColor="#d29a4c" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#brand-brass)" />
      <g fill="#ffffff" transform="translate(106 106) scale(12.5)">
        <path
          fillRule="evenodd"
          d="M8 3h8a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM10.6 5.8a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 1 0-2.8 0ZM11.3 5.8h1.4v2.4h-1.4Z"
        />
        <rect x="10.6" y="10" width="2.8" height="8" rx="1.4" />
        <rect x="6.6" y="16" width="4" height="1.9" rx="0.95" />
        <rect x="7.6" y="18.7" width="3" height="1.8" rx="0.9" />
      </g>
    </svg>
  );
}
