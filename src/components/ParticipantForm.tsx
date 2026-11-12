import React, { useState, useEffect } from 'react';
import {
  Star, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, RefreshCw,
  User, Shield
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
  1: 'Kurang memuaskan',
  2: 'Perlu penambahbaikan',
  3: 'Sederhana',
  4: 'Bagus & jelas',
  5: 'Cemerlang & amat bermanfaat',
};

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

  // Stepper state: 1 (Rating & Identiti), 2 (NPS), 3 (Komen)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Identity state: 'demo' | 'custom' | 'anonymous'
  const [identityType, setIdentityType] = useState<'demo' | 'custom' | 'anonymous'>('demo');
  const [selectedDemoProfile, setSelectedDemoProfile] = useState<DemoProfile>(DEMO_PROFILES[0]);
  const [customName, setCustomName] = useState<string>('');
  const [isChangingIdentity, setIsChangingIdentity] = useState<boolean>(false);

  // Form inputs (FR-003)
  const [ratingOverall, setRatingOverall] = useState<number>(5);
  const [ratingContent, setRatingContent] = useState<number>(5);
  const [ratingDelivery, setRatingDelivery] = useState<number>(5);
  const [npsScore, setNpsScore] = useState<number | null>(10);
  const [keyTakeaway, setKeyTakeaway] = useState<string>('');
  const [improvementSuggestion, setImprovementSuggestion] = useState<string>('');

  // UI status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastSubmittedEntry, setLastSubmittedEntry] = useState<FeedbackEntry | null>(null);

  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = { ...errors };

    if (step === 1) {
      if (!selectedSessionId) newErrors.session = 'Sila pilih sesi latihan.';
      else delete newErrors.session;

      if (identityType === 'custom' && !customName.trim()) {
        newErrors.identity = 'Sila masukkan nama anda atau pilih "Tanpa nama".';
      } else {
        delete newErrors.identity;
      }

      if (!ratingOverall) newErrors.ratingOverall = 'Sila pilih penilaian kepuasan.';
      else delete newErrors.ratingOverall;

      if (!ratingContent) newErrors.ratingContent = 'Sila pilih penilaian kandungan.';
      else delete newErrors.ratingContent;

      if (!ratingDelivery) newErrors.ratingDelivery = 'Sila pilih penilaian penyampaian.';
      else delete newErrors.ratingDelivery;
    }

    if (step === 2) {
      if (npsScore === null || npsScore < 1 || npsScore > 10) {
        newErrors.npsScore = 'Sila pilih skor antara 1 hingga 10.';
      } else {
        delete newErrors.npsScore;
      }
    }

    if (step === 3) {
      if (!keyTakeaway.trim()) {
        newErrors.keyTakeaway = 'Sila nyatakan perkara bermanfaat yang anda pelajari.';
      } else if (keyTakeaway.trim().length < 5) {
        newErrors.keyTakeaway = 'Sila tulis sekurang-kurangnya 5 aksara.';
      } else {
        delete newErrors.keyTakeaway;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const moderation = await aiService.moderateContent(keyTakeaway, improvementSuggestion);

      const isAnon = identityType === 'anonymous';
      let authorName = 'Tanpa nama';
      let authorEmail: string | undefined = undefined;
      let authorAvatar: string | undefined = undefined;

      if (!isAnon) {
        if (identityType === 'custom' && customName.trim()) {
          authorName = customName.trim();
        } else {
          authorName = selectedDemoProfile.name;
          authorEmail = selectedDemoProfile.email;
          authorAvatar = selectedDemoProfile.avatar;
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
            particleCount: 50,
            spread: 50,
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
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              type="button"
              key={star}
              onClick={() => onChange(star)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[#F6F7F9] active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-[#2457E7]"
              aria-label={`${star} daripada 5 bintang`}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= value
                    ? 'text-[#D97706] fill-[#D97706]'
                    : 'text-[#D5DBE1] hover:text-[#D97706]'
                }`}
              />
            </button>
          ))}
          <div className="ml-2 text-xs">
            <span className="font-semibold text-sm text-[#17212B] font-tabular">
              {value}.0
            </span>
            <span className="text-[#596579] ml-1.5 hidden sm:inline">
              · {RATING_EMOTIONS[value] || ''}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#596579] sm:hidden">
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
    <div className="py-6 sm:py-10 px-4 max-w-[640px] mx-auto text-left">
      {/* Session Header */}
      <div className="mb-6 pb-4 border-b border-[#E2E6EB]">
        <span className="text-xs font-medium text-[#596579] block mb-1">
          Borang maklum balas bengkel
        </span>
        <h1 className="text-xl sm:text-2xl font-semibold text-[#17212B] tracking-tight">
          {currentSession?.title}
        </h1>
        {currentSession?.instructor && (
          <p className="text-xs text-[#596579] mt-1">
            Jurulatih: {currentSession.instructor}
          </p>
        )}

        {/* Session selector if multiple exist */}
        {sessions.length > 1 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#596579]">
            <label htmlFor="session-picker">Tukar sesi:</label>
            <select
              id="session-picker"
              value={selectedSessionId}
              onChange={e => setSelectedSessionId(e.target.value)}
              className="bg-white border border-[#E2E6EB] text-[#17212B] rounded-md px-2 py-1 text-xs focus:outline-none"
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

      {/* Main Single-Column Content */}
      <div className="bg-white rounded-xl border border-[#E2E6EB] p-5 sm:p-8">
        {isSubmitted && lastSubmittedEntry ? (
          /* Thank you state */
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#17212B]">
                Maklum balas berjaya dihantar
              </h2>
              <p className="text-xs sm:text-sm text-[#596579] mt-1 max-w-md mx-auto">
                Terima kasih atas pandangan anda untuk sesi{' '}
                <span className="font-medium text-[#17212B]">{currentSession?.title}</span>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F6F7F9] border border-[#E2E6EB] text-xs text-left max-w-md mx-auto space-y-1">
              <div className="font-medium text-[#17212B]">
                {lastSubmittedEntry.status === 'approved'
                  ? 'Komen diluluskan ke Dinding Langsung'
                  : 'Komen disimpan untuk semakan jurulatih'}
              </div>
              <p className="text-[#596579] text-xs leading-relaxed">
                {lastSubmittedEntry.status === 'approved'
                  ? 'Ulasan anda mematuhi etika bengkel dan dipaparkan pada skrin utama.'
                  : (lastSubmittedEntry.aiFlagReason || 'Disimpan dalam senarai moderasi.')}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateToWall(lastSubmittedEntry.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#2457E7] hover:bg-[#1D46BE] text-white text-sm font-medium transition-colors"
              >
                <span>Lihat di Live Wall</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white border border-[#E2E6EB] text-[#17212B] text-sm font-medium hover:bg-[#F6F7F9] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#596579]" />
                <span>Hantar maklum balas lain</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form with Light Progress Stepper */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lightweight Stepper */}
            <div className="pb-4 border-b border-[#E2E6EB] flex items-center justify-between text-xs text-[#596579]">
              <span className="font-medium text-[#17212B]">
                Langkah {currentStep} daripada 3 · {currentStep === 1 ? 'Penilaian' : currentStep === 2 ? 'Skor NPS' : 'Refleksi'}
              </span>
              <div className="flex gap-1">
                <span className={`w-6 h-1.5 rounded-full ${currentStep >= 1 ? 'bg-[#2457E7]' : 'bg-[#E2E6EB]'}`} />
                <span className={`w-6 h-1.5 rounded-full ${currentStep >= 2 ? 'bg-[#2457E7]' : 'bg-[#E2E6EB]'}`} />
                <span className={`w-6 h-1.5 rounded-full ${currentStep === 3 ? 'bg-[#2457E7]' : 'bg-[#E2E6EB]'}`} />
              </div>
            </div>

            {/* STEP 1: RATING & IDENTITI */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Identity Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#17212B]">
                      Identiti anda
                    </label>
                    {identityType !== 'anonymous' && !isChangingIdentity && (
                      <button
                        type="button"
                        onClick={() => setIsChangingIdentity(true)}
                        className="text-xs text-[#2457E7] hover:underline"
                      >
                        Tukar
                      </button>
                    )}
                  </div>

                  {!isChangingIdentity && identityType === 'demo' ? (
                    <div className="flex items-center gap-2.5 py-1 text-xs text-[#17212B]">
                      <img
                        src={selectedDemoProfile.avatar}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-[#E2E6EB]"
                      />
                      <span className="font-medium">{selectedDemoProfile.name}</span>
                      <span className="text-[#596579] text-[11px]">(Profil contoh)</span>
                    </div>
                  ) : !isChangingIdentity && identityType === 'custom' ? (
                    <div className="flex items-center gap-2 text-xs text-[#17212B]">
                      <User className="w-4 h-4 text-[#596579]" />
                      <span className="font-medium">{customName || 'Nama sendiri'}</span>
                    </div>
                  ) : !isChangingIdentity && identityType === 'anonymous' ? (
                    <div className="flex items-center gap-2 text-xs text-[#596579]">
                      <Shield className="w-4 h-4 text-[#16A34A]" />
                      <span>Tanpa nama</span>
                      <button
                        type="button"
                        onClick={() => setIsChangingIdentity(true)}
                        className="text-[#2457E7] hover:underline ml-1"
                      >
                        Tukar
                      </button>
                    </div>
                  ) : (
                    /* Changing identity options */
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F6F7F9] rounded-lg border border-[#E2E6EB] text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setIdentityType('demo');
                            setIsChangingIdentity(false);
                          }}
                          className={`py-1.5 px-2 rounded-md font-medium transition-colors ${
                            identityType === 'demo'
                              ? 'bg-white text-[#17212B] shadow-2xs font-semibold'
                              : 'text-[#596579]'
                          }`}
                        >
                          Profil contoh
                        </button>
                        <button
                          type="button"
                          onClick={() => setIdentityType('custom')}
                          className={`py-1.5 px-2 rounded-md font-medium transition-colors ${
                            identityType === 'custom'
                              ? 'bg-white text-[#17212B] shadow-2xs font-semibold'
                              : 'text-[#596579]'
                          }`}
                        >
                          Nama sendiri
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIdentityType('anonymous');
                            setIsChangingIdentity(false);
                          }}
                          className={`py-1.5 px-2 rounded-md font-medium transition-colors ${
                            identityType === 'anonymous'
                              ? 'bg-white text-[#17212B] shadow-2xs font-semibold'
                              : 'text-[#596579]'
                          }`}
                        >
                          Tanpa nama
                        </button>
                      </div>

                      {identityType === 'demo' && (
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {DEMO_PROFILES.map(prof => (
                            <button
                              type="button"
                              key={prof.id}
                              onClick={() => {
                                setSelectedDemoProfile(prof);
                                setIsChangingIdentity(false);
                              }}
                              className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                                selectedDemoProfile.id === prof.id
                                  ? 'border-[#2457E7] bg-[#F6F7F9]'
                                  : 'border-[#E2E6EB] hover:bg-[#F6F7F9]'
                              }`}
                            >
                              <img
                                src={prof.avatar}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                              <span className="text-xs truncate font-medium">{prof.name}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {identityType === 'custom' && (
                        <div className="pt-1">
                          <input
                            type="text"
                            placeholder="Taip nama anda..."
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-[#E2E6EB] focus:outline-none focus:border-[#2457E7]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {errors.identity && (
                    <p className="text-xs text-[#DC2626] mt-1">{errors.identity}</p>
                  )}
                </div>

                {/* Rating Questions */}
                <div className="space-y-6 pt-4 border-t border-[#E2E6EB]">
                  <div>
                    <label className="text-sm font-medium text-[#17212B] block mb-0.5">
                      1. Kepuasan keseluruhan bengkel <span className="text-[#DC2626]">*</span>
                    </label>
                    <p className="text-xs text-[#596579] mb-2">
                      Sejauh mana bengkel ini menepati objektif pembelajaran anda?
                    </p>
                    {renderStarInput(ratingOverall, setRatingOverall, errors.ratingOverall)}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#17212B] block mb-0.5">
                      2. Kefahaman kandungan & modul <span className="text-[#DC2626]">*</span>
                    </label>
                    <p className="text-xs text-[#596579] mb-2">
                      Kejelasan slaid, contoh praktikal, dan latihan amali.
                    </p>
                    {renderStarInput(ratingContent, setRatingContent, errors.ratingContent)}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#17212B] block mb-0.5">
                      3. Penyampaian jurulatih <span className="text-[#DC2626]">*</span>
                    </label>
                    <p className="text-xs text-[#596579] mb-2">
                      Gaya pengajaran, interaksi kelas, dan jawapan kepada soalan.
                    </p>
                    {renderStarInput(ratingDelivery, setRatingDelivery, errors.ratingDelivery)}
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-[#2457E7] hover:bg-[#1D46BE] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Seterusnya: Skor cadangan (NPS)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: NPS SCALE */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-[#17212B] block mb-0.5">
                    4. Skor cadangan kepada rakan sekerja (NPS) <span className="text-[#DC2626]">*</span>
                  </label>
                  <p className="text-xs text-[#596579] mb-4">
                    “Sejauh manakah anda bersedia mengesyorkan kelas ini kepada rakan sekerja atau kenalan?”
                  </p>

                  {/* 10 tactile buttons */}
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
                      const isSelected = npsScore === score;
                      return (
                        <button
                          type="button"
                          key={score}
                          onClick={() => setNpsScore(score)}
                          className={`min-h-[44px] text-sm font-semibold rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-[#2457E7] text-white border-[#2457E7]'
                              : 'bg-white text-[#17212B] border-[#E2E6EB] hover:bg-[#F6F7F9]'
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-xs text-[#596579] mt-2.5">
                    <span>1: Kurang mengesyorkan</span>
                    <span>10: Sangat mengesyorkan</span>
                  </div>

                  {errors.npsScore && (
                    <p className="text-xs text-[#DC2626] mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.npsScore}</span>
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="min-h-[44px] py-2.5 px-4 rounded-lg bg-white border border-[#E2E6EB] text-[#17212B] font-medium text-sm hover:bg-[#F6F7F9] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 min-h-[44px] py-2.5 px-4 rounded-lg bg-[#2457E7] hover:bg-[#1D46BE] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Seterusnya: Refleksi pembelajaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: OPEN QUESTIONS & SUBMIT */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label htmlFor="q1-takeaway" className="text-sm font-medium text-[#17212B]">
                      5. Apakah satu perkara paling bermanfaat yang anda pelajari? <span className="text-[#DC2626]">*</span>
                    </label>
                    <span className="text-xs text-[#596579] font-tabular">
                      {keyTakeaway.length}/5 aksara min
                    </span>
                  </div>
                  <textarea
                    id="q1-takeaway"
                    rows={4}
                    placeholder="Contoh: Pemahaman tentang cara membina prompt yang berstruktur dan integrasi alat AI..."
                    value={keyTakeaway}
                    onChange={e => setKeyTakeaway(e.target.value)}
                    className="w-full text-sm p-3.5 rounded-lg border border-[#E2E6EB] focus:outline-none focus:border-[#2457E7] transition-colors placeholder:text-[#A1A09A]"
                  />
                  {errors.keyTakeaway && (
                    <p className="text-xs text-[#DC2626] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.keyTakeaway}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="q2-improvement" className="text-sm font-medium text-[#17212B] block mb-1">
                    6. Cadangan penambahbaikan untuk kelas akan datang <span className="text-[#596579] text-xs font-normal">(pilihan)</span>
                  </label>
                  <textarea
                    id="q2-improvement"
                    rows={3}
                    placeholder="Contoh: Boleh tambahkan masa hands-on untuk latihan projek..."
                    value={improvementSuggestion}
                    onChange={e => setImprovementSuggestion(e.target.value)}
                    className="w-full text-sm p-3.5 rounded-lg border border-[#E2E6EB] focus:outline-none focus:border-[#2457E7] transition-colors placeholder:text-[#A1A09A]"
                  />
                </div>

                {errors.form && (
                  <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.form}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="min-h-[44px] py-2.5 px-4 rounded-lg bg-white border border-[#E2E6EB] text-[#17212B] font-medium text-sm hover:bg-[#F6F7F9] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 min-h-[44px] py-2.5 px-5 rounded-lg bg-[#2457E7] hover:bg-[#1D46BE] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Menyaring komen…</span>
                      </>
                    ) : (
                      <>
                        <span>Hantar maklum balas</span>
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
