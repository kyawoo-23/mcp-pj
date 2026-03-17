"use client";

import dynamic from "next/dynamic";

const ScrollToTop = dynamic(
  () => import("./scroll-to-top").then((m) => m.ScrollToTop),
  { ssr: false }
);

export function ScrollToTopClient() {
  return <ScrollToTop />;
}
