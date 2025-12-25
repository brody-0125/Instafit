import '@testing-library/react'
import { vi } from 'vitest'

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  scale: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high',
  filter: '',
  fillStyle: '',
})) as unknown as typeof HTMLCanvasElement.prototype.getContext

HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  callback(new Blob(['test'], { type: 'image/jpeg' }))
})

// Mock URL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
}
global.localStorage = localStorageMock as Storage
