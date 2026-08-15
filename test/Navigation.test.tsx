import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Navigation from '../components/Navigation'
import { AppTab } from '../types'

describe('Navigation', () => {
  it('renders all 5 tabs', () => {
    render(<Navigation activeTab={AppTab.NOWCAST} setActiveTab={vi.fn()} />)

    expect(screen.getAllByText('Nowcast').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Rain Areas').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Air Quality').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('24-Hour').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('4-Day').length).toBeGreaterThanOrEqual(1)
  })

  it('calls setActiveTab with correct tab id on click', () => {
    const setActiveTab = vi.fn()
    render(<Navigation activeTab={AppTab.NOWCAST} setActiveTab={setActiveTab} />)

    fireEvent.click(screen.getAllByText('Rain Areas')[0])
    expect(setActiveTab).toHaveBeenCalledWith(AppTab.RAIN_AREAS)
  })

  it('highlights active tab', () => {
    render(<Navigation activeTab={AppTab.FORECAST_24H} setActiveTab={vi.fn()} />)

    const activeButtons = screen.getAllByText('24-Hour')
    const activeTab = activeButtons[0].closest('button')
    expect(activeTab).toHaveClass('text-blue')
  })
})
