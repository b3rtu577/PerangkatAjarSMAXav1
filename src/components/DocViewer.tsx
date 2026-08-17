import React, { useState } from 'react';
import { DocType, GeneratedData, IdentitasRPM } from '../types';
import { RpmTemplate } from './DocTemplates/RpmTemplate';
import { LkpdTemplate } from './DocTemplates/LkpdTemplate';
import { MoodleTemplate } from './DocTemplates/MoodleTemplate';
import { AsesmenTemplate } from './DocTemplates/AsesmenTemplate';
import { RubrikTemplate } from './DocTemplates/RubrikTemplate';
import { docxService } from '../services/docxService';
import { pdfService } from '../services/pdfService';
import {
  Copy,
  Printer,
  Check,
  FileText,
  BookOpen,
  Monitor,
  CheckSquare,
  Table,
  CheckCircle2,
  AlertCircle,
  FileDown,
} from 'lucide-react';

interface Props {
  data: GeneratedData;
  identitas: IdentitasRPM;
  docIds: { [key in DocType]: string };
  onUpdateData: (newData: GeneratedData) => void;
}

export const DocViewer: React.FC<Props> = ({
  data,
  identitas,
  docIds,
}) => {
  const [activeTab, setActiveTab] = useState<DocType>('rpm');
  const [downloadingDoc, setDownloadingDoc] = useState<DocType | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<{
    [key in DocType]?: { state: 'idle' | 'loading' | 'success' | 'error'; message?: string };
  }>({});
  const [copied, setCopied] = useState(false);

  const tabs: { id: DocType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'rpm', label: '1. RPM (Rencana Pembelajaran)', icon: FileText },
    { id: 'lkpd', label: '2. LKPD (Lembar Kerja)', icon: BookOpen },
    { id: 'moodle', label: '3. Moodle / E-Learning', icon: Monitor },
    { id: 'asesmen', label: '4. Asesmen Pembelajaran', icon: CheckSquare },
    { id: 'rubrik', label: '5. Rubrik Penilaian', icon: Table },
  ];

  const getPrefix = (type: DocType): 'RPM' | 'LKPD' | 'MOODLE' | 'ASESMEN' | 'RUBRIK' => {
    switch (type) {
      case 'rpm':
        return 'RPM';
      case 'lkpd':
        return 'LKPD';
      case 'moodle':
        return 'MOODLE';
      case 'asesmen':
        return 'ASESMEN';
      case 'rubrik':
        return 'RUBRIK';
    }
  };

  // Execute Direct DOCX Browser Download
  const handleDownloadDocx = async (type: DocType) => {
    setDownloadingDoc(type);
    setDownloadStatus((prev) => ({
      ...prev,
      [type]: { state: 'loading', message: '⏳ Membuat DOCX...' },
    }));

    try {
      const result = await docxService.downloadDocumentDocx(type, data, identitas);

      if (result.success) {
        setDownloadStatus((prev) => ({
          ...prev,
          [type]: { state: 'success', message: '✓ Download DOCX Berhasil' },
        }));
      } else {
        throw new Error(result.error || 'DOCX Generation Failed');
      }
    } catch (error: any) {
      console.error('========== DOCX EXPORT ERROR ==========', error);
      const actualError = error?.message || String(error) || 'Unknown Error';

      setDownloadStatus((prev) => ({
        ...prev,
        [type]: { state: 'error', message: `❌ DOCX ERROR: ${actualError}` },
      }));
      alert(`Gagal mengekspor DOCX:\n${actualError}`);
    } finally {
      setDownloadingDoc(null);
      setTimeout(() => {
        setDownloadStatus((prev) => ({
          ...prev,
          [type]: { state: 'idle' },
        }));
      }, 4000);
    }
  };

  const handleCopyText = () => {
    const element =
      document.getElementById(`${docIds[activeTab]}-visible`) ||
      document.getElementById(docIds[activeTab]);
    if (!element) return;

    navigator.clipboard.writeText(element.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const visibleElementId = `${docIds[activeTab]}-visible`;
    pdfService.printDocumentElement(visibleElementId);
  };

  const renderTemplate = (type: DocType, customId?: string) => {
    const targetId = customId || docIds[type];
    switch (type) {
      case 'rpm':
        return <RpmTemplate data={data.rpm} id={targetId} identitas={identitas} />;
      case 'lkpd':
        return <LkpdTemplate data={data.lkpd} id={targetId} identitas={identitas} />;
      case 'moodle':
        return <MoodleTemplate data={data.moodle} id={targetId} identitas={identitas} />;
      case 'asesmen':
        return <AsesmenTemplate data={data.asesmen} id={targetId} identitas={identitas} />;
      case 'rubrik':
        return <RubrikTemplate data={data.rubrik} id={targetId} identitas={identitas} />;
    }
  };

  const currentStatus = downloadStatus[activeTab];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-1.5 flex flex-wrap items-center gap-1.5 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Control Box per Document */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>
              {activeTab === 'rpm' && '📄 DOKUMEN RPM'}
              {activeTab === 'lkpd' && '📘 DOKUMEN LKPD'}
              {activeTab === 'moodle' && '💻 DOKUMEN MOODLE / E-LEARNING'}
              {activeTab === 'asesmen' && '📝 DOKUMEN ASESMEN PEMBELAJARAN'}
              {activeTab === 'rubrik' && '📊 DOKUMEN RUBRIK PENILAIAN'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            File akan dinamai:{' '}
            <code className="text-blue-700 font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              {docxService.buildDocxFilename(
                getPrefix(activeTab),
                identitas.mataPelajaran,
                identitas.kelas,
                identitas.topik
              )}
            </code>
          </p>
        </div>

        {/* Action Buttons: [ 📄 Download DOCX ] [ Copy ] [ Print ] */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download DOCX */}
          <button
            onClick={() => handleDownloadDocx(activeTab)}
            disabled={downloadingDoc === activeTab}
            className={`flex items-center gap-2 px-5 py-2.5 text-white font-bold text-xs md:text-sm rounded-lg shadow-md transition active:scale-95 disabled:opacity-50 ${
              currentStatus?.state === 'success'
                ? 'bg-emerald-600 shadow-emerald-600/30'
                : currentStatus?.state === 'error'
                ? 'bg-red-600 shadow-red-600/30'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-blue-500/20'
            }`}
            title="Download dokumen ini sebagai file Microsoft Word (.docx)"
          >
            {currentStatus?.state === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
            ) : currentStatus?.state === 'error' ? (
              <AlertCircle className="w-4 h-4 text-white" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>
              {currentStatus?.message || '[ 📄 Download DOCX ]'}
            </span>
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
            title="Salin teks dokumen ke clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Tersalin!' : 'Copy'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
            title="Cetak langsung dokumen"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Hidden off-screen DOM elements for all 5 document templates */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: '900px',
          pointerEvents: 'none',
          opacity: 1,
          zIndex: -100,
        }}
        aria-hidden="true"
      >
        <RpmTemplate data={data.rpm} id={docIds.rpm} />
        <LkpdTemplate data={data.lkpd} id={docIds.lkpd} />
        <MoodleTemplate data={data.moodle} id={docIds.moodle} identitas={identitas} />
        <AsesmenTemplate data={data.asesmen} id={docIds.asesmen} identitas={identitas} />
        <RubrikTemplate data={data.rubrik} id={docIds.rubrik} identitas={identitas} />
      </div>

      {/* Main Visible Display Canvas */}
      <div className="relative">
        <div className="overflow-x-auto pb-4">
          {renderTemplate(activeTab, `${docIds[activeTab]}-visible`)}
        </div>
      </div>
    </div>
  );
};
