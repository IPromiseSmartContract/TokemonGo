'use client'

import { useMutation } from '@tanstack/react-query'
import useTokemonGoContract from './useTokemonGoContract'

export default function useJoinGameMutation(gameAddress: string) {
  const { joinGame } = useTokemonGoContract(gameAddress)

  return useMutation({
    mutationFn: joinGame,
  })
}
