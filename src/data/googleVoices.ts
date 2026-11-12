export interface GoogleVoiceEntry {
  id: string;
  name: string;
  lang: string;
  flag: string;
}

export const ALL_GOOGLE_AND_ANDROID_VOICES: GoogleVoiceEntry[] = [
  // Italiano
  { id: 'it-IT-Neural2-A', name: 'Google Italiano 1', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-IT-Neural2-C', name: 'Google Italiano 2', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-IT-Wavenet-A', name: 'Google Italiano 3', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-IT-Wavenet-B', name: 'Google Italiano 4', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-IT-Wavenet-C', name: 'Google Italiano 5', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-IT-Wavenet-D', name: 'Google Italiano 6', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-IT-Standard-A', name: 'Google Italiano 7', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-IT-Standard-B', name: 'Google Italiano 8', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-IT-Standard-C', name: 'Google Italiano 9', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-IT-Standard-D', name: 'Google Italiano 10', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'Google italiano', name: 'Google Italiano 11', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-it-x-itc-network', name: 'Google Italiano 12', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-it-x-kdc-network', name: 'Google Italiano 13', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-it-x-ita-local', name: 'Google Italiano 14', lang: 'it-IT', flag: '🇮🇹' },
  { id: 'it-it-x-itd-local', name: 'Google Italiano 15', lang: 'it-IT', flag: '🇮🇹' },

  // English (US)
  { id: 'en-US-Journey-F', name: 'Google English (US) 1', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Journey-D', name: 'Google English (US) 2', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Journey-O', name: 'Google English (US) 3', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Neural2-A', name: 'Google English (US) 4', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Neural2-C', name: 'Google English (US) 5', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Neural2-D', name: 'Google English (US) 6', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Neural2-E', name: 'Google English (US) 7', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Neural2-F', name: 'Google English (US) 8', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Neural2-G', name: 'Google English (US) 9', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Neural2-H', name: 'Google English (US) 10', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Neural2-I', name: 'Google English (US) 11', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Neural2-J', name: 'Google English (US) 12', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Wavenet-A', name: 'Google English (US) 13', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Wavenet-B', name: 'Google English (US) 14', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Wavenet-C', name: 'Google English (US) 15', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Wavenet-D', name: 'Google English (US) 16', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Wavenet-E', name: 'Google English (US) 17', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-US-Wavenet-F', name: 'Google English (US) 18', lang: 'en-US', flag: '🇺🇸' },
  { id: 'Google US English', name: 'Google English (US) 19', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-us-x-sfg-network', name: 'Google English (US) 20', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-us-x-iol-network', name: 'Google English (US) 21', lang: 'en-US', flag: '🇺🇸' },
  { id: 'en-us-x-tpd-network', name: 'Google English (US) 22', lang: 'en-US', flag: '🇺🇸' },

  // English (UK)
  { id: 'en-GB-Neural2-A', name: 'Google English (UK) 1', lang: 'en-GB', flag: '🇬🇧' },
  { id: 'en-GB-Neural2-B', name: 'Google English (UK) 2', lang: 'en-GB', flag: '🇬🇧' },
  { id: 'en-GB-Neural2-C', name: 'Google English (UK) 3', lang: 'en-GB', flag: '🇬🇧' },
  { id: 'en-GB-Neural2-D', name: 'Google English (UK) 4', lang: 'en-GB', flag: '🇬🇧' },
  { id: 'en-GB-Neural2-F', name: 'Google English (UK) 5', lang: 'en-GB', flag: '🇬🇧' },
  { id: 'en-GB-Wavenet-A', name: 'Google English (UK) 6', lang: 'en-GB', flag: '🇬🇧' },
  { id: 'en-GB-Wavenet-B', name: 'Google English (UK) 7', lang: 'en-GB', flag: '🇬🇧' },
  { id: 'en-GB-Wavenet-C', name: 'Google English (UK) 8', lang: 'en-GB', flag: '🇬🇧' },
  { id: 'en-GB-Wavenet-D', name: 'Google English (UK) 9', lang: 'en-GB', flag: '🇬🇧' },
  { id: 'en-GB-Wavenet-F', name: 'Google English (UK) 10', lang: 'en-GB', flag: '🇬🇧' },
  { id: 'Google UK English Female', name: 'Google English (UK) 11', lang: 'en-GB', flag: '🇬🇧' },
  { id: 'Google UK English Male', name: 'Google English (UK) 12', lang: 'en-GB', flag: '🇬🇧' },

  // Español
  { id: 'es-ES-Neural2-A', name: 'Google Español 1', lang: 'es-ES', flag: '🇪🇸' },
  { id: 'es-ES-Neural2-B', name: 'Google Español 2', lang: 'es-ES', flag: '🇪🇸' },
  { id: 'es-ES-Neural2-C', name: 'Google Español 3', lang: 'es-ES', flag: '🇪🇸' },
  { id: 'es-ES-Neural2-D', name: 'Google Español 4', lang: 'es-ES', flag: '🇪🇸' },
  { id: 'es-ES-Neural2-E', name: 'Google Español 5', lang: 'es-ES', flag: '🇪🇸' },
  { id: 'es-ES-Neural2-F', name: 'Google Español 6', lang: 'es-ES', flag: '🇪🇸' },
  { id: 'es-ES-Wavenet-B', name: 'Google Español 7', lang: 'es-ES', flag: '🇪🇸' },
  { id: 'es-ES-Wavenet-C', name: 'Google Español 8', lang: 'es-ES', flag: '🇪🇸' },
  { id: 'es-ES-Wavenet-D', name: 'Google Español 9', lang: 'es-ES', flag: '🇪🇸' },
  { id: 'Google español', name: 'Google Español 10', lang: 'es-ES', flag: '🇪🇸' },
  { id: 'es-es-x-eed-network', name: 'Google Español 11', lang: 'es-ES', flag: '🇪🇸' },

  // Français
  { id: 'fr-FR-Neural2-A', name: 'Google Français 1', lang: 'fr-FR', flag: '🇫🇷' },
  { id: 'fr-FR-Neural2-B', name: 'Google Français 2', lang: 'fr-FR', flag: '🇫🇷' },
  { id: 'fr-FR-Neural2-C', name: 'Google Français 3', lang: 'fr-FR', flag: '🇫🇷' },
  { id: 'fr-FR-Neural2-D', name: 'Google Français 4', lang: 'fr-FR', flag: '🇫🇷' },
  { id: 'fr-FR-Neural2-E', name: 'Google Français 5', lang: 'fr-FR', flag: '🇫🇷' },
  { id: 'fr-FR-Wavenet-A', name: 'Google Français 6', lang: 'fr-FR', flag: '🇫🇷' },
  { id: 'fr-FR-Wavenet-B', name: 'Google Français 7', lang: 'fr-FR', flag: '🇫🇷' },
  { id: 'fr-FR-Wavenet-C', name: 'Google Français 8', lang: 'fr-FR', flag: '🇫🇷' },
  { id: 'fr-FR-Wavenet-D', name: 'Google Français 9', lang: 'fr-FR', flag: '🇫🇷' },
  { id: 'fr-FR-Wavenet-E', name: 'Google Français 10', lang: 'fr-FR', flag: '🇫🇷' },
  { id: 'Google français', name: 'Google Français 11', lang: 'fr-FR', flag: '🇫🇷' },
  { id: 'fr-fr-x-vlf-network', name: 'Google Français 12', lang: 'fr-FR', flag: '🇫🇷' },

  // Deutsch
  { id: 'de-DE-Neural2-B', name: 'Google Deutsch 1', lang: 'de-DE', flag: '🇩🇪' },
  { id: 'de-DE-Neural2-C', name: 'Google Deutsch 2', lang: 'de-DE', flag: '🇩🇪' },
  { id: 'de-DE-Neural2-D', name: 'Google Deutsch 3', lang: 'de-DE', flag: '🇩🇪' },
  { id: 'de-DE-Neural2-F', name: 'Google Deutsch 4', lang: 'de-DE', flag: '🇩🇪' },
  { id: 'de-DE-Wavenet-A', name: 'Google Deutsch 5', lang: 'de-DE', flag: '🇩🇪' },
  { id: 'de-DE-Wavenet-B', name: 'Google Deutsch 6', lang: 'de-DE', flag: '🇩🇪' },
  { id: 'de-DE-Wavenet-C', name: 'Google Deutsch 7', lang: 'de-DE', flag: '🇩🇪' },
  { id: 'de-DE-Wavenet-D', name: 'Google Deutsch 8', lang: 'de-DE', flag: '🇩🇪' },
  { id: 'de-DE-Wavenet-E', name: 'Google Deutsch 9', lang: 'de-DE', flag: '🇩🇪' },
  { id: 'de-DE-Wavenet-F', name: 'Google Deutsch 10', lang: 'de-DE', flag: '🇩🇪' },
  { id: 'Google Deutsch', name: 'Google Deutsch 11', lang: 'de-DE', flag: '🇩🇪' },
  { id: 'de-de-x-deb-network', name: 'Google Deutsch 12', lang: 'de-DE', flag: '🇩🇪' },

  // Português
  { id: 'pt-BR-Neural2-A', name: 'Google Português 1', lang: 'pt-BR', flag: '🇧🇷' },
  { id: 'pt-BR-Neural2-B', name: 'Google Português 2', lang: 'pt-BR', flag: '🇧🇷' },
  { id: 'pt-BR-Neural2-C', name: 'Google Português 3', lang: 'pt-BR', flag: '🇧🇷' },
  { id: 'pt-BR-Wavenet-A', name: 'Google Português 4', lang: 'pt-BR', flag: '🇧🇷' },
  { id: 'pt-BR-Wavenet-B', name: 'Google Português 5', lang: 'pt-BR', flag: '🇧🇷' },
  { id: 'pt-BR-Wavenet-C', name: 'Google Português 6', lang: 'pt-BR', flag: '🇧🇷' },
  { id: 'Google português do Brasil', name: 'Google Português 7', lang: 'pt-BR', flag: '🇧🇷' },

  // 日本語
  { id: 'ja-JP-Neural2-B', name: 'Google 日本語 1', lang: 'ja-JP', flag: '🇯🇵' },
  { id: 'ja-JP-Neural2-C', name: 'Google 日本語 2', lang: 'ja-JP', flag: '🇯🇵' },
  { id: 'ja-JP-Wavenet-A', name: 'Google 日本語 3', lang: 'ja-JP', flag: '🇯🇵' },
  { id: 'ja-JP-Wavenet-B', name: 'Google 日本語 4', lang: 'ja-JP', flag: '🇯🇵' },
  { id: 'ja-JP-Wavenet-C', name: 'Google 日本語 5', lang: 'ja-JP', flag: '🇯🇵' },
  { id: 'ja-JP-Wavenet-D', name: 'Google 日本語 6', lang: 'ja-JP', flag: '🇯🇵' },
  { id: 'Google 日本語', name: 'Google 日本語 7', lang: 'ja-JP', flag: '🇯🇵' },

  // 中文
  { id: 'cmn-CN-Wavenet-A', name: 'Google 中文 1', lang: 'zh-CN', flag: '🇨🇳' },
  { id: 'cmn-CN-Wavenet-B', name: 'Google 中文 2', lang: 'zh-CN', flag: '🇨🇳' },
  { id: 'cmn-CN-Wavenet-C', name: 'Google 中文 3', lang: 'zh-CN', flag: '🇨🇳' },
  { id: 'cmn-CN-Wavenet-D', name: 'Google 中文 4', lang: 'zh-CN', flag: '🇨🇳' },
  { id: 'Google 普通话 (中国大陆)', name: 'Google 中文 5', lang: 'zh-CN', flag: '🇨🇳' },

  // 한국어
  { id: 'ko-KR-Neural2-A', name: 'Google 한국어 1', lang: 'ko-KR', flag: '🇰🇷' },
  { id: 'ko-KR-Neural2-B', name: 'Google 한국어 2', lang: 'ko-KR', flag: '🇰🇷' },
  { id: 'ko-KR-Neural2-C', name: 'Google 한국어 3', lang: 'ko-KR', flag: '🇰🇷' },
  { id: 'ko-KR-Wavenet-A', name: 'Google 한국어 4', lang: 'ko-KR', flag: '🇰🇷' },
  { id: 'ko-KR-Wavenet-B', name: 'Google 한국어 5', lang: 'ko-KR', flag: '🇰🇷' },
  { id: 'ko-KR-Wavenet-C', name: 'Google 한국어 6', lang: 'ko-KR', flag: '🇰🇷' },
  { id: 'ko-KR-Wavenet-D', name: 'Google 한국어 7', lang: 'ko-KR', flag: '🇰🇷' },
  { id: 'Google 한국의', name: 'Google 한국어 8', lang: 'ko-KR', flag: '🇰🇷' },

  // Русский
  { id: 'ru-RU-Wavenet-A', name: 'Google Русский 1', lang: 'ru-RU', flag: '🇷🇺' },
  { id: 'ru-RU-Wavenet-B', name: 'Google Русский 2', lang: 'ru-RU', flag: '🇷🇺' },
  { id: 'ru-RU-Wavenet-C', name: 'Google Русский 3', lang: 'ru-RU', flag: '🇷🇺' },
  { id: 'ru-RU-Wavenet-D', name: 'Google Русский 4', lang: 'ru-RU', flag: '🇷🇺' },
  { id: 'ru-RU-Wavenet-E', name: 'Google Русский 5', lang: 'ru-RU', flag: '🇷🇺' },
  { id: 'Google русский', name: 'Google Русский 6', lang: 'ru-RU', flag: '🇷🇺' },

  // Polski
  { id: 'pl-PL-Wavenet-A', name: 'Google Polski 1', lang: 'pl-PL', flag: '🇵🇱' },
  { id: 'pl-PL-Wavenet-B', name: 'Google Polski 2', lang: 'pl-PL', flag: '🇵🇱' },
  { id: 'pl-PL-Wavenet-C', name: 'Google Polski 3', lang: 'pl-PL', flag: '🇵🇱' },
  { id: 'pl-PL-Wavenet-D', name: 'Google Polski 4', lang: 'pl-PL', flag: '🇵🇱' },
  { id: 'Google polski', name: 'Google Polski 5', lang: 'pl-PL', flag: '🇵🇱' },

  // हिन्दी
  { id: 'hi-IN-Neural2-A', name: 'Google हिन्दी 1', lang: 'hi-IN', flag: '🇮🇳' },
  { id: 'hi-IN-Neural2-B', name: 'Google हिन्दी 2', lang: 'hi-IN', flag: '🇮🇳' },
  { id: 'hi-IN-Neural2-C', name: 'Google हिन्दी 3', lang: 'hi-IN', flag: '🇮🇳' },
  { id: 'hi-IN-Neural2-D', name: 'Google हिन्दी 4', lang: 'hi-IN', flag: '🇮🇳' },
  { id: 'Google हिन्दी', name: 'Google हिन्दी 5', lang: 'hi-IN', flag: '🇮🇳' },

  // Nederlands
  { id: 'nl-NL-Wavenet-A', name: 'Google Nederlands 1', lang: 'nl-NL', flag: '🇳🇱' },
  { id: 'nl-NL-Wavenet-B', name: 'Google Nederlands 2', lang: 'nl-NL', flag: '🇳🇱' },
  { id: 'nl-NL-Wavenet-C', name: 'Google Nederlands 3', lang: 'nl-NL', flag: '🇳🇱' },
  { id: 'nl-NL-Wavenet-D', name: 'Google Nederlands 4', lang: 'nl-NL', flag: '🇳🇱' },
  { id: 'Google Nederlands', name: 'Google Nederlands 5', lang: 'nl-NL', flag: '🇳🇱' },

  // Türkçe
  { id: 'tr-TR-Wavenet-A', name: 'Google Türkçe 1', lang: 'tr-TR', flag: '🇹🇷' },
  { id: 'tr-TR-Wavenet-B', name: 'Google Türkçe 2', lang: 'tr-TR', flag: '🇹🇷' },
  { id: 'tr-TR-Wavenet-C', name: 'Google Türkçe 3', lang: 'tr-TR', flag: '🇹🇷' },
  { id: 'Google Türkçe', name: 'Google Türkçe 4', lang: 'tr-TR', flag: '🇹🇷' },

  // Українська & Čeština
  { id: 'uk-UA-Wavenet-A', name: 'Google Українська 1', lang: 'uk-UA', flag: '🇺🇦' },
  { id: 'cs-CZ-Wavenet-A', name: 'Google Čeština 1', lang: 'cs-CZ', flag: '🇨🇿' },
];
