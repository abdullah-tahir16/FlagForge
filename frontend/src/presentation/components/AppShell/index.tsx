import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import Button from "../Common/Button";
import StatusBadge from "../Common/StatusBadge";

interface Props extends PropsWithChildren {
  apiStatus: string;
  isCheckingApi: boolean;
  onLogout: () => void;
  organizationName: string;
  userName: string;
}

const AppShell = ({ apiStatus, isCheckingApi, children, onLogout, organizationName, userName }: Props) => {
  const statusLabel = isCheckingApi ? "checking" : apiStatus;

  return (
    <main className="min-h-screen bg-app-background text-app-text">
      <header className="border-b border-app-border bg-app-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
            <div>
              <p className="text-lg font-semibold">FlagForge</p>
              <p className="text-sm text-app-text-muted">{organizationName}</p>
            </div>
            <nav className="flex flex-wrap gap-2 text-sm font-semibold">
              <NavLink
                className={({ isActive }) =>
                  `rounded-app px-3 py-2 transition ${
                    isActive ? "bg-app-primary-muted text-app-primary" : "text-app-text-muted hover:bg-app-surface-muted"
                  }`
                }
                end
                to="/"
              >
                Overview
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `rounded-app px-3 py-2 transition ${
                    isActive ? "bg-app-primary-muted text-app-primary" : "text-app-text-muted hover:bg-app-surface-muted"
                  }`
                }
                to="/projects"
              >
                Projects
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden text-right sm:block">
              <p className="font-medium text-app-text">{userName}</p>
              <StatusBadge label={statusLabel} />
            </div>
            <Button onClick={onLogout} type="button" variant="secondary">
              Log out
            </Button>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
};

export default AppShell;
