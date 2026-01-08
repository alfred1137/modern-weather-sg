import React from 'react';

interface Props {
  timestamp: string | undefined;
  className?: string;
}

const SyncFooter: React.FC<Props> = ({ timestamp, className = '' }) => {
  if (!timestamp) return null;

  const timeStr = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });

  return (
    <div className={`flex justify-end items-center px-4 w-full mt-4 ${className}`}>
      <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-overlay1">
        <i className="fas fa-circle-info text-blue/50 text-[10px]"></i>
        <span>
          Source data last updated at <span className="text-subtext0">{timeStr}</span>
        </span>
      </div>
    </div>
  );
};

export default SyncFooter;