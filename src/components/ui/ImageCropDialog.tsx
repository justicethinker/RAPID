import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import { validateImageFile } from '@/lib/media';
import { cn } from '@/lib/cn';

interface Size {
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function maxOffset(viewport: Size, image: Size, zoom: number): Size {
  if (!viewport.width || !viewport.height || !image.width || !image.height) {
    return { width: 0, height: 0 };
  }

  const baseScale = Math.max(
    viewport.width / image.width,
    viewport.height / image.height,
  );
  const displayWidth = image.width * baseScale * zoom;
  const displayHeight = image.height * baseScale * zoom;

  return {
    width: Math.max(0, (displayWidth - viewport.width) / 2),
    height: Math.max(0, (displayHeight - viewport.height) / 2),
  };
}

export function ImageCropDialog({
  file,
  imageUrl,
  label,
  aspectRatio,
  onCancel,
  onCrop,
}: {
  file: File;
  imageUrl: string;
  label: string;
  aspectRatio: number;
  onCancel: () => void;
  onCrop: (file: File) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cancelled = useRef(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [viewport, setViewport] = useState<Size>({ width: 0, height: 0 });
  const [natural, setNatural] = useState<Size | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outputWidth = aspectRatio >= 1.4 ? 1600 : 800;
  const outputHeight = Math.round(outputWidth / aspectRatio);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!element.open) element.showModal();

    return () => {
      document.body.style.overflow = previousOverflow;
      // Removing the dialog from the tree closes it. Calling close() here would
      // fire onClose during StrictMode's effect replay and dismiss the crop UI.
    };
  }, []);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      setViewport({ width: rect.width, height: rect.height });
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const baseScale = natural
    ? Math.max(viewport.width / natural.width, viewport.height / natural.height)
    : 1;
  const scale = baseScale * zoom;
  const displayed = natural
    ? {
        width: natural.width * scale,
        height: natural.height * scale,
      }
    : null;
  const max = natural
    ? maxOffset(viewport, natural, zoom)
    : { width: 0, height: 0 };
  // Viewport changes can leave an old offset outside the allowed range. Bound
  // it for rendering rather than writing state back from an effect.
  const boundedOffset = {
    x: clamp(offset.x, -max.width, max.width),
    y: clamp(offset.y, -max.height, max.height),
  };

