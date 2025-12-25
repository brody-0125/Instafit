"use client"

import { useCallback, useRef, useEffect } from "react"

const OUTPUT_RESOLUTIONS = {
  standard: { multiplier: 1 },
  high: { multiplier: 2 },
} as const

const MAX_CANVAS_DIMENSION = 4096
const MAX_INPUT_DIMENSION = 7680

interface Template {
  width: number
  height: number
}

interface BackgroundSettings {
  type: "solid" | "blur" | "gradient"
  solidColor: string
  blurIntensity: number
  gradientColors: [string, string]
  gradientDirection: number
}

interface UseCanvasRendererOptions {
  template: Template
  backgroundSettings: BackgroundSettings
  useHighResolution?: boolean
}

export function useCanvasRenderer(options: UseCanvasRendererOptions) {
  const { template, backgroundSettings, useHighResolution = true } = options
  const imageObjectUrlRef = useRef<string | null>(null)

  const cleanup = useCallback(() => {
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current)
      imageObjectUrlRef.current = null
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  // TODO: Web Worker로 이동하여 메인 스레드 블로킹 방지
  const downsampleLargeImage = useCallback(async (img: HTMLImageElement): Promise<HTMLImageElement> => {
    const { width, height } = img
    const maxDimension = Math.max(width, height)

    if (maxDimension <= MAX_INPUT_DIMENSION) {
      return img
    }

    const scale = MAX_INPUT_DIMENSION / maxDimension
    const newWidth = Math.floor(width * scale)
    const newHeight = Math.floor(height * scale)

    const offscreen = document.createElement("canvas")
    offscreen.width = newWidth
    offscreen.height = newHeight

    const offCtx = offscreen.getContext("2d")
    if (!offCtx) return img

    offCtx.imageSmoothingEnabled = true
    offCtx.imageSmoothingQuality = "high"
    offCtx.drawImage(img, 0, 0, newWidth, newHeight)

    return new Promise((resolve) => {
      const downsampledImg = new Image()
      downsampledImg.onload = () => {
        if (imageObjectUrlRef.current) {
          URL.revokeObjectURL(imageObjectUrlRef.current)
        }
        resolve(downsampledImg)
      }
      offscreen.toBlob(
        (blob) => {
          if (blob) {
            imageObjectUrlRef.current = URL.createObjectURL(blob)
            downsampledImg.src = imageObjectUrlRef.current
          } else {
            resolve(img)
          }
        },
        "image/jpeg",
        0.95,
      )
    })
  }, [])

  const calculateScaleFactor = useCallback(
    (imgWidth: number, imgHeight: number, canvasWidth: number, canvasHeight: number): number => {
      return Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)
    },
    [],
  )

  const calculateCenterPosition = useCallback(
    (
      imgWidth: number,
      imgHeight: number,
      canvasWidth: number,
      canvasHeight: number,
      scale: number,
    ): { x: number; y: number } => {
      const scaledWidth = imgWidth * scale
      const scaledHeight = imgHeight * scale
      return {
        x: (canvasWidth - scaledWidth) / 2,
        y: (canvasHeight - scaledHeight) / 2,
      }
    },
    [],
  )

  // TODO: 블러 처리 시 Web Worker 활용하여 성능 개선
  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, img?: HTMLImageElement) => {
      const { type, solidColor, blurIntensity, gradientColors, gradientDirection } = backgroundSettings

      ctx.save()

      if (type === "solid") {
        ctx.fillStyle = solidColor
        ctx.fillRect(0, 0, width, height)
      } else if (type === "gradient") {
        const angle = (gradientDirection * Math.PI) / 180
        const x1 = width / 2 - (Math.cos(angle) * width) / 2
        const y1 = height / 2 - (Math.sin(angle) * height) / 2
        const x2 = width / 2 + (Math.cos(angle) * width) / 2
        const y2 = height / 2 + (Math.sin(angle) * height) / 2

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
        gradient.addColorStop(0, gradientColors[0])
        gradient.addColorStop(1, gradientColors[1])

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      } else if (type === "blur" && img) {
        ctx.filter = `blur(${blurIntensity}px)`
        const bgScale = Math.max(width / img.width, height / img.height) * 1.1
        const bgWidth = img.width * bgScale
        const bgHeight = img.height * bgScale
        const bgX = (width - bgWidth) / 2
        const bgY = (height - bgHeight) / 2
        ctx.drawImage(img, bgX, bgY, bgWidth, bgHeight)
        ctx.filter = "none"
      } else {
        ctx.fillStyle = "#000000"
        ctx.fillRect(0, 0, width, height)
      }

      ctx.restore()
    },
    [backgroundSettings],
  )

  const renderToCanvas = useCallback(
    async (canvas: HTMLCanvasElement, imageSrc: string | null): Promise<void> => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const multiplier = useHighResolution ? OUTPUT_RESOLUTIONS.high.multiplier : OUTPUT_RESOLUTIONS.standard.multiplier
      const logicalWidth = template.width
      const logicalHeight = template.height

      const renderWidth = Math.min(logicalWidth * multiplier, MAX_CANVAS_DIMENSION)
      const renderHeight = Math.min(logicalHeight * multiplier, MAX_CANVAS_DIMENSION)

      canvas.width = renderWidth
      canvas.height = renderHeight

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      const renderScale = renderWidth / logicalWidth
      ctx.scale(renderScale, renderScale)

      if (!imageSrc) {
        drawBackground(ctx, logicalWidth, logicalHeight)
        return
      }

      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise<void>((resolve, reject) => {
        img.onload = async () => {
          try {
            const processedImg = await downsampleLargeImage(img)
            drawBackground(ctx, logicalWidth, logicalHeight, processedImg)

            const scale = calculateScaleFactor(processedImg.width, processedImg.height, logicalWidth, logicalHeight)
            const { x, y } = calculateCenterPosition(
              processedImg.width,
              processedImg.height,
              logicalWidth,
              logicalHeight,
              scale,
            )

            ctx.drawImage(processedImg, x, y, processedImg.width * scale, processedImg.height * scale)
            resolve()
          } catch (error) {
            reject(error)
          }
        }
        img.onerror = reject
        img.src = imageSrc
      })
    },
    [template, useHighResolution, drawBackground, downsampleLargeImage, calculateScaleFactor, calculateCenterPosition],
  )

  // TODO: PNG/WebP 포맷 지원 추가
  const exportToBlob = useCallback(async (canvas: HTMLCanvasElement): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95)
    })
  }, [])

  return {
    renderToCanvas,
    exportToBlob,
    cleanup,
  }
}
