'use client'

import useMetaMaskContext from '@/modules/metamask/hooks/useMetaMask'
import GameCreateForm from '@/modules/tokemongo/components/GameCreateForm'
import { redirect } from 'next/navigation'

export default function GameCreatePage() {
  const { isConnected } = useMetaMaskContext()
  if (!isConnected) {
    redirect('/')
  }

  return <GameCreateForm />
}
