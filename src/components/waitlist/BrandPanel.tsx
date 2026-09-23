import {
  CalendarDays,
  CheckCircle2,
  Heart,
  MessageSquare,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Avatar, type AvatarVariant } from '@/components/media/Avatar';
import { Photo } from '@/components/media/Photo';
import { PhoneFrame } from '@/components/media/PhoneFrame';
import { Connectors } from '@/components/media/Connectors';
import { AfricaDotMap } from '@/components/media/AfricaDotMap';
import { WAITLIST } from '@/content/copy';

interface ChipSpec {
  label: string;
  icon: typeof UserPlus;
  photo: string;
  avatar: AvatarVariant;
  /** Distance from the top of the cluster box. */
  top: number;
}

const CHIP_TOPS = [0, 84, 168] as const;

const CHIPS_LEFT: ChipSpec[] = [
  { label: WAITLIST.brandChipsLeft[0], icon: UserPlus, photo: '/images/profile-1.webp', avatar: 'A', top: CHIP_TOPS[0] },
  { label: WAITLIST.brandChipsLeft[1], icon: MessageSquare, photo: '/images/profile-2.webp', avatar: 'C', top: CHIP_TOPS[1] },
  { label: WAITLIST.brandChipsLeft[2], icon: Heart, photo: '/images/profile-3.webp', avatar: 'G', top: CHIP_TOPS[2] },
];

const CHIPS_RIGHT: ChipSpec[] = [
  { label: WAITLIST.brandChipsRight[0], icon: CalendarDays, photo: '/images/roles-founders.webp', avatar: 'B', top: CHIP_TOPS[0] },
  { label: WAITLIST.brandChipsRight[1], icon: CheckCircle2, photo: '/images/roles-testers.webp', avatar: 'D', top: CHIP_TOPS[1] },
  { label: WAITLIST.brandChipsRight[2], icon: Users, photo: '/images/feedback-avatar.webp', avatar: 'F', top: CHIP_TOPS[2] },
];

// Cluster box is 376 x 246 (xl panel). The SVG uses preserveAspectRatio="none",
// so at the narrower md panel it compresses horizontally and the line ends
// still land beside the chips (dots read as floating nodes either way).
const CONNECTOR_PATHS = [
  { d: 'M120 58 C 106 55, 96 42, 86 34', delay: 0.1 },
  { d: 'M120 120 C 108 120, 96 118, 86 117', delay: 0.3 },
  { d: 'M120 182 C 106 185, 96 197, 86 200', delay: 0.5 },
  { d: 'M256 58 C 270 55, 280 42, 290 34', delay: 0.2 },
  { d: 'M256 120 C 268 120, 280 118, 290 117', delay: 0.4 },
  { d: 'M256 182 C 270 185, 280 197, 290 200', delay: 0.6 },
];

