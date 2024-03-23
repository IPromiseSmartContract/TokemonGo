'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatAddress } from '../utils'

interface AdaptiveAddressProps {
  address: string
}

export default function AdaptiveAddress({ address }: AdaptiveAddressProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className='hidden md:inline'>{address}</span>
          <span className='md:hidden'>{formatAddress(address)}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{address}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