  const changeZoom = (nextZoom: number) => {
    if (!natural) return;
    const next = clamp(nextZoom, 1, 3);
    const max = maxOffset(viewport, natural, next);
    setZoom(next);
    setOffset((current) => ({
      x: clamp(current.x, -max.width, max.width),
      y: clamp(current.y, -max.height, max.height),
    }));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!natural || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX: boundedOffset.x,
      offsetY: boundedOffset.y,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId || !natural) {
      return;
    }
    const max = maxOffset(viewport, natural, zoom);
    setOffset({
      x: clamp(
        drag.current.offsetX + event.clientX - drag.current.x,
        -max.width,
        max.width,
      ),
      y: clamp(
        drag.current.offsetY + event.clientY - drag.current.y,
        -max.height,
        max.height,
      ),
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const crop = () => {
    if (preparing) return;
    const image = imageRef.current;
    if (!image || !natural || !viewport.width || !viewport.height) {
      setError('The image is still loading. Try again in a moment.');
      return;
    }
    if (!image.complete) {
      setError('The image could not be read. Choose another file.');
      return;
    }

    setPreparing(true);
    setError(null);

    const imageLeft = (viewport.width - displayed!.width) / 2 + boundedOffset.x;
    const imageTop = (viewport.height - displayed!.height) / 2 + boundedOffset.y;
    const sourceScale = displayed!.width / natural.width;
    const maxSourceX = Math.max(0, natural.width - viewport.width / sourceScale);
    const maxSourceY = Math.max(0, natural.height - viewport.height / sourceScale);
    const sourceX = clamp(-imageLeft / sourceScale, 0, maxSourceX);
    const sourceY = clamp(-imageTop / sourceScale, 0, maxSourceY);
    const sourceWidth = Math.min(
      viewport.width / sourceScale,
      natural.width - sourceX,
    );
    const sourceHeight = Math.min(
      viewport.height / sourceScale,
      natural.height - sourceY,
    );

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setPreparing(false);
      setError('Your browser could not prepare that image. Try another file.');
      return;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    const outputType =
      file.type === 'image/png' || file.type === 'image/webp'
        ? file.type
        : 'image/jpeg';
    const extension =
      outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';

    canvas.toBlob(
      (blob) => {
        if (cancelled.current) return;
        setPreparing(false);
        if (!blob) {
          setError('Your browser could not prepare that image. Try another file.');
          return;
        }

        const cropped = new File(
          [blob],
          `${baseName}-crop.${extension}`,
          { type: outputType, lastModified: Date.now() },
        );
        const problem = validateImageFile(cropped);
        if (problem) {
          setError(problem);
          return;
        }

        onCrop(cropped);
      },
      outputType,
      0.9,
    );
  };

  return (
    <dialog
      ref={dialog}
      className="image-crop-dialog m-auto max-h-[92vh] w-[92vw] max-w-[34rem] overflow-y-auto rounded-2xl border border-studio-200 bg-studio-25 p-0 text-ink shadow-2xl"
      aria-labelledby="image-crop-title"
      aria-describedby="image-crop-instructions"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClose={onCancel}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              Image preparation
            </p>
            <h2
              id="image-crop-title"
              className="mt-2 text-[22px] font-extrabold tracking-[-0.03em] text-ink"
            >
              Crop {label.toLowerCase()}
            </h2>
            <p id="image-crop-instructions" className="mt-1 text-sm leading-relaxed text-light-muted">
              Drag the image to reposition it, then use the slider to zoom.
            </p>
          </div>
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            aria-label="Close crop dialog"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-studio-600 hover:bg-studio-100 hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div
          ref={viewportRef}
          className="relative mt-5 w-full cursor-grab touch-none overflow-hidden rounded-xl bg-ink active:cursor-grabbing"
          style={{ aspectRatio }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt=""
            draggable={false}
            onLoad={(event) => {
              const width = event.currentTarget.naturalWidth;
              const height = event.currentTarget.naturalHeight;
              if (!width || !height) {
                setError('That image could not be read. Choose another file.');
                return;
              }
              setNatural({ width, height });
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            onError={() => setError('That image could not be opened. Choose another file.')}
            className={cn(
              'pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none',
              !natural && 'opacity-0',
            )}
            style={
              displayed
                ? {
                    width: displayed.width,
                    height: displayed.height,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    transform: `translate(calc(-50% + ${boundedOffset.x}px), calc(-50% + ${boundedOffset.y}px))`,
                  }
                : { maxWidth: 'none', maxHeight: 'none' }
            }
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 border border-white/70"
          >
            <span className="absolute inset-y-0 left-1/3 w-px bg-white/35" />
            <span className="absolute inset-y-0 left-2/3 w-px bg-white/35" />
            <span className="absolute inset-x-0 top-1/3 h-px bg-white/35" />
            <span className="absolute inset-x-0 top-2/3 h-px bg-white/35" />
          </div>

          {!natural && (
            <p
              role="status"
              className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white"
            >
              <Loader2 size={17} className="mr-2 animate-spin" aria-hidden="true" />
              Loading image…
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <label
            htmlFor="image-crop-zoom"
            className="text-xs font-bold uppercase tracking-[0.12em] text-studio-600"
          >
            Zoom
          </label>
          <input
            id="image-crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            disabled={!natural}
            onChange={(event) => changeZoom(Number(event.target.value))}
            className="h-2 min-w-0 flex-1 cursor-pointer accent-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="w-10 text-right text-xs font-semibold tabular-nums text-studio-600">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-danger">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-studio-200 pt-4">
          <p className="text-xs text-studio-600">
            Crops to {outputWidth} × {outputHeight} px
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={preparing}
              className="inline-flex min-h-[44px] items-center rounded-xl px-4 text-sm font-semibold text-studio-600 hover:bg-studio-100 hover:text-ink disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={crop}
              disabled={!natural || preparing}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-ink hover:bg-brand-700 hover:text-white disabled:opacity-60"
            >
              {preparing && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
              {preparing ? 'Preparing…' : 'Crop and upload'}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
