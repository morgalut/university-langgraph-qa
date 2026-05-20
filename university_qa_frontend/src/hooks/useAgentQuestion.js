import { useCallback, useEffect, useRef, useState } from 'react'
import { askAgent } from '../api/client'

const MIN_LENGTH = 3

/**
 * useAgentQuestion
 *
 * Robust hook for asking the agent a question.
 *
 * Improvements over the original:
 *  - Cancels in-flight requests when a new one is fired, or on unmount,
 *    via AbortController — prevents stale responses overwriting fresh state.
 *  - Tracks the active request id so late responses from older calls are
 *    silently dropped (defense in depth if `askAgent` ignores its signal).
 *  - Surfaces structured error info (message, status, code, raw) instead of
 *    only a string.
 *  - Adds a `status` field ('idle' | 'loading' | 'success' | 'error') so UI
 *    can render distinct states without juggling three booleans.
 *  - Adds `reset()`, `cancel()`, and `retry()` helpers.
 *  - Tracks the last submitted question and timing info.
 *  - Stable callback identities via useCallback so consumers don't re-render
 *    children unnecessarily.
 *
 * Returns:
 *  {
 *    status, loading, result, error, question, durationMs,
 *    ask(question), retry(), cancel(), reset()
 *  }
 */
export function useAgentQuestion() {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [question, setQuestion] = useState('')
  const [durationMs, setDurationMs] = useState(null)

  // Track the latest request so older ones can be ignored on resolve.
  const requestIdRef = useRef(0)
  const abortRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const reset = useCallback(() => {
    cancel()
    setStatus('idle')
    setResult(null)
    setError(null)
    setQuestion('')
    setDurationMs(null)
  }, [cancel])

  const ask = useCallback(async (rawQuestion) => {
    const trimmed = (rawQuestion ?? '').trim()

    if (trimmed.length < MIN_LENGTH) {
      setError({
        message: `Please enter a question with at least ${MIN_LENGTH} characters.`,
        kind: 'validation',
      })
      setStatus('error')
      return { ok: false, error: 'validation' }
    }

    // Cancel any prior in-flight request.
    cancel()

    const myId = ++requestIdRef.current
    const controller = new AbortController()
    abortRef.current = controller

    setQuestion(trimmed)
    setStatus('loading')
    setError(null)
    setResult(null)
    setDurationMs(null)

    const startedAt = performance.now()

    try {
      // Pass signal if the client supports it (axios: { signal }).
      // If askAgent doesn't accept a second arg, it's harmlessly ignored.
      const data = await askAgent(trimmed, { signal: controller.signal })

      // Race guard: was this still the active request?
      if (myId !== requestIdRef.current || !mountedRef.current) {
        return { ok: false, error: 'stale' }
      }

      setResult(data)
      setStatus('success')
      setDurationMs(Math.round(performance.now() - startedAt))
      return { ok: true, data }
    } catch (err) {
      if (isAbortError(err)) {
        // Silently swallow aborts — we cancelled on purpose.
        return { ok: false, error: 'aborted' }
      }
      if (myId !== requestIdRef.current || !mountedRef.current) {
        return { ok: false, error: 'stale' }
      }
      const normalized = normalizeError(err)
      setError(normalized)
      setStatus('error')
      setDurationMs(Math.round(performance.now() - startedAt))
      return { ok: false, error: normalized }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }
  }, [cancel])

  const retry = useCallback(() => {
    if (!question) return
    return ask(question)
  }, [ask, question])

  return {
    // state
    status,
    loading: status === 'loading',
    result,
    error,
    question,
    durationMs,
    // actions
    ask,
    retry,
    cancel,
    reset,
  }
}

/* ---------- helpers ---------- */

function isAbortError(err) {
  return (
    err?.name === 'AbortError' ||
    err?.name === 'CanceledError' ||  // axios v1
    err?.code === 'ERR_CANCELED' ||
    err?.message === 'canceled'
  )
}

function normalizeError(err) {
  const status = err?.response?.status
  const data = err?.response?.data
  const detail = data?.detail
  const message =
    (typeof detail === 'string' && detail) ||
    (Array.isArray(detail) && detail[0]?.msg) ||  // FastAPI 422 shape
    data?.message ||
    err?.message ||
    'Request failed'

  let kind = 'unknown'
  if (status === 0 || err?.code === 'ERR_NETWORK') kind = 'network'
  else if (status === 401 || status === 403) kind = 'auth'
  else if (status === 404) kind = 'not_found'
  else if (status === 422) kind = 'validation'
  else if (status >= 500) kind = 'server'
  else if (status >= 400) kind = 'client'

  return {
    message,
    kind,
    status: status ?? null,
    code: err?.code ?? null,
    raw: data ?? null,
  }
}