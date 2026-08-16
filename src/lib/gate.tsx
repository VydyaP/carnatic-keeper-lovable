import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Lightweight shared security code gate for edit actions.
 * Not authentication — just a speed bump so a shared device / trusted friend
 * can browse freely but must confirm before changing the archive.
 */
export const SECURITY_CODE = "sapta7";
const STORAGE_KEY = "kc-edit-unlocked";

type GateContext = {
  unlocked: boolean;
  lock: () => void;
  /** Runs `action` immediately when unlocked, otherwise prompts for the code first. */
  requireCode: (action: () => void) => void;
};

const Ctx = createContext<GateContext>({ unlocked: false, lock: () => {}, requireCode: () => {} });

export function EditGateProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (window.sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
  }, []);

  const requireCode = useCallback(
    (action: () => void) => {
      if (unlocked) {
        action();
        return;
      }
      pending.current = action;
      setCode("");
      setError(false);
      setOpen(true);
    },
    [unlocked],
  );

  const lock = useCallback(() => {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim() !== SECURITY_CODE) {
      setError(true);
      return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    setUnlocked(true);
    setOpen(false);
    const action = pending.current;
    pending.current = null;
    action?.();
  }

  return (
    <Ctx.Provider value={{ unlocked, lock, requireCode }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-secondary">
              <Lock className="size-4 text-primary" />
            </div>
            <DialogTitle>Enter security code</DialogTitle>
            <DialogDescription>
              Adding, editing and deleting is protected by a shared code. It stays unlocked for this
              session.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Input
              autoFocus
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              placeholder="Shared code"
              aria-label="Shared security code"
            />
            {error && <p className="text-xs text-destructive">That code doesn't match.</p>}
            <Button type="submit" className="w-full">
              Unlock editing
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

export const useEditGate = () => useContext(Ctx);
