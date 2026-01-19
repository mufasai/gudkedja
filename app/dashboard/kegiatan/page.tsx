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
  jenis: string
  peserta_hadir: number
  keterangan: string | null
}

export default function KegiatanPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [kegiatanData, setKegiatanData] = useState<KegiatanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    nama_kegiatan: "",
    tanggal: "",
    lokasi: "",
    jenis: "Latihan",
    peserta_hadir: "0",
    keterangan: "",
  })

  const JENIS_OPTIONS = ["Latihan", "Perkemahan", "Hiking", "Lomba", "Upacara", "Pertemuan", "Lainnya"]

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const dataToInsert = {
        ...formData,
        peserta_hadir: Number.parseInt(formData.peserta_hadir),
      }

      if (editingId) {
        const { error: updateError } = await supabase.from("kegiatan_gudep").update(dataToInsert).eq("id", editingId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("kegiatan_gudep").insert([dataToInsert])

        if (insertError) throw insertError
      }

      setSuccess(true)
      setFormData({
        nama_kegiatan: "",
        tanggal: "",
        lokasi: "",
        jenis: "Latihan",
        peserta_hadir: "0",
        keterangan: "",
      })
      setEditingId(null)

      const { data: updated } = await supabase.from("kegiatan_gudep").select("*").order("tanggal", { ascending: false })

      if (updated) {
        setKegiatanData(updated)
      }

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
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
      jenis: kegiatan.jenis,
      peserta_hadir: String(kegiatan.peserta_hadir),
      keterangan: kegiatan.keterangan || "",
    })
    setEditingId(kegiatan.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from("kegiatan_gudep").delete().eq("id", id)

      if (deleteError) throw deleteError

      const updated = kegiatanData.filter((k) => k.id !== id)
      setKegiatanData(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data")
    }
  }

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
            <h1 className="text-2xl font-bold">Kegiatan Gudep</h1>
            <p className="text-sm text-primary-foreground/80">Manajemen Kegiatan Pramuka</p>
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
              <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Kegiatan" : "Tambah Kegiatan"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nama_kegiatan" className="text-sm font-medium">
                    Nama Kegiatan
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
                    Tanggal
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
                  <Label htmlFor="jenis" className="text-sm font-medium">
                    Jenis Kegiatan
                  </Label>
                  <select
                    id="jenis"
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  >
                    {JENIS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

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
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-sm" disabled={submitting}>
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null)
                        setFormData({
                          nama_kegiatan: "",
                          tanggal: "",
                          lokasi: "",
                          jenis: "Latihan",
                          peserta_hadir: "0",
                          keterangan: "",
                        })
                      }}
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
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {kegiatanData.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center text-muted-foreground">
                  <p>Tidak ada data kegiatan</p>
                </div>
              ) : (
                kegiatanData.map((kegiatan) => (
                  <div key={kegiatan.id} className="bg-card rounded-lg p-4 shadow hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-card-foreground">{kegiatan.nama_kegiatan}</h3>
                        <p className="text-sm text-muted-foreground">{kegiatan.jenis}</p>
                      </div>
                      <div className="flex gap-2">
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
                      <div>Tanggal: {new Date(kegiatan.tanggal).toLocaleDateString("id-ID")}</div>
                      <div>Peserta: {kegiatan.peserta_hadir} orang</div>
                      <div className="col-span-2">Lokasi: {kegiatan.lokasi || "-"}</div>
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
