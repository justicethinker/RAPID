import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { SignalMark } from '@/components/ui/SignalMark';
import { Faq } from '@/components/site/Faq';
import { TESTER_FAQ } from '@/content/pilot';
import { usePageMeta } from '@/hooks/usePageMeta';

const IMPACT_STEPS = [
  ['You shared a blocker', 'You told us: “I need to choose a pickup time.”'],
  ['The founder changed it', 'Pickup times were added to the next version.'],
  ['You saw the update', 'The next test showed what changed.'],
] as const;

export default function Join() {
  usePageMeta({ title: 'Test new products in Nigeria | RAPID', description: 'Join RAPID’s tester pool in Nigeria. Try new ideas, give honest feedback and see the task and any reward before you accept.' });
  return <PageShell>
    <section className="audience-hero tester-hero"><Container className="audience-hero-grid"><div className="audience-hero-copy"><p className="studio-eyebrow"><span className="studio-dot"/> FOR TESTERS</p><h1>Try new ideas.<br /><span>Get heard.</span></h1><p>Test products before they launch, tell founders what you really think and help shape what gets built. Some tasks come with a reward.</p><div className="hero-actions"><ButtonLink to="/sign-up/tester" size="lg" showArrow>Become a tester</ButtonLink><Link to="/sign-in" className="audience-text-link">Already a tester? Sign in <ArrowUpRight size={18}/></Link></div><small>Free to apply · Adults 18+ · Applying does not guarantee a place.</small></div><div className="audience-hero-image tester-image"><Photo name="test-session" sizes="(min-width: 1024px) 550px, 90vw" alt="Two people comparing notes over a laptop" width={2000} height={1125} priority/><span className="image-caption">Illustrative photograph</span><div className="image-message"><span>YOUR HONEST</span><strong>opinion is<br />the job<span>.</span></strong></div></div></Container></section>
    <section className="intro-section"><Container className="intro-layout"><div><p className="studio-eyebrow"><span className="studio-dot"/> NO SPECIAL SKILLS NEEDED</p><h2>You don’t need a title.<br /><span>Just an honest opinion.</span></h2></div><div className="intro-copy"><p>If you’re a student, a graduate or a working person in Nigeria, you know things founders need to hear.</p><p>Apply, tell us about yourself, and we’ll invite you when a test fits. Each time, you decide whether to take part.</p><Link to="/sign-up/tester" className="text-arrow">Create your account <ArrowUpRight size={18}/></Link></div></Container></section>
    <section className="method-section tester-method"><Container><div className="method-heading"><div><p className="studio-eyebrow"><span className="studio-dot"/> ON YOUR TERMS</p><h2>No <span>surprises.</span></h2></div><p className="method-lead">You’ll know the task, the time it takes and the reward before you say yes.</p></div><div className="method-steps">{[['01','See the task first','Every invitation explains what to do and how long it takes before you decide.'],['02','See the reward first','The reward and payment timing are shown before you accept. Invitations depend on the research and your experience.'],['03','Your details stay private','Your contact details stay with RAPID. Founders only see anonymised responses.']].map(([n,title,body])=><article key={n}><span className="method-number">{n}</span><h3>{title}</h3><p>{body}</p><ArrowRight className="method-icon" size={20}/></article>)}</div></Container></section>
    <section className="impact-section"><Container><div className="impact-heading"><div><p className="studio-eyebrow"><span className="studio-dot"/> WHAT YOUR FEEDBACK CHANGES</p><h2>See what your input<br /><span>helped change.</span></h2></div><p>A sample loop from feedback to the next version.</p></div><div className="impact-steps">{IMPACT_STEPS.map(([title,body],index)=><article key={title}><span>0{index+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div><p className="impact-note">Illustrative example · not a live result</p></Container></section>
    <section className="faq-section"><Container className="faq-layout"><div><p className="studio-eyebrow"><span className="studio-dot"/> BEFORE YOU APPLY</p><h2>Questions?<br /><span>Answered.</span></h2><p>Quick, honest answers.</p><Link to="/how-it-works" className="text-arrow">See how it works <ArrowUpRight size={18}/></Link></div><Faq id="tester-page" items={TESTER_FAQ}/></Container></section>
    <section className="end-section"><Container><div className="end-inner"><p className="studio-eyebrow"><span className="studio-dot"/> READY WHEN YOU ARE</p><h2>Your opinion<br /><span>is worth something.</span></h2><p>Create an account to track your application, invitations and reward status in one place.</p><ButtonLink to="/sign-up/tester" size="lg" showArrow>Create a tester account</ButtonLink><SignalMark className="end-star" /></div></Container></section>
  </PageShell>;
}
