import { Link } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { useSession } from "@/auth/session";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApi, useApiClient } from "@/hooks/useApi";
import type { NotificationItem } from "@/lib/dashboard-types";
import {
  EmptyState,
  ErrorPanel,
  Loading,
  PageHeading,
  Panel,
} from "@/pages/app/Ui";

export default function Notifications() {
  const request = useApiClient();
  const { refresh: refreshSession } = useSession();
  const { data, loading, error, refresh } =
    useApi<NotificationItem[]>("/api/notifications");

  usePageMeta({ title: "Notifications | RAPID", noindex: true });

  const markRead = async (id: string) => {
    await request(`/api/notifications/${id}/read`, { method: "POST" });
    await Promise.all([refresh(), refreshSession()]);
  };

  const unread = data?.filter((item) => !item.read_at).length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Your account"
        title="Notifications"
        description={
          unread
            ? `${unread} unread update${unread === 1 ? "" : "s"}.`
            : "Updates about your application, invitations, audience and tests appear here."
        }
      />

      {loading && !data && <Loading label="Loading notifications…" />}
      {error && <ErrorPanel message={error} onRetry={() => void refresh()} />}

      {data && (
        <Panel>
          {data.length === 0 ? (
            <EmptyState
              icon={<Bell size={20} aria-hidden="true" />}
              title="Nothing yet"
            >
              <p>
                When the team reviews your application, sends an invitation,
                publishes findings or marks a reward, you’ll see it here. Founders
                also see new followers, feedback, waitlist sign-ups and
                moderation notices.
              </p>
            </EmptyState>
          ) : (
            <ul className="rows divide-y divide-cream-200">
              {data.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-4 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!item.read_at && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-sun-500"
                          role="img"
                          aria-label="Unread"
                        />
                      )}
                      <p className="font-semibold text-ink">{item.title}</p>
                    </div>
                    <p className="mt-1 max-w-[65ch] text-sm text-ink-soft">
                      {item.body}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.href && (
                      <Link
                        to={item.href}
                        className="inline-flex min-h-[36px] items-center rounded-full bg-cream-100 px-3 text-xs font-semibold text-ink hover:bg-cream-200"
                      >
                        Open
                      </Link>
                    )}
                    {!item.read_at && (
                      <button
                        type="button"
                        onClick={() => void markRead(item.id)}
                        className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-cream-300 px-3 text-xs font-semibold text-ink hover:border-rapid-600"
                      >
                        <Check size={14} aria-hidden="true" />
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
