import { createContext, useContext } from "react";

export type Role = "tester" | "founder" | "staff";

export interface Me {
  person: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
  };
  roles: Record<Role, boolean>;
  tester: {
    applicationStatus: string;
    reference: string;
    invitations: number;
  } | null;
  founder: {
    organisation: string | null;
    tests: number;
  } | null;
  unreadNotifications: number;
}

export type SessionStatus = "loading" | "signed_out" | "signed_in" | "error";

export interface SessionValue {
  mode: "clerk" | "local";
  status: SessionStatus;
  me: Me | null;
  error: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  signInDev: (role: Role, email?: string) => Promise<Me>;
  signInAdminDev: (username: string, password: string) => Promise<Me>;
  signUpDev: (email: string, fullName: string) => Promise<void>;
  getToken: () => Promise<string | null>;
}

export const SessionContext = createContext<SessionValue | undefined>(undefined);

export const clerkPublishableKey = (
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
)?.trim();

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside AuthRoot");
  return value;
}

/**
 * Whether accounts can work in this build. Production accounts need Clerk;
 * local accounts exist only on a developer's machine (the server refuses dev
 * sign-in on every deployment). A production build with no Clerk key keeps
 * the public site fully working and shows a friendly notice on account
 * routes instead of a broken form.
 */
export const accountsEnabled = Boolean(clerkPublishableKey) || import.meta.env.DEV;
