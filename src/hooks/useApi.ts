import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from '@/auth/session';
import { ApiError, api, type RequestOptions } from '@/lib/api';

export function useApiClient() {
  const { getToken } = useSession();

  return useCallback(
    async <T,>(path: string, options: Omit<RequestOptions, 'token'> = {}) => {
      const token = await getToken();
      return api<T>(path, { ...options, token });
    },
    [getToken],
  );
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export type UploadProgress = (percent: number) => void;

export function useApiUpload() {
  const { getToken } = useSession();

  return useCallback(
    async <T,>(
      path: string,
      file: File,
      fields: Record<string, string> = {},
      onProgress?: UploadProgress,
    ) => {
      const form = new FormData();
      form.append('file', file);
      for (const [key, value] of Object.entries(fields)) form.append(key, value);

      const token = await getToken();

      // fetch() does not expose upload progress, so image uploads use XHR for
      // the one request where the user needs to see bytes moving.
      return new Promise<T>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', path);
        xhr.withCredentials = true;
        xhr.setRequestHeader('accept', 'application/json');
        if (token) xhr.setRequestHeader('authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            onProgress?.(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onerror = () => {
          reject(new Error('We could not reach the server. Check your connection and try again.'));
        };
        xhr.onabort = () => {
          reject(new Error('The upload was cancelled.'));
        };
        xhr.onload = () => {
          let data: unknown = null;
          if (xhr.responseText) {
            try {
              data = JSON.parse(xhr.responseText);
            } catch {
              data = null;
            }
          }

          if (xhr.status < 200 || xhr.status >= 300) {
            const payload = (data ?? {}) as { error?: string; fields?: Record<string, string> };
            reject(new ApiError(xhr.status, payload.error ?? 'server', payload.fields));
            return;
          }

          resolve(data as T);
        };

        xhr.send(form);
      });
    },
    [getToken],
  );
}

export function useApi<T>(path: string | null) {
  const request = useApiClient();
  const [state, setState] = useState<ApiState<T> & { path: string | null }>({
    path: null, data: null, loading: false, error: null,
  });
  const activeRequest = useRef<AbortController | null>(null);
  const cancel = useCallback(() => activeRequest.current?.abort(), []);

  const load = useCallback(() => {
    cancel();
    if (!path) return Promise.resolve();
    const controller = new AbortController();
    activeRequest.current = controller;
    return request<T>(path, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) setState({ path, data, loading: false, error: null });
      },
      (cause: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          path, data: null, loading: false,
          error: cause instanceof ApiError && cause.status === 404
            ? 'That record is not available to this account.'
            : 'We could not load this page. Check your connection and try again.',
        });
      },
    );
  }, [cancel, path, request]);

  useEffect(() => {
    void load();
    return cancel;
  }, [cancel, load]);

  const refresh = useCallback(async () => {
    if (!path) return;
    setState(current => ({ ...current, loading: true, error: null }));
    await load();
  }, [load, path]);
  const visible = state.path === path ? state : { data: null, error: null, loading: Boolean(path) };
  return {
    data: visible.data, loading: visible.loading, error: visible.error, refresh,
    setData: (data: T | null) => setState({ path, data, loading: false, error: null }),
  };
}
