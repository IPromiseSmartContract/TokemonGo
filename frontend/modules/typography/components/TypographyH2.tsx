import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

interface TypographyH2Props {
  className?: string
}

export default function TypographyH2({
  children,
  className,
}: PropsWithChildren<TypographyH2Props>) {
  return (
    <h2
      className={cn(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        className,
      )}
    >
      {children}
    </h2>
  )
}
