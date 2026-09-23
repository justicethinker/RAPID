interface LogoProps {
  className?: string;
  size?: number;
  /** Render the brand tagline ("VALIDATION THAT DRIVES TRACTION.") under the wordmark. */
  tagline?: boolean;
}

// Extracted from the client's brand JPGs by scripts/process-logo.mjs
const MARK_SRC = '/images/brand/r-mark.png';
const WORD_SRC = '/images/brand/rapid-wordmark.png';
const MARK_ASPECT = 1.5152; // width / height of r-mark.png
const WORD_ASPECT = 5.4299; // width / height of rapid-wordmark.png

export function Logo({ className = '', size = 38, tagline = false }: LogoProps) {
  const markH = size * 0.72;
  const wordH = Math.max(9, size * 0.44);
  const wordW = Math.round(wordH * WORD_ASPECT);

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official R mark (transparent PNG) */}
      <img
        src={MARK_SRC}
        alt=""
        aria-hidden="true"
        className="block shrink-0"
        style={{ height: Math.round(markH), width: Math.round(markH * MARK_ASPECT) }}
      />

      {/* Divider (as in the brand lockup) */}
      <span
        aria-hidden="true"
        className="w-px shrink-0 bg-current"
        style={{ height: size * 0.62, opacity: 0.25 }}
      />

      <span className="flex flex-col leading-none">
        {/* Official RAPID wordmark — masked to currentColor so it is white on dark
            sections and ink on light ones, exactly like the text it replaces. */}
        <span
          aria-hidden="true"
          className="block"
          style={{
            height: wordH,
            width: wordW,
            backgroundColor: 'currentColor',
            WebkitMaskImage: `url(${WORD_SRC})`,
            maskImage: `url(${WORD_SRC})`,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
          }}
        />
        <span className="sr-only">RAPID</span>
        {tagline && (
          <span
            className="mt-1.5 font-bold whitespace-nowrap"
            style={{ fontSize: Math.max(8, size * 0.27), letterSpacing: '0.15em' }}
          >
            <span className="text-brand-500">VALIDATION</span> THAT DRIVES{' '}
            <span className="text-brand-500">TRACTION.</span>
          </span>
        )}
      </span>
    </span>
  );
}
