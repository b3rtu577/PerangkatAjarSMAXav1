import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { buildUniversalCtPrompt, buildUnifiedAllDocsPrompt } from "./src/services/rpmPrompt";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

function parseAlokasiWaktuToMinutes(alokasiStr: string): number {
  if (!alokasiStr) return 80;
  const str = alokasiStr.toLowerCase().trim();

  // 1. JP format: "2 x 40 menit", "3 x 40", "2*40", "2x40", "2 JP x 40 menit"
  const matchJP = str.match(/(\d+)\s*(?:jp)?\s*[xX×*]\s*(\d+)/i);
  if (matchJP) {
    const jp = parseInt(matchJP[1], 10);
    const minsPerJp = parseInt(matchJP[2], 10);
    if (jp > 0 && minsPerJp > 0) return jp * minsPerJp;
  }

  // 2. Hours & Minutes format
  let totalMin = 0;
  let hasHoursOrMins = false;

  const jamMatch = str.match(/(\d+(?:[\.,]\d+)?)\s*jam/i);
  if (jamMatch) {
    const hours = parseFloat(jamMatch[1].replace(',', '.'));
    totalMin += Math.round(hours * 60);
    hasHoursOrMins = true;
  }

  const menitMatch = str.match(/(\d+)\s*(?:menit|men|m\b)/i);
  if (menitMatch) {
    totalMin += parseInt(menitMatch[1], 10);
    hasHoursOrMins = true;
  }

  if (hasHoursOrMins && totalMin > 0) {
    return totalMin;
  }

  // 3. Plain number format: "80", "100", "120"
  const plainMatch = str.match(/^(\d+)$/);
  if (plainMatch) {
    return parseInt(plainMatch[1], 10);
  }

  return 80;
}

interface MeetingAllocation {
  meetingJp?: number;
  minsPerJp?: number;
  meetingMinutes: number;
  displayString: string;
}

