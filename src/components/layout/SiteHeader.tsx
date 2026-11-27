import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/layout/Container';

const NAV = [
  { to: '/discover', label: 'Discover' },
  { to: '/founders', label: 'For founders' },
  { to: '/join', label: 'For testers' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About' },
];

export function SiteHeader() {
  return <header className="site-header">
    <Container className="site-header-main">
      <Link to="/" aria-label="RAPID home" className="site-logo"><Logo size={30} /><span className="site-logo-descriptor">PEOPLE-POWERED<br />RESEARCH</span></Link>
      <nav aria-label="Main navigation" className="site-nav">{NAV.map(item => <NavLink key={item.to} to={item.to} className={({isActive}) => isActive ? 'site-nav-link active' : 'site-nav-link'}>{item.label}</NavLink>)}</nav>
      <div className="site-header-actions"><Link to="/sign-in" className="site-signin">Sign in</Link><Link to="/contact" className="site-header-cta">Test my idea <span><ArrowUpRight size={16}/></span></Link></div>
    </Container>
    <div className="site-mobile-nav"><Container><nav aria-label="Mobile navigation">{NAV.map(item => <NavLink key={item.to} to={item.to} className={({isActive}) => isActive ? 'active' : undefined}>{item.label}</NavLink>)}<Link to="/sign-in">Sign in</Link></nav></Container></div>
  </header>;
}
