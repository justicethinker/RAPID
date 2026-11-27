import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { IMAGE_ACCEPT, validateImageFile } from '@/lib/media';
import { cn } from '@/lib/cn';
import { AuthedImage } from '@/components/ui/AuthedImage';
import { ImageCropDialog } from '@/components/ui/ImageCropDialog';

type UploadOperation = 'upload' | 'remove' | null;

interface CropCandidate {
  file: File;
  url: string;
}

export function ImageUploader({
  id,
  label,
  hint,
  currentUrl,
  alt,
  onUpload,
  onRemove,
  previewClassName = 'h-24 w-24',
  aspectRatio = 16 / 9,
}: {
  id: string;
  label: string;
  hint?: string;
  currentUrl: string | null;
  alt: string;
  onUpload: (file: File, onProgress: (percent: number) => void) => Promise<void>;
  onRemove?: () => Promise<void>;
  previewClassName?: string;
  aspectRatio?: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const candidateRef = useRef<CropCandidate | null>(null);
  const [operation, setOperation] = useState<UploadOperation>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [candidate, setCandidate] = useState<CropCandidate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pending = operation !== null;

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
    setOperation('upload');
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
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    event.preventDefault();
    if (pending) return;
    dragDepth.current += 1;
    setDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (pending) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    event.preventDefault();
    if (!pending) event.dataTransfer.dropEffect = 'copy';
  };

  const remove = async () => {
    if (!onRemove || pending) return;
    setOperation('remove');
    setError(null);
    try {
      await onRemove();
    } catch {
      setError('We could not remove that image. Check your connection and try again.');
    } finally {
      setOperation(null);
    }
  };

  const uploadLabel =
    operation === 'upload'
      ? progress === null
        ? 'Uploading…'
        : progress >= 100
          ? 'Processing image…'
          : `Uploading ${progress}%`
      : operation === 'remove'
        ? 'Removing…'
        : currentUrl
          ? 'Replace image'
          : 'Choose image';

  return (
    <>
      <div
        role="group"
        aria-label={label}
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
        {dragging && !pending && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-1 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-rapid-600 bg-rapid-50/95 p-4 text-center"
          >
            <span>
              <ImagePlus size={24} className="mx-auto text-rapid-700" />
              <span className="mt-2 block text-sm font-bold text-rapid-700">
                Drop to crop and upload
              </span>
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-start gap-4">
          {currentUrl ? (
            <AuthedImage
              src={currentUrl}
              alt={alt}
              className={cn('shrink-0 rounded-lg border border-cream-200 object-cover', previewClassName)}
            />
          ) : (
            <span
              className={cn(
                'flex shrink-0 items-center justify-center rounded-lg border border-dashed border-cream-300 bg-white text-ink-faint',
                previewClassName,
              )}
              aria-hidden="true"
            >
              <ImagePlus size={22} />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{label}</p>
            {hint && <p className="mt-1 text-xs leading-relaxed text-ink-soft">{hint}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={input}
                id={id}
                type="file"
                accept={IMAGE_ACCEPT}
                className="sr-only"
                onChange={onChange}
                disabled={pending}
              />
              <label
                htmlFor={id}
                className={cn(
                  'inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-cream-300 bg-white px-3 text-xs font-bold text-ink transition-colors hover:border-rapid-600 hover:bg-cream-50',
                  pending && 'cursor-not-allowed opacity-60',
                )}
              >
                {pending ? (
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus size={14} aria-hidden="true" />
                )}
                {uploadLabel}
              </label>
              {currentUrl && onRemove && (
                <button
                  type="button"
                  onClick={() => void remove()}
                  disabled={pending}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-full px-2 text-xs font-semibold text-danger hover:bg-danger-50 disabled:opacity-60"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>

            {operation === 'upload' && (
              <div className="mt-3">
                <div
                  role="progressbar"
                  aria-label={`Uploading ${label.toLowerCase()}`}
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

            <p className="mt-2 text-[11px] text-ink-faint">
              PNG, JPEG or WebP · up to 3 MB. Drag a file here or choose one to crop it first.
            </p>
            {error && (
              <p role="alert" className="mt-2 text-xs font-semibold text-danger">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {candidate && (
        <ImageCropDialog
          file={candidate.file}
          imageUrl={candidate.url}
          label={label}
          aspectRatio={aspectRatio}
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
