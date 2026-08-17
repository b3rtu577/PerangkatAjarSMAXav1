import React from 'react';
import { DocumentHeader } from '../DocumentHeader';
import { IdentitasRPM } from '../../types';
import { renderTextValue } from '../../utils/formatUtils';
import { calculateMeetingAllocations } from '../../services/rpmService';
import { isInformatikaSubject, getSubjectAndElementMode, SubjectMode, formatCleanKelasFaseSemester } from '../../services/rpmPrompt';

export interface LkpdTabelBaris {
  no?: number | string;
  komponen: string;
  instruksiAnalisis: string;
  ruangJawaban?: string;
}

export interface PertemuanItem {
  pertemuanKe: number;
  waktu?: string;
  subJudul?: string;
  tujuanAktivitas?: string[];
  petunjukPengerjaan?: string[];
  stimulusMaterial?: string;
  kegiatan1Memahami?: {
    judul?: string;
    deskripsi?: string;
    pertanyaanHots: string[];
  };
  kegiatan2Menerapkan?: {
    judul?: string;
    instruksiTugas?: string;
    tabelIsian: LkpdTabelBaris[];
  };
  aktivitasSiswa?: {
    no: number;
    tugas: string;
    instruksi: string;
    ruangJawaban?: string;
  }[];
  pertanyaanDiskusi?: string[];
  refleksiSiswa?: string;
  kesimpulan?: string;
  rubrikSkor?: {
    kriteria: string;
    skorMaks: number;
    skorPerolehan?: string;
  }[];
}

export interface LkpdDocData {
  identitas?: {
    sekolah?: string;
    mataPelajaran?: string;
    guru?: string;
    guruMapel?: string;
    namaGuru?: string;
    nipGuru?: string;
    kelas?: string;
    topik?: string;
    waktu?: string;
    logo?: string;
    [key: string]: any;
  };
  judul?: string;
  subJudul?: string;
  jumlahPertemuan?: number;
  pertemuanList?: PertemuanItem[];
  [key: string]: any;
}

interface Props {
  data: LkpdDocData;
  id: string;
  identitas?: IdentitasRPM;
}

