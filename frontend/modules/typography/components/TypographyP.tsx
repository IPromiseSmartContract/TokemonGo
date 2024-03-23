import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

interface TypographyPProps {
  className?: string
}

export default function TypographyP({
  children,
  className,
}: PropsWithChildren<TypographyPProps>) {
  return (
    <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}>
      {children}
    </p>
  )
}
