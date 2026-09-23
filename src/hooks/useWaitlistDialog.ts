import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';

const STORAGE_KEY = 'rapid_waitlist_draft';

export function useWaitlistDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Deep link: /?join=... opens the dialog (the value is ignored — the form
  // no longer collects a role).
  const [isOpen, setIsOpen] = useState(() => searchParams.has('join'));

  const openDialog = useCallback(() => {
    setIsOpen(true);
    trackEvent('join_open');
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return { isOpen, openDialog, closeDialog };
}

export function saveDraft(data: Record<string, unknown>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadDraft(): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
