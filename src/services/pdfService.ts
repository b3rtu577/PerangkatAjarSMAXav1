import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

let colorCanvas: HTMLCanvasElement | null = null;
let colorCtx: CanvasRenderingContext2D | null = null;

/**
 * Converts any CSS color string (including oklch, oklab, color(srgb...), etc.)
 * into an explicit rgb() or rgba() string using a 1x1 Canvas 2D context.
 */
export const oklchToRgb = (colorStr: string): string => {
  if (!colorStr) return 'rgb(0, 0, 0)';
  try {
    if (!colorCanvas) {
      colorCanvas = document.createElement('canvas');
      colorCanvas.width = 1;
      colorCanvas.height = 1;
      colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
    }
    if (colorCtx) {
      colorCtx.fillStyle = '#000000';
      colorCtx.fillRect(0, 0, 1, 1);
      colorCtx.fillStyle = colorStr;
      colorCtx.fillRect(0, 0, 1, 1);
      const data = colorCtx.getImageData(0, 0, 1, 1).data;
      const r = data[0];
      const g = data[1];
      const b = data[2];
      const a = data[3] / 255;
      if (a < 1) {
        return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(2))})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    }
  } catch (e) {
    console.warn('oklchToRgb conversion fallback:', colorStr, e);
  }
  return 'rgb(0, 0, 0)';
};

/**
 * Parses CSS strings and replaces any unsupported color functions
 * (oklch, oklab, color(srgb...), light-dark, color-mix) with standard rgb()/rgba() strings.
 */
export const replaceUnsupportedColorsInString = (str: string): string => {
  if (!str) return str;
  if (
    !str.includes('oklch') &&
    !str.includes('oklab') &&
    !str.includes('color(') &&
    !str.includes('light-dark(') &&
    !str.includes('color-mix(')
  ) {
    return str;
  }

  const targets = ['oklch(', 'oklab(', 'color(', 'light-dark(', 'color-mix('];

  let result = str;
  targets.forEach((target) => {
    let i = 0;
    while (i < result.length) {
      const idx = result.toLowerCase().indexOf(target, i);
      if (idx === -1) break;

      let depth = 0;
      let endPos = -1;
      for (let j = idx + target.length - 1; j < result.length; j++) {
        if (result[j] === '(') {
          depth++;
        } else if (result[j] === ')') {
          depth--;
          if (depth === 0) {
            endPos = j;
            break;
          }
        }
      }

      if (endPos !== -1) {
        const fullExpr = result.substring(idx, endPos + 1);
        const rgbEquivalent = oklchToRgb(fullExpr);
        result = result.substring(0, idx) + rgbEquivalent + result.substring(endPos + 1);
        i = idx + rgbEquivalent.length;
      } else {
        i = idx + target.length;
      }
    }
  });

  return result;
};

export interface PdfServiceOptions {
  filename: string;
  docTitle?: string;
  sekolah?: string;
  namaGuru?: string;
  guru?: string;
  penyusun?: string;
  identitas?: any;
  data?: any;
  isLandscape?: boolean;
}

export interface PdfDownloadResult {
  success: boolean;
  blobSizeKb: number;
  filename: string;
  blob?: Blob;
  objectUrl?: string;
  triggered: boolean;
  error?: string;
}

/**
 * Sanitizes a string for safe use in filenames (replaces illegal characters with underscores).
 */
export const sanitizeFilename = (str: string): string => {
  if (!str) return 'Dokumen';
  return str
    .trim()
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 60);
};

/**
 * Builds standardized filenames based on prefix and metadata.
 */
export const buildPdfFilename = (
  prefix: 'RPM' | 'LKPD' | 'MOODLE' | 'ASESMEN' | 'RUBRIK' | string,
  mataPelajaran: string,
  kelas: string,
  topik: string
): string => {
  const cleanPrefix = sanitizeFilename(prefix);
  const cleanMapel = sanitizeFilename(mataPelajaran);
  const cleanKelas = sanitizeFilename(kelas);
  const cleanTopik = sanitizeFilename(topik);
  return `${cleanPrefix}_${cleanMapel}_${cleanKelas}_${cleanTopik}.pdf`;
};

/**
 * Standard Browser Download Engine
 * Uses Blob + URL.createObjectURL() + invisible <a download> element.
 */
