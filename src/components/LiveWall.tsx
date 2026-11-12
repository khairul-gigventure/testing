import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Play, Pause, Maximize2, Minimize2, Star, Filter,
  Pin, X, LayoutGrid, Radio, ChevronLeft, ChevronRight,
  Share2, ArrowRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { FeedbackEntry, TrainingSession } from '../types';
import { FeedbackDetailModal } from './FeedbackDetailModal';

interface LiveWallProps {
  feedbacks: FeedbackEntry[];
  sessions: TrainingSession[];
  selectedSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onOpenShare: () => void;
  onOpenForm: () => void;
  highlightedFeedbackId?: string | null;
}

export const LiveWall: React.FC<LiveWallProps> = ({
  feedbacks,
  sessions,
  selectedSessionId,
  onSelectSession,
  onOpenShare,
  onOpenForm,
  highlightedFeedbackId,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'stream'>('grid');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'Positive' | 'Constructive'>('all');
  const [showProjectorQR, setShowProjectorQR] = useState<boolean>(true);

  // Presenter Spotlight slide state
  const [spotlightIndex, setSpotlightIndex] = useState<number | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null);

  // Projector mode controls auto-hide after inactivity
  const [showProjectorControls, setShowProjectorControls] = useState<boolean>(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter approved feedbacks (FR-005)
  const approvedFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      const isApproved = f.status === 'approved';
      const matchesSession = selectedSessionId === 'all' || f.sessionId === selectedSessionId;
      const matchesSentiment = sentimentFilter === 'all' || f.sentiment === sentimentFilter;
      return isApproved && matchesSession && matchesSentiment;
    });
  }, [feedbacks, selectedSessionId, sentimentFilter]);

  const currentSession = sessions.find(s => s.id === selectedSessionId);
  const isAllSessions = selectedSessionId === 'all';

  // Active spotlight feedback
  const spotlightFeedback = spotlightIndex !== null && approvedFeedbacks[spotlightIndex]
    ? approvedFeedbacks[spotlightIndex]
    : null;

  // Stream rows for marquee mode
  const row1Feedbacks = useMemo(() => {
    return approvedFeedbacks.filter((_, idx) => idx % 2 === 0);
  }, [approvedFeedbacks]);

  const row2Feedbacks = useMemo(() => {
    return approvedFeedbacks.filter((_, idx) => idx % 2 !== 0);
  }, [approvedFeedbacks]);

  // Handle Fullscreen & Projector Mode
  const handleToggleProjector = () => {
    if (!isProjectorMode) {
      setIsProjectorMode(true);
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsProjectorMode(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Exit projector on Escape
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isProjectorMode) {
        setIsProjectorMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isProjectorMode]);

  // Projector controls auto-dim on idle
  const handleUserActivity = useCallback(() => {
    if (!isProjectorMode) return;
    setShowProjectorControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      setShowProjectorControls(false);
    }, 3500);
  }, [isProjectorMode]);

  useEffect(() => {
    if (isProjectorMode) {
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
      return () => {
        window.removeEventListener('mousemove', handleUserActivity);
        window.removeEventListener('keydown', handleUserActivity);
        if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
      };
    }
  }, [isProjectorMode, handleUserActivity]);

  // Spotlight keyboard slide navigation
  const handleNextSpotlight = useCallback(() => {
    if (spotlightIndex === null || approvedFeedbacks.length === 0) return;
    setSpotlightIndex((spotlightIndex + 1) % approvedFeedbacks.length);
  }, [spotlightIndex, approvedFeedbacks.length]);

  const handlePrevSpotlight = useCallback(() => {
    if (spotlightIndex === null || approvedFeedbacks.length === 0) return;
    setSpotlightIndex((spotlightIndex - 1 + approvedFeedbacks.length) % approvedFeedbacks.length);
  }, [spotlightIndex, approvedFeedbacks.length]);

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
      } else if (e.key === 'Escape' && isProjectorMode) {
        setIsProjectorMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spotlightIndex, isProjectorMode, handleNextSpotlight, handlePrevSpotlight]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kelaspulse.ai';
  const qrTargetUrl = `${baseUrl}/?session=${currentSession ? currentSession.id : 'SES-001'}&mode=form`;

  const renderCard = (feedback: FeedbackEntry, keyPrefix: string, index: number, isGrid = true) => {
    const sessionObj = sessions.find(s => s.id === feedback.sessionId);
    const isHighlighted = highlightedFeedbackId === feedback.id;
    const actualIndex = approvedFeedbacks.findIndex(f => f.id === feedback.id);
    const isAuthorAnonymous = feedback.isAnonymous || feedback.authorName.toLowerCase() === 'anonymous';
    const isLongText = feedback.keyTakeaway.length > 160;

    return (
      <article
        key={`${keyPrefix}-${feedback.id}-${index}`}
        className={`group text-left rounded-xl border transition-colors flex flex-col justify-between cursor-pointer ${
          isGrid ? 'w-full p-6' : 'w-[360px] sm:w-[440px] shrink-0 p-6'
        } ${
          isProjectorMode
            ? 'bg-[#18222D] border-[#2A3747] text-[#FFFFFF]'
            : 'bg-white border-[#E2E6EB] hover:border-[#CBD3DC] text-[#17212B]'
        } ${isHighlighted ? 'ring-2 ring-[#2457E7]' : ''}`}
        onClick={() => setSelectedFeedback(feedback)}
      >
        <div className="space-y-4">
          {/* Main dominant element: The Participant's Quote */}
          <blockquote
            className={`font-normal leading-snug tracking-tight ${
              isProjectorMode
                ? 'text-xl sm:text-2xl text-white'
                : 'text-lg sm:text-[22px] text-[#17212B]'
            }`}
          >
            “{feedback.keyTakeaway}”
          </blockquote>

          {/* Optional inline button if comment was very long */}
          {isLongText && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFeedback(feedback);
              }}
              className="text-xs font-medium text-[#2457E7] hover:underline"
            >
              Baca butiran penuh →
            </button>
          )}
        </div>

        {/* Secondary Supporting Information (Author, Session tag if multi-session, Rating) */}
        <div className={`mt-5 pt-3.5 border-t flex items-center justify-between text-xs ${
          isProjectorMode ? 'border-[#2A3747] text-[#93A1B2]' : 'border-[#F0F2F5] text-[#596579]'
        }`}>
          <div className="flex items-center gap-2 truncate pr-2">
            <span className={`font-medium truncate ${isProjectorMode ? 'text-white' : 'text-[#17212B]'}`}>
              {isAuthorAnonymous ? 'Tanpa nama' : feedback.authorName}
            </span>
            {isAllSessions && sessionObj && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[120px]">{sessionObj.id}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Spotlight button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSpotlightIndex(actualIndex >= 0 ? actualIndex : 0);
              }}
              className={`p-1 rounded hover:bg-[#F6F7F9] opacity-0 group-hover:opacity-100 transition-opacity ${
                isProjectorMode ? 'hover:bg-[#2A3747] text-[#93A1B2]' : 'text-[#596579]'
              }`}
              title="Sorot kad ini di skrin penuh"
              aria-label="Sorot ulasan ini"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            {/* Star Rating */}
            <div className="flex items-center gap-1 font-semibold text-xs text-[#D97706]">
              <Star className="w-3.5 h-3.5 fill-[#D97706]" />
              <span className="font-tabular">{feedback.ratingOverall}.0</span>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div
      className={`min-h-[calc(100vh-3.5rem)] flex flex-col justify-between transition-colors duration-200 relative ${
        isProjectorMode
          ? 'bg-[#101820] text-white'
          : 'bg-[#F6F7F9] text-[#17212B]'
      }`}
    >
      {/* Page Header & Toolbar (Normal or Projector Mode) */}
      <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4 ${
        isProjectorMode && !showProjectorControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } transition-opacity duration-200`}>
        <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4 border-b ${
          isProjectorMode ? 'border-[#2A3747]' : 'border-[#E2E6EB]'
        }`}>
          {/* Header text */}
          <div>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight leading-tight">
              Suara peserta
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
              <span className={`font-medium ${isProjectorMode ? 'text-[#93A1B2]' : 'text-[#596579]'}`}>
                {currentSession ? currentSession.title : 'Semua sesi bengkel'}
              </span>
              <span aria-hidden="true" className={isProjectorMode ? 'text-[#2A3747]' : 'text-[#CBD3DC]'}>·</span>
              <span className={`font-tabular ${isProjectorMode ? 'text-[#93A1B2]' : 'text-[#596579]'}`}>
                {approvedFeedbacks.length} respons
              </span>
            </div>
          </div>

          {/* Unified Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* View Mode: Grid / Aliran */}
            <div className={`inline-flex items-center p-0.5 rounded-lg border text-xs font-medium ${
              isProjectorMode ? 'bg-[#18222D] border-[#2A3747]' : 'bg-white border-[#E2E6EB]'
            }`}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? isProjectorMode ? 'bg-[#2A3747] text-white font-medium' : 'bg-[#F6F7F9] text-[#2457E7] font-semibold'
                    : 'text-[#596579] hover:text-[#17212B]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('stream')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'stream'
                    ? isProjectorMode ? 'bg-[#2A3747] text-white font-medium' : 'bg-[#F6F7F9] text-[#2457E7] font-semibold'
                    : 'text-[#596579] hover:text-[#17212B]'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Aliran</span>
              </button>
            </div>

            {/* Sentiment Filter */}
            <div className={`flex items-center border rounded-lg px-2.5 py-1.5 text-xs ${
              isProjectorMode ? 'bg-[#18222D] border-[#2A3747] text-white' : 'bg-white border-[#E2E6EB] text-[#17212B]'
            }`}>
              <Filter className="w-3.5 h-3.5 mr-1.5 text-[#596579] shrink-0" />
              <select
                value={sentimentFilter}
                onChange={e => setSentimentFilter(e.target.value as any)}
                aria-label="Tapis mengikut sentimen"
                className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className={isProjectorMode ? 'bg-[#18222D] text-white' : ''}>Semua sentimen</option>
                <option value="Positive" className={isProjectorMode ? 'bg-[#18222D] text-white' : ''}>Sentimen positif</option>
                <option value="Constructive" className={isProjectorMode ? 'bg-[#18222D] text-white' : ''}>Sentimen membina</option>
              </select>
            </div>

            {/* Play / Pause toggle if stream mode */}
            {viewMode === 'stream' && (
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isProjectorMode
                    ? 'bg-[#18222D] border-[#2A3747] text-white hover:bg-[#2A3747]'
                    : 'bg-white border-[#E2E6EB] text-[#17212B] hover:bg-[#F6F7F9]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 mr-1 text-[#596579]" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1 text-[#2457E7]" />
                    <span>Main</span>
                  </>
                )}
              </button>
            )}

            {/* Projector Mode Fullscreen Toggle */}
            <button
              type="button"
              onClick={handleToggleProjector}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isProjectorMode
                  ? 'bg-[#2A3747] text-white border-[#3F5064]'
                  : 'bg-white border-[#E2E6EB] text-[#17212B] hover:bg-[#F6F7F9]'
              }`}
            >
              {isProjectorMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#93A1B2]" />
                  <span>Keluar projektor</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#596579]" />
                  <span>Mod projektor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className={`flex-1 flex flex-col justify-center py-4 sm:py-6 overflow-hidden ${
        isProjectorMode && showProjectorQR ? 'lg:pr-56' : ''
      }`}>
        {approvedFeedbacks.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl border border-[#E2E6EB] my-8">
            <h2 className="text-base font-semibold text-[#17212B] mb-1">
              Belum ada maklum balas
            </h2>
            <p className="text-xs text-[#596579] mb-5 leading-relaxed">
              Kongsikan pautan atau paparkan kod QR sesi kepada peserta untuk mengumpul ulasan.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenShare}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2457E7] hover:bg-[#1D46BE] text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Kongsi sesi</span>
              </button>
              <button
                type="button"
                onClick={onOpenForm}
                className="inline-flex items-center px-4 py-2 text-xs font-medium text-[#17212B] bg-[#F6F7F9] hover:bg-[#EAEFF4] border border-[#E2E6EB] rounded-lg transition-colors"
              >
                Uji borang
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW: Static 3 columns on desktop, 2 on tablet, 1 on mobile */
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {approvedFeedbacks.map((fb, idx) => renderCard(fb, 'grid', idx, true))}
            </div>
          </div>
        ) : (
          /* STREAM VIEW: 2 Marquee Rows with accessible aria-hidden duplicates */
          <div className="space-y-5 overflow-hidden py-2">
            {/* Stream Row 1 */}
            <div className="relative w-full overflow-hidden">
              <div
                className={`animate-marquee-slow space-x-4 pause-on-hover ${!isPlaying ? 'is-paused' : ''}`}
              >
                {/* Primary readable group */}
                <div className="flex space-x-4">
                  {row1Feedbacks.map((fb, idx) => renderCard(fb, 'r1-primary', idx, false))}
                </div>
                {/* Secondary duplicate marked aria-hidden for seamless loop without repeating for screen readers */}
                <div className="flex space-x-4" aria-hidden="true">
                  {row1Feedbacks.map((fb, idx) => renderCard(fb, 'r1-loop', idx, false))}
                </div>
              </div>
            </div>

            {/* Stream Row 2 */}
            {row2Feedbacks.length > 0 && (
              <div className="relative w-full overflow-hidden">
                <div
                  className={`animate-marquee-slow-reverse space-x-4 pause-on-hover ${!isPlaying ? 'is-paused' : ''}`}
                >
                  <div className="flex space-x-4">
                    {row2Feedbacks.map((fb, idx) => renderCard(fb, 'r2-primary', idx, false))}
                  </div>
                  <div className="flex space-x-4" aria-hidden="true">
                    {row2Feedbacks.map((fb, idx) => renderCard(fb, 'r2-loop', idx, false))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DEDICATED PROJECTOR QR DOCK (Takes own space, does NOT overlap comments) */}
      {isProjectorMode && (
        <aside
          aria-label="Kod QR dewan latihan"
          className={`fixed bottom-6 right-6 z-40 bg-[#18222D] border border-[#2A3747] p-4 rounded-xl text-white text-center transition-opacity ${
            showProjectorControls ? 'opacity-100' : 'opacity-30 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2A3747] text-left">
            <span className="text-[11px] font-medium text-[#93A1B2]">Imbas untuk jawab</span>
            <button
              type="button"
              onClick={() => setShowProjectorQR(!showProjectorQR)}
              className="text-[#93A1B2] hover:text-white p-0.5 text-[10px]"
            >
              {showProjectorQR ? 'Sembunyi' : 'Buka'}
            </button>
          </div>
          {showProjectorQR && (
            <div className="space-y-2">
              <div className="p-2 bg-white rounded-lg inline-block">
                <QRCodeSVG
                  value={qrTargetUrl}
                  size={120}
                  level="M"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#101820"
                />
              </div>
              <p className="text-[11px] font-mono text-[#93A1B2]">
                {currentSession ? currentSession.id : 'SES-001'}
              </p>
            </div>
          )}
        </aside>
      )}

      {/* SPOTLIGHT PRESENTATION STAGE MODAL */}
      {spotlightFeedback && (
        <div
          className="fixed inset-0 z-50 bg-[#101820]/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Sorotan ulasan peserta"
        >
          <div className="max-w-3xl w-full bg-[#18222D] text-white border border-[#2A3747] rounded-xl p-6 sm:p-10 shadow-2xl relative">
            {/* Spotlight Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3747] text-xs text-[#93A1B2]">
              <div>
                <span className="font-medium text-white">Sorotan maklum balas</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span className="font-tabular">
                  {spotlightIndex !== null ? spotlightIndex + 1 : 1} daripada {approvedFeedbacks.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSpotlightIndex(null)}
                className="p-1 rounded-lg text-[#93A1B2] hover:text-white hover:bg-[#2A3747] transition-colors"
                aria-label="Tutup sorotan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prominent Quote */}
            <blockquote className="my-8 text-2xl sm:text-3xl lg:text-4xl font-normal leading-snug tracking-tight text-white">
              “{spotlightFeedback.keyTakeaway}”
            </blockquote>

            {/* Improvement Suggestion if available */}
            {spotlightFeedback.improvementSuggestion && (
              <div className="p-4 rounded-lg bg-[#101820] border border-[#2A3747] text-sm text-[#C4CDD7] mb-6">
                <span className="text-xs font-semibold text-[#93A1B2] block mb-1">Cadangan peserta:</span>
                “{spotlightFeedback.improvementSuggestion}”
              </div>
            )}

            {/* Footer with Author and Slide Arrows */}
            <div className="flex items-center justify-between pt-5 border-t border-[#2A3747]">
              <div>
                <div className="font-medium text-base text-white">
                  {spotlightFeedback.isAnonymous ? 'Tanpa nama' : spotlightFeedback.authorName}
                </div>
                <div className="text-xs text-[#93A1B2] mt-0.5">
                  {sessions.find(s => s.id === spotlightFeedback.sessionId)?.title || spotlightFeedback.sessionId}
                </div>
              </div>

              {/* Slide controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 font-semibold text-sm text-[#D97706] mr-3">
                  <Star className="w-4 h-4 fill-[#D97706]" />
                  <span className="font-tabular">{spotlightFeedback.ratingOverall}.0</span>
                </div>

                <div className="flex items-center gap-1 bg-[#101820] p-1 rounded-lg border border-[#2A3747]">
                  <button
                    type="button"
                    onClick={handlePrevSpotlight}
                    className="p-1.5 rounded hover:bg-[#2A3747] text-white transition-colors"
                    title="Sebelumnya (Arrow Left)"
                    aria-label="Ulasan sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSpotlight}
                    className="p-1.5 rounded hover:bg-[#2A3747] text-white transition-colors"
                    title="Seterusnya (Arrow Right / Space)"
                    aria-label="Ulasan seterusnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        sessionTitle={sessions.find(s => s.id === selectedFeedback?.sessionId)?.title}
        onClose={() => setSelectedFeedback(null)}
      />
    </div>
  );
};
