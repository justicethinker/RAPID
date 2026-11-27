import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { ApiError, api } from "@/lib/api";

import { SessionContext, clerkPublishableKey, type Me, type SessionStatus, type SessionValue } from "./session";

/** Used by the Clerk bridge, which lives in its own chunk. */
export function SessionValueProvider({
  value,
  children,
}: {
  value: SessionValue;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

const ClerkBridge = lazy(() => import("@/auth/ClerkBridge"));

function SessionLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-studio-50">
      <p className="flex items-center gap-3 text-light-muted">
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        Loading your account…
      </p>
    </div>
  );
}

function LocalSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => api<Me>("/api/me").then(
    (data) => {
      setMe(data);
      setError(null);
      setStatus("signed_in");
    },
    (cause: unknown) => {
      const signedOut = cause instanceof ApiError && cause.status === 401;
      setMe(null);
      setError(signedOut ? null : "We could not reach the RAPID API. Check your connection and try again.");
      setStatus(signedOut ? "signed_out" : "error");
    },
  ), []);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo<SessionValue>(
    () => ({
      mode: "local",
      status,
      me,
      error,
      refresh: load,
      signOut: async () => {
        await api("/api/dev/sign-out", { method: "POST" });
        setMe(null);
        setError(null);
        setStatus("signed_out");
      },
      signInDev: async (role, email) => {
        const data = await api<Me>("/api/dev/sign-in", {
          method: "POST",
          body: email ? { role, email } : { role },
        });
        setMe(data);
        setError(null);
        setStatus("signed_in");
        return data;
      },
      signInAdminDev: async (username, password) => {
        const data = await api<Me>("/api/dev/admin-sign-in", {
          method: "POST",
          body: { username, password },
        });
        setMe(data);
        setError(null);
        setStatus("signed_in");
        return data;
      },
      signUpDev: async (email, fullName) => {
        const data = await api<Me>("/api/dev/sign-up", {
          method: "POST",
          body: { email, fullName },
        });
        setMe(data);
        setError(null);
        setStatus("signed_in");
      },
      getToken: async () => null,
    }),
    [error, load, me, status],
  );

  return <SessionValueProvider value={value}>{children}</SessionValueProvider>;
}

/**
 * Mounts a session only for account routes. With Clerk configured the bridge
 * (and the Clerk SDK) is a separate chunk, so public pages stay on the light
 * bundle.
 */
export function AuthRoot({ children }: { children: ReactNode }) {
  if (!clerkPublishableKey) {
    return <LocalSessionProvider>{children}</LocalSessionProvider>;
  }

  return (
    <Suspense fallback={<SessionLoading />}>
      <ClerkBridge>{children}</ClerkBridge>
    </Suspense>
  );
}
