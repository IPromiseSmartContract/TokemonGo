'use client'

import { useQuery } from '@tanstack/react-query'
import useTokemonGoFactoryContract from './useTokemonGoFactoryContract'

export default function useGameInfo() {
  const { getGameInfo } = useTokemonGoFactoryContract()

  return useQuery({
    queryKey: ['tokemonGoFactoryContract', 'gameInfo'],
    queryFn: getGameInfo,
  })
}
