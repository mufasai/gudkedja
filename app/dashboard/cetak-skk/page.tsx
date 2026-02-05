"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { TKK_SIAGA_WAJIB, TKK_SIAGA_PILIHAN, type TKKItem } from "@/lib/sku-data"
import { formatTanggal, generatePiagamSKKHTML } from "@/lib/surat-template"

interface PesertaRecord {
    id: number
    nama_lengkap: string
    golongan: string
    kelas: string
    barung?: string
    regu?: string
}

export default function CetakSKKPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [pesertaList, setPesertaList] = useState<PesertaRecord[]>([])
    const [searchNama, setSearchNama] = useState("")
    const [selectedPeserta, setSelectedPeserta] = useState<PesertaRecord | null>(null)
    const [selectedTKK, setSelectedTKK] = useState<TKKItem | null>(null)
    const [step, setStep] = useState<"search" | "select-tkk" | "form">("search")

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
        setStep("select-tkk")
    }

    const handleSelectTKK = (tkk: TKKItem) => {
        setSelectedTKK(tkk)
        setStep("form")
    }

    const handleBack = () => {
        if (step === "form") {
            setStep("select-tkk")
            setSelectedTKK(null)
        } else if (step === "select-tkk") {
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
                        <h1 className="text-2xl font-bold">Cetak Sertifikat SKK</h1>
                        <p className="text-sm text-primary-foreground/80">Sertifikat Kecakapan Khusus Pramuka</p>
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

                {step === "select-tkk" && selectedPeserta && (
                    <SelectTKK
                        peserta={selectedPeserta}
                        onSelectTKK={handleSelectTKK}
                        onBack={handleBack}
                    />
                )}

                {step === "form" && selectedPeserta && selectedTKK && (
                    <FormCetakSertifikat
                        peserta={selectedPeserta}
                        tkk={selectedTKK}
                        onBack={handleBack}
                    />
                )}
            </div>
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
    setSearchNama: (value: string) => void
    filteredPeserta: PesertaRecord[]
    onSelect: (peserta: PesertaRecord) => void
}) {
    return (
        <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">Pilih Peserta</h2>

            <div className="mb-4">
                <Label htmlFor="search">Cari Nama Peserta</Label>
                <Input
                    id="search"
                    type="text"
                    placeholder="Ketik nama peserta..."
                    value={searchNama}
                    onChange={(e) => setSearchNama(e.target.value)}
                    className="mt-1"
                />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredPeserta.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Tidak ada peserta ditemukan</p>
                ) : (
                    filteredPeserta.map((peserta) => (
                        <button
                            key={peserta.id}
                            onClick={() => onSelect(peserta)}
                            className="w-full p-4 text-left border border-border rounded-lg hover:bg-secondary transition"
                        >
                            <div className="font-medium">{peserta.nama_lengkap}</div>
                            <div className="text-sm text-muted-foreground">
                                {peserta.golongan} • Kelas {peserta.kelas}
                                {peserta.barung && ` • Barung ${peserta.barung}`}
                                {peserta.regu && ` • Regu ${peserta.regu}`}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}

// Component: Select TKK
function SelectTKK({
    peserta,
    onSelectTKK,
    onBack,
}: {
    peserta: PesertaRecord
    onSelectTKK: (tkk: TKKItem) => void
    onBack: () => void
}) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-card rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-lg font-bold">Pilih TKK</h2>
                        <p className="text-sm text-muted-foreground">{peserta.nama_lengkap}</p>
                        <p className="text-xs text-muted-foreground">{peserta.golongan}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onBack}>
                        Kembali
                    </Button>
                </div>
            </div>

            {/* TKK Wajib */}
            <div className="bg-card rounded-lg shadow-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">WAJIB</span>
                    TKK Wajib (10)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TKK_SIAGA_WAJIB.map((tkk) => (
                        <button
                            key={tkk.id}
                            onClick={() => onSelectTKK(tkk)}
                            className="p-4 border-2 border-border rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{tkk.icon}</span>
                                <div>
                                    <div className="font-medium">{tkk.nama}</div>
                                    <div className="text-xs text-muted-foreground">{tkk.bidang}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* TKK Pilihan */}
            <div className="bg-card rounded-lg shadow-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">PILIHAN</span>
                    TKK Pilihan (20)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TKK_SIAGA_PILIHAN.map((tkk) => (
                        <button
                            key={tkk.id}
                            onClick={() => onSelectTKK(tkk)}
                            className="p-4 border-2 border-border rounded-lg hover:border-amber-500 hover:bg-amber-50 transition text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{tkk.icon}</span>
                                <div>
                                    <div className="font-medium">{tkk.nama}</div>
                                    <div className="text-xs text-muted-foreground">{tkk.bidang}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Component: Form Cetak Sertifikat
function FormCetakSertifikat({
    peserta,
    tkk,
    onBack,
}: {
    peserta: PesertaRecord
    tkk: TKKItem
    onBack: () => void
}) {
    const [formData, setFormData] = useState({
        nomorSurat: "",
        tempatLahir: "",
        tanggalLahir: "",
        nta: "",
        penguji: "",
        ntaPenguji: "",
        tempatTerbit: "Kedondong",
        tanggalTerbit: new Date().toISOString().split("T")[0],
    })
    const [saving, setSaving] = useState(false)
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        // Load existing certificate data if available
        const loadCertificateData = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from("sertifikat_skk")
                .select("*")
                .eq("peserta_id", peserta.id)
                .eq("tkk_id", tkk.id)
                .single()

            if (data) {
                setFormData({
                    nomorSurat: data.nomor_sertifikat || "",
                    tempatLahir: data.tempat_lahir || "",
                    tanggalLahir: data.tanggal_lahir || "",
                    nta: data.nta || "",
                    penguji: data.penguji || "",
                    ntaPenguji: data.nta_penguji || "",
                    tempatTerbit: data.tempat_terbit || "Kedondong",
                    tanggalTerbit: data.tanggal_terbit || new Date().toISOString().split("T")[0],
                })
            }
            setLoadingData(false)
        }
        loadCertificateData()
    }, [peserta.id, tkk.id])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleCetakPDF = async () => {
        // Validasi
        if (!formData.nomorSurat || !formData.tempatLahir || !formData.tanggalLahir || !formData.penguji) {
            alert("Mohon lengkapi data: Nomor Surat, Tempat Lahir, Tanggal Lahir, dan Penguji")
            return
        }

        setSaving(true)

        try {
            const supabase = createClient()

            // Gunakan nomor surat dari input form
            const nomorSertifikat = formData.nomorSurat

            // Save to database
            const { error: saveError } = await supabase
                .from("sertifikat_skk")
                .upsert({
                    peserta_id: peserta.id,
                    tkk_id: tkk.id,
                    nomor_sertifikat: nomorSertifikat,
                    nama_peserta: peserta.nama_lengkap,
                    tempat_lahir: formData.tempatLahir,
                    tanggal_lahir: formData.tanggalLahir,
                    nta: formData.nta,
                    golongan: peserta.golongan,
                    jenis_tkk: tkk.nama,
                    bidang_tkk: tkk.bidang,
                    penguji: formData.penguji,
                    nta_penguji: formData.ntaPenguji,
                    tempat_terbit: formData.tempatTerbit,
                    tanggal_terbit: formData.tanggalTerbit,
                }, {
                    onConflict: "peserta_id,tkk_id"
                })

            if (saveError) {
                console.error("Error saving certificate:", saveError)
                alert("Gagal menyimpan data sertifikat")
                setSaving(false)
                return
            }

            // Generate HTML untuk print dengan URL absolut untuk background
            const baseUrl = window.location.origin
            const printHTML = generatePiagamSKKHTML({
                nomorSertifikat,
                namaPeserta: peserta.nama_lengkap,
                tempatLahir: formData.tempatLahir,
                tanggalLahir: formData.tanggalLahir,
                nta: formData.nta,
                jenisTKK: tkk.nama,
                bidangTKK: tkk.bidang,
                penguji: formData.penguji,
                tempatTerbit: formData.tempatTerbit,
                tanggalTerbit: formData.tanggalTerbit,
                namaPenguji: formData.penguji,
                ntaPenguji: formData.ntaPenguji,
                golongan: peserta.golongan,
            }).replace('/skk.png', `${baseUrl}/skk.png`)

            // Buka window baru untuk print
            const printWindow = window.open("", "_blank")
            if (!printWindow) {
                alert("Pop-up diblokir. Silakan izinkan pop-up untuk aplikasi ini.")
                setSaving(false)
                return
            }

            // Tulis loading indicator dulu
            printWindow.document.write(`
                <html>
                <head><title>Loading...</title></head>
                <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;background:#f5f5f5;">
                    <div style="text-align:center;">
                        <div style="font-size:48px;margin-bottom:16px;">⚜️</div>
                        <div style="font-size:18px;color:#666;">Memuat sertifikat...</div>
                        <div style="font-size:14px;color:#999;margin-top:8px;">Jika loading lama, tutup popup lalu gunakan Share > Save to File</div>
                    </div>
                </body>
                </html>
            `)

            // Render konten langsung tanpa menunggu preload
            // Ini lebih cepat untuk mobile
            setTimeout(() => {
                printWindow.document.open()
                printWindow.document.write(printHTML)
                printWindow.document.close()

                // Tunggu sebentar untuk render, lalu trigger print
                setTimeout(() => {
                    printWindow.focus()
                    printWindow.print()

                    // Tampilkan alert sukses setelah print dialog muncul
                    setTimeout(() => {
                        setSaving(false)
                        alert("Sertifikat berhasil dicetak! Jika preview loading lama, tutup popup lalu gunakan Share > Save to File")
                    }, 300)
                }, 500)
            }, 300)
        } catch (error) {
            console.error("Error:", error)
            alert("Terjadi kesalahan saat mencetak sertifikat")
            setSaving(false)
        }
    }

    if (loadingData) {
        return (
            <div className="bg-card rounded-lg shadow-lg p-6 text-center">
                <p className="text-muted-foreground">Memuat data...</p>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-bold">Form Cetak Sertifikat</h2>
                    <p className="text-sm text-muted-foreground">{peserta.nama_lengkap}</p>
                </div>
                <Button variant="outline" size="sm" onClick={onBack}>
                    Kembali
                </Button>
            </div>

            {/* TKK Info */}
            <div className="text-center p-4 bg-secondary rounded-lg mb-6">
                <div className="text-4xl mb-2">{tkk.icon}</div>
                <div className="font-bold">{tkk.nama}</div>
                <div className="text-sm text-muted-foreground">{tkk.bidang}</div>
            </div>

            {/* Form */}
            <div className="space-y-4">
                <div>
                    <Label>Nomor Surat *</Label>
                    <Input
                        placeholder="Contoh: 01/TKK-PSB/11.02.06.0365/2024"
                        value={formData.nomorSurat}
                        onChange={(e) => handleChange("nomorSurat", e.target.value)}
                        required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Format: urutan/TKK-PSB/11.02.06.gudep/tahun
                    </p>
                </div>

                <div>
                    <Label>Nama Peserta *</Label>
                    <Input value={peserta.nama_lengkap} disabled className="bg-secondary" />
                </div>

                <div>
                    <Label>Tempat Lahir *</Label>
                    <Input
                        placeholder="Contoh: Banyumas"
                        value={formData.tempatLahir}
                        onChange={(e) => handleChange("tempatLahir", e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label>Tanggal Lahir *</Label>
                    <Input
                        type="date"
                        value={formData.tanggalLahir}
                        onChange={(e) => handleChange("tanggalLahir", e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label>NTA (Nomor Tanda Anggota)</Label>
                    <Input
                        placeholder="Contoh: 8363785854"
                        value={formData.nta}
                        onChange={(e) => handleChange("nta", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Golongan</Label>
                    <Input value={peserta.golongan} disabled className="bg-secondary" />
                </div>

                <div>
                    <Label>Nama Penguji *</Label>
                    <Input
                        placeholder="Contoh: Ridar Pamungkas"
                        value={formData.penguji}
                        onChange={(e) => handleChange("penguji", e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label>NTA Penguji</Label>
                    <Input
                        placeholder="Contoh: 64836857567"
                        value={formData.ntaPenguji}
                        onChange={(e) => handleChange("ntaPenguji", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Tempat Terbit</Label>
                    <Input
                        value={formData.tempatTerbit}
                        onChange={(e) => handleChange("tempatTerbit", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Tanggal Terbit *</Label>
                    <Input
                        type="date"
                        value={formData.tanggalTerbit}
                        onChange={(e) => handleChange("tanggalTerbit", e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Button */}
            <div className="mt-6">
                <Button onClick={handleCetakPDF} className="w-full" disabled={saving}>
                    {saving ? "Memproses..." : "🖨️ Cetak Sertifikat SKK"}
                </Button>
            </div>
        </div>
    )
}
