import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import LegendModal from '../components/LegendModal'

afterEach(() => {
  cleanup()
})

describe('LegendModal', () => {
  it('renders nothing when closed', () => {
    render(<LegendModal isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByText('Weather Legend')).not.toBeInTheDocument()
  })

  it('renders the legend list when open', () => {
    render(<LegendModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('Weather Legend')).toBeInTheDocument()
    expect(screen.getByText('Heavy Thundery Showers with Gusty Winds')).toBeInTheDocument()
    expect(screen.getByText('Heavy Showers')).toBeInTheDocument()
  })

  it('calls onClose when the footer button is clicked', () => {
    const onClose = vi.fn()
    render(<LegendModal isOpen={true} onClose={onClose} />)

    fireEvent.click(screen.getByText('All good, thanks!'))
    expect(onClose).toHaveBeenCalled()
  })
})
