// Interface untuk syarat dengan sub-checklist
export interface SyaratSKU {
    text: string;
    subItems?: {
        label: string;
        items: string[];
    }[];
}

// Data syarat SKU Siaga Mula (34 syarat)
export const SKU_SIAGA_MULA: (string | SyaratSKU)[] = [
    {
        text: "Syarat Keagamaan (pilih sesuai agama peserta)",
        subItems: [
            {
                label: "Islam",
                items: [
                    "Dapat menyebutkan Rukun Iman dan Rukun Islam",
                    "Dapat mengucapkan Syahadat dan menyebutkan artinya",
                    "Dapat menghafal Surat Al-Fatihah dan menyebutkan artinya",
                    "Dapat menghafal 3 surat pendek dan menyebutkan artinya",
                    "Dapat mengetahui tatacara berwudhu beserta doanya",
                    "Dapat melaksanakan gerakan sholat dan bacaannya",
                    "Dapat menghafal sedikitnya 3 do'a harian"
                ]
            },
            {
                label: "Katolik",
                items: [
                    "Dapat membuat tanda salib",
                    "Dapat mengucapkan do'a harian dan menyanyikan tiga buah lagu gereja",
                    "Dapat menerima dan mensyukuri keberadaan dirinya sebagai ciptaan Allah, dan memberikan contoh-contohnya",
                    "Dapat mengasihi keluarganya",
                    "Dapat mengasihi teman, guru dan sesamanya baik di gugus depan, di sekolah dan di sekitarnya"
                ]
            },
            {
                label: "Kristen",
                items: [
                    "Dapat menghafal Johanes 3:16 dan berdoa sederhana",
                    "Dapat mewujudkan ucapan syukur atas keberadaan dirinya di dunia ini sebagai ciptaan Allah, sedikitnya tiga hal",
                    "Dapat mengasihi keluarganya",
                    "Dapat mengasihi teman, guru dan sesamanya baik di gudep, di sekolah dan di sekitarnya",
                    "Telah mengikuti sekolah minggu 4 kali berturut-turut"
                ]
            },
            {
                label: "Hindu",
                items: [
                    "Dapat menunjukkan sikap Anjali serta dapat mengucapkan salam Panganjali",
                    "Dapat memperagakan sikap/tatacara sembahyang",
                    "Dapat menyebutkan nama-nama bunga yang bisa dipakai sembahyang",
                    "Dapat menyebutkan nama tempat suci untuk melaksanakan sembahyang",
                    "Dapat menyebutkan jam atau waktu untuk melaksanakan persembahyangan/Puja Tri Sandhya"
                ]
            },
            {
                label: "Buddha",
                items: [
                    "Dapat mengucapkan salam Buddhis",
                    "Dapat bersikap Anjali",
                    "Dapat melakukan Namaskara"
                ]
            }
        ]
    },
    "Dapat menghafal Dwisatya dan Dwidarma",
    "Dapat menyebutkan jenis-jenis Salam Pramuka",
    "Telah memiliki buku tabungan, sekurang-kurangnya dalam waktu 6 minggu terakhir",
    "Setia membayar uang iuran kepada gugus depannya, sedapat-dapatnya dengan uang yang diperoleh dari usahanya sendiri",
    "Dapat menyebutkan lambang Gerakan Pramuka dan Penciptanya",
    "Dapat menyebutkan salah satu seni budaya di daerah tempat tinggalnya",
    "Selalu bersikap hemat dan cermat dengan segala miliknya",
    "Dapat menyebutkan identitas diri dan Keluarganya",
    "Dapat membedakan perbuatan baik dan perbuatan buruk",
    "Rajin dan giat mengikuti latihan Perindukan Siaga, sekurang-kurangnya 6 kali latihan berturut-turut",
    "Dapat dengan hafal menyanyikan Lagu Kebangsaan Indonesia Raya bait pertama di depan perindukannya",
    "Dapat menyebutkan arti kiasan warna Sang Merah Putih",
    "Dapat menyebutkan sedikitnya 3 hari besar nasional dan 3 hari besar keagamaan",
    "Dapat menyebutkan 5 peraturan keluarga",
    "Dapat menyebutkan 3 peraturan di lingkungannya",
    "Dapat menyebutkan 2 macam adat/budaya di lingkungannya",
    "Dapat menyampaikan ucapan dengan baik dan sopan serta hormat kepada orangtua, sesama teman dan orang lain",
    "Dapat menyebutkan nama dan alamat Ketua RT, Ketua RW, Lurah dan Camat di sekitar tempat tinggalnya",
    "Dapat menyebutkan sila-sila Pancasila",
    "Dapat mengumpulkan keterangan untuk memperoleh pertolongan pertama pada kecelakaan dan dapat menginformasikan kepada orang dewasa disekitarnya",
    "Dapat membaca jam digital dan analog",
    "Dapat menunjukkan 4 arah mata angin",
    "Dapat berbahasa Indonesia dalam mengikuti pertemuan-pertemuan Siaga",
    "Dapat menyebutkan sedikitnya 2 macam alat komunikasi tradisional dan modern",
    "Dapat menyebutkan organ tubuh",
    "Dapat menyebutkan gerakan dasar olah raga",
    "Dapat melipat selimut dan merapikan tempat tidurnya",
    "Selalu berpakaian rapih dan memelihara kebersihan pribadi",
    "Dapat menjalankan latihan-latihan keseimbangan, dapat melempar dan menerima bola dengan tangan kanan dan kiri sedikitnya 5 kali tangkapan",
    "Dapat menyebutkan makanan dan minuman yang bergizi (4 sehat 5 sempurna)",
    "Dapat memelihara sedikitnya satu macam tanaman berguna, atau satu jenis binatang ternak, selama kira-kira 1 bulan",
    "Dapat melipat kertas yang dibentuk menyerupai pesawat, kapal, flora dan fauna",
    "Dapat membuat simpul mati, simpul hidup, simpul anyam, simpul pangkal dan simpul jangkar"
];

