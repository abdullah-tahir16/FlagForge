import { Form as FinalForm, Field } from "react-final-form";
import { Link } from "react-router-dom";
import type { AuthField } from "../../hooks/Auth/useAuthFormFeature";
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
  title,
  validate
}: Props) => (
  <main className="min-h-dvh bg-app-background text-app-text lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
    <section className="hidden min-h-dvh bg-app-brand px-10 py-10 text-app-on-brand lg:flex">
      <div className="mx-auto flex w-full max-w-xl flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-app-accent">FlagForge</p>
          <h1 className="mt-6 max-w-lg text-5xl font-semibold leading-tight tracking-normal">
            Control releases before they control you.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-app-on-brand/75">
            Manage feature flags, environments, gradual rollouts, and audit history from one operational workspace.
          </p>
        </div>

        <div className="grid gap-4 border-t border-app-on-brand/15 pt-8">
          {authHighlights.map((highlight, index) => (
            <div className="flex items-center justify-between border-b border-app-on-brand/10 pb-4" key={highlight}>
              <span className="text-sm font-medium text-app-on-brand/80">{highlight}</span>
              <span
                className={
                  index === 2 ? "h-2 w-20 rounded-full bg-app-accent" : "h-2 w-20 rounded-full bg-app-on-brand/20"
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="flex min-h-dvh items-center justify-center px-5 py-8 sm:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6 lg:hidden">
          <p className="text-sm font-semibold text-app-primary">FlagForge</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-app-text">Feature flag control</h1>
        </div>

        <Panel className="p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-app-primary">FlagForge</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-app-text">{title}</h2>
            <p className="mt-3 rounded-app border border-app-primary/15 bg-app-primary-muted px-3 py-2 text-sm font-medium text-app-text">
              Demo: {demoCredentials.email} / {demoCredentials.password}
            </p>
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
                  {isSubmitting || submitting ? "Please wait" : submitLabel}
                </Button>
              </Form>
            )}
            validate={validate}
          />

          <Link
            className="mt-5 block text-sm font-semibold text-app-primary hover:text-app-primary-hover"
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
