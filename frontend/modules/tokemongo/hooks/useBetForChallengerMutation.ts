'use client'

import { useMutation } from '@tanstack/react-query'
import useTokemonGoContract from './useTokemonGoContract'

export default function useBetForChallengerMutation(gameAddress: string) {
  const { betForChallenger } = useTokemonGoContract(gameAddress)

  return useMutation({
    mutationFn: betForChallenger,
  })
}
