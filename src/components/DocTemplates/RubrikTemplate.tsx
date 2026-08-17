import React from 'react';
import { RubrikDoc, IdentitasRPM, BarisRubrik } from '../../types';
import { DocumentHeader } from '../DocumentHeader';
import { renderTextValue } from '../../utils/formatUtils';

interface Props {
  data: RubrikDoc;
  id: string;
  identitas?: IdentitasRPM;
}

export const RubrikTemplate: React.FC<Props> = ({ data, id, identitas }) => {
  if (!data) return null;

  const currentIdentitas = data.identitas || identitas || {};
  const guruMapel =
    currentIdentitas.guruMapel ||
    currentIdentitas.namaGuru ||
    currentIdentitas.guru ||
    identitas?.guruMapel ||
    identitas?.namaGuru ||
    identitas?.guru ||
    'Norbertus Suryadi, S.Kom.';

  const totalSesi = Math.max(1, parseInt(String(currentIdentitas.jumlahPertemuan || data.identitas?.jumlahPertemuan || '2'), 10) || 2);

  // Dynamic Formatif List for Bagian A strictly honoring totalSesi
  const getFormatifList = (): BarisRubrik[] => {
    if (Array.isArray(data.bagianA_Formatif?.kriteriaList) && data.bagianA_Formatif.kriteriaList.length === totalSesi) {
      return data.bagianA_Formatif.kriteriaList;
    }
    if (Array.isArray(data.tabelRubrik) && data.tabelRubrik.length === totalSesi) {
      return data.tabelRubrik;
    }

    if (totalSesi === 1) {
      return [
        {
          pertemuanKe: 1,
          kriteria: 'Pertemuan 1: Dekomposisi, Perancangan Algoritma & Evaluasi Terpadu',
          indikator: 'Kemampuan mengurai masalah, merancang diagram alir ISO/pseudocode, serta menguji simulasi solusi.',
          skor4: 'Dekomposisi sempurna, diagram alir 100% tepat sesuai standar ISO, serta uji simulasi trace table sangat komprehensif.',
          skor3: 'Dekomposisi baik, diagram alir jelas dan logis, serta pengujian simulasi berjalan pada skenario umum.',
          skor2: 'Dekomposisi parsial, diagram alir memuat beberapa kelemahan logika, dan pengujian belum komprehensif.',
          skor1: 'Belum mampu memetakan masalah, diagram alir salah total, dan tidak melakukan pengujian.'
        }
      ];
    }

    if (totalSesi === 2) {
      return [
        {
          pertemuanKe: 1,
          kriteria: 'Pertemuan 1: Analisis Dekomposisi & Abstraksi Masalah (Sesi 1)',
          indikator: 'Kemampuan mengurai masalah kompleks menjadi sub-masalah dan memilah variabel keputusan kritis.',
          skor4: 'Mampu mendekomposisi seluruh masalah secara komprehensif dan mengabstraksi data esensial 100% tepat tanpa data redundan.',
          skor3: 'Mampu mendekomposisi masalah utama dengan baik dan mengabstraksi sebagian besar data esensial.',
          skor2: 'Dekomposisi masih parsial/kurang lengkap dan masih menyertakan data non-esensial.',
          skor1: 'Belum mampu memecah masalah menjadi sub-masalah dan gagal mengabstraksi data penting.'
        },
        {
          pertemuanKe: 2,
          kriteria: 'Pertemuan 2: Perancangan Algoritma, Flowchart & Pengujian Simulasi (Sesi 2)',
          indikator: 'Ketepatan simbol ISO, notasi pseudocode percabangan, simulasi dry-run trace table, dan evaluasi solusi.',
          skor4: 'Diagram alir sangat rapi, simbol ISO 100% tepat, uji coba dry-run mendalam (kasus normal & ekstrem), dan solusi sangat efisien.',
          skor3: 'Diagram alir jelas dengan simbol standar tepat, logika benar, dan uji coba dry-run berjalan baik pada kasus normal.',
          skor2: 'Diagram alir memuat beberapa kesalahan simbol/alur dan uji coba simulasi masih sangat terbatas.',
          skor1: 'Diagram alir tidak terstandar, alur logika salah total, dan tidak melakukan uji simulasi trace table.'
        }
      ];
    }

    // Default 3 sessions or more
    const defaultList: BarisRubrik[] = [
      {
        pertemuanKe: 1,
        kriteria: 'Pertemuan 1: Analisis Dekomposisi & Abstraksi Masalah',
        indikator: 'Kemampuan mengurai masalah kompleks menjadi sub-masalah dan memilah variabel kritis.',
        skor4: 'Mampu mendekomposisi seluruh masalah secara komprehensif dan mengabstraksi data esensial 100% tepat tanpa data redundan.',
        skor3: 'Mampu mendekomposisi masalah utama dengan baik dan mengabstraksi sebagian besar data esensial.',
        skor2: 'Dekomposisi masih parsial/kurang lengkap dan masih menyertakan data non-esensial.',
        skor1: 'Belum mampu memecah masalah menjadi sub-masalah dan gagal mengabstraksi data penting.'
      },
      {
        pertemuanKe: 2,
        kriteria: 'Pertemuan 2: Perancangan Diagram Alir / Flowchart & Logika',
        indikator: 'Ketepatan simbol standar ISO, urutan algoritma, dan logika percabangan IF-ELSE.',
        skor4: 'Diagram alir sangat rapi, simbol ISO 100% tepat, logika percabangan dan perulangan runtut serta menangani seluruh kondisi.',
        skor3: 'Diagram alir jelas dengan simbol standar tepat, logika benar dengan sedikit kekurangan pada kondisi minor.',
        skor2: 'Diagram alir memuat beberapa kesalahan simbol atau alur percabangan membingungkan.',
        skor1: 'Diagram alir tidak menggunakan simbol standar dan alur logika terputus/salah total.'
      },
      {
        pertemuanKe: 3,
        kriteria: 'Pertemuan 3: Pengujian Kasus (Testing/Dry-run) & Presentasi',
        indikator: 'Kemampuan simulasi penelusuran algoritma (dry-run), evaluasi kasus ekstrem, dan komunikasi hasil.',
        skor4: 'Uji coba dry-run mendalam (kasus normal & ekstrem), evaluasi efisiensi sangat kritis, serta presentasi sangat lugas & komunikatif.',
        skor3: 'Uji coba dry-run berjalan baik pada kasus normal, evaluasi logis, dan presentasi disampaikan secara jelas.',
        skor2: 'Uji coba hanya pada kasus sederhana dan presentasi kurang percaya diri/kurang terstruktur.',
        skor1: 'Tidak melakukan uji coba algoritma dan tidak mampu mempresentasikan hasil karya kelompok.'
      }
    ];

    return Array.from({ length: totalSesi }, (_, idx) => {
      const pNum = idx + 1;
      const base = defaultList[idx % defaultList.length];
      return {
        ...base,
        pertemuanKe: pNum,
        kriteria: base.kriteria.replace(/Pertemuan \d+/, `Pertemuan ${pNum}`)
      };
    });
  };

  const formatifList: BarisRubrik[] = getFormatifList();

  // Fallback data for Bagian B (Sumatif: PG Kompleks & Essay HOTS)
  const sumatifList = data.bagianB_Sumatif?.rubrikSoalList || [
    {
      no: 1,
      judulSoal: 'Studi Kasus 1: Perancangan Algoritma & Flowchart Sistem Parkir Cerdas (Bobot 30%)',
      soalDeskripsi: 'Dekomposisi variabel input/output, logika percabangan tarif durasi, diskon batas VIP, dan penanganan denda tiket hilang.',
      bobotMaks: 30,
      aspekList: [
        {
          aspek: 'Identifikasi Variabel & Dekomposisi Sistem',
          skorMaks: 10,
          deskripsi: 'Ketepatan variabel durasiJam, isVIP, isTiketHilang, totalBiaya.',
          kriteriaSkor: {
            skor4: 'Variabel didefinisikan 100% lengkap dengan tipe data yang tepat (9-10 poin).',
            skor3: 'Variabel didefinisikan dengan baik dengan kekurangan tipe data minor (7-8 poin).',
            skor2: 'Variabel kurang lengkap atau ada salah penamaan (4-6 poin).',
            skor1: 'Tidak mampu mengidentifikasi variabel utama (1-3 poin).'
          }
        },
        {
          aspek: 'Konstruksi Percabangan Logika IF-ELSE & Batasan VIP',
          skorMaks: 10,
          deskripsi: 'Ketepatan formula tarif bertingkat dan pembatasan maksimal Rp 30.000 untuk VIP.',
          kriteriaSkor: {
            skor4: 'Konstruksi percabangan 100% valid dan menangani seluruh kondisi batas (9-10 poin).',
            skor3: 'Konstruksi percabangan benar dengan kekurangan kecil pada kondisi ekstrem (7-8 poin).',
            skor2: 'Terdapat kesalahan alur pada kondisi batas VIP (4-6 poin).',
            skor1: 'Logika percabangan salah total (1-3 poin).'
          }
        },
        {
          aspek: 'Penanganan Kondisi Khusus & Estetika Diagram Alir',
          skorMaks: 10,
          deskripsi: 'Simbol ISO, denda tiket hilang Rp 50.000, dan output total bayar.',
          kriteriaSkor: {
            skor4: 'Diagram alir sangat rapi, simbol standar ISO valid, dan output tepat (9-10 poin).',
            skor3: 'Diagram alir jelas dan output tepat (7-8 poin).',
            skor2: 'Simbol flowchart keliru atau kondisi denda terlewat (4-6 poin).',
            skor1: 'Diagram alir tidak terstruktur (1-3 poin).'
          }
        }
      ]
    },
    {
      no: 2,
      judulSoal: 'Studi Kasus 2: Analisis Kritis Efisiensi Algoritma Triase IGD (Bobot 30%)',
      soalDeskripsi: 'Analisis kegagalan struktur antrean FIFO pada kegawatdaruratan medis dan perancangan Priority Queue berbasis tingkat keparahan.',
      bobotMaks: 30,
      aspekList: [
        {
          aspek: 'Analisis Kelemahan & Risiko Fatal Antrean FIFO',
          skorMaks: 10,
          deskripsi: 'Argumentasi kritis terhadap kelemahan antrean sekuensial tanpa prioritas.',
          kriteriaSkor: {
            skor4: 'Menganalisis dampak fatal penundaan pasien kritis secara mendalam dan ilmiah (9-10 poin).',
            skor3: 'Menjelaskan kelemahan FIFO dengan baik (7-8 poin).',
            skor2: 'Penjelasan dangkal dan hanya menyebutkan definisi umum (4-6 poin).',
            skor1: 'Tidak memahami kelemahan konsep FIFO (1-3 poin).'
          }
        },
        {
          aspek: 'Rancangan Solusi Priority Queue & Tingkat Keparahan',
          skorMaks: 12,
          deskripsi: 'Penerapan struktur antrean berprioritas (Priority Queue) pada triase IGD.',
          kriteriaSkor: {
            skor4: 'Solusi Priority Queue dirancang sangat terstruktur dengan kunci prioritas yang tepat (11-12 poin).',
            skor3: 'Rancangan Priority Queue baik dan dapat diimplementasikan (9-10 poin).',
            skor2: 'Rancangan kurang jelas dalam menentukan mekanisme prioritas (5-8 poin).',
            skor1: 'Solusi yang diajukan tidak memecahkan masalah prioritas (1-4 poin).'
          }
        },
        {
          aspek: 'Penanganan Kasus Kerapatan Prioritas Sama (Tie-Breaker)',
          skorMaks: 8,
          deskripsi: 'Kombinasi Priority Queue dengan FIFO untuk pasien dengan tingkat kegawatan setara.',
          kriteriaSkor: {
            skor4: 'Menjelaskan mekanisme tie-breaker secara logis dan presisi (7-8 poin).',
            skor3: 'Menyebutkan penanganan waktu kedatangan pada prioritas sama (5-6 poin).',
            skor2: 'Penjelasan kurang lengkap (3-4 poin).',
            skor1: 'Tidak menyertakan solusi penanganan kasus prioritas sama (1-2 poin).'
          }
        }
      ]
    }
  ];

  // Fallback data for Bagian C (Moodle LMS & H5P)
  const moodleList = data.bagianC_Moodle?.aktivitasList || [
    {
      aspek: 'Penyelesaian Modul H5P Interaktif (Drag & Drop dan Fill-in-the-Blanks)',
      bobotMaks: 100,
      deskripsi: 'Pencapaian skor pada modul interaktif H5P di LMS Moodle untuk pemahaman simbol flowchart dan pseudocode.',
      skor4: 'Menyelesaikan seluruh aktivitas H5P dengan akurasi 90 - 100% pada percobaan pertama/kedua (Skor: 90-100).',
      skor3: 'Menyelesaikan aktivitas H5P dengan akurasi 75 - 89% (Skor: 75-89).',
      skor2: 'Menyelesaikan aktivitas H5P dengan akurasi 60 - 74% setelah beberapa kali perbaikan (Skor: 60-74).',
      skor1: 'Tidak menyelesaikan modul H5P interaktif di LMS Moodle (Skor: <60).'
    },
    {
      aspek: 'Kualitas & Keaktifan Forum Diskusi LMS',
      bobotMaks: 100,
      deskripsi: 'Frekuensi dan kedalaman argumen dalam postingan diskusi kelompok asinkron.',
      skor4: 'Memposting minimal 1 ide orisinal mendalam dan memberikan 2+ tanggapan kritis pada argumen rekan sejawat (Skor: 86-100).',
      skor3: 'Memposting 1 ide orisinal dan memberikan 1 tanggapan positif pada postingan rekan (Skor: 75-85).',
      skor2: 'Hanya memposting kiriman singkat tanpa argumentasi analitis atau tanggapan rekan (Skor: 60-74).',
      skor1: 'Tidak aktif dan tidak membuat postingan sama sekali dalam forum diskusi LMS (Skor: <60).'
    },
    {
      aspek: 'Ketepatan Submission Berkas LKPD & Kuis Formatif Online',
      bobotMaks: 100,
      deskripsi: 'Disiplin batas waktu pengumpulan berkas PDF dan pencapaian skor kuis online.',
      skor4: 'Seluruh berkas LKPD P1-P3 diunggah tepat waktu dengan format sesuai instruksi, dan skor kuis Moodle >= 85 (Skor: 86-100).',
      skor3: 'Tugas diunggah tepat waktu dan menyelesaikan kuis Moodle dengan skor KKTP 75-84 (Skor: 75-85).',
      skor2: 'Terlambat mengumpulkan tugas (H+1 sampai H+2) atau nilai kuis Moodle 60-74 (Skor: 60-74).',
      skor1: 'Tidak mengumpulkan tugas submission atau tidak mengerjakan kuis evaluasi online (Skor: <60).'
    }
  ];

  // Fallback data for Bagian D (Formula & Interval KKTP)
  const formulaData = data.bagianD_Formula || {
    judul: 'Formula Kalkulasi Nilai Akhir (NA) & Konversi Predikat KKTP',
    rumusNA: 'Nilai Akhir (NA) = (Skor Formatif [H5P & LKPD] × 30%) + (Skor PG Kompleks [40%] + Skor Essay HOTS [60%] × 70%)',
    penjelasanBobot: [
      {
        komponen: '1. Asesmen Formatif (H5P Moodle & Observasi LKPD)',
        bobotPersen: 30,
        keterangan: 'Mengukur proses interaktif modul H5P Drag & Drop / Fill-in-the-Blanks serta observasi kerja kolaboratif pada LKPD P1-P3.'
      },
      {
        komponen: '2. Asesmen Sumatif PG Kompleks (5 Butir Soal)',
        bobotPersen: 28,
        keterangan: 'Mewakili 40% dari porsi Asesmen Sumatif (40% × 70% = 28% dari NA) untuk menguji penalaran analitis dasar.'
      },
      {
        komponen: '3. Asesmen Sumatif Essay HOTS (2 Kasus Kasus Komputasi)',
        bobotPersen: 42,
        keterangan: 'Mewakili 60% dari porsi Asesmen Sumatif (60% × 70% = 42% dari NA) untuk menguji konstruksi algoritma & analisis efisiensi.'
      }
    ],
    intervalKktp: [
      {
        rentangNilai: '86 – 100',
        predikat: 'Sangat Baik (A)',
        keterangan: 'Tuntas Mandiri: Peserta didik menunjukkan penguasaan kompetensi berpikir komputasional yang sangat mendalam, kreatif, dan mandiri.'
      },
      {
        rentangNilai: '75 – 85',
        predikat: 'Baik (B)',
        keterangan: 'Tuntas Standar: Peserta didik mencapai seluruh kriteria ketercapaian tujuan pembelajaran (KKTP) dengan logika dan konstruksi algoritma yang baik.'
      },
      {
        rentangNilai: '60 – 74',
        predikat: 'Cukup (C)',
        keterangan: 'Belum Tuntas: Peserta didik memahami konsep dasar namun memerlukan penguatan terbimbing pada konstruksi percabangan logika tertentu.'
      },
      {
        rentangNilai: '< 60',
        predikat: 'Perlu Bimbingan (D)',
        keterangan: 'Belum Tuntas: Peserta didik belum mencapai standar kompetensi dasar dan memerlukan bimbingan intensif serta program remedial terarah.'
      }
    ]
  };

  return (
    <div
      id={id || 'document-preview-container'}
      data-doc-container="rubrik"
      className="bg-white p-8 md:p-12 text-slate-900 font-sans shadow-sm rounded-lg border border-slate-300 max-w-5xl mx-auto print:shadow-none print:p-0 print:border-none space-y-8 document-preview-container"
      style={{ minHeight: '1000px', backgroundColor: '#ffffff', color: '#0f172a' }}
    >
      {/* Header Rubrik Standardized */}
      <DocumentHeader
        documentType="rubrik"
        schoolName={currentIdentitas?.sekolah || 'SMA XAVERIUS 1 PALEMBANG'}
        logo={currentIdentitas?.logo}
        topic={currentIdentitas?.topik || 'Berpikir Komputasional & Algoritma'}
        title={data.judul || 'RUBRIK PENILAIAN KOMPREHENSIF & KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)'}
      />

      {/* Tabel Identitas & Informasi Umum */}
      <div className="overflow-x-auto page-break-inside-avoid">
        <table className="w-full text-xs md:text-sm border-collapse border border-slate-300">
          <tbody>
            <tr className="bg-slate-100">
              <td className="border border-slate-300 p-2.5 font-bold w-1/4 text-slate-900">Sekolah</td>
              <td className="border border-slate-300 p-2.5 w-1/4 font-semibold text-slate-900">{currentIdentitas.sekolah || 'SMA Xaverius 1 Palembang'}</td>
              <td className="border border-slate-300 p-2.5 font-bold w-1/4 text-slate-900">Mata Pelajaran</td>
              <td className="border border-slate-300 p-2.5 w-1/4 font-semibold text-slate-900">{currentIdentitas.mataPelajaran || 'Informatika'}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2.5 font-bold bg-emerald-50 text-emerald-950">Guru Mapel</td>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900 bg-emerald-50/30">{guruMapel}</td>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900">Kelas / Fase</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-slate-900">{currentIdentitas.kelas || 'Fase E (Kelas X)'}</td>
            </tr>
            <tr className="bg-slate-100">
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900">Topik Pembelajaran</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-slate-900" colSpan={3}>
                {currentIdentitas.topik || 'Berpikir Komputasional & Algoritma'}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900">Alokasi Waktu</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-slate-900">{currentIdentitas.alokasiWaktu || '3 Pertemuan (6 JP)'}</td>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900">Target Kelulusan</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-emerald-900">KKTP ≥ 75 (Skala 0 - 100)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Banner Ringkasan Light Theme */}
      <div
        className="bg-slate-50 border border-slate-300 rounded-lg p-5 shadow-2xs page-break-inside-avoid"
        style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a' }}
      >
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3 mb-3"
          style={{ borderColor: '#e2e8f0' }}
        >
          <div>
            <span
              className="text-emerald-800 text-xs uppercase tracking-wider font-bold block"
              style={{ color: '#065f46' }}
            >
              PANDUAN ASESMEN & EVALUASI TERPADU
            </span>
            <h2
              className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900"
              style={{ color: '#0f172a' }}
            >
              Rubrik Penilaian Holistik Kurikulum Merdeka
            </h2>
          </div>
          <div
            className="bg-emerald-700 px-3.5 py-1.5 rounded text-xs font-bold text-white shadow-2xs self-start md:self-auto"
            style={{
              backgroundColor: '#047857',
              color: '#ffffff',
              fontWeight: 'bold',
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '6px'
            }}
          >
            4 Pilar Asesmen Terpadu
          </div>
        </div>

        <p
          className="text-slate-700 text-xs md:text-sm leading-relaxed"
          style={{ color: '#334155' }}
        >
          {data.subJudul ||
            'Rubrik komprehensif ini memadukan asesmen formatif proses kolaboratif pada LKPD, asesmen sumatif terstruktur (5 PG Kompleks & 2 Essay HOTS), partisipasi interaktif modul H5P & LMS Moodle, serta formula pembobotan Nilai Akhir (NA) berbasis KKTP.'}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN A: RUBRIK ASESMEN FORMATIF LKPD (3 PERTEMUAN)                      */}
      {/* ========================================================================= */}
      <div className="space-y-3 page-break-inside-avoid">
        <div
          className="bg-emerald-800 text-white px-4 py-2.5 rounded-t-lg font-bold text-xs md:text-sm uppercase tracking-wide flex items-center justify-between"
          style={{ backgroundColor: '#065f46', color: '#ffffff' }}
        >
          <span>BAGIAN A: RUBRIK ASESMEN FORMATIF PROSES LKPD (SKALA 1 – 4)</span>
          <span className="text-emerald-100 text-xs font-normal" style={{ color: '#d1fae5' }}>
            Unjuk Kerja Kelompok
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-300 rounded-b-lg shadow-2xs">
          <table className="w-full text-xs border-collapse" style={{ borderColor: '#cbd5e1' }}>
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                <th className="border-r border-slate-300 p-2.5 text-left w-1/4" style={{ borderColor: '#cbd5e1' }}>
                  Pertemuan & Kriteria Unjuk Kerja
                </th>
                <th className="border-r border-slate-300 p-2.5 text-left w-[18.75%] bg-emerald-50 text-emerald-800 font-bold" style={{ backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#cbd5e1' }}>
                  Skor 4 (Sangat Baik)
                </th>
                <th className="border-r border-slate-300 p-2.5 text-left w-[18.75%] bg-blue-50 text-blue-800 font-bold" style={{ backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#cbd5e1' }}>
                  Skor 3 (Baik)
                </th>
                <th className="border-r border-slate-300 p-2.5 text-left w-[18.75%] bg-amber-50 text-amber-800 font-bold" style={{ backgroundColor: '#fffbeb', color: '#92400e', borderColor: '#cbd5e1' }}>
                  Skor 2 (Cukup)
                </th>
                <th className="p-2.5 text-left w-[18.75%] bg-red-50 text-red-700 font-bold" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                  Skor 1 (Perlu Bimbingan)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200" style={{ borderColor: '#e2e8f0' }}>
              {formatifList.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="border-r border-slate-300 p-3 align-top bg-slate-50/80" style={{ borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="bg-emerald-700 text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: '#047857',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '6px'
                        }}
                      >
                        P#{row.pertemuanKe || idx + 1}
                      </span>
                      <strong className="text-slate-900 font-bold" style={{ color: '#0f172a' }}>
                        {renderTextValue(row.kriteria)}
                      </strong>
                    </div>
                    {row.indikator && (
                      <p className="text-[11px] text-slate-600 italic leading-snug mt-1" style={{ color: '#475569' }}>
                        {renderTextValue(row.indikator)}
                      </p>
                    )}
                  </td>
                  <td className="border-r border-slate-300 p-3 align-top text-slate-800 leading-snug font-normal" style={{ borderColor: '#cbd5e1', color: '#1e293b' }}>
                    {renderTextValue(row.skor4)}
                  </td>
                  <td className="border-r border-slate-300 p-3 align-top text-slate-800 leading-snug font-normal" style={{ borderColor: '#cbd5e1', color: '#1e293b' }}>
                    {renderTextValue(row.skor3)}
                  </td>
                  <td className="border-r border-slate-300 p-3 align-top text-slate-800 leading-snug font-normal" style={{ borderColor: '#cbd5e1', color: '#1e293b' }}>
                    {renderTextValue(row.skor2)}
                  </td>
                  <td className="p-3 align-top text-slate-800 leading-snug font-normal" style={{ color: '#1e293b' }}>
                    {renderTextValue(row.skor1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 italic text-right" style={{ color: '#64748b' }}>
          * Konversi Nilai Formatif = (Total Skor Diperoleh / Total Skor Maksimal) × 100
        </p>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN B: RUBRIK ASESMEN SUMATIF (PG KOMPLEKS 40% & ESSAY HOTS 60%)       */}
      {/* ========================================================================= */}
      <div className="space-y-4 page-break-inside-avoid">
        <div
          className="bg-emerald-800 text-white px-4 py-2.5 rounded-t-lg font-bold text-xs md:text-sm uppercase tracking-wide flex items-center justify-between"
          style={{ backgroundColor: '#065f46', color: '#ffffff' }}
        >
          <span>BAGIAN B: RUBRIK ASESMEN SUMATIF (PG KOMPLEKS 40% & ESSAY HOTS 60%)</span>
          <span className="text-emerald-100 text-xs font-normal" style={{ color: '#d1fae5' }}>
            Total 100 Poin
          </span>
        </div>

        {/* Info Pembobotan Sub-Bagian Sumatif */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-xs space-y-1">
            <strong className="text-emerald-950 block text-xs">
              1. Pilihan Ganda Kompleks (5 Soal — 5 Opsi A-E — Bobot 40%)
            </strong>
            <p className="text-slate-700 leading-snug">
              Setiap nomor bernilai 8 Poin (Total 40 Poin). Dinilai berdasarkan kebenaran analisis 5 opsi pilihan (A, B, C, D, E) / pernyataan Benar-Salah.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-xs space-y-1">
            <strong className="text-emerald-950 block text-xs">
              2. Essay Analitis HOTS (2 Soal — Bobot 60%)
            </strong>
            <p className="text-slate-700 leading-snug">
              Setiap nomor bernilai 30 Poin (Total 60 Poin). Dinilai melalui rubrik berjenjang mencakup identifikasi variabel, konstruksi logika, dan efisiensi.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {sumatifList.map((soalItem, sIdx) => (
            <div
              key={sIdx}
              className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs page-break-inside-avoid"
              style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}
            >
              {/* Header Tiap Soal */}
              <div
                className="bg-emerald-50 px-4 py-3 border-b border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="bg-emerald-700 text-white text-xs font-bold mr-3 inline-flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: '#047857',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}
                  >
                    Kasus #{soalItem.no || sIdx + 1}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs md:text-sm leading-snug" style={{ color: '#0f172a' }}>
                    {soalItem.judulSoal}
                  </h4>
                </div>
                <span
                  className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-md self-start md:self-auto shrink-0"
                  style={{ backgroundColor: '#d1fae5', color: '#064e3b', borderColor: '#a7f3d0' }}
                >
                  Bobot Maks: {soalItem.bobotMaks} Poin
                </span>
              </div>

              {soalItem.soalDeskripsi && (
                <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 leading-relaxed font-normal" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#334155' }}>
                  <strong className="text-slate-900" style={{ color: '#0f172a' }}>Ruang Lingkup Kasus: </strong>
                  {soalItem.soalDeskripsi}
                </div>
              )}

              {/* Tabel Sub-Aspek Penilaian Soal */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                      <th className="p-2.5 text-left w-1/4 border-r border-slate-300" style={{ borderColor: '#cbd5e1' }}>
                        Aspek Penilaian & Bobot
                      </th>
                      <th className="p-2.5 text-left w-[18.75%] border-r border-slate-300 bg-emerald-50 text-emerald-800 font-bold" style={{ backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#cbd5e1' }}>
                        Tingkat 4 (Maksimal)
                      </th>
                      <th className="p-2.5 text-left w-[18.75%] border-r border-slate-300 bg-blue-50 text-blue-800 font-bold" style={{ backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#cbd5e1' }}>
                        Tingkat 3 (Baik)
                      </th>
                      <th className="p-2.5 text-left w-[18.75%] border-r border-slate-300 bg-amber-50 text-amber-800 font-bold" style={{ backgroundColor: '#fffbeb', color: '#92400e', borderColor: '#cbd5e1' }}>
                        Tingkat 2 (Cukup)
                      </th>
                      <th className="p-2.5 text-left w-[18.75%] bg-red-50 text-red-700 font-bold" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                        Tingkat 1 (Kurang)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200" style={{ borderColor: '#e2e8f0' }}>
                    {soalItem.aspekList.map((aspekItem, aIdx) => (
                      <tr key={aIdx} className={aIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-3 align-top border-r border-slate-300 bg-slate-50/70" style={{ borderColor: '#cbd5e1' }}>
                          <strong className="text-slate-900 block font-bold" style={{ color: '#0f172a' }}>
                            {aspekItem.aspek}
                          </strong>
                          <span className="inline-block mt-1 bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#e2e8f0', color: '#1e293b' }}>
                            Maks: {aspekItem.skorMaks} Poin
                          </span>
                          {aspekItem.deskripsi && (
                            <p className="text-[11px] text-slate-500 italic mt-1" style={{ color: '#64748b' }}>
                              {aspekItem.deskripsi}
                            </p>
                          )}
                        </td>
                        <td className="p-3 align-top border-r border-slate-300 text-slate-800 leading-snug font-normal" style={{ borderColor: '#cbd5e1', color: '#1e293b' }}>
                          {aspekItem.kriteriaSkor.skor4}
                        </td>
                        <td className="p-3 align-top border-r border-slate-300 text-slate-800 leading-snug font-normal" style={{ borderColor: '#cbd5e1', color: '#1e293b' }}>
                          {aspekItem.kriteriaSkor.skor3}
                        </td>
                        <td className="p-3 align-top border-r border-slate-300 text-slate-800 leading-snug font-normal" style={{ borderColor: '#cbd5e1', color: '#1e293b' }}>
                          {aspekItem.kriteriaSkor.skor2}
                        </td>
                        <td className="p-3 align-top text-slate-800 leading-snug font-normal" style={{ color: '#1e293b' }}>
                          {aspekItem.kriteriaSkor.skor1}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN C: RUBRIK PARTISIPASI LMS MOODLE & MODUL INTERAKTIF H5P            */}
      {/* ========================================================================= */}
      <div className="space-y-3 page-break-inside-avoid">
        <div
          className="bg-emerald-800 text-white px-4 py-2.5 rounded-t-lg font-bold text-xs md:text-sm uppercase tracking-wide flex items-center justify-between"
          style={{ backgroundColor: '#065f46', color: '#ffffff' }}
        >
          <span>BAGIAN C: RUBRIK PARTISIPASI LMS MOODLE & MODUL H5P INTERAKTIF</span>
          <span className="text-emerald-100 text-xs font-normal" style={{ color: '#d1fae5' }}>
            Skala 0 – 100 Poin
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-300 rounded-b-lg shadow-2xs">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                <th className="p-2.5 text-left w-1/4 border-r border-slate-300" style={{ borderColor: '#cbd5e1' }}>
                  Aktivitas E-Learning LMS
                </th>
                <th className="p-2.5 text-left w-[18.75%] border-r border-slate-300 bg-emerald-50 text-emerald-800 font-bold" style={{ backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#cbd5e1' }}>
                  Sangat Baik (86 – 100)
                </th>
                <th className="p-2.5 text-left w-[18.75%] border-r border-slate-300 bg-blue-50 text-blue-800 font-bold" style={{ backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#cbd5e1' }}>
                  Baik (75 – 85)
                </th>
                <th className="p-2.5 text-left w-[18.75%] border-r border-slate-300 bg-amber-50 text-amber-800 font-bold" style={{ backgroundColor: '#fffbeb', color: '#92400e', borderColor: '#cbd5e1' }}>
                  Cukup (60 – 74)
                </th>
                <th className="p-2.5 text-left w-[18.75%] bg-red-50 text-red-700 font-bold" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                  Kurang (&lt; 60)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200" style={{ borderColor: '#e2e8f0' }}>
              {moodleList.map((mItem, mIdx) => (
                <tr key={mIdx} className={mIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="p-3 align-top border-r border-slate-300 bg-slate-50/80" style={{ borderColor: '#cbd5e1' }}>
                    <strong className="text-slate-900 block font-bold" style={{ color: '#0f172a' }}>
                      {mItem.aspek}
                    </strong>
                    <span className="text-[11px] text-slate-600 leading-snug block mt-1" style={{ color: '#475569' }}>
                      {mItem.deskripsi}
                    </span>
                  </td>
                  <td className="p-3 align-top border-r border-slate-300 text-slate-800 leading-snug font-normal" style={{ borderColor: '#cbd5e1', color: '#1e293b' }}>
                    {mItem.skor4}
                  </td>
                  <td className="p-3 align-top border-r border-slate-300 text-slate-800 leading-snug font-normal" style={{ borderColor: '#cbd5e1', color: '#1e293b' }}>
                    {mItem.skor3}
                  </td>
                  <td className="p-3 align-top border-r border-slate-300 text-slate-800 leading-snug font-normal" style={{ borderColor: '#cbd5e1', color: '#1e293b' }}>
                    {mItem.skor2}
                  </td>
                  <td className="p-3 align-top text-slate-800 leading-snug font-normal" style={{ color: '#1e293b' }}>
                    {mItem.skor1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN D: FORMULA KALKULASI NILAI AKHIR (NA) & INTERVAL KKTP               */}
      {/* ========================================================================= */}
      <div className="space-y-4 page-break-inside-avoid">
        <div
          className="bg-emerald-800 text-white px-4 py-2.5 rounded-t-lg font-bold text-xs md:text-sm uppercase tracking-wide flex items-center justify-between"
          style={{ backgroundColor: '#065f46', color: '#ffffff' }}
        >
          <span>BAGIAN D: FORMULA KALKULASI NILAI AKHIR (NA) & KRITERIA KKTP</span>
          <span className="text-emerald-100 text-xs font-normal" style={{ color: '#d1fae5' }}>
            Ketuntasan Pembelajaran
          </span>
        </div>

        {/* Kotak Formula Pembobotan */}
        <div
          className="border border-emerald-300 rounded-lg p-4 bg-emerald-50/60 shadow-2xs space-y-3"
          style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="bg-emerald-700 text-white text-xs font-bold shadow-2xs"
              style={{
                backgroundColor: '#047857',
                color: '#ffffff',
                fontWeight: 'bold',
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '6px'
              }}
            >
              Formula Nilai Akhir (NA)
            </span>
            <span className="text-xs text-slate-600 font-medium italic" style={{ color: '#475569' }}>
              Mengakomodasi Komponen PG Kompleks, Formatif H5P/LKPD, & Essay HOTS
            </span>
          </div>

          <div
            className="p-3 bg-white rounded border border-emerald-300 text-center font-mono font-bold text-xs md:text-sm text-emerald-950 shadow-2xs"
            style={{ backgroundColor: '#ffffff', borderColor: '#6ee7b7', color: '#064e3b' }}
          >
            {formulaData.rumusNA}
          </div>

          {/* Rincian Komponen Pembobotan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            {formulaData.penjelasanBobot.map((komp, kIdx) => (
              <div
                key={kIdx}
                className="bg-white p-2.5 rounded border border-emerald-200 text-xs shadow-2xs"
                style={{ backgroundColor: '#ffffff', borderColor: '#a7f3d0' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-slate-900 font-bold text-[11px]" style={{ color: '#0f172a' }}>
                    {komp.komponen}
                  </strong>
                  <span className="bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded text-[11px]" style={{ backgroundColor: '#d1fae5', color: '#064e3b' }}>
                    {komp.bobotPersen}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug font-normal" style={{ color: '#475569' }}>
                  {komp.keterangan}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabel Interval Predikat KKTP */}
        <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-2xs">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                <th className="p-2.5 text-center w-1/6 border-r border-slate-300" style={{ borderColor: '#cbd5e1' }}>
                  Rentang Nilai Akhir
                </th>
                <th className="p-2.5 text-center w-1/5 border-r border-slate-300" style={{ borderColor: '#cbd5e1' }}>
                  Predikat Ketercapaian
                </th>
                <th className="p-2.5 text-left w-3/5">
                  Deskripsi Kriteria Ketercapaian & Tindak Lanjut Pedagogik
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200" style={{ borderColor: '#e2e8f0' }}>
              {formulaData.intervalKktp.map((row, rIdx) => {
                let badgeBg = '#ecfdf5';
                let badgeText = '#065f46';
                let badgeBorder = '#a7f3d0';

                if (row.predikat.includes('Cukup')) {
                  badgeBg = '#fffbeb';
                  badgeText = '#92400e';
                  badgeBorder = '#fde68a';
                } else if (row.predikat.includes('Perlu Bimbingan')) {
                  badgeBg = '#fff1f2';
                  badgeText = '#9f1239';
                  badgeBorder = '#fecdd3';
                } else if (row.predikat.includes('Baik')) {
                  badgeBg = '#eff6ff';
                  badgeText = '#1e40af';
                  badgeBorder = '#bfdbfe';
                }

                return (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 text-center font-mono font-bold text-slate-900 border-r border-slate-300 bg-slate-50/60" style={{ borderColor: '#cbd5e1', color: '#0f172a' }}>
                      {row.rentangNilai}
                    </td>
                    <td className="p-3 text-center border-r border-slate-300" style={{ borderColor: '#cbd5e1' }}>
                      <span
                        className="inline-block px-2.5 py-1 rounded text-xs font-bold border"
                        style={{ backgroundColor: badgeBg, color: badgeText, borderColor: badgeBorder }}
                      >
                        {row.predikat}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 leading-snug font-normal" style={{ color: '#1e293b' }}>
                      {row.keterangan}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Dokumen */}
      <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-600 font-medium italic page-break-inside-avoid" style={{ borderColor: '#e2e8f0', color: '#475569' }}>
        CopyRight©Norbertus Suryadi — SMA Xaverius 1 Palembang | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning
      </div>
    </div>
  );
};
