import { GeneratedData, IdentitasRPM } from '../types';

export const defaultIdentitas: IdentitasRPM = {
  sekolah: 'SMA Xaverius 1 Palembang',
  guru: 'Norbertus Suryadi, S.Kom.',
  namaGuru: 'Norbertus Suryadi, S.Kom.',
  guruMapel: 'Norbertus Suryadi, S.Kom.',
  nipGuru: '',
  kepalaSekolah: 'Andreas Sudarsana, M.Pd.',
  nipKepalaSekolah: '',
  mataPelajaran: 'Informatika',
  elemenKsp: 'AP (Algoritma dan Pemrograman)',
  kelas: 'Kelas X / Fase E',
  topik: 'Berpikir Kritis & Algoritma Pemrograman',
  jumlahPertemuan: '1',
  alokasiWaktu: '2 × 40 menit',
  cp: 'Pada akhir fase E, peserta didik mampu menerapkan strategi algoritmik standar dalam menyelesaikan persoalan nyata, melakukan abstraksi, serta mengevaluasi efisiensi solusi.',
  modelPembelajaran: 'Problem Based Learning & Pembelajaran Mendalam (Deep Learning)',
};

export const sampleGeneratedData: GeneratedData = {
  rpm: {
    docType: 'rpm',
    identitas: defaultIdentitas,
    capaianPembelajaran: defaultIdentitas.cp,
    targetDimensi: 'Penalaran Kritis, Gotong Royong, & Kemandirian',
    alurTujuanPembelajaran: [
      {
        kodeTp: 'TP 10.1',
        tujuanPembelajaran: 'Peserta didik mampu menganalisis permasalahan kompleks terkait Berpikir Kritis & Algoritma, serta melakukan dekomposisi dan abstraksi data kritis secara sistematis untuk memecahkan persoalan komputasional.',
        indikatorKetercapaian: [
          '1. Mengidentifikasi variabel masukan (input), batasan masalah, dan luaran (output) esensial dari studi kasus antrean IGD.',
          '2. Melakukan dekomposisi dengan memecah permasalahan besar menjadi sub-masalah yang terkelola.',
          '3. Melakukan abstraksi dengan menyaring data non-esensial dan memusatkan fokus pada variabel kunci.'
        ],
        alokasiWaktuJp: '2 JP (80 Menit)',
        pertemuanKe: 1,
        fokusMateri: 'Dekomposisi & Abstraksi Masalah',
        korelasiDokumen: {
          lkpd: 'Dasar Aktivitas LKPD 1 (Studi Kasus & Pemetaan Variabel IGD)',
          moodle: 'Dasar Forum Diskusi Sesi 1 & Unggah Berkas LKPD 1',
          asesmen: 'Dasar Asesmen Diagnostik Kognitif & Formatif Proses P1'
        }
      },
      {
        kodeTp: 'TP 10.2',
        tujuanPembelajaran: 'Peserta didik mampu mengenali pola logika persoalan, merancang diagram alir (flowchart) terstandar ISO, dan menyusun notasi pseudocode percabangan serta perulangan secara terstruktur.',
        indikatorKetercapaian: [
          '1. Menemukan pola relasi data dan kondisi percabangan logika dari studi kasus kontekstual.',
          '2. Merancang diagram alir (flowchart) dengan simbol standar ISO yang valid dan tidak ambigu.',
          '3. Menyusun notasi pseudocode (IF-THEN-ELSE / Loop) yang runtut, terstruktur, dan siap diimplementasikan.'
        ],
        alokasiWaktuJp: '2 JP (80 Menit)',
        pertemuanKe: 2,
        fokusMateri: 'Pengenalan Pola & Perancangan Algoritma/Flowchart',
        korelasiDokumen: {
          lkpd: 'Dasar Aktivitas LKPD 2 (Perancangan Flowchart & Pseudocode)',
          moodle: 'Dasar Aktivitas Interaktif H5P Moodle & Workshop Logika Sesi 2',
          asesmen: 'Dasar Observasi Unjuk Kerja Desain Algoritma P2'
        }
      },
      {
        kodeTp: 'TP 10.3',
        tujuanPembelajaran: 'Peserta didik mampu melakukan pengujian simulasi (dry-run trace table), mengevaluasi efisiensi kompleksitas algoritma, serta mempresentasikan portofolio solusi secara komunikatif dan reflektif.',
        indikatorKetercapaian: [
          '1. Melakukan pengujian alur algoritma dengan variasi data uji (normal, ekstrem, dan batas).',
          '2. Menganalisis efisiensi algoritma dari segi kompleksitas waktu eksekusi dan optimalisasi memori.',
          '3. Menyajikan dokumentasi laporan portofolio solusi serta merefleksikan nilai etika dalam komputasi.'
        ],
        alokasiWaktuJp: '2 JP (80 Menit)',
        pertemuanKe: 3,
        fokusMateri: 'Evaluasi, Efisiensi Algoritma & Portofolio',
        korelasiDokumen: {
          lkpd: 'Dasar Aktivitas LKPD 3 (Uji Coba Trace Table & Gelar Karya)',
          moodle: 'Dasar Kuis Formatif Online Moodle & Submission Portofolio Final',
          asesmen: 'Dasar Asesmen Sumatif Terpadu (PG Kompleks & Essay HOTS)'
        }
      }
    ],
    tujuanPembelajaran: [
      'Peserta didik mampu menganalisis permasalahan kompleks dan memecahkannya menjadi sub-masalah secara sistematis.',
      'Peserta didik dapat merancang algoritma perulangan dan percabangan secara logis dan terstruktur.',
      'Peserta didik dapat menguji dan merefleksikan kebenaran algoritma yang dibuat melalui studi kasus kontekstual.'
    ],
    pemahamanBermakna: 'Berpikir kritis dan sistematis melalui algoritma membantu menyelesaikan berbagai permasalahan dunia nyata, tidak hanya dalam bidang pemrograman tetapi juga dalam pengambilan keputusan sehari-hari.',
    pertanyaanPemantik: [
      'Bagaimana cara komputer dapat menentukan rute terdekat dari lokasi Anda ke tempat tujuan dalam hitungan detik?',
      'Jika Anda dihadapkan pada masalah besar dengan banyak variabel, tahapan apa yang pertama kali Anda lakukan?'
    ],
    pertemuanList: [
      {
        pertemuanKe: 1,
        topik: 'Berpikir Kritis & Analisis Algoritma Penjadwalan — Dekomposisi & Abstraksi',
        alokasiWaktu: '80 Menit (2 × 40 menit)',
        praktikPedagogis: 'Problem Based Learning (PBL) & Deep Learning',
        materiPembelajaran: [
          { abjad: 'A', judul: 'Pengantar Berpikir Kritis & Algoritma', deskripsi: 'Eksplorasi fondasi berpikir komputasional, urgensi analisis logika, dan definisi algoritma dalam konteks Informatika.' },
          { abjad: 'B', judul: '4 Pilar Berpikir Komputasional', deskripsi: 'Pemahaman mendalam mengenai Dekomposisi, Pengenalan Pola, Abstraksi, dan Perancangan Algoritma.' },
          { abjad: 'C', judul: 'Struktur Logika Percabangan (IF-THEN-ELSE)', deskripsi: 'Analisis variabel kondisi, aturan logika keputusan, dan penerapannya pada sistem otomatisasi.' },
          { abjad: 'D', judul: 'Representasi Algoritma: Pseudocode & Flowchart', deskripsi: 'Teknik mendokumentasikan urutan langkah sistematis menggunakan simbol standar internasional ISO 5807.' },
          { abjad: 'E', judul: 'Studi Kasus Kontekstual: Manajemen Antrean IGD', deskripsi: 'Dekomposisi masalah nyata sistem prioritas pasien rumah sakit berdasarkan variabel ketersediaan medis.' },
          { abjad: 'F', judul: 'Sintesis Pemahaman & Evaluasi Logika', deskripsi: 'Pengujian awal alur algoritma, identifikasi kriteria efisiensi, dan refleksi pemahaman individu.' }
        ],
        langkah: [
          {
            tahap: 'KEGIATAN AWAL (Pendahuluan)',
            alokasiWaktu: '15 Menit',
            aktivitasGuru: '1. Menyapa peserta didik dengan hangat, memimpin doa bersama, dan mengecek presensi kehadiran.\n2. Mengondisikan fisik dan psikis peserta didik agar fokus serta siap mengikuti proses pembelajaran.\n3. Memberikan apersepsi visual simulasi rute terdekat pada aplikasi Google Maps dan memandu diskusi pemantik singkat.\n4. Mengajukan pertanyaan pemantik: "Bagaimana sistem menentukan rute tercepat saat terjadi kemacetan secara langsung?"\n5. Menggali pengalaman peserta didik terkait penggunaan aplikasi navigasi dalam kehidupan sehari-hari.\n6. Menyampaikan tujuan pembelajaran, Alur Tujuan Pembelajaran (ATP), serta skenario aktivitas kelompok.\n7. Menjelaskan bentuk tagihan karya berupa pseudocode/flowchart serta rubrik asesmen yang akan dinilai.',
            aktivitasSiswa: '1. Berdoa secara khidmat dan merespons presensi guru dengan sopan.\n2. Merapikan tempat duduk dan menyiapkan perangkat laptop/alat tulis untuk diskusi.\n3. Mengamati tayangan simulasi Google Maps dan aktif menjawab pertanyaan apersepsi guru.\n4. Merespons pertanyaan pemantik berdasarkan analisis sederhana dan pengalaman pribadi.\n5. Menyampaikan pengetahuan awal mengenai konsep urutan langkah dalam menyelesaikan masalah.\n6. Memahami target capaian pembelajaran hari ini dan skenario pengerjaan tugas.\n7. Menyimak kriteria penilaian karya kelompok yang dijelaskan oleh guru.',
            prinsipPembelajaran: 'Berkesadaran & Bermakna'
          },
          {
            tahap: 'KEGIATAN INTI - Orientasi Masalah & Penyelidikan Kelompok (PBL)',
            alokasiWaktu: '60 Menit',
            aktivitasGuru: '1. Menyajikan studi kasus nyata tentang sistem manajemen antrean darurat IGD rumah sakit yang mengalami hambatan prioritas penanganan.\n2. Memandu peserta didik mengidentifikasi kriteria variabel input (tingkat keparahan pasien, waktu kedatangan, ketersediaan dokter).\n3. Membagi peserta didik ke dalam kelompok heterogen (4-5 siswa) dan membagikan Lembar Kerja Peserta Didik (LKPD).\n4. Membimbing kelompok membagi peran internal secara jelas (ketua, pencatat logika, perancang flowchart, juru bicara).\n5. Memaparkan konsep 4 pilar Berpikir Komputasional (dekomposisi, pengenalan pola, abstraksi, dan algoritma).\n6. Memberikan contoh konkret penerapan struktur logika percabangan IF-THEN-ELSE pada penanganan prioritas kasus antrean.\n7. Memfasilitasi diskusi kelompok saat menguraikan masalah IGD menjadi komponen-komponen logika yang lebih kecil.\n8. Memberikan pertanyaan pengarah (scaffolding) bagi kelompok yang mengalami kesulitan dalam menyusun urutan kondisi.\n9. Memantau dinamika kolaborasi kelompok dan memastikan seluruh peserta didik berkontribusi dalam diskusi.\n10. Membimbing peserta didik merancangkan alur pseudocode dan flowchart penyelesaian pada lembar LKPD.\n11. Mengarahkan perwakilan kelompok mempresentasikan rancangan alur algoritma di hadapan kelas.\n12. Memandu sesi tanya jawab antar kelompok untuk memberikan masukan konstruktif terhadap algoritma yang dipaparkan.\n13. Memberikan penguatan teoretis, mengapresiasi solusi kelompok, serta meluruskan miskonsepsi percabangan logika.',
            aktivitasSiswa: '1. Mengamati dan menganalisis studi kasus antrean IGD rumah sakit dengan cermat.\n2. Mengidentifikasi variabel utama dan menentukan kriteria prioritas penanganan pasien.\n3. Berkumpul bersama kelompok yang telah ditentukan dan menerima berkas LKPD.\n4. Bermusyawarah membagi tugas internal kelompok sesuai keahlian masing-masing anggota.\n5. Menyimak penjelasan guru mengenai 4 pilar berpikir komputasional dan mencatat poin-poin kunci.\n6. Menganalisis contoh struktur IF-THEN-ELSE dan mendiskusikan penerapannya pada kasus IGD.\n7. Menguraikan masalah kompleks IGD menjadi sub-masalah sederhana melalui metode dekomposisi.\n8. Berdiskusi dan bertanya kepada guru jika menemukan hambatan logika dalam menyusun variabel.\n9. Berkolaborasi aktif merumuskan aturan kondisi percabangan secara logis dan runtut.\n10. Menyusun diagram alir (flowchart) dan pseudocode solusi pada lembar kerja kelompok.\n11. Perwakilan kelompok mempresentasikan rancangan algoritma dan menjawab pertanyaan dari kelas.\n12. Peserta didik dari kelompok lain menyimak presentasi dan memberikan tanggapan atau masukan.\n13. Mencatat penguatan dari guru serta memperbaiki kekeliruan alur logika pada draft algoritma.',
            prinsipPembelajaran: 'Memahami & Mengaplikasi'
          },
          {
            tahap: 'KEGIATAN PENUTUP',
            alokasiWaktu: '15 Menit',
            aktivitasGuru: '1. Bersama peserta didik menyimpulkan prinsip utama struktur logika percabangan dan analisis algoritma.\n2. Memberikan penguatan positif dan apresiasi setinggi-tingginya atas keaktifan dan kolaborasi kelompok.\n3. Menginstruksikan peserta didik mengakses Moodle LMS untuk mengunggah hasil diskusi dan mengisi lembar refleksi diri.\n4. Memandu peserta didik merefleksikan proses berpikir kritis yang telah dilakukan selama pembelajaran.\n5. Menyampaikan gambaran materi pertemuan berikutnya mengenai pengujian efisiensi algoritma dan perulangan.\n6. Memimpin doa penutup pembelajaran dan mengucapkan salam.',
            aktivitasSiswa: '1. Secara aktif ikut merangkum poin-poin penting dari pembelajaran algoritma hari ini.\n2. Menerima umpan balik dan motivasi dari guru dengan antusias.\n3. Mengunggah dokumentasi LKPD ke Moodle LMS dan mengisi instrumen refleksi pembelajaran.\n4. Mengidentifikasi pilar berpikir komputasional yang paling dikuasai dan area yang masih perlu dilatih.\n5. Mencatat informasi tindak lanjut dan materi persiapan untuk pertemuan selanjutnya.\n6. Berdoa bersama menutup kegiatan belajar dan merespons salam guru.',
            prinsipPembelajaran: 'Refleksi Diri'
          }
        ]
      },
      {
        pertemuanKe: 2,
        topik: 'Berpikir Kritis & Analisis Algoritma Penjadwalan — Perancangan Flowchart ISO & Trace Table',
        alokasiWaktu: '80 Menit (2 × 40 menit)',
        praktikPedagogis: 'Problem Based Learning (PBL) & Deep Learning',
        materiPembelajaran: [
          { abjad: 'A', judul: 'Pengenalan Pola & Tinjauan Logika Sesi 1', deskripsi: 'Evaluasi hasil dekomposisi data sesi sebelumnya dan perumusan pola kondisi percabangan bersarang (Nested IF).' },
          { abjad: 'B', judul: 'Standarisasi Diagram Alir (Flowchart ISO 5807)', deskripsi: 'Penerapan presisi simbol Terminator, Process, Decision belah ketupat, Data I/O, dan Garis Alir dalam penyelesaian masalah.' },
          { abjad: 'C', judul: 'Notasi Pseudocode Terstruktur & Konvensi Bahasa', deskripsi: 'Penulisan sintaks logika semi-formal yang independen bahasa pemrograman dengan struktur kontrol dan indentasi baku.' },
          { abjad: 'D', judul: 'Metode Pengujian Dry-Run (Trace Table)', deskripsi: 'Teknik penelusuran manual nilai variabel baris demi baris menggunakan tabel pelacak nilai pada data uji normal, batas, dan ekstrem.' },
          { abjad: 'E', judul: 'Analisis Kompleksitas & Efisiensi Solusi', deskripsi: 'Perbandingan jalur instruksi algoritma untuk meminimalkan redundansi logika dan mengoptimalkan kecepatan eksekusi keputusan.' },
          { abjad: 'F', judul: 'Gelar Portofolio Solusi & Refleksi Etika Komputasi', deskripsi: 'Presentasi unjuk kerja kelompok, peer-review antartim, validasi ketahanan sistem, dan sintesis dampak teknologi terhadap keselamatan publik.' }
        ],
        langkah: [
          {
            tahap: 'KEGIATAN AWAL (Pendahuluan)',
            alokasiWaktu: '15 Menit',
            aktivitasGuru: '1. Guru menyapa peserta didik dengan salam hangat, mengondisikan kesiapan ruang kelas, dan mengecek presensi kehadiran.\n2. Guru memimpin doa bersama untuk menumbuhkan suasana belajar yang berkesadaran dan religius.\n3. Guru mereview singkat pencapaian dekomposisi masalah pada Pertemuan 1 dan mengaitkannya dengan target perancangan algoritma hari ini.\n4. Guru memberikan apersepsi visual perbandingan flowchart yang ambigu vs flowchart standar ISO 5807.\n5. Guru mengajukan pertanyaan pemantik: "Mengapa sebuah algoritma yang tampak benar secara logika masih bisa mengalami kegagalan saat diuji dengan data ekstrem?"\n6. Guru menyampaikan tujuan pembelajaran, indikator ketercapaian (IKTP), serta alur aktivitas unjuk kerja kelompok.\n7. Guru menjelaskan kriteria rubrik penilaian perancangan flowchart, pseudocode, dan simulasi trace table.',
            aktivitasSiswa: '1. Peserta didik merespons salam guru, merapikan meja diskusi, dan menyiapkan perangkat komputer/alat tulis.\n2. Peserta didik berdoa secara khidmat dipimpin oleh ketua kelas.\n3. Peserta didik merespons ulasan materi Pertemuan 1 dan mengonfirmasi pemahaman variabel data yang telah dirumuskan sebelumnya.\n4. Peserta didik mengamati contoh diagram alir dan mendiskusikan pentingnya simbol yang tidak ambigu.\n5. Peserta didik menjawab pertanyaan pemantik guru berdasarkan pemikiran kritis dan logika komputasi.\n6. Peserta didik mencatat tujuan pembelajaran dan memahami target produk yang harus diselesaikan pada Pertemuan 2.\n7. Peserta didik menyimak kriteria rubrik penilaian presentasi dan pengujian algoritma.',
            prinsipPembelajaran: 'Berkesadaran & Bermakna'
          },
          {
            tahap: 'KEGIATAN INTI - Orientasi Masalah & Penyelidikan Kelompok (PBL)',
            alokasiWaktu: '60 Menit',
            aktivitasGuru: '1. Guru membagikan LKPD Pertemuan 2 dan mengarahkan peserta didik kembali bergabung ke dalam kelompok kerja masing-masing.\n2. Guru memaparkan standarisasi simbol Flowchart ISO 5807 dan aturan penulisan notasi pseudocode terstruktur.\n3. Guru mendemonstrasikan perancangan flowchart percabangan bertingkat untuk kasus prioritas antrean IGD rumah sakit.\n4. Guru memandu kelompok mengonversi variabel dekomposisi Pertemuan 1 menjadi diagram alir dan notasi pseudocode.\n5. Guru mengarahkan siswa menggunakan aplikasi digital diagram alir (Draw.io/Flowchart builder) atau media presentasi kelompok.\n6. Guru memperkenalkan teknik pengujian algoritma tanpa komputer menggunakan metode Trace Table (Dry-Run Testing).\n7. Guru membimbing setiap kelompok menyusun tabel penelusuran (trace table) dengan memasukkan data uji normal, batas, dan ekstrem.\n8. Guru berkeliling secara intensif memantau perancangan algoritma dan memberikan bimbingan khusus (scaffolding) bagi kelompok yang mengalami kendala logika.\n9. Guru memastikan seluruh anggota kelompok terlibat aktif dalam pengujian trace table dan perumusan laporan solusi.\n10. Guru memfasilitasi sesi Gelar Karya / Presentasi Kelompok, di mana perwakilan tim memaparkan flowchart dan hasil simulasi trace table di depan kelas.\n11. Guru memandu sesi tanya jawab dan peer-review, meminta kelompok audiens menguji diagram alir penyaji dengan kasus uji baru.\n12. Guru memberikan asesmen kinerja langsung terhadap ketepatan simbol, validitas logika percabangan, dan kemampuan argumentasi kelompok.\n13. Guru memberikan penguatan teoretis, mengapresiasi inovasi algoritma siswa, dan meluruskan miskonsepsi dalam penelusuran kondisi batas.',
            aktivitasSiswa: '1. Peserta didik berkumpul dalam kelompoknya dan membuka berkas LKPD Pertemuan 2.\n2. Peserta didik menyimak penjelasan guru mengenai simbol flowchart standar ISO dan konvensi pseudocode.\n3. Peserta didik menganalisis contoh logika percabangan bertingkat dan mengaitkannya dengan masalah yang sedang dipecahkan.\n4. Peserta didik berkolaborasi aktif merancang diagram alir lengkap dari awal (Terminator) hingga akhir keputusan sistem.\n5. Peserta didik mendokumentasikan flowchart menggunakan tools digital (Draw.io) atau kertas plano kelompok dengan rapi.\n6. Peserta didik menyusun baris notasi pseudocode terstruktur yang selaras dengan alur diagram alir.\n7. Peserta didik membuat trace table dan melakukan simulasi manual (dry run) dengan variasi data uji pasien (koma, darurat, reguler).\n8. Peserta didik mengidentifikasi potensi bug logika atau kondisi percabangan yang belum terakomodasi dan segera merevisinya.\n9. Peserta didik berkonsultasi dengan guru jika menemukan anomali pada hasil eksekusi trace table.\n10. Perwakilan kelompok mempresentasikan rancangan flowchart dan membuktikan kevalidan algoritma melalui demonstrasi trace table di depan kelas.\n11. Peserta didik dari kelompok lain menyimak dengan kritis, mengajukan pertanyaan, dan memberikan skenario data uji pembanding.\n12. Peserta didik menerima masukan dari teman sejawat dan guru untuk menyempurnakan keandalan produk algoritma kelompok.\n13. Peserta didik mencatat penguatan materi dan merapikan draft akhir portofolio solusi algoritma.',
            prinsipPembelajaran: 'Memahami & Mengaplikasi'
          },
          {
            tahap: 'KEGIATAN PENUTUP',
            alokasiWaktu: '15 Menit',
            aktivitasGuru: '1. Guru bersama peserta didik merumuskan kesimpulan komprehensif mengenai pentingnya perancangan algoritma yang presisi dan verifikasi trace table.\n2. Guru memberikan apresiasi dan umpan balik positif atas dedikasi, kerja sama tim, dan kualitas algoritma yang dipresentasikan.\n3. Guru menginstruksikan peserta didik mengunggah berkas final LKPD 2 dan diagram alir ke sistem e-learning Moodle LMS.\n4. Guru memandu peserta didik melakukan refleksi metakognitif individu mengenai pengalaman belajar, kendala logika yang dihadapi, dan strategi mengatasinya.\n5. Guru menyampaikan arahan tindak lanjut, rencana asesmen sumatif, serta gambaran materi pada pertemuan berikutnya.\n6. Guru memimpin doa penutup pembelajaran dan mengakhiri sesi dengan salam.',
            aktivitasSiswa: '1. Peserta didik secara antusias ikut menyimpulkan prinsip utama algoritma, flowchart ISO, dan validasi trace table.\n2. Peserta didik menerima apresiasi dari guru dan merasa percaya diri atas pencapaian karya kelompoknya.\n3. Peserta didik mengunggah dokumen LKPD 2 dan file flowchart ke Moodle LMS sesuai tenggat waktu yang ditentukan.\n4. Peserta didik mengisi lembar instrumen refleksi diri secara jujur mengenai pemahaman konsep dan keterampilan kolaboratif.\n5. Peserta didik mencatat jadwal tindak lanjut dan persiapan asesmen materi selanjutnya.\n6. Peserta didik berdoa bersama menutup kegiatan belajar dan merespons salam guru dengan santun.',
            prinsipPembelajaran: 'Refleksi Diri'
          }
        ]
      }
    ],
    kegiatanPembelajaran: [
      {
        tahap: 'Pendahuluan (15 Menit)',
        aktivitasGuru: '1. Menyapa peserta didik, berdoa, dan mengecek kehadiran.\n2. Memberikan apersepsi tentang navigasi Google Maps.\n3. Menyampaikan tujuan pembelajaran dan motivasi.',
        aktivitasSiswa: '1. Berdoa dan merespons presensi.\n2. Mengamati tayangan simulasi rute terdekat.\n3. Menjawab pertanyaan pemantik guru.',
        elemenDeepLearning: 'Memahami (Konsep Dasar & Apersepsi)'
      },
      {
        tahap: 'Aktivitas Inti (60 Menit) - Orientasi & Investigasi Kelompok',
        aktivitasGuru: '1. Membagi siswa menjadi kelompok heterogen (4-5 siswa).\n2. Membagikan studi kasus pengurutan data antrean rumah sakit.\n3. Membimbing kelompok merumuskan diagram alir dan pseudocode.\n4. Memfasilitasi diskusi kritis antar kelompok.',
        aktivitasSiswa: '1. Bergabung dalam kelompok dan membaca LKPD.\n2. Mengidentifikasi input, proses, dan output dari studi kasus.\n3. Menyusun skenario algoritma bersama kelompok.\n4. Mempresentasikan rancangan awal di depan kelas.',
        elemenDeepLearning: 'Mengaitkan & Menerapkan (Problem Solving & Kolaborasi)'
      },
      {
        tahap: 'Penutup & Refleksi (15 Menit)',
        aktivitasGuru: '1. Bersama siswa merangkum poin-poin utama algoritma.\n2. Memberikan umpan balik positif terhadap hasil presentasi.\n3. Menginstruksikan pengisian lembar refleksi diri.\n4. Menutup pembelajaran dengan doa.',
        aktivitasSiswa: '1. Menyimpulkan materi yang telah dipelajari.\n2. Mengisi instrumen refleksi pembelajaran di LMS Moodle.\n3. Menyiapkan diri untuk materi minggu depan.',
        elemenDeepLearning: 'Refleksi & Evaluasi Diri'
      }
    ],
    asesmenRencana: {
      awal: 'Tes diagnostik non-kognitif (kesiapan belajar) dan tes awal 3 soal konsep logika dasar.',
      proses: 'Observasi unjuk kerja kelompok, keaktifan berdiskusi, dan ketepatan penyusunan pseudocode.',
      akhir: 'Tes sumatif individu berupa 2 soal studi kasus analisis kompleksitas algoritma.'
    },
    pengayaanRemedial: {
      pengayaan: 'Diberikan studi kasus tingkat lanjut dengan algoritma pencarian (binary search) dan struktur data graph.',
      remedial: 'Bimbingan perorangan mengenai pembuatan diagram alir (flowchart) sederhana untuk kasus linier.'
    }
  },
  lkpd: {
    docType: 'lkpd',
    judul: 'LEMBAR KERJA PESERTA DIDIK (LKPD)',
    subJudul: 'Eksplorasi Algoritma Penjadwalan & Berpikir Kritis',
    identitas: {
      mataPelajaran: 'Informatika',
      kelas: 'Kelas X / Fase E',
      topik: 'Berpikir Kritis & Algoritma Pemrograman',
      waktu: '2 × 40 menit'
    },
    tujuanAktivitas: [
      'Siswa dapat merancang algoritma penyelesaian masalah antrean rumah sakit.',
      'Siswa dapat menggambarkan urutan logis langkah-langkah dalam bentuk flowchart.',
      'Siswa dapat memvalidasi kebenaran algoritma menggunakan uji coba sampel data (dry run).'
    ],
    petunjukPengerjaan: [
      'Bacalah studi kasus dengan cermat sebelum mendiskusikan jawaban.',
      'Kerjakan tugas secara kolaboratif bersama kelompok masing-masing.',
      'Tuliskan rancangan algoritma dan diagram alir pada kolom jawaban yang tersedia.',
      'Presentasikan hasil kerja kelompok saat dipanggil oleh guru.'
    ],
    stimulusMaterial: 'Sebuah Rumah Sakit daerah menghadapi kendala penumpukan pasien di ruang IGD. Pasien yang datang memiliki tingkat kegawatan yang berbeda: Kritis (Merah), Mendesak (Kuning), dan Biasa (Hijau). Sistem antrean lama menggunakan prinsip First-In First-Out (FIFO) yang menyebabkan pasien kritis terlambat ditangani. Rumah sakit membutuhkan algoritma baru untuk menentukan prioritas penanganan pasien secara adil, cepat, dan akurat.',
    aktivitasSiswa: [
      {
        no: 1,
        tugas: 'Analisis Masalah & Abstraksi',
        instruksi: 'Tentukan entitas utama, kriteria prioritas, dan variabel input-output yang dibutuhkan oleh sistem antrean baru!',
        ruangJawaban: 'Entitas Input: Data Pasien, Tingkat Kategori (Merah/Kuning/Hijau), Waktu Kedatangan.\nVariabel Output: Urutan Antrean Prioritas Pasien.\nKriteria Prioritas: Pasien Kritis (Merah) selalu menempati antrean terdepan, disusul Mendesak (Kuning), kemudian Biasa (Hijau).'
      },
      {
        no: 2,
        tugas: 'Perancangan Algoritma & Diagram Alir',
        instruksi: 'Buatlah struktur logika percabangan (IF-THEN-ELSE) untuk menentukan nomor urut prioritas pasien!',
        ruangJawaban: 'IF kategori == "Merah" THEN\n   prioritas = 1 (Tingkat Utama / Langsung IGD)\nELSE IF kategori == "Kuning" THEN\n   prioritas = 2 (Tingkat Sedang)\nELSE\n   prioritas = 3 (Tingkat Reguler / Urutan Kedatangan)\nEND IF'
      }
    ],
    pertanyaanDiskusi: [
      'Apakah algoritma yang Anda rancang sudah adil bagi pasien kategori Hijau yang datang lebih awal?',
      'Skenario apa yang mungkin terjadi jika ada 5 pasien kategori Merah yang datang secara bersamaan?'
    ],
    refleksiSiswa: 'Siswa menuliskan kendala utama yang dialami saat merancang logika percabangan serta pengalaman berdiskusi dalam tim.',
    kesimpulan: 'Penerapan struktur percabangan bersyarat sangat krusial dalam algoritma prioritas untuk menghasilkan keputusan yang responsif dan aman bagi keselamatan pasien.'
  },
  moodle: {
    docType: 'moodle',
    namaAktivitas: 'Panduan & Struktur Aktivitas E-Learning LMS: Berpikir Komputasional',
    platform: 'Moodle LMS / Google Classroom',
    jenisAktivitas: 'Assignment, Forum Diskusi & Kuis Online',
    deskripsiRingkas: 'Panduan e-learning 3 sesi terintegrasi Kurikulum Merdeka untuk mendukung pembelajaran mandiri, kolaboratif, dan penguasaan 4 pilar berpikir komputasional secara mendalam.',
    jumlahPertemuan: 3,
    sesiElearning: [
      {
        pertemuanKe: 1,
        namaSesi: 'Sesi 1: Dekomposisi & Abstraksi Masalah (Forum & LKPD P1)',
        jenisAktivitas: ['Forum Diskusi Kelompok (Moodle Forum)', 'Assignment Unggah LKPD P1 (File PDF)'],
        formatPengumpulan: 'File PDF (Maksimal 5 MB)',
        tenggatWaktu: 'H+3 Setelah Pertemuan 1 (Pukul 23.59 WIB)',
        instruksi: [
          'Unduh dan pelajari slide materi serta video pengantar mengenai prinsip Dekomposisi dan Abstraksi.',
          'Diskusikan akar masalah kasus antrean sistem digital pada topik diskusi kelompok masing-masing di Forum Diskusi Sesi 1.',
          'Setiap anggota wajib memberikan minimal 1 tanggapan argumentatif terkait pemisahan data kritis.',
          'Unggah berkas LKPD Pertemuan 1 yang telah dilengkapi oleh kelompok dalam format PDF.'
        ],
        bahanSupport: [
          'Slide Presentasi: Dekomposisi & Abstraksi Sistem (PDF)',
          'Lembar Kerja Peserta Didik (LKPD) Pertemuan 1',
          'Video Tutorial: Studi Kasus Pemilahan Variabel Kritis'
        ]
      },
      {
        pertemuanKe: 2,
        namaSesi: 'Sesi 2: Pengenalan Pola & Perancangan Algoritma (Flowchart Submission)',
        jenisAktivitas: ['Assignment Unggah Flowchart & Pseudocode', 'Workshop Konsultasi & Peer Review'],
        formatPengumpulan: 'File PDF / Gambar Diagram (Maksimal 5 MB)',
        tenggatWaktu: 'H+3 Setelah Pertemuan 2 (Pukul 23.59 WIB)',
        instruksi: [
          'Gunakan hasil dekomposisi data dari Sesi 1 untuk merumuskan aturan logika percabangan (IF-ELSE) dan antrean prioritas.',
          'Rancang diagram alir (Flowchart) solusi komputasi menggunakan aplikasi Draw.io, Canva, atau sejenisnya.',
          'Unggah file diagram alir dan penjelasan pseudocode pada menu Submission Sesi 2.',
          'Lakukan peer-review dan berikan masukan konstruktif pada rancangan minimal 1 kelompok lain.'
        ],
        bahanSupport: [
          'Modul Panduan: Simbol Standar Flowchart & Logika Percabangan',
          'Aplikasi Web Builder: Link Integrasi Draw.io',
          'Contoh Kasus: Implementasi Priority Queue'
        ]
      },
      {
        pertemuanKe: 3,
        namaSesi: 'Sesi 3: Pengujian, Evaluasi Solusi & Kuis Online (Moodle Quiz)',
        jenisAktivitas: ['Kuis Online Formatif (Moodle Quiz - 10 Soal)', 'Assignment Portofolio Laporan Final & Video'],
        formatPengumpulan: 'Pengerjaan Kuis Interaktif & File PDF Laporan Berisi Link Video',
        tenggatWaktu: 'H+7 Setelah Pertemuan 3 (Pukul 23.59 WIB)',
        instruksi: [
          'Kerjakan Kuis Evaluasi Moodle yang terdiri dari 10 butir soal pilihan ganda berbasis studi kasus penelusuran algoritma.',
          'Lakukan uji coba kasus ekstrem (dry-run testing) terhadap diagram alir kelompok dan catat hasil evaluasinya.',
          'Susun Laporan Portofolio Akhir (Kompilasi Sesi 1, 2, dan 3) beserta tautan rekaman video presentasi kelompok.',
          'Kumpulkan laporan portofolio final pada portal Assignment Sesi 3 sebelum batas akhir pengumpulan.'
        ],
        bahanSupport: [
          'Bank Soal Kuis Moodle: Evaluasi Logika & Berpikir Komputasional',
          'Template Dokumen Portofolio Laporan Akhir (DOCX/PDF)',
          'Rubrik Penilaian Presentasi & Penilaian Kinerja Kelompok'
        ]
      }
    ],
    kriteriaKeberhasilan: [
      'Berpartisipasi aktif dalam forum diskusi online dengan minimal 1 kiriman orisinal dan 1 tanggapan rekan sejawat.',
      'Mengumpulkan tugas LKPD Sesi 1, Rancangan Flowchart Sesi 2, dan Laporan Portofolio Sesi 3 tepat waktu.',
      'Mencapai skor minimal kriteria ketercapaian tujuan pembelajaran (KKTP >= 75) pada Kuis Evaluasi Online Sesi 3.',
      'Menunjukkan keterampilan kolaborasi dan kemampuan menyelesaikan masalah secara logis dan komputasional.'
    ],
    petunjukPenilaian: 'Penilaian akan dilakukan berdasarkan Rubrik Penilaian E-Learning yang mencakup: Keaktifan Forum, Ketepatan Waktu & Format Berkas, Logika Flowchart, dan Nilai Kuis Online.',
    footer: 'CopyRight©Norbertus Suryadi — SMA Xaverius 1 Palembang | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning'
  },
  asesmen: {
    docType: 'asesmen',
    judul: 'INSTRUMEN ASESMEN & EVALUASI PEMBELAJARAN LENGKAP',
    asesmenAwal: {
      teknik: 'Tes Diagnostik Kognitif (5 Pilihan Ganda Singkat A-E)',
      soalPg: [
        {
          no: 1,
          pertanyaan: 'Manakah dari langkah berikut yang merupakan tahapan awal paling tepat dalam metode Berpikir Komputasional saat menghadapi masalah kompleks perancangan algoritma?',
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
          pertanyaan: 'Dalam perancangan bagan alir (flowchart), simbol berbentuk belah ketupat (diamond) digunakan untuk merepresentasikan fungsi...',
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
          pertanyaan: 'Jika sebuah kondisi logika bernilai: (15 > 10) AND (8 == 9), maka hasil evaluasi kebenaran logika akhirnya adalah...',
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
          pertanyaan: 'Teknik mengabaikan informasi atau atribut yang tidak relevan dan hanya memfokuskan perhatian pada data esensial disebut...',
          pilihan: {
            A: 'Algoritma Sekuensial',
            B: 'Debugging Program',
            C: 'Abstraksi (Abstraction)',
            D: 'Enkripsi Data',
            E: 'Kompilasi Kode'
          },
          kunciJawaban: 'C',
          penjelasan: 'Abstraksi menyaring elemen non-esensial agar model komputasi menjadi fokus dan efisien.',
          indikatorPrasyarat: 'Kemampuan Abstraksi Variabel Kritis'
        },
        {
          no: 5,
          pertanyaan: 'Berikut ini yang BUKAN merupakan karakteristik dari sebuah algoritma yang baik dan efektif adalah...',
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
      ]
    },
    asesmenProses: {
      teknik: 'Integrasi Aktivitas H5P LMS Moodle & Observasi Unjuk Kerja',
      aktivitasH5P: [
        {
          no: 1,
          jenis: 'H5P Drag and Drop',
          judul: 'Aktivitas 1: Rekonstruksi Simbol Flowchart & Dekomposisi Variabel',
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
      ],
      lembarObservasi: [
        { indikator: 'Partisipasi aktif & inisiatif dalam diskusi kolaboratif kelompok kerja', skorMaks: 4 },
        { indikator: 'Kemampuan dekomposisi masalah dan pemilahan variabel kasus kontekstual', skorMaks: 4 },
        { indikator: 'Ketepatan perancangan diagram alir (flowchart) menggunakan simbol standar ISO', skorMaks: 4 },
        { indikator: 'Keterampilan simulasi pengujian (dry-run) kasus normal dan kondisi ekstrem', skorMaks: 4 },
        { indikator: 'Kualitas komunikasi, etika presentasi, dan argumentasi logis atas solusi tim', skorMaks: 4 }
      ]
    },
    asesmenAkhir: {
      teknik: 'Tes Sumatif Terpadu (5 PG Kompleks [40%] & 2 Essay Analitis HOTS [60%])',
      bagian1PgKompleks: [
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
          stimulus: 'Diberikan pseudocode perulangan:\nSET X = 10, Y = 3\nWHILE (X > Y) DO\n  X = X - 2\n  Y = Y + 1\nENDWHILE\nPRINT X, Y',
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
      ],
      bagian2EssayHots: [
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
          pertanyaan: '1. Analisislah mengapa struktur data antrean FIFO tidak tepat digunakan pada kasus kegawatdaruratan IGD tersebut dan apa dampak fatalnya!\n2. Rekomendasikan struktur data atau algoritma antrean yang paling optimal (misal: Priority Queue berbasis Heap) dan jelaskan bagaimana algoritma tersebut memproses urutan prioritas pasien secara efisien!',
          kunciJawaban: 'FIFO hanya memperhatikan waktu kedatangan tanpa menimbang bobot kegawatan medis, sehingga melanggar prinsip triase IGD. Solusi optimal: Priority Queue di mana setiap pasien memiliki kunci prioritas kegawatan (Level 1-3). Pasien dengan kegawatan darurat tertinggi (Level 1) akan selalu diproses terlebih dahulu.',
          pedomanPenskoran: 'Analisis kelemahan & risiko fatal FIFO (Skor 10) + Rekomendasi Priority Queue dan argumentasi teknis (Skor 12) + Penjelasan mekanisme penanganan kasus prioritas sama (Skor 8) = Total Bobot Maksimal 30 Poin.',
          bobot: 30
        }
      ]
    },
    bobotNilai: 'Nilai Akhir (NA) = (Skor Formatif [H5P & LKPD] × 30%) + (Skor PG Kompleks [40%] + Skor Essay HOTS [60%] × 70%)',
    rekapNilaiFormat: 'Skala Ketercapaian 0 - 100 dengan 4 Kategori Predikat KKTP (Sangat Baik, Baik, Cukup, Perlu Bimbingan)',
    footer: 'CopyRight©Norbertus Suryadi — SMA Xaverius 1 Palembang | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning'
  },
  rubrik: {
    docType: 'rubrik',
    judul: 'RUBRIK PENILAIAN KOMPREHENSIF & KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)',
    subJudul: 'Rubrik evaluasi holistik mencakup asesmen formatif LKPD 3 pertemuan, asesmen sumatif penalaran essay & PG kompleks, partisipasi modul H5P e-learning Moodle, dan formula Nilai Akhir (NA).',
    jumlahPertemuan: 3,
    identitas: {
      ...defaultIdentitas
    },
    bagianA_Formatif: {
      judul: 'BAGIAN A: RUBRIK ASESMEN FORMATIF LKPD (3 PERTEMUAN)',
      deskripsi: 'Pedoman penskoran kinerja unjuk kerja kelompok dalam menyelesaikan LKPD Kurikulum Merdeka (Skala 1 - 4).',
      kriteriaList: [
        {
          pertemuanKe: 1,
          kriteria: 'Pertemuan 1: Analisis Dekomposisi & Abstraksi Masalah',
          indikator: 'Kemampuan mengurai masalah kompleks menjadi sub-masalah dan memilah variabel kritis belanja & diskon.',
          skor4: 'Mampu mendekomposisi seluruh masalah secara komprehensif dan mengabstraksi data esensial 100% tepat tanpa data redundan.',
          skor3: 'Mampu mendekomposisi masalah utama dengan baik dan mengabstraksi sebagian besar data esensial.',
          skor2: 'Dekomposisi masih parsial/kurang lengkap dan masih menyertakan data non-esensial.',
          skor1: 'Belum mampu memecah masalah menjadi sub-masalah dan gagal mengabstraksi data penting.'
        },
        {
          pertemuanKe: 2,
          kriteria: 'Pertemuan 2: Perancangan Diagram Alir / Flowchart & Logika Algoritma',
          indikator: 'Ketepatan simbol standar ISO, urutan algoritma, dan logika percabangan IF-ELSE majemuk.',
          skor4: 'Diagram alir sangat rapi, simbol ISO 100% tepat, logika percabangan dan perulangan runtut serta menangani seluruh kondisi khusus.',
          skor3: 'Diagram alir jelas dengan simbol standar tepat, logika benar dengan sedikit kekurangan pada kondisi minor.',
          skor2: 'Diagram alir memuat beberapa kesalahan simbol atau alur percabangan membingungkan.',
          skor1: 'Diagram alir tidak menggunakan simbol standar dan alur logika terputus atau salah total.'
        },
        {
          pertemuanKe: 3,
          kriteria: 'Pertemuan 3: Pengujian Kasus (Testing/Dry-run) & Presentasi Kelompok',
          indikator: 'Kemampuan simulasi penelusuran algoritma (dry-run), evaluasi kasus ekstrem, dan komunikasi hasil.',
          skor4: 'Uji coba dry-run mendalam (kasus normal & ekstrem), evaluasi efisiensi sangat kritis, serta presentasi sangat lugas & komunikatif.',
          skor3: 'Uji coba dry-run berjalan baik pada kasus normal, evaluasi logis, dan presentasi disampaikan secara jelas.',
          skor2: 'Uji coba hanya pada kasus sederhana dan presentasi kurang percaya diri/kurang terstruktur.',
          skor1: 'Tidak melakukan uji coba algoritma dan tidak mampu mempresentasikan hasil karya kelompok.'
        }
      ]
    },
    bagianB_Sumatif: {
      judul: 'BAGIAN B: RUBRIK ASESMEN SUMATIF (PG KOMPLEKS 40% & ESSAY HOTS 60%)',
      deskripsi: 'Pedoman penskoran tes sumatif analisis studi kasus penalaran komputasional (Total 100 Poin).',
      rubrikSoalList: [
        {
          no: 1,
          judulSoal: 'Soal 1: Logika Percabangan Diskon & Bebas Ongkir (Flowchart/Pseudocode)',
          soalDeskripsi: 'Analisis dan perancangan algoritma keputusan belanja diskon 15% (> Rp 500.000) dan bebas ongkir untuk Member Premium.',
          bobotMaks: 30,
          aspekList: [
            {
              aspek: 'Identifikasi Parameter Input & Kondisi Logika',
              skorMaks: 10,
              deskripsi: 'Ketepatan variabel totalBelanja, isMember, dan percabangan IF-ELSE.',
              kriteriaSkor: {
                skor4: 'Sangat tepat mendefinisikan seluruh variabel dan kondisi relasional (9-10 poin).',
                skor3: 'Variabel dan kondisi didefinisikan dengan baik (7-8 poin).',
                skor2: 'Terdapat kekeliruan dalam logika kondisi relasional (4-6 poin).',
                skor1: 'Salah menentukan input dan kondisi logika (1-3 poin).'
              }
            },
            {
              aspek: 'Kebenaran Konstruksi Pseudocode & Flowchart',
              skorMaks: 15,
              deskripsi: 'Ketepatan simbol diagram alir, sintaks pseudocode, dan alur eksekusi.',
              kriteriaSkor: {
                skor4: 'Pseudocode dan flowchart 100% valid, runtut, dan menggunakan simbol standar ISO (13-15 poin).',
                skor3: 'Konstruksi benar dengan sedikit kekurangan minor pada estetika simbol (10-12 poin).',
                skor2: 'Bagan alir memiliki cabang logika menggantung atau simbol keliru (6-9 poin).',
                skor1: 'Bagan alir salah dan tidak dapat dijalankan (1-5 poin).'
              }
            },
            {
              aspek: 'Ketepatan Formula Perhitungan Total Bayar',
              skorMaks: 5,
              deskripsi: 'Formula matematika diskon dan akumulasi ongkir.',
              kriteriaSkor: {
                skor4: 'Formula akumulasi total bayar 100% tepat untuk seluruh kombinasi kasus (5 poin).',
                skor3: 'Formula tepat namun ada kekeliruan kecil pada format output (4 poin).',
                skor2: 'Formula diskon atau ongkir salah diterapkan (2-3 poin).',
                skor1: 'Formula perhitungan keliru total (1 poin).'
              }
            }
          ]
        },
        {
          no: 2,
          judulSoal: 'Soal 2: Analisis Efisiensi Algoritma & Struktur Data',
          soalDeskripsi: 'Penjelasan konsep efisiensi waktu & memori serta dampak pemilihan struktur data terhadap kinerja sistem komputasi.',
          bobotMaks: 30,
          aspekList: [
            {
              aspek: 'Pemahaman Konsep Efisiensi Waktu & Memori',
              skorMaks: 12,
              deskripsi: 'Kedalaman penjelasan kompleksitas komputasi dan optimasi sumber daya.',
              kriteriaSkor: {
                skor4: 'Menjelaskan konsep efisiensi komputasi, waktu eksekusi, dan alokasi memori secara mendalam & analitis (11-12 poin).',
                skor3: 'Menjelaskan konsep efisiensi waktu dan memori secara umum dengan baik (9-10 poin).',
                skor2: 'Penjelasan hanya menyentuh definisi dangkal tanpa argumentasi ilmiah (5-8 poin).',
                skor1: 'Penjelasan keliru atau tidak menjawab substansi soal (1-4 poin).'
              }
            },
            {
              aspek: 'Korelasi Struktur Data dengan Kinerja Algoritma',
              skorMaks: 12,
              deskripsi: 'Analisis perbandingan struktur data (Array, List, Queue, Stack) terhadap kecepatan pencarian & pengurutan.',
              kriteriaSkor: {
                skor4: 'Menganalisis hubungan struktur data terhadap kecepatan akses/pencarian dengan sangat tajam dan tepat (11-12 poin).',
                skor3: 'Menyebutkan pengaruh struktur data terhadap performa dengan cukup baik (9-10 poin).',
                skor2: 'Hanya menyebutkan nama struktur data tanpa menghubungkan ke kinerja sistem (5-8 poin).',
                skor1: 'Tidak memahami korelasi antara struktur data dan performa algoritma (1-4 poin).'
              }
            },
            {
              aspek: 'Relevansi Contoh Kasus Nyata',
              skorMaks: 6,
              deskripsi: 'Pemberian contoh kasus riil sistem informasi kontekstual.',
              kriteriaSkor: {
                skor4: 'Memberikan contoh kasus riil yang sangat relevan, terstruktur, dan kontekstual (6 poin).',
                skor3: 'Memberikan contoh kasus yang cukup relevan (4-5 poin).',
                skor2: 'Contoh kasus kurang relevan dengan materi efisiensi (2-3 poin).',
                skor1: 'Tidak menyertakan contoh kasus riil (1 poin).'
              }
            }
          ]
        }
      ]
    },
    bagianC_Moodle: {
      judul: 'BAGIAN C: RUBRIK PARTISIPASI LMS MOODLE & MODUL H5P',
      deskripsi: 'Pedoman evaluasi partisipasi asinkron, pengerjaan modul H5P, dan kuis Moodle (Skala 0 - 100).',
      aktivitasList: [
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
          aspek: 'Penyelesaian Modul H5P Interaktif (Drag & Drop dan Fill-in-the-Blanks)',
          bobotMaks: 100,
          deskripsi: 'Ketuntasan pengerjaan aktivitas interaktif H5P di LMS Moodle dengan skor validasi maksimal.',
          skor4: 'Menuntaskan seluruh simulasi H5P dengan nilai 100% pada percobaan pertama/kedua (Skor: 86-100).',
          skor3: 'Menuntaskan simulasi H5P dengan nilai 75-85% (Skor: 75-85).',
          skor2: 'Mengerjakan sebagian simulasi H5P dengan nilai 60-74% (Skor: 60-74).',
          skor1: 'Tidak menyelesaikan modul interaktif H5P (Skor: <60).'
        },
        {
          aspek: 'Ketepatan Submission Tugas & Kuis Evaluasi Moodle',
          bobotMaks: 100,
          deskripsi: 'Disiplin batas waktu pengumpulan berkas PDF dan pencapaian skor kuis online.',
          skor4: 'Seluruh berkas LKPD P1-P3 diunggah tepat waktu dengan format sesuai instruksi, dan skor kuis Moodle >= 85 (Skor: 86-100).',
          skor3: 'Tugas diunggah tepat waktu dan menyelesaikan kuis Moodle dengan skor KKTP 75-84 (Skor: 75-85).',
          skor2: 'Terlambat mengumpulkan tugas (H+1 sampai H+2) atau nilai kuis Moodle 60-74 (Skor: 60-74).',
          skor1: 'Tidak mengumpulkan tugas submission atau tidak mengerjakan kuis evaluasi online (Skor: <60).'
        }
      ]
    },
    bagianD_Formula: {
      judul: 'BAGIAN D: FORMULA KALKULASI NILAI AKHIR (NA) & KRITERIA KKTP',
      rumusNA: 'Nilai Akhir (NA) = (Skor Formatif [H5P & LKPD] × 30%) + (Skor PG Kompleks [40%] + Skor Essay HOTS [60%] × 70%)',
      penjelasanBobot: [
        {
          komponen: '1. Asesmen Formatif (H5P Moodle & Observasi LKPD)',
          bobotPersen: 30,
          keterangan: 'Mengukur proses interaktif modul H5P dan unjuk kerja kelompok LKPD P1, P2, P3.'
        },
        {
          komponen: '2. Asesmen Sumatif PG Kompleks (5 Butir Soal)',
          bobotPersen: 28,
          keterangan: 'Mewakili 40% dari porsi Asesmen Sumatif (40% × 70% = 28% dari NA).'
        },
        {
          komponen: '3. Asesmen Sumatif Essay HOTS (2 Kasus Komputasi)',
          bobotPersen: 42,
          keterangan: 'Mewakili 60% dari porsi Asesmen Sumatif (60% × 70% = 42% dari NA).'
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
    },
    footer: 'CopyRight©Norbertus Suryadi — SMA Xaverius 1 Palembang | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning'
  }
};

export const samplePresets = [
  {
    label: 'Informatika - Elemen AP [Mode Koding] (1 Pertemuan, 2 × 40 menit)',
    identitas: {
      ...defaultIdentitas,
      mataPelajaran: 'Informatika',
      elemenKsp: 'AP (Algoritma dan Pemrograman)',
      topik: 'Berpikir Kritis & Algoritma Pemrograman (Pseudocode & Trace Table)',
      jumlahPertemuan: '1',
      alokasiWaktu: '2 × 40 menit'
    }
  },
  {
    label: 'Informatika - Elemen JKI / TIK [Mode Non-Koding] (2 Pertemuan, 2 × 40 menit)',
    identitas: {
      ...defaultIdentitas,
      mataPelajaran: 'Informatika',
      elemenKsp: 'JKI (Jaringan Komputer dan Internet)',
      kelas: 'Kelas X / Fase E',
      topik: 'Topologi Jaringan Komputer, Protokol Routing & Keamanan Siber',
      jumlahPertemuan: '2',
      alokasiWaktu: '2 × 40 menit',
      cp: 'Peserta didik memahami arsitektur jaringan komputer lokal dan internet, komponen perangkat keras jaringan, serta mekanisme pertukaran data secara aman.',
      modelPembelajaran: 'Problem Based Learning & Deep Learning'
    }
  },
  {
    label: 'Bahasa Indonesia [Mode Non-Koding] (2 Pertemuan, 3 × 40 menit)',
    identitas: {
      ...defaultIdentitas,
      mataPelajaran: 'Bahasa Indonesia',
      elemenKsp: 'Menyimak dan Membaca Teks',
      kelas: 'Kelas X / Fase E',
      topik: 'Menulis Teks Laporan Hasil Observasi (LHO) yang Objektif',
      jumlahPertemuan: '2',
      alokasiWaktu: '3 × 40 menit',
      cp: 'Peserta didik mampu menulis gagasan, pikiran, pandangan, atau pesan tertulis untuk berbagai tujuan secara logis, kritis, dan kreatif dalam bentuk teks Laporan Hasil Observasi.',
      modelPembelajaran: 'Project Based Learning (PjBL)'
    }
  },
  {
    label: 'Biologi / Sains [Mode Non-Koding] (2 Pertemuan, 2 × 40 menit)',
    identitas: {
      ...defaultIdentitas,
      mataPelajaran: 'Biologi',
      elemenKsp: 'Pemahaman Sains & Keterampilan Proses',
      kelas: 'Kelas X / Fase E',
      topik: 'Interaksi Komponen Ekosistem & Analisis Rantai Makanan',
      jumlahPertemuan: '2',
      alokasiWaktu: '2 × 40 menit',
      cp: 'Peserta didik mampu menganalisis keterkaitan antara komponen biotik dan abiotik dalam ekosistem serta dampaknya terhadap keseimbangan lingkungan.',
      modelPembelajaran: 'Inquiry Based Learning & Deep Learning'
    }
  },
  {
    label: 'Matematika [Mode Non-Koding] (3 Pertemuan, 2 × 40 menit)',
    identitas: {
      ...defaultIdentitas,
      mataPelajaran: 'Matematika',
      elemenKsp: 'Bilangan dan Aljabar',
      kelas: 'Kelas X / Fase E',
      topik: 'Penerapan Fungsi Eksponen pada Pertumbuhan & Peluruhan',
      jumlahPertemuan: '3',
      alokasiWaktu: '2 × 40 menit',
      cp: 'Peserta didik dapat menggeneralisasi sifat-sifat operasi bilangan berpangkat dan menggunakan fungsi eksponensial dalam memodelkan fenomena pertumbuhan dan peluruhan.',
      modelPembelajaran: 'Problem Based Learning & Pembelajaran Mendalam'
    }
  }
];
