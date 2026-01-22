"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface KegiatanRecord {
  id: number
  created_at: string
  nama_kegiatan: string
  tanggal: string
  lokasi: string
  kategori: string
  jenis_kegiatan: string
  peserta_hadir: number
  keterangan: string | null
  file_proposal: string | null
  file_laporan: string | null
  foto_kegiatan: string[] | null
}

// Kegiatan options based on kategori
const KEGIATAN_SIAGA = [
  "Penerimaan Anggota",
  "Pasar Siaga",
  "Bazar Siaga",
  "Ketangkasan dan Ketrampilan",
  "Karnaval",
  "Perkemahan Siang Hari",
  "Pameran (Exposisi)",
  "Pesta Seni Budaya",
  "Lainnya"
]

const KEGIATAN_PENGGALANG = [
  "Penerimaan Anggota",
  "Latihan Gabungan",
  "Penjelajahan",
  "Perkemahan Sabtu Minggu (Persami)",
  "Lomba Tingkat I",
  "Dianpinru",
  "Pentas Seni",
  "Pameran Hasil Karya",
  "Lain-lain"
]

const KEGIATAN_PARTISIPASI = [
  "Kegiatan di Tingkat Ranting",
  "Kegiatan di Tingkat Cabang",
  "Menghadiri Undangan Kegiatan Gudep atau Lembaga Lain"
]

