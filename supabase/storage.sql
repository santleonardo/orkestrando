-- ─── ORKESTRANDO — Storage Buckets ───
-- Execute no Supabase SQL Editor

-- ═══════════════════════════════════════════
-- BUCKET CREATION
-- ═══════════════════════════════════════════

-- Avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'materials',
  'materials',
  false,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Assignments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assignments',
  'assignments',
  false,
  26214400, -- 25MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  26214400, -- 25MB
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Messages
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'messages',
  'messages',
  false,
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Signatures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signatures',
  'signatures',
  false,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════
-- STORAGE POLICIES (RLS)
-- ═══════════════════════════════════════════

-- ─── Avatars ───
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── Materials ───
CREATE POLICY "Users can read materials in own org"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'materials'
    AND auth.uid() IN (
      SELECT user_id FROM profiles
      WHERE organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Professores and Coordenadores can upload materials"
  ON storage.objects FOR INSERT
  TO authenticated
  USING (
    bucket_id = 'materials'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('Coordenador', 'Professor')
    )
  );

CREATE POLICY "Professores and Coordenadores can update materials"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'materials'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('Coordenador', 'Professor')
    )
  );

CREATE POLICY "Professores and Coordenadores can delete materials"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'materials'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('Coordenador', 'Professor')
    )
  );

-- ─── Assignments ───
CREATE POLICY "Users can read assignments in own org"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'assignments'
    AND auth.uid() IN (
      SELECT user_id FROM profiles
      WHERE organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Authenticated users can submit assignments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assignments'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Professores and Coordenadores can manage assignments"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'assignments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('Coordenador', 'Professor')
    )
  );

-- ─── Reports ───
CREATE POLICY "Users can read reports in own org"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'reports'
    AND auth.uid() IN (
      SELECT user_id FROM profiles
      WHERE organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Professores and Coordenadores can manage reports"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'reports'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('Coordenador', 'Professor')
    )
  );

-- ─── Messages ───
CREATE POLICY "Users can read messages in own org"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'messages'
    AND auth.uid() IN (
      SELECT user_id FROM profiles
      WHERE organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Authenticated users can upload message attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'messages');

-- ─── Signatures ───
CREATE POLICY "Users can read own signatures"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'signatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can upload signatures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'signatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own signatures"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'signatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
