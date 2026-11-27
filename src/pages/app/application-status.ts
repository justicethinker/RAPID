export type StatusTone = 'positive' | 'neutral' | 'warning' | 'negative';

interface StatusCopy {
  label: string;
  sentence: string;
  tone: StatusTone;
}

const STATUS: Record<string, StatusCopy> = {
  received: {
    label: 'Received',
    sentence:
      'We’ve got your application. The team reviews new applications within three business days.',
    tone: 'neutral',
  },
  under_review: {
    label: 'Under review',
    sentence:
      'The team is reviewing your application. We’ll email you when there’s a decision.',
    tone: 'warning',
  },
  approved: {
    label: 'Approved',
    sentence:
      'You’re approved. When a test matches your experience, an invitation will appear here and arrive by email.',
    tone: 'positive',
  },
  waitlisted: {
    label: 'Waitlisted',
    sentence:
      'You’re on the waitlist. We’ll invite you when a test matches your experience.',
    tone: 'warning',
  },
  declined: {
    label: 'Not selected',
    sentence:
      'We can’t offer you a place in the pilot right now. Reply to the decision email if you think we got it wrong.',
    tone: 'negative',
  },
  withdrawn: {
    label: 'Withdrawn',
    sentence:
      'Your application is withdrawn. Email support if you’d like to apply again.',
    tone: 'neutral',
  },
};

export function applicationStatus(code: string): StatusCopy {
  return (
    STATUS[code] ?? {
      label: code.replaceAll('_', ' '),
      sentence: 'The team is reviewing your application.',
      tone: 'neutral',
    }
  );
}

export function toneClasses(tone: StatusTone): string {
  switch (tone) {
    case 'positive':
      return 'bg-brand-50 text-brand-700';
    case 'warning':
      return 'bg-warn-50 text-warn-900';
    case 'negative':
      return 'bg-red-50 text-danger';
    default:
      return 'bg-studio-100 text-ink';
  }
}
