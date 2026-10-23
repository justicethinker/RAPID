import { SUPPORT_EMAIL_FALLBACK } from '@/content/pilot';

const configured = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

/** Approved support address; replace before public launch. */
export const supportEmail = configured?.trim() || SUPPORT_EMAIL_FALLBACK;

export const supportEmailHref = `mailto:${supportEmail}`;
