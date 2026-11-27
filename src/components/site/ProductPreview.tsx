import {
  ArrowRight,
  Check,
  ClipboardList,
  Compass,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { SAMPLE } from '@/content/pilot';
import { Photo } from '@/components/ui/Photo';

/**
 * The public product proof. Everything in these mockups is illustrative and
 * labelled as such; none of it is fed by live API data.
 */

export function AfricaMap({ className }: { className?: string }) {
  return (
    <img
      src="/images/africa-dot-map.svg"
      alt=""
      aria-hidden="true"
      width={460}
      height={483}
      loading="eager"
      decoding="async"
      className={cn(
        'pointer-events-none select-none mix-blend-screen',
        className,
      )}
    />
  );
}

function BrowserChrome() {
  return (
    <div className="flex h-[8.2cqw] min-h-[26px] items-center justify-between bg-ink px-[2.8cqw] text-studio-100">
      <span className="flex items-center gap-[2cqw]">
        <span className="flex gap-[1cqw]" aria-hidden="true">
          <i className="block h-[1.3cqw] w-[1.3cqw] rounded-full bg-[#b8615f]" />
          <i className="block h-[1.3cqw] w-[1.3cqw] rounded-full bg-[#b9a05b]" />
          <i className="block h-[1.3cqw] w-[1.3cqw] rounded-full bg-brand-500" />
        </span>
        <span className="text-[1.8cqw] font-extrabold uppercase tracking-[0.08em] text-studio-200">
          RAPID · Founder
        </span>
      </span>
      <span className="rounded-[0.6cqw] bg-studio-25/10 px-[1.5cqw] py-[0.6cqw] text-[1.55cqw] font-bold text-studio-200">
        {SAMPLE.label}
      </span>
    </div>
  );
}

export function BrowserMock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{ containerType: 'inline-size' }}
      className={cn(
        'w-full overflow-hidden rounded-[13px] border border-studio-200/70 bg-studio-25 shadow-[0_28px_60px_-34px_rgba(0,0,0,0.75)]',
        className,
      )}
    >
      <BrowserChrome />
      <div className="flex items-center gap-[3.2cqw] border-b border-studio-200 px-[4.3cqw] pt-[2.6cqw] text-[1.75cqw] font-semibold text-studio-600">
        <span className="relative pb-[1.9cqw] font-extrabold text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-[0.55cqw] after:rounded-full after:bg-brand-700">
          Brief
        </span>
        <span className="pb-[1.9cqw]">Recruits</span>
        <span className="pb-[1.9cqw]">Findings</span>
        <span className="ml-auto pb-[1.9cqw] text-[1.45cqw] font-bold uppercase tracking-[0.11em]">
          Draft
        </span>
      </div>
      <div className="p-[4.3cqw] pt-[3.4cqw] text-ink">
        <p className="text-[1.75cqw] font-extrabold uppercase tracking-[0.15em] text-brand-700">
          {SAMPLE.brief.kicker}
        </p>
        <h3 className="mt-[1.1cqw] text-[5.2cqw] font-extrabold leading-[1.03] tracking-[-0.045em]">
          {SAMPLE.brief.title}
        </h3>
        <p className="mt-[1.3cqw] max-w-[84%] text-[2.25cqw] leading-[1.4] text-light-muted">
          {SAMPLE.brief.question}
        </p>

        <div className="mt-[3.2cqw] grid grid-cols-2 gap-[1.5cqw]">
          <div className="rounded-[1.4cqw] border border-studio-200 bg-studio-50 px-[2.2cqw] py-[2cqw]">
            <span className="block text-[1.5cqw] font-bold uppercase tracking-[0.09em] text-studio-600">
              Audience
            </span>
            <b className="mt-[0.7cqw] block text-[2.1cqw] font-semibold leading-[1.35]">
              {SAMPLE.brief.audience}
            </b>
          </div>
          <div className="rounded-[1.4cqw] border border-studio-200 bg-studio-50 px-[2.2cqw] py-[2cqw]">
            <span className="block text-[1.5cqw] font-bold uppercase tracking-[0.09em] text-studio-600">
              Task
            </span>
            <b className="mt-[0.7cqw] block text-[2.1cqw] font-semibold leading-[1.35]">
              {SAMPLE.brief.task}
            </b>
          </div>
        </div>

        <div className="mt-[3cqw] flex items-center gap-[2.4cqw]">
          <div>
            <b className="block text-[3.7cqw] font-extrabold leading-none tracking-[-0.04em]">
              {SAMPLE.brief.invited}
            </b>
            <span className="mt-[0.7cqw] block text-[1.45cqw] font-bold uppercase tracking-[0.09em] text-studio-600">
              Invited
            </span>
          </div>
          <div>
            <b className="block text-[3.7cqw] font-extrabold leading-none tracking-[-0.04em]">
              {SAMPLE.brief.accepted}
            </b>
            <span className="mt-[0.7cqw] block text-[1.45cqw] font-bold uppercase tracking-[0.09em] text-studio-600">
              Accepted
            </span>
          </div>
          <div className="h-[1cqw] flex-1 overflow-hidden rounded-full bg-studio-200">
            <i className="block h-full w-[22%] rounded-full bg-brand-700" />
          </div>
          <div>
            <b className="block text-[3.7cqw] font-extrabold leading-none tracking-[-0.04em]">
              {SAMPLE.brief.completion}
            </b>
            <span className="mt-[0.7cqw] block text-[1.45cqw] font-bold uppercase tracking-[0.09em] text-studio-600">
              Completed
            </span>
          </div>
        </div>

        <div className="mt-[2.7cqw] flex items-center justify-between border-t border-studio-200 pt-[2.2cqw]">
          <span className="text-[1.55cqw] font-medium text-studio-600">
            {SAMPLE.brief.note}
          </span>
          <span className="inline-flex items-center gap-[0.6cqw] text-[1.65cqw] font-extrabold text-brand-700">
            {SAMPLE.brief.action}
            <ArrowRight size={10} aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function PhoneMock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{ containerType: 'inline-size' }}
      className={cn(
        'relative aspect-[204/420] w-full rounded-[30px] border border-white/10 bg-ink p-[6px] shadow-[0_34px_65px_-30px_rgba(0,0,0,0.9)]',
        className,
      )}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] bg-studio-25 text-ink">
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[1.4cqw] z-20 h-[3.4cqw] w-[14cqw] -translate-x-1/2 rounded-full bg-ink"
        />
        <div className="flex items-center justify-between px-[4.4cqw] pt-[2.3cqw] text-[1.7cqw] font-bold text-light-muted">
          <span>9:41</span>
          <span className="tracking-[0.12em]">▮▮ ◔ ▰</span>
        </div>

        <div className="flex items-center justify-between px-[4.4cqw] pt-[4cqw]">
          <span className="inline-flex items-center gap-[1.1cqw] text-[2.1cqw] font-extrabold tracking-[0.12em]">
            <img
              src="/images/brand/r-mark.webp"
              alt=""
              width={14}
              height={9}
              className="h-[4.2cqw] w-auto"
            />
            RAPID
          </span>
          <span className="flex h-[6.4cqw] w-[6.4cqw] items-center justify-center rounded-full bg-forest-900 text-[1.8cqw] font-extrabold text-studio-25">
            A
          </span>
        </div>

        <div className="flex flex-1 flex-col px-[4.4cqw] pb-[13cqw] pt-[4.2cqw]">
          <p className="flex items-center gap-[1.4cqw] text-[1.7cqw] font-extrabold uppercase tracking-[0.14em] text-brand-700">
            <span className="h-[1.3cqw] w-[1.3cqw] rounded-full bg-brand-500" />
            {SAMPLE.invitation.kicker}
          </p>
          <h3 className="mt-[1.6cqw] text-[9.4cqw] font-extrabold leading-[0.98] tracking-[-0.05em]">
            {SAMPLE.invitation.title}
          </h3>
          <p className="mt-[1.8cqw] text-[2.4cqw] leading-[1.4] text-studio-600">
            {SAMPLE.invitation.body}
          </p>

          <div className="mt-[3.8cqw] rounded-[2.6cqw] border border-studio-200 bg-white p-[3.2cqw] shadow-[0_1px_0_rgba(18,26,30,0.03)]">
            <div className="flex items-center justify-between gap-[2cqw]">
              <span className="inline-flex rounded-[0.8cqw] bg-brand-50 px-[1.4cqw] py-[0.8cqw] text-[1.5cqw] font-extrabold uppercase tracking-[0.07em] text-brand-700">
                {SAMPLE.invitation.tag}
              </span>
              <span className="text-[1.55cqw] font-bold uppercase tracking-[0.08em] text-studio-600">
                {SAMPLE.invitation.duration}
              </span>
            </div>
            <h4 className="mt-[2.2cqw] text-[3.9cqw] font-bold leading-[1.16] tracking-[-0.025em]">
              {SAMPLE.invitation.task}
            </h4>
            <p className="mt-[1.2cqw] text-[2.1cqw] leading-[1.4] text-studio-600">
              {SAMPLE.invitation.taskNote}
            </p>
            <div className="mt-[2.6cqw] flex items-center justify-between gap-[2cqw] border-t border-studio-200 pt-[2.2cqw]">
              <span className="text-[1.9cqw] font-semibold text-light-muted">
                <b className="font-extrabold text-ink">{SAMPLE.invitation.reward}</b> reward
              </span>
              <span className="text-[1.55cqw] font-semibold text-studio-600">On completion</span>
            </div>
          </div>

          <div className="mt-[2.8cqw]">
            <p className="text-[1.5cqw] font-extrabold uppercase tracking-[0.12em] text-studio-600">
              What you will do
            </p>
            <ul className="mt-[2cqw] space-y-[1.8cqw] text-[2.05cqw] leading-[1.3] text-light-muted">
              {SAMPLE.invitation.checklist.map((item) => (
                <li key={item} className="flex gap-[1.6cqw]">
                  <span className="mt-[0.2cqw] flex h-[3cqw] w-[3cqw] shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Check size={8} strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-[3cqw] flex gap-[1.7cqw] rounded-[1.8cqw] bg-brand-50/80 p-[2.2cqw] text-[2cqw] leading-[1.35] text-forest-700">
            <span aria-hidden="true">✦</span>
            <span>
              <b className="text-brand-700">Why this fits</b> {SAMPLE.invitation.fit}
            </span>
          </div>

          <div className="mt-[2.8cqw] flex items-center gap-[2.2cqw]">
            <span className="flex h-[7.4cqw] w-[7.4cqw] shrink-0 items-center justify-center rounded-[1.6cqw] bg-forest-900 text-[1.9cqw] font-extrabold tracking-[0.02em] text-studio-25">
              CK
            </span>
            <div className="min-w-0">
              <p className="text-[1.35cqw] font-extrabold uppercase tracking-[0.12em] text-studio-600">
                {SAMPLE.invitation.productLabel}
              </p>
              <p className="mt-[0.3cqw] text-[2.2cqw] font-bold leading-tight">
                {SAMPLE.invitation.product}
              </p>
            </div>
            <span className="ml-auto text-right text-[1.55cqw] font-semibold leading-[1.3] text-studio-600">
              {SAMPLE.invitation.productType}
              <br />
              {SAMPLE.invitation.productPlace}
            </span>
          </div>

          <p className="mt-[2.6cqw] rounded-[1.8cqw] border border-dashed border-studio-300 p-[2.3cqw] text-[1.7cqw] leading-[1.35] text-studio-600">
            {SAMPLE.invitation.afterAccept}
          </p>

          <div className="mt-auto">
            <div className="flex items-start gap-[1.6cqw] pb-[2.4cqw] text-[1.85cqw] leading-[1.35] text-studio-600">
              <ShieldCheck
                size={9}
                strokeWidth={2.4}
                aria-hidden="true"
                className="mt-[0.4cqw] shrink-0 text-brand-700"
              />
              {SAMPLE.invitation.privacy}
            </div>
            <span className="flex h-[8cqw] items-center justify-center rounded-full bg-brand-500 text-[2.5cqw] font-extrabold text-ink">
              {SAMPLE.invitation.accept}
            </span>
            <span className="mt-[2cqw] block text-center text-[1.75cqw] font-semibold text-studio-600 underline underline-offset-2">
              {SAMPLE.invitation.terms} first
            </span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-studio-200 bg-studio-25 px-[2cqw] pb-[2.8cqw] pt-[2.2cqw] text-[1.45cqw] font-semibold text-studio-600">
          <span className="flex flex-col items-center gap-[0.7cqw] font-extrabold text-brand-700">
            <Compass size={9} strokeWidth={2.4} aria-hidden="true" />
            Discover
          </span>
          <span className="flex flex-col items-center gap-[0.7cqw]">
            <ClipboardList size={9} strokeWidth={2.4} aria-hidden="true" />
            Activity
          </span>
          <span className="flex flex-col items-center gap-[0.7cqw]">
            <UserRound size={9} strokeWidth={2.4} aria-hidden="true" />
            Profile
          </span>
        </div>
      </div>
    </div>
  );
}

export function FindingCard({
  size = 'sm',
  className,
}: {
  size?: 'sm' | 'lg';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[12px] bg-oxblood-600 text-[#FBF5EC] shadow-proof',
        size === 'sm' ? 'p-4' : 'rounded-2xl p-6 sm:p-8',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-brand-500/10 blur-2xl"
      />
      <div className="relative flex items-center justify-between gap-3">
        <span
          className={cn(
            'font-extrabold uppercase tracking-[0.16em] text-[#E9C4C2]',
            size === 'sm' ? 'text-[7px]' : 'text-[10px]',
          )}
        >
          {SAMPLE.finding.label}
        </span>
        <span
          className={cn(
            'font-semibold text-[#FBF5EC]/80',
            size === 'sm' ? 'text-[6px]' : 'text-[10px]',
          )}
        >
          {SAMPLE.label}
        </span>
      </div>
      <p
        className={cn(
          'relative font-bold tracking-[-0.025em]',
          size === 'sm'
            ? 'mt-2.5 max-w-[235px] text-[15px] leading-[1.18]'
            : 'mt-4 max-w-[24ch] text-[24px] leading-[1.12] sm:text-[30px]',
        )}
      >
        {SAMPLE.finding.statement}
      </p>
      <span
        className={cn(
          'relative mt-3 inline-flex items-center gap-1.5 font-extrabold text-brand-500',
          size === 'sm' ? 'text-[8px]' : 'mt-6 text-sm',
        )}
      >
        {SAMPLE.finding.link}
        <ArrowRight size={size === 'sm' ? 9 : 15} aria-hidden="true" />
      </span>
    </div>
  );
}

export function SessionPhoto({ className }: { className?: string }) {
  return (
    <figure
      aria-hidden="true"
      className={cn(
        'group relative aspect-[4/3] overflow-hidden rounded-[10px] border border-white/15 bg-forest-800 shadow-stage',
        className,
      )}
    >
      <Photo
        name="session"
        sizes="(min-width: 1024px) 240px, 45vw"
        alt=""
        width={900}
        height={1125}
        priority
        className="h-full w-full object-cover object-[center_42%] saturate-[.78] contrast-[1.06]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent"
      />
      <figcaption className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-2 text-[7px] font-bold tracking-[0.04em] text-studio-50">
        <span>
          <span className="text-brand-500">Pilot session</span> · example
        </span>
        <span className="rounded-full bg-forest-950/55 px-1.5 py-0.5 text-[6px] font-extrabold uppercase tracking-[0.08em] text-studio-100">
          10 min
        </span>
      </figcaption>
    </figure>
  );
}

function HeroStageDesktop() {
  return (
    <div className="relative hidden aspect-[620/640] overflow-hidden rounded-[24px] border border-white/10 stage-wash shadow-stage lg:block">
      <span aria-hidden="true" className="stage-grid absolute inset-0" />
      <AfricaMap className="absolute right-[1.8%] top-[1.2%] w-[31%] opacity-75" />

      <div className="absolute left-[3.2%] top-[4.6%] w-[62%]">
        <BrowserMock />
      </div>

      <div className="absolute left-[3.9%] top-[51.5%] w-[35.5%]">
        <SessionPhoto />
      </div>

      <div className="absolute bottom-[2.8%] left-[2.9%] w-[42.6%]">
        <FindingCard />
      </div>

      <div className="absolute bottom-[3.2%] right-[2.3%] w-[33%]">
        <PhoneMock />
      </div>
    </div>
  );
}

function HeroStageMobile() {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 stage-wash p-3 pb-4 shadow-stage lg:hidden">
      <span aria-hidden="true" className="stage-grid absolute inset-0" />
      <AfricaMap className="absolute -right-10 -top-10 w-[68%] opacity-50 sm:-right-4 sm:w-[50%]" />

      <div className="relative z-10 mx-auto mt-2 w-[59%] max-w-[235px]">
        <PhoneMock />
      </div>

      <div className="relative z-10 -mt-3 ml-auto w-[79%] max-w-[310px] sm:w-[64%]">
        <FindingCard />
      </div>
    </div>
  );
}

function PhoneStageLayout() {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 stage-wash p-4 shadow-stage sm:p-6 lg:aspect-[460/590]">
      <span aria-hidden="true" className="stage-grid absolute inset-0" />
      <AfricaMap className="absolute -right-10 -top-8 w-[62%] opacity-65 lg:-right-4 lg:-top-4 lg:w-[48%]" />

      <div className="relative z-10 mx-auto w-[64%] max-w-[230px] lg:absolute lg:left-[7%] lg:top-[7.5%] lg:mx-0 lg:w-[43%] lg:max-w-none">
        <PhoneMock />
      </div>

      <div className="relative z-10 mt-4 lg:absolute lg:bottom-[8%] lg:right-[5%] lg:mt-0 lg:w-[52%]">
        <FindingCard />
      </div>
    </div>
  );
}

