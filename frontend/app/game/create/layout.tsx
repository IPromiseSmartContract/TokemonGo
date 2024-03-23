'use client'

import TypographyH1 from '@/modules/typography/components/TypographyH1'
import TypographyP from '@/modules/typography/components/TypographyP'
import Container from '@/modules/app/components/Container'
import { PropsWithChildren } from 'react'

export default function GameCreateLayout({ children }: PropsWithChildren) {
  return (
    <Container>
      <TypographyH1>Create a Game</TypographyH1>
      <TypographyP className='!mt-4'>
        Become game master, make rules yourself!
      </TypographyP>

      <div className='mt-8'>{children}</div>
    </Container>
  )
}
