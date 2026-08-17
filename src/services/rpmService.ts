import { AtpItem, IdentitasRPM, RingkasanMateriItem, RpmDoc } from '../types';
import { isInformatikaSubject, getSubjectDomain } from './rpmPrompt';
import {
  stripHtmlTags,
  cleanAcademicTitles,
  sanitizeTypoAndSpelling,
  getActivityPhrasingForSubject,
  getMeetingStepTimes,
} from '../utils/formatUtils';

export interface ComputedMeetingAllocation {
  meetingJp: number;
  minsPerJp: number;
  meetingMinutes: number;
  displayString: string;
}

/**
 * Helper to extract dynamic sub-materi keywords from user input topik
 * e.g. "searching, sorting, queue, stack" -> ["Searching", "Sorting", "Queue", "Stack"]
 */
export function extractSubMateriKeywords(topikInput?: string): string[] {
  if (!topikInput) return ['Konsep & Fondasi Materi', 'Mekanisme & Struktur', 'Pengujian & Simulasi', 'Evaluasi & Optimasi'];
  
  // Remove common prefixes like "Topik:", "Materi:", "Bab:", etc.
  let cleaned = topikInput.replace(/^(?:topik|materi|bab|tema|pembelajaran)\s*:\s*/i, '').trim();
  
  // If contains colon with list after it: e.g. "Struktur Data: searching, sorting, stack, queue"
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    if (parts[1] && parts[1].trim().length > 3) {
      cleaned = parts[1].trim();
    }
  }

  // Split by comma, semicolon, slash, bullet, or words like "dan", "serta", "&"
  const rawParts = cleaned
    .split(/[,;\/\n•|]+|\s+(?:dan|serta|&)\s+/i)
    .map((p) => p.trim().replace(/^[-*•\d\.\)]+\s*/, ''))
    .filter((p) => p.length > 1);

  if (rawParts.length >= 2) {
    return rawParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  }

  // If single phrase, break down into logical facets
  return [
    cleaned,
    `Struktur & Prinsip Kerja ${cleaned}`,
    `Simulasi & Pengujian ${cleaned}`,
    `Optimasi & Studi Kasus ${cleaned}`,
  ];
}

/**
 * Helper to partition keywords among meetings
 */
export function getKeywordsForMeeting(allKeywords: string[], meetingIndex: number, totalMeetings: number): string[] {
  if (!allKeywords || allKeywords.length === 0) return ['Konsep Materi'];
  const numM = Math.max(1, totalMeetings);
  
  if (allKeywords.length === numM) {
    return [allKeywords[meetingIndex]];
  }

  if (allKeywords.length >= numM * 2) {
    const chunkSize = Math.ceil(allKeywords.length / numM);
    const start = meetingIndex * chunkSize;
    const slice = allKeywords.slice(start, start + chunkSize);
    return slice.length > 0 ? slice : [allKeywords[meetingIndex % allKeywords.length]];
  }

  const chunkSize = Math.ceil(allKeywords.length / numM);
  const start = meetingIndex * chunkSize;
  const slice = allKeywords.slice(start, start + chunkSize);
  if (slice.length > 0) return slice;
  return [allKeywords[meetingIndex % allKeywords.length]];
}

/**
 * Builds rich dynamic materi A-F items for a specific meeting based on extracted user keywords
 * dynamically adapted to the subject domain.
 */
