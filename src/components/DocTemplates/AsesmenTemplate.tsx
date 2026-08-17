import React from 'react';
import { AsesmenDoc, IdentitasRPM, SoalPgDiagnostik, AktivitasH5P, SoalPgKompleks, SoalEssayHots } from '../../types';
import { DocumentHeader } from '../DocumentHeader';
import { renderTextValue } from '../../utils/formatUtils';

interface Props {
  data: AsesmenDoc;
  id: string;
  identitas?: IdentitasRPM;
}

export const AsesmenTemplate: React.FC<Props> = ({ data, id, identitas }) => {
  const currentIdentitas = data.identitas || identitas || {};
  const guruMapel =
    currentIdentitas.guruMapel ||
    currentIdentitas.namaGuru ||
    currentIdentitas.guru ||
    identitas?.guruMapel ||
    identitas?.namaGuru ||
    identitas?.guru ||
    'Norbertus Suryadi, S.Kom.';

  const topik = currentIdentitas.topik || 'Berpikir Komputasional & Algoritma';

  // 1. Fallback 5 Soal PG Diagnostik
  const defaultDiagnostikPG: SoalPgDiagnostik[] = [
    {
      no: 1,
      pertanyaan: `Manakah dari langkah berikut yang merupakan tahapan awal paling tepat dalam metode Berpikir Komputasional saat menghadapi masalah kompleks?`,
      pilihan: {
        A: 'Langsung menulis baris kode program secara tergesa-gesa.',
        B: 'Mendekomposisi (memecah) masalah besar menjadi bagian-bagian sub-masalah yang lebih kecil dan terkelola.',
        C: 'Mengabaikan detail masalah dan menebak solusi akhir secara intuitif.',
        D: 'Menjalankan program komputer tanpa membuat perencanaan diagram alir terlebih dahulu.',
        E: 'Membeli perangkat keras komputer baru dengan spesifikasi paling tinggi.'
      },
      kunciJawaban: 'B',
      penjelasan: 'Dekomposisi adalah pilar fundamental awal untuk menyederhanakan kompleksitas masalah sebelum ekstraksi pola.',
      indikatorPrasyarat: 'Pemahaman Konsep Dasar Dekomposisi Masalah'
    },
    {
      no: 2,
      pertanyaan: `Dalam perancangan bagan alir (flowchart), simbol berbentuk belah ketupat (diamond) digunakan untuk merepresentasikan fungsi...`,
      pilihan: {
        A: 'Titik awal (Start) atau titik akhir (End) dari suatu alur program.',
        B: 'Operasi proses perhitungan matematika atau penugasan variabel nilai.',
        C: 'Pengambilan keputusan/kondisi percabangan (Decision) yang menghasilkan nilai logika Benar/Salah (True/False).',
        D: 'Pemasukan data manual (Input) atau penampilan hasil keluaran (Output).',
        E: 'Pemberian jeda waktu (delay) atau penghentian sementara program.'
      },
      kunciJawaban: 'C',
      penjelasan: 'Simbol belah ketupat merupakan simbol standar ISO untuk percabangan/keputusan logika.',
      indikatorPrasyarat: 'Pengenalan Simbol Standar Diagram Alir Logika'
    },
    {
      no: 3,
      pertanyaan: `Jika sebuah kondisi logika bernilai: (15 > 10) AND (8 == 9), maka hasil evaluasi kebenaran logika akhirnya adalah...`,
      pilihan: {
        A: 'True (Benar)',
        B: 'False (Salah)',
        C: 'Error (Tidak Terdefinisi)',
        D: 'Null (Kosong)',
        E: 'Undetermined (Tidak Dapat Ditentukan)'
      },
      kunciJawaban: 'B',
      penjelasan: 'Operator AND mensyaratkan kedua operand bernilai True. Karena (8 == 9) bernilai False, maka (True AND False) = False.',
      indikatorPrasyarat: 'Kesiapan Operasi Logika Boolean (AND/OR/NOT)'
    },
    {
      no: 4,
      pertanyaan: `Teknik mengabaikan informasi atau atribut yang tidak relevan dan hanya memfokuskan perhatian pada data esensial disebut...`,
      pilihan: {
        A: 'Algoritma Sekuensial',
        B: 'Debugging Program',
        C: 'Abstraksi (Abstraction)',
        D: 'Enkripsi Data',
        E: 'Kompilasi Kode Program'
      },
      kunciJawaban: 'C',
      penjelasan: 'Abstraksi menyaring elemen non-esensial agar model komputasi menjadi fokus dan efisien.',
      indikatorPrasyarat: 'Kemampuan Abstraksi Variabel Kritis'
    },
    {
      no: 5,
      pertanyaan: `Berikut ini yang BUKAN merupakan karakteristik dari sebuah algoritma yang baik dan efektif adalah...`,
      pilihan: {
        A: 'Memiliki instruksi yang jelas, tegas, dan tidak bermakna ganda (Unambiguous).',
        B: 'Pasti berhenti setelah sejumlah langkah terhingga dieksekusi (Finiteness).',
        C: 'Mengulang langkah tanpa batas (infinite loop) tanpa ada kondisi pemberhentian.',
        D: 'Menghasilkan keluaran (output) yang valid dan sesuai dengan spesifikasi masalah.',
        E: 'Mempunyai batasan masukan (input) dan keluaran (output) yang terdefinisi dengan presisi.'
      },
      kunciJawaban: 'C',
      penjelasan: 'Algoritma yang baik wajib memiliki sifat keterhinggaan (finiteness) dan tidak boleh terjebak loop tak hingga tanpa syarat henti.',
      indikatorPrasyarat: 'Prinsip Keterhinggaan & Validitas Algoritma'
    }
  ];

  const soalDiagnostikList: SoalPgDiagnostik[] =
    data.asesmenAwal?.soalPg && data.asesmenAwal.soalPg.length > 0
      ? data.asesmenAwal.soalPg
      : defaultDiagnostikPG;

  // 2. Fallback Aktivitas H5P Interaktif di LMS Moodle
  const defaultH5PList: AktivitasH5P[] = [
    {
      no: 1,
      jenis: 'H5P Drag and Drop',
      judul: 'Aktivitas 1: Rekonstruksi Struktur Simbol Flowchart & Dekomposisi Variabel',
      deskripsi: 'Peserta didik menyusun urutan simbol flowchart dan menempatkan variabel input/kondisi ke dalam drop zone yang tepat pada LMS Moodle.',
      instruksi: 'Tarik (drag) kotak simbol terminal, proses, decision, dan I/O dari panel bank komponen, lalu letakkan pada zona alur diagram kasus perhitungan diskon bertingkat.',
      kontenKasus: 'Kasus Transaksi E-Commerce: Start -> Masukkan TotalBelanja -> Cek (TotalBelanja >= 500.000) -> Hitung Diskon 15% -> Tampilkan TotalBayar -> End.',
      kunciValidasi: 'Skor 100 didapat apabila 6 zona simbol dan 4 variabel terpasang pada urutan logika sekuensial dan percabangan yang valid.'
    },
    {
      no: 2,
      jenis: 'H5P Fill-in-the-Blanks',
      judul: 'Aktivitas 2: Melengkapi Rumpang Pseudocode Percabangan & Logika Komputasi',
      deskripsi: 'Peserta didik mengisi kata kunci logika pemrograman (IF, ELSE IF, THEN, RETURN) yang rumpang pada teks pseudocode interaktif di Moodle.',
      instruksi: 'Ketik kata kunci atau operator pembanding yang tepat pada kotak isian rumpang yang tersedia di LMS.',
      kontenKasus: 'IF (totalBelanja >= 500000) *THEN* diskon = 0.15 *ELSE IF* (isMember == *TRUE*) *THEN* ongkir = 0 *ELSE* diskon = 0 *ENDIF*',
      kunciValidasi: 'Sistem LMS Moodle secara otomatis memeriksa kecocokan string kata kunci dan memberikan umpan balik langsung (instant feedback).'
    }
  ];

  const h5pList: AktivitasH5P[] =
    data.asesmenProses?.aktivitasH5P && data.asesmenProses.aktivitasH5P.length > 0
      ? data.asesmenProses.aktivitasH5P
      : defaultH5PList;

  // 3. Fallback Lembar Observasi Formatif LKPD
  const observasiList = data.asesmenProses?.lembarObservasi && data.asesmenProses.lembarObservasi.length > 0
    ? data.asesmenProses.lembarObservasi
    : [
        { indikator: 'Partisipasi aktif & inisiatif dalam diskusi kolaboratif kelompok kerja', skorMaks: 4 },
        { indikator: 'Kemampuan dekomposisi masalah dan pemilahan variabel kasus kontekstual', skorMaks: 4 },
        { indikator: 'Ketepatan perancangan diagram alir (flowchart) menggunakan simbol standar ISO', skorMaks: 4 },
        { indikator: 'Keterampilan simulasi pengujian (dry-run) kasus normal dan kondisi ekstrem', skorMaks: 4 },
        { indikator: 'Kualitas komunikasi, etika presentasi, dan argumentasi logis atas solusi tim', skorMaks: 4 }
      ];

  // 4. Fallback 5 Soal PG Kompleks (Bobot 40%)
  const defaultPgKompleks: SoalPgKompleks[] = [
    {
      no: 1,
      stimulus: 'Sebuah swalayan menerapkan aturan: Jika total belanja > Rp 200.000 DAN pembeli memiliki Kartu Member, pembeli mendapat diskon 10%. Jika belanja > Rp 500.000 tanpa member, tetap mendapat diskon 5%.',
      pernyataan: 'Tentukan kebenaran dari pernyataan-pernyataan berikut berdasarkan aturan bisnis di atas!',
      pilihan: {
        A: 'Pembeli non-member dengan belanja Rp 250.000 tidak berhak mendapatkan diskon belanja.',
        B: 'Pembeli member dengan belanja Rp 150.000 otomatis mendapatkan diskon 10%.',
        C: 'Pembeli member dengan belanja Rp 600.000 berhak mendapatkan diskon 10%.',
        D: 'Kondisi percabangan dapat disusun menggunakan struktur IF-ELSE IF bersarang.',
        E: 'Pembeli non-member dengan belanja Rp 600.000 mendapatkan diskon 10%.'
      },
      tipe: 'Pilihan Ganda Kompleks (Analisis Logika)',
      kunciJawaban: 'Pernyataan A, C, dan D BENAR; Pernyataan B dan E SALAH.',
      bobot: 8,
      pembahasan: 'B salah karena syarat member diskon 10% adalah belanja harus > Rp 200.000; E salah karena non-member > Rp 500.000 hanya berhak diskon 5%.'
    },
    {
      no: 2,
      stimulus: 'Diberikan pseudocode berikut:\nSET X = 10, Y = 3\nWHILE (X > Y) DO\n  X = X - 2\n  Y = Y + 1\nENDWHILE\nPRINT X, Y',
      pernyataan: 'Nilai akhir variabel X dan Y yang dicetak di layar setelah perulangan selesai adalah...',
      pilihan: {
        A: 'X = 6, Y = 5',
        B: 'X = 4, Y = 6',
        C: 'X = 6, Y = 6',
        D: 'X = 8, Y = 4',
        E: 'X = 2, Y = 7'
      },
      tipe: 'Pilihan Ganda / Dry-Run Trace Table',
      kunciJawaban: 'B (X = 4, Y = 6)',
      bobot: 8,
      pembahasan: 'Iterasi 1: X=8, Y=4. Iterasi 2: X=6, Y=5. Iterasi 3: 6>5 (True) -> X=4, Y=6. Cek kondisi 4>6 (False) -> Stop. Output X=4, Y=6.'
    },
    {
      no: 3,
      stimulus: 'Dalam optimasi algoritma pencarian rute terpendek ambulans pada lalu lintas padat kota:',
      pernyataan: 'Manakah tindakan dekomposisi dan abstraksi yang paling tepat dilakukan?',
      pilihan: {
        A: 'Menghitung warna cat setiap kendaraan yang berpapasan di jalan.',
        B: 'Mengabstraksi jalanan menjadi simpul (node) persimpangan dan panjang jalan berbobot kepadatan arus (edge weight).',
        C: 'Mendekomposisi rute menjadi sub-segmen jalan utama dan alternatif jalan tikus.',
        D: 'Mengabaikan kondisi jalan rusak dan lampu merah demi kecepatan komputasi.',
        E: 'Memasukkan data cuaca tahun lalu ke dalam penghitungan jarak langsung.'
      },
      tipe: 'Pilihan Ganda Kompleks (Multi-Jawaban Benar)',
      kunciJawaban: 'B dan C BENAR.',
      bobot: 8,
      pembahasan: 'B dan C merupakan abstraksi graf serta dekomposisi segmen rute yang valid dan ilmiah.'
    },
    {
      no: 4,
      stimulus: 'Perhatikan relasi kompleksitas efisiensi waktu algoritma terhadap jumlah data (N).',
      pernyataan: 'Pernyataan yang BENAR mengenai perbandingan efisiensi waktu komputasi adalah...',
      pilihan: {
        A: 'Algoritma dengan kompleksitas O(N) selalu lebih lambat daripada O(N²).',
        B: 'Algoritma pencarian Binary Search (O(log N)) jauh lebih efisien untuk data besar terurut dibanding Linear Search (O(N)).',
        C: 'Pemilihan struktur data array versus hash map tidak mempengaruhi waktu pencarian data.',
        D: 'Algoritma yang memiliki waktu eksekusi linear O(N) bertambah secara proporsional seiring bertambahnya data.',
        E: 'Algoritma berbobot O(1) kecepatannya menurun drastis ketika data mencapai 1 juta record.'
      },
      tipe: 'Pilihan Ganda Kompleks',
      kunciJawaban: 'B dan D BENAR.',
      bobot: 8,
      pembahasan: 'Binary Search memiliki kompleksitas logaritmik O(log N) dan Linear O(N) bertambah proporsional terhadap N.'
    },
    {
      no: 5,
      stimulus: 'Seorang kasir ingin membuat program pencegahan stok barang minus saat ada 2 pesanan online serentak.',
      pernyataan: 'Langkah logika pengkondisian yang wajib disisipkan sebelum proses pengurangan stok terjadi adalah...',
      pilihan: {
        A: 'IF (Stok_Tersedia >= Jumlah_Dipesan) THEN Kurangi_Stok() ELSE Tolak_Pesanan().',
        B: 'Langsung kurangi stok kemudian cek apakah bernilai minus.',
        C: 'Menerapkan penguncian data (locking/atomic check) agar kondisi stok divalidasi sebelum dikurangi.',
        D: 'Mengabaikan jumlah pesanan dan selalu menerima seluruh transaksi.',
        E: 'Menghapus data pesanan dari database tanpa notifikasi error.'
      },
      tipe: 'Pilihan Ganda Kompleks (Validasi Logika Sistem)',
      kunciJawaban: 'A dan C BENAR.',
      bobot: 8,
      pembahasan: 'Validasi pra-kondisi (A) dan concurrency atomic lock (C) mencegah terjadinya inkonsistensi data stok.'
    }
  ];

  const pgKompleksList: SoalPgKompleks[] =
    data.asesmenAkhir?.bagian1PgKompleks && data.asesmenAkhir.bagian1PgKompleks.length > 0
      ? data.asesmenAkhir.bagian1PgKompleks
      : defaultPgKompleks;

  // 5. Fallback 2 Soal Essay HOTS (Bobot 60%)
  const defaultEssayHOTS: SoalEssayHots[] = [
    {
      no: 1,
      judul: 'Studi Kasus 1: Perancangan Algoritma & Flowchart Sistem Parkir Cerdas Otomatis',
      stimulusKasus: 'Sebuah gedung mall modern menerapkan tarif parkir bertingkat: 1 jam pertama Rp 5.000, setiap jam berikutnya Rp 3.000. Khusus member VIP, diberikan diskon 20% dari total biaya dan tarif maksimal dibatasi Rp 30.000/hari. Jika tiket hilang, dikenakan denda tambahan Rp 50.000.',
      pertanyaan: '1. Buatlah dekomposisi variabel input, proses logika perhitungan, dan variabel output dari sistem parkir tersebut!\n2. Rancanglah diagram alir (Flowchart) atau pseudocode terstruktur yang menangani seluruh percabangan kondisi (jam normal, member VIP, tarif batas maksimal, dan denda tiket hilang) secara valid!',
      kunciJawaban: 'Variabel: durasiJam (Integer), isVIP (Boolean), isTiketHilang (Boolean), totalBiaya (Real).\nAlur Logika: Hitung tarif dasar berdasarkan durasiJam -> Terapkan diskon 20% jika isVIP True -> Cek batas maksimal Rp 30.000 untuk VIP -> Tambah denda Rp 50.000 jika isTiketHilang True -> Cetak totalBiaya.',
      pedomanPenskoran: 'Dekomposisi variabel tepat (Skor 10) + Logika percabangan durasi (Skor 10) + Penanganan diskon & batas maksimal VIP (Skor 5) + Penanganan denda tiket hilang (Skor 5) = Total Bobot Maksimal 30 Poin.',
      bobot: 30
    },
    {
      no: 2,
      judul: 'Studi Kasus 2: Analisis Kritis Efisiensi Algoritma Penjadwalan & Struktur Data Rumah Sakit',
      stimulusKasus: 'Instalasi Gawat Darurat (IGD) rumah sakit menangani puluhan pasien dengan tingkat kegawatan bervariasi (Kritis/Merah, Mendesak/Kuning, Ringan/Hijau). Sistem sebelumnya menggunakan antrean sederhana (Queue First-In-First-Out/FIFO) sehingga pasien kritis yang datang belakangan justru tertunda penanganannya.',
      pertanyaan: '1. Analisislah mengapa struktur data antrean FIFO tidak tepat digunakan pada kasus kegawatdaruratan IGD tersebut dan apa dampak fatalnya!\n2. Rekomendasikan struktur data atau algoritma antrean yang paling optimal (misal: Priority Queue berbasis Heap atau Multi-level Feedback) dan jelaskan bagaimana algoritma tersebut memproses urutan prioritas pasien secara efisien!',
      kunciJawaban: 'FIFO hanya memperhatikan waktu kedatangan tanpa menimbang bobot kegawatan medis, sehingga melanggar prinsip triase IGD. Solusi optimal: Priority Queue (Antrean Berprioritas) di mana setiap pasien memiliki kunci prioritas (Tingkat Kegawatan 1-3). Pasien dengan kegawatan darurat tertinggi (Level 1) akan selalu diproses terlebih dahulu tanpa mempedulikan urutan kedatangan.',
      pedomanPenskoran: 'Analisis kelemahan & risiko fatal FIFO (Skor 10) + Rekomendasi Priority Queue dan argumentasi teknis (Skor 12) + Penjelasan mekanisme penanganan kasus prioritas sama (FIFO pada level sama) (Skor 8) = Total Bobot Maksimal 30 Poin.',
      bobot: 30
    }
  ];

  const essayHotsList: SoalEssayHots[] =
    data.asesmenAkhir?.bagian2EssayHots && data.asesmenAkhir.bagian2EssayHots.length > 0
      ? data.asesmenAkhir.bagian2EssayHots
      : defaultEssayHOTS;

  return (
    <div
      id={id || 'document-preview-container'}
      data-doc-container="asesmen"
      className="bg-white p-8 md:p-12 text-slate-900 font-sans shadow-sm rounded-lg border border-slate-300 max-w-5xl mx-auto print:shadow-none print:p-0 print:border-none space-y-8 document-preview-container"
      style={{ minHeight: '1000px', backgroundColor: '#ffffff', color: '#0f172a' }}
    >
      {/* Header Asesmen Standardized */}
      <DocumentHeader
        documentType="asesmen"
        schoolName={currentIdentitas?.sekolah || 'SMA XAVERIUS 1 PALEMBANG'}
        logo={currentIdentitas?.logo}
        topic={topik}
        title={data.judul || 'INSTRUMEN ASESMEN & EVALUASI PEMBELAJARAN LENGKAP'}
      />

      {/* Tabel Identitas & Informasi Umum (Light Theme Kontras Tinggi) */}
      <div className="overflow-x-auto page-break-inside-avoid">
        <table className="w-full text-xs md:text-sm border-collapse border border-slate-300">
          <tbody>
            <tr className="bg-slate-100">
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900 w-1/4">Sekolah</td>
              <td className="border border-slate-300 p-2.5 w-1/4 font-semibold text-slate-900">
                {currentIdentitas.sekolah || 'SMA Xaverius 1 Palembang'}
              </td>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900 w-1/4">Mata Pelajaran</td>
              <td className="border border-slate-300 p-2.5 w-1/4 font-semibold text-slate-900">
                {currentIdentitas.mataPelajaran || 'Informatika'}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2.5 font-bold bg-emerald-50 text-emerald-950">Guru Mapel</td>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900 bg-emerald-50/40">
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
                {topik}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900">Alokasi Waktu</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-slate-900">
                {currentIdentitas.alokasiWaktu || '3 Pertemuan (6 JP @ 45 Menit)'}
              </td>
              <td className="border border-slate-300 p-2.5 font-bold text-slate-900">Variasi Instrumen</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-emerald-900">
                PG Diagnostik, Formatif H5P Moodle, PG Kompleks & Essay HOTS
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Banner Ringkasan Instrumen */}
      <div
        className="bg-slate-50 border border-slate-300 rounded-lg p-4 shadow-2xs page-break-inside-avoid"
        style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-2xs"
              style={{ backgroundColor: '#047857', color: '#ffffff' }}
            >
              STANDAR ASESMEN KURIKULUM MERDEKA
            </span>
            <h3 className="text-sm md:text-base font-extrabold text-slate-900">
              Struktur Penilaian Diagnostik, Formatif, & Sumatif Terpadu
            </h3>
          </div>
          <span className="text-xs text-slate-600 font-semibold">
            Integrasi E-Learning Moodle & Unjuk Kerja
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          Instrumen asesmen ini dirancang secara komprehensif untuk mengevaluasi kesiapan awal (diagnostik PG), proses interaktif & kolaboratif (Formatif H5P & Observasi LKPD), serta capaian kompetensi tingkat tinggi (Sumatif 5 PG Kompleks & 2 Kasus Essay HOTS).
        </p>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN A: ASESMEN AWAL (DIAGNOSTIK PILIHAN GANDA)                          */}
      {/* ========================================================================= */}
      <section className="space-y-4 page-break-inside-avoid">
        <div
          className="bg-emerald-800 text-white px-4 py-2.5 rounded-t-lg font-bold text-xs md:text-sm uppercase tracking-wide flex items-center justify-between"
          style={{ backgroundColor: '#065f46', color: '#ffffff' }}
        >
          <div className="flex items-center gap-2">
            <span className="bg-white text-emerald-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-black">
              A
            </span>
            <span>ASESMEN AWAL (DIAGNOSTIK KOGNITIF & PRASYARAT BELAJAR)</span>
          </div>
          <span className="text-emerald-100 text-xs font-normal">
            5 Soal Pilihan Ganda (A-E) + Kunci & Pembahasan
          </span>
        </div>

        <div className="border border-slate-300 rounded-b-lg p-4 bg-white shadow-2xs space-y-4">
          <div className="bg-emerald-50/80 border border-emerald-200 rounded p-3 text-xs text-slate-800">
            <p className="font-bold text-emerald-950 mb-1">
              Petunjuk Asesmen Diagnostik Awal:
            </p>
            <p className="leading-relaxed">
              Asesmen ini diberikan pada awal sesi pembelajaran (melalui kuis singkat Moodle / lembar cetak) untuk memetakan kesiapan penalaran logika dasar dan pemahaman prasyarat berpikir komputasional peserta didik sebelum memasuki materi inti.
            </p>
          </div>

          <div className="space-y-4">
            {soalDiagnostikList.map((item, idx) => {
              const pilihanObj = item.pilihan || {};
              const opsiA = typeof pilihanObj === 'object' && !Array.isArray(pilihanObj) ? (pilihanObj as any).A : (Array.isArray(pilihanObj) ? pilihanObj[0] : '');
              const opsiB = typeof pilihanObj === 'object' && !Array.isArray(pilihanObj) ? (pilihanObj as any).B : (Array.isArray(pilihanObj) ? pilihanObj[1] : '');
              const opsiC = typeof pilihanObj === 'object' && !Array.isArray(pilihanObj) ? (pilihanObj as any).C : (Array.isArray(pilihanObj) ? pilihanObj[2] : '');
              const opsiD = typeof pilihanObj === 'object' && !Array.isArray(pilihanObj) ? (pilihanObj as any).D : (Array.isArray(pilihanObj) ? pilihanObj[3] : '');
              const opsiE = typeof pilihanObj === 'object' && !Array.isArray(pilihanObj) ? (pilihanObj as any).E : (Array.isArray(pilihanObj) ? pilihanObj[4] : '');

              return (
                <div
                  key={idx}
                  className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50/40 page-break-inside-avoid"
                  style={{ borderColor: '#cbd5e1' }}
                >
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="bg-emerald-700 text-white text-xs font-bold px-2.5 py-0.5 rounded shadow-2xs"
                        style={{ backgroundColor: '#047857', color: '#ffffff' }}
                      >
                        Soal Diagnostik #{item.no || idx + 1}
                      </span>
                      {item.indikatorPrasyarat && (
                        <span className="text-[11px] font-semibold text-slate-700 hidden sm:inline-block">
                          Indikator: {item.indikatorPrasyarat}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      Kunci: {item.kunciJawaban}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white space-y-2.5 text-xs md:text-sm">
                    <p className="font-bold text-slate-900 leading-snug">
                      {item.no || idx + 1}. {item.pertanyaan}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-800 pt-1">
                      <div className={`p-2 rounded border ${item.kunciJawaban === 'A' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-950' : 'bg-slate-50 border-slate-200'}`}>
                        <strong>A.</strong> {opsiA || 'Pilihan A'}
                      </div>
                      <div className={`p-2 rounded border ${item.kunciJawaban === 'B' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-950' : 'bg-slate-50 border-slate-200'}`}>
                        <strong>B.</strong> {opsiB || 'Pilihan B'}
                      </div>
                      <div className={`p-2 rounded border ${item.kunciJawaban === 'C' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-950' : 'bg-slate-50 border-slate-200'}`}>
                        <strong>C.</strong> {opsiC || 'Pilihan C'}
                      </div>
                      <div className={`p-2 rounded border ${item.kunciJawaban === 'D' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-950' : 'bg-slate-50 border-slate-200'}`}>
                        <strong>D.</strong> {opsiD || 'Pilihan D'}
                      </div>
                      {opsiE && (
                        <div className={`p-2 rounded border md:col-span-2 ${item.kunciJawaban === 'E' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-950' : 'bg-slate-50 border-slate-200'}`}>
                          <strong>E.</strong> {opsiE}
                        </div>
                      )}
                    </div>

                    {item.penjelasan && (
                      <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] text-slate-700 leading-snug">
                        <strong className="text-slate-900">Analisis Kesiapan / Pembahasan:</strong> {item.penjelasan}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BAGIAN B: ASESMEN PROSES / FORMATIF (INTEGRASI H5P MOODLE & OBSERVASI)     */}
      {/* ========================================================================= */}
      <section className="space-y-6 page-break-inside-avoid">
        <div
          className="bg-emerald-800 text-white px-4 py-2.5 rounded-t-lg font-bold text-xs md:text-sm uppercase tracking-wide flex items-center justify-between"
          style={{ backgroundColor: '#065f46', color: '#ffffff' }}
        >
          <div className="flex items-center gap-2">
            <span className="bg-white text-emerald-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-black">
              B
            </span>
            <span>ASESMEN FORMATIF PROSES: INTEGRASI H5P MOODLE & LEMBAR OBSERVASI</span>
          </div>
          <span className="text-emerald-100 text-xs font-normal">
            Aktivitas Interaktif & Unjuk Kerja
          </span>
        </div>

        {/* 1. Sub-Bagian: Aktivitas Interaktif H5P di LMS Moodle */}
        <div className="border border-slate-300 rounded-lg p-4 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="bg-emerald-700 text-white px-2 py-0.5 rounded text-xs font-bold">
                Fitur LMS
              </span>
              Rancangan Aktivitas H5P Interaktif di Platform Moodle
            </h4>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Formatif Mandiri Asinkron
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {h5pList.map((h5p, hIdx) => (
              <div
                key={hIdx}
                className="border border-slate-300 rounded-lg p-3.5 bg-slate-50/60 shadow-2xs flex flex-col justify-between space-y-2.5"
                style={{ borderColor: '#cbd5e1' }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className="bg-emerald-800 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-2xs"
                      style={{ backgroundColor: '#065f46', color: '#ffffff' }}
                    >
                      {h5p.jenis}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      Modul H5P #{h5p.no || hIdx + 1}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs md:text-sm leading-snug">
                    {h5p.judul}
                  </h5>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {h5p.deskripsi}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs bg-white p-2.5 rounded border border-slate-200">
                  <div className="text-slate-800">
                    <strong className="text-slate-900">Instruksi Siswa:</strong> {h5p.instruksi}
                  </div>
                  <div className="text-slate-800 font-mono text-[11px] bg-slate-100 p-1.5 rounded border border-slate-200">
                    <strong>Kasus/Konten:</strong> {h5p.kontenKasus}
                  </div>
                  <div className="text-emerald-900 text-[11px] bg-emerald-50 p-1.5 rounded border border-emerald-200">
                    <strong>Validasi Kunci:</strong> {h5p.kunciValidasi}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Sub-Bagian: Lembar Observasi Unjuk Kerja Kolaboratif LKPD */}
        <div className="border border-slate-300 rounded-lg p-4 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="bg-emerald-700 text-white px-2 py-0.5 rounded text-xs font-bold">
                Observasi Guru
              </span>
              Lembar Observasi Unjuk Kerja Kolaboratif Kelompok (Skor 1 – 4)
            </h4>
            <span className="text-xs text-slate-500 font-medium italic">
              Formatif Selama Diskusi Tatap Muka
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded shadow-2xs">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2.5 text-center w-12 border-r border-slate-300">No</th>
                  <th className="p-2.5 text-left border-r border-slate-300">Indikator Kinerja & Perilaku Kolaboratif</th>
                  <th className="p-2.5 text-center w-28 bg-emerald-50 text-emerald-900 font-bold">
                    Skor Maks (1-4)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {observasiList.map((obs, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2.5 text-center font-bold text-slate-900 border-r border-slate-300">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 text-slate-800 border-r border-slate-300">
                      {renderTextValue(obs.indikator)}
                    </td>
                    <td className="p-2.5 text-center font-extrabold text-emerald-800 bg-emerald-50/30">
                      {obs.skorMaks || 4}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 italic text-right">
            * Kriteria Skor: 4 = Sangat Baik, 3 = Baik, 2 = Cukup, 1 = Perlu Bimbingan Khusus
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BAGIAN C: ASESMEN AKHIR / SUMATIF (KOMBINASI PG KOMPLEKS & ESSAY HOTS)    */}
      {/* ========================================================================= */}
      <section className="space-y-6 page-break-inside-avoid">
        <div
          className="bg-emerald-800 text-white px-4 py-2.5 rounded-t-lg font-bold text-xs md:text-sm uppercase tracking-wide flex items-center justify-between"
          style={{ backgroundColor: '#065f46', color: '#ffffff' }}
        >
          <div className="flex items-center gap-2">
            <span className="bg-white text-emerald-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-black">
              C
            </span>
            <span>ASESMEN SUMATIF KOMPREHENSIF (PG KOMPLEKS & ESSAY ANALITIS HOTS)</span>
          </div>
          <span className="text-emerald-100 text-xs font-normal">
            Total Bobot: 100 Poin
          </span>
        </div>

        {/* 1. Sub-Bagian Sumatif: 5 Soal PG Kompleks / Benar-Salah (Bobot 40%) */}
        <div className="border border-slate-300 rounded-lg p-4 bg-white shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <span
                className="bg-emerald-700 text-white text-xs font-bold px-2.5 py-0.5 rounded shadow-2xs"
                style={{ backgroundColor: '#047857', color: '#ffffff' }}
              >
                Bagian 1: PG Kompleks
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                5 Butir Soal Penalaran & Pernyataan Analitis
              </h4>
            </div>
            <span className="bg-emerald-100 text-emerald-900 font-extrabold px-3 py-1 rounded text-xs border border-emerald-300">
              Total Bobot: 40% (8 Poin / Soal)
            </span>
          </div>

          <div className="space-y-4">
            {pgKompleksList.map((item, idx) => {
              const pilihanObj = item.pilihan || {};
              const opsiA = typeof pilihanObj === 'object' && !Array.isArray(pilihanObj) ? (pilihanObj as any).A : (Array.isArray(pilihanObj) ? pilihanObj[0] : '');
              const opsiB = typeof pilihanObj === 'object' && !Array.isArray(pilihanObj) ? (pilihanObj as any).B : (Array.isArray(pilihanObj) ? pilihanObj[1] : '');
              const opsiC = typeof pilihanObj === 'object' && !Array.isArray(pilihanObj) ? (pilihanObj as any).C : (Array.isArray(pilihanObj) ? pilihanObj[2] : '');
              const opsiD = typeof pilihanObj === 'object' && !Array.isArray(pilihanObj) ? (pilihanObj as any).D : (Array.isArray(pilihanObj) ? pilihanObj[3] : '');
              const opsiE = typeof pilihanObj === 'object' && !Array.isArray(pilihanObj) ? (pilihanObj as any).E : (Array.isArray(pilihanObj) ? pilihanObj[4] : '');

              return (
                <div
                  key={idx}
                  className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs page-break-inside-avoid"
                  style={{ borderColor: '#cbd5e1' }}
                >
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded shadow-2xs"
                        style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                      >
                        Soal #{item.no || idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {item.tipe || 'Pilihan Ganda Kompleks'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                      Bobot: {item.bobot || 8} Poin
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2 text-xs md:text-sm">
                    {item.stimulus && (
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs text-slate-700 italic font-normal leading-relaxed">
                        <strong className="text-slate-900 not-italic">Stimulus Kasus: </strong>
                        {item.stimulus}
                      </div>
                    )}

                    <p className="font-bold text-slate-900 leading-snug">
                      {item.pernyataan}
                    </p>

                    {(opsiA || opsiB || opsiC || opsiD || opsiE) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-800 pt-1">
                        {opsiA && <div className="p-2 bg-slate-50 rounded border border-slate-200"><strong>[ A ]</strong> {opsiA}</div>}
                        {opsiB && <div className="p-2 bg-slate-50 rounded border border-slate-200"><strong>[ B ]</strong> {opsiB}</div>}
                        {opsiC && <div className="p-2 bg-slate-50 rounded border border-slate-200"><strong>[ C ]</strong> {opsiC}</div>}
                        {opsiD && <div className="p-2 bg-slate-50 rounded border border-slate-200"><strong>[ D ]</strong> {opsiD}</div>}
                        {opsiE && <div className="p-2 bg-slate-50 rounded border border-slate-200 md:col-span-2"><strong>[ E ]</strong> {opsiE}</div>}
                      </div>
                    )}

                    <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200 text-xs space-y-1 text-emerald-950">
                      <div>
                        <strong className="text-emerald-900">Kunci Jawaban & Kriteria Kebenaran:</strong> {item.kunciJawaban}
                      </div>
                      {item.pembahasan && (
                        <div className="text-[11px] text-slate-700">
                          <strong>Pembahasan Logika:</strong> {item.pembahasan}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Sub-Bagian Sumatif: 2 Soal Essay Analitis / HOTS (Bobot 60%) */}
        <div className="border border-slate-300 rounded-lg p-4 bg-white shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <span
                className="bg-emerald-700 text-white text-xs font-bold px-2.5 py-0.5 rounded shadow-2xs"
                style={{ backgroundColor: '#047857', color: '#ffffff' }}
              >
                Bagian 2: Essay HOTS
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                2 Soal Kasus Pemecahan Masalah Komputasional Kompleks
              </h4>
            </div>
            <span className="bg-emerald-100 text-emerald-900 font-extrabold px-3 py-1 rounded text-xs border border-emerald-300">
              Total Bobot: 60% (30 Poin / Soal)
            </span>
          </div>

          <div className="space-y-4">
            {essayHotsList.map((essay, eIdx) => (
              <div
                key={eIdx}
                className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs page-break-inside-avoid"
                style={{ borderColor: '#cbd5e1' }}
              >
                <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded shadow-2xs"
                      style={{ backgroundColor: '#047857', color: '#ffffff' }}
                    >
                      Soal Essay #{essay.no || eIdx + 1}
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs md:text-sm">
                      {essay.judul}
                    </h5>
                  </div>
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded border border-emerald-300 shrink-0">
                    Bobot: {essay.bobot || 30} Poin
                  </span>
                </div>

                <div className="p-4 space-y-3 text-xs md:text-sm text-slate-800">
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed font-normal">
                    <strong className="text-slate-900 block mb-1">Kasus Nyata (Problem Statement):</strong>
                    {essay.stimulusKasus}
                  </div>

                  <div>
                    <strong className="text-slate-900 block mb-1 text-xs uppercase tracking-wider">
                      Pertanyaan Analitis:
                    </strong>
                    <p className="font-medium text-slate-900 whitespace-pre-line bg-slate-50/50 p-2.5 rounded border border-slate-200">
                      {essay.pertanyaan}
                    </p>
                  </div>

                  <div className="bg-emerald-50/80 p-3 rounded border border-emerald-200 text-xs space-y-2 text-slate-800">
                    <div>
                      <strong className="text-emerald-950 block mb-0.5">Kunci Jawaban Komprehensif:</strong>
                      <p className="whitespace-pre-line text-slate-800 leading-relaxed">
                        {essay.kunciJawaban}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-emerald-200 text-slate-700">
                      <strong className="text-emerald-950">Pedoman Penskoran:</strong> {essay.pedomanPenskoran}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BAGIAN D: FORMULA KALKULASI NILAI AKHIR (NA) & INTERVAL KKTP               */}
      {/* ========================================================================= */}
      <section className="space-y-4 page-break-inside-avoid">
        <div
          className="bg-emerald-800 text-white px-4 py-2.5 rounded-t-lg font-bold text-xs md:text-sm uppercase tracking-wide flex items-center justify-between"
          style={{ backgroundColor: '#065f46', color: '#ffffff' }}
        >
          <div className="flex items-center gap-2">
            <span className="bg-white text-emerald-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-black">
              D
            </span>
            <span>FORMULA KALKULASI NILAI AKHIR (NA) & REKAP KKTP</span>
          </div>
          <span className="text-emerald-100 text-xs font-normal">
            Skala 0 – 100
          </span>
        </div>

        <div className="border border-slate-300 rounded-b-lg p-4 bg-white shadow-2xs space-y-4">
          {/* Formula Card */}
          <div className="p-3.5 bg-emerald-50/70 rounded-lg border border-emerald-300 text-center space-y-2">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
              Rumus Perhitungan Nilai Akhir Rapor Modul
            </span>
            <div className="bg-white p-3 rounded border border-emerald-300 font-mono font-bold text-xs md:text-sm text-emerald-950 shadow-2xs">
              Nilai Akhir (NA) = (Nilai Formatif [H5P & LKPD] × 30%) + (Skor PG Kompleks [40%] + Skor Essay HOTS [60%] × 70%)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-left text-xs pt-1">
              <div className="bg-white p-2 rounded border border-emerald-200">
                <strong className="text-slate-900 block text-[11px]">1. Formatif (30%)</strong>
                <span className="text-slate-600 text-[11px]">Rata-rata pengerjaan modul H5P di Moodle & Observasi Unjuk Kerja LKPD kelompok.</span>
              </div>
              <div className="bg-white p-2 rounded border border-emerald-200">
                <strong className="text-slate-900 block text-[11px]">2. Sumatif PG (28% dari NA)</strong>
                <span className="text-slate-600 text-[11px]">5 Soal Pilihan Ganda Kompleks mengukur penalaran analitis dasar.</span>
              </div>
              <div className="bg-white p-2 rounded border border-emerald-200">
                <strong className="text-slate-900 block text-[11px]">3. Sumatif Essay (42% dari NA)</strong>
                <span className="text-slate-600 text-[11px]">2 Soal Kasus HOTS mengukur konstruksi algoritma & analisis kritis efisiensi.</span>
              </div>
            </div>
          </div>

          {/* Tabel Interval KKTP */}
          <div className="overflow-x-auto border border-slate-300 rounded shadow-2xs">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2.5 text-center w-1/5 border-r border-slate-300">Rentang Skor (NA)</th>
                  <th className="p-2.5 text-center w-1/4 border-r border-slate-300">Predikat Ketercapaian</th>
                  <th className="p-2.5 text-left">Tindak Lanjut Pembelajaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-white">
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900 border-r border-slate-300">86 – 100</td>
                  <td className="p-2.5 text-center border-r border-slate-300">
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded">
                      Sangat Baik (A)
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-800">Tuntas Mandiri: Pengayaan studi kasus algoritma tingkat lanjut.</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900 border-r border-slate-300">75 – 85</td>
                  <td className="p-2.5 text-center border-r border-slate-300">
                    <span className="bg-blue-100 text-blue-900 border border-blue-300 font-bold px-2 py-0.5 rounded">
                      Baik (B)
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-800">Tuntas Standar: Mencapai seluruh KKTP dengan baik.</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900 border-r border-slate-300">60 – 74</td>
                  <td className="p-2.5 text-center border-r border-slate-300">
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded">
                      Cukup (C)
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-800">Belum Tuntas: Perbaikan terbimbing pada bagian logika percabangan tertentu.</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900 border-r border-slate-300">&lt; 60</td>
                  <td className="p-2.5 text-center border-r border-slate-300">
                    <span className="bg-red-100 text-red-900 border border-red-300 font-bold px-2 py-0.5 rounded">
                      Perlu Bimbingan (D)
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-800">Belum Tuntas: Mengikuti program remedial intensif dan pendampingan tutor sebaya.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer Dokumen Hardcoded */}
      <div className="pt-6 mt-6 border-t border-slate-200 text-center text-xs text-slate-600 font-medium italic page-break-inside-avoid">
        CopyRight©Norbertus Suryadi — SMA Xaverius 1 Palembang | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning
      </div>
    </div>
  );
};
