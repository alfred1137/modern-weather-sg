import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NowcastView from '../components/NowcastView'
import { ThemeProvider } from '../context/ThemeContext'
import { nowcastData } from './fixtures'

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('NowcastView', () => {
  it('shows loading state when data is null', () => {
    renderWithTheme(<NowcastView data={null} />)
    expect(screen.getByText('Loading nowcast...')).toBeInTheDocument()
  })

  it('renders map view by default', () => {
    renderWithTheme(<NowcastView data={nowcastData()} />)
    expect(screen.getByText('Tap icons')).toBeInTheDocument()
  })

  it('switches to grid view on button click', () => {
    renderWithTheme(<NowcastView data={nowcastData()} />)

    const gridButtons = screen.getAllByText('Grid')
    fireEvent.click(gridButtons[0])

    expect(screen.getByPlaceholderText('Search area...')).toBeInTheDocument()
  })

  it('filters areas in grid view by search', () => {
    renderWithTheme(<NowcastView data={nowcastData()} />)

    const gridButtons = screen.getAllByText('Grid')
    fireEvent.click(gridButtons[0])

    const searchInput = screen.getByPlaceholderText('Search area...')
    fireEvent.change(searchInput, { target: { value: 'Bedok' } })

    expect(screen.getByText('Bedok')).toBeInTheDocument()
    expect(screen.queryByText('Ang Mo Kio')).not.toBeInTheDocument()
    expect(screen.queryByText('Changi')).not.toBeInTheDocument()
  })

  it('displays valid period times', () => {
    renderWithTheme(<NowcastView data={nowcastData()} />)
    expect(screen.getAllByText(/10:00/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/12:00/).length).toBeGreaterThanOrEqual(1)
  })
})
