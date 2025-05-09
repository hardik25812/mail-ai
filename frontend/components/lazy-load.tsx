"use client"

import React, { Suspense } from 'react'
import { LoadingSpinner } from './ui/loading-spinner'

interface LazyLoadProps {
  children: React.ReactNode
}

export function LazyLoad({ children }: LazyLoadProps) {
  return (
    <Suspense fallback={<div className="flex justify-center p-4"><LoadingSpinner /></div>}>
      {children}
    </Suspense>
  )
}
