import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Forecast4DayView from '../components/Forecast4DayView'
import { AppTab, Forecast4Day } from '../types'

const mockData: Forecast4Day = {
  updateTimestamp: '2024-01-01T10:00:00',
  items: [
    {
      date: '2024-01-02T00:00:00',
      forecast: 'Fair (Day)',
      summary: 'Fair and Warm',
      relative_humidity: { low: 50, high: 85 },
      temperature: { low: 25, high: 33 },
      wind: { speed: { low: 10, high: 20 }, direction: 'SW' },
    },
    {
      date: '2024-01-03T00:00:00',
      forecast: 'Thundery Showers',
      summary: 'Afternoon Thundery Showers',
      relative_humidity: { low: 55, high: 90 },
      temperature: { low: 24, high: 32 },
      wind: { speed: { low: 5, high: 15 }, direction: 'S' },
    },
  ],
}

afterEach(() => {
  cleanup()
})

describe('Forecast4DayView', () => {
  it('shows loading state when data is null', () => {
    render(<Forecast4DayView data={null} onNavigate={vi.fn()} />)
    expect(screen.getByText('Loading outlook...')).toBeInTheDocument()
  })

  it('renders day cards with forecast summaries', () => {
    render(<Forecast4DayView data={mockData} onNavigate={vi.fn()} />)
    expect(screen.getByText('4-Day Outlook')).toBeInTheDocument()
    expect(screen.getByText('Fair and Warm')).toBeInTheDocument()
    expect(screen.getByText('Afternoon Thundery Showers')).toBeInTheDocument()
  })

  it('navigates to nowcast from the insights link', () => {
    const onNavigate = vi.fn()
    render(<Forecast4DayView data={mockData} onNavigate={onNavigate} />)

    fireEvent.click(screen.getByText('2-Hour Nowcast'))
    expect(onNavigate).toHaveBeenCalledWith(AppTab.NOWCAST)
  })
})
