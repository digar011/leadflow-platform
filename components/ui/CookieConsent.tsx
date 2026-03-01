"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const COOKIE_CONSENT_KEY = "goldyon-cookie-consent";

type ConsentChoice = "accepted" | "rejected";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  function handleConsent(choice: ConsentChoice) {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-background-card/95 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex shrink-0 mt-0.5">
            <Cookie className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-secondary leading-relaxed">
              We use cookies for authentication and error monitoring (Sentry) to
              improve your experience. By continuing to use this site, you
              consent to our use of cookies.{" "}
              <a
                href="/privacy"
                className="text-gold hover:text-gold-light underline underline-offset-2"
              >
                Privacy Policy
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleConsent("rejected")}
              aria-label="Decline cookies"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleConsent("accepted")}
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
