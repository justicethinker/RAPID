import { Users } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { GradientText } from '@/components/ui/GradientText';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/media/Avatar';
import { Photo } from '@/components/media/Photo';
import { ROLES_VALUE } from '@/content/copy';

interface RolesValueProps {
  onJoinWaitlist: () => void;
}

export function RolesValue({ onJoinWaitlist }: RolesValueProps) {
  return (
    <section id="roles" className="cv-auto relative overflow-hidden surface-light surface-light--mist seam-hairline py-[56px] lg:py-24 on-light">
      <Container className="relative z-10">
        {/* Headline */}
        <h2 className="t-statement text-center text-ink mb-16 max-w-[760px] mx-auto">
          <span className="block">{ROLES_VALUE.headline1}</span>
          <span className="block">
            <GradientText dark={false}>{ROLES_VALUE.headlineGradient}</GradientText>
          </span>
        </h2>

        {/* Two columns */}
        <div className="flex flex-col md:flex-row gap-0 max-w-[960px] mx-auto">
          {/* For founders */}
          <div className="flex-1 md:pr-8 md:border-r md:border-sand-200">
            {/* Photo placeholder */}
            <div className="relative rounded-[20px] overflow-hidden mb-6 aspect-video bg-gradient-to-br from-sand-200 to-sand-50 shadow-photo-float">
              <Avatar variant="A" className="w-full h-full" />
              <Photo src="/images/roles-founders.webp" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute top-3 right-3 rounded-lg bg-navy-950/70 px-2 py-1 text-[9px] text-dark-text font-medium">
                BUILD TEST LEARN REPEAT
              </span>
            </div>
            <h3 className="text-[30px] font-extrabold tracking-[-.02em] text-ink mb-3">{ROLES_VALUE.founderTitle}</h3>
            <p className="text-lg text-light-muted mb-6 leading-relaxed">{ROLES_VALUE.founderText}</p>
            <Button variant="primary" showArrow onClick={onJoinWaitlist}>
              {ROLES_VALUE.founderCta}
            </Button>
          </div>

          {/* For testers */}
          <div className="flex-1 md:pl-8 mt-8 md:mt-0">
            {/* Photo placeholder */}
            <div className="relative rounded-[20px] overflow-hidden mb-6 aspect-video bg-gradient-to-br from-sand-100 to-sand-50 shadow-photo-float">
              <Avatar variant="B" className="w-full h-full" />
              <Photo src="/images/roles-testers.webp" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute top-3 right-3 rounded-lg bg-navy-950/70 px-2 py-1 text-[9px] text-dark-text font-medium">
                BETTER IDEAS BRIGHTER FUTURES
              </span>
            </div>
            <h3 className="text-[30px] font-extrabold tracking-[-.02em] text-ink mb-3">{ROLES_VALUE.testerTitle}</h3>
            <p className="text-lg text-light-muted mb-6 leading-relaxed">{ROLES_VALUE.testerText}</p>
            <Button variant="primary" showArrow onClick={onJoinWaitlist}>
              {ROLES_VALUE.testerCta}
            </Button>
          </div>
        </div>

        {/* Both note */}
        <div className="flex items-center justify-center gap-2 mt-12">
          <Users size={30} className="text-brand-500" />
          <p className="text-[17px] font-bold text-ink">{ROLES_VALUE.bothNote}</p>
        </div>
      </Container>
    </section>
  );
}