function Chip({ spec, side }: { spec: ChipSpec; side: 'left' | 'right' }) {
  const Icon = spec.icon;
  return (
    <div
      className={`absolute w-[84px] overflow-hidden rounded-[12px] bg-white shadow-card-float ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
      style={{ top: spec.top }}
    >
      {/* Portrait — Avatar illustration shows until the photo exists */}
      <div className="relative h-[40px] bg-gradient-to-br from-navy-100 to-navy-50">
        <Avatar variant={spec.avatar} className="absolute inset-0 h-full w-full" />
        <Photo
          src={spec.photo}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </div>
      <div className="flex h-[25px] items-start gap-1 overflow-hidden px-1.5 pt-[3px]">
        <Icon size={9} className="mt-[1px] shrink-0 text-brand-700" />
        <span className="text-[8px] font-bold leading-[1.1] text-ink">{spec.label}</span>
      </div>
    </div>
  );
}

export function BrandPanel() {
  const flowSteps = WAITLIST.brandFlow.split(' → ');

  return (
    <div className="hidden md:flex relative w-[400px] xl:w-[440px] shrink-0 flex-col justify-between overflow-hidden bg-navy-950 p-8">
      {/* Emerald wash centred on the phone + a glow pool behind its base */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 56%, rgba(21,230,160,.15), transparent 62%)',
        }}
      />
      <div
        className="absolute bottom-[64px] left-1/2 h-[130px] w-[250px] -translate-x-1/2 rounded-full pointer-events-none blur-2xl"
        style={{ background: 'radial-gradient(ellipse, rgba(21,230,160,.30), transparent 70%)' }}
      />

      {/* Brand lockup */}
      <div className="relative z-10">
        <Logo size={32} tagline className="mb-5 text-dark-text" />

        <h2 className="mb-2 text-[32px] font-extrabold leading-[1.12] text-dark-text">
          <span className="block">{WAITLIST.brandHeading1}</span>
          <span className="block text-grad-dark">{WAITLIST.brandHeading2}</span>
        </h2>
        <p className="text-sm text-dark-muted">{WAITLIST.brandLead}</p>
      </div>

      {/* Phone cluster with flanking portrait chips — decorative */}
      <div className="relative z-10 my-4 h-[246px]" aria-hidden="true">
        {/* Dotted Africa / globe map behind the phone */}
        <div className="absolute left-1/2 top-[6px] h-[300px] w-[280px] -translate-x-1/2 opacity-60">
          <AfricaDotMap />
        </div>

        {/* Glowing connectors from the phone to each chip */}
        <Connectors paths={CONNECTOR_PATHS} width={376} height={246} />

        {/* Small phone: founder video + three stacked pill buttons */}
        <div className="absolute left-1/2 top-[26px] -translate-x-1/2">
          <div className="origin-top scale-[0.4]">
            <PhoneFrame className="!w-[340px]">
              <div className="px-4 pt-1 pb-4">
                {/* App header */}
                <div className="mb-2 flex items-center justify-between">
                  <Logo size={14} className="text-ink" />
                  <Search size={14} className="text-ink" />
                </div>

                {/* Founder video */}
                <div
                  className="relative mb-2 overflow-hidden rounded-[14px] bg-navy-800"
                  style={{ aspectRatio: '16/10' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900" />
                  <Photo
                    src="/images/hero-pitch.webp"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#03121E">
                        <path d="M8 5.14v14l11-7-11-7z" />
                      </svg>
                    </span>
                  </div>
                  <span className="absolute bottom-2 left-2 rounded-full bg-navy-950/80 px-2 py-0.5 text-[11px] font-medium text-dark-text">
                    0:58
                  </span>
                </div>

                {/* Idea title */}
                <p className="mb-2 text-[15px] font-extrabold leading-snug text-ink">
                  Lunch without the queue
                </p>

                {/* Stacked pill buttons */}
                <div className="space-y-2">
                  <div className="flex h-9 items-center justify-center rounded-full bg-brand-500 text-[13px] font-bold text-ink shadow-accent">
                    {WAITLIST.brandCta}
                  </div>
                  <div className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-navy-200 text-[13px] font-bold text-ink">
                    <CalendarDays size={14} />
                    {WAITLIST.brandCallCta}
                  </div>
                  <div className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-navy-200 text-[13px] font-bold text-ink">
                    <Users size={14} />
                    {WAITLIST.brandCollabCta}
                  </div>
                </div>
              </div>
            </PhoneFrame>
          </div>
        </div>

        {/* Flanking portrait chips */}
        {CHIPS_LEFT.map((spec) => (
          <Chip key={spec.label} spec={spec} side="left" />
        ))}
        {CHIPS_RIGHT.map((spec) => (
          <Chip key={spec.label} spec={spec} side="right" />
        ))}

        {/* Illustrative marker */}
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] tracking-[.14em] text-dark-muted/70">
          {WAITLIST.brandIllustrative}
        </span>
      </div>

      {/* Bottom flow: IDEA → ACTION → VALIDATION → TRACTION */}
      <div className="relative z-10 flex items-center justify-between text-[10px] tracking-[.14em] text-dark-muted/70">
        {flowSteps.map((step, i) => (
          <span key={step} className="contents">
            {i > 0 && <span className="text-dark-muted">→</span>}
            <span>{step}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
