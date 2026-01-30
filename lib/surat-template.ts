// Utility functions untuk surat keterangan lulus

/**
 * Format tanggal ke bahasa Indonesia
 * @param dateStr - String tanggal dalam format ISO
 * @returns String tanggal dalam format "1 Januari 2026"
 */
export const formatTanggal = (dateStr: string): string => {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}

/**
 * Mendapatkan nama hari dari tanggal
 * @param dateStr - String tanggal dalam format ISO
 * @returns Nama hari dalam bahasa Indonesia
 */
export const getNamaHari = (dateStr: string): string => {
  if (!dateStr) return "Jumat"
  const date = new Date(dateStr)
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  return days[date.getDay()]
}

/**
 * Extract kode gudep dari nomor surat
 * @param nomorSurat - Nomor surat format: 021/11.02.06.0365/XII/2023
 * @returns Kode gudep (contoh: "0365")
 */
export const extractKodeGudep = (nomorSurat: string): string => {
  const match = nomorSurat.match(/11\.02\.06\.(\d+)/)
  return match ? match[1] : "0365"
}

/**
 * Generate HTML template untuk surat keterangan lulus
 */
interface SuratTemplateParams {
  kodeGudep: string
  nomorSurat: string
  namaPeserta: string
  tempatLahir: string
  tanggalLahir: string
  golongan: string
  tingkatSKU: string
  namaHariPelantikan: string
  tanggalPelantikan: string
  tempatTerbit: string
  tanggalTerbit: string
  namaPembina: string
  nipPembina: string
}