// Helper untuk membagi total alokasi waktu secara proporsional ke tiap pertemuan
function calculateMeetingAllocations(alokasiStr: string, numPertemuan: number): MeetingAllocation[] {
  const numP = Math.max(1, numPertemuan);
  const str = (alokasiStr || "").toLowerCase().trim();

  // 1. Format JP: e.g. "4 x 45", "4 jp x 45 menit", "4*45", "2 × 40"
  const matchJP = str.match(/(\d+)\s*(?:jp)?\s*[xX×*]\s*(\d+)/i);

  if (matchJP) {
    const totalJp = parseInt(matchJP[1], 10);
    const minsPerJp = parseInt(matchJP[2], 10);

    if (totalJp > 0 && minsPerJp > 0) {
      const baseJp = Math.floor(totalJp / numP);
      const remainderJp = totalJp % numP;

      const result: MeetingAllocation[] = [];
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

  // 2. Format Menit Polos / Jam
  const totalMins = parseAlokasiWaktuToMinutes(alokasiStr);
  const baseMins = Math.floor(totalMins / numP);
  const remainderMins = totalMins % numP;

  const result: MeetingAllocation[] = [];
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

// Dynamic Sub-Materi Keyword Helpers for Strict Input Anchoring
function extractSubMateriKeywords(topikStr?: string): string[] {
  if (!topikStr) return ['Konsep Dasar', 'Mekanisme & Karakteristik'];
  const cleaned = topikStr
    .replace(/^topik\s*:\s*/i, '')
    .replace(/^materi\s*:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const rawParts = cleaned.split(/[,;\n\/\+&]|\s+dan\s+|\s+serta\s+|\s+atau\s+/i);
  const parts = rawParts
    .map((p) => p.replace(/^[-*•\d\.\s)]+/, '').trim())
    .filter((p) => p.length >= 2 && !/^(dan|serta|atau|dengan|dalam|pada|tentang|materi|konsep)$/i.test(p));

  const validKeywords = parts.length > 0 ? parts : [cleaned];
  return validKeywords.map((kw) => {
    return kw.charAt(0).toUpperCase() + kw.slice(1);
  });
}

function getKeywordsForMeeting(keywords: string[], meetingIndex: number, totalMeetings: number): string[] {
  if (!keywords || keywords.length === 0) return ['Konsep & Karakteristik Materi'];
  if (totalMeetings <= 1) return keywords;
  const kwPerMeeting = Math.ceil(keywords.length / totalMeetings);
  const start = meetingIndex * kwPerMeeting;
  const sliced = keywords.slice(start, start + kwPerMeeting);
  if (sliced.length > 0) return sliced;
  return [keywords[meetingIndex % keywords.length]];
}

function generateDynamicMateriABCDF(
  topikStr: string = 'Konsep dan Penerapan Materi',
  meetingNum: number = 1,
  totalMeetings: number = 2
): Array<{ abjad: string; judul: string; deskripsi: string }> {
  const allKeywords = extractSubMateriKeywords(topikStr);
  const currentMeetingKws = getKeywordsForMeeting(allKeywords, meetingNum - 1, totalMeetings);
  const kwPrimary = currentMeetingKws[0] || topikStr;
  const kwSecondary = currentMeetingKws[1] || `Aplikasi Terpadu ${kwPrimary}`;
  const kwStr = currentMeetingKws.join(' dan ');

  const isSearching = currentMeetingKws.some((k) => k.toLowerCase().includes('search'));
  const isSorting = currentMeetingKws.some((k) => k.toLowerCase().includes('sort'));
  const isQueue = currentMeetingKws.some((k) => k.toLowerCase().includes('queue'));
  const isStack = currentMeetingKws.some((k) => k.toLowerCase().includes('stack'));

  if (isSearching && isSorting) {
    return [
      {
        abjad: 'A',
        judul: 'Dekomposisi Struktur Masalah: Konsep Dasar Searching & Sorting',
        deskripsi:
          'Membedah permasalahan pencarian dan pengurutan data menjadi komponen terkelola: Linear Search (pencarian sekuensial pada data acak) dan Binary Search (pencarian biner interval pada data terurut) serta ragam metode Sorting (Bubble Sort, Selection Sort, Merge Sort).'
      },
      {
        abjad: 'B',
        judul: 'Pengenalan Pola: Keteraturan Data & Efisiensi Kompleksitas Waktu',
        deskripsi:
          'Menganalisis pola pergeseran indeks, perbandingan elemen bertetangga, strategi divide and conquer, serta perbandingan kurva kompleksitas waktu O(n) vs O(log n) vs O(n²).'
      },
      {
        abjad: 'C',
        judul: 'Abstraksi: Isolasi Variabel Kunci (Array, Low, Mid, High, Pivot)',
        deskripsi:
          'Menyaring variabel penentu penting seperti batas indeks rentang pencarian, elemen pivot, dan flag status penemuan nilai target tanpa terganggu oleh detail data yang tidak relevan.'
      },
      {
        abjad: 'D',
        judul: 'Perancangan Algoritma: Notasi Pseudocode & Diagram Alir ISO Searching & Sorting',
        deskripsi:
          'Menyusun alur instruksi terstruktur langkah demi langkah menggunakan diagram alir standar ISO 5807 dan pseudocode baku dengan kondisi terminasi (break) yang presisi.'
      },
      {
        abjad: 'E',
        judul: 'Studi Kasus Kontekstual: Sistem Indeks Pencarian Produk Cepat E-Commerce',
        deskripsi:
          'Penerapan integrasi algoritma sorting dan binary searching dalam menangani optimasi pencarian katalog produk berskala jutaan baris data pada sistem basis data modern.'
      },
      {
        abjad: 'F',
        judul: 'Simulasi Dry-Run, Trace Table & Evaluasi Efisiensi Logika',
        deskripsi:
          'Melakukan pengujian manual langkah demi langkah pergeseran indeks array, menghitung jumlah perbandingan (comparison count), menguji kasus batas (edge cases), dan merefleksikan keakuratan solusi.'
      }
    ];
  }

  if (isQueue && isStack) {
    return [
      {
        abjad: 'A',
        judul: 'Dekomposisi Struktur Data Linier: Queue (Antrean) & Stack (Tumpukan)',
        deskripsi:
          'Membedah struktur antrean dan tumpukan ke dalam sub-elemen penyusun: kapasitas buffer, pointer penunjuk (Front, Rear, Top of Stack), dan data kontainer berbasis array/linked list.'
      },
      {
        abjad: 'B',
        judul: 'Pengenalan Pola: Prinsip FIFO (First-In, First-Out) vs LIFO (Last-In, First-Out)',
        deskripsi:
          'Mengidentifikasi pola keteraturan aliran data di mana antrean memproses elemen pertama yang masuk (FIFO) sedangkan tumpukan memproses elemen terakhir yang ditambahkan (LIFO).'
      },
      {
        abjad: 'C',
        judul: 'Abstraksi: Pemodelan Kondisi Batas (IsFull, IsEmpty, Overflow, Underflow)',
        deskripsi:
          'Mengisolasi status kritis kapasitas struktur data dan memodelkan deteksi batas aman memori guna mencegah terjadinya runtime error stack underflow atau queue buffer overflow.'
      },
      {
        abjad: 'D',
        judul: 'Perancangan Algoritma: Operasi Primitif (Enqueue, Dequeue, Push, Pop, Peek)',
        deskripsi:
          'Menyusun prosedur terstruktur pemanipulasian pointer dan transfer nilai data menggunakan sintaks pseudocode dan diagram alir berstandar industri.'
      },
      {
        abjad: 'E',
        judul: 'Studi Kasus Kontekstual: Printer Spooling Queue & Mekanisme Undo-Redo Editor',
        deskripsi:
          'Penerapan prinsip Queue pada manajemen antrean cetak dokumen terdistribusi dan Stack pada sistem navigasi riwayat web browser serta fitur pembatalan perintah dokumen.'
      },
      {
        abjad: 'F',
        judul: 'Simulasi Pengujian Memori, Trace Table & Sintesis Solusi',
        deskripsi:
          'Melakukan penelusuran status buffer array saat serangkaian instruksi push/pop dan enqueue/dequeue dieksekusi secara dinamis beserta validasi efisiensi penggunaan memori.'
      }
    ];
  }

  // Universal Subject Domain (Biologi, Ekonomi, Fisika, Matematika, Kimia, Bahasa, dll.)
  return [
    {
      abjad: 'A',
      judul: `Dekomposisi Masalah & Konsep Inti: ${kwPrimary}`,
      deskripsi:
        `Menerapkan dekomposisi untuk membedah struktur konsep ${kwPrimary} menjadi sub-komponen terkelola, menguraikan definisi formal, karakteristik esensial, dan parameter pembentuknya secara utuh.`
    },
    {
      abjad: 'B',
      judul: `Pengenalan Pola, Keteraturan & Prinsip Kerja: ${kwPrimary}`,
      deskripsi:
        `Mengidentifikasi pola keteraturan, relasi sebab-akibat, tren, dan mekanisme kerja fundamental yang menghubungkan elemen-elemen dalam topik ${kwPrimary}.`
    },
    {
      abjad: 'C',
      judul: `Abstraksi, Isolasi Variabel Kunci & Pemodelan: ${kwSecondary}`,
      deskripsi:
        `Memusatkan perhatian pada variabel/parameter penentu utama ${kwSecondary}, mengabaikan detail non-esensial, dan merumuskan model representasi konseptual yang representatif.`
    },
    {
      abjad: 'D',
      judul: `Perancangan Algoritma, Prosedur Kerja & Bagan Alur Terstruktur`,
      deskripsi:
        `Menyusun langkah-langkah prosedural penyelesaian masalah secara logis dan terurut, bagan alur proses, notasi formal, atau panduan kerja sistematis untuk memecahkan persoalan ${kwStr}.`
    },
    {
      abjad: 'E',
      judul: `Studi Kasus Kontekstual Dunia Nyata (Deep Learning)`,
      deskripsi:
        `Penerapan terpadu 4 pilar berpikir komputasional (Dekomposisi, Pola, Abstraksi, Algoritma) pada topik ${kwStr} dalam menyelesaikan tantangan nyata di lingkungan masyarakat dan industri modern.`
    },
    {
      abjad: 'F',
      judul: `Simulasi Pengujian Solusi (Dry-Run), Validasi & Refleksi Metakognitif`,
      deskripsi:
        `Pengujian kebenaran langkah solusi pada berbagai kondisi data dan kasus batas, evaluasi efisiensi hasil pemecahan masalah, dan refleksi metakognitif menyeluruh.`
    }
  ];
}

function ensureValidRpmData(parsedData: any, metadata: any) {
  if (!parsedData || parsedData.docType !== 'rpm') return parsedData;

  const numPertemuan = parseInt(metadata.jumlahPertemuan || "1", 10) || 1;
  const alokasiStr = metadata.alokasiWaktu || "2 x 40 Menit";
  const allocations = calculateMeetingAllocations(alokasiStr, numPertemuan);
  const topikName = metadata.topik || "Materi Pembelajaran";
  const modelName = metadata.modelPembelajaran || "Problem Based Learning (PBL) & Deep Learning";
  const allKeywords = extractSubMateriKeywords(topikName);

  // Extract class grade number (e.g., "10", "11", "12")
  const kelasMatch = (metadata.kelas || "").match(/(?:Kelas|Fase)?\s*(10|11|12|X|XI|XII)/i);
  let gradeCode = "10";
  if (kelasMatch) {
    const v = kelasMatch[1].toUpperCase();
    if (v === "XI" || v === "11") gradeCode = "11";
    else if (v === "XII" || v === "12") gradeCode = "12";
    else gradeCode = "10";
  }

  if (!Array.isArray(parsedData.pertemuanList) || parsedData.pertemuanList.length === 0) {
    parsedData.pertemuanList = [];
  }

  while (parsedData.pertemuanList.length < numPertemuan) {
    const pIndex = parsedData.pertemuanList.length + 1;
    const alloc = allocations[pIndex - 1] || allocations[allocations.length - 1];
    parsedData.pertemuanList.push({
      pertemuanKe: pIndex,
      topik: `${topikName} - Sesi ${pIndex}`,
      alokasiWaktu: alloc.displayString,
      praktikPedagogis: modelName,
      materiPembelajaran: [],
      langkah: []
    });
  }

  if (parsedData.pertemuanList.length > numPertemuan) {
    parsedData.pertemuanList = parsedData.pertemuanList.slice(0, numPertemuan);
  }

  parsedData.pertemuanList.forEach((p: any, idx: number) => {
    const pNum = idx + 1;
    const alloc = allocations[idx] || allocations[allocations.length - 1];
    const meetingMins = alloc.meetingMinutes;
    const currentKws = getKeywordsForMeeting(allKeywords, idx, numPertemuan);
    const kwStr = currentKws.join(' dan ');

    p.pertemuanKe = pNum;
    if (!p.topik) p.topik = `${topikName} — Sesi ${pNum}: Fokus ${kwStr}`;
    
    p.alokasiWaktu = alloc.displayString;
    if (!p.praktikPedagogis) p.praktikPedagogis = modelName;

    // Ensure 6 detailed sections for Materi Pembelajaran (A, B, C, D, E, F) matching user keywords
    if (!Array.isArray(p.materiPembelajaran) || p.materiPembelajaran.length < 6) {
      p.materiPembelajaran = generateDynamicMateriABCDF(topikName, pNum, numPertemuan);
    }

    // Hitung pembagian waktu tahap (Pendahuluan, Inti, Penutup)
    let awalMin = Math.round(meetingMins * 0.15);
    let penutupMin = Math.round(meetingMins * 0.15);
    if (meetingMins <= 40) {
      awalMin = 5;
      penutupMin = 5;
    } else if (awalMin < 5) {
      awalMin = 5;
      penutupMin = 5;
    }
    const intiMin = meetingMins - awalMin - penutupMin;

    if (!Array.isArray(p.langkah) || p.langkah.length === 0) {
      p.langkah = [
        {
          tahap: "KEGIATAN AWAL (Pendahuluan)",
          alokasiWaktu: `${awalMin} Menit`,
          aktivitasGuru: `1. Menyapa peserta didik dengan hangat, memimpin doa bersama, dan mengecek presensi kehadiran.\n2. Mengondisikan kesiapan fisik dan psikis peserta didik agar fokus mengikuti proses pembelajaran.\n3. Memberikan apersepsi visual kontekstual yang berkaitan erat dengan konsep ${kwStr}.\n4. Mengajukan pertanyaan pemantik: "Bagaimana prinsip ${currentKws[0] || kwStr} dapat membantu kita menyelesaikan masalah kontekstual secara efisien?"\n5. Menggali pengalaman dan pemahaman awal peserta didik seputar ${currentKws[0] || kwStr}.\n6. Menyampaikan Alur Tujuan Pembelajaran (ATP), indikator ketercapaian, serta skenario aktivitas kolaboratif Sesi ${pNum}.\n7. Menjelaskan rubrik penilaian unjuk kerja dan format tagihan lembar kerja kelompok.`,
          aktivitasSiswa: `1. Berdoa secara khidmat dan merespons presensi guru dengan santun.\n2. Merapikan ruang belajar dan menyiapkan perangkat kerja serta alat tulis untuk berdiskusi.\n3. Mengamati stimulus apersepsi dan aktif merespons pertanyaan awal dari guru.\n4. Menjawab pertanyaan pemantik berdasarkan pemikiran kritis dan pengetahuan awal mengenai ${currentKws[0] || kwStr}.\n5. Mengemukakan gagasan terkait penerapan ${currentKws[0] || kwStr} dalam kehidupan sehari-hari.\n6. Memahami target pencapaian pembelajaran dan alur pengerjaan tugas Sesi ${pNum}.\n7. Menyimak kriteria rubrik penilaian unjuk kerja yang dipaparkan oleh guru.`,
          prinsipPembelajaran: "Berkesadaran & Bermakna"
        },
        {
          tahap: "KEGIATAN INTI - Orientasi Masalah & Penyelidikan Kelompok (PBL)",
          alokasiWaktu: `${intiMin} Menit`,
          aktivitasGuru: `1. Menyajikan studi kasus otentik berbasis Deep Learning yang berpusat pada materi ${kwStr}.\n2. Memandu peserta didik mengidentifikasi variabel utama, kondisi batasan, dan target penyelesaian masalah.\n3. Membagi peserta didik ke dalam kelompok heterogen (4-5 siswa) dan membagikan LKPD Sesi ${pNum}.\n4. Membimbing kelompok membagi peran kerja (ketua, analis materi, perancang prosedur/alur, juru bicara).\n5. Memaparkan konsep teoretis mendalam mengenai karakteristik, notasi, dan alur kerja ${kwStr}.\n6. Memberikan contoh konkret penerapan prosedur penyelesaian masalah untuk kasus ${currentKws[0] || kwStr}.\n7. Memfasilitasi penyelidikan kelompok dalam mengeksplorasi dan membedah skenario studi kasus LKPD.\n8. Memberikan scaffolding dan bimbingan terarah bagi kelompok yang menghadapi hambatan konseptual.\n9. Memantau dinamika kolaborasi kelompok dan memastikan partisipasi aktif seluruh anggota tim.\n10. Membimbing peserta didik merumuskan representasi solusi, bagan alir, atau notasi terstruktur pada LKPD.\n11. Mengarahkan perwakilan kelompok mempresentasikan hasil pemecahan masalah di depan kelas.\n12. Memandu sesi tanya jawab dan peer-review antarkelompok guna menguji keandalan solusi yang diajukan.\n13. Memberikan penguatan komprehensif, mengapresiasi inovasi kelompok, dan meluruskan miskonsepsi materi.`,
          aktivitasSiswa: `1. Mengamati dan menelaah studi kasus nyata mengenai ${kwStr} dengan seksama.\n2. Mengidentifikasi variabel kunci, aturan pemrosesan, dan kriteria keberhasilan solusi.\n3. Berkumpul bersama kelompok kerja yang telah dibentuk dan membuka lembar kerja LKPD Sesi ${pNum}.\n4. Bermusyawarah membagi tugas internal kelompok sesuai pembagian peran yang disepakati.\n5. Menyimak penjelasan konsep materi ${kwStr} dari guru dan mencatat poin-poin esensial.\n6. Menganalisis contoh notasi dan prosedur kerja serta mengaitkannya dengan tantangan pada LKPD.\n7. Berkolaborasi aktif mendiskusikan langkah penyelesaian masalah dan menguraikan komponen masalah ${currentKws[0] || kwStr}.\n8. Mengajukan pertanyaan konsultatif kepada guru jika menemukan kendala logika atau teknis.\n9. Merumuskan struktur solusi, notasi prosedural, dan representasi diagram secara sistematis dan rapi.\n10. Melakukan verifikasi dan pengujian mandiri terhadap alur solusi yang dirancang pada lembar kerja.\n11. Perwakilan kelompok memaparkan hasil karya di hadapan kelas dengan percaya diri dan komunikatif.\n12. Peserta didik dari kelompok lain menyimak presentasi secara kritis dan memberikan tanggapan konstruktif.\n13. Mencatat masukan dan penguatan dari guru serta menyempurnakan dokumen portofolio kelompok.`,
          prinsipPembelajaran: "Memahami & Mengaplikasi"
        },
        {
          tahap: "KEGIATAN PENUTUP",
          alokasiWaktu: `${penutupMin} Menit`,
          aktivitasGuru: `1. Bersama peserta didik merumuskan kesimpulan komprehensif mengenai pembelajaran materi ${kwStr}.\n2. Memberikan apresiasi positif atas kolaborasi, dedikasi, dan kualitas penalaran kritis kelompok.\n3. Menginstruksikan peserta didik mengakses Moodle LMS untuk mengunggah berkas LKPD dan mengerjakan kuis reflektif.\n4. Memandu peserta didik melakukan refleksi metakognitif mengenai pemahaman konsep dan strategi belajar.\n5. Menyampaikan gambaran tindak lanjut dan persiapan materi untuk sesi berikutnya.\n6. Memimpin doa penutup pembelajaran dan menyampaikan salam.`,
          aktivitasSiswa: `1. Secara aktif ikut merangkum poin-poin penting dari pembelajaran ${kwStr} hari ini.\n2. Menerima apresiasi dan umpan balik motivasi dari guru dengan antusias.\n3. Mengunggah dokumentasi LKPD ke Moodle LMS dan mengisi instrumen refleksi pembelajaran.\n4. Mengidentifikasi konsep ${currentKws[0] || kwStr} yang telah dipahami secara mendalam dan area yang perlu dieksplorasi lagi.\n5. Mencatat informasi tindak lanjut dan rencana penugasan mandiri.\n6. Berdoa bersama menutup kegiatan belajar dan menjawab salam guru dengan santun.`,
          prinsipPembelajaran: "Refleksi Diri"
        }
      ];
    } else {
      // Clean up tahap labels to prevent duplicate duration strings
      p.langkah.forEach((l: any) => {
        if (l.tahap) {
          l.tahap = l.tahap.replace(/\s*\(\s*\d+\s*(?:x\s*\d+\s*)?Menit\s*\)/gi, '').trim();
        }
      });
      let sumMinutes = 0;
      p.langkah.forEach((l: any) => {
        const m = (l.alokasiWaktu || "").match(/(\d+)/);
        if (m) sumMinutes += parseInt(m[1], 10);
      });

      if (sumMinutes !== meetingMins) {
        const diff = meetingMins - sumMinutes;
        const intiStep = p.langkah.find((l: any) => (l.tahap || "").toUpperCase().includes("INTI")) || p.langkah[1] || p.langkah[0];
        if (intiStep) {
          const currentM = (intiStep.alokasiWaktu || "").match(/(\d+)/);
          const currentInti = currentM ? parseInt(currentM[1], 10) : Math.max(10, meetingMins - 20);
          const newInti = Math.max(10, currentInti + diff);
          intiStep.alokasiWaktu = `${newInti} Menit`;
        }
      }
    }
  });

  // Ensure structured Alur Tujuan Pembelajaran (ATP) matches numPertemuan strictly and anchors to keywords
  if (!Array.isArray(parsedData.alurTujuanPembelajaran) || parsedData.alurTujuanPembelajaran.length !== numPertemuan) {
    parsedData.alurTujuanPembelajaran = [];

    for (let i = 1; i <= numPertemuan; i++) {
      const alloc: MeetingAllocation = allocations[i - 1] || allocations[allocations.length - 1] || {
        meetingJp: 2,
        minsPerJp: 45,
        meetingMinutes: 90,
        displayString: "2 JP (90 Menit)"
      };
      const jpStr = alloc.meetingJp ? `${alloc.meetingJp} JP (${alloc.meetingMinutes} Menit)` : alloc.displayString;
      const currentKws = getKeywordsForMeeting(allKeywords, i - 1, numPertemuan);
      const kwPrimary = currentKws[0] || topikName;
      const kwStr = currentKws.join(' dan ');

      const isSearching = currentKws.some(k => k.toLowerCase().includes('search'));
      const isSorting = currentKws.some(k => k.toLowerCase().includes('sort'));
      const isQueue = currentKws.some(k => k.toLowerCase().includes('queue'));
      const isStack = currentKws.some(k => k.toLowerCase().includes('stack'));

      let tpText = '';
      let indikators: string[] = [];

      if (isSearching && isSorting) {
        tpText = `Peserta didik mampu menganalisis konsep dan algoritma Searching dan Sorting, memahami mekanisme kerja Linear Search, Binary Search, serta ragam metode Sorting (Bubble Sort, Selection Sort, Merge Sort), dan merancang representasi algoritma pemecahan masalah secara terstruktur.`;
        indikators = [
          `1. Menganalisis perbedaan karakteristik, alur kerja, dan efisiensi Linear Search dan Binary Search dalam pencarian data.`,
          `2. Mengimplementasikan algoritma Sorting (Bubble Sort, Selection Sort, atau Insertion Sort) secara terstruktur menggunakan diagram alir dan pseudocode.`,
          `3. Menguji keakuratan dan efisiensi algoritma Searching dan Sorting menggunakan simulasi trace table pada berbagai skenario data uji.`
        ];
      } else if (isQueue && isStack) {
        tpText = `Peserta didik mampu menganalisis struktur data linier Queue (Antrean) dan Stack (Tumpukan), memahami prinsip FIFO dan LIFO beserta operasi primitifnya (Enqueue, Dequeue, Push, Pop), serta merancang dan menguji penerapannya dalam memecahkan persoalan komputasional kontekstual.`;
        indikators = [
          `1. Menjelaskan prinsip kerja struktur data Queue (First-In, First-Out / FIFO), pergerakan pointer Front & Rear, serta operasi Enqueue dan Dequeue.`,
          `2. Menjelaskan prinsip kerja struktur data Stack (Last-In, First-Out / LIFO), pergerakan pointer Top, serta operasi Push, Pop, dan Peek.`,
          `3. Merancang simulasi dan diagram alur pemanfaatan Queue dan Stack pada kasus nyata (seperti antrean printer dan mekanisme undo-redo) serta memvalidasi keandalannya.`
        ];
      } else {
        tpText = `Peserta didik mampu menganalisis konsep ${kwStr}, mengidentifikasi karakteristik dan prinsip kerjanya, serta merancang prosedur pemecahan masalah kontekstual yang sistematis dan teruji.`;
        indikators = [
          `1. Menguraikan definisi, karakteristik fundamental, dan prinsip kerja ${kwPrimary} secara komprehensif.`,
          `2. Merancang formulasi, prosedur terstruktur, atau representasi model untuk memecahkan persoalan ${kwStr}.`,
          `3. Menguji kebenaran solusi, mengevaluasi efisiensi hasil, dan merefleksikan penerapan ${kwPrimary} dalam kehidupan nyata.`
        ];
      }

      parsedData.alurTujuanPembelajaran.push({
        kodeTp: `TP ${gradeCode}.${i}`,
        tujuanPembelajaran: tpText,
        indikatorKetercapaian: indikators,
        alokasiWaktuJp: jpStr,
        pertemuanKe: i,
        fokusMateri: `Fokus Sesi ${i}: ${kwStr}`,
        korelasiDokumen: {
          lkpd: `Aktivitas LKPD Sesi ${i} (${kwStr})`,
          moodle: `Modul H5P & Diskusi Sesi ${i} (${kwPrimary})`,
          asesmen: `Asesmen Formatif & Unjuk Kerja Sesi ${i}`
        }
      });
    }
  }

  // Ensure ringkasanMateri matches numPertemuan strictly
  if (!Array.isArray(parsedData.ringkasanMateri) || parsedData.ringkasanMateri.length !== numPertemuan) {
    parsedData.ringkasanMateri = [];
    for (let i = 1; i <= numPertemuan; i++) {
      const currentKws = getKeywordsForMeeting(allKeywords, i - 1, numPertemuan);
      const kwPrimary = currentKws[0] || topikName;
      const kwStr = currentKws.join(' dan ');

      const isSearching = currentKws.some(k => k.toLowerCase().includes('search'));
      const isSorting = currentKws.some(k => k.toLowerCase().includes('sort'));
      const isQueue = currentKws.some(k => k.toLowerCase().includes('queue'));
      const isStack = currentKws.some(k => k.toLowerCase().includes('stack'));

      if (isSearching && isSorting) {
        parsedData.ringkasanMateri.push({
          pertemuanKe: i,
          topikMateri: `Bahan Ajar Pertemuan ${i}: Konsep & Algoritma Searching dan Sorting`,
          konsepKunci: [
            'Searching (Pencarian Data): Linear Search (pencarian sekuensial O(n)) dan Binary Search (pencarian biner interval O(log n) dengan prasyarat data terurut).',
            'Sorting (Pengurutan Data): Ragam metode Bubble Sort (pertukaran elemen bertetangga), Selection Sort (pencarian nilai ekstrem), dan Insertion Sort.',
            'Analisis Efisiensi & Kasus Uji: Evaluasi kompleksitas komputasi, operasi pertukaran, dan validasi trace table.'
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
  KEMBALIKAN -1 // Data tidak ditemukan`,
          studiKasusKontekstual: 'Pengelolaan Indeks Pencarian Cepat dan Pengurutan Harga Produk pada Sistem Katalog E-Commerce.',
          tipsRefleksi: 'Pastikan selalu memvalidasi apakah data telah terurut sebelum mengeksekusi algoritma Binary Search.'
        });
      } else if (isQueue && isStack) {
        parsedData.ringkasanMateri.push({
          pertemuanKe: i,
          topikMateri: `Bahan Ajar Pertemuan ${i}: Struktur Data Linier Queue dan Stack`,
          konsepKunci: [
            'Queue (Struktur Antrean FIFO): Prinsip First-In First-Out dikelola melalui pointer Front dan Rear.',
            'Operasi Primitif Queue: Enqueue (penambahan data di Rear) dan Dequeue (pengambilan data di Front) serta mitigasi Overflow/Underflow.',
            'Stack (Struktur Tumpukan LIFO): Prinsip Last-In First-Out berpusat pada satu ujung tunggal yaitu Top of Stack.',
            'Operasi Primitif Stack: Push (menumpuk elemen baru), Pop (mengambil elemen Top), serta Peek.'
          ],
          rangkumanTeori:
            'Queue dan Stack merupakan struktur data linier mendasar dalam ilmu komputer dengan aturan akses khusus. Queue menerapkan keadilan antrean berbasis waktu kedatangan (FIFO), sangat ideal untuk penjadwalan proses CPU, buffering data transmisi jaringan, dan antrean pencetakan dokumen. Sebaliknya, Stack menerapkan keterbalikan urutan (LIFO), sangat esensial dalam eksekusi pemanggilan fungsi bersarang (call stack recursion), evaluasi ekspresi aritmatika, serta fungsionalitas pembatalan perintah (Undo/Redo) pada aplikasi modern.',
          contohNotasi: `// OPERASI QUEUE (FIFO) & STACK (LIFO)
PROSEDUR Enqueue(elemen) -> antrean[rear++] <- elemen
FUNGSI Dequeue() -> KEMBALIKAN antrean[front++]
PROSEDUR Push(elemen) -> tumpukan[++top] <- elemen
FUNGSI Pop() -> KEMBALIKAN tumpukan[top--]`,
          studiKasusKontekstual: 'Manajemen Antrean Cetak Dokumen Terdistribusi (Queue Spooler) dan Mekanisme Undo-Redo Editor (Stack).',
          tipsRefleksi: 'Selalu lakukan pengecekan kondisi batas IsEmpty sebelum memanggil fungsi Pop atau Dequeue guna mencegah kesalahan runtime.'
        });
      } else {
        parsedData.ringkasanMateri.push({
          pertemuanKe: i,
          topikMateri: `Bahan Ajar Pertemuan ${i}: Eksplorasi Konsep & Implementasi ${kwStr}`,
          konsepKunci: currentKws.map((k) => `${k}: Definisi formal, karakteristik operasional, dan prinsip kerja komputasional.`),
          rangkumanTeori: `Pada pertemuan ke-${i}, proses pembelajaran berfokus secara mendalam pada analisis dan implementasi ${kwStr}. Peserta didik menguraikan landasan teoretis, menganalisis struktur alur kerja, merumuskan model penyelesaian masalah, serta memvalidasi hasil melalui studi kasus nyata yang otentik.`,
          contohNotasi: `// Representasi Notasi & Formulasi Prosedural (${kwPrimary}):
1. Inisialisasi parameter masukan dan kondisi awal ${kwPrimary}.
2. Eksekusi alur kerja terstruktur untuk memproses ${kwPrimary}.
3. Validasi hasil luaran terhadap target pemecahan masalah.`,
          studiKasusKontekstual: `Penerapan konsep ${kwStr} dalam menyelesaikan tantangan nyata di lingkungan masyarakat dan industri modern.`,
          tipsRefleksi: `Cermati setiap variabel kunci dan pastikan seluruh tahapan solusi dirancang secara runtut dan teruji.`
        });
      }
    }
  }

  return parsedData;
}

// Helper function to generate rich structured fallback data for any document type
function generateFallbackDocData(docType: string, metadata: any) {
  const sekolah = metadata.sekolah || "SMA Xaverius 1 Palembang";
  const guru = metadata.guru || "Guru Pengampu";
  const nipGuru = metadata.nipGuru || "-";
  const kepalaSekolah = metadata.kepalaSekolah || "Kepala Sekolah";
  const nipKepalaSekolah = metadata.nipKepalaSekolah || "-";
  const mataPelajaran = metadata.mataPelajaran || "Informatika";
  const kelas = metadata.kelas || "Kelas XI / Fase F";
  const topik = metadata.topik || "Berpikir Kritis & Algoritma";
  const jumlahPertemuan = metadata.jumlahPertemuan || "1";
  const alokasiWaktu = metadata.alokasiWaktu || "2 x 40 Menit";
  const cp = metadata.cp || "Pada akhir fase ini, peserta didik mampu memahami dan menerapkan konsep.";
  const modelPembelajaran = metadata.modelPembelajaran || "Problem Based Learning (PBL)";

  if (docType === "rpm") {
    return ensureValidRpmData({
      docType: "rpm",
      identitas: {
        sekolah, guru, nipGuru, kepalaSekolah, nipKepalaSekolah,
        mataPelajaran, kelas, topik, jumlahPertemuan, alokasiWaktu, cp, modelPembelajaran
      },
      capaianPembelajaran: cp,
      tujuanPembelajaran: [
        `Melalui model ${modelPembelajaran}, peserta didik dapat menganalisis konsep ${topik} secara kritis dan mendalam.`,
        `Peserta didik dapat mengidentifikasi variabel dan memecahkan permasalahan nyata terkait ${topik}.`,
        `Peserta didik dapat menyusun dan mempresentasikan solusi sistematis berbasis kerja kelompok.`
      ],
      pemahamanBermakna: `Pemahaman mendalam tentang ${topik} membantu peserta didik berpikir logis, terstruktur, dan solutif dalam menghadapi tantangan di kehidupan sehari-hari maupun dunia kerja.`,
      pertanyaanPemantik: [
        `Bagaimana konsep ${topik} dapat digunakan untuk menyelesaikan permasalahan sehari-hari?`,
        `Tahapan apa yang paling krusial ketika Anda dihadapkan pada masalah kompleks dengan banyak variabel?`
      ],
      pertemuanList: [],
      asesmenRencana: {
        awal: "Pertanyaan pemantik & kuis singkat pemahaman awal.",
        proses: "Observasi keaktifan diskusi kelompok, keakuratan analisis pada LKPD, dan penilaian kinerja presentasi.",
        akhir: "Soal evaluasi sumatif berbasis studi kasus / essay pemecahan masalah."
      },
      pengayaanRemedial: {
        pengayaan: "Pemberian studi kasus kompleks tingkat lanjut bagi peserta didik yang mencapai KKTP.",
        remedial: "Bimbingan perorangan/kelompok kecil terkait konsep dasar yang belum dikuasai."
      }
    }, metadata);
  }

  if (docType === "lkpd") {
    const numPertemuan = parseInt(jumlahPertemuan || "2", 10) || 2;
    const allocations = calculateMeetingAllocations(alokasiWaktu, numPertemuan);

    const pertemuanList = Array.from({ length: numPertemuan }, (_, idx) => {
      const pNum = idx + 1;
      const alloc = allocations[idx] || allocations[allocations.length - 1];
      
      if (pNum === 1) {
        return {
          pertemuanKe: 1,
          waktu: alloc.displayString || "2 JP (90 Menit)",
          subJudul: `Pertemuan 1: Dekomposisi & Analisis Masalah Awal pada ${topik}`,
          tujuanAktivitas: [
            `Menganalisis dan membedah permasalahan kompleks terkait ${topik} menjadi komponen-komponen mendasar (Dekomposisi Masalah).`,
            "Mengidentifikasi variabel kunci, data relevan, dan memisahkan faktor non-esensial dari sistem masalah (Abstraksi Data).",
            "Merumuskan keterkaitan hubungan sebab-akibat antar komponen dalam skenario dunia nyata (Deep Learning: Memahami & Mengaitkan)."
          ],
          petunjukPengerjaan: [
            `Bacalah teks stimulus studi kasus kontekstual mengenai ${topik} dengan saksama bersama seluruh anggota kelompok.`,
            "Diskusikan pertanyaan analisis pada Kegiatan 1 (Memahami & Mengaitkan) secara mendalam dan catat hasil penalaran kelompok.",
            "Lakukan investigasi praktikum pada Kegiatan 2 dan lengkapi Tabel Isian Kerja Siswa secara sistematis dan terperinci.",
            "Tarik kesimpulan bersama dan tuliskan refleksi pemahaman bermakna sebelum mempresentasikan hasil unjuk kerja."
          ],
          stimulusMaterial: `Dalam era transformasi digital saat ini, penerapan ${topik} kerap menghadapi tantangan inefisiensi akibat data yang belum terstruktur dan ambiguitas penentuan variabel keputusan. Sebagai contoh kasus pada lingkungan nyata, ketidaksiapan alur kerja mengakibatkan redundansi pemrosesan dan keterlambatan respon sistem hingga 40%. Sebuah tim pengembang ditugaskan untuk melakukan audit sistem secara menyeluruh guna memetakan batasan masalah, memisahkan parameter kritis (seperti input valid, ambang batas kondisi, dan output yang diharapkan), serta merumuskan cetak biru solusi awal yang kokoh dan adaptif.`,
          kegiatan1Memahami: {
            judul: "Kegiatan 1: Investigasi Masalah Kontekstual & Penalaran Kritis (HOTS)",
            deskripsi: "Berdasarkan stimulus studi kasus di atas, diskusikan dan jawablah pertanyaan analisis mendalam berikut:",
            pertanyaanHots: [
              `Lakukan dekomposisi masalah: Identifikasi minimal 3 akar penyebab utama timbulnya inefisiensi pada skenario ${topik} di atas!`,
              "Mengapa pemisahan antara variabel esensial dan data non-esensial (abstraksi) sangat menentukan keberhasilan perancangan solusi teknis?",
              "Bagaimana keterkaitan antara parameter masukan (input) dengan ketepatan hasil keputusan sistem pada kondisi beban puncak?",
              "Rumuskan satu hipotesis solusi awal yang menurut kelompok Anda paling efektif mengatasi hambatan tersebut secara berkelanjutan!"
            ]
          },
          kegiatan2Menerapkan: {
            judul: "Kegiatan 2: Pemetaan Komponen Sistem & Tabel Isian Analisis Kelompok",
            instruksiTugas: "Lakukan analisis pemilahan variabel dan isi tabel kerja berikut berdasarkan hasil musyawarah kelompok:",
            tabelIsian: [
              {
                no: 1,
                komponen: "Identifikasi Variabel Input & Kondisi Awal",
                instruksiAnalisis: `Sebutkan seluruh data/parameter yang harus dimasukkan ke dalam sistem ${topik}.`,
                ruangJawaban: ""
              },
              {
                no: 2,
                komponen: "Batasan Sistem & Batas Kritis (Constraints)",
                instruksiAnalisis: "Tentukan aturan validasi, limitasi kapasitas, dan kondisi pengecualian yang harus diantisipasi.",
                ruangJawaban: ""
              },
              {
                no: 3,
                komponen: "Dekomposisi Sub-Proses Utama (IPO Flow)",
                instruksiAnalisis: "Uraikan tahapan pemrosesan logika dari input mentah hingga menjadi informasi terverifikasi.",
                ruangJawaban: ""
              },
              {
                no: 4,
                komponen: "Spesifikasi Output & Kriteria Keberhasilan Solusi",
                instruksiAnalisis: "Jelaskan format keluaran dan tolok ukur bahwa solusi berhasil memecahkan masalah.",
                ruangJawaban: ""
              }
            ]
          },
          aktivitasSiswa: [
            {
              no: 1,
              tugas: "Analisis Dekomposisi & Pemetaan Variabel Kunci",
              instruksi: `Diskusikan akar permasalahan dan petakan komponen utama ${topik} pada lembar kerja.`,
              ruangJawaban: ""
            },
            {
              no: 2,
              tugas: "Pengisian Matriks Analisis Sistem & Perumusan Hipotesis",
              instruksi: "Lengkapi tabel isian kerja siswa dan rumuskan kesepakatan solusi kelompok.",
              ruangJawaban: ""
            }
          ],
          pertanyaanDiskusi: [
            "Bagaimana kelompok Anda memvalidasi bahwa dekomposisi masalah yang dibuat telah mencakup seluruh aspek krusial?",
            "Apa konsekuensi logis jika ada variabel pembatas yang terabaikan pada tahap analisis awal ini?"
          ],
          refleksiSiswa: `Melalui pembelajaran Sesi 1 pada materi ${topik}, kami memahami bahwa ketajaman dekomposisi masalah menjadi fondasi utama dalam merancang sistem komputasi yang efisien, bebas celah, dan bernilai guna bagi masyarakat.`,
          kesimpulan: `Dekomposisi dan abstraksi data memungkinkan kita mengurai kompleksitas ${topik} menjadi sub-masalah yang terukur dan siap ditransformasikan ke dalam algoritma solusi pada pertemuan berikutnya.`,
          rubrikSkor: [
            { kriteria: "Ketajaman Analisis Dekomposisi Kasus (Kegiatan 1)", skorMaks: 30 },
            { kriteria: "Kelengkapan & Ketepatan Tabel Isian Komponen (Kegiatan 2)", skorMaks: 40 },
            { kriteria: "Kualitas Kolaborasi, Refleksi & Penarikan Kesimpulan", skorMaks: 30 }
          ]
        };
      } else if (pNum === 2) {
        return {
          pertemuanKe: 2,
          waktu: alloc.displayString || "2 JP (90 Menit)",
          subJudul: `Pertemuan 2: Perancangan Algoritma Terstruktur, Diagram Alir & Simulasi Kasus pada ${topik}`,
          tujuanAktivitas: [
            "Mengenali pola relasional dan merancang alur logika terstruktur (Flowchart ISO 5807 / Pseudocode) berbasis hasil analisis Pertemuan 1.",
            "Melakukan simulasi penelusuran manual (dry-run trace table) untuk membuktikan validitas eksekusi logika dalam berbagai kondisi uji coba.",
            "Menerapkan solusi komputasional terpadu dalam pemecahan masalah kontekstual nyata (Deep Learning: Menerapkan Solusi)."
          ],
          petunjukPengerjaan: [
            "Gunakan hasil pemetaan variabel dari Pertemuan 1 sebagai masukan utama perancangan algoritma.",
            "Jawablah pertanyaan telaah logika pada Kegiatan 1 untuk memantapkan alur percabangan dan perulangan.",
            "Rancang diagram alir atau notasi pseudocode dan lakukan pengujian kasus ekstrem pada tabel Kegiatan 2.",
            "Diskusikan hasil verifikasi trace table dan rumuskan simpulan akhir performa solusi kelompok."
          ],
          stimulusMaterial: `Menindaklanjuti temuan dekomposisi Pertemuan 1, tim pengembang melangkah ke tahap perancangan logika eksekusi ${topik}. Algoritma yang dirancang harus mampu menangani variasi data reguler maupun skenario data ekstrem (corner cases) tanpa mengalami crash atau infinite loop. Sistem wajib memiliki struktur kendali keputusan (IF-THEN-ELSE) yang lugas dan efisien, serta terdokumentasi rapi dalam bentuk diagram alir standar dan tabel penelusuran (trace table) sebelum diimplementasikan ke dalam kode program yang sesungguhnya.`,
          kegiatan1Memahami: {
            judul: "Kegiatan 1: Telaah Logika Kontrol & Pola Algoritma (HOTS)",
            deskripsi: "Berdasarkan stimulus dan kebutuhan solusi, lakukan penalaran terstruktur terhadap aspek logika berikut:",
            pertanyaanHots: [
              `Bagaimana Anda menstrukturkan kondisi percabangan (decision) agar seluruh kemungkinan skenario input pada ${topik} tertangani dengan aman?`,
              "Mengapa penelusuran jejak logika (dry-run trace table) wajib dilakukan sebelum algoritma diimplementasikan ke dalam bahasa pemrograman?",
              "Analisis potensi kesalahan logika (logical bug) yang mungkin terjadi jika urutan instruksi kondisional terbalik!",
              "Bagaimana rancangan algoritma Anda memastikan kompleksitas waktu dan penggunaan memori tetap efisien?"
            ]
          },
          kegiatan2Menerapkan: {
            judul: "Kegiatan 2: Perancangan Alur Solusi & Tabel Penelusuran Logika (Trace Table)",
            instruksiTugas: "Rancanglah diagram alir / pseudocode terstruktur dan buktikan kebenarannya pada tabel penelusuran berikut:",
            tabelIsian: [
              {
                no: 1,
                komponen: "Rancangan Pseudocode / Notasi Algoritma",
                instruksiAnalisis: `Tuliskan urutan instruksi logika utama (Deklarasi, Input, Proses Seleksi/Loop, Output) untuk ${topik}.`,
                ruangJawaban: ""
              },
              {
                no: 2,
                komponen: "Simulasi Kasus Uji Normal (Happy Path Test)",
                instruksiAnalisis: "Masukkan sampel nilai variabel normal dan telusuri nilai perubahan state variabel hingga output selesai.",
                ruangJawaban: ""
              },
              {
                no: 3,
                komponen: "Simulasi Kasus Uji Ekstrem / Batas (Edge Cases)",
                instruksiAnalisis: "Ujilah dengan nilai batas (nilai 0, negatif, data kosong, atau nilai maksimum) dan catat respon algoritma.",
                ruangJawaban: ""
              },
              {
                no: 4,
                komponen: "Evaluasi Ketahanan Logika & Rekomendasi Optimasi",
                instruksiAnalisis: "Jelaskan apakah ada loop/kondisi yang dapat disederhanakan untuk meningkatkan kecepatan eksekusi.",
                ruangJawaban: ""
              }
            ]
          },
          aktivitasSiswa: [
            {
              no: 1,
              tugas: "Perancangan Diagram Alir (Flowchart) & Pseudocode Logika",
              instruksi: `Susun diagram alir sesuai standar ISO dan pseudocode terstruktur untuk menyelesaikan masalah ${topik}.`,
              ruangJawaban: ""
            },
            {
              no: 2,
              tugas: "Pengujian Validitas Logika dengan Dry-Run Trace Table",
              instruksi: "Lakukan simulasi pengujian langkah per langkah dan catat nilai variabel pada tabel verifikasi.",
              ruangJawaban: ""
            }
          ],
          pertanyaanDiskusi: [
            "Bagian alur mana yang paling rentan terhadap kesalahan logika dan bagaimana kelompok Anda mengamankannya?",
            "Bagaimana algoritma yang Anda rancang mampu beradaptasi jika ada penambahan fitur atau batasan baru di masa depan?"
          ],
          refleksiSiswa: `Melalui pengerjaan LKPD Pertemuan 2, kami menyadari bahwa algoritma yang handal tidak hanya berfokus pada hasil yang benar, melainkan pada struktur logika yang bersih, teruji terhadap kasus ekstrem, dan mudah dipahami oleh anggota tim.`,
          kesimpulan: `Rancangan flowchart dan pseudocode yang terverifikasi melalui trace table memberikan kepastian bahwa solusi terhadap ${topik} dapat dieksekusi secara presisi, efektif, dan minim galat.`,
          rubrikSkor: [
            { kriteria: "Kualitas Notasi Pseudocode / Diagram Alir (Kegiatan 1 & 2)", skorMaks: 35 },
            { kriteria: "Ketepatan Simulasi Kasus Uji & Trace Table (Kegiatan 2)", skorMaks: 35 },
            { kriteria: "Ketajaman Evaluasi, Refleksi Diri & Kesimpulan", skorMaks: 30 }
          ]
        };
      } else {
        return {
          pertemuanKe: pNum,
          waktu: alloc.displayString || "2 JP (90 Menit)",
          subJudul: `Pertemuan ${pNum}: Evaluasi Solusi, Optimasi Kinerja & Gelar Karya pada ${topik}`,
          tujuanAktivitas: [
            "Menguji efisiensi komparatif solusi terhadap beban kerja berulang dan variasi skenario skala menengah hingga besar.",
            "Menyusun rekomendasi optimasi sistem, dokumentasi teknis, dan portofolio solusi terpadu.",
            "Mempresentasikan hasil karya investigasi kelompok secara komunikatif dan beretika."
          ],
          petunjukPengerjaan: [
            "Lakukan audit komparatif terhadap model solusi yang telah dirancang.",
            "Jawablah pertanyaan evaluasi pada Kegiatan 1 dan lengkapi matriks audit kinerja pada Kegiatan 2.",
            "Susun ringkasan rekomendasi akhir dan lakukan penilaian antarteman."
          ],
          stimulusMaterial: `Tahap akhir dari siklus pengembangan solusi ${topik} adalah pengujian performa menyeluruh, audit efisiensi penggunaan sumber daya, serta penyusunan laporan pertanggungjawaban karya komputasional. Setiap kelompok ditantang untuk membuktikan bahwa karya mereka siap diterapkan dalam lingkungan nyata.`,
          kegiatan1Memahami: {
            judul: "Kegiatan 1: Audit Komparasi Efisiensi & Ketahanan Solusi (HOTS)",
            deskripsi: "Diskusikan dan analisislah efisiensi arsitektur solusi kelompok Anda:",
            pertanyaanHots: [
              `Bandingkan efisiensi solusi kelompok Anda dengan pendekatan alternatif lain dalam memecahkan masalah ${topik}!`,
              "Parameter apa saja yang menjadi indikator utama performa kecepatan dan keandalan sistem?",
              "Bagaimana strategi penanganan galat (error handling) yang diterapkan jika terjadi kegagalan input?",
              "Refleksikan dampak sosial atau etis dari implementasi teknologi ini bagi pengguna akhir!"
            ]
          },
          kegiatan2Menerapkan: {
            judul: "Kegiatan 2: Matriks Audit Kinerja & Portofolio Gelar Karya",
            instruksiTugas: "Isilah tabel audit performa solusi berikut sebelum mempresentasikan hasil unjuk kerja:",
            tabelIsian: [
              {
                no: 1,
                komponen: "Metrik Efisiensi Waktu & Langkah Eksekusi",
                instruksiAnalisis: "Hitung perkiraan jumlah operasi logika untuk dataset berukuran kecil vs besar.",
                ruangJawaban: ""
              },
              {
                no: 2,
                komponen: "Ketahanan Terhadap Kesalahan Pengguna (User Error Handling)",
                instruksiAnalisis: "Jelaskan mekanisme proteksi sistem terhadap input salah format atau di luar jangkauan.",
                ruangJawaban: ""
              },
              {
                no: 3,
                komponen: "Rekomendasi Skalabilitas & Pengembangan Lanjut",
                instruksiAnalisis: "Tuliskan 2 ide pengembangan fitur di masa depan jika sistem diintegrasikan ke platform luas.",
                ruangJawaban: ""
              }
            ]
          },
          aktivitasSiswa: [
            {
              no: 1,
              tugas: "Pengujian Komparasi Kinerja & Audit Efisiensi",
              instruksi: "Lakukan analisis perbandingan performa solusi pada lembar kerja.",
              ruangJawaban: ""
            },
            {
              no: 2,
              tugas: "Penyusunan Portofolio Akhir & Gelar Karya",
              instruksi: "Lengkapi lembar kesimpulan dan siapkan materi presentasi kelompok.",
              ruangJawaban: ""
            }
          ],
          pertanyaanDiskusi: [
            "Apa umpan balik paling konstruktif yang diterima dari kelompok lain saat presentasi?",
            "Bagaimana kelompok Anda mengintegrasikan saran perbaikan tersebut ke dalam rancangan akhir?"
          ],
          refleksiSiswa: `Kami belajar bahwa proses rekayasa solusi bukan sekadar membuat program berjalan, melainkan menghasilkan karya yang teroptimasi, ramah pengguna, dan berintegritas tinggi.`,
          kesimpulan: `Portofolio solusi yang disusun secara sistematis membuktikan penguasaan utuh terhadap konsep dan penerapan ${topik}.`,
          rubrikSkor: [
            { kriteria: "Kualitas Audit Efisiensi & Analisis Komparatif", skorMaks: 35 },
            { kriteria: "Kelengkapan Matriks Kerja & Solusi Portofolio", skorMaks: 35 },
            { kriteria: "Komunikasi Presentasi & Refleksi Kritis", skorMaks: 30 }
          ]
        };
      }
    });

    return {
      docType: "lkpd",
      judul: "LEMBAR KERJA PESERTA DIDIK (LKPD)",
      subJudul: `${topik} — Pendekatan Pembelajaran Mendalam (Deep Learning)`,
      jumlahPertemuan: numPertemuan,
      identitas: {
        sekolah, mataPelajaran, kelas, topik, waktu: alokasiWaktu
      },
      pertemuanList,
      tujuanAktivitas: [
        `Menganalisis konsep dan permasalahan nyata terkait ${topik} secara kritis.`,
        "Merancang alur solusi logika komputasional terstruktur dan terverifikasi.",
        "Mengembangkan kemandirian bernalar kritis, kreativitas pemecahan masalah, dan kolaborasi tim."
      ],
      petunjukPengerjaan: [
        "Bacalah setiap bagian LKPD dengan cermat bersama kelompok Anda.",
        "Diskusikan pertanyaan penyelidikan dan tuliskan hasil analisis pada lembar pengerjaan.",
        "Lakukan verifikasi silang antar anggota kelompok sebelum menyimpulkan hasil karya."
      ]
    };
  }

  if (docType === "moodle") {
    const numPertemuan = parseInt(jumlahPertemuan || "1", 10) || 1;
    const sesiElearning = Array.from({ length: numPertemuan }, (_, idx) => {
      const pNum = idx + 1;
      if (pNum === 1) {
        return {
          pertemuanKe: 1,
          namaSesi: `Sesi 1: Dekomposisi & Abstraksi Masalah — ${topik}`,
          jenisAktivitas: ["Forum Diskusi Kelompok (Moodle Forum)", "Assignment Unggah LKPD P1 (File PDF)"],
          formatPengumpulan: "File PDF (Maksimal 5MB)",
          tenggatWaktu: "H+3 Setelah Pertemuan 1 (Pukul 23.59 WIB)",
          instruksi: [
            `Unduh dan pelajari slide materi serta modul ${topik}.`,
            "Diskusikan identifikasi akar masalah pada Forum Diskusi Kelompok Sesi 1.",
            "Setiap anggota wajib memberikan minimal 1 tanggapan argumentatif.",
            "Unggah hasil pengerjaan LKPD Pertemuan 1 dalam format PDF."
          ],
          bahanSupport: [
            `Slide Presentasi ${topik} (PDF)`,
            "Lembar Kerja Peserta Didik (LKPD) P1",
            "Video Pengantar Studi Kasus"
          ]
        };
      } else if (pNum === 2) {
        return {
          pertemuanKe: 2,
          namaSesi: `Sesi 2: Pengenalan Pola & Perancangan Algoritma — ${topik}`,
          jenisAktivitas: ["Assignment Unggah Flowchart / Solusi (Submission)", "Workshop Konsultasi & Peer-Review"],
          formatPengumpulan: "File PDF / Gambar Diagram (Maksimal 5MB)",
          tenggatWaktu: "H+3 Setelah Pertemuan 2 (Pukul 23.59 WIB)",
          instruksi: [
            "Rancang diagram alir (Flowchart) dan algoritma berdasarkan temuan Sesi 1.",
            "Gunakan aplikasi diagram seperti Draw.io atau Canva.",
            "Unggah file diagram alir pada portal Submission Sesi 2.",
            "Berikan masukan konstruktif pada karya minimal 1 kelompok rekan sejawat."
          ],
          bahanSupport: [
            "Modul Simbol Standar Flowchart & Logika IF-ELSE",
            "Tautan Web Draw.io / Flowchart Builder",
            "Contoh Studi Kasus Solusi Komputasional"
          ]
        };
      } else {
        return {
          pertemuanKe: pNum,
          namaSesi: `Sesi ${pNum}: Pengujian, Evaluasi Solusi & Kuis Online — ${topik}`,
          jenisAktivitas: ["Kuis Online Formatif (Moodle Quiz)", "Assignment Portofolio Laporan Final & Video"],
          formatPengumpulan: "Pengerjaan Kuis Interaktif & File PDF Portofolio",
          tenggatWaktu: `H+7 Setelah Pertemuan ${pNum} (Pukul 23.59 WIB)`,
          instruksi: [
            "Kerjakan Kuis Evaluasi Moodle yang terdiri dari 10 butir soal pilihan ganda berbasis analisis studi kasus.",
            "Lakukan uji coba kasus ekstrem (dry-run) terhadap diagram alir kelompok dan catat hasil evaluasinya.",
            "Kompilasikan seluruh laporan P1-P3 dan cantumkan tautan video presentasi kelompok.",
            "Kumpulkan laporan portofolio final pada portal Assignment Sesi ini sebelum batas akhir."
          ],
          bahanSupport: [
            "Bank Soal Kuis Moodle: Evaluasi Pemahaman Konsep",
            "Template Dokumen Portofolio Laporan Akhir (DOCX/PDF)",
            "Rubrik Penilaian Presentasi & Unjuk Kerja"
          ]
        };
      }
    });

    return {
      docType: "moodle",
      namaAktivitas: `Panduan & Struktur Aktivitas E-Learning LMS: ${topik}`,
      platform: "Moodle LMS / Google Classroom",
      jenisAktivitas: "Assignment, Forum Diskusi & Kuis Online",
      deskripsiRingkas: `Panduan e-learning ${numPertemuan} sesi terintegrasi Kurikulum Merdeka untuk memfasilitasi pembelajaran mandiri, kolaborasi kelompok asinkron, dan asesmen digital pada topik ${topik}.`,
      jumlahPertemuan: numPertemuan,
      identitas: {
        sekolah: sekolah || "SMA Xaverius 1 Palembang",
        mataPelajaran,
        kelas,
        topik
      },
      sesiElearning,
      kriteriaKeberhasilan: [
        "Berpartisipasi aktif dalam forum diskusi kelompok dengan minimal 1 respon mandiri dan 1 tanggapan rekan.",
        "Mengumpulkan seluruh tugas LKPD, diagram alir, dan laporan portofolio tepat waktu sesuai format berkas.",
        "Mencapai skor kriteria ketuntasan tujuan pembelajaran (KKTP >= 75) pada kuis evaluasi formatif Moodle.",
        "Menunjukkan keterampilan kolaborasi digital dan pemikiran kritis dalam menyelesaikan masalah."
      ],
      petunjukPenilaian: "Penilaian dilakukan secara terpadu mencakup keaktifan forum LMS, ketepatan analisis tugas, dan evaluasi kuis.",
      footer: `CopyRight©Norbertus Suryadi — ${sekolah || "SMA Xaverius 1 Palembang"} | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning`
    };
  }

  if (docType === "asesmen") {
    return {
      docType: "asesmen",
      judul: "INSTRUMEN ASESMEN & EVALUASI PEMBELAJARAN LENGKAP",
      asesmenAwal: {
        teknik: "Tes Diagnostik Kognitif (5 Pilihan Ganda Singkat A-E)",
        soalPg: [
          {
            no: 1,
            pertanyaan: `Manakah dari langkah berikut yang merupakan tahapan awal paling tepat dalam metode Berpikir Komputasional saat menghadapi masalah kompleks terkait ${topik}?`,
            pilihan: {
              A: "Langsung menulis baris kode program secara tergesa-gesa.",
              B: "Mendekomposisi (memecah) masalah besar menjadi bagian-bagian sub-masalah yang lebih kecil dan terkelola.",
              C: "Mengabaikan detail masalah dan menebak solusi akhir secara intuitif.",
              D: "Menjalankan program komputer tanpa membuat perencanaan diagram alir terlebih dahulu.",
              E: "Membeli perangkat keras komputer baru dengan spesifikasi paling tinggi."
            },
            kunciJawaban: "B",
            penjelasan: "Dekomposisi adalah pilar fundamental awal untuk menyederhanakan kompleksitas masalah sebelum ekstraksi pola.",
            indikatorPrasyarat: "Pemahaman Konsep Dasar Dekomposisi Masalah"
          },
          {
            no: 2,
            pertanyaan: "Dalam perancangan bagan alir (flowchart), simbol berbentuk belah ketupat (diamond) digunakan untuk merepresentasikan fungsi...",
            pilihan: {
              A: "Titik awal (Start) atau titik akhir (End) dari suatu alur program.",
              B: "Operasi proses perhitungan matematika atau penugasan variabel nilai.",
              C: "Pengambilan keputusan/kondisi percabangan (Decision) yang menghasilkan nilai logika Benar/Salah (True/False).",
              D: "Pemasukan data manual (Input) atau penampilan hasil keluaran (Output).",
              E: "Pemberian jeda waktu (delay) atau penghentian sementara program."
            },
            kunciJawaban: "C",
            penjelasan: "Simbol belah ketupat merupakan simbol standar ISO untuk percabangan/keputusan logika.",
            indikatorPrasyarat: "Pengenalan Simbol Standar Diagram Alir Logika"
          },
          {
            no: 3,
            pertanyaan: "Jika sebuah kondisi logika bernilai: (15 > 10) AND (8 == 9), maka hasil evaluasi kebenaran logika akhirnya adalah...",
            pilihan: {
              A: "True (Benar)",
              B: "False (Salah)",
              C: "Error (Tidak Terdefinisi)",
              D: "Null (Kosong)",
              E: "Undetermined (Tidak Dapat Ditentukan)"
            },
            kunciJawaban: "B",
            penjelasan: "Operator AND mensyaratkan kedua operand bernilai True. Karena (8 == 9) bernilai False, maka (True AND False) = False.",
            indikatorPrasyarat: "Kesiapan Operasi Logika Boolean (AND/OR/NOT)"
          },
          {
            no: 4,
            pertanyaan: "Teknik mengabaikan informasi atau atribut yang tidak relevan dan hanya memfokuskan perhatian pada data esensial disebut...",
            pilihan: {
              A: "Algoritma Sekuensial",
              B: "Debugging Program",
              C: "Abstraksi (Abstraction)",
              D: "Enkripsi Data",
              E: "Kompilasi Kode Program"
            },
            kunciJawaban: "C",
            penjelasan: "Abstraksi menyaring elemen non-esensial agar model komputasi menjadi fokus dan efisien.",
            indikatorPrasyarat: "Kemampuan Abstraksi Variabel Kritis"
          },
          {
            no: 5,
            pertanyaan: "Berikut ini yang BUKAN merupakan karakteristik dari sebuah algoritma yang baik dan efektif adalah...",
            pilihan: {
              A: "Memiliki instruksi yang jelas, tegas, dan tidak bermakna ganda (Unambiguous).",
              B: "Pasti berhenti setelah sejumlah langkah terhingga dieksekusi (Finiteness).",
              C: "Mengulang langkah tanpa batas (infinite loop) tanpa ada kondisi pemberhentian.",
              D: "Menghasilkan keluaran (output) yang valid dan sesuai dengan spesifikasi masalah.",
              E: "Mempunyai batasan masukan (input) dan keluaran (output) yang terdefinisi dengan presisi."
            },
            kunciJawaban: "C",
            penjelasan: "Algoritma yang baik wajib memiliki sifat keterhinggaan (finiteness) dan tidak boleh terjebak loop tak hingga tanpa syarat henti.",
            indikatorPrasyarat: "Prinsip Keterhinggaan & Validitas Algoritma"
          }
        ]
      },
      asesmenProses: {
        teknik: "Integrasi Aktivitas H5P LMS Moodle & Observasi Unjuk Kerja",
        aktivitasH5P: [
          {
            no: 1,
            jenis: "H5P Drag and Drop",
            judul: `Aktivitas 1: Rekonstruksi Simbol Flowchart & Dekomposisi Variabel (${topik})`,
            deskripsi: "Peserta didik menyusun urutan simbol flowchart dan menempatkan variabel input/kondisi ke dalam drop zone yang tepat pada LMS Moodle.",
            instruksi: "Tarik (drag) kotak simbol terminal, proses, decision, dan I/O dari panel bank komponen, lalu letakkan pada zona alur diagram kasus perhitungan diskon bertingkat.",
            kontenKasus: "Kasus Transaksi E-Commerce: Start -> Masukkan TotalBelanja -> Cek (TotalBelanja >= 500.000) -> Hitung Diskon 15% -> Tampilkan TotalBayar -> End.",
            kunciValidasi: "Skor 100 didapat apabila 6 zona simbol dan 4 variabel terpasang pada urutan logika sekuensial dan percabangan yang valid."
          },
          {
            no: 2,
            jenis: "H5P Fill-in-the-Blanks",
            judul: "Aktivitas 2: Melengkapi Rumpang Pseudocode Percabangan & Logika Komputasi",
            deskripsi: "Peserta didik mengisi kata kunci logika pemrograman (IF, ELSE IF, THEN, RETURN) yang rumpang pada teks pseudocode interaktif di Moodle.",
            instruksi: "Ketik kata kunci atau operator pembanding yang tepat pada kotak isian rumpang yang tersedia di LMS.",
            kontenKasus: "IF (totalBelanja >= 500000) *THEN* diskon = 0.15 *ELSE IF* (isMember == *TRUE*) *THEN* ongkir = 0 *ELSE* diskon = 0 *ENDIF*",
            kunciValidasi: "Sistem LMS Moodle secara otomatis memeriksa kecocokan string kata kunci dan memberikan umpan balik langsung (instant feedback)."
          }
        ],
        lembarObservasi: [
          { indikator: "Partisipasi aktif & inisiatif dalam diskusi kolaboratif kelompok kerja", skorMaks: 4 },
          { indikator: "Kemampuan dekomposisi masalah dan pemilahan variabel kasus kontekstual", skorMaks: 4 },
          { indikator: "Ketepatan perancangan diagram alir (flowchart) menggunakan simbol standar ISO", skorMaks: 4 },
          { indikator: "Keterampilan simulasi pengujian (dry-run) kasus normal dan kondisi ekstrem", skorMaks: 4 },
          { indikator: "Kualitas komunikasi, etika presentasi, dan argumentasi logis atas solusi tim", skorMaks: 4 }
        ]
      },
      asesmenAkhir: {
        teknik: "Tes Sumatif Terpadu (5 PG Kompleks [40%] & 2 Essay Analitis HOTS [60%])",
        bagian1PgKompleks: [
          {
            no: 1,
            stimulus: "Sebuah swalayan menerapkan aturan: Jika total belanja > Rp 200.000 DAN pembeli memiliki Kartu Member, pembeli mendapat diskon 10%. Jika belanja > Rp 500.000 tanpa member, tetap mendapat diskon 5%.",
            pernyataan: "Tentukan kebenaran dari pernyataan-pernyataan berikut berdasarkan aturan bisnis di atas!",
            pilihan: {
              A: "Pembeli non-member dengan belanja Rp 250.000 tidak berhak mendapatkan diskon belanja.",
              B: "Pembeli member dengan belanja Rp 150.000 otomatis mendapatkan diskon 10%.",
              C: "Pembeli member dengan belanja Rp 600.000 berhak mendapatkan diskon 10%.",
              D: "Kondisi percabangan dapat disusun menggunakan struktur IF-ELSE IF bersarang.",
              E: "Pembeli non-member dengan belanja Rp 600.000 mendapatkan diskon 10%."
            },
            tipe: "Pilihan Ganda Kompleks (Analisis Logika)",
            kunciJawaban: "Pernyataan A, C, dan D BENAR; Pernyataan B dan E SALAH.",
            bobot: 8,
            pembahasan: "B salah karena syarat member diskon 10% adalah belanja harus > Rp 200.000; E salah karena non-member > Rp 500.000 hanya berhak diskon 5%."
          },
          {
            no: 2,
            stimulus: "Diberikan pseudocode perulangan:\nSET X = 10, Y = 3\nWHILE (X > Y) DO\n  X = X - 2\n  Y = Y + 1\nENDWHILE\nPRINT X, Y",
            pernyataan: "Nilai akhir variabel X dan Y yang dicetak di layar setelah perulangan selesai adalah...",
            pilihan: {
              A: "X = 6, Y = 5",
              B: "X = 4, Y = 6",
              C: "X = 6, Y = 6",
              D: "X = 8, Y = 4",
              E: "X = 2, Y = 7"
            },
            tipe: "Pilihan Ganda / Dry-Run Trace Table",
            kunciJawaban: "B (X = 4, Y = 6)",
            bobot: 8,
            pembahasan: "Iterasi 1: X=8, Y=4. Iterasi 2: X=6, Y=5. Iterasi 3: 6>5 (True) -> X=4, Y=6. Cek kondisi 4>6 (False) -> Stop. Output X=4, Y=6."
          },
          {
            no: 3,
            stimulus: "Dalam optimasi algoritma pencarian rute terpendek ambulans pada lalu lintas padat kota:",
            pernyataan: "Manakah tindakan dekomposisi dan abstraksi yang paling tepat dilakukan?",
            pilihan: {
              A: "Menghitung warna cat setiap kendaraan yang berpapasan di jalan.",
              B: "Mengabstraksi jalanan menjadi simpul (node) persimpangan dan panjang jalan berbobot kepadatan arus (edge weight).",
              C: "Mendekomposisi rute menjadi sub-segmen jalan utama dan alternatif jalan tikus.",
              D: "Mengabaikan kondisi jalan rusak dan lampu merah demi kecepatan komputasi.",
              E: "Memasukkan data cuaca tahun lalu ke dalam penghitungan jarak langsung."
            },
            tipe: "Pilihan Ganda Kompleks (Multi-Jawaban Benar)",
            kunciJawaban: "B dan C BENAR.",
            bobot: 8,
            pembahasan: "B dan C merupakan abstraksi graf serta dekomposisi segmen rute yang valid dan ilmiah."
          },
          {
            no: 4,
            stimulus: "Perhatikan relasi kompleksitas efisiensi waktu algoritma terhadap jumlah data (N).",
            pernyataan: "Pernyataan yang BENAR mengenai perbandingan efisiensi waktu komputasi adalah...",
            pilihan: {
              A: "Algoritma dengan kompleksitas O(N) selalu lebih lambat daripada O(N²).",
              B: "Algoritma pencarian Binary Search (O(log N)) jauh lebih efisien untuk data besar terurut dibanding Linear Search (O(N)).",
              C: "Pemilihan struktur data array versus hash map tidak mempengaruhi waktu pencarian data.",
              D: "Algoritma yang memiliki waktu eksekusi linear O(N) bertambah secara proporsional seiring bertambahnya data.",
              E: "Algoritma berbobot O(1) kecepatannya menurun drastis ketika data mencapai 1 juta record."
            },
            tipe: "Pilihan Ganda Kompleks",
            kunciJawaban: "B dan D BENAR.",
            bobot: 8,
            pembahasan: "Binary Search memiliki kompleksitas logaritmik O(log N) dan Linear O(N) bertambah proporsional terhadap N."
          },
          {
            no: 5,
            stimulus: "Seorang kasir ingin membuat program pencegahan stok barang minus saat ada 2 pesanan online serentak.",
            pernyataan: "Langkah logika pengkondisian yang wajib disisipkan sebelum proses pengurangan stok terjadi adalah...",
            pilihan: {
              A: "IF (Stok_Tersedia >= Jumlah_Dipesan) THEN Kurangi_Stok() ELSE Tolak_Pesanan().",
              B: "Langsung kurangi stok kemudian cek apakah bernilai minus.",
              C: "Menerapkan penguncian data (locking/atomic check) agar kondisi stok divalidasi sebelum dikurangi.",
              D: "Mengabaikan jumlah pesanan dan selalu menerima seluruh transaksi.",
              E: "Menghapus data pesanan dari database tanpa notifikasi error."
            },
            tipe: "Pilihan Ganda Kompleks (Validasi Logika Sistem)",
            kunciJawaban: "A dan C BENAR.",
            bobot: 8,
            pembahasan: "Validasi pra-kondisi (A) dan concurrency atomic lock (C) mencegah terjadinya inkonsistensi data stok."
          }
        ],
        bagian2EssayHots: [
          {
            no: 1,
            judul: `Studi Kasus 1: Perancangan Algoritma & Flowchart Sistem Parkir Cerdas Otomatis (${topik})`,
            stimulusKasus: "Sebuah gedung mall modern menerapkan tarif parkir bertingkat: 1 jam pertama Rp 5.000, setiap jam berikutnya Rp 3.000. Khusus member VIP, diberikan diskon 20% dari total biaya dan tarif maksimal dibatasi Rp 30.000/hari. Jika tiket hilang, dikenakan denda tambahan Rp 50.000.",
            pertanyaan: "1. Buatlah dekomposisi variabel input, proses logika perhitungan, dan variabel output dari sistem parkir tersebut!\n2. Rancanglah diagram alir (Flowchart) atau pseudocode terstruktur yang menangani seluruh percabangan kondisi (jam normal, member VIP, tarif batas maksimal, dan denda tiket hilang) secara valid!",
            kunciJawaban: "Variabel: durasiJam (Integer), isVIP (Boolean), isTiketHilang (Boolean), totalBiaya (Real).\nAlur Logika: Hitung tarif dasar berdasarkan durasiJam -> Terapkan diskon 20% jika isVIP True -> Cek batas maksimal Rp 30.000 untuk VIP -> Tambah denda Rp 50.000 jika isTiketHilang True -> Cetak totalBiaya.",
            pedomanPenskoran: "Dekomposisi variabel tepat (Skor 10) + Logika percabangan durasi (Skor 10) + Penanganan diskon & batas maksimal VIP (Skor 5) + Penanganan denda tiket hilang (Skor 5) = Total Bobot Maksimal 30 Poin.",
            bobot: 30
          },
          {
            no: 2,
            judul: "Studi Kasus 2: Analisis Kritis Efisiensi Algoritma Penjadwalan & Struktur Data Rumah Sakit",
            stimulusKasus: "Instalasi Gawat Darurat (IGD) rumah sakit menangani puluhan pasien dengan tingkat kegawatan bervariasi (Kritis/Merah, Mendesak/Kuning, Ringan/Hijau). Sistem sebelumnya menggunakan antrean sederhana (Queue First-In-First-Out/FIFO) sehingga pasien kritis yang datang belakangan justru tertunda penanganannya.",
            pertanyaan: "1. Analisislah mengapa struktur data antrean FIFO tidak tepat digunakan pada kasus kegawatdaruratan IGD tersebut dan apa dampak fatalnya!\n2. Rekomendasikan struktur data atau algoritma antrean yang paling optimal (misal: Priority Queue berbasis Heap) dan jelaskan bagaimana algoritma tersebut memproses urutan prioritas pasien secara efisien!",
            kunciJawaban: "FIFO hanya memperhatikan waktu kedatangan tanpa menimbang bobot kegawatan medis, sehingga melanggar prinsip triase IGD. Solusi optimal: Priority Queue di mana setiap pasien memiliki kunci prioritas kegawatan (Level 1-3). Pasien dengan kegawatan darurat tertinggi (Level 1) akan selalu diproses terlebih dahulu.",
            pedomanPenskoran: "Analisis kelemahan & risiko fatal FIFO (Skor 10) + Rekomendasi Priority Queue dan argumentasi teknis (Skor 12) + Penjelasan mekanisme penanganan kasus prioritas sama (Skor 8) = Total Bobot Maksimal 30 Poin.",
            bobot: 30
          }
        ]
      },
      bobotNilai: "Nilai Akhir (NA) = (Skor Formatif [H5P & LKPD] × 30%) + (Skor PG Kompleks [40%] + Skor Essay HOTS [60%] × 70%)",
      rekapNilaiFormat: "Skala Ketercapaian 0 - 100 dengan 4 Kategori Predikat KKTP (Sangat Baik, Baik, Cukup, Perlu Bimbingan)",
      footer: `CopyRight©Norbertus Suryadi — ${sekolah || "SMA Xaverius 1 Palembang"} | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning`
    };
  }

  if (docType === "rubrik") {
    const numPertemuan = parseInt(jumlahPertemuan, 10) || 3;
    const kriteriaList = [];

    if (numPertemuan >= 1) {
      kriteriaList.push({
        pertemuanKe: 1,
        kriteria: `Pertemuan 1: Analisis Dekomposisi & Abstraksi Masalah (${topik})`,
        indikator: "Kemampuan memecah permasalahan kompleks menjadi komponen sub-masalah dan memilah variabel kritis.",
        skor4: `Mampu mendekomposisi permasalahan ${topik} secara komprehensif dan mengabstraksi variabel esensial 100% tepat tanpa redundansi.`,
        skor3: `Mampu mendekomposisi permasalahan ${topik} dengan baik dan mengabstraksi sebagian besar variabel esensial.`,
        skor2: "Dekomposisi masih parsial dan masih memuat variabel non-esensial yang tidak relevan.",
        skor1: "Belum mampu memecah masalah dan gagal mengabstraksi variabel penting permasalahan."
      });
    }

    if (numPertemuan >= 2) {
      kriteriaList.push({
        pertemuanKe: 2,
        kriteria: `Pertemuan 2: Perancangan Diagram Alir / Flowchart & Logika Algoritma`,
        indikator: "Ketepatan simbol standar ISO, urutan langkah algoritma, dan logika percabangan IF-ELSE.",
        skor4: "Diagram alir sangat rapi, simbol ISO 100% tepat, alur logika percabangan runtut serta menangani seluruh kondisi khusus.",
        skor3: "Diagram alir jelas dengan simbol standar tepat, alur logika benar dengan sedikit kekurangan minor.",
        skor2: "Diagram alir memuat beberapa kesalahan simbol atau alur cabang logika membingungkan.",
        skor1: "Diagram alir tidak menggunakan simbol standar dan alur logika terputus atau salah total."
      });
    }

    if (numPertemuan >= 3) {
      kriteriaList.push({
        pertemuanKe: 3,
        kriteria: `Pertemuan 3: Pengujian Kasus (Testing/Dry-run) & Presentasi Kelompok`,
        indikator: "Kemampuan simulasi penelusuran algoritma (dry-run), analisis kasus ekstrem, dan komunikasi hasil.",
        skor4: "Uji coba dry-run mendalam (kasus normal & ekstrem), analisis efisiensi sangat kritis, serta presentasi sangat lugas & komunikatif.",
        skor3: "Uji coba dry-run berjalan baik pada kasus normal, evaluasi logis, dan presentasi disampaikan secara jelas.",
        skor2: "Uji coba hanya pada kasus sederhana dan presentasi kurang terstruktur/kurang percaya diri.",
        skor1: "Tidak melakukan uji coba algoritma dan tidak mampu mempresentasikan hasil karya kelompok."
      });
    }

    return {
      docType: "rubrik",
      judul: "RUBRIK PENILAIAN KOMPREHENSIF & KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)",
      subJudul: `Rubrik evaluasi holistik mencakup asesmen formatif LKPD ${numPertemuan} pertemuan, asesmen sumatif penalaran essay, partisipasi e-learning Moodle, dan formula Nilai Akhir (NA).`,
      jumlahPertemuan: numPertemuan,
      identitas: {
        sekolah: sekolah || "SMA Xaverius 1 Palembang",
        mataPelajaran,
        kelas,
        topik
      },
      bagianA_Formatif: {
        judul: `BAGIAN A: RUBRIK ASESMEN FORMATIF LKPD (${numPertemuan} PERTEMUAN)`,
        deskripsi: "Pedoman penskoran kinerja unjuk kerja kelompok dalam menyelesaikan LKPD Kurikulum Merdeka (Skala 1 - 4).",
        kriteriaList
      },
      bagianB_Sumatif: {
        judul: "BAGIAN B: RUBRIK ASESMEN SUMATIF ESSAY (PENALARAN ALGORITMA)",
        deskripsi: "Pedoman penskoran tes essay analisis studi kasus penalaran komputasional (Total 100 Poin).",
        rubrikSoalList: [
          {
            no: 1,
            judulSoal: "Soal 1: Logika Percabangan Diskon & Bebas Ongkir (Flowchart/Pseudocode)",
            soalDeskripsi: `Analisis kasus belanja diskon 15% (> Rp 500.000) dan bebas ongkir member premium pada topik ${topik}.`,
            bobotMaks: 50,
            aspekList: [
              {
                aspek: "Identifikasi Variabel & Kondisi Logika",
                skorMaks: 15,
                deskripsi: "Ketepatan variabel totalBelanja, isMemberPremium, dan kondisi percabangan IF-ELSE.",
                kriteriaSkor: {
                  skor4: "Sangat tepat mendefinisikan seluruh variabel dan operator relasional (13-15 poin).",
                  skor3: "Variabel dan kondisi didefinisikan dengan baik dan tepat (10-12 poin).",
                  skor2: "Terdapat kekeliruan dalam logika kondisi relasional (6-9 poin).",
                  skor1: "Salah menentukan input dan kondisi logika percabangan (1-5 poin)."
                }
              },
              {
                aspek: "Konstruksi Diagram Alir & Pseudocode",
                skorMaks: 25,
                deskripsi: "Ketepatan simbol diagram alir, sintaks pseudocode, dan alur eksekusi.",
                kriteriaSkor: {
                  skor4: "Pseudocode dan diagram alir 100% valid, runtut, dan bersimbol standar ISO (21-25 poin).",
                  skor3: "Konstruksi benar dengan sedikit kekurangan minor pada estetika simbol (16-20 poin).",
                  skor2: "Bagan alir memiliki cabang logika menggantung atau simbol keliru (10-15 poin).",
                  skor1: "Bagan alir salah dan tidak dapat dijalankan (1-9 poin)."
                }
              },
              {
                aspek: "Ketepatan Formula Perhitungan Total Bayar",
                skorMaks: 10,
                deskripsi: "Formula matematika diskon dan akumulasi ongkir.",
                kriteriaSkor: {
                  skor4: "Formula akumulasi total bayar 100% tepat untuk seluruh kombinasi kasus (9-10 poin).",
                  skor3: "Formula tepat namun ada kekeliruan kecil pada format output (7-8 poin).",
                  skor2: "Formula diskon atau ongkir salah diterapkan (4-6 poin).",
                  skor1: "Formula perhitungan keliru total (1-3 poin)."
                }
              }
            ]
          },
          {
            no: 2,
            judulSoal: "Soal 2: Analisis Efisiensi Algoritma & Struktur Data",
            soalDeskripsi: `Penjelasan konsep efisiensi waktu & memori serta dampak pemilihan struktur data terhadap kinerja sistem komputasi (${topik}).`,
            bobotMaks: 50,
            aspekList: [
              {
                aspek: "Pemahaman Konsep Efisiensi Waktu & Memori",
                skorMaks: 20,
                deskripsi: "Kedalaman penjelasan kompleksitas komputasi dan optimasi sumber daya sistem.",
                kriteriaSkor: {
                  skor4: "Menjelaskan konsep efisiensi komputasi, waktu eksekusi, dan alokasi memori secara mendalam & analitis (17-20 poin).",
                  skor3: "Menjelaskan konsep efisiensi waktu dan memori secara umum dengan baik (13-16 poin).",
                  skor2: "Penjelasan hanya menyentuh definisi dangkal tanpa argumentasi ilmiah (8-12 poin).",
                  skor1: "Penjelasan keliru atau tidak menjawab substansi soal (1-7 poin)."
                }
              },
              {
                aspek: "Korelasi Struktur Data dengan Kinerja Algoritma",
                skorMaks: 20,
                deskripsi: "Analisis perbandingan struktur data terhadap kecepatan pencarian & pengurutan.",
                kriteriaSkor: {
                  skor4: "Menganalisis hubungan struktur data terhadap kecepatan akses/pencarian dengan sangat tajam dan tepat (17-20 poin).",
                  skor3: "Menyebutkan pengaruh struktur data terhadap performa dengan cukup baik (13-16 poin).",
                  skor2: "Hanya menyebutkan nama struktur data tanpa menghubungkan ke kinerja sistem (8-12 poin).",
                  skor1: "Tidak memahami korelasi antara struktur data dan performa algoritma (1-7 poin)."
                }
              },
              {
                aspek: "Relevansi Contoh Kasus Nyata",
                skorMaks: 10,
                deskripsi: "Pemberian contoh kasus riil sistem informasi kontekstual.",
                kriteriaSkor: {
                  skor4: "Memberikan contoh kasus riil yang sangat relevan, terstruktur, dan kontekstual (9-10 poin).",
                  skor3: "Memberikan contoh kasus yang cukup relevan (7-8 poin).",
                  skor2: "Contoh kasus kurang relevan dengan materi efisiensi (4-6 poin).",
                  skor1: "Tidak menyertakan contoh kasus riil (1-3 poin)."
                }
              }
            ]
          }
        ]
      },
      bagianC_Moodle: {
        judul: "BAGIAN C: RUBRIK PARTISIPASI LMS MOODLE (E-LEARNING)",
        deskripsi: "Pedoman evaluasi partisipasi asinkron dan pengerjaan kuis Moodle (Skala 0 - 100).",
        aktivitasList: [
          {
            aspek: "Kualitas & Keaktifan Forum Diskusi LMS",
            bobotMaks: 100,
            deskripsi: "Frekuensi dan kedalaman argumen dalam postingan diskusi kelompok asinkron.",
            skor4: "Memposting minimal 1 ide orisinal mendalam dan memberikan 2+ tanggapan kritis pada argumen rekan sejawat (Skor: 86-100).",
            skor3: "Memposting 1 ide orisinal dan memberikan 1 tanggapan positif pada postingan rekan (Skor: 75-85).",
            skor2: "Hanya memposting kiriman singkat tanpa argumentasi analitis atau tanggapan rekan (Skor: 60-74).",
            skor1: "Tidak aktif dan tidak membuat postingan sama sekali dalam forum diskusi LMS (Skor: <60)."
          },
          {
            aspek: "Ketepatan Submission Tugas & Kuis Evaluasi Moodle",
            bobotMaks: 100,
            deskripsi: "Disiplin batas waktu pengumpulan berkas PDF dan pencapaian skor kuis online.",
            skor4: `Seluruh berkas LKPD P1-P${numPertemuan} diunggah tepat waktu dengan format sesuai instruksi, dan skor kuis Moodle >= 85 (Skor: 86-100).`,
            skor3: "Tugas diunggah tepat waktu dan menyelesaikan kuis Moodle dengan skor KKTP 75-84 (Skor: 75-85).",
            skor2: "Terlambat mengumpulkan tugas (H+1 sampai H+2) atau nilai kuis Moodle 60-74 (Skor: 60-74).",
            skor1: "Tidak mengumpulkan tugas submission atau tidak mengerjakan kuis evaluasi online (Skor: <60)."
          }
        ]
      },
      bagianD_Formula: {
        judul: "BAGIAN D: FORMULA KALKULASI NILAI AKHIR (NA) & KRITERIA KKTP",
        rumusNA: "Nilai Akhir (NA) = (Nilai Formatif LKPD × 40%) + (Nilai Sumatif Essay × 40%) + (Nilai Partisipasi LMS Moodle × 20%)",
        penjelasanBobot: [
          {
            komponen: `Asesmen Formatif (Rata-rata LKPD P1-P${numPertemuan})`,
            bobotPersen: 40,
            keterangan: "Mengukur proses kolaborasi, dekomposisi masalah, perancangan flowchart, dan uji coba simulasi algoritma."
          },
          {
            komponen: "Asesmen Sumatif (Skor Tes Essay Analisis)",
            bobotPersen: 40,
            keterangan: "Mengukur pemahaman konseptual mandiri, ketepatan logika percabangan, dan analisis efisiensi algoritma."
          },
          {
            komponen: "Partisipasi E-Learning LMS Moodle",
            bobotPersen: 20,
            keterangan: "Mengukur kemandirian belajar, keaktifan forum diskusi digital, dan ketepatan waktu pengumpulan artefak."
          }
        ],
        intervalKktp: [
          {
            rentangNilai: "86 – 100",
            predikat: "Sangat Baik (A)",
            keterangan: "Tuntas Mandiri: Peserta didik menunjukkan penguasaan kompetensi berpikir komputasional yang sangat mendalam, kreatif, dan mandiri."
          },
          {
            rentangNilai: "75 – 85",
            predikat: "Baik (B)",
            keterangan: "Tuntas Standar: Peserta didik mencapai seluruh kriteria ketercapaian tujuan pembelajaran (KKTP) dengan logika dan konstruksi algoritma yang baik."
          },
          {
            rentangNilai: "60 – 74",
            predikat: "Cukup (C)",
            keterangan: "Belum Tuntas: Peserta didik memahami konsep dasar namun memerlukan penguatan terbimbing pada konstruksi percabangan logika tertentu."
          },
          {
            rentangNilai: "< 60",
            predikat: "Perlu Bimbingan (D)",
            keterangan: "Belum Tuntas: Peserta didik belum mencapai standar kompetensi dasar dan memerlukan bimbingan intensif serta program remedial terarah."
          }
        ]
      },
      footer: `CopyRight©Norbertus Suryadi — ${sekolah || "SMA Xaverius 1 Palembang"} | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning`
    };
  }

  return { docType, metadata };
}

// Robust JSON extraction helper to handle markdown fences, trailing commas, and extra text
function extractJson(text: string): any {
  if (!text) return null;
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIdx = -1;

  if (firstBrace !== -1 && firstBracket !== -1) {
    startIdx = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }

  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  let endIdx = -1;

  if (lastBrace !== -1 && lastBracket !== -1) {
    endIdx = Math.max(lastBrace, lastBracket);
  } else if (lastBrace !== -1) {
    endIdx = lastBrace;
  } else if (lastBracket !== -1) {
    endIdx = lastBracket;
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    const sanitized = cleaned
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
    return JSON.parse(sanitized);
  }
}

// Function to call Gemini API with retries for 429 Rate Limits, 500/503 Errors, and Model Fallback
async function callGeminiApiWithRetryAndFallback(ai: GoogleGenAI, prompt: string) {
  const modelsToTry = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

  for (const model of modelsToTry) {
    let retries = 0;
    const maxRetries = 2;

    while (retries < maxRetries) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });
        if (response.text) {
          return response.text;
        }
        throw new Error(`Respon kosong dari model ${model}`);
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const status = err?.status || err?.statusCode || 0;
        const isQuotaOrRateLimit = status === 429 || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
        const isServerError = status === 500 || status === 503 || errMsg.includes("500") || errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("overloaded") || errMsg.includes("Internal error");

        if (isQuotaOrRateLimit || isServerError) {
          retries++;
          const delayMs = 2000 + Math.floor(Math.random() * 1500);
          console.warn(`[Gemini Flash Retry] Model ${model} mengalami ${isQuotaOrRateLimit ? '429 Rate Limit' : '500/503 Server Error'} (Percobaan ${retries}/${maxRetries}). Menunggu jeda ${delayMs}ms...`);
          await new Promise((res) => setTimeout(res, delayMs));
        } else {
          // Non-retryable error on this specific model variant (e.g. 404), switch immediately to next model
          console.warn(`[Gemini Model Error] Model ${model} gagal (${errMsg}), beralih ke varian model berikutnya...`);
          break;
        }
      }
    }
  }

  throw new Error("Semua model Gemini Flash sedang sibuk atau kuota terbatas. Silakan coba beberapa saat lagi.");
}

