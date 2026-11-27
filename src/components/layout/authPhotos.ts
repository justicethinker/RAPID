import type { PhotoName } from '@/components/ui/Photo';

export interface AuthPhoto {
  name: PhotoName;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

/** A tester at work, used on the public sign-in and sign-up screens. */
export const SESSION_PHOTO: AuthPhoto = {
  name: 'session',
  alt: 'A young woman typing feedback on a laptop in a café',
  width: 928,
  height: 1152,
};

/** The research team reviewing notes, used on the admin screens. */
export const STAFF_PHOTO: AuthPhoto = {
  name: 'team',
  alt: 'Three colleagues reviewing research notes around a table',
  width: 928,
  height: 1152,
};
