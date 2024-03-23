'use client'

import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useCreateGameMutation from '../hooks/useCreateGameMutation'
import { USDC_ADDRESS } from '../consts'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { GameCreateFormSchema, gameCreateFormSchema } from '../type'
import useTokemonGoFactoryContract from '../hooks/useTokemonGoFactoryContract'
import { EyeIcon, LoaderIcon } from 'lucide-react'
import Link from 'next/link'

export default function GameCreateForm() {
  const { onGameCreated } = useTokemonGoFactoryContract()
  const { mutate, isPending } = useCreateGameMutation()

  const form = useForm<GameCreateFormSchema>({
    resolver: zodResolver(gameCreateFormSchema),
    defaultValues: {
      usdc: USDC_ADDRESS,
    },
  })

  onGameCreated((data) => {
    const gameAddress = data[0]

    toast.info(`New game deployed to ${gameAddress}`, {
      action: (
        <Button size='sm' variant='ghost' asChild>
          <Link href={`/game/${gameAddress}`}>
            <EyeIcon className='mr-2 h-4 w-4' />
            View
          </Link>
        </Button>
      ),
    })
  })

  function onSubmit(values: GameCreateFormSchema) {
    // FIXME
    const parsedTime = new Date(+Date.now() + 120 * 1000)
    mutate(
      { ...values, endTime: parsedTime },
      {
        onSuccess: () => {
          toast.success('Game created!')
          // TODO: redirect
        },
        onError: (error) => {
          console.log(error)
          toast.error('Something went wrong', {
            description: error.message,
          })
        },
      },
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <Card>
          <CardContent className='p-6'>
            <FormField
              control={form.control}
              name='usdc'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Asset</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={USDC_ADDRESS}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select an asset to play with' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={USDC_ADDRESS}>USDC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Only USDC are supported currently.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='assetValue'
              render={({ field }) => (
                <FormItem className='mt-8'>
                  <FormLabel>Asset Value</FormLabel>
                  <FormControl>
                    <Input placeholder='1' {...field} />
                  </FormControl>
                  <FormDescription>
                    Fill in the amount to play with.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='endTime'
              render={({ field }) => (
                <FormItem className='flex flex-col mt-8'>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      granularity='second'
                      hourCycle={24}
                      jsDate={field.value}
                      onJsDateChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Determine when will this game end.
                  </FormDescription>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <LoaderIcon className='w-4 h-4 animate-spin' />
              ) : (
                <span>Create</span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
