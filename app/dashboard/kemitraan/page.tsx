"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface KemitraanRecord {
  id: number
  created_at: string
  nama_mitra: string
  jenis_mitra: string
  kategori_pelibatan?: string
  jumlah_kegiatan?: number
  keterangan: string | null
  foto_kegiatan: string[] | null
  file_bantuan: string | null
  file_kerjasama: string | null
}

// Jenis Mitra/Organisasi options
const JENIS_MITRA_OPTIONS = [
  "Pelibatan Orang Tua dalam Kegiatan Gugusdepan",
  "Kerjasama Kegiatan dengan Gugusdepan, Lembaga, Institusi, Perorangan dan Alumni",
  "Bantuan Sarana dari Kemitraan"
]

// Sub-options for "Pelibatan Orang Tua"
const KATEGORI_PELIBATAN_OPTIONS = [
  "Orangtua aktif sebagai salah satu kepanitiaan",
  "Orangtua terlibat dalam berbagai kegiatan Gugusdepan",
  "Orangtua memberikan bantuan kepada Gugusdepan",
  "Orang mengikuti Musyawarah/rapat di gugus depan"
]

// Sub-options for "Bantuan Sarana"
const KATEGORI_BANTUAN_OPTIONS = [
  "Bantuan Fisik",
  "Bantuan Non-Fisik"
]

