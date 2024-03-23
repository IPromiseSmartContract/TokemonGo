'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { TokemoGo__factory } from '@/typechain/factories/contracts/TokemoGo.sol'
import useMetaMaskContext from '@/modules/metamask/hooks/useMetaMask'
import { GameDetails, GameJoinFormSchema } from '../type'

export default function useTokemonGoContract(address: string) {
  const { signer } = useMetaMaskContext()
  const [shouldCallback, setShouldCallback] = useState(false)
  const [gameEndedData, setGameEndedData] = useState<any[] | undefined>(
    undefined,
  )
  const gameEndedCallbackRef = useRef<((data: any) => void) | null>(null)

  const tokemonGoContract = useMemo(
    () =>
      signer &&
      TokemoGo__factory.connect(
        address || 'TOKEMON_GO_CONTRACT_ADDRESS',
        signer,
      ),
    [signer, address],
  )

  tokemonGoContract?.on(
    tokemonGoContract.filters.GameEnded(),
    (newGameEndedData: any) => {
      setGameEndedData(newGameEndedData.args)
      setShouldCallback(true)
    },
  )

  useEffect(() => {
    if (!shouldCallback) {
      return
    }

    gameEndedCallbackRef.current?.(gameEndedData)
    setShouldCallback(false)
    clearGameEndedData()
  }, [shouldCallback, setShouldCallback, gameEndedData, gameEndedCallbackRef])

  async function getGameDetails() {
    if (!tokemonGoContract) {
      return undefined
    }

    const [
      master,
      assetValue,
      endTime,
      gameMasterFansTokenAddress,
      challengerFansTokenAddress,
    ] = await Promise.all([
      tokemonGoContract.gameMaster(),
      tokemonGoContract.assetValue(),
      tokemonGoContract.endTime(),
      (await tokemonGoContract.gameMasterDetails()).fansToken,
      (await tokemonGoContract.challengerDetails()).fansToken,
    ])

    return {
      gameAddress: address,
      master,
      assetValue: Number(assetValue),
      endTime: new Date(Number(endTime)),
      gameMasterFansTokenAddress,
      challengerFansTokenAddress,
    } as GameDetails
  }

  async function joinGame(data: GameJoinFormSchema) {
    if (!tokemonGoContract) {
      throw new Error('Contract not initialized')
    }

    const { amount, tokens, fansTokenAddress } = data
    const tx = await tokemonGoContract.depositUSDC(
      amount,
      tokens,
      fansTokenAddress,
    )

    return await tx.wait()
  }

  async function endGame() {
    if (!tokemonGoContract) {
      throw new Error('Contract not initialized')
    }

    const tx = await tokemonGoContract.endGame()

    return await tx.wait()
  }

  function clearGameEndedData() {
    setGameEndedData(undefined)
  }

  function onGameEnded(cb: (data: any) => void) {
    gameEndedCallbackRef.current = cb
  }

  async function betForChallenger(value: number) {
    if (!tokemonGoContract) {
      throw new Error('Contract not initialized')
    }

    const tx = await tokemonGoContract.betForChallenger(value)
    return tx.wait()
  }

  async function betForGameMaster(value: number) {
    if (!tokemonGoContract) {
      throw new Error('Contract not initialized')
    }

    const tx = await tokemonGoContract.betForGameMaster(value)
    return tx.wait()
  }

  return {
    tokemonGoContract,

    getGameDetails,
    joinGame,
    endGame,

    onGameEnded,
    clearGameEndedData,

    betForChallenger,
    betForGameMaster,
  }
}
