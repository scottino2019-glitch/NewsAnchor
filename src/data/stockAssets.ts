import { BackgroundTheme, NewsSlide, CreditItem, AvatarCharacter } from '../types/news';
import elenaPhoto from '../assets/images/anchor_elena_1794394633764.jpg';
import marcoPhoto from '../assets/images/anchor_marco_1794394649029.jpg';
import sophiaPhoto from '../assets/images/anchor_sophia_1794394668915.jpg';
import kenjiPhoto from '../assets/images/anchor_kenji_1794394682597.jpg';
import anastasiaPhoto from '../assets/images/anchor_anastasia_1794394695739.jpg';

export interface BackgroundPreset {
  id: BackgroundTheme;
  name: string;
  category: string;
  previewGradient: string;
  description: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'neutral_studio',
    name: 'Studio Neutro Moderno',
    category: 'Neutro Consigliato',
    previewGradient: 'from-slate-900 via-slate-800 to-slate-950',
    description: 'Finitura pulita e professionale in ardesia scura con faretto studio diffuso',
  },
  {
    id: 'neutral_gradient',
    name: 'Gradiente Neutro',
    category: 'Neutro Minimal',
    previewGradient: 'from-zinc-900 via-neutral-900 to-slate-950',
    description: 'Sfumatura bicromatica minimalista ad alto contrasto per le grafiche',
  },
  {
    id: 'neutral_bokeh',
    name: 'Bokeh Studio Neutro',
    category: 'Neutro Morbido',
    previewGradient: 'from-slate-950 via-slate-900 to-neutral-950',
    description: 'Effetto profondità di campo morbida con luci sfocate neutre',
  },
  {
    id: 'neutral_solid',
    name: 'Nero Broadcast Profondo',
    category: 'Neutro Assoluto',
    previewGradient: 'from-black via-zinc-950 to-black',
    description: 'Fondo scuro puro per risaltare al massimo avatar, PiP e grafiche',
  },
  {
    id: 'newsroom_classic',
    name: 'Studio Centrale Notizie',
    category: 'Classico TV',
    previewGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    description: 'Elegante studio televisivo con desk retroilluminato e schermi mondo',
  },
  {
    id: 'breaking_red',
    name: 'Edizione Straordinaria',
    category: 'Breaking News',
    previewGradient: 'from-red-950 via-slate-900 to-red-900',
    description: 'Atmosfera urgente e d’impatto con accenti rosso allerta e mappa dinamica',
  },
  {
    id: 'cyber_globe',
    name: 'Cyber News & Tech',
    category: 'Tecnologia & Futuro',
    previewGradient: 'from-cyan-950 via-slate-950 to-blue-900',
    description: 'Studio olografico moderno con mappamondo digitale e griglia tech',
  },
  {
    id: 'financial_blue',
    name: 'Mercati & Economia',
    category: 'Business & Finanza',
    previewGradient: 'from-blue-950 via-slate-900 to-indigo-900',
    description: 'Visual stile Bloomberg/CNBC con indicatori grafici e borsa',
  },
  {
    id: 'custom',
    name: 'Carica Tuo Sfondo',
    category: 'Personalizzato',
    previewGradient: 'from-purple-950 via-slate-900 to-indigo-950',
    description: 'Carica qualsiasi foto o immagine dal tuo computer o inserisci un URL',
  },
];

export interface PipPreset {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
  category: string;
}

export const STOCK_PIP_IMAGES: PipPreset[] = [
  {
    id: 'pip_ai',
    title: 'Intelligenza Artificiale',
    subtitle: 'Nuovi modelli neurali autonomi presentati oggi',
    tag: 'TECNOLOGIA',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    category: 'tech',
  },
  {
    id: 'pip_economy',
    title: 'Borsa & Mercati',
    subtitle: 'Indici globali in rialzo dopo il vertice economico',
    tag: 'FINANZA',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    category: 'economy',
  },
  {
    id: 'pip_space',
    title: 'Missione Spaziale',
    subtitle: 'Raggiunta con successo l’orbita lunare profonda',
    tag: 'AEROSPAZIO',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    category: 'science',
  },
  {
    id: 'pip_climate',
    title: 'Energia Verde',
    subtitle: 'Accordo storico sulle rinnovabili in Europa',
    tag: 'AMBIENTE',
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
    category: 'climate',
  },
  {
    id: 'pip_health',
    title: 'Ricerca Medica',
    subtitle: 'Svolta biotecnologica annunciata dai ricercatori',
    tag: 'SALUTE',
    imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
    category: 'health',
  },
];

export interface AvatarProfile {
  id: AvatarCharacter;
  name: string;
  role: string;
  gender: 'female' | 'male';
  description: string;
  accentColor: string;
  hairColor: string;
  suitColor: string;
  hairStyle: 'brunette_layers' | 'side_part' | 'blonde_waves' | 'tech_taper' | 'updo_chignon' | 'custom';
  eyeColor: string;
  tieColor?: string;
  photoUrl: string;
  mouthCoords: { x: number; y: number; w: number; h: number };
  leftEyeCoords: { x: number; y: number };
  rightEyeCoords: { x: number; y: number };
}