export function generateDynamicMateriABCDF(topikInput: string, pertemuanKe: number, totalPertemuan: number, mataPelajaran: string = 'Informatika') {
  const allKeywords = extractSubMateriKeywords(topikInput);
  const currentKws = getKeywordsForMeeting(allKeywords, pertemuanKe - 1, totalPertemuan);
  const kwPrimary = currentKws[0] || topikInput;
  const kwSecondary = currentKws[1] || `Aplikasi Terpadu ${kwPrimary}`;
  const kwStr = currentKws.join(' dan ');
  const isInfo = isInformatikaSubject(mataPelajaran);
  const domain = getSubjectDomain(mataPelajaran);

  const isCsSearching = kwPrimary.toLowerCase().includes('search') || topikInput.toLowerCase().includes('search');
  const isCsSorting = kwPrimary.toLowerCase().includes('sort') || currentKws.some(k => k.toLowerCase().includes('sort'));
  const isCsQueue = kwPrimary.toLowerCase().includes('queue') || currentKws.some(k => k.toLowerCase().includes('queue'));
  const isCsStack = kwPrimary.toLowerCase().includes('stack') || currentKws.some(k => k.toLowerCase().includes('stack'));

  // Specialized Computer Science sub-topics
  if (isInfo && isCsSearching && isCsSorting && pertemuanKe === 1) {
    return [
      { abjad: 'A', judul: 'Dekomposisi Struktur Masalah: Konsep Dasar Searching & Sorting', deskripsi: 'Membedah permasalahan pencarian dan pengurutan data menjadi komponen terkelola: Linear Search (pencarian sekuensial pada data acak) dan Binary Search (pencarian biner interval pada data terurut) serta ragam metode Sorting (Bubble Sort, Selection Sort, Merge Sort).' },
      { abjad: 'B', judul: 'Pengenalan Pola: Keteraturan Data & Efisiensi Kompleksitas Waktu', deskripsi: 'Menganalisis pola pergeseran indeks, perbandingan elemen bertetangga, strategi divide and conquer, serta perbandingan kurva kompleksitas waktu O(n) vs O(log n) vs O(n²).' },
      { abjad: 'C', judul: 'Abstraksi: Isolasi Variabel Kunci (Array, Low, Mid, High, Pivot)', deskripsi: 'Menyaring variabel penentu penting seperti batas indeks rentang pencarian, elemen pivot, dan flag status penemuan nilai target tanpa terganggu oleh detail data yang tidak relevan.' },
      { abjad: 'D', judul: 'Perancangan Algoritma: Notasi Pseudocode & Diagram Alir ISO Searching & Sorting', deskripsi: 'Menyusun alur instruksi terstruktur langkah demi langkah menggunakan diagram alir standar ISO 5807 dan pseudocode baku dengan kondisi terminasi (break) yang presisi.' },
      { abjad: 'E', judul: 'Studi Kasus Kontekstual: Sistem Indeks Pencarian Produk Cepat E-Commerce', deskripsi: 'Penerapan integrasi algoritma sorting dan binary searching dalam menangani optimasi pencarian katalog produk berskala jutaan baris data pada sistem basis data modern.' },
      { abjad: 'F', judul: 'Simulasi Dry-Run, Trace Table & Evaluasi Efisiensi Logika', deskripsi: 'Melakukan pengujian manual langkah demi langkah pergeseran indeks array, menghitung jumlah perbandingan (comparison count), menguji kasus batas (edge cases), dan merefleksikan keakuratan solusi.' }
    ];
  }

  if (isInfo && (isCsQueue || isCsStack) && (pertemuanKe === 2 || pertemuanKe === totalPertemuan)) {
    return [
      { abjad: 'A', judul: 'Dekomposisi Struktur Data Linier: Queue (Antrean) & Stack (Tumpukan)', deskripsi: 'Membedah struktur antrean dan tumpukan ke dalam sub-elemen penyusun: kapasitas buffer, pointer penunjuk (Front, Rear, Top of Stack), dan data kontainer berbasis array/linked list.' },
      { abjad: 'B', judul: 'Pengenalan Pola: Prinsip FIFO (First-In, First-Out) vs LIFO (Last-In, First-Out)', deskripsi: 'Mengidentifikasi pola keteraturan aliran data di mana antrean memproses elemen pertama yang masuk (FIFO) sedangkan tumpukan memproses elemen terakhir yang ditambahkan (LIFO).' },
      { abjad: 'C', judul: 'Abstraksi: Pemodelan Kondisi Batas (IsFull, IsEmpty, Overflow, Underflow)', deskripsi: 'Mengisolasi status kritis kapasitas struktur data dan memodelkan deteksi batas aman memori guna mencegah terjadinya runtime error stack underflow atau queue buffer overflow.' },
      { abjad: 'D', judul: 'Perancangan Algoritma: Operasi Primitif (Enqueue, Dequeue, Push, Pop, Peek)', deskripsi: 'Menyusun prosedur terstruktur pemanipulasian pointer dan transfer nilai data menggunakan sintaks pseudocode dan diagram alir berstandar industri.' },
      { abjad: 'E', judul: 'Studi Kasus Kontekstual: Printer Spooling Queue & Mekanisme Undo-Redo Editor', deskripsi: 'Penerapan prinsip Queue pada manajemen antrean cetak dokumen terdistribusi dan Stack pada sistem navigasi riwayat web browser serta fitur pembatalan perintah dokumen.' },
      { abjad: 'F', judul: 'Simulasi Pengujian Memori, Trace Table & Sintesis Solusi', deskripsi: 'Melakukan penelusuran status buffer array saat serangkaian instruksi push/pop dan enqueue/dequeue dieksekusi secara dinamis beserta validasi efisiensi penggunaan memori.' }
    ];
  }

  // 1. Keagamaan
  if (domain === 'keagamaan') {
    return [
      { abjad: 'A', judul: `Refleksi Iman & Pemaknaan Teks Ajaran: ${kwPrimary}`, deskripsi: `Mendalami teks kitab suci, ajaran keagamaan, dan landasan spiritual terkait materi ${kwPrimary} serta membangun kesadaran batin yang mendalam.` },
      { abjad: 'B', judul: `Kontekstualisasi Nilai Moral & Etika Kehidupan: ${kwPrimary}`, deskripsi: `Menganalisis relevansi nilai-nilai moral, etika, dan spiritual dalam dinamika kehidupan pribadi, keluarga, dan masyarakat.` },
      { abjad: 'C', judul: `Penerapan Nilai Moral & Kerangka Analisis Masalah: ${kwSecondary}`, deskripsi: `Mengidentifikasi tantangan moral zaman dan merumuskan sikap hidup yang selaras dengan ajaran kasih, keadilan, dan kebajikan pada materi ${kwSecondary}.` },
      { abjad: 'D', judul: `Sistematika Perumusan Komitmen & Rencana Aksi Nyata`, deskripsi: `Menyusun langkah-langkah konkret perwujudan iman dalam aksi nyata dan keteladanan hidup sehari-hari pada materi ${kwStr}.` },
      { abjad: 'E', judul: `Studi Kasus Moral Kontekstual (Deep Learning)`, deskripsi: `Analisis mendalam terhadap dilema moral kontekstual nyata untuk menguji kedewasaan iman dan kepekaan nurani.` },
      { abjad: 'F', judul: `Refleksi Spiritual, Evaluasi Diri & Doa Komitmen`, deskripsi: `Melakukan refleksi hening metakognitif, evaluasi pertumbuhan karakter, dan peneguhan komitmen moral pribadi.` }
    ];
  }

  // 2. PJOK / Olahraga
  if (domain === 'pjok') {
    return [
      { abjad: 'A', judul: `Analisis Biomekanika & Fondasi Pola Gerak: ${kwPrimary}`, deskripsi: `Membedah prinsip dasar pola gerak, efisiensi biomekanika, dan mekanisme koordinasi tubuh pada materi ${kwPrimary}.` },
      { abjad: 'B', judul: `Pola Keteraturan Taktik, Strategi & Koordinasi: ${kwPrimary}`, deskripsi: `Menganalisis alur taktik permainan, posisi ruang gerak, variasi keterampilan motorik, dan prinsip sportivitas tim.` },
      { abjad: 'C', judul: `Formulasi Penyesuaian Gerak & Analisis Kesalahan: ${kwSecondary}`, deskripsi: `Mengidentifikasi kesalahan gerak umum dan merumuskan koreksi teknik yang aman serta efektif untuk materi ${kwSecondary}.` },
      { abjad: 'D', judul: `Sistematika Prosedur Latihan & Penerapan Taktik Terstruktur`, deskripsi: `Menyusun tahapan latihan terprogram mulai dari pemanasan spesifik, latihan drill, simulasi game, hingga pendinginan pada materi ${kwStr}.` },
      { abjad: 'E', judul: `Simulasi Pertandingan Nyata & Studi Kasus Taktik (Deep Learning)`, deskripsi: `Penerapan strategi taktik dan penguatan sportivitas dalam situasi permainan nyata berorientasi pemecahan masalah.` },
      { abjad: 'F', judul: `Evaluasi Kinerja Gerak, Pengukuran Kebugaran & Refleksi Sportivitas`, deskripsi: `Evaluasi capaian efisiensi gerak, analisis denyut nadi/kebugaran jasmani, serta refleksi nilai fair play dan kerjasama tim.` }
    ];
  }

  // 3. Seni & Budaya / PKWU
  if (domain === 'seni-budaya') {
    return [
      { abjad: 'A', judul: `Apresiasi Estetis & Eksplorasi Konsep Karya: ${kwPrimary}`, deskripsi: `Membedah unsur-unsur estetika, latar belakang budaya, dan konsep penciptaan karya pada materi ${kwPrimary}.` },
      { abjad: 'B', judul: `Karakteristik Medium, Alat, Bahan & Teknik: ${kwPrimary}`, deskripsi: `Menganalisis eksplorasi medium artistik, karakteristik bahan, dan penguasaan teknik berkarya seni.` },
      { abjad: 'C', judul: `Eksplorasi Gagasan Kreatif & Kerangka Desain: ${kwSecondary}`, deskripsi: `Mengembangkan sketsa konsep, komposisi visual/musikal/gerak, dan ekspresi artistik personal pada materi ${kwSecondary}.` },
      { abjad: 'D', judul: `Sistematika Tahapan Produksi & Penciptaan Karya Terstruktur`, deskripsi: `Menyusun tahapan perwujudan karya seni/prakarya dari eksplorasi ide, proses produksi, hingga sentuhan akhir pada materi ${kwStr}.` },
      { abjad: 'E', judul: `Studi Kasus Kreativitas & Pameran/Pergelaran (Deep Learning)`, deskripsi: `Penerapan gagasan kreatif dalam menjawab tantangan estetis dan apresiasi publik melalui showcase hasil karya.` },
      { abjad: 'F', judul: `Kritik Seni Pedagogis, Evaluasi Estetik & Refleksi Karya`, deskripsi: `Melakukan evaluasi mandiri dan apresiasi antarteman menggunakan rubrik estetika serta refleksi nilai keindahan.` }
    ];
  }

  // 4. Math/Science Domain
  if (domain === 'math-sains') {
    return [
      { abjad: 'A', judul: `Struktur Konsep & Fondasi Teori: ${kwPrimary}`, deskripsi: `Membedah struktur konsep ${kwPrimary} menjadi besaran, hukum ilmiah, parameter penentu, dan definisi operasional yang jelas.` },
      { abjad: 'B', judul: `Karakteristik & Hubungan Sebab-Akibat: ${kwPrimary}`, deskripsi: `Menganalisis pola keteraturan, relasi antar-variabel, grafik fungsional, dan prinsip ilmiah yang melandasi topik ${kwPrimary}.` },
      { abjad: 'C', judul: `Pemodelan Matematis & Formulasi Rumus: ${kwSecondary}`, deskripsi: `Merumuskan pemodelan matematis, penurunan rumus, atau persamaan ilmiah yang merepresentasikan persoalan ${kwSecondary}.` },
      { abjad: 'D', judul: `Prosedur Perhitungan & Sistematika Solusi Terstruktur`, deskripsi: `Menyusun langkah-langkah penyelesaian matematis/ilmiah secara terurut, presisi, dan teruji untuk menyelesaikan persoalan ${kwStr}.` },
      { abjad: 'E', judul: `Studi Kasus Kontekstual Dunia Nyata (Deep Learning)`, deskripsi: `Penerapan konsep ${kwStr} dalam menyelesaikan tantangan nyata di bidang sains terapan, teknologi, dan fenomena alam.` },
      { abjad: 'F', judul: `Verifikasi Hasil, Analisis Kasus Batas & Refleksi Metakognitif`, deskripsi: `Pengujian keakuratan perhitungan numerik, validasi model terhadap data empiris, dan refleksi pemahaman konsep.` }
    ];
  }

  // 5. Social/Economics Domain
  if (domain === 'sosial-humaniora') {
    return [
      { abjad: 'A', judul: `Identifikasi Konsep & Struktur Masalah: ${kwPrimary}`, deskripsi: `Membedah fenomena sosial/ekonomi ${kwPrimary} menjadi fakta empiris, aktor terkait, dan dinamika kontekstual yang esensial.` },
      { abjad: 'B', judul: `Analisis Pola, Faktor Penyebab & Dampak: ${kwPrimary}`, deskripsi: `Menganalisis relasi kausalitas antar-faktor, dampak terhadap masyarakat, dan relevansi terhadap kondisi nyata.` },
      { abjad: 'C', judul: `Kerangka Teori & Alternatif Solusi: ${kwSecondary}`, deskripsi: `Mengintegrasikan perspektif teori ${mataPelajaran} untuk merumuskan berbagai alternatif penyelesaian masalah ${kwSecondary}.` },
      { abjad: 'D', judul: `Sistematika Perumusan Kebijakan & Rencana Aksi Solusi`, deskripsi: `Menyusun rencana strategi implementasi pemecahan masalah secara terstruktur, terukur, dan aplikatif pada materi ${kwStr}.` },
      { abjad: 'E', judul: `Studi Kasus Otentik Masyarakat (Deep Learning)`, deskripsi: `Analisis mendalam studi kasus kontekstual ${kwStr} untuk memecahkan persoalan nyata di masyarakat.` },
      { abjad: 'F', judul: `Evaluasi Dampak Solusi, Validasi & Refleksi Pembelajaran`, deskripsi: `Mengevaluasi keandalan dan kelayakan solusi, merumuskan rekomendasi perbaikan, dan refleksi pemahaman siswa.` }
    ];
  }

  // 6. Language Domain
  if (domain === 'bahasa') {
    return [
      { abjad: 'A', judul: `Struktur Teks & Unsur Pembangun: ${kwPrimary}`, deskripsi: `Membedah bagian-bagian pembangun teks dan unsur-unsur esensial dari materi ${kwPrimary}.` },
      { abjad: 'B', judul: `Kaidah Kebahasaan & Ciri Khas Wacana: ${kwPrimary}`, deskripsi: `Menganalisis tata bahasa, pilihan diksi, gaya bahasa, dan makna tersurat maupun tersirat.` },
      { abjad: 'C', judul: `Gagasan Pokok, Konteks & Pesan Wacana: ${kwSecondary}`, deskripsi: `Mengisolasi pesan sentral, nilai edukatif, dan kontekstualisasi gagasan utama dalam wacana ${kwSecondary}.` },
      { abjad: 'D', judul: `Sistematika Rekonstruksi & Produksi Teks Terstruktur`, deskripsi: `Menyusun kerangka dan langkah-langkah penulisan/produksi wacana yang koheren dan sesuai kaidah pada materi ${kwStr}.` },
      { abjad: 'E', judul: `Studi Kasus Analisis Wacana Otentik (Deep Learning)`, deskripsi: `Penerapan analisis kritis pada karya/teks nyata untuk memperkaya wawasan literasi dan komunikasi.` },
      { abjad: 'F', judul: `Penyuntingan Karya, Evaluasi Diksi & Refleksi Pembelajaran`, deskripsi: `Evaluasi kualitas karya berdasarkan rubrik kaidah kebahasaan, penyempurnaan wacana, dan refleksi diri.` }
    ];
  }

  // Universal/Default Subject Domain
  return [
    { abjad: 'A', judul: `Struktur Konsep & Fondasi Esensial: ${kwPrimary}`, deskripsi: `Membedah struktur konsep ${kwPrimary} menjadi sub-komponen terkelola, menguraikan definisi formal, dan karakteristik esensialnya secara utuh.` },
    { abjad: 'B', judul: `Pola Keteraturan & Mekanisme Kerja: ${kwPrimary}`, deskripsi: `Mengidentifikasi pola keteraturan, relasi sebab-akibat, dan mekanisme kerja fundamental antar-unsur materi ${kwPrimary}.` },
    { abjad: 'C', judul: `Pemodelan Masalah & Variabel Kunci: ${kwSecondary}`, deskripsi: `Memusatkan perhatian pada variabel/faktor penentu utama ${kwSecondary} dan merumuskan representasi konseptual yang tepat.` },
    { abjad: 'D', judul: `Sistematika Prosedur & Langkah Solusi Terstruktur`, deskripsi: `Menyusun langkah-langkah prosedural penyelesaian masalah secara logis, sistematis, dan teruji untuk memecahkan persoalan ${kwStr}.` },
    { abjad: 'E', judul: `Studi Kasus Kontekstual Nyata (Deep Learning)`, deskripsi: `Penerapan konsep ${kwStr} dalam menyelesaikan tantangan nyata di lingkungan masyarakat dan kehidupan sehari-hari.` },
    { abjad: 'F', judul: `Pengujian Solusi, Validasi Hasil & Refleksi Metakognitif`, deskripsi: `Pengujian kebenaran langkah solusi pada berbagai kondisi data dan kasus batas, evaluasi efisiensi hasil, dan refleksi metakognitif.` }
  ];
}

