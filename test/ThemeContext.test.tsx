import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

let toggleFn: () => void = () => {}

function TestComponent() {
  const { theme, toggleTheme } = useTheme()
  // eslint-disable-next-line react-hooks/globals
  toggleFn = toggleTheme
  return <span data-testid="theme">{theme}</span>
}

beforeEach(() => {
  localStorage.clear()
  toggleFn = () => {}
})

afterEach(() => {
  cleanup()
})

describe('ThemeContext', () => {
  it('defaults to macchiato', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('macchiato')
  })

  it('toggles to latte', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )
    act(() => {
      toggleFn()
    })
    expect(screen.getByTestId('theme')).toHaveTextContent('latte')
  })

  it('toggles back to macchiato', () => {
    localStorage.setItem('catppuccin-theme', 'latte')
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('latte')
    act(() => {
      toggleFn()
    })
    expect(screen.getByTestId('theme')).toHaveTextContent('macchiato')
  })

  it('throws when useTheme used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestComponent />)).toThrow('useTheme must be used within ThemeProvider')
    consoleSpy.mockRestore()
  })
})
