import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Forecast4DayView from '../components/Forecast4DayView'
import { AppTab } from '../types'
import { forecast4DayData } from './fixtures'

afterEach(() => {
  cleanup()
})

describe('Forecast4DayView', () => {
  it('shows loading state when data is null', () => {
    render(<Forecast4DayView data={null} onNavigate={vi.fn()} />)
    expect(screen.getByText('Loading outlook...')).toBeInTheDocument()
  })

  it('renders day cards with forecast summaries', () => {
    render(<Forecast4DayView data={forecast4DayData()} onNavigate={vi.fn()} />)
    expect(screen.getByText('4-Day Outlook')).toBeInTheDocument()
    expect(screen.getByText('Fair and Warm')).toBeInTheDocument()
    expect(screen.getByText('Afternoon Thundery Showers')).toBeInTheDocument()
  })

  it('navigates to nowcast from the insights link', () => {
    const onNavigate = vi.fn()
    render(<Forecast4DayView data={forecast4DayData()} onNavigate={onNavigate} />)

    fireEvent.click(screen.getByText('2-Hour Nowcast'))
    expect(onNavigate).toHaveBeenCalledWith(AppTab.NOWCAST)
  })
})
