import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { KeerthanaForm } from "@/components/KeerthanaForm";
import { NotationSlots } from "@/components/NotationSlots";
import { Button } from "@/components/ui/button";
import {
  deleteKeerthanas,
  fetchKeerthana,
  fetchNotationFiles,
} from "@/lib/keerthanas";
import { useEditGate } from "@/lib/gate";

export const Route = createFileRoute("/k/$id")({
  head: () => ({
    meta: [
      { title: "Keerthana — Keerthana Collection" },
      {
        name: "description",
        content: "Lyrics, meaning and multi-language notation for a Carnatic keerthana.",
      },
      { property: "og:title", content: "Keerthana — Keerthana Collection" },
      {
        property: "og:description",
        content: "Lyrics, meaning and multi-language notation for a Carnatic keerthana.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <AppShell>
        <Detail />
      </AppShell>
    </AuthGate>
  ),
});

function Detail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { requireCode } = useEditGate();
  const [editOpen, setEditOpen] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ["keerthana", id],
    queryFn: () => fetchKeerthana(id),
  });
  const { data: files = [] } = useQuery({
    queryKey: ["notation-files", id],
    queryFn: () => fetchNotationFiles(id),
  });

  const remove = useMutation({
    mutationFn: () => deleteKeerthanas([id]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["keerthanas"] });
      toast.success("Keerthana deleted");
      navigate({ to: "/" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">
        This keerthana no longer exists.
      </p>
    );
  }

  const facts = [
    { label: "Raga", value: item.raga },
    { label: "Tala", value: item.tala },
    { label: "Composer", value: item.composer },
    { label: "Deity", value: item.deity },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Archive
      </Link>

      <header className="rounded-xl border bg-surface p-5 sm:p-7">
        <span className="label-caps">{item.composer ?? "Unknown composer"}</span>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">{item.name}</h1>

        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="label-caps">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium">{f.value ?? "—"}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => requireCode(() => setEditOpen(true))}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={remove.isPending}
            onClick={() => requireCode(() => remove.mutate())}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        <TextPanel title="Lyrics" body={item.lyrics} />
        <TextPanel title="Meaning" body={item.meaning} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold">Notation</h2>
        <NotationSlots keerthanaId={id} files={files} />
      </section>

      <KeerthanaForm open={editOpen} onOpenChange={setEditOpen} existing={item} />
    </div>
  );
}

function TextPanel({ title, body }: { title: string; body: string | null }) {
  return (
    <div className="rounded-xl border bg-surface p-5">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {body ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {body}
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Not added yet.</p>
      )}
    </div>
  );
}
