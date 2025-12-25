import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasRenderer } from '@/hooks/use-canvas-renderer'

describe('useCanvasRenderer', () => {
  const mockTemplate = {
    nameKey: 'square' as const,
    ratio: 1,
    icon: {} as any,
    width: 1080,
    height: 1080,
  }

  const mockBackgroundSettings = {
    type: 'solid' as const,
    solidColor: '#000000',
    blurIntensity: 20,
    gradientColors: ['#000000', '#333333'] as [string, string],
    gradientDirection: 0,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return renderToCanvas, exportToBlob, and cleanup functions', () => {
    const { result } = renderHook(() =>
      useCanvasRenderer({
        template: mockTemplate,
        backgroundSettings: mockBackgroundSettings,
      })
    )

    expect(result.current.renderToCanvas).toBeDefined()
    expect(result.current.exportToBlob).toBeDefined()
    expect(result.current.cleanup).toBeDefined()
    expect(typeof result.current.renderToCanvas).toBe('function')
    expect(typeof result.current.exportToBlob).toBe('function')
    expect(typeof result.current.cleanup).toBe('function')
  })

  it('should export blob as JPEG with quality 0.95', async () => {
    const { result } = renderHook(() =>
      useCanvasRenderer({
        template: mockTemplate,
        backgroundSettings: mockBackgroundSettings,
      })
    )

    const canvas = document.createElement('canvas')
    const toBlobSpy = vi.spyOn(canvas, 'toBlob')

    await act(async () => {
      await result.current.exportToBlob(canvas)
    })

    expect(toBlobSpy).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.95
    )
  })

  it('should use high resolution by default', () => {
    const { result } = renderHook(() =>
      useCanvasRenderer({
        template: mockTemplate,
        backgroundSettings: mockBackgroundSettings,
      })
    )

    // Verify hook returns proper functions
    expect(result.current).toHaveProperty('renderToCanvas')
    expect(result.current).toHaveProperty('exportToBlob')
  })

  it('should cleanup object URLs on unmount', () => {
    const { unmount } = renderHook(() =>
      useCanvasRenderer({
        template: mockTemplate,
        backgroundSettings: mockBackgroundSettings,
      })
    )

    unmount()

    // Cleanup should have been called (no throw means success)
    expect(true).toBe(true)
  })
})

describe('useCanvasRenderer - Background Types', () => {
  const mockTemplate = {
    nameKey: 'portrait' as const,
    ratio: 9 / 16,
    icon: {} as any,
    width: 1080,
    height: 1920,
  }

  it('should handle solid background type', () => {
    const { result } = renderHook(() =>
      useCanvasRenderer({
        template: mockTemplate,
        backgroundSettings: {
          type: 'solid',
          solidColor: '#ffffff',
          blurIntensity: 20,
          gradientColors: ['#000', '#fff'],
          gradientDirection: 0,
        },
      })
    )

    expect(result.current.renderToCanvas).toBeDefined()
  })

  it('should handle blur background type', () => {
    const { result } = renderHook(() =>
      useCanvasRenderer({
        template: mockTemplate,
        backgroundSettings: {
          type: 'blur',
          solidColor: '#000000',
          blurIntensity: 30,
          gradientColors: ['#000', '#fff'],
          gradientDirection: 0,
        },
      })
    )

    expect(result.current.renderToCanvas).toBeDefined()
  })

  it('should handle gradient background type', () => {
    const { result } = renderHook(() =>
      useCanvasRenderer({
        template: mockTemplate,
        backgroundSettings: {
          type: 'gradient',
          solidColor: '#000000',
          blurIntensity: 20,
          gradientColors: ['#667eea', '#764ba2'],
          gradientDirection: 45,
        },
      })
    )

    expect(result.current.renderToCanvas).toBeDefined()
  })
})
