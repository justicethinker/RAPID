import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { IMAGE_ACCEPT, MAX_POST_IMAGES, validateImageFile } from '@/lib/media';
import type { MediaReference } from '@/lib/dashboard-types';
import { cn } from '@/lib/cn';
import { AuthedImage } from '@/components/ui/AuthedImage';
import { ImageCropDialog } from '@/components/ui/ImageCropDialog';

type GalleryOperation =
  | { kind: 'upload' }
  | { kind: 'remove'; mediaId: string }
  | null;

interface CropCandidate {
  file: File;
  url: string;
}

export function PostImageGallery({
  id,
  images,
  maxImages = MAX_POST_IMAGES,
  onUpload,
  onRemove,
}: {
  id: string;
  images: MediaReference[];
  maxImages?: number;
  onUpload: (file: File, onProgress: (percent: number) => void) => Promise<void>;
  onRemove: (mediaId: string) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const candidateRef = useRef<CropCandidate | null>(null);
  const [operation, setOperation] = useState<GalleryOperation>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [candidate, setCandidate] = useState<CropCandidate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pending = operation !== null;
  const full = images.length >= maxImages;
  const removing = operation?.kind === 'remove' ? operation.mediaId : null;
  const tiles = images.length + (full ? 0 : 1);

  useEffect(() => {
    return () => {
      if (candidateRef.current) URL.revokeObjectURL(candidateRef.current.url);
    };
  }, []);

  useEffect(() => {
    const resetDrag = () => {
      dragDepth.current = 0;
      setDragging(false);
    };
    window.addEventListener('dragend', resetDrag);
    window.addEventListener('drop', resetDrag);
    return () => {
      window.removeEventListener('dragend', resetDrag);
      window.removeEventListener('drop', resetDrag);
    };
  }, []);

  const openCrop = (file: File) => {
    if (pending) return;
    if (full) {
      setError(`Posts can have up to ${maxImages} images. Remove one before adding another.`);
      return;
    }

    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }

    if (candidateRef.current) URL.revokeObjectURL(candidateRef.current.url);
    const next = { file, url: URL.createObjectURL(file) };
    candidateRef.current = next;
    setError(null);
    setCandidate(next);
  };

  const closeCrop = () => {
    if (candidateRef.current) {
      URL.revokeObjectURL(candidateRef.current.url);
      candidateRef.current = null;
    }
    setCandidate(null);
  };

  const uploadFile = async (file: File) => {
    setOperation({ kind: 'upload' });
    setProgress(null);
    setError(null);
    try {
      await onUpload(file, (value) => {
        setProgress(Math.min(100, Math.max(0, value)));
      });
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields?.file) {
        setError(cause.fields.file);
      } else {
        setError('We could not upload that image. Check your connection and try again.');
      }
    } finally {
      setOperation(null);
      setProgress(null);
    }
  };

  const remove = async (mediaId: string) => {
    if (pending) return;
    setOperation({ kind: 'remove', mediaId });
    setError(null);
    try {
      await onRemove(mediaId);
    } catch {
      setError('We could not remove that image. Check your connection and try again.');
    } finally {
      setOperation(null);
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) openCrop(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (pending) return;

    const file = event.dataTransfer.files?.[0];
    if (file) openCrop(file);
  };

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (!Array.from(event.dataTransfer.types).includes('Files') || pending || full) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (pending || full) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!Array.from(event.dataTransfer.types).includes('Files') || pending || full) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const uploadLabel =
    progress === null
      ? 'Uploading image…'
      : progress >= 100
        ? 'Processing image…'
        : `Uploading image ${progress}%`;

  return (
    <>
      <div
        role="group"
        aria-label="Post images"
        aria-busy={pending}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={cn(
          'relative rounded-xl border bg-cream-50 p-4 transition-colors',
          dragging
            ? 'border-rapid-600 bg-rapid-50 ring-2 ring-rapid-500/20'
            : 'border-cream-200',
        )}
      >
        {dragging && !pending && !full && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-1 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-rapid-600 bg-rapid-50/95 p-4 text-center"
          >
            <span>
              <ImagePlus size={24} className="mx-auto text-rapid-700" />
              <span className="mt-2 block text-sm font-bold text-rapid-700">
                Drop to crop and add
              </span>
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Post images</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Up to {maxImages} images. The first image leads the gallery.
            </p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold tabular-nums text-ink-faint">
            {images.length}/{maxImages}
          </span>
        </div>

        <input
          ref={input}
          id={id}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          onChange={onChange}
          disabled={pending || full}
        />

        {images.length === 0 ? (
          <label
            htmlFor={id}
            className={cn(
              'mt-3 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cream-300 bg-white px-4 text-center transition-colors hover:border-rapid-600 hover:bg-rapid-50',
              (pending || full) && 'pointer-events-none opacity-60',
            )}
          >
            {pending ? (
              <Loader2 size={22} className="animate-spin text-rapid-700" aria-hidden="true" />
            ) : (
              <ImagePlus size={22} className="text-ink-faint" aria-hidden="true" />
            )}
            <span className="mt-2 text-sm font-bold text-ink">
              {pending ? 'Uploading image…' : 'Add an image'}
            </span>
            <span className="mt-1 text-xs text-ink-soft">
              Drag a file here or choose one to crop.
            </span>
          </label>
        ) : (
          <div
            className={cn(
              'mt-3 grid grid-cols-2 gap-2',
              tiles >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
            )}
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  'group relative aspect-[16/9] overflow-hidden rounded-lg border border-cream-200 bg-white',
                  removing === image.id && 'opacity-60',
                )}
              >
                <AuthedImage
                  src={image.url}
                  alt={image.altText ?? `Post image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 0 && (
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-ink/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void remove(image.id)}
                  disabled={pending}
                  aria-label={`Remove image ${index + 1} of ${images.length}`}
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md border border-cream-200 bg-white/95 text-ink-faint shadow-sm transition-colors hover:text-danger disabled:opacity-60"
                >
                  {removing === image.id ? (
                    <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 size={13} aria-hidden="true" />
                  )}
                </button>
              </div>
            ))}
            {!full && (
              <label
                htmlFor={id}
                className={cn(
                  'flex aspect-[16/9] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-cream-300 bg-white px-2 text-center transition-colors hover:border-rapid-600 hover:bg-rapid-50',
                  pending && 'pointer-events-none opacity-60',
                )}
              >
                {pending ? (
                  <Loader2 size={18} className="animate-spin text-rapid-700" aria-hidden="true" />
                ) : (
                  <ImagePlus size={18} className="text-ink-faint" aria-hidden="true" />
                )}
                <span className="mt-1 text-[11px] font-bold text-ink">
                  {pending ? 'Uploading…' : 'Add image'}
                </span>
              </label>
            )}
          </div>
        )}

        {operation?.kind === 'upload' && (
          <div className="mt-3">
            <div
              role="progressbar"
              aria-label="Uploading post image"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress ?? undefined}
              aria-valuetext={uploadLabel}
              className="h-1.5 overflow-hidden rounded-full bg-cream-200"
            >
              <span
                className={cn(
                  'block h-full rounded-full bg-rapid-600 transition-[width] duration-300',
                  progress === null && 'animate-pulse',
                )}
                style={{ width: progress === null ? '12%' : `${Math.max(4, progress)}%` }}
              />
            </div>
            <p role="status" aria-live="polite" className="mt-1.5 text-[11px] font-semibold text-rapid-700">
              {uploadLabel}
            </p>
          </div>
        )}

        {removing && (
          <p role="status" className="mt-2 text-[11px] font-semibold text-rapid-700">
            Removing image…
          </p>
        )}

        <p className="mt-2 text-[11px] text-ink-faint">
          PNG, JPEG or WebP · up to 3 MB each. Drag a file here or choose one to crop it first.
        </p>
        {error && (
          <p role="alert" className="mt-2 text-xs font-semibold text-danger">
            {error}
          </p>
        )}
      </div>

      {candidate && (
        <ImageCropDialog
          file={candidate.file}
          imageUrl={candidate.url}
          label="Post image"
          aspectRatio={16 / 9}
          onCancel={closeCrop}
          onCrop={(cropped) => {
            closeCrop();
            void uploadFile(cropped);
          }}
        />
      )}
    </>
  );
}