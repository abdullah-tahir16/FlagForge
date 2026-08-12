import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  apiStatus: string;
  isCheckingApi: boolean;
}

const AppShell = ({ apiStatus, isCheckingApi, children }: Props) => {
  const statusLabel = isCheckingApi ? "checking" : apiStatus;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-lg font-semibold">FlagForge</p>
            <p className="text-sm text-slate-500">Dashboard</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="capitalize text-slate-600">{statusLabel}</span>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
};

export default AppShell;
