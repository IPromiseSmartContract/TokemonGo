'use client'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Fragment } from 'react'
import { TypographySmall } from '@/modules/typography/components/TypographySmall'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AVAILABLE_TOKENS } from '../../consts'

interface TokensFieldProps {
  name: string
  label: string
  className?: string
}

export default function TokensField({
  name,
  label,
  className,
}: TokensFieldProps) {
  const form = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  })

  const watchedFields = form.watch(name)
  const selectedTokenAddresses = new Set(
    watchedFields.map(({ token }: { token: string }) => token),
  )

  return (
    <div className={className}>
      <div className='border-b'>
        <FormLabel className='text-2xl'>{label}</FormLabel>
      </div>
      <div className='grid grid-cols-[2fr_1fr_min-content] gap-4 pt-4'>
        <TypographySmall>Token Type</TypographySmall>
        <TypographySmall className='col-span-2'>Token Amount</TypographySmall>

        {fields.map((field, index) => {
          const tokenFieldName = `${name}.${index}.token`
          const amountFieldName = `${name}.${index}.amount`

          return (
            <Fragment key={field.id}>
              <FormField
                control={form.control}
                name={tokenFieldName}
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Choose a token type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABLE_TOKENS.map(({ name, address }) => (
                          <SelectItem
                            key={name}
                            value={address}
                            disabled={selectedTokenAddresses.has(address)}
                          >
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={amountFieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder='Token amount'
                        type='number'
                        min='0'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                size='icon'
                variant='outline'
                type='button'
                disabled={(watchedFields || []).length <= 1}
                onClick={() => remove(index)}
              >
                <XIcon className='w-4 h-4' />
              </Button>
            </Fragment>
          )
        })}
        <Button
          variant='outline'
          size='sm'
          disabled={(watchedFields || []).some(
            (field: any) => !field.token || !field.amount,
          )}
          onClick={() => append({})}
          className='max-w-min'
        >
          Add Token
        </Button>
      </div>
    </div>
  )
}
