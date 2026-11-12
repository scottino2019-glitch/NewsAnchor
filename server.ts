import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { translate } from 'google-translate-api-x';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Helper for language code normalization (e.g. "it-IT" -> "it", "en-US" -> "en")
const getTtsLangCode = (rawLang: string = 'it-IT') => {
  const l = (rawLang || '').toLowerCase().trim();
  if (l.startsWith('it')) return 'it';
  if (l.startsWith('en')) return 'en';
  if (l.startsWith('fr')) return 'fr';
  if (l.startsWith('es')) return 'es';
  if (l.startsWith('de')) return 'de';
  if (l.startsWith('ja')) return 'ja';
  if (l.startsWith('zh')) return 'zh-CN';
  if (l.startsWith('ko')) return 'ko';
  if (l.startsWith('hi')) return 'hi';
  if (l.startsWith('ru')) return 'ru';
  if (l.startsWith('pl')) return 'pl';
  if (l.startsWith('uk')) return 'uk';
  if (l.startsWith('cs')) return 'cs';
  if (l.startsWith('pt')) return 'pt';
  if (l.startsWith('nl')) return 'nl';
  if (l.startsWith('tr')) return 'tr';
  if (l.startsWith('ar')) return 'ar';
  return 'it';
};

// Google Translate Web Engine (Reliable, fast, zero-token, supports single or batch arrays)
async function translateWithGoogle(input: string | string[], targetLangCode: string): Promise<any> {
  if (!input) return input;
  try {
    const res = await translate(input as any, { to: targetLangCode });
    if (Array.isArray(res)) {
      return res.map((r: any) => r.text || '');
    }
    return (res as any)?.text || input;
  } catch (err: any) {
    console.warn('Google translation error:', err.message);
    return input;
  }
}

import { ALL_GOOGLE_AND_ANDROID_VOICES } from './src/data/googleVoices.ts';

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    services: {
      speechSynthesis: 'Google Neural & Android TTS Engine',
      translator: 'Google Translate Engine (google-translate-api-x)',
    },
  });
});

// Complete Google Cloud & Android API voices catalog
app.get('/api/tts/voices', (_req, res) => {
  res.json({
    total: ALL_GOOGLE_AND_ANDROID_VOICES.length,
    voices: ALL_GOOGLE_AND_ANDROID_VOICES,
  });
});

