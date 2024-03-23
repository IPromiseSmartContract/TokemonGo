import { useQuery } from '@tanstack/react-query'
import useTokemonGoContract from './useTokemonGoContract'

export default function useGameDetails(gameAddress: string) {
  const { getGameDetails } = useTokemonGoContract(gameAddress)

  return useQuery({
    queryKey: ['game', gameAddress, 'details'],
    queryFn: getGameDetails,
  })
}
