import React, { useState, useEffect } from 'react';
import {
  Star, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, RefreshCw,
  Check, Shield, User, Clock, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TrainingSession, FeedbackEntry, DemoProfile } from '../types';
import { DEMO_PROFILES, storageService } from '../services/storageService';
import { aiService } from '../services/aiService';

interface ParticipantFormProps {
  sessions: TrainingSession[];
  initialSessionId?: string;
  onFeedbackSubmitted: (entry: FeedbackEntry) => void;
  onNavigateToWall: (newEntryId?: string) => void;
}

const RATING_EMOTIONS: Record<number, string> = {
  1: 'Kurang Memuaskan',
  2: 'Perlu Penambahbaikan',
  3: 'Sederhana',
  4: 'Bagus & Jelas',
  5: 'Cemerlang & Amat Bermanfaat',
};

const SUGGESTED_TOPICS = [
  'Prompt Engineering Berstruktur',
  'Penggunaan Model Multimodal',
  'Automasi Tugasan Pejabat',
  'Etika & Keselamatan AI',
  'Integrasi API Pantas',
];

export const ParticipantForm: React.FC<ParticipantFormProps> = ({
  sessions,
  initialSessionId,
  onFeedbackSubmitted,
  onNavigateToWall,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialSessionId || (sessions[0]?.id || '')
  );

  useEffect(() => {
    if (initialSessionId && sessions.some(s => s.id === initialSessionId)) {
      setSelectedSessionId(initialSessionId);
    }
  }, [initialSessionId, sessions]);

  // Stepper state: 1, 2, 3 or full view
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isFullView, setIsFullView] = useState<boolean>(false);

  // Identity state (FR-002)
  const [identityMode, setIdentityMode] = useState<'google' | 'anonymous'>('google');
  const [selectedProfile, setSelectedProfile] = useState<DemoProfile>(DEMO_PROFILES[0]);
  const [customName, setCustomName] = useState<string>('');
  const [isUsingCustomName, setIsUsingCustomName] = useState<boolean>(false);

  // Form input states (FR-003)
  const [ratingOverall, setRatingOverall] = useState<number>(5);
  const [ratingContent, setRatingContent] = useState<number>(5);
  const [ratingDelivery, setRatingDelivery] = useState<number>(5);
  const [npsScore, setNpsScore] = useState<number | null>(10);
  const [keyTakeaway, setKeyTakeaway] = useState<string>('');
  const [improvementSuggestion, setImprovementSuggestion] = useState<string>('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastSubmittedEntry, setLastSubmittedEntry] = useState<FeedbackEntry | null>(null);

  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = { ...errors };

    if (step === 1) {
      if (!selectedSessionId) newErrors.session = 'Sila pilih sesi kelas latihan.';
      else delete newErrors.session;

      if (!ratingOverall) newErrors.ratingOverall = 'Sila pilih tahap kepuasan.';
      else delete newErrors.ratingOverall;

      if (!ratingContent) newErrors.ratingContent = 'Sila pilih tahap kefahaman kandungan.';
      else delete newErrors.ratingContent;

      if (!ratingDelivery) newErrors.ratingDelivery = 'Sila pilih penilaian penyampaian.';
      else delete newErrors.ratingDelivery;
    }

    if (step === 2) {
      if (npsScore === null || npsScore < 1 || npsScore > 10) {
        newErrors.npsScore = 'Sila pilih skor kesetiaan/cadangan (1–10).';
      } else {
        delete newErrors.npsScore;
      }
    }

    if (step === 3) {
      if (!keyTakeaway.trim()) {
        newErrors.keyTakeaway = 'Sila nyatakan perkara bermanfaat yang anda pelajari.';
      } else if (keyTakeaway.trim().length < 5) {
        newErrors.keyTakeaway = 'Maklum balas sekurang-kurangnya 5 aksara.';
      } else {
        delete newErrors.keyTakeaway;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAppendTopic = (topic: string) => {
    if (keyTakeaway.includes(topic)) return;
    setKeyTakeaway(prev => (prev ? `${prev.trim()}, ${topic}` : topic));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const moderation = await aiService.moderateContent(keyTakeaway, improvementSuggestion);

      const isAnon = identityMode === 'anonymous';
      let authorName = 'Anonymous';
      let authorEmail: string | undefined = undefined;
      let authorAvatar: string | undefined = undefined;

      if (!isAnon) {
        if (isUsingCustomName && customName.trim()) {
          authorName = customName.trim();
        } else {
          authorName = selectedProfile.name;
          authorEmail = selectedProfile.email;
          authorAvatar = selectedProfile.avatar;
        }
      }

      const newEntry = storageService.addFeedback({
        sessionId: selectedSessionId,
        isAnonymous: isAnon,
        authorName,
        authorEmail,
        authorAvatar,
        ratingOverall,
        ratingContent,
        ratingDelivery,
        npsScore: npsScore!,
        keyTakeaway: keyTakeaway.trim(),
        improvementSuggestion: improvementSuggestion.trim() || undefined,
        sentiment: moderation.sentiment,
        status: moderation.isSafe ? 'approved' : 'hidden',
        aiFlagReason: moderation.isSafe ? undefined : moderation.reason,
      });

      if (moderation.isSafe) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      }

      setLastSubmittedEntry(newEntry);
      setIsSubmitted(true);
      onFeedbackSubmitted(newEntry);
    } catch (err) {
      console.error('Submission failed:', err);
      setErrors({ form: 'Ralat semasa menghantar maklum balas. Sila cuba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setKeyTakeaway('');
    setImprovementSuggestion('');
    setRatingOverall(5);
    setRatingContent(5);
    setRatingDelivery(5);
    setNpsScore(10);
    setErrors({});
    setCurrentStep(1);
    setIsSubmitted(false);
    setLastSubmittedEntry(null);
  };

  const renderStarInput = (
    value: number,
    onChange: (val: number) => void,
    error?: string
  ) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              type="button"
              key={star}
              onClick={() => onChange(star)}
              className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[#F3F3EE] active:scale-95 transition-all focus:outline-none"
              aria-label={`${star} daripada 5 bintang`}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= value
                    ? 'text-[#D97706] fill-[#D97706]'
                    : 'text-[#DCDAD4] hover:text-[#F59E0B]'
                }`}
              />
            </button>
          ))}
          <div className="flex items-center gap-2 ml-2 text-xs">
            <span className="font-tabular font-bold text-sm text-[#181716]">
              {value}.0★
            </span>
            <span className="text-[#B45309] font-medium hidden sm:inline">
              ({RATING_EMOTIONS[value] || ''})
            </span>
          </div>
        </div>
        <p className="text-[11px] text-[#B45309] font-medium sm:hidden">
          {RATING_EMOTIONS[value] || ''}
        </p>
        {error && (
          <p className="text-xs text-[#DC2626] mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="py-8 sm:py-12 px-4 max-w-2xl mx-auto">
      {/* Session Breadcrumb & Header Card */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-[#73726E] mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#181716]">Borang Penilaian Kursus</span>
            <span aria-hidden="true">·</span>
            <span>{currentSession?.date}</span>
          </div>
          <div className="flex items-center gap-1 text-[#73726E]">
            <Clock className="w-3.5 h-3.5" />
            <span>Masa: &lt; 1 minit</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[#181716] tracking-tight">
          {currentSession?.title}
        </h1>

        {currentSession?.instructor && (
          <p className="text-xs text-[#73726E] mt-1">
            Tenaga Pengajar: <span className="text-[#181716] font-medium">{currentSession.instructor}</span>
          </p>
        )}

        {/* Multi-session selector */}
        {sessions.length > 1 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#73726E]">
            <label htmlFor="session-switcher">Tukar Sesi:</label>
            <select
              id="session-switcher"
              value={selectedSessionId}
              onChange={e => setSelectedSessionId(e.target.value)}
              className="bg-white border border-[#DCDAD4] text-[#181716] rounded-lg px-2.5 py-1 text-xs focus:outline-none font-medium cursor-pointer"
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.date})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 sm:p-8 shadow-xs">
        {isSubmitted && lastSubmittedEntry ? (
          /* Thank You State */
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#181716]">
                Maklum Balas Berjaya Diterima!
              </h2>
              <p className="text-xs sm:text-sm text-[#73726E] mt-1.5 max-w-md mx-auto">
                Terima kasih atas pandangan anda bagi sesi{' '}
                <span className="font-semibold text-[#181716]">{currentSession?.title}</span>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E8E6E1] text-xs text-left max-w-md mx-auto space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#181716]">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <span>
                  {lastSubmittedEntry.status === 'approved'
                    ? 'Disahkan Selamat oleh Saringan AI'
                    : 'Disimpan dalam Senarai Semakan Trainer'}
                </span>
              </div>
              <p className="text-[#73726E] leading-relaxed text-[11px] pt-0.5">
                {lastSubmittedEntry.status === 'approved'
                  ? 'Komen anda mematuhi etika bengkel dan dipaparkan di Dinding Langsung sekarang.'
                  : (lastSubmittedEntry.aiFlagReason || 'Disimpan untuk semakan oleh trainer.')}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => onNavigateToWall(lastSubmittedEntry.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#181716] text-white text-xs sm:text-sm font-bold hover:bg-[#2C2A28] transition-colors shadow-xs"
              >
                <span>Lihat di Dinding Langsung</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white border border-[#DCDAD4] text-[#181716] text-xs sm:text-sm font-semibold hover:bg-[#F7F7F4] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#73726E]" />
                <span>Hantar Komen Baharu</span>
              </button>
            </div>
          </div>
        ) : (
          /* Feedback Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stepper Progress Bar Header */}
            <div className="pb-4 border-b border-[#F0EFEA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-tabular font-bold ${
                    currentStep === 1 ? 'bg-[#181716] text-white' : currentStep > 1 ? 'bg-[#16A34A] text-white' : 'bg-[#EFEFEA] text-[#73726E]'
                  }`}>
                    1
                  </span>
                  <span className="text-xs font-semibold text-[#181716] hidden sm:inline">Penilaian</span>
                </div>
                <span className="text-[#DCDAD4]">―</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-tabular font-bold ${
                    currentStep === 2 ? 'bg-[#181716] text-white' : currentStep > 2 ? 'bg-[#16A34A] text-white' : 'bg-[#EFEFEA] text-[#73726E]'
                  }`}>
                    2
                  </span>
                  <span className="text-xs font-semibold text-[#181716] hidden sm:inline">Skor NPS</span>
                </div>
                <span className="text-[#DCDAD4]">―</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-tabular font-bold ${
                    currentStep === 3 ? 'bg-[#181716] text-white' : 'bg-[#EFEFEA] text-[#73726E]'
                  }`}>
                    3
                  </span>
                  <span className="text-xs font-semibold text-[#181716] hidden sm:inline">Refleksi</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullView(!isFullView)}
                className="text-[11px] text-[#73726E] hover:text-[#181716] underline underline-offset-2 font-medium"
              >
                {isFullView ? 'Mod Bertingkat' : 'Borang Penuh'}
              </button>
            </div>

            {/* STEP 1: IDENTITY & 3 STAR RATINGS */}
            {(isFullView || currentStep === 1) && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Identity Mode (FR-002) */}
                <fieldset className="space-y-3">
                  <legend className="text-xs font-bold text-[#181716]">
                    Identiti Peserta
                  </legend>

                  {/* Segmented Identity Control */}
                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#F5F4F0] rounded-xl border border-[#E0DED7]">
                    <button
                      type="button"
                      onClick={() => setIdentityMode('google')}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        identityMode === 'google'
                          ? 'bg-white text-[#181716] font-bold shadow-xs'
                          : 'text-[#73726E] hover:text-[#181716]'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Log Masuk Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIdentityMode('anonymous')}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        identityMode === 'anonymous'
                          ? 'bg-white text-[#181716] font-bold shadow-xs'
                          : 'text-[#73726E] hover:text-[#181716]'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Tanpa Nama (Anonymous)</span>
                    </button>
                  </div>

                  {/* Profile Picker */}
                  {identityMode === 'google' && (
                    <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E8E6E1] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#181716]">
                          Pilih Profil Peserta:
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsUsingCustomName(!isUsingCustomName)}
                          className="text-[#73726E] hover:text-[#181716] underline underline-offset-2 font-medium"
                        >
                          {isUsingCustomName ? 'Guna profil sedia ada' : '+ Taip nama sendiri'}
                        </button>
                      </div>

                      {!isUsingCustomName ? (
                        <div className="grid grid-cols-3 gap-2">
                          {DEMO_PROFILES.map(prof => (
                            <button
                              type="button"
                              key={prof.id}
                              onClick={() => setSelectedProfile(prof)}
                              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center ${
                                selectedProfile.id === prof.id
                                  ? 'bg-white border-[#181716] ring-1 ring-[#181716] shadow-xs'
                                  : 'bg-white border-[#E8E6E1] hover:border-[#B5B3AD]'
                              }`}
                            >
                              <img
                                src={prof.avatar}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-full object-cover mb-1.5 bg-[#F5F4F0]"
                              />
                              <span className="font-semibold text-xs text-[#181716] truncate w-full">
                                {prof.name}
                              </span>
                              {selectedProfile.id === prof.id && (
                                <Check className="w-3 h-3 text-[#181716] mt-0.5" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <input
                            type="text"
                            placeholder="Nama penuh anda..."
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            className="w-full bg-white px-3 py-2 rounded-lg border border-[#DCDAD4] text-xs focus:outline-none focus:border-[#181716]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {identityMode === 'anonymous' && (
                    <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E8E6E1] text-xs text-[#73726E] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>Privasi penuh. Maklum balas anda direkodkan sebagai “Anonymous” tanpa menyimpan emel atau nama.</span>
                    </div>
                  )}
                </fieldset>

                {/* 3 Star Ratings with Emotion Labels */}
                <div className="space-y-5 pt-3 border-t border-[#F0EFEA]">
                  <div>
                    <label className="text-xs font-bold text-[#181716] block mb-0.5">
                      1. Kepuasan Keseluruhan Bengkel <span className="text-[#DC2626]">*</span>
                    </label>
                    <p className="text-xs text-[#73726E] mb-2">
                      Sejauh mana bengkel ini menepati objektif pembelajaran anda?
                    </p>
                    {renderStarInput(ratingOverall, setRatingOverall, errors.ratingOverall)}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#181716] block mb-0.5">
                      2. Kefahaman Kandungan & Modul <span className="text-[#DC2626]">*</span>
                    </label>
                    <p className="text-xs text-[#73726E] mb-2">
                      Tahap kejelasan slaid, contoh praktikal, dan latihan amali.
                    </p>
                    {renderStarInput(ratingContent, setRatingContent, errors.ratingContent)}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#181716] block mb-0.5">
                      3. Gaya Penyampaian Trainer <span className="text-[#DC2626]">*</span>
                    </label>
                    <p className="text-xs text-[#73726E] mb-2">
                      Kelancaran penerangan, interaksi kelas, dan bimbingan hands-on.
                    </p>
                    {renderStarInput(ratingDelivery, setRatingDelivery, errors.ratingDelivery)}
                  </div>
                </div>

                {!isFullView && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full py-3 px-4 rounded-xl bg-[#181716] hover:bg-[#2C2A28] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>Seterusnya: Skor Cadangan (NPS)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: NPS 1-10 SCALE */}
            {(isFullView || currentStep === 2) && (
              <div className={`space-y-4 animate-in fade-in duration-150 ${isFullView ? 'pt-4 border-t border-[#F0EFEA]' : ''}`}>
                <div>
                  <label className="text-xs font-bold text-[#181716] block mb-0.5">
                    4. Skor Kesetiaan & Cadangan (NPS) <span className="text-[#DC2626]">*</span>
                  </label>
                  <p className="text-xs text-[#73726E] mb-3">
                    “Sejauh manakah anda bersedia mengesyorkan kelas ini kepada rakan sekerja atau kenalan?”
                  </p>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
                      const isSelected = npsScore === score;
                      const isDetractor = score <= 6;
                      const isPassive = score === 7 || score === 8;
                      const isPromoter = score >= 9;

                      return (
                        <button
                          type="button"
                          key={score}
                          onClick={() => setNpsScore(score)}
                          className={`h-12 text-sm font-tabular font-bold rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-[#181716] text-white border-[#181716] shadow-xs'
                              : isPromoter
                              ? 'bg-white text-[#15803D] border-[#BBF7D0] hover:bg-[#F0FDF4]'
                              : isPassive
                              ? 'bg-white text-[#D97706] border-[#FDE68A] hover:bg-[#FFFBEB]'
                              : 'bg-white text-[#73726E] border-[#E8E6E1] hover:bg-[#FAFAF8]'
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[11px] text-[#73726E] mt-2 font-medium">
                    <span>1: Kurang Mengesyorkan</span>
                    <span>10: Sangat Mengesyorkan</span>
                  </div>

                  {errors.npsScore && (
                    <p className="text-xs text-[#DC2626] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.npsScore}</span>
                    </p>
                  )}
                </div>

                {!isFullView && (
                  <div className="pt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="py-3 px-4 rounded-xl bg-white border border-[#DCDAD4] text-[#181716] font-semibold text-xs sm:text-sm hover:bg-[#F7F7F4] transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#181716] hover:bg-[#2C2A28] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>Seterusnya: Refleksi Pembelajaran</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: OPEN QUESTIONS & SUBMIT */}
            {(isFullView || currentStep === 3) && (
              <div className={`space-y-5 animate-in fade-in duration-150 ${isFullView ? 'pt-4 border-t border-[#F0EFEA]' : ''}`}>
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label htmlFor="q1-takeaway" className="text-xs font-bold text-[#181716]">
                      5. Apakah satu konsep atau kemahiran paling bermanfaat yang anda pelajari? <span className="text-[#DC2626]">*</span>
                    </label>
                    <span className="text-[11px] text-[#73726E] font-tabular">
                      {keyTakeaway.length}/5 aksara min
                    </span>
                  </div>
                  <textarea
                    id="q1-takeaway"
                    rows={3}
                    placeholder="Contoh: Pemahaman mendalam tentang cara membina prompt berstruktur dan integrasi alat AI..."
                    value={keyTakeaway}
                    onChange={e => setKeyTakeaway(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#DCDAD4] focus:outline-none focus:border-[#181716] transition-colors placeholder:text-[#A1A09A]"
                  />

                  {/* Topic Inspiration Pills */}
                  <div className="mt-2 flex items-center flex-wrap gap-1.5">
                    <span className="text-[10px] text-[#73726E] font-medium mr-1">Cadangan Topik:</span>
                    {SUGGESTED_TOPICS.map(topic => (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => handleAppendTopic(topic)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#F5F4F0] hover:bg-[#EBE9E3] text-[#575653] border border-[#E0DED7] transition-colors"
                      >
                        + {topic}
                      </button>
                    ))}
                  </div>

                  {errors.keyTakeaway && (
                    <p className="text-xs text-[#DC2626] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.keyTakeaway}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="q2-improvement" className="text-xs font-bold text-[#181716] block mb-1">
                    6. Cadangan penambahbaikan untuk kelas akan datang? <span className="text-[#73726E] font-normal">(Pilihan)</span>
                  </label>
                  <textarea
                    id="q2-improvement"
                    rows={2}
                    placeholder="Contoh: Boleh peruntukkan masa hands-on tambahan untuk latihan projek..."
                    value={improvementSuggestion}
                    onChange={e => setImprovementSuggestion(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#DCDAD4] focus:outline-none focus:border-[#181716] transition-colors placeholder:text-[#A1A09A]"
                  />
                </div>

                {errors.form && (
                  <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.form}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  {!isFullView && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="py-3.5 px-4 rounded-xl bg-white border border-[#DCDAD4] text-[#181716] font-semibold text-xs sm:text-sm hover:bg-[#F7F7F4] transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-[#181716] hover:bg-[#2C2A28] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Menyaring dengan Gemini AI…</span>
                      </>
                    ) : (
                      <>
                        <span>Hantar Maklum Balas</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
