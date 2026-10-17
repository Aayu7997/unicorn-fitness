import React from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AnimatedSaveButtonProps extends ButtonProps {
  loading?: boolean;
}

export function AnimatedSaveButton({ children = "Save", loading = false, className, ...props }: AnimatedSaveButtonProps) {
  return (
    <Button
      {...props}
      disabled={loading || props.disabled}
      className={cn("gap-2", className)}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      {loading ? 'Saving...' : children}
    </Button>
  );
}
