"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface PembinaRecord {
  id: number
  created_at: string
  nama_lengkap: string
  jabatan: string
  npa: string
  kursus: string
  no_telepon: string
  email: string
  alamat: string
  file_sk: string | null
  file_kta: string | null
  file_ijazah_kursus: string[] | null // Changed to array
  foto_pelantikan: string[] | null
  berkas_lain: string[] | null
}

const JABATAN_OPTIONS = ["Mabigus", "Pembina Siaga", "Pembina Penggalang"]
const KURSUS_OPTIONS = ["Belum", "KMD", "KML", "KPD", "KPL"]

export default function DataPembinaPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [pembinaData, setPembinaData] = useState<PembinaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [searchNama, setSearchNama] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedPembina, setSelectedPembina] = useState<PembinaRecord | null>(null)

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    jabatan: "",
    npa: "",
    kursus: "Belum",
    no_telepon: "",
    email: "",
    alamat: "",
  })

  // File states
  const [fileSK, setFileSK] = useState<File | null>(null)
  const [fileKTA, setFileKTA] = useState<File | null>(null)
  const [fileIjazah, setFileIjazah] = useState<File[]>([]) // Changed to array, max 4
  const [fotoPelantikan, setFotoPelantikan] = useState<File[]>([])
  const [berkasLain, setBerkasLain] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)

      const { data: pembina } = await supabase
        .from("data_pembina")
        .select("*")
        .order("created_at", { ascending: false })

      if (pembina) {
        setPembinaData(pembina)
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

      console.log("Uploading file:", fileName)

      const { data, error } = await supabase.storage
        .from("pembina-files")
        .upload(fileName, file)

      if (error) {
        console.error("Upload error:", error)
        throw new Error(`Gagal upload ${file.name}: ${error.message}`)
      }

      const { data: urlData } = supabase.storage
        .from("pembina-files")
        .getPublicUrl(fileName)

      console.log("Upload success:", urlData.publicUrl)
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

      console.log("Starting upload process...")

      // Upload files
      let skUrl = null
      let ktaUrl = null
      let ijazahUrls: string[] = []
      let pelantikanUrls: string[] = []
      let berkasUrls: string[] = []

      if (fileSK) {
        console.log("Uploading SK...")
        skUrl = await uploadFile(fileSK, "sk")
      }
      if (fileKTA) {
        console.log("Uploading KTA...")
        ktaUrl = await uploadFile(fileKTA, "kta")
      }
      if (fileIjazah.length > 0) {
        console.log(`Uploading ${fileIjazah.length} ijazah files...`)
        for (const ijazah of fileIjazah) {
          const url = await uploadFile(ijazah, "ijazah")
          if (url) ijazahUrls.push(url)
        }
      }
      if (fotoPelantikan.length > 0) {
        console.log(`Uploading ${fotoPelantikan.length} foto pelantikan...`)
        for (const foto of fotoPelantikan) {
          const url = await uploadFile(foto, "pelantikan")
          if (url) pelantikanUrls.push(url)
        }
      }
      if (berkasLain.length > 0) {
        console.log(`Uploading ${berkasLain.length} berkas lain...`)
        for (const berkas of berkasLain) {
          const url = await uploadFile(berkas, "berkas")
          if (url) berkasUrls.push(url)
        }
      }

      console.log("All files uploaded, saving to database...")

      const dataToSave: any = { ...formData }
      // Tambahkan posisi dengan nilai yang sama dengan jabatan untuk backward compatibility
      dataToSave.posisi = formData.jabatan
      if (skUrl) dataToSave.file_sk = skUrl
      if (ktaUrl) dataToSave.file_kta = ktaUrl
      if (ijazahUrls.length > 0) dataToSave.file_ijazah_kursus = ijazahUrls
      if (pelantikanUrls.length > 0) dataToSave.foto_pelantikan = pelantikanUrls
      if (berkasUrls.length > 0) dataToSave.berkas_lain = berkasUrls

      console.log("Data to save:", dataToSave)

      if (editingId) {
        const { error: updateError } = await supabase
          .from("data_pembina")
          .update(dataToSave)
          .eq("id", editingId)

        if (updateError) {
          console.error("Update error:", updateError)
          throw updateError
        }
      } else {
        const { error: insertError } = await supabase
          .from("data_pembina")
          .insert([dataToSave])

        if (insertError) {
          console.error("Insert error:", insertError)
          throw insertError
        }
      }

      console.log("Data saved successfully!")

      setSuccess(true)
      resetForm()

      // Refresh data
      const { data: updated } = await supabase
        .from("data_pembina")
        .select("*")
        .order("created_at", { ascending: false })

      if (updated) {
        setPembinaData(updated)
      }

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error("Submit error:", err)
      const errorMessage = err?.message || "Gagal menyimpan data"
      setError(errorMessage)
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nama_lengkap: "",
      jabatan: "",
      npa: "",
      kursus: "Belum",
      no_telepon: "",
      email: "",
      alamat: "",
    })
    setFileSK(null)
    setFileKTA(null)
    setFileIjazah([]) // Changed to empty array
    setFotoPelantikan([])
    setBerkasLain([])
    setEditingId(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (pembina: PembinaRecord) => {
    setFormData({
      nama_lengkap: pembina.nama_lengkap,
      jabatan: pembina.jabatan || "",
      npa: pembina.npa || "",
      kursus: pembina.kursus || "Belum",
      no_telepon: pembina.no_telepon || "",
      email: pembina.email || "",
      alamat: pembina.alamat || "",
    })
    setEditingId(pembina.id)
    setSelectedPembina(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from("data_pembina").delete().eq("id", id)

      if (deleteError) throw deleteError

      const updated = pembinaData.filter((p) => p.id !== id)
      setPembinaData(updated)
      setSelectedPembina(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data")
    }
  }

  const filteredData = pembinaData.filter((pembina) =>
    pembina.nama_lengkap.toLowerCase().includes(searchNama.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-4 sm:py-6 sm:px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Data Pembina</h1>
            <p className="text-sm text-primary-foreground/80">Manajemen Data Pembina Gudep</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Kembali
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Data" : "Tambah Pembina"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nama_lengkap">Nama Lengkap *</Label>
                  <Input
                    id="nama_lengkap"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="jabatan">Jabatan *</Label>
                  <select
                    id="jabatan"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  >
                    <option value="">-- Pilih Jabatan --</option>
                    {JABATAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="file_sk">Upload SK Jabatan (PDF)</Label>
                  <Input
                    id="file_sk"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFileSK(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: PDF</p>
                </div>

                <div>
                  <Label htmlFor="npa">NPA (Nomor Pokok Anggota)</Label>
                  <Input
                    id="npa"
                    name="npa"
                    value={formData.npa}
                    onChange={handleChange}
                    placeholder="Nomor NPA"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="file_kta">Upload KTA (PDF)</Label>
                  <Input
                    id="file_kta"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFileKTA(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: PDF</p>
                </div>

                <div>
                  <Label htmlFor="kursus">Kursus Kepramukaan</Label>
                  <select
                    id="kursus"
                    name="kursus"
                    value={formData.kursus}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  >
                    {KURSUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="file_ijazah">Upload Ijazah Kursus (PDF, max 4)</Label>
                  <Input
                    id="file_ijazah"
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).slice(0, 4)
                      setFileIjazah(files)
                    }}
                    className="mt-1"
                  />
                  {fileIjazah.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{fileIjazah.length} file dipilih (max 4)</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Format: PDF, maksimal 4 file</p>
                </div>

                <div>
                  <Label htmlFor="foto_pelantikan">Foto Pelantikan (JPEG/JPG/PNG, max 5)</Label>
                  <Input
                    id="foto_pelantikan"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).slice(0, 5)
                      setFotoPelantikan(files)
                    }}
                    className="mt-1"
                  />
                  {fotoPelantikan.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{fotoPelantikan.length} file dipilih (max 5)</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Format: JPEG/JPG/PNG, maksimal 5 file</p>
                </div>

                <div>
                  <Label htmlFor="berkas_lain">Berkas Lain (PDF, max 5)</Label>
                  <Input
                    id="berkas_lain"
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).slice(0, 5)
                      setBerkasLain(files)
                    }}
                    className="mt-1"
                  />
                  {berkasLain.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{berkasLain.length} file dipilih (max 5)</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Format: PDF (Narakarya, SHB, THB, dll), maksimal 5 file</p>
                </div>

                <div>
                  <Label htmlFor="no_telepon">No. Telepon</Label>
                  <Input
                    id="no_telepon"
                    name="no_telepon"
                    value={formData.no_telepon}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="alamat">Alamat</Label>
                  <textarea
                    id="alamat"
                    name="alamat"
                    value={formData.alamat}
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
                  <Button type="submit" className="flex-1" disabled={submitting || uploading}>
                    {uploading ? "Mengupload..." : submitting ? "Menyimpan..." : "Simpan"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                      Batal
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Data List & Detail */}
          <div className="lg:col-span-2">
            {selectedPembina ? (
              <PembinaDetail
                pembina={selectedPembina}
                onBack={() => setSelectedPembina(null)}
                onEdit={() => handleEdit(selectedPembina)}
                onDelete={() => handleDelete(selectedPembina.id)}
              />
            ) : (
              <>
                {/* Search */}
                <div className="mb-4">
                  <Label htmlFor="search">Cari Pembina</Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Cari berdasarkan nama..."
                    value={searchNama}
                    onChange={(e) => setSearchNama(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredData.length === 0 ? (
                    <div className="bg-card rounded-lg p-8 text-center text-muted-foreground">
                      <p>Tidak ada data pembina</p>
                    </div>
                  ) : (
                    filteredData.map((pembina) => (
                      <div
                        key={pembina.id}
                        onClick={() => setSelectedPembina(pembina)}
                        className="bg-card rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-card-foreground">{pembina.nama_lengkap}</h3>
                            <p className="text-sm text-muted-foreground">{pembina.jabatan || "-"}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs ${pembina.kursus === "KPL" ? "bg-emerald-100 text-emerald-700" :
                              pembina.kursus === "KPD" ? "bg-blue-100 text-blue-700" :
                                pembina.kursus === "KML" ? "bg-purple-100 text-purple-700" :
                                  pembina.kursus === "KMD" ? "bg-amber-100 text-amber-700" :
                                    "bg-gray-100 text-gray-700"
                              }`}>
                              {pembina.kursus || "Belum"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          NPA: {pembina.npa || "-"} • {pembina.no_telepon || "-"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


// Component: Pembina Detail View
function PembinaDetail({
  pembina,
  onBack,
  onEdit,
  onDelete,
}: {
  pembina: PembinaRecord
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">{pembina.nama_lengkap}</h2>
            <p className="text-muted-foreground">{pembina.jabatan}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              Kembali
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive">
              Hapus
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">NPA:</span>
            <p className="font-medium">{pembina.npa || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Kursus:</span>
            <p className="font-medium">
              <span className={`px-2 py-1 rounded text-xs ${pembina.kursus === "KPL" ? "bg-emerald-100 text-emerald-700" :
                pembina.kursus === "KPD" ? "bg-blue-100 text-blue-700" :
                  pembina.kursus === "KML" ? "bg-purple-100 text-purple-700" :
                    pembina.kursus === "KMD" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-700"
                }`}>
                {pembina.kursus || "Belum"}
              </span>
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">No. Telepon:</span>
            <p className="font-medium">{pembina.no_telepon || "-"}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Alamat:</span>
            <p className="font-medium">{pembina.alamat || "-"}</p>
          </div>
        </div>
      </div>

      {/* Dokumen */}
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h3 className="font-bold mb-4">Dokumen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FileCard label="SK Jabatan" url={pembina.file_sk} />
          <FileCard label="KTA" url={pembina.file_kta} />
        </div>
      </div>

      {/* Ijazah Kursus */}
      {(() => {
        // Handle different data formats
        let ijazahArray: string[] = []
        if (Array.isArray(pembina.file_ijazah_kursus)) {
          ijazahArray = pembina.file_ijazah_kursus
        } else if (typeof pembina.file_ijazah_kursus === 'string' && pembina.file_ijazah_kursus) {
          // If it's a string, try to parse as JSON or treat as single URL
          try {
            const parsed = JSON.parse(pembina.file_ijazah_kursus)
            ijazahArray = Array.isArray(parsed) ? parsed : [pembina.file_ijazah_kursus]
          } catch {
            ijazahArray = [pembina.file_ijazah_kursus]
          }
        }

        if (ijazahArray.length === 0) return null

        return (
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h3 className="font-bold mb-4">Ijazah Kursus ({ijazahArray.length})</h3>
            <div className="space-y-2">
              {ijazahArray.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-secondary transition"
                >
                  <span className="text-xl">📄</span>
                  <span className="text-sm">Ijazah Kursus {index + 1}</span>
                  <span className="text-xs text-muted-foreground ml-auto">Lihat PDF →</span>
                </a>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Foto Pelantikan */}
      {Array.isArray(pembina.foto_pelantikan) && pembina.foto_pelantikan.length > 0 && (
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h3 className="font-bold mb-4">Foto Pelantikan ({pembina.foto_pelantikan.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {pembina.foto_pelantikan.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition"
              >
                <img src={url} alt={`Pelantikan ${index + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Berkas Lain */}
      {Array.isArray(pembina.berkas_lain) && pembina.berkas_lain.length > 0 && (
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h3 className="font-bold mb-4">Berkas Lain ({pembina.berkas_lain.length})</h3>
          <div className="space-y-2">
            {pembina.berkas_lain.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-secondary transition"
              >
                <span className="text-xl">📄</span>
                <span className="text-sm">Berkas {index + 1}</span>
                <span className="text-xs text-muted-foreground ml-auto">Lihat PDF →</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Component: File Card
function FileCard({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="p-4 border border-dashed border-border rounded-lg text-center">
        <span className="text-2xl text-muted-foreground">📄</span>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
        <p className="text-xs text-muted-foreground">Belum diupload</p>
      </div>
    )
  }

  const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border border-border rounded-lg text-center hover:border-primary hover:bg-secondary transition"
    >
      {isImage ? (
        <img src={url} alt={label} className="w-full h-20 object-cover rounded mb-2" />
      ) : (
        <span className="text-3xl">📄</span>
      )}
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-primary">Lihat →</p>
    </a>
  )
}
