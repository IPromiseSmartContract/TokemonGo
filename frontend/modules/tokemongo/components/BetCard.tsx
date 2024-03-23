'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import Link from 'next/link'
import { ExternalLinkIcon, LoaderIcon } from 'lucide-react'

interface BetCardProps {
  title: string
  description: string
  footer: string
  tokenSymbol: string
  loading: boolean
  onClick: (value: number) => void
}

export default function BetCard({
  title,
  description,
  footer,
  tokenSymbol,
  loading,
  onClick,
}: BetCardProps) {
  const [betValue, setBetValue] = useState<number | undefined>(undefined)

  function handleClick() {
    if (!betValue || loading) {
      return
    }

    onClick(betValue)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex gap-2'>
        <Input
          value={betValue}
          onChange={(e) => setBetValue(+e.target.value)}
          type='number'
          min='1'
        />
        <Button
          type='button'
          disabled={!betValue || betValue <= 0 || loading}
          onClick={handleClick}
        >
          {loading ? (
            <LoaderIcon className='w-4 h-4 animate-spin' />
          ) : (
            <span>Bet</span>
          )}
        </Button>
      </CardContent>
      <CardFooter className='flex items-center text-sm'>
        <div>{footer}</div>
        <Button variant='link' className='px-2' asChild>
          <Link
            href={`https://mint.club/token/sepolia/${tokenSymbol}`}
            legacyBehavior
            passHref
          >
            <a
              target='_blank'
              rel='noopener noreferrer'
              className='flex ml-1 hover:underline'
            >
              Go buy some
              <ExternalLinkIcon className='w-4 h-4 ml-1' />
            </a>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
