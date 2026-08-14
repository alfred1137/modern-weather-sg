import React from 'react'

const FloodWarningView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      <header className="flex flex-col gap-1 pr-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-text leading-none">
          Coming Soon
        </h1>
        <p className="text-overlay1 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2">
          New feature on its way
        </p>
      </header>

      <div className="glass p-12 rounded-[40px] flex flex-col items-center justify-center text-center border border-surface1/20 bg-surface0/20">
        <div className="w-20 h-20 bg-blue/10 rounded-full flex items-center justify-center mb-6 border border-blue/20">
          <i className="fas fa-wand-magic-sparkles text-blue text-3xl"></i>
        </div>
        <h2 className="text-2xl font-black text-text mb-2 uppercase tracking-tighter">
          Stay Tuned
        </h2>
        <p className="text-overlay1 max-w-sm text-xs font-medium leading-relaxed">
          A new feature is being crafted. Check back soon for updates.
        </p>
      </div>
    </div>
  )
}

export default FloodWarningView
