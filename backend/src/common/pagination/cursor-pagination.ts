import { BadRequestException } from "@nestjs/common";
import type { ObjectLiteral, SelectQueryBuilder } from "typeorm";

const defaultLimit = 25;
const maxLimit = 100;

export interface CreatedAtCursorRecord {
  createdAt: Date;
  id: string;
}

interface CreatedAtCursor {
  createdAt: Date;
  id: string;
}

export interface CursorPaginationMetadata {
  hasNextPage: boolean;
  limit: number;
  nextCursor: string | null;
}

export interface CursorPaginatedResponse<TEntry> {
  entries: TEntry[];
  pagination: CursorPaginationMetadata;
}

export const resolveCursorPaginationLimit = (limit: number | undefined): number =>
  Math.min(Math.max(limit ?? defaultLimit, 1), maxLimit);

export const encodeCreatedAtCursor = (record: CreatedAtCursorRecord): string =>
  Buffer.from(JSON.stringify({ createdAt: record.createdAt.toISOString(), id: record.id })).toString("base64url");

export const decodeCreatedAtCursor = (cursor: string | undefined): CreatedAtCursor | null => {
  if (!cursor) {
    return null;
  }

  try {
    const parsedCursor = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
      createdAt?: unknown;
      id?: unknown;
    };

    if (typeof parsedCursor.createdAt !== "string" || typeof parsedCursor.id !== "string") {
      throw new Error("Invalid cursor payload");
    }

    const createdAt = new Date(parsedCursor.createdAt);

    if (Number.isNaN(createdAt.getTime()) || !parsedCursor.id) {
      throw new Error("Invalid cursor values");
    }

    return {
      createdAt,
      id: parsedCursor.id
    };
  } catch {
    throw new BadRequestException("Invalid pagination cursor");
  }
};

export const applyCreatedAtCursorPagination = <TEntity extends ObjectLiteral>(
  query: SelectQueryBuilder<TEntity>,
  options: {
    alias: string;
    cursor: string | undefined;
    limit: number;
  }
): SelectQueryBuilder<TEntity> => {
  const decodedCursor = decodeCreatedAtCursor(options.cursor);

  if (decodedCursor) {
    query.andWhere(
      `(${options.alias}.created_at < :cursorCreatedAt OR (${options.alias}.created_at = :cursorCreatedAt AND ${options.alias}.id < :cursorId))`,
      {
        cursorCreatedAt: decodedCursor.createdAt,
        cursorId: decodedCursor.id
      }
    );
  }

  return query
    .orderBy(`${options.alias}.created_at`, "DESC")
    .addOrderBy(`${options.alias}.id`, "DESC")
    .take(options.limit + 1);
};

export const createCursorPaginatedResponse = <TRecord extends CreatedAtCursorRecord, TEntry>(
  records: TRecord[],
  options: {
    limit: number;
    toEntry: (record: TRecord) => TEntry;
  }
): CursorPaginatedResponse<TEntry> => {
  const pageRecords = records.slice(0, options.limit);
  const hasNextPage = records.length > options.limit;
  const lastRecord = pageRecords[pageRecords.length - 1];

  return {
    entries: pageRecords.map(options.toEntry),
    pagination: {
      hasNextPage,
      limit: options.limit,
      nextCursor: hasNextPage && lastRecord ? encodeCreatedAtCursor(lastRecord) : null
    }
  };
};
