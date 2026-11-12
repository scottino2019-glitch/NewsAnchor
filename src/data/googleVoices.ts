import { CategorizedVoice, getFlagForLang } from '../utils/voiceClassification';

export interface GoogleVoiceEntry {
  id: string;
  name: string;
  lang: string;
  flag: string;
  gender: 'Femminile' | 'Maschile' | 'Neutro';
  provider: 'Studio TG' | 'Google / Android' | 'Microsoft' | 'Apple' | 'Sistema';
  pitchDefault?: number;
  rateDefault?: number;
}

export const STUDIO_CLOUD_VOICES: GoogleVoiceEntry[] = [
  // Italiano
  {
    id: 'studio-it-elena',
    name: 'Studio TG - Elena (Femminile Chiara)',
    lang: 'it-IT',
    flag: '🇮🇹',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.05,
    rateDefault: 1.0,
  },
  {
    id: 'studio-it-marco',
    name: 'Studio TG - Marco (Maschile Notiziario)',
    lang: 'it-IT',
    flag: '🇮🇹',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.85,
    rateDefault: 0.98,
  },
  {
    id: 'studio-it-sophia',
    name: 'Studio TG - Sophia (Femminile Dinamica)',
    lang: 'it-IT',
    flag: '🇮🇹',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.08,
    rateDefault: 1.02,
  },
  {
    id: 'studio-it-kenji',
    name: 'Studio TG - Kenji (Maschile Tech & Business)',
    lang: 'it-IT',
    flag: '🇮🇹',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.88,
    rateDefault: 1.0,
  },

  // English (US)
  {
    id: 'studio-en-us-female',
    name: 'Studio News - Claire (US Female Broadcast)',
    lang: 'en-US',
    flag: '🇺🇸',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.04,
    rateDefault: 1.0,
  },
  {
    id: 'studio-en-us-male',
    name: 'Studio News - James (US Male Prime Time)',
    lang: 'en-US',
    flag: '🇺🇸',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.85,
    rateDefault: 0.98,
  },

  // English (UK)
  {
    id: 'studio-en-gb-female',
    name: 'Studio News - Victoria (UK Female BBC Tone)',
    lang: 'en-GB',
    flag: '🇬🇧',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.02,
    rateDefault: 1.0,
  },
  {
    id: 'studio-en-gb-male',
    name: 'Studio News - Oliver (UK Male Deep Tone)',
    lang: 'en-GB',
    flag: '🇬🇧',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.86,
    rateDefault: 0.98,
  },

  // Español
  {
    id: 'studio-es-female',
    name: 'Studio Noticias - Carmen (Español Femenino)',
    lang: 'es-ES',
    flag: '🇪🇸',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.04,
    rateDefault: 1.0,
  },
  {
    id: 'studio-es-male',
    name: 'Studio Noticias - Carlos (Español Masculino)',
    lang: 'es-ES',
    flag: '🇪🇸',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.85,
    rateDefault: 0.98,
  },

  // Français
  {
    id: 'studio-fr-female',
    name: 'Studio Journal - Amélie (Français Féminin)',
    lang: 'fr-FR',
    flag: '🇫🇷',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.05,
    rateDefault: 1.0,
  },
  {
    id: 'studio-fr-male',
    name: 'Studio Journal - Thomas (Français Masculin)',
    lang: 'fr-FR',
    flag: '🇫🇷',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.86,
    rateDefault: 0.98,
  },

  // Deutsch
  {
    id: 'studio-de-female',
    name: 'Studio Tagesschau - Marlene (Deutsch Weiblich)',
    lang: 'de-DE',
    flag: '🇩🇪',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.03,
    rateDefault: 1.0,
  },
  {
    id: 'studio-de-male',
    name: 'Studio Tagesschau - Stefan (Deutsch Männlich)',
    lang: 'de-DE',
    flag: '🇩🇪',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.85,
    rateDefault: 0.98,
  },

  // Português
  {
    id: 'studio-pt-female',
    name: 'Studio Jornal - Bianca (Português Feminino)',
    lang: 'pt-BR',
    flag: '🇧🇷',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.04,
    rateDefault: 1.0,
  },
  {
    id: 'studio-pt-male',
    name: 'Studio Jornal - Paulo (Português Masculino)',
    lang: 'pt-BR',
    flag: '🇧🇷',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.86,
    rateDefault: 0.98,
  },

  // 日本語
  {
    id: 'studio-ja-female',
    name: 'Studio ニュース - Yuna (日本語 女性)',
    lang: 'ja-JP',
    flag: '🇯🇵',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.06,
    rateDefault: 1.0,
  },
  {
    id: 'studio-ja-male',
    name: 'Studio ニュース - Kenji (日本語 男性)',
    lang: 'ja-JP',
    flag: '🇯🇵',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.86,
    rateDefault: 0.98,
  },

  // 中文
  {
    id: 'studio-zh-female',
    name: 'Studio 新闻 - Xiaomei (中文 女声)',
    lang: 'zh-CN',
    flag: '🇨🇳',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.05,
    rateDefault: 1.0,
  },
  {
    id: 'studio-zh-male',
    name: 'Studio 新闻 - Zhang (中文 男声)',
    lang: 'zh-CN',
    flag: '🇨🇳',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.86,
    rateDefault: 0.98,
  },

  // 한국어
  {
    id: 'studio-ko-female',
    name: 'Studio 뉴스 - Minji (한국어 여성)',
    lang: 'ko-KR',
    flag: '🇰🇷',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.05,
    rateDefault: 1.0,
  },
  {
    id: 'studio-ko-male',
    name: 'Studio 뉴스 - Jun (한국어 남성)',
    lang: 'ko-KR',
    flag: '🇰🇷',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.86,
    rateDefault: 0.98,
  },

  // Русский
  {
    id: 'studio-ru-female',
    name: 'Studio Вести - Anastasia (Русский Женский)',
    lang: 'ru-RU',
    flag: '🇷🇺',
    gender: 'Femminile',
    provider: 'Studio TG',
    pitchDefault: 1.04,
    rateDefault: 1.0,
  },
  {
    id: 'studio-ru-male',
    name: 'Studio Вести - Dmitry (Русский Мужской)',
    lang: 'ru-RU',
    flag: '🇷🇺',
    gender: 'Maschile',
    provider: 'Studio TG',
    pitchDefault: 0.85,
    rateDefault: 0.98,
  },
];

// For backwards compatibility with any existing imports
export const ALL_GOOGLE_AND_ANDROID_VOICES = STUDIO_CLOUD_VOICES;
