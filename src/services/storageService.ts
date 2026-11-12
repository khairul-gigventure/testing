import { TrainingSession, FeedbackEntry, AppSettings, DemoProfile, ExecutiveSummary } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'kelaspulse_sessions_v1',
  FEEDBACK: 'kelaspulse_feedback_v1',
  SETTINGS: 'kelaspulse_settings_v1',
};

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 'prof-1',
    name: 'Ahmad Danial',
    email: 'ahmad.danial@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'prof-2',
    name: 'Nurul Aisyah',
    email: 'aisyah.nurul@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'prof-3',
    name: 'Brandon Tan',
    email: 'brandon.tan@techventures.my',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
  },
];

const INITIAL_SESSIONS: TrainingSession[] = [
  {
    id: 'SES-001',
    title: 'Bengkel AI Produktiviti & Otomasi Aliran Kerja',
    date: '2026-11-15',
    instructor: 'Cikgu Hafiz / AI Studio Lead',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'SES-002',
    title: 'Masterclass Prompt Engineering & Gemini Enterprise',
    date: '2026-11-10',
    instructor: 'Dr. Zarith Sofia',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

const INITIAL_FEEDBACKS: FeedbackEntry[] = [
  // SES-001 feedbacks
  {
    id: 'FB-101',
    sessionId: 'SES-001',
    isAnonymous: false,
    authorName: 'Ahmad Danial',
    authorEmail: 'ahmad.danial@gmail.com',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    ratingOverall: 5,
    ratingContent: 5,
    ratingDelivery: 5,
    npsScore: 10,
    keyTakeaway: 'Cara bina custom workflow menggunakan Gemini API dan integrasi sistem sungguh praktikal. Jimat 4 jam kerja mingguan saya!',
    improvementSuggestion: 'Boleh buat sesi lanjutan untuk automasi database.',
    sentiment: 'Positive',
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
  },
  {
    id: 'FB-102',
    sessionId: 'SES-001',
    isAnonymous: true,
    authorName: 'Anonymous',
    ratingOverall: 5,
    ratingContent: 4,
    ratingDelivery: 5,
    npsScore: 9,
    keyTakeaway: 'Penerangan sangat mudah difahami walaupun saya tiada latar belakang koding. Demo live trainer sangat hidup!',
    improvementSuggestion: 'Boleh sediakan templat nota PDF lebih awal.',
    sentiment: 'Positive',
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 86400000 + 7200000).toISOString(),
  },
  {
    id: 'FB-103',
    sessionId: 'SES-001',
    isAnonymous: false,
    authorName: 'Nurul Aisyah',
    authorEmail: 'aisyah.nurul@gmail.com',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    ratingOverall: 5,
    ratingContent: 5,
    ratingDelivery: 5,
    npsScore: 10,
    keyTakeaway: 'Teknik structured prompt dan few-shot prompting membuka minda pasukan pemasaran kami.',
    improvementSuggestion: 'Masa hands-on 30 minit terasa singkat, mohon tambah 15 minit lagi.',
    sentiment: 'Positive',
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 86400000 + 10800000).toISOString(),
  },
  {
    id: 'FB-104',
    sessionId: 'SES-001',
    isAnonymous: true,
    authorName: 'Anonymous',
    ratingOverall: 4,
    ratingContent: 4,
    ratingDelivery: 4,
    npsScore: 8,
    keyTakeaway: 'Latihan praktikal sangat membantu untuk faham had limit model dan cara elak halusinasi.',
    improvementSuggestion: 'Bilik latihan sedikit sejuk, tapi isi pembelajaran A+!',
    sentiment: 'Neutral',
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 86400000 + 14400000).toISOString(),
  },
  {
    id: 'FB-105',
    sessionId: 'SES-001',
    isAnonymous: false,
    authorName: 'Brandon Tan',
    authorEmail: 'brandon.tan@techventures.my',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    ratingOverall: 5,
    ratingContent: 5,
    ratingDelivery: 5,
    npsScore: 10,
    keyTakeaway: 'Paling kagum dengan perkongsian prompt system instruction dan cara elak token membazir.',
    improvementSuggestion: 'Harap ada alumni support group di Telegram.',
    sentiment: 'Positive',
    status: 'approved',
    createdAt: new Date(Date.now() - 1 * 86400000 + 3600000).toISOString(),
  },
  {
    id: 'FB-106',
    sessionId: 'SES-001',
    isAnonymous: true,
    authorName: 'Anonymous',
    ratingOverall: 3,
    ratingContent: 3,
    ratingDelivery: 4,
    npsScore: 6,
    keyTakeaway: 'Bagus tapi kelajuan pacing agak cepat di bahagian API code demo.',
    improvementSuggestion: 'Perlu sediakan panduan langkah demi langkah yang lebih terperinci untuk beginner.',
    sentiment: 'Constructive',
    status: 'approved',
    createdAt: new Date(Date.now() - 1 * 86400000 + 7200000).toISOString(),
  },
  {
    id: 'FB-107',
    sessionId: 'SES-001',
    isAnonymous: true,
    authorName: 'Anonymous',
    ratingOverall: 1,
    ratingContent: 1,
    ratingDelivery: 1,
    npsScore: 1,
    keyTakeaway: 'Kelas bodoh sial scammer penipu semua buang duit je.',
    improvementSuggestion: 'Tutup kelas.',
    sentiment: 'Constructive',
    status: 'hidden',
    aiFlagReason: 'Ditahan oleh saringan AI: Mengandungi perkataan kesat dan serangan peribadi.',
    createdAt: new Date(Date.now() - 1 * 86400000 + 9000000).toISOString(),
  },

  // SES-002 feedbacks
  {
    id: 'FB-201',
    sessionId: 'SES-002',
    isAnonymous: false,
    authorName: 'Siti Sarah',
    authorEmail: 'sarah.siti@corp.my',
    ratingOverall: 5,
    ratingContent: 5,
    ratingDelivery: 5,
    npsScore: 10,
    keyTakeaway: 'Penerangan perbandingan model Gemini Flash vs Pro sangat jelas untuk perancangan kos korporat.',
    improvementSuggestion: 'Tiada, semua sempurna!',
    sentiment: 'Positive',
    status: 'approved',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'FB-202',
    sessionId: 'SES-002',
    isAnonymous: true,
    authorName: 'Anonymous',
    ratingOverall: 5,
    ratingContent: 5,
    ratingDelivery: 4,
    npsScore: 9,
    keyTakeaway: 'Hands-on exercise menyusun schema JSON sangat aplikatif untuk projek integrasi kami.',
    improvementSuggestion: 'Tambahkan contoh kod dalam Python juga selain TypeScript.',
    sentiment: 'Positive',
    status: 'approved',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'FB-203',
    sessionId: 'SES-002',
    isAnonymous: false,
    authorName: 'Mohd Firdaus',
    authorEmail: 'firdaus@startup.my',
    ratingOverall: 4,
    ratingContent: 5,
    ratingDelivery: 4,
    npsScore: 9,
    keyTakeaway: 'Kefahaman tentang context caching dan rate limits membuka jalan optimasi backend kami.',
    improvementSuggestion: 'Sediakan recording sesi untuk ulangkaji.',
    sentiment: 'Positive',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'FB-204',
    sessionId: 'SES-002',
    isAnonymous: true,
    authorName: 'Anonymous',
    ratingOverall: 4,
    ratingContent: 4,
    ratingDelivery: 5,
    npsScore: 8,
    keyTakeaway: 'Tenaga pengajar sangat berpengalaman dan menjawab setiap soalan teknikal dengan mendalam.',
    improvementSuggestion: 'Panjangkan sesi ke program 2 hari penuh.',
    sentiment: 'Positive',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString(),
  },
  {
    id: 'FB-205',
    sessionId: 'SES-002',
    isAnonymous: true,
    authorName: 'Anonymous',
    ratingOverall: 4,
    ratingContent: 4,
    ratingDelivery: 4,
    npsScore: 9,
    keyTakeaway: 'Contoh aplikasi sebenar dan live wall maklum balas ini sangat menarik dan interaktif!',
    improvementSuggestion: 'Kongsikan pautan slaid dalam format Google Drive.',
    sentiment: 'Positive',
    status: 'approved',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

const INITIAL_SETTINGS: AppSettings = {
  adminPin: '1234',
  savedSummaries: {
    'SES-001': {
      strengths: [
        'Kandungan modular dan praktikal membolehkan peserta terus mengaplikasikan automasi AI dalam tugas harian.',
        'Penyampaian trainer Cikgu Hafiz sangat bertenaga, interaktif, dan mudah difahami walaupun untuk audiens bukan teknikal.',
        'Skor NPS yang cemerlang (+71) dengan 83% peserta bertindak sebagai penganjur (Promoters) aktif.',
      ],
      improvements: [
        'Memberikan masa hands-on tambahan (sekurang-kurangnya 15–20 minit lagi) untuk latihan koding.',
        'Menyediakan templat panduan PDF serta senarai prompt sedia pakai sebelum kelas bermula.',
      ],
      conclusion: 'Bengkel AI Produktiviti & Otomasi Aliran Kerja berjaya mencapai impak pemahaman yang sangat tinggi. Peserta menunjukkan keyakinan tinggi untuk memanfaatkan alatan AI.',
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
      source: 'gemini_api',
    },
  },
};

export const storageService = {
  // Initialize storage if empty
  init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FEEDBACK)) {
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(INITIAL_FEEDBACKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
  },

  // Reset to initial demo dataset
  resetDemoData() {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(INITIAL_FEEDBACKS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  },

  // SESSIONS
  getSessions(): TrainingSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  },

  getSessionById(sessionId: string): TrainingSession | undefined {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId);
  },

  createSession(sessionData: Omit<TrainingSession, 'id' | 'createdAt'>): TrainingSession {
    const sessions = this.getSessions();
    const newId = `SES-${String(sessions.length + 1).padStart(3, '0')}`;
    const newSession: TrainingSession = {
      ...sessionData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    sessions.unshift(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return newSession;
  },

  deleteSession(sessionId: string): void {
    const sessions = this.getSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    // Cascade delete associated feedback entries (BR-005)
    const feedbacks = this.getFeedbacks().filter(f => f.sessionId !== sessionId);
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbacks));

    // Also remove any cached summary for this session
    const settings = this.getSettings();
    if (settings.savedSummaries && settings.savedSummaries[sessionId]) {
      delete settings.savedSummaries[sessionId];
      this.saveSettings(settings);
    }
  },

  // FEEDBACK
  getFeedbacks(sessionId?: string): FeedbackEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      const all: FeedbackEntry[] = data ? JSON.parse(data) : INITIAL_FEEDBACKS;
      if (sessionId && sessionId !== 'all') {
        return all.filter(f => f.sessionId === sessionId);
      }
      return all;
    } catch {
      return INITIAL_FEEDBACKS;
    }
  },

  getApprovedFeedbacks(sessionId?: string): FeedbackEntry[] {
    const list = this.getFeedbacks(sessionId);
    return list.filter(f => f.status === 'approved');
  },

  addFeedback(feedbackData: Omit<FeedbackEntry, 'id' | 'createdAt'>): FeedbackEntry {
    const all = this.getFeedbacks();
    const newId = `FB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const newEntry: FeedbackEntry = {
      ...feedbackData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(all));
    return newEntry;
  },

  updateFeedbackStatus(feedbackId: string, status: 'approved' | 'hidden'): void {
    const all = this.getFeedbacks();
    const item = all.find(f => f.id === feedbackId);
    if (item) {
      item.status = status;
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(all));
    }
  },

  // SETTINGS
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  saveSummary(sessionKey: string, summary: ExecutiveSummary): void {
    const settings = this.getSettings();
    settings.savedSummaries = settings.savedSummaries || {};
    settings.savedSummaries[sessionKey] = summary;
    this.saveSettings(settings);
  },

  getSavedSummary(sessionKey: string): ExecutiveSummary | undefined {
    const settings = this.getSettings();
    return settings.savedSummaries ? settings.savedSummaries[sessionKey] : undefined;
  },

  updatePin(newPin: string): void {
    const settings = this.getSettings();
    settings.adminPin = newPin;
    this.saveSettings(settings);
  },
};
