import React, { useState, useEffect, useRef } from 'react';

// Translation types
export type Language = 'en' | 'cs';

interface Translations {
  [key: string]: {
    en: string;
    cs: string;
  };
}

// All translatable strings in the app
export const translations: Translations = {
  // Header
  'app.title': {
    en: 'Is Prygl Frozen?',
    cs: 'Je Prygl zamrzlý?',
  },
  'app.subtitle': {
    en: 'An Independent Monitor',
    cs: 'Nezávislý monitor',
  },

  // Loading screen
  'loading.title': {
    en: 'Is Prygl Frozen?',
    cs: 'Je Prygl zamrzlý?',
  },
  'loading.msg.0': {
    en: 'Consulting sources...',
    cs: 'Konzultuji zdroje...',
  },
  'loading.msg.1': {
    en: 'Checking the ice...',
    cs: 'Kontroluji led...',
  },
  'loading.msg.2': {
    en: 'Almost there...',
    cs: 'Skoro hotovo...',
  },
  'loading.msg.3': {
    en: 'Still thinking...',
    cs: 'Stále přemýšlím...',
  },
  'loading.msg.4': {
    en: 'Ice takes time...',
    cs: 'Led chvíli trvá...',
  },

  // Main content
  'main.signalLost': {
    en: 'SIGNAL LOST',
    cs: 'SIGNÁL ZTRACEN',
  },
  'main.reboot': {
    en: 'REBOOT',
    cs: 'RESTARTOVAT',
  },
  'main.readMore': {
    en: 'read all about it →',
    cs: 'přečíst si vše →',
  },

  // Coordinates & Logging
  'main.coord': {
    en: 'COORD',
    cs: 'SOUŘAD',
  },
  'main.logged': {
    en: 'LOGGED',
    cs: 'ZAZNAMENÁNO',
  },

  // Footer
  'footer.independentFeed': {
    en: 'Independent Watch Feed',
    cs: 'Nezávislý sledovací kanál',
  },
  'footer.disclaimer': {
    en: '* ICE CONDITIONS ARE ESTIMATES. USE AT YOUR OWN RISK. NOT AN OFFICIAL SOURCE.',
    cs: '* PODMÍNKY NA LEDU JSOU ODHADY. POUŽÍVEJTE NA VLASTNÍ RIZIKO. NENÍ OFICIÁLNÍM ZDROJEM.',
  },
  'footer.madeBy': {
    en: 'MADE BY NANDO ROSSI',
    cs: 'VYTVOŘIL NANDO ROSSI',
  },
  'footer.unofficial': {
    en: 'UNOFFICIAL FAN PROJECT',
    cs: 'NEOFIČNÍ FAN PROJEKT',
  },

  // Modal
  'modal.observation': {
    en: 'Observation',
    cs: 'Pozorování',
  },
  'modal.series': {
    en: 'Series',
    cs: 'Série',
  },
  'modal.iceLog': {
    en: 'ICE LOG',
    cs: 'LEDOVÝ ZÁZNAM',
  },
  'modal.report': {
    en: 'REPORT',
    cs: 'ZPRÁVA',
  },
  'modal.sources': {
    en: 'Sources',
    cs: 'Zdroje',
  },

  // Debug panel
  'debug.title': {
    en: 'DEBUG',
    cs: 'DEBUG',
  },
  'debug.close': {
    en: 'D to close',
    cs: 'D pro zavření',
  },
  'debug.status': {
    en: 'status',
    cs: 'status',
  },
  'debug.canSkate': {
    en: 'can skate',
    cs: 'lze bruslit',
  },
  'debug.refresh': {
    en: 'Refresh sources',
    cs: 'Obnovit zdroje',
  },
  'debug.loading': {
    en: 'Loading…',
    cs: 'Načítání…',
  },
  'debug.fetchApi': {
    en: 'Fetch from API',
    cs: 'Získat z API',
  },
  'debug.forceState': {
    en: 'Force state',
    cs: 'Vynutit stav',
  },

  // Status labels
  'status.yes': {
    en: 'YES',
    cs: 'ANO',
  },
  'status.no': {
    en: 'NO',
    cs: 'NE',
  },
  'status.unsure': {
    en: 'UNSURE',
    cs: 'NEJISTÉ',
  },

  // StatusIndicator header
  'status.activeFeed': {
    en: 'Active Feed',
    cs: 'Aktivní přenos',
  },

  // StatusIndicator — YES
  'status.yes.label': {
    en: 'SKATING IS GOOD!',
    cs: 'BRUSLENÍ JE SUPER!',
  },
  'status.yes.sub': {
    en: 'ICE IS SOLID AND READY FOR GLIDING',
    cs: 'LED JE PEVNÝ A PŘIPRAVENÝ K BRUSLENÍ',
  },
  'status.yes.tag.0': { en: 'ICE ICE BABY', cs: 'LED LED BABY' },
  'status.yes.tag.1': { en: 'CHILL VIBES', cs: 'POHODA' },
  'status.yes.tag.2': { en: 'SHARP BLADES', cs: 'OSTRÉ BRUSLE' },
  'status.yes.tag.3': { en: 'GLIDE MODE', cs: 'JEDEME!' },
  'status.yes.tag.4': { en: 'FROZEN PIZZA', cs: 'ZAMRZLÁ PIZZA' },
  'status.yes.tag.5': { en: 'COOL CAT', cs: 'LEDOVÝ KOCOUR' },

  // StatusIndicator — NO
  'status.no.label': {
    en: 'NO SKATING TODAY',
    cs: 'DNES NEBRUSLÍME',
  },
  'status.no.sub': {
    en: 'HAZARDOUS SURFACE DETECTED',
    cs: 'DETEKOVÁN NEBEZPEČNÝ POVRCH',
  },
  'status.no.tag.0': { en: 'SOGGY PAWS', cs: 'MOKRÉ TLAPKY' },
  'status.no.tag.1': { en: 'STAY DRY', cs: 'NEPROMOKNI!' },
  'status.no.tag.2': { en: 'NOPE', cs: 'NOPE' },
  'status.no.tag.3': { en: 'SWIM TIME?', cs: 'ČAS PLAVAT?' },
  'status.no.tag.4': { en: 'MELT CITY', cs: 'KALUŽE VŠUDE' },
  'status.no.tag.5': { en: 'THIN SKIN', cs: 'TENKÝ LED' },

  // StatusIndicator — UNSURE
  'status.unsure.label': {
    en: 'DATA PENDING',
    cs: 'DATA ČEKAJÍ',
  },
  'status.unsure.sub': {
    en: 'TELEMETRY SIGNAL UNSTABLE',
    cs: 'TELEMETRICKÝ SIGNÁL NESTABILNÍ',
  },
  'status.unsure.tag.0': { en: 'MAYBE BABY', cs: 'MOŽNÁ BABY' },
  'status.unsure.tag.1': { en: 'STILL COLD', cs: 'STÁLE ZIMA' },
  'status.unsure.tag.2': { en: 'LOADING...', cs: 'NAČÍTÁNÍ...' },
  'status.unsure.tag.3': { en: 'ICE SPY', cs: 'LEDOVÝ ŠPIÓN' },
  'status.unsure.tag.4': { en: 'THINKING...', cs: 'PŘEMÝŠLÍM...' },
  'status.unsure.tag.5': { en: 'BRRR?', cs: 'BRRR?' },
};

