import React from 'react'
import { formatShortDateTime } from '../constants'

interface Props {
  /** ISO timestamp, rendered as `DD-MMM HH:MM` in the viewer's local time. */
  timestamp?: string
  /** Preformatted time, for data whose wall-clock is fixed (e.g. MyCMAQ LST frames). */
  label?: string
  className?: string
}

const SyncFooter: React.FC<Props> = ({ timestamp, label, className = '' }) => {
  const text = label ?? (timestamp ? formatShortDateTime(new Date(timestamp)) : null)
  if (!text) return null

  return (
    <div className={`flex justify-end items-center px-4 w-full mt-4 ${className}`}>
      <div className="flex items-center gap-2 text-[11px] md:text-xs font-medium text-subtext0">
        <i className="fas fa-circle-info text-blue/50 text-[10px]"></i>
        <span>
          Source data last updated at <span className="text-subtext0">{text}</span>
        </span>
      </div>
    </div>
  )
}

export default SyncFooter
