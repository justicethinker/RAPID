import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useApiClient } from '@/hooks/useApi';
import { ApiError } from '@/lib/api';
import {
  STARTUP_CATEGORIES,
  STARTUP_STAGES,
  type StartupCategory,
  type StartupStage,
} from '@/lib/startup-options';
import type { FounderStartup, FounderStartupResponse } from '@/lib/dashboard-types';
import { Button } from '@/components/ui/Button';
import { FieldLabel, inputClass } from '@/pages/app/Ui';

const textareaClass = `${inputClass} min-h-[120px] resize-y`;

export function StartupForm({
  initial,
  onSaved,
}: {
  initial?: FounderStartup | null;
  onSaved: (startup: FounderStartup) => void | Promise<void>;
}) {
  const request = useApiClient();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState<StartupCategory>(
    (initial?.category as StartupCategory) ?? 'consumer',
  );
  const [stage, setStage] = useState<StartupStage | ''>(
    (initial?.stage as StartupStage | null) ?? '',
  );
  const [websiteUrl, setWebsiteUrl] = useState(initial?.websiteUrl ?? '');
  const [publish, setPublish] = useState(initial?.visibility === 'published' || !initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const editing = Boolean(initial);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;

    const nextFields: Record<string, string> = {};
    if (name.trim().length < 2) {
      nextFields.name = 'Enter your startup name (at least 2 characters).';
    }
    if (description.trim().length < 20) {
      nextFields.description = 'Write a short description of at least 20 characters.';
    }
    if (Object.keys(nextFields).length) {
      setFields(nextFields);
      setError(null);
      return;
    }

    setPending(true);
    setFields({});
    setError(null);
    try {
      const body = {
        name: name.trim(),
        description: description.trim(),
        category,
        stage: stage || null,
        websiteUrl: websiteUrl.trim() || null,
        publish,
      };
      const result = editing
        ? await request<FounderStartupResponse>('/api/founder/startup', {
            method: 'PATCH',
            body,
          })
        : await request<FounderStartupResponse>('/api/founder/startup', {
            method: 'POST',
            body,
          });

      if (!result.startup) throw new Error('missing startup');
      await onSaved(result.startup);
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields) {
        setFields(cause.fields);
        setError('Check the highlighted fields and try again.');
      } else if (cause instanceof ApiError && cause.status === 409) {
        setError('Your startup profile already exists. Reload the page to edit it.');
      } else {
        setError('We could not save your startup. Check your connection and try again.');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate className="space-y-5">
      {error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <div>
        <FieldLabel htmlFor="startup-name">Startup name</FieldLabel>
        <input
          id="startup-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          autoComplete="organization"
          className={inputClass}
          aria-invalid={fields.name ? true : undefined}
          aria-describedby={fields.name ? 'startup-name-error' : undefined}
          placeholder="e.g. Kọ́lá"
        />
        {fields.name && (
          <p id="startup-name-error" role="alert" className="mt-2 text-sm font-semibold text-danger">
            {fields.name}
          </p>
        )}
      </div>

      <div>
        <FieldLabel htmlFor="startup-description" hint="Plain language is best. Tell people what you are building and who it is for.">
          Short description
        </FieldLabel>
        <textarea
          id="startup-description"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={500}
          className={textareaClass}
          aria-invalid={fields.description ? true : undefined}
          aria-describedby={fields.description ? 'startup-description-error' : undefined}
          placeholder="A short, clear description of the problem you are solving."
        />
        <div className="mt-2 flex items-start justify-between gap-3">
          {fields.description ? (
            <p id="startup-description-error" role="alert" className="text-sm font-semibold text-danger">
              {fields.description}
            </p>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-xs tabular-nums text-ink-faint">{description.length}/500</span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="startup-category">Category</FieldLabel>
          <select
            id="startup-category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value as StartupCategory)}
            className={inputClass}
            aria-invalid={fields.category ? true : undefined}
          >
            {STARTUP_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          {fields.category && <p className="mt-2 text-sm font-semibold text-danger">{fields.category}</p>}
        </div>

        <div>
          <FieldLabel htmlFor="startup-stage" hint="Optional.">
            Stage
          </FieldLabel>
          <select
            id="startup-stage"
            name="stage"
            value={stage}
            onChange={(event) => setStage(event.target.value as StartupStage | '')}
            className={inputClass}
            aria-invalid={fields.stage ? true : undefined}
          >
            <option value="">Not specified</option>
            {STARTUP_STAGES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          {fields.stage && <p className="mt-2 text-sm font-semibold text-danger">{fields.stage}</p>}
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="startup-website" hint="Optional. Use the page where people can learn more or try the product.">
          Website or demo link
        </FieldLabel>
        <input
          id="startup-website"
          name="websiteUrl"
          type="url"
          value={websiteUrl}
          onChange={(event) => setWebsiteUrl(event.target.value)}
          maxLength={300}
          className={inputClass}
          aria-invalid={fields.websiteUrl ? true : undefined}
          aria-describedby={fields.websiteUrl ? 'startup-website-error' : undefined}
          placeholder="https://example.com"
        />
        {fields.websiteUrl && (
          <p id="startup-website-error" role="alert" className="mt-2 text-sm font-semibold text-danger">
            {fields.websiteUrl}
          </p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-cream-200 bg-cream-50 p-4">
        <input
          type="checkbox"
          checked={publish}
          onChange={(event) => setPublish(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-cream-300 accent-rapid-700"
        />
        <span>
          <span className="block text-sm font-semibold text-ink">Publish my startup profile</span>
          <span className="mt-1 block text-xs leading-relaxed text-ink-soft">
            Published profiles are visible to anyone with the link. You can switch back to draft at any time.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} showArrow>
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Saving
            </>
          ) : editing ? (
            'Save changes'
          ) : (
            'Create startup'
          )}
        </Button>
        <p className="text-xs text-ink-soft">
          You can edit these details later from My startup.
        </p>
      </div>
    </form>
  );
}
