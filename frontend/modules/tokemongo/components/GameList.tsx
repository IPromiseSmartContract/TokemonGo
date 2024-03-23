import { cn } from '@/lib/utils'
import GameCard from './GameCard'
import { GameInfo } from '../type'

interface GameListProps {
  games: GameInfo[]
  className?: string
}

export default function GameList({ games, className }: GameListProps) {
  return (
    <div className={cn('grid gap-4', className)}>
      {games.map((game) => (
        <GameCard key={game.gameAddress} game={game} canBeJoined />
      ))}
    </div>
  )
}
