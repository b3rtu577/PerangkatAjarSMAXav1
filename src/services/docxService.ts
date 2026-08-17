import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
  VerticalAlign,
  convertInchesToTwip,
  Footer,
  PageNumber,
  ImageRun,
} from 'docx';
import JSZip from 'jszip';
import {
  DocType,
  GeneratedData,
  IdentitasRPM,
  RpmDoc,
  LkpdDoc,
  MoodleDoc,
  AsesmenDoc,
  RubrikDoc,
  SoalPgDiagnostik,
  SoalPgKompleks,
  BarisRubrik,
} from '../types';
import { SCHOOL_IDENTITY } from '../data/schoolConfig';
import {
  renderTextValue,
  cleanDuplicateNotasiHeader,
  cleanAcademicTitles,
  sanitizeTypoAndSpelling,
  getActivityPhrasingForSubject,
  stripHtmlTags,
  getMeetingStepTimes,
} from '../utils/formatUtils';
import {
  calculateMeetingAllocations,
  ComputedMeetingAllocation,
  generateDefaultAtpItems,
  generateDefaultMateriItems,
} from './rpmService';
import { formatCleanKelasFaseSemester, isInformatikaSubject } from './rpmPrompt';

/**
 * Sanitizes strings for safe filename usage.
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
 * Builds standardized DOCX filenames.
 */
export const buildDocxFilename = (
  prefix: 'RPM' | 'LKPD' | 'MOODLE' | 'ASESMEN' | 'RUBRIK' | string,
  mataPelajaran: string,
  kelas: string,
  topik: string
): string => {
  const cleanPrefix = sanitizeFilename(prefix);
  const cleanMapel = sanitizeFilename(mataPelajaran);
  const cleanKelas = sanitizeFilename(kelas);
  const cleanTopik = sanitizeFilename(topik);
  return `${cleanPrefix}_${cleanMapel}_${cleanKelas}_${cleanTopik}.docx`;
};

/**
 * Downloads a Blob as a file in the browser.
 */
export const downloadDocxBlob = (blob: Blob, filename: string): boolean => {
  if (!(blob instanceof Blob) || blob.size <= 0) {
    throw new Error('DOCX Blob kosong atau tidak valid.');
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
  }, 3000);

  return true;
};

// ==========================================
// STYLING CONSTANTS FOR DOCX (NAVY THEME)
// ==========================================
const COLOR_PRIMARY = '1E3A8A'; // Navy Blue (Hex without #)
const COLOR_SUCCESS = '059669'; // Emerald Green
const COLOR_DARK_TEXT = '0F172A'; // Slate 900
const COLOR_MUTED_TEXT = '475569'; // Slate 600
const COLOR_BG_LIGHT = 'F8FAFC'; // Slate 50
const COLOR_BG_HEADER = '1E3A8A'; // Navy
const COLOR_BORDER = 'CBD5E1'; // Slate 300
const FONT_FAMILY = 'Calibri';

const thinBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: COLOR_BORDER,
};

const cellBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
};

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'FFFFFF',
};

const transparentBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
};

type AlignmentVal = (typeof AlignmentType)[keyof typeof AlignmentType];

/**
 * Creates Unified Document Footer
 */
const createDocumentFooter = (): Footer => {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 40 },
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
        },
        children: [
          new TextRun({
            text: 'CopyRight@Norbertus Suryadi — SMA Xaverius 1 Palembang | Modul Ajar Kurikulum Merdeka Berbasis Deep Learning  •  Halaman ',
            font: FONT_FAMILY,
            size: 16, // 8pt
            color: COLOR_MUTED_TEXT,
            italics: true,
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            font: FONT_FAMILY,
            size: 16,
            bold: true,
            color: COLOR_PRIMARY,
          }),
        ],
      }),
    ],
  });
};

/**
 * Creates Code / Pseudocode / Notation Block
 */
const createCodeBlock = (code: string): Table => {
  const lines = (code || '').split('\n');
  const paragraphs = lines.map(
    (line) =>
      new Paragraph({
        spacing: { before: 15, after: 15 },
        children: [
          new TextRun({
            text: line || ' ',
            font: 'Consolas',
            size: 16, // 8pt
            color: '065F46', // Emerald Dark
          }),
        ],
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
            borders: cellBorders,
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: paragraphs,
          }),
        ],
      }),
    ],
  });
};

export interface KopLogos {
  yxp?: Uint8Array | null;
  xaverius?: Uint8Array | null;
}

let cachedYxpBuffer: Uint8Array | null = null;
let cachedXaveriusBuffer: Uint8Array | null = null;

export const loadKopLogoBuffers = async (): Promise<KopLogos> => {
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    if (!cachedYxpBuffer) {
      try {
        const res = await fetch('/yxp.png');
        if (res.ok) {
          cachedYxpBuffer = new Uint8Array(await res.arrayBuffer());
        }
      } catch (e) {
        console.warn('Could not load /yxp.png for docx', e);
      }
    }
    if (!cachedXaveriusBuffer) {
      try {
        const res = await fetch('/logo-xaverius.png');
        if (res.ok) {
          cachedXaveriusBuffer = new Uint8Array(await res.arrayBuffer());
        }
      } catch (e) {
        console.warn('Could not load /logo-xaverius.png for docx', e);
      }
    }
  }
  return { yxp: cachedYxpBuffer, xaverius: cachedXaveriusBuffer };
};

/**
 * Creates Kop / School Header with dual logos (YXP kiri & SMA Xaverius 1 kanan)
 */
const createSchoolHeader = (
  docTitle: string,
  subtitle?: string,
  schoolName?: string,
  logos?: KopLogos
): Table => {
  const finalSchool = (schoolName || SCHOOL_IDENTITY.name || 'SMA Xaverius 1 Palembang').toUpperCase();

  const titleParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 20, line: 240 },
      children: [
        new TextRun({
          text: 'YAYASAN XAVERIUS PALEMBANG',
          font: FONT_FAMILY,
          bold: true,
          size: 20, // 10pt
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 30, line: 260 },
      children: [
        new TextRun({
          text: finalSchool,
          font: FONT_FAMILY,
          bold: true,
          size: 26, // 13pt
          color: COLOR_DARK_TEXT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 30, line: 260 },
      children: [
        new TextRun({
          text: docTitle.toUpperCase(),
          font: FONT_FAMILY,
          bold: true,
          size: 22, // 11pt
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60, line: 260 },
      children: [
        new TextRun({
          text: subtitle || 'Kurikulum Merdeka & Pendekatan Deep Learning (Memahami, Mengaitkan, Menerapkan)',
          font: FONT_FAMILY,
          italics: true,
          size: 17, // 8.5pt
          color: COLOR_MUTED_TEXT,
        }),
      ],
    }),
  ];

  // If dual logos are available, generate 3-column table
  if (logos?.yxp || logos?.xaverius) {
    const leftCellChildren: Paragraph[] = [];
    if (logos.yxp) {
      leftCellChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [
            new ImageRun({
              data: logos.yxp,
              type: 'png',
              transformation: { width: 75, height: 82 },
            }),
          ],
        })
      );
    }

    const rightCellChildren: Paragraph[] = [];
    if (logos.xaverius) {
      rightCellChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [
            new ImageRun({
              data: logos.xaverius,
              type: 'png',
              transformation: { width: 75, height: 82 },
            }),
          ],
        })
      );
    }

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: noBorder,
        left: noBorder,
        right: noBorder,
        bottom: { style: BorderStyle.DOUBLE, size: 18, color: '000000' },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              borders: transparentBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: leftCellChildren.length ? leftCellChildren : [new Paragraph({ children: [] })],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: transparentBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: titleParagraphs,
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              borders: transparentBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: rightCellChildren.length ? rightCellChildren : [new Paragraph({ children: [] })],
            }),
          ],
        }),
      ],
    });
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: noBorder,
      left: noBorder,
      right: noBorder,
      bottom: { style: BorderStyle.DOUBLE, size: 18, color: '000000' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: transparentBorders,
            children: titleParagraphs,
          }),
        ],
      }),
    ],
  });
};

/**
 * Creates Section Banner Title
 */
const createSectionHeading = (title: string, color: string = COLOR_PRIMARY): Paragraph => {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        bold: true,
        size: 22, // 11pt
        color: color,
      }),
    ],
  });
};

/**
 * Creates Table Header Cell
 */
const createHeaderCell = (
  text: string,
  widthPercent: number,
  alignment: AlignmentVal = AlignmentType.CENTER,
  colSpan?: number
): TableCell => {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    columnSpan: colSpan,
    shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    borders: cellBorders,
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment,
        spacing: { before: 30, after: 30, line: 276 },
        children: [
          new TextRun({
            text,
            font: FONT_FAMILY,
            bold: true,
            size: 19, // 9.5pt
            color: 'FFFFFF',
          }),
        ],
      }),
    ],
  });
};

/**
 * Creates Table Data Cell
 */
const createDataCell = (
  content: string | Paragraph[],
  widthPercent: number,
  isBold = false,
  bgColor = 'FFFFFF',
  alignment: AlignmentVal = AlignmentType.LEFT,
  colSpan?: number
): TableCell => {
  let paragraphs: Paragraph[] = [];

  if (typeof content === 'string') {
    const lines = content.split('\n');
    paragraphs = lines.map(
      (line) =>
        new Paragraph({
          alignment,
          spacing: { before: 25, after: 25, line: 276 },
          children: [
            new TextRun({
              text: line || ' ',
              font: FONT_FAMILY,
              bold: isBold,
              size: 19, // 9.5pt
              color: COLOR_DARK_TEXT,
            }),
          ],
        })
    );
  } else {
    paragraphs = content;
  }

  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    columnSpan: colSpan,
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    borders: cellBorders,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: paragraphs,
  });
};

/**
 * Helper to create Standard Identitas Table with prominent "Guru Mapel"
 */
const createStandardIdentitasTable = (
  currentIdentitas: IdentitasRPM & { fase?: string; semester?: string },
  totalSesi: number,
  _meetingAllocations: ComputedMeetingAllocation[]
): Table => {
  const guruMapel = cleanAcademicTitles(
    sanitizeTypoAndSpelling(
      currentIdentitas.guruMapel ||
      currentIdentitas.namaGuru ||
      currentIdentitas.guru ||
      'Norbertus Suryadi, S.Kom.'
    )
  );

  const kepalaSekolah = cleanAcademicTitles(
    sanitizeTypoAndSpelling(currentIdentitas.kepalaSekolah || 'Dra. Lucia Hastuti, M.Pd.')
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createDataCell('Satuan Pendidikan', 25, true, COLOR_BG_LIGHT),
          createDataCell(currentIdentitas.sekolah || 'SMA Xaverius 1 Palembang', 25),
          createDataCell('Mata Pelajaran', 25, true, COLOR_BG_LIGHT),
          createDataCell(currentIdentitas.mataPelajaran || 'Informatika', 25),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Kelas / Fase / Sem.', 25, true, COLOR_BG_LIGHT),
          createDataCell(formatCleanKelasFaseSemester(currentIdentitas.kelas, currentIdentitas.semester), 25),
          createDataCell('Alokasi Waktu', 25, true, COLOR_BG_LIGHT),
          createDataCell(`${currentIdentitas.alokasiWaktu || '4 JP'} (${totalSesi} Pertemuan)`, 25),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Topik / Materi Pokok', 25, true, COLOR_BG_LIGHT),
          createDataCell(currentIdentitas.topik || 'Berpikir Komputasional & Algoritma', 25),
          createDataCell('Model Pembelajaran', 25, true, COLOR_BG_LIGHT),
          createDataCell(currentIdentitas.modelPembelajaran || 'Problem-Based Learning (PBL)', 25),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Guru Mapel (Pengampu)', 25, true, COLOR_BG_LIGHT),
          createDataCell(guruMapel, 25, true, 'FFFFFF'),
          createDataCell('Kepala Sekolah', 25, true, COLOR_BG_LIGHT),
          createDataCell(kepalaSekolah, 25),
        ],
      }),
    ],
  });
};

/**
 * Creates Signature Block Table
 */
