import React from 'react';
import { X, Printer } from 'lucide-react';
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-100"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-modal-title"
    >
      <div
        className="bg-white rounded-xl max-w-4xl w-full border border-[#E2E6EB] overflow-hidden max-h-[92vh] flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Bar (No Print) */}
        <div className="no-print px-5 py-4 border-b border-[#E2E6EB] flex items-center justify-between">
          <h2 id="print-modal-title" className="font-semibold text-[#17212B] text-sm">
            Laporan maklum balas sesi
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#2457E7] hover:bg-[#1D46BE] text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#596579] hover:text-[#17212B] rounded-lg hover:bg-[#F6F7F9] transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-8 text-[#17212B] text-left print:p-0 print:overflow-visible">
          {/* Document Header */}
          <div className="border-b-2 border-[#17212B] pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-[#596579] uppercase tracking-wider mb-1">
                KelasPulse · Laporan Penilaian Bengkel
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#17212B]">
                {sessionTitle}
              </h1>
              {session?.instructor && (
                <p className="text-xs text-[#596579] mt-1">
                  Jurulatih: <span className="text-[#17212B] font-medium">{session.instructor}</span>
                </p>
              )}
            </div>

            <div className="text-left sm:text-right text-xs text-[#596579] space-y-0.5">
              <p>Tarikh program: <span className="font-medium text-[#17212B]">{session?.date || 'Pelbagai'}</span></p>
              <p>Tarikh dokumen: <span className="font-medium text-[#17212B]">{new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
              <p>Jumlah respons: <span className="font-tabular font-medium text-[#17212B]">{feedbacks.length} orang</span></p>
            </div>
          </div>

          {/* KPI Strip */}
          <div>
            <h2 className="text-xs font-semibold text-[#596579] uppercase tracking-wider mb-3">
              Ringkasan prestasi (KPI)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-lg border border-[#E2E6EB] bg-[#F6F7F9] text-center">
                <span className="text-xs text-[#596579] block mb-1">Kepuasan keseluruhan</span>
                <span className="text-2xl font-semibold font-tabular text-[#17212B]">{avgOverall}</span>
                <span className="text-[11px] text-[#596579] block mt-0.5">/ 5.0 bintang</span>
              </div>
              <div className="p-4 rounded-lg border border-[#E2E6EB] bg-[#F6F7F9] text-center">
                <span className="text-xs text-[#596579] block mb-1">Kandungan modul</span>
                <span className="text-2xl font-semibold font-tabular text-[#17212B]">{avgContent}</span>
                <span className="text-[11px] text-[#596579] block mt-0.5">/ 5.0 bintang</span>
              </div>
              <div className="p-4 rounded-lg border border-[#E2E6EB] bg-[#F6F7F9] text-center">
                <span className="text-xs text-[#596579] block mb-1">Penyampaian jurulatih</span>
                <span className="text-2xl font-semibold font-tabular text-[#17212B]">{avgDelivery}</span>
                <span className="text-[11px] text-[#596579] block mt-0.5">/ 5.0 bintang</span>
              </div>
              <div className="p-4 rounded-lg border border-[#E2E6EB] bg-[#F6F7F9] text-center">
                <span className="text-xs text-[#596579] block mb-1">Skor cadangan (NPS)</span>
                <span className="text-2xl font-semibold font-tabular text-[#17212B]">
                  {typeof npsScore === 'number' && npsScore > 0 ? `+${npsScore}` : npsScore}
                </span>
                <span className="text-[11px] text-[#596579] block mt-0.5">Julat -100 ke +100</span>
              </div>
            </div>
          </div>

          {/* AI Executive Summary */}
          {summary && (
            <div className="p-6 rounded-lg border border-[#E2E6EB] bg-[#F6F7F9] space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-2">
                <h2 className="font-semibold text-xs text-[#17212B] uppercase tracking-wider">
                  Rumusan maklum balas
                </h2>
                <span className="text-[#596579] font-tabular">
                  Dijana: {new Date(summary.generatedAt).toLocaleDateString('ms-MY')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-[#17212B] mb-2">
                    Kekuatan utama:
                  </h3>
                  <ul className="space-y-1.5 list-disc pl-4 text-[#596579] leading-relaxed">
                    {summary.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#17212B] mb-2">
                    Cadangan penambahbaikan:
                  </h3>
                  <ul className="space-y-1.5 list-disc pl-4 text-[#596579] leading-relaxed">
                    {summary.improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E6EB]">
                <h3 className="font-semibold text-[#17212B] mb-1">
                  Kesimpulan:
                </h3>
                <p className="text-[#596579] leading-relaxed">
                  “{summary.conclusion}”
                </p>
              </div>
            </div>
          )}

          {/* Feedback Table */}
          <div>
            <h2 className="text-xs font-semibold text-[#596579] uppercase tracking-wider mb-3">
              Senarai maklum balas peserta ({feedbacks.length})
            </h2>

            <div className="border border-[#E2E6EB] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F6F7F9] text-[#596579] font-medium border-b border-[#E2E6EB]">
                    <th className="p-2.5 w-10 text-center">#</th>
                    <th className="p-2.5">Peserta</th>
                    <th className="p-2.5 text-center">Rating</th>
                    <th className="p-2.5 text-center">NPS</th>
                    <th className="p-2.5">Perkara paling bermanfaat</th>
                    <th className="p-2.5">Cadangan</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6EB]">
                  {feedbacks.map((fb, idx) => (
                    <tr key={fb.id} className="hover:bg-[#F6F7F9]/50">
                      <td className="p-2.5 text-center text-[#596579] font-tabular">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 font-medium text-[#17212B] whitespace-nowrap">
                        {fb.isAnonymous ? 'Tanpa nama' : fb.authorName}
                      </td>
                      <td className="p-2.5 text-center font-tabular font-medium text-[#D97706]">
                        {fb.ratingOverall}★
                      </td>
                      <td className="p-2.5 text-center font-tabular font-medium text-[#17212B]">
                        {fb.npsScore}
                      </td>
                      <td className="p-2.5 text-[#17212B] max-w-xs leading-snug">
                        {fb.keyTakeaway}
                      </td>
                      <td className="p-2.5 text-[#596579] max-w-xs leading-snug">
                        {fb.improvementSuggestion || '—'}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="text-[11px] text-[#596579]">
                          {fb.status === 'approved' ? 'Diluluskan' : 'Ditahan'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-[#E2E6EB] text-xs text-[#596579] flex justify-between">
            <span>KelasPulse · Sistem Pengumpulan Maklum Balas Latihan</span>
            <span>Dokumen Rasmi Penilaian</span>
          </div>
        </div>
      </div>
    </div>
  );
};
