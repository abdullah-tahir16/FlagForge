import { useState } from "react";
import type { CursorPaginationMetadata } from "../../../core/types/Pagination";

export const useCursorPagination = () => {
  const [cursor, setCursor] = useState<string | undefined>();
  const [previousCursors, setPreviousCursors] = useState<string[]>([]);

  const goToNextPage = (pagination: CursorPaginationMetadata) => {
    if (!pagination.hasNextPage || !pagination.nextCursor) {
      return;
    }

    setPreviousCursors((cursors) => [...cursors, cursor ?? ""]);
    setCursor(pagination.nextCursor);
  };

  const goToPreviousPage = () => {
    setPreviousCursors((cursors) => {
      const nextCursors = [...cursors];
      const previousCursor = nextCursors.pop();
      setCursor(previousCursor || undefined);
      return nextCursors;
    });
  };

  const resetPagination = () => {
    setCursor(undefined);
    setPreviousCursors([]);
  };

  return {
    canGoPrevious: previousCursors.length > 0,
    cursor,
    goToNextPage,
    goToPreviousPage,
    pageNumber: previousCursors.length + 1,
    resetPagination
  };
};
