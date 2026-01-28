"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { SKU_CONFIG, type JenisSKU, TKK_SIAGA_WAJIB, TKK_SIAGA_PILIHAN, type TKKItem, type SyaratSKU, getSyaratText, hasSyaratSubItems } from "@/lib/sku-data"
import { formatTanggal, getNamaHari, extractKodeGudep, generateSuratHTML } from "@/lib/surat-template"

interface PesertaRecord {
  id: number
  nama_lengkap: string
  golongan: string
  kelas: string
  barung?: string
  regu?: string
}

type MenuType = "sku" | "tkk"

export default function UjiSKUPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pesertaList, setPesertaList] = useState<PesertaRecord[]>([])
  const [searchNama, setSearchNama] = useState("")
  const [selectedPeserta, setSelectedPeserta] = useState<PesertaRecord | null>(null)
  const [step, setStep] = useState<"search" | "menu" | "sku" | "tkk">("search")
  const [selectedSKU, setSelectedSKU] = useState<JenisSKU | null>(null)

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)

      // Fetch peserta data
      const { data: peserta } = await supabase
        .from("data_peserta_didik")
        .select("*")
        .order("nama_lengkap", { ascending: true })

      if (peserta) {
        setPesertaList(peserta)
      }
      setLoading(false)
    }
    checkAuthAndFetch()
  }, [router])

  const filteredPeserta = pesertaList.filter((p) =>
    p.nama_lengkap.toLowerCase().includes(searchNama.toLowerCase())
  )

  const handleSelectPeserta = (peserta: PesertaRecord) => {
    setSelectedPeserta(peserta)
    setStep("menu")
  }

  const handleSelectSKU = (jenis: JenisSKU) => {
    setSelectedSKU(jenis)
    setStep("sku")
  }

  const handleBack = () => {
    if (step === "sku" || step === "tkk") {
      setStep("menu")
      setSelectedSKU(null)
    } else if (step === "menu") {
      setStep("search")
      setSelectedPeserta(null)
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
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-4 sm:py-6 sm:px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Uji SKU & SKK</h1>
            <p className="text-sm text-primary-foreground/80">Pencatatan Uji Kecakapan Pramuka</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Kembali
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {step === "search" && (
          <SearchPeserta
            searchNama={searchNama}
            setSearchNama={setSearchNama}
            filteredPeserta={filteredPeserta}
            onSelect={handleSelectPeserta}
          />
        )}

        {step === "menu" && selectedPeserta && (
          <MenuSKU
            peserta={selectedPeserta}
            onSelectSKU={handleSelectSKU}
            onSelectTKK={() => setStep("tkk")}
            onBack={handleBack}
          />
        )}

        {step === "sku" && selectedPeserta && selectedSKU && (
          <SKUChecklist
            peserta={selectedPeserta}
            jenisSKU={selectedSKU}
            onBack={handleBack}
          />
        )}

        {step === "tkk" && selectedPeserta && (
          <TKKChecklist
            peserta={selectedPeserta}
            onBack={handleBack}
          />
        )}
      </div>

      {/* Floating Guide Button */}
      <GuideButtons />
    </div>
  )
}


