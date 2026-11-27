import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useApi, useApiClient, useApiUpload } from '@/hooks/useApi';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { FounderStartupResponse } from '@/lib/dashboard-types';
import { StartupForm } from '@/components/forms/StartupForm';
import { CopyLinkButton } from '@/components/ui/CopyLinkButton';
import { ImageUploader } from '@/components/ui/ImageUploader';
import {
  ErrorPanel,
  Loading,
  PageHeading,
  Panel,
  Pill,
} from '@/pages/app/Ui';

export default function FounderStartup() {
  usePageMeta({ title: 'My startup | RAPID', noindex: true });

  const request = useApiClient();
  const upload = useApiUpload();
  const { data, loading, error, refresh, setData } =
    useApi<FounderStartupResponse>('/api/founder/startup');
  const startup = data?.startup ?? null;
  const publicUrl = startup?.visibility === 'published'
    ? `${window.location.origin}/startup/${startup.slug}`
    : null;

  const uploadBrandImage = async (
    kind: 'logo' | 'cover',
    file: File,
    onProgress: (percent: number) => void,
  ) => {
    await upload('/api/founder/startup/media', file, { kind }, onProgress);
    await refresh();
  };

  const removeBrandImage = async (kind: 'logo' | 'cover') => {
    await request(`/api/founder/startup/media/${kind}`, { method: 'DELETE' });
    await refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Founder workspace"
        title="My startup"
        description="This is the public face of what you are building. Edit the details people see when they open your link."
      >
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-studio-300 bg-studio-25 px-4 text-sm font-bold text-ink hover:border-brand-600 hover:bg-studio-50"
          >
            View startup
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        )}
      </PageHeading>

      {loading && !data && <Loading label="Loading your startup…" />}
      {error && <ErrorPanel message={error} onRetry={() => void refresh()} />}

      {data && !startup && (
        <Panel
          title="Set up your startup"
          description="Add the essentials now. You can refine the profile and publish it whenever you are ready."
        >
          <StartupForm
            onSaved={(saved) => {
              setData({ startup: saved });
            }}
          />
        </Panel>
      )}

      {startup && (
        <>
          <Panel
            title="Startup profile"
            description="Keep this short and specific. People should understand what you are building before they read your posts."
            action={
              <Pill tone={startup.visibility === 'published' ? 'positive' : 'neutral'}>
                {startup.visibility === 'published' ? 'Published' : 'Draft'}
              </Pill>
            }
          >
            <StartupForm
              initial={startup}
              onSaved={(saved) => {
                setData({ startup: saved });
              }}
            />
          </Panel>

          <Panel
            title="Brand images"
            description="Add a logo and a cover image. They appear on your public startup page and help people recognise you at a glance."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <ImageUploader
                id="startup-logo"
                label="Logo"
                hint="Square image. It appears beside your startup name."
                currentUrl={startup.logoUrl}
                alt={`${startup.name} logo`}
                previewClassName="h-24 w-24"
                aspectRatio={1}
                onUpload={(file, onProgress) => uploadBrandImage('logo', file, onProgress)}
                onRemove={() => removeBrandImage('logo')}
              />
              <ImageUploader
                id="startup-cover"
                label="Cover image"
                hint="Wide 16:9 banner for the top of your public profile."
                currentUrl={startup.coverUrl}
                alt={`${startup.name} cover image`}
                previewClassName="h-24 w-40"
                aspectRatio={16 / 9}
                onUpload={(file, onProgress) => uploadBrandImage('cover', file, onProgress)}
                onRemove={() => removeBrandImage('cover')}
              />
            </div>
          </Panel>

          {publicUrl ? (
            <Panel
              title="Your public link"
              description="Share this link with early users, testers and anyone who wants to follow what you are building."
            >
              <div className="flex flex-wrap items-center gap-3">
                <code className="min-w-0 flex-1 break-all rounded-xl border border-studio-200 bg-studio-50 px-4 py-3 text-sm text-ink">
                  {publicUrl}
                </code>
                <CopyLinkButton url={publicUrl} label="Copy public link" />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-light-muted">
                Draft profiles are not visible publicly. Turn publishing off in the form above to hide this page.
              </p>
            </Panel>
          ) : (
            <Panel title="Not public yet">
              <p className="text-sm leading-relaxed text-light-muted">
                Your profile is still a draft. Publish it above to get a shareable link and start collecting
                waitlist sign-ups. You can keep working on it privately first.
              </p>
            </Panel>
          )}

          <p className="text-xs text-light-muted">
            Looking for the research-test flow?{' '}
            <Link to="/app/founder" className="font-semibold text-brand-700 underline underline-offset-2">
              Go to your workspace
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