// Hook to get current language and translation function
export const useTranslation = (language: Language) => {
  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };
  return { t, language };
};

// Get initial language from browser/system
export const getInitialLanguage = (): Language => {
  const stored = localStorage.getItem('language');
  if (stored === 'en' || stored === 'cs') {
    return stored;
  }

  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('cs')) {
    return 'cs';
  }
  return 'en';
};

interface LanguageSelectorProps {
  language: Language;
  onChange: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    onChange(lang);
    localStorage.setItem('language', lang);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div ref={dropdownRef} className="relative z-[500]">
      <button
        type="button"
        onClick={(e) => {
          console.log('Language selector clicked', language);
          toggleDropdown();
        }}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-current flex items-center justify-center font-mono text-xs md:text-sm font-bold hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        {language.toUpperCase()}
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 bg-[#FDF6E3] border-4 border-current shadow-xl overflow-hidden"
          style={{ minWidth: '60px' }}
        >
          <button
            type="button"
            onClick={() => handleSelect('en')}
            className={`w-full px-4 py-2 font-mono text-sm font-bold transition-colors block text-left cursor-pointer ${
              language === 'en'
                ? 'bg-[#004CCB] text-[#FDF6E3]'
                : 'text-[#004CCB] hover:bg-[#004CCB]/10'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => handleSelect('cs')}
            className={`w-full px-4 py-2 font-mono text-sm font-bold transition-colors block text-left cursor-pointer ${
              language === 'cs'
                ? 'bg-[#004CCB] text-[#FDF6E3]'
                : 'text-[#004CCB] hover:bg-[#004CCB]/10'
            }`}
          >
            CS
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
