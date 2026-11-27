import { SignIn } from '@clerk/clerk-react';

export default function ClerkSignInPanel() {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      fallbackRedirectUrl="/app"
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