/**
 * Helper to calculate allocation of JP and Minutes dynamically per meeting
 * e.g. "4 x 45 menit" with 2 meetings -> 2 JP (90 Menit) per meeting
 */
export function calculateMeetingAllocations(
  alokasiStr?: string,
  numPertemuanInput?: number | string
): ComputedMeetingAllocation[] {
  const numP = Math.max(1, parseInt(String(numPertemuanInput || '2'), 10) || 2);
  const raw = (alokasiStr || '4 x 45 Menit').trim().toLowerCase();

  // 1. Format perkalian JP: e.g. "4 x 45", "4 jp x 45 menit", "4x45", "4 * 45", "2 × 40"
  const jpRegex = /(\d+)\s*(?:jp)?\s*[xX×*]\s*(\d+)/i;
  const matchJp = raw.match(jpRegex);

  if (matchJp) {
    const totalJp = parseInt(matchJp[1], 10);
    const minsPerJp = parseInt(matchJp[2], 10);

    if (totalJp > 0 && minsPerJp > 0) {
      const baseJp = Math.floor(totalJp / numP);
      const remainderJp = totalJp % numP;

      const result: ComputedMeetingAllocation[] = [];
      for (let i = 0; i < numP; i++) {
        const meetingJp = Math.max(1, baseJp + (i < remainderJp ? 1 : 0));
        const meetingMinutes = meetingJp * minsPerJp;
        result.push({
          meetingJp,
          minsPerJp,
          meetingMinutes,
          displayString: `${meetingJp} JP (${meetingMinutes} Menit)`
        });
      }
      return result;
    }
  }

  // 2. Format hanya "4 JP" / "4JP" / "2 JP" tanpa pengali eksplisit (asumsi default 45 menit/JP)
  const onlyJpMatch = raw.match(/^(\d+)\s*jp$/i);
  if (onlyJpMatch) {
    const totalJp = parseInt(onlyJpMatch[1], 10);
    const minsPerJp = 45;
    const baseJp = Math.floor(totalJp / numP);
    const remainderJp = totalJp % numP;

    const result: ComputedMeetingAllocation[] = [];
    for (let i = 0; i < numP; i++) {
      const meetingJp = Math.max(1, baseJp + (i < remainderJp ? 1 : 0));
      const meetingMinutes = meetingJp * minsPerJp;
      result.push({
        meetingJp,
        minsPerJp,
        meetingMinutes,
        displayString: `${meetingJp} JP (${meetingMinutes} Menit)`
      });
    }
    return result;
  }

  // 3. Format menit murni: e.g. "90 menit", "180 menit", "80 menit"
  const menitMatch = raw.match(/(\d+)\s*(?:menit|mins|m\b)/i);
  if (menitMatch) {
    const totalMins = parseInt(menitMatch[1], 10);
    const baseMins = Math.floor(totalMins / numP);
    const remainderMins = totalMins % numP;

    const result: ComputedMeetingAllocation[] = [];
    for (let i = 0; i < numP; i++) {
      const meetingMinutes = Math.max(15, baseMins + (i < remainderMins ? 1 : 0));
      const estimatedJp = Math.max(1, Math.round(meetingMinutes / 45));
      result.push({
        meetingJp: estimatedJp,
        minsPerJp: Math.round(meetingMinutes / estimatedJp) || 45,
        meetingMinutes,
        displayString: `${estimatedJp} JP (${meetingMinutes} Menit)`
      });
    }
    return result;
  }

  // 4. Default fallback: 2 JP (90 Menit)
  return Array.from({ length: numP }, () => ({
    meetingJp: 2,
    minsPerJp: 45,
    meetingMinutes: 90,
    displayString: '2 JP (90 Menit)'
  }));
}

/**
 * Helper to extract grade/class prefix for TP code (e.g., "10", "11", "12")
 */
export function extractClassGrade(kelasStr?: string): string {
  if (!kelasStr) return '10';
  const match = kelasStr.match(/(?:Kelas|Fase)?\s*(10|11|12|X|XI|XII)/i);
  if (!match) return '10';
  const val = match[1].toUpperCase();
  if (val === 'X' || val === '10') return '10';
  if (val === 'XI' || val === '11') return '11';
  if (val === 'XII' || val === '12') return '12';
  return '10';
}

/**
 * Generate comprehensive structured ATP (Alur Tujuan Pembelajaran) items
 * strictly matching the number of meetings (jumlahPertemuan) and dynamic JP allocations.
 * STRICTLY ANCHORS ON USER SUB-TOPIC KEYWORDS.
 */
