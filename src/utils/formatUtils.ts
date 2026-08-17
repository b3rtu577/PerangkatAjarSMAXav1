/**
 * Strips raw HTML tags (e.g. <td colspan=3/>, <tr>, <p>, <br>, <hr>) and converts dividers to Markdown '---'.
 */
export const stripHtmlTags = (input: any): string => {
  if (input === null || input === undefined) return '';
  const str = typeof input === 'string' ? input : String(input);
  return str
    // Convert table row/cell breaks, table headers, or horizontal lines to standard markdown divider
    .replace(/<td[^>]*colspan[^>]*\/?>/gi, '\n---\n')
    .replace(/<th[^>]*colspan[^>]*\/?>/gi, '\n---\n')
    .replace(/<hr\s*\/?>/gi, '\n---\n')
    .replace(/<\/?tr[^>]*>/gi, '\n')
    .replace(/<\/?td[^>]*>/gi, ' ')
    .replace(/<\/?th[^>]*>/gi, ' ')
    .replace(/<\/?table[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/?div[^>]*>/gi, '\n')
    .replace(/<\/?span[^>]*>/gi, '')
    // Strip any remaining HTML tags (like <td colspan=3/> or self-closing tags)
    .replace(/<[^>]+>/g, '')
    // Clean multiple duplicate line breaks
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Sanitizes and validates academic titles and educator names.
 * Removes double dots (e.g. "S..T.P." -> "S.T.P.", "S..Pd." -> "S.Pd.") and standardizes punctuation.
 */
export const cleanAcademicTitles = (nameOrTitle: string = ''): string => {
  if (!nameOrTitle) return '';
  let cleaned = stripHtmlTags(nameOrTitle);

  // Replace double or multiple dots with single dot
  cleaned = cleaned.replace(/\.{2,}/g, '.');

  // Fix common degree formats if dots are doubled or missing trailing dot
  cleaned = cleaned
    .replace(/\bS\.T\.P(?!\.)/g, 'S.T.P.')
    .replace(/\bS\.Pd(?!\.)/g, 'S.Pd.')
    .replace(/\bM\.Pd(?!\.)/g, 'M.Pd.')
    .replace(/\bS\.Kom(?!\.)/g, 'S.Kom.')
    .replace(/\bM\.Kom(?!\.)/g, 'M.Kom.')
    .replace(/\bS\.Si(?!\.)/g, 'S.Si.')
    .replace(/\bM\.Si(?!\.)/g, 'M.Si.')
    .replace(/\bS\.Sos(?!\.)/g, 'S.Sos.')
    .replace(/\bM\.Sc(?!\.)/g, 'M.Sc.')
    .replace(/\bS\.E(?!\.)/g, 'S.E.')
    .replace(/\bM\.M(?!\.)/g, 'M.M.')
    .replace(/\bS\.Ag(?!\.)/g, 'S.Ag.')
    .replace(/\bM\.Ag(?!\.)/g, 'M.Ag.')
    .replace(/\bDra(?!\.)/g, 'Dra.')
    .replace(/\bDrs(?!\.)/g, 'Drs.')
    .replace(/\bDr(?!\.)/g, 'Dr.')
    .replace(/\bProf(?!\.)/g, 'Prof.');

  // Clean trailing spaces before comma or dot
  cleaned = cleaned.replace(/\s+([.,])/g, '$1').replace(/,\s*,/g, ',');

  return cleaned.trim();
};

/**
 * Sanitizes common Indonesian educational and contextual typos
 */
export const sanitizeTypoAndSpelling = (text: string = ''): string => {
  if (!text) return '';
  let cleaned = text;

  // Typo: pertaian -> pertanian
  cleaned = cleaned.replace(/\bpertaian\b/gi, (match) => {
    return match[0] === 'P' ? 'Pertanian' : 'pertanian';
  });

  // Typo: pembelajran -> pembelajaran
  cleaned = cleaned.replace(/\bpembelajran\b/gi, (match) => {
    return match[0] === 'P' ? 'Pembelajaran' : 'pembelajaran';
  });

  // Typo: perancanagan -> perancangan
  cleaned = cleaned.replace(/\bperancanagan\b/gi, (match) => {
    return match[0] === 'P' ? 'Perancangan' : 'perancangan';
  });

  // Typo: identifkasi -> identifikasi
  cleaned = cleaned.replace(/\bidentifkasi\b/gi, (match) => {
    return match[0] === 'I' ? 'Identifikasi' : 'identifikasi';
  });

  // Typo: komprehenif -> komprehensif
  cleaned = cleaned.replace(/\bkomprehenif\b/gi, (match) => {
    return match[0] === 'K' ? 'Komprehensif' : 'komprehensif';
  });

  return cleaned;
};

/**
 * Returns subject-specific core activity phrasing for Kegiatan Inti (Deskripsi Aktivitas Guru & Siswa)
 */
export const getActivityPhrasingForSubject = (mapel: string = ''): {
  klausaSiswa: string;
  aktivitasSiswaInti: string;
  aktivitasGuruInti: string;
} => {
  const m = mapel.toLowerCase();

  // 1. Bahasa Indonesia / Bahasa & Sastra
  if (m.includes('bahasa') || m.includes('sastra') || m.includes('indonesia') || m.includes('inggris')) {
    return {
      klausaSiswa: 'menganalisis struktur wacana, merumuskan gagasan',
      aktivitasSiswaInti: 'Peserta didik berkolaborasi aktif dalam kelompok, mengidentifikasi variabel masalah, menganalisis struktur wacana, merumuskan gagasan, dan menyusun karya terstruktur, serta mempresentasikan hasil karya di hadapan kelas.',
      aktivitasGuruInti: 'Guru menyajikan studi kasus wacana otentik berbasis Deep Learning, membimbing penyelidikan kelompok dengan LKPD, memfasilitasi eksplorasi struktur teks dan perumusan gagasan kritis, serta mengarahkan sesi presentasi dan refleksi.'
    };
  }

  // 2. Biologi / IPA / Sains / Fisika / Kimia
  if (m.includes('biologi') || m.includes('ipa') || m.includes('sains') || m.includes('fisika') || m.includes('kimia') || m.includes('alam')) {
    return {
      klausaSiswa: 'menganalisis data observasi ekosistem/gejala alam, merumuskan hipotesis',
      aktivitasSiswaInti: 'Peserta didik berkolaborasi aktif dalam kelompok, mengidentifikasi variabel penelitian, menganalisis data observasi ekosistem/gejala alam, merumuskan hipotesis, dan menyusun laporan penyelidikan terstruktur, serta mempresentasikan temuan di hadapan kelas.',
      aktivitasGuruInti: 'Guru menyajikan fenomena alam/gejala sains otentik berbasis Deep Learning, membimbing penyelidikan kelompok dengan LKPD, memfasilitasi pengujian hipotesis dan analisis data empiris, serta memandu sesi presentasi dan verifikasi ilmiah.'
    };
  }

  // 3. Informatika / Komputer / Coding
  if (m.includes('informatika') || m.includes('komputer') || m.includes('coding') || m.includes('rekayasa perangkat')) {
    return {
      klausaSiswa: 'merumuskan alur algoritma/solusi terstruktur',
      aktivitasSiswaInti: 'Peserta didik berkolaborasi aktif dalam kelompok, mengidentifikasi variabel masalah, merumuskan alur algoritma/solusi terstruktur, dan mempresentasikan hasil karya di hadapan kelas.',
      aktivitasGuruInti: 'Guru menyajikan studi kasus komputasional otentik berbasis Deep Learning, membimbing penyelidikan kelompok dengan LKPD, memfasilitasi perancangan notasi algoritma dan pseudocode, serta mengarahkan sesi presentasi dan pengujian solusi.'
    };
  }

  // 4. Mapel Lain (Sosial/Seni/PJOK/Agama/Umum)
  return {
    klausaSiswa: 'menganalisis materi/studi kasus, merumuskan gagasan',
    aktivitasSiswaInti: 'Peserta didik berkolaborasi aktif dalam kelompok, mengidentifikasi variabel masalah, menganalisis materi/studi kasus, merumuskan gagasan, dan menyusun solusi terstruktur, serta mempresentasikan hasil karya di hadapan kelas.',
    aktivitasGuruInti: 'Guru menyajikan studi kasus kontekstual otentik berbasis Deep Learning, membimbing penyelidikan kelompok dengan LKPD, memfasilitasi pembedahan isu dan perumusan solusi terapan, serta mengarahkan sesi presentasi dan diskusi kelas.'
  };
};

/**
 * Strips duplicate leading headers from contohNotasi to prevent double headings like:
 * "📌 Kerangka Konsep, Formulasi & Alur Pembelajaran: 📌 Kerangka Konsep & Alur Analisis:"
 */
export const cleanDuplicateNotasiHeader = (raw: string = ''): string => {
  if (!raw) return '';
  let cleaned = stripHtmlTags(raw);
  cleaned = sanitizeTypoAndSpelling(cleaned);
  cleaned = cleaned
    .replace(/^\s*\/\/\s*📌\s*KERANGKA\s*KONSEP[^\n]*\n?/i, '')
    .replace(/^\s*\/\/\s*💻\s*NOTASI[^\n]*\n?/i, '')
    .replace(/^\s*📌\s*Kerangka Konsep, Formulasi & Alur Pembelajaran:\s*/i, '')
    .replace(/^\s*📌\s*Kerangka Konsep & Alur Analisis:\s*/i, '')
    .replace(/^\s*📝\s*Kerangka Konsep[^\n:]*:\s*/i, '')
    .replace(/^\s*💻\s*Notasi Logika, Algoritma & Pseudocode:\s*/i, '')
    .replace(/^\s*💻\s*Notasi \/ Algoritma \/ Pseudocode:\s*/i, '')
    .replace(/^\s*📐\s*Notasi Logika[^\n:]*:\s*/i, '')
    .trim();
  return cleaned;
};

export const renderTextValue = (val: any): string => {
  if (val === null || val === undefined) return '';
  let str = '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    str = String(val);
  } else if (typeof val === 'object') {
    if (val.kode && val.deskripsi) str = `${val.kode}: ${val.deskripsi}`;
    else if (val.deskripsi) str = val.deskripsi;
    else if (val.text) str = val.text;
    else if (val.isi) str = val.isi;
    else if (val.judul) str = val.deskripsi ? `${val.judul} - ${val.deskripsi}` : val.judul;
    else if (val.soal) str = val.soal;
    else {
      try {
        const primitiveValues = Object.values(val).filter(
          (v) => typeof v === 'string' || typeof v === 'number'
        );
        if (primitiveValues.length > 0) {
          str = primitiveValues.join(' - ');
        } else {
          str = JSON.stringify(val);
        }
      } catch {
        str = String(val);
      }
    }
  } else {
    str = String(val);
  }
  return sanitizeTypoAndSpelling(stripHtmlTags(str));
};

/**
 * Formats metadata identitas cleanly: "Kelas {KELAS} / {FASE} / Semester {SEMESTER}"
 * e.g., "Kelas X / Fase E / Semester Ganjil" - without repeating words like "Fase Fase E".
 */
export const formatCleanKelasFaseSemester = (
  kelasInput?: string,
  faseInput?: string,
  semesterInput?: string
): string => {
  const rawKelas = String(kelasInput || '').trim();
  const rawFase = String(faseInput || '').trim();
  const rawSemester = String(semesterInput || '').trim();

  let detectedKelas = '';
  let detectedFase = '';
  let detectedSemester = '';

  // 1. Detect Kelas
  if (/\b(?:kelas\s*)?(xii|12)\b/i.test(rawKelas)) {
    detectedKelas = 'XII';
  } else if (/\b(?:kelas\s*)?(xi|11)\b/i.test(rawKelas)) {
    detectedKelas = 'XI';
  } else if (/\b(?:kelas\s*)?(x|10)\b/i.test(rawKelas)) {
    detectedKelas = 'X';
  } else if (rawKelas) {
    detectedKelas = rawKelas.replace(/^kelas\s*/i, '').split(/[\/\-]/)[0].trim() || 'X';
  } else {
    detectedKelas = 'X';
  }

  // 2. Detect Fase
  if (/\b(?:fase\s*)?f\b/i.test(rawFase) || /\b(?:fase\s*)?f\b/i.test(rawKelas)) {
    detectedFase = 'Fase F';
  } else if (/\b(?:fase\s*)?e\b/i.test(rawFase) || /\b(?:fase\s*)?e\b/i.test(rawKelas)) {
    detectedFase = 'Fase E';
  } else if (detectedKelas === 'XI' || detectedKelas === 'XII' || detectedKelas === '11' || detectedKelas === '12') {
    detectedFase = 'Fase F';
  } else {
    detectedFase = 'Fase E';
  }

  // 3. Detect Semester
  if (/\bgenap\b/i.test(rawSemester) || /\bgenap\b/i.test(rawKelas)) {
    detectedSemester = 'Semester Genap';
  } else if (/\bganjil\b/i.test(rawSemester) || /\bganjil\b/i.test(rawKelas)) {
    detectedSemester = 'Semester Ganjil';
  } else if (rawSemester) {
    const sClean = rawSemester.replace(/^semester\s*/i, '').trim();
    detectedSemester = sClean ? `Semester ${sClean}` : 'Semester Ganjil';
  } else {
    detectedSemester = 'Semester Ganjil';
  }

  return `Kelas ${detectedKelas} / ${detectedFase} / ${detectedSemester}`;
};

export interface StepTimeBreakdown {
  pendahuluan: string;
  inti: string;
  penutup: string;
  pendahuluanMins: number;
  intiMins: number;
  penutupMins: number;
  totalMins: number;
}

/**
 * Calculates standardized and precise meeting step timing (Pendahuluan, Inti, Penutup)
 * Strictly adheres to school standards:
 * - Standard 1 JP = 45 Menit:
 *   * 1 JP (45'): 10' Pendahuluan + 25' Inti + 10' Penutup = 45 Menit
 *   * 2 JP (90'): 15' Pendahuluan + 60' Inti + 15' Penutup = 90 Menit
 *   * 3 JP (135'): 15' Pendahuluan + 105' Inti + 15' Penutup = 135 Menit
 * - Standard 1 JP = 40 Menit:
 *   * 1 JP (40'): 10' Pendahuluan + 20' Inti + 10' Penutup = 40 Menit
 *   * 2 JP (80'): 15' Pendahuluan + 50' Inti + 15' Penutup = 80 Menit
 *   * 3 JP (120'): 15' Pendahuluan + 90' Inti + 15' Penutup = 120 Menit
 */
export const getMeetingStepTimes = (
  meetingJp: number = 2,
  minsPerJp: number = 45,
  meetingMinutes?: number
): StepTimeBreakdown => {
  const totalMins = meetingMinutes || meetingJp * minsPerJp;
  const is40MinStandard = minsPerJp === 40 || totalMins === 40 || totalMins === 80;

  if (is40MinStandard) {
    if (meetingJp === 1 || totalMins <= 45) {
      return {
        pendahuluan: '10 Menit',
        inti: '20 Menit',
        penutup: '10 Menit',
        pendahuluanMins: 10,
        intiMins: 20,
        penutupMins: 10,
        totalMins: 40,
      };
    } else {
      const pMins = 15;
      const cMins = Math.max(20, totalMins - 30);
      const eMins = 15;
      return {
        pendahuluan: `${pMins} Menit`,
        inti: `${cMins} Menit`,
        penutup: `${eMins} Menit`,
        pendahuluanMins: pMins,
        intiMins: cMins,
        penutupMins: eMins,
        totalMins,
      };
    }
  } else {
    // 45 Min standard (default)
    if (meetingJp === 1 || totalMins <= 50) {
      return {
        pendahuluan: '10 Menit',
        inti: '25 Menit',
        penutup: '10 Menit',
        pendahuluanMins: 10,
        intiMins: 25,
        penutupMins: 10,
        totalMins: 45,
      };
    } else {
      const pMins = 15;
      const cMins = Math.max(25, totalMins - 30); // 90 - 30 = 60 Menit!
      const eMins = 15;
      return {
        pendahuluan: `${pMins} Menit`,
        inti: `${cMins} Menit`,
        penutup: `${eMins} Menit`,
        pendahuluanMins: pMins,
        intiMins: cMins,
        penutupMins: eMins,
        totalMins,
      };
    }
  }
};
