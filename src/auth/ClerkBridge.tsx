import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import {
  clerkPublishableKey,
  type Me,
  type SessionStatus,
  type SessionValue,
} from '@/auth/session';
import { SessionValueProvider } from '@/auth/AuthProvider';
import { ApiError, api } from '@/lib/api';

function ClerkSession({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  return <ClerkAccount key={userId ?? 'guest'}>{children}</ClerkAccount>;
}

function ClerkAccount({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut: clerkSignOut } = useAuth();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    await getToken().then(token => token ? api<Me>('/api/me', { token }) : null).then(
      (data) => {
        setMe(data);
        setError(null);
        setStatus(data ? 'signed_in' : 'signed_out');
      },
      (cause: unknown) => {
        setMe(null);
        const code = cause instanceof ApiError ? cause.code : null;
        setError(
          code === 'email_unverified'
            ? 'Verify your email address to open your RAPID account. Your application is safe; we link it once the address is confirmed.'
            : cause instanceof ApiError && cause.status === 401
              ? 'We could not confirm your session. Sign in again.'
              : 'We could not load your account. Check your connection and try again.',
        );
        setStatus('error');
      },
    );
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo<SessionValue>(
    () => ({
      mode: 'clerk',
      status: !isLoaded ? 'loading' : !isSignedIn ? 'signed_out' : status,
      me: isSignedIn ? me : null,
      error: isSignedIn ? error : null,
      refresh: load,
      signOut: async () => {
        await clerkSignOut();
        setMe(null);
        setStatus('signed_out');
      },
      signInDev: async (): Promise<Me> => {
        throw new Error('Local role sign-in is not available when Clerk is configured.');
      },
      signInAdminDev: async (): Promise<Me> => {
        throw new Error('Admin sign-in is not available when Clerk is configured.');
      },
      signUpDev: async () => {
        throw new Error('Local account creation is not available when Clerk is configured.');
      },
      getToken: async () => (isSignedIn ? getToken() : null),
    }),
    [clerkSignOut, error, getToken, isLoaded, isSignedIn, load, me, status],
  );

  return <SessionValueProvider value={value}>{children}</SessionValueProvider>;
}

export default function ClerkBridge({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey!}
      afterSignOutUrl="/"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <ClerkSession>{children}</ClerkSession>
    </ClerkProvider>
  );
}