function BrowserStageLayout() {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 stage-wash p-4 shadow-stage sm:p-6 lg:aspect-[560/540]">
      <span aria-hidden="true" className="stage-grid absolute inset-0" />
      <AfricaMap className="absolute -right-10 top-0 w-[54%] opacity-60 lg:-right-6 lg:-top-2 lg:w-[44%]" />

      <div className="relative z-10 lg:absolute lg:left-[5%] lg:top-[7%] lg:w-[84%]">
        <BrowserMock />
      </div>

      <div className="relative z-10 mt-4 sm:ml-auto sm:w-[64%] lg:absolute lg:bottom-[8%] lg:right-[4%] lg:mt-0 lg:ml-0 lg:w-[52%]">
        <FindingCard />
      </div>
    </div>
  );
}

export function ProductStage({
  variant = 'hero',
  className,
}: {
  variant?: 'hero' | 'phone' | 'browser';
  className?: string;
}) {
  return (
    <figure className={cn('relative min-w-0', className)}>
      {variant === 'hero' ? (
        <>
          <div aria-hidden="true">
            <HeroStageMobile />
          </div>
          <div aria-hidden="true">
            <HeroStageDesktop />
          </div>
        </>
      ) : (
        <div aria-hidden="true">
          {variant === 'phone' ? <PhoneStageLayout /> : <BrowserStageLayout />}
        </div>
      )}
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold tracking-[0.01em] text-studio-600">
        <span>Illustrative example</span>
        <span aria-hidden="true">·</span>
        <span>Not live data</span>
      </figcaption>
    </figure>
  );
}
