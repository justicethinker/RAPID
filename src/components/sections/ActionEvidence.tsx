import { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Popover from '@radix-ui/react-popover';
import { UserPlus, FileText, CalendarDays, ShoppingCart, Users, Lightbulb, Hammer, RefreshCw, BarChart3, ChevronDown } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { GradientText } from '@/components/ui/GradientText';
import { IconCircle } from '@/components/ui/IconCircle';
import { BrowserFrame } from '@/components/media/BrowserFrame';
import { Logo } from '@/components/ui/Logo';
import { ACTION_EVIDENCE } from '@/content/copy';
import { cn } from '@/lib/cn';

export function ActionEvidence() {
  const accordionIcons = [UserPlus, FileText, CalendarDays, ShoppingCart];
  const accordionSubs = [undefined, undefined, undefined, 'Where offered'];
  const [nextStep, setNextStep] = useState<string>('iterate');

  return (
    <section className="cv-auto relative overflow-hidden surface-light seam-hairline py-[56px] lg:py-24 on-light">
      {/* Mint blob — on its own layer so it is never repainted frame-by-frame
          while the accordion below animates */}
      <div
        className="absolute top-1/3 right-[-80px] w-[640px] h-[640px] rounded-full pointer-events-none will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(214,201,182,.5), transparent 68%)' }}
      />

      <Container className="relative z-10">
        {/* Editorial header: headline left, lead right */}
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-12 items-end mb-10 lg:mb-14">
          <div className="lg:col-span-7">
            <p className="t-eyebrow mb-4">
              <span className="text-navy-500 font-bold">04</span>{' '}
              <span className="text-light-muted">/ LEARN FROM ACTIONS</span>
            </p>
            <h2 className="t-section text-ink">
              <span className="block">{ACTION_EVIDENCE.headline1}</span>
              <span className="block">
                <GradientText dark={false}>{ACTION_EVIDENCE.headlineGradient}</GradientText>
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pb-1">
            <p className="lead text-light-muted">{ACTION_EVIDENCE.lead}</p>
          </div>
        </div>

        {/* Which actions count — centred detail rows */}
        <div className="mx-auto max-w-[860px]">
          <Accordion.Root type="single" collapsible defaultValue="item-0" className="space-y-4">
              {ACTION_EVIDENCE.accordion.map((item, i) => {
                const Icon = accordionIcons[i]!;
                return (
                  <Accordion.Item
                    key={item.title}
                    value={`item-${i}`}
                    className="rounded-2xl border border-sand-200 bg-white shadow-elev-1 overflow-hidden data-[state=open]:border-brand-600"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="flex w-full items-center gap-3 px-5 py-5 text-left hover:bg-gray-50/50 transition-colors group">
                        <IconCircle size={44} variant={i < 2 ? 'mint' : 'light-blue'}>
                          <Icon size={20} />
                        </IconCircle>
                        <div className="flex-1 min-w-0">
                          <p className="text-[17px] font-bold text-ink">{item.title}</p>
                          {accordionSubs[i] && (
                            <p className="text-xs text-light-muted">{accordionSubs[i]}</p>
                          )}
                        </div>
                        <ChevronDown size={18} className="text-light-muted transition-transform group-data-[state=open]:rotate-180" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="overflow-hidden data-[state=open]:animate-[accordionOpen_0.3s_ease] data-[state=closed]:animate-[accordionClose_0.3s_ease]">
                      <div className="px-5 pb-5 pl-[84px]">
                        <p className="text-[17px] text-light-muted leading-relaxed">{item.text}</p>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                );
              })}
          </Accordion.Root>
        </div>
      </Container>

      {/* Report showcase — breaks out wider than the text column */}
      <div className="relative z-10 mx-auto mt-12 lg:mt-16 w-full max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <BrowserFrame>
              <div className="p-7 min-h-[380px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Logo size={22} />
                  <div className="flex items-center gap-1 text-[10px] text-light-muted">
                    {['Idea', 'Action', 'Validation', 'Traction'].map((step, i, arr) => (
                      <span key={step} className="flex items-center gap-1">
                        <span className={i === arr.length - 1 ? 'font-bold text-ink' : ''}>{step}</span>
                        {i < arr.length - 1 && <span>→</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-[28px] font-bold text-ink mb-5">{ACTION_EVIDENCE.reportTitle}</h3>

                {/* Report rows */}
                <div className="space-y-3 mb-6">
                  {ACTION_EVIDENCE.reportSteps.map((step, i) => {
                    const icons = [Users, FileText, Lightbulb];
                    const Icon = icons[i]!;
                    const variants: Array<'mint' | 'light-blue'> = ['mint', 'mint', 'light-blue'];
                    return (
                      <div key={step.title} className="flex items-center gap-3 rounded-[14px] bg-[#F3F8FB] p-4">
                        <IconCircle size={46} variant={variants[i]!}>
                          <Icon size={20} />
                        </IconCircle>
                        <div>
                          <p className="text-sm font-bold text-ink">{step.title}</p>
                          <p className="text-sm text-light-muted">{step.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-[#EEF2F5] mb-5" />

                {/* Next step buttons */}
                <div className="flex gap-3">
                  {[
                    { key: 'build', label: ACTION_EVIDENCE.buildLabel, icon: Hammer, text: ACTION_EVIDENCE.buildText, color: 'border-brand-500 text-brand-700' },
                    { key: 'iterate', label: ACTION_EVIDENCE.iterateLabel, icon: RefreshCw, text: ACTION_EVIDENCE.iterateText, color: 'border-[#5BA8D4] text-[#1A6FA0]' },
                    { key: 'pivot', label: ACTION_EVIDENCE.pivotLabel, icon: BarChart3, text: ACTION_EVIDENCE.pivotText, color: 'border-navy-line text-navy-700' },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isActive = nextStep === opt.key;
                    return (
                      <Popover.Root key={opt.key}>
                        <Popover.Trigger asChild>
                          <button
                            type="button"
                            onClick={() => setNextStep(opt.key)}
                            className={cn(
                              'flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 text-xs font-bold transition-all',
                              isActive ? opt.color + ' bg-opacity-5' : 'border-gray-200 text-light-muted hover:border-gray-300'
                            )}
                          >
                            <Icon size={14} />
                            {opt.label}
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content
                            className="z-50 max-w-[280px] rounded-xl bg-white p-4 shadow-elev-3 border border-sand-200 text-sm text-light-muted leading-relaxed"
                            sideOffset={8}
                          >
                            {opt.text}
                            <Popover.Arrow className="fill-white" />
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    );
                  })}
                </div>

                {/* Footnote */}
                <p className="text-[13px] text-light-muted mt-5">{ACTION_EVIDENCE.footnote}</p>
              </div>
        </BrowserFrame>
      </div>
    </section>
  );
}
