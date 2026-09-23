import { lazy, useState } from 'react';
import { SkipLink } from '@/components/layout/SkipLink';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StickyCta } from '@/components/layout/StickyCta';
import { Hero } from '@/components/sections/Hero';
import { ProblemSolution } from '@/components/sections/ProblemSolution';
import { CreatePitch } from '@/components/sections/CreatePitch';
import { FindPeople } from '@/components/sections/FindPeople';
import { MatchedFeed } from '@/components/sections/MatchedFeed';
import { RoleDemo } from '@/components/sections/RoleDemo';
import { ActionEvidence } from '@/components/sections/ActionEvidence';
import { FeedbackLoop } from '@/components/sections/FeedbackLoop';
import { RolesValue } from '@/components/sections/RolesValue';
import { FaqFinalCta } from '@/components/sections/FaqFinalCta';
import { useWaitlistDialog } from '@/hooks/useWaitlistDialog';

const WaitlistDialog = lazy(() => import('@/components/waitlist/WaitlistDialog'));
const DemoAppDialog = lazy(() => import('@/components/demo/DemoAppDialog').then(m => ({ default: m.DemoAppDialog })));

export default function Home() {
  const { isOpen, openDialog, closeDialog } = useWaitlistDialog();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <SkipLink />
      <Header onJoinWaitlist={() => openDialog()} />

      <main id="main">
        <Hero onJoinWaitlist={() => openDialog()} />
        <ProblemSolution />
        <CreatePitch onOpenDemo={() => setDemoOpen(true)} />
        <FindPeople />
        <MatchedFeed onOpenDemo={() => setDemoOpen(true)} />
        <RoleDemo />
        <ActionEvidence />
        <FeedbackLoop />
        <RolesValue onJoinWaitlist={() => openDialog()} />
        <FaqFinalCta onJoinWaitlist={() => openDialog()} />
      </main>

      <Footer />
      <StickyCta onJoinWaitlist={() => openDialog()} />

      {isOpen && (
        <WaitlistDialog
          open={isOpen}
          onClose={closeDialog}
        />
      )}

      {demoOpen && (
        <DemoAppDialog
          open={demoOpen}
          onClose={() => setDemoOpen(false)}
        />
      )}
    </>
  );
}