// Data syarat SKU Siaga Bantu (33 syarat)
export const SKU_SIAGA_BANTU: (string | SyaratSKU)[] = [
    {
        text: "Syarat Keagamaan (pilih sesuai agama peserta)",
        subItems: [
            {
                label: "Islam",
                items: [
                    "Dapat melaksanakan Tayamum",
                    "Dapat melaksanakan sholat wajib",
                    "Dapat melaksanakan shalat berjamaah",
                    "Dapat menyebutkan Rasul-rasul Allah",
                    "Dapat melafalkan Adzan, Iqamah untuk putra dan Iqomah untuk putri",
                    "Dapat menghafal sedikitnya 6 do'a harian"
                ]
            },
            {
                label: "Katolik",
                items: [
                    "Dapat mengucap doa harian dan menyanyikan tiga buah lagu gereja",
                    "Dapat menyebutkan hikayat dari Alkitab",
                    "Dapat memberikan yang terbaik kepada keluarga",
                    "Dapat memelihara salah satu ciptaan Allah"
                ]
            },
            {
                label: "Kristen",
                items: [
                    "Dapat menyanyikan tiga nyanyian Kristen",
                    "Hafal do'a Bapa kami",
                    "Dapat menyebutkan hikayat dari Al Kitab sedikitnya hikayat 4",
                    "Dapat memberikan yang terbaik kepada keluarga",
                    "Dapat memelihara salah satu ciptaan Allah",
                    "Telah Mengikuti Sekolah Minggu 8 Kali berturut-turut"
                ]
            },
            {
                label: "Hindu",
                items: [
                    "Dapat menyebutkan nama tempat-tempat suci untuk melaksanakan persembahyangan",
                    "Dapat mempraktikkan tata cara sembahyang dengan doa Gayatri Mantram",
                    "Dapat menyebutkan nama-nama pura yang ada disekitarnya",
                    "Dapat menyebutkan nama kitab suci agama Hindu",
                    "Dapat menyebutkan bagian Tri Kaya Parisudha",
                    "Dapat menyebutkan contoh-contoh perbuatan yang baik",
                    "Dapat membedakan perbuatan yang baik dan perbuatan yang buruk"
                ]
            },
            {
                label: "Buddha",
                items: [
                    "Dapat mengucapkan kata Buddha, Dharma, Sangha (Tri Ratna)",
                    "Dapat melakukan sifat karuna (kasih sayang) kepada semua makhluk",
                    "Dapat melakukan sikap berdoa"
                ]
            }
        ]
    },
    "Dapat melaksanakan Dwisatya dan Dwidarma",
    "Dapat melakukan Salam Pramuka dengan benar",
    "Telah memiliki buku tabungan dan sudah menabung uang secara teratur dalam buku tabungannya selama sekurang-kurangnya 8 minggu sejak menjadi Siaga Mula, yang diperoleh dari usahanya sendiri",
    "Setia membayar uang iuran kepada Gugus depan dengan uang yang sebagian diperoleh dari usahanya sendiri",
    "Dapat menyebutkan arti lambang Gerakan Pramuka",
    "Dapat menyebutkan sedikitnya 5 macam seni budaya yang ada di Indonesia",
    "Untuk putri: Dapat memasang buah baju dan menyalakan kompor/alat sejenis lainnya. Untuk putra: Dapat membuat hasta karya dengan dua macam bahan yang berbeda",
    "Dapat menyampaikan pendapat tentang lingkungan sekitarnya",
    "Dapat memperhatikan dan melaksanakan nasihat orang tua, yanda dan bunda serta gurunya",
    "Rajin dan giat mengikuti latihan perindukan sebagai Siaga Mula sekurang-kurangnya 8 kali latihan",
    "Dapat memperlihatkan sikap yang harus dilakukan jika lagu kebangsaan diperdengarkan atau dinyanyikan pada suatu upacara",
    "Dapat memperlihatkan cara mengibarkan dan menyimpan bendera merah putih pada upacara pembukaan dan penutupan latihan",
    "Dapat menyebutkan sedikitnya 6 hari besar nasional dan 5 orang nama pahlawan nasional",
    "Dapat mengikuti acara-acara adat/budaya di lingkungan tempat tinggalnya",
    "Dapat menyebutkan 3 peraturan di lingkungan tempat tinggalnya",
    "Dapat menjadi contoh yang baik bagi temannya",
    "Dapat menyebutkan nama kota/kabupaten, ibukota provinsi, dan kepala daerahnya, negara, ibukota negara, kepala negara dan wakilnya",
    "Dapat menyebutkan sila-sila Pancasila sesuai dengan lambangnya",
    "Dapat mengumpulkan keterangan untuk memperoleh pertolongan pertama pada kecelakaan dan dapat menginformasikan kepada petugas Puskesmas/rumah sakit/polisi",
    "Dapat menyebutkan perbedaan jam digital dan jam analog serta dapat memperkirakan waktu tanpa bantuan alat",
    "Dapat menunjukan 8 arah mata angin",
    "Dapat menyampaikan berita secara lisan dengan menggunakan bahasa Indonesia",
    "Dapat menggunakan alat komunikasi tradisional dan modern",
    "Dapat menyebutkan fungsi organ tubuh",
    "Dapat melakukan gerakan dasar olah raga",
    "Dapat mencuci, menjemur, melipat dan menyimpan pakaiannya dengan rapih",
    "Dapat memelihara kebersihan salah satu ruangan di rumah, sekolah, tempat ibadah dan tempat lainnya",
    "Dapat melakukan senam Pramuka",
    "Dapat menunjukkan bahan-bahan makanan yang bergizi",
    "Dapat memelihara sedikitnya satu macam tanaman yang berguna, atau satu jenis binatang ternak selama kira-kira 2 bulan",
    "Dapat membuat satu macam hasta karya dari barang bekas",
    "Dapat menggunakan simpul mati, simpul hidup, simpul anyam, simpul pangkal dan simpul jangkar"
];

