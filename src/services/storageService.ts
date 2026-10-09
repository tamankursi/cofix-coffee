import { siteConfig } from '../config/site';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  message?: string;
}

export const BUCKET_NAMES = {
  products: 'product-images',
  events: 'event-images',
  legacy: 'images',
};

export const storageService = {
  /**
   * Validates file size (max 2MB) and image type
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File harus berupa format gambar (JPG, PNG, WebP).' };
    }

    if (file.size > siteConfig.limits.maxImageUploadSizeBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `Ukuran gambar terlalu besar (${sizeMb} MB). Maksimal ukuran file adalah 2 MB.`,
      };
    }

    return { valid: true };
  },

  /**
   * Uploads image to Supabase Storage:
   * - Products go to 'product-images' bucket
   * - Events go to 'event-images' bucket
   * - Brand logos go to 'product-images' bucket (with 'logo-' prefix)
   */
  async uploadImage(file: File, folder: 'products' | 'events' | 'brand' = 'products'): Promise<ImageUploadResult> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      return { success: false, message: validation.error };
    }

    const primaryBucket = folder === 'events' ? BUCKET_NAMES.events : BUCKET_NAMES.products;

    if (isSupabaseConfigured && supabase) {
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const prefix = folder === 'brand' ? 'logo' : folder === 'events' ? 'event' : 'prod';
        const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        // Attempt 1: Upload to primary bucket (product-images or event-images)
        let uploadResult = await supabase.storage.from(primaryBucket).upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

        let activeBucket = primaryBucket;

        // If bucket not found, try fallback to legacy 'images' bucket if it exists
        if (uploadResult.error) {
          const errMsg = uploadResult.error.message?.toLowerCase() || '';
          if (errMsg.includes('bucket not found') || errMsg.includes('not found')) {
            const legacyAttempt = await supabase.storage.from(BUCKET_NAMES.legacy).upload(`${folder}/${fileName}`, file, {
              cacheControl: '3600',
              upsert: true,
            });

            if (!legacyAttempt.error) {
              uploadResult = legacyAttempt;
              activeBucket = BUCKET_NAMES.legacy;
            }
          }
        }

        if (uploadResult.error) {
          const errText = uploadResult.error.message || '';
          if (errText.toLowerCase().includes('bucket not found') || errText.toLowerCase().includes('not found')) {
            return {
              success: false,
              message: `Bucket '${primaryBucket}' belum dibuat di Supabase Storage. Silakan buka menu Storage di dashboard Supabase, buat bucket '${primaryBucket}' (Public).`,
            };
          }
          if (errText.toLowerCase().includes('policy') || errText.toLowerCase().includes('violates row-level security')) {
            return {
              success: false,
              message: `Akses upload ke bucket '${primaryBucket}' ditolak oleh policy Supabase. Pastikan RLS Policy INSERT diaktifkan untuk bucket ini.`,
            };
          }
          return {
            success: false,
            message: `Gagal mengupload gambar ke Supabase Storage: ${errText}`,
          };
        }

        const pathInBucket = activeBucket === BUCKET_NAMES.legacy ? `${folder}/${fileName}` : fileName;
        const { data: publicData } = supabase.storage.from(activeBucket).getPublicUrl(pathInBucket);

        return { success: true, url: publicData.publicUrl };
      } catch (err: any) {
        return {
          success: false,
          message: err?.message || 'Terjadi kesalahan saat mengunggah gambar ke Supabase Storage.',
        };
      }
    }

    // Local Base64 fallback if Supabase is not configured
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          success: true,
          url: reader.result as string,
        });
      };
      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Gagal membaca file gambar.',
        });
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Safely deletes an old image file from Supabase Storage when replaced.
   * Only deletes if the URL is hosted on our Supabase Storage and matches the bucket.
   */
  async deleteImage(imageUrl?: string | null, folder: 'products' | 'events' | 'brand' = 'products'): Promise<boolean> {
    if (!imageUrl || !isSupabaseConfigured || !supabase) return false;

    try {
      const primaryBucket = folder === 'events' ? BUCKET_NAMES.events : BUCKET_NAMES.products;

      // Check if URL is from Supabase Storage
      if (!imageUrl.includes('/storage/v1/object/public/')) {
        return false; // Skip external / Unsplash / base64 URLs
      }

      // Extract file path from URL
      let bucket = primaryBucket;
      let filePath = '';

      if (imageUrl.includes(`/public/${primaryBucket}/`)) {
        filePath = imageUrl.split(`/public/${primaryBucket}/`)[1];
        bucket = primaryBucket;
      } else if (imageUrl.includes(`/public/${BUCKET_NAMES.legacy}/`)) {
        filePath = imageUrl.split(`/public/${BUCKET_NAMES.legacy}/`)[1];
        bucket = BUCKET_NAMES.legacy;
      }

      if (filePath) {
        const { error } = await supabase.storage.from(bucket).remove([filePath]);
        if (error) {
          console.warn('Gagal menghapus file lama dari storage:', error.message);
          return false;
        }
        return true;
      }
    } catch (e) {
      console.warn('Error delete image:', e);
    }
    return false;
  },
};