export function generateDefaultAtpItems(metadata: Partial<IdentitasRPM> = {}): AtpItem[] {
  const topik = metadata.topik || 'Konsep dan Penerapan Materi';
  const grade = extractClassGrade(metadata.kelas);
  const mapel = metadata.mataPelajaran || 'Informatika';
  const numPertemuan = Math.max(1, parseInt(String(metadata.jumlahPertemuan || '2'), 10) || 2);
  const allocations = calculateMeetingAllocations(metadata.alokasiWaktu, numPertemuan);
  const allKeywords = extractSubMateriKeywords(topik);
  const isInfo = isInformatikaSubject(mapel);
  const domain = getSubjectDomain(mapel);

  const atpList: AtpItem[] = [];

  for (let i = 1; i <= numPertemuan; i++) {
    const alloc = allocations[i - 1] || allocations[allocations.length - 1] || { displayString: '2 JP (90 Menit)' };
    const currentKws = getKeywordsForMeeting(allKeywords, i - 1, numPertemuan);
    const kwPrimary = currentKws[0] || topik;
    const kwSecondary = currentKws[1] || '';
    const kwStr = currentKws.join(' dan ');

    const isSearching = currentKws.some(k => k.toLowerCase().includes('search'));
    const isSorting = currentKws.some(k => k.toLowerCase().includes('sort'));
    const isQueue = currentKws.some(k => k.toLowerCase().includes('queue'));
    const isStack = currentKws.some(k => k.toLowerCase().includes('stack'));

    let tpText = '';
    let indikators: string[] = [];

    if (isInfo && isSearching && isSorting) {
      tpText = `Peserta didik mampu menerapkan 4 pilar Berpikir Komputasional (dekomposisi, pengenalan pola, abstraksi, dan perancangan algoritma) untuk menganalisis konsep dan mekanisme Searching (Linear & Binary Search) serta Sorting (Bubble, Selection, Insertion, Merge Sort), merancang notasi algoritma terstruktur, dan menguji efisiensi kompleksitas waktu penyelesaian masalah.`;
      indikators = [
        `1. Melakukan dekomposisi struktur masalah pencarian dan pengurutan data serta mengenali pola keteraturan alur kerja Linear Search, Binary Search, dan ragam metode Sorting.`,
        `2. Mengabstraksikan variabel penentu utama (indeks low/mid/high, elemen pivot) dan merancang representasi algoritma terstruktur menggunakan pseudocode dan diagram alir ISO.`,
        `3. Menguji keakuratan dan efisiensi kompleksitas waktu O(n) vs O(log n) menggunakan simulasi dry-run trace table pada berbagai skenario kasus batas.`
      ];
    } else if (isInfo && isQueue && isStack) {
      tpText = `Peserta didik mampu menerapkan 4 pilar Berpikir Komputasional untuk membedah struktur data linier Queue (Antrean) dan Stack (Tumpukan), menganalisis pola perilaku FIFO dan LIFO, merancang algoritma operasi primitif (Enqueue, Dequeue, Push, Pop, Peek), serta memvalidasi penerapannya pada sistem komputasi nyata.`;
      indikators = [
        `1. Menerapkan dekomposisi untuk membedah komponen struktur Queue dan Stack serta mengidentifikasi pola aliran data First-In First-Out (FIFO) dan Last-In First-Out (LIFO).`,
        `2. Mengabstraksikan status kapasitas memori (IsEmpty, IsFull) dan merancang algoritma operasi primitif (Push-Pop, Enqueue-Dequeue) menggunakan notasi pseudocode standar.`,
        `3. Menguji keandalan sistem terhadap kondisi batas (stack underflow, queue overflow) melalui simulasi trace table dan merefleksikan penerapannya pada studi kasus kontekstual.`
      ];
    } else if (isInfo && isSearching) {
      tpText = `Peserta didik mampu menerapkan 4 pilar Berpikir Komputasional untuk menganalisis konsep Searching (Pencarian Data), membedah perbedaan Linear Search dan Binary Search, mengabstraksikan variabel interval, serta merancang dan menguji algoritma pencarian data yang efisien.`;
      indikators = [
        `1. Melakukan dekomposisi alur pencarian sekuensial dan pencarian biner serta mengenali pola prasyarat keterurutan data.`,
        `2. Mengabstraksikan variabel kunci rentang pencarian dan merancang notasi pseudocode algoritma searching dengan kondisi terminasi yang presisi.`,
        `3. Membandingkan kompleksitas waktu pencarian O(n) vs O(log n) melalui simulasi penelusuran trace table.`
      ];
    } else if (isInfo && isSorting) {
      tpText = `Peserta didik mampu menerapkan 4 pilar Berpikir Komputasional untuk menganalisis konsep Sorting (Pengurutan Data), mengenali pola pertukaran elemen pada Bubble, Selection, dan Insertion Sort, serta menyusun dan menguji algoritma pengurutan terstruktur.`;
      indikators = [
        `1. Melakukan dekomposisi struktur himpunan data acak dan menganalisis pola perbandingan elemen bertetangga pada ragam metode Sorting.`,
        `2. Mengabstraksikan proses pergeseran nilai dan merancang representasi algoritma sorting menggunakan notasi pseudocode dan diagram alir.`,
        `3. Menguji efisiensi jumlah operasi perbandingan dan pertukaran elemen melalui simulasi penelusuran trace table.`
      ];
    } else if (isInfo && isQueue) {
      tpText = `Peserta didik mampu menerapkan 4 pilar Berpikir Komputasional untuk menganalisis struktur data Queue (Antrean), prinsip FIFO, dan operasi primitif Enqueue-Dequeue, serta memodelkan sistem antrean nyata secara terstruktur.`;
      indikators = [
        `1. Melakukan dekomposisi komponen antrean dan mengenali pola aliran data First-In, First-Out (FIFO) dengan manajemen pointer Front dan Rear.`,
        `2. Mengabstraksikan kondisi batas buffer dan merancang algoritma operasi Enqueue dan Dequeue secara terstruktur.`,
        `3. Menguji penanganan kondisi queue overflow dan underflow melalui simulasi penelusuran tabel kerja.`
      ];
    } else if (isInfo && isStack) {
      tpText = `Peserta didik mampu menerapkan 4 pilar Berpikir Komputasional untuk menganalisis struktur data Stack (Tumpukan), prinsip LIFO, dan operasi Push-Pop, serta memodelkan mekanisme penumpukan instruksi secara terstruktur.`;
      indikators = [
        `1. Melakukan dekomposisi komponen tumpukan dan mengenali pola aliran data Last-In, First-Out (LIFO) berpusat pada Top of Stack.`,
        `2. Mengabstraksikan kondisi batas memori dan merancang algoritma operasi penumpukan (Push) serta pengambilan (Pop/Peek) elemen data.`,
        `3. Menguji penanganan kondisi stack overflow dan underflow melalui simulasi penelusuran trace table.`
      ];
    } else if (domain === 'keagamaan') {
      tpText = `Peserta didik mampu menghayati dan mendalami nilai-nilai ajaran keagamaan dan moralitas pada materi ${kwStr}, memaknai teks kitab suci/ajaran secara kontekstual, serta merumuskan komitmen aksi nyata dalam kehidupan pribadi dan bermasyarakat.`;
      indikators = [
        `1. Menggali pemahaman teks ajaran/kitab suci dan merefleksikan makna spiritual yang terkandung pada materi ${kwPrimary}.`,
        `2. Menganalisis tantangan moral kontekstual dan mengaitkannya dengan penghayatan iman dalam keseharian.`,
        `3. Merumuskan rencana aksi nyata dan komitmen pribadi sebagai wujud pengamalan nilai-nilai kebajikan dan kasih.`
      ];
    } else if (domain === 'pjok') {
      tpText = `Peserta didik mampu menganalisis prinsip biomekanika dan pola gerak pada materi ${kwStr}, mempraktikkan keterampilan teknik dan taktik permainan secara efisien, serta membiasakan pola hidup sehat dan sportivitas.`;
      indikators = [
        `1. Mengidentifikasi dan menganalisis pola gerak dasar serta mekanisme biomekanika pada materi ${kwPrimary}.`,
        `2. Merancang variasi latihan taktik/teknik dan mempraktikkannya dalam situasi permainan dengan menjunjung tinggi sportivitas.`,
        `3. Mengevaluasi efisiensi kinerja gerak dan menyusun rekomendasi perbaikan untuk pemeliharaan kebugaran jasmani.`
      ];
    } else if (domain === 'seni-budaya') {
      tpText = `Peserta didik mampu mengapresiasi keragaman karya seni/budaya pada materi ${kwStr}, mengeksplorasi medium, alat, bahan, dan teknik berkarya, serta menciptakan karya inovatif yang memiliki nilai estetik dan makna kontekstual.`;
      indikators = [
        `1. Menganalisis unsur estetika, latar belakang budaya, dan konsep penciptaan karya pada materi ${kwPrimary}.`,
        `2. Mengeksplorasi teknik dan medium artistik untuk merancang konsep karya secara kreatif dan orisinal.`,
        `3. Memproduksi karya seni/prakarya secara mandiri dan kolaboratif serta melakukan refleksi dan kritik estetik pedagogis.`
      ];
    } else if (domain === 'math-sains') {
      tpText = `Peserta didik mampu memahami konsep fundamental ${kwStr}, memodelkan hubungan matematis/ilmiah antar-variabel, merancang prosedur penyelesaian masalah berbasis rumus yang presisi, dan memvalidasi keakuratan hasil secara kritis.`;
      indikators = [
        `1. Mengidentifikasi besaran, data yang diketahui, dan hukum/prinsip ilmiah yang berlaku pada konsep ${kwPrimary}.`,
        `2. Merumuskan pemodelan matematis/sains dan menyusun penurunan rumus yang relevan untuk menyelesaikan persoalan ${kwSecondary || kwPrimary}.`,
        `3. Menghitung dan memvalidasi hasil penyelesaian pada berbagai skenario kasus serta mengevaluasi signifikansi penerapannya.`
      ];
    } else if (domain === 'sosial-humaniora') {
      tpText = `Peserta didik mampu menganalisis fenomena kontekstual ${kwStr}, membedah faktor penyebab dan dampak sosial-ekonomi, merumuskan alternatif solusi terstruktur, serta mengevaluasi kelayakannya secara kritis dan berwawasan luas.`;
      indikators = [
        `1. Mengidentifikasi fakta empiris, aktor terkait, dan isu kunci dari fenomena ${kwPrimary}.`,
        `2. Menganalisis relasi kausalitas antar-faktor dan memetakan dampak terhadap masyarakat/ekonomi.`,
        `3. Merumuskan rekomendasi pemecahan masalah dan rencana aksi yang kontekstual dan aplikatif.`
      ];
    } else if (domain === 'bahasa') {
      tpText = `Peserta didik mampu menganalisis struktur teks, kaidah kebahasaan, dan makna wacana pada materi ${kwStr}, serta merancang dan memproduksi teks yang koheren, komunikatif, dan sesuai kaidah.`;
      indikators = [
        `1. Mengidentifikasi struktur pembangun dan unsur esensial teks pada materi ${kwPrimary}.`,
        `2. Menganalisis kaidah kebahasaan, pilihan kata (diksi), serta pesan tersurat dan tersirat dalam wacana.`,
        `3. Menyusun dan menyunting wacana secara mandiri dan kolaboratif dengan struktur yang padu.`
      ];
    } else {
      tpText = `Peserta didik mampu menganalisis konsep ${kwStr}, merumuskan alur pemecahan masalah kontekstual secara sistematis, dan mengevaluasi keakuratan hasil kerja secara mandiri dan kolaboratif.`;
      indikators = [
        `1. Mengidentifikasi komponen esensial dan karakteristik materi ${kwPrimary}.`,
        `2. Merumuskan prosedur dan langkah kerja sistematis untuk menyelesaikan persoalan ${kwSecondary || kwPrimary}.`,
        `3. Memvalidasi hasil pemecahan masalah dan merefleksikan penerapannya dalam kehidupan nyata.`
      ];
    }

    atpList.push({
      kodeTp: `TP ${grade}.${i}`,
      tujuanPembelajaran: tpText,
      indikatorKetercapaian: indikators,
      alokasiWaktuJp: alloc.displayString,
      pertemuanKe: i,
      fokusMateri: isInfo ? `Integrasi Logika: ${kwStr}` : `Fokus Pembelajaran Sesi ${i}: ${kwStr}`,
      korelasiDokumen: {
        lkpd: `Aktivitas LKPD Sesi ${i} (${kwStr})`,
        moodle: `Modul LMS Sesi ${i} (${kwPrimary})`,
        asesmen: `Asesmen Formatif & Unjuk Kerja Sesi ${i}`
      }
    });
  }

  return atpList;
}

/**
 * Generate structured ringkasan materi pembelajaran / bahan ajar strictly per meeting
 * STRICTLY ANCHORS ON USER SUB-TOPIC KEYWORDS WITHOUT HARDCODED GENERIC TEXT.
 */
