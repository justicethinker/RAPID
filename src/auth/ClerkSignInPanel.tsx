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
          colorPrimary: '#075F45',
          colorText: '#16150F',
          colorBackground: '#FFFFFF',
          borderRadius: '14px',
          fontFamily: '"Inter Variable", system-ui, sans-serif',
        },
      }}
    />
  );
}
