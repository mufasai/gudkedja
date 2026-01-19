"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const GOLONGAN_OPTIONS = ["Siaga", "Penggalang", "Penegak", "Pandega"]

const KELAS_OPTIONS = ["1", "2", "3", "4", "5", "6"]

const KEHADIRAN_OPTIONS = ["Hadir", "Izin", "Sakit", "Alpa"]

export default function PresensiPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    golongan: "",
    kelas: "",
    kehadiran: "Hadir",
    catatan: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { error: submitError } = await supabase.from("presensi").insert([
        {
          ...formData,
          user_id: user.id,
        },
      ])

      if (submitError) throw submitError

      setSuccess(true)
      setFormData({
        nama_lengkap: "",
        golongan: "",
        kelas: "",
        kehadiran: "Hadir",
        catatan: "",
      })

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan presensi")
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
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Presensi Latihan</h1>
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
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="bg-card rounded-lg shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Lengkap */}
            <div>
              <Label htmlFor="nama_lengkap" className="font-medium">
                Nama Lengkap
              </Label>
              <Input
                id="nama_lengkap"
                name="nama_lengkap"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            {/* Golongan */}
            <div>
              <Label htmlFor="golongan" className="font-medium">
                Golongan
              </Label>
              <select
                id="golongan"
                name="golongan"
                value={formData.golongan}
                onChange={handleChange}
                required
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground"
              >
                <option value="">-- Pilih Golongan --</option>
                {GOLONGAN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Kelas */}
            <div>
              <Label htmlFor="kelas" className="font-medium">
                Kelas
              </Label>
              <Input
                id="kelas"
                name="kelas"
                type="text"
                placeholder="Contoh: Kelas 1"
                value={formData.kelas}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            {/* Kehadiran */}
            <div>
              <Label htmlFor="kehadiran" className="font-medium">
                Kehadiran
              </Label>
              <select
                id="kehadiran"
                name="kehadiran"
                value={formData.kehadiran}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground"
              >
                {KEHADIRAN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Catatan */}
            <div>
              <Label htmlFor="catatan" className="font-medium">
                Catatan (Opsional)
              </Label>
              <textarea
                id="catatan"
                name="catatan"
                placeholder="Alasan izin / keterangan..."
                value={formData.catatan}
                onChange={handleChange}
                rows={3}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-input text-foreground"
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded text-sm text-emerald-700">
                Presensi berhasil disimpan!
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Kirim Presensi"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
