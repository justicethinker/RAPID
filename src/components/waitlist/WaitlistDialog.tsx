import { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BrandPanel } from './BrandPanel';
import { Button } from '@/components/ui/Button';
import { waitlistSchema, type WaitlistFormData } from '@/lib/schema';
import { submitWaitlist, warmWaitlist, type SubmitResult } from '@/lib/waitlist';
import { clearDraft, loadDraft, saveDraft } from '@/hooks/useWaitlistDialog';
import { trackEvent } from '@/lib/analytics';
import { WAITLIST } from '@/content/copy';
import { cn } from '@/lib/cn';

interface WaitlistDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function WaitlistDialog({ open, onClose }: WaitlistDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const draftLoadedRef = useRef(false);

  const form = useForm<WaitlistFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(waitlistSchema) as any,
    defaultValues: { name: '', email: '', honeypot: '' },
  });

  const { register, handleSubmit, setValue, formState: { errors } } = form;

  // Load draft from session storage (once per open)
  useEffect(() => {
    if (!open) { draftLoadedRef.current = false; return; }
    if (draftLoadedRef.current) return;
    draftLoadedRef.current = true;
    const draft = loadDraft();
    if (draft) {
      if (draft.name) setValue('name', draft.name as string);
      if (draft.email) setValue('email', draft.email as string);
    }
  }, [open, setValue]);

  // Analytics, and warm the endpoint while the user types so their submit
  // doesn't pay the Google Apps Script cold-start tax.
  useEffect(() => {
    if (!open) return;
    trackEvent('join_open');
    warmWaitlist();
  }, [open]);

  const onSubmit = async (data: WaitlistFormData) => {
    // Check honeypot: pretend success so bots never see an error
    if (data.honeypot) {
      setResult({ ok: true });
      return;
    }

    setSubmitting(true);
    setServerError(null);
    saveDraft({ name: data.name, email: data.email });

    // Apps Script web apps can cold-start, so allow a little extra time.
    const timeout = setTimeout(() => {
      setServerError('Request timed out. Check your connection and try again.');
      setSubmitting(false);
    }, 15000);

    const res = await submitWaitlist(data);
    clearTimeout(timeout);

    setSubmitting(false);

    if (res.ok) {
      clearDraft();
      trackEvent('join_success');
      setResult(res);
    } else if (res.duplicate) {
      clearDraft();
      setResult({ ok: true, duplicate: true });
    } else {
      setServerError(res.error || WAITLIST.errorText);
    }
  };

  const handleClose = () => {
    if (result) form.reset({ name: '', email: '', honeypot: '' });
    setResult(null);
    setServerError(null);
    setSubmitting(false);
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-white shadow-xl overflow-hidden max-h-[92dvh]"
          aria-label="Join the waitlist"
        >
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-ink hover:bg-gray-200"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <div className="flex min-h-0 max-h-[92dvh] md:min-h-[500px]" style={{ colorScheme: 'light' }}>
            <BrandPanel />

            {/* Form panel */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {!result ? (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-6 md:p-10"
                  noValidate
                >
                  {/* Honeypot */}
                  <input
                    type="text"
                    {...register('honeypot')}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute opacity-0 pointer-events-none h-0 w-0"
                  />

                  <h3 className="text-[34px] font-extrabold text-ink mb-2">{WAITLIST.heading}</h3>
                  <p className="text-sm text-light-muted mb-7">{WAITLIST.sub}</p>

                  {/* Name */}
                  <div>
                    <label htmlFor="w-name" className="block text-sm font-bold text-ink mb-1">{WAITLIST.nameLabel}</label>
                    <input
                      id="w-name"
                      {...register('name')}
                      placeholder={WAITLIST.namePlaceholder}
                      autoComplete="name"
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-base md:text-sm text-ink placeholder:text-light-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-600 transition-all',
                        errors.name ? 'border-danger' : 'border-[#808F9E]'
                      )}
                    />
                    {errors.name && <p className="text-xs text-danger mt-1" role="alert">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="mt-4">
                    <label htmlFor="w-email" className="block text-sm font-bold text-ink mb-1">{WAITLIST.emailLabel}</label>
                    <input
                      id="w-email"
                      type="email"
                      {...register('email')}
                      placeholder={WAITLIST.emailPlaceholder}
                      autoComplete="email"
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-base md:text-sm text-ink placeholder:text-light-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-600 transition-all',
                        errors.email ? 'border-danger' : 'border-[#808F9E]'
                      )}
                    />
                    {errors.email && <p className="text-xs text-danger mt-1" role="alert">{errors.email.message}</p>}
                  </div>

                  {/* Server error */}
                  {serverError && (
                    <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4" role="alert">
                      <p className="text-sm text-danger">{serverError}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setServerError(null);
                          form.handleSubmit(onSubmit)();
                        }}
                      >
                        {WAITLIST.retryCta}
                      </Button>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="mt-6">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      showArrow
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {WAITLIST.savingText}
                        </>
                      ) : (
                        WAITLIST.joinCta
                      )}
                    </Button>
                  </div>

                  {/* Consent */}
                  <p className="text-[13px] text-light-muted text-center mt-4">
                    By joining you agree that we may contact you about the pilot. See our{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">
                      Privacy page
                    </a>.
                  </p>
                </form>
              ) : (
                /* Confirmation — added to the waitlist */
                <div className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="h-20 w-20 rounded-full bg-brand-50 flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-brand-600" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-ink mb-3">
                    {result.duplicate ? WAITLIST.duplicateTitle : WAITLIST.successTitle}
                  </h3>
                  <p className="text-sm text-light-muted max-w-[400px] mb-6 leading-relaxed">
                    {result.duplicate ? WAITLIST.duplicateText : WAITLIST.successText}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleClose();
                        document.getElementById('explore-ideas')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {WAITLIST.exploreDemoCta}
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                      {WAITLIST.closeCta}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
