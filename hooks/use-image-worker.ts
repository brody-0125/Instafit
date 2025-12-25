"use client"

import { useCallback, useEffect, useRef } from "react"

interface WorkerResult {
  type: string
  imageData?: ImageData
  message?: string
}

export function useImageWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingCallbacks = useRef<Map<string, (result: WorkerResult) => void>>(new Map())

  useEffect(() => {
    // Create worker on mount
    if (typeof window !== "undefined" && window.Worker) {
      try {
        workerRef.current = new Worker(
          new URL("../workers/image-processor.worker.ts", import.meta.url)
        )

        workerRef.current.onmessage = (event: MessageEvent<WorkerResult>) => {
          const { type } = event.data
          const callback = pendingCallbacks.current.get(type)
          if (callback) {
            callback(event.data)
            pendingCallbacks.current.delete(type)
          }
        }

        workerRef.current.onerror = (error) => {
          console.error("[ImageWorker] Error:", error)
        }
      } catch (error) {
        console.warn("[ImageWorker] Failed to create worker:", error)
      }
    }

    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
      pendingCallbacks.current.clear()
    }
  }, [])

  const downsampleImage = useCallback(
    async (imageData: ImageData, maxDimension: number): Promise<ImageData | null> => {
      if (!workerRef.current) {
        console.warn("[ImageWorker] Worker not available, using fallback")
        return null
      }

      return new Promise((resolve) => {
        pendingCallbacks.current.set("downsampleResult", (result) => {
          resolve(result.imageData || null)
        })

        workerRef.current!.postMessage(
          { type: "downsample", imageData, maxDimension },
          [imageData.data.buffer]
        )
      })
    },
    []
  )

  const createBlurredBackground = useCallback(
    async (
      imageData: ImageData,
      canvasWidth: number,
      canvasHeight: number,
      blurIntensity: number
    ): Promise<ImageData | null> => {
      if (!workerRef.current) {
        console.warn("[ImageWorker] Worker not available, using fallback")
        return null
      }

      return new Promise((resolve) => {
        pendingCallbacks.current.set("blurredBackgroundResult", (result) => {
          resolve(result.imageData || null)
        })

        workerRef.current!.postMessage(
          { type: "createBlurredBackground", imageData, canvasWidth, canvasHeight, blurIntensity },
          [imageData.data.buffer]
        )
      })
    },
    []
  )

  const isAvailable = useCallback(() => {
    return workerRef.current !== null
  }, [])

  return {
    downsampleImage,
    createBlurredBackground,
    isAvailable,
  }
}
