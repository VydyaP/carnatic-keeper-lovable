import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ComboField } from "@/components/ComboField";
import { COMPOSERS, DEITIES, RAGAS, TALAS } from "@/lib/presets";
import { createKeerthana, updateKeerthana, type Keerthana, type KeerthanaInput } from "@/lib/keerthanas";
import { useAuth } from "@/lib/auth";

const empty: KeerthanaInput = {
  name: "",
  raga: null,
  tala: null,
  composer: null,
  deity: null,
  lyrics: null,
  meaning: null,
};

export function KeerthanaForm({
  open,
  onOpenChange,
  existing,
  extraRagas = [],
  extraTalas = [],
  extraComposers = [],
  extraDeities = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing?: Keerthana | null;
  extraRagas?: string[];
  extraTalas?: string[];
  extraComposers?: string[];
  extraDeities?: string[];
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState<KeerthanaInput>(empty);

  useEffect(() => {
    if (!open) return;
    setForm(
      existing
        ? {
            name: existing.name,
            raga: existing.raga,
            tala: existing.tala,
            composer: existing.composer,
            deity: existing.deity,
            lyrics: existing.lyrics,
            meaning: existing.meaning,
          }
        : empty,
    );
  }, [open, existing]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("A name is required");
      if (existing) return updateKeerthana(existing.id, form);
      return createKeerthana(form, user?.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["keerthanas"] });
      toast.success(existing ? "Keerthana updated" : "Keerthana added");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit keerthana" : "New keerthana"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="label-caps">Name</span>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Vatapi Ganapatim"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ComboField
              label="Raga"
              value={form.raga}
              options={[...RAGAS, ...extraRagas]}
              onChange={(v) => setForm((f) => ({ ...f, raga: v }))}
            />
            <ComboField
              label="Tala"
              value={form.tala}
              options={[...TALAS, ...extraTalas]}
              onChange={(v) => setForm((f) => ({ ...f, tala: v }))}
            />
            <ComboField
              label="Composer"
              value={form.composer}
              options={[...COMPOSERS, ...extraComposers]}
              onChange={(v) => setForm((f) => ({ ...f, composer: v }))}
            />
            <ComboField
              label="Deity"
              value={form.deity}
              options={[...DEITIES, ...extraDeities]}
              onChange={(v) => setForm((f) => ({ ...f, deity: v }))}
            />
          </div>

          <div className="space-y-1.5">
            <span className="label-caps">Lyrics</span>
            <Textarea
              rows={6}
              value={form.lyrics ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, lyrics: e.target.value || null }))}
              placeholder="Pallavi, anupallavi, charanam…"
            />
          </div>

          <div className="space-y-1.5">
            <span className="label-caps">Meaning / translation</span>
            <Textarea
              rows={5}
              value={form.meaning ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, meaning: e.target.value || null }))}
              placeholder="What the song says…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : existing ? "Save changes" : "Add keerthana"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
