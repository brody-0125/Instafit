// Image Processing Web Worker
// Handles heavy image operations off the main thread
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

type WorkerMessage = ProcessImageMessage | DownsampleMessage | CreateBlurredBackgroundMessage

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

// Separable box blur: horizontal + vertical passes with sliding window
// O(width * height * 2) instead of O(width * height * (2*radius+1)²)
function boxBlur(imageData: ImageData, radius: number): ImageData {
  const { width, height, data } = imageData
  const temp = new ImageData(width, height)
  const result = new ImageData(width, height)

  // Horizontal pass (sliding window)
  for (let y = 0; y < height; y++) {
    let r = 0, g = 0, b = 0, a = 0

    // Initialize window for first pixel in row
    for (let dx = 0; dx <= radius; dx++) {
      const nx = Math.min(dx, width - 1)
      const idx = (y * width + nx) * 4
      r += data[idx]
      g += data[idx + 1]
      b += data[idx + 2]
      a += data[idx + 3]
    }
    // Add clamped left side (all map to pixel 0)
    const leftIdx = (y * width) * 4
    r += data[leftIdx] * radius
    g += data[leftIdx + 1] * radius
    b += data[leftIdx + 2] * radius
    a += data[leftIdx + 3] * radius

    const size = radius * 2 + 1

    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4
      temp.data[dstIdx] = Math.round(r / size)
      temp.data[dstIdx + 1] = Math.round(g / size)
      temp.data[dstIdx + 2] = Math.round(b / size)
      temp.data[dstIdx + 3] = Math.round(a / size)

      // Slide window: add right pixel, remove left pixel
      const addX = Math.min(x + radius + 1, width - 1)
      const remX = Math.max(x - radius, 0)
      const addIdx = (y * width + addX) * 4
      const remIdx = (y * width + remX) * 4

      r += data[addIdx] - data[remIdx]
      g += data[addIdx + 1] - data[remIdx + 1]
      b += data[addIdx + 2] - data[remIdx + 2]
      a += data[addIdx + 3] - data[remIdx + 3]
    }
  }

  // Vertical pass (sliding window on temp result)
  const tmpData = temp.data
  for (let x = 0; x < width; x++) {
    let r = 0, g = 0, b = 0, a = 0

    // Initialize window for first pixel in column
    for (let dy = 0; dy <= radius; dy++) {
      const ny = Math.min(dy, height - 1)
      const idx = (ny * width + x) * 4
      r += tmpData[idx]
      g += tmpData[idx + 1]
      b += tmpData[idx + 2]
      a += tmpData[idx + 3]
    }
    // Add clamped top side (all map to pixel 0)
    const topIdx = x * 4
    r += tmpData[topIdx] * radius
    g += tmpData[topIdx + 1] * radius
    b += tmpData[topIdx + 2] * radius
    a += tmpData[topIdx + 3] * radius

    const size = radius * 2 + 1

    for (let y = 0; y < height; y++) {
      const dstIdx = (y * width + x) * 4
      result.data[dstIdx] = Math.round(r / size)
      result.data[dstIdx + 1] = Math.round(g / size)
      result.data[dstIdx + 2] = Math.round(b / size)
      result.data[dstIdx + 3] = Math.round(a / size)

      // Slide window: add bottom pixel, remove top pixel
      const addY = Math.min(y + radius + 1, height - 1)
      const remY = Math.max(y - radius, 0)
      const addIdx = (addY * width + x) * 4
      const remIdx = (remY * width + x) * 4

      r += tmpData[addIdx] - tmpData[remIdx]
      g += tmpData[addIdx + 1] - tmpData[remIdx + 1]
      b += tmpData[addIdx + 2] - tmpData[remIdx + 2]
      a += tmpData[addIdx + 3] - tmpData[remIdx + 3]
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
