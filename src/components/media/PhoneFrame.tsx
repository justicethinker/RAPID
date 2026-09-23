import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
}

export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div
      className={cn(
        'relative mx-auto w-[340px] lg:w-[380px] max-w-[88vw] rounded-[48px] border-[10px] border-[#131E28]',
        'shadow-elev-3-dark',
        className
      )}
    >
      {/* Outer ring */}
      <div className="absolute -inset-[2px] rounded-[50px] border-2 border-[#35506A] pointer-events-none" />

      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[26px] w-24 rounded-b-[18px] bg-[#0D151D] z-10" />

      {/* Screen */}
      <div className="relative overflow-hidden rounded-[38px] bg-white">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-ink">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            {/* Signal bars */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#03121E" />
              <rect x="4" y="5" width="3" height="7" rx="0.5" fill="#03121E" />
              <rect x="8" y="2" width="3" height="10" rx="0.5" fill="#03121E" />
              <rect x="12" y="0" width="3" height="12" rx="0.5" fill="#03121E" />
            </svg>
            {/* WiFi */}
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M7 10.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" fill="#03121E" />
              <path d="M3.5 7.5C4.5 6.5 5.7 6 7 6s2.5.5 3.5 1.5" stroke="#03121E" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M1 4.5C2.8 2.7 4.8 1.8 7 1.8s4.2.9 6 2.7" stroke="#03121E" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {/* Battery */}
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
              <rect x="0.5" y="0.5" width="20" height="11" rx="2" stroke="#03121E" />
              <rect x="2" y="2" width="16" height="8" rx="1" fill="#03121E" />
              <rect x="21.5" y="3.5" width="2" height="5" rx="1" fill="#03121E" />
            </svg>
          </span>
        </div>
        {children}
      </div>

      {/* Side buttons */}
      <div className="absolute -right-[14px] top-24 h-8 w-[3px] rounded-full bg-[#2A3A4A]" />
      <div className="absolute -right-[14px] top-36 h-12 w-[3px] rounded-full bg-[#2A3A4A]" />
      <div className="absolute -left-[14px] top-28 h-10 w-[3px] rounded-full bg-[#2A3A4A]" />
    </div>
  );
}