// Universal Prompt Builder with Subject Context Detector
function buildPrompt(docType: string, metadata: any) {
  return buildUniversalCtPrompt(docType, metadata);
}

// Single Unified Prompt Builder to generate all documents in 1 single API call
function buildUnifiedPrompt(metadata: any) {
  return buildUnifiedAllDocsPrompt(metadata);
}

// API Routes
const handleGenerateSingleDoc = async (req: express.Request, res: express.Response) => {
  const { docType, metadata } = req.body;

  if (!metadata) {
    return res.status(400).json({ status: "error", success: false, error: "metadata wajib diisi" });
  }

  const ai = getGeminiClient();

  if (!ai) {
    console.error("GEMINI_API_KEY belum dikonfigurasi.");
    return res.status(400).json({
      status: "error",
      success: false,
      error: "API Key belum dipasang! Silakan periksa konfigurasi GEMINI_API_KEY."
    });
  }

  try {
    // If docType is 'all' or empty, execute SINGLE UNIFIED REQUEST
    if (!docType || docType === 'all') {
      const prompt = buildUnifiedPrompt(metadata);
      const rawText = await callGeminiApiWithRetryAndFallback(ai, prompt);

      if (!rawText) {
        throw new Error("Respon kosong dari Gemini API");
      }

      let parsedData = extractJson(rawText);
      if (!parsedData) {
        throw new Error("Gagal mengurai respon JSON dari AI");
      }

      // If wrapped in root or direct keys
      if (parsedData.rpm) {
        parsedData.rpm = ensureValidRpmData(parsedData.rpm, metadata);
      }

      return res.json({ status: "success", success: true, data: parsedData });
    }

    // Single docType request
    const prompt = buildPrompt(docType, metadata);
    const rawText = await callGeminiApiWithRetryAndFallback(ai, prompt);

    if (!rawText) {
      throw new Error("Respon kosong dari Gemini API");
    }

    let parsedData = extractJson(rawText);

    if (parsedData && docType === "rpm") {
      parsedData = ensureValidRpmData(parsedData, metadata);
    }

    if (!parsedData) {
      throw new Error("Gagal mengurai respon JSON dari AI");
    }

    return res.json({ status: "success", success: true, data: parsedData });
  } catch (error: any) {
    console.error(`Gagal membuat dokumen ${docType || 'all'} dari AI:`, error?.message || error);
    return res.status(500).json({
      status: "error",
      success: false,
      error: error?.message || "Gagal memproses pembuatan dokumen dengan Gemini AI"
    });
  }
};

