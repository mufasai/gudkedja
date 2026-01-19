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
  bidang: string
  kontak: string
  email: string
  alamat: string
  keterangan: string | null
}

export default function KemitraanPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [kemitraanData, setKemitraanData] = useState<KemitraanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [searchNama, setSearchNama] = useState("")
  const [filterBidang, setFilterBidang] = useState("Semua")
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    nama_mitra: "",
    bidang: "",
    kontak: "",
    email: "",
    alamat: "",
    keterangan: "",
  })

  const BIDANG_OPTIONS = [
    "Pendidikan",
    "Kesehatan",
    "Olahraga",
    "Kesenian",
    "Lingkungan",
    "Bisnis",
    "Pemerintah",
    "Komunitas",
    "Lainnya",
  ]

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)

      const { data: kemitraan } = await supabase.from("kemitraan").select("*").order("created_at", { ascending: false })

      if (kemitraan) {
        setKemitraanData(kemitraan)
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

      if (editingId) {
        const { error: updateError } = await supabase.from("kemitraan").update(formData).eq("id", editingId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("kemitraan").insert([formData])

        if (insertError) throw insertError
      }

      setSuccess(true)
      setFormData({
        nama_mitra: "",
        bidang: "",
        kontak: "",
        email: "",
        alamat: "",
        keterangan: "",
      })
      setEditingId(null)

      const { data: updated } = await supabase.from("kemitraan").select("*").order("created_at", { ascending: false })

      if (updated) {
        setKemitraanData(updated)
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

  const handleEdit = (kemitraan: KemitraanRecord) => {
    setFormData({
      nama_mitra: kemitraan.nama_mitra,
      bidang: kemitraan.bidang,
      kontak: kemitraan.kontak,
      email: kemitraan.email,
      alamat: kemitraan.alamat,
      keterangan: kemitraan.keterangan || "",
    })
    setEditingId(kemitraan.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from("kemitraan").delete().eq("id", id)

      if (deleteError) throw deleteError

      const updated = kemitraanData.filter((k) => k.id !== id)
      setKemitraanData(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data")
    }
  }

  const filteredData = kemitraanData.filter((kemitraan) => {
    const matchNama = kemitraan.nama_mitra.toLowerCase().includes(searchNama.toLowerCase())
    const matchBidang = filterBidang === "Semua" || kemitraan.bidang === filterBidang
    return matchNama && matchBidang
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

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-4 sm:py-6 sm:px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Kemitraan</h1>
            <p className="text-sm text-primary-foreground/80">Manajemen Mitra Gudep</p>
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
            <div className="bg-card rounded-lg shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Mitra" : "Tambah Mitra"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nama_mitra" className="text-sm font-medium">
                    Nama Mitra
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
                  <Label htmlFor="bidang" className="text-sm font-medium">
                    Bidang
                  </Label>
                  <select
                    id="bidang"
                    name="bidang"
                    value={formData.bidang}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  >
                    <option value="">-- Pilih Bidang --</option>
                    {BIDANG_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="kontak" className="text-sm font-medium">
                    Kontak (Nama PIC)
                  </Label>
                  <Input
                    id="kontak"
                    name="kontak"
                    type="text"
                    placeholder="Nama penanggung jawab"
                    value={formData.kontak}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="alamat" className="text-sm font-medium">
                    Alamat
                  </Label>
                  <textarea
                    id="alamat"
                    name="alamat"
                    placeholder="Alamat lengkap"
                    value={formData.alamat}
                    onChange={handleChange}
                    rows={2}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="keterangan" className="text-sm font-medium">
                    Keterangan
                  </Label>
                  <textarea
                    id="keterangan"
                    name="keterangan"
                    placeholder="Bentuk kerjasama, dll"
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
                          nama_mitra: "",
                          bidang: "",
                          kontak: "",
                          email: "",
                          alamat: "",
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
            {/* Filters */}
            <div className="mb-4 space-y-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium">
                  Cari Mitra
                </Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Cari berdasarkan nama..."
                  value={searchNama}
                  onChange={(e) => setSearchNama(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="filter-bidang" className="text-sm font-medium">
                  Filter Bidang
                </Label>
                <select
                  id="filter-bidang"
                  value={filterBidang}
                  onChange={(e) => setFilterBidang(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                >
                  <option value="Semua">Semua Bidang</option>
                  {BIDANG_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredData.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center text-muted-foreground">
                  <p>Tidak ada data kemitraan</p>
                </div>
              ) : (
                filteredData.map((kemitraan) => (
                  <div key={kemitraan.id} className="bg-card rounded-lg p-4 shadow hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-card-foreground">{kemitraan.nama_mitra}</h3>
                        <p className="text-sm text-muted-foreground">{kemitraan.bidang}</p>
                      </div>
                      <div className="flex gap-2">
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
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {kemitraan.kontak && <div>PIC: {kemitraan.kontak}</div>}
                      {kemitraan.email && <div>Email: {kemitraan.email}</div>}
                      {kemitraan.alamat && <div>Alamat: {kemitraan.alamat}</div>}
                      {kemitraan.keterangan && <div>Keterangan: {kemitraan.keterangan}</div>}
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
