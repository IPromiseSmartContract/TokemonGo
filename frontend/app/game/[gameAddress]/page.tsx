'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import useMetaMaskContext from '@/modules/metamask/hooks/useMetaMask'
import GameCard from '@/modules/tokemongo/components/GameCard'
import GameJoinForm from '@/modules/tokemongo/components/GameJoinForm'
import useGameDetails from '@/modules/tokemongo/hooks/useGameDetails'
import { parseTime } from '@/modules/tokemongo/utils'
import TypographyH2 from '@/modules/typography/components/TypographyH2'
import TypographyP from '@/modules/typography/components/TypographyP'
import { AlertCircle, InfoIcon, LoaderIcon } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import useTokemonGoContract from '@/modules/tokemongo/hooks/useTokemonGoContract'
import useEndGameMutation from '@/modules/tokemongo/hooks/useEndGameMutation'
import BetCard from '@/modules/tokemongo/components/BetCard'
import useBetForChallengerMutation from '@/modules/tokemongo/hooks/useBetForChallengerMutation'
import useBetForGameMasterMutation from '@/modules/tokemongo/hooks/useBetForGameMasterMutation'
import useERC20Symbol from '@/modules/tokemongo/hooks/useERC20Symbol'
import { ZeroAddress } from 'ethers'

interface GameIdPageProps {
  params: {
    gameAddress: string
  }
}

export default function GameAddressPage({
  params: { gameAddress },
}: GameIdPageProps) {
  const { isConnected, walletAddress } = useMetaMaskContext()
  if (!isConnected) {
    redirect('/')
  }

  const { data: gameDetails } = useGameDetails(gameAddress)
  const { data: gameMasterTokenSymbol } = useERC20Symbol(
    gameDetails?.gameMasterFansTokenAddress || '',
  )
  const { data: challengerTokenSymbol } = useERC20Symbol(
    gameDetails?.challengerFansTokenAddress || '',
  )

  const { onGameEnded } = useTokemonGoContract(gameAddress)
  const { data: game, isLoading, isError, error } = useGameDetails(gameAddress)
  const { mutate: endGame, isPending: isGameEndedPending } =
    useEndGameMutation(gameAddress)

  const { mutate: betForChallenger, isPending: isBetForChallengerPending } =
    useBetForChallengerMutation(gameAddress)
  const { mutate: betForGameMaster, isPending: isBetForGameMasterPending } =
    useBetForGameMasterMutation(gameAddress)

  onGameEnded((data) => {
    const [winner, winnerValueInU, loserValueInU] = data

    if (winner === walletAddress) {
      toast.success('You win!', {
        description: (
          <ul>
            <li>Winner Value: {winnerValueInU}</li>
            <li>Lower Value: {loserValueInU}</li>
          </ul>
        ),
      })
    } else {
      toast.info('You lose!', {
        description: (
          <ul>
            <li>Winner Value: {winnerValueInU}</li>
            <li>Lower Value: {loserValueInU}</li>
          </ul>
        ),
      })
    }
  })

  async function handleEndGame() {
    endGame(void 0, {
      onSuccess: () => {
        toast.success('Game ended!')
      },
      onError: (error) => {
        console.log(error)
        toast.error('Something went wrong', {
          description: error.message,
        })
      },
    })
  }

  async function betForGameMasterHandler(value: number) {
    betForChallenger(value, {
      onSuccess: (value) => {
        toast.success(`Successfully bet Game Master for ${value}!`)
      },
      onError: (error) => {
        console.log(error)
        toast.error('Something went wrong', {
          description: error.message,
        })
      },
    })
  }

  function betForChallengerHandler(value: number) {
    betForGameMaster(value, {
      onSuccess: (value) => {
        toast.success(`Successfully bet Challenger for ${value}!`)
      },
      onError: (error) => {
        console.log(error)
        toast.error('Something went wrong', {
          description: error.message,
        })
      },
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!game) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription>Game is undefined</AlertDescription>
      </Alert>
    )
  }

  // FIXME
  const isGameEnded = game.endTime && +parseTime(game.endTime) <= Date.now()
  const isBetAvailable =
    gameDetails &&
    gameDetails.challengerFansTokenAddress !== ZeroAddress &&
    gameDetails.challengerFansTokenAddress !== ZeroAddress

  return (
    <>
      <GameCard game={game} />

      <TypographyH2 className='mt-8'>Deposit</TypographyH2>

      {isGameEnded ? (
        <Alert className='mt-4'>
          <InfoIcon className='h-4 w-4' />
          <AlertTitle>Game Over</AlertTitle>
          <AlertDescription>
            Time{"'"}s up, make sure you end the game.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <TypographyP className='!mt-4'>
            Join this game by depositing into it.
          </TypographyP>

          <GameJoinForm gameAddress={gameAddress} className='mt-4' />
        </>
      )}

      <TypographyH2 className='mt-8'>Make a Bet</TypographyH2>

      {isGameEnded ? (
        <Alert className='mt-4'>
          <InfoIcon className='h-4 w-4' />
          <AlertTitle>Game Over</AlertTitle>
          <AlertDescription>Time{"'"}s up, end for betting.</AlertDescription>
        </Alert>
      ) : isBetAvailable ? (
        <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <BetCard
            title='Bet for Game Master'
            description='Got faith in Game Master?'
            footer={"Need Game Master's fan tokens?"}
            tokenSymbol={gameMasterTokenSymbol || ''}
            loading={isBetForGameMasterPending}
            onClick={betForGameMasterHandler}
          />
          <BetCard
            title='Bet for Challenger'
            description='Feel lucky for Challenger?'
            footer={"Need challenger's fan tokens?"}
            tokenSymbol={challengerTokenSymbol || ''}
            loading={isBetForChallengerPending}
            onClick={betForChallengerHandler}
          />
        </div>
      ) : (
        <Alert className='mt-4'>
          <InfoIcon className='h-4 w-4' />
          <AlertTitle>Bet Not Yet Available</AlertTitle>
          <AlertDescription>
            Both Game Master and Challenger have to deposit first.
          </AlertDescription>
        </Alert>
      )}

      {isGameEnded && (
        <>
          <TypographyH2 className='mt-8'>End the Game</TypographyH2>

          <Button
            type='button'
            className='mt-4'
            onClick={handleEndGame}
            disabled={isGameEndedPending}
          >
            {isGameEndedPending ? (
              <LoaderIcon className='w-4 h-4 animate-spin' />
            ) : (
              <span>Let{"'"}s go</span>
            )}
          </Button>
        </>
      )}
    </>
  )
}
