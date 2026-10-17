import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import SyncFooter from '../components/SyncFooter'

afterEach(() => {
  cleanup()
})

describe('SyncFooter', () => {
  it('renders nothing without a timestamp', () => {
    render(<SyncFooter timestamp={undefined} />)
    expect(screen.queryByText(/Source data last updated at/)).not.toBeInTheDocument()
  })

  it('formats and renders the timestamp', () => {
    render(<SyncFooter timestamp="2024-01-01T10:30:00" />)
    expect(screen.getByText(/Source data last updated at/)).toBeInTheDocument()
  })

  it('renders the timestamp as DD-MMM HH:MM', () => {
    render(<SyncFooter timestamp="2024-01-01T10:30:00" />)
    expect(screen.getByText(/Source data last updated at/)).toHaveTextContent('01-Jan 10:30')
  })

  it('prefers an explicit label over the timestamp', () => {
    render(<SyncFooter timestamp="2024-01-01T10:30:00" label="17-Oct 08:00" />)
    expect(screen.getByText(/Source data last updated at/)).toHaveTextContent('17-Oct 08:00')
  })
})