export function generateDefaultMateriItems(metadata: Partial<IdentitasRPM> = {}): RingkasanMateriItem[] {
  const topik = metadata.topik || 'Konsep dan Penerapan Materi';
  const mapel = metadata.mataPelajaran || 'Informatika';
  const numPertemuan = Math.max(1, parseInt(String(metadata.jumlahPertemuan || '2'), 10) || 2);
  const allKeywords = extractSubMateriKeywords(topik);
  const isInfo = isInformatikaSubject(mapel);
  const domain = getSubjectDomain(mapel);

  const materiList: RingkasanMateriItem[] = [];

  for (let i = 1; i <= numPertemuan; i++) {
    const currentKws = getKeywordsForMeeting(allKeywords, i - 1, numPertemuan);
    const kwPrimary = currentKws[0] || topik;
    const kwSecondary = currentKws[1] || '';
    const kwStr = currentKws.join(' dan ');

    const isSearching = currentKws.some(k => k.toLowerCase().includes('search'));
    const isSorting = currentKws.some(k => k.toLowerCase().includes('sort'));
    const isQueue = currentKws.some(k => k.toLowerCase().includes('queue'));
    const isStack = currentKws.some(k => k.toLowerCase().includes('stack'));

    if (isInfo && isSearching && isSorting) {
      materiList.push({
        pertemuanKe: i,
        topikMateri: `Bahan Ajar Pertemuan ${i}: Konsep & Algoritma Searching dan Sorting`,
        konsepKunci: [
          'Searching (Pencarian Data): Linear Search (pencarian berurutan satu per satu dengan kompleksitas O(n)) dan Binary Search (pencarian biner berbasis pembagian interval dengan prasyarat data terurut serta kompleksitas O(log n)).',
          'Sorting (Pengurutan Data): Ragam metode pengurutan data ascending dan descending seperti Bubble Sort (pertukaran elemen bertetangga), Selection Sort (pencarian nilai ekstrem minimum/maksimum), dan Insertion Sort (penyisipan elemen ke posisi terurut).',
          'Analisis Efisiensi & Kasus Uji: Perbandingan jumlah langkah komputasi, operasi pertukaran (swap), dan validasi hasil menggunakan trace table.'
        ],
        rangkumanTeori:
          'Searching adalah operasi fundamental untuk menemukan lokasi suatu nilai target di dalam struktur data. Linear Search memeriksa setiap elemen secara sekuensial sehingga fleksibel untuk data acak, sedangkan Binary Search secara progresif membagi dua rentang pencarian sehingga jauh lebih efisien pada himpunan data terurut. Sorting adalah proses menyusun elemen ke dalam urutan tertentu. Memahami karakteristik algoritma pengurutan memungkinkan pemilihan metode optimal sesuai volume data dan keterbatasan memori sistem komputasi.',
        contohNotasi: `// 1. ALGORITMA BINARY SEARCH (Data Terurut)
FUNGSI BinarySearch(data: Array, target: Integer) -> Integer
  kiri <- 0, kanan <- Panjang(data) - 1
  SELAMA kiri <= kanan LAKUKAN:
    tengah <- (kiri + kanan) DIV 2
    JIKA data[tengah] == target MAKA:
      KEMBALIKAN tengah
    SEBALIKNYA JIKA data[tengah] < target MAKA:
      kiri <- tengah + 1
    SEBALIKNYA:
      kanan <- tengah - 1
  KEMBALIKAN -1 // Data tidak ditemukan

// 2. ALGORITMA BUBBLE SORT (Pengurutan Ascending)
PROSEDUR BubbleSort(data: Array)
  n <- Panjang(data)
  UNTUK i DARI 0 SAMPAI n-2 LAKUKAN:
    UNTUK j DARI 0 SAMPAI n-i-2 LAKUKAN:
      JIKA data[j] > data[j+1] MAKA:
        Tukar(data[j], data[j+1])`,
        studiKasusKontekstual: 'Pengelolaan Indeks Pencarian Cepat dan Pengurutan Harga Produk pada Sistem Katalog E-Commerce.',
        tipsRefleksi: 'Pastikan selalu memvalidasi apakah data telah terurut sebelum mengeksekusi algoritma Binary Search.'
      });
    } else if (isInfo && isQueue && isStack) {
      materiList.push({
        pertemuanKe: i,
        topikMateri: `Bahan Ajar Pertemuan ${i}: Struktur Data Linier Queue dan Stack`,
        konsepKunci: [
          'Queue (Struktur Antrean FIFO): Prinsip First-In First-Out di mana elemen pertama yang masuk menjadi yang pertama keluar, dikelola melalui pointer Front (penghapusan) dan Rear (penambahan).',
          'Operasi Primitif Queue: Enqueue (memasukkan data baru di posisi Rear) dan Dequeue (mengeluarkan data terdepan di posisi Front) beserta pencegahan Queue Overflow dan Underflow.',
          'Stack (Struktur Tumpukan LIFO): Prinsip Last-In First-Out di mana elemen terakhir yang ditambahkan menjadi yang pertama diambil, berpusat pada satu ujung tunggal yaitu Top of Stack.',
          'Operasi Primitif Stack: Push (menumpuk data baru ke posisi Top), Pop (mengambil dan menghapus elemen Top), serta Peek (membaca nilai Top tanpa menghapus).'
        ],
        rangkumanTeori:
          'Queue dan Stack merupakan struktur data linier mendasar dalam ilmu komputer dengan aturan akses khusus. Queue menerapkan keadilan antrean berbasis waktu kedatangan (FIFO), sangat ideal untuk penjadwalan proses CPU, buffering data transmisi jaringan, dan antrean pencetakan dokumen. Sebaliknya, Stack menerapkan keterbalikan urutan (LIFO), sangat esensial dalam eksekusi pemanggilan fungsi bersarang (call stack recursion), evaluasi ekspresi aritmatika, serta fungsionalitas pembatalan perintah (Undo/Redo) pada aplikasi modern.',
        contohNotasi: `// 1. OPERASI QUEUE (FIFO)
PROSEDUR Enqueue(elemen: Data)
  JIKA IsFull() MAKA Tampilkan("Queue Penuh")
  SEBALIKNYA:
    rear <- rear + 1
    antrean[rear] <- elemen

FUNGSI Dequeue() -> Data
  JIKA IsEmpty() MAKA Tampilkan("Queue Kosong")
  SEBALIKNYA:
    hasil <- antrean[front]
    front <- front + 1
    KEMBALIKAN hasil

// 2. OPERASI STACK (LIFO)
PROSEDUR Push(elemen: Data)
  JIKA top >= KapasitasMaks MAKA Tampilkan("Stack Overflow")
  SEBALIKNYA:
    top <- top + 1
    tumpukan[top] <- elemen

FUNGSI Pop() -> Data
  JIKA top < 0 MAKA Tampilkan("Stack Underflow")
  SEBALIKNYA:
    hasil <- tumpukan[top]
    top <- top - 1
    KEMBALIKAN hasil`,
        studiKasusKontekstual: 'Manajemen Antrean Cetak Dokumen Terdistribusi (Queue Spooler) dan Mekanisme Navigasi Riwayat Halaman Web serta Undo-Redo Editor (Stack).',
        tipsRefleksi: 'Selalu lakukan pengecekan kondisi batas IsEmpty sebelum memanggil fungsi Pop atau Dequeue guna mencegah kesalahan runtime.'
      });
    } else if (domain === 'keagamaan') {
      materiList.push({
        pertemuanKe: i,
        topikMateri: `Bahan Ajar Pertemuan ${i}: ${kwStr} (${mapel})`,
        konsepKunci: [
          `1. Landasan Ajaran & Refleksi Spiritual ${kwPrimary}: Pemaknaan mendalam teks kitab suci dan nilai moral kebajikan.`,
          `2. Kontekstualisasi Etika: Relasi antara penghayatan iman dengan tantangan moral di kehidupan nyata.`,
          `3. Pengamalan & Aksi Nyata: Perwujudan komitmen iman dalam tindakan kasih dan kepedulian sosial.`
        ],
        rangkumanTeori: `Pada pertemuan ke-${i}, proses pembelajaran dirancang untuk mendalami nilai spiritual dan moralitas pada materi ${kwStr}. Peserta didik diajak merefleksikan makna teks ajaran, membangun kesadaran etis, dan merumuskan sikap hidup yang bertanggung jawab di tengah masyarakat.`,
        contohNotasi: `1. TAHAP PEMAKNAAN TEKS AJARAN / KITAB SUCI:
   - Identifikasi pesan sentral dan nilai kebajikan yang terkandung.
2. TAHAP ANALISIS DILEMA MORAL KONTEKSTUAL:
   - Telusuri tantangan etika dan relasi sebab-akibat dalam kehidupan nyata.
3. TAHAP PERUMUSAN KOMITMEN MORAL:
   - Susun prinsip pedoman bersikap dan bertindak berdasarkan ajaran kasih.
4. TAHAP PERANCANGAN AKSI NYATA:
   - Rencanakan tindakan konkret pengamalan nilai di keluarga dan masyarakat.`,
        studiKasusKontekstual: `Studi Kasus Kontekstual Dilema Moral (Deep Learning): Menganalisis situasi nyata seputar ${kwStr} untuk mengasah kepekaan nurani dan kedewasaan moral peserta didik.`,
        tipsRefleksi: `Hayati nilai moral yang dipelajari dan wujudkan dalam tindakan keteladanan nyata setiap hari.`
      });
    } else if (domain === 'pjok') {
      materiList.push({
        pertemuanKe: i,
        topikMateri: `Bahan Ajar Pertemuan ${i}: Praktik Pola Gerak & Taktik ${kwStr} (${mapel})`,
        konsepKunci: [
          `1. Prinsip Biomekanika & Pola Gerak ${kwPrimary}: Efisiensi posisi tubuh, koordinasi gerak, dan keselamatan.`,
          `2. Analisis Taktik & Strategi Permainan: Penguasaan ruang, variasi gerak, dan kerjasama tim.`,
          `3. Kebugaran Jasmani & Sportivitas: Penguatan daya tahan tubuh, fair play, dan pembiasaan hidup sehat.`
        ],
        rangkumanTeori: `Pada pertemuan ke-${i}, peserta didik membedah mekanisme biomekanika dan pola gerak pada materi ${kwStr}. Melalui simulasi dan analisis taktik permainan, peserta didik melatih efisiensi gerak, mengasah kemampuan memecahkan masalah dalam situasi pertandingan, serta menanamkan nilai sportivitas.`,
        contohNotasi: `1. TAHAP ANALISIS BIOMEKANIKA GERAK:
   - Petakan posisi awal, titik tumpu, alur gerak, dan posisi akhir.
2. TAHAP IDENTIFIKASI KESALAHAN TEKNIS:
   - Temukan faktor penyebab ketidakefisienan gerak atau risiko cedera.
3. TAHAP PERANCANGAN VARIASI LATIHAN & DRILL:
   - Susun urutan drill latihan bertahap dari sederhana hingga kompleks.
4. TAHAP SIMULASI TAKTIK & EVALUASI:
   - Uji strategi dalam situasi permainan nyata dan ukur capaian kebugaran.`,
        studiKasusKontekstual: `Studi Kasus Taktik Permainan Nyata (Deep Learning): Menganalisis skenario situasi pertandingan ${kwStr} untuk merumuskan respon taktik yang cepat dan tepat.`,
        tipsRefleksi: `Jaga fokus pada keselamatan gerak, lakukan pemanasan optimal, dan junjung tinggi sportivitas.`
      });
    } else if (domain === 'seni-budaya') {
      materiList.push({
        pertemuanKe: i,
        topikMateri: `Bahan Ajar Pertemuan ${i}: Eksplorasi & Penciptaan Karya ${kwStr} (${mapel})`,
        konsepKunci: [
          `1. Apresiasi Seni & Konsep Estetis ${kwPrimary}: Unsur rupa/musik/tari/teater dan latar belakang budaya.`,
          `2. Eksplorasi Medium & Teknik Berkarya: Karakteristik bahan, alat, dan penguasaan teknik artistik.`,
          `3. Penciptaan & Presentasi Karya: Perwujudan ide kreatif yang orisinal dan bernilai estetik tinggi.`
        ],
        rangkumanTeori: `Pada pertemuan ke-${i}, proses pembelajaran memadukan apresiasi estetik dan kreasi artistik pada materi ${kwStr}. Peserta didik mengeksplorasi teknik dan medium, mengembangkan gagasan inovatif, serta menyajikan karya dengan penuh percaya diri dan kepekaan rasa.`,
        contohNotasi: `1. TAHAP APRESIASI & PENGGALIAN GAGASAN:
   - Analisis objek rujukan, tema, dan pesan estetik yang ingin diangkat.
2. TAHAP EKSPLORASI MEDIUM & SKETSA/DESAIN:
   - Buat rancangan komposisi, pemilihan alat/bahan, dan uji coba teknik.
3. TAHAP PERWUJUDAN KARYA (PRODUKSI):
   - Eksekusi tahapan berkarya secara terstruktur dan presisi.
4. TAHAP EVALUASI & KRITIK ESTETIK PEDAGOGIS:
   - Apresiasi keunikan karya dan refleksi proses penciptaan.`,
        studiKasusKontekstual: `Studi Kasus Inovasi Karya Kontekstual (Deep Learning): Mengembangkan karya seni/prakarya ${kwStr} yang merespons isu kekinian atau potensi kearifan lokal.`,
        tipsRefleksi: `Berani bereksperimen dengan berbagai medium dan hayati proses penciptaan karya seni.`
      });
    } else if (domain === 'math-sains') {
      materiList.push({
        pertemuanKe: i,
        topikMateri: `Bahan Ajar Pertemuan ${i}: ${kwStr} (${mapel})`,
        konsepKunci: [
          `1. Struktur Konsep ${kwPrimary}: Definisi operasional, besaran fisis/matematis, dan hukum ilmiah yang melandasi.`,
          `2. Karakteristik & Relasi Rumus: Keteraturan relasi antar-variabel, grafik fungsional, dan batasan penerapan.`,
          `3. Aplikasi Terapan: Pemecahan kasus nyata dan pemodelan matematis berbasis data empiris.`
        ],
        rangkumanTeori: `Pada pertemuan ke-${i}, proses pembelajaran dirancang untuk mengeksplorasi konsep ${kwStr} secara mendalam melalui pendekatan saintifik dan penalaran matematis terstruktur. Peserta didik menelaah hubungan antar-variabel, merumuskan pemodelan persamaan, serta menerapkan prosedur perhitungan ilmiah yang presisi. Pendekatan ini memastikan pemahaman konsep tidak sekadar hafalan, melainkan membentuk penalaran kritis tingkat tinggi (HOTS) yang aplikatif dalam memecahkan masalah kontekstual.`,
        contohNotasi: `1. IDENTIFIKASI BESARAN & VARIABEL:
   - Variabel Diketahui: Parameter masukan dan data pengamatan.
   - Variabel Target: Besaran yang dicari dan batasan operasional.
2. FORMULASI PERSAMAAN / HUKUM ILMIAH:
   - Penurunan rumus matematis/sains yang relevan.
3. PROSEDUR SUBSTITUSI & PERHITUNGAN:
   - Eksekusi langkah kalkulasi numerik secara terurut.
4. VALIDASI & ANALISIS KASUS BATAS:
   - Verifikasi kebenaran dimensi satuan dan konsistensi hasil.`,
        studiKasusKontekstual: `Studi Kasus Kontekstual Dunia Nyata (Deep Learning): Menerapkan pemodelan konsep ${kwStr} untuk menganalisis dan memecahkan tantangan otentik dalam sains terapan dan kehidupan nyata.`,
        tipsRefleksi: `Selalu periksa konsistensi satuan dan kondisi batas variabel sebelum menyimpulkan hasil perhitungan.`
      });
    } else if (domain === 'sosial-humaniora') {
      materiList.push({
        pertemuanKe: i,
        topikMateri: `Bahan Ajar Pertemuan ${i}: Analisis ${kwStr} (${mapel})`,
        konsepKunci: [
          `1. Identifikasi Fenomena ${kwPrimary}: Fakta empiris, data kontekstual, dan definisi konsep utama.`,
          `2. Analisis Kausalitas: Hubungan sebab-akibat, relasi antar-aktor sosial/ekonomi, dan dampaknya.`,
          `3. Perumusan Solusi Kebijakan: Strategi penyelesaian masalah yang terukur dan berkeadilan.`
        ],
        rangkumanTeori: `Pada pertemuan ke-${i}, proses pembelajaran berfokus pada eksplorasi komprehensif mengenai ${kwStr}. Peserta didik menganalisis dinamika fenomena sosial-ekonomi melalui pembedahan akar masalah, relasi kausalitas antar-faktor, dan evaluasi dampak terhadap masyarakat. Kerangka ini melatih peserta didik berpikir kritis, berempati, dan mampu merumuskan alternatif solusi yang realistis dan berorientasi masa depan.`,
        contohNotasi: `1. PEMETAAN FAKTA & ISU KUNCI:
   - Identifikasi kondisi riil, aktor terlibat, dan konteks fenomena.
2. ANALISIS AKAR MASALAH (ROOT CAUSE ANALYSIS):
   - Petakan relasi sebab-akibat dan faktor pendorong utama.
3. PERUMUSAN STRATEGI & ALTERNATIF SOLUSI:
   - Susun opsi kebijakan atau tindakan mitigasi yang aplikatif.
4. EVALUASI KELAYAKAN & DAMPAK:
   - Proyeksikan dampak jangka pendek dan jangka panjang bagi masyarakat.`,
        studiKasusKontekstual: `Studi Kasus Kontekstual Dunia Nyata (Deep Learning): Mengkaji fenomena riil seputar ${kwStr} di masyarakat untuk melatih perumusan rekomendasi pemecahan masalah yang komprehensif.`,
        tipsRefleksi: `Gunakan bukti data empiris dan perspektif multipihak untuk memperkuat argumentasi analisis.`
      });
    } else if (domain === 'bahasa') {
      materiList.push({
        pertemuanKe: i,
        topikMateri: `Bahan Ajar Pertemuan ${i}: Struktur & Kaidah ${kwStr} (${mapel})`,
        konsepKunci: [
          `1. Struktur Teks ${kwPrimary}: Unsur-unsur pembangun wacana dan fungsi komunikatifnya.`,
          `2. Kaidah Kebahasaan: Tata bahasa, pilihan kata (diksi), dan kohesi-koherensi wacana.`,
          `3. Produksi Wacana: Sistematika perancangan karya/teks yang efektif dan berestetika.`
        ],
        rangkumanTeori: `Pada pertemuan ke-${i}, peserta didik mendalami materi ${kwStr} dengan membedah karakteristik wacana, kaidah tata bahasa baku, dan pesan komunikatif yang disampaikan. Melalui pendekatan literasi mendalam, peserta didik tidak hanya memahami makna tekstual dan kontekstual, tetapi juga mampu mengekspresikan gagasan secara terstruktur, santun, dan meyakinkan dalam bentuk karya lisan maupun tulisan.`,
        contohNotasi: `1. TAHAP DEKONSTRUKSI TEKS:
   - Bedah bagian pendahuluan/orientasi, isi/argumen, dan penutup/reorientasi.
2. TAHAP ANALISIS CIRI KEBAHASAAN:
   - Identifikasi konjungsi, modalitas, istilah teknis, dan gaya bahasa.
3. TAHAP PERANCANGAN KERANGKA TULISAN:
   - Susun peta gagasan (mind map) dan kalimat utama tiap paragraf.
4. TAHAP PENYUNTINGAN & FINALISASI:
   - Uji keterbacaan, kepaduan antarkalimat, dan ketepatan ejaan.`,
        studiKasusKontekstual: `Studi Kasus Kontekstual Literasi (Deep Learning): Menganalisis dan menyunting wacana otentik terkait ${kwStr} untuk mengasah kepekaan berbahasa dan daya nalar kritis.`,
        tipsRefleksi: `Pastikan setiap paragraf memiliki satu ide pokok yang dikembangkan dengan kalimat penjelas yang koheren.`
      });
    } else {
      materiList.push({
        pertemuanKe: i,
        topikMateri: `Bahan Ajar Pertemuan ${i}: ${kwStr} (${mapel})`,
        konsepKunci: [
          `1. Konsep Dasar & Prinsip Utama ${kwPrimary}: Landasan teoretis dan definisi esensial.`,
          `2. Karakteristik & Mekanisme: Keteraturan alur dan hubungan antar-unsur materi.`,
          `3. Penerapan Terpadu: Implementasi praktis pada pemecahan tantangan kontekstual.`
        ],
        rangkumanTeori: `Pada pertemuan ke-${i}, proses pembelajaran difokuskan pada penguasaan materi ${kwStr} secara komprehensif. Peserta didik mengeksplorasi konsep fundamental, mengidentifikasi keteraturan prinsip kerja, dan menyusun prosedur penyelesaian masalah yang sistematis guna membentuk pemahaman mendalam dan aplikatif.`,
        contohNotasi: `1. PEMETAAN ELEMEN DASAR:
   - Identifikasi parameter awal dan sasaran yang ingin dicapai.
2. ANALISIS POLA & MEKANISME KERJA:
   - Petakan relasi antar-komponen secara terstruktur.
3. SISTEMATIKA PROSEDUR KERJA:
   - Susun langkah-langkah implementasi solusi secara logis.
4. EVALUASI & REFLEKSI:
   - Validasi hasil kerja dan refleksikan efektivitas langkah penyelesaian.`,
        studiKasusKontekstual: `Studi Kasus Kontekstual Nyata (Deep Learning): Mengaplikasikan konsep ${kwStr} untuk memecahkan persoalan otentik dalam kehidupan sehari-hari.`,
        tipsRefleksi: `Fokus pada alur tahapan berpikir yang sistematis dan lakukan validasi hasil secara mandiri.`
      });
    }
  }

  return materiList;
}

