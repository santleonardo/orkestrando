// =============================================================================
// ORKESTRANDO - Schedule Validation
// Validates session creation using the ConflictEngine
// =============================================================================

import type { ClassSession, ValidationContext, ValidationResult, ConflictWarning } from '@/lib/types'
import { ConflictEngine } from '@/server/services/conflict-engine'

const conflictEngine = new ConflictEngine()

/**
 * Validates the creation or update of a class session against all conflict rules.
 * Returns a comprehensive validation result with errors (blocking) and warnings (non-blocking).
 */
export function validateSessionCreation(
  session: ClassSession,
  context: ValidationContext
): ValidationResult {
  const report = conflictEngine.validateAllConflicts(session, context)

  return {
    valid: report.valid,
    errors: report.errors,
    warnings: report.warnings,
  }
}

/**
 * Validates multiple sessions at once (for batch operations like lesson generation).
 * Returns results for each session keyed by session ID.
 */
export function validateSessionBatch(
  sessions: ClassSession[],
  context: ValidationContext
): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>()

  // For batch validation, we need to include already-validated sessions
  // in the "existing" set to detect inter-session conflicts
  const validatedSessions: ClassSession[] = []

  for (const session of sessions) {
    const batchContext: ValidationContext = {
      ...context,
      existingSessions: [...context.existingSessions, ...validatedSessions],
    }

    const result = validateSessionCreation(session, batchContext)
    results.set(session.id, result)

    // Add to validated set if no blocking errors
    if (result.valid) {
      validatedSessions.push(session)
    }
  }

  return results
}

/**
 * Quick validation check - returns true if the session has no blocking errors.
 * Useful for inline validation in UI components.
 */
export function isSessionValid(
  session: ClassSession,
  context: ValidationContext
): boolean {
  return validateSessionCreation(session, context).valid
}

/**
 * Returns only the warnings for a session (no errors).
 * Useful for displaying informational alerts without blocking actions.
 */
export function getSessionWarnings(
  session: ClassSession,
  context: ValidationContext
): ConflictWarning[] {
  const report = conflictEngine.validateAllConflicts(session, context)
  return report.warnings
}

/**
 * Formats validation errors into user-friendly messages.
 */
export function formatValidationErrors(
  result: ValidationResult
): { errors: string[]; warnings: string[] } {
  return {
    errors: result.errors.map((e) => e.message),
    warnings: result.warnings.map((w) => w.description),
  }
}
