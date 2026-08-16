import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CircleUser, Library } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh night-gradient">
      <div className="kolam-dots min-h-dvh">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-sm bg-primary font-display text-sm font-extrabold text-primary-foreground">
                K
              </span>
              <span className="leading-none">
                <span className="block font-display text-base font-extrabold tracking-tight">
                  Keerthana
                </span>
                <span className="label-caps">Collection</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-secondary",
                  pathname === "/" && "bg-secondary text-foreground",
                )}
              >
                <Library className="size-4" />
                <span className="hidden sm:inline">Archive</span>
              </Link>
              <Link
                to="/account"
                className={cn(
                  "flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-secondary",
                  pathname === "/account" && "bg-secondary text-foreground",
                )}
              >
                <CircleUser className="size-4" />
                <span className="hidden sm:inline">Account</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">{children}</main>
      </div>
    </div>
  );
}
