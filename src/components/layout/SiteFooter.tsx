import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { SignalMark } from '@/components/ui/SignalMark';
import { Container } from '@/components/layout/Container';
import { supportEmail, supportEmailHref } from '@/lib/site';

export function SiteFooter() {
  return <footer className="site-footer"><Container><div className="footer-grid"><div><Link to="/" aria-label="RAPID home" className="footer-logo"><Logo size={32}/></Link><p className="footer-tagline">Validation that{' '}<br />drives traction.</p><p className="footer-description">RAPID helps founders in Nigeria test ideas with the right people, and gives everyday people a say in what gets built.</p></div><div><h2>EXPLORE</h2><Link to="/how-it-works">How it works</Link><Link to="/about">About RAPID</Link><Link to="/privacy">Privacy</Link></div><div><h2>GET STARTED</h2><Link to="/founders">For founders</Link><Link to="/join">For testers</Link><Link to="/sign-in">Sign in</Link></div><div><h2>GET IN TOUCH</h2><a href={supportEmailHref}>{supportEmail} <ArrowUpRight size={14}/></a><Link to="/contact">Talk to us <ArrowUpRight size={14}/></Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} RAPID · Nigeria pilot</span><span>MADE FOR REAL LIFE <SignalMark className="footer-mark" /></span></div></Container></footer>;
}
