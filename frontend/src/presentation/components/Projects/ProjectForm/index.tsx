import { Field, Form as FinalForm } from "react-final-form";
import Button from "../../Common/Button";
import Form from "../../Common/Form";
import TextArea from "../../Common/TextArea";
import TextInput from "../../Common/TextInput";

interface Props {
  errorMessage?: string | null;
  initialValues: Record<string, string>;
  isSubmitting: boolean;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  submitLabel: string;
  validate: (values: Record<string, string>) => Partial<Record<string, string>>;
}

const ProjectForm = ({ errorMessage, initialValues, isSubmitting, onSubmit, submitLabel, validate }: Props) => (
  <FinalForm
    initialValues={initialValues}
    onSubmit={onSubmit}
    render={({ handleSubmit, submitting }) => (
      <Form errorMessage={errorMessage} onSubmit={handleSubmit}>
        <Field<string> name="name">
          {({ input, meta }) => (
            <TextInput
              {...input}
              autoComplete="off"
              error={meta.touched && meta.error ? meta.error : undefined}
              label="Project name"
            />
          )}
        </Field>
        <Field<string> name="description">
          {({ input, meta }) => (
            <TextArea
              {...input}
              error={meta.touched && meta.error ? meta.error : undefined}
              label="Description"
            />
          )}
        </Field>
        <Button className="w-fit" disabled={isSubmitting || submitting} type="submit">
          {isSubmitting || submitting ? "Saving" : submitLabel}
        </Button>
      </Form>
    )}
    validate={validate}
  />
);

export default ProjectForm;
