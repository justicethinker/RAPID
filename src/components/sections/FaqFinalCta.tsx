import * as Accordion from '@radix-ui/react-accordion';

import { Container } from '@/components/layout/Container';
import { GradientText } from '@/components/ui/GradientText';
import { Button } from '@/components/ui/Button';
import { FAQ_SECTION, FINAL_CTA } from '@/content/copy';
import { FAQ_ITEMS } from '@/content/faq';


interface FaqFinalCtaProps {
  onJoinWaitlist: () => void;
}

export function FaqFinalCta({ onJoinWaitlist }: FaqFinalCtaProps) {
  return (
    <>
      {/* FAQ section - light */}
      <section className="cv-auto relative overflow-hidden surface-light seam-hairline py-[56px] lg:py-24 on-light">
        <Container className="relative z-10">
          <div className="mx-auto max-w-[760px]">
            {/* Centred header */}
            <div className="text-center">
              <h2 className="t-section text-ink mb-5">
                <span className="block">{FAQ_SECTION.headline1}</span>
                <span className="block">
                  <GradientText dark={false}>{FAQ_SECTION.headlineGradient}</GradientText>
                </span>
              </h2>
              <p className="lead text-light-muted mx-auto mb-8">{FAQ_SECTION.lead}</p>
              <div className="h-[2px] w-8 bg-brand-500 rounded-full mx-auto" />
            </div>

            <Accordion.Root type="single" collapsible defaultValue="item-0" className="mt-10 space-y-4">
                {FAQ_ITEMS.map((item, i) => (
                  <Accordion.Item
                    key={item.question}
                    value={`item-${i}`}
                    className="rounded-2xl border border-sand-200 bg-white shadow-elev-1 overflow-hidden data-[state=open]:bg-sand-50 data-[state=open]:border-brand-600"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="flex w-full items-center gap-3 px-6 py-6 text-left group">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-navy-200 group-data-[state=open]:border-0 group-data-[state=open]:bg-brand-500 shrink-0 transition-all">
                          <span className="text-sm font-bold text-light-muted group-data-[state=open]:text-ink">
                            <span className="group-data-[state=open]:hidden">+</span>
                            <span className="hidden group-data-[state=open]:inline">−</span>
                          </span>
                        </span>
                        <p className="text-[17px] font-bold text-ink flex-1">{item.question}</p>
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="overflow-hidden data-[state=open]:animate-[accordionOpen_0.3s_ease] data-[state=closed]:animate-[accordionClose_0.3s_ease]">
                      <div className="px-6 pb-6 pl-[68px]">
                        <p className="text-[17px] text-light-muted leading-relaxed">{item.answer}</p>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
            </Accordion.Root>
          </div>
        </Container>
      </section>

      {/* Final CTA - dark */}
      <section id="final-cta" className="relative overflow-hidden surface-dark seam-hairline py-[56px] lg:py-24">
        {/* Emerald glow */}
        <div
          className="orb"
          style={{
            width: 500,
            height: 500,
            top: '50%',
            right: -100,
            transform: 'translateY(-50%)',
            background: 'radial-gradient(ellipse, rgba(21,230,160,.09), transparent 65%)',
          }}
        />

        {/* Glass circles */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 520,
            height: 520,
            top: -100,
            right: -100,
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,.12)',
            background: 'radial-gradient(circle, rgba(255,255,255,.04), transparent 70%)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 340,
            height: 340,
            bottom: -80,
            left: 100,
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,.1)',
            background: 'radial-gradient(circle, rgba(255,255,255,.03), transparent 70%)',
          }}
        />

        <Container className="relative z-10">
          <div className="mx-auto max-w-[820px] text-center">
            <h2 className="t-statement text-dark-text mb-5">
              <span className="block">{FINAL_CTA.headline1}</span>
              <span className="block">
                <GradientText>{FINAL_CTA.headline2}</GradientText>
              </span>
            </h2>
            <p className="lead mx-auto mb-8">{FINAL_CTA.lead}</p>
            <div className="flex justify-center">
              <Button variant="primary" showArrow onClick={onJoinWaitlist}>
                {FINAL_CTA.cta}
              </Button>
            </div>
            <p className="text-sm text-dark-muted mt-4">{FINAL_CTA.finePrint}</p>
          </div>
        </Container>
      </section>
    </>
  );
}
