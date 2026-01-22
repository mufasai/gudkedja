"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface PesertaRecord {
  id: number
  created_at: string
  nama_lengkap: string
  tempat_lahir: string
  tanggal_lahir: string
  usia?: number
  golongan: string
  kelas: string
  tahun_masuk: number
  no_induk: string
  alamat: string
  barung?: string
  regu?: string
}

export default function DataPesertaPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [pesertaData, setPesertaData] = useState<PesertaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [searchNama, setSearchNama] = useState("")
  const [filterGolongan, setFilterGolongan] = useState("Semua")
  const [filterTahun, setFilterTahun] = useState("Semua")
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    golongan: "",
    kelas: "",
    tahun_masuk: new Date().getFullYear(),
    no_induk: "",
    alamat: "",
    barung: "",
    regu: "",
  })

  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)

      const { data: peserta } = await supabase
        .from("data_peserta_didik")
        .select("*")
        .order("created_at", { ascending: false })

      if (peserta) {
        setPesertaData(peserta)
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
        const { error: updateError } = await supabase.from("data_peserta_didik").update(formData).eq("id", editingId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("data_peserta_didik").insert([formData])

        if (insertError) throw insertError
      }

      setSuccess(true)
      setFormData({
        nama_lengkap: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        golongan: "",
        kelas: "",
        tahun_masuk: new Date().getFullYear(),
        no_induk: "",
        alamat: "",
        barung: "",
        regu: "",
      })
      setEditingId(null)

      const { data: updated } = await supabase
        .from("data_peserta_didik")
        .select("*")
        .order("created_at", { ascending: false })

      if (updated) {
        setPesertaData(updated)
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

    // Auto clear barung/regu based on golongan selection
    if (name === "golongan") {
      if (value === "Siaga") {
        setFormData((prev) => ({ ...prev, golongan: value, regu: "" }))
      } else if (value === "Penggalang") {
        setFormData((prev) => ({ ...prev, golongan: value, barung: "" }))
      } else {
        setFormData((prev) => ({ ...prev, golongan: value, barung: "", regu: "" }))
      }
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "tahun_masuk" ? Number.parseInt(value) : value,
    }))
  }

  const handleEdit = (peserta: PesertaRecord) => {
    setFormData({
      nama_lengkap: peserta.nama_lengkap,
      tempat_lahir: peserta.tempat_lahir || "",
      tanggal_lahir: peserta.tanggal_lahir || "",
      golongan: peserta.golongan,
      kelas: peserta.kelas,
      tahun_masuk: peserta.tahun_masuk,
      no_induk: peserta.no_induk,
      alamat: peserta.alamat,
      barung: peserta.barung || "",
      regu: peserta.regu || "",
    })
    setEditingId(peserta.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from("data_peserta_didik").delete().eq("id", id)

      if (deleteError) throw deleteError

      const updated = pesertaData.filter((p) => p.id !== id)
      setPesertaData(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data")
    }
  }

  const filteredData = pesertaData.filter((peserta) => {
    const matchNama = peserta.nama_lengkap.toLowerCase().includes(searchNama.toLowerCase())
    const matchGolongan = filterGolongan === "Semua" || peserta.golongan === filterGolongan
    const matchTahun = filterTahun === "Semua" || peserta.tahun_masuk.toString() === filterTahun
    return matchNama && matchGolongan && matchTahun
  })

  // Get unique years for filter
  const availableYears = Array.from(new Set(pesertaData.map(p => p.tahun_masuk))).sort((a, b) => b - a)

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
            <h1 className="text-2xl font-bold">Data Peserta Didik</h1>
            <p className="text-sm text-primary-foreground/80">Manajemen Data Anggota Gudep</p>
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
              <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Data" : "Tambah Peserta"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nama_lengkap" className="text-sm font-medium">
                    Nama Lengkap *
                  </Label>
                  <Input
                    id="nama_lengkap"
                    name="nama_lengkap"
                    type="text"
                    placeholder="Nama lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="tempat_lahir" className="text-sm font-medium">
                      Tempat Lahir
                    </Label>
                    <Input
                      id="tempat_lahir"
                      name="tempat_lahir"
                      type="text"
                      placeholder="Kota"
                      value={formData.tempat_lahir}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tanggal_lahir" className="text-sm font-medium">
                      Tanggal Lahir
                    </Label>
                    <Input
                      id="tanggal_lahir"
                      name="tanggal_lahir"
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                {formData.tanggal_lahir && (
                  <div className="text-xs text-muted-foreground bg-secondary p-2 rounded">
                    Usia: {calculateAge(formData.tanggal_lahir)} tahun
                  </div>
                )}

                <div>
                  <Label htmlFor="no_induk" className="text-sm font-medium">
                    Nomor Induk
                  </Label>
                  <Input
                    id="no_induk"
                    name="no_induk"
                    type="text"
                    placeholder="001"
                    value={formData.no_induk}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="golongan" className="text-sm font-medium">
                    Golongan *
                  </Label>
                  <select
                    id="golongan"
                    name="golongan"
                    value={formData.golongan}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  >
                    <option value="">-- Pilih Golongan --</option>
                    <option value="Siaga">Siaga</option>
                    <option value="Penggalang">Penggalang</option>
                  </select>
                </div>

                {/* Conditional: Show Barung only for Siaga */}
                {formData.golongan === "Siaga" && (
                  <div>
                    <Label htmlFor="barung" className="text-sm font-medium">
                      Nama Barung
                    </Label>
                    <Input
                      id="barung"
                      name="barung"
                      type="text"
                      placeholder="Contoh: Merah"
                      value={formData.barung}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Conditional: Show Regu only for Penggalang */}
                {formData.golongan === "Penggalang" && (
                  <div>
                    <Label htmlFor="regu" className="text-sm font-medium">
                      Nama Regu
                    </Label>
                    <Input
                      id="regu"
                      name="regu"
                      type="text"
                      placeholder="Contoh: Garuda"
                      value={formData.regu}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="kelas" className="text-sm font-medium">
                    Kelas
                  </Label>
                  <Input
                    id="kelas"
                    name="kelas"
                    type="text"
                    placeholder="Contoh: Kelas 1"
                    value={formData.kelas}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="tahun_masuk" className="text-sm font-medium">
                    Tahun Masuk
                  </Label>
                  <Input
                    id="tahun_masuk"
                    name="tahun_masuk"
                    type="number"
                    value={formData.tahun_masuk}
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
                          nama_lengkap: "",
                          tempat_lahir: "",
                          tanggal_lahir: "",
                          golongan: "",
                          kelas: "",
                          tahun_masuk: new Date().getFullYear(),
                          no_induk: "",
                          alamat: "",
                          barung: "",
                          regu: "",
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
                  Cari Peserta
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="filter" className="text-sm font-medium">
                    Filter Golongan
                  </Label>
                  <select
                    id="filter"
                    value={filterGolongan}
                    onChange={(e) => setFilterGolongan(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  >
                    <option value="Semua">Semua Golongan</option>
                    <option value="Siaga">Siaga</option>
                    <option value="Penggalang">Penggalang</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="filterTahun" className="text-sm font-medium">
                    Filter Tahun
                  </Label>
                  <select
                    id="filterTahun"
                    value={filterTahun}
                    onChange={(e) => setFilterTahun(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  >
                    <option value="Semua">Semua Tahun</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredData.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center text-muted-foreground">
                  <p>Tidak ada data peserta</p>
                </div>
              ) : (
                filteredData.map((peserta) => {
                  const usia = peserta.tanggal_lahir ? calculateAge(peserta.tanggal_lahir) : null
                  return (
                    <div key={peserta.id} className="bg-card rounded-lg p-4 shadow hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-card-foreground">{peserta.nama_lengkap}</h3>
                          <p className="text-sm text-muted-foreground">
                            {peserta.golongan} {peserta.golongan === "Siaga" && peserta.barung ? `- Barung ${peserta.barung}` : ""}
                            {peserta.golongan === "Penggalang" && peserta.regu ? `- Regu ${peserta.regu}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(peserta)} className="text-xs">
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(peserta.id)}
                            className="text-xs text-destructive hover:bg-destructive/10"
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>No. Induk: {peserta.no_induk || "-"}</div>
                        <div>Kelas: {peserta.kelas || "-"}</div>
                        <div>TTL: {peserta.tempat_lahir || "-"}, {peserta.tanggal_lahir ? new Date(peserta.tanggal_lahir).toLocaleDateString('id-ID') : "-"}</div>
                        <div>Usia: {usia ? `${usia} tahun` : "-"}</div>
                        <div>Tahun Masuk: {peserta.tahun_masuk}</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
