"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, Square, Smartphone, Monitor, ImagePlus, Check, Sparkles } from "lucide-react"
import { TemplateSelector } from "./template-selector"
import { BackgroundControls } from "./background-controls"
import { ImageCanvas } from "./image-canvas"
import { ImageThumbnailList } from "./image-thumbnail-list"
import { useCanvasRenderer } from "@/hooks/use-canvas-renderer"
import { useI18n } from "@/lib/i18n/context"
import type { ImageItem, TemplateType, BackgroundSettings } from "@/types/editor"
import { DEFAULT_BACKGROUND_SETTINGS } from "@/types/editor"
import { cn } from "@/lib/utils"

const INSTAGRAM_TEMPLATES = {
  square: { nameKey: "square" as const, ratio: 1, icon: Square, width: 1080, height: 1080 },
  portrait: { nameKey: "portrait" as const, ratio: 9 / 16, icon: Smartphone, width: 1080, height: 1920 },
  landscape: { nameKey: "landscape" as const, ratio: 1.91, icon: Monitor, width: 1080, height: 566 },
} as const

const generateId = () => `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

type ToastType = "success" | "error" | "info"

export function ImageEditor() {
  const { t } = useI18n()
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<ImageItem[]>([])

  // Keep ref in sync with state for cleanup
  imagesRef.current = images

  const selectedImage = images.find((img) => img.id === selectedImageId) ?? null
  const currentTemplate = selectedImage?.template ?? "square"
  const currentBackgroundSettings = selectedImage?.backgroundSettings ?? DEFAULT_BACKGROUND_SETTINGS

  const { exportToBlob } = useCanvasRenderer({
    template: INSTAGRAM_TEMPLATES[currentTemplate],
    backgroundSettings: currentBackgroundSettings,
  })

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url))
    }
  }, [])

  const processImageFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((file) => file.type.startsWith("image/"))

      if (fileArray.length === 0) return

      const newImages: ImageItem[] = fileArray.map((file) => ({
        id: generateId(),
        url: URL.createObjectURL(file),
        fileName: file.name,
        template: "square" as TemplateType,
        backgroundSettings: { ...DEFAULT_BACKGROUND_SETTINGS },
      }))

      setImages((prev) => [...prev, ...newImages])
      setSelectedImageId(newImages[0].id)
      showToast(t.toast.uploadSuccess.replace("{count}", String(fileArray.length)), "success")
    },
    [showToast, t],
  )

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files && files.length > 0) {
        processImageFiles(files)
      }
      event.target.value = ""
    },
    [processImageFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        processImageFiles(files)
      }
    },
    [processImageFiles],
  )

  const handleRemoveImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const imageToRemove = prev.find((img) => img.id === id)
        if (imageToRemove) {
          URL.revokeObjectURL(imageToRemove.url)
        }
        return prev.filter((img) => img.id !== id)
      })

      setSelectedImageId((prevId) => {
        if (prevId === id) {
          const remainingImages = images.filter((img) => img.id !== id)
          return remainingImages.length > 0 ? remainingImages[0].id : null
        }
        return prevId
      })
    },
    [images],
  )

  const handleTemplateChange = useCallback(
    (template: string) => {
      if (!selectedImageId) return

      setImages((prev) =>
        prev.map((img) => (img.id === selectedImageId ? { ...img, template: template as TemplateType } : img)),
      )
    },
    [selectedImageId],
  )

  const handleBackgroundSettingsChange = useCallback(
    (settings: BackgroundSettings) => {
      if (!selectedImageId) return

      setImages((prev) =>
        prev.map((img) => (img.id === selectedImageId ? { ...img, backgroundSettings: settings } : img)),
      )
    },
    [selectedImageId],
  )

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !selectedImage) return

    setIsDownloading(true)

    try {
      const blob = await exportToBlob(canvas)

      if (!blob) {
        showToast(t.toast.downloadError, "error")
        return
      }

      const url = URL.createObjectURL(blob)
      const baseName = selectedImage.fileName.replace(/\.[^/.]+$/, "")
      const filename = `${baseName}-${selectedImage.template}-${Date.now()}.jpg`

      // Try native share API first for mobile
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [new File([blob], filename, { type: blob.type })] })
      ) {
        try {
          await navigator.share({
            files: [new File([blob], filename, { type: blob.type })],
            title: "Instafit",
          })
          showToast(t.toast.downloadSuccess, "success")
          URL.revokeObjectURL(url)
          return
        } catch (shareError) {
          // User cancelled or share failed, fall back to download
          if ((shareError as Error).name !== "AbortError") {
            console.error("[v0] Share failed:", shareError)
          }
        }
      }

      // Fallback: standard download
      const link = document.createElement("a")
      link.download = filename
      link.href = url
      link.style.display = "none"

      document.body.appendChild(link)

      // Use click() with setTimeout for better mobile support
      setTimeout(() => {
        link.click()
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 100)
      }, 0)

      showToast(t.toast.downloadSuccess, "success")
    } catch (error) {
      console.error("[v0] Download failed:", error)
      showToast(t.toast.downloadError, "error")
    } finally {
      setIsDownloading(false)
    }
  }, [selectedImage, exportToBlob, showToast, t])

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const hasImages = images.length > 0
  const currentStep = !hasImages ? 1 : !selectedImage ? 1 : 2

  return (
    <div className="max-w-7xl mx-auto relative">
      {toast && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300",
            toast.type === "success" && "bg-green-500 text-white",
            toast.type === "error" && "bg-destructive text-destructive-foreground",
            toast.type === "info" && "bg-primary text-primary-foreground",
          )}
          style={{ marginTop: "var(--safe-area-inset-top)" }}
        >
          {toast.type === "success" && <Check className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mb-8">
        <StepIndicator step={1} currentStep={currentStep} label={t.step.upload} />
        <div className="w-8 h-px bg-border" />
        <StepIndicator step={2} currentStep={currentStep} label={t.step.edit} />
        <div className="w-8 h-px bg-border" />
        <StepIndicator step={3} currentStep={currentStep} label={t.step.download} isLast />
      </div>

      {/* TODO: 일괄 다운로드 기능 추가 (ZIP 파일) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </div>
                <Label className="text-base font-semibold">{t.upload.title}</Label>
              </div>
              <button
                type="button"
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                  "touch-manipulation select-none",
                  "active:scale-[0.98] active:bg-accent/10",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-accent/5",
                )}
                style={{ touchAction: "manipulation" }}
                aria-label={t.upload.title}
              >
                <div
                  className={cn(
                    "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                    isDragging ? "bg-primary/10" : "bg-muted",
                  )}
                >
                  <Upload
                    className={cn("h-6 w-6 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">{t.upload.dragDrop}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.upload.multiple}</p>
              </button>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                tabIndex={-1}
              />

              <ImageThumbnailList
                images={images}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                onRemove={handleRemoveImage}
              />
            </div>
          </Card>

          <Card className={cn("p-5 transition-opacity", !hasImages && "opacity-50 pointer-events-none")}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    hasImages ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  2
                </div>
                <Label className="text-base font-semibold">{t.template.title}</Label>
              </div>
              <TemplateSelector
                templates={INSTAGRAM_TEMPLATES}
                selectedTemplate={currentTemplate}
                onTemplateChange={handleTemplateChange}
                disabled={!hasImages}
              />
            </div>
          </Card>

          <Card className={cn("p-5 transition-opacity", !hasImages && "opacity-50 pointer-events-none")}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    hasImages ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  3
                </div>
                <Label className="text-base font-semibold">{t.background.title}</Label>
              </div>
              <BackgroundControls
                settings={currentBackgroundSettings}
                onSettingsChange={handleBackgroundSettingsChange}
                disabled={!hasImages}
              />
            </div>
          </Card>

          <Button
            onClick={handleDownload}
            disabled={isDownloading || !selectedImage}
            className={cn(
              "w-full touch-manipulation min-h-[52px] text-base font-semibold transition-all select-none",
              selectedImage && "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
            )}
            style={{ touchAction: "manipulation" }}
            size="lg"
          >
            {isDownloading ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                {t.action.downloading}
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                {t.action.download}
              </>
            )}
          </Button>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-5 h-full">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">{t.preview.title}</Label>
                {selectedImage && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    {INSTAGRAM_TEMPLATES[currentTemplate].width} × {INSTAGRAM_TEMPLATES[currentTemplate].height}
                  </Badge>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center min-h-[400px] bg-muted/30 rounded-xl">
                {selectedImage ? (
                  <ImageCanvas
                    ref={canvasRef}
                    image={selectedImage.url}
                    template={INSTAGRAM_TEMPLATES[currentTemplate]}
                    backgroundSettings={currentBackgroundSettings}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ImagePlus className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-1">{t.preview.empty}</p>
                    <p className="text-sm text-muted-foreground max-w-[280px]">{t.preview.emptyDescription}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StepIndicator({
  step,
  currentStep,
  label,
  isLast = false,
}: {
  step: number
  currentStep: number
  label: string
  isLast?: boolean
}) {
  const isActive = step <= currentStep
  const isCurrent = step === currentStep

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors",
          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {step < currentStep ? <Check className="w-4 h-4" /> : step}
      </div>
      <span
        className={cn(
          "text-sm font-medium hidden sm:inline transition-colors",
          isCurrent ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  )
}
