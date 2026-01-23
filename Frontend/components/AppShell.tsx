"use client";

import React from 'react';

// AppShell simplified - theme is now handled by ThemeProvider applying class to document element
export default function AppShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
