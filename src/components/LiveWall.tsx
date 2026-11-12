import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Play, Pause, Maximize2, Minimize2, Star, Filter, QrCode,
  Moon, Sun, Pin, X, LayoutGrid, Radio, ChevronLeft, ChevronRight,
  Sparkles, ShieldCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { FeedbackEntry, TrainingSession } from '../types';
import { FeedbackDetailModal } from './FeedbackDetailModal';

interface LiveWallProps {
  feedbacks: FeedbackEntry[];
  sessions: TrainingSession[];
  selectedSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onOpenQR: () => void;
  onOpenForm: () => void;
  highlightedFeedbackId?: string | null;
}

export const LiveWall: React.FC<LiveWallProps> = ({
  feedbacks,
  sessions,
  selectedSessionId,
  onSelectSession,
  onOpenQR,
  onOpenForm,
  highlightedFeedbackId,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isCinemaDark, setIsCinemaDark] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'stream' | 'grid'>('stream');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'Positive' | 'Constructive'>('all');
  const [streamSpeed, setStreamSpeed] = useState<number>(1); // 1 = normal, 0.7 = slow, 1.4 = fast
  const [showCornerQR, setShowCornerQR] = useState<boolean>(true);

  // Spotlight Presentation state (with next/prev slide capability)
  const [spotlightIndex, setSpotlightIndex] = useState<number | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null);

  // Filter approved feedbacks only (PRD FR-005)
  const approvedFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      const isApproved = f.status === 'approved';
      const matchesSession = selectedSessionId === 'all' || f.sessionId === selectedSessionId;
      const matchesSentiment = sentimentFilter === 'all' || f.sentiment === sentimentFilter;
      return isApproved && matchesSession && matchesSentiment;
    });
  }, [feedbacks, selectedSessionId, sentimentFilter]);

  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  // Active spotlight feedback object
  const spotlightFeedback = spotlightIndex !== null && approvedFeedbacks[spotlightIndex]
    ? approvedFeedbacks[spotlightIndex]
    : null;

  // Split into 2 rows for balanced multi-stream motion
  const row1Feedbacks = useMemo(() => {
    return approvedFeedbacks.filter((_, idx) => idx % 2 === 0);
  }, [approvedFeedbacks]);

  const row2Feedbacks = useMemo(() => {
    return approvedFeedbacks.filter((_, idx) => idx % 2 !== 0);
  }, [approvedFeedbacks]);

  const marqueeRow1 = useMemo(() => {
    if (row1Feedbacks.length === 0) return [];
    return [...row1Feedbacks, ...row1Feedbacks, ...row1Feedbacks];
  }, [row1Feedbacks]);

  const marqueeRow2 = useMemo(() => {
    if (row2Feedbacks.length === 0) return [];
    return [...row2Feedbacks, ...row2Feedbacks, ...row2Feedbacks];
  }, [row2Feedbacks]);

  // Fullscreen support
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Spotlight navigation handlers
  const handleNextSpotlight = useCallback(() => {
    if (spotlightIndex === null || approvedFeedbacks.length === 0) return;
    setSpotlightIndex((spotlightIndex + 1) % approvedFeedbacks.length);
  }, [spotlightIndex, approvedFeedbacks.length]);

  const handlePrevSpotlight = useCallback(() => {
    if (spotlightIndex === null || approvedFeedbacks.length === 0) return;
    setSpotlightIndex((spotlightIndex - 1 + approvedFeedbacks.length) % approvedFeedbacks.length);
  }, [spotlightIndex, approvedFeedbacks.length]);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (spotlightIndex !== null) {
        if (e.key === 'ArrowRight' || e.key === 'Space') {
          e.preventDefault();
          handleNextSpotlight();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevSpotlight();
        } else if (e.key === 'Escape') {
          setSpotlightIndex(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spotlightIndex, handleNextSpotlight, handlePrevSpotlight]);

  const isMarqueePaused = !isPlaying || Boolean(spotlightFeedback);

  // QR URL for corner widget
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kelaspulse.ai';
  const qrTargetUrl = `${baseUrl}/?session=${currentSession ? currentSession.id : 'SES-001'}&mode=form`;

  const renderCard = (feedback: FeedbackEntry, keyPrefix: string, index: number, isGrid = false) => {
    const isShort = feedback.keyTakeaway.length < 65;
    const isLong = feedback.keyTakeaway.length > 175;
    const displayText = isLong
      ? `${feedback.keyTakeaway.slice(0, 175)}…`
      : feedback.keyTakeaway;

    const sessionObj = sessions.find(s => s.id === feedback.sessionId);
    const isHighlighted = highlightedFeedbackId === feedback.id;

    // Find actual index in approvedFeedbacks array for spotlight
    const actualIndex = approvedFeedbacks.findIndex(f => f.id === feedback.id);

    return (
      <article
        key={`${keyPrefix}-${feedback.id}-${index}`}
        className={`group relative rounded-xl transition-all cursor-pointer flex flex-col justify-between text-left ${
          isGrid
            ? 'w-full p-5 sm:p-6'
            : 'w-[330px] sm:w-[420px] shrink-0 p-5 sm:p-6'
        } ${
          isCinemaDark
            ? 'bg-[#181715] border border-[#2B2925] hover:border-[#4E4A43] text-[#F5F5F0] shadow-sm'
            : 'bg-white border border-[#E8E6E1] hover:border-[#B5B3AD] text-[#181716] shadow-2xs hover:shadow-xs'
        } ${isHighlighted ? 'ring-2 ring-[#B45309]' : ''}`}
        onClick={() => setSelectedFeedback(feedback)}
      >
        <div>
          {/* Card Top: Author & Star Rating */}
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3 min-w-0">
              {feedback.authorAvatar ? (
                <img
                  src={feedback.authorAvatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className={`w-9 h-9 rounded-full object-cover shrink-0 ${
                    isCinemaDark ? 'border border-[#2B2925] bg-[#22211E]' : 'border border-[#E8E6E1] bg-[#F5F4F0]'
                  }`}
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCinemaDark
                      ? 'bg-[#2B2925] text-[#F5F5F0] border border-[#3A3732]'
                      : 'bg-[#F0EFEA] text-[#181716] border border-[#E8E6E1]'
                  }`}
                >
                  {feedback.isAnonymous ? '?' : feedback.authorName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm truncate leading-tight">
                    {feedback.authorName}
                  </h2>
                  {isHighlighted && (
                    <span className="text-[10px] font-bold text-[#D97706] font-tabular">
                      Baru!
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-1.5 text-xs mt-0.5 truncate ${isCinemaDark ? 'text-[#8C887B]' : 'text-[#73726E]'}`}>
                  <span className="truncate">{sessionObj ? sessionObj.title : feedback.sessionId}</span>
                  {feedback.isAnonymous && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Tanpa Nama</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Star Rating & Spotlight Action */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSpotlightIndex(actualIndex >= 0 ? actualIndex : 0);
                }}
                className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                  isCinemaDark ? 'hover:bg-[#2B2925] text-[#8C887B]' : 'hover:bg-[#F3F3EE] text-[#73726E]'
                }`}
                title="Sorot kad ini di tengah skrin (Spotlight Presentation)"
                aria-label="Sorot kad ini di tengah skrin"
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1 font-tabular font-bold text-xs text-[#D97706]">
                <Star className="w-3.5 h-3.5 fill-[#D97706]" />
                <span>{feedback.ratingOverall}.0</span>
              </div>
            </div>
          </div>

          {/* Key Takeaway Quote */}
          <p
            className={`leading-relaxed font-normal ${
              isShort
                ? 'text-base sm:text-lg font-medium'
                : 'text-sm sm:text-[15px]'
            } ${isCinemaDark ? 'text-[#E8E6DF]' : 'text-[#2B2A27]'}`}
          >
            “{displayText}”
          </p>
        </div>

        {/* Card Footer: Metadata & Details Action */}
        <div
          className={`pt-3.5 mt-3.5 border-t flex items-center justify-between text-xs ${
            isCinemaDark
              ? 'border-[#262421] text-[#8C887B]'
              : 'border-[#F0EFEA] text-[#73726E]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {feedback.sentiment === 'Positive'
                ? 'Sentimen Positif'
                : feedback.sentiment === 'Constructive'
                ? 'Sentimen Konstruktif'
                : 'Sentimen Neutral'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-tabular font-semibold">NPS {feedback.npsScore}/10</span>
          </div>

          <span className={`font-semibold group-hover:underline underline-offset-2 ${isCinemaDark ? 'text-[#F5F5F0]' : 'text-[#181716]'}`}>
            {isLong ? 'Baca penuh →' : 'Butiran'}
          </span>
        </div>
      </article>
    );
  };

  return (
    <div
      className={`min-h-[calc(100vh-3.75rem)] flex flex-col justify-between transition-colors duration-200 relative ${
        isCinemaDark
          ? 'bg-[#0D0D0C] text-[#F5F5F0]'
          : 'bg-[#FAFAF8] text-[#181716]'
      }`}
    >
      {/* Header & Controls Toolbar */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-3">
        <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b ${isCinemaDark ? 'border-[#21201D]' : 'border-[#E8E6E1]'}`}>
          {/* Title & Live Status */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Dinding Maklum Balas Langsung
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold font-tabular ${
                isCinemaDark ? 'bg-[#1E1D1A] text-[#D97706] border border-[#33302A]' : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                <span>{approvedFeedbacks.length} Maklum Balas Live</span>
              </span>
            </div>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isCinemaDark ? 'text-[#8C887B]' : 'text-[#73726E]'}`}>
              {currentSession
                ? `Menayangkan maklum balas langsung untuk peserta ${currentSession.title}.`
                : 'Menayangkan maklum balas peserta daripada semua sesi bengkel secara berterusan.'}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* View Mode Toggle: Stream vs Grid */}
            <div className={`flex items-center p-0.5 rounded-lg border text-xs font-medium shadow-2xs ${
              isCinemaDark ? 'bg-[#181715] border-[#2E2C28]' : 'bg-white border-[#DCDAD4]'
            }`}>
              <button
                type="button"
                onClick={() => setViewMode('stream')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'stream'
                    ? isCinemaDark ? 'bg-[#2B2925] text-white font-bold' : 'bg-[#181716] text-white font-bold'
                    : 'text-[#73726E] hover:text-[#181716]'
                }`}
                title="Mod Aliran Bergerak (Marquee Stream)"
              >
                <Radio className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Aliran</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? isCinemaDark ? 'bg-[#2B2925] text-white font-bold' : 'bg-[#181716] text-white font-bold'
                    : 'text-[#73726E] hover:text-[#181716]'
                }`}
                title="Mod Grid Interaktif (Interactive Grid)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>

            {/* Sentiment Filter */}
            <div className={`flex items-center border rounded-lg px-2.5 py-1.5 shadow-2xs ${
              isCinemaDark
                ? 'bg-[#181715] border-[#2E2C28] text-[#F5F5F0]'
                : 'bg-white border-[#DCDAD4] text-[#181716]'
            }`}>
              <Filter className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${isCinemaDark ? 'text-[#8C887B]' : 'text-[#73726E]'}`} />
              <select
                value={sentimentFilter}
                onChange={e => setSentimentFilter(e.target.value as any)}
                aria-label="Tapis mengikut sentimen"
                className="text-xs bg-transparent border-none font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className={isCinemaDark ? 'bg-[#181715] text-white' : ''}>Semua Sentimen</option>
                <option value="Positive" className={isCinemaDark ? 'bg-[#181715] text-white' : ''}>Positif Sahaja</option>
                <option value="Constructive" className={isCinemaDark ? 'bg-[#181715] text-white' : ''}>Konstruktif Sahaja</option>
              </select>
            </div>

            {/* Play / Pause toggle (only in stream mode) */}
            {viewMode === 'stream' && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-2xs ${
                  isCinemaDark
                    ? 'bg-[#181715] border-[#2E2C28] text-[#F5F5F0] hover:bg-[#262420]'
                    : 'bg-white border-[#DCDAD4] text-[#181716] hover:bg-[#F7F7F4]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 mr-1 text-[#D97706]" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1 text-[#16A34A]" />
                    <span>Main</span>
                  </>
                )}
              </button>
            )}

            {/* Cinema Dark / Light Paper Toggle */}
            <button
              onClick={() => setIsCinemaDark(!isCinemaDark)}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-2xs ${
                isCinemaDark
                  ? 'bg-[#181715] border-[#2E2C28] text-[#F5F5F0] hover:bg-[#262420]'
                  : 'bg-white border-[#DCDAD4] text-[#181716] hover:bg-[#F7F7F4]'
              }`}
              title={isCinemaDark ? 'Tukar ke Mod Cerah (Paper Mode)' : 'Tukar ke Mod Projektor Gelap (Cinema Mode)'}
            >
              {isCinemaDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 mr-1 text-[#F59E0B]" />
                  <span className="hidden sm:inline">Cerah</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 mr-1 text-[#575653]" />
                  <span className="hidden sm:inline">Projektor Gelap</span>
                </>
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleToggleFullscreen}
              className={`p-1.5 rounded-lg border transition-colors shadow-2xs ${
                isCinemaDark
                  ? 'bg-[#181715] border-[#2E2C28] text-[#F5F5F0] hover:bg-[#262420]'
                  : 'bg-white border-[#DCDAD4] text-[#181716] hover:bg-[#F7F7F4]'
              }`}
              title="Skrin Penuh (F11 / Fullscreen)"
              aria-label="Skrin Penuh"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* QR Button */}
            <button
              onClick={onOpenQR}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#181716] text-white hover:bg-[#2B2925] transition-colors shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#F59E0B]" />
              <span>Kod QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* SPEAKER SPOTLIGHT PRESENTATION MODE MODAL (Slide presentation on stage) */}
      {spotlightFeedback && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="max-w-3xl w-full bg-[#181715] text-[#F5F5F0] border border-[#33302A] rounded-2xl p-6 sm:p-10 shadow-2xl relative">
            {/* Top Bar: Close & Keyboard hints */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Sorotan Khas Kelas (Spotlight Mode)</span>
                <span className="text-[#8C887B] normal-case font-tabular">
                  · {spotlightIndex !== null ? spotlightIndex + 1 : 1} daripada {approvedFeedbacks.length}
                </span>
              </div>
              <button
                onClick={() => setSpotlightIndex(null)}
                className="p-1.5 rounded-lg text-[#8C887B] hover:text-white hover:bg-[#2B2925] transition-colors"
                aria-label="Tutup sorotan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quote Body (Super large presentation font) */}
            <div className="my-6">
              <p className="text-xl sm:text-2xl lg:text-3xl font-medium leading-relaxed text-[#FAF9F5]">
                “{spotlightFeedback.keyTakeaway}”
              </p>
            </div>

            {/* Improvement Suggestion if available */}
            {spotlightFeedback.improvementSuggestion && (
              <div className="p-4 rounded-xl bg-[#22201D] border border-[#33302A] text-sm text-[#C8C5BC] mb-6">
                <span className="font-semibold text-white block mb-1">Cadangan Penambahbaikan Peserta:</span>
                “{spotlightFeedback.improvementSuggestion}”
              </div>
            )}

            {/* Author & Rating Footer */}
            <div className="flex items-center justify-between border-t border-[#2B2925] pt-5">
              <div className="flex items-center gap-3.5">
                {spotlightFeedback.authorAvatar ? (
                  <img
                    src={spotlightFeedback.authorAvatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-[#3A3732]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#2B2925] text-white flex items-center justify-center font-bold text-sm border border-[#3A3732]">
                    {spotlightFeedback.isAnonymous ? '?' : spotlightFeedback.authorName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white text-base">
                    {spotlightFeedback.authorName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#8C887B]">
                    <span>{sessions.find(s => s.id === spotlightFeedback.sessionId)?.title || spotlightFeedback.sessionId}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#16A34A] font-semibold">NPS {spotlightFeedback.npsScore}/10</span>
                  </div>
                </div>
              </div>

              {/* Star Rating & Slide Nav Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-tabular font-bold text-lg text-[#F59E0B] mr-2">
                  <Star className="w-5 h-5 fill-[#F59E0B]" />
                  <span>{spotlightFeedback.ratingOverall}.0</span>
                </div>

                <div className="flex items-center gap-1 bg-[#22201D] p-1 rounded-lg border border-[#33302A]">
                  <button
                    onClick={handlePrevSpotlight}
                    className="p-2 rounded hover:bg-[#2B2925] text-white transition-colors"
                    title="Sebelumnya (Arrow Left)"
                    aria-label="Kad Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextSpotlight}
                    className="p-2 rounded hover:bg-[#2B2925] text-white transition-colors"
                    title="Seterusnya (Arrow Right / Space)"
                    aria-label="Kad Seterusnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-[11px] text-[#73726E]">
              Gunakan kekunci <kbd className="px-1.5 py-0.5 bg-[#2B2925] rounded text-white font-tabular">←</kbd> dan <kbd className="px-1.5 py-0.5 bg-[#2B2925] rounded text-white font-tabular">→</kbd> untuk beralih antara testimoni semasa pembentangan.
            </div>
          </div>
        </div>
      )}

      {/* MAIN DISPLAY AREA: MARQUEE STREAM OR INTERACTIVE GRID */}
      <div className="flex-1 flex flex-col justify-center py-6 overflow-hidden">
        {approvedFeedbacks.length === 0 ? (
          /* Empty State */
          <div className={`max-w-md mx-auto text-center p-8 rounded-2xl border shadow-2xs my-12 ${
            isCinemaDark ? 'bg-[#181715] border-[#262421]' : 'bg-white border-[#E8E6E1]'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-[#F5F4F0] border border-[#E0DED7] flex items-center justify-center mx-auto mb-4 text-[#181716]">
              <QrCode className="w-6 h-6 text-[#D97706]" />
            </div>
            <h2 className="text-base font-bold mb-1.5">
              Belum Ada Maklum Balas Diluluskan
            </h2>
            <p className={`text-xs mb-5 leading-relaxed ${isCinemaDark ? 'text-[#8C887B]' : 'text-[#73726E]'}`}>
              Pancarkan kod QR pada skrin bilik kuliah untuk menjemput peserta. Maklum balas yang melepasi saringan AI akan muncul di sini secara automatik.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={onOpenQR}
                className="inline-flex items-center px-4 py-2 bg-[#181716] text-white text-xs font-bold rounded-lg hover:bg-[#2C2A28] transition-colors shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#F59E0B]" />
                <span>Papar Kod QR Sesi</span>
              </button>
              <button
                onClick={onOpenForm}
                className={`inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  isCinemaDark
                    ? 'bg-[#22211E] border-[#36332E] text-white hover:bg-[#2B2925]'
                    : 'bg-white border-[#DCDAD4] text-[#181716] hover:bg-[#F7F7F4]'
                }`}
              >
                Uji Borang Peserta
              </button>
            </div>
          </div>
        ) : viewMode === 'stream' ? (
          /* STREAM VIEW: 2 Marquee Rows with pause on hover */
          <div className="space-y-6 overflow-hidden py-4">
            {/* Stream Row 1 */}
            <div className="relative w-full overflow-hidden">
              <div
                className={`animate-marquee-horizontal space-x-5 pause-on-hover ${
                  isMarqueePaused ? 'is-paused' : ''
                }`}
                style={{
                  animationDuration: `${Math.max(24, marqueeRow1.length * 6) / streamSpeed}s`,
                }}
              >
                {marqueeRow1.map((fb, idx) => renderCard(fb, 'r1', idx))}
              </div>
            </div>

            {/* Stream Row 2 (Opposite Direction) */}
            {marqueeRow2.length > 0 && (
              <div className="relative w-full overflow-hidden">
                <div
                  className={`animate-marquee-horizontal space-x-5 pause-on-hover ${
                    isMarqueePaused ? 'is-paused' : ''
                  }`}
                  style={{
                    animationDuration: `${Math.max(28, marqueeRow2.length * 7) / streamSpeed}s`,
                    animationDirection: 'reverse',
                  }}
                >
                  {marqueeRow2.map((fb, idx) => renderCard(fb, 'r2', idx))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* GRID VIEW: Responsive Masonry-like Grid for trainer review */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedFeedbacks.map((fb, idx) => renderCard(fb, 'grid', idx, true))}
            </div>
          </div>
        )}
      </div>

      {/* FLOATING CORNER QR OVERLAY (Ideal for workshop participants walking in late!) */}
      {showCornerQR && approvedFeedbacks.length > 0 && (
        <aside
          aria-label="Pautan Pantas Kod QR"
          className={`fixed bottom-14 right-4 z-30 p-3 rounded-xl border shadow-lg transition-all flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            isCinemaDark ? 'bg-[#181715]/95 border-[#33302A] text-white' : 'bg-white/95 border-[#E0DED7] text-[#181716]'
          } backdrop-blur-sm`}
        >
          <div className="p-1 bg-white rounded-lg border border-[#E0DED7] shrink-0">
            <QRCodeSVG
              value={qrTargetUrl}
              size={64}
              level="M"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor="#181716"
            />
          </div>
          <div className="text-left pr-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs">Imbas untuk Respon</span>
              <button
                onClick={() => setShowCornerQR(false)}
                className="text-[#73726E] hover:text-[#181716] p-0.5 rounded"
                aria-label="Tutup kod QR sudut"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[10px] text-[#73726E] mt-0.5">
              Kongsikan penilaian bengkel anda
            </p>
            <span className="text-[9px] font-tabular font-bold text-[#D97706] block mt-1">
              {currentSession ? currentSession.id : 'SES-001'}
            </span>
          </div>
        </aside>
      )}

      {/* Live Wall Footer */}
      <footer className={`max-w-7xl w-full mx-auto px-4 sm:px-6 py-3.5 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-2 ${
        isCinemaDark ? 'border-[#21201D] text-[#8C887B]' : 'border-[#E8E6E1] text-[#73726E]'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>Saringan keselamatan & sentimen automatik oleh Gemini AI</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Klik mana-mana kad untuk baca butiran atau semat sorotan</span>
        </div>
        <div className="flex items-center gap-3">
          {!showCornerQR && (
            <button
              onClick={() => setShowCornerQR(true)}
              className="hover:underline font-medium text-xs text-[#D97706]"
            >
              Tunjuk QR Sudut
            </button>
          )}
          <button
            onClick={onOpenForm}
            className={`hover:underline underline-offset-2 font-bold ${isCinemaDark ? 'text-white' : 'text-[#181716]'}`}
          >
            Buka Borang Peserta →
          </button>
        </div>
      </footer>

      {/* Detail Modal */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        sessionTitle={sessions.find(s => s.id === selectedFeedback?.sessionId)?.title}
        onClose={() => setSelectedFeedback(null)}
      />
    </div>
  );
};
