'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import TokensField from './TokensField'
import { cn } from '@/lib/utils'
import { GameJoinFormSchema, gameJoinFormSchema } from '../../type'
import useJoinGameMutation from '../../hooks/useJoinGameMutation'
import { Input } from '@/components/ui/input'
import { LoaderIcon } from 'lucide-react'

interface GameJoinFromProps {
  gameAddress: string
  className?: string
}

export default function GameJoinForm({
  gameAddress,
  className,
}: GameJoinFromProps) {
  const { mutate, isPending } = useJoinGameMutation(gameAddress)

  const form = useForm<GameJoinFormSchema>({
    resolver: zodResolver(gameJoinFormSchema),
    defaultValues: {
      // create 1 entry initially
      tokens: [{} as GameJoinFormSchema['tokens'][number]],
    },
  })

  function onSubmit(values: GameJoinFormSchema) {
    mutate(values, {
      onSuccess: () => {
        toast.success('Game joined!')
      },
      onError: (error) => {
        toast.error('Something went wrong', {
          description: error.message,
        })
        console.log(error)
      },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-8', className)}
      >
        <Card>
          <CardContent className='p-6'>
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>USDC Amount</FormLabel>
                  <FormControl>
                    <Input placeholder='1' {...field} />
                  </FormControl>
                  <FormDescription>
                    Fill in the amount you want to deposit.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='fansTokenAddress'
              render={({ field }) => (
                <FormItem className='mt-8'>
                  <FormLabel>Fans Token Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='0x0000000000000000000000000000000000000000'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Your fans token address.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TokensField name='tokens' label='Tokens' className='mt-8' />
          </CardContent>

          <CardFooter>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <LoaderIcon className='w-4 h-4 animate-spin' />
              ) : (
                <span>Deposit</span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
