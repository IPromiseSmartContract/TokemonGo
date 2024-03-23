'use client'

import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

interface ContainerProps {
  className?: string
}

export default function Container({
  children,
  className,
}: PropsWithChildren<ContainerProps>) {
  return (
    <div className={cn('container mx-auto mt-8 mb-8', className)}>
      {children}
    </div>
  )
}
