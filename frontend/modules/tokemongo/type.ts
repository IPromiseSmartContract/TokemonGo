import { TokemoGoFactory } from '@/typechain/contracts/TokemoGoFactory'
import { z } from 'zod'

// list needed attribute for the contract
export interface GameDetails {
  gameAddress: string
  master: string
  assetValue: number
  endTime: Date
  gameMasterFansTokenAddress: string
  challengerFansTokenAddress: string
}

export interface GameInfo extends TokemoGoFactory.GameInfoStructOutput {}

const address = z.custom<`0x${string}`>((val) => {
  return typeof val === 'string' ? /^0x[0-9a-f]+$/i.test(val) : false
}, 'Not a valid address')

export type Address = z.infer<typeof address>

export const gameCreateFormSchema = z.object({
  usdc: address,
  assetValue: z.coerce.number().gt(0),
  endTime: z.date().min(new Date(), { message: 'Should be in the future' }),
})

export type GameCreateFormSchema = z.infer<typeof gameCreateFormSchema>

export const gameJoinFormSchema = z.object({
  amount: z.coerce.number().gt(0),
  tokens: z
    .array(
      z.object({
        token: address,
        amount: z.coerce.number().gt(0),
      }),
    )
    .min(1),
  fansTokenAddress: address,
})

export type GameJoinFormSchema = z.infer<typeof gameJoinFormSchema>
