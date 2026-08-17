import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Forecast24hView from '../components/Forecast24hView'
import { ThemeProvider } from '../context/ThemeContext'
import { forecast24hData } from './fixtures'

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

afterEach(() => {
  cleanup()
})

describe('Forecast24hView', () => {
  it('shows loading state when data is null', () => {
    renderWithTheme(<Forecast24hView data={null} />)
    expect(screen.getByText('Synchronizing forecast...')).toBeInTheDocument()
  })

  it('renders general forecast and period tabs', () => {
    renderWithTheme(<Forecast24hView data={forecast24hData()} />)
    expect(screen.getByText('24-Hour Forecast')).toBeInTheDocument()
    expect(screen.getAllByText('Morning').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Afternoon').length).toBeGreaterThanOrEqual(1)
  })

  it('shows first period region forecasts by default', () => {
    renderWithTheme(<Forecast24hView data={forecast24hData()} />)
    expect(screen.getAllByText('Cloudy').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Fair (Day)').length).toBeGreaterThanOrEqual(1)
  })

  it('switches to the next period on tab click', () => {
    renderWithTheme(<Forecast24hView data={forecast24hData()} />)
    expect(screen.queryByText('Thundery Showers')).not.toBeInTheDocument()

    fireEvent.click(screen.getAllByText('Afternoon')[0])
    expect(screen.getAllByText('Thundery Showers').length).toBeGreaterThanOrEqual(1)
  })
})
