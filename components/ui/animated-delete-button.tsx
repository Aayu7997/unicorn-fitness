'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AnimatedDeleteButtonProps extends ButtonProps {
}

export function AnimatedDeleteButton({ children, className, ...props }: AnimatedDeleteButtonProps) {
  return (
    <Button
      variant="destructive"
      size="sm"
      {...props}
      className={cn(className, "gap-2")}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {children || 'Delete'}
    </Button>
  );
}
