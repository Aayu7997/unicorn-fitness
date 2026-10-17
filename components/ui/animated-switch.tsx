'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';

interface AnimatedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function AnimatedSwitch({ checked, onChange, className, disabled }: AnimatedSwitchProps) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      className={className}
    />
  );
}