export const AVATAR_PROFILES: AvatarProfile[] = [
  {
    id: 'elena',
    name: 'Elena Rossi',
    role: 'Conduttrice Notiziario',
    gender: 'female',
    description: 'Giornalista autorevole in elegante tailleur blu notte e acconciatura curata',
    accentColor: '#3b82f6',
    hairColor: '#3d2314',
    suitColor: '#1e293b',
    hairStyle: 'brunette_layers',
    eyeColor: '#78350f',
    photoUrl: elenaPhoto,
    mouthCoords: { x: 0.505, y: 0.400, w: 0.078, h: 0.025 },
    leftEyeCoords: { x: 0.450, y: 0.355 },
    rightEyeCoords: { x: 0.555, y: 0.355 },
  },
  {
    id: 'marco',
    name: 'Marco Silvestri',
    role: 'Caporedattore Esteri',
    gender: 'male',
    description: 'Conduttore distinto con abito scuro, camicia bianca e cravatta regale',
    accentColor: '#ef4444',
    hairColor: '#27272a',
    suitColor: '#0f172a',
    hairStyle: 'side_part',
    eyeColor: '#1e3a8a',
    tieColor: '#991b1b',
    photoUrl: marcoPhoto,
    mouthCoords: { x: 0.510, y: 0.353, w: 0.086, h: 0.028 },
    leftEyeCoords: { x: 0.445, y: 0.285 },
    rightEyeCoords: { x: 0.575, y: 0.285 },
  },
  {
    id: 'sophia',
    name: 'Sophia Laurent',
    role: 'Inviata Speciale',
    gender: 'female',
    description: 'Presenza carismatica con capelli biondi ondulati e giacca verde smeraldo',
    accentColor: '#10b981',
    hairColor: '#d97706',
    suitColor: '#064e3b',
    hairStyle: 'blonde_waves',
    eyeColor: '#0284c7',
    photoUrl: sophiaPhoto,
    mouthCoords: { x: 0.522, y: 0.358, w: 0.082, h: 0.026 },
    leftEyeCoords: { x: 0.465, y: 0.320 },
    rightEyeCoords: { x: 0.575, y: 0.320 },
  },
  {
    id: 'kenji',
    name: 'Kenji Tanaka',
    role: 'Tech & Economy Anchor',
    gender: 'male',
    description: 'Look moderno e minimalista con giacca grafite e occhiali di design',
    accentColor: '#06b6d4',
    hairColor: '#18181b',
    suitColor: '#1f2937',
    hairStyle: 'tech_taper',
    eyeColor: '#0f172a',
    tieColor: '#0284c7',
    photoUrl: kenjiPhoto,
    mouthCoords: { x: 0.510, y: 0.412, w: 0.078, h: 0.025 },
    leftEyeCoords: { x: 0.445, y: 0.365 },
    rightEyeCoords: { x: 0.575, y: 0.365 },
  },
  {
    id: 'anastasia',
    name: 'Anastasia Petrova',
    role: 'News Anchor Internazionale',
    gender: 'female',
    description: 'Eleganza impeccabile in blazer zaffiro e raffinata acconciatura raccolta',
    accentColor: '#8b5cf6',
    hairColor: '#4a044e',
    suitColor: '#172554',
    hairStyle: 'updo_chignon',
    eyeColor: '#7c3aed',
    photoUrl: anastasiaPhoto,
    mouthCoords: { x: 0.518, y: 0.358, w: 0.080, h: 0.026 },
    leftEyeCoords: { x: 0.465, y: 0.315 },
    rightEyeCoords: { x: 0.575, y: 0.315 },
  },
  {
    id: 'custom',
    name: 'Conduttore Personalizzato',
    role: 'Foto dal Tuo Dispositivo',
    gender: 'female',
    description: 'Carica la tua foto o un ritratto per condurre il notiziario dal vivo',
    accentColor: '#f59e0b',
    hairColor: '#1e293b',
    suitColor: '#0f172a',
    hairStyle: 'custom',
    eyeColor: '#0284c7',
    photoUrl: elenaPhoto,
    mouthCoords: { x: 0.50, y: 0.40, w: 0.080, h: 0.028 },
    leftEyeCoords: { x: 0.450, y: 0.350 },
    rightEyeCoords: { x: 0.550, y: 0.350 },
  },
];

