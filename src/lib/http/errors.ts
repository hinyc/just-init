export class HttpError<T = unknown> extends Error {
  readonly status: number
  readonly statusText: string
  readonly url: string
  readonly data: T
  readonly response: Response

  constructor(response: Response, data: T) {
    super(`HTTP ${response.status} ${response.statusText} @ ${response.url}`)
    this.name = 'HttpError'
    this.status = response.status
    this.statusText = response.statusText
    this.url = response.url
    this.data = data
    this.response = response
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  get isServerError(): boolean {
    return this.status >= 500
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Network request failed')
    this.name = 'NetworkError'
    this.cause = cause
  }
}

export class TimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`)
    this.name = 'TimeoutError'
  }
}
