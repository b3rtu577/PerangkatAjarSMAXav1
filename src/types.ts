export interface IdentitasRPM {
  sekolah: string;
  guru: string;
  namaGuru?: string;
  guruMapel?: string;
  nipGuru: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  mataPelajaran: string;
  kelas: string;
  topik: string;
  jumlahPertemuan?: string;
  alokasiWaktu: string;
  cp: string;
  modelPembelajaran: string;
  jenisTugas?: 'kelompok' | 'individu' | 'netral' | string;
  modeTugas?: string;
  elemenKsp?: string;
  logo?: string;
}

export interface KegiatanLangkahItem {
  tahap: string;
  alokasiWaktu: string;
  aktivitasGuru: string;
  aktivitasSiswa: string;
  prinsipPembelajaran: string;
  elemenDeepLearning?: string;
}

export interface MateriPoin {
  abjad?: string;
  judul: string;
  deskripsi: string;
}

export interface PertemuanItem {
  pertemuanKe: number;
  subTopik?: string;
  topik?: string;
  indikatorATP?: string[] | string;
  bahanAjar?: {
    konsepUtama: string;
    studiKasus: string;
    rangkumanTeori?: string;
    contohNotasi?: string;
  } | MateriPoin[] | string[] | any;
  kegiatanPembelajaran?: {
    kegiatanAwal: string[] | string;
    kegiatanInti: string[] | string;
    kegiatanPenutup: string[] | string;
  };
  lkpdFocus?: string;
  alokasiWaktu?: string;
  praktikPedagogis?: string;
  materiPembelajaran?: MateriPoin[] | string[];
  langkah?: KegiatanLangkahItem[];
}

export interface KegiatanPembelajaranItem {
  tahap: string;
  aktivitasGuru: string;
  aktivitasSiswa: string;
  elemenDeepLearning: string;
}

export interface AtpItem {
  kodeTp: string; // misal: "TP 10.1", "TP 10.2", "TP 10.3"
  tujuanPembelajaran: string;
  indikatorKetercapaian: string[] | string; // IKTP
  alokasiWaktuJp: string; // misal: "2 JP (80 Menit)"
  pertemuanKe: number;
  fokusMateri?: string; // misal: "Dekomposisi & Abstraksi Masalah"
  korelasiDokumen?: {
    lkpd?: string; // misal: "Dasar Aktivitas LKPD 1"
    moodle?: string; // misal: "Dasar Forum & Kuis Sesi 1"
    asesmen?: string; // misal: "Asesmen Diagnostik & Formatif P1"
  };
}

export interface RingkasanMateriItem {
  pertemuanKe: number;
  topikMateri: string;
  konsepKunci: string[];
  rangkumanTeori: string;
  contohNotasi?: string; // pseudocode / diagram / tabel notasi
  studiKasusKontekstual?: string;
  tipsRefleksi?: string;
}

export interface RpmDoc {
  docType: 'rpm';
  identitas: IdentitasRPM;
  capaianPembelajaran: string;
  targetDimensi?: string;
  alurTujuanPembelajaran?: AtpItem[];
  ringkasanMateri?: RingkasanMateriItem[];
  tujuanPembelajaran: string[];
  pemahamanBermakna: string;
  pertanyaanPemantik: string[];
  kemitraanBelajar?: string;
  lingkunganBelajar?: string;
  refleksiSiswa?: string[] | string;
  pertemuanList?: PertemuanItem[];
  kegiatanPembelajaran: KegiatanPembelajaranItem[];
  asesmenRencana: {
    awal: string;
    proses: string;
    akhir: string;
  };
  pengayaanRemedial: {
    pengayaan: string;
    remedial: string;
  };
}

export interface LkpdTabelBaris {
  no?: number | string;
  komponen: string;
  instruksiAnalisis: string;
  ruangJawaban?: string;
}

export interface LkpdAktivitas {
  no: number;
  tugas: string;
  instruksi: string;
  ruangJawaban?: string;
  kegiatanType?: 'memahami' | 'menerapkan' | 'refleksi';
  pertanyaanHots?: string[];
  tabelIsian?: LkpdTabelBaris[];
}

export interface PertemuanLkpdItem {
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
  aktivitasSiswa?: LkpdAktivitas[];
  pertanyaanDiskusi?: string[];
  refleksiSiswa?: string;
  kesimpulan?: string;
  rubrikSkor?: {
    kriteria: string;
    skorMaks: number;
    skorPerolehan?: string;
  }[];
}

export interface LkpdDoc {
  docType: 'lkpd';
  judul: string;
  subJudul?: string;
  jumlahPertemuan?: number;
  identitas: {
    mataPelajaran?: string;
    kelas?: string;
    topik?: string;
    waktu?: string;
    sekolah?: string;
    logo?: string;
    guru?: string;
    namaGuru?: string;
    guruMapel?: string;
    nipGuru?: string;
    kepalaSekolah?: string;
    nipKepalaSekolah?: string;
    [key: string]: any;
  };
  pertemuanList?: PertemuanLkpdItem[];
  tujuanAktivitas?: string[];
  petunjukPengerjaan?: string[];
  stimulusMaterial?: string;
  aktivitasSiswa?: LkpdAktivitas[];
  pertanyaanDiskusi?: string[];
  refleksiSiswa?: string;
  kesimpulan?: string;
  [key: string]: any;
}

