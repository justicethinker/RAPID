import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppRoutes } from './routes';
import { initAnalytics, trackPageview } from '@/lib/analytics';

function RouteEffects() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const frame = window.requestAnimationFrame(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
      });
      return () => window.cancelAnimationFrame(frame);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  return null;
}

export default function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <>
      <RouteEffects />
      <AppRoutes />
    </>
  );
}
