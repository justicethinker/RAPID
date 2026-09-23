import { Avatar, type AvatarVariant } from './Avatar';

interface PersonPhotoProps {
  id?: string;
  fallback: AvatarVariant;
  alt: string;
  fallbackCaption?: string;
  className?: string;
}

/**
 * PersonPhoto resolves the real file from src/assets/images if present,
 * otherwise renders the Avatar fallback (section 13.2/13.3).
 * For now, always renders the Avatar fallback until real photos arrive.
 */
export function PersonPhoto({
  fallback,
  alt,
  className,
}: PersonPhotoProps) {
  return (
    <div className={className}>
      <Avatar variant={fallback} className="w-full h-full rounded-[inherit]" />
      {alt && <span className="sr-only">{alt}</span>}
    </div>
  );
}
