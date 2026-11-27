import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Bell,
  ClipboardList,
  Compass,
  FlaskConical,
  History,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  PenLine,
  Rocket,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SkipLink } from "@/components/layout/SkipLink";
import { useSession } from "@/auth/session";
import { cn } from "@/lib/cn";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function useNavGroups(): NavGroup[] {
  const { me } = useSession();
  const roles = me
    ? (["tester", "founder", "staff"] as const).filter((role) => me.roles[role])
    : [];

  const groups: NavGroup[] = [];

  // With one role the role page is the overview; the chooser only earns a link
  // when there is more than one place to go.
  if (roles.length > 1) {
    groups.push({
      label: "Workspace",
      items: [{ to: "/app", label: "Overview", icon: LayoutDashboard, end: true }],
    });
  }

  if (me?.roles.tester) {
    groups.push({
      label: "Tester",
      items: [
        { to: "/app/tester", label: "Overview", icon: Users, end: true },
        { to: "/app/tester/invitations", label: "Invitations", icon: Inbox },
        { to: "/app/tester/history", label: "History", icon: History },
        { to: "/app/tester/profile", label: "Profile", icon: UserRound },
      ],
    });
  }

  if (me?.roles.founder) {
    groups.push({
      label: "Founder",
      items: [
        { to: "/app/founder", label: "Overview", icon: Rocket, end: true },
        { to: "/app/founder/startup", label: "My startup", icon: LayoutDashboard },
        { to: "/app/founder/posts", label: "Posts", icon: PenLine },
        { to: "/app/founder/audience", label: "Audience", icon: Users },
      ],
    });
  }

  if (me?.roles.staff) {
    groups.push({
      label: "Staff",
      items: [
        { to: "/staff", label: "Staff dashboard", icon: ShieldCheck, end: true },
        { to: "/staff/applications", label: "Applications", icon: ClipboardList },
        { to: "/staff/tests", label: "Tests", icon: FlaskConical },
        { to: "/staff/moderation", label: "Moderation", icon: ShieldCheck },
        { to: "/staff/team", label: "Admins", icon: UserCog },
      ],
    });
  }

  if (me) {
    groups.push({
      label: "Explore",
      items: [{ to: "/discover", label: "Discover", icon: Compass }],
    });
    groups.push({
      label: "Account",
      items: [
        {
          to: "/app/notifications",
          label: "Notifications",
          icon: Bell,
          badge: me.unreadNotifications,
        },
      ],
    });
  }

  return groups;
}

function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "group relative flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors duration-200",
          isActive
            ? "bg-white/[0.1] text-white"
            : "text-rapid-100 hover:bg-white/[0.06] hover:text-white",
          isActive &&
            "before:absolute before:-left-5 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-sun-500",
        )
      }
    >
      <Icon size={17} strokeWidth={2} aria-hidden="true" className="shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.badge ? (
        <span className="pop-in ml-auto rounded-full bg-sun-500 px-2 py-0.5 text-[11px] font-bold text-ink">
          {item.badge > 9 ? "9+" : item.badge}
          <span className="sr-only"> unread</span>
        </span>
      ) : null}
    </NavLink>
  );
}

