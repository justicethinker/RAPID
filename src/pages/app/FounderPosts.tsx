import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  FileText,
  Loader2,
  Pencil,
  RotateCcw,
  Send,
} from 'lucide-react';
import { useApi, useApiClient, useApiUpload } from '@/hooks/useApi';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ApiError } from '@/lib/api';
import type {
  FounderPost,
  FounderPostsResponse,
  FounderTestSummary,
} from '@/lib/dashboard-types';
import { AuthedImage } from '@/components/ui/AuthedImage';
import { CopyLinkButton } from '@/components/ui/CopyLinkButton';
import { PostImageGallery } from '@/components/ui/PostImageGallery';
import { Button } from '@/components/ui/Button';
import {
  EmptyState,
  ErrorPanel,
  FieldLabel,
  inputClass,
  Loading,
  PageHeading,
  Panel,
  Pill,
} from '@/pages/app/Ui';
import { formatDay } from '@/pages/app/status';

const textareaClass = `${inputClass} min-h-[150px] resize-y`;
const editTextareaClass = `${inputClass} min-h-[120px] resize-y`;

const STATUS_TONE = {
  draft: 'neutral',
  published: 'positive',
  archived: 'warning',
} as const;

function statusLabel(status: FounderPost['status']): string {
  return status === 'draft' ? 'Draft' : status === 'published' ? 'Published' : 'Archived';
}

