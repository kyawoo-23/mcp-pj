"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { useAuth } from "../auth/auth-provider";

export interface HeroButtonsConfig {
  primaryLabel: string;
  primaryHref: string;
  authHref: string;
}

const defaultConfig: HeroButtonsConfig = {
  primaryLabel: "Browse",
  primaryHref: "/",
  authHref: "/auth/login",
};

export function BaseHeroButtons({
  config = defaultConfig,
}: {
  config?: HeroButtonsConfig;
}) {
  const { user, loading } = useAuth();

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      <Link href={config.primaryHref}>
        <Button size="lg">{config.primaryLabel}</Button>
      </Link>
      {!loading && !user && (
        <Link href={config.authHref}>
          <Button size="lg" variant="outline">
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
}

const bookingHeroConfig: HeroButtonsConfig = {
  primaryLabel: "Browse Facilities",
  primaryHref: "/facilities",
  authHref: "/auth/login",
};

export function HeroButtons() {
  return <BaseHeroButtons config={bookingHeroConfig} />;
}
