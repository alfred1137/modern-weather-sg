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
})
