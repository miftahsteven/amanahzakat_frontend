import React from 'react';
import { formatIdNumber, parseIdNumber } from '../../lib/utils';

export interface IdNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: number | undefined | null;
  onValueChange: (value: number) => void;
}

/** Input angka dengan pemisah ribuan format Indonesia (50.000.000). */
export function IdNumberInput({ value, onValueChange, className, ...props }: IdNumberInputProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={formatIdNumber(value ?? 0)}
      onChange={(e) => onValueChange(parseIdNumber(e.target.value))}
      className={className}
      {...props}
    />
  );
}
