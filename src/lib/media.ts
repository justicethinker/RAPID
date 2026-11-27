export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_POST_IMAGES = 3;

export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

export const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.webp';

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return 'Use a PNG, JPEG or WebP image.';
  }
  if (file.size <= 0) return 'That file is empty. Choose another image.';
  if (file.size > MAX_IMAGE_BYTES) return 'Images must be 3 MB or smaller.';
  return null;
}
