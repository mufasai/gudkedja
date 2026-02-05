// Utility functions untuk template surat

/**
 * Format tanggal ke bahasa Indonesia
 * @param dateStr - String tanggal dalam format ISO
 * @returns String tanggal dalam format "1 Januari 2026"
 */
export const formatTanggal = (dateStr: string): string => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    })
}

/**
 * Mendapatkan nama hari dari tanggal
 * @param dateStr - String tanggal dalam format ISO
 * @returns Nama hari dalam bahasa Indonesia
 */
export const getNamaHari = (dateStr: string): string => {
    if (!dateStr) return "Jumat"
    const date = new Date(dateStr)
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    return days[date.getDay()]
}

/**
 * Extract kode gudep dari nomor surat
 * @param nomorSurat - Nomor surat format: 021/11.02.06.0365/XII/2023
 * @returns Kode gudep (contoh: "0365")
 */
export const extractKodeGudep = (nomorSurat: string): string => {
    const match = nomorSurat.match(/11\.02\.06\.(\d+)/)
    return match ? match[1] : "0365"
}

/**
 * Generate nomor sertifikat SKK
 * Format: 01/TKK-PSB/11.02.06.0365/2024
 */
export const generateNomorSertifikatSKK = (
    urutan: number,
    kodeGudep: string,
    tahun: number
): string => {
    const urutanStr = urutan.toString().padStart(2, '0')
    return `${urutanStr}/TKK-PSB/11.02.06.${kodeGudep}/${tahun}`
}
