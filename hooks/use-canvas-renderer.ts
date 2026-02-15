"use client"

import { useCallback, useRef, useEffect } from "react"
import { useImageWorker } from "./use-image-worker"

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

function imageToImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement("canvas")
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(img, 0, 0)
  return ctx.getImageData(0, 0, img.width, img.height)
}

export function useCanvasRenderer(options: UseCanvasRendererOptions) {
  const { template, backgroundSettings, useHighResolution = true } = options
  const imageObjectUrlRef = useRef<string | null>(null)
  const { downsampleImage, createBlurredBackground, isAvailable } = useImageWorker()

  const cleanup = useCallback(() => {
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current)
      imageObjectUrlRef.current = null
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const downsampleLargeImage = useCallback(async (img: HTMLImageElement): Promise<HTMLImageElement> => {
    const { width, height } = img
    const maxDimension = Math.max(width, height)

    if (maxDimension <= MAX_INPUT_DIMENSION) {
      return img
    }

    // Try Worker-based downsampling first
    if (isAvailable()) {
      const srcData = imageToImageData(img)
      const result = await downsampleImage(srcData, MAX_INPUT_DIMENSION)
      if (result) {
        const offscreen = document.createElement("canvas")
        offscreen.width = result.width
        offscreen.height = result.height
        const offCtx = offscreen.getContext("2d")!
        offCtx.putImageData(result, 0, 0)

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
      }
    }

    // Fallback: main thread downsampling
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
  }, [downsampleImage, isAvailable])

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

  const drawBlurBackground = useCallback(
    async (ctx: CanvasRenderingContext2D, width: number, height: number, img: HTMLImageElement) => {
      const { blurIntensity } = backgroundSettings

      // Try Worker-based blur
      if (isAvailable()) {
        const srcData = imageToImageData(img)
        const result = await createBlurredBackground(srcData, width, height, blurIntensity)
        if (result) {
          ctx.putImageData(result, 0, 0)
          return
        }
      }

      // Fallback: CSS filter blur on main thread
      ctx.save()
      ctx.filter = `blur(${blurIntensity}px)`
      const bgScale = Math.max(width / img.width, height / img.height) * 1.1
      const bgWidth = img.width * bgScale
      const bgHeight = img.height * bgScale
      const bgX = (width - bgWidth) / 2
      const bgY = (height - bgHeight) / 2
      ctx.drawImage(img, bgX, bgY, bgWidth, bgHeight)
      ctx.filter = "none"
      ctx.restore()
    },
    [backgroundSettings, createBlurredBackground, isAvailable],
  )

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const { type, solidColor, gradientColors, gradientDirection } = backgroundSettings

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

            if (backgroundSettings.type === "blur") {
              await drawBlurBackground(ctx, logicalWidth, logicalHeight, processedImg)
            } else {
              drawBackground(ctx, logicalWidth, logicalHeight)
            }

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
    [template, useHighResolution, backgroundSettings.type, drawBackground, drawBlurBackground, downsampleLargeImage, calculateScaleFactor, calculateCenterPosition],
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
