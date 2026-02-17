
import React, { useMemo } from 'react';

interface StatusIndicatorProps {
  status: 'YES' | 'NO' | 'UNSURE';
  timestamp: string;
  statusColor: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, timestamp, statusColor }) => {
  const tagOptions = useMemo(() => ({
    YES: ["ICE ICE BABY", "CHILL VIBES", "SHARP BLADES", "GLIDE MODE", "FROZEN PIZZA", "COOL CAT"],
    NO: ["SOGGY PAWS", "STAY DRY", "NOPE", "SWIM TIME?", "MELT CITY", "THIN SKIN"],
    UNSURE: ["MAYBE BABY", "STILL COLD", "LOADING...", "ICE SPY", "THINKING...", "BRRR?"]
  }), []);

  const configs = {
    YES: {
      label: "SKATING IS GOOD!",
      sub: "ICE IS SOLID AND READY FOR GLIDING",
      tagBg: "#004CCB", // Royal Blue
      tagText: "#FDF6E3", // Cream
      tagBorder: "#FDF6E3"
    },
    NO: {
      label: "NO SKATING TODAY",
      sub: "HAZARDOUS SURFACE DETECTED",
      tagBg: "#FACC15", // Bright Yellow
      tagText: "#B91C1C", // Danger Red
      tagBorder: "#B91C1C"
    },
    UNSURE: {
      label: "DATA PENDING",
      sub: "TELEMETRY SIGNAL UNSTABLE",
      tagBg: "#FDF6E3", // Cream
      tagText: "#004CCB", // Royal Blue
      tagBorder: "#004CCB"
    }
  };

  const config = configs[status];
  
  const randomTag = useMemo(() => {
    const options = tagOptions[status];
    return options[Math.floor(Math.random() * options.length)];
  }, [status, tagOptions]);

  return (
    <div className="w-full flex flex-col items-center animate-reveal px-4">
      {/* Technical Header */}
      <div className="flex items-center gap-6 mb-4 md:mb-8 opacity-40 font-mono text-[10px] tracking-[0.4em] uppercase">
        <div className="h-px w-8 md:w-12 bg-current"></div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 md:w-6 md:h-6 border border-current rounded-full flex items-center justify-center text-[8px]">01</div>
          <span>Active Feed</span>
        </div>
        <div className="h-px w-8 md:w-12 bg-current"></div>
      </div>

      {/* Main Status Label - REGIO Style */}
      <div className="relative mb-2 md:mb-4">
         <h2 className="text-[12vw] md:text-[9rem] lg:text-[10rem] font-display leading-[0.8] tracking-[-0.04em] text-center filter drop-shadow-2xl">
           {config.label.split(' ').map((word, i) => (
             <span key={i} className="block">{word}</span>
           ))}
         </h2>
         
         {/* Floating Tag - Moved further right and colored according to status */}
         <div 
          className="absolute -top-4 -right-12 md:-top-8 md:-right-20 font-display px-4 py-1 text-xl md:text-4xl rotate-12 shadow-xl border-4 z-20"
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
      <p className="mb-4 md:mb-6 text-lg md:text-2xl font-display opacity-80 max-w-lg text-center leading-tight italic">
        {config.sub}
      </p>
    </div>
  );
};

export default StatusIndicator;
