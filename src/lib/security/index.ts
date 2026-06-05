// =============================================================================
// ORKESTRANDO - Security Utilities
// Input sanitization, file validation, CSRF, rate limiting, security headers
// =============================================================================

/**
 * Sanitizes user input by removing dangerous characters.
 */
export function sanitizeInput(input: string): string {
  return input.replace(/[<>'"&;(){}[\]]/g, '')
}

/**
 * Validates a file upload against allowed types and max size.
 */
export function validateUpload(
  file: File,
  allowedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return { valid: false, error: `Arquivo excede ${maxSize / 1024 / 1024}MB` }
  }
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de arquivo não permitido' }
  }
  return { valid: true }
}

/**
 * Generates a CSRF token using the Web Crypto API.
 */
export function generateCSRFToken(): string {
  return crypto.randomUUID()
}

// Rate limiting (in-memory for demo, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

/**
 * Checks rate limit for a given key.
 * Returns whether the request is allowed and how many seconds until the limit resets.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    }
  }

  record.count++
  return { allowed: true, retryAfter: 0 }
}

/**
 * Returns standard security headers for API responses.
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'",
  }
}
