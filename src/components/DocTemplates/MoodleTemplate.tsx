import React from 'react';
import { MoodleDoc, IdentitasRPM, SesiElearningItem, RingkasanMateriItem } from '../../types';
import { DocumentHeader } from '../DocumentHeader';
import { generateDefaultMateriItems } from '../../services/rpmService';

interface Props {
  data: MoodleDoc;
  id: string;
  identitas?: IdentitasRPM;
}

export const MoodleTemplate: React.FC<Props> = ({ data, id, identitas }) => {
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

  const defaultMateriList = generateDefaultMateriItems(currentIdentitas);

  // Logic to obtain session list: strictly synchronized with currentIdentitas.jumlahPertemuan
  const getSessionList = (): SesiElearningItem[] => {
    const totalSessions = Math.max(1, parseInt(String(currentIdentitas.jumlahPertemuan || data.jumlahPertemuan || '2'), 10) || 2);

    if (Array.isArray(data.sesiElearning) && data.sesiElearning.length === totalSessions) {
      return data.sesiElearning;
    }

    if (Array.isArray((data as any).pertemuanList) && (data as any).pertemuanList.length === totalSessions) {
      return (data as any).pertemuanList.map((p: any, idx: number) => ({
        pertemuanKe: p.pertemuanKe || idx + 1,
        namaSesi: p.subJudul || `Sesi #${idx + 1}`,
        jenisAktivitas: [
          idx === 0
            ? 'H5P Drag & Drop (Simbol & Dekomposisi)'
            : idx === 1
            ? 'H5P Fill-in-the-Blanks (Pseudocode)'
            : 'Moodle Quiz & Portofolio Final',
          'Forum Diskusi LMS',
          'Assignment / Submission'
        ],
        formatPengumpulan: 'File PDF (Maks 5MB)',
        tenggatWaktu: 'H+3 Setelah Pertemuan',
        instruksi: p.petunjukPengerjaan || [
          'Pelajari materi pengantar dan kerjakan modul H5P interaktif di Moodle.',
          'Diskusikan pemecahan masalah bersama kelompok di forum.',
          'Unggah hasil pengerjaan LKPD pada portal submission.'
        ],
        bahanSupport: ['Modul Digital Pembelajaran', 'Template LKPD PDF', 'Paket Aktivitas H5P']
      }));
    }

    // Dynamic session templates based on totalSessions
    if (totalSessions === 1) {
      return [
        {
          pertemuanKe: 1,
          namaSesi: 'Sesi 1: Dekomposisi, Perancangan Algoritma & Evaluasi Terpadu (H5P + Kuis Moodle)',
          jenisAktivitas: [
            'H5P Drag & Drop (Simbol Flowchart)',
            'H5P Fill-in-the-Blanks (Pseudocode Logika)',
            'Forum Diskusi Terpadu LMS',
            'Kuis Evaluasi Online (Moodle Quiz)',
            'Assignment Unggah LKPD & Portofolio'
          ],
          formatPengumpulan: 'Aktivitas Interaktif H5P & File PDF (Maks 5MB)',
          tenggatWaktu: 'H+3 Setelah Pembelajaran (Pukul 23.59 WIB)',
          instruksi: [
            'Unduh materi komputasional dan selesaikan modul interaktif H5P Drag & Drop pemetaan variabel.',
            'Lengkapi notasi algoritma percabangan pada aktivitas H5P Fill-in-the-Blanks.',
            'Diskusikan solusi bersama kelompok dan kerjakan Kuis Evaluasi Moodle.',
            'Unggah berkas LKPD Terpadu dan laporan solusi kelompok ke portal assignment.'
          ],
          bahanSupport: ['Slide Materi Terpadu PDF', 'Modul Interaktif H5P Bundle', 'Template LKPD PDF', 'Bank Soal Kuis Moodle']
        }
      ];
    }

    if (totalSessions === 2) {
      return [
        {
          pertemuanKe: 1,
          namaSesi: 'Sesi 1: Dekomposisi, Abstraksi & H5P Drag and Drop Simbol Flowchart',
          jenisAktivitas: [
            'H5P Drag and Drop (Simbol & Dekomposisi)',
            'Forum Diskusi Kelompok (Moodle Forum)',
            'Assignment Unggah LKPD 1'
          ],
          formatPengumpulan: 'Aktivitas H5P Online & File PDF (Maksimal 5MB)',
          tenggatWaktu: 'H+3 Setelah Pertemuan 1 (Pukul 23.59 WIB)',
          instruksi: [
            'Unduh dan pelajari slide materi dekomposisi serta studi kasus pengantar E-Hospital.',
            'Kerjakan modul interaktif H5P Drag and Drop: Menyusun urutan simbol flowchart dan pemetaan variabel IPO.',
            'Diskusikan identifikasi akar masalah dan pemisahan variabel kritis pada Forum Diskusi Sesi 1.',
            'Unggah berkas hasil LKPD Pertemuan 1 dalam format PDF.'
          ],
          bahanSupport: ['Slide Presentasi Dekomposisi PDF', 'Modul Interaktif H5P Drag & Drop', 'Template LKPD 1 PDF']
        },
        {
          pertemuanKe: 2,
          namaSesi: 'Sesi 2: Perancangan Algoritma, Pengujian Dry-Run & Kuis Formatif (H5P + Moodle Quiz)',
          jenisAktivitas: [
            'H5P Fill-in-the-Blanks (Pseudocode Percabangan)',
            'Assignment Unggah Flowchart & Trace Table LKPD 2',
            'Kuis Evaluasi Formatif (Moodle Quiz)',
            'Gelar Portofolio & Refleksi LMS'
          ],
          formatPengumpulan: 'Aktivitas H5P Online, Pengerjaan Kuis Moodle & File PDF Laporan',
          tenggatWaktu: 'H+3 Setelah Pertemuan 2 (Pukul 23.59 WIB)',
          instruksi: [
            'Kerjakan modul interaktif H5P Fill-in-the-Blanks untuk melengkapi rumpang logika IF-ELSE percabangan.',
            'Rancang diagram alir (Flowchart) dan lakukan uji coba simulasi trace table kasus batas & ekstrem.',
            'Kerjakan Kuis Evaluasi Moodle (10 butir soal pilihan ganda & penalaran logika).',
            'Kumpulkan laporan portofolio final gabungan P1-P2 ke portal submission.'
          ],
          bahanSupport: ['Modul H5P Fill-in-the-Blanks', 'Bank Soal Kuis Moodle', 'Template LKPD 2 PDF', 'Rubrik Portofolio']
        }
      ];
    }

    // Default fallback 3 sessions or more
    const fallbackActivities = [
      {
        nama: 'Sesi 1: Dekomposisi, Abstraksi & H5P Drag and Drop Simbol Flowchart',
        jenis: [
          'H5P Drag and Drop (Simbol & Dekomposisi)',
          'Forum Diskusi Kelompok (Moodle Forum)',
          'Assignment Unggah LKPD 1'
        ],
        format: 'Aktivitas H5P Online & File PDF (Maksimal 5MB)',
        waktu: 'H+3 Setelah Pertemuan 1 (Pukul 23.59 WIB)',
        instruksi: [
          'Unduh dan pelajari slide materi dekomposisi serta studi kasus pengantar.',
          'Kerjakan modul interaktif H5P Drag and Drop: Menyusun urutan simbol flowchart dan drop zone variabel.',
          'Diskusikan identifikasi akar masalah dan pemisahan variabel kritis pada Forum Diskusi Sesi 1.',
          'Unggah berkas hasil LKPD Pertemuan 1 dalam format PDF.'
        ],
        support: ['Slide Presentasi Dekomposisi PDF', 'Modul Interaktif H5P Drag & Drop', 'Template LKPD 1 PDF']
      },
      {
        nama: 'Sesi 2: Perancangan Algoritma & H5P Fill-in-the-Blanks Pseudocode Percabangan',
        jenis: [
          'H5P Fill-in-the-Blanks (Pseudocode)',
          'Assignment Unggah Flowchart & Diagram',
          'Workshop Konsultasi Logika'
        ],
        format: 'Aktivitas H5P Online & File PDF / Gambar Diagram',
        waktu: 'H+3 Setelah Pertemuan 2 (Pukul 23.59 WIB)',
        instruksi: [
          'Kerjakan modul interaktif H5P Fill-in-the-Blanks untuk melengkapi rumpang kata kunci logika IF-ELSE percabangan.',
          'Rancang diagram alir (Flowchart) solusi komputasional berdasarkan dekomposisi Sesi 1 menggunakan Draw.io.',
          'Unggah file diagram dan berikan tanggapan masukan pada minimal 1 karya kelompok lain di forum LMS.'
        ],
        support: ['Modul H5P Fill-in-the-Blanks', 'Aplikasi Web Draw.io', 'Contoh Algoritma Percabangan']
      },
      {
        nama: 'Sesi 3: Pengujian, Evaluasi Solusi & Kuis Formatif (Moodle Quiz)',
        jenis: [
          'Kuis Online Formatif (Moodle Quiz)',
          'Assignment Portofolio Laporan Final',
          'Refleksi Pembelajaran Digital'
        ],
        format: 'Pengerjaan Kuis Interaktif Moodle & File PDF Laporan',
        waktu: 'H+7 Setelah Pertemuan 3 (Pukul 23.59 WIB)',
        instruksi: [
          'Kerjakan Kuis Evaluasi Formatif Moodle (10 butir soal pilihan ganda & penalaran logika).',
          'Lakukan uji coba kasus ekstrem (dry-run) terhadap flowchart kelompok dan catat hasil evaluasinya.',
          'Kumpulkan laporan portofolio final gabungan P1-P3 beserta tautan video presentasi kelompok.'
        ],
        support: ['Bank Soal Kuis Moodle', 'Template Laporan Portofolio Akhir', 'Rubrik Penilaian Presentasi']
      }
    ];

    return Array.from({ length: totalSessions }, (_, idx) => {
      const pNum = idx + 1;
      const fb = fallbackActivities[idx % fallbackActivities.length];
      return {
        pertemuanKe: pNum,
        namaSesi: fb.nama.replace(/Sesi \d+/, `Sesi ${pNum}`),
        jenisAktivitas: fb.jenis,
        formatPengumpulan: data.formatPengumpulan || fb.format,
        tenggatWaktu: fb.waktu,
        instruksi: fb.instruksi,
        bahanSupport: fb.support
      };
    });
  };

  const sessions = getSessionList();

  return (
    <div
      id={id || 'document-preview-container'}
      data-doc-container="moodle"
      className="bg-white p-8 md:p-12 text-slate-900 font-sans shadow-sm rounded-lg border border-slate-300 max-w-5xl mx-auto print:shadow-none print:p-0 print:border-none space-y-8 document-preview-container"
      style={{ minHeight: '1000px', backgroundColor: '#ffffff', color: '#0f172a' }}
    >
      {/* Header Kop Moodle */}
      <DocumentHeader
        documentType="moodle"
        schoolName={currentIdentitas?.sekolah || 'SMA XAVERIUS 1 PALEMBANG'}
        logo={currentIdentitas?.logo}
        topic={currentIdentitas?.topik || 'Berpikir Komputasional & Algoritma'}
        title={data.namaAktivitas || 'PANDUAN & STRUKTUR AKTIVITAS E-LEARNING (MOODLE LMS)'}
      />

      {/* Tabel Identitas & Informasi Umum */}
      <div className="overflow-x-auto page-break-inside-avoid">
        <table className="w-full text-xs md:text-sm border-collapse border border-slate-300">
          <tbody>
            <tr className="bg-slate-100">
              <td className="border border-slate-300 p-2.5 font-bold w-1/4 text-slate-900">Sekolah</td>
              <td className="border border-slate-300 p-2.5 w-1/4 font-semibold text-slate-900">
                {currentIdentitas.sekolah || 'SMA Xaverius 1 Palembang'}
              </td>
              <td className="border border-slate-300 p-2.5 font-bold w-1/4 text-slate-900">Mata Pelajaran</td>
              <td className="border border-slate-300 p-2.5 w-1/4 font-semibold text-slate-900">
                {currentIdentitas.mataPelajaran || 'Informatika'}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2.5 font-bold bg-emerald-50 text-emerald-950">Guru Mapel</td>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900 bg-emerald-50/30">
                {guruMapel}
              </td>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900">Kelas / Fase</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-slate-900">
                {currentIdentitas.kelas || 'Fase E (Kelas X)'}
              </td>
            </tr>
            <tr className="bg-slate-100">
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900">Topik Pembelajaran</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-slate-900" colSpan={3}>
                {currentIdentitas.topik || 'Berpikir Komputasional & Algoritma'}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900">Platform LMS</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-slate-900">
                {data.platform || 'Moodle LMS (Integrasi Paket H5P Interaktif)'}
              </td>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900">Jumlah Sesi</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-emerald-900">
                {sessions.length} Sesi Terstruktur (Asinkron & Sinkron)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Ringkasan & Platform LMS (Light Theme) */}
      <div
        className="bg-slate-50 border border-slate-300 rounded-lg p-5 shadow-2xs page-break-inside-avoid"
        style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a' }}
      >
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-3 mb-3"
          style={{ borderColor: '#e2e8f0' }}
        >
          <div>
            <span
              className="text-emerald-800 text-xs uppercase tracking-wider font-bold block"
              style={{ color: '#065f46' }}
            >
              PLATFORM & ARSITEKTUR KURSUS LMS
            </span>
            <h2
              className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900"
              style={{ color: '#0f172a' }}
            >
              {data.platform || 'Moodle LMS — Modul Interaktif Kurikulum Merdeka'}
            </h2>
          </div>
          <div
            className="bg-emerald-700 px-3.5 py-1.5 rounded text-xs font-bold text-white shadow-2xs self-start md:self-auto"
            style={{ backgroundColor: '#047857', color: '#ffffff' }}
          >
            {sessions.length} Sesi Pembelajaran Digital
          </div>
        </div>

        <p
          className="text-slate-700 text-xs md:text-sm leading-relaxed font-normal"
          style={{ color: '#334155' }}
        >
          {data.deskripsiRingkas ||
            'Panduan integrasi e-learning Kurikulum Merdeka untuk memfasilitasi pembelajaran mandiri melalui aktivitas interaktif H5P (Drag & Drop dan Fill-in-the-Blanks), forum diskusi kolaboratif asinkron, portal submission LKPD digital, dan kuis evaluasi formatif.'}
        </p>
      </div>

      {/* Rincian Integrasi H5P Khusus */}
      <div
        className="border border-emerald-300 rounded-lg p-4 bg-emerald-50/70 shadow-2xs page-break-inside-avoid space-y-3"
        style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="bg-emerald-800 text-white text-xs font-bold px-2.5 py-1 rounded shadow-2xs"
              style={{ backgroundColor: '#065f46', color: '#ffffff' }}
            >
              H5P Interactive Suite
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm md:text-base">
              Aktivitas Formatif H5P Terintegrasi di Kursus Moodle
            </h3>
          </div>
          <span className="text-xs text-emerald-900 font-bold bg-white px-2.5 py-1 rounded border border-emerald-300">
            Nilai Otomatis Masuk Gradebook
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-800">
          <div className="bg-white p-3 rounded-md border border-emerald-200 shadow-2xs space-y-1">
            <strong className="text-emerald-950 block text-xs">
              1. H5P Drag and Drop (Flowchart & Dekomposisi)
            </strong>
            <p className="text-slate-600 leading-snug">
              Siswa mencocokkan simbol flowchart ISO dan meletakkan variabel input/kondisi ke dalam zona diagram keputusan belanja diskon e-commerce.
            </p>
          </div>
          <div className="bg-white p-3 rounded-md border border-emerald-200 shadow-2xs space-y-1">
            <strong className="text-emerald-950 block text-xs">
              2. H5P Fill-in-the-Blanks (Pseudocode Rumpang)
            </strong>
            <p className="text-slate-600 leading-snug">
              Siswa mengetikkan kata kunci percabangan (IF, THEN, ELSE IF, RETURN) pada blok rumpang algoritma untuk melatih pemahaman sintaks komputasi.
            </p>
          </div>
        </div>
      </div>

      {/* Panduan Setting Konfigurasi Bank Soal & Quiz Activity Moodle */}
      <div
        className="border border-slate-300 rounded-lg p-4 bg-slate-50 shadow-2xs page-break-inside-avoid space-y-3"
        style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="bg-emerald-800 text-white text-xs font-bold px-2.5 py-1 rounded shadow-2xs"
              style={{ backgroundColor: '#065f46', color: '#ffffff' }}
            >
              ⚙️ Panduan Moodle Quiz
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm md:text-base">
              Konfigurasi Bank Soal & Quiz Activity (Standar 5 Opsi Pilihan A - E)
            </h3>
          </div>
          <span className="text-xs text-emerald-900 font-bold bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300 self-start sm:self-auto">
            Multiple Choice (Choice 1 s.d. Choice 5)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-800">
          <div className="bg-white p-3 rounded-md border border-slate-200 space-y-1.5">
            <strong className="text-emerald-950 block text-xs">
              1. Pengaturan Question Bank (Multiple Choice 5 Opsi):
            </strong>
            <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed">
              <li><strong>Question type:</strong> Multiple choice (Pilihan Ganda).</li>
              <li><strong>One or multiple answers:</strong> <em>One answer only</em> untuk Diagnostik, atau <em>Multiple answers allowed</em> untuk PG Kompleks.</li>
              <li><strong>Number of choices:</strong> Wajib mengisikan 5 opsi (<strong>Choice 1 (A)</strong>, <strong>Choice 2 (B)</strong>, <strong>Choice 3 (C)</strong>, <strong>Choice 4 (D)</strong>, dan <strong>Choice 5 (E)</strong>).</li>
              <li><strong>Shuffle the choices:</strong> Disarankan <em>Yes</em> untuk mengacak urutan opsi antar siswa.</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded-md border border-slate-200 space-y-1.5">
            <strong className="text-emerald-950 block text-xs">
              2. Pengaturan Grade, Grading Method & Feedback:
            </strong>
            <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed">
              <li><strong>Grade to pass:</strong> Disesuaikan dengan batas KKTP (minimal 75%).</li>
              <li><strong>Grade value:</strong> Kunci jawaban benar diberi bobot 100% (atau dibagi proporsional untuk PG Kompleks multi-pilihan). Opsi salah bernilai <em>None</em>.</li>
              <li><strong>Feedback:</strong> Masukkan analisis pembahasan kesiapan pada kolom <em>General feedback</em> untuk asesmen diagnostik.</li>
              <li><strong>Review options:</strong> Siswa dapat melihat skor dan pembahasan setelah batas waktu kuis berakhir.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Daftar Sesi E-Learning Per Pertemuan (Multi-Session Cards) */}
      <div className="space-y-6">
        <div
          className="flex items-center justify-between border-b-2 pb-2"
          style={{ borderColor: '#059669' }}
        >
          <h3
            className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2"
            style={{ color: '#0f172a' }}
          >
            <span
              className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: '#059669', color: '#ffffff' }}
            >
              ✓
            </span>
            Rincian Aktivitas E-Learning Per Sesi
          </h3>
          <span className="text-xs text-slate-500 font-medium italic" style={{ color: '#64748b' }}>
            Total {sessions.length} Sesi Pembelajaran
          </span>
        </div>

        {sessions.map((sesi, index) => {
          const pNum = sesi.pertemuanKe || index + 1;
          const aktivitasList = Array.isArray(sesi.jenisAktivitas)
            ? sesi.jenisAktivitas
            : [sesi.jenisAktivitas || 'Assignment & Diskusi'];
          const instruksiList = Array.isArray(sesi.instruksi)
            ? sesi.instruksi
            : (sesi.instruksi || '').split('\n').filter(Boolean);
          const bahanList = sesi.bahanSupport || data.bahanDanMedia || [];

          const currentMateri =
            sesi.ringkasanMateri ||
            (Array.isArray(data.ringkasanMateri) ? data.ringkasanMateri.find((m) => m.pertemuanKe === pNum) : undefined) ||
            defaultMateriList.find((m) => m.pertemuanKe === pNum) ||
            defaultMateriList[index % defaultMateriList.length];

          return (
            <div
              key={index}
              className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs page-break-inside-avoid"
              style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}
            >
              {/* Header Kartu Sesi */}
              <div
                className="bg-emerald-50 px-4 py-3 border-b border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-2"
                style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="bg-emerald-700 text-white text-xs font-bold px-2.5 py-1 rounded shadow-2xs"
                    style={{ backgroundColor: '#047857', color: '#ffffff' }}
                  >
                    Sesi #{pNum}
                  </span>
                  <h4
                    className="font-bold text-slate-900 text-sm md:text-base"
                    style={{ color: '#0f172a' }}
                  >
                    {sesi.namaSesi || `Pertemuan #${pNum}: Aktivitas Pembelajaran`}
                  </h4>
                </div>
                <div
                  className="text-xs text-emerald-800 font-bold bg-emerald-100/90 px-2.5 py-1 rounded self-start md:self-auto border border-emerald-200"
                  style={{ color: '#065f46', backgroundColor: '#d1fae5', borderColor: '#a7f3d0' }}
                >
                  Pertemuan Ke-{pNum}
                </div>
              </div>

              {/* Grid Metadata E-Learning */}
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs"
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
              >
                <div
                  className="bg-white p-3 rounded border border-slate-200 shadow-2xs"
                  style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
                >
                  <span
                    className="font-bold text-slate-700 block mb-1.5 text-[11px] uppercase tracking-wider"
                    style={{ color: '#334155' }}
                  >
                    Jenis Fitur LMS
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {aktivitasList.map((akt, aIdx) => (
                      <span
                        key={aIdx}
                        className="bg-emerald-100 text-emerald-900 text-[11px] px-2 py-0.5 rounded font-semibold border border-emerald-200"
                        style={{ backgroundColor: '#d1fae5', color: '#064e3b', borderColor: '#a7f3d0' }}
                      >
                        {akt}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className="bg-white p-3 rounded border border-slate-200 shadow-2xs"
                  style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
                >
                  <span
                    className="font-bold text-slate-700 block mb-1.5 text-[11px] uppercase tracking-wider"
                    style={{ color: '#334155' }}
                  >
                    Format Pengumpulan
                  </span>
                  <p className="font-bold text-slate-900" style={{ color: '#0f172a' }}>
                    {sesi.formatPengumpulan || 'File PDF / Kuis H5P Online'}
                  </p>
                </div>

                <div
                  className="bg-white p-3 rounded border border-slate-200 shadow-2xs"
                  style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
                >
                  <span
                    className="font-bold text-slate-700 block mb-1.5 text-[11px] uppercase tracking-wider"
                    style={{ color: '#334155' }}
                  >
                    Tenggat Waktu (Due Date)
                  </span>
                  <p className="font-bold text-red-700" style={{ color: '#b91c1c' }}>
                    {sesi.tenggatWaktu || 'H+3 Setelah Pertemuan (23.59 WIB)'}
                  </p>
                </div>
              </div>

              {/* Konten & Instruksi Sesi */}
              <div className="p-4 space-y-4 text-xs md:text-sm" style={{ color: '#0f172a' }}>
                {/* Bahan Ajar / Ringkasan Materi Sesi (Moodle Book / Page Resource) */}
                {currentMateri && (
                  <div
                    className="bg-slate-50 border border-slate-200 border-l-4 border-l-emerald-600 rounded p-3.5 space-y-2.5 text-xs shadow-2xs"
                    style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderLeftColor: '#059669' }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="bg-emerald-800 text-white text-3xs font-bold px-2 py-0.5 rounded shadow-2xs"
                          style={{ backgroundColor: '#065f46', color: '#ffffff' }}
                        >
                          📖 Bahan Bacaan (Page/Book Modul)
                        </span>
                        <strong className="text-slate-900 font-bold text-xs" style={{ color: '#0f172a' }}>
                          {currentMateri.topikMateri}
                        </strong>
                      </div>
                      {currentMateri.studiKasusKontekstual && (
                        <span
                          className="text-3xs text-emerald-950 font-semibold bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto"
                          style={{ backgroundColor: '#d1fae5', color: '#064e3b', borderColor: '#a7f3d0' }}
                        >
                          💼 {currentMateri.studiKasusKontekstual}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-700 leading-relaxed font-normal" style={{ color: '#334155' }}>
                      {currentMateri.rangkumanTeori}
                    </p>

                    {currentMateri.konsepKunci && currentMateri.konsepKunci.length > 0 && (
                      <div
                        className="bg-white p-2.5 rounded border border-slate-200 space-y-1"
                        style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
                      >
                        <strong
                          className="text-slate-900 block text-3xs uppercase tracking-wider text-emerald-950"
                          style={{ color: '#064e3b' }}
                        >
                          🔑 Poin-Poin Konsep Kunci:
                        </strong>
                        <ul className="space-y-1 text-slate-800 text-3xs" style={{ color: '#1e293b' }}>
                          {currentMateri.konsepKunci.map((kk, kIdx) => (
                            <li key={kIdx} className="flex items-start gap-1">
                              <span className="text-emerald-600 font-bold" style={{ color: '#059669' }}>
                                •
                              </span>
                              <span>{kk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentMateri.contohNotasi && (
                      <div className="space-y-1">
                        <strong
                          className="text-slate-900 block text-3xs uppercase tracking-wider text-slate-600"
                          style={{ color: '#475569' }}
                        >
                          📐 Notasi / Snippet Logika:
                        </strong>
                        <pre
                          className="bg-slate-900 text-emerald-300 p-2.5 rounded text-3xs font-mono overflow-x-auto leading-relaxed border border-slate-800 whitespace-pre-wrap"
                          style={{ backgroundColor: '#0f172a', color: '#6ee7b7', borderColor: '#1e293b' }}
                        >
                          {currentMateri.contohNotasi}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <span
                    className="font-bold text-slate-900 block mb-1.5 text-xs uppercase tracking-wider"
                    style={{ color: '#0f172a' }}
                  >
                    Instruksi Peserta Didik:
                  </span>
                  {instruksiList.length > 0 ? (
                    <ol
                      className="list-decimal list-inside space-y-1.5 text-slate-800 bg-slate-50 p-3.5 rounded border border-slate-200 leading-relaxed font-normal"
                      style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b' }}
                    >
                      {instruksiList.map((inst, iIdx) => (
                        <li key={iIdx}>{inst}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-slate-600 italic" style={{ color: '#475569' }}>
                      Ikuti petunjuk guru pada pengumuman kursus Moodle.
                    </p>
                  )}
                </div>

                {bahanList.length > 0 && (
                  <div>
                    <span
                      className="font-bold text-slate-900 block mb-1.5 text-xs uppercase tracking-wider"
                      style={{ color: '#0f172a' }}
                    >
                      Bahan & Media Pendukung Kursus:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {bahanList.map((bahan, bIdx) => (
                        <span
                          key={bIdx}
                          className="bg-slate-100 text-slate-800 border border-slate-300 text-xs px-2.5 py-1 rounded flex items-center gap-1.5 font-medium"
                          style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                        >
                          <span className="text-emerald-700 font-bold" style={{ color: '#047857' }}>
                            📄
                          </span>{' '}
                          {bahan}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kriteria Keberhasilan & Rubrik Penilaian E-Learning */}
      <div
        className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs page-break-inside-avoid"
        style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}
      >
        <div
          className="bg-emerald-800 text-white px-4 py-2.5 font-bold text-xs md:text-sm uppercase tracking-wide flex items-center justify-between"
          style={{ backgroundColor: '#065f46', color: '#ffffff' }}
        >
          <span>Kriteria Keberhasilan & Evaluasi E-Learning</span>
          <span className="text-emerald-100 text-xs font-normal" style={{ color: '#d1fae5' }}>
            Integrasi Gradebook Moodle
          </span>
        </div>

        <div className="p-4 space-y-3">
          <ul className="divide-y divide-slate-200 text-xs md:text-sm text-slate-800" style={{ color: '#1e293b' }}>
            {(data.kriteriaKeberhasilan || [
              'Menyelesaikan seluruh aktivitas H5P interaktif (Drag & Drop dan Fill-in-the-Blanks) dengan skor minimal 80%.',
              'Aktif dalam forum diskusi kelompok dengan minimal 1 respon pemecahan masalah mandiri dan 1 tanggapan rekan.',
              'Mengumpulkan seluruh tugas berkas LKPD PDF tepat waktu sesuai format dan batasan ukuran berkas.',
              'Mencapai skor kriteria ketercapaian tujuan pembelajaran (KKTP >= 75) pada kuis evaluasi formatif Moodle.'
            ]).map((kriteria, idx) => (
              <li key={idx} className="flex items-start gap-2.5 py-2">
                <span className="text-emerald-700 font-bold" style={{ color: '#047857' }}>
                  ✓
                </span>
                <span className="leading-relaxed">{kriteria}</span>
              </li>
            ))}
          </ul>

          <div
            className="bg-emerald-50/80 p-3 rounded border border-emerald-200 text-xs text-slate-800 mt-2"
            style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', color: '#1e293b' }}
          >
            <strong className="text-emerald-900" style={{ color: '#064e3b' }}>
              Petunjuk Evaluasi Guru:{' '}
            </strong>
            {data.petunjukPenilaian ||
              'Penilaian e-learning dilakukan secara terpadu mencakup skor modul H5P, keaktifan forum LMS, ketepatan waktu pengumpulan artefak LKPD, dan hasil kuis formatif online.'}
          </div>
        </div>
      </div>

      {/* Footer Dokumen Hardcoded */}
      <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-600 font-medium italic page-break-inside-avoid">
        CopyRight©Norbertus Suryadi — SMA Xaverius 1 Palembang | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning
      </div>
    </div>
  );
};