export const INITIAL_SLIDES: NewsSlide[] = [
  {
    id: 'slide-1',
    category: 'ULTIM’ORA',
    headline: 'Svolta Globale: Accordo Storico sull’Intelligenza Artificiale',
    subHeadline: 'I leader mondiali approvano il nuovo trattato etico e tecnologico',
    script: 'Buonasera e benvenuti alla nostra edizione straordinaria. Si è concluso a Ginevra lo storico vertice sull’Intelligenza Artificiale, con la firma congiunta di oltre sessanta nazioni per uno sviluppo etico e sostenibile.',
    showPip: true,
    pipTitle: 'SUMMIT DI GINEVRA',
    pipSubtitle: '64 Paesi firmatari • Nuove linee guida globali',
    pipTag: 'DIRETTA',
    pipImageUrl: STOCK_PIP_IMAGES[0].imageUrl,
    pipPosition: 'top_right',
    backgroundTheme: 'neutral_studio',
  },
  {
    id: 'slide-2',
    category: 'MERCATI & INNOVAZIONE',
    headline: 'Borse Mondiali in Forte Rialzo: Record nei Settori Green e Tech',
    subHeadline: 'Milano, Francoforte e Wall Street segnano massimi trimestrali',
    script: 'Reazione immediata dei mercati finanziari: gli indici azionari europei e americani volano con guadagni superiori al due percento, trainati dai comparti dei semiconduttori e delle energie rinnovabili.',
    showPip: true,
    pipTitle: 'INDICI DI BORSA',
    pipSubtitle: 'FTSE MIB +2.3% • NASDAQ +1.9% • S&P 500 +1.4%',
    pipTag: 'MERCATI',
    pipImageUrl: STOCK_PIP_IMAGES[1].imageUrl,
    pipPosition: 'top_right',
    backgroundTheme: 'neutral_gradient',
    customGradientFrom: '#1e293b',
    customGradientTo: '#020617',
  },
  {
    id: 'slide-3',
    category: 'AEROSPAZIO',
    headline: 'Lancio Riuscito: La Sonda Spaziale Entra in Orbita Lunare',
    subHeadline: 'Completate con successo le prime trasmissioni dati ad altissima risoluzione',
    script: 'Grande entusiasmo alla base aerospaziale. La sonda autonoma ha effettuato con precisione millimetrica l’inserimento orbitale, inviando le prime immagini spettacolari della superficie lunare mai osservata.',
    showPip: true,
    pipTitle: 'MISSIONE ORBITAL-7',
    pipSubtitle: 'Altitudine: 100 km • Telemetria nominale al 100%',
    pipTag: 'SCIENZA',
    pipImageUrl: STOCK_PIP_IMAGES[2].imageUrl,
    pipPosition: 'top_right',
    backgroundTheme: 'neutral_bokeh',
  },
  {
    id: 'slide-4',
    category: 'METEO & AMBIENTE',
    headline: 'Previsioni Meteo: Sole e Temperature Stabili sulla Penisola',
    subHeadline: 'Condizioni primaverili miti per l’intero fine settimana',
    script: 'Chiudiamo la nostra rassegna con il quadro meteorologico: alta pressione stabile su gran parte del continente, con cieli sereni e clima ideale per i prossimi giorni. Grazie per averci seguito.',
    showPip: true,
    pipTitle: 'METEO RADAR',
    pipSubtitle: 'Pressione 1024 hPa • Venti moderati da Nord-Est',
    pipTag: 'RADAR METEO',
    pipImageUrl: STOCK_PIP_IMAGES[3].imageUrl,
    pipPosition: 'top_right',
    backgroundTheme: 'neutral_studio',
  },
];

export const INITIAL_CREDITS: CreditItem[] = [
  { id: 'c1', role: 'Conduttrice Notiziario', name: 'Elena Rossi' },
  { id: 'c2', role: 'Direttore Editoriale', name: 'Alessandro Conti' },
  { id: 'c3', role: 'Caporedattore Notizie', name: 'Davide Moretti' },
  { id: 'c4', role: 'Regia & Grafica Studio', name: 'Digital Broadcast Team' },
  { id: 'c5', role: 'Sintesi Vocale AI', name: 'Google TTS Neural Voice' },
  { id: 'c6', role: 'Sincronizzazione Labiale', name: 'Audio-Viseme Dynamic Engine' },
  { id: 'c7', role: 'Produzione & Diffusione', name: 'StudioTG News Network ©' },
];

export const INITIAL_TICKER = [
  'ULTIM’ORA: Storico accordo internazionale firmato a Ginevra per lo sviluppo etico dell’AI',
  'ECONOMIA: Borse europee positive a metà seduta, lo spread scende sotto i 110 punti',
  'SCIENZA: La sonda spaziale invia le prime scansioni tridimensionali del suolo lunare',
  'TECNOLOGIA: Batterie al grafene: annunciata autonomia raddoppiata per i nuovi veicoli',
  'METEO: Weekend mite e soleggiato da Nord a Sud con temperature sopra la media stagionale',
  'SPORT: Si scaldano i motori per il Gran Premio di apertura della stagione mondiale',
];
