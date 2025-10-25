'use client'

import React from 'react'

interface Props {
  size?: number // px
  stroke?: number // px
  value: number // 0-100
  trackColor?: string
  progressColor?: string
  children?: React.ReactNode
}

export default function ProgressRing({
  size = 72,
  stroke = 6,
  value,
  trackColor = '#E5E7EB', // slate-200
  progressColor = '#0F172A', // slate-900
  children,
}: Props) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  const offset = c - (clamped / 100) * c

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={progressColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-slate-900">
        {Math.round(clamped)}%
      </div>
      {children}
    </div>
  )
}
