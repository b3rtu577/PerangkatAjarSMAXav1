import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { pdfService } from '../services/pdfService';
import { Bug, CheckCircle2, AlertTriangle, Play, RefreshCw } from 'lucide-react';

export const PdfDiagnosticPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [jsPdfStatus, setJsPdfStatus] = useState<'PASS' | 'FAIL'>('PASS');
  const [minPdfStatus, setMinPdfStatus] = useState<'PASS' | 'FAIL'>('PASS');
  const [blobStatus, setBlobStatus] = useState<'PASS' | 'FAIL'>('PASS');
  const [blobSizeBytes, setBlobSizeBytes] = useState<number>(0);

  const [rpmDomStatus, setRpmDomStatus] = useState<'FOUND' | 'NOT FOUND'>('NOT FOUND');
  const [rpmHtmlStatus, setRpmHtmlStatus] = useState<'AVAILABLE' | 'EMPTY'>('EMPTY');
  const [domWidth, setDomWidth] = useState<number>(0);
  const [domHeight, setDomHeight] = useState<number>(0);

  const [h2cStatus, setH2cStatus] = useState<'PASS' | 'FAIL'>('PASS');
  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  const [canvasHeight, setCanvasHeight] = useState<number>(0);

  const [pdfAssemblyStatus, setPdfAssemblyStatus] = useState<'PASS' | 'FAIL'>('PASS');
  const [finalBlobStatus, setFinalBlobStatus] = useState<'PASS' | 'FAIL'>('PASS');

  const [actualError, setActualError] = useState<string>('None');

  const runFullDiagnostic = async () => {
    setIsRunning(true);
    let errAccumulator = 'None';

    // Step 2 & 3: Minimal jsPDF Test
    let jsPdfOk = false;
    let minPdfOk = false;
    let blobOk = false;
    let bytes = 0;

    try {
      if (jsPDF) {
        jsPdfOk = true;
      }
      const pdf = new jsPDF();
      pdf.text('TEST GENERATOR RPM', 20, 20);
      pdf.text('PDF ENGINE BERHASIL', 20, 35);
      const blob = pdf.output('blob');

      console.log('TEST PDF BLOB:', blob);
      console.log('TEST PDF SIZE:', blob.size);
      console.log('TEST PDF TYPE:', blob.type);

      if (blob && blob.size > 0) {
        minPdfOk = true;
        blobOk = true;
        bytes = blob.size;
      }
    } catch (err: any) {
      console.error('========== PDF ROOT ERROR (Minimal jsPDF) ==========');
      console.error(err);
      console.error(err?.message);
      console.error(err?.stack);
      errAccumulator = err?.message || String(err);
    }

    setJsPdfStatus(jsPdfOk ? 'PASS' : 'FAIL');
    setMinPdfStatus(minPdfOk ? 'PASS' : 'FAIL');
    setBlobStatus(blobOk ? 'PASS' : 'FAIL');
    setBlobSizeBytes(bytes);

    // Step 4: RPM DOM Element Check
    let domFound = false;
    let htmlAvail = false;
    let w = 0;
    let h = 0;

    const el =
      document.getElementById('rpm-document-render-root-visible') ||
      document.getElementById('rpm-document-render-root');

    if (el) {
      domFound = true;
      w = el.offsetWidth || Math.round(el.getBoundingClientRect().width);
      h = el.offsetHeight || Math.round(el.getBoundingClientRect().height);
      if (el.innerHTML && el.innerHTML.trim().length > 0) {
        htmlAvail = true;
      }
    }

    setRpmDomStatus(domFound ? 'FOUND' : 'NOT FOUND');
    setRpmHtmlStatus(htmlAvail ? 'AVAILABLE' : 'EMPTY');
    setDomWidth(w);
    setDomHeight(h);

    // Step 5: html2canvas Test on DOM
    let h2cOk = false;
    let cw = 0;
    let ch = 0;
    let assyOk = false;
    let finalBlobOk = false;

    if (el) {
      try {
        const canvas = await html2canvas(el, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc, clonedEl) => {
            pdfService.applyPdfLightModeStyles(clonedDoc, clonedEl);
          },
        });

        if (canvas && canvas.width > 0 && canvas.height > 0) {
          h2cOk = true;
          cw = canvas.width;
          ch = canvas.height;

          // Step 8: Assemble PDF
          const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          const imgData = canvas.toDataURL('image/jpeg', 0.85);
          doc.addImage(imgData, 'JPEG', 10, 10, 190, 270);
          const fBlob = doc.output('blob');

          if (fBlob && fBlob.size > 0) {
            assyOk = true;
            finalBlobOk = true;
          }
        }
      } catch (err: any) {
        console.error('========== PDF ROOT ERROR (html2canvas / RPM Assembly) ==========');
        console.error(err);
        console.error(err?.message);
        console.error(err?.stack);
        if (errAccumulator === 'None') {
          errAccumulator = err?.message || String(err);
        }
      }
    } else {
      if (errAccumulator === 'None') {
        errAccumulator = 'Elemen DOM RPM tidak ditemukan';
      }
    }

    setH2cStatus(h2cOk ? 'PASS' : 'FAIL');
    setCanvasWidth(cw);
    setCanvasHeight(ch);
    setPdfAssemblyStatus(assyOk ? 'PASS' : 'FAIL');
    setFinalBlobStatus(finalBlobOk ? 'PASS' : 'FAIL');
    setActualError(errAccumulator);

    // Step 12: Print EXACT Output Format to Console
    const consoleReport = `=============================
PDF ROOT CAUSE DIAGNOSTIC
=============================

jsPDF:
${jsPdfOk ? 'PASS' : 'FAIL'}

Minimal PDF:
${minPdfOk ? 'PASS' : 'FAIL'}

Blob:
${blobOk ? 'PASS' : 'FAIL'}

RPM DOM:
${domFound ? 'FOUND' : 'NOT FOUND'}

RPM HTML:
${htmlAvail ? 'AVAILABLE' : 'EMPTY'}

html2canvas:
${h2cOk ? 'PASS' : 'FAIL'}

Canvas:
${h2cOk ? 'PASS' : 'FAIL'}

PDF Assembly:
${assyOk ? 'PASS' : 'FAIL'}

Final Blob:
${finalBlobOk ? 'PASS' : 'FAIL'}

Actual Error:
${errAccumulator}

=============================`;

    console.log(consoleReport);
    setIsRunning(false);
  };

  useEffect(() => {
    // Auto-run diagnostic on load
    const timer = setTimeout(() => {
      runFullDiagnostic();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-slate-900 border border-amber-500/50 rounded-xl p-4 shadow-2xl text-slate-100 my-4 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-extrabold text-amber-300 text-sm tracking-wide">
              PDF ROOT CAUSE DIAGNOSTIC
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Diagnostik otomatis akar masalah pembuatan PDF
            </p>
          </div>
        </div>

        <button
          onClick={runFullDiagnostic}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg transition disabled:opacity-50"
        >
          {isRunning ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          <span>[ JALANKAN DIAGNOSTIK ]</span>
        </button>
      </div>

      {/* Terminal Block Displaying Exact Step 12 Output */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto text-slate-200">
        <div className="text-amber-400 font-bold mb-2">=============================</div>
        <div className="text-amber-300 font-bold mb-2">PDF ROOT CAUSE DIAGNOSTIC</div>
        <div className="text-amber-400 font-bold mb-3">=============================</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 mb-4">
          <div>
            jsPDF:{' '}
            <span className={jsPdfStatus === 'PASS' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {jsPdfStatus}
            </span>
          </div>

          <div>
            Minimal PDF:{' '}
            <span className={minPdfStatus === 'PASS' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {minPdfStatus}
            </span>
          </div>

          <div>
            Blob:{' '}
            <span className={blobStatus === 'PASS' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {blobStatus} ({blobSizeBytes} bytes)
            </span>
          </div>

          <div>
            RPM DOM:{' '}
            <span className={rpmDomStatus === 'FOUND' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {rpmDomStatus}
            </span>
          </div>

          <div>
            RPM HTML:{' '}
            <span className={rpmHtmlStatus === 'AVAILABLE' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {rpmHtmlStatus} ({domWidth}x{domHeight}px)
            </span>
          </div>

          <div>
            html2canvas:{' '}
            <span className={h2cStatus === 'PASS' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {h2cStatus}
            </span>
          </div>

          <div>
            Canvas:{' '}
            <span className={h2cStatus === 'PASS' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {h2cStatus === 'PASS' ? `PASS (${canvasWidth}x${canvasHeight}px)` : 'FAIL'}
            </span>
          </div>

          <div>
            PDF Assembly:{' '}
            <span className={pdfAssemblyStatus === 'PASS' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {pdfAssemblyStatus}
            </span>
          </div>

          <div>
            Final Blob:{' '}
            <span className={finalBlobStatus === 'PASS' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {finalBlobStatus}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-2 text-red-300">
          <strong>Actual Error:</strong>{' '}
          <span className={actualError === 'None' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold font-mono'}>
            {actualError}
          </span>
        </div>

        <div className="text-amber-400 font-bold mt-3">=============================</div>
      </div>
    </div>
  );
};