// Component: Search Peserta
function SearchPeserta({
  searchNama,
  setSearchNama,
  filteredPeserta,
  onSelect,
}: {
  searchNama: string
  setSearchNama: (v: string) => void
  filteredPeserta: PesertaRecord[]
  onSelect: (p: PesertaRecord) => void
}) {
  return (
    <div className="bg-card rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-bold mb-4">Cari Nama Siswa</h2>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Ketik nama siswa..."
          value={searchNama}
          onChange={(e) => setSearchNama(e.target.value)}
          className="w-full"
        />
      </div>

      {searchNama && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredPeserta.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Tidak ada peserta ditemukan</p>
          ) : (
            filteredPeserta.map((peserta) => (
              <div
                key={peserta.id}
                onClick={() => onSelect(peserta)}
                className="p-4 border border-border rounded-lg hover:bg-secondary cursor-pointer transition"
              >
                <div className="font-medium">{peserta.nama_lengkap}</div>
                <div className="text-sm text-muted-foreground">
                  {peserta.golongan} • Kelas {peserta.kelas}
                  {peserta.barung && ` • Barung ${peserta.barung}`}
                  {peserta.regu && ` • Regu ${peserta.regu}`}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!searchNama && (
        <p className="text-muted-foreground text-center py-8">
          Ketik nama siswa untuk mencari
        </p>
      )}
    </div>
  )
}

// Component: Menu SKU
function MenuSKU({
  peserta,
  onSelectSKU,
  onSelectTKK,
  onBack,
}: {
  peserta: PesertaRecord
  onSelectSKU: (jenis: JenisSKU) => void
  onSelectTKK: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-6">
      {/* Info Peserta */}
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold">Data Peserta</h2>
          <Button variant="outline" size="sm" onClick={onBack}>
            Ganti Peserta
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Nama:</span>
            <p className="font-medium">{peserta.nama_lengkap}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Golongan:</span>
            <p className="font-medium">{peserta.golongan}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Kelas:</span>
            <p className="font-medium">{peserta.kelas}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Barung/Regu:</span>
            <p className="font-medium">{peserta.barung || peserta.regu || "-"}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Gugus Depan:</span>
            <p className="font-medium">SD Kedondong Sokaraja</p>
          </div>
        </div>
      </div>

      {/* Menu SKU */}
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">Pilih Jenis SKU</h2>
        <div className="space-y-3">
          {peserta.golongan === "Siaga" && (
            <>
              <SKUMenuButton
                label="SKU SIAGA MULA"
                sublabel="34 Syarat"
                onClick={() => onSelectSKU("siaga_mula")}
              />
              <SKUMenuButton
                label="SKU SIAGA BANTU"
                sublabel="33 Syarat"
                onClick={() => onSelectSKU("siaga_bantu")}
              />
              <SKUMenuButton
                label="SKU SIAGA TATA"
                sublabel="33 Syarat"
                onClick={() => onSelectSKU("siaga_tata")}
              />
            </>
          )}
          {peserta.golongan === "Penggalang" && (
            <SKUMenuButton
              label="SKU PENGGALANG RAMU"
              sublabel="30 Syarat"
              onClick={() => onSelectSKU("penggalang_ramu")}
            />
          )}
          {peserta.golongan !== "Siaga" && peserta.golongan !== "Penggalang" && (
            <p className="text-muted-foreground text-center py-4">
              SKU untuk golongan {peserta.golongan} belum tersedia
            </p>
          )}
        </div>
      </div>

      {/* Menu TKK - Hanya untuk Siaga */}
      {peserta.golongan === "Siaga" && (
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4">SKK / TKK</h2>
          <div className="space-y-3">
            <SKUMenuButton
              label="SKK / TKK SIAGA"
              sublabel="10 Wajib + 20 Pilihan"
              onClick={onSelectTKK}
              color="amber"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function SKUMenuButton({ label, sublabel, onClick, color = "primary" }: { label: string; sublabel: string; onClick: () => void; color?: "primary" | "amber" }) {
  const colorClasses = color === "amber"
    ? "border-amber-500 hover:bg-amber-500 hover:text-white"
    : "border-primary hover:bg-primary hover:text-primary-foreground"

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 border-2 rounded-lg transition text-left ${colorClasses}`}
    >
      <div className="font-bold">{label}</div>
      <div className="text-sm opacity-80">{sublabel}</div>
    </button>
  )
}


// Component: SKU Checklist
function SKUChecklist({
  peserta,
  jenisSKU,
  onBack,
}: {
  peserta: PesertaRecord
  jenisSKU: JenisSKU
  onBack: () => void
}) {
  const config = SKU_CONFIG[jenisSKU]
  const [progress, setProgress] = useState<Record<number, { status: string; tanggal: string; pembina: string; agama_dipilih?: string }>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuratModal, setShowSuratModal] = useState(false)

  useEffect(() => {
    const fetchProgress = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("sku_progress")
        .select("*")
        .eq("peserta_id", peserta.id)
        .eq("jenis_sku", jenisSKU)

      if (data) {
        const progressMap: Record<number, { status: string; tanggal: string; pembina: string; agama_dipilih?: string }> = {}
        data.forEach((item: any) => {
          progressMap[item.syarat_nomor] = {
            status: item.status,
            tanggal: item.tanggal_uji || "",
            pembina: item.pembina_penguji || "",
            agama_dipilih: item.agama_dipilih || "",
          }
        })
        setProgress(progressMap)
      }
      setLoading(false)
    }
    fetchProgress()
  }, [peserta.id, jenisSKU])

  const lulusCount = Object.values(progress).filter((p) => p.status === "lulus").length
  const isAllLulus = lulusCount === config.jumlah_syarat && lulusCount > 0

  const handleToggle = (nomor: number) => {
    setProgress((prev) => {
      const current = prev[nomor]
      if (current?.status === "lulus") {
        return {
          ...prev,
          [nomor]: { status: "belum", tanggal: "", pembina: "", agama_dipilih: "" },
        }
      } else {
        return {
          ...prev,
          [nomor]: {
            status: "lulus",
            tanggal: new Date().toISOString().split("T")[0],
            pembina: current?.pembina || "",
            agama_dipilih: current?.agama_dipilih || "",
          },
        }
      }
    })
  }

  const handleDetailChange = (nomor: number, field: "tanggal" | "pembina" | "agama_dipilih", value: string) => {
    setProgress((prev) => ({
      ...prev,
      [nomor]: {
        ...prev[nomor],
        status: prev[nomor]?.status || "belum",
        tanggal: prev[nomor]?.tanggal || "",
        pembina: prev[nomor]?.pembina || "",
        agama_dipilih: prev[nomor]?.agama_dipilih || "",
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      // Gunakan upsert untuk setiap item secara individual
      const updates = Object.entries(progress).map(([nomor, data]) => ({
        peserta_id: peserta.id,
        jenis_sku: jenisSKU,
        syarat_nomor: parseInt(nomor),
        status: data.status,
        tanggal_uji: data.tanggal || null,
        pembina_penguji: data.pembina || null,
        agama_dipilih: data.agama_dipilih || null,
      }))

      // Upsert satu per satu untuk menghindari konflik
      for (const update of updates) {
        const { error } = await supabase
          .from("sku_progress")
          .upsert(update, {
            onConflict: 'peserta_id,jenis_sku,syarat_nomor'
          })

        if (error) {
          console.error("Error upserting item:", error, update)
          throw error
        }
      }

      alert("Progress berhasil disimpan!")

      // Refresh data setelah save
      const { data: refreshData, error: fetchError } = await supabase
        .from("sku_progress")
        .select("*")
        .eq("peserta_id", peserta.id)
        .eq("jenis_sku", jenisSKU)

      if (fetchError) {
        console.error("Error fetching refresh data:", fetchError)
      } else if (refreshData) {
        const progressMap: Record<number, { status: string; tanggal: string; pembina: string; agama_dipilih?: string }> = {}
        refreshData.forEach((item: any) => {
          progressMap[item.syarat_nomor] = {
            status: item.status,
            tanggal: item.tanggal_uji || "",
            pembina: item.pembina_penguji || "",
            agama_dipilih: item.agama_dipilih || "",
          }
        })
        setProgress(progressMap)
      }
    } catch (error: any) {
      console.error("Error saving progress:", error)
      alert(`Gagal menyimpan progress: ${error.message || 'Silakan coba lagi'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-6 text-center">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">{config.nama}</h2>
            <p className="text-sm text-muted-foreground">{peserta.nama_lengkap}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onBack}>
            Kembali
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span className={isAllLulus ? "text-emerald-600 font-bold" : ""}>
              {lulusCount} / {config.jumlah_syarat}
              {isAllLulus && " ✓"}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${isAllLulus ? "bg-emerald-500" : "bg-primary"}`}
              style={{ width: `${(lulusCount / config.jumlah_syarat) * 100}%` }}
            />
          </div>
          {!isAllLulus && lulusCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Masih ada {config.jumlah_syarat - lulusCount} syarat yang belum lulus
            </p>
          )}
        </div>

        {isAllLulus && (
          <div className="p-4 bg-emerald-100 border-2 border-emerald-300 rounded-lg text-emerald-700 text-center mb-4">
            <p className="font-bold text-lg mb-2">🎉 STATUS: LULUS</p>
            <p className="text-sm mb-3">Semua syarat telah terpenuhi!</p>
            <Button
              onClick={() => setShowSuratModal(true)}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
            >
              📄 Terbitkan Surat Lulus
            </Button>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="space-y-3">
          {config.syarat.map((syarat, index) => {
            const nomor = index + 1
            const item = progress[nomor]
            const isLulus = item?.status === "lulus"
            const syaratText = getSyaratText(syarat)
            const hasSubItems = hasSyaratSubItems(syarat)

            return (
              <div key={nomor} className={`p-3 border rounded-lg ${isLulus ? "border-emerald-300 bg-emerald-50" : "border-border"}`}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(nomor)}
                    className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${isLulus ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300"
                      }`}
                  >
                    {isLulus && "✓"}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isLulus ? "line-through text-muted-foreground" : ""}`}>
                      {nomor}. {syaratText}
                    </p>

                    {/* Sub-items untuk syarat keagamaan */}
                    {hasSubItems && syarat.subItems && (
                      <div className="mt-3 space-y-3 pl-4 border-l-2 border-amber-300">
                        {syarat.subItems.map((subItem, subIndex) => (
                          <div key={subIndex} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                {subItem.label}
                              </span>
                            </div>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {subItem.items.map((subItemText, itemIndex) => (
                                <li key={itemIndex} className="flex gap-2">
                                  <span className="text-amber-600">•</span>
                                  <span>{subItemText}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {isLulus && (
                      <div className="mt-2 space-y-2">
                        {/* Dropdown Agama - hanya untuk syarat dengan sub-items (keagamaan) */}
                        {hasSubItems && syarat.subItems && (
                          <div>
                            <Label className="text-xs">Agama yang Diuji</Label>
                            <Select
                              value={item?.agama_dipilih || ""}
                              onValueChange={(value) => handleDetailChange(nomor, "agama_dipilih", value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Pilih agama..." />
                              </SelectTrigger>
                              <SelectContent>
                                {syarat.subItems.map((subItem) => (
                                  <SelectItem key={subItem.label} value={subItem.label}>
                                    {subItem.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Tanggal Uji</Label>
                            <Input
                              type="date"
                              value={item?.tanggal || ""}
                              onChange={(e) => handleDetailChange(nomor, "tanggal", e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Pembina Penguji</Label>
                            <Input
                              type="text"
                              placeholder="Nama pembina"
                              value={item?.pembina || ""}
                              onChange={(e) => handleDetailChange(nomor, "pembina", e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Button onClick={handleSave} className="w-full mt-6" disabled={saving}>
          {saving ? "Menyimpan..." : "💾 Simpan Progress"}
        </Button>

        {lulusCount === config.jumlah_syarat && !isAllLulus && (
          <div className="mt-3 p-3 bg-amber-100 border border-amber-300 rounded-lg text-amber-700 text-center text-sm">
            ⚠️ Klik "Simpan Progress" untuk menyimpan data dan mengaktifkan tombol cetak surat
          </div>
        )}
      </div>

      {/* Modal Surat Lulus */}
      {showSuratModal && (
        <SuratLulusModal
          peserta={peserta}
          jenisSKU={jenisSKU}
          onClose={() => setShowSuratModal(false)}
        />
      )}
    </div>
  )
}


// Component: Surat Lulus Modal
function SuratLulusModal({
  peserta,
  jenisSKU,
  onClose,
}: {
  peserta: PesertaRecord
  jenisSKU: JenisSKU
  onClose: () => void
}) {
  const config = SKU_CONFIG[jenisSKU]
  const [nomorSurat, setNomorSurat] = useState("021/11.02.06.0365/XII/2023")
  const [tempatLahir, setTempatLahir] = useState("")
  const [tanggalLahir, setTanggalLahir] = useState("")
  const [tanggalPelantikan, setTanggalPelantikan] = useState("")
  const [tempatTerbit, setTempatTerbit] = useState("Kedondong")
  const [tanggalTerbit, setTanggalTerbit] = useState(new Date().toISOString().split("T")[0])
  const [namaPembina, setNamaPembina] = useState("Ridar Pamungkas,S.Pd.SD")
  const [nipPembina, setNipPembina] = useState("19820603692474")
  const [saving, setSaving] = useState(false)

  // Fetch data peserta untuk TTL
  useEffect(() => {
    const fetchPesertaDetail = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("data_peserta_didik")
        .select("tempat_lahir, tanggal_lahir")
        .eq("id", peserta.id)
        .single()

      if (data) {
        setTempatLahir(data.tempat_lahir || "")
        setTanggalLahir(data.tanggal_lahir || "")
      }
    }
    fetchPesertaDetail()
  }, [peserta.id])

  const handleCetakPDF = async () => {
    setSaving(true)

    try {
      // Save to database
      const supabase = createClient()
      const { error: saveError } = await supabase.from("surat_lulus_sku").upsert({
        peserta_id: peserta.id,
        jenis_sku: jenisSKU,
        nomor_surat: nomorSurat || null,
        tempat_lahir: tempatLahir || null,
        tanggal_lahir: tanggalLahir || null,
        tanggal_pelantikan: tanggalPelantikan || null,
        tempat_terbit: tempatTerbit || null,
        tanggal_terbit: tanggalTerbit || null,
        nama_pembina: namaPembina || null,
        nip_pembina: nipPembina || null,
      }, {
        onConflict: 'peserta_id,jenis_sku'
      })

      if (saveError) {
        alert("Gagal menyimpan data. Silakan coba lagi.")
        setSaving(false)
        return
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan data.")
      setSaving(false)
      return
    }

    // Generate HTML menggunakan template
    const printContent = generateSuratHTML({
      kodeGudep: extractKodeGudep(nomorSurat),
      nomorSurat,
      namaPeserta: peserta.nama_lengkap,
      tempatLahir,
      tanggalLahir,
      golongan: peserta.golongan,
      tingkatSKU: config.nama.split(' ').pop() || config.nama,
      namaHariPelantikan: getNamaHari(tanggalPelantikan),
      tanggalPelantikan,
      tempatTerbit,
      tanggalTerbit,
      namaPembina,
      nipPembina,
    })

    // Open print window
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    } else {
      alert("Pop-up diblokir. Silakan izinkan pop-up untuk aplikasi ini.")
    }

    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md my-8">
        <h2 className="text-lg font-bold mb-4">Terbitkan Surat Keterangan Lulus</h2>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <Label className="text-sm">Nomor Surat</Label>
            <Input
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-sm">Nama</Label>
            <Input value={peserta.nama_lengkap} disabled className="bg-secondary text-sm" />
          </div>
          <div>
            <Label className="text-sm">Tempat Lahir</Label>
            <Input
              value={tempatLahir}
              onChange={(e) => setTempatLahir(e.target.value)}
              placeholder="Contoh: Banyumas"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-sm">Tanggal Lahir</Label>
            <Input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-sm">Golongan</Label>
            <Input value={peserta.golongan} disabled className="bg-secondary text-sm" />
          </div>
          <div>
            <Label className="text-sm">Tingkat SKU</Label>
            <Input value={config.nama} disabled className="bg-secondary text-sm" />
          </div>
          <div>
            <Label className="text-sm">Tanggal Pelantikan</Label>
            <Input
              type="date"
              value={tanggalPelantikan}
              onChange={(e) => setTanggalPelantikan(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="border-t pt-3 mt-3">
            <Label className="text-sm font-bold">Data Penerbitan</Label>
          </div>
          <div>
            <Label className="text-sm">Tempat Terbit</Label>
            <Input
              value={tempatTerbit}
              onChange={(e) => setTempatTerbit(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-sm">Tanggal Terbit</Label>
            <Input
              type="date"
              value={tanggalTerbit}
              onChange={(e) => setTanggalTerbit(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-sm">Nama Ketua Gudep</Label>
            <Input
              value={namaPembina}
              onChange={(e) => setNamaPembina(e.target.value)}
              placeholder="Nama pembina yang menandatangani"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-sm">NTa</Label>
            <Input
              value={nipPembina}
              onChange={(e) => setNipPembina(e.target.value)}
              placeholder="NIP pembina"
              className="text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button onClick={handleCetakPDF} className="flex-1" disabled={saving}>
            {saving ? "Memproses..." : "📄 Cetak PDF"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Component: Guide Buttons (pojok kiri bawah)
function GuideButtons() {
  const GUIDE_LINKS = {
    siaga: "https://drive.google.com/drive/folders/1AdRo-5GhgpsOwNlXiVlXF0-zll_bmUgx?usp=drive_link",
    penggalang: "https://drive.google.com/drive/folders/1AdRo-5GhgpsOwNlXiVlXF0-zll_bmUgx?usp=drive_link",
  }

  return (
    <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-40">
      <a
        href={GUIDE_LINKS.siaga}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full shadow-lg transition"
      >
        <span>📖</span>
        <span className="text-sm font-medium">Buku SKU Siaga</span>
      </a>
      <a
        href={GUIDE_LINKS.penggalang}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg transition"
      >
        <span>📖</span>
        <span className="text-sm font-medium">Buku SKU Penggalang</span>
      </a>
    </div>
  )
}

// Component: TKK Checklist
function TKKChecklist({
  peserta,
  onBack,
}: {
  peserta: PesertaRecord
  onBack: () => void
}) {
  const [progress, setProgress] = useState<Record<string, { status: string; tanggal: string; pembina: string }>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPiagamModal, setShowPiagamModal] = useState<TKKItem | null>(null)

  useEffect(() => {
    const fetchProgress = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("tkk_progress")
        .select("*")
        .eq("peserta_id", peserta.id)

      if (data) {
        const progressMap: Record<string, { status: string; tanggal: string; pembina: string }> = {}
        data.forEach((item: any) => {
          progressMap[item.tkk_id] = {
            status: item.status,
            tanggal: item.tanggal_uji || "",
            pembina: item.pembina_penguji || "",
          }
        })
        setProgress(progressMap)
      }
      setLoading(false)
    }
    fetchProgress()
  }, [peserta.id])

  const handleToggle = (tkkId: string) => {
    setProgress((prev) => {
      const current = prev[tkkId]
      if (current?.status === "lulus") {
        return {
          ...prev,
          [tkkId]: { status: "belum", tanggal: "", pembina: "" },
        }
      } else {
        return {
          ...prev,
          [tkkId]: {
            status: "lulus",
            tanggal: new Date().toISOString().split("T")[0],
            pembina: current?.pembina || "",
          },
        }
      }
    })
  }

  const handleDetailChange = (tkkId: string, field: "tanggal" | "pembina", value: string) => {
    setProgress((prev) => ({
      ...prev,
      [tkkId]: {
        ...prev[tkkId],
        status: prev[tkkId]?.status || "belum",
        tanggal: prev[tkkId]?.tanggal || "",
        pembina: prev[tkkId]?.pembina || "",
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      // Gunakan upsert untuk setiap item
      const updates = Object.entries(progress).map(([tkkId, data]) => {
        const isWajib = TKK_SIAGA_WAJIB.some(t => t.id === tkkId)
        return {
          peserta_id: peserta.id,
          tkk_id: tkkId,
          jenis: isWajib ? "wajib" : "pilihan",
          status: data.status,
          tanggal_uji: data.tanggal || null,
          pembina_penguji: data.pembina || null,
        }
      })

      // Upsert satu per satu
      for (const update of updates) {
        const { error } = await supabase
          .from("tkk_progress")
          .upsert(update, {
            onConflict: 'peserta_id,tkk_id'
          })

        if (error) {
          console.error("Error upserting TKK item:", error, update)
          throw error
        }
      }

      alert("Progress TKK berhasil disimpan!")

      // Refresh data setelah save
      const { data: refreshData, error: fetchError } = await supabase
        .from("tkk_progress")
        .select("*")
        .eq("peserta_id", peserta.id)

      if (fetchError) {
        console.error("Error fetching refresh data:", fetchError)
      } else if (refreshData) {
        const progressMap: Record<string, { status: string; tanggal: string; pembina: string }> = {}
        refreshData.forEach((item: any) => {
          progressMap[item.tkk_id] = {
            status: item.status,
            tanggal: item.tanggal_uji || "",
            pembina: item.pembina_penguji || "",
          }
        })
        setProgress(progressMap)
      }
    } catch (error: any) {
      console.error("Error saving TKK progress:", error)
      alert(`Gagal menyimpan progress TKK: ${error.message || 'Silakan coba lagi'} `)
    } finally {
      setSaving(false)
    }
  }

  const wajibLulus = TKK_SIAGA_WAJIB.filter(t => progress[t.id]?.status === "lulus").length
  const pilihanLulus = TKK_SIAGA_PILIHAN.filter(t => progress[t.id]?.status === "lulus").length

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-6 text-center">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">SKK / TKK Siaga</h2>
            <p className="text-sm text-muted-foreground">{peserta.nama_lengkap}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onBack}>
            Kembali
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-600">{wajibLulus}/10</div>
            <div className="text-xs text-muted-foreground">TKK Wajib</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-600">{pilihanLulus}/20</div>
            <div className="text-xs text-muted-foreground">TKK Pilihan</div>
          </div>
        </div>
      </div>

      {/* TKK Wajib */}
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">WAJIB</span>
          TKK Wajib (10)
        </h3>
        <div className="space-y-3">
          {TKK_SIAGA_WAJIB.map((tkk) => (
            <TKKItem
              key={tkk.id}
              tkk={tkk}
              progress={progress[tkk.id]}
              onToggle={() => handleToggle(tkk.id)}
              onDetailChange={(field, value) => handleDetailChange(tkk.id, field, value)}
              onCetakPiagam={() => setShowPiagamModal(tkk)}
            />
          ))}
        </div>
      </div>

      {/* TKK Pilihan */}
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">PILIHAN</span>
          TKK Pilihan (20)
        </h3>
        <div className="space-y-3">
          {TKK_SIAGA_PILIHAN.map((tkk) => (
            <TKKItem
              key={tkk.id}
              tkk={tkk}
              progress={progress[tkk.id]}
              onToggle={() => handleToggle(tkk.id)}
              onDetailChange={(field, value) => handleDetailChange(tkk.id, field, value)}
              onCetakPiagam={() => setShowPiagamModal(tkk)}
            />
          ))}
        </div>
      </div>

      <Button onClick={handleSave} className="w-full" disabled={saving}>
        {saving ? "Menyimpan..." : "Simpan Progress TKK"}
      </Button>

      {/* Modal Piagam TKK */}
      {showPiagamModal && (
        <PiagamTKKModal
          peserta={peserta}
          tkk={showPiagamModal}
          tanggalUji={progress[showPiagamModal.id]?.tanggal || ""}
          onClose={() => setShowPiagamModal(null)}
        />
      )}
    </div>
  )
}

// Component: TKK Item
function TKKItem({
  tkk,
  progress,
  onToggle,
  onDetailChange,
  onCetakPiagam,
}: {
  tkk: TKKItem
  progress?: { status: string; tanggal: string; pembina: string }
  onToggle: () => void
  onDetailChange: (field: "tanggal" | "pembina", value: string) => void
  onCetakPiagam: () => void
}) {
  const isLulus = progress?.status === "lulus"

  return (
    <div className={`p - 3 border rounded - lg ${isLulus ? "border-emerald-300 bg-emerald-50" : "border-border"} `}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`mt - 1 w - 6 h - 6 rounded border - 2 flex items - center justify - center flex - shrink - 0 ${isLulus ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300"
            } `}
        >
          {isLulus && "✓"}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{tkk.icon}</span>
            <span className={`font - medium ${isLulus ? "text-emerald-700" : ""} `}>{tkk.nama}</span>
          </div>
          {isLulus && (
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Tanggal Uji</Label>
                  <Input
                    type="date"
                    value={progress?.tanggal || ""}
                    onChange={(e) => onDetailChange("tanggal", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Pembina Penguji</Label>
                  <Input
                    type="text"
                    placeholder="Nama pembina"
                    value={progress?.pembina || ""}
                    onChange={(e) => onDetailChange("pembina", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onCetakPiagam}
                className="w-full text-xs h-8 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              >
                🏆 Cetak Piagam TKK
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Component: Piagam TKK Modal
function PiagamTKKModal({
  peserta,
  tkk,
  tanggalUji,
  onClose,
}: {
  peserta: PesertaRecord
  tkk: TKKItem
  tanggalUji: string
  onClose: () => void
}) {
  const [tanggalLulus, setTanggalLulus] = useState(tanggalUji || new Date().toISOString().split("T")[0])
  const [pembinaGudep, setPembinaGudep] = useState("")
  const [ketuaGudep, setKetuaGudep] = useState("")
  const [saving, setSaving] = useState(false)

  const handleCetakPDF = async () => {
    setSaving(true)

    // Save to database
    const supabase = createClient()
    await supabase.from("piagam_tkk").upsert({
      peserta_id: peserta.id,
      tkk_id: tkk.id,
      nama_tkk: tkk.nama,
      tanggal_uji: tanggalUji || null,
      tanggal_lulus: tanggalLulus,
      pembina_gudep: pembinaGudep,
      ketua_gudep: ketuaGudep,
    })

    // Generate PDF
    const printContent = `
    < html >
        <head>
          <title>Piagam TKK ${tkk.nama}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #333; padding-bottom: 20px; }
            .logo { font-size: 48px; margin-bottom: 10px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 14px; color: #666; }
            .content { line-height: 1.8; margin: 30px 0; text-align: center; }
            .tkk-badge { font-size: 64px; margin: 20px 0; }
            .tkk-name { font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 20px; }
            .data-table { width: 80%; margin: 20px auto; text-align: left; }
            .data-table td { padding: 8px 10px; }
            .data-table td:first-child { width: 150px; font-weight: bold; }
            .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 40px; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">⚜️</div>
            <div class="title">PIAGAM TANDA KECAKAPAN KHUSUS</div>
            <div class="subtitle">Gugus Depan SD Kedondong Sokaraja</div>
          </div>
          
          <div class="content">
            <p>Diberikan kepada:</p>
            
            <table class="data-table">
              <tr><td>Nama</td><td>: ${peserta.nama_lengkap}</td></tr>
              <tr><td>Golongan</td><td>: ${peserta.golongan}</td></tr>
              <tr><td>Gugus Depan</td><td>: SD Kedondong Sokaraja</td></tr>
            </table>
            
            <p>Telah menyelesaikan uji kecakapan dan dinyatakan <strong>LULUS</strong></p>
            
            <div class="tkk-badge">${tkk.icon}</div>
            <div class="tkk-name">TKK ${tkk.nama.toUpperCase()}</div>
            
            <table class="data-table">
              <tr><td>Tanggal Uji</td><td>: ${tanggalUji ? new Date(tanggalUji).toLocaleDateString("id-ID") : "-"}</td></tr>
              <tr><td>Tanggal Lulus</td><td>: ${new Date(tanggalLulus).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td></tr>
            </table>
          </div>
          
          <div class="signatures">
            <div class="signature-box">
              <p>Mengetahui,</p>
              <p>Pembina Gudep</p>
              <div class="signature-line">
                <strong>${pembinaGudep || "____________________"}</strong>
              </div>
            </div>
            <div class="signature-box">
              <p>&nbsp;</p>
              <p>Ketua Gudep</p>
              <div class="signature-line">
                <strong>${ketuaGudep || "____________________"}</strong>
              </div>
            </div>
          </div>
        </body>
      </html >
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }

    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Cetak Piagam TKK</h2>

        <div className="space-y-4">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-4xl mb-2">{tkk.icon}</div>
            <div className="font-bold">{tkk.nama}</div>
          </div>

          <div>
            <Label>Nama</Label>
            <Input value={peserta.nama_lengkap} disabled className="bg-secondary" />
          </div>
          <div>
            <Label>Golongan</Label>
            <Input value={peserta.golongan} disabled className="bg-secondary" />
          </div>
          <div>
            <Label>Gugus Depan</Label>
            <Input value="SD Kedondong Sokaraja" disabled className="bg-secondary" />
          </div>
          <div>
            <Label>Nama TKK</Label>
            <Input value={tkk.nama} disabled className="bg-secondary" />
          </div>
          <div>
            <Label>Tanggal Uji</Label>
            <Input value={tanggalUji || "-"} disabled className="bg-secondary" />
          </div>
          <div>
            <Label>Tanggal Lulus</Label>
            <Input type="date" value={tanggalLulus} onChange={(e) => setTanggalLulus(e.target.value)} />
          </div>
          <div>
            <Label>Pembina Gudep</Label>
            <Input
              placeholder="Nama pembina gudep"
              value={pembinaGudep}
              onChange={(e) => setPembinaGudep(e.target.value)}
            />
          </div>
          <div>
            <Label>Ketua Gudep</Label>
            <Input
              placeholder="Nama ketua gudep"
              value={ketuaGudep}
              onChange={(e) => setKetuaGudep(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button onClick={handleCetakPDF} className="flex-1" disabled={saving}>
            {saving ? "Memproses..." : "Cetak PDF"}
          </Button>
        </div>
      </div>
    </div>
  )
}
