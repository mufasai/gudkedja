/**
 * Main template file - Re-exports all template functions
 * 
 * File ini adalah entry point utama untuk semua template surat.
 * Template sudah dipisah ke file-file terpisah untuk kemudahan maintenance:
 * - template-utils.ts: Utility functions (formatTanggal, getNamaHari, dll)
 * - template-sku.ts: Template surat keterangan lulus SKU
 * - template-skk.ts: Template sertifikat SKK/TKK
 */

// Re-export utility functions
export {
  formatTanggal,
  getNamaHari,
  extractKodeGudep,
  generateNomorSertifikatSKK
} from './template-utils'

// Re-export SKU template
export {
  generateSuratSKUHTML,
  type SuratSKUParams
} from './template-sku'

// Re-export SKK template
export {
  generatePiagamSKKHTML,
  type PiagamSKKParams
} from './template-skk'

// Backward compatibility: alias untuk fungsi lama
export { generateSuratSKUHTML as generateSuratHTML } from './template-sku'
