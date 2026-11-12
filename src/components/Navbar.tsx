import React, { useState } from 'react';
import { QrCode, Copy, Check, Radio, PenLine, BarChart3, ChevronDown } from 'lucide-react';
import { TrainingSession } from '../types';

interface NavbarProps {
  activeTab: 'wall' | 'form' | 'admin';
  setActiveTab: (tab: 'wall' | 'form' | 'admin') => void;
  isAdminUnlocked: boolean;
  onOpenQR: () => void;
  sessions: TrainingSession[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  pendingModerationCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminUnlocked,
  onOpenQR,
  sessions,
  selectedSessionId,
  onSelectSession,
  pendingModerationCount = 0,
}) => {
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState<boolean>(false);

  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  const handleQuickCopy = () => {
    if (!activeSession) return;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kelaspulse.ai';
    const targetUrl = `${baseUrl}/?session=${activeSession.id}&mode=form`;
    navigator.clipboard.writeText(targetUrl);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2200);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E8E6E1] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-4">
          {/* Brand Mark & Active Session Context */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#181716] flex items-center justify-center text-white shadow-xs">
                <svg className="w-4.5 h-4.5 text-[#F59E0B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h3l3-8 4 16 3-8h5" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-[#181716] leading-none">
                    KelasPulse
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#F5F4F0] text-[#73726E] rounded border border-[#E0DED7] uppercase font-tabular tracking-wider">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-[#73726E] font-medium block mt-0.5 tracking-normal">
                  Sistem Maklum Balas & Live Wall
                </span>
              </div>
            </div>

            {/* Session Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSessionDropdownOpen(!isSessionDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-[#F5F4F0] hover:bg-[#EBE9E3] border border-[#E0DED7] rounded-lg text-xs font-medium text-[#2B2A27] transition-colors"
                title="Tukar sesi latihan"
              >
                <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[180px] font-semibold text-[#181716]">
                  {activeSession ? activeSession.title : 'Semua Sesi Kelas'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#73726E] shrink-0" />
              </button>

              {isSessionDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSessionDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-[#E8E6E1] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-bold text-[#8C887B] uppercase tracking-wider">
                      Pilih Sesi Latihan
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSession('all');
                        setIsSessionDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        selectedSessionId === 'all'
                          ? 'bg-[#181716] text-white font-medium'
                          : 'text-[#181716] hover:bg-[#F5F4F0]'
                      }`}
                    >
                      <span>Keseluruhan Semua Sesi</span>
                      {selectedSessionId === 'all' && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                    </button>
                    {sessions.map(s => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          onSelectSession(s.id);
                          setIsSessionDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          selectedSessionId === s.id
                            ? 'bg-[#181716] text-white font-medium'
                            : 'text-[#181716] hover:bg-[#F5F4F0]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate">{s.title}</p>
                          <p className={`text-[10px] ${selectedSessionId === s.id ? 'text-[#C8C5BC]' : 'text-[#73726E]'}`}>{s.date}</p>
                        </div>
                        {selectedSessionId === s.id && <Check className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mode Switcher Tabs (Real SaaS Segmented Control) */}
          <nav className="flex items-center gap-1 p-1 bg-[#F5F4F0] rounded-xl border border-[#E0DED7]">
            <button
              onClick={() => setActiveTab('wall')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'wall'
                  ? 'bg-white text-[#181716] font-bold shadow-xs'
                  : 'text-[#73726E] hover:text-[#181716]'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${activeTab === 'wall' ? 'text-[#D97706]' : 'text-[#73726E]'}`} />
              <span>Dinding Langsung</span>
            </button>

            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'form'
                  ? 'bg-white text-[#181716] font-bold shadow-xs'
                  : 'text-[#73726E] hover:text-[#181716]'
              }`}
            >
              <PenLine className="w-3.5 h-3.5 text-[#575653]" />
              <span>Borang Peserta</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-white text-[#181716] font-bold shadow-xs'
                  : 'text-[#73726E] hover:text-[#181716]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#575653]" />
              <span>Papan Analitik</span>
              {pendingModerationCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white ml-0.5" title={`${pendingModerationCount} komen ditahan untuk semakan`} />
              )}
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleQuickCopy}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2B2A27] bg-[#F5F4F0] hover:bg-[#EBE9E3] border border-[#E0DED7] rounded-lg transition-colors shadow-2xs"
              title="Salin pautan borang peserta"
            >
              {copiedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span className="text-[#16A34A]">Pautan Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#73726E]" />
                  <span>Salin Pautan</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenQR}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#181716] hover:bg-[#2C2A28] active:bg-[#000000] rounded-lg transition-colors shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Kod QR Sesi</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