export default function KegiatanPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [kegiatanData, setKegiatanData] = useState<KegiatanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedKegiatan, setSelectedKegiatan] = useState<KegiatanRecord | null>(null)
  const [filterKategori, setFilterKategori] = useState("Semua")

  const [formData, setFormData] = useState({
    nama_kegiatan: "",
    tanggal: "",
    lokasi: "",
    kategori: "",
    jenis_kegiatan: "",
    peserta_hadir: "0",
    keterangan: "",
  })

  // File states
  const [fileProposal, setFileProposal] = useState<File | null>(null)
  const [fileLaporan, setFileLaporan] = useState<File | null>(null)
  const [fotoKegiatan, setFotoKegiatan] = useState<File[]>([])

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)

      const { data: kegiatan } = await supabase
        .from("kegiatan_gudep")
        .select("*")
        .order("tanggal", { ascending: false })

      if (kegiatan) {
        setKegiatanData(kegiatan)
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
        .from("kegiatan-files")
        .upload(fileName, file)

      if (error) {
        throw new Error(`Gagal upload ${file.name}: ${error.message}`)
      }

      const { data: urlData } = supabase.storage
        .from("kegiatan-files")
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
      let proposalUrl = null
      let laporanUrl = null
      let fotoUrls: string[] = []

      if (fileProposal) {
        proposalUrl = await uploadFile(fileProposal, "proposal")
      }
      if (fileLaporan) {
        laporanUrl = await uploadFile(fileLaporan, "laporan")
      }
      if (fotoKegiatan.length > 0) {
        for (const foto of fotoKegiatan) {
          const url = await uploadFile(foto, "foto")
          if (url) fotoUrls.push(url)
        }
      }

      const dataToSave: any = {
        ...formData,
        peserta_hadir: Number.parseInt(formData.peserta_hadir),
      }
      if (proposalUrl) dataToSave.file_proposal = proposalUrl
      if (laporanUrl) dataToSave.file_laporan = laporanUrl
      if (fotoUrls.length > 0) dataToSave.foto_kegiatan = fotoUrls

      if (editingId) {
        const { error: updateError } = await supabase
          .from("kegiatan_gudep")
          .update(dataToSave)
          .eq("id", editingId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from("kegiatan_gudep")
          .insert([dataToSave])

        if (insertError) throw insertError
      }

      setSuccess(true)
      resetForm()

      const { data: updated } = await supabase
        .from("kegiatan_gudep")
        .select("*")
        .order("tanggal", { ascending: false })

      if (updated) {
        setKegiatanData(updated)
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
      nama_kegiatan: "",
      tanggal: "",
      lokasi: "",
      kategori: "",
      jenis_kegiatan: "",
      peserta_hadir: "0",
      keterangan: "",
    })
    setFileProposal(null)
    setFileLaporan(null)
    setFotoKegiatan([])
    setEditingId(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Reset jenis_kegiatan when kategori changes
    if (name === "kategori") {
      setFormData((prev) => ({ ...prev, kategori: value, jenis_kegiatan: "" }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEdit = (kegiatan: KegiatanRecord) => {
    setFormData({
      nama_kegiatan: kegiatan.nama_kegiatan,
      tanggal: kegiatan.tanggal,
      lokasi: kegiatan.lokasi,
      kategori: kegiatan.kategori || "",
      jenis_kegiatan: kegiatan.jenis_kegiatan || "",
      peserta_hadir: String(kegiatan.peserta_hadir),
      keterangan: kegiatan.keterangan || "",
    })
    setEditingId(kegiatan.id)
    setSelectedKegiatan(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from("kegiatan_gudep").delete().eq("id", id)

      if (deleteError) throw deleteError

      const updated = kegiatanData.filter((k) => k.id !== id)
      setKegiatanData(updated)
      setSelectedKegiatan(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Get jenis kegiatan options based on kategori
  const getJenisOptions = () => {
    if (formData.kategori === "Siaga") return KEGIATAN_SIAGA
    if (formData.kategori === "Penggalang") return KEGIATAN_PENGGALANG
    if (formData.kategori === "Partisipasi") return KEGIATAN_PARTISIPASI
    return []
  }

  const filteredData = kegiatanData.filter((kegiatan) => {
    if (filterKategori === "Semua") return true
    return kegiatan.kategori === filterKategori
  })

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
  if (selectedKegiatan) {
    return (
      <div className="min-h-screen bg-secondary print:bg-white">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-4 px-4 sm:py-6 sm:px-6 print:hidden">
          <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold">Detail Kegiatan</h1>
              <p className="text-sm text-primary-foreground/80">{selectedKegiatan.nama_kegiatan}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs sm:text-sm whitespace-nowrap"
                size="sm"
              >
                🖨️ Print
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedKegiatan(null)}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs sm:text-sm"
                size="sm"
              >
                Kembali
              </Button>
            </div>
          </div>
        </div>

        {/* Detail Content */}
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Info Kegiatan */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4">Informasi Kegiatan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground text-sm">Nama Kegiatan:</span>
                <p className="font-medium">{selectedKegiatan.nama_kegiatan}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Tanggal:</span>
                <p className="font-medium">{new Date(selectedKegiatan.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Kategori:</span>
                <p className="font-medium">{selectedKegiatan.kategori}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Jenis Kegiatan:</span>
                <p className="font-medium">{selectedKegiatan.jenis_kegiatan}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Lokasi:</span>
                <p className="font-medium">{selectedKegiatan.lokasi || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Peserta Hadir:</span>
                <p className="font-medium">{selectedKegiatan.peserta_hadir} orang</p>
              </div>
              {selectedKegiatan.keterangan && (
                <div className="col-span-2">
                  <span className="text-muted-foreground text-sm">Keterangan:</span>
                  <p className="font-medium">{selectedKegiatan.keterangan}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dokumen */}
          {(selectedKegiatan.file_proposal || selectedKegiatan.file_laporan) && (
            <div className="bg-card rounded-lg shadow-lg p-6 print:hidden">
              <h3 className="font-bold mb-4">Dokumen</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedKegiatan.file_proposal && (
                  <a
                    href={selectedKegiatan.file_proposal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-secondary transition"
                  >
                    <span className="text-xl">📄</span>
                    <span className="text-sm">Proposal</span>
                    <span className="text-xs text-muted-foreground ml-auto">Lihat PDF →</span>
                  </a>
                )}
                {selectedKegiatan.file_laporan && (
                  <a
                    href={selectedKegiatan.file_laporan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-secondary transition"
                  >
                    <span className="text-xl">📄</span>
                    <span className="text-sm">Laporan</span>
                    <span className="text-xs text-muted-foreground ml-auto">Lihat PDF →</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Foto Kegiatan */}
          {(() => {
            let fotoArray: string[] = []
            if (Array.isArray(selectedKegiatan.foto_kegiatan)) {
              fotoArray = selectedKegiatan.foto_kegiatan
            } else if (typeof selectedKegiatan.foto_kegiatan === 'string' && selectedKegiatan.foto_kegiatan) {
              try {
                const parsed = JSON.parse(selectedKegiatan.foto_kegiatan)
                fotoArray = Array.isArray(parsed) ? parsed : [selectedKegiatan.foto_kegiatan]
              } catch {
                fotoArray = [selectedKegiatan.foto_kegiatan]
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
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-4 sm:py-6 sm:px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Kegiatan Gudep</h1>
            <p className="text-sm text-primary-foreground/80">Manajemen Kegiatan Pramuka</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs sm:text-sm whitespace-nowrap"
              size="sm"
            >
              🖨️ Print
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Kegiatan" : "Tambah Kegiatan"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nama_kegiatan" className="text-sm font-medium">
                    Nama Kegiatan *
                  </Label>
                  <Input
                    id="nama_kegiatan"
                    name="nama_kegiatan"
                    type="text"
                    placeholder="Nama kegiatan"
                    value={formData.nama_kegiatan}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="tanggal" className="text-sm font-medium">
                    Tanggal *
                  </Label>
                  <Input
                    id="tanggal"
                    name="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="kategori" className="text-sm font-medium">
                    Kategori *
                  </Label>
                  <select
                    id="kategori"
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    <option value="Siaga">Siaga</option>
                    <option value="Penggalang">Penggalang</option>
                    <option value="Partisipasi">Partisipasi</option>
                  </select>
                </div>

                {/* Conditional: Show jenis_kegiatan based on kategori */}
                {formData.kategori && (
                  <div>
                    <Label htmlFor="jenis_kegiatan" className="text-sm font-medium">
                      Jenis Kegiatan *
                    </Label>
                    <select
                      id="jenis_kegiatan"
                      name="jenis_kegiatan"
                      value={formData.jenis_kegiatan}
                      onChange={handleChange}
                      required
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                    >
                      <option value="">-- Pilih Jenis Kegiatan --</option>
                      {getJenisOptions().map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <Label htmlFor="lokasi" className="text-sm font-medium">
                    Lokasi
                  </Label>
                  <Input
                    id="lokasi"
                    name="lokasi"
                    type="text"
                    placeholder="Lokasi kegiatan"
                    value={formData.lokasi}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="peserta_hadir" className="text-sm font-medium">
                    Peserta Hadir
                  </Label>
                  <Input
                    id="peserta_hadir"
                    name="peserta_hadir"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.peserta_hadir}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="file_proposal" className="text-sm font-medium">
                    Upload Proposal (PDF)
                  </Label>
                  <Input
                    id="file_proposal"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFileProposal(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: PDF</p>
                </div>

                <div>
                  <Label htmlFor="file_laporan" className="text-sm font-medium">
                    Upload Laporan (PDF)
                  </Label>
                  <Input
                    id="file_laporan"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFileLaporan(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: PDF</p>
                </div>

                <div>
                  <Label htmlFor="foto_kegiatan" className="text-sm font-medium">
                    Upload Foto Kegiatan (JPG/PNG, max 5)
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

                <div>
                  <Label htmlFor="keterangan" className="text-sm font-medium">
                    Keterangan
                  </Label>
                  <textarea
                    id="keterangan"
                    name="keterangan"
                    placeholder="Keterangan kegiatan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    rows={2}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  />
                </div>

                {/* Messages */}
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

          {/* Data List */}
          <div className="lg:col-span-2">
            {/* Filter */}
            <div className="mb-4">
              <Label htmlFor="filterKategori" className="text-sm font-medium">
                Filter Kategori
              </Label>
              <select
                id="filterKategori"
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Siaga">Siaga</option>
                <option value="Penggalang">Penggalang</option>
                <option value="Partisipasi">Partisipasi</option>
              </select>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredData.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center text-muted-foreground">
                  <p>Tidak ada data kegiatan</p>
                </div>
              ) : (
                filteredData.map((kegiatan) => (
                  <div
                    key={kegiatan.id}
                    className="bg-card rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer"
                    onClick={() => setSelectedKegiatan(kegiatan)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-card-foreground">{kegiatan.nama_kegiatan}</h3>
                        <p className="text-sm text-muted-foreground">{kegiatan.kategori} - {kegiatan.jenis_kegiatan}</p>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(kegiatan)} className="text-xs">
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(kegiatan.id)}
                          className="text-xs text-destructive hover:bg-destructive/10"
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>📅 {new Date(kegiatan.tanggal).toLocaleDateString("id-ID")}</div>
                      <div>👥 {kegiatan.peserta_hadir} orang</div>
                      <div className="col-span-2">📍 {kegiatan.lokasi || "-"}</div>
                    </div>
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
