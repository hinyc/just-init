import { HttpError, NetworkError, TimeoutError } from './errors'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue | QueryValue[]>

export type RequestConfig = {
  headers?: HeadersInit
  params?: QueryParams
  signal?: AbortSignal
  timeout?: number
}

export type HttpRequest = {
  url: string
  method: HttpMethod
  headers: Headers
  body?: BodyInit | null
  signal?: AbortSignal
  timeout?: number
}

export type RequestInterceptor = (req: HttpRequest) => HttpRequest | Promise<HttpRequest>
export type ResponseInterceptor = (res: Response) => Response | Promise<Response>
export type ErrorInterceptor = (err: unknown) => unknown

export type HttpClientOptions = {
  baseUrl?: string
  defaultHeaders?: Record<string, string>
  timeout?: number
}

export class HttpClient {
  private readonly baseUrl: string
  private readonly defaultHeaders: Record<string, string>
  private readonly defaultTimeout?: number

  private readonly requestInterceptors: RequestInterceptor[] = []
  private readonly responseInterceptors: ResponseInterceptor[] = []
  private readonly errorInterceptors: ErrorInterceptor[] = []

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? ''
    this.defaultHeaders = options.defaultHeaders ?? {}
    this.defaultTimeout = options.timeout
  }

  useRequest(interceptor: RequestInterceptor): this {
    this.requestInterceptors.push(interceptor)
    return this
  }

  useResponse(interceptor: ResponseInterceptor): this {
    this.responseInterceptors.push(interceptor)
    return this
  }

  useError(interceptor: ErrorInterceptor): this {
    this.errorInterceptors.push(interceptor)
    return this
  }

  get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config)
  }

  delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config)
  }

  post<T>(url: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', url, body, config)
  }

  put<T>(url: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', url, body, config)
  }

  patch<T>(url: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', url, body, config)
  }

  async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    config: RequestConfig = {},
  ): Promise<T> {
    const initial = this.buildRequest(method, path, body, config)
    const request = await this.applyRequestInterceptors(initial)

    try {
      const raw = await this.performFetch(request)
      const response = await this.applyResponseInterceptors(raw)
      return await this.parseBody<T>(response)
    } catch (err) {
      throw this.applyErrorInterceptors(err)
    }
  }

  private buildRequest(
    method: HttpMethod,
    path: string,
    body: unknown,
    config: RequestConfig,
  ): HttpRequest {
    const headers = new Headers(this.defaultHeaders)
    if (config.headers) new Headers(config.headers).forEach((v, k) => headers.set(k, v))

    return {
      url: this.resolveUrl(path, config.params),
      method,
      headers,
      body: this.serializeBody(body, headers),
      signal: config.signal,
      timeout: config.timeout ?? this.defaultTimeout,
    }
  }

  private serializeBody(body: unknown, headers: Headers): BodyInit | null | undefined {
    if (body === undefined || body === null) return undefined
    if (body instanceof FormData || body instanceof Blob || body instanceof URLSearchParams) {
      return body
    }
    if (typeof body === 'string') return body
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
    return JSON.stringify(body)
  }

  private async applyRequestInterceptors(req: HttpRequest): Promise<HttpRequest> {
    let current = req
    for (const i of this.requestInterceptors) current = await i(current)
    return current
  }

  private async applyResponseInterceptors(res: Response): Promise<Response> {
    let current = res
    for (const i of this.responseInterceptors) current = await i(current)
    return current
  }

  private applyErrorInterceptors(err: unknown): unknown {
    let current = err
    for (const i of this.errorInterceptors) current = i(current)
    return current
  }

  private async performFetch(req: HttpRequest): Promise<Response> {
    const controller = req.timeout ? new AbortController() : undefined
    const timer =
      controller && req.timeout
        ? setTimeout(() => controller.abort(new TimeoutError(req.timeout!)), req.timeout)
        : undefined

    const signal = this.composeSignals(req.signal, controller?.signal)

    try {
      return await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body,
        signal,
      })
    } catch (err) {
      if (err instanceof TimeoutError) throw err
      if (err instanceof DOMException && err.name === 'AbortError') throw err
      throw new NetworkError(err)
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  private composeSignals(...signals: (AbortSignal | undefined)[]): AbortSignal | undefined {
    const active = signals.filter((s): s is AbortSignal => Boolean(s))
    if (active.length === 0) return undefined
    if (active.length === 1) return active[0]
    return AbortSignal.any(active)
  }

  private async parseBody<T>(response: Response): Promise<T> {
    const type = response.headers.get('content-type') ?? ''
    let data: unknown = null
    if (response.status !== 204 && response.status !== 205) {
      if (type.includes('application/json')) {
        data = await response.json().catch(() => null)
      } else if (type.startsWith('text/')) {
        data = await response.text()
      }
    }

    if (!response.ok) throw new HttpError(response, data)
    return data as T
  }

  private resolveUrl(path: string, params?: QueryParams): string {
    const isAbsolute = /^https?:\/\//i.test(path)
    const base = isAbsolute ? '' : this.baseUrl
    const joined = `${base}${path}`
    if (!params) return joined

    const sp = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue
      if (Array.isArray(value)) {
        for (const v of value) if (v !== undefined && v !== null) sp.append(key, String(v))
      } else {
        sp.append(key, String(value))
      }
    }
    const qs = sp.toString()
    if (!qs) return joined
    return joined.includes('?') ? `${joined}&${qs}` : `${joined}?${qs}`
  }
}
