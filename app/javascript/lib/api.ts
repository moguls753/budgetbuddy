/**
 * API helper that automatically includes CSRF token
 */

function getCSRFToken(): string {
  const meta = document.querySelector('meta[name="csrf-token"]')
  return meta?.getAttribute('content') || ''
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown>
}

export async function api(path: string, options: RequestOptions = {}): Promise<Response> {
  const { body, headers = {}, ...rest } = options

  const config: RequestInit = {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
      ...headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  return fetch(path, config)
}
