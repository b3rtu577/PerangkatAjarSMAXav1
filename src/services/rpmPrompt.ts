import { IdentitasRPM } from '../types';

/**
 * Subject Domain Classifier
 */
export type SubjectDomain =
  | 'informatika'
  | 'keagamaan'
  | 'pjok'
  | 'seni-budaya'
  | 'sosial-humaniora'
  | 'math-sains'
  | 'bahasa'
  | 'umum';

export function isInformatikaSubject(mapel: string = ''): boolean {
  const m = String(mapel || '').trim().toLowerCase();
  return (
    m.includes('informatika') ||
    m.includes('koding') ||
    m.includes('coding') ||
    m.includes('pemrograman') ||
    m.includes('komputer') ||
    m.includes('ilmu komputer')
  );
}

export function getSubjectDomain(mapel: string = '', elemenKsp: string = ''): SubjectDomain {
  const m = String(mapel || '').trim().toLowerCase();
  const e = String(elemenKsp || '').trim().toLowerCase();
  const combined = `${m} ${e}`;

  if (isInformatikaSubject(m)) {
    return 'informatika';
  }

  // 1. Keagamaan
  if (
    combined.includes('agama') ||
    combined.includes('katolik') ||
    combined.includes('kristen') ||
    combined.includes('islam') ||
    combined.includes('hindu') ||
    combined.includes('buddha') ||
    combined.includes('khonghucu') ||
    combined.includes('teologi') ||
    combined.includes('fiqih') ||
    combined.includes('akidah') ||
    combined.includes('al-quran') ||
    combined.includes('budi pekerti')
  ) {
    return 'keagamaan';
  }

  // 2. PJOK / Olahraga
  if (
    combined.includes('pjok') ||
    combined.includes('olahraga') ||
    combined.includes('penjas') ||
    combined.includes('jasmani') ||
    combined.includes('penjasorkes')
  ) {
    return 'pjok';
  }

  // 3. Seni & Budaya
  if (
    combined.includes('seni') ||
    combined.includes('musik') ||
    combined.includes('rupa') ||
    combined.includes('tari') ||
    combined.includes('teater') ||
    combined.includes('budaya') ||
    combined.includes('prakarya') ||
    combined.includes('kewirausahaan') ||
    combined.includes('pkwu')
  ) {
    return 'seni-budaya';
  }

  // 4. Sosial & Humaniora
  if (
    combined.includes('ekonomi') ||
    combined.includes('geografi') ||
    combined.includes('sosiologi') ||
    combined.includes('sejarah') ||
    combined.includes('ppkn') ||
    combined.includes('pancasila') ||
    combined.includes('kewarganegaraan') ||
    combined.includes('antropologi') ||
    combined.includes('ips') ||
    combined.includes('akuntansi') ||
    combined.includes('pkn')
  ) {
    return 'sosial-humaniora';
  }

  // 5. Sains & Eksakta
  if (
    combined.includes('matematika') ||
    combined.includes('fisika') ||
    combined.includes('kimia') ||
    combined.includes('biologi') ||
    combined.includes('ipa') ||
    combined.includes('sains') ||
    combined.includes('astronomi')
  ) {
    return 'math-sains';
  }

  // 6. Bahasa & Sastra
  if (
    combined.includes('bahasa') ||
    combined.includes('indonesia') ||
    combined.includes('inggris') ||
    combined.includes('english') ||
    combined.includes('mandarin') ||
    combined.includes('jepang') ||
    combined.includes('jerman') ||
    combined.includes('prancis') ||
    combined.includes('arab') ||
    combined.includes('sastra') ||
    combined.includes('literasi')
  ) {
    return 'bahasa';
  }

  return 'umum';
}

export type SubjectMode = 'koding-pseudocode' | 'deskriptif-non-koding';

export function getSubjectAndElementMode(
  mapel: string = '',
  elemenKsp: string = '',
  topik: string = '',
  cp: string = ''
): SubjectMode {
  const isMapelInformatika = isInformatikaSubject(mapel);
  const combinedElemenTopik = `${elemenKsp} ${topik} ${cp}`.toLowerCase();

  const containsCodingKeywords =
    combinedElemenTopik.includes('pemrograman') ||
    combinedElemenTopik.includes('algoritma') ||
    combinedElemenTopik.includes('koding') ||
    combinedElemenTopik.includes('coding') ||
    /\bap\b/i.test(elemenKsp) ||
    elemenKsp.toUpperCase().includes('AP');

  if (isMapelInformatika && containsCodingKeywords) {
    return 'koding-pseudocode';
  }

  return 'deskriptif-non-koding';
}

/**
 * Returns customized prompt rules based on the subject domain
 */
export function buildSubjectSystemRuleText(
  mapel: string = '',
  elemenKsp: string = '',
  topik: string = '',
  cp: string = ''
): string {
  const isInfo = isInformatikaSubject(mapel);
  const domain = getSubjectDomain(mapel, elemenKsp);
  const mode = getSubjectAndElementMode(mapel, elemenKsp, topik, cp);

  if (isInfo && mode === 'koding-pseudocode') {
    return `================================================================================
[SYSTEM RULE: DOMAIN INFORMATIKA (KODING & ALGORITMA)]
- MATA PELAJARAN: ${mapel}
- MODE: PEMROGRAMAN & LOGIKA KOMPUTASI
- TERMINOLOGI WAJIB: "logika komputasi", "notasi algoritma", "struktur kontrol / pseudocode", "pengujian solusi"
- HEADER BAGIAN C & F: "💻 Notasi Logika, Algoritma & Pseudocode:"
- FITUR DIAKTIFKAN:
  1. Notasi Algoritma Pseudocode / Diagram Alir Program / Trace Table (Dry-Run Test).
  2. Struktur Logika Kontrol (Percabangan IF-THEN-ELSE / Perulangan LOOP).
  3. Konsep komputasional murni sesuai bidang Informatika.`;
  }

  let domainSpecificGuideline = '';
  if (domain === 'keagamaan') {
    domainSpecificGuideline = `- DOMAIN SPESIFIK: PENDIDIKAN AGAMA & BUDI PEKERTI (${mapel.toUpperCase()})
  1. TERMINOLOGI & PEDAGOGI WAJIB:
     * Wajib gunakan istilah: "refleksi iman/spiritual", "pemaknaan teks kitab suci/ajaran", "penerapan nilai moral dalam kehidupan", "aksi nyata".
  2. Header Bagian C & F: "📌 Kerangka Konsep & Alur Analisis:"
  3. Aktivitas LKPD: Refleksi Teks Ajaran/Kitab Suci, Analisis Kasus Moral & Etika Kehidupan, Perancangan Komitmen Aksi Nyata.
  4. Taksonomi Rubrik: Kedalaman Refleksi Spiritual, Pemaknaan Ajaran Moral, Keterkaitan Kasus Nyata, Komitmen Aksi Nyata.`;
  } else if (domain === 'pjok') {
    domainSpecificGuideline = `- DOMAIN SPESIFIK: PENDIDIKAN JASMANI, OLAHRAGA & KESEHATAN (PJOK)
  1. TERMINOLOGI & PEDAGOGI WAJIB:
     * Wajib gunakan istilah: "praktik pola gerak", "kebugaran jasmani", "sportivitas", "analisis taktik/teknik permainan", "pola hidup sehat".
  2. Header Bagian C & F: "📌 Kerangka Konsep & Alur Analisis:"
  3. Aktivitas LKPD: Analisis Biomekanika & Pola Gerak, Evaluasi Taktik/Strategi Permainan, Perancangan Program Kebugaran & Gaya Hidup Sehat.
  4. Taksonomi Rubrik: Penguasaan Pola Gerak, Analisis Taktik/Teknik, Penerapan Nilai Sportivitas & Kerjasama, Pembiasaan Pola Hidup Sehat.`;
  } else if (domain === 'seni-budaya') {
    domainSpecificGuideline = `- DOMAIN SPESIFIK: SENI & BUDAYA / PRAKARYA & KEWIRAUSAHAAN (${mapel.toUpperCase()})
  1. TERMINOLOGI & PEDAGOGI WAJIB:
     * Wajib gunakan istilah: "apresiasi seni", "eksplorasi medium/teknik", "ekspresi artistik", "penciptaan karya", "refleksi estetik".
  2. Header Bagian C & F: "📌 Kerangka Konsep & Alur Analisis:"
  3. Aktivitas LKPD: Apresiasi & Analisis Karya, Eksplorasi Alat/Bahan/Medium, Perancangan Konsep Karya Artistik, Evaluasi Nilai Estetik.
  4. Taksonomi Rubrik: Kreativitas Ekspresi Artistik, Penguasaan Teknik & Medium, Keunikan Gagasan/Karya, Kedalaman Refleksi Estetik.`;
  } else if (domain === 'sosial-humaniora') {
    domainSpecificGuideline = `- DOMAIN SPESIFIK: ILMU SOSIAL & HUMANIORA (SOSIOLOGI/EKONOMI/GEOGRAFI/SEJARAH/PPKN)
  1. TERMINOLOGI & PEDAGOGI WAJIB:
     * Wajib gunakan istilah: "analisis fenomena sosial/ekonomi", "studi kasus kontekstual", "kajian kritis masyarakat", "literasi finansial/kewarganegaraan".
  2. Header Bagian C & F: "📌 Kerangka Konsep & Alur Analisis:"
  3. Aktivitas LKPD: Analisis Data Fenomena Empiris, Pemetaan Faktor Sebab-Akibat, Kajian Kritis Isu Masyarakat, Perumusan Rekomendasi Solusi Kebijakan.
  4. Taksonomi Rubrik: Kedalaman Analisis Fenomena, Ketajaman Argumentasi Kritis, Relevansi Data & Fakta, Keandalan Solusi Kontekstual.`;
  } else if (domain === 'math-sains') {
    domainSpecificGuideline = `- DOMAIN SPESIFIK: SAINS & EKSAKTA (MATEMATIKA/FISIKA/KIMIA/BIOLOGI/IPA)
  1. TERMINOLOGI & PEDAGOGI WAJIB:
     * Wajib gunakan istilah: "metode ilmiah", "observasi/eksperimen", "formulasi pemecahan masalah", "pemodelan fenomena alam".
  2. Header Bagian C & F: "📌 Kerangka Konsep & Alur Analisis:"
  3. Aktivitas LKPD: Observasi & Eksperimen Ilmiah, Formulasi Rumus/Persamaan Matematis, Pemodelan Data Empiris, Analisis Grafik/Hasil Pengamatan.
  4. Taksonomi Rubrik: Ketepatan Formulasi Matematis/Ilmiah, Penalaran Logis Berbasis Metode Ilmiah, Langkah Pemecahan Masalah, Akurasi Perhitungan/Validasi.`;
  } else if (domain === 'bahasa') {
    domainSpecificGuideline = `- DOMAIN SPESIFIK: BAHASA & SASTRA (BAHASA INDONESIA / INGGRIS / ASING)
  1. TERMINOLOGI & PEDAGOGI WAJIB:
     * Wajib gunakan istilah: "struktur teks", "kaidah kebahasaan", "konstruksi makna", "produksi wacana/tulisan", "komunikasi lisan".
  2. Header Bagian C & F: "📌 Kerangka Konsep & Alur Analisis:"
  3. Aktivitas LKPD: Dekonstruksi Struktur Teks, Evaluasi Kaidah Kebahasaan, Rekonstruksi Makna Wacana, Produksi Tulisan/Komunikasi Lisan.
  4. Taksonomi Rubrik: Struktur Teks, Kaidah Kebahasaan & Diksi, Kedalaman Gagasan/Ide, Koherensi & Kohesi Paragraf.`;
  } else {
    domainSpecificGuideline = `- DOMAIN SPESIFIK: ${domain.toUpperCase()} (DESKRIPTIF & TERAPAN)
  1. TERMINOLOGI & PEDAGOGI WAJIB:
     * Gunakan istilah kerangka konseptual keilmuan yang relevan dan aplikatif.
  2. Header Bagian C & F: "📌 Kerangka Konsep & Alur Analisis:"
  3. Aktivitas LKPD: Analisis Fenomena, Eksplorasi Praktik Terapan, Perancangan Solusi Nyata.
  4. Taksonomi Rubrik: Penguasaan Konsep Dasar, Keterampilan Analisis Prosedural, Penerapan Solusi Kontekstual.`;
  }

  return `================================================================================
[PATCH SYSTEM PROMPT - ENGINE V2.1: UNIVERSAL RPM GENERATOR FOR ALL HIGH SCHOOL SUBJECTS]
- MATA PELAJARAN: "${mapel}"
- ELEMEN KSP / BIDANG: "${elemenKsp || 'Standar Kurikulum'}"
- TOPIK / SUB-MATERI: "${topik}"
- CAPAIAN PEMBELAJARAN (CP): "${cp}"

================================================================================
1. STRIPPING HTML TAGS (WAJIB BEBAS TAG HTML MENTAH)
================================================================================
DILARANG KERAS menghasilkan tag HTML mentah seperti <td colspan=3/>, <tr>, <td>, <p>, <br>, <hr>, dsb.
Gunakan garis pembatas Markdown standar (---) atau pemisah paragraf baru untuk memisahkan bagian.

================================================================================
2. MAPEL-SPECIFIC ACTIVITY PHRASING (DESKRIPSI AKTIVITAS SISWA - KEGIATAN INTI)
================================================================================
Dalam Deskripsi Aktivitas Siswa pada Kegiatan Inti, sesuaikan klausa kegiatan wajib dengan karakteristik ${mapel}:
- JIKA [MATA_PELAJARAN] == "Bahasa Indonesia" (atau rumpun Bahasa & Sastra):
  Wajib gunakan klausa: "...menganalisis struktur wacana, merumuskan gagasan..."
- JIKA [MATA_PELAJARAN] == "Biologi" / IPA / Sains / Fisika / Kimia:
  Wajib gunakan klausa: "...menganalisis data observasi ekosistem/gejala alam, merumuskan hipotesis..."
- JIKA Mapel Lain (Sosial / Seni / PJOK / Agama / Prakarya / Umum):
  Wajib gunakan klausa: "...menganalisis materi/studi kasus, merumuskan gagasan..."
- JIKA Mata Pelajaran adalah Informatika/Komputer/Coding:
  Wajib gunakan klausa: "...merumuskan alur algoritma/solusi terstruktur..."

================================================================================
3. TYPO & FORMAT SANITIZATION
================================================================================
- Bersihkan penulisan gelar akademik dari titik ganda (contoh: "S.T.P." bukan "S..T.P", "S.Pd." bukan "S..Pd", "M.Pd." bukan "M..Pd").
- Lakukan validasi ejaan pada kata kontekstual (contoh: "pertanian" bukan "pertaian", "pembelajaran" bukan "pembelajran", "perancangan" bukan "perancanagan").

================================================================================
4. ATURAN PENYESUAIAN PEDAGOGI & TERMINOLOGI DOMAIN
================================================================================
Sesuaikan SELURUH kata kerja operasional, contoh kasus, dan jargon kegiatan 100% sesuai dengan karakter keilmuan ${mapel}:
${domainSpecificGuideline}

================================================================================
5. ATURAN HEADERS (BAGIAN C & BAGIAN F)
================================================================================
Atur header penjelas pada Bagian C (Materi Pelajaran) dan Bagian F (Bahan Ajar Eksploratif) secara dinamis:
- Jika Mata Pelajaran adalah Informatika/Komputer/Coding:
  Header: "💻 Notasi Logika, Algoritma & Pseudocode:"
- Jika Mata Pelajaran LAINNYA (Semua mapel non-komputer):
  Header: "📌 Kerangka Konsep & Alur Analisis:"

================================================================================
6. STRICT ISOLATION RULE (PEMBERSIHAN PERMANEN DARI JARGON KOMPUTER)
================================================================================
KECUALI Mata Pelajaran secara eksplisit memuat kata "Informatika" atau "Komputer", DILARANG KERAS mengeluarkan kata/frasa berikut di bagian dokumen apa pun:
- "Dampak Sosial Informatika"
- "Algoritma" / "Pseudocode"
- "Notasi Logika"
- "Snippet Kode" / "Pemrograman"
- "Inisialisasi Parameter" / "Variabel Input-Output Program"

================================================================================
7. FORMAT METADATA IDENTITAS
================================================================================
Gunakan format bersih: "Kelas {KELAS} / {FASE} / Semester {SEMESTER}"
(Contoh: "Kelas X / Fase E / Semester Ganjil" - Jangan mengulang kata Fase dua kali).`;
}