export const LkpdTemplate: React.FC<Props> = ({ data, id, identitas }) => {
  if (!data) return null;

  const currIdentitas = data.identitas || identitas || {};
  const guruMapel =
    currIdentitas.guruMapel ||
    currIdentitas.namaGuru ||
    currIdentitas.guru ||
    identitas?.guruMapel ||
    identitas?.namaGuru ||
    identitas?.guru ||
    'Norbertus Suryadi, S.Kom.';
  const niyGuru = currIdentitas.nipGuru || currIdentitas.niyGuru || identitas?.nipGuru || identitas?.niyGuru || '5987';
  const namaSekolah = currIdentitas.sekolah || identitas?.sekolah || 'SMA Xaverius 1 Palembang';
  const topikMateri = currIdentitas.topik || identitas?.topik || 'Topik Pembelajaran';
  const kelasFase = formatCleanKelasFaseSemester(
    currIdentitas.kelas || identitas?.kelas || 'Kelas X / Fase E',
    currIdentitas.semester || (identitas as any)?.semester || 'Ganjil'
  );
  const mapel = currIdentitas.mataPelajaran || identitas?.mataPelajaran || 'Informatika';
  const elemenKsp = (currIdentitas as any).elemenKsp || (identitas as any)?.elemenKsp || '';
  const cpText = currIdentitas.cp || identitas?.cp || '';
  const subjectMode: SubjectMode = getSubjectAndElementMode(mapel, elemenKsp, topikMateri, cpText);
  const isKodingMode = subjectMode === 'koding-pseudocode';
  const isInformatika = isInformatikaSubject(mapel);
  const isInformatikaNonKoding = isInformatika && !isKodingMode;

  // ==========================================
  // LOGIKA DINAMIS TUGAS: KELOMPOK VS INDIVIDU VS NETRAL
  // ==========================================
  const rawModeProp = String(
    (data as any).jenisTugas ||
    (data as any).modeTugas ||
    (currIdentitas as any).jenisTugas ||
    (currIdentitas as any).modeTugas ||
    (identitas as any)?.jenisTugas ||
    'kelompok'
  ).toLowerCase();

  const initialMode: 'kelompok' | 'individu' | 'netral' = rawModeProp.includes('individu') || rawModeProp.includes('mandiri')
    ? 'individu'
    : rawModeProp.includes('netral')
    ? 'netral'
    : 'kelompok';

  const [selectedModeTugas, setSelectedModeTugas] = React.useState<'kelompok' | 'individu' | 'netral'>(initialMode);

  React.useEffect(() => {
    setSelectedModeTugas(initialMode);
  }, [initialMode]);

  const labelSiswa =
    selectedModeTugas === 'kelompok'
      ? 'Ketua Kelompok'
      : selectedModeTugas === 'individu'
      ? 'Nama Siswa'
      : 'Siswa / Ketua Kelompok';

  // ==========================================
  // LOGIKA PEMBACAAN DATA DINAMIS (SINKRON JUMLAH PERTEMUAN & ALOKASI WAKTU)
  // ==========================================
  const totalSesi = Math.max(1, parseInt(String(currIdentitas.jumlahPertemuan || data.jumlahPertemuan || '2'), 10) || 2);
  const meetingAllocations = calculateMeetingAllocations(
    currIdentitas.alokasiWaktu || currIdentitas.waktu || data.identitas?.waktu,
    totalSesi
  );

  const getRenderList = (): PertemuanItem[] => {
    if (Array.isArray(data.pertemuanList) && data.pertemuanList.length > 0) {
      return data.pertemuanList.slice(0, totalSesi).map((p, idx) => ({
        ...p,
        waktu: p.waktu || meetingAllocations[idx]?.displayString || '2 JP (90 Menit)'
      }));
    }
    if (Array.isArray((data as any).pertemuan) && (data as any).pertemuan.length > 0) {
      return (data as any).pertemuan.slice(0, totalSesi).map((p: any, idx: number) => ({
        ...p,
        waktu: p.waktu || meetingAllocations[idx]?.displayString || '2 JP (90 Menit)'
      }));
    }

    // Default template aktivitas mendalam per sesi sesuai Subject Context Detector
    const defaultDescriptionsInformatika = [
      {
        subJudul: `Pertemuan 1: Dekomposisi & Analisis Masalah Awal pada ${topikMateri}`,
        tujuan: [
          `Menganalisis dan membedah permasalahan kompleks terkait ${topikMateri} menjadi komponen esensial (Dekomposisi Masalah).`,
          `Mengidentifikasi variabel kunci, data masukan relevan, dan batasan operasional (Abstraksi Data).`,
          `Merumuskan hubungan sebab-akibat antar komponen dalam skenario dunia nyata (Deep Learning: Memahami & Mengaitkan).`
        ],
        stimulus: `Dalam implementasi ${topikMateri} pada dunia industri dan kehidupan nyata, sering terjadi inefisiensi akibat variabel masalah yang tidak terpetakan dengan jelas. Sebagai contoh kasus, ketidaksiapan alur data menyebabkan redundansi proses dan keterlambatan respon sistem hingga 40%. Tim Anda bertugas mengidentifikasi akar masalah, memisahkan variabel esensial vs data pendukung, serta merumuskan cetak biru solusi awal yang kokoh.`,
        pertanyaanHots: [
          `Lakukan dekomposisi masalah: Identifikasi minimal 3 faktor utama penyebab inefisiensi pada skenario ${topikMateri} di atas!`,
          `Mengapa pemilahan variabel kritis (abstraksi) menjadi penentu utama keberhasilan solusi sistem komputasi?`,
          `Bagaimana hubungan antara parameter input dengan keandalan output yang dihasilkan pada kondisi beban tinggi?`,
          `Rumuskan satu hipotesis solusi awal yang paling efektif dan rasional untuk menyelesaikan studi kasus ini!`
        ],
        tabelIsian: [
          { no: 1, komponen: 'Identifikasi Parameter Input & Kondisi Awal', instruksiAnalisis: `Data atau nilai apa saja yang harus dimasukkan ke dalam sistem ${topikMateri}?`, ruangJawaban: '' },
          { no: 2, komponen: 'Batasan Sistem & Validasi Logika (Constraints)', instruksiAnalisis: 'Aturan validasi dan batasan nilai apa yang wajib dipenuhi agar sistem aman?', ruangJawaban: '' },
          { no: 3, komponen: 'Dekomposisi Alur Pemrosesan Utama (IPO)', instruksiAnalisis: 'Uraikan tahapan pemrosesan logika dari input mentah hingga output terverifikasi.', ruangJawaban: '' },
          { no: 4, komponen: 'Spesifikasi Output & Kriteria Keberhasilan', instruksiAnalisis: 'Jelaskan format keluaran dan tolok ukur bahwa masalah telah terpecahkan.', ruangJawaban: '' }
        ],
        tugas: 'Analisis Dekomposisi Variabel & Rancangan Awal Solusi',
        instruksi: 'Diskusikan akar permasalahan dan petakan komponen utama pada lembar kerja.',
        refleksi: `Melalui pembelajaran Sesi 1 pada materi ${topikMateri}, kami memahami pentingnya dekomposisi dan abstraksi data sebagai fondasi perancangan solusi komputasional yang efisien dan bebas celah.`,
        kesimpulan: `Dekomposisi masalah dan pemetaan variabel terstruktur memberikan kejelasan alur logika sebelum ditransformasikan ke dalam algoritma pada pertemuan berikutnya.`
      },
      {
        subJudul: `Pertemuan 2: Perancangan Algoritma Terstruktur, Diagram Alir & Simulasi Kasus pada ${topikMateri}`,
        tujuan: [
          `Mengenali pola relasional dan merancang alur logika terstruktur (Flowchart ISO 5807 / Pseudocode) berbasis hasil analisis Pertemuan 1.`,
          `Melakukan simulasi penelusuran manual (dry-run trace table) untuk menguji keabsahan logika dalam berbagai kondisi data uji.`,
          `Menerapkan solusi komputasional terpadu dalam pemecahan masalah kontekstual nyata (Deep Learning: Menerapkan Solusi).`
        ],
        stimulus: `Menindaklanjuti temuan dekomposisi Pertemuan 1, tim melangkah ke tahap perancangan logika eksekusi ${topikMateri}. Solusi yang dirancang harus memiliki struktur kendali keputusan (IF-ELSE) yang lugas dan tahan terhadap variasi data ekstrem (corner cases) tanpa mengalami kegagalan proses. Alur wajib didokumentasikan dalam diagram alir berstandar ISO dan diverifikasi melalui tabel penelusuran (trace table).`,
        pertanyaanHots: [
          `Bagaimana Anda menstrukturkan kondisi percabangan agar seluruh kemungkinan skenario input pada ${topikMateri} tertangani dengan aman?`,
          `Mengapa penelusuran jejak logika (dry-run trace table) wajib dilakukan sebelum algoritma diimplementasikan ke dalam program?`,
          `Analisis potensi kesalahan logika (logical error) yang dapat muncul jika urutan pengujian kondisi terbalik!`,
          `Bagaimana rancangan algoritma Anda memastikan kompleksitas waktu dan penggunaan sumber daya tetap optimal?`
        ],
        tabelIsian: [
          { no: 1, komponen: 'Rancangan Pseudocode / Notasi Algoritma', instruksiAnalisis: `Tuliskan struktur instruksi logika (Deklarasi, Input, Seleksi/Loop, Output) untuk ${topikMateri}.`, ruangJawaban: '' },
          { no: 2, komponen: 'Simulasi Kasus Uji Normal (Happy Path Test)', instruksiAnalisis: 'Masukkan sampel data normal dan telusuri nilai perubahan state variabel langkah demi langkah.', ruangJawaban: '' },
          { no: 3, komponen: 'Simulasi Kasus Uji Ekstrem / Batas (Edge Cases)', instruksiAnalisis: 'Ujilah dengan nilai batas (nilai 0, negatif, data kosong/maksimal) dan catat respon algoritma.', ruangJawaban: '' },
          { no: 4, komponen: 'Evaluasi Ketahanan Logika & Optimasi Alur', instruksiAnalisis: 'Jelaskan apakah terdapat perulangan/kondisi yang dapat disederhanakan untuk meningkatkan performa.', ruangJawaban: '' }
        ],
        tugas: 'Perancangan Diagram Alir Standar, Pseudocode & Pengujian Kasus Ekstrem',
        instruksi: 'Rancanglah diagram alir dengan simbol standar ISO, lengkapi pseudocode, dan buktikan ketepatannya via trace table.',
        refleksi: `Melalui pengerjaan LKPD Pertemuan 2, kami menyadari bahwa algoritma yang handal tidak hanya mengejar hasil akhir yang benar, melainkan struktur alur yang bersih, teruji kasus ekstrem, dan adaptif.`,
        kesimpulan: `Rancangan flowchart dan pseudocode yang terverifikasi melalui trace table memberikan kepastian bahwa solusi terhadap ${topikMateri} siap dieksekusi secara presisi dan minim galat.`
      },
      {
        subJudul: `Pertemuan 3: Evaluasi Komparasi Solusi, Optimasi Kompleksitas & Gelar Karya pada ${topikMateri}`,
        tujuan: [
          `Mengevaluasi kompleksitas dan efisiensi algoritma dari berbagai variasi pendekatan solusi kelompok.`,
          `Melakukan optimasi alur dan penyempurnaan rancangan solusi secara kolaboratif.`,
          `Mempresentasikan hasil karya investigasi dan rekomendasi solusi sistem secara komprehensif.`
        ],
        stimulus: `Tahap akhir dari siklus pengembangan solusi ${topikMateri} adalah evaluasi efisiensi komparatif, audit penanganan kesalahan pengguna (error handling), serta penyusunan laporan pertanggungjawaban karya komputasional siap terap.`,
        pertanyaanHots: [
          `Bandingkan efisiensi solusi kelompok Anda dengan pendekatan alternatif dalam memecahkan studi kasus ${topikMateri}!`,
          `Parameter apa yang menjadi tolok ukur utama kecepatan dan keandalan sistem solusi Anda?`,
          `Bagaimana strategi proteksi sistem jika pengguna memasukkan format data yang tidak valid?`,
          `Refleksikan dampak kebermanfaatan implementasi solusi ini bagi pengguna akhir di masyarakat!`
        ],
        tabelIsian: [
          { no: 1, komponen: 'Metrik Efisiensi Waktu & Beban Komputasi', instruksiAnalisis: 'Hitung perkiraan jumlah langkah operasi logika untuk ukuran dataset kecil vs besar.', ruangJawaban: '' },
          { no: 2, komponen: 'Proteksi Kesalahan Input Pengguna (Error Handling)', instruksiAnalisis: 'Jelaskan mekanisme proteksi terhadap input salah format atau di luar jangkauan nilai.', ruangJawaban: '' },
          { no: 3, komponen: 'Rekomendasi Skalabilitas & Pengembangan Lanjut', instruksiAnalisis: 'Tuliskan rencana pengembangan fitur di masa depan jika sistem diterapkan secara luas.', ruangJawaban: '' }
        ],
        tugas: 'Audit Efisiensi Solusi, Laporan Portofolio & Gelar Karya Kelompok',
        instruksi: 'Tuliskan hasil komparasi solusi, dokumentasikan perbaikan logika, dan susun simpulan rekomendasi terbaik.',
        refleksi: `Proses rekayasa solusi bukan sekadar membuat sistem berjalan, melainkan menghasilkan karya yang teroptimasi, ramah pengguna, dan berintegritas tinggi.`,
        kesimpulan: `Portofolio solusi yang disusun secara sistematis membuktikan penguasaan utuh terhadap konsep dan penerapan ${topikMateri}.`
      }
    ];

    const defaultDescriptionsNonInformatika = [
      {
        subJudul: `Pertemuan 1: Penyelidikan Masalah & Identifikasi Kasus pada ${topikMateri}`,
        tujuan: [
          `Menganalisis fenomena dan membedah permasalahan kontekstual terkait ${topikMateri} secara kritis.`,
          `Mengidentifikasi fakta lapangan, data pengamatan relevan, dan faktor penyebab utama.`,
          `Merumuskan hubungan sebab-akibat antar faktor dalam skenario nyata (Deep Learning: Memahami & Mengaitkan).`
        ],
        stimulus: `Dalam konteks penerapan materi ${topikMateri} pada kehidupan sehari-hari dan lingkungan sekitar, sering dijumpai persoalan nyata yang memerlukan telaah mendalam. Sebagai contoh kasus lapangan, ketidaksesuaian analisis fakta menyebabkan kekeliruan dalam penarikan kesimpulan hingga berdampak pada keputusan yang tidak efektif. Bersama kelompok Anda, analisislah akar masalah, kumpulkan bukti faktual pendukung, serta susunlah kerangka pemecahan masalah awal yang rasional.`,
        pertanyaanHots: [
          `Berdasarkan stimulus kasus di atas, identifikasi minimal 3 fakta utama atau faktor kunci yang memicu permasalahan ${topikMateri}!`,
          `Mengapa pemilahan informasi yang relevan sangat krusial dalam memahami konteks persoalan ini secara objektif?`,
          `Bagaimana hubungan sebab-akibat antara kondisi awal dengan fenomena yang terjadi pada kasus tersebut?`,
          `Rumuskan satu hipotesis atau gagasan solusi awal yang paling rasional untuk memecahkan persoalan ini!`
        ],
        tabelIsian: [
          { no: 1, komponen: 'Identifikasi Fakta Lapangan & Kondisi Awal', instruksiAnalisis: `Data atau fakta apa saja yang teramati dari kasus ${topikMateri}?`, ruangJawaban: '' },
          { no: 2, komponen: 'Analisis Hubungan Sebab-Akibat', instruksiAnalisis: 'Jelaskan keterkaitan antar faktor penyebab dan dampak yang ditimbulkan.', ruangJawaban: '' },
          { no: 3, komponen: 'Fokus Prioritas Solusi', instruksiAnalisis: 'Tentukan fokus pemecahan masalah dengan memilah aspek paling krusial.', ruangJawaban: '' },
          { no: 4, komponen: 'Sistematika Langkah Solusi (Alur Naratif)', instruksiAnalisis: 'Uraikan tahapan penyelesaian masalah secara terstruktur dalam Bahasa Indonesia baku.', ruangJawaban: '' }
        ],
        tugas: 'Penyelidikan Masalah & Pemetaan Variabel Kasus',
        instruksi: 'Diskusikan bersama kelompok dan tuangkan hasil analisis pengamatan ke dalam lembar kerja.',
        refleksi: `Melalui pembelajaran Pertemuan 1 pada materi ${topikMateri}, kami menyadari pentingnya analisis data faktual dan telaah sebab-akibat sebagai landasan penarikan kesimpulan yang akurat.`,
        kesimpulan: `Pemetaan masalah secara terstruktur memberikan kejelasan arah sebelum merancang prosedur pemecahan masalah pada pertemuan berikutnya.`
      },
      {
        subJudul: `Pertemuan 2: Perancangan Prosedur Solusi, Diagram Alur & Uji Kasus pada ${topikMateri}`,
        tujuan: [
          `Merancang alur prosedur kerja sistematis (Diagram Alur Naratif) berdasarkan hasil analisis Pertemuan 1.`,
          `Melakukan simulasi dan pengujian penerapan solusi pada skenario kasus terapan.`,
          `Menerapkan solusi kontekstual terpadu dalam pemecahan masalah nyata (Deep Learning: Menerapkan Solusi).`
        ],
        stimulus: `Menindaklanjuti temuan analisis pada Pertemuan 1, kelompok melangkah ke tahap perancangan prosedur pelaksanaan solusi untuk materi ${topikMateri}. Solusi yang dirancang harus memiliki tahapan instruksi yang jelas, sistematis, mudah dipahami, serta mampu mengantisipasi kendala lapangan. Seluruh tahapan didokumentasikan dalam diagram alur kerja naratif dan diuji efektivitasnya.`,
        pertanyaanHots: [
          `Bagaimana kelompok Anda menyusun tahapan prosedur agar solusi terhadap ${topikMateri} dapat diterapkan secara efektif dan terukur?`,
          `Mengapa uji coba atau simulasi penerapan skenario perlu dilakukan sebelum solusi diimplementasikan secara luas?`,
          `Analisis potensi kendala yang mungkin muncul di lapangan dan bagaimana strategi kelompok memitigasinya!`,
          `Bagaimana rancangan solusi Anda memastikan efisiensi waktu dan ketercapaian tujuan secara optimal?`
        ],
        tabelIsian: [
          { no: 1, komponen: 'Rancangan Diagram Alur Prosedur Kerja', instruksiAnalisis: `Tuliskan urutan langkah kerja penyelesaian masalah ${topikMateri} secara sistematis.`, ruangJawaban: '' },
          { no: 2, komponen: 'Simulasi & Uji Penerapan Skenario Kasus', instruksiAnalisis: 'Ujilah penerapan solusi pada skenario kasus dan catat hasil analisis.', ruangJawaban: '' },
          { no: 3, komponen: 'Antisipasi Kendala & Mitigasi Lapangan', instruksiAnalisis: 'Identifikasi potensi kendala yang mungkin timbul dan tentukan langkah antisipasinya.', ruangJawaban: '' },
          { no: 4, komponen: 'Evaluasi & Rekomendasi Solusi Terbaik', instruksiAnalisis: 'Jelaskan keunggulan solusi yang dirancang serta rekomendasi penerapannya.', ruangJawaban: '' }
        ],
        tugas: 'Perancangan Diagram Alur Naratif, Simulasi & Rekomendasi Tindakan',
        instruksi: 'Rancanglah bagan alur kerja sistematis, lakukan simulasi skenario, dan rumuskan rekomendasi kelompok.',
        refleksi: `Melalui pengerjaan LKPD Pertemuan 2, kami memahami bahwa solusi yang baik adalah solusi yang terencana secara sistematis, realistis, dan tahan terhadap kendala lapangan.`,
        kesimpulan: `Diagram alur prosedur kerja yang teruji memberikan panduan jelas bahwa solusi terhadap ${topikMateri} siap dilaksanakan secara tepat sasaran.`
      },
      {
        subJudul: `Pertemuan 3: Evaluasi Komparasi Solusi, Refleksi & Gelar Karya pada ${topikMateri}`,
        tujuan: [
          `Mengevaluasi efektivitas dan dampak dari berbagai pendekatan solusi kelompok.`,
          `Menyempurnakan rancangan prosedur solusi melalui diskusi dan masukan konstruktif.`,
          `Mempresentasikan hasil investigasi dan laporan karya kelompok secara komprehensif.`
        ],
        stimulus: `Tahap akhir dari siklus pembelajaran ${topikMateri} adalah evaluasi menyeluruh terhadap efektivitas solusi, penyempurnaan laporan hasil penyelidikan, serta presentasi gelar karya unjuk kerja di hadapan rekan sejawat dan guru.`,
        pertanyaanHots: [
          `Bandingkan keunggulan solusi kelompok Anda dengan pendekatan kelompok lain dalam memecahkan studi kasus ${topikMateri}!`,
          `Indikator apa yang menjadi tolok ukur utama keberhasilan pemecahan masalah pada materi ini?`,
          `Bagaimana rencana tindak lanjut kelompok untuk menerapkan gagasan ini secara berkelanjutan?`,
          `Refleksikan dampak kebermanfaatan dari pembelajaran materi ini bagi pemahaman kontekstual Anda!`
        ],
        tabelIsian: [
          { no: 1, komponen: 'Metrik Keberhasilan & Indikator Solusi', instruksiAnalisis: 'Jelaskan tolok ukur keberhasilan dari implementasi solusi yang diusulkan.', ruangJawaban: '' },
          { no: 2, komponen: 'Penyempurnaan Berdasarkan Masukan Diskusi', instruksiAnalisis: 'Catat masukan konstruktif dari guru dan rekan sejawat serta rencana perbaikannya.', ruangJawaban: '' },
          { no: 3, komponen: 'Rencana Tindak Lanjut & Penerapan Berkelanjutan', instruksiAnalisis: 'Tuliskan langkah tindak lanjut untuk menerapkan gagasan ini di lingkungan nyata.', ruangJawaban: '' }
        ],
        tugas: 'Evaluasi Komparasi Solusi, Laporan Portofolio & Gelar Karya Kelompok',
        instruksi: 'Tuliskan hasil evaluasi, dokumentasikan penyempurnaan alur kerja, dan susun simpulan akhir.',
        refleksi: `Proses investigasi dan kolaborasi ini menumbuhkan daya nalar kritis, keterbukaan terhadap masukan, dan tanggung jawab keilmuan.`,
        kesimpulan: `Portofolio karya yang disusun secara utuh membuktikan pemahaman mendalam terhadap konsep dan penerapan ${topikMateri}.`
      }
    ];

    const defaultDescriptions = isInformatika ? defaultDescriptionsInformatika : defaultDescriptionsNonInformatika;

    return Array.from({ length: totalSesi }, (_, index) => {
      const pNum = index + 1;
      const desc = defaultDescriptions[index % defaultDescriptions.length];
      const alloc = meetingAllocations[index] || { displayString: '2 JP (90 Menit)' };

      return {
        pertemuanKe: pNum,
        waktu: alloc.displayString,
        subJudul: desc.subJudul,
        tujuanAktivitas: desc.tujuan,
        petunjukPengerjaan: [
          'Bacalah teks stimulus studi kasus kontekstual dengan cermat bersama seluruh anggota kelompok.',
          'Diskusikan dan jawablah pertanyaan analisis mendalam pada Kegiatan 1 (Memahami & Mengaitkan).',
          'Lakukan investigasi praktikum pada Kegiatan 2 dan lengkapi Tabel Isian Kerja Siswa secara sistematis.',
          'Rumuskan kesimpulan bersama dan tuliskan refleksi pemahaman bermakna sebelum presentasi.'
        ],
        stimulusMaterial: desc.stimulus,
        kegiatan1Memahami: {
          judul: 'Kegiatan 1: Investigasi Masalah Kontekstual & Penalaran Kritis (HOTS)',
          deskripsi: 'Berdasarkan stimulus studi kasus di atas, diskusikan dan jawablah pertanyaan analisis mendalam berikut:',
          pertanyaanHots: desc.pertanyaanHots
        },
        kegiatan2Menerapkan: {
          judul: isKodingMode
            ? 'Kegiatan 2: Matriks Analisis Berpikir Komputasional & Perancangan Solusi'
            : isInformatikaNonKoding
            ? 'Kegiatan 2: Matriks Telaah Prosedur TIK / Arsitektur Sistem & Perancangan Solusi'
            : 'Kegiatan 2: Tabel Pengamatan & Perancangan Solusi Ilmiah',
          instruksiTugas: isKodingMode
            ? 'Lakukan analisis solusi dan lengkapi matriks berpikir komputasional berikut bersama kelompok Anda:'
            : isInformatikaNonKoding
            ? 'Lakukan analisis prosedur/sistem dan lengkapi matriks kerja solusi terapan berikut bersama kelompok Anda:'
            : 'Lakukan telaah pengamatan dan lengkapi tabel kerja sistematika solusi berikut bersama kelompok Anda:',
          tabelIsian: desc.tabelIsian
        },
        aktivitasSiswa: [
          {
            no: 1,
            tugas: desc.tugas,
            instruksi: desc.instruksi,
            ruangJawaban: ''
          }
        ],
        pertanyaanDiskusi: [
          `Bagaimana kelompok Anda memvalidasi bahwa alur solusi pada Pertemuan ${pNum} sudah optimal?`,
          'Kendala logika apa yang dihadapi dan bagaimana strategi penyelesaian kelompok?'
        ],
        refleksiSiswa: desc.refleksi,
        kesimpulan: desc.kesimpulan,
        rubrikSkor: [
          { kriteria: 'Ketajaman Analisis Masalah Kasus (Kegiatan 1)', skorMaks: 30 },
          { kriteria: 'Kelengkapan & Akurasi Tabel Isian Solusi (Kegiatan 2)', skorMaks: 40 },
          { kriteria: 'Kualitas Kolaborasi, Refleksi & Penarikan Kesimpulan', skorMaks: 30 }
        ]
      };
    });
  };

  const renderList = getRenderList();

  return (
    <div
      id={id || 'document-preview-container'}
      data-doc-container="lkpd"
      className="space-y-12 print:space-y-0 document-preview-container"
    >
      {renderList.map((item, index) => {
        const pNum = item.pertemuanKe || index + 1;
        const alokasiWaktu = item.waktu || '2 JP (90 Menit)';

        // Ekstraksi Kegiatan 1 Pertanyaan HOTS
        const hotsQuestions =
          item.kegiatan1Memahami?.pertanyaanHots ||
          item.pertanyaanDiskusi || [
            `Analisis dekomposisi faktor kunci pada topik ${topikMateri} sesuai skenario kasus di atas!`,
            'Mengapa variabel pembatas (constraints) sangat penting dalam penentuan solusi akhir?',
            'Bagaimana kelompok Anda memitigasi potensi kegagalan logika pada alur proses yang dirancang?',
            'Rumuskan hipotesis penyelesaian masalah yang paling terukur dan rasional!'
          ];

        // Ekstraksi Kegiatan 2 Tabel Isian
        const tabelIsianRows: LkpdTabelBaris[] =
          item.kegiatan2Menerapkan?.tabelIsian ||
          (item.aktivitasSiswa && item.aktivitasSiswa.length > 0
            ? item.aktivitasSiswa.map((act, aIdx) => ({
                no: act.no || aIdx + 1,
                komponen: act.tugas,
                instruksiAnalisis: act.instruksi,
                ruangJawaban: act.ruangJawaban || ''
              }))
            : [
                { no: 1, komponen: 'Identifikasi Parameter Input & Kondisi Awal', instruksiAnalisis: 'Sebutkan parameter masukan yang wajib diproses.', ruangJawaban: '' },
                { no: 2, komponen: 'Batasan Sistem & Aturan Validasi', instruksiAnalisis: 'Tentukan kondisi batas dan aturan pengecualian.', ruangJawaban: '' },
                { no: 3, komponen: 'Dekomposisi Alur Solusi / Diagram Alir', instruksiAnalisis: 'Uraikan urutan tahapan penyelesaian masalah.', ruangJawaban: '' },
                { no: 4, komponen: 'Spesifikasi Output & Pengujian Hasil', instruksiAnalisis: 'Jelaskan kriteria bahwa solusi berhasil.', ruangJawaban: '' }
              ]);

        const rubrikRows = item.rubrikSkor || [
          { kriteria: 'Ketajaman Analisis & Penalaran Kasus (Kegiatan 1)', skorMaks: 30 },
          { kriteria: 'Kelengkapan & Ketepatan Tabel Isian Solusi (Kegiatan 2)', skorMaks: 40 },
          { kriteria: 'Kualitas Kolaborasi, Refleksi & Penarikan Kesimpulan', skorMaks: 30 }
        ];

        return (
          <div
            key={index}
            className="bg-white p-8 md:p-12 text-gray-900 font-sans shadow-sm rounded-lg border border-gray-200 max-w-4xl mx-auto print:shadow-none print:p-0 print:border-none print:break-before-page page-break-after-always mb-10 print:mb-0"
            style={{ minHeight: '1050px' }}
          >
            {/* Header Kop LKPD dengan Dual Logo Permanen */}
            <DocumentHeader
              documentType="lkpd"
              schoolName={namaSekolah}
              title={`LEMBAR KERJA PESERTA DIDIK (LKPD) — PERTEMUAN ${pNum}`}
              subtitle={`Pendekatan Deep Learning (Memahami, Mengaitkan, Menerapkan) | ${topikMateri}`}
              topic={item.subJudul || topikMateri}
              logo={currIdentitas.logo}
            />

            {/* BOX IDENTITAS SISWA & KELOMPOK (100% FULL WIDTH) */}
            <div className="border-2 border-indigo-900/40 rounded-lg p-4 bg-slate-50/70 mb-6 text-xs md:text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-3 border-b border-indigo-200">
                <div>
                  <span className="font-bold text-gray-600 block text-[11px] uppercase tracking-wide">Mata Pelajaran:</span>
                  <p className="font-extrabold text-indigo-950">{mapel}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-600 block text-[11px] uppercase tracking-wide">Kelas / Fase:</span>
                  <p className="font-extrabold text-indigo-950">{kelasFase}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-600 block text-[11px] uppercase tracking-wide">Pertemuan Ke:</span>
                  <p className="font-extrabold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded inline-block">
                    Pertemuan {pNum} dari {totalSesi}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-gray-600 block text-[11px] uppercase tracking-wide">Alokasi Waktu:</span>
                  <p className="font-extrabold text-indigo-950 bg-amber-100/80 px-2 py-0.5 rounded inline-block">
                    {alokasiWaktu}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-indigo-950 text-xs uppercase tracking-wide">Nama Kelompok:</span>
                    <div className="flex-1 border-b border-dashed border-indigo-400 h-5"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-950 text-xs uppercase tracking-wide">Hari / Tanggal:</span>
                    <div className="flex-1 border-b border-dashed border-indigo-400 h-5"></div>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-indigo-950 block text-xs uppercase tracking-wide mb-1">
                    Anggota Kelompok (1 - 5):
                  </span>
                  <div className="grid grid-cols-1 gap-1 text-[11px] text-gray-700">
                    <div className="border-b border-dashed border-indigo-300 h-4 flex items-center">1) ................................................................</div>
                    <div className="border-b border-dashed border-indigo-300 h-4 flex items-center">2) ................................................................</div>
                    <div className="border-b border-dashed border-indigo-300 h-4 flex items-center">3) ................................................................</div>
                    <div className="border-b border-dashed border-indigo-300 h-4 flex items-center">4) ................................................................ 5) ........................................</div>
                  </div>
                </div>
              </div>
            </div>

            {/* KONTEN STRUKTURAL LKPD DEEP LEARNING */}
            <div className="space-y-6 text-sm text-gray-900 leading-relaxed">
              
              {/* 1. JUDUL & TUJUAN PEMBELAJARAN SESI */}
              <section className="page-break-inside-avoid">
                <div className="bg-indigo-900 text-white px-3 py-1.5 rounded-t-md font-bold text-sm flex items-center justify-between">
                  <span>1. JUDUL & TUJUAN PEMBELAJARAN (PERTEMUAN {pNum})</span>
                  <span className="text-xs font-normal text-indigo-200 uppercase">Fase Mendalam</span>
                </div>
                <div className="p-3.5 border border-t-0 border-indigo-900/30 rounded-b-md bg-white space-y-2">
                  <p className="font-bold text-indigo-950 text-xs md:text-sm">
                    {item.subJudul || `Aktivitas Investigasi & Solusi Pertemuan #${pNum}`}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-800 text-xs md:text-sm pl-1">
                    {(item.tujuanAktivitas || []).map((tujuan, idx) => (
                      <li key={idx} className="leading-snug">
                        {renderTextValue(tujuan)}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* 2. PETUNJUK PENGERJAAN LKPD */}
              <section className="page-break-inside-avoid">
                <div className="bg-slate-800 text-white px-3 py-1.5 rounded-t-md font-bold text-sm">
                  2. PETUNJUK PENGERJAAN LKPD
                </div>
                <div className="p-3.5 border border-t-0 border-slate-300 rounded-b-md bg-amber-50/40">
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-800 text-xs md:text-sm">
                    {(item.petunjukPengerjaan || [
                      'Bacalah teks stimulus studi kasus dengan saksama bersama seluruh anggota kelompok.',
                      'Diskusikan dan jawablah pertanyaan analisis kritis pada Kegiatan 1 (Memahami & Mengaitkan).',
                      'Lakukan investigasi praktikum dan lengkapi Tabel Isian Kerja Siswa pada Kegiatan 2 secara terperinci.',
                      'Rumuskan simpulan akhir dan lengkapi lembar refleksi sebelum mempresentasikan hasil unjuk kerja.'
                    ]).map((p, idx) => (
                      <li key={idx} className="leading-snug">
                        {renderTextValue(p)}
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              {/* 3. STIMULUS / STUDI KASUS KONTEKSUAL */}
              <section className="page-break-inside-avoid">
                <div className="bg-indigo-950 text-white px-3 py-1.5 rounded-t-md font-bold text-sm flex items-center justify-between">
                  <span>3. STIMULUS / STUDI KASUS KONTEKSUAL (PEMANTIK DISKUSI)</span>
                  <span className="text-xs font-normal text-indigo-300">Studi Kasus Nyata</span>
                </div>
                <div className="p-4 border border-t-0 border-indigo-950/30 rounded-b-md bg-slate-50 border-l-4 border-l-indigo-600 text-gray-800 text-xs md:text-sm text-justify leading-relaxed">
                  <p className="italic font-serif text-slate-800">
                    "{renderTextValue(item.stimulusMaterial || `Studi Kasus Kontekstual Pertemuan ${pNum} mengenai penanganan masalah ${topikMateri}. Analisislah seluruh variabel penentu keputusan dan lakukan pemisahan input-proses-output (IPO) secara terstruktur.`)}"
                  </p>
                </div>
              </section>

              {/* 4. KEGIATAN 1: MEMAHAMI & MENGAITKAN (ANALISIS KASUS HOTS) */}
              <section className="page-break-inside-avoid space-y-3">
                <div className="bg-indigo-900 text-white px-3 py-1.5 rounded-t-md font-bold text-sm flex items-center justify-between">
                  <span>4. KEGIATAN 1: MEMAHAMI & MENGAITKAN (PENALARAN KRITIS HOTS)</span>
                  <span className="text-xs font-normal text-indigo-200">Analisis Mendalam</span>
                </div>
                <div className="p-3.5 border border-t-0 border-indigo-900/30 rounded-b-md bg-white space-y-4">
                  <p className="text-xs md:text-sm text-gray-700 font-medium">
                    {item.kegiatan1Memahami?.deskripsi ||
                      'Berdasarkan stimulus kasus di atas, analisislah pertanyaan pemantik berikut secara kritis bersama kelompok Anda:'}
                  </p>

                  <div className="space-y-4">
                    {hotsQuestions.map((pertanyaan, qIdx) => (
                      <div key={qIdx} className="border border-gray-300 rounded-md p-3 bg-slate-50/50">
                        <p className="font-bold text-xs md:text-sm text-indigo-950 mb-2">
                          {qIdx + 1}. {renderTextValue(pertanyaan)}
                        </p>
                        <div className="min-h-[70px] border border-dashed border-gray-400 rounded bg-white p-2.5 text-xs text-gray-500 italic">
                          [ Ruang Jawaban Analisis Siswa #{qIdx + 1} — Tuliskan argumentasi logis kelompok di sini... ]
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 5. KEGIATAN 2: MENERAPKAN / PRAKTIKUM (TABEL ISIAN KERJA SISWA 100% FULL WIDTH) */}
              <section className="page-break-inside-avoid space-y-3">
                <div className="bg-indigo-900 text-white px-3 py-1.5 rounded-t-md font-bold text-sm flex items-center justify-between">
                  <span>5. KEGIATAN 2: MENERAPKAN / PRAKTIKUM (TABEL ISIAN KERJA SISWA)</span>
                  <span className="text-xs font-normal text-indigo-200">Solusi Terapan</span>
                </div>
                <div className="p-3.5 border border-t-0 border-indigo-900/30 rounded-b-md bg-white space-y-3">
                  <p className="text-xs md:text-sm text-gray-700 font-medium">
                    {item.kegiatan2Menerapkan?.instruksiTugas ||
                      'Lakukan analisis solusi sistematis dan tuangkan rancangan pemecahan masalah kelompok ke dalam matriks kerja berikut:'}
                  </p>

                  {/* TABEL ISIAN SISWA (100% FULL WIDTH) */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-400 text-xs md:text-sm">
                      <thead>
                        <tr className="bg-indigo-950 text-white">
                          <th className="border border-gray-400 p-2.5 text-center w-12 font-bold">No</th>
                          <th className="border border-gray-400 p-2.5 text-left w-1/3 font-bold">Komponen / Aspek Analisis</th>
                          <th className="border border-gray-400 p-2.5 text-left font-bold">
                            {isKodingMode
                              ? 'Deskripsi Solusi, Notasi Algoritma & Lembar Pengerjaan Siswa'
                              : 'Deskripsi Solusi, Alur Kerja Naratif & Lembar Pengerjaan Siswa'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabelIsianRows.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                            <td className="border border-gray-400 p-2.5 text-center font-bold text-gray-800 align-top">
                              {row.no || rIdx + 1}
                            </td>
                            <td className="border border-gray-400 p-2.5 align-top">
                              <p className="font-bold text-indigo-950 mb-1">{renderTextValue(row.komponen)}</p>
                              <p className="text-[11px] text-gray-600 italic">{renderTextValue(row.instruksiAnalisis)}</p>
                            </td>
                            <td className="border border-gray-400 p-3 align-top bg-white">
                              <div className="min-h-[75px] border border-dashed border-gray-300 rounded p-2 text-xs text-gray-400 italic flex items-start">
                                {row.ruangJawaban ||
                                  (isKodingMode
                                    ? '[ Tuliskan hasil investigasi, diagram alir, atau pseudocode solusi kelompok di sini... ]'
                                    : '[ Tuliskan hasil investigasi, tabel pengamatan, atau diagram alur naratif solusi kelompok di sini... ]')}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* 6. LEMBAR REFLEKSI, KESIMPULAN & RUBRIK SKOR */}
              <section className="page-break-inside-avoid space-y-4">
                <div className="bg-slate-800 text-white px-3 py-1.5 rounded-t-md font-bold text-sm">
                  6. LEMBAR REFLEKSI, KESIMPULAN & RUBRIK SKOR SISWA
                </div>
                <div className="p-3.5 border border-t-0 border-slate-300 rounded-b-md bg-white space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-indigo-200 p-3 rounded-lg bg-indigo-50/40">
                      <h4 className="font-bold text-indigo-950 text-xs md:text-sm mb-1.5">
                        A. Refleksi Pemahaman Bermakna (Pertemuan {pNum}):
                      </h4>
                      <p className="text-xs text-gray-700 text-justify leading-relaxed mb-2">
                        {renderTextValue(item.refleksiSiswa || `Melalui aktivitas pengerjaan LKPD Pertemuan #${pNum}, kami menyadari pentingnya analisis sistematis dalam memecahkan masalah kompleks.`)}
                      </p>
                      <div className="min-h-[45px] border border-dashed border-indigo-300 rounded bg-white p-2 text-[11px] text-gray-400 italic">
                        [ Catatan refleksi pribadi / hal paling menantang yang dipelajari... ]
                      </div>
                    </div>

                    <div className="border border-indigo-200 p-3 rounded-lg bg-indigo-50/40">
                      <h4 className="font-bold text-indigo-950 text-xs md:text-sm mb-1.5">
                        B. Kesimpulan Akhir Diskusi Kelompok:
                      </h4>
                      <p className="text-xs text-gray-700 text-justify leading-relaxed mb-2">
                        {renderTextValue(item.kesimpulan || `Solusi yang dirancang terbukti mampu memecahkan akar masalah secara terukur dan siap diuji coba lebih lanjut.`)}
                      </p>
                      <div className="min-h-[45px] border border-dashed border-indigo-300 rounded bg-white p-2 text-[11px] text-gray-400 italic">
                        [ Kesimpulan konsensus pemecahan masalah kelompok... ]
                      </div>
                    </div>
                  </div>

                  {/* TABEL RUBRIK SKOR PENILAIAN SINGKAT (100% FULL WIDTH) */}
                  <div className="mt-2">
                    <span className="font-bold text-xs text-gray-700 uppercase tracking-wide block mb-1.5">
                      C. Rubrik Penilaian & Rekapitulasi Skor LKPD (Diisi oleh Guru / Peer-Assessment):
                    </span>
                    <table className="w-full border-collapse border border-gray-300 text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-gray-800">
                          <th className="border border-gray-300 p-2 text-left w-3/5 font-bold">Kriteria Penilaian Unjuk Kerja</th>
                          <th className="border border-gray-300 p-2 text-center w-1/5 font-bold">Skor Maksimal</th>
                          <th className="border border-gray-300 p-2 text-center w-1/5 font-bold">Skor Perolehan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rubrikRows.map((rubrik, rbIdx) => (
                          <tr key={rbIdx}>
                            <td className="border border-gray-300 p-2 text-gray-800 font-medium">{rubrik.kriteria}</td>
                            <td className="border border-gray-300 p-2 text-center font-bold text-gray-800">{rubrik.skorMaks}</td>
                            <td className="border border-gray-300 p-2 text-center text-gray-400 italic">......</td>
                          </tr>
                        ))}
                        <tr className="bg-indigo-50/60 font-bold">
                          <td className="border border-gray-300 p-2 text-right text-indigo-950">TOTAL SKOR AKHIR:</td>
                          <td className="border border-gray-300 p-2 text-center text-indigo-950">100</td>
                          <td className="border border-gray-300 p-2 text-center text-indigo-950">........</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* 7. BLOK PENGESAHAN / TANDA TANGAN (Tabel 2 Kolom Sejajar Tanpa Garis - No Wrap) */}
              <div className="pt-6 page-break-inside-avoid">
                <table className="w-full border-collapse border-0 text-xs md:text-sm text-gray-800">
                  <tbody>
                    <tr className="align-top">
                      {/* Kolom Kiri (Siswa / Ketua Kelompok) */}
                      <td className="w-1/2 text-center p-2 border-0">
                        <p className="text-gray-700 leading-tight">Mengetahui,</p>
                        <p className="font-bold text-gray-900 leading-tight mb-14">{labelSiswa}</p>
                        <p className="font-bold text-gray-900 whitespace-nowrap">
                          (&nbsp;_________________&nbsp;)
                        </p>
                        <p className="text-[11px] text-gray-600 mt-1 whitespace-nowrap">
                          NISN: _________________
                        </p>
                      </td>

                      {/* Kolom Kanan (Guru Mata Pelajaran) */}
                      <td className="w-1/2 text-center p-2 border-0">
                        <p className="text-gray-700 leading-tight">Palembang, ....................</p>
                        <p className="font-bold text-gray-900 leading-tight mb-14">Guru Mata Pelajaran,</p>
                        <p className="font-bold text-gray-900 underline whitespace-nowrap">
                          {guruMapel}
                        </p>
                        <p className="text-[11px] text-gray-600 mt-1 whitespace-nowrap">
                          NIY. {niyGuru}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Dokumen */}
              <div className="pt-4 mt-6 border-t border-gray-200 text-center text-xs text-slate-500 font-medium italic page-break-inside-avoid">
                YAYASAN XAVERIUS PALEMBANG — SMA XAVERIUS 1 PALEMBANG | LKPD Deep Learning Pertemuan {pNum}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
