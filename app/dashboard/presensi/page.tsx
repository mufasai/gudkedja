"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface PesertaRecord {
  id: number
  nama_lengkap: string
  golongan: string
  kelas: string
  barung?: string
  regu?: string
}

interface PresensiRecord {
  id: number
  created_at: string
  tanggal_latihan: string
  nama_lengkap: string
  golongan: string
  kelas: string
  kehadiran: string
  catatan: string | null
}

export default function PresensiPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pesertaList, setPesertaList] = useState<PesertaRecord[]>([])
  const [presensiData, setPresensiData] = useState<Record<number, string>>({}) // peserta_id -> status
  const [tanggalLatihan, setTanggalLatihan] = useState(new Date().toISOString().split("T")[0])
  const [golonganFilter, setGolonganFilter] = useState<"Siaga" | "Penggalang">("Siaga")
  const [submitting, setSubmitting] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)
      await fetchPeserta()
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const fetchPeserta = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("data_peserta_didik")
      .select("*")
      .in("golongan", ["Siaga", "Penggalang"])
      .order("nama_lengkap", { ascending: true })

    if (data) {
      setPesertaList(data)
    }
  }

  const filteredPeserta = pesertaList.filter((p) => p.golongan === golonganFilter)

  const handleToggle = (pesertaId: number) => {
    setPresensiData((prev) => {
      const current = prev[pesertaId]
      if (current === "Hadir") {
        return { ...prev, [pesertaId]: "Tidak Hadir" }
      } else {
        return { ...prev, [pesertaId]: "Hadir" }
      }
    })
  }

  const handleSimpan = async () => {
    setSubmitting(true)
    const supabase = createClient()

    try {
      // Hapus presensi untuk tanggal dan golongan yang sama (jika ada kolom tanggal_latihan)
      // Jika kolom belum ada, skip delete
      try {
        await supabase
          .from("presensi")
          .delete()
          .eq("tanggal_latihan", tanggalLatihan)
          .eq("golongan", golonganFilter)
      } catch (deleteErr) {
        console.log("Delete skip (kolom mungkin belum ada):", deleteErr)
      }

      // Insert presensi baru
      const inserts = filteredPeserta.map((peserta) => {
        const status = presensiData[peserta.id] || "Tidak Hadir"
        // Convert "Tidak Hadir" ke "Alpa" untuk kompatibilitas dengan constraint CHECK
        const kehadiranValue = status === "Tidak Hadir" ? "Alpa" : status

        const baseData: any = {
          nama_lengkap: peserta.nama_lengkap,
          golongan: peserta.golongan,
          kelas: peserta.kelas,
          kehadiran: kehadiranValue,
          catatan: null,
          user_id: user.id, // Required field
        }

        // Tambahkan tanggal_latihan jika kolom ada
        try {
          baseData.tanggal_latihan = tanggalLatihan
        } catch (e) {
          console.log("Kolom tanggal_latihan belum ada")
        }

        return baseData
      })

      const { error, data: insertedData } = await supabase.from("presensi").insert(inserts)

      if (error) {
        console.error("Insert error detail:", error)
        throw new Error(error.message || "Gagal insert data")
      }

      alert("Presensi berhasil disimpan!")

      // Reload presensi data setelah simpan berhasil
      await handleLoadPresensi()
    } catch (err) {
      console.error("Full error:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      alert("Gagal menyimpan presensi: " + errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLoadPresensi = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("presensi")
      .select("*")
      .eq("tanggal_latihan", tanggalLatihan)
      .eq("golongan", golonganFilter)

    if (data && data.length > 0) {
      const presensiMap: Record<number, string> = {}
      data.forEach((item: any) => {
        const peserta = pesertaList.find((p) => p.nama_lengkap === item.nama_lengkap)
        if (peserta) {
          // Convert "Alpa" kembali ke "Tidak Hadir" untuk display
          const displayStatus = item.kehadiran === "Alpa" ? "Tidak Hadir" : item.kehadiran
          presensiMap[peserta.id] = displayStatus
        }
      })
      setPresensiData(presensiMap)
    } else {
      setPresensiData({})
    }
  }

  useEffect(() => {
    if (pesertaList.length > 0) {
      handleLoadPresensi()
    }
  }, [tanggalLatihan, golonganFilter, pesertaList])

  const hadirCount = Object.values(presensiData).filter((s) => s === "Hadir").length
  const tidakHadirCount = filteredPeserta.length - hadirCount

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
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Presensi Latihan</h1>
            <p className="text-sm text-primary-foreground/80">SDN Kedondong Sokaraja</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              {showHistory ? "Input Presensi" : "Riwayat"}
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Kembali
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {showHistory ? (
          <RiwayatPresensi pesertaList={pesertaList} />
        ) : (
          <>
            {/* Controls */}
            <div className="bg-card rounded-lg shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tanggal">Tanggal Latihan</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={tanggalLatihan}
                    onChange={(e) => setTanggalLatihan(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="golongan">Golongan</Label>
                  <select
                    id="golongan"
                    value={golonganFilter}
                    onChange={(e) => setGolonganFilter(e.target.value as "Siaga" | "Penggalang")}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground"
                  >
                    <option value="Siaga">Siaga</option>
                    <option value="Penggalang">Penggalang</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <div className="text-2xl font-bold">{filteredPeserta.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-emerald-600">{hadirCount}</div>
                  <div className="text-xs text-muted-foreground">Hadir</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{tidakHadirCount}</div>
                  <div className="text-xs text-muted-foreground">Tidak Hadir</div>
                </div>
              </div>
            </div>

            {/* Presensi List */}
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="font-bold mb-4">Daftar Peserta {golonganFilter}</h2>

              {filteredPeserta.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Tidak ada peserta {golonganFilter}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredPeserta.map((peserta) => {
                    const status = presensiData[peserta.id] || "Tidak Hadir"
                    const isHadir = status === "Hadir"

                    return (
                      <button
                        key={peserta.id}
                        onClick={() => handleToggle(peserta.id)}
                        className={`w-full p-4 rounded-lg border-2 transition text-left ${isHadir
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-red-300 bg-red-50"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isHadir ? "bg-emerald-500" : "bg-red-500"
                                }`}
                            >
                              {isHadir ? "✓" : "✗"}
                            </div>
                            <div>
                              <div className="font-medium">{peserta.nama_lengkap}</div>
                              <div className="text-sm text-muted-foreground">
                                Kelas {peserta.kelas}
                                {peserta.barung && ` • Barung ${peserta.barung}`}
                                {peserta.regu && ` • Regu ${peserta.regu}`}
                              </div>
                            </div>
                          </div>
                          <div className={`font-bold ${isHadir ? "text-emerald-600" : "text-red-600"}`}>
                            {status}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              <Button
                onClick={handleSimpan}
                className="w-full mt-6"
                disabled={submitting || filteredPeserta.length === 0}
              >
                {submitting ? "Menyimpan..." : "Simpan Presensi"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


// Component: Riwayat Presensi
function RiwayatPresensi({ pesertaList }: { pesertaList: PesertaRecord[] }) {
  const [riwayat, setRiwayat] = useState<PresensiRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [golonganFilter, setGolonganFilter] = useState<"Semua" | "Siaga" | "Penggalang">("Semua")
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 1)
    return date.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    fetchRiwayat()
  }, [golonganFilter, startDate, endDate])

  const fetchRiwayat = async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from("presensi")
      .select("*")
      .gte("tanggal_latihan", startDate)
      .lte("tanggal_latihan", endDate)
      .order("tanggal_latihan", { ascending: false })

    if (golonganFilter !== "Semua") {
      query = query.eq("golongan", golonganFilter)
    }

    const { data } = await query

    if (data) {
      setRiwayat(data)
    }
    setLoading(false)
  }

  const handleDownloadCSV = () => {
    if (riwayat.length === 0) {
      alert("Tidak ada data untuk diunduh")
      return
    }

    // Generate CSV
    const headers = ["Tanggal", "Nama", "Golongan", "Kelas", "Kehadiran", "Catatan"]
    const rows = riwayat.map((r) => [
      r.tanggal_latihan,
      r.nama_lengkap,
      r.golongan,
      r.kelas,
      r.kehadiran,
      r.catatan || "",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `presensi_${startDate}_${endDate}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Group by tanggal
  const groupedByDate = riwayat.reduce((acc, item) => {
    const date = item.tanggal_latihan
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, PresensiRecord[]>)

  const dates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h2 className="font-bold mb-4">Filter Riwayat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Dari Tanggal</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Sampai Tanggal</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Golongan</Label>
            <select
              value={golonganFilter}
              onChange={(e) => setGolonganFilter(e.target.value as any)}
              className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground"
            >
              <option value="Semua">Semua</option>
              <option value="Siaga">Siaga</option>
              <option value="Penggalang">Penggalang</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={fetchRiwayat} variant="outline" className="flex-1">
            Refresh
          </Button>
          <Button onClick={handleDownloadCSV} className="flex-1">
            📥 Download CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h3 className="font-bold mb-4">Statistik</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-secondary rounded-lg text-center">
            <div className="text-2xl font-bold">{dates.length}</div>
            <div className="text-xs text-muted-foreground">Pertemuan</div>
          </div>
          <div className="p-3 bg-secondary rounded-lg text-center">
            <div className="text-2xl font-bold">{riwayat.length}</div>
            <div className="text-xs text-muted-foreground">Total Record</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {riwayat.filter((r) => r.kehadiran === "Hadir").length}
            </div>
            <div className="text-xs text-muted-foreground">Hadir</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {riwayat.filter((r) => r.kehadiran !== "Hadir").length}
            </div>
            <div className="text-xs text-muted-foreground">Tidak Hadir</div>
          </div>
        </div>
      </div>

      {/* Data by Date */}
      {loading ? (
        <div className="bg-card rounded-lg shadow-lg p-6 text-center">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      ) : dates.length === 0 ? (
        <div className="bg-card rounded-lg shadow-lg p-6 text-center">
          <p className="text-muted-foreground">Tidak ada data presensi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => {
            const items = groupedByDate[date]
            const hadirCount = items.filter((i) => i.kehadiran === "Hadir").length
            const totalCount = items.length

            return (
              <div key={date} className="bg-card rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold">
                      {new Date(date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {hadirCount}/{totalCount} hadir
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{hadirCount}</div>
                    <div className="text-xs text-muted-foreground">Hadir</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border ${item.kehadiran === "Hadir"
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{item.nama_lengkap}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.golongan} • Kelas {item.kelas}
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${item.kehadiran === "Hadir"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {item.kehadiran}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
