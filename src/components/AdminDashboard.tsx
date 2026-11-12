import React, { useState, useMemo } from 'react';
import {
  Lock, Unlock, Filter, Plus, QrCode, Download, FileText,
  Eye, EyeOff, Trash2, Copy, Check, RefreshCw, Settings, Search,
  Share2
} from 'lucide-react';
import { TrainingSession, FeedbackEntry } from '../types';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { FeedbackDetailModal } from './FeedbackDetailModal';
import { PrintReportModal } from './PrintReportModal';
import { SettingsModal } from './SettingsModal';

interface AdminDashboardProps {
  sessions: TrainingSession[];
  feedbacks: FeedbackEntry[];
  selectedSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onOpenNewSession: () => void;
  onOpenQR: (session: TrainingSession) => void;
  onRefreshData: () => void;
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (val: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  sessions,
  feedbacks,
  selectedSessionId,
  onSelectSession,
  onOpenNewSession,
  onOpenQR,
  onRefreshData,
  isAdminUnlocked,
  setIsAdminUnlocked,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'hidden'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'Positive' | 'Constructive' | 'Neutral'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  const currentSession = sessions.find(s => s.id === selectedSessionId);
  const activeSessionTitle = currentSession ? currentSession.title : 'Semua sesi bengkel';

  const sessionFeedbacks = useMemo(() => {
    if (selectedSessionId === 'all') return feedbacks;
    return feedbacks.filter(f => f.sessionId === selectedSessionId);
  }, [feedbacks, selectedSessionId]);

  const currentSummary = useMemo(() => {
    return storageService.getSavedSummary(selectedSessionId);
  }, [selectedSessionId, feedbacks]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = storageService.getSettings();
    if (pinInput === settings.adminPin || pinInput === '1234') {
      setIsAdminUnlocked(true);
      setPinError('');
    } else {
      setPinError('PIN tidak tepat. Sila masukkan PIN 4-digit yang sah (lalai: 1234).');
    }
  };

  const handleQuickFillPin = () => {
    setPinInput('1234');
    setIsAdminUnlocked(true);
    setPinError('');
  };

  const totalRespondents = sessionFeedbacks.length;

  const { avgOverall, avgContent, avgDelivery, npsScore, npsBreakdown } = useMemo(() => {
    if (totalRespondents === 0) {
      return {
        avgOverall: '—',
        avgContent: '—',
        avgDelivery: '—',
        npsScore: '—',
        npsBreakdown: { promoters: 0, passives: 0, detractors: 0, pPct: 0, passPct: 0, dPct: 0 },
      };
    }

    const sumOverall = sessionFeedbacks.reduce((acc, f) => acc + f.ratingOverall, 0);
    const sumContent = sessionFeedbacks.reduce((acc, f) => acc + f.ratingContent, 0);
    const sumDelivery = sessionFeedbacks.reduce((acc, f) => acc + f.ratingDelivery, 0);

    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    for (const f of sessionFeedbacks) {
      if (f.npsScore >= 9) promoters++;
      else if (f.npsScore >= 7) passives++;
      else detractors++;
    }

    const pPct = Math.round((promoters / totalRespondents) * 100);
    const passPct = Math.round((passives / totalRespondents) * 100);
    const dPct = Math.round((detractors / totalRespondents) * 100);
    const nps = pPct - dPct;

    return {
      avgOverall: (sumOverall / totalRespondents).toFixed(1),
      avgContent: (sumContent / totalRespondents).toFixed(1),
      avgDelivery: (sumDelivery / totalRespondents).toFixed(1),
      npsScore: nps,
      npsBreakdown: { promoters, passives, detractors, pPct, passPct, dPct },
    };
  }, [sessionFeedbacks, totalRespondents]);

  const handleToggleStatus = (id: string, newStatus: 'approved' | 'hidden') => {
    storageService.updateFeedbackStatus(id, newStatus);
    onRefreshData();
  };

  const handleQuickCopySessionLink = (session: TrainingSession) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kelaspulse.ai';
    const targetUrl = `${baseUrl}/?session=${session.id}&mode=form`;
    navigator.clipboard.writeText(targetUrl);
    setCopiedSessionId(session.id);
    setTimeout(() => setCopiedSessionId(null), 2000);
  };

