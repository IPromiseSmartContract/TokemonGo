'use client'

import { PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { MetaMaskContext } from '../context'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowDownToLineIcon, Link } from 'lucide-react'

export default function MetaMaskContextProvider({
  children,
}: PropsWithChildren) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const hasProvider = !!provider

  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
  const isConnected = !!signer

  const [walletAddress, setWalletAddress] = useState<string | undefined>(
    undefined,
  )

  useEffect(() => {
    if (!window.ethereum) {
      return
    }

    const provider = new BrowserProvider(window.ethereum)
    setProvider(provider)
  }, [])

  const connectMetaMask = useCallback(async () => {
    if (!hasProvider) {
      toast.error('You have no MetaMask wallet installed.', {
        action: (
          <Button onClick={() => console.log('Action!')} asChild>
            <Link href='https://metamask.io/download/'>
              <ArrowDownToLineIcon className='mr-2 h-4 w-4' />
              Download
            </Link>
          </Button>
        ),
      })

      return
    }

    const signer = await provider.getSigner()
    setWalletAddress(await signer.getAddress())
    setSigner(signer)
  }, [provider, hasProvider, setSigner])

  // NOTE: not really "disconnecting", just clear all stored information
  const disconnectMetaMask = useCallback(async () => {
    setSigner(null)
    setWalletAddress(undefined)
  }, [setSigner, setWalletAddress])

  return (
    <MetaMaskContext.Provider
      value={{
        provider,
        hasProvider,
        signer,
        isConnected,
        connectMetaMask,
        disconnectMetaMask,
        walletAddress,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  )
}
