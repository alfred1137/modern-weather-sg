import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NowcastView from '../components/NowcastView'
import { ThemeProvider } from '../context/ThemeContext'
import { NowcastData } from '../types'

const mockData: NowcastData = {
  updateTimestamp: '2024-01-01T10:00:00',
  validPeriod: { start: '2024-01-01T10:00:00', end: '2024-01-01T12:00:00' },
  items: [
    { area: 'Ang Mo Kio', forecast: 'Light Rain' },
    { area: 'Bedok', forecast: 'Cloudy' },
    { area: 'Changi', forecast: 'Fair (Day)' },
  ],
}

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('NowcastView', () => {
  it('shows loading state when data is null', () => {
    renderWithTheme(<NowcastView data={null} />)
    expect(screen.getByText('Loading nowcast...')).toBeInTheDocument()
  })

  it('renders map view by default', () => {
    renderWithTheme(<NowcastView data={mockData} />)
    expect(screen.getByText('Tap Icons')).toBeInTheDocument()
  })

  it('switches to grid view on button click', () => {
    renderWithTheme(<NowcastView data={mockData} />)

    const gridButtons = screen.getAllByText('Grid')
    fireEvent.click(gridButtons[0])

    expect(screen.getByPlaceholderText('SEARCH AREA...')).toBeInTheDocument()
  })

  it('filters areas in grid view by search', () => {
    renderWithTheme(<NowcastView data={mockData} />)

    const gridButtons = screen.getAllByText('Grid')
    fireEvent.click(gridButtons[0])

    const searchInput = screen.getByPlaceholderText('SEARCH AREA...')
    fireEvent.change(searchInput, { target: { value: 'Bedok' } })

    expect(screen.getByText('Bedok')).toBeInTheDocument()
    expect(screen.queryByText('Ang Mo Kio')).not.toBeInTheDocument()
    expect(screen.queryByText('Changi')).not.toBeInTheDocument()
  })

  it('displays valid period times', () => {
    renderWithTheme(<NowcastView data={mockData} />)
    expect(screen.getAllByText(/10:00/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/12:00/).length).toBeGreaterThanOrEqual(1)
  })
})
