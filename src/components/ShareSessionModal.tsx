import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TrainingSession } from '../types';

interface ShareSessionModalProps {
  session: TrainingSession | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTestForm?: (sessionId: string) => void;
}

export const ShareSessionModal: React.FC<ShareSessionModalProps> = ({
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
    const svgElement = document.getElementById('session-share-qr-svg');
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        className="bg-white rounded-xl max-w-md w-full border border-[#E2E6EB] overflow-hidden text-center shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E6EB] flex items-center justify-between text-left">
          <div>
            <h2 id="share-modal-title" className="text-base font-semibold text-[#17212B]">
              Kongsi sesi kepada peserta
            </h2>
            <p className="text-xs text-[#596579] mt-0.5 truncate max-w-[280px]">
              {session.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#596579] hover:text-[#17212B] rounded-lg hover:bg-[#F6F7F9] transition-colors"
            aria-label="Tutup panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-xl border border-[#E2E6EB] inline-block">
            <QRCodeSVG
              id="session-share-qr-svg"
              value={targetUrl}
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#17212B"
            />
          </div>

          <p className="text-xs text-[#596579] max-w-xs mx-auto leading-relaxed">
            Peserta boleh mengimbas kod QR ini dengan kamera telefon untuk terus membuka borang penilaian.
          </p>

          {/* Copy link box */}
          <div className="flex items-center gap-2 bg-[#F6F7F9] p-2 rounded-lg border border-[#E2E6EB] text-xs">
            <span className="text-[#596579] truncate flex-1 font-mono text-[12px] text-left px-1">
              {targetUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-[#2457E7] hover:bg-[#1D46BE] text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin pautan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#F6F7F9] border-t border-[#E2E6EB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <button
            onClick={handleDownloadSVG}
            className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 font-medium text-[#17212B] bg-white border border-[#E2E6EB] rounded-lg hover:bg-[#F6F7F9] transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#596579]" />
            <span>Muat turun SVG</span>
          </button>

          {onOpenTestForm && (
            <button
              onClick={() => {
                onClose();
                onOpenTestForm(session.id);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 font-medium text-[#2457E7] bg-white border border-[#E2E6EB] rounded-lg hover:bg-[#F6F7F9] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              <span>Buka borang</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