function NavGroups({ groups }: { groups: NavGroup[] }) {
  return (
    <nav aria-label="Account" className="mt-8 space-y-6">
      {groups.map((group) => {
        const labelId = `nav-${group.label.toLowerCase().replace(/\s+/g, "-")}`;
        return (
          <div key={group.label}>
            <p id={labelId} className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-rapid-300">
              {group.label}
            </p>
            <div role="group" aria-labelledby={labelId} className="mt-2 space-y-0.5">
              {group.items.map((item) => (
                <NavRow key={item.to} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function initialOf(name: string): string {
  return (name.trim().charAt(0) || "R").toUpperCase();
}

function UserBlock({ onSignOut }: { onSignOut: () => void }) {
  const { me } = useSession();
  const name = me?.person.fullName || "Your account";

  return (
    <div className="mt-8 rounded-2xl bg-white/[0.06] p-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sun-500 font-display text-sm font-bold text-ink"
        >
          {initialOf(name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-rapid-200">{me?.person.email}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 border-t border-white/10 pt-2">
        <Link
          to="/"
          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2 text-xs font-semibold text-rapid-100 transition-colors hover:bg-white/10 hover:text-white"
        >
          Public site
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="ml-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-rapid-100 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={14} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}

/** The group a mobile bottom bar should feature for the current page. */
function primaryGroup(groups: NavGroup[], pathname: string): NavGroup | undefined {
  const byLabel = (label: string) => groups.find((group) => group.label === label);
  if (pathname.startsWith("/staff")) return byLabel("Staff");
  if (pathname.startsWith("/app/founder")) return byLabel("Founder");
  if (pathname.startsWith("/app/tester")) return byLabel("Tester");
  return byLabel("Tester") ?? byLabel("Founder") ?? byLabel("Staff") ?? groups[0];
}

const SHORT_LABEL: Record<string, string> = {
  "Staff dashboard": "Dashboard",
  "My startup": "Startup",
};

function BottomBar({ groups, onMore }: { groups: NavGroup[]; onMore: () => void }) {
  const { pathname } = useLocation();
  const group = primaryGroup(groups, pathname);
  const items = (group?.items ?? []).slice(0, 4);

  return (
    <nav
      aria-label="Account"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-[560px] grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const short = SHORT_LABEL[item.label];
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "relative flex min-h-[62px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition-colors",
                  isActive ? "text-rapid-800" : "text-ink-faint hover:text-ink",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                      isActive ? "bg-rapid-50" : "bg-transparent",
                    )}
                  >
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  {short ? (
                    <span className="max-w-full truncate">
                      <span className="sr-only">{item.label}</span>
                      <span aria-hidden="true">{short}</span>
                    </span>
                  ) : (
                    <span className="max-w-full truncate">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-[11px] font-semibold text-ink-faint hover:text-ink"
        >
          <span className="flex h-8 w-12 items-center justify-center rounded-full">
            <Menu size={19} aria-hidden="true" />
          </span>
          More
        </button>
      </div>
    </nav>
  );
}

function Sidebar({ groups, onSignOut }: { groups: NavGroup[]; onSignOut: () => void }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <Link to="/app" aria-label="RAPID account home" className="inline-block text-white">
          <Logo size={26} />
        </Link>
        <NavGroups groups={groups} />
      </div>
      <UserBlock onSignOut={onSignOut} />
    </div>
  );
}

export default function AppLayout() {
  const { me, signOut } = useSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const groups = useNavGroups();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => setDrawer(false), [pathname]);

  const onSignOut = async () => {
    await signOut();
    navigate("/sign-in", { replace: true });
  };

  return (
    <div className="dashboard-shell relative flex min-h-screen bg-cream-50">
      <SkipLink />
      <aside className="on-dark sticky top-0 hidden h-screen w-[264px] shrink-0 overflow-y-auto overscroll-contain bg-rapid-950 px-5 py-6 lg:block">
        <Sidebar groups={groups} onSignOut={() => void onSignOut()} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50/90 backdrop-blur-xl lg:hidden">
          <div className="flex h-[60px] items-center justify-between gap-3 px-5">
            <Link to="/app" aria-label="RAPID account home" className="text-ink">
              <Logo size={24} />
            </Link>
            <Link
              to="/app/notifications"
              aria-label={
                me?.unreadNotifications
                  ? `Notifications, ${me.unreadNotifications} unread`
                  : "Notifications"
              }
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-white hover:text-ink"
            >
              <Bell size={19} aria-hidden="true" />
              {me?.unreadNotifications ? (
                <span aria-hidden="true" className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-cream-50 bg-sun-500" />
              ) : null}
            </Link>
          </div>
        </header>

        <main id="main" className="flex-1 pb-24 lg:pb-0">
          <div
            key={pathname}
            className="page-enter mx-auto w-full max-w-[1120px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
          >
            {me?.unreadNotifications ? (
              <p className="sr-only">
                {me.unreadNotifications} unread notification
                {me.unreadNotifications === 1 ? "" : "s"}
              </p>
            ) : null}
            <Outlet />
          </div>
        </main>
      </div>

      <BottomBar groups={groups} onMore={() => setDrawer(true)} />

      <Dialog.Root open={drawer} onOpenChange={setDrawer}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-rapid-950/50 backdrop-blur-sm lg:hidden" />
          <Dialog.Content className="on-dark fixed inset-y-0 left-0 z-[70] w-[86%] max-w-[320px] overflow-y-auto bg-rapid-950 px-5 py-6 focus:outline-none data-[state=open]:animate-[rapidFadeIn_.25s_ease] lg:hidden">
            <Dialog.Title className="sr-only">Account menu</Dialog.Title>
            <Dialog.Description className="sr-only">Every page in your account</Dialog.Description>
            <Dialog.Close
              aria-label="Close menu"
              className="absolute right-4 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-rapid-100 hover:bg-white/10 hover:text-white"
            >
              <X size={18} aria-hidden="true" />
            </Dialog.Close>
            <Sidebar groups={groups} onSignOut={() => void onSignOut()} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
