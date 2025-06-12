"use client";
import React from 'react';

export default function LoadingSpinner({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-t-2 border-border border-t-primary"
      style={{ width: size, height: size, borderTopColor: 'hsl(var(--primary))' }}
      aria-label="Loading"
    />
  );
}
