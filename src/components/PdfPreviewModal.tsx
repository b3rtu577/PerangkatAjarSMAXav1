import React from 'react';
import { Download, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  docTitle: string;
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  children: React.ReactNode;
}

export const PdfPreviewModal: React.FC<Props> = ({
  isOpen,
  docTitle,
  onClose,
  onDownload,
  isDownloading,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">👁️</span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Preview PDF: {docTitle}</h3>
              <p className="text-xs text-slate-500">
                Tampilan persis yang akan dicetak dan di-download sebagai file PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-200 transition"
            title="Tutup Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable document render */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <div className="bg-white rounded-lg shadow-xl p-2 max-w-4xl mx-auto transform scale-[0.98]">
            {children}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            Format kertas A4 otomatis dengan header &amp; footer halaman.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg transition"
            >
              [ CLOSE ]
            </button>
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-lg shadow-blue-500/20 transition"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? '⏳ Membuat PDF...' : '[ DOWNLOAD PDF ]'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
