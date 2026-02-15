"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react"
import { useCanvasRenderer } from "@/hooks/use-canvas-renderer"
import type { Template, BackgroundSettings } from "@/types/editor"

interface ImageCanvasProps {
  image: string | null
  template: Template
  backgroundSettings: BackgroundSettings
}

const MAX_PREVIEW_WIDTH = 500
const DEBOUNCE_MS = 150

export const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(
  ({ image, template, backgroundSettings }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isRendering, setIsRendering] = useState(false)
    const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastRenderKeyRef = useRef<string>("")

    useImperativeHandle(ref, () => canvasRef.current!, [])

    const { renderToCanvas } = useCanvasRenderer({
      template,
      backgroundSettings,
      useHighResolution: true,
    })

    const getRenderKey = useCallback(() => {
      return JSON.stringify({
        image,
        tw: template.width,
        th: template.height,
        bt: backgroundSettings.type,
        sc: backgroundSettings.solidColor,
        bi: backgroundSettings.blurIntensity,
        gc: backgroundSettings.gradientColors,
        gd: backgroundSettings.gradientDirection,
      })
    }, [image, template, backgroundSettings])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const renderKey = getRenderKey()

      // Skip if nothing changed
      if (renderKey === lastRenderKeyRef.current) return

      let isCancelled = false

      // Clear any pending debounced render
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current)
      }

      const executeRender = async () => {
        if (isCancelled) return

        setIsRendering(true)
        try {
          await renderToCanvas(canvas, image)
          if (!isCancelled) {
            lastRenderKeyRef.current = renderKey
          }
        } catch (error) {
          console.error("[v0] Canvas rendering failed:", error)
        } finally {
          if (!isCancelled) {
            setIsRendering(false)
          }
        }
      }

      // Debounce slider-driven changes (blur intensity, gradient direction)
      const isSliderChange =
        lastRenderKeyRef.current !== "" &&
        image === JSON.parse(lastRenderKeyRef.current || "{}").image

      if (isSliderChange) {
        renderTimerRef.current = setTimeout(executeRender, DEBOUNCE_MS)
      } else {
        executeRender()
      }

      return () => {
        isCancelled = true
        if (renderTimerRef.current) {
          clearTimeout(renderTimerRef.current)
        }
      }
    }, [image, template, backgroundSettings, renderToCanvas, getRenderKey])

    // Cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (renderTimerRef.current) {
          clearTimeout(renderTimerRef.current)
        }
      }
    }, [])

    const displayWidth = Math.min(MAX_PREVIEW_WIDTH, template.width / 2)
    const displayHeight = displayWidth / template.ratio

    return (
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-border rounded-lg shadow-lg"
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
          }}
          aria-label={`Preview canvas for ${template.nameKey} template`}
        />
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Rendering...</div>
          </div>
        )}
      </div>
    )
  },
)

ImageCanvas.displayName = "ImageCanvas"
