import type { RequestOptions, SkippableAxiosConfig } from './types'

export const NO_LOADER_OPTIONS: RequestOptions = { skipLoader: true }

export function getSkipLoader(config: SkippableAxiosConfig | undefined): boolean {
  return config?.skipLoader === true
}

export function buildJsonRequestConfig(
  timeout?: number,
  options?: RequestOptions
): SkippableAxiosConfig & { headers: Record<string, string>; timeout?: number } {
  const config: SkippableAxiosConfig & { headers: Record<string, string>; timeout?: number } = {
    headers: { 'Content-Type': 'application/json' },
    ...(timeout ? { timeout } : {}),
  }
  if (options?.skipLoader) {
    config.skipLoader = true
  }
  return config
}

export function buildBinaryRequestConfig(
  timeout?: number,
  as: 'arraybuffer' | 'blob' = 'arraybuffer',
  options?: RequestOptions
): SkippableAxiosConfig & { responseType: 'arraybuffer' | 'blob'; timeout?: number } {
  const config: SkippableAxiosConfig & { responseType: 'arraybuffer' | 'blob'; timeout?: number } = {
    responseType: as,
    ...(timeout ? { timeout } : {}),
  }
  if (options?.skipLoader) {
    config.skipLoader = true
  }
  return config
}

export function buildMultipartRequestConfig(
  timeout?: number,
  options?: RequestOptions
): SkippableAxiosConfig & { timeout?: number } {
  const config: SkippableAxiosConfig & { timeout?: number } = {
    ...(timeout ? { timeout } : {}),
  }
  if (options?.skipLoader) {
    config.skipLoader = true
  }
  return config
}
