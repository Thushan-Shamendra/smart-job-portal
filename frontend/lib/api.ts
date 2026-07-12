import { clearStoredAuth } from "@/lib/auth";

const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const isUnauthorizedError = (error: unknown) =>
  error instanceof ApiError && error.status === 401;

export const buildApiUrl = (path: string) => {
  if (!baseApiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  return `${baseApiUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

type JsonRequestOptions = RequestInit & {
  token?: string | null;
  body?: BodyInit | null;
};

const buildHeaders = (
  headers: HeadersInit | undefined,
  token?: string | null
) => {
  const normalized = new Headers(headers);

  if (token) {
    normalized.set("Authorization", `Bearer ${token}`);
  }

  return normalized;
};

export const apiRequest = async <T>(
  path: string,
  options: JsonRequestOptions = {}
) => {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: buildHeaders(options.headers, options.token),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const data = isJson ? ((await response.json()) as T & { message?: string }) : null;

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();
    }

    throw new ApiError(
      data?.message || "The request could not be completed.",
      response.status
    );
  }

  return data as T;
};
