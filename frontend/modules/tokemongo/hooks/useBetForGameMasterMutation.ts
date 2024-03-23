'use client'

import { useMutation } from '@tanstack/react-query'
import useTokemonGoContract from './useTokemonGoContract'

export default function useBetForGameMasterMutation(gameAddress: string) {
  const { betForGameMaster } = useTokemonGoContract(gameAddress)

  return useMutation({
    mutationFn: betForGameMaster,
  })
}
