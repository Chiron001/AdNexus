export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof AppError) return error.statusCode === 401
  return false
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  retryOnCode?: number
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      const isRetryable =
        retryOnCode !== undefined &&
        error instanceof AppError &&
        error.statusCode === retryOnCode

      if (isRetryable && attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000))
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

export function apiErrorResponse(error: unknown, route: string): Response {
  const message = getErrorMessage(error)
  console.error(`[${route}] error:`, error)
  return Response.json(
    { error: message },
    { status: 500 }
  )
}