/**
 * Generate full-depth, structured PertemuanList items (Materi A-F + Detailed 7/13/6 Activities + Clean Columns)
 * STRICTLY ANCHORS ON USER SUB-TOPIC KEYWORDS WITHOUT HARDCODED GENERIC TEXT.
 */
export function generateDefaultPertemuanList(metadata: Partial<IdentitasRPM> = {}): any[] {
  const numPertemuan = Math.max(1, parseInt(String(metadata.jumlahPertemuan || '2'), 10) || 2);
  const mapel = metadata.mataPelajaran || 'Informatika';
  const allocations = calculateMeetingAllocations(metadata.alokasiWaktu, numPertemuan);
  const topik = metadata.topik || 'Konsep dan Penerapan Materi';
  const model = metadata.modelPembelajaran || 'Problem Based Learning (PBL) & Deep Learning';
  const allKeywords = extractSubMateriKeywords(topik);

  const list: any[] = [];

  for (let i = 1; i <= numPertemuan; i++) {
    const alloc = allocations[i - 1] || { displayString: '2 JP (90 Menit)', meetingMinutes: 90, meetingJp: 2, minsPerJp: 45 };
    const meetingTimes = getMeetingStepTimes(alloc.meetingJp, alloc.minsPerJp, alloc.meetingMinutes);
    const currentKws = getKeywordsForMeeting(allKeywords, i - 1, numPertemuan);
    const kwPrimary = currentKws[0] || topik;
    const kwStr = currentKws.join(' dan ');

    const phrasing = getActivityPhrasingForSubject(mapel);
    const isInfo = isInformatikaSubject(mapel);

    const guruStep10 = isInfo
      ? `10. Membimbing peserta didik merumuskan representasi solusi, bagan alir, atau notasi algoritma terstruktur pada LKPD.`
      : mapel.toLowerCase().includes('bahasa')
      ? `10. Membimbing peserta didik menganalisis struktur wacana, kaidah kebahasaan, dan perumusan gagasan pada LKPD.`
      : mapel.toLowerCase().includes('biologi') || mapel.toLowerCase().includes('ipa') || mapel.toLowerCase().includes('sains') || mapel.toLowerCase().includes('fisika') || mapel.toLowerCase().includes('kimia')
      ? `10. Membimbing peserta didik menganalisis data observasi ekosistem/gejala alam, merumuskan hipotesis, dan memvalidasi temuan pada LKPD.`
      : `10. Membimbing peserta didik menganalisis materi/studi kasus, merumuskan gagasan, dan menyusun solusi terstruktur pada LKPD.`;

    const siswaStep9 = isInfo
      ? `9. Merumuskan struktur solusi, notasi prosedural, dan representasi diagram/algoritma secara sistematis dan rapi.`
      : mapel.toLowerCase().includes('bahasa')
      ? `9. Menganalisis struktur wacana, merumuskan gagasan, dan menyusun karya terstruktur secara sistematis dan rapi.`
      : mapel.toLowerCase().includes('biologi') || mapel.toLowerCase().includes('ipa') || mapel.toLowerCase().includes('sains') || mapel.toLowerCase().includes('fisika') || mapel.toLowerCase().includes('kimia')
      ? `9. Menganalisis data observasi ekosistem/gejala alam, merumuskan hipotesis, dan menyusun laporan penyelidikan secara sistematis dan rapi.`
      : `9. Menganalisis materi/studi kasus, merumuskan gagasan, dan menyusun solusi terstruktur secara sistematis dan rapi.`;

    list.push({
      pertemuanKe: i,
      topik: `${topik} — Sesi ${i}: Fokus ${kwStr}`,
      alokasiWaktu: alloc.displayString,
      praktikPedagogis: model,
      materiPembelajaran: generateDynamicMateriABCDF(topik, i, numPertemuan, mapel),
      langkah: [
        {
          tahap: 'KEGIATAN AWAL (Pendahuluan)',
          alokasiWaktu: meetingTimes.pendahuluan,
          aktivitasGuru: `1. Menyapa peserta didik dengan hangat, memimpin doa bersama, dan mengecek presensi kehadiran.\n2. Mengondisikan kesiapan fisik dan psikis peserta didik agar fokus mengikuti proses pembelajaran.\n3. Memberikan apersepsi visual kontekstual yang berkaitan erat dengan konsep ${kwStr}.\n4. Mengajukan pertanyaan pemantik: "Bagaimana prinsip ${kwPrimary} dapat membantu kita menyelesaikan masalah kontekstual secara efisien?"\n5. Menggali pengalaman dan pemahaman awal peserta didik seputar ${kwPrimary}.\n6. Menyampaikan Alur Tujuan Pembelajaran (ATP), indikator ketercapaian, serta skenario aktivitas kolaboratif Sesi ${i}.\n7. Menjelaskan rubrik penilaian unjuk kerja dan format tagihan lembar kerja kelompok.`,
          aktivitasSiswa: `1. Berdoa secara khidmat dan merespons presensi guru dengan santun.\n2. Merapikan ruang belajar dan menyiapkan perangkat kerja serta alat tulis untuk berdiskusi.\n3. Mengamati stimulus apersepsi dan aktif merespons pertanyaan awal dari guru.\n4. Menjawab pertanyaan pemantik berdasarkan pemikiran kritis dan pengetahuan awal mengenai ${kwPrimary}.\n5. Mengemukakan gagasan terkait penerapan ${kwPrimary} dalam kehidupan sehari-hari.\n6. Memahami target pencapaian pembelajaran dan alur pengerjaan tugas Sesi ${i}.\n7. Menyimak kriteria rubrik penilaian unjuk kerja yang dipaparkan oleh guru.`,
          prinsipPembelajaran: 'Berkesadaran & Bermakna'
        },
        {
          tahap: 'KEGIATAN INTI - Orientasi Masalah & Penyelidikan Kelompok (PBL)',
          alokasiWaktu: meetingTimes.inti,
          aktivitasGuru: `1. Menyajikan studi kasus otentik berbasis Deep Learning yang berpusat pada materi ${kwStr}.\n2. Memandu peserta didik mengidentifikasi variabel utama, kondisi batasan, dan target penyelesaian masalah.\n3. Membagi peserta didik ke dalam kelompok heterogen (4-5 siswa) dan membagikan LKPD Sesi ${i}.\n4. Membimbing kelompok membagi peran kerja (ketua, analis materi, perancang prosedur/alur, juru bicara).\n5. Memaparkan konsep teoretis mendalam mengenai karakteristik dan alur kerja ${kwStr}.\n6. Memberikan contoh konkret penerapan prosedur penyelesaian masalah untuk kasus ${kwPrimary}.\n7. Memfasilitasi penyelidikan kelompok dalam mengeksplorasi dan membedah skenario studi kasus LKPD.\n8. Memberikan scaffolding dan bimbingan terarah bagi kelompok yang menghadapi hambatan konseptual.\n9. Memantau dinamika kolaborasi kelompok dan memastikan partisipasi aktif seluruh anggota tim.\n${guruStep10}\n11. Mengarahkan perwakilan kelompok mempresentasikan hasil pemecahan masalah di depan kelas.\n12. Memandu sesi tanya jawab dan peer-review antarkelompok guna menguji keandalan solusi yang diajukan.\n13. Memberikan penguatan komprehensif, mengapresiasi inovasi kelompok, dan meluruskan miskonsepsi materi.`,
          aktivitasSiswa: `1. Mengamati dan menelaah studi kasus nyata mengenai ${kwStr} dengan seksama.\n2. Mengidentifikasi variabel kunci, aturan pemrosesan, dan kriteria keberhasilan solusi.\n3. Berkumpul bersama kelompok kerja yang telah dibentuk dan membuka lembar kerja LKPD Sesi ${i}.\n4. Bermusyawarah membagi tugas internal kelompok sesuai pembagian peran yang disepakati.\n5. Menyimak penjelasan konsep materi ${kwStr} dari guru dan mencatat poin-poin esensial.\n6. Menganalisis contoh prosedur kerja serta mengaitkannya dengan tantangan pada LKPD.\n7. Berkolaborasi aktif mendiskusikan langkah penyelesaian masalah dan menguraikan komponen masalah ${kwPrimary}.\n8. Mengajukan pertanyaan konsultatif kepada guru jika menemukan kendala logika atau teknis.\n${siswaStep9}\n10. Melakukan verifikasi dan validasi mandiri terhadap hasil kerja yang dirancang pada lembar kerja.\n11. Perwakilan kelompok memaparkan hasil karya di hadapan kelas dengan percaya diri dan komunikatif.\n12. Peserta didik dari kelompok lain menyimak presentasi secara kritis dan memberikan tanggapan konstruktif.\n13. Mencatat masukan dan penguatan dari guru serta menyempurnakan dokumen portofolio kelompok.`,
          prinsipPembelajaran: 'Memahami & Mengaplikasi'
        },
        {
          tahap: 'KEGIATAN PENUTUP',
          alokasiWaktu: meetingTimes.penutup,
          aktivitasGuru: `1. Bersama peserta didik merumuskan kesimpulan komprehensif mengenai pembelajaran materi ${kwStr}.\n2. Memberikan apresiasi positif atas kolaborasi, dedikasi, dan kualitas penalaran kritis kelompok.\n3. Menginstruksikan peserta didik mengakses Moodle LMS untuk mengunggah berkas LKPD dan mengerjakan kuis reflektif.\n4. Memandu peserta didik melakukan refleksi metakognitif mengenai pemahaman konsep dan strategi belajar.\n5. Menyampaikan gambaran tindak lanjut dan persiapan materi untuk sesi berikutnya.\n6. Memimpin doa penutup pembelajaran dan menyampaikan salam.`,
          aktivitasSiswa: `1. Secara aktif ikut merangkum poin-poin penting dari pembelajaran ${kwStr} hari ini.\n2. Menerima apresiasi dan umpan balik motivasi dari guru dengan antusias.\n3. Mengunggah dokumentasi LKPD ke Moodle LMS dan mengisi instrumen refleksi pembelajaran.\n4. Mengidentifikasi konsep ${kwPrimary} yang telah dipahami secara mendalam dan area yang perlu dieksplorasi lagi.\n5. Mencatat informasi tindak lanjut dan rencana penugasan mandiri.\n6. Berdoa bersama menutup kegiatan belajar dan menjawab salam guru dengan santun.`,
          prinsipPembelajaran: 'Refleksi Diri'
        }
      ]
    });
  }

  return list;
}

