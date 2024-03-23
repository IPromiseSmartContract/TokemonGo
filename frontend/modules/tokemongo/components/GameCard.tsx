'use client'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GameDetails, GameInfo } from '../type'
import { formatTime } from '../utils'
import { BookUserIcon, CircleDollarSignIcon, TimerIcon } from 'lucide-react'
import AdaptiveAddress from './AdaptiveAddress'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GameCardProps {
  game: GameDetails | GameInfo
  canBeJoined?: boolean
  className?: string
}

export default function GameCard({
  game,
  canBeJoined,
  className,
}: GameCardProps) {
  if (!game) {
    return null
  }

  return (
    <Card className={cn('grid grid-cols-12 items-center', className)}>
      <div className='col-span-12 md:col-span-10'>
        <CardHeader className='!min-w-0'>
          <CardTitle className='font-mono'>
            <AdaptiveAddress address={game.gameAddress} />
          </CardTitle>
        </CardHeader>

        <CardContent className='grid gap-2'>
          <div className='flex items-center gap-3'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <BookUserIcon className='w-5 h-5' />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Game Master</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AdaptiveAddress address={game.master} />
          </div>
          <div className='flex items-center gap-3'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <CircleDollarSignIcon className='w-5 h-5' />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Asset Value</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span>{game.assetValue.toString()}</span>
          </div>
          <div className='flex items-center gap-3'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <TimerIcon className='w-5 h-5' />
                </TooltipTrigger>
                <TooltipContent>
                  <p>End Time</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span>{formatTime(game.endTime)}</span>
          </div>
        </CardContent>
      </div>

      <CardFooter className='col-span-12 md:col-span-2 md:p-6 flex md:justify-end'>
        {canBeJoined && (
          <Button asChild>
            <Link href={`/game/${game.gameAddress}`}>Join</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
