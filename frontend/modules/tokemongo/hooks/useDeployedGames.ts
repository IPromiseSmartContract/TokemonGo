'use client'

import { useQuery } from '@tanstack/react-query'
import useTokemonGoFactoryContract from './useTokemonGoFactoryContract'

export default function useDeployedGames() {
  const { getDeployedGames } = useTokemonGoFactoryContract()

  return useQuery({
    queryKey: ['tokemonGoFactoryContract', 'deployedGames'],
    queryFn: getDeployedGames,
  })
}
