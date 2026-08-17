import React from 'react';
import { SCHOOL_IDENTITY } from '../data/schoolConfig';
import { DocType } from '../types';

interface DocumentHeaderProps {
  documentType: DocType;
  schoolName?: string;
  logo?: string;
  title?: string;
  subtitle?: string;
  topic?: string;
  subject?: string;
  classGrade?: string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  documentType,
  schoolName,
  title,
  subtitle,
  topic,
}) => {
  // Normalize school name
  let rawSchool = (schoolName || SCHOOL_IDENTITY.name).trim();
  if (rawSchool === 'SMA Xaverius 1' || !rawSchool) {
    rawSchool = 'SMA Xaverius 1 Palembang';
  }
  const schoolUpper = rawSchool.toUpperCase();

  let mainTitle = '';
  let subTitleText = '';

  switch (documentType) {
    case 'rpm':
      mainTitle = 'RENCANA PEMBELAJARAN MENDALAM (RPM)';
      subTitleText =
        subtitle ||
        'Kurikulum Merdeka & Pendekatan Deep Learning (Memahami, Mengaitkan, Menerapkan)';
      break;

    case 'lkpd':
      mainTitle = 'LEMBAR KERJA PESERTA DIDIK (LKPD)';
      subTitleText = title || subtitle || (topic ? `Topik: ${topic}` : 'Aktivitas Diskusi & Penyelidikan Kelompok');
      break;

    case 'moodle':
      mainTitle = 'PANDUAN E-LEARNING & DESKRIPSI AKTIVITAS';
      subTitleText = title || subtitle || (topic ? `Aktivitas Pembelajaran: ${topic}` : 'Moodle LMS & Pembelajaran Digital');
      break;

    case 'asesmen':
      mainTitle = 'ASESMEN PEMBELAJARAN';
      subTitleText = title || subtitle || (topic ? `Instrumen Penilaian: ${topic}` : 'Instrumen Penilaian Formatif & Sumatif');
      break;

    case 'rubrik':
      mainTitle = 'RUBRIK PENILAIAN';
      subTitleText = title || subtitle || (topic ? `Kriteria Ketercapaian (KKTP): ${topic}` : 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)');
      break;
  }

  return (
    <div className="border-b-2 border-gray-800 pb-3 mb-6 relative">
      <div className="flex items-center justify-between gap-4">
        {/* LOGO KIRI: YAYASAN XAVERIUS PALEMBANG */}
        <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 md:w-24 md:h-24">
          <img
            src="/yxp.png"
            alt="Logo Yayasan Xaverius Palembang"
            className="w-full h-full object-contain max-h-24"
            crossOrigin="anonymous"
          />
        </div>

        {/* IDENTITAS & JUDUL DOKUMEN (TENGAH) */}
        <div className="flex-1 text-center px-2">
          <h3 className="text-xs md:text-sm font-bold tracking-wider uppercase text-blue-950 leading-tight">
            YAYASAN XAVERIUS PALEMBANG
          </h3>
          <h1 className="text-base md:text-lg font-extrabold tracking-wide uppercase text-gray-900 leading-tight">
            {schoolUpper}
          </h1>
          <h2 className="text-sm md:text-base font-bold text-blue-900 uppercase tracking-wide mt-0.5">
            {mainTitle}
          </h2>
          {subTitleText && (
            <p className="text-xs md:text-sm text-gray-600 font-medium italic mt-0.5">
              {subTitleText}
            </p>
          )}
        </div>

        {/* LOGO KANAN: SMA XAVERIUS 1 PALEMBANG */}
        <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 md:w-24 md:h-24">
          <img
            src="/logo-xaverius.png"
            alt="Logo SMA Xaverius 1 Palembang"
            className="w-full h-full object-contain max-h-24"
            crossOrigin="anonymous"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;