const createSignatureBlock = (
  sekolah: string,
  namaGuru: string,
  nipGuru: string,
  namaKepsek: string,
  nipKepsek: string
): Table => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const cleanNamaKepsek = cleanAcademicTitles(
    sanitizeTypoAndSpelling(namaKepsek || 'Dra. Lucia Hastuti, M.Pd.')
  );
  const cleanNamaGuru = cleanAcademicTitles(
    sanitizeTypoAndSpelling(namaGuru || 'Norbertus Suryadi, S.Kom.')
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: transparentBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: transparentBorders,
            children: [
              new Paragraph({
                spacing: { before: 240, after: 60 },
                children: [new TextRun({ text: 'Mengetahui,', font: FONT_FAMILY, size: 20 })],
              }),
              new Paragraph({
                spacing: { before: 0, after: 600 }, // space for signature
                children: [
                  new TextRun({
                    text: `Kepala ${sekolah || 'SMA Xaverius 1 Palembang'}`,
                    font: FONT_FAMILY,
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: cleanNamaKepsek,
                    font: FONT_FAMILY,
                    bold: true,
                    underline: {},
                    size: 20,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `NIY. ${nipKepsek || '-'}`,
                    font: FONT_FAMILY,
                    size: 18,
                    color: COLOR_MUTED_TEXT,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: transparentBorders,
            children: [
              new Paragraph({
                spacing: { before: 240, after: 60 },
                children: [new TextRun({ text: `Palembang, ${currentDate}`, font: FONT_FAMILY, size: 20 })],
              }),
              new Paragraph({
                spacing: { before: 0, after: 600 }, // space for signature
                children: [
                  new TextRun({
                    text: 'Guru Mata Pelajaran,',
                    font: FONT_FAMILY,
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: cleanNamaGuru,
                    font: FONT_FAMILY,
                    bold: true,
                    underline: {},
                    size: 20,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `NIY. ${nipGuru || '-'}`,
                    font: FONT_FAMILY,
                    size: 18,
                    color: COLOR_MUTED_TEXT,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
};

/**
 * Generates RPM DOCX Document (100% Identik dengan RpmTemplate.tsx)
 */
export const buildRpmDocument = (rpm: RpmDoc, identitas: IdentitasRPM, logos?: KopLogos): Document => {
  const currentIdentitas = { ...identitas, ...rpm.identitas };
  const totalSesi = Math.max(1, parseInt(String(currentIdentitas.jumlahPertemuan || '2'), 10) || 2);
  const meetingAllocations = calculateMeetingAllocations(currentIdentitas.alokasiWaktu, totalSesi);
  const guruMapel =
    currentIdentitas.guruMapel ||
    currentIdentitas.namaGuru ||
    currentIdentitas.guru ||
    'Norbertus Suryadi, S.Kom.';
  const targetDimensi =
    (rpm as any).targetDimensi || 'Penalaran Kritis, Gotong Royong, & Kemandirian';
  const kemitraanBelajar =
    (rpm as any).kemitraanBelajar ||
    'Kolaborasi Orang Tua (pendampingan belajar) & Narasumber Praktisi/Komunitas';
  const lingkunganBelajar =
    (rpm as any).lingkunganBelajar ||
    'Ruang kelas fisik yang kondusif & Lingkungan Digital (LMS Moodle)';
  const refleksiSiswa = (rpm as any).refleksiSiswa || [
    'Apa konsep/materi yang paling menarik dan menantang bagi saya hari ini?',
    'Bagaimana saya akan menerapkan pengetahuan ini dalam kehidupan nyata?',
    'Strategi belajar apa yang paling efektif membantu pemahaman saya?',
  ];

  // 1. Identitas Table
  const identitasTable = createStandardIdentitasTable(currentIdentitas, totalSesi, meetingAllocations);

  // 2. ATP Table
  const atpHeader = new TableRow({
    children: [
      createHeaderCell('Kode TP', 12),
      createHeaderCell('Tujuan Pembelajaran (TP) & Fokus Materi', 38),
      createHeaderCell('Indikator Ketercapaian (IKTP)', 28),
      createHeaderCell('Alokasi Waktu', 10),
      createHeaderCell('Pertemuan Ke-', 12),
    ],
  });

  const rawAtp =
    Array.isArray(rpm.alurTujuanPembelajaran) && rpm.alurTujuanPembelajaran.length === totalSesi
      ? rpm.alurTujuanPembelajaran
      : generateDefaultAtpItems(currentIdentitas);

  const atpRows = rawAtp.slice(0, totalSesi).map((atp, idx) => {
    const iktpStr = Array.isArray(atp.indikatorKetercapaian)
      ? atp.indikatorKetercapaian.join('\n')
      : String(atp.indikatorKetercapaian || '-');

    const allocStr = atp.alokasiWaktuJp || meetingAllocations[idx]?.displayString || '2 JP (90 Menit)';

    const tpContent = atp.fokusMateri
      ? `${renderTextValue(atp.tujuanPembelajaran)}\n🎯 Fokus: ${atp.fokusMateri}`
      : renderTextValue(atp.tujuanPembelajaran);

    let korelasiStr = `Sesi ${atp.pertemuanKe || idx + 1}`;
    if (atp.korelasiDokumen) {
      const parts: string[] = [korelasiStr];
      if (atp.korelasiDokumen.lkpd) parts.push(`📄 ${atp.korelasiDokumen.lkpd}`);
      if (atp.korelasiDokumen.moodle) parts.push(`🌐 ${atp.korelasiDokumen.moodle}`);
      if (atp.korelasiDokumen.asesmen) parts.push(`📊 ${atp.korelasiDokumen.asesmen}`);
      korelasiStr = parts.join('\n');
    }

    return new TableRow({
      children: [
        createDataCell(atp.kodeTp || `TP 10.${idx + 1}`, 12, true, COLOR_BG_LIGHT, AlignmentType.CENTER),
        createDataCell(tpContent, 38),
        createDataCell(renderTextValue(iktpStr), 28),
        createDataCell(allocStr, 10, false, 'FFFFFF', AlignmentType.CENTER),
        createDataCell(korelasiStr, 12, false, COLOR_BG_LIGHT, AlignmentType.CENTER),
      ],
    });
  });

  const atpTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [atpHeader, ...atpRows],
  });

  // 3. Materi Pelajaran & Bahan Ajar Lengkap
  const materiList =
    Array.isArray(rpm.ringkasanMateri) && rpm.ringkasanMateri.length === totalSesi
      ? rpm.ringkasanMateri
      : generateDefaultMateriItems(currentIdentitas);

  const materiElements: (Paragraph | Table)[] = [];
  materiList.slice(0, totalSesi).forEach((mat) => {
    // Header Banner Sesi Materi
    materiElements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 100, type: WidthType.PERCENTAGE },
                shading: { fill: '065F46', type: ShadingType.CLEAR }, // Emerald Header
                borders: cellBorders,
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Pertemuan ${mat.pertemuanKe}: ${mat.topikMateri}`,
                        font: FONT_FAMILY,
                        bold: true,
                        size: 20,
                        color: 'FFFFFF',
                      }),
                      ...(mat.studiKasusKontekstual
                        ? [
                            new TextRun({
                              text: `  [Kasus Kontekstual: ${mat.studiKasusKontekstual}]`,
                              font: FONT_FAMILY,
                              italics: true,
                              size: 18,
                              color: 'D1FAE5',
                            }),
                          ]
                        : []),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // Uraian Teori Lengkap (Justified & Line Height 1.15)
    materiElements.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 80, after: 60, line: 276 },
        children: [
          new TextRun({
            text: renderTextValue(mat.rangkumanTeori),
            font: FONT_FAMILY,
            size: 19,
            color: COLOR_DARK_TEXT,
          }),
        ],
      })
    );

    // Konsep Utama & Definisi Operasional
    if (mat.konsepKunci && mat.konsepKunci.length > 0) {
      materiElements.push(
        new Paragraph({
          spacing: { before: 60, after: 40, line: 276 },
          children: [
            new TextRun({
              text: '🔑 Konsep Utama & Definisi Operasional:',
              font: FONT_FAMILY,
              bold: true,
              size: 19,
              color: '065F46',
            }),
          ],
        })
      );
      mat.konsepKunci.forEach((kk) => {
        materiElements.push(
          new Paragraph({
            bullet: { level: 0 },
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 20, after: 20, line: 276 },
            children: [
              new TextRun({
                text: renderTextValue(kk),
                font: FONT_FAMILY,
                size: 18,
                color: COLOR_DARK_TEXT,
              }),
            ],
          })
        );
      });
    }

    // Contoh Notasi / Struktur
    if (mat.contohNotasi) {
      const notasiLabel = isInformatikaSubject(currentIdentitas.mataPelajaran)
        ? '💻 Notasi Logika, Algoritma & Pseudocode:'
        : '📌 Kerangka Konsep & Alur Analisis:';
      materiElements.push(
        new Paragraph({
          spacing: { before: 60, after: 40, line: 276 },
          children: [
            new TextRun({
              text: notasiLabel,
              font: FONT_FAMILY,
              bold: true,
              size: 19,
              color: COLOR_MUTED_TEXT,
            }),
          ],
        })
      );
      materiElements.push(createCodeBlock(cleanDuplicateNotasiHeader(mat.contohNotasi)));
    }

    // Divider Spacing
    materiElements.push(
      new Paragraph({
        spacing: { before: 60, after: 120 },
        children: [],
      })
    );
  });

  // 4. Rincian Tujuan Pembelajaran (TP)
  const rawTpList =
    Array.isArray(rpm.tujuanPembelajaran) && rpm.tujuanPembelajaran.length > 0
      ? rpm.tujuanPembelajaran
      : rawAtp.map((atp) => `${atp.kodeTp}: ${atp.tujuanPembelajaran}`);

  const tpParagraphs = rawTpList.map((tp, idx) =>
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 30, after: 30, line: 276 },
      children: [
        new TextRun({ text: `${idx + 1}. `, font: FONT_FAMILY, bold: true, size: 19, color: COLOR_PRIMARY }),
        new TextRun({ text: renderTextValue(tp), font: FONT_FAMILY, size: 19, color: COLOR_DARK_TEXT }),
      ],
    })
  );

  // 5. Kerangka Desain Pembelajaran Mendalam
  const kerangkaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'EFF6FF', type: ShadingType.CLEAR }, // Blue 50
            borders: cellBorders,
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [
              new Paragraph({
                spacing: { before: 20, after: 40 },
                children: [
                  new TextRun({ text: '🤝 Kemitraan Belajar:', font: FONT_FAMILY, bold: true, size: 19, color: COLOR_PRIMARY }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: renderTextValue(kemitraanBelajar), font: FONT_FAMILY, size: 18, color: COLOR_DARK_TEXT }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'EFF6FF', type: ShadingType.CLEAR },
            borders: cellBorders,
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [
              new Paragraph({
                spacing: { before: 20, after: 40 },
                children: [
                  new TextRun({ text: '🏫 Lingkungan & Digital:', font: FONT_FAMILY, bold: true, size: 19, color: COLOR_PRIMARY }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: renderTextValue(lingkunganBelajar), font: FONT_FAMILY, size: 18, color: COLOR_DARK_TEXT }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 6. Langkah-Langkah Kegiatan Pembelajaran Per Pertemuan
  const kegiatanElements: (Paragraph | Table)[] = [];
  const rawMeetings = Array.isArray(rpm.pertemuanList) ? rpm.pertemuanList : [];

  for (let i = 0; i < totalSesi; i++) {
    const pNum = i + 1;
    const alloc = meetingAllocations[i] || {
      displayString: '2 JP (90 Menit)',
      meetingMinutes: 90,
      meetingJp: 2,
      minsPerJp: 45,
    };
    const existing = rawMeetings[i];

    const meetingTitle =
      existing?.subTopik ||
      existing?.topik ||
      `${currentIdentitas.topik} — Sesi ${pNum}`;

    const pedagogis =
      existing?.praktikPedagogis ||
      currentIdentitas.modelPembelajaran ||
      'Problem-Based Learning (PBL)';

    // Meeting Header Banner
    kegiatanElements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 100, type: WidthType.PERCENTAGE },
                shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
                borders: cellBorders,
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `PERTEMUAN ${pNum} — Alokasi Waktu: ${alloc.displayString}`,
                        font: FONT_FAMILY,
                        bold: true,
                        size: 20,
                        color: 'FFFFFF',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // Meeting Metadata Box
    const metaChildren: Paragraph[] = [
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({ text: 'Sub-Topik Pembelajaran: ', font: FONT_FAMILY, bold: true, size: 19 }),
          new TextRun({ text: meetingTitle, font: FONT_FAMILY, size: 19 }),
        ],
      }),
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({ text: 'Praktik Pedagogis / Model: ', font: FONT_FAMILY, bold: true, size: 19 }),
          new TextRun({ text: pedagogis, font: FONT_FAMILY, size: 19, color: COLOR_PRIMARY }),
        ],
      }),
    ];

    if (existing?.lkpdFocus) {
      metaChildren.push(
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: 'Fokus LKPD: ', font: FONT_FAMILY, bold: true, size: 19, color: COLOR_SUCCESS }),
            new TextRun({ text: renderTextValue(existing.lkpdFocus), font: FONT_FAMILY, size: 19 }),
          ],
        })
      );
    }

    kegiatanElements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 100, type: WidthType.PERCENTAGE },
                shading: { fill: COLOR_BG_LIGHT, type: ShadingType.CLEAR },
                borders: cellBorders,
                margins: { top: 60, bottom: 60, left: 120, right: 120 },
                children: metaChildren,
              }),
            ],
          }),
        ],
      })
    );

    // Indikator ATP Pertemuan (if present)
    if (existing?.indikatorATP) {
      const indItems = Array.isArray(existing.indikatorATP)
        ? existing.indikatorATP
        : [String(existing.indikatorATP)];

      kegiatanElements.push(
        new Paragraph({
          spacing: { before: 100, after: 40, line: 276 },
          children: [
            new TextRun({
              text: `Indikator Ketercapaian ATP Pertemuan ${pNum}:`,
              font: FONT_FAMILY,
              bold: true,
              size: 19,
              color: COLOR_SUCCESS,
            }),
          ],
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  shading: { fill: 'ECFDF5', type: ShadingType.CLEAR },
                  borders: cellBorders,
                  margins: { top: 60, bottom: 60, left: 120, right: 120 },
                  children: indItems.map((ind: string) =>
                    new Paragraph({
                      spacing: { before: 20, after: 20, line: 276 },
                      children: [
                        new TextRun({
                          text: `• ${ind}`,
                          font: FONT_FAMILY,
                          size: 18,
                          color: COLOR_DARK_TEXT,
                        }),
                      ],
                    })
                  ),
                }),
              ],
            }),
          ],
        })
      );
    }

    // Bahan Ajar (Object format with konsepUtama, studiKasus, etc.)
    if (existing?.bahanAjar && typeof existing.bahanAjar === 'object' && !Array.isArray(existing.bahanAjar)) {
      const bChildren: Paragraph[] = [];
      if (existing.bahanAjar.konsepUtama) {
        bChildren.push(
          new Paragraph({
            spacing: { before: 20, after: 10, line: 276 },
            children: [
              new TextRun({ text: '📌 Konsep & Teori Utama: ', font: FONT_FAMILY, bold: true, size: 19, color: COLOR_PRIMARY }),
              new TextRun({ text: renderTextValue(existing.bahanAjar.konsepUtama), font: FONT_FAMILY, size: 18, color: COLOR_DARK_TEXT }),
            ],
          })
        );
      }
      if (existing.bahanAjar.rangkumanTeori) {
        bChildren.push(
          new Paragraph({
            spacing: { before: 20, after: 10, line: 276 },
            children: [
              new TextRun({ text: '📖 Rangkuman Teori: ', font: FONT_FAMILY, bold: true, size: 19 }),
              new TextRun({ text: renderTextValue(existing.bahanAjar.rangkumanTeori), font: FONT_FAMILY, size: 18, color: COLOR_DARK_TEXT }),
            ],
          })
        );
      }
      if (existing.bahanAjar.studiKasus) {
        bChildren.push(
          new Paragraph({
            spacing: { before: 20, after: 10, line: 276 },
            children: [
              new TextRun({ text: '💼 Studi Kasus Kontekstual: ', font: FONT_FAMILY, bold: true, size: 19, color: 'B45309' }),
              new TextRun({ text: renderTextValue(existing.bahanAjar.studiKasus), font: FONT_FAMILY, size: 18, color: COLOR_DARK_TEXT }),
            ],
          })
        );
      }
      if (existing.bahanAjar.contohNotasi) {
        const notasiLabel = isInformatikaSubject(currentIdentitas.mataPelajaran)
          ? '💻 Notasi / Algoritma / Pseudocode: '
          : '📌 Kerangka Konsep & Alur Analisis: ';
        bChildren.push(
          new Paragraph({
            spacing: { before: 20, after: 10, line: 276 },
            children: [
              new TextRun({ text: notasiLabel, font: FONT_FAMILY, bold: true, size: 19, color: COLOR_SUCCESS }),
              new TextRun({ text: cleanDuplicateNotasiHeader(renderTextValue(existing.bahanAjar.contohNotasi)), font: 'Consolas', size: 17, color: '1E293B' }),
            ],
          })
        );
      }

      if (bChildren.length > 0) {
        kegiatanElements.push(
          new Paragraph({
            spacing: { before: 120, after: 40, line: 276 },
            children: [
              new TextRun({
                text: `Bahan Ajar Eksploratif Pertemuan ${pNum}:`,
                font: FONT_FAMILY,
                bold: true,
                size: 20,
                color: COLOR_PRIMARY,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                    borders: cellBorders,
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    children: bChildren,
                  }),
                ],
              }),
            ],
          })
        );
      }
    }

    // Materi Pembelajaran Pertemuan (ensure full A to F list if array exists)
    if (existing?.materiPembelajaran && Array.isArray(existing.materiPembelajaran) && existing.materiPembelajaran.length > 0) {
      const materiList = existing.materiPembelajaran;

      const mRows: TableRow[] = materiList.map((m: any, mIdx: number) => {
        const abjad = typeof m === 'object' && m.abjad ? m.abjad : String.fromCharCode(65 + mIdx);
        const judul = typeof m === 'object' ? m.judul || m.subJudul || '' : '';
        const deskripsi = typeof m === 'object' ? m.deskripsi || m.isi || '' : String(m);

        // Split multiline text if any into paragraphs
        const descParagraphs = deskripsi
          .split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) =>
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 20, after: 30, line: 276 },
              children: [
                new TextRun({
                  text: line,
                  font: FONT_FAMILY,
                  size: 18,
                  color: COLOR_DARK_TEXT,
                }),
              ],
            })
          );

        return new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { fill: mIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR },
              borders: cellBorders,
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [
                new Paragraph({
                  spacing: { before: 20, after: 30, line: 276 },
                  children: [
                    new TextRun({
                      text: `${abjad}. ${judul}${judul ? ': ' : ''}`,
                      font: FONT_FAMILY,
                      bold: true,
                      size: 19,
                      color: COLOR_PRIMARY,
                    }),
                  ],
                }),
                ...(descParagraphs.length > 0
                  ? descParagraphs
                  : [
                      new Paragraph({
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { before: 20, after: 20, line: 276 },
                        children: [
                          new TextRun({
                            text: deskripsi,
                            font: FONT_FAMILY,
                            size: 18,
                            color: COLOR_DARK_TEXT,
                          }),
                        ],
                      }),
                    ]),
              ],
            }),
          ],
        });
      });

      kegiatanElements.push(
        new Paragraph({
          spacing: { before: 120, after: 40, line: 276 },
          children: [
            new TextRun({
              text: `Uraian Sub-Materi & Bahan Ajar Pertemuan ${pNum} (Poin A — F):`,
              font: FONT_FAMILY,
              bold: true,
              size: 20,
              color: COLOR_PRIMARY,
            }),
          ],
        })
      );
      kegiatanElements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: mRows,
        })
      );
    }

    const meetingStepTimes = getMeetingStepTimes(alloc.meetingJp, alloc.minsPerJp, alloc.meetingMinutes);
    const mapel = currentIdentitas.mataPelajaran || '';
    const phrasing = getActivityPhrasingForSubject(mapel);
    const isInfo = isInformatikaSubject(mapel);

    const fallbackGuruInti = isInfo
      ? 'Guru menyajikan studi kasus otentik berbasis Deep Learning, membimbing penyelidikan kelompok dengan LKPD, memfasilitasi perancangan solusi komputasional, dan mengarahkan presentasi.'
      : `Guru menyajikan studi kasus otentik berbasis Deep Learning, membimbing penyelidikan kelompok dengan LKPD, memfasilitasi ${phrasing.klausaSiswa}, serta mengarahkan presentasi.`;

    const fallbackSiswaInti = isInfo
      ? 'Peserta didik berkolaborasi aktif dalam kelompok, mengidentifikasi variabel masalah, merumuskan alur algoritma/solusi terstruktur, dan mempresentasikan hasil karya di hadapan kelas.'
      : `Peserta didik berkolaborasi aktif dalam kelompok, mengidentifikasi variabel masalah, ${phrasing.klausaSiswa}, dan menyusun karya terstruktur, serta mempresentasikan hasil karya di hadapan kelas.`;

    let steps: any[] = [];
    if (existing?.langkah && Array.isArray(existing.langkah) && existing.langkah.length > 0) {
      steps = existing.langkah;
    } else if (existing?.kegiatanPembelajaran && typeof existing.kegiatanPembelajaran === 'object') {
      const formatAct = (act: any) => {
        if (Array.isArray(act)) return act.join('\n');
        if (typeof act === 'string') return act;
        return JSON.stringify(act);
      };
      steps = [
        {
          tahap: 'KEGIATAN AWAL (Pendahuluan)',
          alokasiWaktu: meetingStepTimes.pendahuluan,
          aktivitasGuru: formatAct(existing.kegiatanPembelajaran.kegiatanAwal) || 'Guru menyapa peserta didik, memimpin doa bersama, memeriksa presensi kehadiran, serta menyampaikan apersepsi kontekstual dan pertanyaan pemantik.',
          aktivitasSiswa: 'Peserta didik berdoa dengan khidmat, merespons presensi guru, menyimak apersepsi stimulus visual, dan menjawab pertanyaan pemantik secara aktif.',
          prinsipPembelajaran: 'Berkesadaran & Bermakna',
        },
        {
          tahap: 'KEGIATAN INTI - Orientasi Masalah & Penyelidikan Kelompok (PBL)',
          alokasiWaktu: meetingStepTimes.inti,
          aktivitasGuru: formatAct(existing.kegiatanPembelajaran.kegiatanInti) || fallbackGuruInti,
          aktivitasSiswa: fallbackSiswaInti,
          prinsipPembelajaran: 'Memahami & Mengaplikasi',
        },
        {
          tahap: 'KEGIATAN PENUTUP',
          alokasiWaktu: meetingStepTimes.penutup,
          aktivitasGuru: formatAct(existing.kegiatanPembelajaran.kegiatanPenutup) || 'Guru bersama siswa merumuskan kesimpulan pembelajaran, memandu refleksi metakognitif individu, mengarahkan pengunggahan LKPD ke Moodle LMS, dan memimpin doa penutup.',
          aktivitasSiswa: 'Peserta didik merangkum poin esensial materi, mengisi instrumen refleksi diri, mengunggah berkas LKPD ke Moodle LMS, dan berdoa bersama menutup sesi pembelajaran.',
          prinsipPembelajaran: 'Refleksi Diri',
        },
      ];
    } else {
      const stepGuruInti9 = isInfo
        ? '9. Guru membimbing perumusan representasi solusi terstruktur pada lembar kerja LKPD.'
        : `9. Guru membimbing peserta didik ${phrasing.klausaSiswa} dan menyusun hasil karya pada LKPD.`;

      const stepSiswaInti8 = isInfo
        ? '8. Peserta didik merumuskan struktur solusi, notasi prosedural, dan representasi diagram secara rapi.'
        : `8. Peserta didik ${phrasing.klausaSiswa} dan menyusun karya terstruktur secara rapi.`;

      steps = [
        {
          tahap: 'KEGIATAN AWAL (Pendahuluan)',
          alokasiWaktu: meetingStepTimes.pendahuluan,
          aktivitasGuru: `1. Guru menyapa peserta didik dengan hangat, memimpin doa bersama, dan mengecek presensi kehadiran.\n2. Guru mengondisikan kesiapan fisik dan psikis peserta didik agar fokus mengikuti proses pembelajaran.\n3. Guru memberikan apersepsi kontekstual yang relevan dengan ${meetingTitle}.\n4. Guru mengajukan pertanyaan pemantik seputar tantangan nyata pemecahan masalah.\n5. Guru menyampaikan alur tujuan pembelajaran, indikator ketercapaian, serta skenario aktivitas kelompok.\n6. Guru menjelaskan rubrik asesmen unjuk kerja dan format tagihan lembar kerja peserta didik (LKPD).`,
          aktivitasSiswa: `1. Peserta didik berdoa secara khidmat dan merespons presensi guru dengan sopan.\n2. Peserta didik merapikan ruang belajar dan menyiapkan perangkat kerja serta alat tulis untuk berdiskusi.\n3. Peserta didik mengamati stimulus apersepsi dan aktif merespons pertanyaan awal dari guru.\n4. Peserta didik menjawab pertanyaan pemantik berdasarkan pemikiran kritis dan logika analitis.\n5. Peserta didik memahami target pencapaian pembelajaran dan alur pengerjaan tugas sesi ini.\n6. Peserta didik menyimak kriteria rubrik penilaian unjuk kerja yang dipaparkan oleh guru.`,
          prinsipPembelajaran: 'Berkesadaran & Bermakna',
        },
        {
          tahap: 'KEGIATAN INTI - Orientasi Masalah & Penyelidikan Kelompok (PBL)',
          alokasiWaktu: meetingStepTimes.inti,
          aktivitasGuru: `1. Guru menyajikan studi kasus nyata kontekstual mengenai ${meetingTitle}.\n2. Guru memandu peserta didik mengidentifikasi variabel utama, kondisi batasan, dan target penyelesaian masalah.\n3. Guru membagi peserta didik ke dalam kelompok heterogen (4-5 siswa) dan membagikan LKPD.\n4. Guru membimbing kelompok membagi peran kerja (ketua, analis materi, perancang alur solusi, juru bicara).\n5. Guru memaparkan konsep teoretis esensial dan contoh konkret penerapan prosedur penyelesaian masalah.\n6. Guru memfasilitasi penyelidikan kelompok dalam mengeksplorasi dan membedah skenario studi kasus.\n7. Guru memberikan bimbingan terarah (scaffolding) bagi kelompok yang mengalami hambatan logika.\n8. Guru memantau dinamika kolaborasi kelompok dan memastikan partisipasi aktif seluruh anggota tim.\n${stepGuruInti9}\n10. Guru mengarahkan perwakilan kelompok mempresentasikan hasil pemecahan masalah di depan kelas.\n11. Guru memandu sesi tanya jawab dan peer-review antarkelompok untuk menguji keandalan solusi.\n12. Guru memberikan penguatan komprehensif, mengapresiasi inovasi kelompok, dan meluruskan miskonsepsi materi.`,
          aktivitasSiswa: `1. Peserta didik mengamati dan menelaah studi kasus nyata dengan seksama.\n2. Peserta didik mengidentifikasi variabel kunci, aturan pemrosesan, dan kriteria keberhasilan solusi.\n3. Peserta didik berkumpul bersama kelompok kerja yang telah dibentuk dan membuka lembar LKPD.\n4. Peserta didik bermusyawarah membagi tugas internal kelompok sesuai pembagian peran yang disepakati.\n5. Peserta didik menyimak penjelasan materi dan mencatat poin-poin esensial dari guru.\n6. Peserta didik berkolaborasi aktif mendiskusikan langkah penyelesaian masalah dan menyusun alur logika.\n7. Peserta didik berkonsultasi dengan guru jika menemukan kendala logika atau teknis pemecahan masalah.\n${stepSiswaInti8}\n9. Peserta didik melakukan verifikasi dan pengujian mandiri terhadap alur solusi pada lembar kerja.\n10. Perwakilan kelompok memaparkan hasil karya di hadapan kelas secara percaya diri dan komunikatif.\n11. Peserta didik dari kelompok lain menyimak presentasi secara kritis dan memberikan tanggapan konstruktif.\n12. Peserta didik mencatat masukan dan penguatan dari guru serta menyempurnakan dokumen portofolio kelompok.`,
          prinsipPembelajaran: 'Memahami & Mengaplikasi',
        },
        {
          tahap: 'KEGIATAN PENUTUP',
          alokasiWaktu: meetingStepTimes.penutup,
          aktivitasGuru: `1. Guru bersama peserta didik merumuskan kesimpulan komprehensif mengenai pembelajaran hari ini.\n2. Guru memberikan apresiasi positif atas kolaborasi, dedikasi, dan kualitas penalaran kritis kelompok.\n3. Guru menginstruksikan peserta didik mengakses Moodle LMS untuk mengunggah berkas LKPD dan kuis reflektif.\n4. Guru memandu peserta didik melakukan refleksi metakognitif mengenai pemahaman konsep dan strategi belajar.\n5. Guru menyampaikan gambaran tindak lanjut dan persiapan materi untuk sesi berikutnya.\n6. Guru memimpin doa penutup pembelajaran dan menyampaikan salam.`,
          aktivitasSiswa: `1. Peserta didik secara aktif ikut merangkum poin-poin penting dari pembelajaran hari ini.\n2. Peserta didik menerima apresiasi dan umpan balik motivasi dari guru dengan antusias.\n3. Peserta didik mengunggah dokumentasi LKPD ke Moodle LMS dan mengisi instrumen refleksi pembelajaran.\n4. Peserta didik mengidentifikasi konsep yang telah dipahami secara mendalam dan area yang perlu dilatih lagi.\n5. Peserta didik mencatat informasi tindak lanjut dan rencana penugasan mandiri.\n6. Peserta didik berdoa bersama menutup kegiatan belajar dan menjawab salam guru dengan santun.`,
          prinsipPembelajaran: 'Refleksi Diri',
        },
      ];
    }

    // Build 3-Column Meeting Steps Rows (20% Tahap, 65% Deskripsi Aktivitas Guru & Siswa, 15% Alokasi Waktu)
    const stepRows = steps.map((step, stepIdx) => {
      // Clean up Tahap string to remove any embedded duration e.g. "(15 Menit)"
      const cleanTahap = (step.tahap || '')
        .replace(/\s*\(\s*\d+\s*(?:x\s*\d+\s*)?Menit\s*\)/gi, '')
        .trim();

      const stepAlloc =
        stepIdx === 0 || /awal|pendahuluan/i.test(cleanTahap)
          ? meetingStepTimes.pendahuluan
          : stepIdx === 1 || /inti/i.test(cleanTahap)
          ? meetingStepTimes.inti
          : stepIdx === 2 || /penutup|akhir/i.test(cleanTahap)
          ? meetingStepTimes.penutup
          : step.alokasiWaktu || meetingStepTimes.pendahuluan;

      // Formulate Kolom 1 (Tahap Kegiatan)
      const tahapParagraphs: Paragraph[] = [
        new Paragraph({
          spacing: { before: 20, after: 20, line: 276 },
          children: [
            new TextRun({
              text: cleanTahap,
              font: FONT_FAMILY,
              bold: true,
              size: 19,
              color: COLOR_PRIMARY,
            }),
          ],
        }),
      ];

      if (step.prinsipPembelajaran) {
        tahapParagraphs.push(
          new Paragraph({
            spacing: { before: 30, after: 10, line: 276 },
            children: [
              new TextRun({
                text: 'Prinsip Pembelajaran:',
                font: FONT_FAMILY,
                bold: true,
                size: 16,
                color: COLOR_MUTED_TEXT,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 10, after: 20, line: 276 },
            children: [
              new TextRun({
                text: step.prinsipPembelajaran,
                font: FONT_FAMILY,
                italics: true,
                size: 17,
                color: '0284C7', // Sky Blue
              }),
            ],
          })
        );
      }

      // Formulate Kolom 2 (Deskripsi Aktivitas Guru & Siswa)
      const deskripsiParagraphs: Paragraph[] = [];

      // Section: Aktivitas Guru
      deskripsiParagraphs.push(
        new Paragraph({
          spacing: { before: 20, after: 15, line: 276 },
          children: [
            new TextRun({
              text: 'Aktivitas Guru (Pendidik):',
              font: FONT_FAMILY,
              bold: true,
              size: 18,
              color: COLOR_PRIMARY,
            }),
          ],
        })
      );
      (step.aktivitasGuru || '').split('\n').forEach((line) => {
        if (line.trim()) {
          deskripsiParagraphs.push(
            new Paragraph({
              spacing: { before: 15, after: 15, line: 276 },
              children: [
                new TextRun({
                  text: line.trim(),
                  font: FONT_FAMILY,
                  size: 18,
                  color: COLOR_DARK_TEXT,
                }),
              ],
            })
          );
        }
      });

      // Section: Aktivitas Siswa
      deskripsiParagraphs.push(
        new Paragraph({
          spacing: { before: 40, after: 15, line: 276 },
          children: [
            new TextRun({
              text: 'Aktivitas Siswa (Peserta Didik):',
              font: FONT_FAMILY,
              bold: true,
              size: 18,
              color: '065F46', // Emerald
            }),
          ],
        })
      );
      (step.aktivitasSiswa || '').split('\n').forEach((line) => {
        if (line.trim()) {
          deskripsiParagraphs.push(
            new Paragraph({
              spacing: { before: 15, after: 15, line: 276 },
              children: [
                new TextRun({
                  text: line.trim(),
                  font: FONT_FAMILY,
                  size: 18,
                  color: COLOR_DARK_TEXT,
                }),
              ],
            })
          );
        }
      });

      return new TableRow({
        children: [
          // Kolom 1 (20%)
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: COLOR_BG_LIGHT, type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.TOP,
            borders: cellBorders,
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: tahapParagraphs,
          }),
          // Kolom 2 (65%)
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF', type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.TOP,
            borders: cellBorders,
            margins: { top: 120, bottom: 120, left: 180, right: 180 },
            children: deskripsiParagraphs,
          }),
          // Kolom 3 (15%)
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF', type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.TOP,
            borders: cellBorders,
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 25, after: 25, line: 276 },
                children: [
                  new TextRun({
                    text: stepAlloc,
                    font: FONT_FAMILY,
                    bold: true,
                    size: 18,
                    color: COLOR_DARK_TEXT,
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    });

    // 3-Column Table with columnSpan: 3 for Meeting Header and Metadata
    const stepTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // Header Row 1: Meeting Banner (columnSpan: 3, width: 100%)
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              columnSpan: 3,
              shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
              verticalAlign: VerticalAlign.CENTER,
              borders: cellBorders,
              margins: { top: 120, bottom: 120, left: 180, right: 180 },
              children: [
                new Paragraph({
                  spacing: { before: 20, after: 20, line: 276 },
                  children: [
                    new TextRun({
                      text: `PERTEMUAN ${pNum} — Alokasi Waktu: ${alloc.displayString}`,
                      font: FONT_FAMILY,
                      bold: true,
                      size: 20,
                      color: 'FFFFFF',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        // Header Row 2: Meeting Metadata (columnSpan: 3, width: 100%)
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              columnSpan: 3,
              shading: { fill: COLOR_BG_LIGHT, type: ShadingType.CLEAR },
              borders: cellBorders,
              margins: { top: 100, bottom: 100, left: 180, right: 180 },
              children: [
                new Paragraph({
                  spacing: { before: 15, after: 15, line: 276 },
                  children: [
                    new TextRun({ text: 'Topik Pembelajaran: ', font: FONT_FAMILY, bold: true, size: 18 }),
                    new TextRun({ text: meetingTitle, font: FONT_FAMILY, size: 18 }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 15, after: 15, line: 276 },
                  children: [
                    new TextRun({ text: 'Praktik Pedagogis / Model: ', font: FONT_FAMILY, bold: true, size: 18 }),
                    new TextRun({ text: pedagogis, font: FONT_FAMILY, size: 18, color: COLOR_PRIMARY }),
                  ],
                }),
              ],
            }),
          ],
        }),
        // Header Row 3: 3 Columns
        new TableRow({
          children: [
            createHeaderCell('Tahap Kegiatan', 20, AlignmentType.CENTER),
            createHeaderCell('Deskripsi Aktivitas Guru & Siswa (PBL)', 65, AlignmentType.CENTER),
            createHeaderCell('Alokasi Waktu', 15, AlignmentType.CENTER),
          ],
        }),
        ...stepRows,
      ],
    });

    kegiatanElements.push(
      new Paragraph({
        spacing: { before: 80, after: 40, line: 276 },
        children: [
          new TextRun({
            text: `Langkah Kegiatan Pembelajaran Pertemuan ${pNum}:`,
            font: FONT_FAMILY,
            bold: true,
            size: 20,
            color: COLOR_PRIMARY,
          }),
        ],
      })
    );
    kegiatanElements.push(stepTable);

    // Spacing between meetings
    kegiatanElements.push(new Paragraph({ spacing: { before: 100, after: 140, line: 276 }, children: [] }));
  }

  // Refleksi Metakognitif
  const refleksiParagraphs: Paragraph[] = (
    Array.isArray(refleksiSiswa) ? refleksiSiswa : [String(refleksiSiswa)]
  ).map(
    (item) =>
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 20, after: 20 },
        children: [new TextRun({ text: renderTextValue(item), font: FONT_FAMILY, size: 18, color: COLOR_DARK_TEXT })],
      })
  );

  const refleksiBox = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: 'ECFDF5', type: ShadingType.CLEAR }, // Emerald 50
            borders: cellBorders,
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [
              new Paragraph({
                spacing: { before: 20, after: 40 },
                children: [
                  new TextRun({
                    text: '💡 Refleksi Metakognitif Peserta Didik (Proses Inti):',
                    font: FONT_FAMILY,
                    bold: true,
                    size: 19,
                    color: '065F46',
                  }),
                ],
              }),
              ...refleksiParagraphs,
            ],
          }),
        ],
      }),
    ],
  });

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
            },
          },
        },
        footers: {
          default: createDocumentFooter(),
        },
        children: [
          createSchoolHeader(
            'RENCANA PEMBELAJARAN MENDALAM (RPM)',
            'Kurikulum Merdeka & Pendekatan Deep Learning (Memahami, Mengaitkan, Menerapkan)',
            currentIdentitas.sekolah,
            logos
          ),
          identitasTable,

          // A. Capaian Pembelajaran
          createSectionHeading('A. Capaian Pembelajaran (CP) & Dimensi Profil Lulusan'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { fill: COLOR_BG_LIGHT, type: ShadingType.CLEAR },
                    borders: cellBorders,
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    children: [
                      new Paragraph({
                        spacing: { before: 30, after: 40 },
                        children: [
                          new TextRun({
                            text: 'Capaian Pembelajaran (Fase): ',
                            font: FONT_FAMILY,
                            bold: true,
                            size: 19,
                            color: COLOR_DARK_TEXT,
                          }),
                          new TextRun({
                            text: renderTextValue(
                              rpm.capaianPembelajaran ||
                                currentIdentitas.cp ||
                                'Peserta didik mampu memahami dan menerapkan konsep komputasi secara kreatif, mandiri, dan bernalar kritis.'
                            ),
                            font: FONT_FAMILY,
                            size: 19,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 40, after: 30 },
                        children: [
                          new TextRun({
                            text: 'Target Dimensi Profil Lulusan: ',
                            font: FONT_FAMILY,
                            bold: true,
                            size: 18,
                            color: COLOR_PRIMARY,
                          }),
                          new TextRun({
                            text: renderTextValue(targetDimensi),
                            font: FONT_FAMILY,
                            size: 18,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // B. ATP
          createSectionHeading('B. Alur Tujuan Pembelajaran (ATP) Berjenjang'),
          atpTable,

          // C. Materi Pelajaran & Bahan Ajar Lengkap
          createSectionHeading('C. Materi Pelajaran & Bahan Ajar Lengkap'),
          ...materiElements,

          // D. Rincian Tujuan Pembelajaran (TP)
          createSectionHeading('D. Rincian Tujuan Pembelajaran (TP)'),
          ...tpParagraphs,

          // E. Kerangka Desain Pembelajaran Mendalam
          createSectionHeading('E. Kerangka Desain Pembelajaran Mendalam'),
          new Paragraph({
            spacing: { before: 40, after: 60 },
            children: [
              new TextRun({
                text: 'Pemahaman Bermakna: ',
                bold: true,
                font: FONT_FAMILY,
                size: 19,
                color: COLOR_PRIMARY,
              }),
              new TextRun({
                text: renderTextValue(
                  rpm.pemahamanBermakna ||
                    'Konsep algoritma dan dekomposisi membantu menyelesaikan masalah nyata secara efisien dan terstruktur.'
                ),
                font: FONT_FAMILY,
                size: 19,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 60, after: 30 },
            children: [
              new TextRun({
                text: 'Pertanyaan Pemantik:',
                bold: true,
                font: FONT_FAMILY,
                size: 19,
                color: COLOR_PRIMARY,
              }),
            ],
          }),
          ...(Array.isArray(rpm.pertanyaanPemantik) && rpm.pertanyaanPemantik.length > 0
            ? rpm.pertanyaanPemantik.map((q) =>
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  bullet: { level: 0 },
                  children: [new TextRun({ text: renderTextValue(q), font: FONT_FAMILY, size: 19 })],
                })
              )
            : [
                new Paragraph({
                  bullet: { level: 0 },
                  children: [
                    new TextRun({
                      text: 'Bagaimana cara komputer mengurutkan dan memproses data dalam hitungan detik?',
                      font: FONT_FAMILY,
                      size: 19,
                    }),
                  ],
                }),
                new Paragraph({
                  bullet: { level: 0 },
                  children: [
                    new TextRun({
                      text: 'Mengapa kita perlu memvalidasi logika algoritma dengan trace table sebelum mengeksekusi program?',
                      font: FONT_FAMILY,
                      size: 19,
                    }),
                  ],
                }),
              ]),
          new Paragraph({ spacing: { before: 40, after: 60 }, children: [] }),
          kerangkaTable,

          // F. Langkah-Langkah Kegiatan Pembelajaran
          createSectionHeading('F. Langkah-Langkah Kegiatan Pembelajaran (Deep Learning)'),
          ...kegiatanElements,
          refleksiBox,

          // G. Rencana Asesmen Berkelanjutan
          createSectionHeading('G. Rencana Asesmen Berkelanjutan'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Jenis Asesmen', 30),
                  createHeaderCell('Deskripsi & Bentuk Instrumen', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Asesmen Awal (Diagnostik)', 30, true, COLOR_BG_LIGHT),
                  createDataCell(
                    renderTextValue(
                      rpm.asesmenRencana?.awal ||
                        'Kuis awal diagnostik 5 pilihan ganda (A-E) untuk memetakan pemahaman prasyarat siswa.'
                    ),
                    70
                  ),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Asesmen Proses (Formatif)', 30, true, COLOR_BG_LIGHT),
                  createDataCell(
                    renderTextValue(
                      rpm.asesmenRencana?.proses ||
                        `Observasi unjuk kerja investigasi kelompok dan pengerjaan LKPD Pertemuan 1 sampai ${totalSesi}.`
                    ),
                    70
                  ),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Asesmen Akhir (Sumatif)', 30, true, COLOR_BG_LIGHT),
                  createDataCell(
                    renderTextValue(
                      rpm.asesmenRencana?.akhir ||
                        'Tes pilihan ganda kompleks (opsi A-E) dan soal studi kasus essay HOTS.'
                    ),
                    70
                  ),
                ],
              }),
            ],
          }),

          // H. Program Pengayaan & Remedial
          createSectionHeading('H. Program Pengayaan & Remedial'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Program', 30),
                  createHeaderCell('Deskripsi & Rencana Pelaksanaan', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Program Pengayaan', 30, true, COLOR_BG_LIGHT),
                  createDataCell(
                    renderTextValue(
                      rpm.pengayaanRemedial?.pengayaan ||
                        'Penugasan eksplorasi mandiri studi kasus kompleks dan perancangan algoritma modular tingkat lanjut.'
                    ),
                    70
                  ),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Program Remedial', 30, true, COLOR_BG_LIGHT),
                  createDataCell(
                    renderTextValue(
                      rpm.pengayaanRemedial?.remedial ||
                        'Bimbingan individual terstruktur, penelusuran ulang konsep dasar, dan pendampingan tutor sebaya.'
                    ),
                    70
                  ),
                ],
              }),
            ],
          }),

          // Signature
          createSignatureBlock(
            currentIdentitas.sekolah,
            guruMapel,
            currentIdentitas.nipGuru,
            currentIdentitas.kepalaSekolah,
            currentIdentitas.nipKepalaSekolah
          ),
        ],
      },
    ],
  });
};

/**
 * Generates LKPD DOCX Document (100% DINAMIS SESUAI JUMLAH PERTEMUAN & ALOKASI WAKTU BERBASIS DEEP LEARNING)
 */
export const buildLkpdDocument = (lkpd: LkpdDoc, identitas: IdentitasRPM, logos?: KopLogos): Document => {
  const currentIdentitas = { ...identitas, ...(lkpd.identitas as any) };
  const totalSesi = Math.max(1, parseInt(String(currentIdentitas.jumlahPertemuan || lkpd.jumlahPertemuan || '2'), 10) || 2);
  const meetingAllocations = calculateMeetingAllocations(
    currentIdentitas.alokasiWaktu || lkpd.identitas?.waktu,
    totalSesi
  );
  const guruMapel = currentIdentitas.guruMapel || currentIdentitas.namaGuru || currentIdentitas.guru || 'Norbertus Suryadi, S.Kom.';
  const niyGuru = currentIdentitas.nipGuru || '-';
  const topikMateri = currentIdentitas.topik || 'Topik Pembelajaran';

  const rawModeTugas = String(
    (lkpd as any).jenisTugas ||
    (lkpd as any).modeTugas ||
    (currentIdentitas as any).jenisTugas ||
    (currentIdentitas as any).modeTugas ||
    'kelompok'
  ).toLowerCase();

  const labelSiswa = rawModeTugas.includes('individu') || rawModeTugas.includes('mandiri')
    ? 'Nama Siswa,'
    : rawModeTugas.includes('netral')
    ? 'Siswa / Ketua Kelompok,'
    : 'Ketua Kelompok,';

  const sectionsList: (Paragraph | Table)[] = [];

  // Sumber template data per pertemuan
  const rawList = Array.isArray(lkpd.pertemuanList) ? lkpd.pertemuanList : [];

  const defaultDescriptions = [
    {
      subJudul: `Pertemuan 1: Dekomposisi & Analisis Masalah Awal pada ${topikMateri}`,
      tujuan: [
        `Menganalisis dan membedah permasalahan kompleks terkait ${topikMateri} menjadi komponen esensial (Dekomposisi Masalah).`,
        `Mengidentifikasi variabel kunci, data masukan relevan, dan batasan operasional (Abstraksi Data).`,
        `Merumuskan hubungan sebab-akibat antar komponen dalam skenario dunia nyata (Deep Learning: Memahami & Mengaitkan).`,
      ],
      stimulus: `Dalam implementasi ${topikMateri} pada dunia industri dan kehidupan nyata, sering terjadi inefisiensi akibat variabel masalah yang tidak terpetakan dengan jelas. Sebagai contoh kasus, ketidaksiapan alur data menyebabkan redundansi proses dan keterlambatan respon sistem hingga 40%. Tim Anda bertugas mengidentifikasi akar masalah, memisahkan variabel esensial vs data pendukung, serta merumuskan cetak biru solusi awal yang kokoh.`,
      pertanyaanHots: [
        `Lakukan dekomposisi masalah: Identifikasi minimal 3 faktor utama penyebab inefisiensi pada skenario ${topikMateri} di atas!`,
        `Mengapa pemilahan variabel kritis (abstraksi) menjadi penentu utama keberhasilan solusi sistem komputasi?`,
        `Bagaimana hubungan antara parameter input dengan keandalan output yang dihasilkan pada kondisi beban tinggi?`,
        `Rumuskan satu hipotesis solusi awal yang paling efektif dan rasional untuk menyelesaikan studi kasus ini!`,
      ],
      tabelIsian: [
        { no: 1, komponen: 'Identifikasi Parameter Input & Kondisi Awal', instruksiAnalisis: `Data atau nilai apa saja yang harus dimasukkan ke dalam sistem ${topikMateri}?`, ruangJawaban: '' },
        { no: 2, komponen: 'Batasan Sistem & Validasi Logika (Constraints)', instruksiAnalisis: 'Aturan validasi dan batasan nilai apa yang wajib dipenuhi agar sistem aman?', ruangJawaban: '' },
        { no: 3, komponen: 'Dekomposisi Alur Pemrosesan Utama (IPO)', instruksiAnalisis: 'Uraikan tahapan pemrosesan logika dari input mentah hingga output terverifikasi.', ruangJawaban: '' },
        { no: 4, komponen: 'Spesifikasi Output & Kriteria Keberhasilan', instruksiAnalisis: 'Jelaskan format keluaran dan tolok ukur bahwa masalah telah terpecahkan.', ruangJawaban: '' },
      ],
      refleksi: `Melalui pembelajaran Sesi 1 pada materi ${topikMateri}, kami memahami pentingnya dekomposisi dan abstraksi data sebagai fondasi perancangan solusi komputasional yang efisien dan bebas celah.`,
      kesimpulan: `Dekomposisi masalah dan pemetaan variabel terstruktur memberikan kejelasan alur logika sebelum ditransformasikan ke dalam algoritma pada pertemuan berikutnya.`,
    },
    {
      subJudul: `Pertemuan 2: Perancangan Algoritma Terstruktur, Diagram Alir & Simulasi Kasus pada ${topikMateri}`,
      tujuan: [
        `Mengenali pola relasional dan merancang alur logika terstruktur (Flowchart ISO 5807 / Pseudocode) berbasis hasil analisis Pertemuan 1.`,
        `Melakukan simulasi penelusuran manual (dry-run trace table) untuk menguji keabsahan logika dalam berbagai kondisi data uji.`,
        `Menerapkan solusi komputasional terpadu dalam pemecahan masalah kontekstual nyata (Deep Learning: Menerapkan Solusi).`,
      ],
      stimulus: `Menindaklanjuti temuan dekomposisi Pertemuan 1, tim melangkah ke tahap perancangan logika eksekusi ${topikMateri}. Solusi yang dirancang harus memiliki struktur kendali keputusan (IF-ELSE) yang lugas dan tahan terhadap variasi data ekstrem (corner cases) tanpa mengalami kegagalan proses. Alur wajib didokumentasikan dalam diagram alir berstandar ISO dan diverifikasi melalui tabel penelusuran (trace table).`,
      pertanyaanHots: [
        `Bagaimana Anda menstrukturkan kondisi percabangan agar seluruh kemungkinan skenario input pada ${topikMateri} tertangani dengan aman?`,
        `Mengapa penelusuran jejak logika (dry-run trace table) wajib dilakukan sebelum algoritma diimplementasikan ke dalam program?`,
        `Analisis potensi kesalahan logika (logical error) yang dapat muncul jika urutan pengujian kondisi terbalik!`,
        `Bagaimana rancangan algoritma Anda memastikan kompleksitas waktu dan penggunaan sumber daya tetap optimal?`,
      ],
      tabelIsian: [
        { no: 1, komponen: 'Rancangan Pseudocode / Notasi Algoritma', instruksiAnalisis: `Tuliskan struktur instruksi logika (Deklarasi, Input, Seleksi/Loop, Output) untuk ${topikMateri}.`, ruangJawaban: '' },
        { no: 2, komponen: 'Simulasi Kasus Uji Normal (Happy Path Test)', instruksiAnalisis: 'Masukkan sampel data normal dan telusuri nilai perubahan state variabel langkah demi langkah.', ruangJawaban: '' },
        { no: 3, komponen: 'Simulasi Kasus Uji Ekstrem / Batas (Edge Cases)', instruksiAnalisis: 'Ujilah dengan nilai batas (nilai 0, negatif, data kosong/maksimal) dan catat respon algoritma.', ruangJawaban: '' },
        { no: 4, komponen: 'Evaluasi Ketahanan Logika & Optimasi Alur', instruksiAnalisis: 'Jelaskan apakah terdapat perulangan/kondisi yang dapat disederhanakan untuk meningkatkan performa.', ruangJawaban: '' },
      ],
      refleksi: `Melalui pengerjaan LKPD Pertemuan 2, kami menyadari bahwa algoritma yang handal tidak hanya mengejar hasil akhir yang benar, melainkan struktur alur yang bersih, teruji kasus ekstrem, dan adaptif.`,
      kesimpulan: `Rancangan flowchart dan pseudocode yang terverifikasi melalui trace table memberikan kepastian bahwa solusi terhadap ${topikMateri} siap dieksekusi secara presisi dan minim galat.`,
    },
    {
      subJudul: `Pertemuan 3: Evaluasi Komparasi Solusi, Optimasi Kompleksitas & Gelar Karya pada ${topikMateri}`,
      tujuan: [
        `Mengevaluasi kompleksitas dan efisiensi algoritma dari berbagai variasi pendekatan solusi kelompok.`,
        `Melakukan optimasi alur dan penyempurnaan rancangan solusi secara kolaboratif.`,
        `Mempresentasikan hasil karya investigasi dan rekomendasi solusi sistem secara komprehensif.`,
      ],
      stimulus: `Tahap akhir dari siklus pengembangan solusi ${topikMateri} adalah evaluasi efisiensi komparatif, audit penanganan kesalahan pengguna (error handling), serta penyusunan laporan pertanggungjawaban karya komputasional siap terap.`,
      pertanyaanHots: [
        `Bandingkan efisiensi solusi kelompok Anda dengan pendekatan alternatif dalam memecahkan studi kasus ${topikMateri}!`,
        `Parameter apa yang menjadi tolok ukur utama kecepatan dan keandalan sistem solusi Anda?`,
        `Bagaimana strategi proteksi sistem jika pengguna memasukkan format data yang tidak valid?`,
        `Refleksikan dampak kebermanfaatan implementasi solusi ini bagi pengguna akhir di masyarakat!`,
      ],
      tabelIsian: [
        { no: 1, komponen: 'Metrik Efisiensi Waktu & Beban Komputasi', instruksiAnalisis: 'Hitung perkiraan jumlah langkah operasi logika untuk ukuran dataset kecil vs besar.', ruangJawaban: '' },
        { no: 2, komponen: 'Proteksi Kesalahan Input Pengguna (Error Handling)', instruksiAnalisis: 'Jelaskan mekanisme proteksi terhadap input salah format atau di luar jangkauan nilai.', ruangJawaban: '' },
        { no: 3, komponen: 'Rekomendasi Skalabilitas & Pengembangan Lanjut', instruksiAnalisis: 'Tuliskan rencana pengembangan fitur di masa depan jika sistem diterapkan secara luas.', ruangJawaban: '' },
      ],
      refleksi: `Proses rekayasa solusi bukan sekadar membuat sistem berjalan, melainkan menghasilkan karya yang teroptimasi, ramah pengguna, dan berintegritas tinggi.`,
      kesimpulan: `Portofolio solusi yang disusun secara sistematis membuktikan penguasaan utuh terhadap konsep dan penerapan ${topikMateri}.`,
    },
  ];

  // ITERASI SEBANYAK totalSesi (Setiap Pertemuan memiliki LKPD Deep Learning Utuh)
  for (let i = 0; i < totalSesi; i++) {
    const pNum = i + 1;
    const alloc = meetingAllocations[i] || { displayString: '2 JP (90 Menit)', meetingMinutes: 90, meetingJp: 2, minsPerJp: 45 };
    const existing = rawList[i];
    const fallbackDesc = defaultDescriptions[i % defaultDescriptions.length];

    const subJudul = existing?.subJudul || fallbackDesc.subJudul;
    const tujuanList = Array.isArray(existing?.tujuanAktivitas) && existing.tujuanAktivitas.length > 0
      ? existing.tujuanAktivitas
      : fallbackDesc.tujuan;
    const stimulusText = existing?.stimulusMaterial || fallbackDesc.stimulus;

    const petunjukList = Array.isArray(existing?.petunjukPengerjaan) && existing.petunjukPengerjaan.length > 0
      ? existing.petunjukPengerjaan
      : [
          'Bacalah teks stimulus studi kasus kontekstual dengan cermat bersama seluruh anggota kelompok.',
          'Diskusikan dan jawablah pertanyaan analisis mendalam pada Kegiatan 1 (Memahami & Mengaitkan).',
          'Lakukan investigasi praktikum pada Kegiatan 2 dan lengkapi Tabel Isian Kerja Siswa secara sistematis.',
          'Rumuskan kesimpulan bersama dan lengkapi lembar refleksi sebelum mempresentasikan hasil unjuk kerja.',
        ];

    const hotsQuestions =
      existing?.kegiatan1Memahami?.pertanyaanHots ||
      existing?.pertanyaanDiskusi ||
      fallbackDesc.pertanyaanHots;

    const tabelRows =
      existing?.kegiatan2Menerapkan?.tabelIsian ||
      (existing?.aktivitasSiswa && existing.aktivitasSiswa.length > 0
        ? existing.aktivitasSiswa.map((act, aIdx) => ({
            no: act.no || aIdx + 1,
            komponen: act.tugas,
            instruksiAnalisis: act.instruksi,
            ruangJawaban: act.ruangJawaban || '',
          }))
        : fallbackDesc.tabelIsian);

    const refleksiText = existing?.refleksiSiswa || fallbackDesc.refleksi;
    const kesimpulanText = existing?.kesimpulan || fallbackDesc.kesimpulan;

    const rubrikRows = existing?.rubrikSkor || [
      { kriteria: 'Ketajaman Analisis Masalah Kasus (Kegiatan 1)', skorMaks: 30 },
      { kriteria: 'Kelengkapan & Akurasi Tabel Isian Solusi (Kegiatan 2)', skorMaks: 40 },
      { kriteria: 'Kualitas Kolaborasi, Refleksi & Penarikan Kesimpulan', skorMaks: 30 },
    ];

    if (i > 0) {
      sectionsList.push(
        new Paragraph({
          pageBreakBefore: true,
        })
      );
    }

    sectionsList.push(
      createSectionHeading(`LEMBAR KERJA PESERTA DIDIK (LKPD) — PERTEMUAN ${pNum}`),

      // TABEL IDENTITAS SISWA & KELOMPOK (100% FULL WIDTH)
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createDataCell('Mata Pelajaran', 20, true, COLOR_BG_LIGHT),
              createDataCell(currentIdentitas.mataPelajaran || 'Informatika', 30),
              createDataCell('Nama Kelompok', 20, true, COLOR_BG_LIGHT),
              createDataCell('Kelompok: .......................................', 30),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Kelas / Fase / Sem.', 20, true, COLOR_BG_LIGHT),
              createDataCell(formatCleanKelasFaseSemester(currentIdentitas.kelas, currentIdentitas.semester), 30),
              createDataCell('Hari / Tanggal', 20, true, COLOR_BG_LIGHT),
              createDataCell('......................................................', 30),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Pertemuan Ke', 20, true, COLOR_BG_LIGHT),
              createDataCell(`Pertemuan ${pNum} dari ${totalSesi}`, 30, true),
              createDataCell('Alokasi Waktu', 20, true, COLOR_BG_LIGHT),
              createDataCell(`${alloc.displayString}`, 30, true),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Guru Mapel (Pengampu)', 20, true, COLOR_BG_LIGHT),
              createDataCell(`${guruMapel} (NIY. ${niyGuru})`, 30),
              createDataCell('Anggota Kelompok', 20, true, COLOR_BG_LIGHT),
              createDataCell('1) ............................ 2) ............................\n3) ............................ 4) ............................', 30),
            ],
          }),
        ],
      }),

      // 1. JUDUL & TUJUAN PEMBELAJARAN
      new Paragraph({
        spacing: { before: 140, after: 40 },
        children: [new TextRun({ text: `1. JUDUL & TUJUAN PEMBELAJARAN (PERTEMUAN ${pNum})`, bold: true, font: FONT_FAMILY, size: 20, color: COLOR_PRIMARY })],
      }),
      new Paragraph({
        spacing: { before: 20, after: 40 },
        children: [new TextRun({ text: `Sub Judul Aktivitas: ${subJudul}`, bold: true, font: FONT_FAMILY, size: 19 })],
      }),
      ...tujuanList.map(
        (t) =>
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 20, after: 20 },
            children: [new TextRun({ text: renderTextValue(t), font: FONT_FAMILY, size: 19 })],
          })
      ),

      // 2. PETUNJUK PENGERJAAN LKPD
      new Paragraph({
        spacing: { before: 140, after: 40 },
        children: [new TextRun({ text: '2. PETUNJUK PENGERJAAN LKPD', bold: true, font: FONT_FAMILY, size: 20, color: COLOR_PRIMARY })],
      }),
      ...petunjukList.map(
        (p, pIdx) =>
          new Paragraph({
            spacing: { before: 20, after: 20 },
            children: [new TextRun({ text: `${pIdx + 1}. ${renderTextValue(p)}`, font: FONT_FAMILY, size: 19 })],
          })
      ),

      // 3. STIMULUS / STUDI KASUS KONTEKSUAL
      new Paragraph({
        spacing: { before: 140, after: 40 },
        children: [new TextRun({ text: '3. STIMULUS / STUDI KASUS KONTEKSUAL (PEMANTIK DISKUSI)', bold: true, font: FONT_FAMILY, size: 20, color: COLOR_PRIMARY })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createDataCell(`"${renderTextValue(stimulusText)}"`, 100, false, COLOR_BG_LIGHT),
            ],
          }),
        ],
      }),

      // 4. KEGIATAN 1: MEMAHAMI & MENGAITKAN (PENALARAN KRITIS HOTS)
      new Paragraph({
        spacing: { before: 140, after: 40 },
        children: [new TextRun({ text: '4. KEGIATAN 1: MEMAHAMI & MENGAITKAN (PENALARAN KRITIS HOTS)', bold: true, font: FONT_FAMILY, size: 20, color: COLOR_PRIMARY })],
      }),
      new Paragraph({
        spacing: { before: 20, after: 60 },
        children: [new TextRun({ text: 'Berdasarkan stimulus kasus di atas, analisislah dan jawablah pertanyaan mendalam berikut bersama kelompok Anda:', italics: true, font: FONT_FAMILY, size: 19, color: COLOR_MUTED_TEXT })],
      }),
      ...hotsQuestions.flatMap((q, qIdx) => [
        new Paragraph({
          spacing: { before: 60, after: 30 },
          children: [new TextRun({ text: `${qIdx + 1}. ${renderTextValue(q)}`, bold: true, font: FONT_FAMILY, size: 19 })],
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createDataCell('\n\n[ Ruang Jawaban Analisis Siswa — Tuliskan uraian solusi dan argumentasi logis kelompok di sini... ]\n\n', 100, false, 'FAFAFA'),
              ],
            }),
          ],
        }),
      ]),

      // 5. KEGIATAN 2: MENERAPKAN / PRAKTIKUM (TABEL ISIAN KERJA SISWA 100% FULL WIDTH)
      new Paragraph({
        spacing: { before: 140, after: 40 },
        children: [new TextRun({ text: '5. KEGIATAN 2: MENERAPKAN / PRAKTIKUM (TABEL ISIAN KERJA SISWA)', bold: true, font: FONT_FAMILY, size: 20, color: COLOR_PRIMARY })],
      }),
      new Paragraph({
        spacing: { before: 20, after: 60 },
        children: [new TextRun({ text: 'Lakukan analisis pemecahan masalah dan tuangkan rancangan solusi kelompok ke dalam matriks kerja 100% full width berikut:', italics: true, font: FONT_FAMILY, size: 19, color: COLOR_MUTED_TEXT })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createHeaderCell('No', 8),
              createHeaderCell('Komponen / Aspek Analisis Masalah', 37),
              createHeaderCell('Deskripsi Solusi, Notasi Algoritma & Lembar Pengerjaan Siswa', 55),
            ],
          }),
          ...tabelRows.map((row: any, rIdx: number) => {
            return new TableRow({
              children: [
                createDataCell(String(row.no || rIdx + 1), 8, true, 'FFFFFF', AlignmentType.CENTER),
                createDataCell(`${row.komponen}\n\nPetunjuk Analisis:\n${row.instruksiAnalisis}`, 37, true),
                createDataCell('\n\n\n\n\n\n\n\n[ Ruang Pengerjaan Solusi / Diagram Alir / Pseudocode Kelompok ]\n\n\n\n', 55, false, 'FAFAFA'),
              ],
            });
          }),
        ],
      }),

      // 6. LEMBAR REFLEKSI, KESIMPULAN & RUBRIK SKOR SISWA
      new Paragraph({
        spacing: { before: 140, after: 40 },
        children: [new TextRun({ text: '6. LEMBAR REFLEKSI, KESIMPULAN & RUBRIK SKOR SISWA', bold: true, font: FONT_FAMILY, size: 20, color: COLOR_PRIMARY })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createDataCell(`A. Refleksi Pemahaman Bermakna (Pertemuan ${pNum}):\n\n"${renderTextValue(refleksiText)}"\n\n[ Catatan Refleksi Mandiri Siswa... ]\n\n`, 50, false, COLOR_BG_LIGHT),
              createDataCell(`B. Kesimpulan Akhir Diskusi Kelompok:\n\n"${renderTextValue(kesimpulanText)}"\n\n[ Catatan Kesimpulan Konsensus Kelompok... ]\n\n`, 50, false, COLOR_BG_LIGHT),
            ],
          }),
        ],
      }),

      // TABEL RUBRIK PENILAIAN & REKAPITULASI SKOR LKPD (100% FULL WIDTH)
      new Paragraph({
        spacing: { before: 100, after: 40 },
        children: [new TextRun({ text: 'C. Rubrik Penilaian & Rekapitulasi Skor LKPD (Diisi Guru / Peer-Assessment):', bold: true, font: FONT_FAMILY, size: 19 })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createHeaderCell('Kriteria Penilaian Unjuk Kerja', 60),
              createHeaderCell('Skor Maksimal', 20),
              createHeaderCell('Skor Perolehan', 20),
            ],
          }),
          ...rubrikRows.map((rubrik: any) => {
            return new TableRow({
              children: [
                createDataCell(rubrik.kriteria, 60),
                createDataCell(String(rubrik.skorMaks), 20, true, 'FFFFFF', AlignmentType.CENTER),
                createDataCell('........', 20, false, 'FFFFFF', AlignmentType.CENTER),
              ],
            });
          }),
          new TableRow({
            children: [
              createDataCell('TOTAL SKOR AKHIR', 60, true, COLOR_BG_LIGHT, AlignmentType.RIGHT),
              createDataCell('100', 20, true, COLOR_BG_LIGHT, AlignmentType.CENTER),
              createDataCell('........', 20, true, COLOR_BG_LIGHT, AlignmentType.CENTER),
            ],
          }),
        ],
      }),

      // 7. BLOK PENGESAHAN / TANDA TANGAN (Siswa / Ketua Kelompok & Guru Mapel dengan NIY)
      new Paragraph({ spacing: { before: 140, after: 60 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: transparentBorders,
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: transparentBorders,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 30 },
                    children: [new TextRun({ text: 'Mengetahui,', font: FONT_FAMILY, size: 19 })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 420 },
                    children: [new TextRun({ text: labelSiswa, font: FONT_FAMILY, bold: true, size: 19 })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: '( _________________ )', font: FONT_FAMILY, bold: true, size: 19 })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 20, after: 0 },
                    children: [new TextRun({ text: 'NISN: _________________', font: FONT_FAMILY, size: 17, color: COLOR_MUTED_TEXT })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: transparentBorders,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 30 },
                    children: [new TextRun({ text: 'Palembang, ....................', font: FONT_FAMILY, size: 19 })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 420 },
                    children: [new TextRun({ text: 'Guru Mata Pelajaran,', font: FONT_FAMILY, bold: true, size: 19 })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: guruMapel, font: FONT_FAMILY, bold: true, underline: {}, size: 19 })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 20, after: 0 },
                    children: [new TextRun({ text: `NIY. ${niyGuru}`, font: FONT_FAMILY, size: 17, color: COLOR_MUTED_TEXT })],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
            },
          },
        },
        footers: {
          default: createDocumentFooter(),
        },
        children: [
          createSchoolHeader('LEMBAR KERJA PESERTA DIDIK (LKPD)', `Topik: ${currentIdentitas.topik || 'Informatika'}`, currentIdentitas.sekolah, logos),
          ...sectionsList,
        ],
      },
    ],
  });
};

/**
 * Generates Moodle DOCX Document (100% DINAMIS SESUAI JUMLAH PERTEMUAN & ALOKASI WAKTU)
 */
export const buildMoodleDocument = (moodle: MoodleDoc, identitas: IdentitasRPM, logos?: KopLogos): Document => {
  const currentIdentitas = { ...identitas, ...moodle.identitas };
  const totalSesi = Math.max(1, parseInt(String(currentIdentitas.jumlahPertemuan || moodle.jumlahPertemuan || '2'), 10) || 2);
  const meetingAllocations = calculateMeetingAllocations(currentIdentitas.alokasiWaktu, totalSesi);
  const guruMapel = currentIdentitas.guruMapel || currentIdentitas.namaGuru || currentIdentitas.guru || 'Norbertus Suryadi, S.Kom.';
  const defaultMateriList = generateDefaultMateriItems(currentIdentitas);

  // 1. Identitas Table
  const identitasTable = createStandardIdentitasTable(currentIdentitas, totalSesi, meetingAllocations);

  // 2. Sesi E-Learning Moodle (HANYA sebanyak totalSesi)
  const rawSessions = Array.isArray(moodle.sesiElearning) ? moodle.sesiElearning : [];
  const rows: TableRow[] = [
    new TableRow({
      children: [
        createHeaderCell('Sesi & Waktu', 15),
        createHeaderCell('Aktivitas LMS (Moodle / Classroom)', 28),
        createHeaderCell('Aktivitas Quiz & Interaktif H5P', 25),
        createHeaderCell('Instruksi & Format Pengumpulan', 32),
      ],
    }),
  ];

  for (let i = 0; i < totalSesi; i++) {
    const pNum = i + 1;
    const alloc = meetingAllocations[i] || { displayString: '2 JP (90 Menit)', meetingMinutes: 90, meetingJp: 2, minsPerJp: 45 };
    const existing = rawSessions[i];

    const namaSesi = existing?.namaSesi || (pNum === 1
      ? `Sesi 1: Dekomposisi, Abstraksi & H5P Simbol Flowchart`
      : `Sesi 2: Flowchart ISO, Pseudocode & Kuis Evaluasi Moodle`);

    const jenisAktivitasText = Array.isArray(existing?.jenisAktivitas)
      ? existing.jenisAktivitas.join('\n• ')
      : existing?.jenisAktivitas || (pNum === 1
          ? '• H5P Drag and Drop (Simbol & Dekomposisi)\n• Forum Diskusi Kelompok\n• Assignment Submission LKPD 1'
          : '• H5P Fill-in-the-Blanks (Pseudocode)\n• Moodle Quiz Evaluasi Terpadu\n• Assignment Submission LKPD 2');

    const instruksiText = Array.isArray(existing?.instruksi)
      ? existing.instruksi.join('\n')
      : existing?.instruksi || `1. Unduh slide materi dan pelajari studi kasus Sesi ${pNum}.\n2. Kerjakan modul H5P interaktif dan diskusikan di forum.\n3. Unggah berkas LKPD Sesi ${pNum} dalam format PDF/DOCX sebelum batas waktu (${alloc.meetingMinutes || 90} menit pembelajaran).`;

    const formatPengumpulan = existing?.formatPengumpulan || 'File PDF / DOCX (Maks 5MB)';
    const tenggatWaktu = existing?.tenggatWaktu || `H+3 Setelah Pertemuan ${pNum} (Pukul 23.59 WIB)`;

    rows.push(
      new TableRow({
        children: [
          createDataCell(`Sesi ${pNum}\n(${alloc.displayString})`, 15, true, COLOR_BG_LIGHT, AlignmentType.CENTER),
          createDataCell(namaSesi, 28, true),
          createDataCell(`• ${jenisAktivitasText}`, 25),
          createDataCell(`${instruksiText}\n\nFormat: ${formatPengumpulan}\nBatas: ${tenggatWaktu}`, 32),
        ],
      })
    );
  }

  // 3. Ringkasan Modul Digital (Hanya tampilkan ringkasan materi aktif)
  const materiList = Array.isArray(moodle.ringkasanMateri) && moodle.ringkasanMateri.length > 0
    ? moodle.ringkasanMateri.slice(0, totalSesi)
    : defaultMateriList.slice(0, totalSesi);

  const materiRows = materiList.map((mat, idx) => {
    return new TableRow({
      children: [
        createDataCell(`Topik Sesi ${idx + 1}`, 20, true, COLOR_BG_LIGHT, AlignmentType.CENTER),
        createDataCell(mat.topikMateri || `Materi Sesi ${idx + 1}`, 30, true),
        createDataCell(mat.rangkumanTeori || 'Uraian ringkas materi esensial dan konsep kunci pembelajaran.', 50),
      ],
    });
  });

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
            },
          },
        },
        footers: {
          default: createDocumentFooter(),
        },
        children: [
          createSchoolHeader('PANDUAN E-LEARNING & DESKRIPSI AKTIVITAS MOODLE', `Platform LMS — Topik: ${currentIdentitas.topik || 'Informatika'}`, currentIdentitas.sekolah, logos),
          createSectionHeading('I. IDENTITAS E-LEARNING & GURU PENGAMPU'),
          identitasTable,

          createSectionHeading('II. RANCANGAN STRUKTUR SESI E-LEARNING (TERPADU JUMLAH PERTEMUAN)'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          }),

          createSectionHeading('III. RINGKASAN MATERI DIGITAL PER SESI AKTIF'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Sesi', 20),
                  createHeaderCell('Pokok Bahasan', 30),
                  createHeaderCell('Rangkuman Konsep Digital & Kata Kunci', 50),
                ],
              }),
              ...materiRows,
            ],
          }),

          createSectionHeading('IV. PETUNJUK PENILAIAN & KRITERIA KEBERHASILAN DIGITAL'),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: 'Keaktifan respons pada forum diskusi LMS minimal 2 posting bermutu.', font: FONT_FAMILY, size: 19 })],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: 'Ketepatan waktu dan kelengkapan dokumen pengunggahan LKPD kelompok pada setiap sesi aktif.', font: FONT_FAMILY, size: 19 })],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: 'Penyelesaian aktivitas interaktif H5P dan Kuis Moodle dengan nilai melampaui KKTP (≥ 75).', font: FONT_FAMILY, size: 19 })],
          }),

          createSignatureBlock(
            currentIdentitas.sekolah,
            guruMapel,
            currentIdentitas.nipGuru,
            currentIdentitas.kepalaSekolah,
            currentIdentitas.nipKepalaSekolah
          ),
        ],
      },
    ],
  });
};

/**
 * Generates Asesmen DOCX Document (100% LENGKAP DENGAN 5 OPSI A-E DAN SINKRON PERTEMUAN AKTIF)
 */
export const buildAsesmenDocument = (asesmen: AsesmenDoc, identitas: IdentitasRPM, logos?: KopLogos): Document => {
  const currentIdentitas = { ...identitas, ...asesmen.identitas };
  const totalSesi = Math.max(1, parseInt(String(currentIdentitas.jumlahPertemuan || '2'), 10) || 2);
  const meetingAllocations = calculateMeetingAllocations(currentIdentitas.alokasiWaktu, totalSesi);
  const guruMapel = currentIdentitas.guruMapel || currentIdentitas.namaGuru || currentIdentitas.guru || 'Norbertus Suryadi, S.Kom.';
  const topik = currentIdentitas.topik || 'Berpikir Komputasional & Algoritma';

  // 1. Identitas Table
  const identitasTable = createStandardIdentitasTable(currentIdentitas, totalSesi, meetingAllocations);

  // 2. Soal PG Diagnostik (WAJIB 5 Opsi A, B, C, D, E)
  const defaultDiagnostikPG: SoalPgDiagnostik[] = [
    {
      no: 1,
      pertanyaan: `Manakah dari langkah berikut yang merupakan tahapan awal paling tepat dalam metode Berpikir Komputasional saat menghadapi permasalahan ${topik}?`,
      pilihan: {
        A: 'Langsung menulis baris kode program secara tergesa-gesa tanpa perencanaan.',
        B: 'Mendekomposisi (memecah) masalah besar menjadi bagian-bagian sub-masalah yang lebih kecil dan terkelola.',
        C: 'Mengabaikan detail batasan masalah dan menebak solusi akhir secara intuitif.',
        D: 'Menjalankan program komputer tanpa membuat perencanaan diagram alir terlebih dahulu.',
        E: 'Membeli perangkat keras komputer baru dengan spesifikasi paling tinggi.',
      },
      kunciJawaban: 'B',
      penjelasan: 'Dekomposisi adalah pilar fundamental awal untuk menyederhanakan kompleksitas masalah sebelum ekstraksi pola.',
      indikatorPrasyarat: 'Pemahaman Konsep Dasar Dekomposisi Masalah',
    },
    {
      no: 2,
      pertanyaan: 'Dalam perancangan bagan alir (flowchart) standar ISO 5807, simbol berbentuk belah ketupat (diamond) digunakan untuk merepresentasikan fungsi...',
      pilihan: {
        A: 'Titik awal (Start) atau titik akhir (End) dari suatu alur program.',
        B: 'Operasi proses perhitungan matematika atau penugasan variabel nilai.',
        C: 'Pengambilan keputusan/kondisi percabangan (Decision) yang menghasilkan nilai logika Benar/Salah (True/False).',
        D: 'Pemasukan data manual (Input) atau penampilan hasil keluaran (Output).',
        E: 'Pemberian jeda waktu (delay) atau penghentian sementara sistem.',
      },
      kunciJawaban: 'C',
      penjelasan: 'Simbol belah ketupat merupakan standar ISO untuk percabangan atau pengambilan keputusan logika.',
      indikatorPrasyarat: 'Pengenalan Simbol Standar Diagram Alir Logika',
    },
    {
      no: 3,
      pertanyaan: 'Jika sebuah kondisi logika evaluasi bernilai: (15 > 10) AND (8 == 9), maka hasil evaluasi kebenaran logika akhirnya adalah...',
      pilihan: {
        A: 'True (Benar)',
        B: 'False (Salah)',
        C: 'Error (Kondisi Tidak Terdefinisi)',
        D: 'Null (Kosong)',
        E: 'Undetermined (Tidak Dapat Ditentukan)',
      },
      kunciJawaban: 'B',
      penjelasan: 'Operator AND mensyaratkan kedua operand bernilai True. Karena (8 == 9) bernilai False, maka (True AND False) menghasilkan False.',
      indikatorPrasyarat: 'Kesiapan Operasi Logika Boolean (AND/OR/NOT)',
    },
    {
      no: 4,
      pertanyaan: 'Teknik mengabaikan informasi atau atribut yang tidak relevan dan hanya memfokuskan perhatian pada data esensial disebut...',
      pilihan: {
        A: 'Algoritma Sekuensial',
        B: 'Debugging Program',
        C: 'Abstraksi (Abstraction)',
        D: 'Enkripsi Data',
        E: 'Kompilasi Kode Program',
      },
      kunciJawaban: 'C',
      penjelasan: 'Abstraksi menyaring elemen non-esensial agar model komputasi menjadi fokus dan efisien.',
      indikatorPrasyarat: 'Kemampuan Abstraksi Variabel Kritis',
    },
    {
      no: 5,
      pertanyaan: 'Berikut ini yang BUKAN merupakan karakteristik dari sebuah algoritma yang baik, terstandar, dan efektif adalah...',
      pilihan: {
        A: 'Memiliki instruksi yang jelas, tegas, dan tidak bermakna ganda (Unambiguous).',
        B: 'Pasti berhenti setelah sejumlah langkah terhingga dieksekusi (Finiteness).',
        C: 'Mengulang langkah tanpa batas (infinite loop) tanpa ada kondisi pemberhentian.',
        D: 'Menghasilkan keluaran (output) yang valid dan sesuai dengan spesifikasi masalah.',
        E: 'Mempunyai batasan masukan (input) dan keluaran (output) yang terdefinisi dengan presisi.',
      },
      kunciJawaban: 'C',
      penjelasan: 'Algoritma yang baik wajib memiliki sifat keterhinggaan (finiteness) dan tidak boleh terjebak loop tak hingga tanpa syarat henti.',
      indikatorPrasyarat: 'Prinsip Keterhinggaan & Validitas Algoritma',
    },
  ];

  const pgDiagnostik = Array.isArray(asesmen.asesmenAwal?.soalPg) && asesmen.asesmenAwal.soalPg.length > 0
    ? asesmen.asesmenAwal.soalPg
    : defaultDiagnostikPG;

  const diagnostikRows: TableRow[] = [];
  pgDiagnostik.forEach((item, idx) => {
    let opsiStr = '';
    if (item.pilihan && typeof item.pilihan === 'object') {
      if (Array.isArray(item.pilihan)) {
        opsiStr = item.pilihan.map((p, i) => `${String.fromCharCode(65 + i)}. ${p}`).join('\n');
      } else {
        const p = item.pilihan as any;
        opsiStr = `A. ${p.A || '-'}\nB. ${p.B || '-'}\nC. ${p.C || '-'}\nD. ${p.D || '-'}\nE. ${p.E || '-'}`;
      }
    } else {
      opsiStr = 'A. Opsi A\nB. Opsi B\nC. Opsi C\nD. Opsi D\nE. Opsi E';
    }

    diagnostikRows.push(
      new TableRow({
        children: [
          createDataCell(String(item.no || idx + 1), 8, true, 'FFFFFF', AlignmentType.CENTER),
          createDataCell(`${item.pertanyaan}\n\nPilihan Jawaban:\n${opsiStr}`, 52),
          createDataCell(item.kunciJawaban || 'B', 10, true, COLOR_BG_LIGHT, AlignmentType.CENTER),
          createDataCell(item.penjelasan || item.indikatorPrasyarat || '-', 30),
        ],
      })
    );
  });

  // 3. Formatif & Observasi (Sesuai totalSesi)
  const formatifRows: TableRow[] = [];
  for (let i = 0; i < totalSesi; i++) {
    const pNum = i + 1;
    const alloc = meetingAllocations[i] || { displayString: '2 JP (90 Menit)', meetingMinutes: 90, meetingJp: 2, minsPerJp: 45 };
    formatifRows.push(
      new TableRow({
        children: [
          createDataCell(String(pNum), 8, true, 'FFFFFF', AlignmentType.CENTER),
          createDataCell(`Pertemuan ${pNum} (${alloc.displayString})\nAnalisis LKPD & Investigasi Kelompok`, 37, true, COLOR_BG_LIGHT),
          createDataCell('Kemampuan dekomposisi masalah, kebenaran rancangan logika, dan kerja sama tim.', 35),
          createDataCell('Skor 1 - 4 (Rubrik Terlampir)', 20, false, 'FFFFFF', AlignmentType.CENTER),
        ],
      })
    );
  }

  // 4. Soal PG Kompleks & Essay HOTS Sumatif (Dengan 5 Opsi Lengkap A-E)
  const defaultPgKompleks: SoalPgKompleks[] = [
    {
      no: 1,
      stimulus: `Sebuah sistem otomatisasi pada ${topik} memerlukan verifikasi data input sebelum memproses perhitungan. Sistem harus menolak data jika bernilai negatif atau melebihi batas 1000.`,
      pernyataan: 'Manakah bentuk notasi kondisi percabangan yang paling valid dan efisien untuk menangani aturan validasi tersebut?',
      pilihan: {
        A: 'IF (input < 0 OR input > 1000) THEN REJECT ELSE PROCESS',
        B: 'IF (input > 0 AND input < 1000) THEN REJECT ELSE PROCESS',
        C: 'IF (input == 0) THEN REJECT ELSE PROCESS',
        D: 'IF (input >= 1000) THEN PROCESS ELSE REJECT',
        E: 'IF (input <= 0) THEN PROCESS ELSE REJECT',
      },
      kunciJawaban: 'A',
      bobot: 20,
      pembahasan: 'Kondisi penolakan menggunakan operator OR untuk menangkap input di luar interval [0, 1000].',
    },
    {
      no: 2,
      stimulus: 'Diberikan trace table pengujian variabel: x = 5, y = 2. Dilakukan perulangan WHILE (x > y) DO { x = x - 1; y = y + 1; }',
      pernyataan: 'Berapakah nilai akhir variabel x dan y saat perulangan selesai dieksekusi?',
      pilihan: {
        A: 'x = 3, y = 4',
        B: 'x = 4, y = 3',
        C: 'x = 3, y = 3',
        D: 'x = 2, y = 5',
        E: 'x = 5, y = 2',
      },
      kunciJawaban: 'A',
      bobot: 20,
      pembahasan: 'Iterasi 1: x=4, y=3 (4 > 3 -> True). Iterasi 2: x=3, y=4 (3 > 4 -> False, loop berhenti). Nilai akhir x=3, y=4.',
    },
  ];

  const pgKompleksList = Array.isArray(asesmen.asesmenAkhir?.bagian1PgKompleks) && asesmen.asesmenAkhir.bagian1PgKompleks.length > 0
    ? asesmen.asesmenAkhir.bagian1PgKompleks
    : defaultPgKompleks;

  const pgKompleksRows = pgKompleksList.map((item, idx) => {
    let opsiStr = '';
    if (item.pilihan && typeof item.pilihan === 'object') {
      if (Array.isArray(item.pilihan)) {
        opsiStr = item.pilihan.map((p, i) => `${String.fromCharCode(65 + i)}. ${p}`).join('\n');
      } else {
        const p = item.pilihan as any;
        opsiStr = `A. ${p.A || '-'}\nB. ${p.B || '-'}\nC. ${p.C || '-'}\nD. ${p.D || '-'}\nE. ${p.E || '-'}`;
      }
    } else {
      opsiStr = 'A. Opsi A\nB. Opsi B\nC. Opsi C\nD. Opsi D\nE. Opsi E';
    }

    return new TableRow({
      children: [
        createDataCell(String(item.no || idx + 1), 8, true, 'FFFFFF', AlignmentType.CENTER),
        createDataCell(`Stimulus:\n${item.stimulus || '-'}\n\nPertanyaan:\n${item.pernyataan}\n\nPilihan Jawaban:\n${opsiStr}`, 52),
        createDataCell(item.kunciJawaban || 'A', 10, true, COLOR_BG_LIGHT, AlignmentType.CENTER),
        createDataCell(`Bobot: ${item.bobot || 20} Poin\n\nPembahasan:\n${item.pembahasan || '-'}`, 30),
      ],
    });
  });

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
            },
          },
        },
        footers: {
          default: createDocumentFooter(),
        },
        children: [
          createSchoolHeader('INSTRUMEN ASESMEN & KISI-KISI EVALUASI PEMBELAJARAN', `Topik: ${topik}`, currentIdentitas.sekolah, logos),
          createSectionHeading('I. IDENTITAS ASESMEN & GURU MAPEL'),
          identitasTable,

          createSectionHeading('II. ASESMEN DIAGNOSTIK AWAL KOGNITIF (PILIHAN GANDA 5 OPSI A-E)'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('No', 8),
                  createHeaderCell('Pertanyaan & Opsi Jawaban (A-E)', 52),
                  createHeaderCell('Kunci', 10),
                  createHeaderCell('Indikator Prasyarat & Penjelasan', 30),
                ],
              }),
              ...diagnostikRows,
            ],
          }),

          createSectionHeading(`III. ASESMEN FORMATIF PROSES (TERPADU ${totalSesi} PERTEMUAN AKTIF)`),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('No', 8),
                  createHeaderCell('Sesi Pertemuan & Waktu', 37),
                  createHeaderCell('Fokus Observasi Unjuk Kerja', 35),
                  createHeaderCell('Skala Penilaian', 20),
                ],
              }),
              ...formatifRows,
            ],
          }),

          createSectionHeading('IV. ASESMEN SUMATIF AKHIR (PILIHAN GANDA KOMPLEKS 5 OPSI A-E)'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('No', 8),
                  createHeaderCell('Stimulus Kasus & Butir Soal (A-E)', 52),
                  createHeaderCell('Kunci', 10),
                  createHeaderCell('Bobot & Pembahasan Logika', 30),
                ],
              }),
              ...pgKompleksRows,
            ],
          }),

          createSectionHeading('V. SOAL STUDI KASUS SUMATIF (ESSAY HOTS)'),
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: `Soal Studi Kasus Penalaran Tingkat Tinggi (HOTS) — Pertemuan 1 s.d ${totalSesi}:`,
                font: FONT_FAMILY,
                bold: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: `Analisislah sebuah sistem nyata yang berkaitan dengan ${topik}. Buatlah pemetaan variabel (IPO), susunlah diagram alir (flowchart) dengan simbol ISO yang tepat, dan buktikan ketahanan alur logika Anda menggunakan simulasi trace table untuk kasus normal dan ekstrem (corner case)!`,
                font: FONT_FAMILY,
                size: 19,
              }),
            ],
          }),

          createSectionHeading('VI. FORMULA REKAPITULASI NILAI AKHIR MODUL'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Komponen Penilaian', 40),
                  createHeaderCell('Bobot (%)', 20),
                  createHeaderCell('Keterangan & Sumber Data', 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell(`Asesmen Formatif (LKPD 1 s.d ${totalSesi} & Observasi)`, 40, true, COLOR_BG_LIGHT),
                  createDataCell('40%', 20, true, 'FFFFFF', AlignmentType.CENTER),
                  createDataCell(`Rata-rata unjuk kerja ${totalSesi} pertemuan aktif`, 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Asesmen Sumatif (PG Kompleks & Essay HOTS)', 40, true, COLOR_BG_LIGHT),
                  createDataCell('60%', 20, true, 'FFFFFF', AlignmentType.CENTER),
                  createDataCell('Nilai evaluasi komprehensif akhir materi', 40),
                ],
              }),
            ],
          }),

          createSignatureBlock(
            currentIdentitas.sekolah,
            guruMapel,
            currentIdentitas.nipGuru,
            currentIdentitas.kepalaSekolah,
            currentIdentitas.nipKepalaSekolah
          ),
        ],
      },
    ],
  });
};

/**
 * Generates Rubrik DOCX Document (100% DINAMIS SESUAI JUMLAH PERTEMUAN)
 */
export const buildRubrikDocument = (rubrik: RubrikDoc, identitas: IdentitasRPM, logos?: KopLogos): Document => {
  const currentIdentitas = { ...identitas, ...rubrik.identitas };
  const totalSesi = Math.max(1, parseInt(String(currentIdentitas.jumlahPertemuan || rubrik.identitas?.jumlahPertemuan || '2'), 10) || 2);
  const meetingAllocations = calculateMeetingAllocations(currentIdentitas.alokasiWaktu, totalSesi);
  const guruMapel = currentIdentitas.guruMapel || currentIdentitas.namaGuru || currentIdentitas.guru || 'Norbertus Suryadi, S.Kom.';
  const topik = currentIdentitas.topik || 'Berpikir Komputasional & Algoritma';

  // 1. Identitas Table
  const identitasTable = createStandardIdentitasTable(currentIdentitas, totalSesi, meetingAllocations);

  // 2. Rubrik Formatif Bagian A (HANYA sebanyak totalSesi)
  const formatifRows: TableRow[] = [
    new TableRow({
      children: [
        createHeaderCell('Sesi & Kriteria', 20),
        createHeaderCell('Sangat Baik (Skor 4)', 20),
        createHeaderCell('Baik (Skor 3)', 20),
        createHeaderCell('Cukup (Skor 2)', 20),
        createHeaderCell('Perlu Bimbingan (Skor 1)', 20),
      ],
    }),
  ];

  const defaultKriteriaList: BarisRubrik[] = [
    {
      pertemuanKe: 1,
      kriteria: `Pertemuan 1 (${meetingAllocations[0]?.displayString || '2 JP'}):\nAnalisis Dekomposisi & Abstraksi Masalah`,
      indikator: 'Kemampuan mengurai masalah kompleks menjadi sub-masalah dan memilah variabel keputusan kritis.',
      skor4: 'Mampu mendekomposisi seluruh masalah secara komprehensif dan mengabstraksi data esensial 100% tepat tanpa data redundan.',
      skor3: 'Mampu mendekomposisi masalah utama dengan baik dan mengabstraksi sebagian besar data esensial.',
      skor2: 'Dekomposisi masih parsial/kurang lengkap dan masih menyertakan data non-esensial.',
      skor1: 'Belum mampu memecah masalah menjadi sub-masalah dan gagal mengabstraksi data penting.',
    },
    {
      pertemuanKe: 2,
      kriteria: `Pertemuan 2 (${meetingAllocations[1]?.displayString || '2 JP'}):\nPerancangan Flowchart ISO, Pseudocode & Simulasi`,
      indikator: 'Ketepatan simbol ISO 5807, notasi pseudocode percabangan, simulasi dry-run trace table, dan evaluasi solusi.',
      skor4: 'Diagram alir sangat rapi, simbol ISO 100% tepat, uji coba dry-run mendalam (kasus normal & ekstrem), dan solusi sangat efisien.',
      skor3: 'Diagram alir jelas dengan simbol standar tepat, logika benar, dan uji coba dry-run berjalan baik pada kasus normal.',
      skor2: 'Diagram alir memuat beberapa kesalahan simbol/alur dan uji coba simulasi masih sangat terbatas.',
      skor1: 'Diagram alir tidak terstandar, alur logika salah total, dan tidak melakukan uji simulasi trace table.',
    },
    {
      pertemuanKe: 3,
      kriteria: `Pertemuan 3 (${meetingAllocations[2]?.displayString || '2 JP'}):\nEvaluasi Komparasi Solusi & Optimasi`,
      indikator: 'Kemampuan analisis efisiensi, perbaikan bug logika secara mandiri, dan presentasi rekomendasi.',
      skor4: 'Evaluasi efisiensi sangat kritis, rekomendasi optimasi akurat, dan presentasi sangat komunikatif.',
      skor3: 'Evaluasi berjalan baik, rekomendasi logis, dan presentasi disampaikan secara jelas.',
      skor2: 'Evaluasi masih dangkal dan presentasi kurang terstruktur.',
      skor1: 'Tidak mampu mengevaluasi solusi dan tidak mempresentasikan hasil karya kelompok.',
    },
  ];

  const rawKriteria = Array.isArray(rubrik.bagianA_Formatif?.kriteriaList) ? rubrik.bagianA_Formatif.kriteriaList : [];

  for (let i = 0; i < totalSesi; i++) {
    const pNum = i + 1;
    const alloc = meetingAllocations[i] || { displayString: '2 JP (90 Menit)', meetingMinutes: 90, meetingJp: 2, minsPerJp: 45 };
    const existing = rawKriteria[i];
    const fallback = defaultKriteriaList[i % defaultKriteriaList.length];

    const kriteriaTitle = existing?.kriteria || `Pertemuan ${pNum} (${alloc.displayString}):\n${fallback.kriteria.split(':\n')[1] || 'Unjuk Kerja & LKPD'}`;
    const s4 = existing?.skor4 || fallback.skor4;
    const s3 = existing?.skor3 || fallback.skor3;
    const s2 = existing?.skor2 || fallback.skor2;
    const s1 = existing?.skor1 || fallback.skor1;

    formatifRows.push(
      new TableRow({
        children: [
          createDataCell(kriteriaTitle, 20, true, COLOR_BG_LIGHT),
          createDataCell(s4, 20),
          createDataCell(s3, 20),
          createDataCell(s2, 20),
          createDataCell(s1, 20),
        ],
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
            },
          },
        },
        footers: {
          default: createDocumentFooter(),
        },
        children: [
          createSchoolHeader('RUBRIK PENILAIAN & KRITERIA KETERCAPAIAN (KKTP)', `Topik: ${topik}`, currentIdentitas.sekolah, logos),
          createSectionHeading('I. IDENTITAS MODUL & GURU PENGAMPU'),
          identitasTable,

          createSectionHeading(`BAGIAN A: RUBRIK ASESMEN FORMATIF (${totalSesi} PERTEMUAN AKTIF)`),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: formatifRows,
          }),

          createSectionHeading('BAGIAN B: INTERVAL NILAI & TINDAK LANJUT KKTP'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Interval Skor', 25),
                  createHeaderCell('Kategori Ketercapaian', 35),
                  createHeaderCell('Tindak Lanjut Pembelajaran', 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('0 - 64', 25, true, COLOR_BG_LIGHT, AlignmentType.CENTER),
                  createDataCell('Belum Mencapai Ketuntasan', 35),
                  createDataCell('Remedial terbimbing pada indikator yang belum tuntas.', 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('65 - 74', 25, true, COLOR_BG_LIGHT, AlignmentType.CENTER),
                  createDataCell('Mencapai Ketuntasan Minimal', 35),
                  createDataCell('Penguatan konsep melalui latihan soal mandiri.', 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('75 - 84', 25, true, COLOR_BG_LIGHT, AlignmentType.CENTER),
                  createDataCell('Tuntas dengan Baik', 35),
                  createDataCell('Diberikan materi pengayaan studi kasus nyata.', 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('85 - 100', 25, true, COLOR_BG_LIGHT, AlignmentType.CENTER),
                  createDataCell('Sangat Mahir / Melampaui', 35),
                  createDataCell('Tutor sebaya dan proyek eksplorasi mandiri lanjutan.', 40),
                ],
              }),
            ],
          }),

          createSignatureBlock(
            currentIdentitas.sekolah,
            guruMapel,
            currentIdentitas.nipGuru,
            currentIdentitas.kepalaSekolah,
            currentIdentitas.nipKepalaSekolah
          ),
        ],
      },
    ],
  });
};

/**
 * Main DOCX Generator Dispatcher
 */
export const generateDocxBlob = async (
  docType: DocType,
  data: GeneratedData,
  identitas: IdentitasRPM
): Promise<{ blob: Blob; filename: string }> => {
  const logos = await loadKopLogoBuffers();

  const prefixMap: { [key in DocType]: string } = {
    rpm: 'RPM',
    lkpd: 'LKPD',
    moodle: 'MOODLE',
    asesmen: 'ASESMEN',
    rubrik: 'RUBRIK',
  };

  const filename = buildDocxFilename(
    prefixMap[docType],
    identitas.mataPelajaran,
    identitas.kelas,
    identitas.topik
  );

  let doc: Document;

  switch (docType) {
    case 'rpm':
      doc = buildRpmDocument(data.rpm, identitas, logos);
      break;
    case 'lkpd':
      doc = buildLkpdDocument(data.lkpd, identitas, logos);
      break;
    case 'moodle':
      doc = buildMoodleDocument(data.moodle, identitas, logos);
      break;
    case 'asesmen':
      doc = buildAsesmenDocument(data.asesmen, identitas, logos);
      break;
    case 'rubrik':
      doc = buildRubrikDocument(data.rubrik, identitas, logos);
      break;
  }

  const blob = await Packer.toBlob(doc);
  return { blob, filename };
};

/**
 * Downloads a single document as DOCX.
 */
export const downloadDocumentDocx = async (
  docType: DocType,
  data: GeneratedData,
  identitas: IdentitasRPM
): Promise<{ success: boolean; filename: string; error?: string }> => {
  try {
    const { blob, filename } = await generateDocxBlob(docType, data, identitas);
    downloadDocxBlob(blob, filename);
    return { success: true, filename };
  } catch (err: any) {
    console.error('Error exporting DOCX:', err);
    return { success: false, filename: '', error: err?.message || String(err) };
  }
};

/**
 * Downloads all 5 documents as a ZIP of DOCX files.
 */
export const downloadAllDocumentsDocxZip = async (
  data: GeneratedData,
  identitas: IdentitasRPM,
  onProgress?: (status: string) => void
): Promise<void> => {
  const zip = new JSZip();
  const docTypes: DocType[] = ['rpm', 'lkpd', 'moodle', 'asesmen', 'rubrik'];

  for (let i = 0; i < docTypes.length; i++) {
    const type = docTypes[i];
    if (onProgress) onProgress(`Memproses file ${i + 1}/5: ${type.toUpperCase()}.docx...`);

    const { blob, filename } = await generateDocxBlob(type, data, identitas);
    zip.file(filename, blob);
  }

  if (onProgress) onProgress('Membuat arsip ZIP...');

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFilename = `PAKET_LENGKAP_MODUL_AJAR_${sanitizeFilename(identitas.mataPelajaran)}_${sanitizeFilename(identitas.kelas)}_${sanitizeFilename(identitas.topik)}.zip`;

  downloadDocxBlob(zipBlob, zipFilename);
};

export const docxService = {
  sanitizeFilename,
  buildDocxFilename,
  downloadDocxBlob,
  generateDocxBlob,
  downloadDocumentDocx,
  downloadAllDocumentsDocxZip,
};

export default docxService;
