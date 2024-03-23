import { useContext } from 'react'
import { MetaMaskContext } from '../context'

export default function useMetaMaskContext() {
  const context = useContext(MetaMaskContext)

  if (!context) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'useMetaMask must be used within a MetaMaskContextProvider',
      )
    }
  }

  return context
}
