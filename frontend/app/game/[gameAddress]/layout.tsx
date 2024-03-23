import TypographyH1 from '@/modules/typography/components/TypographyH1'
import Container from '@/modules/app/components/Container'
import { PropsWithChildren } from 'react'

export default function GameAddressLayout({ children }: PropsWithChildren) {
  return (
    <Container>
      <TypographyH1>Join Game</TypographyH1>

      <div className='mt-4 pb-[150px]'>{children}</div>
    </Container>
  )
}
