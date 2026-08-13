import type { PropsWithChildren } from "react";
import type { LucideIcon } from "lucide-react";
import { FolderKanban, Layers, LayoutDashboard, LogOut, ScrollText, ToggleLeft, UsersRound } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import Button from "../Common/Button";
import StatusBadge from "../Common/StatusBadge";

interface Props extends PropsWithChildren {
  apiStatus: string;
  isCheckingApi: boolean;
  onLogout: () => void;
  organizationName: string;
  userName: string;
}

interface NavItem {
  activeWhen?: (pathname: string) => boolean;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  to: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview", to: "/" },
  { activeWhen: (pathname) => pathname === "/projects" || /^\/projects\/[^/]+$/.test(pathname), icon: FolderKanban, label: "Projects", to: "/projects" },
  { activeWhen: (pathname) => pathname === "/flags" || pathname.includes("/flags"), icon: ToggleLeft, label: "Flags", to: "/flags" },
  { activeWhen: (pathname) => pathname === "/segments" || pathname.includes("/segments"), icon: UsersRound, label: "Segments", to: "/segments" },
  { disabled: true, icon: Layers, label: "Environments", to: "/environments" },
  { activeWhen: (pathname) => pathname === "/audit", icon: ScrollText, label: "Audit", to: "/audit" }
];

const AppShell = ({ apiStatus, isCheckingApi, children, onLogout, organizationName, userName }: Props) => {
  const location = useLocation();
  const statusLabel = isCheckingApi ? "checking" : apiStatus;

  return (
    <main className="min-h-screen bg-app-background text-app-text lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-app-sidebar-border bg-app-sidebar text-app-on-brand lg:block">
        <div className="flex h-full flex-col px-4 py-5">
          <div className="px-2">
            <p className="text-lg font-semibold tracking-normal">FlagForge</p>
            <p className="mt-1 truncate text-sm text-app-sidebar-muted">{organizationName}</p>
          </div>
          <nav aria-label="Primary" className="mt-8 grid gap-1 text-sm font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;

              if (item.disabled) {
                return (
                  <span
                    aria-disabled="true"
                    className="inline-flex min-h-11 cursor-not-allowed items-center gap-3 rounded-app px-3 py-2.5 text-app-sidebar-muted/70"
                    key={item.label}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                );
              }

              return (
                <NavLink
                  className={({ isActive }) => {
                    const itemIsActive = item.activeWhen ? item.activeWhen(location.pathname) : isActive;

                    return `inline-flex min-h-11 items-center gap-3 rounded-app border-l-4 px-3 py-2.5 transition duration-app ${
                      itemIsActive
                        ? "border-app-accent bg-app-sidebar-active font-bold text-app-sidebar-active-text"
                        : "border-transparent text-app-on-brand hover:bg-app-brand-muted"
                    }`;
                  }}
                  end={item.to === "/"}
                  key={item.label}
                  to={item.to}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-auto rounded-app border border-app-sidebar-border bg-app-brand-muted px-3 py-3">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <div className="mt-2">
              <StatusBadge label={statusLabel} />
            </div>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="border-b border-app-border bg-app-topbar">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0 lg:hidden">
                <p className="text-base font-semibold tracking-normal">FlagForge</p>
                <p className="truncate text-sm text-app-text-muted">{organizationName}</p>
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="text-sm font-semibold text-app-text">Workspace</p>
                <p className="truncate text-sm text-app-text-muted">{organizationName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 lg:hidden">
                <StatusBadge label={statusLabel} />
                <Button aria-label="Log out" onClick={onLogout} title="Log out" type="button" variant="secondary">
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <nav aria-label="Mobile primary" className="grid grid-cols-2 gap-2 text-sm font-semibold sm:grid-cols-3 md:grid-cols-6 lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <span
                      aria-disabled="true"
                      className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-app border border-app-border bg-app-surface-muted px-2.5 py-2 text-app-text-muted/70"
                      key={item.label}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                  );
                }

                return (
                  <NavLink
                    className={({ isActive }) => {
                      const itemIsActive = item.activeWhen ? item.activeWhen(location.pathname) : isActive;

                      return `inline-flex min-h-11 items-center justify-center gap-2 rounded-app border px-2.5 py-2 transition duration-app ${
                        itemIsActive
                          ? "border-app-primary bg-app-primary-muted font-bold text-app-primary"
                          : "border-app-border bg-app-surface text-app-text hover:bg-app-surface-muted"
                      }`;
                    }}
                    end={item.to === "/"}
                    key={item.label}
                    to={item.to}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="hidden items-center gap-4 lg:flex">
              <div className="text-right">
                <p className="text-sm font-medium text-app-text">{userName}</p>
                <StatusBadge label={statusLabel} />
              </div>
              <Button onClick={onLogout} type="button" variant="secondary">
                <span className="inline-flex items-center gap-2">
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                  Log out
                </span>
              </Button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 lg:px-6">{children}</div>
      </section>
    </main>
  );
};

export default AppShell;
