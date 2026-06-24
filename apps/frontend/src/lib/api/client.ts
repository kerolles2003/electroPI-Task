const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// One in-flight refresh at a time — concurrent 401s share the same promise.
let _refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (_refreshing) return _refreshing;
  _refreshing = fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      _refreshing = null;
    });
  return _refreshing;
}

async function parseError(res: Response): Promise<ApiError> {
  let message = res.statusText;
  try {
    const body = await res.json();
    message = body.message ?? message;
  } catch {
    // ignore json parse errors
  }
  return new ApiError(res.status, message);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const run = () =>
    fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      ...init,
    });

  let res = await run();

  // Silently refresh the access token on 401, then retry once.
  // Skip auth endpoints to avoid infinite loops.
  if (res.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await run();
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Shared fetch path for multipart/form-data — no Content-Type header so the
// browser sets it automatically with the correct multipart boundary.
async function rawFetch<T>(path: string, init: RequestInit): Promise<T> {
  const run = () =>
    fetch(`${API_URL}${path}`, { credentials: 'include', ...init });

  let res = await run();

  if (res.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await run();
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function get<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { method: 'GET', ...init });
}

export function post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...init,
  });
}

export function patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
    ...init,
  });
}

export function del<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { method: 'DELETE', ...init });
}

export function postFormData<T>(path: string, formData: FormData): Promise<T> {
  return rawFetch<T>(path, { method: 'POST', body: formData });
}

export function patchFormData<T>(path: string, formData: FormData): Promise<T> {
  return rawFetch<T>(path, { method: 'PATCH', body: formData });
}
