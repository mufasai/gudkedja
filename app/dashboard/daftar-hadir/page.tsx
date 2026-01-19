"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface PresensiRecord {
  id: number
  created_at: string
  nama_lengkap: string
  golongan: string
  kelas: string
  kehadiran: string
  catatan: string | null
}

export default function DaftarHadirPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [presensiData, setPresensiData] = useState<PresensiRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("Semua")
  const [searchNama, setSearchNama] = useState("")

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)

      // Fetch presensi data
      const { data: presensiRecords, error: fetchError } = await supabase
        .from("presensi")
        .select("*")
        .order("created_at", { ascending: false })

      if (!fetchError && presensiRecords) {
        setPresensiData(presensiRecords)
      }
      setLoading(false)
    }
    checkAuthAndFetch()
  }, [router])

  const filteredData = presensiData.filter((record) => {
    const matchStatus = filterStatus === "Semua" || record.kehadiran === filterStatus
    const matchNama = record.nama_lengkap.toLowerCase().includes(searchNama.toLowerCase())
    return matchStatus && matchNama
  })

  const stats = {
    total: presensiData.length,
    hadir: presensiData.filter((r) => r.kehadiran === "Hadir").length,
    izin: presensiData.filter((r) => r.kehadiran === "Izin").length,
    sakit: presensiData.filter((r) => r.kehadiran === "Sakit").length,
    alpa: presensiData.filter((r) => r.kehadiran === "Alpa").length,
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
            <h1 className="text-2xl font-bold">Daftar Hadir</h1>
            <p className="text-sm text-primary-foreground/80">SDN Kedondong Sokaraja</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
          </div>
          <div className="bg-card rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.hadir}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Hadir</div>
          </div>
          <div className="bg-card rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.izin}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Izin</div>
          </div>
          <div className="bg-card rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.sakit}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Sakit</div>
          </div>
          <div className="bg-card rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.alpa}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Alpa</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="text-sm font-medium">
                Cari Nama
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

            {/* Status Filter */}
            <div>
              <Label htmlFor="status" className="text-sm font-medium">
                Filter Status
              </Label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground"
              >
                <option value="Semua">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpa">Alpa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Tidak ada data presensi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Nama</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Golongan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Kelas</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Tanggal</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((record) => (
                    <tr key={record.id} className="border-b border-border hover:bg-secondary transition">
                      <td className="px-4 py-3 text-sm font-medium text-card-foreground">{record.nama_lengkap}</td>
                      <td className="px-4 py-3 text-sm">{record.golongan}</td>
                      <td className="px-4 py-3 text-sm">{record.kelas}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${record.kehadiran === "Hadir"
                            ? "bg-emerald-100 text-emerald-700"
                            : record.kehadiran === "Izin"
                              ? "bg-blue-100 text-blue-700"
                              : record.kehadiran === "Sakit"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                          {record.kehadiran}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                        {record.catatan || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