/**
 * Utility to format clean metadata string: "Kelas {KELAS} / Fase {FASE} / Semester {SEMESTER}"
 * Handles raw inputs like "Kelas X / Fase E", "Fase E (Kelas X)", "X", etc. without repeating words.
 */
export function formatCleanKelasFaseSemester(kelasInput: string = '', semesterInput: string = 'Ganjil'): string {
  const raw = String(kelasInput || '').trim();
  if (!raw) return `Kelas X / Fase E / Semester ${semesterInput || 'Ganjil'}`;

  // Extract Kelas (e.g. X, XI, XII, 10, 11, 12)
  let extractedKelas = '';
  const kelasMatch = raw.match(/\b(X|XI|XII|10|11|12)\b/i);
  if (kelasMatch) {
    extractedKelas = kelasMatch[1].toUpperCase();
    if (extractedKelas === '10') extractedKelas = 'X';
    if (extractedKelas === '11') extractedKelas = 'XI';
    if (extractedKelas === '12') extractedKelas = 'XII';
  } else {
    extractedKelas = 'X';
  }

  // Extract Fase (e.g. E, F)
  let extractedFase = '';
  const faseMatch = raw.match(/Fase\s*([E-F])/i) || raw.match(/\b([E-F])\b/i);
  if (faseMatch) {
    extractedFase = faseMatch[1].toUpperCase();
  } else {
    extractedFase = extractedKelas === 'X' ? 'E' : 'F';
  }

  const cleanSemester = String(semesterInput || 'Ganjil').trim();
  const semStr = cleanSemester.toLowerCase().includes('genap') ? 'Semester Genap' : 'Semester Ganjil';

  return `Kelas ${extractedKelas} / Fase ${extractedFase} / ${semStr}`;
}

/**
 * AI Prompt Builder with FULL DYNAMIC SUBJECT ADAPTATION FOR ALL 5 GENERATORS
 */
