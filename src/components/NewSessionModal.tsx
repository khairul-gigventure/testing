import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TrainingSession } from '../types';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (sessionData: { title: string; date: string; instructor?: string }) => TrainingSession;
  onSessionCreated: (session: TrainingSession) => void;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  onCreateSession,
  onSessionCreated,
}) => {
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [instructor, setInstructor] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      setError('Nama program wajib diisi (sekurang-kurangnya 3 aksara).');
      return;
    }
    if (!date) {
      setError('Sila pilih tarikh program yang sah.');
      return;
    }

    const created = onCreateSession({
      title: title.trim(),
      date,
      instructor: instructor.trim() || undefined,
    });

    setTitle('');
    setInstructor('');
    setError('');
    onSessionCreated(created);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-100"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-session-title"
    >
      <div
        className="bg-white rounded-xl max-w-md w-full border border-[#E2E6EB] overflow-hidden text-left shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E6EB] flex items-center justify-between">
          <div>
            <h2 id="new-session-title" className="font-semibold text-[#17212B] text-base">
              Cipta sesi baharu
            </h2>
            <p className="text-xs text-[#596579] mt-0.5">
              Daftar sesi untuk menjana pautan dan kod QR kepada peserta.
            </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <label htmlFor="new-session-title-input" className="font-medium text-[#17212B] block mb-1">
              Nama program / Tajuk bengkel <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="new-session-title-input"
              type="text"
              required
              placeholder="Contoh: Bengkel Prompt Engineering & Automasi"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#E2E6EB] focus:outline-none focus:border-[#2457E7]"
            />
          </div>

          <div>
            <label htmlFor="new-session-date-input" className="font-medium text-[#17212B] block mb-1">
              Tarikh program <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="new-session-date-input"
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#E2E6EB] focus:outline-none focus:border-[#2457E7]"
            />
          </div>

          <div>
            <label htmlFor="new-session-instructor-input" className="font-medium text-[#17212B] block mb-1">
              Nama jurulatih / Lokasi <span className="text-[#596579] font-normal">(pilihan)</span>
            </label>
            <input
              id="new-session-instructor-input"
              type="text"
              placeholder="Contoh: Dr. Rizal / Bilik Seminar A"
              value={instructor}
              onChange={e => setInstructor(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#E2E6EB] focus:outline-none focus:border-[#2457E7]"
            />
          </div>

          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E2E6EB] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-[#17212B] bg-white border border-[#E2E6EB] rounded-lg hover:bg-[#F6F7F9]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#2457E7] hover:bg-[#1D46BE] rounded-lg transition-colors"
            >
              Cipta sesi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
