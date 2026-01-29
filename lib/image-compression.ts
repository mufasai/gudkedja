import imageCompression from 'browser-image-compression'

/**
 * Compress image dengan mode Balanced
 * - Max width: 1200px
 * - Quality: 85%
 * - Hemat: ~85% ukuran file
 * - Kualitas visual: Excellent
 */
export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 1, // Max 1MB setelah kompresi
        maxWidthOrHeight: 1200, // Max width/height 1200px
        useWebWorker: true, // Gunakan web worker untuk performa
        initialQuality: 0.85, // Quality 85%
    }

    try {
        console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB')

        const compressedFile = await imageCompression(file, options)

        console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')
        console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(0), '%')

        return compressedFile
    } catch (error) {
        console.error('Error compressing image:', error)
        // Jika gagal compress, return file original
        return file
    }
}

/**
 * Compress multiple images
 */
export async function compressImages(files: File[]): Promise<File[]> {
    const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
    )
    return compressedFiles
}

/**
 * Validate image file
 */
export function isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    return validTypes.includes(file.type)
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate PDF file size (max 1 MB)
 */
export function validatePDFSize(file: File): { valid: boolean; message?: string } {
    const maxSizeMB = 1
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (file.size > maxSizeBytes) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
        return {
            valid: false,
            message: `File terlalu besar (${fileSizeMB} MB). Maksimal ${maxSizeMB} MB`
        }
    }

    return { valid: true }
}

/**
 * Validate multiple PDF files
 */
export function validatePDFFiles(files: File[]): { valid: boolean; message?: string } {
    for (const file of files) {
        const validation = validatePDFSize(file)
        if (!validation.valid) {
            return validation
        }
    }
    return { valid: true }
}
