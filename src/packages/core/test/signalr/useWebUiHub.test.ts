import { resolveHubUrl, useWebUiHub } from '../../src/signalr/useWebUiHub'

describe('resolveHubUrl', () => {
  it('returns absolute URLs unchanged', () => {
    expect(resolveHubUrl('https://api.example/hubs/jobs')).toBe('https://api.example/hubs/jobs')
  })

  it('prefixes relative paths with origin', () => {
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: { origin: 'http://localhost:8080' },
    })

    expect(resolveHubUrl('/hubs/key-migration')).toBe('http://localhost:8080/hubs/key-migration')
  })

  it('adds leading slash when missing', () => {
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: { origin: 'http://localhost:8080' },
    })

    expect(resolveHubUrl('hubs/events')).toBe('http://localhost:8080/hubs/events')
  })
})

describe('useWebUiHub', () => {
  it('exports the hook', () => {
    expect(typeof useWebUiHub).toBe('function')
  })
})
