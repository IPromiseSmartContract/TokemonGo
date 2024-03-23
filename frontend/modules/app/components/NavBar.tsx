'use client'

import { Button } from '@/components/ui/button'
import useMetaMaskContext from '@/modules/metamask/hooks/useMetaMask'
import Link from 'next/link'

export default function NavBar() {
  const { isConnected, disconnectMetaMask } = useMetaMaskContext()

  return (
    <nav className='w-full h-[56px] flex items-center m-auto px-[2rem] border-b'>
      <Button variant='ghost' asChild>
        <Link href='/game'>
          <div className='text-xl font-bold app-name'>
            {process.env.NEXT_PUBLIC_APP_NAME || 'APP_NAME'}
          </div>
        </Link>
      </Button>

      <div className='grow'></div>

      {isConnected && (
        <Button variant='outline' onClick={disconnectMetaMask}>
          Logout
        </Button>
      )}
    </nav>
  )
}
