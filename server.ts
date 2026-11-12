import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Fallback moderation logic for graceful degradation (offline or no key)
function fallbackModerate(text: string): { isSafe: boolean; sentiment: 'Positive' | 'Neutral' | 'Constructive'; reason: string } {
  const lower = text.toLowerCase();
  const prohibitedKeywords = [
    'bodoh', 'sial', 'babi', 'bangsat', 'pukimak', 'anjing', 'fuck', 'shit',
    'scam', 'penipu', 'spam', 'casino', 'judi', 'xxx', 'porno', 'viagra', 'hate'
  ];

  const found = prohibitedKeywords.find(word => lower.includes(word));
  if (found) {
    return {
      isSafe: false,
      sentiment: 'Constructive',
      reason: `Mengandungi perkataan atau kandungan sensitif/tidak sesuai ("${found}").`,
    };
  }

  // Sentiment heuristic
  const positiveWords = ['terbaik', 'hebat', 'faham', 'jelas', 'puas', 'mantap', 'suka', 'bermanfaat', 'bagus', 'good', 'great', 'awesome', 'excellent', 'helpful', 'love', 'easy', 'senang'];
  const constructiveWords = ['tingkatkan', 'lambat', 'laju', 'tambah', 'perbaiki', 'kurang', 'cadang', 'harap', 'slow', 'fast', 'more', 'improve', 'better', 'hard', 'susah'];

  let posCount = 0;
  let conCount = 0;

  for (const pw of positiveWords) {
    if (lower.includes(pw)) posCount++;
  }
  for (const cw of constructiveWords) {
    if (lower.includes(cw)) conCount++;
  }

  let sentiment: 'Positive' | 'Neutral' | 'Constructive' = 'Positive';
  if (conCount > posCount) {
    sentiment = 'Constructive';
  } else if (posCount === 0 && conCount === 0) {
    sentiment = 'Neutral';
  }

  return {
    isSafe: true,
    sentiment,
    reason: 'Kandungan selamat dan mematuhi etika bengkel.',
  };
}

// Fallback summary generation
function fallbackSummary(sessionTitle: string, feedbacks: any[]): {
  strengths: string[];
  improvements: string[];
  conclusion: string;
} {
  const count = feedbacks.length;
  if (count === 0) {
    return {
      strengths: ['Tiada maklum balas terkumpul lagi untuk sesi ini.'],
      improvements: ['Kongsikan pautan QR code kepada peserta untuk mula mengumpul maklum balas.'],
      conclusion: 'Sesi sedia untuk menerima penilaian pertama.',
    };
  }

  const avgOverall = (feedbacks.reduce((acc, f) => acc + (f.ratingOverall || 5), 0) / count).toFixed(1);
  const avgNps = (feedbacks.reduce((acc, f) => acc + (f.npsScore || 9), 0) / count).toFixed(1);

  // Extract takeaways
  const takeaways = feedbacks.map(f => f.keyTakeaway).filter(Boolean);
  const improvements = feedbacks.map(f => f.improvementSuggestion).filter(Boolean);

  return {
    strengths: [
      `Tahap kepuasan purata yang tinggi (${avgOverall}/5.0 bintang) menunjukkan penyampaian kelas amat dihargai.`,
      takeaways[0] ? `Peserta mendapat manfaat khusus berkaitan: "${takeaways[0].slice(0, 80)}..."` : 'Kandungan modul praktikal dan mudah diaplikasikan secara terus.',
      `Skor advokasi NPS yang kukuh (purata ${avgNps}/10) dengan majoriti peserta bersedia mengesyorkan program ini.`,
    ],
    improvements: improvements.length > 0 ? [
      improvements[0] ? `Cadangan peserta: "${improvements[0].slice(0, 90)}"` : 'Memberikan lebih banyak masa untuk sesi hands-on praktikal.',
      improvements[1] ? `Cadangan tambahan: "${improvements[1].slice(0, 90)}"` : 'Menyediakan nota rujukan atau templat siap guna selepas bengkel.',
    ] : [
      'Menyediakan lebih banyak masa untuk sesi soal jawab interaktif bersama trainer.',
      'Menambah kajian kes sebenar mengikut industri peserta.',
    ],
    conclusion: `Secara keseluruhannya, sesi "${sessionTitle}" mencapai objektif pembelajaran dengan sentimen majoriti yang sangat positif. Peserta menghargai kejelasan penyampaian dan kepraktisan alatan AI yang dikongsikan.`,
  };
}

