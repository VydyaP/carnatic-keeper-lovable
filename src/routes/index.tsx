import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Loader2, Plus, Search, Tags, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { KeerthanaForm } from "@/components/KeerthanaForm";
import { ComboField } from "@/components/ComboField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FIELDS, type FieldKey } from "@/lib/presets";
import {
  bulkAssign,
  deleteKeerthanas,
  fetchKeerthanas,
  type Keerthana,
} from "@/lib/keerthanas";
import { useEditGate } from "@/lib/gate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Keerthana Collection — Carnatic song archive" },
      {
        name: "description",
        content:
          "Browse, search and organise a private archive of Carnatic keerthanas by raga, tala, composer and deity.",
      },
      { property: "og:title", content: "Keerthana Collection — Carnatic song archive" },
      {
        property: "og:description",
        content: "A private archive of Carnatic keerthanas with lyrics, meanings and notation.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <AppShell>
        <Collection />
      </AppShell>
    </AuthGate>
  ),
});

const UNSET = "—";

function Collection() {
  const qc = useQueryClient();
  const { requireCode } = useEditGate();
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<FieldKey | null>(null);
  const [filter, setFilter] = useState<{ field: FieldKey; value: string } | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Keerthana | null>(null);
  const [reassign, setReassign] = useState<{ field: FieldKey; value: string | null } | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["keerthanas"],
    queryFn: fetchKeerthanas,
  });

  const extras = useMemo(() => {
    const collect = (key: FieldKey) =>
      Array.from(new Set(items.map((i) => i[key]).filter(Boolean) as string[]));
    return {
      raga: collect("raga"),
      tala: collect("tala"),
      composer: collect("composer"),
      deity: collect("deity"),
    };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (filter && (item[filter.field] ?? UNSET) !== filter.value) return false;
      if (!q) return true;
      return [item.name, item.raga, item.tala, item.composer, item.deity]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q));
    });
  }, [items, search, filter]);

  const groups = useMemo(() => {
    if (!groupBy) return [{ key: "All", items: filtered }];
    const map = new Map<string, Keerthana[]>();
    for (const item of filtered) {
      const key = item[groupBy] ?? UNSET;
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, list]) => ({ key, items: list }));
  }, [filtered, groupBy]);

  const facets = useMemo(() => {
    if (!filter) return [];
    return [];
  }, [filter]);
  void facets;

  const removeMany = useMutation({
    mutationFn: (ids: string[]) => deleteKeerthanas(ids),
    onSuccess: (_d, ids) => {
      qc.invalidateQueries({ queryKey: ["keerthanas"] });
      qc.invalidateQueries({ queryKey: ["notation-files"] });
      setSelection([]);
      toast.success(`${ids.length} keerthana${ids.length > 1 ? "s" : ""} deleted`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const applyReassign = useMutation({
    mutationFn: async () => {
      if (!reassign) return;
      await bulkAssign(selection, reassign.field, reassign.value);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["keerthanas"] });
      toast.success("Updated across selection");
      setReassign(null);
      setSelection([]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const selecting = selection.length > 0;

  function toggle(id: string) {
    setSelection((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-surface/70 p-5 backdrop-blur-sm sm:p-7">
        <span className="label-caps">{items.length} keerthanas archived</span>
        <h1 className="mt-2 text-3xl font-extrabold leading-[1.05] sm:text-5xl">
          The archive of
          <br />
          <span className="text-primary">songs kept close.</span>
        </h1>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, raga, tala, composer, deity"
              className="h-11 pl-9"
            />
          </div>
          <Button
            className="h-11"
            onClick={() =>
              requireCode(() => {
                setEditing(null);
                setFormOpen(true);
              })
            }
          >
            <Plus className="size-4" />
            New keerthana
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <Chip active={!groupBy} onClick={() => setGroupBy(null)}>
            No grouping
          </Chip>
          {FIELDS.map((f) => (
            <Chip
              key={f.key}
              active={groupBy === f.key}
              onClick={() => setGroupBy(groupBy === f.key ? null : f.key)}
            >
              Group by {f.label.toLowerCase()}
            </Chip>
          ))}
        </div>

        {filter && (
          <button
            onClick={() => setFilter(null)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            {filter.field}: {filter.value}
            <X className="size-3.5" />
          </button>
        )}
      </section>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Nothing here yet. Add your first keerthana.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="space-y-3">
            {groupBy && (
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-lg font-bold">{group.key}</h2>
                <span className="label-caps">{group.items.length}</span>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <Card
                  key={item.id}
                  item={item}
                  selected={selection.includes(item.id)}
                  selecting={selecting}
                  onToggle={() => toggle(item.id)}
                  onFacet={(field, value) => setFilter({ field, value })}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {selecting && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
            <span className="mr-auto text-sm font-medium">{selection.length} selected</span>
            <Button variant="ghost" size="sm" onClick={() => setSelection([])}>
              Clear
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => requireCode(() => setReassign({ field: "raga", value: null }))}
            >
              <Tags className="size-4" />
              Reassign
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={removeMany.isPending}
              onClick={() => requireCode(() => removeMany.mutate(selection))}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <KeerthanaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editing}
        extraRagas={extras.raga}
        extraTalas={extras.tala}
        extraComposers={extras.composer}
        extraDeities={extras.deity}
      />

      <Dialog open={!!reassign} onOpenChange={(o) => !o && setReassign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reassign across {selection.length} keerthanas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {FIELDS.map((f) => (
                <Chip
                  key={f.key}
                  active={reassign?.field === f.key}
                  onClick={() => setReassign({ field: f.key, value: null })}
                >
                  {f.label}
                </Chip>
              ))}
            </div>
            {reassign && (
              <ComboField
                label={`New ${reassign.field}`}
                value={reassign.value}
                options={[
                  ...(FIELDS.find((f) => f.key === reassign.field)?.options ?? []),
                  ...extras[reassign.field],
                ]}
                onChange={(v) => setReassign({ field: reassign.field, value: v })}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReassign(null)}>
              Cancel
            </Button>
            <Button onClick={() => applyReassign.mutate()} disabled={applyReassign.isPending}>
              Apply to all
            </Button>
          </DialogFooter>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

function Card({
  item,
  selected,
  selecting,
  onToggle,
  onFacet,
}: {
  item: Keerthana;
  selected: boolean;
  selecting: boolean;
  onToggle: () => void;
  onFacet: (field: FieldKey, value: string) => void;
}) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-surface p-4 transition-shadow",
        selected ? "glow-ring border-primary" : "hover:border-primary/50",
      )}
    >
      <button
        aria-label={selected ? "Deselect" : "Select"}
        onClick={onToggle}
        className={cn(
          "absolute right-3 top-3 text-muted-foreground transition-opacity",
          selected || selecting ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        {selected ? (
          <CheckCircle2 className="size-5 text-primary" />
        ) : (
          <Circle className="size-5" />
        )}
      </button>

      <Link to="/k/$id" params={{ id: item.id }} className="block pr-8">
        <span className="label-caps">{item.composer ?? "Unknown composer"}</span>
        <h3 className="mt-1 font-display text-lg font-bold leading-tight">{item.name}</h3>
      </Link>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(["raga", "tala", "deity"] as const).map((key) =>
          item[key] ? (
            <button
              key={key}
              onClick={() => onFacet(key, item[key] as string)}
              className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground hover:bg-accent"
            >
              {item[key]}
            </button>
          ) : null,
        )}
      </div>
    </article>
  );
}
