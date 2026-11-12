import React, { useState } from 'react';
import { X, Calendar, User, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-[#E8E6E1] overflow-hidden text-left animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E6E1] flex items-center justify-between bg-[#FAFAF8]">
          <div>
            <h2 className="font-extrabold text-[#181716] text-sm">
              Cipta Sesi Bengkel Baharu
            </h2>
            <p className="text-xs text-[#73726E]">
              Daftar sesi latihan untuk menjana pautan dan kod QR khusus.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#73726E] hover:text-[#181716] rounded-lg hover:bg-[#F3F3EE] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="new-session-title" className="text-xs font-bold text-[#181716] block mb-1">
              Nama Program / Tajuk Bengkel <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="new-session-title"
              type="text"
              required
              placeholder="Contoh: Bengkel Generative AI untuk Produktiviti Pejabat"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DCDAD4] focus:outline-none focus:border-[#181716]"
            />
            <p className="text-[11px] text-[#73726E] mt-1">
              Tajuk ini akan dipaparkan di bahagian atas borang penilaian peserta dan Dinding Langsung.
            </p>
          </div>

          <div>
            <label htmlFor="new-session-date" className="text-xs font-bold text-[#181716] block mb-1">
              Tarikh Program <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <input
                id="new-session-date"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DCDAD4] focus:outline-none focus:border-[#181716]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-session-instructor" className="text-xs font-bold text-[#181716] block mb-1">
              Nama Trainer / Lokasi <span className="text-[#73726E] font-normal">(Pilihan)</span>
            </label>
            <input
              id="new-session-instructor"
              type="text"
              placeholder="Contoh: Dr. Rizal / Bilik Seminar Mercu"
              value={instructor}
              onChange={e => setInstructor(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DCDAD4] focus:outline-none focus:border-[#181716]"
            />
          </div>

          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#F0EFEA] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#181716] bg-white border border-[#DCDAD4] rounded-xl hover:bg-[#F7F7F4]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#181716] rounded-xl hover:bg-[#2C2A28] transition-colors shadow-xs"
            >
              Cipta Sesi & Jana QR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
