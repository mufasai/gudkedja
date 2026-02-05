"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const MENU_ITEMS = [
  {
    id: 1,
    title: "Presensi Latihan",
    icon: "📋",
    color: "from-blue-400 to-blue-600",
    href: "/dashboard/presensi",
  },
  {
    id: 2,
    title: "Uji SKU",
    icon: "✅",
    color: "from-emerald-400 to-emerald-600",
    href: "/dashboard/uji-sku",
  },
  {
    id: 3,
    title: "Cetak Sertifikat SKK",
    icon: "🏆",
    color: "from-amber-400 to-amber-600",
    href: "/dashboard/cetak-skk",
  },
  {
    id: 4,
    title: "Data Pembina",
    icon: "👥",
    color: "from-purple-400 to-purple-600",
    href: "/dashboard/data-pembina",
  },
  {
    id: 5,
    title: "Data Peserta Didik",
    icon: "📚",
    color: "from-orange-400 to-orange-600",
    href: "/dashboard/data-peserta",
  },
  {
    id: 6,
    title: "Kegiatan Gudep",
    icon: "🎯",
    color: "from-pink-400 to-pink-600",
    href: "/dashboard/kegiatan",
  },
  {
    id: 7,
    title: "Kemitraan",
    icon: "🤝",
    color: "from-cyan-400 to-cyan-600",
    href: "/dashboard/kemitraan",
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/auth/login")
        return
      }

      // Get username from data_pembina table
      const { data: pembinaData } = await supabase
        .from("data_pembina")
        .select("username, nama_lengkap")
        .eq("email", data.user.email)
        .single()

      // Use username if available, otherwise use nama_lengkap, fallback to email
      if (pembinaData?.username) {
        setUsername(pembinaData.username)
      } else if (pembinaData?.nama_lengkap) {
        setUsername(pembinaData.nama_lengkap)
      } else {
        setUsername(data.user.email || "User")
      }

      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
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
      <div className="bg-primary text-primary-foreground py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">GUDKEDJA Portal</h1>
            <p className="text-sm text-primary-foreground/80">Gugus Depan SDN Kedondong Sokaraja</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2">Menu Utama GUDKEJA</h2>
          <p className="text-muted-foreground">Selamat datang, Pembina</p>
        </div>

        {/* Menu Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {MENU_ITEMS.map((item) => (
            <Link key={item.id} href={item.href}>
              <div className="h-full bg-card rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-200 p-6 cursor-pointer border border-border">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-card-foreground">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
