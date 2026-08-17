import React from 'react';
import { Download, Save, FolderOpen, Printer } from 'lucide-react';

interface Props {
  onDownloadAllZip: () => void;
  isDownloadingZip: boolean;
  onSaveLocalStorage: () => void;
  onLoadLocalStorage: () => void;
  onPrintCurrent: () => void;
  zipProgressText?: string;
  schoolLogo?: string;
}

export const Header: React.FC<Props> = ({
  onDownloadAllZip,
  isDownloadingZip,
  onSaveLocalStorage,
  onLoadLocalStorage,
  onPrintCurrent,
  zipProgressText,
  schoolLogo,
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          {/* Container Logo di Header */}
          <div className="w-11 h-11 bg-white p-1 rounded-xl shadow-md flex items-center justify-center border border-white/20 shrink-0 overflow-hidden">
            <img
              src={schoolLogo || "/logo-xaverius.png"}
              alt="Logo SMA Xaverius 1"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5 flex-wrap">
                <span>MODUL AJAR AI</span>
                <span className="text-blue-300 font-bold">SMA Xaverius 1</span>
              </h1>
              <span className="bg-white/10 text-white/90 text-[10px] font-semibold px-2 py-0.5 rounded border border-white/20 backdrop-blur-xs">
                By Norbertus Suryadi, S.Kom.
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                DOCX EXPORT READY
              </span>
            </div>
            <p className="text-xs text-blue-100/80 mt-0.5">
              Otomatisasi RPM, LKPD, Moodle/E-Learning, Asesmen &amp; Rubrik Kurikulum Merdeka
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Semua ZIP */}
          <button
            onClick={onDownloadAllZip}
            disabled={isDownloadingZip}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg shadow-md shadow-emerald-950/20 active:scale-95 disabled:opacity-50 transition"
            title="Download Semua 5 Dokumen sebagai file ZIP (.docx)"
          >
            <Download className="w-4 h-4" />
            <span>
              {isDownloadingZip
                ? zipProgressText || '⏳ Memproses ZIP...'
                : '📦 DOWNLOAD SEMUA (.ZIP)'}
            </span>
          </button>

          {/* Quick Print */}
          <button
            onClick={onPrintCurrent}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/15 backdrop-blur-sm transition"
            title="Cetak langsung dokumen aktif"
          >
            <Printer className="w-3.5 h-3.5 text-white/80" />
            <span>Print</span>
          </button>

          {/* Simpan State */}
          <button
            onClick={onSaveLocalStorage}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/15 backdrop-blur-sm transition"
            title="Simpan data dokumen ke browser Local Storage"
          >
            <Save className="w-3.5 h-3.5 text-blue-300" />
            <span>Simpan</span>
          </button>

          {/* Muat State */}
          <button
            onClick={onLoadLocalStorage}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/15 backdrop-blur-sm transition"
            title="Muat data tersimpan dari Local Storage"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Muat</span>
          </button>
        </div>
      </div>
    </header>
  );
};