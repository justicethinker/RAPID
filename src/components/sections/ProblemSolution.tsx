import { ArrowRight, UserPlus, CalendarDays, MessageSquare } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { GradientText } from '@/components/ui/GradientText';
import { IconCircle } from '@/components/ui/IconCircle';
import { Badge } from '@/components/ui/Badge';
import { PROBLEM_SOLUTION } from '@/content/copy';
import { useInView } from '@/hooks/useInView';

export function ProblemSolution() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="relative overflow-hidden surface-light seam-hairline py-[56px] lg:py-24 on-light">
      {/* Neutral warm wash, kept off the accent */}
      <div
        className="absolute top-1/4 right-[-100px] w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(214,201,182,.5), transparent 68%)',
        }}
      />

      <Container className="relative z-10">
        {/* Headline */}
        <h2 className="t-section text-center text-ink mb-16">
          <span className="block">{PROBLEM_SOLUTION.headline1}</span>
          <span className="block">
            {PROBLEM_SOLUTION.headline2}{' '}
            <GradientText dark={false}>{PROBLEM_SOLUTION.headlineGradient}</GradientText>
          </span>
        </h2>

        {/* Problem — the claim beside the still life */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <h3 className="text-[30px] font-extrabold tracking-[-.02em] text-ink mb-4">{PROBLEM_SOLUTION.problemTitle}</h3>
            <p className="text-lg text-light-muted leading-relaxed">{PROBLEM_SOLUTION.problemText}</p>
          </div>

          {/* Still life illustration */}
          <div className="relative h-[330px]" aria-hidden="true">
              {/* Soft warm glow so the composition floats off the paper */}
              <div
                className="pointer-events-none absolute left-[-60px] top-[-30px] h-[400px] w-[440px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(214,201,182,.42), transparent 70%)' }}
              />
              {/* Paper */}
              <div className="absolute left-0 top-4 w-[270px] bg-white rounded-md shadow-lg border border-gray-100 p-5 rotate-[-6deg]">
                <p className="text-sm font-bold text-ink mb-3">Product feedback</p>
                <p className="text-xs text-light-muted mb-2">1. What do you think about this idea?</p>
                {['Very interested', 'Somewhat interested', 'Not for me'].map((opt) => (
                  <div key={opt} className="flex items-center gap-2 mb-1.5">
                    <span className="h-3 w-3 rounded border border-gray-300" />
                    <span className="text-[11px] text-light-muted">{opt}</span>
                  </div>
                ))}
                <p className="text-xs text-light-muted mt-3 mb-2">2. Any additional thoughts?</p>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-[1px] bg-gray-200 mb-2" />
                ))}
              </div>

              {/* Chat bubbles */}
              <div className="absolute right-4 top-8">
                <div className="bg-gray-100 rounded-2xl px-3 py-2 mb-3 max-w-[140px]">
                  <p className="text-xs text-ink">Interesting idea</p>
                  <p className="text-[10px] text-gray-400 mt-1">10:24 AM</p>
                </div>
                <div className="bg-gray-100 rounded-2xl px-3 py-2 ml-6 max-w-[120px]">
                  <p className="text-xs text-ink">Sounds useful</p>
                  <p className="text-[10px] text-gray-400 mt-1">11:03 AM</p>
                </div>
              </div>

              {/* Sticky note */}
              <div
                className="absolute bottom-4 right-8 w-[150px] h-[140px] bg-[#FFE566] rounded-sm shadow-md p-3 rotate-[3deg]"
              >
                <p className="font-hand text-[30px] text-ink leading-tight">What happens next?</p>
              </div>

              {/* Pen */}
              <div className="absolute left-[-8px] top-16 w-1 h-16 bg-ink rotate-[35deg] rounded-full opacity-60" />
            </div>
          </div>

        {/* The problem points down to the clearer way */}
        <div className="flex justify-center my-8 lg:my-12">
          <div className="h-16 w-16 rounded-full bg-sand-100 flex items-center justify-center">
            <ArrowRight size={28} className="text-brand-700 rotate-90" />
          </div>
        </div>

        {/* Solution — one centred stack */}
        <div className="mx-auto max-w-[720px] text-center">
          <h3 className="text-[30px] font-extrabold tracking-[-.02em] text-ink mb-4">{PROBLEM_SOLUTION.solutionTitle}</h3>
          <p className="text-lg text-light-muted leading-relaxed mx-auto mb-10">{PROBLEM_SOLUTION.solutionText}</p>

            {/* Action card */}
            <div className="bg-white rounded-[18px] shadow-elev-2 p-6 border border-sand-200 text-left">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[17px] font-bold text-ink">{PROBLEM_SOLUTION.actionsHeader}</h4>
                <Badge variant="gray">{PROBLEM_SOLUTION.actionsLabel}</Badge>
              </div>

              <div className="space-y-0" ref={ref}>
                {PROBLEM_SOLUTION.actions.map((action, i) => {
                  const icons = [UserPlus, CalendarDays, MessageSquare];
                  const Icon = icons[i]!;
                  return (
                    <div
                      key={action.title}
                      className={`flex items-center gap-3 py-4 ${
                        i < PROBLEM_SOLUTION.actions.length - 1 ? 'border-b border-[#EEF2F5]' : ''
                      } transition-all duration-500 ${
                        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                      }`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      <IconCircle size={42} variant="mint">
                        <Icon size={18} />
                      </IconCircle>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-ink">{action.title}</p>
                        <p className="text-xs text-light-muted">{action.sub}</p>
                      </div>
                      <Badge>Action taken</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
        </div>

        {/* Closing line */}
        <p className="text-center text-[24px] md:text-[28px] font-extrabold tracking-[-.02em] text-ink mt-16">
          {PROBLEM_SOLUTION.closingLine1}{' '}
          <GradientText dark={false}>{PROBLEM_SOLUTION.closingLine2}</GradientText>
        </p>
      </Container>
    </section>
  );
}
