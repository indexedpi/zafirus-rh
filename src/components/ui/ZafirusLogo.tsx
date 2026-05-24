import React from 'react';
import { cn } from '../../utils/cn';

interface ZafirusLogoProps {
  size?: number;
  glow?: boolean;
  className?: string;
}

export function ZafirusLogo({ size = 30, glow = false, className }: ZafirusLogoProps) {
  const glowId = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 94 94"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('select-none flex-shrink-0 drop-shadow-[0_2px_8px_rgba(15,23,42,0.35)]', className)}
      aria-hidden="true"
    >
      {glow && (
        <defs>
          <filter id={glowId} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      )}

      {/* Top/Left stylized path (White) */}
      <path
        d="M58.75 82.2509L47 94.0009L0 47.0009L8.93002 38.2275H32.43L23.5 47.0009L35.72 59.0642L47 70.5009L58.75 82.2509Z"
        fill="white"
      />

      {/* Bottom/Right stylized path (White) */}
      <path
        d="M35.25 11.75L47 0L94 47L85.2267 55.7733H61.7267L70.5 47L58.4367 34.9367L47 23.5L35.25 11.75Z"
        fill="white"
      />

      {/* Center Diamond (Brand primary: #459CDB) */}
      <path
        d="M64.7031 47.0009L46.9998 64.7042L29.4531 47.0009L38.2264 38.2275L46.9998 47.0009L55.9298 38.2275L64.7031 47.0009Z"
        fill="#459CDB"
        filter={glow ? `url(#${glowId})` : undefined}
      />
    </svg>
  );
}
