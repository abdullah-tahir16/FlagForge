import { Field, Form as FinalForm } from "react-final-form";
import type { Environment } from "../../../../core/types/Environment";
import Button from "../../Common/Button";
import Form from "../../Common/Form";
import TextInput from "../../Common/TextInput";

interface Props {
  environments: Environment[];
  errorMessage?: string | null;
  isSubmitting: boolean;
  onSubmit: (environmentId: string, values: Record<string, string>) => Promise<void>;
  updatingEnvironmentId?: string;
  validate: (values: Record<string, string>) => Partial<Record<string, string>>;
}

const EnvironmentList = ({ environments, errorMessage, isSubmitting, onSubmit, updatingEnvironmentId, validate }: Props) => (
  <div className="grid gap-3">
    {errorMessage ? (
      <p className="rounded-app border border-app-danger/20 bg-app-danger-muted px-3 py-2.5 text-sm font-medium text-app-danger">
        {errorMessage}
      </p>
    ) : null}
    {environments.map((environment) => (
      <div
        className="grid gap-3 rounded-app border border-app-border bg-app-surface-muted p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
        key={environment.id}
      >
        <FinalForm
          initialValues={{ name: environment.name }}
          onSubmit={(values) => onSubmit(environment.id, values)}
          render={({ handleSubmit, submitting }) => (
            <Form onSubmit={handleSubmit}>
              <Field<string> name="name">
                {({ input, meta }) => (
                  <TextInput
                    {...input}
                    autoComplete="off"
                    error={meta.touched && meta.error ? meta.error : undefined}
                    label={`${environment.key} environment`}
                  />
                )}
              </Field>
              <Button
                className="w-fit"
                disabled={isSubmitting || submitting || updatingEnvironmentId === environment.id}
                type="submit"
                variant="secondary"
              >
                {updatingEnvironmentId === environment.id ? "Saving" : "Save"}
              </Button>
            </Form>
          )}
          validate={validate}
        />
      </div>
    ))}
  </div>
);

export default EnvironmentList;
