import React, { useState } from 'react';
import { X, RotateCcw, KeyRound, Cpu } from 'lucide-react';
import { storageService } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemo: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetDemo,
}) => {
  const settings = storageService.getSettings();
  const [pin, setPin] = useState<string>(settings.adminPin);
  const [pinSaved, setPinSaved] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>('');

  if (!isOpen) return null;

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      setPinError('PIN mesti terdiri daripada 4 digit nombor.');
      return;
    }

    storageService.updatePin(pin);
    setPinError('');
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Adakah anda pasti mahu set semula semua data ke Demo Asal?\n\nTindakan ini akan memulihkan 2 sesi bengkel contoh dan 12 rekod maklum balas peserta.')) {
      storageService.resetDemoData();
      onResetDemo();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-[#E8E6E1] overflow-hidden text-left animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E6E1] flex items-center justify-between bg-[#FAFAF8]">
          <h2 className="font-extrabold text-[#181716] text-sm">
            Tetapan Pentadbir
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#73726E] hover:text-[#181716] rounded-lg hover:bg-[#F3F3EE] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* PIN Management */}
          <form onSubmit={handleSavePin} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#181716]">
              <KeyRound className="w-4 h-4 text-[#D97706]" />
              <span>Tukar PIN Keselamatan Admin (4-Digit)</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="admin-pin-input"
                type="password"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-28 text-center text-base font-tabular tracking-widest px-3 py-2 rounded-xl border border-[#DCDAD4] focus:outline-none focus:border-[#181716]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#181716] text-white text-xs font-bold hover:bg-[#2C2A28] transition-colors shadow-xs"
              >
                {pinSaved ? 'Disimpan!' : 'Simpan PIN'}
              </button>
            </div>
            <p className="text-[11px] text-[#73726E]">
              PIN lalai semasa ialah <span className="font-tabular font-bold text-[#181716]">1234</span>. Digunakan untuk mengunci papan analitik daripada peserta.
            </p>
            {pinError && (
              <p className="text-xs text-[#DC2626] mt-1">
                {pinError}
              </p>
            )}
          </form>

          {/* AI Engine Status */}
          <div className="pt-4 border-t border-[#F0EFEA] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#181716]">
              <Cpu className="w-4 h-4 text-[#D97706]" />
              <span>Enjin Kecerdasan Buatan (Gemini AI)</span>
            </div>
            <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-[#E8E6E1] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#73726E]">Model Pengelasan & Rumusan:</span>
                <span className="font-bold text-[#181716]">gemini-3.8-flash</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#73726E]">Sandaran Saringan Tempatan:</span>
                <span className="font-bold text-[#15803D]">Tersedia Automatik (100% Uptime)</span>
              </div>
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-4 border-t border-[#F0EFEA] space-y-2">
            <span className="text-xs font-bold text-[#181716] block">
              Set Semula Data Contoh (Demo)
            </span>
            <p className="text-xs text-[#73726E]">
              Pulihkan 2 sesi contoh dan 12 maklum balas asal untuk tujuan demonstrasi atau latihan.
            </p>
            <button
              type="button"
              onClick={handleResetData}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-[#181716] bg-white border border-[#DCDAD4] rounded-xl hover:bg-[#F7F7F4] transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#73726E]" />
              <span>Set Semula ke Data Asal</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#FAFAF8] border-t border-[#E8E6E1] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#181716] bg-white border border-[#DCDAD4] rounded-xl hover:bg-[#F7F7F4]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