export function buildUniversalCtPrompt(docType: string, metadata: Partial<IdentitasRPM>): string {
  const {
    sekolah = 'SMA Xaverius 1 Palembang',
    guru = 'Norbertus Suryadi, S.Kom.',
    nipGuru = '-',
    kepalaSekolah = '-',
    nipKepalaSekolah = '-',
    mataPelajaran = 'Informatika',
    kelas = 'Kelas XI / Fase F',
    topik = 'Konsep dan Penerapan Materi',
    jumlahPertemuan = '2',
    alokasiWaktu = '2 x 40 Menit',
    cp = 'Peserta didik mampu memahami, menganalisis, dan memecahkan persoalan secara kritis dan mendalam.',
    modelPembelajaran = 'Problem Based Learning (PBL) & Deep Learning',
    elemenKsp = ''
  } = metadata;

  const numPertemuan = Math.max(1, parseInt(String(jumlahPertemuan || '2'), 10) || 2);
  const isInfo = isInformatikaSubject(mataPelajaran);
  const domain = getSubjectDomain(mataPelajaran, elemenKsp);
  const mode = getSubjectAndElementMode(mataPelajaran, elemenKsp, topik, cp);
  const isKoding = isInfo && mode === 'koding-pseudocode';
  const subjectRuleText = buildSubjectSystemRuleText(mataPelajaran, elemenKsp, topik, cp);

  // Label Box Notasi / Formulasi dinamis per domain
  const notationBoxLabel = isKoding
    ? '💻 Formulasi Notasi Pseudocode / Trace Table Logika'
    : domain === 'math-sains'
    ? '📐 Formulasi & Prosedur Matematis/Ilmiah'
    : '📝 Kerangka Konsep & Alur Analisis';

  // 1. GENERATOR RPM
  if (docType === 'rpm') {
    return `Anda adalah Pakar Kurikulum Merdeka dan Desainer Instruksional Berbasis Pembelajaran Mendalam (Deep Learning).
Buatkan dokumen RPM (Rancangan Pembelajaran Merdeka) LENGKAP, MENDALAM, DAN SIAP PAKAI BERSKALA BUKU TEKS AJAR SEKOLAH dalam format JSON murni.

================================================================================
METADATA INPUT USER (WAJIB DIINJEKSI DAN DIGUNAKAN SECARA KONSISTEN):
- Satuan Pendidikan: ${sekolah}
- Guru Pengampu: ${guru} (NIY: ${nipGuru})
- Kepala Sekolah: ${kepalaSekolah} (NIY: ${nipKepalaSekolah})
- MATA PELAJARAN: ${mataPelajaran}
- ELEMEN KSP / BIDANG: ${elemenKsp || 'Standar Kurikulum'}
- KELAS / FASE: ${kelas}
- TOPIK / SUB-MATERI: "${topik}"
- CAPAIAN PEMBELAJARAN (CP): "${cp}"
- Jumlah Pertemuan: ${numPertemuan} Pertemuan
- Total Alokasi Waktu: ${alokasiWaktu}
- Model Pembelajaran: ${modelPembelajaran}

${subjectRuleText}

================================================================================
INSTRUKSI KHUSUS PEMBAGIAN ALUR PERTEMUAN (DYNAMIC ARRAY TEPAT ${numPertemuan} PERTEMUAN):
================================================================================
- Buat array \`pertemuanList\` DENGAN PANJANG PATEN TEPAT ${numPertemuan} ELEMEN.
- Setiap sesi (Pertemuan 1 hingga Pertemuan ${numPertemuan}) WAJIB memiliki \`subTopik\`, \`indikatorATP\`, dan \`bahanAjar\` yang berjenjang dan fokus pada topik "${topik}" mata pelajaran ${mataPelajaran}.
- Box Formulasi / Analisis: Wajib menyajikan "${notationBoxLabel}" yang relevan dengan ${mataPelajaran}.
- DILARANG melakukan copy-paste antar pertemuan.

PERSYARATAN STRUKTUR JSON DOKUMEN RPM:
{
  "docType": "rpm",
  "identitas": {
    "sekolah": "${sekolah}",
    "guru": "${guru}",
    "nipGuru": "${nipGuru}",
    "kepalaSekolah": "${kepalaSekolah}",
    "nipKepalaSekolah": "${nipKepalaSekolah}",
    "mataPelajaran": "${mataPelajaran}",
    "elemenKsp": "${elemenKsp || ''}",
    "kelas": "${kelas}",
    "topik": "${topik}",
    "jumlahPertemuan": "${numPertemuan}",
    "alokasiWaktu": "${alokasiWaktu}",
    "cp": "${cp}",
    "modelPembelajaran": "${modelPembelajaran}"
  },
  "capaianPembelajaran": "${cp}",
  "alurTujuanPembelajaran": [
    // Array TEPAT ${numPertemuan} objek ATP berjenjang
    {
      "kodeTp": "TP 10.1",
      "tujuanPembelajaran": "Tujuan Pembelajaran Pertemuan 1 yang kontekstual dan terukur pada mata pelajaran ${mataPelajaran} materi ${topik}...",
      "indikatorKetercapaian": [
        "1. Mengidentifikasi variabel dan struktur konsep ${topik}...",
        "2. Menganalisis hubungan antar-unsur dan merumuskan solusi...",
        "3. Memvalidasi hasil pemecahan masalah secara terstruktur..."
      ],
      "alokasiWaktuJp": "2 JP (80 Menit)",
      "pertemuanKe": 1,
      "fokusMateri": "Fokus Materi Pertemuan 1 terkait ${topik}",
      "korelasiDokumen": {
        "lkpd": "Aktivitas LKPD 1 (${topik})",
        "moodle": "Modul LMS Sesi 1 (${topik})",
        "asesmen": "Asesmen Formatif P1 (${topik})"
      }
    }
  ],
  "ringkasanMateri": [
    // Array TEPAT ${numPertemuan} objek BAHAN AJAR LENGKAP berbobot tinggi
    {
      "pertemuanKe": 1,
      "topikMateri": "Bahan Ajar Pertemuan 1: ${topik} (${mataPelajaran})",
      "konsepKunci": [
        "1. Definisi & Struktur Utama: Konsep fundamental...",
        "2. Karakteristik & Relasi Kunci: Keteraturan antar-variabel...",
        "3. Penerapan Kontekstual: Solusi masalah ${topik}..."
      ],
      "rangkumanTeori": "Uraian materi teoritis yang UTUH, LENGKAP, komprehensif, dan mendalam (2-3 paragraf berbobot tanpa singkatan dll/dsb) khusus materi ${topik} mata pelajaran ${mataPelajaran}.",
      "contohNotasi": "${notationBoxLabel}: Uraian prosedur terstruktur, rumus/penurunan ilmiah, atau bagan naratif langkah penyelesaian masalah ${topik}.",
      "studiKasusKontekstual": "Studi kasus kontekstual nyata dunia nyata terkait topik ${topik} (${mataPelajaran}).",
      "tipsRefleksi": "Panduan refleksi metakognitif bagi siswa."
    }
  ],
  "tujuanPembelajaran": [
    "Tujuan Pembelajaran lengkap berbasis taksonomi Bloom C4-C6 untuk mata pelajaran ${mataPelajaran} materi ${topik}..."
  ],
  "pemahamanBermakna": "Penjelasan konseptual mendalam urgensi topik ${topik} dalam kehidupan nyata peserta didik.",
  "pertanyaanPemantik": [
    "Pertanyaan HOTS 1 terkait ${topik}...",
    "Pertanyaan HOTS 2 terkait ${topik}..."
  ],
  "pertemuanList": [
    // Array TEPAT ${numPertemuan} objek pertemuan
    {
      "pertemuanKe": 1,
      "subTopik": "${topik} — Sesi 1",
      "alokasiWaktu": "80 Menit",
      "praktikPedagogis": "${modelPembelajaran}",
      "indikatorATP": [
        "1. Mengidentifikasi variabel materi ${topik}...",
        "2. Merancang prosedur penyelesaian masalah..."
      ],
      "bahanAjar": {
        "konsepUtama": "Uraian mendalam konsep teoretis sesi 1...",
        "studiKasus": "Studi kasus kontekstual nyata untuk sesi 1...",
        "rangkumanTeori": "Uraian komprehensif teori sesi 1...",
        "contohNotasi": "${notationBoxLabel}: Uraian prosedur terstruktur atau rumus ilmiah sesi 1..."
      },
      "kegiatanPembelajaran": {
        "kegiatanAwal": [
          "1. Guru menyapa peserta didik, berdoa, dan mengecek presensi.",
          "2. Memberikan apersepsi kontekstual dan pertanyaan pemantik terkait ${topik}."
        ],
        "kegiatanInti": [
          "1. Menyajikan studi kasus kontekstual ${topik} berbasis Deep Learning.",
          "2. Membagi kelompok dan membagikan Lembar Kerja Peserta Didik (LKPD).",
          "3. Membimbing penyelidikan dan analisis pemecahan masalah.",
          "4. Mengarahkan presentasi dan diskusi tanya jawab antarkelompok."
        ],
        "kegiatanPenutup": [
          "1. Bersama siswa merumuskan kesimpulan pembelajaran ${topik}.",
          "2. Mengarahkan pengunggahan LKPD ke LMS Moodle dan refleksi diri."
        ]
      },
      "lkpdFocus": "Aktivitas LKPD 1: Penyelidikan Masalah ${topik}"
    }
  ],
  "asesmenRencana": {
    "awal": "Tes Diagnostik Kognitif (5 Soal Pilihan Ganda Prasyarat terkait ${topik}).",
    "proses": "Asesmen Formatif (Aktivitas H5P di LMS Moodle & Lembar Observasi Unjuk Kerja LKPD).",
    "akhir": "Asesmen Sumatif Terpadu (5 Butir Soal PG Kompleks Bobot 40% & 2 Butir Soal Essay HOTS Bobot 60%)."
  },
  "pengayaanRemedial": {
    "pengayaan": "Peserta didik yang telah mencapai KKTP diberikan tantangan eksplorasi kasus analitis mendalam terkait ${topik}.",
    "remedial": "Bimbingan terfokus secara perorangan/kelompok kecil pada indikator yang belum dikuasai."
  }
}
Kembalikan HANYA JSON valid tanpa teks di luar JSON.`;
  }

  // 2. GENERATOR LKPD
  if (docType === 'lkpd') {
    const lkpdJudul = isInfo
      ? `LEMBAR KERJA PESERTA DIDIK (LKPD) - INFORMATIKA`
      : `LEMBAR KERJA PESERTA DIDIK (LKPD) - ${mataPelajaran.toUpperCase()}`;

    // Tabel Isian Komponen LKPD disesuaikan dengan domain mapel
    let tabelIsianExample = '';
    if (isKoding) {
      tabelIsianExample = `[
        { "no": 1, "komponen": "1. Dekomposisi Masalah", "instruksiAnalisis": "Uraikan sub-masalah dan parameter masukan-luaran pada kasus ${topik}.", "ruangJawaban": "" },
        { "no": 2, "komponen": "2. Pengenalan Pola", "instruksiAnalisis": "Identifikasi relasi logika atau aturan berulang.", "ruangJawaban": "" },
        { "no": 3, "komponen": "3. Abstraksi & Pemodelan", "instruksiAnalisis": "Tentukan variabel penentu kunci dan eliminasi data non-esensial.", "ruangJawaban": "" },
        { "no": 4, "komponen": "4. Perancangan Algoritma", "instruksiAnalisis": "Tuliskan notasi pseudocode atau diagram alir solusi.", "ruangJawaban": "" }
      ]`;
    } else if (domain === 'math-sains') {
      tabelIsianExample = `[
        { "no": 1, "komponen": "1. Identifikasi Fakta & Variabel Kunci", "instruksiAnalisis": "Petakan besaran/parameter masukan, kondisi awal, dan data yang diketahui pada kasus ${topik}.", "ruangJawaban": "" },
        { "no": 2, "komponen": "2. Analisis Hubungan Sebab-Akibat & Rumus", "instruksiAnalisis": "Jelaskan relasi antar-variabel dan tentukan hukum/formula ilmiah yang berlaku.", "ruangJawaban": "" },
        { "no": 3, "komponen": "3. Pemodelan Matematis / Eksplorasi Sains", "instruksiAnalisis": "Susun persamaan, grafik, atau pemodelan ilmiah untuk memecahkan persoalan ${topik}.", "ruangJawaban": "" },
        { "no": 4, "komponen": "4. Prosedur & Langkah Solusi Terstruktur", "instruksiAnalisis": "Tuliskan langkah-langkah penyelesaian matematis/ilmiah secara terurut hingga luaran akhir.", "ruangJawaban": "" }
      ]`;
    } else if (domain === 'sosial-humaniora') {
      tabelIsianExample = `[
        { "no": 1, "komponen": "1. Identifikasi Fakta & Masalah Utama", "instruksiAnalisis": "Petakan fakta empiris, aktor terkait, dan isu kunci dari studi kasus ${topik}.", "ruangJawaban": "" },
        { "no": 2, "komponen": "2. Analisis Faktor Penyebab & Dampak", "instruksiAnalisis": "Analisis akar penyebab masalah dan proyeksikan dampaknya bagi masyarakat/ekonomi.", "ruangJawaban": "" },
        { "no": 3, "komponen": "3. Pemetaan Teori & Alternatif Solusi", "instruksiAnalisis": "Hubungkan kasus dengan konsep/teori ${mataPelajaran} dan formulasikan alternatif penyelesaian.", "ruangJawaban": "" },
        { "no": 4, "komponen": "4. Rencana Aksi Solusi Kontekstual", "instruksiAnalisis": "Susun langkah-langkah strategi implementasi solusi yang terukur dan realistis.", "ruangJawaban": "" }
      ]`;
    } else if (domain === 'bahasa') {
      tabelIsianExample = `[
        { "no": 1, "komponen": "1. Identifikasi Struktur & Unsur Teks", "instruksiAnalisis": "Bedah bagian-bagian pembangun teks dan petakan unsur-unsur pembentuknya pada materi ${topik}.", "ruangJawaban": "" },
        { "no": 2, "komponen": "2. Analisis Kaidah Kebahasaan & Makna", "instruksiAnalisis": "Identifikasi ciri kebahasaan, pilihan kata (diksi), dan makna tersurat/tersirat.", "ruangJawaban": "" },
        { "no": 3, "komponen": "3. Gagasan Pokok & Konteks Wacana", "instruksiAnalisis": "Rumuskan ide sentral dan evaluasi keterkaitan wacana dengan fenomena nyata.", "ruangJawaban": "" },
        { "no": 4, "komponen": "4. Sistematika Rekonstruksi / Produksi Karya", "instruksiAnalisis": "Susun kerangka atau rancangan karya/teks terstruktur sesuai kaidah ${mataPelajaran}.", "ruangJawaban": "" }
      ]`;
    } else {
      tabelIsianExample = `[
        { "no": 1, "komponen": "1. Identifikasi Elemen Dasar & Fenomena", "instruksiAnalisis": "Petakan kondisi awal dan komponen utama dari kasus ${topik}.", "ruangJawaban": "" },
        { "no": 2, "komponen": "2. Analisis Pola Hubungan & Mekanisme", "instruksiAnalisis": "Jelaskan keteraturan dan mekanisme kerja dari topik yang dipelajari.", "ruangJawaban": "" },
        { "no": 3, "komponen": "3. Fokus Prioritas Solusi", "instruksiAnalisis": "Tentukan aspek paling penting yang harus diselesaikan terlebih dahulu.", "ruangJawaban": "" },
        { "no": 4, "komponen": "4. Sistematika Prosedur Langkah Kerja", "instruksiAnalisis": "Tuliskan urutan tahapan kerja atau instruksi praktis secara terstruktur.", "ruangJawaban": "" }
      ]`;
    }

    return `Anda adalah Pakar Kurikulum Merdeka dan Pengembang LKPD Inovatif Berbasis Pembelajaran Mendalam (Deep Learning).
Buatkan dokumen LKPD (Lembar Kerja Peserta Didik) LENGKAP DAN SIAP PAKAI dalam format JSON murni.

================================================================================
INPUT METADATA (WAJIB DIGUNAKAN SECARA DINAMIS):
- Satuan Pendidikan: ${sekolah}
- MATA PELAJARAN: ${mataPelajaran}
- ELEMEN KSP / BIDANG: ${elemenKsp || 'Standar Kurikulum'}
- KELAS / FASE: ${kelas}
- TOPIK / SUB-MATERI: "${topik}"
- CAPAIAN PEMBELAJARAN (CP): "${cp}"
- Jumlah Pertemuan: ${numPertemuan} Pertemuan (Wajib membuat TEPAT ${numPertemuan} objek pertemuan di pertemuanList)
- Alokasi Waktu: ${alokasiWaktu}
- Model Pembelajaran: ${modelPembelajaran}

${subjectRuleText}

================================================================================
ATURAN KHUSUS LKPD:
- Judul Dokumen: "${lkpdJudul}"
- Instruksi Aktivitas: Menyesuaikan domain ${mataPelajaran} materi "${topik}".
${!isInfo ? '- DILARANG MEMINTA SISWA MEMBUAT PSEUDOCODE, CODING, ATAU FLOWCHART PROGRAM.' : ''}

Format JSON Output:
{
  "docType": "lkpd",
  "judul": "${lkpdJudul}",
  "subJudul": "${topik} — Pendekatan Pembelajaran Mendalam (Deep Learning)",
  "jumlahPertemuan": ${numPertemuan},
  "identitas": {
    "sekolah": "${sekolah}",
    "mataPelajaran": "${mataPelajaran}",
    "elemenKsp": "${elemenKsp || ''}",
    "kelas": "${kelas}",
    "topik": "${topik}",
    "waktu": "${alokasiWaktu}"
  },
  "pertemuanList": [
    // Array TEPAT ${numPertemuan} objek pertemuan LKPD
    {
      "pertemuanKe": 1,
      "waktu": "2 JP (80 Menit)",
      "subJudul": "Pertemuan 1: Penyelidikan & Pemecahan Masalah ${topik}",
      "tujuanAktivitas": [
        "Menganalisis fenomena dan memetakan variabel permasalahan kontekstual ${topik} (${mataPelajaran}).",
        "Merumuskan solusi terstruktur dan menyusun simpulan berbasis fakta."
      ],
      "petunjukPengerjaan": [
        "Cermati narasi stimulus studi kasus kontekstual ${topik} yang disajikan.",
        "Diskusikan pertanyaan penalaran kritis pada Kegiatan 1 bersama anggota kelompok.",
        "Lengkapi tabel kerja investigasi dan pemecahan masalah pada Kegiatan 2.",
        "Tarik kesimpulan bersama dan persiapkan diri untuk sesi presentasi unjuk kerja."
      ],
      "stimulusMaterial": "Narasi studi kasus kontekstual dunia nyata yang mendalam mengenai ${topik} pada bidang ${mataPelajaran}...",
      "kegiatan1Memahami": {
        "judul": "Kegiatan 1: Investigasi Masalah Kontekstual & Penalaran Kritis",
        "deskripsi": "Berdasarkan stimulus kasus ${topik} di atas, analisislah pertanyaan-pertanyaan mendalam berikut:",
        "pertanyaanHots": [
          "1. Pertanyaan analisis 1 terkait variabel kunci kasus ${topik}...",
          "2. Pertanyaan analisis 2 terkait faktor penyebab utama...",
          "3. Pertanyaan analisis 3 terkait dampak dan alternatif solusi...",
          "4. Pertanyaan analisis 4 terkait argumentasi efektivitas solusi..."
        ]
      },
      "kegiatan2Menerapkan": {
        "judul": "Kegiatan 2: Tabel Pengamatan & Sistematika Pemecahan Masalah",
        "instruksiTugas": "Lengkapi tabel analisis berikut dan susun sistematika solusi terstruktur untuk memecahkan persoalan ${topik}:",
        "tabelIsian": ${tabelIsianExample}
      },
      "aktivitasSiswa": [
        {
          "no": 1,
          "tugas": "${domain === 'math-sains' ? 'Pengujian & Verifikasi Model Perhitungan' : domain === 'sosial-humaniora' ? 'Simulasi Kebijakan & Uji Dampak Solusi' : domain === 'bahasa' ? 'Penyuntingan & Validasi Kualitas Teks' : isKoding ? 'Simulasi Dry-Run (Trace Table)' : 'Simulasi & Uji Penerapan Solusi'}",
          "instruksi": "Lakukan pengujian terhadap sistematika solusi dengan skenario kasus terapan pada materi ${topik}.",
          "ruangJawaban": ""
        }
      ],
      "pertanyaanDiskusi": [
        "Bagaimana efektivitas dan ketahanan rancangan solusi kelompok Anda jika diterapkan di lapangan?",
        "Refleksikan kendala apa yang paling menantang saat merumuskan solusi dan bagaimana cara mengatasinya?"
      ],
      "refleksiSiswa": "Refleksi metakognitif mengenai hal paling bermakna yang dipelajari dalam memecahkan masalah ${topik}.",
      "kesimpulan": "Kesimpulan komprehensif hasil penyelidikan dan perancangan solusi kelompok.",
      "rubrikSkor": [
        { "kriteria": "Ketajaman Analisis Masalah Kasus (Kegiatan 1)", "skorMaks": 30 },
        { "kriteria": "Kelengkapan & Akurasi Tabel Isian Solusi (Kegiatan 2)", "skorMaks": 40 },
        { "kriteria": "Kualitas Refleksi, Penarikan Kesimpulan & Kolaborasi", "skorMaks": 30 }
      ]
    }
  ]
}
Kembalikan HANYA JSON valid.`;
  }

  // 3. GENERATOR MOODLE
  if (docType === 'moodle') {
    const moodleHeaderLabel = isKoding
      ? '💻 Snippet Logika & Notasi Algoritma'
      : domain === 'math-sains'
      ? '📐 Formulasi Utama & Prosedur Matematis'
      : '📝 Framework Analisis & Kerangka Konsep';

    return `Anda adalah Pakar E-Learning Kurikulum Merdeka dan Integrator LMS Moodle.
Buatkan Panduan Desain Aktivitas Moodle / E-Learning terstruktur per pertemuan dalam format JSON murni.

================================================================================
INPUT METADATA (WAJIB DIGUNAKAN SECARA DINAMIS):
- Satuan Pendidikan: ${sekolah}
- MATA PELAJARAN: ${mataPelajaran}
- ELEMEN KSP / BIDANG: ${elemenKsp || 'Standar Kurikulum'}
- KELAS / FASE: ${kelas}
- TOPIK / MATERI: "${topik}"
- CAPAIAN PEMBELAJARAN (CP): "${cp}"
- Jumlah Pertemuan: ${numPertemuan} Sesi (Wajib menghasilkan TEPAT ${numPertemuan} elemen terpisah di array sesiElearning)
- Model Pembelajaran: ${modelPembelajaran}

${subjectRuleText}

================================================================================
ATURAN KHUSUS MOODLE:
1. Judul Sesi/Topic: "Bahan Ajar Pertemuan X: [Sub-Topik Spesifik ${topik}]"
   (DILARANG KERAS menggunakan judul "Integrasi Berpikir Komputasional dalam...").
2. Poin Konsep Kunci: Sesuaikan dengan domain ${mataPelajaran} (GANTI 4 Pilar CT menjadi: Struktur Konsep, Karakteristik Esensial, Teorema/Hukum Utama/Prinsip Kunci, dan Aplikasi Kasus Nyata).
3. Label Header / Bahan Ajar: Gunakan "${moodleHeaderLabel}".

Format JSON Output:
{
  "docType": "moodle",
  "identitas": {
    "sekolah": "${sekolah}",
    "mataPelajaran": "${mataPelajaran}",
    "elemenKsp": "${elemenKsp || ''}",
    "kelas": "${kelas}",
    "topik": "${topik}"
  },
  "namaAktivitas": "Panduan & Struktur Aktivitas LMS E-Learning: ${topik} (${mataPelajaran})",
  "platform": "Moodle LMS / Google Classroom",
  "deskripsiRingkas": "Panduan e-learning ${numPertemuan} sesi terintegrasi Kurikulum Merdeka dan Deep Learning pada materi ${topik}.",
  "jumlahPertemuan": ${numPertemuan},
  "sesiElearning": [
    {
      "pertemuanKe": 1,
      "namaSesi": "Bahan Ajar Pertemuan 1: Eksplorasi Konsep & Studi Kasus ${topik}",
      "jenisAktivitas": [
        "H5P Interaktif (${domain === 'math-sains' ? 'Drag & Drop Formulasi Rumus' : 'Drag & Drop Pemetaan Konsep'})",
        "Forum Diskusi Kelompok (Moodle Forum: Studi Kasus ${topik})",
        "Assignment Unggah LKPD Sesi 1 (PDF)"
      ],
      "formatPengumpulan": "Aktivitas H5P & Berkas PDF (Maksimal 5MB)",
      "tenggatWaktu": "H+3 Setelah Pertemuan 1 (Pukul 23.59 WIB)",
      "instruksi": [
        "Unduh dan pelajari slide materi serta studi kasus kontekstual ${topik}.",
        "Selesaikan modul interaktif H5P untuk menguji pemahaman konsep esensial.",
        "Diskusikan hasil analisis pemecahan masalah pada forum diskusi kelompok LMS Moodle.",
        "Unggah lembar kerja LKPD P1 kelompok yang telah lengkap ke portal assignment."
      ],
      "bahanSupport": ["Slide Materi PDF (${topik})", "Template LKPD P1", "Modul Interaktif H5P"]
    }
  ],
  "kriteriaKeberhasilan": [
    "Aktif berpartisipasi dalam forum diskusi kelompok dengan argumen kritis terkait ${topik}.",
    "Menyelesaikan modul interaktif H5P dan mengunggah berkas LKPD tepat waktu.",
    "Mencapai skor ketuntasan pada kuis evaluasi formatif Moodle."
  ],
  "petunjukPenilaian": "Penilaian berbasis rubrik keaktifan forum, ketuntasan modul interaktif H5P, dan ketepatan analisis pada LKPD.",
  "footer": "CopyRight©Norbertus Suryadi — ${sekolah} | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning"
}
Kembalikan HANYA JSON valid.`;
  }

  // 4. GENERATOR ASESMEN
  if (docType === 'asesmen') {
    return `Buatkan Instrumen Asesmen & Evaluasi Pembelajaran Kurikulum Merdeka LENGKAP dalam format JSON murni.
MATA PELAJARAN: ${mataPelajaran}
ELEMEN KSP / BIDANG: ${elemenKsp || 'Standar Kurikulum'}
KELAS / FASE: ${kelas}
TOPIK / SUB-MATERI: "${topik}"
CAPAIAN PEMBELAJARAN (CP): "${cp}"
SEKOLAH: ${sekolah}

${subjectRuleText}

================================================================================
ATURAN KHUSUS ASESMEN:
- Seluruh soal (Diagnostik, Formatif, dan Sumatif) HARUS MURNI MENGUJI INDIKATOR ${topik} PADA MATA PELAJARAN ${mataPelajaran.toUpperCase()}.
${!isInfo ? '- DILARANG KERAS menyisipkan soal seputar koding, komputasi, flowchart program, atau dampak sosial teknologi pada mapel non-Informatika.' : ''}

Dokumen ini WAJIB memuat 4 BAGIAN LENGKAP:
1. BAGIAN A: ASESMEN DIAGNOSTIK KOGNITIF (5 Soal Pilihan Ganda A-E):
   - 5 Soal PG singkat untuk memeriksa kesiapan penalaran prasyarat materi ${topik} (${mataPelajaran}).
   - Setiap soal memiliki 5 opsi (A, B, C, D, E), Kunci Jawaban, Pembahasan Ilmiah, dan Indikator Prasyarat.
2. BAGIAN B: ASESMEN FORMATIF PROSES (INTEGRASI H5P MOODLE & OBSERVASI):
   - 2 Rancangan Aktivitas H5P Interaktif di LMS Moodle (H5P Drag and Drop & Fill-in-the-Blanks) bertema materi ${topik}.
   - Lembar Observasi Unjuk Kerja Kolaboratif Kelompok (Skor 1-4) minimal 5 indikator relevan dengan ${mataPelajaran}.
3. BAGIAN C: ASESMEN SUMATIF KOMPREHENSIF:
   - Bagian 1: 5 Soal Pilihan Ganda Kompleks (Bobot 40%, 8 poin per soal) dengan 5 opsi A-E berlandaskan stimulus kasus ${topik}.
   - Bagian 2: 2 Soal Essay Analitis HOTS Berbasis Pemecahan Masalah Kontekstual ${topik} (Bobot 60%, 30 poin per soal) lengkap dengan Kunci Jawaban & Pedoman Penskoran.
4. BAGIAN D: FORMULA KALKULASI NILAI AKHIR (NA) & KKTP:
   - Rumus NA: Nilai Akhir (NA) = (Skor Formatif [H5P & LKPD] × 30%) + (Skor PG Kompleks [40%] + Skor Essay HOTS [60%] × 70%).

Format JSON yang dihasilkan:
{
  "docType": "asesmen",
  "judul": "INSTRUMEN ASESMEN & EVALUASI PEMBELAJARAN LENGKAP - ${mataPelajaran.toUpperCase()}",
  "asesmenAwal": {
    "teknik": "Tes Diagnostik Kognitif (5 Pilihan Ganda Singkat A-E)",
    "soalPg": [
      {
        "no": 1,
        "pertanyaan": "Soal diagnostik 1 terkait prasyarat konsep ${topik} pada mata pelajaran ${mataPelajaran}...",
        "pilihan": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
        "kunciJawaban": "B",
        "penjelasan": "Penjelasan konsep secara mendalam...",
        "indikatorPrasyarat": "Indikator kesiapan awal siswa..."
      }
    ]
  },
  "asesmenProses": {
    "teknik": "Integrasi Aktivitas H5P LMS Moodle & Observasi Unjuk Kerja",
    "aktivitasH5P": [
      {
        "no": 1,
        "jenis": "H5P Drag and Drop",
        "judul": "Aktivitas 1: Rekonstruksi Alur Konsep & Tahapan Solusi ${topik}",
        "deskripsi": "Menyusun tahapan alur konsep yang benar...",
        "instruksi": "Seret dan tempatkan komponen ke kotak yang sesuai.",
        "kontenKasus": "Alur tahapan penyelesaian kasus ${topik}...",
        "kunciValidasi": "Kunci urutan tahapan yang benar..."
      },
      {
        "no": 2,
        "jenis": "H5P Fill-in-the-Blanks",
        "judul": "Aktivitas 2: Melengkapi Rumpang Konsep Esensial ${topik}",
        "deskripsi": "Melengkapi rumpang pernyataan ilmiah materi ${topik}...",
        "instruksi": "Isilah bagian yang rumpang dengan istilah yang tepat.",
        "kontenKasus": "Pernyataan analisis materi ${topik}...",
        "kunciValidasi": "Kunci istilah yang benar..."
      }
    ],
    "lembarObservasi": [
      { "indikator": "Partisipasi aktif dalam diskusi kelompok", "skorMaks": 4 },
      { "indikator": "Kemampuan pemetaan variabel dan analisis masalah ${topik}", "skorMaks": 4 },
      { "indikator": "Ketepatan perancangan sistematika solusi", "skorMaks": 4 },
      { "indikator": "Keterampilan pengujian dan validasi solusi", "skorMaks": 4 },
      { "indikator": "Kualitas presentasi dan argumentasi solusi", "skorMaks": 4 }
    ]
  },
  "asesmenAkhir": {
    "teknik": "Tes Sumatif Terpadu (5 PG Kompleks [40%] & 2 Essay Analitis HOTS [60%])",
    "bagian1PgKompleks": [
      {
        "no": 1,
        "stimulus": "Deskripsi skenario masalah kontekstual materi ${topik} (${mataPelajaran})...",
        "pernyataan": "Pernyataan analisis berdasarkan stimulus di atas...",
        "pilihan": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
        "tipe": "Pilihan Ganda Kompleks",
        "kunciJawaban": "Pernyataan A dan C Benar",
        "bobot": 8,
        "pembahasan": "Pembahasan komprehensif..."
      }
    ],
    "bagian2EssayHots": [
      {
        "no": 1,
        "judul": "Studi Kasus 1: Penalaran & Solusi Terstruktur ${topik}",
        "stimulusKasus": "Teks kasus nyata berorientasi Deep Learning pada topik ${topik}...",
        "pertanyaan": "Lakukan analisis komprehensif dan susun sistematika solusi terstruktur untuk memecahkan persoalan di atas!",
        "kunciJawaban": "Kunci jawaban terstruktur lengkap dengan tahapan analisis, pemetaan variabel, dan prosedur solusi...",
        "pedomanPenskoran": "Pemetaan Masalah (10 poin), Analisis Solusi (10 poin), Sistematika & Validasi (10 poin). Total 30 poin.",
        "bobot": 30
      }
    ]
  },
  "bobotNilai": "Nilai Akhir (NA) = (Skor Formatif [H5P & LKPD] × 30%) + (Skor PG Kompleks [40%] + Skor Essay HOTS [60%] × 70%)",
  "rekapNilaiFormat": "Skala 0 - 100 dengan 4 Kategori Predikat KKTP (Sangat Baik, Baik, Cukup, Perlu Bimbingan)",
  "footer": "CopyRight©Norbertus Suryadi — ${sekolah} | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning"
}
Kembalikan HANYA JSON valid.`;
  }

  // 5. GENERATOR RUBRIK
  if (docType === 'rubrik') {
    // Rubrik taksonomi spesifik
    let aspek1Judul = 'Identifikasi Fakta & Pemetaan Masalah';
    let aspek2Judul = 'Perancangan Sistematika Solusi';
    let aspek3Judul = 'Evaluasi & Validasi Solusi';

    if (domain === 'math-sains') {
      aspek1Judul = 'Ketepatan Pemetaan Variabel & Rumus';
      aspek2Judul = 'Penalaran Logis Matematis / Ilmiah';
      aspek3Judul = 'Akurasi Perhitungan & Prosedur Solusi';
    } else if (domain === 'sosial-humaniora') {
      aspek1Judul = 'Kedalaman Analisis Kasus & Data';
      aspek2Judul = 'Kritis Argumentasi & Relevansi Teori';
      aspek3Judul = 'Keandalan & Kelayakan Solusi Kontekstual';
    } else if (domain === 'bahasa') {
      aspek1Judul = 'Struktur & Unsur Pembangun Teks';
      aspek2Judul = 'Kaidah Kebahasaan & Pilihan Diksi';
      aspek3Judul = 'Kedalaman Gagasan & Koherensi Wacana';
    } else if (isKoding) {
      aspek1Judul = 'Dekomposisi & Pemodelan Variabel';
      aspek2Judul = 'Logika Kontrol & Notasi Algoritma';
      aspek3Judul = 'Trace Table & Penelusuran Kasus Uji';
    }

    return `Buatkan Rubrik Penilaian Komprehensif Kurikulum Merdeka & KKTP dalam format JSON murni.
MATA PELAJARAN: ${mataPelajaran}
ELEMEN KSP / BIDANG: ${elemenKsp || 'Standar Kurikulum'}
KELAS / FASE: ${kelas}
TOPIK: "${topik}"
SEKOLAH: ${sekolah}
JUMLAH PERTEMUAN: ${numPertemuan}

${subjectRuleText}

================================================================================
ATURAN KHUSUS RUBRIK:
- Kriteria Penilaian disesuaikan dengan taksonomi mata pelajaran ${mataPelajaran.toUpperCase()}:
${
  domain === 'math-sains'
    ? '  * Math/Sains: Ketepatan Formulasi, Penalaran Logis Matematis, Langkah Pemecahan Masalah, Akurasi Perhitungan/Pengamatan.'
    : domain === 'sosial-humaniora'
    ? '  * Sosial/Ekonomi/Humaniora: Kedalaman Analisis Kasus, Kritis Argumentasi, Relevansi Data, Solusi Kebijakan/Isu Sosial.'
    : domain === 'bahasa'
    ? '  * Bahasa: Struktur Teks, Kaidah Kebahasaan, Gagasan/Ide, Koherensi Wacana.'
    : '  * Umum: Penguasaan Konsep, Ketajaman Analisis Masalah, Sistematika Prosedur Solusi.'
}
${!isInfo ? '- DILARANG menggunakan rubrik "Efisiensi Algoritma / Kualitas Sintaks Kode" untuk mapel non-Informatika.' : ''}

Format JSON Output:
{
  "docType": "rubrik",
  "judul": "RUBRIK PENILAIAN KOMPREHENSIF & KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP) - ${mataPelajaran.toUpperCase()}",
  "subJudul": "Rubrik evaluasi holistik mencakup asesmen formatif LKPD ${numPertemuan} pertemuan, asesmen sumatif penalaran essay & PG kompleks, partisipasi modul H5P e-learning Moodle, dan formula Nilai Akhir (NA).",
  "jumlahPertemuan": ${numPertemuan},
  "identitas": {
    "sekolah": "${sekolah}",
    "mataPelajaran": "${mataPelajaran}",
    "elemenKsp": "${elemenKsp || ''}",
    "kelas": "${kelas}",
    "topik": "${topik}"
  },
  "bagianA_Formatif": {
    "judul": "BAGIAN A: RUBRIK ASESMEN FORMATIF LKPD (${numPertemuan} PERTEMUAN)",
    "deskripsi": "Pedoman penskoran unjuk kerja kelompok dalam menyelesaikan LKPD (Skala 1 - 4).",
    "kriteriaList": [
      {
        "pertemuanKe": 1,
        "kriteria": "Pertemuan 1: Analisis & Sistematika Solusi ${topik}",
        "indikator": "Kemampuan memetakan masalah, mengidentifikasi variabel kunci, dan merumuskan solusi terstruktur pada materi ${topik}.",
        "skor4": "Mampu melakukan analisis secara komprehensif, mengidentifikasi seluruh variabel kunci, dan menyusun solusi yang sangat presisi.",
        "skor3": "Mampu melakukan analisis dengan baik, mengidentifikasi sebagian besar variabel kunci, dan menyusun solusi yang relevan.",
        "skor2": "Melakukan analisis sederhana namun melewatkan beberapa variabel penting.",
        "skor1": "Belum mampu melakukan analisis secara mandiri dan memerlukan bimbingan intensif."
      }
    ]
  },
  "bagianB_Sumatif": {
    "judul": "BAGIAN B: RUBRIK ASESMEN SUMATIF (PG KOMPLEKS 40% & ESSAY HOTS 60%)",
    "deskripsi": "Pedoman penskoran tes sumatif penalaran studi kasus kontekstual (Total 100 Poin).",
    "rubrikSoalList": [
      {
        "no": 1,
        "judulSoal": "Soal 1: Perancangan Sistematika Solusi ${topik}",
        "soalDeskripsi": "Deskripsi studi kasus pemecahan masalah ${topik} (${mataPelajaran})...",
        "bobotMaks": 30,
        "aspekList": [
          {
            "aspek": "${aspek1Judul}",
            "skorMaks": 10,
            "deskripsi": "Ketepatan memetakan variabel masukan, batasan, dan kondisi luaran.",
            "kriteriaSkor": { "skor4": "Sangat Tepat (10 Poin)", "skor3": "Tepat (8 Poin)", "skor2": "Cukup (5 Poin)", "skor1": "Kurang (2 Poin)" }
          },
          {
            "aspek": "${aspek2Judul}",
            "skorMaks": 10,
            "deskripsi": "Keandalan dan efisiensi langkah atau analisis yang disusun.",
            "kriteriaSkor": { "skor4": "Sangat Terstruktur (10 Poin)", "skor3": "Terstruktur dengan Baik (8 Poin)", "skor2": "Kurang Lengkap (5 Poin)", "skor1": "Belum Terstruktur (2 Poin)" }
          },
          {
            "aspek": "${aspek3Judul}",
            "skorMaks": 10,
            "deskripsi": "Ketajaman validasi dan analisis hasil penyelesaian.",
            "kriteriaSkor": { "skor4": "Validasi Sangat Akurat (10 Poin)", "skor3": "Validasi Akurat (8 Poin)", "skor2": "Validasi Sebagian (5 Poin)", "skor1": "Belum Tervalidasi (2 Poin)" }
          }
        ]
      }
    ]
  },
  "bagianC_Moodle": {
    "judul": "BAGIAN C: RUBRIK PARTISIPASI LMS MOODLE & MODUL H5P",
    "deskripsi": "Pedoman evaluasi partisipasi asinkron, pengerjaan modul H5P, dan kuis Moodle (Skala 0 - 100).",
    "aktivitasList": [
      {
        "aspek": "Penyelesaian Modul H5P Interaktif (${topik})",
        "bobotMaks": 100,
        "deskripsi": "Ketuntasan pengerjaan modul interaktif rekonstruksi alur solusi.",
        "skor4": "Menyelesaikan seluruh modul dengan skor 100% pada percobaan pertama.",
        "skor3": "Menyelesaikan modul dengan skor 80-99% setelah percobaan ulang.",
        "skor2": "Menyelesaikan modul dengan skor 60-79%.",
        "skor1": "Skor penyelesaian di bawah 60% atau tidak tuntas."
      }
    ]
  },
  "bagianD_Formula": {
    "judul": "BAGIAN D: FORMULA KALKULASI NILAI AKHIR (NA) & KRITERIA KKTP",
    "rumusNA": "Nilai Akhir (NA) = (Skor Formatif [H5P & LKPD] × 30%) + (Skor PG Kompleks [40%] + Skor Essay HOTS [60%] × 70%)",
    "penjelasanBobot": [
      { "komponen": "1. Asesmen Formatif (H5P Moodle & Observasi LKPD)", "bobotPersen": 30, "keterangan": "Mengukur proses penalaran dan unjuk kerja kolaboratif kelompok." },
      { "komponen": "2. Asesmen Sumatif PG Kompleks (5 Butir Soal)", "bobotPersen": 28, "keterangan": "Mewakili 40% dari porsi Asesmen Sumatif (40% × 70% = 28% dari NA)." },
      { "komponen": "3. Asesmen Sumatif Essay HOTS (2 Kasus Penalaran)", "bobotPersen": 42, "keterangan": "Mewakili 60% dari porsi Asesmen Sumatif (60% × 70% = 42% dari NA)." }
    ],
    "intervalKktp": [
      { "rentangNilai": "86 – 100", "predikat": "Sangat Baik (A)", "keterangan": "Tuntas Mandiri — Menguasai konsep mendalam dan mampu merancang solusi inovatif." },
      { "rentangNilai": "75 – 85", "predikat": "Baik (B)", "keterangan": "Tuntas Standar — Memahami konsep dan mampu menerapkan prosedur solusi dengan benar." },
      { "rentangNilai": "60 – 74", "predikat": "Cukup (C)", "keterangan": "Belum Tuntas — Memerlukan penguatan pada analisis atau sistematika solusi." },
      { "rentangNilai": "< 60", "predikat": "Perlu Bimbingan (D)", "keterangan": "Belum Tuntas — Memerlukan bimbingan remedial intensif pada konsep dasar." }
    ]
  },
  "footer": "CopyRight©Norbertus Suryadi — ${sekolah} | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning"
}
Kembalikan HANYA JSON valid.`;
  }

  return `Buatkan dokumen ${docType} dalam format JSON untuk mata pelajaran ${mataPelajaran}, topik "${topik}".`;
}

