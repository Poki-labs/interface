import type { UsePlatformBasedValue } from 'poki/src/utils/usePlatformBasedValue'

export function usePlatformBasedValue<T>({ defaultValue, mobile }: UsePlatformBasedValue<T>): T {
  return mobile?.defaultValue ?? defaultValue
}
