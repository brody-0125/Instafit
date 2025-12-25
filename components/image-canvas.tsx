"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useCanvasRenderer } from "@/hooks/use-canvas-renderer"
import type { Template, BackgroundSettings } from "@/types/editor"

interface ImageCanvasProps {
  image: string | null
  template: Template
  backgroundSettings: BackgroundSettings
}

const MAX_PREVIEW_WIDTH = 500

export const ImageCanvas = forwardRef<HTMLCanvasElement, ImageCanvasProps>(
  ({ image, template, backgroundSettings }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isRendering, setIsRendering] = useState(false)

    useImperativeHandle(ref, () => canvasRef.current!, [])

    const { renderToCanvas } = useCanvasRenderer({
      template,
      backgroundSettings,
      useHighResolution: true,
    })

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      let isCancelled = false

      const render = async () => {
        setIsRendering(true)
        try {
          if (!isCancelled) {
            await renderToCanvas(canvas, image)
          }
        } catch (error) {
          console.error("[v0] Canvas rendering failed:", error)
        } finally {
          if (!isCancelled) {
            setIsRendering(false)
          }
        }
      }

      render()

      return () => {
        isCancelled = true
      }
    }, [image, template, backgroundSettings, renderToCanvas])

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
