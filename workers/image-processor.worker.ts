// Image Processing Web Worker
// Handles heavy image operations off the main thread
// TODO: Separable blur 알고리즘 적용으로 성능 개선 (O(n²) → O(2n))
// TODO: SIMD 또는 WebAssembly 활용하여 이미지 처리 속도 향상

interface ProcessImageMessage {
  type: "process"
  imageData: ImageData
  targetWidth: number
  targetHeight: number
}

interface DownsampleMessage {
  type: "downsample"
  imageData: ImageData
  maxDimension: number
}

interface CreateBlurredBackgroundMessage {
  type: "createBlurredBackground"
  imageData: ImageData
  canvasWidth: number
  canvasHeight: number
  blurIntensity: number
}

interface MosaicMessage {
  type: "mosaic"
  imageData: ImageData
  regions: Array<{ x: number; y: number; width: number; height: number }>
  blockSize: number
}

type WorkerMessage = ProcessImageMessage | DownsampleMessage | CreateBlurredBackgroundMessage | MosaicMessage

// Bilinear interpolation for high-quality downsampling
function bilinearInterpolate(
  srcData: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number
): ImageData {
  const dstData = new ImageData(dstWidth, dstHeight)
  const dst = dstData.data

  const xRatio = srcWidth / dstWidth
  const yRatio = srcHeight / dstHeight

  for (let y = 0; y < dstHeight; y++) {
    for (let x = 0; x < dstWidth; x++) {
      const srcX = x * xRatio
      const srcY = y * yRatio

      const x1 = Math.floor(srcX)
      const y1 = Math.floor(srcY)
      const x2 = Math.min(x1 + 1, srcWidth - 1)
      const y2 = Math.min(y1 + 1, srcHeight - 1)

      const xFrac = srcX - x1
      const yFrac = srcY - y1

      const dstIdx = (y * dstWidth + x) * 4

      for (let c = 0; c < 4; c++) {
        const tl = srcData[(y1 * srcWidth + x1) * 4 + c]
        const tr = srcData[(y1 * srcWidth + x2) * 4 + c]
        const bl = srcData[(y2 * srcWidth + x1) * 4 + c]
        const br = srcData[(y2 * srcWidth + x2) * 4 + c]

        const top = tl + (tr - tl) * xFrac
        const bottom = bl + (br - bl) * xFrac
        dst[dstIdx + c] = Math.round(top + (bottom - top) * yFrac)
      }
    }
  }

  return dstData
}

// Box blur for background effect
function boxBlur(imageData: ImageData, radius: number): ImageData {
  const { width, height, data } = imageData
  const result = new ImageData(width, height)
  const dst = result.data

  const size = radius * 2 + 1
  const area = size * size

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0
      let count = 0

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.min(Math.max(x + dx, 0), width - 1)
          const ny = Math.min(Math.max(y + dy, 0), height - 1)
          const idx = (ny * width + nx) * 4

          r += data[idx]
          g += data[idx + 1]
          b += data[idx + 2]
          a += data[idx + 3]
          count++
        }
      }

      const dstIdx = (y * width + x) * 4
      dst[dstIdx] = Math.round(r / count)
      dst[dstIdx + 1] = Math.round(g / count)
      dst[dstIdx + 2] = Math.round(b / count)
      dst[dstIdx + 3] = Math.round(a / count)
    }
  }

  return result
}

// Downsample large image
function downsampleImage(imageData: ImageData, maxDimension: number): ImageData {
  const { width, height } = imageData
  const maxDim = Math.max(width, height)

  if (maxDim <= maxDimension) {
    return imageData
  }

  const scale = maxDimension / maxDim
  const newWidth = Math.floor(width * scale)
  const newHeight = Math.floor(height * scale)

  return bilinearInterpolate(imageData.data, width, height, newWidth, newHeight)
}