app.post("/api/generate", handleGenerateSingleDoc);
app.post("/api/generate-doc", handleGenerateSingleDoc);

// Single Unified Request handler for all docs
app.post("/api/generate-all-docs", async (req, res) => {
  const { metadata } = req.body;

  if (!metadata) {
    return res.status(400).json({ status: "error", success: false, error: "metadata wajib diisi" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(400).json({
      status: "error",
      success: false,
      error: "API Key belum dipasang! Silakan periksa konfigurasi GEMINI_API_KEY."
    });
  }

  try {
    const prompt = buildUnifiedPrompt(metadata);
    const rawText = await callGeminiApiWithRetryAndFallback(ai, prompt);

    if (!rawText) {
      throw new Error("Respon kosong dari Gemini API");
    }

    let parsedData = extractJson(rawText);
    if (!parsedData) {
      throw new Error("Gagal mengurai respon JSON terpadu dari Gemini API");
    }

    if (parsedData.rpm) {
      parsedData.rpm = ensureValidRpmData(parsedData.rpm, metadata);
    }

    return res.json({ status: "success", success: true, data: parsedData });
  } catch (err: any) {
    console.error("Gagal generate all docs:", err);
    return res.status(500).json({
      status: "error",
      success: false,
      error: err?.message || "Gagal memproses seluruh dokumen dengan Gemini AI"
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
