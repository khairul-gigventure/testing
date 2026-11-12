import React from 'react';
import { X, Star, CheckCircle2, ShieldAlert } from 'lucide-react';
import { FeedbackEntry } from '../types';

interface FeedbackDetailModalProps {
  feedback: FeedbackEntry | null;
  sessionTitle?: string;
  onClose: () => void;
  onToggleStatus?: (id: string, newStatus: 'approved' | 'hidden') => void;
}

const RATING_EMOTIONS: Record<number, string> = {
  1: 'Kurang Memuaskan',
  2: 'Perlu Penambahbaikan',
  3: 'Sederhana',
  4: 'Bagus & Jelas',
  5: 'Cemerlang & Amat Bermanfaat',
};

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  feedback,
  sessionTitle,
  onClose,
  onToggleStatus,
}) => {
  if (!feedback) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-[#E8E6E1] overflow-hidden text-left animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8E6E1] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#181716]">
              Butiran Maklum Balas
            </span>
            <span aria-hidden="true" className="text-[#DCDAD4]">·</span>
            <span className="text-xs font-medium text-[#73726E]">
              {feedback.status === 'approved' ? (
                <span className="text-[#16A34A] font-semibold">Live di Dinding Langsung</span>
              ) : (
                <span className="text-[#D97706] font-semibold">Ditahan dalam Moderasi</span>
              )}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#73726E] hover:text-[#181716] rounded-lg hover:bg-[#F3F3EE] transition-colors"
            aria-label="Tutup tetingkap"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Author Profile */}
          <div className="flex items-center gap-3.5">
            {feedback.authorAvatar ? (
              <img
                src={feedback.authorAvatar}
                alt=""
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border border-[#E8E6E1] bg-[#F5F4F0]"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#F0EFEA] text-[#181716] flex items-center justify-center font-bold text-sm border border-[#E8E6E1]">
                {feedback.isAnonymous ? '?' : feedback.authorName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-bold text-sm text-[#181716] flex items-center gap-2">
                <span>{feedback.authorName}</span>
                <span className="text-xs font-normal text-[#73726E]">
                  ({feedback.isAnonymous ? 'Tanpa Nama' : 'Disahkan Google'})
                </span>
              </div>
              <p className="text-xs text-[#73726E] mt-0.5">
                {new Date(feedback.createdAt).toLocaleDateString('ms-MY', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Session Title */}
          <div className="text-xs text-[#73726E]">
            <span className="font-semibold text-[#181716]">Sesi Bengkel: </span>
            <span>{sessionTitle || feedback.sessionId}</span>
          </div>

          {/* Ratings Grid */}
          <div className="grid grid-cols-4 gap-2 border-y border-[#F0EFEA] py-3.5 text-center">
            <div>
              <span className="text-[11px] text-[#73726E] block mb-0.5 font-medium">Kepuasan</span>
              <div className="font-tabular font-extrabold text-[#B45309] text-base">
                {feedback.ratingOverall}.0★
              </div>
              <span className="text-[9px] text-[#8C887B] block truncate">
                {RATING_EMOTIONS[feedback.ratingOverall] || ''}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#73726E] block mb-0.5 font-medium">Kandungan</span>
              <div className="font-tabular font-extrabold text-[#181716] text-base">
                {feedback.ratingContent}.0★
              </div>
              <span className="text-[9px] text-[#8C887B] block truncate">
                {RATING_EMOTIONS[feedback.ratingContent] || ''}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#73726E] block mb-0.5 font-medium">Trainer</span>
              <div className="font-tabular font-extrabold text-[#181716] text-base">
                {feedback.ratingDelivery}.0★
              </div>
              <span className="text-[9px] text-[#8C887B] block truncate">
                {RATING_EMOTIONS[feedback.ratingDelivery] || ''}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#73726E] block mb-0.5 font-medium">Skor NPS</span>
              <div className="font-tabular font-extrabold text-[#181716] text-base">
                {feedback.npsScore}/10
              </div>
              <span className="text-[9px] font-bold text-[#16A34A] block">
                {feedback.npsScore >= 9 ? 'Promoter' : feedback.npsScore >= 7 ? 'Passive' : 'Detractor'}
              </span>
            </div>
          </div>

          {/* Open Comments */}
          <div className="space-y-3.5 text-xs">
            <div>
              <span className="font-bold text-[#181716] block mb-1">
                Perkara Paling Bermanfaat:
              </span>
              <p className="p-3.5 bg-[#FAFAF8] rounded-xl border border-[#E8E6E1] text-[#2B2A27] leading-relaxed text-[13px]">
                “{feedback.keyTakeaway}”
              </p>
            </div>

            {feedback.improvementSuggestion && (
              <div>
                <span className="font-bold text-[#181716] block mb-1">
                  Cadangan Penambahbaikan:
                </span>
                <p className="p-3.5 bg-[#FAFAF8] rounded-xl border border-[#E8E6E1] text-[#2B2A27] leading-relaxed text-[13px]">
                  “{feedback.improvementSuggestion}”
                </p>
              </div>
            )}
          </div>

          {/* AI Assessment */}
          <div className="text-xs space-y-1.5 text-[#73726E] border-t border-[#F0EFEA] pt-3">
            <div className="flex items-center justify-between">
              <span>Klasifikasi Sentimen AI:</span>
              <span className="font-bold text-[#181716]">
                {feedback.sentiment === 'Positive' ? 'Sentimen Positif' : feedback.sentiment === 'Constructive' ? 'Sentimen Konstruktif' : 'Sentimen Neutral'}
              </span>
            </div>
            {feedback.aiFlagReason && (
              <div className="p-2.5 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Nota Saringan AI: {feedback.aiFlagReason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#FAFAF8] border-t border-[#E8E6E1] flex items-center justify-between">
          {onToggleStatus ? (
            <button
              onClick={() => {
                onToggleStatus(
                  feedback.id,
                  feedback.status === 'approved' ? 'hidden' : 'approved'
                );
                onClose();
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors shadow-2xs ${
                feedback.status === 'approved'
                  ? 'bg-white text-[#73726E] border-[#DCDAD4] hover:bg-[#F7F7F4]'
                  : 'bg-[#181716] text-white border-[#181716] hover:bg-[#2C2A28]'
              }`}
            >
              {feedback.status === 'approved' ? 'Sorokkan daripada Live Wall' : 'Luluskan ke Live Wall'}
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#181716] bg-white border border-[#DCDAD4] rounded-xl hover:bg-[#F7F7F4] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
