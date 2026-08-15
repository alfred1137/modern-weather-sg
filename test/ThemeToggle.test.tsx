import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ThemeToggle from '../components/ThemeToggle'
import { ThemeProvider } from '../context/ThemeContext'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

afterEach(() => {
  cleanup()
})

describe('ThemeToggle', () => {
  it('starts in macchiato and offers light theme', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    expect(screen.getByLabelText('Switch to Light Theme')).toBeInTheDocument()
  })

  it('toggles to latte on click', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByLabelText('Switch to Light Theme'))
    expect(screen.getByLabelText('Switch to Dark Theme')).toBeInTheDocument()
  })

  it('persists the choice and restores it on remount', () => {
    const { unmount } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByLabelText('Switch to Light Theme'))
    unmount()

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    expect(screen.getByLabelText('Switch to Dark Theme')).toBeInTheDocument()
  })
})
