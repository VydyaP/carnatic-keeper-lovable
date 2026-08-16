import { supabase } from "@/integrations/supabase/client";
import type { NotationLanguage } from "./presets";

export type Keerthana = {
  id: string;
  name: string;
  raga: string | null;
  tala: string | null;
  composer: string | null;
  deity: string | null;
  lyrics: string | null;
  meaning: string | null;
  created_at: string;
  updated_at: string;
};

export type NotationFile = {
  id: string;
  keerthana_id: string;
  language: NotationLanguage;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number;
  created_at: string;
};

export const BUCKET = "notations";

export async function fetchKeerthanas(): Promise<Keerthana[]> {
  const { data, error } = await supabase
    .from("keerthanas")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Keerthana[];
}

export async function fetchKeerthana(id: string): Promise<Keerthana> {
  const { data, error } = await supabase.from("keerthanas").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Keerthana not found");
  return data as Keerthana;
}

export async function fetchNotationFiles(keerthanaId?: string): Promise<NotationFile[]> {
  let query = supabase.from("notation_files").select("*").order("created_at", { ascending: false });
  if (keerthanaId) query = query.eq("keerthana_id", keerthanaId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as NotationFile[];
}

export type KeerthanaInput = {
  name: string;
  raga: string | null;
  tala: string | null;
  composer: string | null;
  deity: string | null;
  lyrics: string | null;
  meaning: string | null;
};

export async function createKeerthana(input: KeerthanaInput, userId?: string) {
  const { data, error } = await supabase
    .from("keerthanas")
    .insert({ ...input, created_by: userId ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as Keerthana;
}

export async function updateKeerthana(id: string, input: Partial<KeerthanaInput>) {
  const { error } = await supabase.from("keerthanas").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteKeerthanas(ids: string[]) {
  const { data: files } = await supabase
    .from("notation_files")
    .select("storage_path")
    .in("keerthana_id", ids);
  const paths = (files ?? []).map((f) => f.storage_path);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  const { error } = await supabase.from("keerthanas").delete().in("id", ids);
  if (error) throw error;
}

export async function bulkAssign(ids: string[], field: string, value: string | null) {
  const { error } = await supabase
    .from("keerthanas")
    .update({ [field]: value })
    .in("id", ids);
  if (error) throw error;
}

export async function uploadNotation(
  keerthanaId: string,
  language: NotationLanguage,
  file: File,
  userId?: string,
) {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${keerthanaId}/${language}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from("notation_files").insert({
    keerthana_id: keerthanaId,
    language,
    storage_path: path,
    file_name: file.name,
    mime_type: file.type || null,
    size_bytes: file.size,
    uploaded_by: userId ?? null,
  });
  if (error) throw error;
}

export async function deleteNotation(file: NotationFile) {
  await supabase.storage.from(BUCKET).remove([file.storage_path]);
  const { error } = await supabase.from("notation_files").delete().eq("id", file.id);
  if (error) throw error;
}

export async function notationUrl(path: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}
