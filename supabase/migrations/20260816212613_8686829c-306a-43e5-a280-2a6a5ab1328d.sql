CREATE TABLE public.keerthanas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  raga TEXT,
  tala TEXT,
  composer TEXT,
  deity TEXT,
  lyrics TEXT,
  meaning TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.keerthanas TO authenticated;
GRANT ALL ON public.keerthanas TO service_role;
ALTER TABLE public.keerthanas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in members can read keerthanas" ON public.keerthanas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in members can add keerthanas" ON public.keerthanas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in members can edit keerthanas" ON public.keerthanas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in members can delete keerthanas" ON public.keerthanas FOR DELETE TO authenticated USING (true);

CREATE TABLE public.notation_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keerthana_id UUID NOT NULL REFERENCES public.keerthanas(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('telugu','tamil','english')),
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notation_files TO authenticated;
GRANT ALL ON public.notation_files TO service_role;
ALTER TABLE public.notation_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in members can read notation files" ON public.notation_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in members can add notation files" ON public.notation_files FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in members can delete notation files" ON public.notation_files FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_notation_files_keerthana ON public.notation_files(keerthana_id);
CREATE INDEX idx_keerthanas_name ON public.keerthanas(name);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_keerthanas_updated_at
BEFORE UPDATE ON public.keerthanas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
