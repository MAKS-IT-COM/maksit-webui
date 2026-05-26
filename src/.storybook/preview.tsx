import type { Preview } from '@storybook/react-vite'
import MockDate from 'mockdate'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { MemoryRouter } from 'react-router-dom'
import { mswHandlers } from './msw-handlers'
import '../storybook.css'

initialize({ onUnhandledRequest: 'bypass' })

const preview: Preview = {
  loaders: [mswLoader],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <section className="p-6">
          <Story />
        </section>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'padded',
    msw: { handlers: mswHandlers },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  async beforeEach () {
    MockDate.set('2024-04-01T12:00:00Z')
  },
}

export default preview
