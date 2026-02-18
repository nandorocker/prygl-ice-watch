
import React, { useMemo } from 'react';
import { Language } from './LanguageSelector';

interface StatusIndicatorProps {
  status: 'YES' | 'NO' | 'UNSURE';
  timestamp: string;
  statusColor: string;
  t: (key: string) => string;
  language: Language;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, timestamp, statusColor, t, language }) => {
  const tagOptions = useMemo(() => ({
    YES: [0, 1, 2, 3, 4, 5].map(i => t(`status.yes.tag.${i}`)),
    NO:  [0, 1, 2, 3, 4, 5].map(i => t(`status.no.tag.${i}`)),
    UNSURE: [0, 1, 2, 3, 4, 5].map(i => t(`status.unsure.tag.${i}`)),
  }), [t, language]);

  const configs = {
    YES: {
      label: t('status.yes.label'),
      sub: t('status.yes.sub'),
      tagBg: "#004CCB",
      tagText: "#FDF6E3",
      tagBorder: "#FDF6E3"
    },
    NO: {
      label: t('status.no.label'),
      sub: t('status.no.sub'),
      tagBg: "#FACC15",
      tagText: "#B91C1C",
      tagBorder: "#B91C1C"
    },
    UNSURE: {
      label: t('status.unsure.label'),
      sub: t('status.unsure.sub'),
      tagBg: "#FDF6E3",
      tagText: "#004CCB",
      tagBorder: "#004CCB"
    }
  };

  const config = configs[status];

  const randomTag = useMemo(() => {
    const options = tagOptions[status];
    return options[Math.floor(Math.random() * options.length)];
  }, [status, tagOptions]);

  return (
    <div className="w-full flex flex-col items-center animate-reveal px-4 pt-10 md:pt-0">
      {/* Technical Header */}
      <div className="flex items-center gap-6 mb-4 md:mb-8 opacity-40 font-mono text-[10px] tracking-[0.4em] uppercase">
        <div className="h-px w-8 md:w-12 bg-current"></div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 md:w-6 md:h-6 border border-current rounded-full flex items-center justify-center text-[8px]">01</div>
          <span>{t('status.activeFeed')}</span>
        </div>
        <div className="h-px w-8 md:w-12 bg-current"></div>
      </div>

      {/* Main Status Label - REGIO Style */}
      <div className="relative mb-2 md:mb-4">
         <h2 className="font-display leading-[0.8] tracking-[-0.04em] text-center filter drop-shadow-2xl" style={{ fontSize: 'clamp(5rem, 22vw, 10rem)' }}>
           {config.label.split(' ').map((word, i) => (
             <span key={i} className="block">{word}</span>
           ))}
         </h2>

         {/* Floating Tag - Moved further right and colored according to status */}
         <div
          className="absolute -top-8 -right-10 md:-top-8 md:-right-20 font-display px-4 py-1 text-xl md:text-4xl rotate-12 shadow-xl border-4 z-20"
          style={{
            backgroundColor: config.tagBg,
            color: config.tagText,
            borderColor: config.tagBorder
          }}
         >
           {randomTag}
         </div>
      </div>

      {/* Playful Subtext - Directly under the big text */}
      <p className="mb-10 md:mb-6 text-lg md:text-2xl font-display opacity-80 max-w-lg text-center leading-tight italic">
        {config.sub}
      </p>
    </div>
  );
};

export default StatusIndicator;
