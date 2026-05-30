import api from "./axios";

export type RequestOptions = {
  params?: Record<string, unknown>;
  data?: unknown;
  requestKey?: string;
  cancelPrevious?: boolean;
  dedupe?: boolean;
  signal?: AbortSignal;
};

type InflightEntry<T> = {
  controller: AbortController;
  promise: Promise<T>;
};

const inflight = new Map<string, InflightEntry<unknown>>();

const removeInflight = (requestKey: string, promise: Promise<unknown>) => {
  const existing = inflight.get(requestKey);
  if (existing?.promise === promise) {
    inflight.delete(requestKey);
  }
};

const request = async <T>(
  method: "get" | "post" | "patch" | "delete",
  url: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { requestKey, cancelPrevious, dedupe, params, data, signal } = options;

  if (requestKey) {
    const existing = inflight.get(requestKey);
    if (dedupe && existing) {
      return existing.promise as Promise<T>;
    }

    if (cancelPrevious && existing) {
      existing.controller.abort();
      inflight.delete(requestKey);
    }
  }

  const controller = signal ? null : new AbortController();
  const requestSignal = signal ?? controller?.signal;

  const promise = api
    .request<T>({ method, url, params, data, signal: requestSignal })
    .then((response) => response.data)
    .finally(() => {
      if (requestKey) {
        removeInflight(requestKey, promise as Promise<unknown>);
      }
    });

  if (requestKey && controller) {
    inflight.set(requestKey, { controller, promise });
  }

  return promise;
};

export const apiRequest = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>("get", url, options),
  post: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    request<T>("post", url, { ...options, data }),
  patch: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    request<T>("patch", url, { ...options, data }),
  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>("delete", url, options),
  cancel: (requestKey: string) => {
    const existing = inflight.get(requestKey);
    if (existing) {
      existing.controller.abort();
      inflight.delete(requestKey);
    }
  },
};
