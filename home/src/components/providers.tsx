"use client";

import { AppProgressProvider as ProgressProvider } from "@bprogress/next";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height='4px'
      color='#fffd00'
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
