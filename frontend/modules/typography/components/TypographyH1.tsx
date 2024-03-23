import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

interface TypographyH1Props {
  className?: string
}

export default function TypographyH1({
  children,
  className,
}: PropsWithChildren<TypographyH1Props>) {
  return (
    <h1
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        className,
      )}
    >
      {children}
    </h1>
  )
}
