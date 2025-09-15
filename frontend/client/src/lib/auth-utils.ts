// client/src/lib/auth-utils.ts
import { ApiError } from "@/lib/api";

/**
 * Detects unauthorized responses/errors.
 */
export function isUnauthorizedError(err: unknown): boolean {
  if (!err) return false;

  if (err instanceof ApiError && err.status === 401) {
    return true;
  }

  const message =
    typeof err === "string"
      ? err
      : err instanceof Error
      ? err.message
      : // @ts-ignore
        err?.message || err?.data?.message || err?.error || "";

  return /(^401:)|\bunauthoriz(ed|ation)\b|401\b/i.test(String(message));
}
