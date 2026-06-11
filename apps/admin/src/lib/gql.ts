export type GqlErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "BAD_USER_INPUT"
  | "NOT_FOUND"
  | "INTERNAL_SERVER_ERROR"
  | (string & {});

export class GqlClientError extends Error {
  readonly code?: GqlErrorCode;

  constructor(message: string, code?: GqlErrorCode) {
    super(message);
    this.name = "GqlClientError";
    this.code = code;
  }
}

export interface GqlError {
  extensions?: {
    code?: GqlErrorCode;
    originalError?: {
      message?: string | string[];
      statusCode?: number;
    };
  };
  locations?: { line: number; column: number }[];
  message: string;
  path?: (string | number)[];
}

export interface GqlResponse<TData> {
  data?: TData | null;
  errors?: GqlError[];
}