/**
 * Strict scrubbing of Informatika-specific banned keywords, raw HTML tags, and typos for all documents
 */
export function scrubNonInformatikaContent<T>(data: T, mapel: string = ''): T {
  const jsonStr = JSON.stringify(data);
  const isInfo = isInformatikaSubject(mapel);
  const phrasing = getActivityPhrasingForSubject(mapel);

  let cleanedStr = jsonStr
    // Strip raw HTML tags e.g. <td colspan=3/>, <tr>, etc.
    .replace(/<td[^>]*colspan[^>]*\/?>/gi, '\\n---\\n')
    .replace(/<th[^>]*colspan[^>]*\/?>/gi, '\\n---\\n')
    .replace(/<hr\s*\/?>/gi, '\\n---\\n')
    .replace(/<\/?(?:tr|td|th|table|p|div|span|br)[^>]*>/gi, ' ')
    // Fix gelar with double dots e.g. S..T.P. or S..Pd.
    .replace(/S\.\.T\.P/g, 'S.T.P.')
    .replace(/S\.\.Pd/g, 'S.Pd.')
    .replace(/M\.\.Pd/g, 'M.Pd.')
    .replace(/S\.\.Kom/g, 'S.Kom.')
    .replace(/M\.\.Kom/g, 'M.Kom.')
    .replace(/S\.\.Si/g, 'S.Si.')
    .replace(/M\.\.Si/g, 'M.Si.')
    .replace(/S\.\.Sos/g, 'S.Sos.')
    .replace(/Dra\.\./g, 'Dra.')
    .replace(/Drs\.\./g, 'Drs.')
    .replace(/Dr\.\./g, 'Dr.')
    .replace(/\.{2,}/g, '.')
    // Fix contextual typos e.g. pertaian -> pertanian
    .replace(/\bpertaian\b/gi, (m) => (m[0] === 'P' ? 'Pertanian' : 'pertanian'))
    .replace(/\bpembelajran\b/gi, (m) => (m[0] === 'P' ? 'Pembelajaran' : 'pembelajaran'))
    .replace(/\bperancanagan\b/gi, (m) => (m[0] === 'P' ? 'Perancangan' : 'perancangan'))
    .replace(/\bidentifkasi\b/gi, (m) => (m[0] === 'I' ? 'Identifikasi' : 'identifikasi'))
    .replace(/\bkomprehenif\b/gi, (m) => (m[0] === 'K' ? 'Komprehensif' : 'komprehensif'));

  if (!isInfo) {
    cleanedStr = cleanedStr
      .replace(/📌\s*Kerangka Konsep, Formulasi & Alur Pembelajaran:\s*📌\s*Kerangka Konsep & Alur Analisis:/gi, '📌 Kerangka Konsep & Alur Analisis:')
      .replace(/📌\s*Kerangka Konsep, Formulasi & Alur Pembelajaran:/gi, '📌 Kerangka Konsep & Alur Analisis:')
      .replace(/📐\s*Notasi Logika\s*\/\s*Contoh Struktur:/gi, '📌 Kerangka Konsep & Alur Analisis:')
      .replace(/merumuskan alur algoritma\/solusi terstruktur/gi, `${phrasing.klausaSiswa} dan menyusun karya terstruktur`)
      .replace(/merumuskan alur algoritma dan solusi terstruktur/gi, `${phrasing.klausaSiswa} dan menyusun karya terstruktur`)
      .replace(/alur algoritma\/solusi terstruktur/gi, `${phrasing.klausaSiswa} terstruktur`)
      .replace(/merumuskan representasi solusi, bagan alir, atau notasi terstruktur/gi, 'merumuskan representasi solusi, alur analisis, dan gagasan terstruktur')
      .replace(/struktur solusi, notasi prosedural, dan representasi diagram/gi, `${phrasing.klausaSiswa} dan karya terstruktur`)
      .replace(/Dampak Sosial Informatika/gi, 'Dinamika Konseptual Terapan')
      .replace(/Berpikir Komputasional/gi, 'Penalaran Berbasis Deep Learning')
      .replace(/Computational Thinking/gi, 'Penalaran Terstruktur')
      .replace(/Notasi Logika, Algoritma & Pseudocode/gi, 'Kerangka Konsep & Alur Analisis')
      .replace(/Notasi Logika/gi, 'Kerangka Konsep & Alur Analisis')
      .replace(/Notasi Algoritma/gi, 'Alur Prosedur Terstruktur')
      .replace(/Pseudocode/gi, 'Alur Prosedur Kerja')
      .replace(/pseudocode/gi, 'alur prosedur kerja')
      .replace(/Snippet Kode/gi, 'Uraian Prosedural')
      .replace(/Pemrograman/gi, 'Penerapan Praktik')
      .replace(/Inisialisasi Parameter/gi, 'Pemetaan Parameter Awal')
      .replace(/Variabel Input-Output Program/gi, 'Parameter Masukan & Hasil');
  }

  try {
    return JSON.parse(cleanedStr);
  } catch {
    return data;
  }
}

