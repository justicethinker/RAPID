import { z } from 'zod';

// The waitlist collects exactly two things: a name and an email.
export const waitlistSchema = z.object({
  name: z.string().min(2, 'Enter your name.').max(80, 'Name is too long.'),
  email: z.string().email('Enter a valid email address, like name@example.com.'),
  honeypot: z.string().optional(),
});

export type WaitlistFormData = z.infer<typeof waitlistSchema>;