// Data syarat SKU Siaga Tata (33 syarat)
export const SKU_SIAGA_TATA: (string | SyaratSKU)[] = [
    {
        text: "Syarat Keagamaan (pilih sesuai agama peserta)",
        subItems: [
            {
                label: "Islam",
                items: [
                    "Dapat membaca Al-Quran dan mengetahui tanda bacanya",
                    "Dapat menyebutkan Asmaul Husna dan artinya",
                    "Dapat mengetahui dan menceritakan salah satu kisah Rasul",
                    "Dapat menyebutkan 10 nama Malaikat dan tugasnya"
                ]
            },
            {
                label: "Katolik",
                items: [
                    "Tahu doa Iman, doa harapan, doa cinta kasih dan doa tobat",
                    "Telah mengikuti Perayaan Ekaristi dan tahu arti Konsekrasi",
                    "Dapat mengenal nama Pastor Paroki dan nama Uskup setempat",
                    "Dapat menunjukkan kemahakuasaan Allah",
                    "Dapat menunjukkan tindakan manusia yang bergantung kepada Allah"
                ]
            },
            {
                label: "Kristen",
                items: [
                    "Dapat menghafal Lukas 10:27 (hukum kasih)",
                    "Dapat mengucap dan menggunakan doa sederhana pada kesempatan tertentu",
                    "Dapat menunjukkan kemahakuasaan Allah, sedikitnya 5 macam",
                    "Dapat menunjukkan tindakan manusia yang bergantung kepada Allah, sedikitnya 5 macam",
                    "Rajin mengikuti sekolah Minggu di Gerejanya"
                ]
            },
            {
                label: "Hindu",
                items: [
                    "Dapat menghafal bait-bait Puja Tri Sandya",
                    "Dapat menyebutkan hari-hari suci agama Hindu",
                    "Dapat memahami perbedaan makna dari perayaan hari-hari besar/suci agama Hindu",
                    "Dapat menyebutkan beberapa nama Pura besar di Indonesia",
                    "Dapat menyebutkan bagian dari Panca Sradha",
                    "Dapat menyebutkan bagian dari Panca Yadnya",
                    "Dapat melakukan salah satu gerakan dalam Yoga Asanas"
                ]
            },
            {
                label: "Buddha",
                items: [
                    "Dapat melafalkan Paritta Namaskara",
                    "Dapat mengucapkan Paritta Vandana",
                    "Dapat mengucapkan Paritta Pancasila Buddhis (Bahasa Indonesia)"
                ]
            }
        ]
    },
    "Dapat mengajak temannya untuk mengamalkan Dwisatya dan Dwidarma",
    "Dapat menjelaskan tentang Salam Pramuka kepada teman sebarungnya",
    "Telah memiliki buku tabungan dan sudah menabung uang secara teratur dalam buku tabungannya selama sekurang-kurangnya 12 minggu sejak menjadi Siaga Bantu. Seluruh atau sebagian dari uang itu diperoleh dari usahanya sendiri",
    "Setia membayar uang iuran kepada gugus depan dengan uang yang diperoleh dari usahanya sendiri",
    "Dapat membuat lambang Gerakan Pramuka dari bahan yang ada",
    "Dapat memperagakan satu macam kegiatan seni budaya asal daerahnya",
    "Telah memiliki sedikitnya 5 tanda kecakapan khusus",
    "Dapat mengkritisi sesuatu masalah dengan baik",
    "Dapat menolong seseorang dan peduli terhadap lingkungan sekitarnya",
    "Rajin dan giat mengikuti latihan perindukan sebagai Siaga Bantu sekurang-kurangnya 12 kali latihan",
    "Dapat menceritakan sejarah Lagu Kebangsaan Indonesia Raya",
    "Dapat menceritakan sejarah bendera kebangsaan Indonesia dan tahu sikap yang harus dilakukan pada waktu bendera kebangsaan dikibarkan atau diturunkan serta dapat memelihara bendera kebangsaan",
    "Dapat menyebutkan sedikitnya 7 hari besar nasional, 4 hari besar dunia dan 10 nama pahlawan nasional",
    "Dapat menyebutkan akibat melanggar peraturan di keluarga, barung, perindukan dan sekolah",
    "Dapat menyebutkan akibat melanggar adat/budaya di lingkungannya",
    "Dapat mengajak temannya berbuat baik dan berkata benar",
    "Dapat menyebutkan negara-negara ASEAN dan menunjukkan bendera kebangsaannya",
    "Dapat menyebutkan perbuatan yang baik sesuai dengan sila-sila Pancasila",
    "Dapat mengumpulkan keterangan untuk memperoleh pertolongan pertama pada kecelakaan dan menyampaikan kepada dokter, rumah sakit, polisi dan keluarga korban",
    "Dapat menceritakan dasar terjadinya perbedaan waktu yang ada di Wilayah Indonesia",
    "Dapat menunjuk 8 macam arah mata angin dengan menggunakan kompas",
    "Dapat menulis surat kepada teman atau saudaranya dengan menggunakan Bahasa Indonesia",
    "Dapat merawat peralatan elektronik, peralatan listrik dan alat komunikasi yang ada di rumahnya",
    "Dapat memelihara organ tubuh",
    "Dapat melakukan olah raga secara tim",
    "Dapat mencuci peralatan dapur",
    "Dapat memelihara kebersihan halaman di rumah, sekolah, tempat ibadah atau di tempat lainnya",
    "Dapat menyebutkan 5 macam penyakit menular",
    "Dapat melakukan salah satu cabang olah raga atletik atau salah satu gaya cabang olahraga renang",
    "Dapat memelihara sedikitnya dua macam tanaman berguna, atau satu jenis binatang ternak, selama kira-kira 4 bulan",
    "Dapat membuat 2 (dua) macam hasta karya dengan bahan yang berbeda",
    "Dapat membuat sedikitnya 2 (dua) macam ikatan"
];

