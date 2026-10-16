import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import PSIView from '../components/PSIView'
import { ThemeProvider } from '../context/ThemeContext'
import { airQualityData } from './fixtures'

vi.mock('../services/weatherService', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../services/weatherService')>()
  return { ...mod, fetchMycmaqForecast: vi.fn(() => new Promise(() => {})) }
})

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

describe('PSIView', () => {
  it('shows loading state when data is null', () => {
    renderWithTheme(<PSIView data={null} />)
    expect(screen.getByText('Synchronizing air quality...')).toBeInTheDocument()
  })

  it('renders the map with mode toggles', () => {
    renderWithTheme(<PSIView data={airQualityData()} />)
    expect(screen.getByText('Air Quality')).toBeInTheDocument()
    expect(screen.getAllByText('24-hr PSI').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('1-hr PM2.5').length).toBeGreaterThanOrEqual(1)
  })

  it('shows placeholder until a region is selected', () => {
    renderWithTheme(<PSIView data={airQualityData()} />)
    expect(screen.getByText('Select a region on the map')).toBeInTheDocument()
  })

  it('switches mode to PM2.5 and updates the bands card', () => {
    renderWithTheme(<PSIView data={airQualityData()} />)
    expect(screen.getByText('PSI bands')).toBeInTheDocument()

    fireEvent.click(screen.getAllByText('1-hr PM2.5')[0])
    expect(screen.getByText('1-hr PM2.5 bands')).toBeInTheDocument()
  })

  it('renders band legend chips', () => {
    renderWithTheme(<PSIView data={airQualityData()} />)
    expect(screen.getAllByText('Good').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Moderate').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Unhealthy').length).toBeGreaterThanOrEqual(1)
  })

  it('shows forecast toggle and loads MyCMAQ on switch', () => {
    renderWithTheme(<PSIView data={airQualityData()} />)
    expect(screen.getAllByText('Forecast').length).toBeGreaterThanOrEqual(1)
    fireEvent.click(screen.getAllByText('Forecast')[0])
    expect(screen.getByText('Loading PM2.5 forecast...')).toBeInTheDocument()
  })
})
