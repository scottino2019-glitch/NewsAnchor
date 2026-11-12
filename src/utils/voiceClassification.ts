export interface CategorizedVoice {
  voice: SpeechSynthesisVoice;
  id: string;
  name: string;
  gender: 'Femminile' | 'Maschile' | 'Neutro';
  isGoogle: boolean;
  isAndroid: boolean;
  isNeural: boolean;
  provider: 'Google Cloud / API' | 'Android Speech by Google' | 'Microsoft' | 'Apple' | 'Sistema';
  displayName: string;
  lang: string;
}

const FEMALE_IDENTIFIERS = [
  'female', 'donna', 'femme', 'weiblich', 'femenino',
  'elsa', 'alice', 'federica', 'isabella', 'chiara', 'paola', 'bianca',
  'giulia', 'silvia', 'lucia', 'sara', 'zira', 'eva', 'sabina', 'helena',
  'victoria', 'laura', 'carmen', 'monica', 'marie', 'amélie', 'anna',
  'marlene', 'vicki', 'katja', 'hedda', 'yuna', 'kyoko', 'samantha',
  'karen', 'fiona', 'moira', 'tessa', 'veena', 'itc', 'sfg', 'neural2-a',
  'neural2-c', 'neural2-f', 'wavenet-a', 'wavenet-d', 'wavenet-f', 'wavenet-c',
  'journey-f'
];

const MALE_IDENTIFIERS = [
  'male', 'uomo', 'homme', 'männlich', 'masculino',
  'cosimo', 'luca', 'diego', 'giuseppe', 'giorgio', 'marco', 'matteo',
  'alessandro', 'roberto', 'stefano', 'david', 'george', 'mark', 'guy',
  'paul', 'thomas', 'stefan', 'daniel', 'alain', 'jorge', 'carlos',
  'manuel', 'richard', 'james', 'brian', 'lee', 'kdc', 'iol', 'tpd',
  'neural2-b', 'neural2-d', 'neural2-j', 'wavenet-b', 'journey-d'
];

export function classifyVoice(v: SpeechSynthesisVoice): CategorizedVoice {
  const lowerName = v.name.toLowerCase();
  const lowerUri = (v.voiceURI || '').toLowerCase();

  const isGoogle =
    lowerName.includes('google') ||
    lowerUri.includes('google') ||
    lowerUri.includes('com.google.android.tts') ||
    lowerName.includes('neural') ||
    lowerName.includes('wavenet');

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
    lowerName.includes('journey') ||
    lowerName.includes('studio');

  let provider: 'Google Cloud / API' | 'Android Speech by Google' | 'Microsoft' | 'Apple' | 'Sistema' = 'Sistema';

  if (isAndroid || (isGoogle && lowerName.includes('android'))) {
    provider = 'Android Speech by Google';
  } else if (isGoogle) {
    provider = isNeural ? 'Google Cloud / API' : 'Android Speech by Google';
  } else if (lowerName.includes('microsoft')) {
    provider = 'Microsoft';
  } else if (lowerName.includes('apple') || ['alice', 'luca', 'federica', 'samantha', 'siri'].some((n) => lowerName.startsWith(n))) {
    provider = 'Apple';
  }

  let gender: 'Femminile' | 'Maschile' | 'Neutro' = 'Neutro';

  // Check known indicators
  if (FEMALE_IDENTIFIERS.some((n) => lowerName.includes(n) || lowerUri.includes(n))) {
    gender = 'Femminile';
  } else if (MALE_IDENTIFIERS.some((n) => lowerName.includes(n) || lowerUri.includes(n))) {
    gender = 'Maschile';
  } else if (isGoogle) {
    // Standard Google single-voice defaults for Chrome
    if (lowerName.includes('male') || lowerName.includes('uomo')) {
      gender = 'Maschile';
    } else {
      gender = 'Femminile';
    }
  }

  // Clean, respectful display name (without destroying identity)
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
    lang: v.lang,
  };
}
