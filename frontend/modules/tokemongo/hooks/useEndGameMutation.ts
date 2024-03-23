'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import useTokemonGoContract from './useTokemonGoContract'

export default function useEndGameMutation(gameAddress: string) {
  const queryClient = useQueryClient()
  const { clearGameEndedData, endGame } = useTokemonGoContract(gameAddress)

  return useMutation({
    mutationFn: endGame,
    onMutate: () => {
      clearGameEndedData()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['game', gameAddress, 'details'],
      })
    },
  })
}
