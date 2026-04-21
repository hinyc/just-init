import { HttpClient } from './client'
import { HttpError } from './errors'

export { HttpClient } from './client'
export { HttpError, NetworkError, TimeoutError } from './errors'
export type {
  QueryParams,
  RequestConfig,
  HttpRequest,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  HttpClientOptions,
} from './client'

export const http = new HttpClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  defaultHeaders: { Accept: 'application/json' },
  timeout: 15_000,
})

http.useRequest((req) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('auth_token')
    if (token && !req.headers.has('Authorization')) {
      req.headers.set('Authorization', `Bearer ${token}`)
    }
  }
  return req
})

http.useError((err) => {
  if (err instanceof HttpError && err.status === 401 && typeof window !== 'undefined') {
    // window.location.href = '/login'
  }
  return err
})
