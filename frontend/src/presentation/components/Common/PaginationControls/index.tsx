import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "../Button";

interface Props {
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading?: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageLabel?: string;
}

const PaginationControls = ({
  canGoNext,
  canGoPrevious,
  isLoading = false,
  onNextPage,
  onPreviousPage,
  pageLabel
}: Props) => (
  <nav aria-label="Pagination" className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
    {pageLabel ? <span className="text-sm font-semibold text-app-text-muted sm:mr-auto">{pageLabel}</span> : null}
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled={!canGoPrevious || isLoading} onClick={onPreviousPage} type="button" variant="secondary">
        <span className="inline-flex items-center gap-2">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Previous
        </span>
      </Button>
      <Button disabled={!canGoNext || isLoading} onClick={onNextPage} type="button" variant="secondary">
        <span className="inline-flex items-center gap-2">
          Next
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </span>
      </Button>
    </div>
  </nav>
);

export default PaginationControls;
