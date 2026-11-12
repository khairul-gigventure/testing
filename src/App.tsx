import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LiveWall } from './components/LiveWall';
import { ParticipantForm } from './components/ParticipantForm';
import { AdminDashboard } from './components/AdminDashboard';
import { QRCodeModal } from './components/QRCodeModal';
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

  // QR Modal state
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [qrSession, setQrSession] = useState<TrainingSession | null>(null);

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

  const handleOpenQR = (session?: TrainingSession) => {
    const targetSession = session || sessions.find(s => s.id === selectedSessionId) || sessions[0];
    setQrSession(targetSession || null);
    setIsQRModalOpen(true);
  };

  const handleOpenTestForm = (sessionId: string) => {
    setFormInitialSessionId(sessionId);
    setActiveTab('form');
  };

  const handleSessionCreated = (newSession: TrainingSession) => {
    handleRefreshData();
    setSelectedSessionId(newSession.id);
    setQrSession(newSession);
    setIsQRModalOpen(true);
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

  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];
  const pendingModerationCount = feedbacks.filter(f => f.status === 'hidden').length;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#181716] flex flex-col selection:bg-[#EFEFEA] selection:text-[#181716]">
      {/* Top Navigation Bar with Quick Actions and Moderation Alerts */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminUnlocked={isAdminUnlocked}
        onOpenQR={() => handleOpenQR()}
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        onSelectSession={setSelectedSessionId}
        pendingModerationCount={pendingModerationCount}
      />

      {/* Main Content Area Based on Active Tab */}
      <main className="flex-1">
        {activeTab === 'wall' && (
          <LiveWall
            feedbacks={feedbacks}
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
            onOpenQR={() => handleOpenQR()}
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
            onOpenQR={s => handleOpenQR(s)}
            onRefreshData={handleRefreshData}
            isAdminUnlocked={isAdminUnlocked}
            setIsAdminUnlocked={setIsAdminUnlocked}
          />
        )}
      </main>

      {/* QR Code Modal */}
      <QRCodeModal
        session={qrSession}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
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
