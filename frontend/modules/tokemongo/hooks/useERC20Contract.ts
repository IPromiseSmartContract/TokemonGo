'use client'

import { token } from '@/typechain/factories/@openzeppelin/contracts'
import { useMemo } from 'react'
import useMetaMaskContext from '@/modules/metamask/hooks/useMetaMask'

export default function useERC20Contract(address: string) {
  const { signer } = useMetaMaskContext()

  const tokenContract = useMemo(
    () =>
      signer &&
      token.erc20.ERC20__factory.connect(
        address || 'ERC20_CONTRACT_ADDRESS',
        signer,
      ),
    [signer, address],
  )

  async function getSymbol() {
    if (!tokenContract) {
      return undefined
    }

    return await tokenContract.symbol()
  }

  return { tokenContract, getSymbol }
}