// Data syarat SKU Penggalang Ramu (30 syarat)
export const SKU_PENGGALANG_RAMU: (string | SyaratSKU)[] = [
    "Selalu taat menjalankan ibadah agamanya secara pribadi ataupun berjamaah",
    "Dapat mengetahui dan menjelaskan hari-hari besar agamanya",
    "Dapat menyebutkan agama-agama yang ada di Indonesia serta nama tempat ibadahnya",
    {
        text: "Syarat Keagamaan (pilih sesuai agama peserta)",
        subItems: [
            {
                label: "Islam",
                items: [
                    "Dapat melakukan mandi wajib dan mengerti penyebabnya",
                    "Dapat melakukan sholat berjamaah",
                    "Dapat menghafal 5 macam doa harian dan 5 macam surat-surat pendek"
                ]
            },
            {
                label: "Katolik",
                items: [
                    "Dapat berdoa Rosario, dan tahu artinya",
                    "Telah mengikuti Misa Kudus dan menjadi putera altar dan dapat menghias altar",
                    "Dapat menyanyikan tiga macam lagu Gerejani"
                ]
            },
            {
                label: "Protestan",
                items: [
                    "Dapat menyanyikan beberapa nyanyian Gereja",
                    "Dapat menceritakan dua macam hikayat dari Alkitab",
                    "Dapat melakukan doa sederhana pada kesempatan tertentu",
                    "Dapat menyebutkan hari-hari Raya Kristiani"
                ]
            },
            {
                label: "Hindu",
                items: [
                    "Dapat melafalkan dan mengerti arti dari bait masing-masing mantram Puja Tri Sandhya dan melaksanakannya/praktik dalam kehidupan sehari-hari",
                    "Dapat menyebutkan nama-nama para Maha Rsi penerima Wahyu",
                    "Dapat menyebutkan nama-nama pura dalam cakupan Sad Kahyangan",
                    "Dapat menyebutkan tokoh-tokoh dalam epos cerita Mahabharata dan Ramayana",
                    "Dapat menguraikan arti dan makna kata Tatwamsi",
                    "Dapat menguraikan dan menjelaskan fase kehidupan dalam ajaran Catur Asrama",
                    "Dapat mempraktikkan satu gerakan Yoga Asanas"
                ]
            },
            {
                label: "Buddha",
                items: [
                    "Dapat menjelaskan arti,makna simbol yang terdapat di Altar Buddha",
                    "Dapat menyanyikan lagu Pancasila Buddhis",
                    "Dapat melakukan dana paramita"
                ]
            }
        ]
    },
    "Dapat menjelaskan tentang emosi",
    "Dapat menyampaikan pendapat dengan baik dalam suatu pertemuan Pasukan Penggalang",
    "Dapat mengetahui dan menjelaskan manfaat dari penghijauan",
    "Dapat mengetahui dan memahami tentang hak perlindungan anak",
    "Ikut serta dalam kegiatan Perkemahan Penggalang sedikitnya 2 hari, sesuai dengan standar perkemahan",
    "Dapat menyebutkan tanda-tanda pengenal Gerakan Pramuka sesuai dengan golongan dan tingkatannya",
    "Mengetahui nama Ketua RT hingga lurah atau setingkatnya di tempat tinggalnya",
    "Dapat mengetahui dan menyebutkan Kode Kehormatan Pramuka Penggalang",
    "Rajin dan giat mengikuti latihan Pasukan Penggalang sekurang-kurangnya 8 kali latihan berturut-turut",
    "Tahu tentang Salam Pramuka, Motto dan tahu arti Lambang Gerakan Pramuka",
    "Dapat menjelaskan sejarah dan kiasan warna serta cara menggunakan bendera merah putih",
    "Dapat menjelaskan dan menyanyikan lagu Kebangsaan Indonesia Raya dengan sikap yang benar serta dapat menyanyikan 2 lagu wajib nasional dan 1 lagu daerah nusantara",
    "Dapat menjelaskan tentang lambang negara RI",
    "Dapat menggunakan Bahasa Indonesia yang baik dan benar",
    "Telah menabung secara rutin dan setia membayar uang iuran untuk regunya yang diperoleh dari usahanya sendiri",
    "Dapat menyebutkan dan menjelaskan manfaat sedikitnya 2 jenis alat teknologi informasi modern",
    "Mengenal dan memilah sampah",
    "Dapat menjelaskan teknik penjernihan air",
    "Dapat membuat dan menggunakan simpul mati, simpul hidup, simpul anyam, simpul tinag, simpul pangkal dan dapat menyusuk tali, emmbuai ikatan serta menyambung dua tongkat",
    "Dapat menjelaskan kompas, menaksir tinggi dan lebar",
    "Mengenal macam-macam sandi, syarat morse dan semaphore",
    "Selalu berpakaian rapih, memelihara kesehatan dan kebersihan diri serta lingkungannya",
    "Dapat baris-berbaris",
    "Dapat menjelaskan sedikitnya 3 cabang olah raga dan dapat melakukan 2 jenis cabang olah raga, salah satunya olah raga Renang",
    "Mengetahui adanya perbedaan fisik tubuh",
    "Selalu melakukan aktifitas fisik tiap hari sedikitnya 30 menit"
];

