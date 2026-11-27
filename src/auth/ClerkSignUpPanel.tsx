import { SignUp } from '@clerk/clerk-react';

/**
 * Virtual routing keeps the whole sign-up (including verification and the
 * Google redirect) on this page instead of inventing routes under it. The
 * fallback URL points back at the same onboarding step so a completed sign-up
 * returns here to collect the role-specific details.
 */
export default function ClerkSignUpPanel({ redirectUrl }: { redirectUrl: string }) {
  return (
    <SignUp
      routing="virtual"
      signInUrl="/sign-in"
      fallbackRedirectUrl={redirectUrl}
      appearance={{
        variables: {
          colorPrimary: '#0B9468',
          colorText: '#101B26',
          colorBackground: '#FFFFFF',
          borderRadius: '12px',
        },
      }}
    />
  );
}
