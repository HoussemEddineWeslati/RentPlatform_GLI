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
