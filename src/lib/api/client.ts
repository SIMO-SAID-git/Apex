export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  parseJson?: boolean;
}

/**
 * Thin fetch wrapper all lib/api/* modules use. UI components and hooks
 * never call fetch() directly — everything routes through here so retries,
 * error shaping, and base URL handling live in one place.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let code: string | undefined;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
      if (body?.code) code = body.code;
    } catch {
      // Response body wasn't JSON — keep the default message.
    }
    throw new ApiError(message, response.status, code);
  }

  if (options.parseJson === false) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
