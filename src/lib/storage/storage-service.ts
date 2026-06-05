// =============================================================================
// ORKESTRANDO - Storage Service
// Handles file uploads, downloads, and management via Supabase Storage
// =============================================================================

import { createClient } from '@/lib/supabase/client'

const BUCKETS = {
  avatars: 'avatars',
  materials: 'materials',
  assignments: 'assignments',
  messages: 'messages',
  reports: 'reports',
  signatures: 'signatures',
} as const

export type StorageBucket = keyof typeof BUCKETS

const MAX_FILE_SIZES: Record<StorageBucket, number> = {
  avatars: 2 * 1024 * 1024,       // 2MB
  materials: 50 * 1024 * 1024,     // 50MB
  assignments: 50 * 1024 * 1024,   // 50MB
  messages: 10 * 1024 * 1024,      // 10MB
  reports: 10 * 1024 * 1024,       // 10MB
  signatures: 1 * 1024 * 1024,    // 1MB
}

const ALLOWED_MIME_TYPES: Record<StorageBucket, string[]> = {
  avatars: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  materials: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'audio/mpeg',
    'audio/mp4',
    'video/mp4',
    'image/png',
    'image/jpeg',
    'application/zip',
  ],
  assignments: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'application/zip',
    'text/plain',
  ],
  messages: ['image/png', 'image/jpeg', 'image/gif', 'application/pdf', 'application/zip'],
  reports: ['application/pdf'],
  signatures: ['image/png', 'image/jpeg'],
}

export class StorageService {
  private supabase = createClient()

  /**
   * Uploads a file to the specified bucket.
   * Validates file size and MIME type before uploading.
   */
  async upload(
    bucket: StorageBucket,
    path: string,
    file: File
  ): Promise<{ url: string; error: string | null }> {
    // Validate file size
    if (file.size > MAX_FILE_SIZES[bucket]) {
      return {
        url: '',
        error: `Arquivo excede o tamanho máximo de ${MAX_FILE_SIZES[bucket] / 1024 / 1024}MB`,
      }
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES[bucket].includes(file.type)) {
      return { url: '', error: `Tipo de arquivo não permitido para ${bucket}` }
    }

    const { data, error } = await this.supabase.storage
      .from(BUCKETS[bucket])
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) return { url: '', error: error.message }

    const { data: publicUrlData } = this.supabase.storage
      .from(BUCKETS[bucket])
      .getPublicUrl(path)

    return { url: publicUrlData.publicUrl, error: null }
  }

  /**
   * Uploads raw bytes to the specified bucket.
   */
  async uploadBytes(
    bucket: StorageBucket,
    path: string,
    bytes: Uint8Array,
    contentType: string
  ): Promise<{ url: string; error: string | null }> {
    const { data, error } = await this.supabase.storage
      .from(BUCKETS[bucket])
      .upload(path, bytes, { contentType, cacheControl: '3600', upsert: false })

    if (error) return { url: '', error: error.message }

    const { data: publicUrlData } = this.supabase.storage
      .from(BUCKETS[bucket])
      .getPublicUrl(path)

    return { url: publicUrlData.publicUrl, error: null }
  }

  /**
   * Generates a signed URL for temporary access to a private file.
   */
  async getSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    const { data, error } = await this.supabase.storage
      .from(BUCKETS[bucket])
      .createSignedUrl(path, expiresIn)

    if (error) return null
    return data?.signedUrl ?? null
  }

  /**
   * Deletes a file from the specified bucket.
   */
  async delete(
    bucket: StorageBucket,
    path: string
  ): Promise<{ error: string | null }> {
    const { error } = await this.supabase.storage
      .from(BUCKETS[bucket])
      .remove([path])

    return { error: error?.message ?? null }
  }

  /**
   * Lists files in a bucket with the given prefix.
   */
  async list(
    bucket: StorageBucket,
    prefix: string,
    limit: number = 100
  ): Promise<string[]> {
    const { data, error } = await this.supabase.storage
      .from(BUCKETS[bucket])
      .list(prefix, { limit })

    if (error) return []
    return data.map((f) => f.name)
  }

  /**
   * Gets the public URL for a file (does not check existence).
   */
  getPublicUrl(bucket: StorageBucket, path: string): string {
    const { data } = this.supabase.storage
      .from(BUCKETS[bucket])
      .getPublicUrl(path)
    return data.publicUrl
  }
}

export const storage = new StorageService()
