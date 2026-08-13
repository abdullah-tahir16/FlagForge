import { Field, Form as FinalForm } from "react-final-form";
import { KeyRound } from "lucide-react";
import type { Environment } from "../../../../core/types/Environment";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import Button from "../../Common/Button";
import DataList from "../../Common/DataList";
import DataRow from "../../Common/DataRow";
import Form from "../../Common/Form";
import TextInput from "../../Common/TextInput";

interface Props {
  environments: Environment[];
  errorMessage?: string | null;
  isSubmitting: boolean;
  onManageSdkKeys: (environmentId: string) => void;
  onSubmit: (environmentId: string, values: Record<string, string>) => Promise<void>;
  selectedSdkKeyEnvironmentId?: string;
  updatingEnvironmentId?: string;
  validate: (values: Record<string, string>) => Partial<Record<string, string>>;
}

const EnvironmentList = ({
  environments,
  errorMessage,
  isSubmitting,
  onManageSdkKeys,
  onSubmit,
  selectedSdkKeyEnvironmentId,
  updatingEnvironmentId,
  validate
}: Props) => (
  <div className="grid gap-3">
    {errorMessage ? (
      <Alert tone="danger" title="Environment could not be saved">
        {errorMessage}
      </Alert>
    ) : null}
    <DataList>
      {environments.map((environment) => (
        <FinalForm
          initialValues={{ name: environment.name }}
          key={environment.id}
          onSubmit={(values) => onSubmit(environment.id, values)}
          render={({ handleSubmit, submitting }) => (
            <DataRow
              actions={
                <>
                  <Button
                    className="w-full sm:w-fit"
                    onClick={() => onManageSdkKeys(environment.id)}
                    type="button"
                    variant={selectedSdkKeyEnvironmentId === environment.id ? "primary" : "secondary"}
                  >
                    <span className="inline-flex items-center gap-2">
                      <KeyRound aria-hidden="true" className="h-4 w-4" />
                      SDK keys
                    </span>
                  </Button>
                  <Button
                    className="w-full sm:w-fit"
                    disabled={isSubmitting || submitting || updatingEnvironmentId === environment.id}
                    form={`environment-${environment.id}`}
                    type="submit"
                    variant="secondary"
                  >
                    {updatingEnvironmentId === environment.id ? "Saving" : "Save"}
                  </Button>
                </>
              }
              className={selectedSdkKeyEnvironmentId === environment.id ? "border-l-4 border-l-app-primary bg-app-primary-muted" : ""}
            >
              <Form
                className="grid gap-2 md:grid-cols-[140px_minmax(0,1fr)] md:items-start"
                id={`environment-${environment.id}`}
                onSubmit={handleSubmit}
              >
                <div className="pt-1">
                  <Badge>{environment.key}</Badge>
                </div>
                <Field<string> name="name">
                  {({ input, meta }) => (
                    <TextInput
                      {...input}
                      autoComplete="off"
                      error={meta.touched && meta.error ? meta.error : undefined}
                      label="Environment name"
                    />
                  )}
                </Field>
              </Form>
            </DataRow>
          )}
          validate={validate}
        />
      ))}
    </DataList>
  </div>
);

export default EnvironmentList;
