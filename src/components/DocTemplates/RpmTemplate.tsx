import React from 'react';
import { RpmDoc, IdentitasRPM, AtpItem, RingkasanMateriItem } from '../../types';
import { DocumentHeader } from '../DocumentHeader';
import { renderTextValue, cleanDuplicateNotasiHeader, getMeetingStepTimes } from '../../utils/formatUtils';
import { generateDefaultAtpItems, generateDefaultMateriItems, calculateMeetingAllocations } from '../../services/rpmService';
import { isInformatikaSubject, formatCleanKelasFaseSemester } from '../../services/rpmPrompt';

interface Props {
  data: RpmDoc;
  id: string;
  identitas?: IdentitasRPM;
}

export const RenderPertemuanBlock: React.FC<{
  data: any;
  index: number;
  identitas: IdentitasRPM;
  dynamicAlloc: string;
}> = ({ data: p, index, identitas: currIdentitas, dynamicAlloc }) => {
  const pNum = p.pertemuanKe || index + 1;
  const subTopik = p.subTopik || p.topik || currIdentitas.topik;
  const model = p.praktikPedagogis || currIdentitas.modelPembelajaran || 'Problem Based Learning (PBL)';

  // Calculate strict step time allocations for this specific meeting
  const numPertemuan = Math.max(1, parseInt(String(currIdentitas.jumlahPertemuan || '2'), 10) || 2);
  const allocations = calculateMeetingAllocations(currIdentitas.alokasiWaktu, numPertemuan);
  const alloc = allocations[index] || allocations[0] || {
    meetingJp: dynamicAlloc.includes('1 JP') ? 1 : 2,
    minsPerJp: currIdentitas.alokasiWaktu?.includes('40') || dynamicAlloc.includes('40') ? 40 : 45,
    meetingMinutes: dynamicAlloc.includes('40') ? 40 : dynamicAlloc.includes('45') ? 45 : dynamicAlloc.includes('80') ? 80 : 90,
    displayString: dynamicAlloc || '2 JP (90 Menit)',
  };
  const stepTimes = getMeetingStepTimes(alloc.meetingJp, alloc.minsPerJp, alloc.meetingMinutes);

  // Process Langkah / Kegiatan Pembelajaran
  let steps: any[] = [];
  if (Array.isArray(p.langkah) && p.langkah.length > 0) {
    steps = p.langkah;
  } else if (p.kegiatanPembelajaran && typeof p.kegiatanPembelajaran === 'object') {
    const rawAwal = p.kegiatanPembelajaran.kegiatanAwal;
    const rawInti = p.kegiatanPembelajaran.kegiatanInti;
    const rawPenutup = p.kegiatanPembelajaran.kegiatanPenutup;

    const formatAct = (act: any) => {
      if (Array.isArray(act)) return act.join('\n');
      if (typeof act === 'string') return act;
      return JSON.stringify(act);
    };

    steps = [
      {
        tahap: 'KEGIATAN AWAL (Pendahuluan)',
        alokasiWaktu: stepTimes.pendahuluan,
        aktivitasGuru: formatAct(rawAwal) || 'Guru menyapa peserta didik, memimpin doa, memeriksa kehadiran, dan menyampaikan apersepsi serta pertanyaan pemantik.',
        aktivitasSiswa: 'Peserta didik berdoa, merapikan meja diskusi, mengamati stimulus visual, dan merespons pertanyaan pemantik guru.',
        prinsipPembelajaran: 'Berkesadaran & Bermakna',
      },
      {
        tahap: 'KEGIATAN INTI - Orientasi Masalah & Penyelidikan Kelompok (PBL)',
        alokasiWaktu: stepTimes.inti,
        aktivitasGuru: formatAct(rawInti) || (isInformatikaSubject(currIdentitas.mataPelajaran)
          ? 'Guru menyajikan stimulus studi kasus, membimbing penyelidikan kelompok dengan LKPD, memfasilitasi perancangan solusi, dan mengarahkan sesi presentasi.'
          : 'Guru menyajikan stimulus studi kasus, membimbing penyelidikan kelompok dengan LKPD, memfasilitasi eksplorasi struktur wacana dan gagasan kontekstual, serta mengarahkan presentasi.'),
        aktivitasSiswa: isInformatikaSubject(currIdentitas.mataPelajaran)
          ? 'Peserta didik berkolaborasi dalam kelompok, menganalisis studi kasus kontekstual, merancang solusi komputasional terstruktur, dan mempresentasikan hasil kerja.'
          : 'Peserta didik berkolaborasi dalam kelompok, mengidentifikasi variabel masalah, menganalisis struktur wacana, merumuskan gagasan, dan menyusun karya terstruktur, serta mempresentasikan hasil karya di hadapan kelas.',
        prinsipPembelajaran: 'Memahami & Mengaplikasi',
      },
      {
        tahap: 'KEGIATAN PENUTUP',
        alokasiWaktu: stepTimes.penutup,
        aktivitasGuru: formatAct(rawPenutup) || 'Guru bersama siswa menyimpulkan materi, memandu refleksi metakognitif, mengarahkan pengunggahan tugas di Moodle LMS, dan menutup dengan doa.',
        aktivitasSiswa: 'Peserta didik merumuskan kesimpulan pembelajaran, mengisi lembar refleksi diri, mengunggah LKPD ke Moodle LMS, dan berdoa bersama.',
        prinsipPembelajaran: 'Refleksi Diri',
      },
    ];
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm break-inside-avoid page-break-inside-avoid">
      {/* Meeting Header Banner */}
      <div className="bg-blue-900 text-white p-2.5 px-3 flex flex-wrap justify-between items-center gap-2">
        <h4 className="font-bold text-sm tracking-wide uppercase">
          PERTEMUAN {pNum}
        </h4>
        <span className="text-xs bg-blue-800 px-2.5 py-0.5 rounded font-medium border border-blue-700">
          Alokasi Waktu: {dynamicAlloc}
        </span>
      </div>

      {/* Meeting Metadata */}
      <div className="bg-gray-50/80 p-2.5 border-b border-gray-300 text-xs space-y-1.5">
        <p><strong className="text-gray-900">Sub-Topik Pembelajaran:</strong> <span className="text-gray-900 font-semibold">{subTopik}</span></p>
        <p><strong className="text-gray-900">Praktik Pedagogis / Model:</strong> <span className="text-blue-900 font-semibold">{model}</span></p>
        {p.lkpdFocus && (
          <p className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-medium">
            🎯 <strong>Fokus LKPD:</strong> {renderTextValue(p.lkpdFocus)}
          </p>
        )}
      </div>

      {/* Indikator ATP Pertemuan (Jika Ada) */}
      {p.indikatorATP && (
        <div className="bg-emerald-50/50 p-3 border-b border-gray-300 text-xs space-y-1">
          <h5 className="font-bold text-emerald-950 uppercase tracking-wide text-2xs flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Indikator Ketercapaian ATP Pertemuan {pNum}:
          </h5>
          <div className="space-y-1 text-slate-800">
            {Array.isArray(p.indikatorATP) ? (
              p.indikatorATP.map((ind: string, indIdx: number) => (
                <div key={indIdx} className="flex items-start gap-1.5 text-xs">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{renderTextValue(ind)}</span>
                </div>
              ))
            ) : (
              <p>{renderTextValue(p.indikatorATP)}</p>
            )}
          </div>
        </div>
      )}

      {/* Bahan Ajar Objek Baru (konsepUtama, studiKasus, rangkumanTeori, contohNotasi) */}
      {p.bahanAjar && typeof p.bahanAjar === 'object' && !Array.isArray(p.bahanAjar) && (
        <div className="bg-slate-50 p-3.5 border-b border-gray-300 text-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h5 className="font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
              Bahan Ajar Eksploratif Pertemuan {pNum}
            </h5>
            <span className="text-3xs text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              Konsep Inti & Kasus Otentik
            </span>
          </div>

          {p.bahanAjar.konsepUtama && (
            <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
              <strong className="text-blue-900 block text-xs">📌 Konsep & Teori Utama:</strong>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line text-justify">{renderTextValue(p.bahanAjar.konsepUtama)}</p>
            </div>
          )}

          {p.bahanAjar.rangkumanTeori && (
            <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
              <strong className="text-slate-900 block text-xs">📖 Rangkuman Teori:</strong>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line text-justify">{renderTextValue(p.bahanAjar.rangkumanTeori)}</p>
            </div>
          )}

          {p.bahanAjar.studiKasus && (
            <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200 space-y-1">
              <strong className="text-amber-950 block text-xs">💼 Studi Kasus Kontekstual (Deep Learning):</strong>
              <p className="text-slate-900 leading-relaxed whitespace-pre-line text-justify">{renderTextValue(p.bahanAjar.studiKasus)}</p>
            </div>
          )}

          {p.bahanAjar.contohNotasi && (
            <div className="bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-2xs space-y-1 overflow-x-auto">
              <strong className="text-emerald-400 block font-sans text-xs">
                {isInformatikaSubject(currIdentitas.mataPelajaran)
                  ? '💻 Notasi Logika, Algoritma & Pseudocode:'
                  : '📌 Kerangka Konsep & Alur Analisis:'}
              </strong>
              <pre className="whitespace-pre-wrap">{cleanDuplicateNotasiHeader(renderTextValue(p.bahanAjar.contohNotasi))}</pre>
            </div>
          )}
        </div>
      )}

      {/* Materi Pembelajaran Poin A-F (Jika Format Array) */}
      {p.materiPembelajaran && Array.isArray(p.materiPembelajaran) && p.materiPembelajaran.length > 0 && (
        <div className="bg-blue-50/70 p-3.5 border-b border-gray-300 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-blue-200 pb-1.5">
            <h5 className="font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
              Uraian Sub-Materi & Bahan Ajar Pertemuan {pNum} (Poin A — F)
            </h5>
            <span className="text-3xs text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded font-semibold border border-blue-200 self-start sm:self-auto">
              Bahan Ajar Lengkap Siswa & Guru
            </span>
          </div>

          <div className="space-y-2.5">
            {p.materiPembelajaran.map((m: any, mIdx: number) => {
              const abjad = typeof m === 'object' && m.abjad ? m.abjad : String.fromCharCode(65 + mIdx);
              const judul = typeof m === 'object' ? (m.judul || m.subJudul || '') : '';
              const deskripsi = typeof m === 'object' ? (m.deskripsi || m.isi || '') : String(m);

              return (
                <div
                  key={mIdx}
                  className="bg-white p-3 rounded-md border border-blue-200/80 shadow-2xs space-y-1.5 transition-colors hover:border-blue-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-3xs shrink-0">
                      {abjad}
                    </span>
                    <h6 className="font-bold text-blue-950 text-xs">
                      {judul || `Sub-Materi ${abjad}`}
                    </h6>
                  </div>
                  <div className="text-gray-800 text-xs leading-relaxed text-justify whitespace-pre-line pl-7">
                    {deskripsi}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Meeting Steps Table */}
      {steps.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border-t border-gray-300">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="border border-gray-300 p-2.5 text-left w-[20%] font-bold">Tahap Kegiatan</th>
                <th className="border border-gray-300 p-2.5 text-left w-[65%] font-bold">Deskripsi Aktivitas Guru & Siswa (PBL)</th>
                <th className="border border-gray-300 p-2.5 text-center w-[15%] font-bold">Alokasi Waktu</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((item, idx) => {
                const cleanTahap = (item.tahap || '').replace(/\s*\(\s*\d+\s*(?:x\s*\d+\s*)?Menit\s*\)/gi, '').trim();
                const stepAlloc =
                  idx === 0 || /awal|pendahuluan/i.test(cleanTahap)
                    ? stepTimes.pendahuluan
                    : idx === 1 || /inti/i.test(cleanTahap)
                    ? stepTimes.inti
                    : idx === 2 || /penutup|akhir/i.test(cleanTahap)
                    ? stepTimes.penutup
                    : item.alokasiWaktu || stepTimes.pendahuluan;

                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
                    {/* Kolom 1 (20%) */}
                    <td className="border border-gray-300 p-3 align-top bg-slate-50/60 w-[20%]">
                      <p className="font-bold text-blue-950 mb-2">{cleanTahap}</p>
                      {(item.prinsipPembelajaran || item.elemenDeepLearning) && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-[10px] font-semibold text-gray-500 block uppercase">Prinsip:</span>
                          <span className="text-[11px] font-medium text-sky-700 italic">
                            {item.prinsipPembelajaran || item.elemenDeepLearning}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Kolom 2 (65%) */}
                    <td className="border border-gray-300 p-3 align-top w-[65%] space-y-3">
                      <div>
                        <h6 className="font-bold text-blue-900 mb-1 text-[11px] uppercase tracking-wide">
                          Aktivitas Guru (Pendidik):
                        </h6>
                        <div className="whitespace-pre-line text-gray-800 leading-relaxed text-xs">
                          {item.aktivitasGuru}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200/80">
                        <h6 className="font-bold text-emerald-800 mb-1 text-[11px] uppercase tracking-wide">
                          Aktivitas Siswa (Peserta Didik):
                        </h6>
                        <div className="whitespace-pre-line text-gray-800 leading-relaxed text-xs">
                          {item.aktivitasSiswa}
                        </div>
                      </div>
                    </td>

                    {/* Kolom 3 (15%) */}
                    <td className="border border-gray-300 p-3 text-center align-top font-bold text-gray-900 w-[15%]">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs border border-gray-200 font-semibold text-blue-950">
                        {stepAlloc}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const RpmTemplate: React.FC<Props> = ({ data, id, identitas }) => {
  const currIdentitas = data.identitas || identitas || {};
  const guruMapel =
    currIdentitas.guruMapel ||
    currIdentitas.namaGuru ||
    currIdentitas.guru ||
    'Norbertus Suryadi, S.Kom.';

  const targetDimensi = (data as any).targetDimensi || 'Penalaran Kritis, Gotong Royong, & Kemandirian';
  const kemitraanBelajar = (data as any).kemitraanBelajar || 'Kolaborasi Orang Tua (pendampingan belajar) & Narasumber Praktisi/Komunitas';
  const lingkunganBelajar = (data as any).lingkunganBelajar || 'Ruang kelas fisik yang kondusif & Lingkungan Digital (LMS Moodle)';
  const refleksiSiswa = (data as any).refleksiSiswa || [
    'Apa konsep/materi yang paling menarik dan menantang bagi saya hari ini?',
    'Bagaimana saya akan menerapkan pengetahuan ini dalam kehidupan nyata?',
    'Strategi belajar apa yang paling efektif membantu pemahaman saya?'
  ];

  const numPertemuan = Math.max(1, parseInt(String(currIdentitas.jumlahPertemuan || '2'), 10) || 2);
  const meetingAllocations = calculateMeetingAllocations(currIdentitas.alokasiWaktu, numPertemuan);

  // Pastikan daftar ATP selalu sinkron dengan jumlahPertemuan & alokasiWaktu form user
  const atpList: AtpItem[] =
    Array.isArray(data.alurTujuanPembelajaran) && data.alurTujuanPembelajaran.length === numPertemuan
      ? data.alurTujuanPembelajaran
      : generateDefaultAtpItems(currIdentitas);

  // Pastikan daftar Ringkasan Materi selalu lengkap dan terstruktur sesuai jumlahPertemuan
  const materiList: RingkasanMateriItem[] =
    Array.isArray(data.ringkasanMateri) && data.ringkasanMateri.length === numPertemuan
      ? data.ringkasanMateri
      : generateDefaultMateriItems(currIdentitas);

  return (
    <div
      id={id || 'document-preview-container'}
      data-doc-container="rpm"
      className="bg-white p-8 md:p-12 text-gray-900 font-sans shadow-sm rounded-lg border border-gray-200 max-w-4xl mx-auto print:shadow-none print:p-0 print:border-none document-preview-container"
      style={{ minHeight: '1000px' }}
    >
      {/* Header Kop Standardized */}
      <DocumentHeader
        documentType="rpm"
        schoolName={currIdentitas.sekolah}
        topic={currIdentitas.topik}
        logo={currIdentitas.logo}
      />

      {/* Tabel Identitas Dokumen */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-xs md:text-sm border-collapse border border-gray-300">
          <tbody>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2 font-semibold w-1/4">Sekolah</td>
              <td className="border border-gray-300 p-2 w-1/4 font-medium text-slate-900">{currIdentitas.sekolah || 'SMA Xaverius 1 Palembang'}</td>
              <td className="border border-gray-300 p-2 font-semibold w-1/4">Mata Pelajaran</td>
              <td className="border border-gray-300 p-2 w-1/4 font-medium text-slate-900">{currIdentitas.mataPelajaran || '-'}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-semibold bg-blue-50/40 text-blue-950">Guru Mapel</td>
              <td className="border border-gray-300 p-2 font-semibold text-slate-900 bg-blue-50/20">{guruMapel}</td>
              <td className="border border-gray-300 p-2 font-semibold">Kelas / Fase</td>
              <td className="border border-gray-300 p-2 font-medium text-slate-900">
                {formatCleanKelasFaseSemester(currIdentitas.kelas, currIdentitas.semester)}
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2 font-semibold">Topik Pembelajaran</td>
              <td className="border border-gray-300 p-2 font-medium text-slate-900" colSpan={3}>
                {currIdentitas.topik || '-'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-semibold">Alokasi Waktu</td>
              <td className="border border-gray-300 p-2 font-medium text-slate-900">{currIdentitas.alokasiWaktu || '-'}</td>
              <td className="border border-gray-300 p-2 font-semibold">Model Pembelajaran</td>
              <td className="border border-gray-300 p-2 font-medium text-slate-900">{currIdentitas.modelPembelajaran || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Capaian, ATP, dan Tujuan Pembelajaran */}
      <div className="space-y-6 text-sm">
        {/* A. Capaian Pembelajaran */}
        <section className="break-inside-avoid page-break-inside-avoid">
          <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-2 py-0.5 text-base bg-blue-50/50 mb-2">
            A. Capaian Pembelajaran (CP) & Dimensi Profil Lulusan
          </h3>
          <div className="space-y-2 bg-gray-50/80 p-3 rounded border border-gray-200">
            <p className="text-gray-800 leading-relaxed">
              <strong>Capaian Pembelajaran (Fase):</strong> {renderTextValue(data.capaianPembelajaran)}
            </p>
            <p className="text-gray-800 leading-relaxed text-xs border-t border-gray-200 pt-2">
              <strong className="text-blue-900">Target Dimensi Profil Lulusan:</strong> {renderTextValue(targetDimensi)}
            </p>
          </div>
        </section>

        {/* B. TABEL ALUR TUJUAN PEMBELAJARAN (ATP) */}
        <section className="break-inside-avoid page-break-inside-avoid">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 border-l-4 border-emerald-600 pl-2 py-0.5 text-base bg-emerald-50/70">
              B. Alur Tujuan Pembelajaran (ATP) Berjenjang
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded font-semibold border border-emerald-300">
              Sinkronisasi Lintas Dokumen
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-gray-300 shadow-2xs">
              <thead>
                <tr className="bg-slate-800 text-white font-semibold print:bg-slate-800 print:text-white">
                  <th className="border border-gray-400 p-2 text-center w-16">Kode TP</th>
                  <th className="border border-gray-400 p-2 text-left w-2/5">Tujuan Pembelajaran (TP)</th>
                  <th className="border border-gray-400 p-2 text-left w-1/3">Indikator Ketercapaian (IKTP)</th>
                  <th className="border border-gray-400 p-2 text-center w-20">Alokasi Waktu</th>
                  <th className="border border-gray-400 p-2 text-center w-40 min-w-[150px]">Pertemuan Ke-</th>
                </tr>
              </thead>
              <tbody>
                {atpList.map((atp, idx) => {
                  const iktpItems = Array.isArray(atp.indikatorKetercapaian)
                    ? atp.indikatorKetercapaian
                    : [String(atp.indikatorKetercapaian)];

                  return (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70 hover:bg-emerald-50/30 transition-colors'}
                    >
                      {/* Kolom 1: Kode TP */}
                      <td className="border border-gray-300 p-2.5 font-bold text-center text-slate-900 align-top bg-slate-100/60">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-700 text-white font-bold text-2xs tracking-wide">
                          {atp.kodeTp}
                        </span>
                      </td>

                      {/* Kolom 2: Tujuan Pembelajaran (TP) & Fokus */}
                      <td className="border border-gray-300 p-2.5 align-top space-y-1.5 leading-relaxed">
                        <p className="text-gray-900 font-medium">{renderTextValue(atp.tujuanPembelajaran)}</p>
                        {atp.fokusMateri && (
                          <div className="text-3xs inline-block bg-emerald-50 text-emerald-900 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                            🎯 Fokus: {atp.fokusMateri}
                          </div>
                        )}
                      </td>

                      {/* Kolom 3: Indikator Ketercapaian TP (IKTP) */}
                      <td className="border border-gray-300 p-2.5 align-top leading-relaxed">
                        <div className="space-y-1 text-gray-800">
                          {iktpItems.map((ik, ikIdx) => (
                            <div key={ikIdx} className="flex items-start gap-1 text-3xs">
                              <span className="text-emerald-700 font-bold">•</span>
                              <span>{renderTextValue(ik)}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Kolom 4: Alokasi Waktu (JP) */}
                      <td className="border border-gray-300 p-2.5 text-center font-semibold text-slate-800 align-top text-3xs">
                        <div className="bg-slate-100 py-1 px-1 rounded border border-slate-200">
                          {atp.alokasiWaktuJp || `${currIdentitas.alokasiWaktu || '2 JP'}`}
                        </div>
                      </td>

                      {/* Kolom 5: Pertemuan Ke- & Korelasi */}
                      <td className="border border-gray-300 p-2.5 text-center align-top space-y-1 w-40 min-w-[150px]">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-3xs border border-blue-200">
                          Sesi {atp.pertemuanKe}
                        </span>
                        {atp.korelasiDokumen && (
                          <div className="h-auto w-full p-2 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-1 text-left">
                            {atp.korelasiDokumen.lkpd && (
                              <div
                                className="flex items-start gap-1.5 text-[11px] leading-tight text-slate-700 whitespace-normal break-words"
                                title={atp.korelasiDokumen.lkpd}
                              >
                                <span className="shrink-0">📄</span>
                                <span>{atp.korelasiDokumen.lkpd}</span>
                              </div>
                            )}
                            {atp.korelasiDokumen.moodle && (
                              <div
                                className="flex items-start gap-1.5 text-[11px] leading-tight text-slate-700 whitespace-normal break-words"
                                title={atp.korelasiDokumen.moodle}
                              >
                                <span className="shrink-0">🌐</span>
                                <span>{atp.korelasiDokumen.moodle}</span>
                              </div>
                            )}
                            {atp.korelasiDokumen.asesmen && (
                              <div
                                className="flex items-start gap-1.5 text-[11px] leading-tight text-slate-700 whitespace-normal break-words"
                                title={atp.korelasiDokumen.asesmen}
                              >
                                <span className="shrink-0">📊</span>
                                <span>{atp.korelasiDokumen.asesmen}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* C. MATERI PELAJARAN & BAHAN AJAR LENGKAP */}
        <section className="break-inside-avoid page-break-inside-avoid space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 border-l-4 border-emerald-600 pl-2 py-0.5 text-base bg-emerald-50/70">
              C. Materi Pelajaran & Bahan Ajar Lengkap
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-semibold border border-emerald-300">
              Konsep Utama, Definisi Operasional & Studi Kasus Mendalam
            </span>
          </div>

          <div className="space-y-4">
            {materiList.map((mat, mIdx) => (
              <div
                key={mIdx}
                className="bg-slate-50 border border-slate-200 border-l-4 border-l-emerald-600 rounded-md p-4 space-y-3 shadow-2xs break-inside-avoid page-break-inside-avoid"
              >
                {/* Header Materi Sesi */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-700 text-white text-2xs font-bold px-2 py-0.5 rounded shadow-2xs">
                      Pertemuan {mat.pertemuanKe}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {mat.topikMateri}
                    </h4>
                  </div>
                  {mat.studiKasusKontekstual && (
                    <span className="text-3xs text-emerald-950 font-semibold bg-emerald-100/90 px-2.5 py-1 rounded border border-emerald-300 self-start sm:self-auto">
                      💼 Kasus Kontekstual: {mat.studiKasusKontekstual}
                    </span>
                  )}
                </div>

                {/* Uraian Teori Lengkap */}
                <div className="text-xs text-slate-800 leading-relaxed font-normal text-justify space-y-2 whitespace-pre-line">
                  {renderTextValue(mat.rangkumanTeori)}
                </div>

                {/* Poin Konsep Kunci & Definisi Operasional */}
                {mat.konsepKunci && mat.konsepKunci.length > 0 && (
                  <div className="space-y-1.5 bg-white p-3 rounded-md border border-slate-200 text-xs shadow-xs">
                    <strong className="text-emerald-950 block text-3xs uppercase tracking-wider font-bold">
                      🔑 Konsep Utama & Definisi Operasional:
                    </strong>
                    <ul className="space-y-1.5 text-slate-800 text-3xs sm:text-xs">
                      {mat.konsepKunci.map((kk, kIdx) => (
                        <li key={kIdx} className="flex items-start gap-2 leading-relaxed text-justify">
                          <span className="text-emerald-600 font-bold mt-0.5">•</span>
                          <span>{renderTextValue(kk)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contoh Notasi / Pseudocode / Diagram / Kerangka Konsep */}
                {mat.contohNotasi && (
                  <div className="space-y-1.5">
                    <strong className="text-slate-700 block text-3xs uppercase tracking-wider font-bold">
                      {isInformatikaSubject(currIdentitas.mataPelajaran)
                        ? '💻 Notasi Logika, Algoritma & Pseudocode:'
                        : '📌 Kerangka Konsep & Alur Analisis:'}
                    </strong>
                    <pre className="bg-slate-900 text-emerald-300 p-3 rounded-md text-3xs font-mono overflow-x-auto leading-relaxed border border-slate-800 whitespace-pre-wrap">
                      {cleanDuplicateNotasiHeader(renderTextValue(mat.contohNotasi))}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* D. Rincian Tujuan Pembelajaran (TP) */}
        <section className="break-inside-avoid page-break-inside-avoid">
          <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-2 py-0.5 text-base bg-blue-50/50 mb-2.5">
            D. Rincian Tujuan Pembelajaran (TP)
          </h3>
          <div className="pl-2 text-gray-800 space-y-2">
            {data.tujuanPembelajaran.map((tp, idx) => (
              <div key={idx} className="flex items-start gap-2.5 leading-relaxed text-justify">
                <span className="font-bold text-blue-700 mt-0.5">{idx + 1}.</span>
                <span className="flex-1">{renderTextValue(tp)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* E. Kerangka Desain Pembelajaran Mendalam */}
        <section className="break-inside-avoid page-break-inside-avoid">
          <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-2 py-0.5 text-base bg-blue-50/50 mb-2">
            E. Kerangka Desain Pembelajaran Mendalam
          </h3>
          <div className="space-y-2.5 pl-2">
            <p>
              <strong className="text-gray-900">Pemahaman Bermakna:</strong>{' '}
              <span className="text-gray-800">{renderTextValue(data.pemahamanBermakna)}</span>
            </p>
            <div>
              <strong className="text-gray-900">Pertanyaan Pemantik:</strong>
              <div className="mt-1 space-y-1">
                {data.pertanyaanPemantik.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-800">
                    <span>•</span>
                    <span>{renderTextValue(q)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-blue-50/40 p-2 rounded border border-blue-100">
                <strong className="text-blue-900 block mb-0.5">🤝 Kemitraan Belajar:</strong>
                <span className="text-gray-800">{renderTextValue(kemitraanBelajar)}</span>
              </div>
              <div className="bg-blue-50/40 p-2 rounded border border-blue-100">
                <strong className="text-blue-900 block mb-0.5">🏫 Lingkungan & Digital:</strong>
                <span className="text-gray-800">{renderTextValue(lingkunganBelajar)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* F. Langkah-Langkah Kegiatan Pembelajaran */}
        <section className="space-y-4">
          <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-2 py-0.5 text-base bg-blue-50/50 mb-3 break-inside-avoid page-break-inside-avoid">
            F. Langkah-Langkah Kegiatan Pembelajaran
          </h3>

          {data.pertemuanList && data.pertemuanList.length > 0 ? (
            <div className="space-y-6">
              {data.pertemuanList.map((p, pIdx) => {
                const dynamicAlloc = meetingAllocations[pIdx]?.displayString || p.alokasiWaktu || '2 JP (90 Menit)';
                return (
                  <RenderPertemuanBlock
                    key={p.pertemuanKe || pIdx + 1}
                    data={p}
                    index={pIdx}
                    identitas={currIdentitas}
                    dynamicAlloc={dynamicAlloc}
                  />
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto break-inside-avoid page-break-inside-avoid">
              <table className="w-full text-xs md:text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="border border-gray-300 p-2 text-left w-1/4">Tahapan & Waktu</th>
                    <th className="border border-gray-300 p-2 text-left w-1/3">Aktivitas Guru</th>
                    <th className="border border-gray-300 p-2 text-left w-1/3">Aktivitas Siswa</th>
                    <th className="border border-gray-300 p-2 text-center w-1/6">Elemen Deep Learning</th>
                  </tr>
                </thead>
                <tbody>
                  {data.kegiatanPembelajaran.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-2 font-bold text-gray-900 align-top">
                        {item.tahap}
                      </td>
                      <td className="border border-gray-300 p-2 align-top whitespace-pre-line text-gray-800">
                        {item.aktivitasGuru}
                      </td>
                      <td className="border border-gray-300 p-2 align-top whitespace-pre-line text-gray-800">
                        {item.aktivitasSiswa}
                      </td>
                      <td className="border border-gray-300 p-2 align-top text-center font-medium text-blue-800">
                        {item.elemenDeepLearning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sub-section Refleksi Metakognitif */}
          <div className="mt-4 p-3 bg-emerald-50/60 border border-emerald-200 rounded text-xs space-y-1 break-inside-avoid page-break-inside-avoid">
            <h5 className="font-bold text-emerald-900 uppercase">
              💡 Refleksi Metakognitif Peserta Didik (Proses Inti)
            </h5>
            <div className="text-gray-800 space-y-1 pl-1">
              {Array.isArray(refleksiSiswa) ? (
                refleksiSiswa.map((item: any, rIdx: number) => (
                  <div key={rIdx} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{renderTextValue(item)}</span>
                  </div>
                ))
              ) : (
                <div>• {renderTextValue(refleksiSiswa)}</div>
              )}
            </div>
          </div>
        </section>

        {/* G. Asesmen & H. Pengayaan */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 break-inside-avoid page-break-inside-avoid">
          <div className="border border-gray-200 p-3 rounded bg-gray-50/50">
            <h4 className="font-bold text-blue-900 mb-2">G. Rencana Asesmen Berkelanjutan</h4>
            <ul className="text-xs space-y-1 text-gray-800">
              <li>
                <strong>Asesmen Awal (Diagnostik):</strong> {renderTextValue(data.asesmenRencana.awal)}
              </li>
              <li>
                <strong>Asesmen Proses (Formatif):</strong> {renderTextValue(data.asesmenRencana.proses)}
              </li>
              <li>
                <strong>Asesmen Akhir (Sumatif):</strong> {renderTextValue(data.asesmenRencana.akhir)}
              </li>
            </ul>
          </div>
          <div className="border border-gray-200 p-3 rounded bg-gray-50/50">
            <h4 className="font-bold text-blue-900 mb-2">H. Pengayaan & Remedial</h4>
            <ul className="text-xs space-y-1 text-gray-800">
              <li>
                <strong>Pengayaan:</strong> {renderTextValue(data.pengayaanRemedial.pengayaan)}
              </li>
              <li>
                <strong>Remedial:</strong> {renderTextValue(data.pengayaanRemedial.remedial)}
              </li>
            </ul>
          </div>
        </section>

        {/* Tanda Tangan Section */}
        <div className="pt-8 mt-6 border-t border-gray-200 break-inside-avoid page-break-inside-avoid">
          <div className="flex justify-between items-start text-xs md:text-sm text-gray-900">
            <div className="text-left">
              <p className="mb-1 font-semibold">Mengetahui,</p>
              <p className="font-bold">Kepala {currIdentitas.sekolah || 'SMA Xaverius 1 Palembang'}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{currIdentitas.kepalaSekolah || 'Andreas Sudarsana, M.Pd.'}</p>
              <p className="text-gray-600">NIY. {currIdentitas.nipKepalaSekolah || '-'}</p>
            </div>

            <div className="text-right">
              <p className="mb-1">
                Palembang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="font-bold">Guru Mata Pelajaran</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{guruMapel}</p>
              <p className="text-gray-600">NIY. {currIdentitas.nipGuru || '-'}</p>
            </div>
          </div>
        </div>

        {/* Footer Dokumen */}
        <div className="pt-6 mt-6 border-t border-gray-200 text-center text-xs text-slate-600 font-medium italic page-break-inside-avoid">
          CopyRight©Norbertus Suryadi — SMA Xaverius 1 Palembang | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning
        </div>
      </div>
    </div>
  );
};
