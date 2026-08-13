import { AlertTriangle } from "lucide-react";
import Button from "../Button";

interface Props {
  cancelLabel?: string;
  confirmLabel: string;
  description: string;
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}

const ConfirmDialog = ({
  cancelLabel = "Cancel",
  confirmLabel,
  description,
  isConfirming = false,
  onCancel,
  onConfirm,
  open,
  title
}: Props) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-app-overlay/45 px-4 py-6">
      <section
        aria-describedby="confirm-dialog-description"
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="w-full max-w-md rounded-app border border-app-border bg-app-surface p-5 text-app-text shadow-app-overlay"
        role="dialog"
      >
        <div className="flex gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-app border border-app-destructive/20 bg-app-destructive-muted text-app-destructive">
            <AlertTriangle aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-normal" id="confirm-dialog-title">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-app-text-muted" id="confirm-dialog-description">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={isConfirming} onClick={onCancel} type="button" variant="secondary">
            {cancelLabel}
          </Button>
          <Button disabled={isConfirming} onClick={onConfirm} type="button" variant="danger">
            {isConfirming ? "Deleting" : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ConfirmDialog;
