import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  useDebounce,
  useHover,
  useInterval,
  useLocalStorage,
  useLongPress,
  useMedia,
  useOnClickOutside,
  useOnScreen,
  usePrevious,
  useSessionStorage,
} from '@webui/core'

const meta = {
  title: 'core/hooks',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Interactive demos for core hooks (debounce, storage, hover, previous, interval, media, click-outside, long-press, on-screen).',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function DebounceDemo() {
  const [value, setValue] = useState('')
  const debounced = useDebounce(value, 300)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Type to debounce
        <input
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <p className="text-sm text-gray-600">
        Live: <span data-testid="live">{value || '—'}</span>
      </p>
      <p className="text-sm text-gray-600">
        Debounced: <span data-testid="debounced">{debounced || '—'}</span>
      </p>
    </div>
  )
}

function StorageDemo() {
  const [localValue, setLocalValue] = useLocalStorage('storybook.local', 0)
  const [sessionValue, setSessionValue] = useSessionStorage('storybook.session', 0)

  return (
    <div className="flex flex-wrap gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium">localStorage: {localValue}</p>
        <button
          type="button"
          className="rounded bg-sky-600 px-3 py-1.5 text-sm text-white"
          onClick={() => setLocalValue((n) => n + 1)}
        >
          Increment local
        </button>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">sessionStorage: {sessionValue}</p>
        <button
          type="button"
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white"
          onClick={() => setSessionValue((n) => n + 1)}
        >
          Increment session
        </button>
      </div>
    </div>
  )
}

function HoverPreviousDemo() {
  const [ref, isHovered] = useHover<HTMLDivElement>()
  const [count, setCount] = useState(0)
  const previous = usePrevious(count)

  return (
    <div className="space-y-4">
      <div
        ref={ref}
        className={`rounded border px-4 py-6 text-center ${isHovered ? 'bg-amber-100 border-amber-400' : 'bg-gray-50 border-gray-200'}`}
      >
        {isHovered ? 'Hovered' : 'Hover me'}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          className="rounded bg-gray-800 px-3 py-1.5 text-white"
          onClick={() => setCount((n) => n + 1)}
        >
          Count: {count}
        </button>
        <span data-testid="previous">Previous: {previous ?? '—'}</span>
      </div>
    </div>
  )
}

function IntervalDemo() {
  const [ticks, setTicks] = useState(0)
  const [running, setRunning] = useState(true)
  useInterval(() => setTicks((n) => n + 1), running ? 400 : null)

  return (
    <div className="space-y-2">
      <p data-testid="ticks">Ticks: {ticks}</p>
      <button
        type="button"
        className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white"
        onClick={() => setRunning((v) => !v)}
      >
        {running ? 'Pause' : 'Resume'}
      </button>
    </div>
  )
}

function MediaDemo() {
  const label = useMedia(['(min-width: 768px)'], ['wide'], 'narrow')
  return <p data-testid="media">Viewport: {label}</p>
}

function ClickOutsideDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [outside, setOutside] = useState(0)
  useOnClickOutside(ref, () => setOutside((n) => n + 1))

  return (
    <div className="space-y-3">
      <div ref={ref} className="rounded border border-sky-300 bg-sky-50 px-4 py-6">
        Inside panel
      </div>
      <button type="button" className="rounded border px-3 py-1.5 text-sm" data-testid="outside-btn">
        Outside button
      </button>
      <p data-testid="outside-count">Outside clicks: {outside}</p>
    </div>
  )
}

function LongPressDemo() {
  const [message, setMessage] = useState('Idle')
  const handlers = useLongPress({
    delayMs: 400,
    onLongPress: () => setMessage('Long press'),
    onClick: () => setMessage('Click'),
  })

  return (
    <div className="space-y-2">
      <button type="button" className="rounded bg-violet-700 px-4 py-2 text-white" {...handlers}>
        Press me
      </button>
      <p data-testid="longpress">{message}</p>
    </div>
  )
}

function OnScreenDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useOnScreen(ref, { threshold: 0.1 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="space-y-2">
      <p data-testid="onscreen">Visible: {mounted && visible ? 'yes' : 'no'}</p>
      <div ref={ref} className="rounded bg-emerald-100 px-4 py-8 text-center">
        Observed block
      </div>
    </div>
  )
}

export const Debounce: Story = {
  render: () => <DebounceDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await userEvent.type(input, 'hi')
    await expect(canvas.getByTestId('live')).toHaveTextContent('hi')
    await expect(canvas.getByTestId('debounced')).toHaveTextContent('—')
    await new Promise((resolve) => setTimeout(resolve, 350))
    await expect(canvas.getByTestId('debounced')).toHaveTextContent('hi')
  },
}

export const Storage: Story = {
  render: () => <StorageDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /increment local/i }))
    await expect(canvas.getByText(/localStorage: 1/i)).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: /increment session/i }))
    await expect(canvas.getByText(/sessionStorage: 1/i)).toBeVisible()
  },
}

export const HoverAndPrevious: Story = {
  render: () => <HoverPreviousDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /count: 0/i }))
    await expect(canvas.getByTestId('previous')).toHaveTextContent('Previous: 0')
  },
}

export const Interval: Story = {
  render: () => <IntervalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 500))
    const text = canvas.getByTestId('ticks').textContent ?? ''
    await expect(Number(text.replace(/\D/g, ''))).toBeGreaterThan(0)
  },
}

export const Media: Story = {
  render: () => <MediaDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByTestId('media')).toHaveTextContent(/Viewport: (wide|narrow)/)
  },
}

export const OnClickOutside: Story = {
  render: () => <ClickOutsideDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByTestId('outside-btn'))
    await expect(canvas.getByTestId('outside-count')).toHaveTextContent('Outside clicks: 1')
  },
}

export const LongPress: Story = {
  render: () => <LongPressDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /press me/i })
    await userEvent.click(button)
    await expect(canvas.getByTestId('longpress')).toHaveTextContent('Click')
  },
}

export const OnScreen: Story = {
  render: () => <OnScreenDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByTestId('onscreen')).toHaveTextContent(/Visible: (yes|no)/)
  },
}
