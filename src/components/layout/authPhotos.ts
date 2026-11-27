import type { PhotoName } from '@/components/ui/Photo';

export interface AuthPhoto {
  name: PhotoName;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

/** The research-session portrait used on the public sign-in screen. */
export const SESSION_PHOTO: AuthPhoto = {
  name: 'session',
  alt: 'Two people reviewing notes during a test session',
  width: 900,
  height: 1125,
  caption: 'Pilot session · illustrative',
};

/** Staff reviewing applications together, used on the admin screens. */
export const STAFF_PHOTO: AuthPhoto = {
  name: 'staff',
  alt: 'Three colleagues reviewing printed notes around a desk',
  width: 900,
  height: 1125,
  caption: 'Staff review · illustrative',
};
