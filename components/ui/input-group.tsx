'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />
}
function InputGroupText({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn("text-sm text-muted-foreground", className)} {...props} />
}
export { InputGroup, InputGroupText }
