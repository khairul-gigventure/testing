import React, { useState } from 'react';
import { ChevronDown, Share2, Check } from 'lucide-react';
import { TrainingSession } from '../types';

interface NavbarProps {
  activeTab: 'wall' | 'form' | 'admin';
  setActiveTab: (tab: 'wall' | 'form' | 'admin') => void;
  isAdminUnlocked: boolean;
  onOpenShare: () => void;
  sessions: TrainingSession[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  pendingModerationCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenShare,
  sessions,
  selectedSessionId,
  onSelectSession,
  pendingModerationCount = 0,
}) => {
  const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState<boolean>(false);

  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E6EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Header Bar: Exactly 3 Zones */}
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Zone 1: Simple Wordmark (Left) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('wall')}
              className="text-lg font-semibold tracking-tight text-[#17212B] hover:opacity-85 transition-opacity flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-md bg-[#2457E7] text-white flex items-center justify-center text-xs font-bold">
                K
              </span>
              <span>KelasPulse</span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Center, hidden on very small mobile, shown on md) */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('wall')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'wall'
                  ? 'bg-[#F6F7F9] text-[#2457E7]'
                  : 'text-[#596579] hover:text-[#17212B]'
              }`}
            >
              Live Wall
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'form'
                  ? 'bg-[#F6F7F9] text-[#2457E7]'
                  : 'text-[#596579] hover:text-[#17212B]'
              }`}
            >
              Borang
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-[#F6F7F9] text-[#2457E7]'
                  : 'text-[#596579] hover:text-[#17212B]'
              }`}
            >
              <span>Analitik</span>
              {pendingModerationCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#E5484D]" title={`${pendingModerationCount} maklum balas memerlukan semakan`} />
              )}
            </button>
          </nav>

          {/* Zone 3: Session Selector & Single Primary Action (Right) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Session Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSessionDropdownOpen(!isSessionDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-[#F6F7F9] hover:bg-[#EAEFF4] border border-[#E2E6EB] rounded-lg text-xs font-medium text-[#17212B] transition-colors"
                title="Tukar sesi latihan"
                aria-expanded={isSessionDropdownOpen}
              >
                <span className="truncate max-w-[110px] sm:max-w-[160px]">
                  {selectedSessionId === 'all'
                    ? 'Semua sesi'
                    : activeSession ? activeSession.title : 'Pilih sesi'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#596579] shrink-0" />
              </button>

              {isSessionDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSessionDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-md border border-[#E2E6EB] p-1.5 z-50 text-left">
                    <div className="px-2.5 py-1 text-[11px] font-medium text-[#596579]">
                      Pilih sesi aktif
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSession('all');
                        setIsSessionDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        selectedSessionId === 'all'
                          ? 'bg-[#F6F7F9] text-[#2457E7] font-semibold'
                          : 'text-[#17212B] hover:bg-[#F6F7F9]'
                      }`}
                    >
                      <span>Semua sesi</span>
                      {selectedSessionId === 'all' && <Check className="w-3.5 h-3.5 text-[#2457E7]" />}
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
                            ? 'bg-[#F6F7F9] text-[#2457E7] font-semibold'
                            : 'text-[#17212B] hover:bg-[#F6F7F9]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate">{s.title}</p>
                          <p className="text-[11px] text-[#596579]">{s.date}</p>
                        </div>
                        {selectedSessionId === s.id && <Check className="w-3.5 h-3.5 text-[#2457E7] shrink-0" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Single Primary Action: Kongsi Sesi */}
            <button
              type="button"
              onClick={onOpenShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-[#2457E7] hover:bg-[#1D46BE] rounded-lg transition-colors shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kongsi sesi</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row (ensures clean 390px layout without overflow) */}
        <nav className="flex md:hidden items-center justify-around py-2 border-t border-[#E2E6EB] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('wall')}
            className={`py-1 px-3 rounded-md font-medium transition-colors ${
              activeTab === 'wall'
                ? 'bg-[#F6F7F9] text-[#2457E7]'
                : 'text-[#596579]'
            }`}
          >
            Live Wall
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`py-1 px-3 rounded-md font-medium transition-colors ${
              activeTab === 'form'
                ? 'bg-[#F6F7F9] text-[#2457E7]'
                : 'text-[#596579]'
            }`}
          >
            Borang
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-1 px-3 rounded-md font-medium transition-colors inline-flex items-center gap-1 ${
              activeTab === 'admin'
                ? 'bg-[#F6F7F9] text-[#2457E7]'
                : 'text-[#596579]'
            }`}
          >
            <span>Analitik</span>
            {pendingModerationCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
