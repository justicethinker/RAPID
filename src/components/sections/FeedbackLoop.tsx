import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, Bookmark, MessageSquare, Clock, X } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { GradientText } from '@/components/ui/GradientText';
import { IconCircle } from '@/components/ui/IconCircle';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/media/Avatar';
import { Photo } from '@/components/media/Photo';
import { FEEDBACK_LOOP } from '@/content/copy';

export function FeedbackLoop() {
  const [updateOpen, setUpdateOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden surface-dark seam-hairline py-[56px] lg:py-24">
        {/* Background glow */}
        <div
          className="orb"
          style={{
            width: '62%',
            height: '70%',
            bottom: 0,
            left: 0,
            background: 'radial-gradient(ellipse at 15% 100%, rgba(255,255,255,.05), transparent 65%)',
          }}
        />

        <Container className="relative z-10">
          {/* Centered headline */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xs font-semibold tracking-[.14em] text-brand-500 uppercase">{FEEDBACK_LOOP.eyebrow1}</span>
              <span className="text-xs text-dark-muted tracking-wide">{FEEDBACK_LOOP.eyebrow2}</span>
            </div>
            <h2 className="t-section text-dark-text">
              {FEEDBACK_LOOP.headline}{' '}
              <GradientText>{FEEDBACK_LOOP.headlineGradient}</GradientText>
            </h2>
            <p className="lead mx-auto mt-3">A sample story of the feedback loop we plan to build.</p>
          </div>

          {/* Three cards with arrows */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4 max-w-[1000px] mx-auto mt-12">
            {/* Card 1: You shared */}
            <div className="flex-1 bg-white rounded-[20px] p-5 shadow-elev-3-dark">
              <h3 className="text-xl font-extrabold text-ink mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-100 text-brand-700 text-base font-bold shrink-0">1</span>
                {FEEDBACK_LOOP.step1Title}
              </h3>
              <div className="flex items-start gap-3">
                <div className="relative h-[76px] w-[76px] shrink-0">
                  <Avatar variant="B" className="h-full w-full rounded-full" />
                  <Photo
                    src="/images/feedback-avatar.webp"
                    className="absolute inset-0 h-full w-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="bg-[#EEF3F7] rounded-2xl rounded-tl-sm p-3 text-[15px] font-semibold text-ink">
                    &ldquo;{FEEDBACK_LOOP.step1Quote}&rdquo;
                  </div>
                  <p className="text-xs text-light-muted mt-1.5">{FEEDBACK_LOOP.step1Caption}</p>
                </div>
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="hidden lg:flex items-center justify-center shrink-0">
              <ArrowRight size={30} className="text-brand-500" />
            </div>

            {/* Card 2: The founder improved */}
            <div className="flex-1 bg-white rounded-[20px] p-5 shadow-elev-3-dark">
              <h3 className="text-xl font-extrabold text-ink mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-100 text-brand-700 text-base font-bold shrink-0">2</span>
                {FEEDBACK_LOOP.step2Title}
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-14 w-14 rounded-xl shrink-0 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #E8792B, #F5C518 55%, #3FB37F)' }}
                >
                  <Photo src="/images/grilled-bowl.webp" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-ink">{FEEDBACK_LOOP.step2Product}</p>
                  <p className="text-xs text-light-muted">{FEEDBACK_LOOP.step2Tagline}</p>
                </div>
              </div>
              <p className="text-xs text-light-muted mb-2">{FEEDBACK_LOOP.step2Label}</p>
              <div className="flex gap-2">
                {['12:00', '12:30', '13:00'].map((time) => (
                  <span
                    key={time}
                    className="flex-1 text-center rounded-[10px] py-2 text-sm font-semibold"
                    style={
                      time === '12:30'
                        ? { background: 'linear-gradient(90deg, #15E6A0, #0FB37B)', color: '#03121E' }
                        : { background: '#F3EEE6', color: '#55636E' }
                    }
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="hidden lg:flex items-center justify-center shrink-0">
              <ArrowRight size={30} className="text-brand-500" />
            </div>

            {/* Card 3: You hear back */}
            <div className="flex-1 bg-white rounded-[20px] p-5 shadow-elev-3-dark">
              <h3 className="text-xl font-extrabold text-ink mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-100 text-brand-700 text-base font-bold shrink-0">3</span>
                {FEEDBACK_LOOP.step3Title}
              </h3>
              <div className="bg-[#F3F8FB] rounded-[14px] p-3.5 text-[14px] text-light-muted">
                <p className="text-[15px] font-bold text-ink mb-0.5">{FEEDBACK_LOOP.step3Title2}</p>
                {FEEDBACK_LOOP.step3Text}
              </div>
              {/* ghost + !important: outline variant = white text (for dark bgs),
                  this card is white — white-on-white measured 1.18:1 by axe. */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 !border-brand-500 !text-brand-700"
                onClick={() => setUpdateOpen(true)}
              >
                {FEEDBACK_LOOP.step3Cta}
              </Button>
            </div>
          </div>

          {/* Caption */}
          <p className="text-center text-sm text-dark-muted mt-8">{FEEDBACK_LOOP.caption}</p>

          {/* Planned features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-14 pt-9 border-t border-white/10">
            {FEEDBACK_LOOP.plannedFeatures.map((feature, i) => {
              const icons = [Bookmark, MessageSquare, Clock];
              const Icon = icons[i]!;
              return (
                <div key={feature.title} className="flex gap-3.5">
                  <IconCircle size={52} variant="outline" className="shrink-0">
                    <Icon size={24} />
                  </IconCircle>
                  <div>
                    <span className="inline-block text-xs font-bold text-brand-500 border border-brand-500 rounded-full px-2.5 py-0.5 mb-1.5">
                      Planned
                    </span>
                    <h3 className="text-[17px] font-bold text-dark-text">{feature.title}</h3>
                    <p className="text-sm text-dark-muted leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Update dialog */}
      <Dialog.Root open={updateOpen} onOpenChange={setUpdateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl" style={{ colorScheme: 'light' }}>
            <Dialog.Close asChild>
              <button type="button" className="absolute top-4 right-4 text-light-muted hover:text-ink" aria-label="Close">
                <X size={18} />
              </button>
            </Dialog.Close>
            <h3 className="text-lg font-bold text-ink mb-2">Sample update</h3>
            <p className="text-sm text-light-muted leading-relaxed">
              Pickup times were added to the ordering step after a student asked for them. This is an example of the feedback loop we plan to build.
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
