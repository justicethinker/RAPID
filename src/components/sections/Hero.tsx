import { useRef, useState, useEffect } from 'react';
import { MapPin, Lightbulb, Users, CheckCircle2, BarChart3, UserPlus, CalendarDays, MessageSquare } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { GradientText } from '@/components/ui/GradientText';
import { Chip } from '@/components/ui/Chip';
import { IconCircle } from '@/components/ui/IconCircle';
import { AfricaDotMap } from '@/components/media/AfricaDotMap';
import { VideoTile } from '@/components/media/VideoTile';
import { Avatar } from '@/components/media/Avatar';
import { HERO, STEPS } from '@/content/copy';
import { SAMPLE_FOUNDER } from '@/content/demo-data';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/cn';

interface HeroProps {
  onJoinWaitlist: () => void;
}

export function Hero({ onJoinWaitlist }: HeroProps) {
  const { ref: floatingRef, isInView: floatingVisible } = useInView({ threshold: 0.1 });
  const connectorsRef = useRef<SVGSVGElement>(null);
  const [connectorsVisible, setConnectorsVisible] = useState(false);
  useEffect(() => {
    const el = connectorsRef.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // eslint-disable-next-line react/set-state-in-effect
      setConnectorsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setConnectorsVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="top" className="relative overflow-hidden surface-dark pt-16 pb-4 lg:pt-24">
      {/* One neutral wash and a single faint accent glow */}
      <div
        className="orb"
        style={{
          width: 780,
          height: 780,
          top: -240,
          right: -260,
          background: 'radial-gradient(circle, rgba(255,255,255,.05), transparent 62%)',
        }}
      />
      <div
        className="orb"
        style={{
          width: 620,
          height: 620,
          bottom: -120,
          left: -280,
          background: 'radial-gradient(circle, rgba(21,230,160,.07), transparent 66%)',
        }}
      />

      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-10">
          {/* Text column */}
          <div className="flex-1 lg:max-w-[45%] text-center lg:text-left">
            {/* Pill */}
            <div              className="mb-6 inline-flex items-center gap-2 rounded-full glass-dark px-4 py-[7px] text-sm text-dark-text">
              <MapPin size={16} className="text-brand-500" />
              {HERO.pill}
            </div>

            {/* H1 */}
            <h1 className="t-statement mb-6">
              <span className="block text-dark-text">{HERO.headline1}</span>
              <span className="block">
                <GradientText>{HERO.headline2}</GradientText>
              </span>
            </h1>

            {/* Description (explain) */}
            <p className="text-[19px] md:text-[21px] font-medium text-dark-text max-w-[30ch] mb-3 leading-[1.4]">
              {HERO.description}
            </p>

            {/* Lead */}
            <p className="lead mb-8">{HERO.lead}</p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-4">
              <Button variant="primary" showArrow onClick={onJoinWaitlist}>
                {HERO.primaryCta}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  document.getElementById('explore-ideas')?.scrollIntoView({ behavior: 'smooth' });
                  document.getElementById('explore-ideas')?.focus();
                }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dark-text/30 mr-1">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {HERO.secondaryCta}
              </Button>
            </div>

            {/* Fine print */}
            <p className="text-sm text-dark-muted">{HERO.finePrint}</p>
          </div>

          {/* Visual column */}
          <div className="relative flex-1 lg:max-w-[55%] w-full max-w-[560px] mx-auto">
            {/* Africa dot map background */}
            <AfricaDotMap className="absolute inset-0 w-full h-full opacity-90 lg:right-[-30px] lg:top-[-10px]" />

            {/* Main card */}
            <div
              className="relative z-10 bg-white rounded-[22px] p-3.5 shadow-elev-3-dark elev-overlay mx-auto lg:ml-0 lg:mr-auto"
              style={{ width: 'min(330px, 90%)' }}
            >
              {/* Window dots */}
              <div className="flex gap-1.5 mb-2.5 px-1">
                <span className="h-[9px] w-[9px] rounded-full bg-[#FF5F57]" />
                <span className="h-[9px] w-[9px] rounded-full bg-[#FEBC2E]" />
                <span className="h-[9px] w-[9px] rounded-full bg-brand-500" />
              </div>

              {/* Video tile */}
              <VideoTile
                duration="0:58"
                label="Sample pitch · 0:58"
                image="/images/hero-pitch.webp"
                className="mb-3"
                aspectRatio="16/10"
              />

              {/* Title */}
              <h2 className="text-[19px] font-extrabold text-ink mb-2 px-0.5">
                {SAMPLE_FOUNDER.idea}
              </h2>

              {/* Byline */}
              <div className="flex items-center gap-2 mb-2.5 px-0.5">
                <Avatar variant="A" className="h-7 w-7 rounded-full" />
                <span className="text-sm text-light-muted">By {SAMPLE_FOUNDER.name}</span>
                <Chip variant="mint">Founder</Chip>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-2 px-0.5">
                {['Food & Lifestyle', 'Students', 'Nigeria'].map((tag) => (
                  <span key={tag} className="rounded-full bg-[#EBF0F4] px-2.5 py-0.5 text-[11px] text-light-muted font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-[13px] text-light-muted leading-snug px-0.5">
                {SAMPLE_FOUNDER.description}
              </p>
            </div>

            {/* Floating cards */}
            <div ref={floatingRef} className="hidden lg:block absolute right-[-32px] top-0 bottom-0 w-[250px]">
              {[
                { icon: <UserPlus size={18} />, title: 'Trial signup', sub: 'Someone requested trial access', top: 30, rightExtra: 0 },
                { icon: <CalendarDays size={18} />, title: 'Call requested', sub: 'A tester wants to chat', top: 215, rightExtra: -14 },
                { icon: <MessageSquare size={18} />, title: 'Feedback shared', sub: 'Received specific feedback', top: 400, rightExtra: 0 },
              ].map((card, i) => (
                <div
                  key={card.title}
                  className={cn(
                    'absolute bg-white rounded-2xl p-3 shadow-card-float w-[236px] transition-all duration-500',
                    floatingVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2'
                  )}
                  style={{
                    top: card.top,
                    right: card.rightExtra,
                    transitionDelay: `${i * 120 + 500}ms`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <IconCircle size={40} variant="mint">
                      {card.icon}
                    </IconCircle>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink leading-tight">{card.title}</p>
                      <p className="text-xs text-light-muted leading-snug mt-0.5">{card.sub}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Connector lines */}
              <svg
                ref={connectorsRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible"
                viewBox="0 0 250 560"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {[92, 270, 442].map((y, i) => (
                  <path
                    key={i}
                    d={`M0 ${y} C80 ${y}, 120 ${92 + (y - 92) * 0.3}, 236 ${92 + i * 185}`}
                    fill="none"
                    stroke="#15E6A0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 0 4px rgba(21,230,160,.5))',
                      strokeDasharray: 400,
                      strokeDashoffset: connectorsVisible ? 0 : 400,
                      transition: `stroke-dashoffset 1.2s ease ${0.5 + i * 0.2}s`,
                    }}
                  />
                ))}
              </svg>
            </div>

            {/* Caption */}
            <p className="text-[13px] text-dark-muted mt-4 text-center lg:text-right">
              Illustrative product preview
            </p>
          </div>
        </div>

        {/* 4-step strip */}
        <div className="mt-14 border-t border-white/10 pt-[34px] pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => {
              const icons = [Lightbulb, Users, CheckCircle2, BarChart3];
              const Icon = icons[i]!;
              return (
                <div key={step.title} className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  <IconCircle size={52} variant="outline">
                    <Icon size={24} />
                  </IconCircle>
                  <h3 className="text-base font-bold text-dark-text mt-3 mb-1">{step.title}</h3>
                  <p className="text-sm text-dark-muted max-w-[28ch]">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
