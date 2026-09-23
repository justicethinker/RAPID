import type { CSSProperties } from 'react';
import { Users, Coffee, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { FIND_PEOPLE } from '@/content/copy';
import { useInView } from '@/hooks/useInView';
import { Avatar } from '@/components/media/Avatar';
import { Photo } from '@/components/media/Photo';
import { cn } from '@/lib/cn';

interface Profile {
  icon: LucideIcon;
  label: string;
  variant: 'B' | 'C' | 'G';
  photo: string;
}

const PROFILES: Profile[] = [
  { icon: Coffee, label: 'Buys lunch near campus', variant: 'B', photo: '/images/profile-1.webp' },
  { icon: Users, label: 'Often waits in a queue', variant: 'C', photo: '/images/profile-2.webp' },
  { icon: UtensilsCrossed, label: 'Open to trying pre-orders', variant: 'G', photo: '/images/profile-3.webp' },
];

/* Desktop diagram lives on a fixed 640×480 stage. Cards and the node are
   placed at exact pixels in the same coordinate space as these paths, so
   every line starts under the node and ends just inside the card it points
   at. The lines render BEHIND the cards, so nothing ever covers a photo. */
const DESKTOP_PATHS = [
  'M245 175 C225 168 195 140 182 100', // node → profile 1 (top-left)
  'M395 200 C412 190 432 165 446 145', // node → profile 2 (right)
  'M300 240 C298 262 275 292 255 306', // node → profile 3 (bottom)
];

const DESKTOP_CARDS: Array<{ left: number; top: number }> = [
  { left: 0, top: 0 },
  { left: 440, top: 50 },
  { left: 150, top: 300 },
];

const ARIA_LABEL = "Example profiles connected to the audience 'students near campus'";

function AudienceNode({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sand-300 bg-sand-100 p-4 shadow-[0_20px_44px_-24px_rgba(11,24,38,.32)]',
        className
      )}
      style={style}
    >
      <Users size={28} className="text-brand-700 mb-2" />
      <p className="text-[13px] text-light-muted">{FIND_PEOPLE.audienceLabel}</p>
      <p className="text-sm font-bold text-ink">{FIND_PEOPLE.audienceValue}</p>
    </div>
  );
}

function DesktopCard({ profile, index, isInView }: { profile: Profile; index: number; isInView: boolean }) {
  const Icon = profile.icon;
  const pos = DESKTOP_CARDS[index]!;
  return (
    <div
      className={cn(
        'absolute w-[190px] overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-elev-2 transition-all duration-500',
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      )}
      style={{ left: pos.left, top: pos.top, transitionDelay: `${index * 150}ms` }}
    >
      <div className="relative h-[110px] bg-gradient-to-br from-navy-100 to-navy-50">
        <Avatar variant={profile.variant} className="w-full h-full" />
        <Photo
          src={profile.photo}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </div>
      <div className="p-3 flex items-center gap-2">
        <Icon size={14} className="text-brand-600 shrink-0" />
        <p className="text-sm font-bold text-ink leading-tight">{profile.label}</p>
      </div>
    </div>
  );
}

function MobileCard({ profile, index, isInView }: { profile: Profile; index: number; isInView: boolean }) {
  const Icon = profile.icon;
  return (
    <div
      className={cn(
        'relative transition-all duration-500',
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Curve from the spine into this card — drawn first so the card covers its end */}
      <svg
        className="pointer-events-none absolute left-[-30px] top-1/2 -translate-y-1/2"
        width="36"
        height="40"
        viewBox="0 0 36 40"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 4 C4 15 13 20 36 20"
          stroke="#0FB37B"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(15,179,123,.4))',
            strokeDasharray: 120,
            strokeDashoffset: isInView ? 0 : 120,
            transition: `stroke-dashoffset 0.9s ease ${0.3 + index * 0.15}s`,
          }}
        />
      </svg>
      <div className="relative flex h-[88px] items-stretch overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-elev-2">
        <div className="relative w-[104px] shrink-0 bg-gradient-to-br from-navy-100 to-navy-50">
          <Avatar variant={profile.variant} className="h-full w-full" />
          <Photo
            src={profile.photo}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
          <Icon size={14} className="text-brand-600 shrink-0" />
          <p className="text-sm font-bold text-ink leading-tight">{profile.label}</p>
        </div>
      </div>
    </div>
  );
}

export function FindPeople() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="cv-auto relative overflow-hidden surface-light surface-light--mint seam-hairline py-[56px] lg:py-24 on-light">
      <Container className="relative z-10">
        {/* Centred header — the network radiates from the middle */}
        <div className="mx-auto max-w-[720px] text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-[20px] font-bold text-navy-500">{FIND_PEOPLE.eyebrow}</span>
            <span className="t-eyebrow text-light-muted">
              {FIND_PEOPLE.eyebrowLabel}
            </span>
          </div>
          <h2 className="t-section text-ink mb-6">
            <span className="block">{FIND_PEOPLE.headline1}</span>
            <span className="block">{FIND_PEOPLE.headline2}</span>
          </h2>
          <p className="lead text-light-muted mx-auto mb-5">{FIND_PEOPLE.lead}</p>
          <p className="text-sm text-light-muted mb-6">{FIND_PEOPLE.pilotNote}</p>
          <p className="mx-auto max-w-[560px] text-sm text-light-muted leading-relaxed">
            <strong>Interests</strong> help us discover a fit. <strong>Screening</strong> checks whether the problem applies.
          </p>
        </div>

        {/* The network, centred under the headline */}
        <div className="mt-12 lg:mt-16" ref={ref}>
          {/* md+ : radial network on a fixed 640×480 stage — lines behind the cards */}
          <div className="relative mx-auto hidden h-[480px] w-[640px] md:block">
            <div role="img" aria-label={ARIA_LABEL} className="absolute inset-0">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 640 480"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {DESKTOP_PATHS.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="#0FB37B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 0 4px rgba(15,179,123,.4))',
                      strokeDasharray: 300,
                      strokeDashoffset: isInView ? 0 : 300,
                      transition: `stroke-dashoffset 1.2s ease ${0.3 + i * 0.15}s`,
                    }}
                  />
                ))}
              </svg>

              <AudienceNode className="absolute" style={{ left: 235, top: 145, width: 170 }} />

              {PROFILES.map((profile, i) => (
                <DesktopCard key={profile.label} profile={profile} index={i} isInView={isInView} />
              ))}
            </div>

            {/* Caption sits outside the role="img" group so screen readers keep it */}
            <p className="absolute bottom-0 right-0 text-[12px] text-light-muted">
              {FIND_PEOPLE.profilesLabel}
            </p>
          </div>

          {/* Below md : stacked timeline — a spine with curved connectors into each card */}
          <div className="md:hidden">
            <AudienceNode />
            <div
              className="relative mt-8 pl-[30px]"
              role="img"
              aria-label={ARIA_LABEL}
            >
              {/* Spine — runs from the node down to the last card's centre */}
              <span
                aria-hidden="true"
                className="absolute bottom-[44px] left-[3px] top-[-32px] w-[2px] rounded bg-gradient-to-b from-brand-600/70 via-brand-500/50 to-brand-500/30"
              />
              <div className="space-y-4">
                {PROFILES.map((profile, i) => (
                  <MobileCard key={profile.label} profile={profile} index={i} isInView={isInView} />
                ))}
              </div>
            </div>
            <p className="mt-3 text-right text-[12px] text-light-muted">
              {FIND_PEOPLE.profilesLabel}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
