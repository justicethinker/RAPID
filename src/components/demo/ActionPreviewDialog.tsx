import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ActionVariantKey } from '@/content/copy';
import { ACTION_VARIANTS } from '@/content/copy';


interface ActionPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  variant: ActionVariantKey;
}

export function ActionPreviewDialog({ open, onClose, variant }: ActionPreviewDialogProps) {
  const [sent, setSent] = useState(false);
  const data = ACTION_VARIANTS[variant]!;

  const handleClose = () => {
    setSent(false);
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-navy-950/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[60] w-[90vw] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white p-6 shadow-xl"
          style={{ colorScheme: 'light' }}
          aria-label={data.title}
        >
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-4 text-light-muted hover:text-ink"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </Dialog.Close>

          {!sent ? (
            <>
              <h3 className="text-xl font-bold text-ink mb-2 pr-8">{data.title}</h3>
              <p className="text-sm text-light-muted mb-4">{data.description}</p>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-ink leading-relaxed border border-gray-100">
                {data.message}
              </div>
              <div className="flex gap-3 mb-3">
                <Button variant="primary" size="sm" showArrow onClick={() => setSent(true)}>
                  Preview request
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  Close
                </Button>
              </div>
              <p className="text-[13px] text-light-muted">
                Demo only. No request will be sent and nothing will be booked.
              </p>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-brand-50 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-brand-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Preview confirmed</h3>
              <p className="text-sm text-light-muted mb-5">
                This is where you would see your request confirmed. In this demo, nothing was sent.
              </p>
              <Button variant="primary" size="sm" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
