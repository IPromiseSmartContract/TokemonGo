'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { TokemoGoFactory__factory } from '@/typechain/factories/contracts'
import useMetaMaskContext from '@/modules/metamask/hooks/useMetaMask'
import { GameCreateFormSchema } from '../type'

export default function useTokemonGoFactoryContract() {
  const { signer } = useMetaMaskContext()
  const [shouldCallback, setShouldCallback] = useState(false)
  const [gameCreatedData, setGameCreatedData] = useState<any[] | undefined>(
    undefined,
  )
  const gameCreatedCallbackRef = useRef<((data: any) => void) | null>(null)

  const tokemonGoFactoryContract = useMemo(
    () =>
      signer &&
      TokemoGoFactory__factory.connect(
        process.env.NEXT_PUBLIC_TOKEMON_GO_FACTORY_CONTRACT_ADDRESS ||
          'ADDRESS_NOT_CONFIGURED',
        signer,
      ),
    [signer],
  )

  tokemonGoFactoryContract?.on(
    tokemonGoFactoryContract.filters.GameCreated(),
    (newGameCreatedData: any) => {
      setGameCreatedData(newGameCreatedData.args)
      setShouldCallback(true)
    },
  )

  useEffect(() => {
    if (!shouldCallback) {
      return
    }

    gameCreatedCallbackRef.current?.(gameCreatedData)
    setShouldCallback(false)
    clearGameCreatedData()
  }, [
    shouldCallback,
    setShouldCallback,
    gameCreatedData,
    gameCreatedCallbackRef,
  ])

  async function getDeployedGames() {
    if (!tokemonGoFactoryContract) {
      return []
    }

    return await tokemonGoFactoryContract.getDeployedGames()
  }

  async function getGameInfo() {
    if (!tokemonGoFactoryContract) {
      return []
    }

    return await tokemonGoFactoryContract.getGameInfo()
  }

  async function createGame(data: GameCreateFormSchema) {
    if (!tokemonGoFactoryContract) {
      throw new Error('Contract not initialized')
    }

    const { usdc, assetValue, endTime } = data
    const tx = await tokemonGoFactoryContract.createGame(
      usdc,
      assetValue,
      +endTime,
    )
    return await tx.wait()
  }

  function clearGameCreatedData() {
    setGameCreatedData(undefined)
  }

  function onGameCreated(cb: (data: any) => void) {
    gameCreatedCallbackRef.current = cb
  }

  return {
    tokemonGoFactoryContract,

    getDeployedGames,
    getGameInfo,
    createGame,

    onGameCreated,
    clearGameCreatedData,
  }
}
