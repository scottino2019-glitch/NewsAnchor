export interface CategorizedVoice {
  voice?: SpeechSynthesisVoice;
  id: string;
  name: string;
  gender: 'Femminile' | 'Maschile' | 'Neutro';
  isGoogle: boolean;
  isAndroid: boolean;
  isNeural: boolean;
  provider: 'Google / Android' | 'Microsoft' | 'Apple' | 'Studio TG' | 'Sistema';
  displayName: string;
  lang: string;
  flag: string;
  isDeviceVoice: boolean;
}

const FEMALE_IDENTIFIERS = [
  'female', 'donna', 'femme', 'weiblich', 'femenino',
  'elsa', 'alice', 'federica', 'isabella', 'chiara', 'paola', 'bianca',
  'giulia', 'silvia', 'lucia', 'sara', 'zira', 'eva', 'sabina', 'helena',
  'victoria', 'laura', 'carmen', 'monica', 'marie', 'amélie', 'anna',
  'marlene', 'vicki', 'katja', 'hedda', 'yuna', 'kyoko', 'samantha',
  'karen', 'fiona', 'moira', 'tessa', 'veena', 'itc', 'sfg', 'elena', 'sophia',
  'anastasia', 'jenny', 'aria', 'hazel', 'susan', 'cathy'
];

const MALE_IDENTIFIERS = [
  'male', 'uomo', 'homme', 'männlich', 'masculino',
  'cosimo', 'luca', 'diego', 'giuseppe', 'giorgio', 'marco', 'matteo',
  'alessandro', 'roberto', 'stefano', 'david', 'george', 'mark', 'guy',
  'paul', 'thomas', 'stefan', 'daniel', 'alain', 'jorge', 'carlos',
  'manuel', 'richard', 'james', 'brian', 'lee', 'kdc', 'iol', 'tpd',
  'kenji', 'ryan', 'oliver', 'alex', 'fred', 'tom', 'simon'
];

export function getFlagForLang(langCode: string): string {
  const l = (langCode || '').toLowerCase().trim();
  if (l.startsWith('it')) return '🇮🇹';
  if (l.includes('gb') || l.includes('uk')) return '🇬🇧';
  if (l.startsWith('en')) return '🇺🇸';
  if (l.startsWith('fr')) return '🇫🇷';
  if (l.startsWith('es')) return '🇪🇸';
  if (l.startsWith('de')) return '🇩🇪';
  if (l.startsWith('pt')) return '🇧🇷';
  if (l.startsWith('ja')) return '🇯🇵';
  if (l.startsWith('zh')) return '🇨🇳';
  if (l.startsWith('ko')) return '🇰🇷';
  if (l.startsWith('ru')) return '🇷🇺';
  if (l.startsWith('pl')) return '🇵🇱';
  if (l.startsWith('hi')) return '🇮🇳';
  if (l.startsWith('nl')) return '🇳🇱';
  if (l.startsWith('tr')) return '🇹🇷';
  if (l.startsWith('uk')) return '🇺🇦';
  if (l.startsWith('cs')) return '🇨🇿';
  if (l.startsWith('ar')) return '🇸🇦';
  return '🌐';
}

export function classifyVoice(v: SpeechSynthesisVoice): CategorizedVoice {
  const lowerName = v.name.toLowerCase();
  const lowerUri = (v.voiceURI || '').toLowerCase();

  const isGoogle =
    lowerName.includes('google') ||
    lowerUri.includes('google') ||
    lowerUri.includes('com.google.android.tts');

  const isAndroid =
    lowerName.includes('android') ||
    lowerUri.includes('android') ||
    lowerUri.includes('com.google.android.tts') ||
    lowerName.includes('-network') ||
    lowerName.includes('-local');

  const isNeural =
    lowerName.includes('neural') ||
    lowerName.includes('wavenet') ||
    lowerName.includes('natural') ||
    lowerName.includes('online') ||
    lowerName.includes('journey');

  let provider: 'Google / Android' | 'Microsoft' | 'Apple' | 'Studio TG' | 'Sistema' = 'Sistema';

  if (lowerName.startsWith('studio tg')) {
    provider = 'Studio TG';
  } else if (isGoogle || isAndroid) {
    provider = 'Google / Android';
  } else if (lowerName.includes('microsoft')) {
    provider = 'Microsoft';
  } else if (
    lowerName.includes('apple') ||
    lowerName.includes('siri') ||
    ['alice', 'luca', 'federica', 'samantha', 'daniel', 'fred'].some((n) => lowerName.startsWith(n))
  ) {
    provider = 'Apple';
  }

  let gender: 'Femminile' | 'Maschile' | 'Neutro' = 'Neutro';

  if (FEMALE_IDENTIFIERS.some((n) => lowerName.includes(n) || lowerUri.includes(n))) {
    gender = 'Femminile';
  } else if (MALE_IDENTIFIERS.some((n) => lowerName.includes(n) || lowerUri.includes(n))) {
    gender = 'Maschile';
  } else if (isGoogle) {
    if (lowerName.includes('male') || lowerName.includes('uomo')) {
      gender = 'Maschile';
    } else {
      gender = 'Femminile';
    }
  }

  let cleanName = v.name
    .replace(/^Microsoft\s+/i, 'MS ')
    .replace(/\s+Online\s+\(Natural\)/i, ' Natural')
    .trim();

  return {
    voice: v,
    id: v.name,
    name: v.name,
    gender,
    isGoogle,
    isAndroid,
    isNeural,
    provider,
    displayName: cleanName,
    lang: v.lang || 'it-IT',
    flag: getFlagForLang(v.lang),
    isDeviceVoice: true,
  };
}
