import React from 'react';
import { cn } from './cn.js';

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('rounded-2xl bg-white p-4 shadow-sm md:p-5', className)}
      {...props}
    >
      {children}
    </div>
  );
}
