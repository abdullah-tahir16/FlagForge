export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface CursorPaginationMetadata {
  hasNextPage: boolean;
  limit: number;
  nextCursor: string | null;
}

export interface CursorPaginatedList<TEntry> {
  entries: TEntry[];
  pagination: CursorPaginationMetadata;
}
