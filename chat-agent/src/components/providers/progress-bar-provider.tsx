"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export const ProgressBarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      {children}
      <ProgressBar
        height='3px'
        color='#df5a87'
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};
