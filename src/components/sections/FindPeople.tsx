import { Users, Coffee, UtensilsCrossed } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { FIND_PEOPLE } from '@/content/copy';
import { useInView } from '@/hooks/useInView';
import { Avatar } from '@/components/media/Avatar';
import { Photo } from '@/components/media/Photo';
import { cn } from '@/lib/cn';

export function FindPeople() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="relative overflow-hidden surface-light surface-light--mint seam-hairline py-[56px] lg:py-24 on-light">
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
          <div
            className="relative mx-auto"
            style={{ maxWidth: 560, height: 440 }}
            role="img"
            aria-label="Example profiles connected to the audience 'students near campus'"
          >
              {/* Center node */}
              <div
                className="absolute rounded-2xl border border-sand-300 bg-sand-100 p-4 shadow-[0_20px_44px_-24px_rgba(11,24,38,.32)]"
                style={{ left: '42%', top: 170, width: 170 }}
              >
                <Users size={28} className="text-brand-700 mb-2" />
                <p className="text-[13px] text-light-muted">{FIND_PEOPLE.audienceLabel}</p>
                <p className="text-sm font-bold text-ink">{FIND_PEOPLE.audienceValue}</p>
              </div>

              {/* Profile cards */}
              {[
                { icon: Coffee, label: 'Buys lunch near campus', x: '6%', y: 0, variant: 'B' as const, photo: '/images/profile-1.webp' },
                { icon: Users, label: 'Often waits in a queue', x: 'auto', y: 82, right: 0, variant: 'C' as const, photo: '/images/profile-2.webp' },
                { icon: UtensilsCrossed, label: 'Open to trying pre-orders', x: '26%', y: 'auto', bottom: 0, variant: 'G' as const, photo: '/images/profile-3.webp' },
              ].map((profile, i) => {
                const Icon = profile.icon;
                return (
                  <div
                    key={profile.label}
                    className={cn(
                      'absolute bg-white rounded-2xl shadow-elev-2 overflow-hidden border border-sand-200',
                      'transition-all duration-500',
                      isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    )}
                    style={{
                      left: profile.x,
                      top: profile.y,
                      right: profile.right,
                      bottom: profile.bottom,
                      width: 190,
                      transitionDelay: `${i * 150}ms`,
                    }}
                  >
                    {/* Portrait — Avatar illustration shows until the photo exists */}
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
              })}

              {/* Connectors */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                {[
                  'M 130 150 C 200 150, 250 200, 300 240',
                  'M 430 200 C 400 220, 360 240, 310 250',
                  'M 200 400 C 250 370, 280 340, 290 310',
                ].map((d, i) => (
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

              {/* Caption */}
              <p className="absolute bottom-0 right-0 text-[12px] text-light-muted">
                {FIND_PEOPLE.profilesLabel}
              </p>
            </div>
        </div>
      </Container>
    </section>
  );
}
