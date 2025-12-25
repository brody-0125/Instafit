"use client"

import { ImageEditor } from "@/components/image-editor"
import { LanguageSelector } from "@/components/language-selector"
import { ErrorBoundary } from "@/components/error-boundary"
import { useI18n } from "@/lib/i18n/context"

export default function Home() {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">{t.header.title}</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{t.header.subtitle}</p>
        </div>
        <ErrorBoundary>
          <ImageEditor />
        </ErrorBoundary>
      </div>
    </main>
  )
}