// Google Neural TTS speech generation endpoint
app.post('/api/tts/generate', async (req, res) => {
  try {
    const { text, language = 'it-IT', voice = 'google-it-female' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const cleanText = text.replace(/[\n\r]+/g, ' ').trim();

    // Google Translate Neural TTS Engine
    const langCode = getTtsLangCode(language);
    const rawSentences = cleanText.match(/[^.!?]+[.!?]*/g) || [cleanText];
    const chunks: string[] = [];

    for (const s of rawSentences) {
      const trimmed = s.trim();
      if (!trimmed) continue;
      if (trimmed.length <= 160) {
        chunks.push(trimmed);
      } else {
        const words = trimmed.split(' ');
        let current = '';
        for (const w of words) {
          if ((current + ' ' + w).length <= 160) {
            current = current ? `${current} ${w}` : w;
          } else {
            if (current) chunks.push(current);
            current = w;
          }
        }
        if (current) chunks.push(current);
      }
    }

    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${langCode}&client=tw-ob`;
        const response = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        if (response.ok) {
          const ab = await response.arrayBuffer();
          audioBuffers.push(Buffer.from(ab));
        }
      } catch (err) {
        console.warn('Chunk TTS fetch error:', err);
      }
    }

    if (audioBuffers.length > 0) {
      const combined = Buffer.concat(audioBuffers);
      return res.json({
        audioData: combined.toString('base64'),
        mimeType: 'audio/mp3',
        source: 'google_tts',
        voice,
      });
    }

    res.json({
      fallback: true,
      source: 'browser_fallback',
      message: 'Using client Web Speech synthesis engine',
      voice,
    });
  } catch (error: any) {
    res.json({
      fallback: true,
      source: 'browser_fallback',
      message: 'Using client speech engine',
    });
  }
});

// Google Translate endpoint for news scripts and slides
app.post('/api/news/translate', async (req, res) => {
  try {
    const { text, headline, script, category, pipTitle, targetLanguage = 'en' } = req.body;
    const langCode = getTtsLangCode(targetLanguage);

    // If structured slide components are sent
    if (headline !== undefined || script !== undefined) {
      const batchTexts: string[] = [
        headline || '',
        script || '',
        category || '',
        pipTitle || '',
      ];

      const translated = await translateWithGoogle(batchTexts, langCode);
      const [transHeadline, transScript, transCategory, transPip] = Array.isArray(translated)
        ? translated
        : [headline, script, category, pipTitle];

      return res.json({
        translatedHeadline: transHeadline || headline,
        translatedScript: transScript || script,
        translatedCategory: transCategory || category,
        translatedPipTitle: transPip || pipTitle,
        translatedText: transScript || script,
        provider: 'google_translate',
      });
    }

    // If raw text is sent
    if (text) {
      const translatedText = await translateWithGoogle(text, langCode);
      return res.json({
        translatedText: typeof translatedText === 'string' ? translatedText : text,
        provider: 'google_translate',
      });
    }

    res.status(400).json({ error: 'Nessun testo fornito per la traduzione' });
  } catch (error: any) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Broadcast news rundown generator (Reliable, fast, zero-token, Google-translated)
app.post('/api/news/generate', async (req, res) => {
  try {
    const { topic = 'Notizie di Oggi', language = 'it-IT', anchorGender = 'female' } = req.body;
    const langCode = getTtsLangCode(language);
    const cleanTopic = topic.trim() || 'Accordo storico e innovazione tecnologica';

    // Base professional television rundown structure
    const baseRundown = {
      channelName: 'TG NOTIZIE 24',
      breakingHeadline: `ULTIM'ORA: Svolta decisiva su ${cleanTopic}`,
      tickerItems: [
        `ULTIM'ORA: Vertice internazionale concluso con intesa su ${cleanTopic}`,
        'ECONOMIA: Borse positive in Europa e a Wall Street, spinta sui titoli tecnologici',
        'SCIENZA: Annunciati nuovi risultati nella ricerca sulle energie sostenibili',
        'METEO: Temperature stabili e sole diffuso su tutta la penisola nel fine settimana',
        'SPAZIO: Completate con successo le manovre orbitali della nuova sonda',
        'ESTERI: Riaperti i negoziati bilaterali sulla cooperazione economica',
      ],
      slides: [
        {
          id: `slide-gen-1-${Date.now()}`,
          category: 'ULTIM’ORA',
          headline: `${cleanTopic}: Raggiunto Accordo Storico`,
          subHeadline: 'Risoluzione approvata al termine di una sessione straordinaria',
          script: `Buonasera e benvenuti alla nostra edizione delle notizie. Apriamo con gli sviluppi su ${cleanTopic}. Dopo una lunga trattativa, le parti hanno formalizzato un accordo storico che segna una svolta fondamentale per il settore.`,
          pipTitle: 'ACCORDO INTERNAZIONALE',
          pipSubtitle: 'Trattato approvato • Pieno consenso dei delegati',
          pipTag: 'DIRETTA',
          pipVisualKeyword: 'world',
          backgroundTheme: 'breaking_red',
        },
        {
          id: `slide-gen-2-${Date.now()}`,
          category: 'ECONOMIA & MERCATI',
          headline: 'Reazione Entusiasta delle Borse e Fiducia delle Imprese',
          subHeadline: 'Listini in forte rialzo e spread in sensibile diminuzione',
          script: 'Passiamo ai mercati finanziari. La notizia è stata accolta con estremo favore dagli investitori: le principali piazze azionarie chiudono in forte territorio positivo, guidate dal comparto tecnologico e industriale.',
          pipTitle: 'INDICI AZIONARI',
          pipSubtitle: 'Milano +2.3% • Francoforte +1.9% • Wall Street +1.6%',
          pipTag: 'BORSA',
          pipVisualKeyword: 'economy',
          backgroundTheme: 'financial_blue',
        },
        {
          id: `slide-gen-3-${Date.now()}`,
          category: 'SCIENZA & INNOVAZIONE',
          headline: 'Nuova Frontiera Tecnologica: Presentato Progetto Pilota',
          subHeadline: 'La comunità scientifica applaude i primi risultati della sperimentazione',
          script: 'Spazio all’innovazione: presentati oggi i risultati della nuova sperimentazione tecnologica ad alta efficienza. Gli ingegneri confermano un incremento prestazionale del quaranta per cento a fronte di un minor impatto ambientale.',
          pipTitle: 'RICERCA AVANZATA',
          pipSubtitle: 'Efficienza +40% • Brevetto internazionale depositato',
          pipTag: 'INNOVAZIONE',
          pipVisualKeyword: 'technology',
          backgroundTheme: 'cyber_globe',
        },
        {
          id: `slide-gen-4-${Date.now()}`,
          category: 'METEO & CHIUSURA',
          headline: 'Previsioni Meteo e Riepilogo dei Titoli Principali',
          subHeadline: 'Stabilità atmosferica e tempo primaverile nei prossimi giorni',
          script: 'In conclusione, uno sguardo al meteo: alta pressione dominante garantisce tempo soleggiato e clima mite. Grazie per aver seguito la nostra edizione, linea alla prossima rassegna informativa.',
          pipTitle: 'RADAR METEO',
          pipSubtitle: 'Pressione 1022 hPa • Cieli sereni su tutta la regione',
          pipTag: 'PREVISIONI',
          pipVisualKeyword: 'climate',
          backgroundTheme: 'newsroom_classic',
        },
      ],
      closingCredits: [
        { role: 'Conduttore Notiziario', name: anchorGender === 'female' ? 'Elena Rossi' : 'Marco Silvestri' },
        { role: 'Direttore Editoriale', name: 'Alessandro Conti' },
        { role: 'Caporedattore Esteri', name: 'Marco Silvestri' },
        { role: 'Regia & Grafiche Studio', name: 'Digital Studio Broadcast' },
        { role: 'Sintesi Vocale Google', name: 'Google Neural Audio TTS' },
        { role: 'Produzione Notiziario', name: 'Tutti i diritti riservati ©' },
      ],
    };

    // If requested in another language (e.g. en, es, fr, de, ja, ru), translate with Google
    if (langCode !== 'it') {
      const topTexts = [baseRundown.channelName, baseRundown.breakingHeadline, ...baseRundown.tickerItems];
      const translatedTop = await translateWithGoogle(topTexts, langCode);
      if (Array.isArray(translatedTop)) {
        baseRundown.channelName = translatedTop[0] || baseRundown.channelName;
        baseRundown.breakingHeadline = translatedTop[1] || baseRundown.breakingHeadline;
        baseRundown.tickerItems = translatedTop.slice(2);
      }

      // Batch translate slides
      const slideTexts: string[] = [];
      baseRundown.slides.forEach((s) => {
        slideTexts.push(s.category, s.headline, s.subHeadline, s.script, s.pipTitle, s.pipSubtitle, s.pipTag);
      });

      const translatedSlides = await translateWithGoogle(slideTexts, langCode);
      if (Array.isArray(translatedSlides)) {
        let idx = 0;
        baseRundown.slides.forEach((s) => {
          s.category = translatedSlides[idx++] || s.category;
          s.headline = translatedSlides[idx++] || s.headline;
          s.subHeadline = translatedSlides[idx++] || s.subHeadline;
          s.script = translatedSlides[idx++] || s.script;
          s.pipTitle = translatedSlides[idx++] || s.pipTitle;
          s.pipSubtitle = translatedSlides[idx++] || s.pipSubtitle;
          s.pipTag = translatedSlides[idx++] || s.pipTag;
        });
      }
    }

    res.json(baseRundown);
  } catch (error: any) {
    console.error('Error generating news:', error);
    res.status(500).json({ error: error.message });
  }
});

// Setup Vite or static serving
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`News Studio server running at http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
