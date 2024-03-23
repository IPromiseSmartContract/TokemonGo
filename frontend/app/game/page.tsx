'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Container from '@/modules/app/components/Container'
import useMetaMaskContext from '@/modules/metamask/hooks/useMetaMask'
import GameList from '@/modules/tokemongo/components/GameList'
import TypographyH1 from '@/modules/typography/components/TypographyH1'
import TypographyP from '@/modules/typography/components/TypographyP'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import useGameInfo from '@/modules/tokemongo/hooks/useGameInfo'

export default function GamePage() {
  const { isConnected } = useMetaMaskContext()
  if (!isConnected) {
    redirect('/')
  }

  const { data: games, isPending, isError, error } = useGameInfo()

  return (
    <Container>
      <TypographyH1>Games</TypographyH1>
      <TypographyP className='!mt-4'>
        Find a game. Start to play by joining it. or
        <Button asChild className='ml-4'>
          <Link href='/game/create'>Create a game</Link>
        </Button>
      </TypographyP>

      <div className='mt-8'>
        {isPending && <div>loading...</div>}

        {isError && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Something went wrong!</AlertTitle>
            <AlertDescription>{error?.message}</AlertDescription>
          </Alert>
        )}

        {games?.length && <GameList games={games} />}
      </div>
    </Container>
  )
}
