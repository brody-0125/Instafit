"use client"

import { useCallback, useRef, useState } from "react"

export interface BrushPoint {
  x: number
  y: number
}

export interface BrushStroke {
  points: BrushPoint[]
  size: number
}

export interface BrushSettings {
  enabled: boolean
  brushSize: number     // 10-100px
  blockSize: number     // 5-50px (mosaic block size)
}

export const DEFAULT_BRUSH_SETTINGS: BrushSettings = {
  enabled: false,
  brushSize: 30,
  blockSize: 15,
}

interface UseBrushOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  logicalWidth: number
  logicalHeight: number
}

export function useBrush({ canvasRef, logicalWidth, logicalHeight }: UseBrushOptions) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState<BrushStroke[]>([])
  const currentStrokeRef = useRef<BrushStroke | null>(null)

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number): BrushPoint | null => {
      const canvas = canvasRef.current
      if (!canvas) return null

      const rect = canvas.getBoundingClientRect()
      const scaleX = logicalWidth / rect.width
      const scaleY = logicalHeight / rect.height

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      }
    },
    [canvasRef, logicalWidth, logicalHeight],
  )

  const startStroke = useCallback(
    (clientX: number, clientY: number, brushSize: number) => {
      const point = getCanvasPoint(clientX, clientY)
      if (!point) return

      currentStrokeRef.current = { points: [point], size: brushSize }
      setIsDrawing(true)
    },
    [getCanvasPoint],
  )

  const addPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!currentStrokeRef.current) return

      const point = getCanvasPoint(clientX, clientY)
      if (!point) return

      currentStrokeRef.current.points.push(point)
    },
    [getCanvasPoint],
  )

  const endStroke = useCallback(() => {
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      setStrokes((prev) => [...prev, currentStrokeRef.current!])
    }
    currentStrokeRef.current = null
    setIsDrawing(false)
  }, [])

  const clearStrokes = useCallback(() => {
    setStrokes([])
    currentStrokeRef.current = null
    setIsDrawing(false)
  }, [])

  // Convert strokes to rectangular regions for the Worker's mosaic function
  const strokesToRegions = useCallback(
    (allStrokes: BrushStroke[]): Array<{ x: number; y: number; width: number; height: number }> => {
      const regions: Array<{ x: number; y: number; width: number; height: number }> = []

      for (const stroke of allStrokes) {
        for (const point of stroke.points) {
          const half = stroke.size / 2
          regions.push({
            x: point.x - half,
            y: point.y - half,
            width: stroke.size,
            height: stroke.size,
          })
        }
      }

      return regions
    },
    [],
  )

  return {
    isDrawing,
    strokes,
    startStroke,
    addPoint,
    endStroke,
    clearStrokes,
    strokesToRegions,
    getCurrentStroke: () => currentStrokeRef.current,
  }
}
