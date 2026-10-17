'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

function Item({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn("group/item", className)} {...props} />
}
function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn("font-semibold", className)} {...props} />
}
function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />
}
function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />
}
export { Item, ItemTitle, ItemContent, ItemFooter }
