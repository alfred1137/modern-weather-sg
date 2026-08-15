import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import RainAreasView from '../components/RainAreasView'
import { ThemeProvider } from '../context/ThemeContext'

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

describe('RainAreasView', () => {
  it('renders header with Live badge', () => {
    renderWithTheme(<RainAreasView syncTimestamp="2024-01-01T10:00:00" />)
    expect(screen.getByText('Rain Areas')).toBeInTheDocument()
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('renders radar frame once history is generated', async () => {
    renderWithTheme(<RainAreasView syncTimestamp="2024-01-01T10:00:00" />)
    expect(await screen.findByAltText('Rain Overlay')).toBeInTheDocument()
    expect(screen.getByAltText('Base Map')).toBeInTheDocument()
  })

  it('switches to regional mode', async () => {
    renderWithTheme(<RainAreasView syncTimestamp="2024-01-01T10:00:00" />)
    fireEvent.click(screen.getAllByText('Regional')[0])
    const baseMap = await screen.findByAltText('Base Map')
    expect(baseMap.getAttribute('src')).toContain('240km')
  })

  it('renders intensity legend labels', () => {
    renderWithTheme(<RainAreasView syncTimestamp="2024-01-01T10:00:00" />)
    expect(screen.getByText('Heavy')).toBeInTheDocument()
    expect(screen.getByText('Moderate')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
  })
})
