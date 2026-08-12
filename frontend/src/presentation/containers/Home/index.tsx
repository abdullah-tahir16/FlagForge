import AppShell from "../../components/AppShell";
import { useHomeFeature } from "../../hooks/Home/useHomeFeature";

interface Props {}

const HomeContainer = (_props: Props) => {
  const { apiStatus, isCheckingApi, sections, title } = useHomeFeature();

  return (
    <AppShell apiStatus={apiStatus} isCheckingApi={isCheckingApi}>
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">{title}</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Manage projects, environments, feature flags, and audit history from one workspace.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <article key={section} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-medium text-slate-950">{section}</h2>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-1/3 rounded-full bg-forge-500" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
};

export default HomeContainer;
