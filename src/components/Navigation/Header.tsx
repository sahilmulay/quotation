import React, { useEffect, useState } from 'react';
import { WifiOff, Download, FileText } from 'lucide-react';

export const Header: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] text-white shadow-md pt-safe">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Brand / Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shadow-inner">
            <FileText className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight flex items-center gap-1.5">
              APEX INDUSTRIES
            </h1>
            <p className="text-[11px] text-sky-200/80 font-medium">Offline Quotation Generator</p>
          </div>
        </div>

        {/* Right: Offline status & Install */}
        <div className="flex items-center space-x-2">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-lg shadow-sm transition"
              title="Install App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}

          {/* Network Badge */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                : 'bg-amber-500/20 border-amber-400/40 text-amber-200'
            }`}
            title={isOnline ? 'Online - Database Synced Locally' : 'Working 100% Offline'}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-300" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
