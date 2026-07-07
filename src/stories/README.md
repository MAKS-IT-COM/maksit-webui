# Storybook stories

Stories are **not** published with `@maks-it.com/webui`. They live here so the library package stays free of Storybook-only code.

## Layout (mirrors package source)

`stories/components/` maps one-to-one to `components/components/`:

```
components/components/     stories/components/
├── editors/                            ├── editors/
│   └── *.tsx                           │   └── *.stories.tsx
├── Toast/                              ├── Toast/
├── DataTable/                          ├── DataTable/
├── FormLayout/                         ├── FormLayout/
│                                       │   ├── FormContainer.stories.tsx
│                                       │   ├── FormHeader.stories.tsx
│                                       │   ├── FormContent.stories.tsx
│                                       │   └── FormFooter.stories.tsx
├── Layout/                             ├── Layout/
│   └── SideMenu/                       │   └── SideMenu/
├── Scopes/                             ├── Scopes/
├── Offcanvas.tsx                       ├── Offcanvas.stories.tsx
└── LazyLoadTable.tsx                   └── LazyLoadTable.stories.tsx
```

Use the **same folder names** as in the package (`Toast`, not `feedback`; `list`, not `List`). Storybook sidebar titles use the same path: `components/editors/Button`, `components/Toast`, etc.

## Imports

Use the `@webui/*` aliases (configured in `.storybook/main.ts`):

```ts
import { ButtonComponent } from '@webui/components/components/editors/ButtonComponent'
import { Toast } from '@webui/components/components/Toast'
import { withControlledValue } from '../../helpers/controlledField'
```

From `stories/components/<folder>/`, helpers are always `../../helpers/`.

## Conventions

| Topic | Practice |
|--------|----------|
| **Folder** | Same name as under `components/components/` |
| **File name** | Same as component: `ButtonComponent.stories.tsx` |
| **Title** | `components/<folder>/<StoryName>` — mirrors the folder path |
| **Autodocs** | `tags: ['autodocs']` on meta |
| **Controlled fields** | `stories/helpers/controlledField` or `controlledEditors` |

## Adding a story

1. Create the folder under `stories/components/` if it does not exist yet (match the package).
2. Add `<Component>.stories.tsx` in that folder.
3. Run `npm run storybook` from `src/`.

## Testing

Storybook **component tests** run stories as Vitest tests in a real browser (Chromium via Playwright).

### In the Storybook UI

1. Start Storybook: `npm run storybook`
2. Use the **testing widget** at the bottom of the sidebar to run all tests, or use a story’s context menu to run tests for one story/component.
3. Enable **Accessibility** in the widget to include a11y checks (requires `@storybook/addon-a11y`, already configured).
4. Enable **Coverage** in the widget to generate a coverage report for component source under `components/`.
5. Stories with **`play` functions** show results in the **Interactions** panel.

### From the CLI

| Command | Purpose |
|---------|---------|
| `npm run test-storybook` | Run all story tests once (CI-friendly) |
| `npm run test-storybook:watch` | Watch mode while developing stories |
| `npm run test-storybook:coverage` | Run tests + V8 coverage report (`coverage/storybook/`) |

### Interaction tests (`play`)

Use `play` for non-obvious behavior (clicks, async data, a11y state). Import `expect` and `fn` from `storybook/test`; use `canvas`, `userEvent`, and `args` from the play callback:

```tsx
export const Disabled: Story = {
  args: { label: 'Save', disabled: true, onClick: fn() },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: /save/i })
    await userEvent.click(button)
    await expect(button).toBeDisabled()
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}
```

See `components/editors/ButtonComponent.stories.tsx` for examples.

### Visual tests (optional)

[Chromatic](https://www.chromatic.com/) visual regression tests are **not** installed by default (requires a Chromatic account). To add them:

```bash
npx storybook add @chromatic-com/storybook
```

Then use the **Visual tests** section in the testing widget.
