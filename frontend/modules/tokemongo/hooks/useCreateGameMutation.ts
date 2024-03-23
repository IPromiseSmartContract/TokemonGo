'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import useTokemonGoFactoryContract from './useTokemonGoFactoryContract'

export default function useCreateGameMutation() {
  const queryClient = useQueryClient()
  const { clearGameCreatedData, createGame } = useTokemonGoFactoryContract()

  return useMutation({
    mutationFn: createGame,
    onMutate: () => {
      clearGameCreatedData()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tokemonGoFactoryContract', 'gameInfo'],
      })
      queryClient.invalidateQueries({
        queryKey: ['tokemonGoFactoryContract', 'deployedGames'],
      })
    },
  })
}
