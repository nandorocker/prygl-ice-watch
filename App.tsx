
import React, { useState, useEffect } from 'react';
import { fetchPryglStatus } from './services/geminiService';
import { IceStatusReport, AppStatus } from './types';
import StatusIndicator from './components/StatusIndicator';
import LanguageSelector, { Language, useTranslation, getInitialLanguage } from './components/LanguageSelector';
import { marked } from 'marked';

// Refined Isometric Cube Icon - Architecturally balanced
const IceCubeIcon = ({ className = "w-6 h-6 md:w-8 md:h-8", spinning = false }: { className?: string, spinning?: boolean }) => (
  <svg viewBox="0 0 100 100" className={`${className} ${spinning ? 'animate-cube-spin' : ''}`} fill="currentColor">
    {/* Top Face */}
    <path d="M50 12 L85 34 L50 56 L15 34 Z" opacity="1" />
    {/* Left Face */}
    <path d="M15 34 L50 56 L50 88 L15 66 Z" opacity="0.7" />
    {/* Right Face */}
    <path d="M50 56 L85 34 L85 66 L50 88 Z" opacity="0.4" />
  </svg>
);

const debugAllowed = import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug');

const App: React.FC = () => {
  const [report, setReport] = useState<IceStatusReport | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());

  // Get translation function
  const { t } = useTranslation(language);

  // Transition sequence states
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [revealContent, setRevealContent] = useState(false);
  const [bgColor, setBgColor] = useState('#004CCB');

  const handleRefresh = async (force = false) => {
    setAppStatus(AppStatus.LOADING);
    setRevealContent(false);
    setShowLoadingOverlay(true);
    setError(null);
    try {
      const data = await fetchPryglStatus(force);
      setReport(data);
      setAppStatus(AppStatus.SUCCESS);

      const newBg = data.canSkate === 'YES' ? '#006B3C' : data.canSkate === 'NO' ? '#B91C1C' : '#004CCB';

      // Sequence: 1. Brief pause, then fade out loader
      setTimeout(() => {
        setShowLoadingOverlay(false);
        // Sequence: 2. Once loader has fully faded, switch background colour
        setTimeout(() => {
          setBgColor(newBg);
          // Sequence: 3. Reveal content shortly after bg starts transitioning
          setTimeout(() => {
            setRevealContent(true);
          }, 250);
        }, 150);
      }, 300);
    } catch (err: any) {
      setError(t('main.signalLost'));
      setAppStatus(AppStatus.ERROR);
      setShowLoadingOverlay(false);
      setRevealContent(true);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    if (!debugAllowed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd') {
        setDebugMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const forceState = (canSkate: 'YES' | 'NO' | 'UNSURE') => {
    const stub: IceStatusReport = {
      summary: `[DEBUG] Forced state: ${canSkate}`,
      summaryCs: `[DEBUG] Vynucený stav: ${canSkate}`,
      canSkate,
      lastUpdated: new Date().toLocaleString(),
      sources: [],
      warnings: [],
    };
    setReport(stub);
    setAppStatus(AppStatus.SUCCESS);
    setShowLoadingOverlay(false);
    setRevealContent(true);
  };

  const openModal = () => {
    setShowDetails(true);
    requestAnimationFrame(() => {
      setIsModalAnimating(true);
    });
  };

  const closeModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => {
      setShowDetails(false);
    }, 500);
  };

  const renderMarkdown = (text: string) => {
    return { __html: marked.parse(text) };
  };

  const getBgColor = () => {
    if (!report) return '#004CCB';
    switch (report.canSkate) {
      case 'YES': return '#006B3C';
      case 'NO': return '#B91C1C';
      case 'UNSURE': return '#004CCB';
      default: return '#004CCB';
    }
  };

  const currentBg = getBgColor();

  return (
    <div
      className="h-screen w-screen relative overflow-hidden flex flex-col selection:bg-[#FDF6E3] selection:text-[#004CCB] transition-colors duration-1000"
      style={{ backgroundColor: bgColor }}
    >
      <div className="fixed inset-0 blueprint-grid z-0"></div>
      <div className="fixed top-0 left-1/2 w-px h-full bg-[#FDF6E3] opacity-10 -translate-x-1/2 z-0"></div>
      <div className="fixed top-1/2 left-0 w-full h-px bg-[#FDF6E3] opacity-10 -translate-y-1/2 z-0"></div>

      {/* Loading Overlay */}
      <div
        className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-500 pointer-events-none ${showLoadingOverlay ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex flex-col items-center gap-8">
          <div className="w-24 h-24 md:w-32 md:h-32 border-[6px] border-[#FDF6E3] rounded-full flex items-center justify-center">
            <IceCubeIcon className="w-12 h-14 md:w-16 md:h-18" spinning={true} />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="font-display text-4xl md:text-6xl leading-none uppercase text-[#FDF6E3]">{t('loading.title')}</h1>
            <div className="h-1 w-24 bg-[#FDF6E3] mt-4 opacity-30"></div>
            <span className="font-mono text-[9px] md:text-[10px] tracking-[0.6em] uppercase text-[#FDF6E3] mt-4 opacity-60">{t('loading.consulting')}</span>
          </div>
        </div>
      </div>

      {/* Main Content Reveal */}
      {revealContent && (
        <div className="flex-1 flex flex-col animate-reveal">
          <header className="relative z-20 w-full px-6 md:px-12 pt-6 md:pt-10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 border-4 border-current rounded-full flex items-center justify-center">
                <IceCubeIcon />
              </div>
              <div className="flex flex-col">
                <h1 className="font-display text-2xl md:text-4xl leading-none uppercase">{t('app.title')}</h1>
                <span className="font-mono text-[8px] md:text-[9px] tracking-[0.3em] opacity-50 uppercase">{t('app.subtitle')}</span>
              </div>
            </div>

            <LanguageSelector language={language} onChange={setLanguage} />
          </header>

          <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-4">
            {appStatus === AppStatus.ERROR && !report && (
              <div className="text-center">
                <h3 className="text-6xl md:text-8xl font-display mb-4">{t('main.signalLost')}</h3>
                <p className="font-mono text-sm mb-4 opacity-60 italic">{error}</p>
                <button onClick={() => handleRefresh(true)} className="btn-regio">{t('main.reboot')}</button>
              </div>
            )}

            {report && (
              <div className="w-full flex flex-col items-center">
                <StatusIndicator status={report.canSkate} timestamp={report.lastUpdated} statusColor={currentBg} t={t} language={language} />
                <div className="flex flex-col items-center gap-6 md:gap-8 mb-8 md:mb-12">
                  <button
                    onClick={openModal}
                    className="btn-contrast shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none text-xl md:text-3xl px-6 md:px-10 py-5"
                  >
                    {t('main.readMore')}
                  </button>
                </div>

                <div className="w-full max-w-4xl px-4 flex flex-col items-center">
                  <div className="w-full border-t-2 border-[#FDF6E3]/20 mb-4" />
                  <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 md:gap-8 font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-center opacity-60">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="opacity-50">{t('main.coord')}:</span>
                      <span className="font-bold">49.2312 N / 16.5167 E</span>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="opacity-50">{t('main.logged')}:</span>
                      <span className="font-bold">{report.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="relative z-10 w-full px-6 md:px-12 pb-6 md:pb-10 flex flex-col md:flex-row justify-between items-center gap-4 border-t-2 border-[#FDF6E3]/20 shrink-0">
            <div className="flex flex-col gap-1 max-w-md text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-[9px] font-bold tracking-widest uppercase">{t('footer.independentFeed')}</span>
              </div>
              <p className="text-[9px] font-mono leading-relaxed opacity-40 italic uppercase">
                {t('footer.disclaimer')}
              </p>
            </div>

            <div className="text-right flex flex-col items-center md:items-end">
              <a href="https://nan.do" target="_blank" rel="noopener noreferrer" className="font-display text-xl md:text-2xl tracking-tightest hover:opacity-70 transition-opacity flex items-center gap-2">
                {t('footer.madeBy')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <div className="flex items-center gap-2 font-mono text-[7px] md:text-[8px] tracking-widest opacity-30 mt-1 uppercase">
                <span>{t('footer.unofficial')}</span>
                <span>//</span>
                <span>v3.15.ICE</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Observation Modal */}
      {showDetails && report && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className={`absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-500 ${isModalAnimating ? 'opacity-100' : 'opacity-0'}`} onClick={closeModal}></div>
          <div className={`relative w-full max-w-5xl bg-[#FDF6E3] text-current shadow-2xl overflow-hidden flex flex-col border-t-[12px] md:border-[12px] border-current max-h-[90vh] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isModalAnimating ? 'translate-y-0' : 'translate-y-full'}`} style={{ color: currentBg }}>
            <div className="flex justify-between items-start p-8 pb-4 md:p-16 md:pb-6 bg-[#FDF6E3] shrink-0 border-b-4 border-current">
               <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="border border-current px-3 py-1 font-mono text-[10px] tracking-widest uppercase">{t('modal.observation')}</span>
                  <span className="font-mono text-[10px] tracking-widest uppercase opacity-40">{t('modal.series')}: A-42</span>
                </div>
                <h3 className="text-5xl md:text-8xl font-display leading-[0.85] tracking-tighter">{t('modal.iceLog')}<br/>{t('modal.report')}</h3>
              </div>
              <button onClick={closeModal} className="p-2 hover:rotate-90 transition-transform duration-300">
                <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 pt-8 md:p-16">
              <div className="markdown-content text-xl md:text-3xl font-display italic mb-16 leading-tight border-l-8 border-current pl-6 py-2" dangerouslySetInnerHTML={renderMarkdown(language === 'cs' && report.summaryCs ? report.summaryCs : report.summary)} />
              {report.sources && report.sources.length > 0 && (
                <div className="border-t-2 border-current pt-6 mt-2">
                  <p className="font-mono text-[9px] tracking-widest uppercase opacity-50 mb-3">{t('modal.sources')}</p>
                  <ul className="flex flex-col gap-1">
                    {report.sources.map((s, i) => (
                      <li key={i}>
                        <a
                          href={s.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] md:text-[11px] underline underline-offset-2 opacity-60 hover:opacity-100 transition-opacity break-all"
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {debugMode && (
        <div className="fixed bottom-8 left-8 z-[300] bg-[#FDF6E3] border-4 border-current p-6 shadow-2xl flex flex-col gap-4 w-64" style={{ color: currentBg }}>
          <div className="flex items-center justify-between">
            <h4 className="font-display text-2xl">{t('debug.title')}</h4>
            <span className="font-mono text-[9px] tracking-widest uppercase opacity-40">{t('debug.close')}</span>
          </div>

          <div className="h-px bg-current opacity-20" />

          <div className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-widest">
            <div className="flex justify-between gap-4 opacity-50">
              <span>{t('debug.status')}</span>
              <span className="font-bold">{appStatus}</span>
            </div>
            <div className="flex justify-between gap-4 opacity-50">
              <span>{t('debug.canSkate')}</span>
              <span className="font-bold">{report?.canSkate ?? '—'}</span>
            </div>
          </div>

          <div className="h-px bg-current opacity-20" />

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[9px] tracking-widest uppercase opacity-40">{t('debug.refresh')}</span>
            <button
              onClick={() => handleRefresh(true)}
              disabled={appStatus === AppStatus.LOADING}
              style={{ backgroundColor: currentBg }}
              className="flex items-center justify-center gap-2 px-4 py-2 text-[#FDF6E3] font-mono text-[10px] uppercase tracking-widest disabled:opacity-40"
            >
              <svg className={`w-3 h-3 shrink-0 ${appStatus === AppStatus.LOADING ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {appStatus === AppStatus.LOADING ? t('debug.loading') : t('debug.fetchApi')}
            </button>
          </div>

          <div className="h-px bg-current opacity-20" />

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[9px] tracking-widest uppercase opacity-40">{t('debug.forceState')}</span>
            <div className="flex gap-2">
              {(['YES', 'NO', 'UNSURE'] as const).map(state => (
                <button
                  key={state}
                  onClick={() => forceState(state)}
                  style={report?.canSkate === state ? { backgroundColor: currentBg } : {}}
                  className={`flex-1 px-2 py-2 border-2 border-current font-mono text-[9px] uppercase tracking-wider transition-opacity hover:opacity-70 ${report?.canSkate === state ? 'text-[#FDF6E3]' : ''}`}
                >
                  {state === 'UNSURE' ? 'N/A' : state}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