export const generateSuratHTML = (params: SuratTemplateParams): string => {
  const {
    kodeGudep,
    nomorSurat,
    namaPeserta,
    tempatLahir,
    tanggalLahir,
    golongan,
    tingkatSKU,
    namaHariPelantikan,
    tanggalPelantikan,
    tempatTerbit,
    tanggalTerbit,
    namaPembina,
    nipPembina,
  } = params

  return `
    <html>
      <head>
        <title>Surat Keterangan Lulus ${tingkatSKU}</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Times New Roman', serif;
            background: #ffffff;
            color: #000000;
            margin: 0;
            padding: 0;
          }
          .page-container {
            width: 210mm;
            height: 297mm;
            position: relative;
            margin: 0 auto;
            background-color: #ffffff;
            background-image: url('/bg-surat.png');
            background-size: 100% 100%;
            background-position: center;
            background-repeat: no-repeat;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .content-overlay {
            position: absolute;
            width: 100%;
            height: 100%;
            padding: 0;
          }
          
          /* Header */
          .header-container {
            position: absolute;
            top: 60mm;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            width: 100%;
          }
          .header-line {
            font-size: 22px;
            font-weight: bold;
            margin: 1px 0;
            letter-spacing: 0.5px;
            color: #000000;
          }
          
          /* Surat Keterangan Title */
          .surat-title {
            position: absolute;
            top: 105mm;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Brush Script MT', 'Lucida Handwriting', cursive;
            font-size: 42px;
            font-weight: normal;
            text-align: center;
            font-style: italic;
            color: #000000;
          }
          
          /* Nomor Surat */
          .nomor-surat {
            position: absolute;
            top: 120mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 13px;
            color: #000000;
          }
          
          /* Intro Text */
          .intro-text {
            position: absolute;
            top: 132mm;
            left: 35mm;
            right: 35mm;
            font-size: 16px;
            text-align: justify;
            line-height: 1.5;
            color: #000000;
          }
          
          /* Data Peserta */
          .data-label {
            position: absolute;
            left: 35mm;
            font-size: 16px;
            color: #000000;
          }
          .data-value {
            position: absolute;
            left: 95mm;
            font-size: 16px;
            font-weight: bold;
            color: #000000;
          }
          .nama-label { top: 150mm; }
          .nama-value { top: 150mm; }
          .ttl-label { top: 159mm; }
          .ttl-value { top: 159mm; }
          .golongan-label { top: 168mm; }
          .golongan-value { top: 168mm; }
          
          /* Keterangan Box */
          .keterangan-text {
            position: absolute;
            top: 178mm;
            left: 35mm;
            right: 35mm;
            font-size: 16px;
            text-align: justify;
            line-height: 1.5;
            color: #000000;
          }
          
          /* Footer */
          .tempat-tanggal {
            position: absolute;
            top: 223mm;
            right: 35mm;
            font-size: 16px;
            text-align: center;
            color: #000000;
          }
          .ketua-label {
            position: absolute;
            top: 249mm;
            right: 35mm;
            font-size: 16px;
            text-align: center;
            color: #000000;
          }
          .nama-pembina {
            position: absolute;
            top: 266mm;
            right: 35mm;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            text-decoration: underline;
            color: #000000;
          }
          .nip-pembina {
            position: absolute;
            top: 271mm;
            right: 35mm;
            font-size: 16px;
            text-align: center;
            color: #000000;
          }
          strong {
            font-weight: bold;
            color: #000000;
          }

          /* Screen-specific styles for responsiveness */
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="content-overlay">
            <!-- Header -->
            <div class="header-container">
              <div class="header-line">GERAKAN PRAMUKA</div>
              <div class="header-line">GUGUS DEPAN 11.02.06.<span class="header-gudep">${kodeGudep}</span></div>
              <div class="header-line">PANGKALAN SD NEGERI KEDONDONG</div>
              <div class="header-line">KABUPATEN BANYUMAS</div>
            </div>
            
            <!-- Surat Keterangan Title -->
            <div class="surat-title">Surat Keterangan</div>
            
            <!-- Nomor Surat -->
            <div class="nomor-surat">Nomor: ${nomorSurat}</div>
            
            <!-- Intro Text -->
            <div class="intro-text">
              Yang bertanda tangan di bawah ini Ketua Gugus Depan Gerakan Pramuka menerangkan,
            </div>
            
            <!-- Data Nama -->
            <div class="data-label nama-label">N a m a</div>
            <div class="data-value nama-value">: ${namaPeserta.toUpperCase()}</div>
            
            <!-- Data TTL -->
            <div class="data-label ttl-label">Tempat / Tgl. Lahir</div>
            <div class="data-value ttl-value">: ${tempatLahir}, ${formatTanggal(tanggalLahir)}</div>
            
            <!-- Data Golongan -->
            <div class="data-label golongan-label">Golongan Pramuka</div>
            <div class="data-value golongan-value">: ${golongan.toUpperCase()}</div>
            
            <!-- Keterangan -->
            <div class="keterangan-text">
              Telah menyelesaikan SKU Pramuka Golongan ${golongan} <strong>${tingkatSKU}</strong>, pada hari ini <strong>${namaHariPelantikan}</strong>, tanggal <strong>${formatTanggal(tanggalPelantikan)}</strong> bertempat di Pangkalan SD NEGERI KEDONDONG dan diberikan hak memakai Tanda Kecakapan Umum Pramuka ${golongan}: <strong>${tingkatSKU}</strong>
              <br/><br/>
              Dengan harapan untuk senantiasa meningkatkan ketrampilan dan pengetahuannya berdasarkan Dwi Satya dan Dwi Darma Pramuka.
            </div>
            
            <!-- Tempat & Tanggal -->
            <div class="tempat-tanggal">
              Dikeluarkan di: ${tempatTerbit},<br/>
              Pada Tanggal : <strong>${formatTanggal(tanggalTerbit)}</strong>
            </div>
            
            <!-- Ketua Gugus Depan -->
            <div class="ketua-label">Ketua Gugus Depan</div>
            
            <!-- Nama Pembina -->
            <div class="nama-pembina">${namaPembina}</div>
            
            <!-- NIP -->
            <div class="nip-pembina">NTA. ${nipPembina}</div>
          </div>
        </div>


      </body>
    </html>
  `
}
