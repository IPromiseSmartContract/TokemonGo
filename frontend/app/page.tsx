'use client'

import { Button } from '@/components/ui/button'
import useMetaMaskContext from '@/modules/metamask/hooks/useMetaMask'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

export default function Home() {
  const { connectMetaMask, isConnected } = useMetaMaskContext()

  if (isConnected) {
    toast.success('MetaMask connected!')
    redirect('/game')
  }

  return (
    <section className='min-h-[calc(100vh-56px)] flex items-center justify-center flex-col'>
      <div className='text-7xl font-bold'>
        Play{' '}
        <span className='app-name'>{process.env.NEXT_PUBLIC_APP_NAME}</span>
      </div>

      <Button onClick={connectMetaMask} variant='outline' className='mt-8 py-6'>
        <Image
          src='/metamask.svg'
          alt='MetaMask logo'
          height={36}
          width={36}
          loading='eager'
          className='mr-2'
        />
        Connect with MetaMask
      </Button>
    </section>
  )
}
