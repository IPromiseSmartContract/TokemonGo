'use client'

import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

interface TypographySmallProps {
  className?: string
}

export function TypographySmall({
  className,
  children,
}: PropsWithChildren<TypographySmallProps>) {
  return (
    <small className={cn('text-sm font-medium leading-none', className)}>
      {children}
    </small>
  )
}
