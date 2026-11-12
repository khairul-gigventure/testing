import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { FeedbackEntry, TrainingSession, ExecutiveSummary } from '../types';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle: string;
  session?: TrainingSession;
  feedbacks: FeedbackEntry[];
  summary?: ExecutiveSummary;
  npsScore: number | string;
  avgOverall: string;
  avgContent: string;
  avgDelivery: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  sessionTitle,
  session,
  feedbacks,
  summary,
  npsScore,
  avgOverall,
  avgContent,
  avgDelivery,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full border border-[#E8E6E1] overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Top Bar (No Print) */}
        <div className="no-print px-6 py-4 border-b border-[#E8E6E1] flex items-center justify-between bg-[#FAFAF8]">
          <div>
            <h2 className="font-extrabold text-[#181716] text-sm">
              Laporan Analitik Eksekutif Sesi
            </h2>
            <p className="text-xs text-[#73726E]">
              Sedia untuk cetakan rasmi atau simpan sebagai dokumen PDF.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-[#181716] text-white hover:bg-[#2C2A28] transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#73726E] hover:text-[#181716] rounded-lg hover:bg-[#F3F3EE] transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-8 text-[#181716] print:p-0 print:overflow-visible">
          {/* Document Header */}
          <div className="border-b-2 border-[#181716] pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="text-[11px] font-extrabold text-[#73726E] uppercase tracking-wider mb-1">
                KelasPulse AI · Laporan Penilaian Rasmi Kursus
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#181716]">
                {sessionTitle}
              </h1>
              {session?.instructor && (
                <p className="text-xs text-[#73726E] mt-1">
                  Tenaga Pengajar: <span className="text-[#181716] font-semibold">{session.instructor}</span>
                </p>
              )}
            </div>

            <div className="text-left sm:text-right text-xs text-[#73726E] space-y-0.5 font-medium">
              <p>Tarikh Program: <span className="font-bold text-[#181716]">{session?.date || 'Pelbagai Tarikh'}</span></p>
              <p>Tarikh Dokumen: <span className="font-bold text-[#181716]">{new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
              <p>Jumlah Responden: <span className="font-tabular font-bold text-[#181716]">{feedbacks.length} orang</span></p>
            </div>
          </div>

          {/* KPI Strip */}
          <div>
            <h2 className="text-xs font-bold text-[#73726E] uppercase tracking-wider mb-3">
              1. Ringkasan Prestasi Utama (KPI)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl border border-[#E8E6E1] bg-[#FAFAF8] text-center">
                <span className="text-[11px] text-[#73726E] block mb-1">Kepuasan Keseluruhan</span>
                <span className="text-2xl font-extrabold font-tabular text-[#181716]">{avgOverall}</span>
                <span className="text-[10px] text-[#73726E] block mt-0.5">/ 5.0 bintang</span>
              </div>
              <div className="p-4 rounded-xl border border-[#E8E6E1] bg-[#FAFAF8] text-center">
                <span className="text-[11px] text-[#73726E] block mb-1">Kefahaman Kandungan</span>
                <span className="text-2xl font-extrabold font-tabular text-[#181716]">{avgContent}</span>
                <span className="text-[10px] text-[#73726E] block mt-0.5">/ 5.0 bintang</span>
              </div>
              <div className="p-4 rounded-xl border border-[#E8E6E1] bg-[#FAFAF8] text-center">
                <span className="text-[11px] text-[#73726E] block mb-1">Penyampaian Trainer</span>
                <span className="text-2xl font-extrabold font-tabular text-[#181716]">{avgDelivery}</span>
                <span className="text-[10px] text-[#73726E] block mt-0.5">/ 5.0 bintang</span>
              </div>
              <div className="p-4 rounded-xl border border-[#E8E6E1] bg-[#FAFAF8] text-center">
                <span className="text-[11px] text-[#73726E] block mb-1">Skor Kesetiaan (NPS)</span>
                <span className="text-2xl font-extrabold font-tabular text-[#181716]">
                  {typeof npsScore === 'number' && npsScore > 0 ? `+${npsScore}` : npsScore}
                </span>
                <span className="text-[10px] text-[#73726E] block mt-0.5">Julat -100 ke +100</span>
              </div>
            </div>
          </div>

          {/* AI Executive Summary */}
          {summary && (
            <div className="p-6 rounded-2xl border border-[#E8E6E1] bg-[#FAFAF8] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E6E1] pb-2.5">
                <h2 className="text-xs font-extrabold text-[#181716] uppercase tracking-wider">
                  2. Rumusan Eksekutif Berasaskan AI
                </h2>
                <span className="text-[11px] text-[#73726E] font-tabular">
                  Dijana: {new Date(summary.generatedAt).toLocaleDateString('ms-MY')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <h3 className="font-bold text-[#181716] mb-2">
                    3 Kekuatan Utama Kelas:
                  </h3>
                  <ul className="space-y-1.5 list-disc pl-4 text-[#44423E] leading-relaxed">
                    {summary.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-[#181716] mb-2">
                    Cadangan Penambahbaikan Tindakan:
                  </h3>
                  <ul className="space-y-1.5 list-disc pl-4 text-[#44423E] leading-relaxed">
                    {summary.improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E6E1]">
                <h3 className="font-bold text-[#181716] text-xs mb-1">
                  Sentimen & Kesimpulan Eksekutif:
                </h3>
                <p className="text-xs text-[#44423E] leading-relaxed">
                  “{summary.conclusion}”
                </p>
              </div>
            </div>
          )}

          {/* Feedback Table */}
          <div>
            <h2 className="text-xs font-bold text-[#73726E] uppercase tracking-wider mb-3">
              3. Senarai Lengkap Maklum Balas Peserta ({feedbacks.length})
            </h2>

            <div className="border border-[#E8E6E1] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAFAF8] text-[#73726E] font-semibold border-b border-[#E8E6E1]">
                    <th className="p-2.5 w-10 text-center">#</th>
                    <th className="p-2.5">Peserta</th>
                    <th className="p-2.5 text-center">Rating</th>
                    <th className="p-2.5 text-center">NPS</th>
                    <th className="p-2.5">Perkara Paling Bermanfaat</th>
                    <th className="p-2.5">Cadangan Penambahbaikan</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EFEA]">
                  {feedbacks.map((fb, idx) => (
                    <tr key={fb.id} className="hover:bg-[#FAFAF8]/50">
                      <td className="p-2.5 text-center text-[#8C887B] font-tabular">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 font-semibold text-[#181716] whitespace-nowrap">
                        {fb.authorName}
                        {fb.isAnonymous && <span className="text-[10px] text-[#73726E] block font-normal">(Anon)</span>}
                      </td>
                      <td className="p-2.5 text-center font-tabular font-bold text-[#B45309]">
                        {fb.ratingOverall}★
                      </td>
                      <td className="p-2.5 text-center font-tabular font-bold text-[#181716]">
                        {fb.npsScore}
                      </td>
                      <td className="p-2.5 text-[#2B2A27] max-w-xs leading-snug">
                        {fb.keyTakeaway}
                      </td>
                      <td className="p-2.5 text-[#73726E] max-w-xs leading-snug">
                        {fb.improvementSuggestion || '—'}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="text-[10px] text-[#73726E] font-semibold">
                          {fb.status === 'approved' ? 'Live' : 'Hidden'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-[#E8E6E1] text-[11px] text-[#73726E] flex justify-between">
            <span>KelasPulse AI · Sistem Pengumpulan Maklum Balas & Live Wall</span>
            <span>Dokumen Rasmi Penilaian Latihan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
