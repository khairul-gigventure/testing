import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
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
    if (window.confirm('Adakah anda pasti mahu mengembalikan data kepada contoh asal?\n\nTindakan ini akan memulihkan 2 sesi contoh dan 12 maklum balas asal.')) {
      storageService.resetDemoData();
      onResetDemo();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-100"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        className="bg-white rounded-xl max-w-md w-full border border-[#E2E6EB] overflow-hidden text-left shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E6EB] flex items-center justify-between">
          <h2 id="settings-modal-title" className="font-semibold text-[#17212B] text-base">
            Tetapan pentadbir
          </h2>
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
        <div className="p-6 space-y-6 text-xs text-left">
          {/* PIN Management */}
          <form onSubmit={handleSavePin} className="space-y-3">
            <div>
              <label htmlFor="admin-pin-setting" className="font-medium text-[#17212B] block mb-1">
                Tukar PIN keselamatan analitik (4 digit)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="admin-pin-setting"
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-24 text-center text-sm font-mono tracking-widest px-3 py-2 rounded-lg border border-[#E2E6EB] focus:outline-none focus:border-[#2457E7]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-[#2457E7] hover:bg-[#1D46BE] text-white font-medium transition-colors"
                >
                  {pinSaved ? 'Disimpan' : 'Simpan PIN'}
                </button>
              </div>
              <p className="text-[11px] text-[#596579] mt-1.5">
                PIN lalai semasa ialah <span className="font-mono font-medium text-[#17212B]">1234</span>.
              </p>
              {pinError && (
                <p className="text-xs text-[#DC2626] mt-1">{pinError}</p>
              )}
            </div>
          </form>

          {/* Reset Demo Data */}
          <div className="pt-4 border-t border-[#E2E6EB] space-y-2">
            <span className="font-medium text-[#17212B] block">
              Set semula data contoh
            </span>
            <p className="text-[#596579]">
              Memulihkan 2 sesi contoh dan 12 maklum balas asal untuk tujuan demonstrasi.
            </p>
            <button
              type="button"
              onClick={handleResetData}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-medium text-[#17212B] bg-white border border-[#E2E6EB] rounded-lg hover:bg-[#F6F7F9] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#596579]" />
              <span>Pulihkan data contoh</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#F6F7F9] border-t border-[#E2E6EB] text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-[#17212B] bg-white border border-[#E2E6EB] rounded-lg hover:bg-[#F6F7F9]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