export interface SesiElearningItem {
  pertemuanKe: number;
  namaSesi: string;
  jenisAktivitas?: string | string[];
  formatPengumpulan?: string;
  tenggatWaktu?: string;
  instruksi?: string | string[];
  bahanSupport?: string[];
  ringkasanMateri?: RingkasanMateriItem;
  [key: string]: any;
}

export interface MoodleDoc {
  docType: 'moodle';
  identitas?: IdentitasRPM;
  namaAktivitas?: string;
  platform?: string;
  jenisAktivitas?: string | string[];
  deskripsiRingkas?: string;
  instruksiPesertaDidik?: string | string[];
  bahanDanMedia?: string[];
  formatPengumpulan?: string;
  tenggatWaktu?: string;
  kriteriaKeberhasilan?: string[];
  petunjukPenilaian?: string;
  jumlahPertemuan?: number;
  sesiElearning?: SesiElearningItem[];
  ringkasanMateri?: RingkasanMateriItem[];
  footer?: string;
  [key: string]: any;
}

export interface ObservasiItem {
  indikator: string;
  skorMaks: number;
}

export interface SoalItem {
  no: number;
  soal: string;
  kunciJawaban: string;
  bobot: number;
}

export interface SoalPgDiagnostik {
  no: number;
  pertanyaan: string;
  pilihan: {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string;
  } | string[];
  kunciJawaban: string;
  penjelasan?: string;
  indikatorPrasyarat?: string;
}

export interface AktivitasH5P {
  no: number;
  jenis: 'H5P Drag and Drop' | 'H5P Fill-in-the-Blanks' | string;
  judul: string;
  deskripsi: string;
  instruksi: string;
  kontenKasus: string;
  kunciValidasi: string;
}

export interface SoalPgKompleks {
  no: number;
  stimulus?: string;
  pernyataan: string;
  pilihan?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
    E?: string;
  } | string[];
  tipe?: string;
  kunciJawaban: string;
  bobot: number;
  pembahasan?: string;
}

export interface SoalEssayHots {
  no: number;
  judul: string;
  stimulusKasus: string;
  pertanyaan: string;
  kunciJawaban: string;
  pedomanPenskoran: string;
  bobot: number;
}

export interface AsesmenDoc {
  docType: 'asesmen';
  identitas?: IdentitasRPM;
  judul: string;
  asesmenAwal: {
    teknik: string;
    soal?: string[];
    soalPg?: SoalPgDiagnostik[];
  };
  asesmenProses: {
    teknik: string;
    aktivitasH5P?: AktivitasH5P[];
    lembarObservasi: ObservasiItem[];
  };
  asesmenAkhir: {
    teknik: string;
    bagian1PgKompleks?: SoalPgKompleks[];
    bagian2EssayHots?: SoalEssayHots[];
    soalList?: SoalItem[];
  };
  bobotNilai: string;
  rekapNilaiFormat: string;
  formulaNilaiAkhir?: {
    rumus: string;
    rincianKomponen: {
      nama: string;
      bobotPersen: number;
      deskripsi: string;
    }[];
  };
  footer?: string;
  [key: string]: any;
}

export interface BarisRubrik {
  pertemuanKe?: number;
  kriteria: string;
  indikator?: string;
  skor4: string;
  skor3: string;
  skor2: string;
  skor1: string;
}

export interface RubrikSumatifAspek {
  aspek: string;
  skorMaks: number;
  deskripsi: string;
  kriteriaSkor: {
    skor4: string;
    skor3: string;
    skor2: string;
    skor1: string;
  };
}

export interface RubrikSumatifEssayItem {
  no: number;
  judulSoal: string;
  soalDeskripsi: string;
  bobotMaks: number;
  aspekList: RubrikSumatifAspek[];
}

export interface RubrikMoodleItem {
  aspek: string;
  bobotMaks: number;
  deskripsi: string;
  skor4: string;
  skor3: string;
  skor2: string;
  skor1: string;
}

export interface IntervalKktpItem {
  rentangNilai: string;
  predikat: string;
  keterangan: string;
}

export interface RubrikDoc {
  docType: 'rubrik';
  identitas?: IdentitasRPM;
  judul: string;
  subJudul?: string;
  jumlahPertemuan?: number;
  // Legacy / Flat format
  tabelRubrik?: BarisRubrik[];
  pedomanPenskoran?: string;

  // Comprehensive sections
  bagianA_Formatif?: {
    judul: string;
    deskripsi: string;
    kriteriaList: BarisRubrik[];
  };
  bagianB_Sumatif?: {
    judul: string;
    deskripsi: string;
    rubrikSoalList: RubrikSumatifEssayItem[];
  };
  bagianC_Moodle?: {
    judul: string;
    deskripsi: string;
    aktivitasList: RubrikMoodleItem[];
  };
  bagianD_Formula?: {
    judul: string;
    rumusNA: string;
    penjelasanBobot: {
      komponen: string;
      bobotPersen: number;
      keterangan: string;
    }[];
    intervalKktp: IntervalKktpItem[];
  };
  footer?: string;
  [key: string]: any;
}

export interface GeneratedData {
  rpm: RpmDoc;
  lkpd: LkpdDoc;
  moodle: MoodleDoc;
  asesmen: AsesmenDoc;
  rubrik: RubrikDoc;
}

export type DocType = 'rpm' | 'lkpd' | 'moodle' | 'asesmen' | 'rubrik';

export interface PdfExportOptions {
  filename: string;
  docTitle: string;
  sekolah: string;
  isLandscape?: boolean;
}
