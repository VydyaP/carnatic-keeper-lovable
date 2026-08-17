import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HardDrive, LogOut, Moon, Sun } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useEditGate } from "@/lib/gate";
import { fetchStorageUsage } from "@/lib/keerthanas";
import { STORAGE_BUDGET_BYTES, formatBytes } from "@/lib/presets";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — Keerthana Collection" },
      {
        name: "description",
        content: "Manage your session, edit access and notation storage usage.",
      },
      { property: "og:title", content: "Account — Keerthana Collection" },
      {
        property: "og:description",
        content: "Manage your session, edit access and notation storage usage.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <AppShell>
        <Account />
      </AppShell>
    </AuthGate>
  ),
});

function Account() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { unlocked, lock } = useEditGate();

  const { data: usage } = useQuery({
    queryKey: ["storage-usage"],
    queryFn: fetchStorageUsage,
  });

  const used = usage?.bytes ?? 0;
  const pct = Math.min(100, (used / STORAGE_BUDGET_BYTES) * 100);

  return (
    <div className="space-y-5">
      <header>
        <span className="label-caps">Account</span>
        <h1 className="mt-1 text-3xl font-extrabold">{user?.email ?? "Signed in"}</h1>
      </header>

      <section className="rounded-xl border bg-surface p-5">
        <div className="flex items-center gap-2">
          <HardDrive className="size-4 text-primary" />
          <h2 className="font-display font-bold">Notation storage</h2>
        </div>
        <p className="mt-3 text-2xl font-extrabold">
          {formatBytes(used)}
          <span className="text-base font-medium text-muted-foreground">
            {" "}
            / {formatBytes(STORAGE_BUDGET_BYTES)}
          </span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {usage?.count ?? 0} notation files across the archive.
        </p>
      </section>

      <section className="rounded-xl border bg-surface p-5">
        <h2 className="font-display font-bold">Editing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {unlocked
            ? "Edit access is unlocked on this device."
            : "Edit access is locked. You'll be asked for the shared code."}
        </p>
        {unlocked && (
          <Button variant="secondary" size="sm" className="mt-3" onClick={lock}>
            Lock editing
          </Button>
        )}
      </section>

      <section className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={toggle}>
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </Button>
        <Button variant="destructive" onClick={signOut}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </section>
    </div>
  );
}
