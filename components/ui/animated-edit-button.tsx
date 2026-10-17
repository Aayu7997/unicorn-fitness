'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AnimatedEditButtonProps extends ButtonProps {
}

export function AnimatedEditButton({ children = "Edit", className, ...props }: AnimatedEditButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      {...props}
      className={cn("gap-2", className)}
    >
      <Pencil className="w-3.5 h-3.5" />
      {children}
    </Button>
  );
}
