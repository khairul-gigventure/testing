import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TrainingSession } from '../types';

interface QRCodeModalProps {
  session: TrainingSession | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTestForm: (sessionId: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  session,
  isOpen,
  onClose,
  onOpenTestForm,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !session) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kelaspulse.ai';
  const targetUrl = `${baseUrl}/?session=${session.id}&mode=form`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('session-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR-${session.id}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-[#E8E6E1] overflow-hidden text-center animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E6E1] flex items-center justify-between bg-[#FAFAF8]">
          <div className="text-left">
            <h2 className="text-sm font-extrabold text-[#181716]">
              Kod QR Sesi Latihan
            </h2>
            <p className="text-xs text-[#73726E]">
              Pancarkan pada skrin bilik kelas untuk imbasan peserta.
            </p>
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
        <div className="p-6 space-y-4">
          {/* Session Banner */}
          <div className="text-left space-y-0.5">
            <div className="flex items-center gap-2 text-xs text-[#73726E]">
              <span className="font-tabular font-bold text-[#181716]">{session.id}</span>
              <span aria-hidden="true">·</span>
              <span>{session.date}</span>
            </div>
            <h3 className="font-bold text-sm text-[#181716]">
              {session.title}
            </h3>
            {session.instructor && (
              <p className="text-xs text-[#73726E]">
                Trainer: <span className="font-medium text-[#181716]">{session.instructor}</span>
              </p>
            )}
          </div>

          {/* QR Code Container */}
          <div className="p-5 bg-white rounded-2xl border border-[#E8E6E1] inline-block shadow-xs">
            <QRCodeSVG
              id="session-qr-svg"
              value={targetUrl}
              size={210}
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#181716"
            />
          </div>

          <p className="text-xs text-[#73726E] max-w-xs mx-auto leading-relaxed">
            Peserta mengimbas dengan kamera telefon pintar untuk terus membuka borang penilaian bengkel pantas.
          </p>

          {/* URL Box & Copy */}
          <div className="flex items-center gap-2 bg-[#FAFAF8] p-2 rounded-xl border border-[#E8E6E1] text-xs">
            <span className="text-[#73726E] truncate flex-1 font-tabular text-[11px] text-left px-1.5">
              {targetUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white border border-[#DCDAD4] text-[#181716] rounded-lg font-semibold hover:bg-[#F7F7F4] transition-colors flex items-center shrink-0 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-[#16A34A]" />
                  <span className="text-[#16A34A]">Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1 text-[#73726E]" />
                  <span>Salin Pautan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAFAF8] border-t border-[#E8E6E1] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={handleDownloadSVG}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-[#181716] bg-white border border-[#DCDAD4] rounded-xl hover:bg-[#F7F7F4] transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#73726E]" />
            <span>Muat Turun SVG</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenTestForm(session.id);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-[#181716] rounded-xl hover:bg-[#2C2A28] transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-[#F59E0B]" />
            <span>Uji Buka Borang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