/**
 * Builds a single unified prompt to generate all documents (RPM, LKPD, Moodle, Asesmen, Rubrik)
 * in ONE single Gemini API call with COMPLETE SUBJECT ADAPTATION.
 */
export function buildUnifiedAllDocsPrompt(metadata: Partial<IdentitasRPM>): string {
  const {
    sekolah = 'SMA Xaverius 1 Palembang',
    guru = 'Norbertus Suryadi, S.Kom.',
    nipGuru = '-',
    kepalaSekolah = '-',
    nipKepalaSekolah = '-',
    mataPelajaran = 'Informatika',
    kelas = 'Kelas XI / Fase F',
    topik = 'Konsep dan Penerapan Materi',
    jumlahPertemuan = '2',
    alokasiWaktu = '2 x 40 Menit',
    cp = 'Peserta didik mampu memahami, menganalisis, dan memecahkan persoalan secara kritis dan mendalam.',
    modelPembelajaran = 'Problem Based Learning (PBL) & Deep Learning',
    elemenKsp = ''
  } = metadata;

  const numPertemuan = Math.max(1, parseInt(String(jumlahPertemuan || '2'), 10) || 2);
  const isInfo = isInformatikaSubject(mataPelajaran);
  const domain = getSubjectDomain(mataPelajaran, elemenKsp);
  const mode = getSubjectAndElementMode(mataPelajaran, elemenKsp, topik, cp);
  const isKoding = isInfo && mode === 'koding-pseudocode';
  const subjectRuleText = buildSubjectSystemRuleText(mataPelajaran, elemenKsp, topik, cp);

  const notationBoxLabel = isKoding
    ? '💻 Formulasi Notasi Pseudocode / Trace Table Logika'
    : domain === 'math-sains'
    ? '📐 Formulasi & Prosedur Matematis/Ilmiah'
    : '📝 Kerangka Konsep & Alur Analisis';

  const lkpdJudul = isInfo
    ? `LEMBAR KERJA PESERTA DIDIK (LKPD) - INFORMATIKA`
    : `LEMBAR KERJA PESERTA DIDIK (LKPD) - ${mataPelajaran.toUpperCase()}`;

  return `Anda adalah Pakar Kurikulum Merdeka dan Desainer Instruksional Berbasis Pembelajaran Mendalam (Deep Learning).
Buatkan SELURUH PAKET DOKUMEN PEMBELAJARAN LENGKAP (RPM [Bagian A-F], LKPD Siswa, Panduan Moodle LMS, Instrumen Asesmen, dan Rubrik KKTP) DALAM 1 STRUKTUR JSON UTUH SEKALIGUS.

================================================================================
METADATA INPUT USER (WAJIB DIINJEKSI DAN DIGUNAKAN SECARA KONSISTEN):
- Satuan Pendidikan: ${sekolah}
- Guru Pengampu: ${guru} (NIY: ${nipGuru})
- Kepala Sekolah: ${kepalaSekolah} (NIY: ${nipKepalaSekolah})
- MATA PELAJARAN: ${mataPelajaran}
- ELEMEN KSP / BIDANG: ${elemenKsp || 'Standar Kurikulum'}
- KELAS / FASE: ${kelas}
- TOPIK / SUB-MATERI: "${topik}"
- CAPAIAN PEMBELAJARAN (CP): "${cp}"
- Jumlah Pertemuan: ${numPertemuan} Pertemuan (Wajib buat TEPAT ${numPertemuan} sesi/pertemuan di setiap dokumen)
- Total Alokasi Waktu: ${alokasiWaktu}
- Model Pembelajaran: ${modelPembelajaran}

${subjectRuleText}

================================================================================
STRUKTUR OUTPUT JSON TUNGGAL (Wajib valid JSON murni):
{
  "rpm": {
    "docType": "rpm",
    "identitas": {
      "sekolah": "${sekolah}",
      "guru": "${guru}",
      "nipGuru": "${nipGuru}",
      "kepalaSekolah": "${kepalaSekolah}",
      "nipKepalaSekolah": "${nipKepalaSekolah}",
      "mataPelajaran": "${mataPelajaran}",
      "elemenKsp": "${elemenKsp || ''}",
      "kelas": "${kelas}",
      "topik": "${topik}",
      "jumlahPertemuan": "${numPertemuan}",
      "alokasiWaktu": "${alokasiWaktu}",
      "cp": "${cp}",
      "modelPembelajaran": "${modelPembelajaran}"
    },
    "capaianPembelajaran": "${cp}",
    "alurTujuanPembelajaran": [
      // TEPAT ${numPertemuan} objek ATP
      {
        "kodeTp": "TP 10.1",
        "tujuanPembelajaran": "Peserta didik mampu menganalisis dan memecahkan persoalan kontekstual terkait ${topik} pada mata pelajaran ${mataPelajaran}...",
        "indikatorKetercapaian": [
          "1. Mengidentifikasi variabel dan memetakan struktur konsep ${topik}.",
          "2. Menganalisis keteraturan dan menyusun rancangan solusi sistematis.",
          "3. Memvalidasi hasil pemecahan masalah secara terstruktur."
        ],
        "alokasiWaktuJp": "2 JP (80 Menit)",
        "pertemuanKe": 1,
        "fokusMateri": "Pemecahan Masalah Terstruktur Sesi 1: ${topik}"
      }
    ],
    "ringkasanMateri": [
      // TEPAT ${numPertemuan} objek ringkasan materi
      {
        "pertemuanKe": 1,
        "topikMateri": "Bahan Ajar Pertemuan 1: ${topik} (${mataPelajaran})",
        "konsepKunci": [
          "1. Definisi & Struktur Konsep Utama",
          "2. Karakteristik & Relasi Antar-Variabel",
          "3. Penerapan Kasus Nyata"
        ],
        "rangkumanTeori": "Uraian materi teoritis yang mendalam dan komprehensif tanpa singkatan...",
        "contohNotasi": "${notationBoxLabel}: Uraian prosedur terstruktur, rumus/penurunan ilmiah, atau bagan naratif langkah penyelesaian masalah ${topik}.",
        "studiKasusKontekstual": "Studi kasus kontekstual nyata berorientasi Deep Learning pada topik ${topik}..."
      }
    ],
    "tujuanPembelajaran": ["Tujuan pembelajaran komprehensif materi ${topik}..."],
    "pemahamanBermakna": "Penjelasan konseptual mendalam urgensi topik ${topik}...",
    "pertanyaanPemantik": ["Pertanyaan pemantik HOTS 1 terkait ${topik}", "Pertanyaan pemantik HOTS 2 terkait ${topik}"],
    "pertemuanList": [
      // TEPAT ${numPertemuan} objek pertemuan
      {
        "pertemuanKe": 1,
        "subTopik": "${topik} — Sesi 1",
        "alokasiWaktu": "80 Menit",
        "praktikPedagogis": "${modelPembelajaran}",
        "indikatorATP": [
          "1. Mengidentifikasi variabel dan melakukan analisis masalah ${topik}.",
          "2. Merancang alur solusi sistematis."
        ],
        "bahanAjar": {
          "konsepUtama": "Konsep utama materi sesi 1...",
          "studiKasus": "Studi kasus kontekstual sesi 1...",
          "rangkumanTeori": "Rangkuman teori esensial sesi 1...",
          "contohNotasi": "${notationBoxLabel}: Uraian prosedur terstruktur atau rumus ilmiah sesi 1..."
        },
        "kegiatanPembelajaran": {
          "kegiatanAwal": [
            "1. Guru menyapa peserta didik, memimpin doa, dan mengecek presensi.",
            "2. Memberikan apersepsi kontekstual dan pertanyaan pemantik terkait ${topik}."
          ],
          "kegiatanInti": [
            "1. Menyajikan studi kasus kontekstual ${topik} berbasis Deep Learning.",
            "2. Membagi kelompok diskusi dan membagikan LKPD.",
            "3. Membimbing penyelidikan dan perancangan solusi.",
            "4. Mengarahkan presentasi dan tanya jawab antarkelompok."
          ],
          "kegiatanPenutup": [
            "1. Bersama siswa merumuskan kesimpulan pembelajaran ${topik}.",
            "2. Mengarahkan pengunggahan tugas ke LMS Moodle dan refleksi diri."
          ]
        },
        "lkpdFocus": "Penyelidikan & Perancangan Solusi Sesi 1 (${topik})"
      }
    ],
    "asesmenRencana": {
      "awal": "Tes Diagnostik Kognitif 5 Soal Pilihan Ganda terkait ${topik}.",
      "proses": "Asesmen Formatif (Aktivitas H5P di Moodle & Observasi LKPD).",
      "akhir": "Asesmen Sumatif (5 PG Kompleks & 2 Essay HOTS)."
    },
    "pengayaanRemedial": {
      "pengayaan": "Tantangan studi kasus tingkat lanjut dan eksplorasi terapan ${topik}.",
      "remedial": "Bimbingan terfokus pada indikator yang belum dikuasai."
    }
  },
  "lkpd": {
    "docType": "lkpd",
    "judul": "${lkpdJudul}",
    "subJudul": "${topik} — Pendekatan Pembelajaran Mendalam (Deep Learning)",
    "jumlahPertemuan": ${numPertemuan},
    "identitas": {
      "sekolah": "${sekolah}",
      "mataPelajaran": "${mataPelajaran}",
      "elemenKsp": "${elemenKsp || ''}",
      "kelas": "${kelas}",
      "topik": "${topik}",
      "waktu": "${alokasiWaktu}"
    },
    "pertemuanList": [
      // TEPAT ${numPertemuan} objek LKPD
      {
        "pertemuanKe": 1,
        "waktu": "2 JP (80 Menit)",
        "subJudul": "Pertemuan 1: Penyelidikan & Solusi ${topik}",
        "tujuanAktivitas": [
          "Menganalisis permasalahan kontekstual ${topik} (${mataPelajaran}).",
          "Merumuskan alur penyelesaian masalah terstruktur."
        ],
        "petunjukPengerjaan": [
          "Cermati narasi stimulus kasus kontekstual yang disajikan.",
          "Diskusikan pertanyaan penalaran kritis pada Kegiatan 1 bersama kelompok.",
          "Lengkapi tabel kerja pada Kegiatan 2."
        ],
        "stimulusMaterial": "Narasi studi kasus kontekstual nyata mengenai ${topik} (${mataPelajaran})...",
        "kegiatan1Memahami": {
          "judul": "Kegiatan 1: Investigasi Masalah & Penalaran Kritis",
          "deskripsi": "Analisislah pertanyaan-pertanyaan berikut berdasarkan stimulus kasus:",
          "pertanyaanHots": [
            "1. Bagaimana analisis variabel kunci penyebab masalah ${topik}?",
            "2. Pola atau keteraturan apa yang ditemukan?",
            "3. Informasi atau faktor prioritas apa yang paling menentukan?",
            "4. Bagaimana sistematika solusi yang paling efektif?"
          ]
        },
        "kegiatan2Menerapkan": {
          "judul": "Kegiatan 2: Tabel Pengamatan & Sistematika Solusi",
          "instruksiTugas": "Lengkapi tabel analisis berikut dan susun alur solusi terstruktur untuk kasus ${topik}:",
          "tabelIsian": [
            { "no": 1, "komponen": "1. Identifikasi Fakta & Variabel Kunci", "instruksiAnalisis": "Petakan parameter masukan dan kondisi awal pada kasus ${topik}.", "ruangJawaban": "" },
            { "no": 2, "komponen": "2. Analisis Hubungan Sebab-Akibat", "instruksiAnalisis": "Jelaskan relasi antar-faktor yang diamati.", "ruangJawaban": "" },
            { "no": 3, "komponen": "3. Fokus Prioritas Solusi", "instruksiAnalisis": "Isolasi aspek paling esensial yang harus diselesaikan.", "ruangJawaban": "" },
            { "no": 4, "komponen": "4. Sistematika Langkah Solusi", "instruksiAnalisis": "Tuliskan urutan tahapan penyelesaian secara terstruktur.", "ruangJawaban": "" }
          ]
        },
        "aktivitasSiswa": [
          { "no": 1, "tugas": "Simulasi & Pengujian Kasus", "instruksi": "Uji rancangan solusi dengan skenario kasus terapan ${topik}.", "ruangJawaban": "" }
        ],
        "pertanyaanDiskusi": ["Bagaimana evaluasi efektivitas rancangan solusi kelompok Anda?"],
        "refleksiSiswa": "Refleksi mengenai hal paling bermakna yang dipelajari dalam memecahkan masalah ${topik}.",
        "kesimpulan": "Kesimpulan hasil penyelidikan dan perancangan solusi.",
        "rubrikSkor": [
          { "kriteria": "Ketajaman Analisis Masalah (Kegiatan 1)", "skorMaks": 30 },
          { "kriteria": "Ketepatan Tabel Isian Solusi (Kegiatan 2)", "skorMaks": 40 },
          { "kriteria": "Simulasi Pengujian & Refleksi", "skorMaks": 30 }
        ]
      }
    ]
  },
  "moodle": {
    "docType": "moodle",
    "identitas": {
      "sekolah": "${sekolah}",
      "mataPelajaran": "${mataPelajaran}",
      "elemenKsp": "${elemenKsp || ''}",
      "kelas": "${kelas}",
      "topik": "${topik}"
    },
    "namaAktivitas": "Panduan & Struktur Aktivitas LMS E-Learning: ${topik} (${mataPelajaran})",
    "platform": "Moodle LMS / Google Classroom",
    "deskripsiRingkas": "Panduan e-learning terpadu ${numPertemuan} sesi materi ${topik} berbasis Deep Learning.",
    "jumlahPertemuan": ${numPertemuan},
    "sesiElearning": [
      // TEPAT ${numPertemuan} objek sesi
      {
        "pertemuanKe": 1,
        "namaSesi": "Bahan Ajar Pertemuan 1: Eksplorasi Konsep & Forum Diskusi ${topik}",
        "jenisAktivitas": ["Forum Diskusi Kelompok", "Assignment Unggah LKPD Sesi 1"],
        "formatPengumpulan": "File PDF (Maks 5MB)",
        "tenggatWaktu": "H+3 Setelah Sesi 1 (23.59 WIB)",
        "instruksi": [
          "Pelajari materi dan studi kasus ${topik}.",
          "Diskusikan hasil analisis pada forum LMS Moodle.",
          "Unggah berkas LKPD solusi kelompok."
        ],
        "bahanSupport": ["Slide Materi PDF (${topik})", "Template LKPD P1", "Modul Interaktif H5P"]
      }
    ],
    "kriteriaKeberhasilan": ["Aktif berpartisipasi dalam forum diskusi dan mengunggah LKPD tepat waktu."],
    "petunjukPenilaian": "Penilaian berbasis rubrik keaktifan diskusi dan ketepatan produk solusi.",
    "footer": "CopyRight©Norbertus Suryadi — ${sekolah} | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning"
  },
  "asesmen": {
    "docType": "asesmen",
    "judul": "INSTRUMEN ASESMEN & EVALUASI PEMBELAJARAN LENGKAP - ${mataPelajaran.toUpperCase()}",
    "asesmenAwal": {
      "teknik": "Tes Diagnostik Kognitif (5 Pilihan Ganda Singkat A-E)",
      "soalPg": [
        {
          "no": 1,
          "pertanyaan": "Soal diagnostik 1 terkait konsep prasyarat ${topik} (${mataPelajaran})...",
          "pilihan": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
          "kunciJawaban": "A",
          "penjelasan": "Penjelasan konsep...",
          "indikatorPrasyarat": "Indikator kesiapan awal..."
        }
      ]
    },
    "asesmenProses": {
      "teknik": "Integrasi Aktivitas H5P LMS Moodle & Observasi Unjuk Kerja",
      "aktivitasH5P": [
        {
          "no": 1,
          "jenis": "H5P Drag and Drop",
          "judul": "Aktivitas 1: Rekonstruksi Alur Konsep ${topik}",
          "deskripsi": "Menyusun tahapan alur konsep yang benar...",
          "instruksi": "Seret komponen ke kotak alur yang sesuai.",
          "kontenKasus": "Alur tahapan solusi kasus ${topik}...",
          "kunciValidasi": "Kunci urutan..."
        },
        {
          "no": 2,
          "jenis": "H5P Fill-in-the-Blanks",
          "judul": "Aktivitas 2: Melengkapi Rumpang Konsep Esensial ${topik}",
          "deskripsi": "Melengkapi rumpang konsep...",
          "instruksi": "Isilah bagian rumpang dengan istilah yang tepat.",
          "kontenKasus": "Pernyataan analisis materi ${topik}...",
          "kunciValidasi": "Kunci istilah..."
        }
      ],
      "lembarObservasi": [
        { "indikator": "Partisipasi aktif dalam diskusi kelompok", "skorMaks": 4 },
        { "indikator": "Kemampuan pemetaan variabel dan analisis masalah ${topik}", "skorMaks": 4 },
        { "indikator": "Ketepatan perancangan alur solusi sistematis", "skorMaks": 4 },
        { "indikator": "Keterampilan validasi dan simulasi solusi", "skorMaks": 4 },
        { "indikator": "Kualitas presentasi dan argumentasi solusi", "skorMaks": 4 }
      ]
    },
    "asesmenAkhir": {
      "teknik": "Tes Sumatif Terpadu (5 PG Kompleks & 2 Essay Analitis HOTS)",
      "bagian1PgKompleks": [
        {
          "no": 1,
          "stimulus": "Deskripsi kasus kontekstual ${topik} (${mataPelajaran})...",
          "pernyataan": "Pernyataan analisis...",
          "pilihan": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
          "tipe": "Pilihan Ganda Kompleks",
          "kunciJawaban": "Pernyataan A dan C Benar",
          "bobot": 8,
          "pembahasan": "Pembahasan..."
        }
      ],
      "bagian2EssayHots": [
        {
          "no": 1,
          "judul": "Studi Kasus 1: Penalaran & Perancangan Solusi ${topik}",
          "stimulusKasus": "Teks stimulus kasus nyata berorientasi Deep Learning pada topik ${topik}...",
          "pertanyaan": "Lakukan analisis dan susun rancangan solusi terstruktur!",
          "kunciJawaban": "Kunci jawaban terstruktur analisis variabel dan tahapan solusi...",
          "pedomanPenskoran": "Pemetaan Masalah (10), Analisis Solusi (10), Sistematika (10). Total 30 poin.",
          "bobot": 30
        }
      ]
    },
    "bobotNilai": "Nilai Akhir (NA) = (Skor Formatif [H5P & LKPD] × 30%) + (Skor PG Kompleks [40%] + Skor Essay HOTS [60%] × 70%)",
    "rekapNilaiFormat": "Skala 0 - 100 dengan 4 Kategori Predikat KKTP",
    "footer": "CopyRight©Norbertus Suryadi — ${sekolah} | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning"
  },
  "rubrik": {
    "docType": "rubrik",
    "judul": "RUBRIK PENILAIAN KOMPREHENSIF & KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP) - ${mataPelajaran.toUpperCase()}",
    "subJudul": "Rubrik evaluasi holistik mencakup asesmen formatif LKPD ${numPertemuan} pertemuan, asesmen sumatif, modul H5P Moodle, dan formula Nilai Akhir (NA).",
    "jumlahPertemuan": ${numPertemuan},
    "identitas": {
      "sekolah": "${sekolah}",
      "mataPelajaran": "${mataPelajaran}",
      "elemenKsp": "${elemenKsp || ''}",
      "kelas": "${kelas}",
      "topik": "${topik}"
    },
    "bagianA_Formatif": {
      "judul": "BAGIAN A: RUBRIK ASESMEN FORMATIF LKPD (${numPertemuan} PERTEMUAN)",
      "deskripsi": "Pedoman penskoran unjuk kerja kelompok LKPD (Skala 1 - 4).",
      "kriteriaList": [
        {
          "pertemuanKe": 1,
          "kriteria": "Pertemuan 1: Analisis & Solusi ${topik}",
          "indikator": "Kemampuan memetakan masalah dan merancang alur solusi materi ${topik}.",
          "skor4": "Sangat komprehensif, mengidentifikasi seluruh variabel tanpa cela.",
          "skor3": "Baik, mengidentifikasi sebagian besar variabel.",
          "skor2": "Cukup, melewatkan beberapa variabel penting.",
          "skor1": "Perlu bimbingan intensif."
        }
      ]
    },
    "bagianB_Sumatif": {
      "judul": "BAGIAN B: RUBRIK ASESMEN SUMATIF (${mataPelajaran.toUpperCase()})",
      "deskripsi": "Pedoman penskoran tes sumatif (Total 100 Poin).",
      "rubrikSoalList": [
        {
          "no": 1,
          "judulSoal": "Soal 1: Perancangan Solusi ${topik}",
          "soalDeskripsi": "Deskripsi studi kasus pemecahan masalah ${topik}...",
          "bobotMaks": 30,
          "aspekList": [
            {
              "aspek": "Identifikasi Variabel & Pemetaan Masalah",
              "skorMaks": 10,
              "deskripsi": "Ketepatan memetakan variabel masukan dan batasan.",
              "kriteriaSkor": { "skor4": "Sangat Tepat (10)", "skor3": "Tepat (8)", "skor2": "Cukup (5)", "skor1": "Kurang (2)" }
            },
            {
              "aspek": "Perancangan Alur Solusi Sistematik",
              "skorMaks": 10,
              "deskripsi": "Keandalan dan efisiensi langkah instruksi atau analisis.",
              "kriteriaSkor": { "skor4": "Sangat Terstruktur (10)", "skor3": "Terstruktur (8)", "skor2": "Kurang Lengkap (5)", "skor1": "Belum Terstruktur (2)" }
            },
            {
              "aspek": "Simulasi & Validasi Solusi",
              "skorMaks": 10,
              "deskripsi": "Ketajaman validasi dan analisis hasil penyelesaian.",
              "kriteriaSkor": { "skor4": "Sangat Akurat (10)", "skor3": "Akurat (8)", "skor2": "Cukup (5)", "skor1": "Belum Tervalidasi (2)" }
            }
          ]
        }
      ]
    },
    "bagianC_Moodle": {
      "judul": "BAGIAN C: RUBRIK PARTISIPASI LMS MOODLE & MODUL H5P",
      "deskripsi": "Pedoman evaluasi partisipasi asinkron dan modul H5P.",
      "aktivitasList": [
        {
          "aspek": "Penyelesaian Modul H5P Interaktif (${topik})",
          "bobotMaks": 100,
          "deskripsi": "Ketuntasan pengerjaan modul interaktif.",
          "skor4": "Menyelesaikan seluruh modul dengan skor 100% pada percobaan pertama.",
          "skor3": "Menyelesaikan modul dengan skor 80-99%.",
          "skor2": "Menyelesaikan modul dengan skor 60-79%.",
          "skor1": "Skor penyelesaian di bawah 60%."
        }
      ]
    },
    "bagianD_Formula": {
      "judul": "BAGIAN D: FORMULA KALKULASI NILAI AKHIR (NA) & KRITERIA KKTP",
      "rumusNA": "Nilai Akhir (NA) = (Skor Formatif [H5P & LKPD] × 30%) + (Skor PG Kompleks [40%] + Skor Essay HOTS [60%] × 70%)",
      "penjelasanBobot": [
        { "komponen": "1. Asesmen Formatif (H5P & LKPD)", "bobotPersen": 30, "keterangan": "Mengukur proses penalaran dan kerja tim." },
        { "komponen": "2. Asesmen Sumatif PG Kompleks", "bobotPersen": 28, "keterangan": "40% dari 70% porsi Asesmen Sumatif." },
        { "komponen": "3. Asesmen Sumatif Essay HOTS", "bobotPersen": 42, "keterangan": "60% dari 70% porsi Asesmen Sumatif." }
      ],
      "intervalKktp": [
        { "rentangNilai": "86 – 100", "predikat": "Sangat Baik (A)", "keterangan": "Tuntas Mandiri — Menguasai konsep dan mampu merancang solusi inovatif." },
        { "rentangNilai": "75 – 85", "predikat": "Baik (B)", "keterangan": "Tuntas Standar — Memahami konsep dengan baik." },
        { "rentangNilai": "60 – 74", "predikat": "Cukup (C)", "keterangan": "Belum Tuntas — Perlu penguatan." },
        { "rentangNilai": "< 60", "predikat": "Perlu Bimbingan (D)", "keterangan": "Belum Tuntas — Perlu bimbingan intensif." }
      ]
    },
    "footer": "CopyRight©Norbertus Suryadi — ${sekolah} | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning"
  }
}
Kembalikan HANYA format JSON valid tanpa teks atau penjelasan pembuka/penutup!`;
}