export default function KemitraanPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [kemitraanData, setKemitraanData] = useState<KemitraanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedKemitraan, setSelectedKemitraan] = useState<KemitraanRecord | null>(null)

  const [formData, setFormData] = useState({
    nama_mitra: "",
    jenis_mitra: "",
    kategori_pelibatan: "",
    jumlah_kegiatan: "",
    keterangan: "",
  })

  // File states
  const [fotoKegiatan, setFotoKegiatan] = useState<File[]>([])
  const [fileBantuan, setFileBantuan] = useState<File | null>(null)
  const [fileKerjasama, setFileKerjasama] = useState<File | null>(null)

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)

      const { data: kemitraan } = await supabase
        .from("kemitraan")
        .select("*")
        .order("created_at", { ascending: false })

      if (kemitraan) {
        setKemitraanData(kemitraan)
      }
      setLoading(false)
    }
    checkAuthAndFetch()
  }, [router])

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from("kemitraan-files")
        .upload(fileName, file)

      if (error) {
        throw new Error(`Gagal upload ${file.name}: ${error.message}`)
      }

      const { data: urlData } = supabase.storage
        .from("kemitraan-files")
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error("Upload file error:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()

      // Upload files
      let fotoUrls: string[] = []
      let bantuanUrl = null
      let kerjasamaUrl = null

      if (fotoKegiatan.length > 0) {
        for (const foto of fotoKegiatan) {
          const url = await uploadFile(foto, "foto")
          if (url) fotoUrls.push(url)
        }
      }
      if (fileBantuan) {
        bantuanUrl = await uploadFile(fileBantuan, "bantuan")
      }
      if (fileKerjasama) {
        kerjasamaUrl = await uploadFile(fileKerjasama, "kerjasama")
      }

      const dataToSave: any = {
        nama_mitra: formData.nama_mitra,
        jenis_mitra: formData.jenis_mitra,
        keterangan: formData.keterangan || null,
      }

      // Add conditional fields
      if (formData.kategori_pelibatan) {
        dataToSave.kategori_pelibatan = formData.kategori_pelibatan
      }
      if (formData.jumlah_kegiatan) {
        dataToSave.jumlah_kegiatan = Number.parseInt(formData.jumlah_kegiatan)
      }
      if (fotoUrls.length > 0) dataToSave.foto_kegiatan = fotoUrls
      if (bantuanUrl) dataToSave.file_bantuan = bantuanUrl
      if (kerjasamaUrl) dataToSave.file_kerjasama = kerjasamaUrl

      if (editingId) {
        const { error: updateError } = await supabase
          .from("kemitraan")
          .update(dataToSave)
          .eq("id", editingId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from("kemitraan")
          .insert([dataToSave])

        if (insertError) throw insertError
      }

      setSuccess(true)
      resetForm()

      const { data: updated } = await supabase
        .from("kemitraan")
        .select("*")
        .order("created_at", { ascending: false })

      if (updated) {
        setKemitraanData(updated)
      }

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan data")
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nama_mitra: "",
      jenis_mitra: "",
      kategori_pelibatan: "",
      jumlah_kegiatan: "",
      keterangan: "",
    })
    setFotoKegiatan([])
    setFileBantuan(null)
    setFileKerjasama(null)
    setEditingId(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Reset kategori_pelibatan when jenis_mitra changes
    if (name === "jenis_mitra") {
      setFormData((prev) => ({ ...prev, jenis_mitra: value, kategori_pelibatan: "" }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEdit = (kemitraan: KemitraanRecord) => {
    setFormData({
      nama_mitra: kemitraan.nama_mitra,
      jenis_mitra: kemitraan.jenis_mitra,
      kategori_pelibatan: kemitraan.kategori_pelibatan || "",
      jumlah_kegiatan: kemitraan.jumlah_kegiatan ? String(kemitraan.jumlah_kegiatan) : "",
      keterangan: kemitraan.keterangan || "",
    })
    setEditingId(kemitraan.id)
    setSelectedKemitraan(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from("kemitraan").delete().eq("id", id)

      if (deleteError) throw deleteError

      const updated = kemitraanData.filter((k) => k.id !== id)
      setKemitraanData(updated)
      setSelectedKemitraan(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data")
    }
  }

  const handleDownloadAll = () => {
    // Create a simple text file with all kemitraan data
    const content = kemitraanData.map((k, i) =>
      `${i + 1}. ${k.nama_mitra}\n   Jenis: ${k.jenis_mitra}\n   ${k.kategori_pelibatan ? `Kategori: ${k.kategori_pelibatan}\n   ` : ''}${k.keterangan ? `Keterangan: ${k.keterangan}\n` : ''}\n`
    ).join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kemitraan-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Get kategori options based on jenis_mitra
  const getKategoriOptions = () => {
    if (formData.jenis_mitra === "Pelibatan Orang Tua dalam Kegiatan Gugusdepan") {
      return KATEGORI_PELIBATAN_OPTIONS
    }
    if (formData.jenis_mitra === "Bantuan Sarana dari Kemitraan") {
      return KATEGORI_BANTUAN_OPTIONS
    }
    return []
  }

  const showKategoriField = formData.jenis_mitra === "Pelibatan Orang Tua dalam Kegiatan Gugusdepan" ||
    formData.jenis_mitra === "Bantuan Sarana dari Kemitraan"
  const showJumlahKegiatan = formData.jenis_mitra === "Kerjasama Kegiatan dengan Gugusdepan, Lembaga, Institusi, Perorangan dan Alumni"
  const showFileBantuan = formData.jenis_mitra === "Pelibatan Orang Tua dalam Kegiatan Gugusdepan" ||
    formData.jenis_mitra === "Bantuan Sarana dari Kemitraan"
  const showFileKerjasama = formData.jenis_mitra === "Kerjasama Kegiatan dengan Gugusdepan, Lembaga, Institusi, Perorangan dan Alumni"

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚜️</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Detail View
  if (selectedKemitraan) {
    return (
      <div className="min-h-screen bg-secondary">
        <div className="bg-primary text-primary-foreground py-4 px-4 sm:py-6 sm:px-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold">Detail Kemitraan</h1>
              <p className="text-sm text-primary-foreground/80">{selectedKemitraan.nama_mitra}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedKemitraan(null)}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs sm:text-sm flex-shrink-0"
              size="sm"
            >
              Kembali
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4">Informasi Kemitraan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground text-sm">Nama Mitra:</span>
                <p className="font-medium">{selectedKemitraan.nama_mitra}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Jenis Mitra/Organisasi:</span>
                <p className="font-medium">{selectedKemitraan.jenis_mitra}</p>
              </div>
              {selectedKemitraan.kategori_pelibatan && (
                <div>
                  <span className="text-muted-foreground text-sm">Kategori:</span>
                  <p className="font-medium">{selectedKemitraan.kategori_pelibatan}</p>
                </div>
              )}
              {selectedKemitraan.jumlah_kegiatan && (
                <div>
                  <span className="text-muted-foreground text-sm">Jumlah Kegiatan:</span>
                  <p className="font-medium">{selectedKemitraan.jumlah_kegiatan} kegiatan</p>
                </div>
              )}
              {selectedKemitraan.keterangan && (
                <div className="col-span-2">
                  <span className="text-muted-foreground text-sm">Keterangan:</span>
                  <p className="font-medium">{selectedKemitraan.keterangan}</p>
                </div>
              )}
            </div>
          </div>

          {(selectedKemitraan.file_bantuan || selectedKemitraan.file_kerjasama) && (
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h3 className="font-bold mb-4">Dokumen</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedKemitraan.file_bantuan && (
                  <a
                    href={selectedKemitraan.file_bantuan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-secondary transition"
                  >
                    <span className="text-xl">📄</span>
                    <span className="text-sm">Tanda Terima Bantuan</span>
                    <span className="text-xs text-muted-foreground ml-auto">Lihat PDF →</span>
                  </a>
                )}
                {selectedKemitraan.file_kerjasama && (
                  <a
                    href={selectedKemitraan.file_kerjasama}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-secondary transition"
                  >
                    <span className="text-xl">📄</span>
                    <span className="text-sm">Surat Kerja Sama</span>
                    <span className="text-xs text-muted-foreground ml-auto">Lihat PDF →</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {(() => {
            let fotoArray: string[] = []
            if (Array.isArray(selectedKemitraan.foto_kegiatan)) {
              fotoArray = selectedKemitraan.foto_kegiatan
            } else if (typeof selectedKemitraan.foto_kegiatan === 'string' && selectedKemitraan.foto_kegiatan) {
              try {
                const parsed = JSON.parse(selectedKemitraan.foto_kegiatan)
                fotoArray = Array.isArray(parsed) ? parsed : [selectedKemitraan.foto_kegiatan]
              } catch {
                fotoArray = [selectedKemitraan.foto_kegiatan]
              }
            }

            if (fotoArray.length === 0) return null

            return (
              <div className="bg-card rounded-lg shadow-lg p-6">
                <h3 className="font-bold mb-4">Foto Kegiatan ({fotoArray.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {fotoArray.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition"
                    >
                      <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-primary text-primary-foreground py-4 px-4 sm:py-6 sm:px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Kemitraan</h1>
            <p className="text-sm text-primary-foreground/80">Manajemen Mitra Gudep</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleDownloadAll}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs sm:text-sm whitespace-nowrap"
              size="sm"
            >
              💾 Download
            </Button>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs sm:text-sm"
                size="sm"
              >
                Kembali
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Kemitraan" : "Tambah Kemitraan"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nama_mitra" className="text-sm font-medium">
                    Nama Mitra *
                  </Label>
                  <Input
                    id="nama_mitra"
                    name="nama_mitra"
                    type="text"
                    placeholder="Nama mitra/organisasi"
                    value={formData.nama_mitra}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="jenis_mitra" className="text-sm font-medium">
                    Jenis Mitra/Organisasi *
                  </Label>
                  <select
                    id="jenis_mitra"
                    name="jenis_mitra"
                    value={formData.jenis_mitra}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  >
                    <option value="">-- Pilih Jenis --</option>
                    {JENIS_MITRA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {showKategoriField && (
                  <div>
                    <Label htmlFor="kategori_pelibatan" className="text-sm font-medium">
                      Kategori *
                    </Label>
                    <select
                      id="kategori_pelibatan"
                      name="kategori_pelibatan"
                      value={formData.kategori_pelibatan}
                      onChange={handleChange}
                      required
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {getKategoriOptions().map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )}

                {showJumlahKegiatan && (
                  <div>
                    <Label htmlFor="jumlah_kegiatan" className="text-sm font-medium">
                      Jumlah Kegiatan yang Telah Dilakukan
                    </Label>
                    <Input
                      id="jumlah_kegiatan"
                      name="jumlah_kegiatan"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.jumlah_kegiatan}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="foto_kegiatan" className="text-sm font-medium">
                    Upload Foto (JPG/PNG, max 5)
                  </Label>
                  <Input
                    id="foto_kegiatan"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length > 5) {
                        alert("Maksimal 5 foto")
                        e.target.value = ""
                        return
                      }
                      setFotoKegiatan(files)
                    }}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: JPG/PNG, Max 5 file</p>
                </div>

                {showFileBantuan && (
                  <div>
                    <Label htmlFor="file_bantuan" className="text-sm font-medium">
                      Upload Tanda Terima Bantuan (PDF)
                    </Label>
                    <Input
                      id="file_bantuan"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFileBantuan(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Format: PDF</p>
                  </div>
                )}

                {showFileKerjasama && (
                  <div>
                    <Label htmlFor="file_kerjasama" className="text-sm font-medium">
                      Upload Surat Kerja Sama (PDF)
                    </Label>
                    <Input
                      id="file_kerjasama"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFileKerjasama(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Format: PDF</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="keterangan" className="text-sm font-medium">
                    Keterangan
                  </Label>
                  <textarea
                    id="keterangan"
                    name="keterangan"
                    placeholder="Keterangan tambahan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    rows={2}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  />
                </div>

                {error && (
                  <div className="p-2 bg-destructive/10 border border-destructive rounded text-xs text-destructive">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-2 bg-emerald-100 border border-emerald-300 rounded text-xs text-emerald-700">
                    Data berhasil disimpan!
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-sm" disabled={submitting || uploading}>
                    {uploading ? "Uploading..." : submitting ? "Menyimpan..." : "Simpan"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1 text-sm"
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {kemitraanData.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center text-muted-foreground">
                  <p>Tidak ada data kemitraan</p>
                </div>
              ) : (
                kemitraanData.map((kemitraan) => (
                  <div
                    key={kemitraan.id}
                    className="bg-card rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer"
                    onClick={() => setSelectedKemitraan(kemitraan)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-card-foreground">{kemitraan.nama_mitra}</h3>
                        <p className="text-sm text-muted-foreground">{kemitraan.jenis_mitra}</p>
                        {kemitraan.kategori_pelibatan && (
                          <p className="text-xs text-muted-foreground mt-1">• {kemitraan.kategori_pelibatan}</p>
                        )}
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(kemitraan)} className="text-xs">
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(kemitraan.id)}
                          className="text-xs text-destructive hover:bg-destructive/10"
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                    {kemitraan.jumlah_kegiatan && (
                      <div className="text-xs text-muted-foreground">
                        📊 {kemitraan.jumlah_kegiatan} kegiatan
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
