"use client"

import { useI18n } from "@/lib/i18n/context"
import type { Locale } from "@/lib/i18n/translations"
import { cn } from "@/lib/utils"

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "EN" },
  { code: "ja", label: "日本語" },
]

export function LanguageSelector() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setLocale(lang.code)}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md transition-all min-h-[40px] min-w-[48px]",
            "touch-manipulation select-none",
            "active:scale-95",
            locale === lang.code
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          style={{ touchAction: "manipulation" }}
          aria-label={lang.label}
          aria-pressed={locale === lang.code}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
