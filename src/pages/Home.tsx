import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { SignalMark } from '@/components/ui/SignalMark';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Faq } from '@/components/site/Faq';
import { SAMPLE, TESTER_FAQ } from '@/content/pilot';
import { Reveal, Stagger } from '@/components/motion/Reveal';

const steps = [
  { number: '01', title: 'Tell us what you’re testing', body: 'Share your idea, who it’s for and what you need to find out.' },
  { number: '02', title: 'We find the right people', body: 'We invite testers who fit your audience. They see the task and terms first, and they choose whether to take part.' },
  { number: '03', title: 'You get a clear report', body: 'See what people did, where they got stuck and what it means for your next move.' },
];

export default function Home() {
  usePageMeta({ title: 'RAPID | Test your startup idea with real people in Nigeria', description: 'Find out if people will use your idea before you build it. RAPID recruits relevant testers in Nigeria and turns their feedback into clear next steps.' });
  return (
    <PageShell>
      <section className="home-hero">
        <div className="home-hero-grid" aria-hidden="true" />
        <Container className="home-hero-layout">
          <div className="home-hero-copy">
            <p className="studio-eyebrow"><span className="studio-dot" /> REAL FEEDBACK · NIGERIA</p>
            <h1>Will people actually <br /><span>use your idea?</span></h1>
            <p className="home-hero-intro">Find out before you build. RAPID puts your idea in front of real people in Nigeria, then shows you what they did, where they got stuck and what to fix next.</p>
            <div className="hero-actions"><ButtonLink to="/contact" size="lg" showArrow>Test my idea</ButtonLink><ButtonLink to="/join" size="lg" variant="outline">Become a tester</ButtonLink></div>
            <div className="hero-bottom"><span>REAL PEOPLE</span><SignalMark className="hero-bottom-mark" /><span>HONEST FEEDBACK</span><SignalMark className="hero-bottom-mark" /><span>CLEAR NEXT STEPS</span></div>
          </div>
          <div className="hero-composition">
            <div className="hero-photo-wrap"><Photo name="session" sizes="(min-width: 1024px) 480px, 90vw" alt="Two people sharing ideas over a laptop" width={900} height={1125} priority className="hero-photo" /><span className="hero-photo-credit">Illustrative photograph</span></div>
            <div className="hero-stamp" aria-hidden="true"><span>MADE FOR</span><strong>real<br />people<span>.</span></strong><ArrowUpRight size={25} /></div>
            <div className="hero-note"><span>THE REAL QUESTION</span><p>“Would you use this, or would you just say you would?”</p><div><span className="hero-note-dot" /> THAT’S WHAT WE FIND OUT</div></div>
            <SignalMark className="hero-scribble" />
          </div>
        </Container>
        <div className="hero-edge"><Container><span>STOP GUESSING. START KNOWING.</span><ArrowDown size={17} aria-hidden="true" /></Container></div>
      </section>

      <section className="intro-section"><Container><Reveal className="intro-layout"><div><p className="studio-eyebrow"><span className="studio-dot" /> WHY RAPID</p><h2 id="value-heading">Friends say it’s great.<br /><span>Customers tell the truth.</span></h2></div><div className="intro-copy"><p>Your friends and family will cheer you on. People who actually need the product will tell you what’s wrong with it.</p><p>RAPID finds the right people in Nigeria, asks them to try your idea and gives you a clear report on what to keep, what to change and what to drop.</p><Link to="/how-it-works" className="text-arrow">See how it works <ArrowUpRight size={18} /></Link></div></Reveal></Container></section>

      <section className="pathways"><Container><div className="section-top"><div><p className="studio-eyebrow"><span className="studio-dot" /> TWO WAYS IN</p><h2>Which side are <span>you on?</span></h2></div><p>Building something, or want a say in what gets built? Start here.</p></div><Stagger className="pathway-grid">
        <Link to="/founders" className="pathway-card pathway-founder"><div className="pathway-top"><span>01 / FOR FOUNDERS</span><span className="pathway-arrow"><ArrowUpRight size={22} /></span></div><h3>Hear from real users<br />before you build more<span>.</span></h3><p>Get your idea in front of the right people. Find out what works, what confuses them and what to fix first.</p><span className="pathway-cta">See how it works for founders <ArrowRight size={17} /></span><div className="pathway-image"><Photo name="founder-card" sizes="(min-width: 768px) 300px, 45vw" alt="Person thinking beside a laptop" width={900} height={675} /><small>Illustrative</small></div></Link>
        <Link to="/join" className="pathway-card pathway-tester"><div className="pathway-top"><span>02 / FOR TESTERS</span><span className="pathway-arrow"><ArrowUpRight size={22} /></span></div><h3>Try it early.<br />Say what you think<span>.</span></h3><p>Test new products before they launch, give honest feedback and help shape what gets built. Some tasks come with a reward.</p><span className="pathway-cta">See how it works for testers <ArrowRight size={17} /></span><div className="pathway-image"><Photo name="tester-card" sizes="(min-width: 768px) 300px, 45vw" alt="Person writing notes while using a phone" width={900} height={675} /><small>Illustrative</small></div></Link>
      </Stagger></Container></section>

      <section id="how-it-works" className="method-section" aria-labelledby="loop-heading"><Container><div className="method-heading"><div><p className="studio-eyebrow"><span className="studio-dot" /> HOW IT WORKS</p><h2 id="loop-heading">Three steps.<br /><span>One clear answer.</span></h2></div><Link to="/how-it-works" className="text-arrow">The full process <ArrowUpRight size={18} /></Link></div><Stagger className="method-steps">{steps.map(step => <article key={step.number}><span className="method-number">{step.number}</span><h3>{step.title}</h3><p>{step.body}</p><ArrowDown className="method-icon" size={20} aria-hidden="true" /></article>)}</Stagger><div className="sample-finding"><div><p className="studio-eyebrow"><span className="studio-dot" /> SAMPLE FINDING</p><p className="sample-finding-count">{SAMPLE.finding.statement}</p><p className="sample-finding-note">Illustrative example · not live data.</p></div><blockquote className="sample-finding-quote"><p>“{SAMPLE.finding.quote}”</p><cite>{SAMPLE.finding.quoteBy}</cite></blockquote></div></Container></section>

      <section className="belief-section"><Container className="belief-layout"><div className="belief-symbol" aria-hidden="true"><SignalMark /><span>THE RAPID<br />PROMISE</span></div><div><p className="studio-eyebrow">HOW WE TREAT PEOPLE</p><h2 id="honesty-heading">Testers are people,<br />not numbers<span>.</span></h2><p>Taking part is always voluntary. The terms are clear before anyone says yes. And founders never see a tester’s name or contact details.</p><Link to="/about" className="text-arrow">What we stand for <ArrowUpRight size={18}/></Link></div></Container></section>
      <section className="faq-section" aria-labelledby="faq-heading">
        <Container className="faq-layout">
          <h2 id="faq-heading">Questions about testing?</h2>
          <Faq id="home" items={TESTER_FAQ} />
        </Container>
      </section>
      <section className="end-section"><Container><div className="end-inner"><p className="studio-eyebrow"><span className="studio-dot" /> READY WHEN YOU ARE</p><h2 id="final-cta-heading">Got an idea?<br /><span>Let’s test it.</span></h2><p>Building something? Tell us about it. Want to test products? Tell us about you. Either way, it takes a few minutes to start.</p><div className="hero-actions"><ButtonLink to="/contact" size="lg" showArrow>Test my idea</ButtonLink><ButtonLink to="/join" size="lg" variant="outline">Become a tester</ButtonLink></div><SignalMark className="end-star" /></div></Container></section>
    </PageShell>
  );
}
