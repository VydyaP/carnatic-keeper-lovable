import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center night-gradient">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <>{children}</>;

  async function signIn() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      toast.error("Sign-in failed. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    setBusy(false);
  }

  return (
    <div className="night-gradient min-h-dvh">
      <div className="kolam-dots flex min-h-dvh items-center justify-center px-5">
        <div className="w-full max-w-sm rounded-xl border bg-surface/80 p-7 backdrop-blur-xl glow-ring">
          <span className="flex size-11 items-center justify-center rounded-sm bg-primary font-display text-lg font-extrabold text-primary-foreground">
            K
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight">
            Keerthana
            <br />
            Collection
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A private archive of Carnatic keerthanas — lyrics, meanings and notation, kept for you
            and a few trusted friends.
          </p>
          <Button className="mt-6 w-full" onClick={signIn} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Continue with Google
          </Button>
          <p className="label-caps mt-4">Invite only · no public signup</p>
        </div>
      </div>
    </div>
  );
}
