import { useEffect, useMemo, useRef, useState } from 'react'

export type Call<T> = () => Promise<T | undefined | null>

export type CallsResult<T> = {
  result: T | undefined | null
  loading: boolean
}

export function useCallsData<T>(fn: Call<T>, reload?: number | string | boolean | undefined | null): CallsResult<T> {
  const result = useRef<T | undefined | null>(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (fn) {
      result.current = undefined
      setLoading(true)
      fn().then((res) => {
        result.current = res
        setLoading(false)
      })
    }
  }, [fn, reload])

  return useMemo(() => {
    return {
      result: result.current,
      loading,
    }
  }, [result.current, loading])
}

export function useLatestDataCall<T>(fn: Call<T>, refresh?: number | string | boolean | undefined | null) {
  const [loading, setLoading] = useState(false)

  const indexRef = useRef<number>(0)
  const resultsRef = useRef<{ [key: string]: T | undefined }>({})

  useEffect(() => {
    if (fn) {
      setLoading(true)

      indexRef.current += 1
      const index = indexRef.current

      fn().then((result) => {
        resultsRef.current = {
          ...resultsRef.current,
          [String(index)]: result as T,
        }

        setLoading(false)
      })
    }
  }, [fn, refresh])

  return useMemo(() => {
    return {
      result: resultsRef.current[indexRef.current] as T | undefined,
      loading,
    }
  }, [resultsRef.current, indexRef.current, loading])
}