export const downloadBlob = (blob: Blob, filename: string): boolean => {
  if (!(blob instanceof Blob)) {
    throw new Error('PDF Blob tidak valid');
  }

  if (blob.size <= 0) {
    throw new Error('PDF Blob kosong (0 bytes)');
  }

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 2000);

  return true;
};

/**
 * Fallback: Opens PDF Blob in a new browser tab/window.
 */
export const openPdfInNewTab = (blob: Blob): boolean => {
  if (!(blob instanceof Blob) || blob.size <= 0) {
    throw new Error('PDF Blob kosong atau tidak valid.');
  }

  const url = URL.createObjectURL(blob);
  const newWin = window.open(url, '_blank');

  if (!newWin) {
    alert('Preview browser membatasi pembukaan tab baru. Silakan gunakan tombol Download PDF pada aplikasi yang sudah di-deploy.');
    return false;
  }

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 30000);

  return true;
};

/**
 * Generates a simple 1-page Test PDF (F4 Format) to verify jsPDF, Blob creation, and Browser Download.
 */
export const generateTestPdf = async (): Promise<{ blob: Blob; sizeKb: number }> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [215, 330], // Setting F4
  });

  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text('TEST PDF GENERATOR (F4 SIZE)', 15, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Waktu Pengujian: ${new Date().toLocaleString('id-ID')}`, 15, 28);
  doc.line(15, 32, 200, 32);

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Generator RPM — Test PDF berhasil dibuat dengan ukuran F4 (215x330mm).', 15, 42);

  doc.setFontSize(10);
  doc.text('1. PDF Engine: OK', 20, 52);
  doc.text('2. Ukuran Kertas: F4 (215 x 330 mm)', 20, 60);
  doc.text('3. Download Trigger: TRIGGERED', 20, 68);
  doc.text('4. Fallback Open PDF: AVAILABLE', 20, 76);

  doc.setDrawColor(59, 130, 246);
  doc.setFillColor(239, 246, 255);
  doc.rect(15, 88, 185, 30, 'FD');

  doc.setFontSize(11);
  doc.setTextColor(29, 78, 216);
  doc.text('Aplikasi Generator RPM & Modul Ajar AI', 20, 101);
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Jika file test.pdf ini berhasil terdownload atau terbuka, PDF Engine 100% aktif.', 20, 109);

  const blob = doc.output('blob');
  const sizeKb = Math.round((blob.size / 1024) * 100) / 100;
  return { blob, sizeKb };
};

/**
 * Runs a test PDF generation & download trigger.
 */
export const testPdfDownload = async (): Promise<PdfDownloadResult> => {
  const filename = 'test_F4.pdf';
  try {
    const { blob, sizeKb } = await generateTestPdf();
    const objectUrl = URL.createObjectURL(blob);
    const triggered = downloadBlob(blob, filename);

    return {
      success: true,
      blobSizeKb: sizeKb,
      filename,
      blob,
      objectUrl,
      triggered,
    };
  } catch (error: any) {
    console.error('testPdfDownload error:', error);
    return {
      success: false,
      blobSizeKb: 0,
      filename,
      triggered: false,
      error: error?.message || 'Error tidak diketahui saat menguji PDF.',
    };
  }
};

/**
 * Detects table column count or width to choose Landscape orientation if needed.
 */
export const detectTableWidth = (element: HTMLElement): boolean => {
  if (!element) return false;
  const tables = element.querySelectorAll('table');
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i] as HTMLTableElement;
    const firstRow = table.querySelector('tr');
    if (firstRow) {
      const colCount = firstRow.querySelectorAll('th, td').length;
      if (colCount >= 5) return true;
    }
    if (table.scrollWidth > 700) return true;
  }
  return false;
};

export const applyPdfLightModeStyles = (clonedDoc: Document, clonedElement: HTMLElement) => {
  if (clonedDoc.documentElement) {
    clonedDoc.documentElement.classList.remove('dark');
    clonedDoc.documentElement.style.setProperty('background-color', '#ffffff', 'important');
    clonedDoc.documentElement.style.setProperty('color', '#111827', 'important');
    clonedDoc.documentElement.style.setProperty('color-scheme', 'light', 'important');
  }
  if (clonedDoc.body) {
    clonedDoc.body.classList.remove('dark');
    clonedDoc.body.style.setProperty('background-color', '#ffffff', 'important');
    clonedDoc.body.style.setProperty('color', '#111827', 'important');
    clonedDoc.body.style.setProperty('color-scheme', 'light', 'important');
  }

  try {
    const darkElements = clonedDoc.querySelectorAll('.dark');
    darkElements.forEach((el) => el.classList.remove('dark'));
    const themedElements = clonedDoc.querySelectorAll('[data-theme]');
    themedElements.forEach((el) => el.setAttribute('data-theme', 'light'));
  } catch {
    // Ignore query errors
  }

  let current: HTMLElement | null = clonedElement;
  while (current) {
    current.classList.remove('dark');
    current.style.setProperty('background-color', '#ffffff', 'important');
    current.style.setProperty('background', '#ffffff', 'important');
    current.style.setProperty('color', '#111827', 'important');
    if (current !== clonedElement) {
      current.style.setProperty('position', 'relative', 'important');
      current.style.setProperty('left', '0', 'important');
      current.style.setProperty('top', '0', 'important');
      current.style.setProperty('opacity', '1', 'important');
      current.style.setProperty('visibility', 'visible', 'important');
    }
    current = current.parentElement;
  }

  clonedElement.classList.add('pdf-export-root');

  const existingPdfStyle = clonedDoc.getElementById('pdf-export-lightmode-styles');
  if (!existingPdfStyle) {
    const styleEl = clonedDoc.createElement('style');
    styleEl.id = 'pdf-export-lightmode-styles';
    styleEl.textContent = `
      :root, html, body, #root, #app, [data-reactroot], .pdf-export-root, .pdf-export-root * {
        color-scheme: light !important;
        --background: 255 255 255 !important;
        --foreground: 17 24 39 !important;
        --card: 255 255 255 !important;
        --card-foreground: 17 24 39 !important;
        --popover: 255 255 255 !important;
        --popover-foreground: 17 24 39 !important;
        --primary: 30 58 138 !important;
        --primary-foreground: 255 255 255 !important;
        --secondary: 243 244 246 !important;
        --secondary-foreground: 17 24 39 !important;
        --muted: 243 244 246 !important;
        --muted-foreground: 75 85 99 !important;
        --accent: 243 244 246 !important;
        --accent-foreground: 17 24 39 !important;
        --border: 229 231 235 !important;
      }

      html, body, #root, #app {
        background-color: #ffffff !important;
        background: #ffffff !important;
        color: #111827 !important;
      }

      .pdf-export-root {
        background-color: #ffffff !important;
        background: #ffffff !important;
        color: #111827 !important;
        box-shadow: none !important;
      }

      .pdf-export-root div,
      .pdf-export-root section,
      .pdf-export-root article {
        color: #111827;
      }

      /* Specific section cards */
      .pdf-export-root [class*="bg-gray-50"],
      .pdf-export-root [class*="bg-slate-50"],
      .pdf-export-root [class*="bg-neutral-50"] {
        background-color: #f9fafb !important;
        color: #111827 !important;
        border-color: #e5e7eb !important;
      }
      .pdf-export-root [class*="bg-emerald-50"] {
        background-color: #ecfdf5 !important;
        color: #064e3b !important;
        border-color: #a7f3d0 !important;
      }
      .pdf-export-root [class*="bg-blue-50"] {
        background-color: #eff6ff !important;
        color: #111827 !important;
        border-color: #bfdbfe !important;
      }
      .pdf-export-root [class*="bg-indigo-50"] {
        background-color: #eef2ff !important;
        color: #111827 !important;
        border-color: #c7d2fe !important;
      }
      .pdf-export-root [class*="bg-purple-50"] {
        background-color: #faf5ff !important;
        color: #111827 !important;
        border-color: #e9d5ff !important;
      }
      .pdf-export-root [class*="bg-purple-100"] {
        background-color: #f3e8ff !important;
        color: #581c87 !important;
        border-color: #e9d5ff !important;
      }
      .pdf-export-root [class*="bg-amber-50"] {
        background-color: #fffbeb !important;
        color: #111827 !important;
        border-color: #fde68a !important;
      }

      /* Dark header banners and badges */
      .pdf-export-root .bg-emerald-800,
      .pdf-export-root .bg-emerald-900 {
        background-color: #065f46 !important;
        color: #ffffff !important;
      }
      .pdf-export-root .bg-emerald-100 {
        background-color: #d1fae5 !important;
        color: #065f46 !important;
      }
      .pdf-export-root .bg-blue-900,
      .pdf-export-root .bg-blue-800,
      .pdf-export-root .bg-indigo-900 {
        background-color: #1e3a8a !important;
        color: #ffffff !important;
      }
      .pdf-export-root .bg-purple-900,
      .pdf-export-root .bg-purple-800 {
        background-color: #581c87 !important;
        color: #ffffff !important;
      }

      /* Force ALL text inside dark banners/headers/table headers to be white */
      .pdf-export-root .bg-blue-900 *,
      .pdf-export-root .bg-blue-800 *,
      .pdf-export-root .bg-purple-900 *,
      .pdf-export-root .bg-purple-800 *,
      .pdf-export-root .bg-emerald-800 *,
      .pdf-export-root .bg-indigo-900 *,
      .pdf-export-root tr.bg-blue-900 *,
      .pdf-export-root tr.bg-blue-800 *,
      .pdf-export-root tr.bg-purple-900 *,
      .pdf-export-root tr.bg-indigo-900 * {
        color: #ffffff !important;
      }

      /* Headings */
      .pdf-export-root h1 { color: #111827 !important; }
      .pdf-export-root h2,
      .pdf-export-root h3 { color: #1e3a8a !important; }
      .pdf-export-root h4 { color: #1e3a8a; }
      .pdf-export-root .text-purple-950,
      .pdf-export-root .text-purple-900,
      .pdf-export-root .text-purple-800,
      .pdf-export-root h3.text-purple-950 { color: #581c87 !important; }
      .pdf-export-root .text-emerald-950,
      .pdf-export-root .text-emerald-900,
      .pdf-export-root .text-emerald-800 { color: #064e3b !important; }
      .pdf-export-root .text-emerald-700,
      .pdf-export-root .text-emerald-600 { color: #047857 !important; }

      /* Paragraphs & Text */
      .pdf-export-root p,
      .pdf-export-root li,
      .pdf-export-root td { color: #1f2937; }
      .pdf-export-root strong,
      .pdf-export-root b { color: #111827; }

      /* Explicit Protection for White Badges & Headers */
      .pdf-export-root .text-white,
      .pdf-export-root .bg-emerald-700,
      .pdf-export-root .bg-emerald-800,
      .pdf-export-root .bg-indigo-900,
      .pdf-export-root .bg-indigo-800,
      .pdf-export-root .bg-purple-900,
      .pdf-export-root [style*="color: #ffffff"],
      .pdf-export-root [style*="color:#ffffff"],
      .pdf-export-root [style*="color: white"],
      .pdf-export-root [style*="color:white"] {
        color: #ffffff !important;
      }

      /* Tables */
      .pdf-export-root table {
        background-color: #ffffff !important;
        color: #111827 !important;
        border-collapse: collapse !important;
      }
      .pdf-export-root tr { color: #111827 !important; }
      .pdf-export-root tr.bg-white { background-color: #ffffff !important; }
      .pdf-export-root tr.bg-gray-50,
      .pdf-export-root tr.bg-slate-50 { background-color: #f9fafb !important; }
      .pdf-export-root tr.bg-blue-900,
      .pdf-export-root tr.bg-blue-800,
      .pdf-export-root tr.bg-indigo-900 {
        background-color: #1e3a8a !important;
        color: #ffffff !important;
      }
      .pdf-export-root tr.bg-purple-900,
      .pdf-export-root tr.bg-purple-800 {
        background-color: #581c87 !important;
        color: #ffffff !important;
      }
      .pdf-export-root tr.bg-blue-900 th,
      .pdf-export-root tr.bg-blue-800 th,
      .pdf-export-root tr.bg-indigo-900 th {
        color: #ffffff !important;
        background-color: #1e3a8a !important;
      }
      .pdf-export-root tr.bg-purple-900 th,
      .pdf-export-root tr.bg-purple-800 th {
        color: #ffffff !important;
        background-color: #581c87 !important;
      }
      .pdf-export-root td,
      .pdf-export-root th { border-color: #d1d5db !important; }
    `;
    if (clonedDoc.head) {
      clonedDoc.head.appendChild(styleEl);
    } else if (clonedDoc.body) {
      clonedDoc.body.appendChild(styleEl);
    }
  }

  const styleElements = clonedDoc.querySelectorAll('style');
  styleElements.forEach((styleEl) => {
    if (
      styleEl.textContent &&
      (styleEl.textContent.includes('oklch') ||
        styleEl.textContent.includes('oklab') ||
        styleEl.textContent.includes('color('))
    ) {
      styleEl.textContent = replaceUnsupportedColorsInString(styleEl.textContent);
    }
  });

  try {
    const sheets = Array.from(clonedDoc.styleSheets);
    sheets.forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach((rule: any) => {
          if (
            rule.cssText &&
            (rule.cssText.includes('oklch') ||
              rule.cssText.includes('oklab') ||
              rule.cssText.includes('color('))
          ) {
            if (rule.style) {
              for (let i = 0; i < rule.style.length; i++) {
                const prop = rule.style[i];
                const val = rule.style.getPropertyValue(prop);
                if (
                  val &&
                  (val.includes('oklch') || val.includes('oklab') || val.includes('color('))
                ) {
                  const newVal = replaceUnsupportedColorsInString(val);
                  rule.style.setProperty(prop, newVal, rule.style.getPropertyPriority(prop));
                }
              }
            }
          }
        });
      } catch {
        // Ignore cross-origin stylesheet errors
      }
    });
  } catch {
    // Ignore styleSheets iteration errors
  }

  const defaultView = clonedDoc.defaultView || window;
  const elementsToProcess = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))];
  elementsToProcess.forEach((node) => {
    const el = node as HTMLElement;
    if (!el || !el.style) return;

    el.classList.remove('dark');

    const styleAttr = el.getAttribute('style');
    if (
      styleAttr &&
      (styleAttr.includes('oklch') ||
        styleAttr.includes('oklab') ||
        styleAttr.includes('color('))
    ) {
      el.setAttribute('style', replaceUnsupportedColorsInString(styleAttr));
    }

    try {
      const computed = defaultView.getComputedStyle(el);
      const propsToCheck = [
        'color',
        'background-color',
        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'outline-color',
        'fill',
        'stroke',
        'box-shadow',
        'text-shadow',
      ];

      propsToCheck.forEach((prop) => {
        const val = computed.getPropertyValue(prop);
        if (
          val &&
          (val.includes('oklch') || val.includes('oklab') || val.includes('color('))
        ) {
          const newVal = replaceUnsupportedColorsInString(val);
          el.style.setProperty(prop, newVal, 'important');
        }
      });

      const bg = computed.backgroundColor;
      if (bg) {
        const rgbaMatch = bg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
        if (rgbaMatch) {
          const r = parseInt(rgbaMatch[1], 10);
          const g = parseInt(rgbaMatch[2], 10);
          const b = parseInt(rgbaMatch[3], 10);
          const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;

          const isDarkBadgeOrHeader =
            el.tagName === 'TH' ||
            !!el.closest('.bg-blue-900, .bg-blue-800, .bg-purple-900, .bg-purple-800, .bg-emerald-800, .bg-emerald-900, .bg-indigo-900, .bg-emerald-700') ||
            el.classList.contains('bg-emerald-800') ||
            el.classList.contains('bg-emerald-900') ||
            el.classList.contains('bg-blue-900') ||
            el.classList.contains('bg-blue-800') ||
            el.classList.contains('bg-purple-900') ||
            el.classList.contains('bg-purple-800') ||
            el.classList.contains('bg-indigo-900') ||
            el.classList.contains('bg-emerald-700');

          if (a > 0.1 && r < 70 && g < 70 && b < 70 && !isDarkBadgeOrHeader) {
            console.warn('[PDF DARK ELEMENT FIXED]', el, bg);
            el.style.setProperty('background-color', '#ffffff', 'important');
            el.style.setProperty('color', '#111827', 'important');
          } else if (a > 0 && a < 1 && !isDarkBadgeOrHeader) {
            const flatR = Math.round(r * a + 255 * (1 - a));
            const flatG = Math.round(g * a + 255 * (1 - a));
            const flatB = Math.round(b * a + 255 * (1 - a));
            el.style.setProperty('background-color', `rgb(${flatR}, ${flatG}, ${flatB})`, 'important');
          }
        }
      }

      const fg = computed.color;
      if (fg) {
        const fgMatch = fg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (fgMatch) {
          const fr = parseInt(fgMatch[1], 10);
          const fgG = parseInt(fgMatch[2], 10);
          const fb = parseInt(fgMatch[3], 10);

          const isDarkBadgeOrHeader =
            el.tagName === 'TH' ||
            !!el.closest('.bg-blue-900, .bg-blue-800, .bg-purple-900, .bg-purple-800, .bg-emerald-800, .bg-emerald-900, .bg-indigo-900, .bg-emerald-700') ||
            el.classList.contains('bg-emerald-800') ||
            el.classList.contains('bg-emerald-900') ||
            el.classList.contains('bg-blue-900') ||
            el.classList.contains('bg-blue-800') ||
            el.classList.contains('bg-purple-900') ||
            el.classList.contains('bg-purple-800') ||
            el.classList.contains('bg-indigo-900') ||
            el.classList.contains('text-white');

          if (!isDarkBadgeOrHeader && fr > 210 && fgG > 210 && fb > 210) {
            el.style.setProperty('color', '#111827', 'important');
          }
        }
      }
    } catch {
      // Ignore getComputedStyle errors
    }
  });
};

/**
 * Ensures all <img> elements inside a container are fully loaded and decoded before canvas rendering.
 */
export async function waitForImagesToLoad(container: HTMLElement): Promise<void> {
  if (!container) return;
  const images = Array.from(container.querySelectorAll('img'));

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        let resolved = false;
        const done = () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };

        if (img.complete && img.naturalWidth > 0) {
          done();
        } else {
          img.onload = done;
          img.onerror = done;
          setTimeout(done, 3000);
        }
      });
    })
  );
}

/**
 * 🎯 DETEKSI SELA BARIS PRESISI:
 * Mencari sela kosong antar-kalimat tanpa piksel teks gelap (r,g,b < 160).
 */
const findSafeCutY = (
  canvasCtx: CanvasRenderingContext2D,
  width: number,
  idealY: number,
  maxScanBack: number
): number => {
  const minY = Math.max(0, idealY - maxScanBack);
  
  for (let y = Math.floor(idealY); y >= Math.ceil(minY); y--) {
    const imgData = canvasCtx.getImageData(0, y, width, 1).data;
    let hasDarkTextPixel = false;

    for (let x = 0; x < width * 4; x += 16) {
      const r = imgData[x];
      const g = imgData[x + 1];
      const b = imgData[x + 2];
      const a = imgData[x + 3];

      if (a > 50 && (r < 160 || g < 160 || b < 160)) {
        hasDarkTextPixel = true;
        break;
      }
    }

    if (!hasDarkTextPixel) {
      return Math.max(minY, y - 4);
    }
  }

  return idealY;
};

/**
 * Captures an HTML element and converts it into a high-quality F4 multi-page PDF Blob
 */
export const generatePdfFromElement = async (
  elementIdOrEl: string | HTMLElement,
  options: PdfServiceOptions
): Promise<{ blob: Blob; sizeKb: number }> => {
  let targetElement: HTMLElement | null = null;

  if (typeof elementIdOrEl === 'string') {
    // Cari elemen aktif visible di layar terlebih dahulu, baru fallback ke ID asli
    targetElement =
      document.getElementById(`${elementIdOrEl}-visible`) ||
      document.getElementById(elementIdOrEl) ||
      document.querySelector(`[data-doc-root="${elementIdOrEl}"]`);
  } else if (elementIdOrEl instanceof HTMLElement) {
    targetElement = elementIdOrEl;
  }

  if (!targetElement) {
    throw new Error(
      `Elemen dokumen dengan target "${typeof elementIdOrEl === 'string' ? elementIdOrEl : 'HTMLElement'}" tidak ditemukan dalam DOM.`
    );
  }

  // 1. Pastikan background elemen target secara eksplisit di-set ke '#ffffff' sebelum snapshot
  targetElement.style.backgroundColor = '#ffffff';
  targetElement.style.color = '#111827';

  // 2. Tunggu semua gambar termuat sepenuhnya
  await waitForImagesToLoad(targetElement);

  // 3. Jeda waktu 300ms agar seluruh perubahan warna dan style CSS di layar selesai diproses sepenuhnya
  await new Promise((resolve) => setTimeout(resolve, 300));

  const shouldLandscape = options.isLandscape ?? detectTableWidth(targetElement);
  const orientation = shouldLandscape ? 'landscape' : 'portrait';

  // 📐 UKURAN KERTAS F4 (215 x 330 mm)
  const f4Format: [number, number] = shouldLandscape ? [330, 215] : [215, 330];

  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: f4Format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const marginTop = 18; // mm
  const marginBottom = 18; // mm
  const marginLeft = 15; // mm
  const marginRight = 15; // mm

  const contentWidth = pageWidth - marginLeft - marginRight;
  const contentMaxHeightPerPage = pageHeight - marginTop - marginBottom;

  // 4. html2canvas dengan konfigurasi presisi & opsi yang disesuaikan
  const canvas = await html2canvas(targetElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: shouldLandscape ? 1200 : 900,
    onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
      applyPdfLightModeStyles(clonedDoc, clonedElement);
    },
  });

  const canvasCtx = canvas.getContext('2d', { willReadFrequently: true });
  const pageCanvasHeight = (canvas.width * contentMaxHeightPerPage) / contentWidth;

  let currentY = 0;
  let pageCount = 0;

  while (currentY < canvas.height) {
    if (pageCount > 0) {
      pdf.addPage(f4Format, orientation);
    }
    pageCount++;

    const remainingHeight = canvas.height - currentY;
    let sliceHeight = Math.min(pageCanvasHeight, remainingHeight);

    if (currentY + sliceHeight < canvas.height && canvasCtx) {
      const maxScan = Math.min(250, sliceHeight * 0.25);
      const safeCutY = findSafeCutY(canvasCtx, canvas.width, currentY + sliceHeight, maxScan);
      sliceHeight = safeCutY - currentY;
    }

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        currentY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );
    }

    const sliceImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
    const sliceHeightMM = (sliceHeight * contentWidth) / canvas.width;

    pdf.addImage(
      sliceImgData,
      'JPEG',
      marginLeft,
      marginTop,
      contentWidth,
      sliceHeightMM
    );

    currentY += sliceHeight;
  }

  const totalPages = pageCount;

  // 🔍 1. PEMINDAIAN NAMA GURU MULTI-PATH & AUTOSCRAPING DOM
  let extractedNamaGuru = 
    options.namaGuru || 
    options.guru || 
    options.penyusun || 
    options.identitas?.namaGuru || 
    options.identitas?.guru || 
    options.identitas?.penyusun || 
    options.data?.identitas?.namaGuru || 
    options.data?.identitas?.guru || 
    options.data?.namaGuru || 
    '';

  // Fallback: Jika nama guru masih kosong, pindaiah elemen DOM langsung
  if (!extractedNamaGuru && targetElement) {
    const domGuruEl = targetElement.querySelector(
      '[data-nama-guru], .nama-guru, #namaGuru, #guru, .guru-pengampu, [data-guru]'
    );
    if (domGuruEl && domGuruEl.textContent) {
      extractedNamaGuru = domGuruEl.textContent.replace(/^Nama\s*Guru\s*:\s*/i, '').trim();
    }
  }

  const namaSekolah = 
    options.sekolah || 
    options.identitas?.sekolah || 
    options.data?.identitas?.sekolah || 
    'Satuan Pendidikan';

  // Format akhir teks footer
  const footerText = `CopyRight©Norbertus Suryadi — ${namaSekolah || 'SMA Xaverius 1 Palembang'} | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning`;

  // Header & Footer Drawing
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);

    // Header line & text
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.2);
    pdf.line(marginLeft, marginTop - 4, pageWidth - marginRight, marginTop - 4);

    const docTitleText = (options.docTitle || 'DOKUMEN PEMBELAJARAN').toUpperCase();
    pdf.text(docTitleText, marginLeft, marginTop - 6);

    // Footer line & text
    pdf.line(marginLeft, pageHeight - marginBottom + 3, pageWidth - marginRight, pageHeight - marginBottom + 3);

    const pageNumText = `Halaman ${i} dari ${totalPages}`;

    pdf.text(footerText, marginLeft, pageHeight - marginBottom + 8);
    pdf.text(pageNumText, pageWidth - marginRight, pageHeight - marginBottom + 8, {
      align: 'right',
    });
  }

  const blob = pdf.output('blob');
  const sizeKb = Math.round((blob.size / 1024) * 100) / 100;
  return { blob, sizeKb };
};

/**
 * High-level helper to generate and download a document PDF from an element ID or HTMLElement.
 */
export const downloadPdfFromElement = async (
  elementIdOrEl: string | HTMLElement,
  options: PdfServiceOptions
): Promise<PdfDownloadResult> => {
  try {
    const { blob, sizeKb } = await generatePdfFromElement(elementIdOrEl, options);
    const objectUrl = URL.createObjectURL(blob);
    const triggered = downloadBlob(blob, options.filename);

    return {
      success: true,
      blobSizeKb: sizeKb,
      filename: options.filename,
      blob,
      objectUrl,
      triggered,
    };
  } catch (error: any) {
    console.error(`downloadPdfFromElement error [${options.filename}]:`, error);
    return {
      success: false,
      blobSizeKb: 0,
      filename: options.filename,
      triggered: false,
      error: error?.message || 'PDF gagal dibuat.',
    };
  }
};

/**
 * Downloads all 5 documents bundled in a ZIP archive.
 */
export const downloadAllDocumentsZip = async (
  docIds: { [key in 'rpm' | 'lkpd' | 'moodle' | 'asesmen' | 'rubrik']: string },
  meta: { 
    mataPelajaran: string; 
    kelas: string; 
    topik: string; 
    sekolah: string; 
    namaGuru?: string; 
    guru?: string;
    identitas?: any; 
  },
  onProgress?: (statusText: string) => void
): Promise<void> => {
  const zip = new JSZip();

  const docConfigs: {
    key: 'rpm' | 'lkpd' | 'moodle' | 'asesmen' | 'rubrik';
    prefix: 'RPM' | 'LKPD' | 'MOODLE' | 'ASESMEN' | 'RUBRIK';
    title: string;
    isLandscape?: boolean;
  }[] = [
    { key: 'rpm', prefix: 'RPM', title: 'Rencana Pembelajaran Mendalam (RPM)' },
    { key: 'lkpd', prefix: 'LKPD', title: 'Lembar Kerja Peserta Didik (LKPD)' },
    { key: 'moodle', prefix: 'MOODLE', title: 'Panduan Moodle / E-Learning' },
    { key: 'asesmen', prefix: 'ASESMEN', title: 'Instrumen Asesmen Pembelajaran' },
    { key: 'rubrik', prefix: 'RUBRIK', title: 'Rubrik Penilaian & KKTP', isLandscape: true },
  ];

  for (let i = 0; i < docConfigs.length; i++) {
    const config = docConfigs[i];
    const elementId = docIds[config.key];
    const filename = buildPdfFilename(config.prefix, meta.mataPelajaran, meta.kelas, meta.topik);

    if (onProgress) {
      onProgress(`Membuat PDF ${config.prefix} (${i + 1}/${docConfigs.length})...`);
    }

    const { blob } = await generatePdfFromElement(elementId, {
      filename,
      docTitle: config.title,
      sekolah: meta.sekolah,
      namaGuru: meta.namaGuru || meta.guru,
      identitas: meta.identitas,
      isLandscape: config.isLandscape,
    });

    zip.file(filename, blob);
  }

  if (onProgress) onProgress('Mengompresi file ZIP...');

  const zipFilename = `DOKUMEN_RPM_${sanitizeFilename(meta.mataPelajaran)}_${sanitizeFilename(meta.kelas)}_${sanitizeFilename(meta.topik)}.zip`;
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  downloadBlob(zipBlob, zipFilename);
};

/**
 * Prints a specific document element cleanly by cloning into an isolated print window
 */
export const printDocumentElement = (elementIdOrNode?: string | HTMLElement): void => {
  let printContent: HTMLElement | null = null;

  if (typeof elementIdOrNode === 'string') {
    printContent =
      document.getElementById(elementIdOrNode) ||
      document.getElementById(`${elementIdOrNode}-visible`) ||
      document.getElementById('document-preview-container');
  } else if (elementIdOrNode instanceof HTMLElement) {
    printContent = elementIdOrNode;
  } else {
    printContent =
      document.getElementById('document-preview-container') ||
      (document.querySelector('[id$="-visible"]') as HTMLElement);
  }

  if (!printContent) {
    window.print();
    return;
  }

  // Get all style tags and link stylesheet tags from current document
  const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Cetak Dokumen</title>
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            margin: 0;
            padding: 15px;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .page-break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div id="document-preview-container">
          ${printContent.innerHTML}
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.focus();
              window.print();
              setTimeout(() => {
                window.close();
              }, 500);
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const pdfService = {
  sanitizeFilename,
  buildPdfFilename,
  downloadBlob,
  openPdfInNewTab,
  openPdf: openPdfInNewTab,
  generateTestPdf,
  createPdfBlob: generateTestPdf,
  testPdfDownload,
  generatePdfFromElement,
  generatePdf: generatePdfFromElement,
  downloadPdfFromElement,
  downloadPdf: downloadPdfFromElement,
  downloadAllDocumentsZip,
  replaceUnsupportedColorsInString,
  applyPdfLightModeStyles,
  printDocumentElement,
};

export default pdfService;