export const SKU_CONFIG = {
    siaga_mula: {
        nama: "SKU Siaga Mula",
        jumlah_syarat: 34,
        syarat: SKU_SIAGA_MULA,
        golongan: "Siaga"
    },
    siaga_bantu: {
        nama: "SKU Siaga Bantu",
        jumlah_syarat: 33,
        syarat: SKU_SIAGA_BANTU,
        golongan: "Siaga"
    },
    siaga_tata: {
        nama: "SKU Siaga Tata",
        jumlah_syarat: 33,
        syarat: SKU_SIAGA_TATA,
        golongan: "Siaga"
    },
    penggalang_ramu: {
        nama: "SKU Penggalang Ramu",
        jumlah_syarat: 30,
        syarat: SKU_PENGGALANG_RAMU,
        golongan: "Penggalang"
    }
};

export type JenisSKU = keyof typeof SKU_CONFIG;

// Helper function untuk mendapatkan text dari syarat
export function getSyaratText(syarat: string | SyaratSKU): string {
    return typeof syarat === 'string' ? syarat : syarat.text;
}

// Helper function untuk cek apakah syarat punya sub-items
export function hasSyaratSubItems(syarat: string | SyaratSKU): syarat is SyaratSKU {
    return typeof syarat === 'object' && 'subItems' in syarat;
}

