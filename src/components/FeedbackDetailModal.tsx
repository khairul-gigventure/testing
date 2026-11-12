import React from 'react';
import { X } from 'lucide-react';
import { FeedbackEntry } from '../types';

interface FeedbackDetailModalProps {
  feedback: FeedbackEntry | null;
  sessionTitle?: string;
  onClose: () => void;
  onToggleStatus?: (id: string, newStatus: 'approved' | 'hidden') => void;
}

const RATING_EMOTIONS: Record<number, string> = {
  1: 'Kurang memuaskan',
  2: 'Perlu penambahbaikan',
  3: 'Sederhana',
  4: 'Bagus & jelas',
  5: 'Cemerlang & amat bermanfaat',
};

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  feedback,
  sessionTitle,
  onClose,
  onToggleStatus,
}) => {
  if (!feedback) return null;

  const isAuthorAnonymous = feedback.isAnonymous || feedback.authorName.toLowerCase() === 'anonymous';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-100"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-detail-title"
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full border border-[#E2E6EB] overflow-hidden text-left shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E6EB] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <h2 id="feedback-detail-title" className="font-semibold text-sm text-[#17212B]">
              Butiran maklum balas
            </h2>
            <span aria-hidden="true" className="text-[#CBD3DC]">·</span>
            <span className={feedback.status === 'approved' ? 'text-[#16A34A] font-medium' : 'text-[#D97706] font-medium'}>
              {feedback.status === 'approved' ? 'Diluluskan' : 'Ditahan'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#596579] hover:text-[#17212B] rounded-lg hover:bg-[#F6F7F9] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-left">
          {/* Author info */}
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-sm text-[#17212B] block">
                {isAuthorAnonymous ? 'Tanpa nama' : feedback.authorName}
              </span>
              <span className="text-[#596579] mt-0.5 block">
                {sessionTitle || feedback.sessionId} · {new Date(feedback.createdAt).toLocaleDateString('ms-MY')}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[#596579] block text-[11px]">Sentimen:</span>
              <span className="font-medium text-[#17212B]">
                {feedback.sentiment === 'Positive' ? 'Positif' : feedback.sentiment === 'Constructive' ? 'Membina' : 'Neutral'}
              </span>
            </div>
          </div>

          {/* Ratings 4-column strip */}
          <div className="grid grid-cols-4 gap-2 border-y border-[#E2E6EB] py-3 text-center text-xs">
            <div>
              <span className="text-[11px] text-[#596579] block mb-0.5">Kepuasan</span>
              <div className="font-tabular font-semibold text-[#D97706] text-sm">
                {feedback.ratingOverall}.0★
              </div>
              <span className="text-[10px] text-[#596579] block truncate">
                {RATING_EMOTIONS[feedback.ratingOverall] || ''}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#596579] block mb-0.5">Kandungan</span>
              <div className="font-tabular font-semibold text-[#17212B] text-sm">
                {feedback.ratingContent}.0★
              </div>
              <span className="text-[10px] text-[#596579] block truncate">
                {RATING_EMOTIONS[feedback.ratingContent] || ''}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#596579] block mb-0.5">Jurulatih</span>
              <div className="font-tabular font-semibold text-[#17212B] text-sm">
                {feedback.ratingDelivery}.0★
              </div>
              <span className="text-[10px] text-[#596579] block truncate">
                {RATING_EMOTIONS[feedback.ratingDelivery] || ''}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#596579] block mb-0.5">Skor NPS</span>
              <div className="font-tabular font-semibold text-[#17212B] text-sm">
                {feedback.npsScore}/10
              </div>
              <span className="text-[10px] text-[#596579] block">
                {feedback.npsScore >= 9 ? 'Promoter' : feedback.npsScore >= 7 ? 'Passive' : 'Detractor'}
              </span>
            </div>
          </div>

          {/* Full comments */}
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-medium text-[#17212B] block mb-1">
                Perkara paling bermanfaat:
              </span>
              <blockquote className="p-3.5 bg-[#F6F7F9] rounded-lg border border-[#E2E6EB] text-[#17212B] text-sm leading-relaxed">
                “{feedback.keyTakeaway}”
              </blockquote>
            </div>

            {feedback.improvementSuggestion && (
              <div>
                <span className="font-medium text-[#17212B] block mb-1">
                  Cadangan penambahbaikan:
                </span>
                <blockquote className="p-3.5 bg-[#F6F7F9] rounded-lg border border-[#E2E6EB] text-[#596579] text-sm leading-relaxed">
                  “{feedback.improvementSuggestion}”
                </blockquote>
              </div>
            )}
          </div>

          {/* AI flag note if present */}
          {feedback.aiFlagReason && (
            <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs">
              Nota saringan etika: {feedback.aiFlagReason}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#F6F7F9] border-t border-[#E2E6EB] flex items-center justify-between text-xs">
          {onToggleStatus ? (
            <button
              type="button"
              onClick={() => {
                onToggleStatus(
                  feedback.id,
                  feedback.status === 'approved' ? 'hidden' : 'approved'
                );
                onClose();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                feedback.status === 'approved'
                  ? 'bg-white text-[#596579] border-[#E2E6EB] hover:bg-[#F6F7F9]'
                  : 'bg-[#2457E7] text-white border-[#2457E7] hover:bg-[#1D46BE]'
              }`}
            >
              {feedback.status === 'approved' ? 'Sorokkan dari Live Wall' : 'Luluskan ke Live Wall'}
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 font-medium text-[#17212B] bg-white border border-[#E2E6EB] rounded-lg hover:bg-[#F6F7F9]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
