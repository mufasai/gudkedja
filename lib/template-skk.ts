import { formatTanggal } from './template-utils'

/**
 * Interface untuk parameter piagam SKK
 */
export interface PiagamSKKParams {
  nomorSertifikat: string
  namaPeserta: string
  tempatLahir: string
  tanggalLahir: string
  nta: string
  jenisTKK: string
  bidangTKK: string
  penguji: string
  tempatTerbit: string
  tanggalTerbit: string
  namaPenguji: string
  ntaPenguji: string
  golongan: string
}

/**
 * Generate HTML template untuk piagam SKK/TKK
 */
export const generatePiagamSKKHTML = (params: PiagamSKKParams): string => {
  const {
    nomorSertifikat,
    namaPeserta,
    tempatLahir,
    tanggalLahir,
    nta,
    jenisTKK,
    bidangTKK,
    penguji,
    tempatTerbit,
    tanggalTerbit,
    namaPenguji,
    ntaPenguji,
    golongan,
  } = params

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sertifikat Kecakapan Khusus - ${jenisTKK}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page { 
            size: A4 landscape; 
            margin: 0; 
          }
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          body { 
            font-family: 'Times New Roman', serif;
            background: #ffffff;
            color: #000000;
            margin: 0;
            padding: 0;
          }
          .page-container {
            width: 297mm;
            height: 210mm;
            position: relative;
            margin: 0 auto;
            background-color: #ffffff;
            background-image: url('/skk.png');
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
          
          /* Title */
          .title {
            position: absolute;
            top: 42mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            color: #1e40af;
            letter-spacing: 2px;
          }
          
          /* Nomor Sertifikat */
          .nomor-sertifikat {
            position: absolute;
            top: 52mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 16px;
            text-align: center;
            color: #000000;
          }
          .nomor-value {
            color: #000000;
            font-weight: bold;
          }
          
          /* Intro Text */
          .intro-text {
            position: absolute;
            top: 62mm;
            left: 40mm;
            right: 40mm;
            font-size: 14px;
            text-align: justify;
            line-height: 1.6;
            color: #000000;
          }
          
          /* Data Peserta */
          .data-row {
            position: absolute;
            left: 40mm;
            font-size: 14px;
            color: #000000;
            display: flex;
          }
          .data-label {
            width: 120px;
            display: inline-block;
          }
          .data-colon {
            width: 20px;
            display: inline-block;
          }
          .data-value {
            font-weight: bold;
            color: #000000;
            display: inline-block;
          }
          
          .nama-row { top: 78mm; }
          .ttl-row { top: 84mm; }
          .nta-row { top: 90mm; }
          
          /* Status Lulus */
          .status-lulus {
            position: absolute;
            top: 100mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            color: #000000;
          }
          
          /* TKK Info */
          .tkk-info {
            position: absolute;
            top: 110mm;
            left: 40mm;
            font-size: 14px;
            line-height: 1.8;
            color: #000000;
          }
          .tkk-label {
            display: inline-block;
            width: 120px;
          }
          .tkk-colon {
            display: inline-block;
            width: 20px;
          }
          .tkk-value {
            font-weight: bold;
            color: #000000;
          }
          
          /* Kewajiban Text */
          .kewajiban-text {
            position: absolute;
            top: 137mm;
            left: 40mm;
            right: 40mm;
            font-size: 13px;
            text-align: justify;
            line-height: 1.6;
            color: #000000;
          }
          
          /* Penutup Text */
          .penutup-text {
            position: absolute;
            top: 148mm;
            left: 40mm;
            right: 40mm;
            font-size: 13px;
            text-align: justify;
            line-height: 1.6;
            color: #000000;
          }
          
          /* Footer - Center aligned */
          .tempat-tanggal {
            position: absolute;
            top: 160mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 14px;
            text-align: center;
            color: #000000;
          }
          .tanggal-value {
            color: #000000;
            font-weight: bold;
          }
          
          .penguji-label {
            position: absolute;
            top: 167mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 14px;
            text-align: center;
            color: #000000;
          }
          
          .nama-penguji {
            position: absolute;
            top: 189mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            text-decoration: underline;
            color: #000000;
          }
          
          .nta-penguji {
            position: absolute;
            top: 195mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 14px;
            text-align: center;
            color: #000000;
          }
          .nta-value {
            color: #000000;
            font-weight: bold;
          }
          
          strong {
            font-weight: bold;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .page-container {
              page-break-after: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="content-overlay">
            <!-- Title -->
            <div class="title">SERTIFIKAT KECAKAPAN KHUSUS</div>
            
            <!-- Nomor Sertifikat -->
            <div class="nomor-sertifikat">
              No: <span class="nomor-value">${nomorSertifikat}</span>
            </div>
            
            <!-- Intro Text -->
            <div class="intro-text">
              Sesuai dengan Keputusan Kwartir Nasional No.134/KN/76 telah diadakan pengujian Syarat Kecakapan Khusus dengan hasil baik, maka Pramuka ${golongan.toUpperCase()}:
            </div>
            
            <!-- Data Nama -->
            <div class="data-row nama-row">
              <span class="data-label">Nama</span>
              <span class="data-colon">:</span>
              <span class="data-value">${namaPeserta.toUpperCase()}</span>
            </div>
            
            <!-- Data TTL -->
            <div class="data-row ttl-row">
              <span class="data-label">Tempat,Tgl.Lahir</span>
              <span class="data-colon">:</span>
              <span class="data-value">${tempatLahir}, ${formatTanggal(tanggalLahir)}</span>
            </div>
            
            <!-- Data NTA -->
            <div class="data-row nta-row">
              <span class="data-label">NTA</span>
              <span class="data-colon">:</span>
              <span class="data-value">${nta}</span>
            </div>
            
            <!-- Status Lulus -->
            <div class="status-lulus">Dinyatakan <strong>LULUS</strong></div>
            
            <!-- TKK Info -->
            <div class="tkk-info">
              Dan berhak memakai Tanda Kecakapan Khusus (TKK)<br/>
              <span class="tkk-label">Jenis</span>
              <span class="tkk-colon">:</span><span class="tkk-value">${jenisTKK}</span><br/>
              <span class="tkk-label">Bidang</span>
              <span class="tkk-colon">:</span>${bidangTKK}<br/>
              <span class="tkk-label">Penguji</span>
              <span class="tkk-colon">:</span><span class="tkk-value">${penguji}</span>
            </div>
            
            <!-- Kewajiban Text -->
            <div class="kewajiban-text">
              Kepada anggota yang memakai Tanda Kecakapan Khusus (TKK) ini berkewajiban untuk senantiasa melatih diri serta meningkatkan kemampuan dan kemahirannya secara terus menerus.
            </div>
            
            <!-- Penutup Text -->
            <div class="penutup-text">
              Demikian surat pengesahan ini ditetapkan untuk dapat dipergunakan sebagaimana mestinya.
            </div>
            
            <!-- Tempat & Tanggal -->
            <div class="tempat-tanggal">
              ${tempatTerbit}, <span class="tanggal-value">${formatTanggal(tanggalTerbit)}</span>
            </div>
            
            <!-- Penguji Label -->
            <div class="penguji-label">Penguji,</div>
            
            <!-- Nama Penguji -->
            <div class="nama-penguji">${namaPenguji}</div>
            
            <!-- NTA Penguji -->
            <div class="nta-penguji">
              NTA. <span class="nta-value">${ntaPenguji}</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}
