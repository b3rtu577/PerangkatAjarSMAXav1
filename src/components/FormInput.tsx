import React from 'react';
import { IdentitasRPM, DocType } from '../types';
import { samplePresets } from '../data/sampleData';
import { Wand2, Layers, BookOpen, CheckCircle } from 'lucide-react';

interface Props {
  identitas: IdentitasRPM;
  onChange: (field: keyof IdentitasRPM, value: string) => void;
  onSelectPreset: (presetIdentitas: IdentitasRPM) => void;
  onResetForm?: () => void;
  onGenerate: (type: DocType | 'all') => void;
  isGenerating: boolean;
  generatingType: string | null;
}

export const FormInput: React.FC<Props> = ({
  identitas,
  onChange,
  onSelectPreset,
  onResetForm,
  onGenerate,
  isGenerating,
  generatingType,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-slate-800">
      {/* Header section with Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">1. Parameter Identitas Modul Pembelajaran</h2>
        </div>

        {/* Preset Selector & Reset */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 hidden lg:inline">Contoh Preset:</span>
          <select
            onChange={(e) => {
              const idx = parseInt(e.target.value);
              if (!isNaN(idx) && samplePresets[idx]) {
                onSelectPreset(samplePresets[idx].identitas);
              }
            }}
            className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-1.5 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            defaultValue=""
          >
            <option value="" disabled>
              -- Pilih Preset Contoh Mata Pelajaran --
            </option>
            {samplePresets.map((p, idx) => (
              <option key={idx} value={idx}>
                {p.label}
              </option>
            ))}
          </select>

          {onResetForm && (
            <button
              type="button"
              onClick={onResetForm}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-semibold transition"
              title="Reset form ke nilai default"
            >
              Reset Form
            </button>
          )}
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Mata Pelajaran */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">Mata Pelajaran</label>
          <input
            type="text"
            value={identitas.mataPelajaran}
            onChange={(e) => onChange('mataPelajaran', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="misal: Informatika"
          />
        </div>

        {/* Elemen KSP / Bidang */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">
            Elemen KSP / Bidang
          </label>
          <input
            type="text"
            list="elemen-ksp-presets"
            value={identitas.elemenKsp || ''}
            onChange={(e) => onChange('elemenKsp' as any, e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder={
              identitas.mataPelajaran?.toLowerCase().includes('informatika')
                ? 'misal: AP (Algoritma dan Pemrograman) atau ketik custom'
                : 'misal: Pemahaman Sains / Keterampilan Proses / Teks LHO'
            }
          />
          <datalist id="elemen-ksp-presets">
            {identitas.mataPelajaran?.toLowerCase().includes('informatika') ? (
              <>
                <option value="AP (Algoritma dan Pemrograman)" />
                <option value="BK (Berpikir Komputasional)" />
                <option value="TIK (Teknologi Informasi dan Komunikasi)" />
                <option value="SK (Sistem Komputer)" />
                <option value="JKI (Jaringan Komputer dan Internet)" />
                <option value="AD (Analisis Data)" />
                <option value="DSI (Dampak Sosial Informatika)" />
                <option value="PLB (Praktik Lintas Bidang)" />
              </>
            ) : (
              <>
                <option value="Pemahaman Sains & Keterampilan Proses" />
                <option value="Bilangan dan Aljabar" />
                <option value="Geometri dan Pengukuran" />
                <option value="Menyimak, Membaca, dan Menulis Teks" />
                <option value="Pancasila dan Kewarganegaraan" />
                <option value="Keterampilan Praktik Lapangan" />
              </>
            )}
          </datalist>
        </div>

        {/* Kelas / Fase */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">Kelas / Fase</label>
          <input
            type="text"
            value={identitas.kelas}
            onChange={(e) => onChange('kelas', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="misal: Kelas XI / Fase F"
          />
        </div>

        {/* Alokasi Waktu & Durasi */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">Durasi per Pertemuan</label>
          <input
            type="text"
            value={identitas.alokasiWaktu}
            onChange={(e) => onChange('alokasiWaktu', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="misal: 2 × 40 menit, 3 × 40 menit, 80 menit"
          />
        </div>

        {/* Jumlah Pertemuan */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">Jumlah Pertemuan</label>
          <input
            type="number"
            min="1"
            max="10"
            value={identitas.jumlahPertemuan || '1'}
            onChange={(e) => onChange('jumlahPertemuan', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="misal: 1, 2, atau 3"
          />
        </div>

        {/* Topik / Materi */}
        <div className="md:col-span-2">
          <label className="block text-slate-700 font-medium mb-1">Topik / Sub-Materi Pembelajaran</label>
          <input
            type="text"
            value={identitas.topik}
            onChange={(e) => onChange('topik', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="misal: Berpikir Kritis & Algoritma Pemrograman"
          />
        </div>

        {/* Model Pembelajaran */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">Model Pembelajaran</label>
          <input
            type="text"
            value={identitas.modelPembelajaran}
            onChange={(e) => onChange('modelPembelajaran', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="Problem Based Learning / Deep Learning"
          />
        </div>

        {/* Sifat Penugasan LKPD (Dinamis Tanda Tangan) */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">Sifat Penugasan LKPD</label>
          <select
            value={identitas.jenisTugas || 'kelompok'}
            onChange={(e) => onChange('jenisTugas' as any, e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
          >
            <option value="kelompok">Tugas Kelompok (Tanda Tangan: Ketua Kelompok)</option>
            <option value="individu">Tugas Individu (Tanda Tangan: Nama Siswa)</option>
            <option value="netral">Netral (Tanda Tangan: Siswa / Ketua Kelompok)</option>
          </select>
        </div>

        {/* Sekolah */}
        <div className="md:col-span-2 lg:col-span-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <label className="block text-slate-800 font-semibold mb-1">Nama Satuan Pendidikan / Sekolah</label>
          <input
            type="text"
            value={identitas.sekolah}
            onChange={(e) => onChange('sekolah', e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="SMA Xaverius 1 Palembang"
          />
        </div>

        {/* Guru */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">Guru Mata Pelajaran</label>
          <input
            type="text"
            value={identitas.guru}
            onChange={(e) => onChange('guru', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="Norbertus Suryadi, S.Kom."
          />
        </div>

        {/* NIY Guru */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">NIY (Nomor Induk Yayasan) Guru</label>
          <input
            type="text"
            value={identitas.nipGuru}
            onChange={(e) => onChange('nipGuru', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="Opsional / Kosongkan jika tidak ada"
          />
        </div>

        {/* Kepala Sekolah */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">Nama Kepala Sekolah</label>
          <input
            type="text"
            value={identitas.kepalaSekolah}
            onChange={(e) => onChange('kepalaSekolah', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="Andreas Sudarsana, M.Pd."
          />
        </div>

        {/* NIY Kepala Sekolah */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">NIY (Nomor Induk Yayasan) Kepala Sekolah</label>
          <input
            type="text"
            value={identitas.nipKepalaSekolah}
            onChange={(e) => onChange('nipKepalaSekolah', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="Opsional / Kosongkan jika tidak ada"
          />
        </div>

        {/* Capaian Pembelajaran (CP) */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-slate-700 font-medium mb-1">Capaian Pembelajaran (CP)</label>
          <textarea
            rows={2}
            value={identitas.cp}
            onChange={(e) => onChange('cp', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs focus:outline-none transition"
            placeholder="Pada akhir fase..."
          ></textarea>
        </div>
      </div>

      {/* Generator Action Buttons Bar */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-700">Aksi Generator AI Gemini:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Specific Document Generator Buttons */}
          {(['rpm', 'lkpd', 'moodle', 'asesmen', 'rubrik'] as DocType[]).map((type) => (
            <button
              key={type}
              onClick={() => onGenerate(type)}
              disabled={isGenerating}
              className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-xs font-semibold rounded-lg disabled:opacity-50 transition-all"
            >
              {isGenerating && generatingType === type ? '⏳ Menyusun...' : `+ Generate ${type.toUpperCase()}`}
            </button>
          ))}

          {/* Generate All */}
          <button
            onClick={() => onGenerate('all')}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-xs rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Wand2 className="w-4 h-4" />
            <span>
              {isGenerating && generatingType === 'all'
                ? '⏳ Menyusun Semua Dokumen AI...'
                : '✨ GENERATE SEMUA DOKUMEN'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
