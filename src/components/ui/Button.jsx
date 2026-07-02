import React from 'react';
import { cn } from './cn.js';

const VARIANTS = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
  ghost: 'bg-transparent text-stone-700 hover:bg-stone-100',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium',
        'transition duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
