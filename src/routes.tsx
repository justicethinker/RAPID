import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

// The privacy page is not part of the landing flow — keep it out of the
// main bundle so first load on mobile pays for less JavaScript.
const Privacy = lazy(() => import('./pages/Privacy'));

export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Suspense>
  );
}
