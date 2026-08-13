import type { FormEvent } from "react";
import { Field, Form as FinalForm } from "react-final-form";
import { Clipboard, KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import type { Environment } from "../../../../core/types/Environment";
import type { CreatedSdkKey, SdkKey } from "../../../../core/types/SdkKey";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import Button from "../../Common/Button";
import ConfirmDialog from "../../Common/ConfirmDialog";
import DataList from "../../Common/DataList";
import DataRow from "../../Common/DataRow";
import EmptyState from "../../Common/EmptyState";
import Form from "../../Common/Form";
import Panel from "../../Common/Panel";
import Skeleton from "../../Common/Skeleton";
import TextInput from "../../Common/TextInput";
import Toolbar from "../../Common/Toolbar";

interface Props {
  copiedCreatedKey: boolean;
  createErrorMessage?: string | null;
  createdSdkKey?: CreatedSdkKey;
  environment?: Environment;
  isCreating: boolean;
  isLoading: boolean;
  isRevokeDialogOpen: boolean;
  isRevoking: boolean;
  onCancelRevoke: () => void;
  onCopyCreatedKey: () => Promise<void>;
  onRequestRevoke: (sdkKey: SdkKey) => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  onConfirmRevoke: () => Promise<void>;
  revokeErrorMessage?: string | null;
  revokingSdkKeyId?: string;
  sdkKeys: SdkKey[];
  selectedRevokeSdkKey?: SdkKey;
  validate: (values: Record<string, string>) => Partial<Record<string, string>>;
}

const formatDate = (value: string | null): string => {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

const SdkKeyPanel = ({
  copiedCreatedKey,
  createErrorMessage,
  createdSdkKey,
  environment,
  isCreating,
  isLoading,
  isRevokeDialogOpen,
  isRevoking,
  onCancelRevoke,
  onConfirmRevoke,
  onCopyCreatedKey,
  onRequestRevoke,
  onSubmit,
  revokeErrorMessage,
  revokingSdkKeyId,
  sdkKeys,
  selectedRevokeSdkKey,
  validate
}: Props) => {
  if (!environment) {
    return null;
  }

  const visibleCreatedKey = createdSdkKey?.environmentId === environment.id ? createdSdkKey : undefined;

  return (
    <Panel className="p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone="primary">{environment.key}</Badge>
            <Badge tone="neutral">SDK keys</Badge>
          </div>
          <h2 className="text-lg font-semibold text-app-text">SDK key access</h2>
          <p className="mt-1 text-sm leading-6 text-app-text-muted">
            Environment-scoped keys for applications evaluating this project's flags.
          </p>
        </div>
        <Badge tone="info">
          {sdkKeys.length} {sdkKeys.length === 1 ? "key" : "keys"}
        </Badge>
      </div>

      <Toolbar>
        <span className="font-medium text-app-text">{environment.name}</span>
        <span className="mx-2 text-app-text-muted">/</span>
        <span>{environment.key}</span>
      </Toolbar>

      <FinalForm
        initialValues={{ name: "" }}
        onSubmit={onSubmit}
        render={({ form, handleSubmit, submitting }) => {
          const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
            const result = handleSubmit(event);

            if (result?.then) {
              void result.then(() => form.restart());
            }
          };

          return (
            <Form className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start" onSubmit={onFormSubmit}>
              <Field<string> name="name">
                {({ input, meta }) => (
                  <TextInput
                    {...input}
                    autoComplete="off"
                    error={meta.touched && meta.error ? meta.error : undefined}
                    id={`sdk-key-name-${environment.id}`}
                    label="SDK key name"
                    placeholder="Browser app"
                  />
                )}
              </Field>
              <Button className="w-full md:mt-7 md:w-fit" disabled={isCreating || submitting} type="submit">
                <span className="inline-flex items-center gap-2">
                  <KeyRound aria-hidden="true" className="h-4 w-4" />
                  {isCreating ? "Creating" : "Create key"}
                </span>
              </Button>
            </Form>
          );
        }}
        validate={validate}
      />

      {createErrorMessage ? (
        <div className="mb-4">
          <Alert tone="danger" title="SDK key could not be created">
            {createErrorMessage}
          </Alert>
        </div>
      ) : null}

      {visibleCreatedKey ? (
        <div className="mb-4 rounded-app border border-app-primary/25 bg-app-primary-muted p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-app-primary" />
            <p className="text-sm font-semibold text-app-text">New SDK key</p>
            <Badge tone="warning">Shown once</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <code className="min-h-11 break-all rounded-app border border-app-border bg-app-surface px-3 py-2.5 text-sm text-app-text">
              {visibleCreatedKey.key}
            </code>
            <Button
              aria-label="Copy SDK key"
              className="w-full md:w-fit"
              onClick={() => void onCopyCreatedKey()}
              title="Copy SDK key"
              type="button"
              variant="secondary"
            >
              <span className="inline-flex items-center gap-2">
                <Clipboard aria-hidden="true" className="h-4 w-4" />
                {copiedCreatedKey ? "Copied" : "Copy"}
              </span>
            </Button>
          </div>
        </div>
      ) : null}

      {revokeErrorMessage ? (
        <div className="mb-4">
          <Alert tone="danger" title="SDK key could not be revoked">
            {revokeErrorMessage}
          </Alert>
        </div>
      ) : null}

      {isLoading ? <Skeleton rows={3} /> : null}

      {!isLoading && sdkKeys.length === 0 ? (
        <EmptyState
          description="Create a key for applications that need to evaluate flags in this environment."
          icon={KeyRound}
          title="No SDK keys"
        />
      ) : null}

      {!isLoading && sdkKeys.length > 0 ? (
        <DataList>
          {sdkKeys.map((sdkKey) => {
            const isRevoked = Boolean(sdkKey.revokedAt);

            return (
              <DataRow
                actions={
                  <Button
                    disabled={isRevoked || (isRevoking && revokingSdkKeyId === sdkKey.id)}
                    onClick={() => onRequestRevoke(sdkKey)}
                    type="button"
                    variant="danger"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                      {isRevoking && revokingSdkKeyId === sdkKey.id ? "Revoking" : "Revoke"}
                    </span>
                  </Button>
                }
                key={sdkKey.id}
              >
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-app-text">{sdkKey.name}</p>
                    <Badge tone={isRevoked ? "danger" : "success"}>{isRevoked ? "Revoked" : "Active"}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-app-text-muted">
                    <span className="font-mono">{sdkKey.keyPrefix}...</span>
                    <span>Created {formatDate(sdkKey.createdAt)}</span>
                    <span>Last used {formatDate(sdkKey.lastUsedAt)}</span>
                  </div>
                </div>
              </DataRow>
            );
          })}
        </DataList>
      ) : null}

      <ConfirmDialog
        confirmingLabel="Revoking"
        confirmLabel="Revoke key"
        description={`Revoke ${selectedRevokeSdkKey?.name ?? "this SDK key"}. Applications using it will stop evaluating flags.`}
        isConfirming={isRevoking}
        onCancel={onCancelRevoke}
        onConfirm={() => void onConfirmRevoke()}
        open={isRevokeDialogOpen}
        title="Revoke SDK key"
      />
    </Panel>
  );
};

export default SdkKeyPanel;
