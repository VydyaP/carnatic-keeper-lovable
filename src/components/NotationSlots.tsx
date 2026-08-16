import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LANGUAGES, formatBytes, type NotationLanguage } from "@/lib/presets";
import {
  deleteNotation,
  notationUrl,
  uploadNotation,
  type NotationFile,
} from "@/lib/keerthanas";
import { useAuth } from "@/lib/auth";
import { useEditGate } from "@/lib/gate";

function LanguageSlot({
  keerthanaId,
  language,
  label,
  files,
}: {
  keerthanaId: string;
  language: NotationLanguage;
  label: string;
  files: NotationFile[];
}) {
  const { user } = useAuth();
  const { requireCode } = useEditGate();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const remove = useMutation({
    mutationFn: (file: NotationFile) => deleteNotation(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notation-files"] });
      toast.success("File removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(list)) {
        await uploadNotation(keerthanaId, language, file, user?.id);
      }
      qc.invalidateQueries({ queryKey: ["notation-files"] });
      toast.success(`${list.length} file${list.length > 1 ? "s" : ""} added to ${label}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function open(file: NotationFile) {
    try {
      const url = await notationUrl(file.storage_path);
      window.open(url, "_blank", "noopener");
    } catch {
      toast.error("Could not open that file");
    }
  }

  return (
    <div className="rounded-lg border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-display text-sm font-bold">{label}</p>
          <p className="label-caps">{files.length} file{files.length === 1 ? "" : "s"}</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => requireCode(() => inputRef.current?.click())}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Add
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <ul className="mt-3 space-y-2">
        {files.length === 0 && (
          <li className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
            No notation yet
          </li>
        )}
        {files.map((file) => (
          <li
            key={file.id}
            className="flex items-center gap-2 rounded-md bg-surface-2 px-2.5 py-2 text-sm"
          >
            <FileText className="size-4 shrink-0 text-primary" />
            <button
              onClick={() => open(file)}
              className="min-w-0 flex-1 truncate text-left hover:underline"
            >
              {file.file_name}
            </button>
            <span className="label-caps shrink-0">{formatBytes(file.size_bytes)}</span>
            <Button size="icon" variant="ghost" className="size-7" onClick={() => open(file)}>
              <Download className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-destructive"
              onClick={() => requireCode(() => remove.mutate(file))}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NotationSlots({
  keerthanaId,
  files,
}: {
  keerthanaId: string;
  files: NotationFile[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {LANGUAGES.map((lang) => (
        <LanguageSlot
          key={lang.key}
          keerthanaId={keerthanaId}
          language={lang.key}
          label={lang.label}
          files={files.filter((f) => f.language === lang.key)}
        />
      ))}
    </div>
  );
}
