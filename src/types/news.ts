export type PipPosition = 'top_right' | 'top_left' | 'split_screen' | 'corner_large';

export type BackgroundTheme =
  | 'neutral_studio'
  | 'neutral_gradient'
  | 'neutral_bokeh'
  | 'neutral_solid'
  | 'newsroom_classic'
  | 'breaking_red'
  | 'cyber_globe'
  | 'financial_blue'
  | 'weather_studio'
  | 'custom';

export type LanguageRegion = 'occidentale' | 'orientale' | 'slava';

export interface LanguageOption {
  code: string;
  name: string;
  region: LanguageRegion;
  flag: string;
  googleVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  nativeName: string;
  defaultTopic: string;
}

export interface NewsSlide {
  id: string;
  category: string;
  headline: string;
  subHeadline: string;
  script: string;
  // Picture-in-Picture
  showPip: boolean;
  pipTitle: string;
  pipSubtitle: string;
  pipTag: string;
  pipImageUrl: string;
  pipPosition: PipPosition;
  // Scene
  backgroundTheme: BackgroundTheme;
  customBackgroundUrl?: string;
  customBackgroundColor?: string;
  customGradientFrom?: string;
  customGradientTo?: string;
  // Audio cache
  audioUrl?: string;
  audioDuration?: number;
}

export type AvatarCharacter = 'elena' | 'marco' | 'sophia' | 'kenji' | 'anastasia' | 'custom';
export type AvatarPosition = 'desk_center' | 'desk_right' | 'desk_left' | 'full_body';

export interface AvatarSettings {
  character: AvatarCharacter;
  customAvatarUrl?: string;
  position: AvatarPosition;
  scale: number;
  lipSyncSensitivity: number; // 0.5 to 2.0
  mouthMovementRange: number; // 0.5 to 2.0
  blinkRate: number; // blinks per minute
  headMovement: boolean;
}

export interface BroadcastSettings {
  channelName: string;
  channelLogoText: string;
  primaryColor: string; // e.g. '#e11d48'
  accentColor: string;
  showTicker: boolean;
  tickerItems: string[];
  tickerSpeed: number; // seconds per cycle
  showClock: boolean;
  liveBadgeText: string;
  fontFamily: string;
}

export interface CreditItem {
  id: string;
  role: string;
  name: string;
}

export type CreditsFontSize = 'normal' | 'large' | 'extra_large';

export interface CreditsSettings {
  enabled: boolean;
  header: string;
  subHeader: string;
  items: CreditItem[];
  scrollDuration: number; // in seconds
  showFinalLogo: boolean;
  fontSize?: CreditsFontSize;
}

export type VisemeShape =
  | 'rest' // closed mouth
  | 'open_a' // wide open 'ah'
  | 'round_o' // rounded 'oh', 'oo'
  | 'wide_e' // stretched 'ee', 'ih'
  | 'teeth_f' // 'f', 'v'
  | 'pressed_m' // 'm', 'b', 'p'
  | 'tongue_l'; // 'l', 'th', 'd', 't'

export interface LipSyncFrame {
  viseme: VisemeShape;
  openness: number; // 0 to 1
  width: number; // 0 to 1
  jawDrop: number; // 0 to 1
}