export default function FounderPosts() {
  usePageMeta({ title: 'Posts | RAPID', noindex: true });

  const request = useApiClient();
  const upload = useApiUpload();
  const { data, loading, error, refresh } =
    useApi<FounderPostsResponse>('/api/founder/posts');
  const { data: tests } = useApi<FounderTestSummary[]>('/api/founder/tests');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<'showcase' | 'validation'>('showcase');
  const [testId, setTestId] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    id: string;
    title: string;
    body: string;
    kind: 'showcase' | 'validation';
    testId: string;
    eligibility: string;
    closesAt: string;
  } | null>(null);
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const startup = data?.startup ?? null;
  const publicBase = startup?.visibility === 'published'
    ? `${window.location.origin}/startup/${startup.slug}`
    : null;
  const activePosts = data?.posts.filter((post) => post.status !== 'archived') ?? [];
  const archivedPosts = data?.posts.filter((post) => post.status === 'archived') ?? [];
  const linkableTests = (tests ?? []).filter((test) => test.status !== 'cancelled');

  const createPost = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;

    const nextFields: Record<string, string> = {};
    if (title.trim().length < 3) nextFields.title = 'Give your post a title (at least 3 characters).';
    if (body.trim().length < 20) nextFields.body = 'Write at least 20 characters.';
    if (Object.keys(nextFields).length) {
      setFields(nextFields);
      setFormError(null);
      return;
    }

    setPending(true);
    setFields({});
    setFormError(null);
    setNotice(null);
    try {
      await request<{ post: FounderPost }>('/api/founder/posts', {
        method: 'POST',
        body: {
          title: title.trim(),
          body: body.trim(),
          kind,
          testId: kind === 'validation' && testId ? testId : null,
          eligibility:
            kind === 'validation' ? eligibility.trim() || null : null,
          closesAt: kind === 'validation' ? closesAt || null : null,
        },
      });
      setTitle('');
      setBody('');
      setKind('showcase');
      setTestId('');
      setEligibility('');
      setClosesAt('');
      setNotice('Draft saved. Add an image, publish it, or keep editing.');
      await refresh();
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields) {
        setFields(cause.fields);
        setFormError('Check the highlighted fields and try again.');
      } else {
        setFormError('We could not save this post. Check your connection and try again.');
      }
    } finally {
      setPending(false);
    }
  };

  const publish = async (postId: string) => {
    setPublishing(postId);
    setNotice(null);
    try {
      await request<{ post: FounderPost }>(`/api/founder/posts/${postId}/publish`, {
        method: 'POST',
      });
      setNotice('Post published. Your public link is ready.');
      await refresh();
    } catch {
      setFormError('We could not publish that post. Check your connection and try again.');
    } finally {
      setPublishing(null);
    }
  };

  const startEditing = (post: FounderPost) => {
    setEditing({
      id: post.id,
      title: post.title,
      body: post.body,
      kind: post.kind === 'validation' ? 'validation' : 'showcase',
      testId: post.testId ?? '',
      eligibility: post.eligibility ?? '',
      closesAt: post.closesAt ? post.closesAt.slice(0, 10) : '',
    });
    setEditFields({});
    setEditError(null);
    setNotice(null);
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing || busyAction) return;

    const nextFields: Record<string, string> = {};
    if (editing.title.trim().length < 3) {
      nextFields.title = 'Give your post a title (at least 3 characters).';
    }
    if (editing.body.trim().length < 20) nextFields.body = 'Write at least 20 characters.';
    if (Object.keys(nextFields).length) {
      setEditFields(nextFields);
      setEditError(null);
      return;
    }

    setBusyAction(`edit:${editing.id}`);
    setEditFields({});
    setEditError(null);
    try {
      await request<{ post: FounderPost }>(`/api/founder/posts/${editing.id}`, {
        method: 'PATCH',
        body: {
          title: editing.title.trim(),
          body: editing.body.trim(),
          kind: editing.kind,
          testId:
            editing.kind === 'validation' && editing.testId
              ? editing.testId
              : null,
          eligibility:
            editing.kind === 'validation'
              ? editing.eligibility.trim() || null
              : null,
          closesAt:
            editing.kind === 'validation' ? editing.closesAt || null : null,
        },
      });
      setEditing(null);
      setNotice('Post updated.');
      await refresh();
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields) {
        setEditFields(cause.fields);
        setEditError('Check the highlighted fields and try again.');
      } else {
        setEditError('We could not save those changes. Check your connection and try again.');
      }
    } finally {
      setBusyAction(null);
    }
  };

  const changeStatus = async (postId: string, action: 'archive' | 'restore') => {
    setBusyAction(`${action}:${postId}`);
    setNotice(null);
    setFormError(null);
    try {
      await request<{ post: FounderPost }>(`/api/founder/posts/${postId}/${action}`, {
        method: 'POST',
      });
      if (editing?.id === postId) setEditing(null);
      setNotice(
        action === 'archive'
          ? 'Post archived. It is no longer visible on your public profile.'
          : 'Post restored as a draft. Publish it again when you are ready.',
      );
      await refresh();
    } catch {
      setFormError(
        `We could not ${action === 'archive' ? 'archive' : 'restore'} that post. Check your connection and try again.`,
      );
    } finally {
      setBusyAction(null);
    }
  };

  const uploadPostImage = async (
    postId: string,
    file: File,
    onProgress: (percent: number) => void,
  ) => {
    await upload(`/api/founder/posts/${postId}/media`, file, {}, onProgress);
    await refresh();
  };

  const removePostImage = async (postId: string, mediaId: string) => {
    await request(`/api/founder/posts/${postId}/media/${mediaId}`, { method: 'DELETE' });
    await refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Founder workspace"
        title="Posts"
        description="Share what you are building and what you are learning. Drafts stay private; published posts appear on your startup profile."
      >
        <Link
          to="/app/founder/startup"
          className="inline-flex min-h-[44px] items-center rounded-xl border border-studio-300 bg-studio-25 px-4 text-sm font-bold text-ink hover:border-brand-600 hover:bg-studio-50"
        >
          Edit startup
        </Link>
      </PageHeading>

      {loading && !data && <Loading label="Loading your posts…" />}
      {error && <ErrorPanel message={error} onRetry={() => void refresh()} />}

      {data && !startup && (
        <Panel>
          <EmptyState icon={<FileText size={20} aria-hidden="true" />} title="Create your startup first">
            <p>Posts live on your startup profile. Set that up before you write your first post.</p>
            <Link
              to="/app/founder/startup"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-brand-500 px-5 text-sm font-bold text-ink hover:bg-brand-700 hover:text-white"
            >
              Set up startup
            </Link>
          </EmptyState>
        </Panel>
      )}

      {data && startup && (
        <>
          {notice && (
            <p role="status" className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
              {notice}
            </p>
          )}

          <Panel
            title="Write a showcase post"
            description="A short update is enough: what you built, who it is for, or a question you want early users to answer."
          >
            {formError && (
              <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
                {formError}
              </p>
            )}
            <form onSubmit={(event) => void createPost(event)} noValidate className="space-y-5">
              <div>
                <FieldLabel htmlFor="post-title">Title</FieldLabel>
                <input
                  id="post-title"
                  name="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  className={inputClass}
                  aria-invalid={fields.title ? true : undefined}
                  aria-describedby={fields.title ? 'post-title-error' : undefined}
                  placeholder="What are you sharing?"
                />
                {fields.title && (
                  <p id="post-title-error" role="alert" className="mt-2 text-sm font-semibold text-danger">
                    {fields.title}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel htmlFor="post-body" hint="Plain text for now. You can add up to three images after saving.">
                  Post
                </FieldLabel>
                <textarea
                  id="post-body"
                  name="body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  maxLength={4000}
                  className={textareaClass}
                  aria-invalid={fields.body ? true : undefined}
                  aria-describedby={fields.body ? 'post-body-error' : undefined}
                  placeholder="Tell people what you are building and what you want to learn from them."
                />
                <div className="mt-2 flex items-start justify-between gap-3">
                  {fields.body ? (
                    <p id="post-body-error" role="alert" className="text-sm font-semibold text-danger">
                      {fields.body}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="shrink-0 text-xs tabular-nums text-studio-600">{body.length}/4000</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="post-kind">Post type</FieldLabel>
                  <select
                    id="post-kind"
                    value={kind}
                    onChange={(event) =>
                      setKind(
                        event.target.value === 'validation'
                          ? 'validation'
                          : 'showcase',
                      )
                    }
                    className={inputClass}
                  >
                    <option value="showcase">Showcase</option>
                    <option value="validation">Validation</option>
                  </select>
                </div>

                {kind === 'validation' && (
                  <div>
                    <FieldLabel
                      htmlFor="post-test"
                      hint="Only tests you own can be linked. Testers still need an invitation to take part."
                    >
                      Linked test (optional)
                    </FieldLabel>
                    <select
                      id="post-test"
                      value={testId}
                      onChange={(event) => setTestId(event.target.value)}
                      className={inputClass}
                    >
                      <option value="">No linked test</option>
                      {linkableTests.map((test) => (
                        <option key={test.id} value={test.id}>
                          {test.title || 'Untitled test'} — {test.status}
                        </option>
                      ))}
                    </select>
                    {linkableTests.length === 0 && (
                      <p className="mt-2 text-xs leading-relaxed text-studio-600">
                        You have no validation tests yet.{' '}
                        <Link
                          to="/app/founder/new"
                          className="font-semibold text-brand-700 underline underline-offset-2"
                        >
                          Request validation
                        </Link>{' '}
                        first if you want to link one.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {kind === 'validation' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel
                      htmlFor="post-eligibility"
                      hint="Who should take part? This is public context, not a research finding."
                    >
                      Eligibility (optional)
                    </FieldLabel>
                    <textarea
                      id="post-eligibility"
                      value={eligibility}
                      onChange={(event) => setEligibility(event.target.value)}
                      maxLength={500}
                      rows={3}
                      className={textareaClass}
                      placeholder="e.g. People who have paid for a similar product in the last year"
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="post-closes"
                      hint="Participation closes at the end of this day."
                    >
                      Closing date (optional)
                    </FieldLabel>
                    <input
                      id="post-closes"
                      type="date"
                      value={closesAt}
                      onChange={(event) => setClosesAt(event.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={pending} showArrow>
                {pending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Saving
                  </>
                ) : (
                  'Save draft'
                )}
              </Button>
            </form>
          </Panel>

          <Panel
            title="Your posts"
            description={startup.visibility === 'published'
              ? 'Published posts are visible on your public startup page. Edit them any time, or archive one to take it down.'
              : 'Publish your startup profile to make published posts visible publicly.'}
          >
            {activePosts.length === 0 ? (
              <EmptyState icon={<FileText size={20} aria-hidden="true" />} title="No active posts">
                <p>Your first post can simply introduce the problem and invite people to join the waitlist.</p>
              </EmptyState>
            ) : (
              <ul className="space-y-5">
                {activePosts.map((post) => {
                  const shareUrl = publicBase ? `${publicBase}#post-${post.id}` : null;
                  const isEditing = editing?.id === post.id;
                  const archiveBusy = busyAction === `archive:${post.id}`;
                  const editBusy = busyAction === `edit:${post.id}`;

                  return (
                    <li key={post.id} className="rounded-2xl border border-studio-200 bg-studio-50/60 p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Pill tone={STATUS_TONE[post.status]}>{statusLabel(post.status)}</Pill>
                            <Pill tone="neutral">
                              {post.kind === 'validation' ? 'Validation' : 'Showcase'}
                            </Pill>
                            {post.linkedTest && (
                              <Pill tone="proof">Test linked</Pill>
                            )}
                            {post.moderatedAt && (
                              <Pill tone="negative">Hidden by moderation</Pill>
                            )}
                            <span className="text-xs text-studio-600">
                              {formatDay(post.publishedAt ?? post.createdAt)}
                            </span>
                          </div>
                          {!isEditing && (
                            <h3 className="mt-2 text-[18px] font-bold tracking-[-0.02em] text-ink">{post.title}</h3>
                          )}
                        </div>
                        {!isEditing && (
                          <div className="flex flex-wrap items-center gap-2">
                            {post.status === 'draft' && !post.moderatedAt && (
                              <button
                                type="button"
                                onClick={() => void publish(post.id)}
                                disabled={publishing === post.id}
                                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-brand-500 px-3 text-xs font-bold text-ink hover:bg-brand-600 disabled:opacity-60"
                              >
                                {publishing === post.id ? (
                                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                ) : (
                                  <Send size={14} aria-hidden="true" />
                                )}
                                {publishing === post.id ? 'Publishing' : 'Publish'}
                              </button>
                            )}
                            {!post.moderatedAt && (
                              <button
                                type="button"
                                onClick={() => startEditing(post)}
                                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-studio-300 bg-studio-25 px-3 text-xs font-bold text-ink hover:border-brand-600"
                              >
                                <Pencil size={14} aria-hidden="true" />
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => void changeStatus(post.id, 'archive')}
                              disabled={archiveBusy}
                              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg px-2 text-xs font-bold text-studio-600 hover:bg-studio-100 hover:text-ink disabled:opacity-60"
                            >
                              {archiveBusy ? (
                                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                              ) : (
                                <Archive size={14} aria-hidden="true" />
                              )}
                              {archiveBusy ? 'Archiving' : 'Archive'}
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <form onSubmit={(event) => void saveEdit(event)} noValidate className="mt-4 space-y-4">
                          {editError && (
                            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger">
                              {editError}
                            </p>
                          )}
                          <div>
                            <FieldLabel htmlFor={`edit-title-${post.id}`}>Title</FieldLabel>
                            <input
                              id={`edit-title-${post.id}`}
                              value={editing.title}
                              onChange={(event) =>
                                setEditing((current) => current && { ...current, title: event.target.value })
                              }
                              maxLength={120}
                              className={inputClass}
                              aria-invalid={editFields.title ? true : undefined}
                              aria-describedby={editFields.title ? `edit-title-error-${post.id}` : undefined}
                            />
                            {editFields.title && (
                              <p id={`edit-title-error-${post.id}`} role="alert" className="mt-2 text-sm font-semibold text-danger">
                                {editFields.title}
                              </p>
                            )}
                          </div>
                          <div>
                            <FieldLabel htmlFor={`edit-body-${post.id}`}>Post</FieldLabel>
                            <textarea
                              id={`edit-body-${post.id}`}
                              value={editing.body}
                              onChange={(event) =>
                                setEditing((current) => current && { ...current, body: event.target.value })
                              }
                              maxLength={4000}
                              className={editTextareaClass}
                              aria-invalid={editFields.body ? true : undefined}
                              aria-describedby={editFields.body ? `edit-body-error-${post.id}` : undefined}
                            />
                            <div className="mt-2 flex items-start justify-between gap-3">
                              {editFields.body ? (
                                <p id={`edit-body-error-${post.id}`} role="alert" className="text-sm font-semibold text-danger">
                                  {editFields.body}
                                </p>
                              ) : (
                                <span />
                              )}
                              <span className="shrink-0 text-xs tabular-nums text-studio-600">
                                {editing.body.length}/4000
                              </span>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <FieldLabel htmlFor={`edit-kind-${post.id}`}>Post type</FieldLabel>
                              <select
                                id={`edit-kind-${post.id}`}
                                value={editing.kind}
                                onChange={(event) =>
                                  setEditing((current) =>
                                    current && {
                                      ...current,
                                      kind:
                                        event.target.value === 'validation'
                                          ? 'validation'
                                          : 'showcase',
                                    },
                                  )
                                }
                                className={inputClass}
                              >
                                <option value="showcase">Showcase</option>
                                <option value="validation">Validation</option>
                              </select>
                            </div>
                            {editing.kind === 'validation' && (
                              <div>
                                <FieldLabel
                                  htmlFor={`edit-test-${post.id}`}
                                  hint="Only tests you own can be linked."
                                >
                                  Linked test (optional)
                                </FieldLabel>
                                <select
                                  id={`edit-test-${post.id}`}
                                  value={editing.testId}
                                  onChange={(event) =>
                                    setEditing((current) =>
                                      current && {
                                        ...current,
                                        testId: event.target.value,
                                      },
                                    )
                                  }
                                  className={inputClass}
                                >
                                  <option value="">No linked test</option>
                                  {linkableTests.map((test) => (
                                    <option key={test.id} value={test.id}>
                                      {test.title || 'Untitled test'} — {test.status}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          {editing.kind === 'validation' && (
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <FieldLabel
                                  htmlFor={`edit-eligibility-${post.id}`}
                                  hint="Public context for who should take part."
                                >
                                  Eligibility (optional)
                                </FieldLabel>
                                <textarea
                                  id={`edit-eligibility-${post.id}`}
                                  value={editing.eligibility}
                                  onChange={(event) =>
                                    setEditing((current) =>
                                      current && {
                                        ...current,
                                        eligibility: event.target.value,
                                      },
                                    )
                                  }
                                  maxLength={500}
                                  rows={3}
                                  className={editTextareaClass}
                                />
                              </div>
                              <div>
                                <FieldLabel
                                  htmlFor={`edit-closes-${post.id}`}
                                  hint="Participation closes at the end of this day."
                                >
                                  Closing date (optional)
                                </FieldLabel>
                                <input
                                  id={`edit-closes-${post.id}`}
                                  type="date"
                                  value={editing.closesAt}
                                  onChange={(event) =>
                                    setEditing((current) =>
                                      current && {
                                        ...current,
                                        closesAt: event.target.value,
                                      },
                                    )
                                  }
                                  className={inputClass}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <Button type="submit" disabled={editBusy}>
                              {editBusy ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                                  Saving
                                </>
                              ) : (
                                'Save changes'
                              )}
                            </Button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditing(null);
                                setEditFields({});
                                setEditError(null);
                              }}
                              disabled={editBusy}
                              className="min-h-[44px] rounded-xl px-3 text-sm font-bold text-studio-600 hover:text-ink disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-light-muted">{post.body}</p>
                          {post.linkedTest && (
                            <p className="mt-2 text-xs text-studio-600">
                              Linked test: {post.linkedTest.title || 'Untitled test'}
                              {post.linkedTest.status ? ` · ${post.linkedTest.status}` : ''}
                            </p>
                          )}
                          {post.eligibility && (
                            <p className="mt-1 text-xs text-studio-600">
                              Eligibility: {post.eligibility}
                            </p>
                          )}
                        </>
                      )}

                      {!isEditing && (
                        <div className="mt-4 border-t border-studio-200 pt-4">
                          <PostImageGallery
                            id={`post-images-${post.id}`}
                            images={post.images}
                            onUpload={(file, onProgress) =>
                              uploadPostImage(post.id, file, onProgress)
                            }
                            onRemove={(mediaId) => removePostImage(post.id, mediaId)}
                          />
                        </div>
                      )}

                      {!isEditing && post.status === 'published' && shareUrl && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-studio-200 pt-4">
                          <a
                            href={shareUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-brand-700 underline underline-offset-2"
                          >
                            View public post
                          </a>
                          <CopyLinkButton url={shareUrl} label="Copy post link" />
                        </div>
                      )}
                      {!isEditing && post.status === 'published' && !shareUrl && (
                        <p className="mt-4 border-t border-studio-200 pt-4 text-xs text-light-muted">
                          This post is published, but your startup profile is a draft, so the public link is not live yet.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {archivedPosts.length > 0 && (
            <Panel
              title="Archived posts"
              description="Archived posts are hidden from your public profile. Restore one as a draft whenever you want to work on it again."
            >
              <ul className="space-y-4">
                {archivedPosts.map((post) => {
                  const restoreBusy = busyAction === `restore:${post.id}`;
                  return (
                    <li key={post.id} className="rounded-2xl border border-studio-200 bg-studio-50/60 p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Pill tone={STATUS_TONE.archived}>{statusLabel(post.status)}</Pill>
                          <h3 className="mt-2 text-[17px] font-bold tracking-[-0.02em] text-ink">{post.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-light-muted">{post.body}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void changeStatus(post.id, 'restore')}
                          disabled={restoreBusy}
                          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-studio-300 bg-studio-25 px-3 text-xs font-bold text-ink hover:border-brand-600 disabled:opacity-60"
                        >
                          {restoreBusy ? (
                            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <RotateCcw size={14} aria-hidden="true" />
                          )}
                          {restoreBusy ? 'Restoring' : 'Restore as draft'}
                        </button>
                      </div>
                      {post.images.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.images.map((image, index) => (
                            <AuthedImage
                              key={image.id}
                              src={image.url}
                              alt={image.altText ?? `Image ${index + 1} for ${post.title}`}
                              className="h-20 w-28 rounded-lg border border-studio-200 object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
