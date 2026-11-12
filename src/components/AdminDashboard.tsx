import React, { useState, useMemo } from 'react';
import {
  Lock, Unlock, Filter, Plus, QrCode, Download, FileText,
  Eye, EyeOff, Trash2, Copy, Check, RefreshCw, Settings, Search,
  Sparkles, ExternalLink
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
  const activeSessionTitle = currentSession ? currentSession.title : 'Semua Sesi Kelas';

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
      setPinError('PIN tidak sah. Sila masukkan PIN 4-digit yang betul (lalai: 1234).');
    }
  };

  const handleQuickFillPin = () => {
    setPinInput('1234');
    setIsAdminUnlocked(true);
    setPinError('');
  };

  const totalRespondents = sessionFeedbacks.length;

  const { avgOverall, avgContent, avgDelivery, npsScore, npsBreakdown, sentimentCounts } = useMemo(() => {
    if (totalRespondents === 0) {
      return {
        avgOverall: '—',
        avgContent: '—',
        avgDelivery: '—',
        npsScore: '—',
        npsBreakdown: { promoters: 0, passives: 0, detractors: 0, pPct: 0, passPct: 0, dPct: 0 },
        sentimentCounts: { Positive: 0, Neutral: 0, Constructive: 0 },
      };
    }

    const sumOverall = sessionFeedbacks.reduce((acc, f) => acc + f.ratingOverall, 0);
    const sumContent = sessionFeedbacks.reduce((acc, f) => acc + f.ratingContent, 0);
    const sumDelivery = sessionFeedbacks.reduce((acc, f) => acc + f.ratingDelivery, 0);

    let promoters = 0;
    let passives = 0;
    let detractors = 0;
    const sentCounts = { Positive: 0, Neutral: 0, Constructive: 0 };

    for (const f of sessionFeedbacks) {
      if (f.npsScore >= 9) promoters++;
      else if (f.npsScore >= 7) passives++;
      else detractors++;

      if (f.sentiment === 'Positive') sentCounts.Positive++;
      else if (f.sentiment === 'Constructive') sentCounts.Constructive++;
      else sentCounts.Neutral++;
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
      sentimentCounts: sentCounts,
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
    const confirmMsg = `Adakah anda pasti mahu memadamkan sesi "${sessionTitle}"?\n\nTindakan ini akan turut memadamkan ${count} rekod maklum balas di bawah sesi ini secara kekal (BR-005).`;

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
      alert('Ralat semasa menjana rumusan AI.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCopySummary = () => {
    if (!currentSummary) return;

    const formatted = `RUMUSAN EKSEKUTIF KELASPULSE AI
Sesi: ${activeSessionTitle}
Dijana: ${new Date(currentSummary.generatedAt).toLocaleDateString('ms-MY')}

3 KEKUATAN UTAMA:
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
      'Emel',
      'Rating Keseluruhan',
      'Rating Kandungan',
      'Rating Penyampaian',
      'Skor NPS',
      'Perkara Paling Bermanfaat',
      'Cadangan Penambahbaikan',
      'Sentimen AI',
      'Status Moderasi',
      'Sebab Saringan AI',
    ];

    const rows = sessionFeedbacks.map(f => {
      const s = sessions.find(sess => sess.id === f.sessionId);
      return [
        f.id,
        f.sessionId,
        `"${(s?.title || '').replace(/"/g, '""')}"`,
        f.createdAt.split('T')[0],
        `"${f.authorName.replace(/"/g, '""')}"`,
        f.isAnonymous ? 'Anonymous' : 'Google',
        f.authorEmail || '-',
        f.ratingOverall,
        f.ratingContent,
        f.ratingDelivery,
        f.npsScore,
        `"${(f.keyTakeaway || '').replace(/"/g, '""')}"`,
        `"${(f.improvementSuggestion || '').replace(/"/g, '""')}"`,
        f.sentiment,
        f.status,
        `"${(f.aiFlagReason || '').replace(/"/g, '""')}"`,
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

      const matchesSearch =
        !searchTerm.trim() ||
        f.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.keyTakeaway.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.improvementSuggestion && f.improvementSuggestion.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesSentiment && matchesSearch;
    });
  }, [sessionFeedbacks, statusFilter, sentimentFilter, searchTerm]);

  // Lock Screen
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-[calc(100vh-3.75rem)] bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-xs max-w-sm w-full p-8 text-center animate-in fade-in duration-150">
          <div className="w-12 h-12 rounded-xl bg-[#F5F4F0] border border-[#E0DED7] text-[#181716] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-[#575653]" />
          </div>

          <h2 className="text-lg font-bold text-[#181716] mb-1">
            Papan Analitik Eksekutif
          </h2>
          <p className="text-xs text-[#73726E] mb-6">
            Sila masukkan kod PIN 4-digit trainer untuk membuka akses data.
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
                className="w-full text-center text-2xl font-tabular tracking-[0.5em] py-2.5 px-4 rounded-xl border border-[#DCDAD4] focus:outline-none focus:border-[#181716]"
              />
              {pinError && (
                <p className="text-xs text-[#DC2626] mt-2">
                  {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#181716] hover:bg-[#2C2A28] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Unlock className="w-4 h-4 text-[#F59E0B]" />
              <span>Buka Akses Pentadbir</span>
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#F0EFEA]">
            <button
              type="button"
              onClick={handleQuickFillPin}
              className="text-xs text-[#73726E] hover:text-[#181716] underline underline-offset-2"
            >
              Guna PIN Lalai Demo (1234)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-[#FAFAF8] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Control Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4 border-b border-[#E8E6E1]">
          <div>
            <div className="flex items-baseline gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#181716] tracking-tight">
                Papan Pemuka Analitik
              </h1>
              <span className="text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                Akses Aktif
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#73726E] mt-1">
              Pemantauan metrik bengkel, moderasi komen peserta masa nyata, dan rumusan eksekutif pintar.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onOpenNewSession}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#181716] text-white hover:bg-[#2C2A28] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Sesi Baharu</span>
            </button>

            {currentSession && (
              <button
                onClick={() => onOpenQR(currentSession)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#DCDAD4] text-[#181716] hover:bg-[#F7F7F4] transition-colors shadow-2xs"
              >
                <QrCode className="w-3.5 h-3.5 mr-1 text-[#D97706]" />
                <span>QR Sesi</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#DCDAD4] text-[#181716] hover:bg-[#F7F7F4] transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-[#73726E]" />
              <span>Eksport CSV</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#DCDAD4] text-[#181716] hover:bg-[#F7F7F4] transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-[#73726E]" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg bg-white border border-[#DCDAD4] text-[#575653] hover:bg-[#F7F7F4] transition-colors shadow-2xs"
              title="Tetapan PIN & Data"
              aria-label="Buka tetapan admin"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E8E6E1] shadow-2xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#73726E] shrink-0" />
            <label htmlFor="analytics-session-filter" className="text-xs font-bold text-[#181716]">
              Pilih Sesi:
            </label>
            <select
              id="analytics-session-filter"
              value={selectedSessionId}
              onChange={e => onSelectSession(e.target.value)}
              className="text-xs sm:text-sm bg-[#FAFAF8] border border-[#DCDAD4] rounded-lg px-2.5 py-1 text-[#181716] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Keseluruhan Semua Kelas ({feedbacks.length} Maklum Balas)</option>
              {sessions.map(s => {
                const count = feedbacks.filter(f => f.sessionId === s.id).length;
                return (
                  <option key={s.id} value={s.id}>
                    {s.title} — {s.date} ({count} respon)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="text-xs text-[#73726E] flex items-center gap-3">
            {currentSession?.instructor && (
              <span className="hidden md:inline">
                Trainer: <span className="font-semibold text-[#181716]">{currentSession.instructor}</span>
              </span>
            )}
            <button
              onClick={onRefreshData}
              className="p-1 text-[#73726E] hover:text-[#181716] transition-colors flex items-center gap-1 text-xs font-medium"
              title="Kemas kini data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Segar Semula</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW (Single Elevation, Tabular Figures, with NPS Distribution Gauge) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-white border border-[#E8E6E1] shadow-2xs">
            <span className="text-xs text-[#73726E] block mb-1">Responden</span>
            <div className="text-2xl font-extrabold font-tabular text-[#181716]">{totalRespondents}</div>
            <p className="text-[11px] text-[#73726E] mt-1">Peserta mengisi</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E8E6E1] shadow-2xs">
            <span className="text-xs text-[#73726E] block mb-1">Kepuasan Purata</span>
            <div className="text-2xl font-extrabold font-tabular text-[#181716]">
              {avgOverall}
              {avgOverall !== '—' && <span className="text-xs text-[#73726E] font-normal font-sans"> / 5.0</span>}
            </div>
            <p className="text-[11px] text-[#73726E] mt-1">Skala keseluruhan</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E8E6E1] shadow-2xs">
            <span className="text-xs text-[#73726E] block mb-1">Kandungan & Trainer</span>
            <div className="text-sm font-tabular font-bold text-[#181716] mt-1 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-[#73726E] font-sans font-normal text-xs">Modul:</span>
                <span className="text-[#B45309]">{avgContent}★</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#73726E] font-sans font-normal text-xs">Trainer:</span>
                <span className="text-[#B45309]">{avgDelivery}★</span>
              </div>
            </div>
          </div>

          {/* NPS Metric with Distribution Gauge Strip */}
          <div className="p-4 rounded-xl bg-white border border-[#E8E6E1] shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#73726E]">Skor NPS</span>
              <span className="text-[10px] text-[#73726E] font-tabular">
                {totalRespondents > 0 ? `${npsBreakdown.pPct}% P` : ''}
              </span>
            </div>
            <div className="text-2xl font-extrabold font-tabular text-[#181716]">
              {typeof npsScore === 'number' && npsScore > 0 ? `+${npsScore}` : npsScore}
            </div>

            {/* Segmented Distribution Bar */}
            {totalRespondents > 0 ? (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-[#EFEFEA] rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${npsBreakdown.pPct}%` }}
                    className="bg-[#15803D] h-full"
                    title={`Promoters (9-10): ${npsBreakdown.promoters} (${npsBreakdown.pPct}%)`}
                  />
                  <div
                    style={{ width: `${npsBreakdown.passPct}%` }}
                    className="bg-[#D97706] h-full"
                    title={`Passives (7-8): ${npsBreakdown.passives} (${npsBreakdown.passPct}%)`}
                  />
                  <div
                    style={{ width: `${npsBreakdown.dPct}%` }}
                    className="bg-[#DC2626] h-full"
                    title={`Detractors (1-6): ${npsBreakdown.detractors} (${npsBreakdown.dPct}%)`}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-[#73726E] font-tabular font-semibold">
                  <span className="text-[#15803D]">{npsBreakdown.promoters}P ({npsBreakdown.pPct}%)</span>
                  <span className="text-[#D97706]">{npsBreakdown.passives}Pas</span>
                  <span className="text-[#DC2626]">{npsBreakdown.detractors}D</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#73726E] mt-1">% Promoters − % Detractors</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E8E6E1] shadow-2xs col-span-2 md:col-span-1">
            <span className="text-xs text-[#73726E] block mb-1">Pecahan Sentimen</span>
            <div className="flex items-center gap-2 mt-2 text-xs font-tabular">
              <span title="Positif" className="text-[#15803D] font-bold">
                {sentimentCounts.Positive}P
              </span>
              <span aria-hidden="true" className="text-[#DCDAD4]">/</span>
              <span title="Konstruktif" className="text-[#1D4ED8] font-bold">
                {sentimentCounts.Constructive}K
              </span>
              <span aria-hidden="true" className="text-[#DCDAD4]">/</span>
              <span title="Neutral" className="text-[#575653]">
                {sentimentCounts.Neutral}N
              </span>
            </div>
            <p className="text-[11px] text-[#73726E] mt-1.5">Klasifikasi Gemini AI</p>
          </div>
        </div>

        {/* BR-003 Notice for Zero Respondents */}
        {totalRespondents === 0 && (
          <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-center justify-between">
            <span>Sesi ini belum menerima maklum balas. Kongsikan kod QR untuk peserta mengisi borang.</span>
            {currentSession && (
              <button
                onClick={() => onOpenQR(currentSession)}
                className="px-3 py-1 bg-[#B45309] text-white rounded-lg font-semibold hover:bg-[#92400E] transition-colors"
              >
                Papar QR
              </button>
            )}
          </div>
        )}

        {/* AI EXECUTIVE SUMMARY (FR-007) */}
        <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 border-b border-[#F0EFEA]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-[#181716]">
                  Rumusan Eksekutif Berasaskan AI
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F5F4F0] text-[#D97706] rounded border border-[#E0DED7]">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-[#73726E] mt-0.5">
                Sintesis pintar 3-bahagian daripada komen terbuka peserta bagi sesi {activeSessionTitle}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentSummary && (
                <button
                  onClick={handleCopySummary}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#DCDAD4] text-[#181716] hover:bg-[#F7F7F4] transition-colors"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-[#16A34A]" />
                      <span>Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1 text-[#73726E]" />
                      <span>Salin Rumusan</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary || totalRespondents === 0}
                className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#181716] text-white hover:bg-[#2C2A28] disabled:opacity-50 transition-colors shadow-xs"
              >
                {isGeneratingSummary ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5"></div>
                    <span>Menjana…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#F59E0B]" />
                    <span>{currentSummary ? 'Jana Semula Rumusan' : 'Jana Rumusan AI'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isGeneratingSummary ? (
            <div className="space-y-3 py-4 animate-pulse">
              <div className="h-4 bg-[#F5F4F0] rounded w-1/4"></div>
              <div className="h-3 bg-[#FAFAF8] rounded w-full"></div>
              <div className="h-3 bg-[#FAFAF8] rounded w-5/6"></div>
            </div>
          ) : currentSummary ? (
            <div className="space-y-4 pt-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E8E6E1]">
                  <h3 className="font-bold text-[#181716] text-sm mb-2.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span>3 Kekuatan Utama Kelas:</span>
                  </h3>
                  <ul className="space-y-2 text-[#44423E] leading-relaxed list-disc pl-4">
                    {currentSummary.strengths.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E8E6E1]">
                  <h3 className="font-bold text-[#181716] text-sm mb-2.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                    <span>Cadangan Penambahbaikan Tindakan:</span>
                  </h3>
                  <ul className="space-y-2 text-[#44423E] leading-relaxed list-disc pl-4">
                    {currentSummary.improvements.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Conclusion */}
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E8E6E1]">
                <h3 className="font-bold text-[#181716] text-sm mb-1.5">
                  Sentimen & Kesimpulan Eksekutif:
                </h3>
                <p className="text-[#44423E] leading-relaxed text-sm">
                  “{currentSummary.conclusion}”
                </p>
                <div className="mt-2.5 text-[11px] text-[#8C887B] font-tabular">
                  Dijana pada {new Date(currentSummary.generatedAt).toLocaleString('ms-MY')}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#73726E] py-2">
              Klik butang <span className="font-semibold text-[#181716]">“Jana Rumusan AI”</span> di atas untuk mengekstrak dapatan utama, kekuatan modul, dan cadangan penambahbaikan.
            </p>
          )}
        </div>

        {/* FEEDBACK & MODERATION TABLE (FR-006) */}
        <div className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden shadow-xs">
          {/* Table Header Controls */}
          <div className="p-4 sm:p-5 border-b border-[#E8E6E1] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-[#181716]">
                  Senarai Maklum Balas & Moderasi
                </h2>
                <span className="text-xs font-semibold text-[#73726E] font-tabular">
                  ({filteredFeedbacks.length} rekod)
                </span>
              </div>
              <p className="text-xs text-[#73726E] mt-0.5">
                Kawalan satu klik untuk meluluskan ke Dinding Langsung atau menyorokkan komen.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#73726E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari peserta/komen…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#DCDAD4] focus:outline-none focus:border-[#181716] w-36 sm:w-44"
                />
              </div>

              {/* Sentiment filter */}
              <select
                value={sentimentFilter}
                onChange={e => setSentimentFilter(e.target.value as any)}
                className="text-xs bg-[#FAFAF8] border border-[#DCDAD4] rounded-lg px-2.5 py-1.5 font-semibold text-[#181716] focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Sentimen</option>
                <option value="Positive">Positif</option>
                <option value="Constructive">Konstruktif</option>
                <option value="Neutral">Neutral</option>
              </select>

              {/* Status Segmented Filter */}
              <div className="flex items-center bg-[#F5F4F0] p-0.5 rounded-lg border border-[#E0DED7] text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-white text-[#181716] font-bold shadow-xs'
                      : 'text-[#73726E] hover:text-[#181716]'
                  }`}
                >
                  Semua ({sessionFeedbacks.length})
                </button>
                <button
                  onClick={() => setStatusFilter('approved')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === 'approved'
                      ? 'bg-white text-[#181716] font-bold shadow-xs'
                      : 'text-[#73726E] hover:text-[#181716]'
                  }`}
                >
                  Live ({sessionFeedbacks.filter(f => f.status === 'approved').length})
                </button>
                <button
                  onClick={() => setStatusFilter('hidden')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === 'hidden'
                      ? 'bg-white text-[#181716] font-bold shadow-xs'
                      : 'text-[#73726E] hover:text-[#181716]'
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
              <div className="p-12 text-center text-xs text-[#73726E]">
                Tiada rekod maklum balas sepadan dengan kriteria carian.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAFAF8] text-[#73726E] font-semibold border-b border-[#E8E6E1]">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Peserta</th>
                    <th className="p-3 text-center">Kepuasan</th>
                    <th className="p-3 text-center">NPS</th>
                    <th className="p-3">Perkara Paling Bermanfaat</th>
                    <th className="p-3">Sentimen & Status</th>
                    <th className="p-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EFEA]">
                  {filteredFeedbacks.map((fb, idx) => {
                    return (
                      <tr
                        key={fb.id}
                        className={`hover:bg-[#FAFAF8] transition-colors ${
                          fb.status === 'hidden' ? 'bg-[#FFFBEB]/30' : ''
                        }`}
                      >
                        <td className="p-3 text-center text-[#8C887B] font-tabular">
                          {idx + 1}
                        </td>

                        {/* Author */}
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {fb.authorAvatar ? (
                              <img
                                src={fb.authorAvatar}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover border border-[#E8E6E1] bg-[#F5F4F0]"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#F0EFEA] text-[#181716] flex items-center justify-center font-bold text-[10px] border border-[#E8E6E1]">
                                {fb.isAnonymous ? '?' : fb.authorName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-[#181716]">
                                {fb.authorName}
                              </div>
                              <span className="text-[11px] text-[#73726E]">
                                {fb.isAnonymous ? 'Tanpa Nama' : 'Google'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="p-3 text-center">
                          <span className="font-tabular font-bold text-[#B45309]">
                            {fb.ratingOverall}.0★
                          </span>
                        </td>

                        {/* NPS */}
                        <td className="p-3 text-center font-tabular font-bold text-[#181716]">
                          {fb.npsScore}
                        </td>

                        {/* Takeaway */}
                        <td className="p-3 max-w-xs cursor-pointer" onClick={() => setSelectedFeedback(fb)}>
                          <p className="text-[#2B2A27] line-clamp-2 hover:underline underline-offset-2">
                            “{fb.keyTakeaway}”
                          </p>
                          {fb.improvementSuggestion && (
                            <p className="text-[#73726E] text-[11px] line-clamp-1 mt-0.5">
                              Cadangan: {fb.improvementSuggestion}
                            </p>
                          )}
                        </td>

                        {/* Sentiment */}
                        <td className="p-3 whitespace-nowrap text-xs">
                          <div className="text-[#181716] font-semibold">
                            {fb.sentiment === 'Positive' ? 'Positif' : fb.sentiment === 'Constructive' ? 'Konstruktif' : 'Neutral'}
                          </div>
                          {fb.aiFlagReason && (
                            <div className="text-[11px] text-[#B45309] max-w-[150px] truncate" title={fb.aiFlagReason}>
                              {fb.aiFlagReason}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {fb.status === 'approved' ? (
                              <button
                                onClick={() => handleToggleStatus(fb.id, 'hidden')}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-[#DCDAD4] text-[#73726E] hover:text-[#181716] hover:bg-[#F7F7F4] transition-colors"
                              >
                                <EyeOff className="w-3.5 h-3.5 mr-1" />
                                <span>Hide</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(fb.id, 'approved')}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#181716] text-white hover:bg-[#2C2A28] transition-colors shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1 text-[#F59E0B]" />
                                <span>Approve</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedFeedback(fb)}
                              className="px-2.5 py-1 rounded-lg text-xs text-[#73726E] hover:text-[#181716] hover:bg-[#F3F3EE] transition-colors font-medium"
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

        {/* SESSIONS MANAGEMENT (FR-001, BR-005) */}
        <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-[#181716]">
                Pengurusan Sesi Bengkel ({sessions.length})
              </h2>
              <p className="text-xs text-[#73726E]">
                Pautan unik, pengimbas kod QR, dan statistik setiap sesi latihan.
              </p>
            </div>
            <button
              onClick={onOpenNewSession}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#181716] text-white hover:bg-[#2C2A28] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Tambah Sesi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {sessions.map(s => {
              const respCount = feedbacks.filter(f => f.sessionId === s.id).length;
              const isSelected = selectedSessionId === s.id;
              const isCopied = copiedSessionId === s.id;

              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-white border-[#181716] ring-1 ring-[#181716] shadow-xs'
                      : 'bg-[#FAFAF8] border-[#E8E6E1] hover:border-[#B5B3AD]'
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 text-xs text-[#73726E]">
                      <span className="font-tabular font-bold text-[#181716]">{s.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{s.date}</span>
                    </div>
                    <h3 className="font-bold text-sm text-[#181716] truncate">
                      {s.title}
                    </h3>
                    {s.instructor && (
                      <p className="text-xs text-[#73726E]">
                        Trainer: {s.instructor}
                      </p>
                    )}
                    <p className="text-xs text-[#73726E] pt-1 font-tabular font-medium">
                      {respCount} maklum balas terkumpul
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleQuickCopySessionLink(s)}
                      className="p-2 rounded-lg bg-white border border-[#DCDAD4] text-[#575653] hover:bg-[#F7F7F4] transition-colors shadow-2xs"
                      title="Salin pautan borang sesi ini"
                      aria-label="Salin pautan borang sesi ini"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-[#16A34A]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onOpenQR(s)}
                      className="p-2 rounded-lg bg-white border border-[#DCDAD4] text-[#575653] hover:bg-[#F7F7F4] transition-colors shadow-2xs"
                      title="Papar QR Sesi"
                      aria-label="Papar QR Sesi"
                    >
                      <QrCode className="w-4 h-4 text-[#D97706]" />
                    </button>
                    <button
                      onClick={() => onSelectSession(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs ${
                        isSelected
                          ? 'bg-[#181716] text-white'
                          : 'bg-white border border-[#DCDAD4] text-[#181716] hover:bg-[#F7F7F4]'
                      }`}
                    >
                      {isSelected ? 'Aktif' : 'Pilih'}
                    </button>
                    {sessions.length > 1 && (
                      <button
                        onClick={() => handleDeleteSession(s.id, s.title)}
                        className="p-2 rounded-lg bg-white border border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                        title="Padam sesi (BR-005)"
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
