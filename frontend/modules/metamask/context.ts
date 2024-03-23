import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { createContext } from 'react'

interface MetaMaskContextData {
  provider: BrowserProvider | null
  hasProvider: boolean
  signer: JsonRpcSigner | null
  isConnected: boolean
  connectMetaMask: () => Promise<void>
  disconnectMetaMask: () => Promise<void>
  walletAddress: string | undefined
}

export const MetaMaskContext = createContext<MetaMaskContextData>(
  {} as MetaMaskContextData,
)
