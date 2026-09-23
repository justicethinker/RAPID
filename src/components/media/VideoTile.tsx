import { cn } from '@/lib/cn';
import { Photo } from '@/components/media/Photo';

interface VideoTileProps {
  duration?: string;
  label?: string;
  image?: string;
  onClick?: () => void;
  className?: string;
  aspectRatio?: string;
  showPlayButton?: boolean;
}

export function VideoTile({
  duration,
  label,
  image,
  onClick,
  className,
  aspectRatio = '16/10',
  showPlayButton = true,
}: VideoTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full overflow-hidden rounded-[14px] bg-navy-800 group',
        className
      )}
      style={{ aspectRatio }}
      aria-label={label ? `Play ${label}` : 'Play sample pitch video'}
    >
      {/* Placeholder background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900" />

      {/* Thumbnail (hides itself if the file is absent, gradient shows through) */}
      {image && (
        <Photo src={image} className="absolute inset-0 h-full w-full object-cover" />
      )}

      {/* Play button */}
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="#03121E"
              aria-hidden="true"
            >
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          </span>
        </div>
      )}

      {/* Duration badge */}
      {duration && (
        <span className="absolute bottom-2 left-2 rounded-full bg-navy-950/80 px-2.5 py-0.5 text-xs font-medium text-dark-text">
          {duration}
        </span>
      )}

      {/* Label pill */}
      {label && (
        <span className="absolute bottom-2 right-2 rounded-full bg-navy-950/80 px-2.5 py-0.5 text-xs text-dark-muted">
          {label}
        </span>
      )}
    </button>
  );
}