// Create blurred background
function createBlurredBackground(
  imageData: ImageData,
  canvasWidth: number,
  canvasHeight: number,
  blurIntensity: number
): ImageData {
  // First, scale image to fit canvas with 1.1x zoom
  const scale = Math.max(canvasWidth / imageData.width, canvasHeight / imageData.height) * 1.1
  const scaledWidth = Math.floor(imageData.width * scale)
  const scaledHeight = Math.floor(imageData.height * scale)

  // Interpolate to scaled size
  const scaled = bilinearInterpolate(
    imageData.data,
    imageData.width,
    imageData.height,
    scaledWidth,
    scaledHeight
  )

  // Apply blur (multiple passes for stronger effect)
  let blurred = scaled
  const passes = Math.ceil(blurIntensity / 10)
  const radius = Math.min(Math.floor(blurIntensity / passes), 15)

  for (let i = 0; i < passes; i++) {
    blurred = boxBlur(blurred, radius)
  }

  // Crop to canvas size (centered)
  const result = new ImageData(canvasWidth, canvasHeight)
  const offsetX = Math.floor((scaledWidth - canvasWidth) / 2)
  const offsetY = Math.floor((scaledHeight - canvasHeight) / 2)

  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const srcX = Math.min(Math.max(x + offsetX, 0), scaledWidth - 1)
      const srcY = Math.min(Math.max(y + offsetY, 0), scaledHeight - 1)
      const srcIdx = (srcY * scaledWidth + srcX) * 4
      const dstIdx = (y * canvasWidth + x) * 4

      result.data[dstIdx] = blurred.data[srcIdx]
      result.data[dstIdx + 1] = blurred.data[srcIdx + 1]
      result.data[dstIdx + 2] = blurred.data[srcIdx + 2]
      result.data[dstIdx + 3] = blurred.data[srcIdx + 3]
    }
  }

  return result
}

// Apply mosaic (pixelation) to specified regions
function applyMosaic(
  imageData: ImageData,
  regions: Array<{ x: number; y: number; width: number; height: number }>,
  blockSize: number
): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  )
  const { width, height } = result
  const data = result.data

  for (const region of regions) {
    const startX = Math.max(0, Math.floor(region.x))
    const startY = Math.max(0, Math.floor(region.y))
    const endX = Math.min(width, Math.ceil(region.x + region.width))
    const endY = Math.min(height, Math.ceil(region.y + region.height))

    for (let by = startY; by < endY; by += blockSize) {
      for (let bx = startX; bx < endX; bx += blockSize) {
        const blockEndX = Math.min(bx + blockSize, endX)
        const blockEndY = Math.min(by + blockSize, endY)
        const blockW = blockEndX - bx
        const blockH = blockEndY - by
        const count = blockW * blockH

        let r = 0, g = 0, b = 0, a = 0

        // Average color in block
        for (let py = by; py < blockEndY; py++) {
          for (let px = bx; px < blockEndX; px++) {
            const idx = (py * width + px) * 4
            r += data[idx]
            g += data[idx + 1]
            b += data[idx + 2]
            a += data[idx + 3]
          }
        }

        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)
        a = Math.round(a / count)

        // Fill block with average color
        for (let py = by; py < blockEndY; py++) {
          for (let px = bx; px < blockEndX; px++) {
            const idx = (py * width + px) * 4
            data[idx] = r
            data[idx + 1] = g
            data[idx + 2] = b
            data[idx + 3] = a
          }
        }
      }
    }
  }

  return result
}

// Web Worker context
const ctx = self as unknown as Worker

// Message handler
ctx.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data

  try {
    switch (type) {
      case "downsample": {
        const { imageData, maxDimension } = event.data as DownsampleMessage
        const result = downsampleImage(imageData, maxDimension)
        ctx.postMessage(
          { type: "downsampleResult", imageData: result },
          [result.data.buffer]
        )
        break
      }

      case "createBlurredBackground": {
        const { imageData, canvasWidth, canvasHeight, blurIntensity } =
          event.data as CreateBlurredBackgroundMessage
        const result = createBlurredBackground(imageData, canvasWidth, canvasHeight, blurIntensity)
        ctx.postMessage(
          { type: "blurredBackgroundResult", imageData: result },
          [result.data.buffer]
        )
        break
      }

      case "mosaic": {
        const { imageData, regions, blockSize } = event.data as MosaicMessage
        const result = applyMosaic(imageData, regions, blockSize)
        ctx.postMessage(
          { type: "mosaicResult", imageData: result },
          [result.data.buffer]
        )
        break
      }

      default:
        ctx.postMessage({ type: "error", message: `Unknown message type: ${type}` })
    }
  } catch (error) {
    ctx.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export {}