/**
 * Validates and injects ATP, Ringkasan Materi, and PertemuanList structure into RPM document if missing or count mismatched
 */
export function ensureRpmWithAtp(rpmData: Partial<RpmDoc>, metadata: Partial<IdentitasRPM> = {}): RpmDoc {
  const mapel = metadata.mataPelajaran || rpmData.identitas?.mataPelajaran || 'Informatika';
  const numPertemuan = Math.max(1, parseInt(String(metadata.jumlahPertemuan || rpmData.identitas?.jumlahPertemuan || '2'), 10) || 2);
  const defaultAtp = generateDefaultAtpItems(metadata);
  const defaultMateri = generateDefaultMateriItems(metadata);
  const defaultPertemuan = generateDefaultPertemuanList(metadata);

  const existingAtp = Array.isArray(rpmData.alurTujuanPembelajaran) && rpmData.alurTujuanPembelajaran.length === numPertemuan
    ? rpmData.alurTujuanPembelajaran
    : defaultAtp;

  const existingMateri = Array.isArray(rpmData.ringkasanMateri) && rpmData.ringkasanMateri.length === numPertemuan
    ? rpmData.ringkasanMateri
    : defaultMateri;

  const existingPertemuan = Array.isArray(rpmData.pertemuanList) && rpmData.pertemuanList.length === numPertemuan
    ? rpmData.pertemuanList
    : defaultPertemuan;

  const doc = {
    ...rpmData,
    docType: 'rpm',
    identitas: rpmData.identitas || (metadata as IdentitasRPM),
    capaianPembelajaran: rpmData.capaianPembelajaran || metadata.cp || '',
    alurTujuanPembelajaran: existingAtp,
    ringkasanMateri: existingMateri,
    tujuanPembelajaran: rpmData.tujuanPembelajaran && rpmData.tujuanPembelajaran.length === numPertemuan
      ? rpmData.tujuanPembelajaran
      : existingAtp.map((item) => `${item.kodeTp}: ${item.tujuanPembelajaran}`),
    pemahamanBermakna: rpmData.pemahamanBermakna || '',
    pertanyaanPemantik: rpmData.pertanyaanPemantik || [],
    pertemuanList: existingPertemuan,
    kegiatanPembelajaran: rpmData.kegiatanPembelajaran || [],
    asesmenRencana: rpmData.asesmenRencana || { awal: '', proses: '', akhir: '' },
    pengayaanRemedial: rpmData.pengayaanRemedial || { pengayaan: '', remedial: '' },
  } as RpmDoc;

  return scrubNonInformatikaContent(doc, mapel);
}



