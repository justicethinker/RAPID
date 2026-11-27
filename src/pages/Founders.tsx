import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { SignalMark } from '@/components/ui/SignalMark';
import { Faq } from '@/components/site/Faq';
import { FOUNDER_FAQ, SAMPLE } from '@/content/pilot';
import { usePageMeta } from '@/hooks/usePageMeta';

const FOUNDER_STORIES = [
  {
    initials: 'CG',
    name: 'Caleb Godson',
    role: 'CEO, Jacmate',
    paragraphs: [
      'I really loved the product, especially the analysis and reporting. One thing is to conduct a survey, but another thing is to analyse the responses.',
      'RAPID made everything easier by analysing and summarising the results, allowing me to understand the findings without having to do all the work myself.',
      'One improvement I would suggest is giving founders the option to provide their own survey questions or allow RAPID to handle everything for them.',
    ],
  },
  {
    initials: 'CE',
    name: 'Chioma Eugene',
    role: 'Founder, Dermalink',
    paragraphs: [
      'I’d definitely pay to use RAPID again. Optimizing time as a founder is necessary.',
      'Conducting physical surveys myself takes time and effort. RAPID helps me save that time so I can focus on other important aspects of my business.',
      'You guys are really efficient. I’m impressed.',
    ],
  },
] as const;

export default function Founders() {
  usePageMeta({ title: 'User research for Nigerian startups | RAPID', description: 'Get your product in front of the right people in Nigeria. RAPID recruits the testers, runs the research and shows you what to fix. Request a call.' });
  return <PageShell>
    <section className="audience-hero founder-hero"><Container className="audience-hero-grid"><div className="audience-hero-copy"><p className="studio-eyebrow"><span className="studio-dot"/> FOR FOUNDERS & TEAMS</p><h1>Know what your customers think<br /><span>before you spend on building.</span></h1><p>RAPID puts your product in front of the right people in Nigeria and shows you what works, what confuses them and what to fix first.</p><div className="hero-actions"><ButtonLink to="/contact" size="lg" showArrow>Test my idea</ButtonLink><Link to="/how-it-works" className="audience-text-link">How it works <ArrowUpRight size={18}/></Link></div><small>No account needed · Scope and cost agreed before recruitment</small></div><div className="audience-hero-image founder-image"><Photo name="staff" sizes="(min-width: 1024px) 550px, 90vw" alt="Colleagues reviewing research notes together" width={900} height={1125} priority/><span className="image-caption">Illustrative photograph</span><div className="image-message"><span>LESS GUESSING</span><strong>More<br />knowing<span>.</span></strong></div></div></Container></section>
    <section className="intro-section"><Container className="intro-layout"><div><p className="studio-eyebrow"><span className="studio-dot"/> WHY TEST FIRST</p><h2>Every wrong assumption<br /><span>costs money.</span></h2></div><div className="intro-copy"><p>Finding out now is cheaper than finding out after launch.</p><p>Whether you have a rough concept or a live product, we plan the right test, recruit people who fit your audience and turn their feedback into clear actions for your team.</p><Link to="/contact" className="text-arrow">Tell us what you’re building <ArrowUpRight size={18}/></Link></div></Container></section>
    <section className="method-section"><Container><div className="method-heading"><div><p className="studio-eyebrow"><span className="studio-dot"/> WHAT YOU GET</p><h2>A question.<br /><span>A test. An answer.</span></h2></div><p className="method-lead">One team, from your first conversation to a decision you can act on.</p></div><div className="method-steps">{[['01','A clear brief','We agree your question, audience, task and terms before anything starts.'],['02','The right testers','Our team invites reviewed testers whose situation and experience fit who you’re building for.'],['03','Findings you can use','Get outcomes, counts and anonymised quotes (where testers agree), with the context you need to trust them.']].map(([n,title,body])=><article key={n}><span className="method-number">{n}</span><h3>{title}</h3><p>{body}</p><ArrowRight className="method-icon" size={20}/></article>)}</div></Container></section>
    <section className="sample-section"><Container><div className="sample-heading"><div><p className="studio-eyebrow"><span className="studio-dot"/> WHAT A TEST LOOKS LIKE</p><h2>One brief.<br /><span>One clear finding.</span></h2></div><p>An illustrative example of what a founder brings and what comes back.</p></div><div className="sample-brief"><div className="sample-input"><span className="sample-label">THE BRIEF</span><h3>{SAMPLE.brief.title}</h3><p>{SAMPLE.brief.question}</p><dl><div><dt>Audience</dt><dd>{SAMPLE.brief.audience}</dd></div><div><dt>Task</dt><dd>{SAMPLE.brief.task}</dd></div></dl></div><div className="sample-output"><span className="sample-label">WHAT CAME BACK</span><p className="sample-output-count">{SAMPLE.finding.statement}</p><blockquote>“{SAMPLE.finding.quote}”<cite>{SAMPLE.finding.quoteBy}</cite></blockquote><span className="sample-note">Illustrative example · not live data</span></div></div><Link to="/contact" className="text-arrow">Start with your question <ArrowUpRight size={18}/></Link></Container></section>
    <section className="voices-section" id="founder-stories" aria-labelledby="founder-stories-heading"><Container><div className="voices-heading"><div><p className="studio-eyebrow"><span className="studio-dot"/> FOUNDER STORIES</p><h2 id="founder-stories-heading">What founders <br /><span>told us.</span></h2></div><p>Two founders on what RAPID made easier.</p></div><div className="voices-grid">{FOUNDER_STORIES.map(story=><figure className="voice" key={story.name}><span className="voice-mark" aria-hidden="true">“</span><blockquote>{story.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</blockquote><figcaption><span className="voice-avatar" aria-hidden="true">{story.initials}</span><span className="voice-person"><cite>{story.name}</cite><span>{story.role}</span></span></figcaption></figure>)}</div></Container></section>
    <section className="faq-section"><Container className="faq-layout"><div><p className="studio-eyebrow"><span className="studio-dot"/> BEFORE WE START</p><h2>Straight answers<span>.</span></h2><p>What founders usually ask first.</p><Link to="/contact" className="text-arrow">Talk to us <ArrowUpRight size={18}/></Link></div><Faq id="founder-page" items={FOUNDER_FAQ}/></Container></section>
    <section className="end-section"><Container><div className="end-inner"><p className="studio-eyebrow"><span className="studio-dot"/> LET’S TALK</p><h2>Bring the question.<br /><span>We’ll plan the test.</span></h2><p>Tell us what you’re building. We’ll message you on WhatsApp to set up a call.</p><ButtonLink to="/contact" size="lg" showArrow>Test my idea</ButtonLink><SignalMark className="end-star" /></div></Container></section>
  </PageShell>;
}
