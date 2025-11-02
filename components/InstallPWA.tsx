"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";

export function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // PWA install prompt'u yakala
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      // Daha önce reddedilmemişse banner göster
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Zaten yüklü mü kontrol et
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
    }

    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-zinc-900 text-white rounded-2xl shadow-2xl p-6 z-50 animate-fade-in-up">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-zinc-400 hover:text-white transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone className="h-7 w-7 text-zinc-900" />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-1">Uygulamayı Yükleyin</h3>
          <p className="text-sm text-zinc-300">
            Örnek Yaşam Evleri&apos;ni telefonunuza ekleyin ve uygulama gibi kullanın!
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleInstall}
          className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold"
        >
          <Download className="mr-2 h-4 w-4" />
          Ana Ekrana Ekle
        </Button>
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          Daha Sonra
        </Button>
      </div>
    </div>
  );
}

