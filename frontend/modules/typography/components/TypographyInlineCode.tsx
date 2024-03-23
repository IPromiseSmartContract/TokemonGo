import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

interface TypographyInlineCodeProps {
  className?: string
}

export default function TypographyInlineCode({
  children,
  className,
}: PropsWithChildren<TypographyInlineCodeProps>) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className,
      )}
    >
      {children}
    </code>
  )
}
