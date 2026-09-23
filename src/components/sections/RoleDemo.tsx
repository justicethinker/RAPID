import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Rocket, CalendarDays, Users, Lightbulb, ArrowRight, MessageSquare, X, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { GradientText } from '@/components/ui/GradientText';
import { IconCircle } from '@/components/ui/IconCircle';
import { Chip } from '@/components/ui/Chip';
import { Logo } from '@/components/ui/Logo';
import { VideoTile } from '@/components/media/VideoTile';
import { ROLE_DEMO, PROBLEM_SOLUTION } from '@/content/copy';
import { cn } from '@/lib/cn';

export function RoleDemo() {
  const [role, setRole] = useState('tester');

  return (
    <section className="relative overflow-hidden surface-dark surface-dark--bleed-top seam-hairline py-[56px] lg:py-24">
      <Container className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Logo size={28} />
          <span className="text-xs text-dark-muted">Interactive demo · Sample data</span>
        </div>

        {/* Headline */}
        <div className="text-center mb-10">
          <h2 className="t-section text-dark-text mb-4">
            <span className="block">{ROLE_DEMO.headline1}</span>
            <span className="block">
              <GradientText>{ROLE_DEMO.headline2}</GradientText>
            </span>
          </h2>
          <p className="lead mx-auto">{ROLE_DEMO.lead}</p>
        </div>        {/* Role switch */}
        <Tabs.Root value={role} onValueChange={setRole} className="flex w-full flex-col items-center gap-8">
          <Tabs.List
            className="flex rounded-full glass-dark p-1.5 gap-1"
            aria-label="Choose role"
          >
            {[
              { value: 'tester', label: ROLE_DEMO.testerTab, hint: ROLE_DEMO.testerHint, icon: Users },
              { value: 'founder', label: ROLE_DEMO.founderTab, hint: ROLE_DEMO.founderHint, icon: Rocket },
            ].map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  'flex items-center gap-2.5 h-14 px-4 sm:px-6 rounded-full text-left transition-all duration-200',
                  role === tab.value
                    ? 'bg-brand-btn text-ink shadow-glow-btn'
                    : 'text-dark-text hover:text-brand-500'
                )}
              >
                <tab.icon size={20} className="shrink-0" />
                <span className="leading-tight">
                  <span className="block text-base font-bold">{tab.label}</span>
                  <span
                    className={cn(
                      'hidden sm:block text-xs font-medium',
                      role === tab.value ? 'text-ink/70' : 'text-dark-muted'
                    )}
                  >
                    {tab.hint}
                  </span>
                </span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Content panels */}
          <div className="w-full max-w-[980px]">
          <Tabs.Content value="tester" className="outline-none">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Left card */}
              <div className="flex-1 bg-white rounded-[20px] shadow-card-light overflow-hidden max-w-[440px] w-full">
                <VideoTile duration="0:58" image="/images/role-demo.webp" className="w-full" aspectRatio="16/10" showPlayButton={false} />
                <div className="p-5">
                  <h3 className="text-[22px] font-extrabold text-ink mb-1">{ROLE_DEMO.testerIdeaTitle}</h3>
                  <p className="text-sm text-light-muted mb-3">{ROLE_DEMO.testerIdeaSub}</p>
                  <div className="flex items-start gap-2 bg-sand-50 rounded-lg px-3 py-2.5 mb-4">
                    <Lightbulb size={14} className="text-brand-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-brand-700">
                      <strong>Why this fits</strong> {ROLE_DEMO.whyThisFits}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" size="sm" showArrow className="whitespace-nowrap">
                      <Rocket size={16} /> {ROLE_DEMO.tryItCta}
                    </Button>
                    <Button variant="ghost" size="sm" className="whitespace-nowrap">
                      <CalendarDays size={14} /> {ROLE_DEMO.bookCallCta}
                    </Button>
                    <Button variant="ghost" size="sm" className="whitespace-nowrap">
                      <Users size={14} /> {ROLE_DEMO.collaborateCta}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center">
                <ArrowRight size={36} className="text-brand-500" style={{ filter: 'drop-shadow(0 0 8px #15E6A0)' }} />
              </div>

              {/* Right panel */}
              <div className="flex-1 bg-white rounded-[20px] shadow-card-light p-6 max-w-[440px] w-full relative">
                <button type="button" className="absolute top-4 right-4 text-light-muted hover:text-ink" aria-label="Close preview">
                  <X size={18} />
                </button>
                <IconCircle size={56} variant="mint" className="mb-4">
                  <Rocket size={28} className="text-brand-700" />
                </IconCircle>
                <h3 className="text-xl font-bold text-ink mb-2">{ROLE_DEMO.tryTitle}</h3>
                <p className="text-sm text-light-muted mb-4">{ROLE_DEMO.tryDescription}</p>
                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-ink leading-relaxed border border-gray-100">
                  Hi! I'm a student near campus and I'd love early access to this. I usually grab lunch between 11–1pm. Please keep me updated!
                </div>
                <div className="flex gap-3 mb-3">
                  <Button variant="primary" size="sm" showArrow>
                    {ROLE_DEMO.previewRequestCta}
                  </Button>
                  <Button variant="ghost" size="sm">
                    {ROLE_DEMO.closeCta}
                  </Button>
                </div>
                <p className="text-[13px] text-light-muted">{ROLE_DEMO.tryFootnote}</p>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="founder" className="outline-none">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Left card - Pitch */}
              <div className="flex-1 bg-white rounded-[20px] shadow-card-light p-5 max-w-[440px] w-full">
                <h3 className="text-[22px] font-extrabold text-ink mb-2">{ROLE_DEMO.founderIdeaTitle}</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ROLE_DEMO.founderIdeaChips.map((chip) => (
                    <Chip key={chip}>{chip}</Chip>
                  ))}
                </div>
                <p className="text-sm text-light-muted mb-4">{ROLE_DEMO.founderStats}</p>

                {/* Action rows */}
                <div className="space-y-0">
                  {PROBLEM_SOLUTION.actions.map((action, i) => {
                    const icons = [CheckCircle2, CalendarDays, MessageSquare];
                    const Icon = icons[i]!;
                    return (
                      <div
                        key={action.title}
                        className={cn(
                          'flex items-center gap-3 py-3',
                          i < PROBLEM_SOLUTION.actions.length - 1 && 'border-b border-[#EEF2F5]'
                        )}
                      >
                        <IconCircle size={42} variant="mint">
                          <Icon size={18} />
                        </IconCircle>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-ink">{action.title}</p>
                          <p className="text-xs text-light-muted">{action.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center">
                <ArrowRight size={36} className="text-brand-500" style={{ filter: 'drop-shadow(0 0 8px #15E6A0)' }} />
              </div>

              {/* Right panel */}
              <div className="flex-1 bg-white rounded-[20px] shadow-card-light p-6 max-w-[440px] w-full">
                <p className="text-xs font-semibold text-light-muted uppercase tracking-wide mb-2">{ROLE_DEMO.founderReportLabel}</p>
                <div className="bg-sand-50 rounded-xl p-4 mb-4 border border-sand-200">
                  <p className="text-lg font-bold text-ink">Students liked choosing a pickup time. Meal choice needs another test.</p>
                </div>
                <Button variant="primary" size="md" showArrow className="w-full">
                  {ROLE_DEMO.openReportCta}
                </Button>
              </div>
            </div>
          </Tabs.Content>
        </div>
        </Tabs.Root>

        {/* Footer note */}
        <div className="flex items-center justify-center mt-12">
          <div className="h-[1px] w-16 bg-navy-line mr-4" />
          <p className="text-sm text-dark-muted">{ROLE_DEMO.footerNote}</p>
          <div className="h-[1px] w-16 bg-navy-line ml-4" />
        </div>        </Container>
    </section>
  );
}
