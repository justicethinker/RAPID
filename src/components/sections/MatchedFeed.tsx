import { useRef, useState, useEffect, useMemo } from 'react';
import { Search, Heart, Rocket, CalendarDays, Users, Lightbulb } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { GradientText } from '@/components/ui/GradientText';
import { PhoneFrame } from '@/components/media/PhoneFrame';
import { VideoTile } from '@/components/media/VideoTile';
import { Logo } from '@/components/ui/Logo';
import { EXPLORE_IDEAS } from '@/content/copy';
import { DEMO_IDEAS } from '@/content/demo-data';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/cn';

const FILTERS = ['All', 'Food', 'Design', 'Work'] as const;

interface MatchedFeedProps {
  onOpenDemo: () => void;
}

export function MatchedFeed({ onOpenDemo }: MatchedFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredIdeas = useMemo(() => {
    if (activeFilter === 'All') return DEMO_IDEAS;
    return DEMO_IDEAS.filter((idea) => idea.tags.includes(activeFilter));
  }, [activeFilter]);
  const reducedMotion = useReducedMotion();
  const { ref: phoneRef, isInView: phoneVisible } = useInView({ threshold: 0.6, once: true });
  const [hasScrolled, setHasScrolled] = useState(false);

  // One-time preview scroll
  useEffect(() => {
    if (reducedMotion || !phoneVisible || hasScrolled) return;
    const el = scrollRef.current;
    if (!el) return;

    const timer = setTimeout(() => {
      el.scrollBy({ top: 70, behavior: 'smooth' });
      const timer2 = setTimeout(() => {
        el.scrollBy({ top: -70, behavior: 'smooth' });
      }, 1000);
      setHasScrolled(true);
      return () => clearTimeout(timer2);
    }, 300);

    return () => clearTimeout(timer);
  }, [phoneVisible, reducedMotion, hasScrolled]);

  const scrollFeed = (dir: 'prev' | 'next') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardHeight = 300;
    el.scrollBy({ top: dir === 'next' ? cardHeight : -cardHeight, behavior: 'smooth' });
  };

  return (
    <section id="explore-ideas" className="cv-auto relative overflow-hidden surface-dark seam-hairline py-[56px] lg:py-24">
      {/* Background glows */}
      <div
        className="orb"
        style={{
          width: '62%',
          height: '55%',
          bottom: -40,
          left: -60,
          background: 'radial-gradient(ellipse, rgba(255,255,255,.045), transparent 70%)',
        }}
      />
      <div
        className="orb"
        style={{
          width: '40%',
          height: '40%',
          top: -40,
          right: -40,
          background: 'radial-gradient(ellipse, rgba(120,150,180,.08), transparent 70%)',
        }}
      />

      <Container className="relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text column (right on desktop) */}
          <div className="flex-1 lg:max-w-[45%] text-center lg:text-left">
            <p className="t-eyebrow mb-4">
              <span className="text-navy-400 font-bold">03</span>{' '}
              <span className="text-dark-muted">/ EXPLORE MATCHED IDEAS</span>
            </p>
            <h2 className="t-section text-dark-text mb-6">
              <span className="block">{EXPLORE_IDEAS.headline1}</span>
              <span className="block">
                <GradientText>{EXPLORE_IDEAS.headline2}</GradientText>
              </span>
            </h2>
            <p className="lead mb-10">{EXPLORE_IDEAS.lead}</p>
            <Button
              variant="outline"
              onClick={onOpenDemo}
              className="mb-3"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dark-text/30 mr-1">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              {EXPLORE_IDEAS.demoCta}
            </Button>
            <p className="text-sm text-dark-muted">{EXPLORE_IDEAS.demoNote}</p>
          </div>

          {/* Phone column */}
          <div className="flex-1 lg:max-w-[55%] flex items-center justify-center gap-6 py-6 lg:py-10" ref={phoneRef}>
            {/* Previous button */}
            <button
              type="button"
              onClick={() => scrollFeed('prev')}
              className="hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-navy-line text-dark-text hover:bg-navy-800 transition-colors"
              aria-label="Previous idea"
            >
              ↑
            </button>

            <div className="relative">
              <PhoneFrame>
                {/* App header */}
                <div className="flex items-center justify-between px-4 py-2">
                  <div>
                    <Logo size={18} className="text-ink" />
                  </div>
                  <Search size={18} className="text-ink" />
                </div>

                <h2 className="px-4 text-[23px] font-extrabold text-ink mb-2">Matched ideas</h2>

                {/* Filter pills */}
                <div className="flex gap-2 px-4 mb-3">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        activeFilter === filter
                          ? 'bg-brand-500 text-ink'
                          : 'border border-gray-200 text-light-muted'
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Feed */}
                <div
                  ref={scrollRef}
                  className="px-4 space-y-3 overflow-y-auto pb-16 hide-scrollbar"
                  style={{ height: 410, scrollSnapType: 'y proximity', overscrollBehavior: 'auto' }}
                  role="region"
                  aria-label="Sample matched ideas"
                  tabIndex={0}
                >
                  {filteredIdeas.map((idea) => (
                    <article
                      key={idea.id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <VideoTile duration={idea.duration} image={idea.image} className="w-full" aspectRatio="16/11" />
                      <div className="p-3">
                        <h3 className="text-[17px] font-bold text-ink mb-0.5">{idea.title}</h3>
                        <p className="text-[13px] text-light-muted mb-2">{idea.subtitle}</p>
                        <div className="flex items-center gap-1.5 bg-sand-50 rounded-lg px-2.5 py-1.5 mb-3">
                          <Lightbulb size={12.5} className="text-brand-600" />
                          <span className="text-[12px] text-brand-700 font-medium">{idea.whyThisFits}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { icon: Heart, label: 'Interested' },
                            { icon: Rocket, label: 'Try it' },
                            { icon: CalendarDays, label: 'Book a call' },
                            { icon: Users, label: 'Collaborate' },
                          ].map((action) => (
                            <button
                              key={action.label}
                              type="button"
                              className="flex flex-col items-center gap-0.5 rounded-lg border border-gray-200 py-2 text-[10px] text-light-muted hover:border-brand-500 transition-colors"
                            >
                              <action.icon size={14} />
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Bottom tab bar */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around border-t border-gray-100 bg-white py-2 px-4 text-[10px] text-light-muted">
                  <span className="flex flex-col items-center gap-0.5 text-brand-700 font-bold">
                    <Search size={16} />
                    Discover
                    <span className="h-1 w-1 rounded-full bg-brand-500" />
                  </span>
                  <span className="flex flex-col items-center gap-0.5">
                    <CalendarDays size={16} />
                    Activity
                  </span>
                  <span className="flex flex-col items-center gap-0.5">
                    <Users size={16} />
                    Profile
                  </span>
                </div>
              </PhoneFrame>

              {/* Phone reflection */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-[30px] rounded-[50%] bg-black/50 blur-xl" />
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={() => scrollFeed('next')}
              className="hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-navy-line text-dark-text hover:bg-navy-800 transition-colors"
              aria-label="Next idea"
            >
              ↓
            </button>

            {/* Swipe hint */}
            <div className="hidden lg:flex flex-col items-center gap-1 text-[13px] text-dark-muted">
              <span className="text-brand-500">↑</span>
              Swipe to explore more ideas
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
