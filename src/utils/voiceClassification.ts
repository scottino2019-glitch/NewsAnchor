export interface CategorizedVoice {
  voice: SpeechSynthesisVoice;
  id: string;
  name: string;
  gender: 'Femminile' | 'Maschile' | 'Neutro';
  isGoogle: boolean;
  provider: 'Google' | 'Microsoft' | 'Apple' | 'Sistema';
  displayName: string;
  recommendedRole: string;
}

const FEMALE_NAMES = [
  'elsa', 'alice', 'federica', 'isabella', 'chiara', 'paola', 'bianca',
  'giulia', 'silvia', 'lucia', 'sara', 'zira', 'eva', 'sabina', 'helena',
  'victoria', 'laura', 'carmen', 'monica', 'marie', 'amélie', 'anna',
  'marlene', 'vicki', 'katja', 'hedda', 'yuna', 'kyoko', 'samantha',
  'karen', 'fiona', 'moira', 'tessa', 'veena', 'female', 'donna'
];

const MALE_NAMES = [
  'cosimo', 'luca', 'diego', 'giuseppe', 'giorgio', 'marco', 'matteo',
  'alessandro', 'roberto', 'stefano', 'david', 'george', 'mark', 'guy',
  'paul', 'thomas', 'stefan', 'daniel', 'alain', 'jorge', 'carlos',
  'manuel', 'richard', 'james', 'brian', 'lee', 'male', 'uomo'
];

export function classifyVoice(v: SpeechSynthesisVoice): CategorizedVoice {
  const lowerName = v.name.toLowerCase();
  const lowerUri = (v.voiceURI || '').toLowerCase();
  const isGoogle = lowerName.includes('google') || lowerUri.includes('google');
  
  let provider: 'Google' | 'Microsoft' | 'Apple' | 'Sistema' = 'Sistema';
  if (isGoogle) provider = 'Google';
  else if (lowerName.includes('microsoft')) provider = 'Microsoft';
  else if (lowerName.includes('apple') || ['alice', 'luca', 'federica', 'samantha', 'siri'].some(n => lowerName.startsWith(n))) provider = 'Apple';

  let gender: 'Femminile' | 'Maschile' | 'Neutro' = 'Neutro';

  // Check known female names
  if (FEMALE_NAMES.some(n => lowerName.includes(n))) {
    gender = 'Femminile';
  } else if (MALE_NAMES.some(n => lowerName.includes(n))) {
    gender = 'Maschile';
  } else if (isGoogle) {
    // In Chrome, "Google italiano", "Google español", "Google français" are traditionally female voices
    if (lowerName.includes('female')) gender = 'Femminile';
    else if (lowerName.includes('male')) gender = 'Maschile';
    else if (lowerName.includes('italiano') || lowerName.includes('us english') || lowerName.includes('español')) {
      gender = 'Femminile';
    } else {
      gender = 'Femminile';
    }
  }

  let recommendedRole = 'Conduttore / Notiziario';
  if (gender === 'Femminile') {
    recommendedRole = 'Conduttrice TG Prima Serata (Elena / Sophia)';
  } else if (gender === 'Maschile') {
    recommendedRole = 'Conduttore TG Principale (Marco / Kenji)';
  }

  // Friendly display name
  let cleanName = v.name
    .replace(/^Microsoft\s+/i, '')
    .replace(/^Google\s+/i, 'Google ')
    .replace(/\s+Online\s+\(Natural\)/i, ' HD')
    .replace(/\s+-\s+Italian.*$/i, '')
    .replace(/\s+\(Italy\)/i, '')
    .trim();

  return {
    voice: v,
    id: v.name,
    name: v.name,
    gender,
    isGoogle,
    provider,
    displayName: cleanName,
    recommendedRole,
  };
}
