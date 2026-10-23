import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Join from './pages/Join';
import Founders from './pages/Founders';
import { ThanksPage } from './pages/Thanks';
import NotFound from './pages/NotFound';

const Privacy = lazy(() => import('./pages/Privacy'));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
        <Route path="/founders" element={<Founders />} />
        <Route path="/thanks/tester" element={<ThanksPage kind="tester" />} />
        <Route path="/thanks/founder" element={<ThanksPage kind="founder" />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