// Data TKK Siaga
export const TKK_SIAGA_WAJIB = [
    { id: "pppk", nama: "PPPK", icon: "🏥" },
    { id: "pengatur_ruangan", nama: "Pengatur Ruangan", icon: "🏠" },
    { id: "pengamat", nama: "Pengamat", icon: "👁️" },
    { id: "juru_masak", nama: "Juru Masak", icon: "🍳" },
    { id: "berkemah", nama: "Berkemah", icon: "⛺" },
    { id: "penabung", nama: "Penabung", icon: "💰" },
    { id: "penjahit", nama: "Penjahit", icon: "🧵" },
    { id: "juru_kebun", nama: "Juru Kebun", icon: "🌱" },
    { id: "pengaman_kampung", nama: "Pengaman Kampung", icon: "🛡️" },
    { id: "gerak_jalan", nama: "Gerak Jalan", icon: "🚶" },
];

export const TKK_SIAGA_PILIHAN = [
    { id: "qori", nama: "Qori", icon: "📖" },
    { id: "sholat", nama: "Sholat", icon: "🕌" },
    { id: "muadzin", nama: "Muadzin", icon: "📢" },
    { id: "khotib", nama: "Khotib", icon: "🎤" },
    { id: "penyanyi", nama: "Penyanyi", icon: "🎵" },
    { id: "pelukis", nama: "Pelukis", icon: "🎨" },
    { id: "pengatur_meja_makan", nama: "Pengatur Meja Makan", icon: "🍽️" },
    { id: "pengarang", nama: "Pengarang", icon: "✍️" },
    { id: "dirigen", nama: "Dirigen", icon: "🎼" },
    { id: "juru_isyarat_bendera", nama: "Juru Isyarat Bendera", icon: "🚩" },
    { id: "pembaca", nama: "Pembaca", icon: "📚" },
    { id: "pengendara_sepeda", nama: "Pengendara Sepeda", icon: "🚲" },
    { id: "penghijauan", nama: "Penghijauan", icon: "🌳" },
    { id: "penyelidik", nama: "Penyelidik", icon: "🔍" },
    { id: "juru_anyam", nama: "Juru Anyam", icon: "🧺" },
    { id: "pencari_jejak", nama: "Pencari Jejak/Penjelajah", icon: "🧭" },
    { id: "pembantu_ibu", nama: "Pembantu Ibu", icon: "👩‍👧" },
    { id: "pengatur_lalu_lintas", nama: "Pengatur Lalu Lintas", icon: "🚦" },
    { id: "penangkap_ikan", nama: "Penangkap Ikan", icon: "🎣" },
    { id: "pengumpul", nama: "Pengumpul", icon: "📦" },
];

export interface TKKItem {
    id: string;
    nama: string;
    icon: string;
}
