import React, { useState, useEffect, useRef } from 'react';
import {
  IdentitasRPM,
  GeneratedData,
  DocType,
} from './types';
import { defaultIdentitas, sampleGeneratedData } from './data/sampleData';
import { Header } from './components/Header';
import { FormInput } from './components/FormInput';
import { DocViewer } from './components/DocViewer';
import { docxService } from './services/docxService';
import { pdfService } from './utils/pdfExporter';
import { generateRPM, generateDocumentWithAi, generateAllDocumentsWithAi, MODEL_NAME } from './services/aiService';
import { Loader2, Sparkles, Clock } from 'lucide-react';

export default function App() {
  const [identitas, setIdentitas] = useState<IdentitasRPM>(defaultIdentitas);
  const [data, setData] = useState<GeneratedData>(sampleGeneratedData);

  const [isLoading, setIsLoading] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [generationStepInfo, setGenerationStepInfo] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipProgressText, setZipProgressText] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stable HTML Element IDs for PDF rendering
  const docIds: { [key in DocType]: string } = {
    rpm: 'rpm-document-render-root',
    lkpd: 'lkpd-document-render-root',
    moodle: 'moodle-document-render-root',
    asesmen: 'asesmen-document-render-root',
    rubrik: 'rubrik-document-render-root',
  };

  // Auto-load saved state on mount
  useEffect(() => {
    try {
      const savedIdentitas = localStorage.getItem('generator_rpm_identitas');
      const savedData = localStorage.getItem('generator_rpm_data');
      if (savedIdentitas) setIdentitas(JSON.parse(savedIdentitas));
      if (savedData) setData(JSON.parse(savedData));
    } catch (e) {
      console.warn('Gagal memuat data dari localStorage:', e);
    }
  }, []);

  // Timer effect for real-time generation indicator (1-2 minutes)
  useEffect(() => {
    if (isLoading) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedSeconds(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading]);

  // Save to LocalStorage
  const handleSaveLocalStorage = () => {
    try {
      localStorage.setItem('generator_rpm_identitas', JSON.stringify(identitas));
      localStorage.setItem('generator_rpm_data', JSON.stringify(data));
      alert('✅ Data RPM dan Modul Ajar berhasil disimpan di browser LocalStorage!');
    } catch (e) {
      alert('❌ Gagal menyimpan data ke LocalStorage.');
    }
  };

  // Load from LocalStorage
  const handleLoadLocalStorage = () => {
    try {
      const savedIdentitas = localStorage.getItem('generator_rpm_identitas');
      const savedData = localStorage.getItem('generator_rpm_data');
      if (savedIdentitas && savedData) {
        setIdentitas(JSON.parse(savedIdentitas));
        setData(JSON.parse(savedData));
        alert('📂 Data berhasil dimuat dari LocalStorage!');
      } else {
        alert('Belum ada data tersimpan di LocalStorage.');
      }
    } catch (e) {
      alert('❌ Gagal memuat data.');
    }
  };

  // Handle Form field changes & keep all documents identitas synchronized
  const handleIdentitasChange = (field: keyof IdentitasRPM, value: string) => {
    const updated = {
      ...identitas,
      [field]: value,
      guru: field === 'guru' || field === 'guruMapel' || field === 'namaGuru' ? value : (identitas.guru || value),
      guruMapel: field === 'guru' || field === 'guruMapel' || field === 'namaGuru' ? value : (identitas.guruMapel || value),
    };
    setIdentitas(updated);

    // Keep all document identitas in sync
    setData((prev) => ({
      ...prev,
      rpm: {
        ...prev.rpm,
        identitas: updated,
        capaianPembelajaran: field === 'cp' ? value : prev.rpm.capaianPembelajaran,
      },
      lkpd: {
        ...prev.lkpd,
        identitas: {
          ...prev.lkpd.identitas,
          sekolah: updated.sekolah,
          mataPelajaran: updated.mataPelajaran,
          guru: updated.guru,
          guruMapel: updated.guruMapel,
          namaGuru: updated.guru,
          kelas: updated.kelas,
          topik: updated.topik,
          waktu: updated.alokasiWaktu,
          logo: updated.logo,
        },
      },
      moodle: {
        ...prev.moodle,
        identitas: {
          ...prev.moodle.identitas,
          ...updated,
        },
      },
      asesmen: {
        ...prev.asesmen,
        identitas: {
          ...prev.asesmen.identitas,
          ...updated,
        },
      },
      rubrik: {
        ...prev.rubrik,
        identitas: {
          ...prev.rubrik.identitas,
          ...updated,
        },
      },
    }));
  };

  // Select Preset
  const handleSelectPreset = (presetIdentitas: IdentitasRPM) => {
    setIdentitas(presetIdentitas);
    setData((prev) => ({
      ...prev,
      rpm: {
        ...prev.rpm,
        identitas: presetIdentitas,
        capaianPembelajaran: presetIdentitas.cp,
      },
      lkpd: {
        ...prev.lkpd,
        identitas: {
          ...prev.lkpd.identitas,
          sekolah: presetIdentitas.sekolah,
          mataPelajaran: presetIdentitas.mataPelajaran,
          guru: presetIdentitas.guru,
          guruMapel: presetIdentitas.guruMapel || presetIdentitas.guru,
          namaGuru: presetIdentitas.guru,
          kelas: presetIdentitas.kelas,
          topik: presetIdentitas.topik,
          waktu: presetIdentitas.alokasiWaktu,
          logo: presetIdentitas.logo,
        },
      },
      moodle: {
        ...prev.moodle,
        identitas: {
          ...prev.moodle.identitas,
          ...presetIdentitas,
        },
      },
      asesmen: {
        ...prev.asesmen,
        identitas: {
          ...prev.asesmen.identitas,
          ...presetIdentitas,
        },
      },
      rubrik: {
        ...prev.rubrik,
        identitas: {
          ...prev.rubrik.identitas,
          ...presetIdentitas,
        },
      },
    }));
  };

  // Reset Form to exact default values
  const handleResetForm = () => {
    setIdentitas(defaultIdentitas);
    setData((prev) => ({
      ...prev,
      rpm: {
        ...prev.rpm,
        identitas: defaultIdentitas,
        capaianPembelajaran: defaultIdentitas.cp,
      },
      lkpd: {
        ...prev.lkpd,
        identitas: {
          ...prev.lkpd.identitas,
          sekolah: defaultIdentitas.sekolah,
          mataPelajaran: defaultIdentitas.mataPelajaran,
          guru: defaultIdentitas.guru,
          guruMapel: defaultIdentitas.guruMapel || defaultIdentitas.guru,
          namaGuru: defaultIdentitas.guru,
          kelas: defaultIdentitas.kelas,
          topik: defaultIdentitas.topik,
          waktu: defaultIdentitas.alokasiWaktu,
          logo: defaultIdentitas.logo,
        },
      },
      moodle: {
        ...prev.moodle,
        identitas: {
          ...prev.moodle.identitas,
          ...defaultIdentitas,
        },
      },
      asesmen: {
        ...prev.asesmen,
        identitas: {
          ...prev.asesmen.identitas,
          ...defaultIdentitas,
        },
      },
      rubrik: {
        ...prev.rubrik,
        identitas: {
          ...prev.rubrik.identitas,
          ...defaultIdentitas,
        },
      },
    }));
  };

  // Async handler for Generate buttons
  const handleGenerate = async (type: DocType | 'all' = 'all') => {
    setIsLoading(true);
    setGeneratingType(type);

    try {
      if (type === 'rpm') {
        setGenerationStepInfo(`Sedang menyusun dokumen RPM via Gemini API (${MODEL_NAME})...`);
        const result = await generateRPM(identitas);
        setData((prev) => ({
          ...prev,
          rpm: {
            ...result,
            identitas: identitas,
          },
        }));
      } else if (type === 'all') {
        setGenerationStepInfo(`Memulai pembuatan paket dokumen secara berurutan via Gemini API (${MODEL_NAME})...`);
        const results = await generateAllDocumentsWithAi(
          identitas,
          (docType, current, total) => {
            setGenerationStepInfo(
              `Sedang menyusun dokumen ${docType.toUpperCase()} (${current}/${total}) via Gemini API (${MODEL_NAME})...`
            );
          }
        );

        setData((prev) => ({
          ...prev,
          ...(results.rpm ? { rpm: { ...results.rpm, identitas } } : {}),
          ...(results.lkpd ? { lkpd: { ...results.lkpd, identitas: { ...prev.lkpd.identitas, ...identitas } } } : {}),
          ...(results.moodle ? { moodle: { ...results.moodle, identitas: { ...prev.moodle.identitas, ...identitas } } } : {}),
          ...(results.asesmen ? { asesmen: { ...results.asesmen, identitas: { ...prev.asesmen.identitas, ...identitas } } } : {}),
          ...(results.rubrik ? { rubrik: { ...results.rubrik, identitas: { ...prev.rubrik.identitas, ...identitas } } } : {}),
        }));
      } else {
        setGenerationStepInfo(`Sedang menyusun dokumen ${type.toUpperCase()} via Gemini API (${MODEL_NAME})...`);
        const res = await generateDocumentWithAi(type, identitas);
        setData((prev) => ({
          ...prev,
          [type]: {
            ...res.data,
            identitas: {
              ...(prev[type] as any)?.identitas,
              ...identitas,
            },
          },
        }));
      }
    } catch (error: any) {
      console.error('Generation error in App.tsx:', error);
      alert('Gagal menyusun dokumen: ' + (error?.message || String(error)));
    } finally {
      setIsLoading(false);
      setGeneratingType(null);
      setGenerationStepInfo('');
    }
  };

  // Download All as ZIP (DOCX files)
  const handleDownloadAllZip = async () => {
    setIsDownloadingZip(true);
    try {
      await docxService.downloadAllDocumentsDocxZip(
        data,
        identitas,
        (status) => setZipProgressText(status)
      );
    } catch (e: any) {
      console.error('ZIP generation failed:', e);
      alert(`Gagal membuat ZIP file: ${e?.message || 'Error'}`);
    } finally {
      setIsDownloadingZip(false);
      setZipProgressText('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Real-time Loading Modal/Overlay (1-2 minutes wait) */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl shadow-blue-500/10 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
              <Sparkles className="w-7 h-7 text-blue-600 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Sedang menyusun dokumen pembelajaran dinamis...
              </h3>
              {generationStepInfo ? (
                <p className="text-xs sm:text-sm text-blue-700 font-medium">
                  {generationStepInfo}
                </p>
              ) : null}
              <p className="text-xs sm:text-sm text-slate-600">
                Mohon tunggu hingga proses selesai. Harap tidak menutup halaman ini.
              </p>
            </div>

            {/* Timer & Progress Details */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Waktu Berjalan:</span>
                <span className="font-mono font-bold text-blue-600">{elapsedSeconds} detik</span>
              </div>
              <div className="text-slate-500">
                <span className="font-semibold text-slate-700">Status: Memproses API...</span>
              </div>
            </div>

            {/* Progress Bar Animation */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(95, Math.max(5, (elapsedSeconds / 90) * 100))}%`,
                }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Proses async sedang berjalan. Waktu pemrosesan bervariasi tergantung kepadatan lalu lintas server.
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <Header
        onDownloadAllZip={handleDownloadAllZip}
        isDownloadingZip={isDownloadingZip}
        zipProgressText={zipProgressText}
        onSaveLocalStorage={handleSaveLocalStorage}
        onLoadLocalStorage={handleLoadLocalStorage}
        onPrintCurrent={() => pdfService.printDocumentElement()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Form Parameters */}
        <FormInput
          identitas={identitas}
          onChange={handleIdentitasChange}
          onSelectPreset={handleSelectPreset}
          onResetForm={handleResetForm}
          onGenerate={handleGenerate}
          isGenerating={isLoading}
          generatingType={generatingType}
        />

        {/* Document Tabs & Render Preview Canvas */}
        <div className="pt-2">
          <DocViewer
            data={data}
            identitas={identitas}
            docIds={docIds}
            onUpdateData={(newData) => setData(newData)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-6 mt-12 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-600">
            CopyRight©Norbertus Suryadi — {identitas.sekolah || 'SMA Xaverius 1 Palembang'} | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning
          </p>
        </div>
      </footer>
    </div>
  );
}
