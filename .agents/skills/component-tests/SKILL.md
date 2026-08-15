---
name: component-tests
description: Write and modify component tests for Modern Weather.sg (Vitest + Testing Library, jsdom). Covers ThemeProvider wrapping, the data-theme/localStorage reset that prevents cross-test theme leaks, vi.mock path rules, duplicate-text assertions, map-vs-grid view gotchas, the vitest define mirror, and the shared test/fixtures.ts mock builders. Load before writing or modifying any test in test/.
---

# Component Tests — Modern Weather.sg

Vitest + `@testing-library/react` + jsdom (`test/setup.ts` imports
`@testing-library/jest-dom/vitest`; `globals: true`). Repo style imports
`describe/it/expect` from `vitest` explicitly (works either way).

## Hard rules (each one caused a real failure)

1. **ThemeProvider wrapper** — any component using `useTheme()` (NowcastView,
   PSIView, RainAreasView, Forecast24hView, ThemeToggle) must render inside
   `<ThemeProvider>`. Non-theme components (LegendModal, SyncFooter,
   Forecast4DayView) render bare.
2. **Reset theme state in `beforeEach`** — ThemeProvider reads BOTH
   `localStorage['catppuccin-theme']` AND `documentElement[data-theme]` on
   mount. The `data-theme` attribute survives `cleanup()` across tests in a
   file. Always reset both:
   ```ts
   beforeEach(() => {
     localStorage.clear()
     document.documentElement.removeAttribute('data-theme')
   })
   ```
   Missing the second line = tests 3+ inherit latte from an earlier toggle.
3. **`vi.mock` paths are relative to the TEST FILE**, not the repo root.
   `test/App.test.tsx` must mock `'../services/weatherService'` — mocking
   `'./services/weatherService'` silently mocks a non-existent module and the
   real fetchers run (test hits live network / fails).
4. **Use `test/fixtures.ts` for all data shapes** — never inline big mock
   objects in a suite. Builders return fresh copies per call (no cross-test
   mutation). If a shape is missing, add a builder there, not per-file.
5. **`React.ReactNode` type in a render helper** needs
   `import type React from 'react'` — the `React` namespace is not a global
   under this tsconfig.
6. **Duplicate text = `getAllByText`** — region chips repeat forecast strings
   (5 regions share 'Cloudy'), and PSI band names repeat across region chips +
   legend. `getByText('Moderate')` throws "multiple elements". Assert
   `.length >= 1` or target a unique string.
7. **Map views hide area labels** — NowcastView/PSIView default to map mode
   where markers render icons only. To assert an area name, click the
   "Grid"/list toggle first (`fireEvent.click(screen.getAllByText('Grid')[0])`).
8. **Footer version test** asserts the shape, not an exact patch:
   `expect(await screen.findByText(/v1\.4\./)).toBeInTheDocument()`.
   `vitest.config.ts` mirrors the Vite `__APP_VERSION__` define so the real
   version renders, but exact-string asserts break on every bump.

## Mocking the service layer (App root tests)

```ts
vi.mock('../services/weatherService', () => ({
  fetchNowcast: vi.fn(),
  fetch24hForecast: vi.fn(),
  fetch4DayForecast: vi.fn(),
  fetchAirQuality: vi.fn(),
}))

import * as weatherService from '../services/weatherService'

beforeEach(() => {
  localStorage.clear()
  window.scrollTo = vi.fn() // jsdom lacks scrollTo
  vi.mocked(weatherService.fetchNowcast).mockResolvedValue(nowcastData())
  // ...other three fetchers
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
```

Re-arm mocks in `beforeEach`, never in the factory (hoisting). Error-path
test: re-`mockRejectedValue` all four fetchers in the test body, then assert
the "Sync error" screen + "Retry connection" button.

## Async render

Views fetch nothing themselves (props in), so `render` is usually synchronous.
The App root test needs `await screen.findByRole('heading', ...)` /
`findByText` because data resolves via the mocked Promise. `waitFor` only when
a callback (effect → setState) gates a second render.

## Timer-bearing components

RainAreasView runs `setInterval` (60 s history refresh) — safe under jsdom;
the interval never fires within a test. No fake timers needed. App's 5-min
interval is likewise inert.

## Fixtures

`test/fixtures.ts` exports:

- `nowcastData()` — 3 areas (Ang Mo Kio / Bedok / Changi) for search-filter tests.
- `forecast24hData()` — 2 periods (Morning: Cloudy + Fair (Day); Afternoon:
  Thundery Showers) for period-switch tests.
- `forecast4DayData()` — 2 days (Fair and Warm / Afternoon Thundery Showers).
- `airQualityData()` — all regions PSI 55 (Moderate) + PM2.5 values.

## Verify

`npm run test` — all suites must pass (50 tests / 12 suites). Then
`npm run build && npm run lint` before committing.