// API Routes
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Moderation & Sentiment API
app.post('/api/moderate', async (req: Request, res: Response) => {
  try {
    const { q1Takeaway, q2Improvement } = req.body;
    const combinedText = `Soalan 1 (Perkara paling bermanfaat): ${q1Takeaway || ''}\nSoalan 2 (Cadangan penambahbaikan): ${q2Improvement || ''}`.trim();

    if (!combinedText) {
      return res.status(400).json({ error: 'Text is required for moderation' });
    }

    if (!genAI || !process.env.GEMINI_API_KEY) {
      const fallback = fallbackModerate(combinedText);
      return res.json({ ...fallback, source: 'rule_based_fallback' });
    }

    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an automated moderation and sentiment analysis assistant for a training workshop feedback system ("KelasPulse AI").
Analyze the following participant feedback in Bahasa Melayu / English:
---
${combinedText}
---
Rules:
1. "isSafe": boolean. Set to FALSE if there is vulgarity, hate speech, severe insults, spam, phishing, sexual explicit content, or malicious content. Set to TRUE for constructive criticism, genuine complaints about pace/venue, or positive praise.
2. "sentiment": must be one of "Positive", "Neutral", or "Constructive". If the user is giving constructive feedback/suggestions or pointing out issues politely, label as "Constructive".
3. "reason": A short 1-sentence explanation in Bahasa Melayu explaining the assessment.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isSafe: { type: Type.BOOLEAN, description: 'True if safe to display on live public wall, false if profanity/spam' },
              sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Constructive'] },
              reason: { type: Type.STRING, description: 'Short 1-sentence reasoning in Bahasa Melayu' },
            },
            required: ['isSafe', 'sentiment', 'reason'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        isSafe: typeof parsed.isSafe === 'boolean' ? parsed.isSafe : true,
        sentiment: parsed.sentiment || 'Positive',
        reason: parsed.reason || 'Komen selamat dan bersesuaian.',
        source: 'gemini_api',
      });
    } catch (aiErr) {
      console.warn('Gemini API call failed, falling back to rule-based analysis:', aiErr);
      const fallback = fallbackModerate(combinedText);
      return res.json({ ...fallback, source: 'rule_based_fallback' });
    }
  } catch (err: any) {
    console.error('Error in /api/moderate:', err);
    return res.status(500).json({ error: 'Internal moderation error', details: err.message });
  }
});

// AI Executive Summary API
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const { sessionTitle, feedbacks } = req.body;
    const safeFeedbacks = Array.isArray(feedbacks) ? feedbacks : [];

    if (!genAI || !process.env.GEMINI_API_KEY) {
      const fallback = fallbackSummary(sessionTitle || 'Semua Sesi', safeFeedbacks);
      return res.json({ ...fallback, source: 'statistical_fallback' });
    }

    try {
      const textSummary = safeFeedbacks.map((f: any, idx: number) => {
        return `[Peserta #${idx + 1} | Rating: ${f.ratingOverall}/5 | NPS: ${f.npsScore}/10]
- Perkara bermanfaat: ${f.keyTakeaway || '-'}
- Cadangan penambahbaikan: ${f.improvementSuggestion || '-'}`;
      }).join('\n\n');

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Bertindak sebagai Penganalisis Latihan & Pendidikan Eksekutif.
Berikut adalah himpunan maklum balas peserta bagi sesi latihan AI "${sessionTitle || 'Bengkel AI'}":
---
${textSummary}
---
Sila hasilkan rumusan eksekutif profesional dalam Bahasa Melayu:
1. "strengths": Array of exactly 3 bullet points menghuraikan kekuatan utama kelas berdasarkan komen peserta.
2. "improvements": Array of 2 to 3 actionable recommendations berdasarkan cadangan peserta.
3. "conclusion": 1-2 perenggan rumusan sentimen keseluruhan peserta dan tahap kejayaan sesi.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 Kekuatan Utama Kelas',
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 Cadangan Penambahbaikan',
              },
              conclusion: {
                type: Type.STRING,
                description: 'Rumusan Sentimen & Kesimpulan Keseluruhan Peserta',
              },
            },
            required: ['strengths', 'improvements', 'conclusion'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        conclusion: parsed.conclusion || '',
        source: 'gemini_api',
      });
    } catch (aiErr) {
      console.warn('Gemini summary failed, falling back to smart heuristic:', aiErr);
      const fallback = fallbackSummary(sessionTitle || 'Semua Sesi', safeFeedbacks);
      return res.json({ ...fallback, source: 'statistical_fallback' });
    }
  } catch (err: any) {
    console.error('Error in /api/summarize:', err);
    return res.status(500).json({ error: 'Internal summary error', details: err.message });
  }
});

// Setup Vite dev server or static file serving
async function startServer() {
  const server = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`KelasPulse AI server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
