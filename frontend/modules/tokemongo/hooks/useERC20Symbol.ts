'use client'

import { useQuery } from '@tanstack/react-query'
import useERC20Contract from './useERC20Contract'

export default function useERC20Symbol(address: string) {
  const { getSymbol } = useERC20Contract(address)

  return useQuery({
    queryKey: ['ERC20', address],
    queryFn: getSymbol,
  })
}
