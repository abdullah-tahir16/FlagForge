import { Form as FinalForm, Field } from "react-final-form";
import { KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { AuthField } from "../../hooks/Auth/useAuthFormFeature";
import Alert from "../Common/Alert";
import Badge from "../Common/Badge";
import Button from "../Common/Button";
import Form from "../Common/Form";
import Panel from "../Common/Panel";
import TextInput from "../Common/TextInput";
import { authHighlights, demoCredentials } from "./consts";

interface Props {
  alternateHref: string;
  alternateLabel: string;
  errorMessage: string | null;
  fields: AuthField[];
  initialValues: Record<string, string>;
  isSubmitting: boolean;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  submitLabel: string;
  submittingLabel: string;
  title: string;
  validate: (values: Record<string, string>) => Partial<Record<string, string>>;
}

const AuthForm = ({
  alternateHref,
  alternateLabel,
  errorMessage,
  fields,
  initialValues,
  isSubmitting,
  onSubmit,
  submitLabel,
  submittingLabel,
  title,
  validate
}: Props) => (
  <main className="min-h-dvh bg-app-background text-app-text lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
    <section className="hidden min-h-dvh bg-app-brand px-10 py-10 text-app-on-brand lg:flex">
      <div className="mx-auto flex w-full max-w-xl flex-col justify-between">
        <div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-app border border-app-on-brand/15 bg-app-on-brand/10 text-app-accent">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-semibold text-app-accent">FlagForge</p>
          <h1 className="mt-5 max-w-lg text-5xl font-semibold leading-tight tracking-normal">
            Control releases before they control you.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-app-on-brand/75">
            Manage feature flags, environments, gradual rollouts, and audit history from one operational workspace.
          </p>
        </div>

        <div className="grid gap-2 border-t border-app-on-brand/15 pt-8">
          {authHighlights.map((highlight) => (
            <p className="text-sm font-medium text-app-on-brand/80" key={highlight}>
              {highlight}
            </p>
          ))}
        </div>
      </div>
    </section>

    <section className="flex min-h-dvh items-center justify-center px-5 py-8 sm:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6 lg:hidden">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-app border border-app-border bg-app-primary-muted text-app-primary">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-app-primary">FlagForge</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-app-text">Feature flag control</h1>
        </div>

        <Panel className="p-6 shadow-app sm:p-8">
          <div className="mb-6">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="primary">Local organization</Badge>
              <Badge tone="info">httpOnly refresh</Badge>
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-app-text">{title}</h2>
          </div>

          <FinalForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            render={({ handleSubmit, submitting }) => (
              <Form errorMessage={errorMessage} onSubmit={handleSubmit}>
                {fields.map((field) => (
                  <Field<string> key={field.name} name={field.name}>
                    {({ input, meta }) => (
                      <TextInput
                        {...input}
                        autoComplete={field.autoComplete}
                        error={meta.touched && meta.error ? meta.error : undefined}
                        label={field.label}
                        type={field.type}
                      />
                    )}
                  </Field>
                ))}

                <Button className="mt-2 w-full" disabled={isSubmitting || submitting} type="submit">
                  <span className="inline-flex items-center justify-center gap-2">
                    {isSubmitting || submitting ? (
                      <Sparkles aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <KeyRound aria-hidden="true" className="h-4 w-4" />
                    )}
                    {isSubmitting || submitting ? submittingLabel : submitLabel}
                  </span>
                </Button>
              </Form>
            )}
            validate={validate}
          />

          {import.meta.env.VITE_SHOW_DEMO_CREDENTIALS === "true" ? (
            <div className="mt-5">
              <Alert tone="info" title="Local demo">
                {demoCredentials.email} / {demoCredentials.password}
              </Alert>
            </div>
          ) : null}

          <Link
            className="mt-5 block text-sm font-semibold text-app-primary hover:text-app-primary-hover focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
            to={alternateHref}
          >
            {alternateLabel}
          </Link>
        </Panel>
      </div>
    </section>
  </main>
);

export default AuthForm;
