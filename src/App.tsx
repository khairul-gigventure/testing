import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LiveWall } from './components/LiveWall';
import { ParticipantForm } from './components/ParticipantForm';
import { AdminDashboard } from './components/AdminDashboard';
import { ShareSessionModal } from './components/ShareSessionModal';
import { NewSessionModal } from './components/NewSessionModal';
import { storageService } from './services/storageService';
import { TrainingSession, FeedbackEntry } from './types';

export default function App() {
  // Ensure local storage demo dataset is initialized on mount
  useEffect(() => {
    storageService.init();
  }, []);

  const [sessions, setSessions] = useState<TrainingSession[]>(() => storageService.getSessions());
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>(() => storageService.getFeedbacks());

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'wall' | 'form' | 'admin'>('wall');

  // Selected session for filtering
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');

  // Admin PIN unlocked state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);

  // Unified Share Session Modal state (combines QR code and copy link)
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareSession, setShareSession] = useState<TrainingSession | null>(null);

  // New Session Modal state
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState<boolean>(false);

  // Session pre-selection for form
  const [formInitialSessionId, setFormInitialSessionId] = useState<string>('');

  // Live wall optimistic highlight for newly submitted feedback
  const [highlightedFeedbackId, setHighlightedFeedbackId] = useState<string | null>(null);

  // Handle URL query parameters (e.g. ?mode=form&session=SES-001)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    const sessionParam = urlParams.get('session');

    if (sessionParam) {
      setFormInitialSessionId(sessionParam);
      setSelectedSessionId(sessionParam);
    }

    if (modeParam === 'form') {
      setActiveTab('form');
    } else if (modeParam === 'admin') {
      setActiveTab('admin');
    }
  }, []);

  const handleRefreshData = () => {
    setSessions(storageService.getSessions());
    setFeedbacks(storageService.getFeedbacks());
  };

  const handleOpenShare = (session?: TrainingSession) => {
    const targetSession = session || sessions.find(s => s.id === selectedSessionId) || sessions[0];
    setShareSession(targetSession || null);
    setIsShareModalOpen(true);
  };

  const handleOpenTestForm = (sessionId: string) => {
    setFormInitialSessionId(sessionId);
    setActiveTab('form');
  };

  const handleSessionCreated = (newSession: TrainingSession) => {
    handleRefreshData();
    setSelectedSessionId(newSession.id);
    setShareSession(newSession);
    setIsShareModalOpen(true);
  };

  const handleFeedbackSubmitted = (newEntry: FeedbackEntry) => {
    handleRefreshData();
    setHighlightedFeedbackId(newEntry.id);
  };

  const handleNavigateToWall = (newEntryId?: string) => {
    if (newEntryId) {
      setHighlightedFeedbackId(newEntryId);
      setTimeout(() => setHighlightedFeedbackId(null), 8000);
    }
    setActiveTab('wall');
  };

  const pendingModerationCount = feedbacks.filter(f => f.status === 'hidden').length;

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#17212B] flex flex-col selection:bg-[#E2E6EB] selection:text-[#17212B]">
      {/* Clean 3-zone Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminUnlocked={isAdminUnlocked}
        onOpenShare={() => handleOpenShare()}
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        onSelectSession={setSelectedSessionId}
        pendingModerationCount={pendingModerationCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {activeTab === 'wall' && (
          <LiveWall
            feedbacks={feedbacks}
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
            onOpenShare={() => handleOpenShare()}
            onOpenForm={() => setActiveTab('form')}
            highlightedFeedbackId={highlightedFeedbackId}
          />
        )}

        {activeTab === 'form' && (
          <ParticipantForm
            sessions={sessions}
            initialSessionId={formInitialSessionId || (selectedSessionId !== 'all' ? selectedSessionId : sessions[0]?.id)}
            onFeedbackSubmitted={handleFeedbackSubmitted}
            onNavigateToWall={handleNavigateToWall}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            sessions={sessions}
            feedbacks={feedbacks}
            selectedSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
            onOpenNewSession={() => setIsNewSessionModalOpen(true)}
            onOpenQR={s => handleOpenShare(s)}
            onRefreshData={handleRefreshData}
            isAdminUnlocked={isAdminUnlocked}
            setIsAdminUnlocked={setIsAdminUnlocked}
          />
        )}
      </main>

      {/* Unified Share Session Panel (QR + Link) */}
      <ShareSessionModal
        session={shareSession}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onOpenTestForm={handleOpenTestForm}
      />

      {/* New Session Creation Modal */}
      <NewSessionModal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        onCreateSession={data => storageService.createSession(data)}
        onSessionCreated={handleSessionCreated}
      />
    </div>
  );
}
