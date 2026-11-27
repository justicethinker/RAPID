import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  PenLine,
  Rocket,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
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

function NavRow({ item, horizontal = false }: { item: NavItem; horizontal?: boolean }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          // `relative` keeps the absolutely positioned active mark inside the
          // link, so it cannot escape the mobile scroll strip.
          "group relative flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all duration-200",
          horizontal ? "whitespace-nowrap" : "hover:translate-x-0.5",
          isActive
            ? "bg-rapid-50 text-rapid-700"
            : "text-ink-soft hover:bg-cream-50 hover:text-ink",
          !horizontal &&
            isActive &&
            "before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-sun-500",
        )
      }
    >
      <Icon
        size={17}
        strokeWidth={2}
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:scale-110"
      />
      {item.label}
      {item.badge ? (
        <span className="pop-in ml-auto rounded-full bg-sun-500 px-2 py-0.5 text-[11px] font-bold text-ink">
          {item.badge > 9 ? "9+" : item.badge}
          <span className="sr-only"> unread</span>
        </span>
      ) : null}
    </NavLink>
  );
}

function NavItems({ horizontal = false }: { horizontal?: boolean }) {
  const groups = useNavGroups();

  if (horizontal) {
    return (
      <nav aria-label="Account" className="flex gap-1">
        {groups.flatMap((group) =>
          group.items.map((item) => (
            <NavRow key={item.to} item={item} horizontal />
          )),
        )}
      </nav>
    );
  }

  return (
    <nav aria-label="Account" className="mt-5 space-y-5">
      {groups.map((group) => {
        const labelId = `nav-${group.label.toLowerCase().replace(/\s+/g, "-")}`;
        return (
          <div key={group.label}>
            <p
              id={labelId}
              className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint"
            >
              {group.label}
            </p>
            <div role="group" aria-labelledby={labelId} className="mt-1 space-y-1">
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

function UserBlock() {
  const { me, signOut } = useSession();
  const navigate = useNavigate();

  const onSignOut = async () => {
    await signOut();
    navigate("/sign-in", { replace: true });
  };

  const name = me?.person.fullName || "Your account";
  const initial = (name.trim().charAt(0) || "R").toUpperCase();

  return (
    <div className="mt-8 border-t border-cream-200 pt-5">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rapid-50 text-sm font-bold text-rapid-700"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="truncate text-xs text-ink-soft">{me?.person.email}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <Link
          to="/"
          className="inline-flex min-h-[40px] items-center gap-1 rounded-full px-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-cream-50 hover:text-ink"
        >
          Public site
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
        <span aria-hidden="true" className="text-cream-300">
          /
        </span>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-cream-50 hover:text-ink"
        >
          <LogOut size={14} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { me, signOut } = useSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onSignOut = async () => {
    await signOut();
    navigate("/sign-in", { replace: true });
  };

  return (
    <div className="dashboard-shell relative flex min-h-screen overflow-x-clip bg-cream-50">
      <SkipLink />
      <span
        aria-hidden="true"
        className="pointer-events-none fixed -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-rapid-200/[0.24] blur-3xl drift-slower breathe"
      />
      <aside className="dashboard-sidebar sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col justify-between overflow-y-auto overscroll-contain border-r border-cream-200 bg-white px-5 py-6 lg:flex">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-sun-500"
        />
        <div>
          <Link to="/app" aria-label="RAPID account home" className="text-ink">
            <Logo size={26} />
          </Link>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-faint">
            Your RAPID space
          </p>
          <NavItems />
        </div>
        <UserBlock />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="dashboard-mobile-header sticky top-0 z-40 border-b border-cream-200 bg-white/[0.97] backdrop-blur-md lg:hidden">
          <span aria-hidden="true" className="block h-[3px] bg-sun-500" />
          <div className="flex h-[60px] items-center justify-between gap-3 px-5">
            <Link to="/app" aria-label="RAPID account home" className="text-ink">
              <Logo size={24} />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center text-sm font-semibold text-ink-soft hover:text-ink"
              >
                Public site
              </Link>
              <button
                type="button"
                onClick={() => void onSignOut()}
                aria-label="Sign out"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-soft hover:bg-cream-50 hover:text-ink"
              >
                <LogOut size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto border-t border-cream-200/70 px-3 pb-2 pt-1">
            <NavItems horizontal />
          </div>
        </header>

        <main id="main" className="flex-1">
          <div
            key={pathname}
            className="page-enter mx-auto w-full max-w-[1040px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10"
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
    </div>
  );
}
