export type Language = 'en' | 'cs';

export interface Translations {
  // Header
  appTitle: string;
  independentMonitor: string;

  // Loading
  consultingSources: string;

  // Main content
  readAllAboutIt: string;

  // Coordinates/footer
  coord: string;
  logged: string;
  independentWatchFeed: string;
  iceConditionsDisclaimer: string;
  unofficialFanProject: string;

  // Modal
  observation: string;
  series: string;
  iceLogReport: string;
  sources: string;

  // Error state
  signalLost: string;
  upstreamSignalFailure: string;
  reboot: string;

  // Debug
  debug: string;
  debugClose: string;
  status: string;
  canSkate: string;
  refreshSources: string;
  loading: string;
  fetchFromApi: string;
  forceState: string;

  // Status
  statusYes: string;
  statusNo: string;
  statusUnsure: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: "Is Prygl Frozen?",
    independentMonitor: "An Independent Monitor",
    consultingSources: "Consulting sources...",
    readAllAboutIt: "read all about it →",
    coord: "COORD",
    logged: "LOGGED",
    independentWatchFeed: "Independent Watch Feed",
    iceConditionsDisclaimer: "* ICE CONDITIONS ARE ESTIMATES. USE AT YOUR OWN RISK. NOT AN OFFICIAL SOURCE.",
    unofficialFanProject: "UNOFFICIAL FAN PROJECT",
    observation: "Observation",
    series: "Series",
    iceLogReport: "ICE LOG\nREPORT",
    sources: "Sources",
    signalLost: "SIGNAL LOST",
    upstreamSignalFailure: "UPSTREAM SIGNAL FAILURE",
    reboot: "REBOOT",
    debug: "DEBUG",
    debugClose: "D to close",
    status: "status",
    canSkate: "can skate",
    refreshSources: "Refresh sources",
    loading: "Loading…",
    fetchFromApi: "Fetch from API",
    forceState: "Force state",
    statusYes: "YES",
    statusNo: "NO",
    statusUnsure: "UNSURE",
  },
  cs: {
    appTitle: "Je Prygl zamrzlý?",
    independentMonitor: "Nezávislý monitor",
    consultingSources: "Konzultuji zdroje...",
    readAllAboutIt: "přečíst všechny informace →",
    coord: "SOUŘ",
    logged: "ZAZNAM",
    independentWatchFeed: "Nezávislý sledovací kanál",
    iceConditionsDisclaimer: "* PODMÍNKY NA LEDU JSOU ODHADY. POUŽÍVEJTE NA VLASTNÍ RIZIKO. NENÍ OFICIÁLNÍ ZDROJ.",
    unofficialFanProject: "NEOFIČNÍ FANOUŠKOVSKÝ PROJEKT",
    observation: "Pozorování",
    series: "Série",
    iceLogReport: "ZÁZNAM\nO LEDU",
    sources: "Zdroje",
    signalLost: "SIGNÁL ZTRACEN",
    upstreamSignalFailure: "SELHÁNÍ NADŘAZENÉHO SIGNÁLU",
    reboot: "RESTARTOVAT",
    debug: "LADĚNÍ",
    debugClose: "Zavřít D",
    status: "stav",
    canSkate: "lze bruslit",
    refreshSources: "Obnovit zdroje",
    loading: "Načítání…",
    fetchFromApi: "Získat z API",
    forceState: "Vynutit stav",
    statusYes: "ANO",
    statusNo: "NE",
    statusUnsure: "NEVÍ",
  },
};

export function getSystemLanguage(): Language {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('cs')) return 'cs';
  return 'en';
}