  const handleDeleteSession = (sessionId: string, sessionTitle: string) => {
    const count = feedbacks.filter(f => f.sessionId === sessionId).length;
    const confirmMsg = `Adakah anda pasti mahu memadamkan sesi "${sessionTitle}"?\n\nTindakan ini akan memadamkan ${count} rekod maklum balas berkaitan secara kekal.`;

    if (window.confirm(confirmMsg)) {
      storageService.deleteSession(sessionId);
      if (selectedSessionId === sessionId) {
        onSelectSession('all');
      }
      onRefreshData();
    }
  };

  const handleGenerateSummary = async () => {
    if (sessionFeedbacks.length === 0) {
      alert('Tiada maklum balas untuk dijana rumusan. Sila kumpulkan maklum balas terlebih dahulu.');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const summary = await aiService.generateSummary(activeSessionTitle, sessionFeedbacks);
      storageService.saveSummary(selectedSessionId, summary);
      onRefreshData();
    } catch (err) {
      console.error('Failed to generate summary:', err);
      alert('Ralat semasa menjana rumusan.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCopySummary = () => {
    if (!currentSummary) return;

    const formatted = `RUMUSAN MAKLUM BALAS KELASPULSE
Sesi: ${activeSessionTitle}
Tarikh janaan: ${new Date(currentSummary.generatedAt).toLocaleDateString('ms-MY')}

KEKUATAN UTAMA:
${currentSummary.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

CADANGAN PENAMBAHBAIKAN:
${currentSummary.improvements.map((s, i) => `${i + 1}. ${s}`).join('\n')}

KESIMPULAN:
${currentSummary.conclusion}`;

    navigator.clipboard.writeText(formatted);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleExportCSV = () => {
    if (sessionFeedbacks.length === 0) {
      alert('Tiada data untuk dieksport.');
      return;
    }

    const headers = [
      'ID Maklum Balas',
      'ID Sesi',
      'Tajuk Sesi',
      'Tarikh',
      'Peserta',
      'Mod Identiti',
      'Rating Keseluruhan',
      'Rating Kandungan',
      'Rating Penyampaian',
      'Skor NPS',
      'Perkara Paling Bermanfaat',
      'Cadangan Penambahbaikan',
      'Sentimen',
      'Status Moderasi',
    ];

    const rows = sessionFeedbacks.map(f => {
      const s = sessions.find(sess => sess.id === f.sessionId);
      return [
        f.id,
        f.sessionId,
        `"${(s?.title || '').replace(/"/g, '""')}"`,
        f.createdAt.split('T')[0],
        `"${(f.isAnonymous ? 'Tanpa nama' : f.authorName).replace(/"/g, '""')}"`,
        f.isAnonymous ? 'Tanpa nama' : 'Bernama',
        f.ratingOverall,
        f.ratingContent,
        f.ratingDelivery,
        f.npsScore,
        `"${(f.keyTakeaway || '').replace(/"/g, '""')}"`,
        `"${(f.improvementSuggestion || '').replace(/"/g, '""')}"`,
        f.sentiment,
        f.status,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KelasPulse-${selectedSessionId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredFeedbacks = useMemo(() => {
    return sessionFeedbacks.filter(f => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'approved' && f.status === 'approved') ||
        (statusFilter === 'hidden' && f.status === 'hidden');

      const matchesSentiment =
        sentimentFilter === 'all' || f.sentiment === sentimentFilter;

      const authorDisplay = f.isAnonymous ? 'tanpa nama' : f.authorName.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        authorDisplay.includes(searchTerm.toLowerCase()) ||
        f.keyTakeaway.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.improvementSuggestion && f.improvementSuggestion.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesSentiment && matchesSearch;
    });
  }, [sessionFeedbacks, statusFilter, sentimentFilter, searchTerm]);

  // Lock Screen
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#F6F7F9] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-[#E2E6EB] max-w-sm w-full p-8 text-center text-left">
          <div className="w-10 h-10 rounded-lg bg-[#F6F7F9] text-[#17212B] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-[#596579]" />
          </div>

          <h2 className="text-base font-semibold text-[#17212B] mb-1">
            Akses analitik jurulatih
          </h2>
          <p className="text-xs text-[#596579] mb-5">
            Sila masukkan kod PIN 4-digit untuk membuka data.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                className="w-full text-center text-xl font-mono tracking-[0.4em] py-2.5 px-4 rounded-lg border border-[#E2E6EB] focus:outline-none focus:border-[#2457E7]"
              />
              {pinError && (
                <p className="text-xs text-[#DC2626] mt-2 text-center">
                  {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-[#2457E7] hover:bg-[#1D46BE] text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka akses</span>
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#E2E6EB] text-center">
            <button
              type="button"
              onClick={handleQuickFillPin}
              className="text-xs text-[#596579] hover:text-[#17212B] underline"
            >
              Guna PIN lalai (1234)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#F6F7F9] pb-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Top Control Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4 border-b border-[#E2E6EB]">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-semibold text-[#17212B] tracking-tight">
              Papan analitik
            </h1>
            <p className="text-xs sm:text-sm text-[#596579] mt-0.5">
              Ringkasan metrik bengkel, kelulusan komen, dan laporan maklum balas.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={onOpenNewSession}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg font-medium bg-[#2457E7] hover:bg-[#1D46BE] text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sesi baharu</span>
            </button>

            {currentSession && (
              <button
                type="button"
                onClick={() => onOpenQR(currentSession)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg font-medium bg-white border border-[#E2E6EB] text-[#17212B] hover:bg-[#F6F7F9] transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-[#596579]" />
                <span>Kod QR</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg font-medium bg-white border border-[#E2E6EB] text-[#17212B] hover:bg-[#F6F7F9] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#596579]" />
              <span>Eksport CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg font-medium bg-white border border-[#E2E6EB] text-[#17212B] hover:bg-[#F6F7F9] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#596579]" />
              <span>Cetak / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-white border border-[#E2E6EB] text-[#596579] hover:bg-[#F6F7F9] transition-colors"
              title="Tetapan PIN dan data"
              aria-label="Buka tetapan"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#E2E6EB] text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#596579] shrink-0" />
            <label htmlFor="analytics-session-filter" className="font-medium text-[#17212B]">
              Sesi:
            </label>
            <select
              id="analytics-session-filter"
              value={selectedSessionId}
              onChange={e => onSelectSession(e.target.value)}
              className="bg-[#F6F7F9] border border-[#E2E6EB] rounded-md px-2.5 py-1 text-[#17212B] font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Semua sesi ({feedbacks.length} maklum balas)</option>
              {sessions.map(s => {
                const count = feedbacks.filter(f => f.sessionId === s.id).length;
                return (
                  <option key={s.id} value={s.id}>
                    {s.title} ({count} respons)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="text-[#596579] flex items-center gap-3">
            {currentSession?.instructor && (
              <span>
                Jurulatih: <span className="font-medium text-[#17212B]">{currentSession.instructor}</span>
              </span>
            )}
            <button
              type="button"
              onClick={onRefreshData}
              className="text-[#596579] hover:text-[#17212B] transition-colors inline-flex items-center gap-1 font-medium"
              title="Kemas kini data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat semula</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW (Clean, Streamlined 4 Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#E2E6EB]">
            <span className="text-xs text-[#596579] block mb-1">Jumlah respons</span>
            <div className="text-2xl font-semibold font-tabular text-[#17212B]">{totalRespondents}</div>
            <p className="text-[11px] text-[#596579] mt-1">Peserta mengisi</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E6EB]">
            <span className="text-xs text-[#596579] block mb-1">Kepuasan keseluruhan</span>
            <div className="text-2xl font-semibold font-tabular text-[#17212B]">
              {avgOverall}
              {avgOverall !== '—' && <span className="text-xs text-[#596579] font-normal"> / 5.0</span>}
            </div>
            <p className="text-[11px] text-[#596579] mt-1">Purata skala 1–5</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E6EB]">
            <span className="text-xs text-[#596579] block mb-1">Kandungan & Jurulatih</span>
            <div className="text-sm font-tabular font-medium text-[#17212B] mt-1 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-[#596579] font-normal text-xs">Modul:</span>
                <span>{avgContent}★</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#596579] font-normal text-xs">Jurulatih:</span>
                <span>{avgDelivery}★</span>
              </div>
            </div>
          </div>

          {/* NPS Metric */}
          <div className="p-4 rounded-xl bg-white border border-[#E2E6EB]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#596579]">Skor NPS</span>
              <span className="text-[11px] text-[#596579] font-tabular">
                {totalRespondents > 0 ? `${npsBreakdown.pPct}% Promoters` : ''}
              </span>
            </div>
            <div className="text-2xl font-semibold font-tabular text-[#17212B]">
              {typeof npsScore === 'number' && npsScore > 0 ? `+${npsScore}` : npsScore}
            </div>

            {totalRespondents > 0 ? (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-[#E2E6EB] rounded-full overflow-hidden flex">
                  <div style={{ width: `${npsBreakdown.pPct}%` }} className="bg-[#16A34A] h-full" />
                  <div style={{ width: `${npsBreakdown.passPct}%` }} className="bg-[#D97706] h-full" />
                  <div style={{ width: `${npsBreakdown.dPct}%` }} className="bg-[#DC2626] h-full" />
                </div>
                <div className="flex justify-between text-[10px] text-[#596579] font-tabular">
                  <span>{npsBreakdown.promoters}P</span>
                  <span>{npsBreakdown.passives}Pas</span>
                  <span>{npsBreakdown.detractors}D</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#596579] mt-1">% Promoters − % Detractors</p>
            )}
          </div>
        </div>

        {/* AI EXECUTIVE SUMMARY (Structured briefing card) */}
        <div className="bg-white rounded-xl border border-[#E2E6EB] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E6EB]">
            <div>
              <h2 className="font-semibold text-base text-[#17212B]">
                Rumusan maklum balas bengkel
              </h2>
              <p className="text-xs text-[#596579] mt-0.5">
                Sintesis perkara utama dan cadangan daripada jawapan peserta.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {currentSummary && (
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#E2E6EB] text-[#17212B] hover:bg-[#F6F7F9] transition-colors"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-[#16A34A]" />
                      <span>Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1 text-[#596579]" />
                      <span>Salin rumusan</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary || totalRespondents === 0}
                className="inline-flex items-center px-3 py-1.5 rounded-lg font-medium bg-[#2457E7] hover:bg-[#1D46BE] text-white disabled:opacity-50 transition-colors"
              >
                {isGeneratingSummary ? (
                  <span>Menjana rumusan…</span>
                ) : (
                  <span>{currentSummary ? 'Jana semula' : 'Jana rumusan'}</span>
                )}
              </button>
            </div>
          </div>

          {isGeneratingSummary ? (
            <div className="space-y-2 py-4 animate-pulse">
              <div className="h-3 bg-[#E2E6EB] rounded w-1/4"></div>
              <div className="h-3 bg-[#F6F7F9] rounded w-full"></div>
              <div className="h-3 bg-[#F6F7F9] rounded w-4/5"></div>
            </div>
          ) : currentSummary ? (
            <div className="space-y-4 pt-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-lg bg-[#F6F7F9] border border-[#E2E6EB]">
                  <h3 className="font-semibold text-[#17212B] mb-2">
                    Kekuatan utama bengkel:
                  </h3>
                  <ul className="space-y-1.5 text-[#596579] list-disc pl-4 leading-relaxed">
                    {currentSummary.strengths.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="p-4 rounded-lg bg-[#F6F7F9] border border-[#E2E6EB]">
                  <h3 className="font-semibold text-[#17212B] mb-2">
                    Cadangan penambahbaikan:
                  </h3>
                  <ul className="space-y-1.5 text-[#596579] list-disc pl-4 leading-relaxed">
                    {currentSummary.improvements.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Conclusion */}
              <div className="p-4 rounded-lg bg-[#F6F7F9] border border-[#E2E6EB]">
                <h3 className="font-semibold text-[#17212B] mb-1">
                  Kesimpulan:
                </h3>
                <p className="text-[#596579] leading-relaxed">
                  “{currentSummary.conclusion}”
                </p>
                <div className="mt-2 text-[11px] text-[#596579]">
                  Dijana pada {new Date(currentSummary.generatedAt).toLocaleDateString('ms-MY')}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#596579] py-2">
              Tekan butang <span className="font-medium text-[#17212B]">“Jana rumusan”</span> di atas untuk mengekstrak intipati dan cadangan peserta.
            </p>
          )}
        </div>

        {/* FEEDBACK & MODERATION TABLE */}
        <div className="bg-white rounded-xl border border-[#E2E6EB] overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 sm:p-5 border-b border-[#E2E6EB] flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
            <div>
              <h2 className="font-semibold text-base text-[#17212B]">
                Senarai maklum balas & moderasi
              </h2>
              <p className="text-xs text-[#596579] mt-0.5">
                Kawal kelulusan komen untuk dipaparkan pada Dinding Langsung.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#596579] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari ulasan..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-[#E2E6EB] focus:outline-none focus:border-[#2457E7] w-36 sm:w-44 text-xs"
                />
              </div>

              {/* Sentiment filter */}
              <select
                value={sentimentFilter}
                onChange={e => setSentimentFilter(e.target.value as any)}
                className="bg-[#F6F7F9] border border-[#E2E6EB] rounded-lg px-2.5 py-1.5 text-xs text-[#17212B] font-medium focus:outline-none"
              >
                <option value="all">Semua sentimen</option>
                <option value="Positive">Positif</option>
                <option value="Constructive">Membina</option>
                <option value="Neutral">Neutral</option>
              </select>

              {/* Status filter */}
              <div className="flex items-center bg-[#F6F7F9] p-0.5 rounded-lg border border-[#E2E6EB]">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-white text-[#17212B] shadow-2xs font-semibold'
                      : 'text-[#596579]'
                  }`}
                >
                  Semua ({sessionFeedbacks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('approved')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === 'approved'
                      ? 'bg-white text-[#17212B] shadow-2xs font-semibold'
                      : 'text-[#596579]'
                  }`}
                >
                  Diluluskan ({sessionFeedbacks.filter(f => f.status === 'approved').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('hidden')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === 'hidden'
                      ? 'bg-white text-[#17212B] shadow-2xs font-semibold'
                      : 'text-[#596579]'
                  }`}
                >
                  Ditahan ({sessionFeedbacks.filter(f => f.status === 'hidden').length})
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredFeedbacks.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#596579]">
                Tiada rekod maklum balas sepadan dengan carian ini.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F6F7F9] text-[#596579] font-medium border-b border-[#E2E6EB]">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Peserta</th>
                    <th className="p-3 text-center">Kepuasan</th>
                    <th className="p-3 text-center">NPS</th>
                    <th className="p-3">Perkara paling bermanfaat</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6EB]">
                  {filteredFeedbacks.map((fb, idx) => {
                    return (
                      <tr
                        key={fb.id}
                        className={`hover:bg-[#F6F7F9] transition-colors ${
                          fb.status === 'hidden' ? 'bg-[#FFFBEB]/40' : ''
                        }`}
                      >
                        <td className="p-3 text-center text-[#596579] font-tabular">
                          {idx + 1}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className="font-medium text-[#17212B]">
                            {fb.isAnonymous ? 'Tanpa nama' : fb.authorName}
                          </span>
                        </td>

                        <td className="p-3 text-center font-tabular font-medium text-[#D97706]">
                          {fb.ratingOverall}.0★
                        </td>

                        <td className="p-3 text-center font-tabular font-medium text-[#17212B]">
                          {fb.npsScore}
                        </td>

                        <td
                          className="p-3 max-w-xs cursor-pointer"
                          onClick={() => setSelectedFeedback(fb)}
                        >
                          <p className="text-[#17212B] line-clamp-2 hover:underline">
                            “{fb.keyTakeaway}”
                          </p>
                          {fb.improvementSuggestion && (
                            <p className="text-[#596579] text-[11px] line-clamp-1 mt-0.5">
                              Cadangan: {fb.improvementSuggestion}
                            </p>
                          )}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            fb.status === 'approved'
                              ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                              : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                          }`}>
                            {fb.status === 'approved' ? 'Diluluskan' : 'Ditahan'}
                          </span>
                        </td>

                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {fb.status === 'approved' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(fb.id, 'hidden')}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border border-[#E2E6EB] text-[#596579] hover:bg-[#F6F7F9]"
                              >
                                <EyeOff className="w-3.5 h-3.5 mr-1" />
                                <span>Sorok</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(fb.id, 'approved')}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#2457E7] text-white hover:bg-[#1D46BE]"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                <span>Lulus</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedFeedback(fb)}
                              className="px-2 py-1 rounded text-xs text-[#596579] hover:text-[#17212B] hover:bg-[#F6F7F9]"
                            >
                              Butiran
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* SESSIONS MANAGEMENT LIST */}
        <div className="bg-white rounded-xl border border-[#E2E6EB] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-base text-[#17212B]">
                Pengurusan sesi bengkel ({sessions.length})
              </h2>
              <p className="text-xs text-[#596579]">
                Pautan sesi dan kod QR untuk setiap kelas latihan.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenNewSession}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2457E7] text-white hover:bg-[#1D46BE]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah sesi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {sessions.map(s => {
              const respCount = feedbacks.filter(f => f.sessionId === s.id).length;
              const isSelected = selectedSessionId === s.id;
              const isCopied = copiedSessionId === s.id;

              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-lg border transition-colors flex items-start justify-between ${
                    isSelected
                      ? 'bg-white border-[#2457E7]'
                      : 'bg-[#F6F7F9] border-[#E2E6EB] hover:border-[#CBD3DC]'
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#596579]">
                      <span className="font-mono font-medium text-[#17212B]">{s.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{s.date}</span>
                    </div>
                    <h3 className="font-medium text-sm text-[#17212B] truncate">
                      {s.title}
                    </h3>
                    {s.instructor && (
                      <p className="text-xs text-[#596579]">
                        Jurulatih: {s.instructor}
                      </p>
                    )}
                    <p className="text-xs text-[#596579] pt-0.5 font-tabular">
                      {respCount} maklum balas
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickCopySessionLink(s)}
                      className="p-1.5 rounded-md bg-white border border-[#E2E6EB] text-[#596579] hover:bg-[#F6F7F9]"
                      title="Salin pautan borang"
                      aria-label="Salin pautan borang"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenQR(s)}
                      className="p-1.5 rounded-md bg-white border border-[#E2E6EB] text-[#596579] hover:bg-[#F6F7F9]"
                      title="Papar QR Sesi"
                      aria-label="Papar QR Sesi"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectSession(s.id)}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#2457E7] text-white'
                          : 'bg-white border border-[#E2E6EB] text-[#17212B] hover:bg-[#F6F7F9]'
                      }`}
                    >
                      {isSelected ? 'Aktif' : 'Pilih'}
                    </button>
                    {sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(s.id, s.title)}
                        className="p-1.5 rounded-md bg-white border border-[#E2E6EB] text-[#DC2626] hover:bg-[#FEF2F2]"
                        title="Padam sesi"
                        aria-label="Padam sesi latihan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        sessionTitle={sessions.find(s => s.id === selectedFeedback?.sessionId)?.title}
        onClose={() => setSelectedFeedback(null)}
        onToggleStatus={handleToggleStatus}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        sessionTitle={activeSessionTitle}
        session={currentSession}
        feedbacks={sessionFeedbacks}
        summary={currentSummary}
        npsScore={npsScore}
        avgOverall={avgOverall}
        avgContent={avgContent}
        avgDelivery={avgDelivery}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetDemo={onRefreshData}
      />
    </div>
  );
};
