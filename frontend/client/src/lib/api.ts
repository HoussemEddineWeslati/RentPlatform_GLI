// client/src/lib/api.ts
const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:5000" : "");

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
    throw new ApiError(
      `${res.status}: ${data.message || res.statusText}`,
      res.status,
      data
    );
  }
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // important for sessions
  });

  await throwIfResNotOk(res);
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

/**
 * Makes an API request and triggers a file download for blob responses.
 * @param method The HTTP method.
 * @param url The API endpoint.
 * @param data The request payload.
 * @param fileName The name for the downloaded file.
 */
export async function apiDownloadRequest(
  method: string,
  url: string,
  data?: unknown,
  fileName = "download"
): Promise<void> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    // Try to parse error as JSON, otherwise throw a generic error
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: res.statusText };
    }
    throw new ApiError(
      `${res.status}: ${errorData.message || res.statusText}`,
      res.status,
      errorData
    );
  }

  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
}
