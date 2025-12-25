import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { I18nProvider, useI18n } from '@/lib/i18n/context'
import { translations } from '@/lib/i18n/translations'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
)

describe('I18n Context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should provide default Korean locale', () => {
    const { result } = renderHook(() => useI18n(), { wrapper })

    expect(result.current.locale).toBe('ko')
    expect(result.current.t.header.title).toBe('Instafit')
  })

  it('should change locale to English', () => {
    const { result } = renderHook(() => useI18n(), { wrapper })

    act(() => {
      result.current.setLocale('en')
    })

    expect(result.current.locale).toBe('en')
    expect(result.current.t.template.square).toBe('Feed Square')
  })

  it('should change locale to Japanese', () => {
    const { result } = renderHook(() => useI18n(), { wrapper })

    act(() => {
      result.current.setLocale('ja')
    })

    expect(result.current.locale).toBe('ja')
    expect(result.current.t.template.portrait).toBe('ストーリー / リール')
  })

  it('should persist locale to localStorage', () => {
    const { result } = renderHook(() => useI18n(), { wrapper })

    act(() => {
      result.current.setLocale('en')
    })

    expect(localStorage.setItem).toHaveBeenCalledWith('instafit-locale', 'en')
  })

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useI18n())
    }).toThrow('useI18n must be used within an I18nProvider')
  })
})

describe('Translations', () => {
  it('should have all required keys in Korean', () => {
    const ko = translations.ko

    expect(ko.meta.title).toBeDefined()
    expect(ko.header.title).toBeDefined()
    expect(ko.step.upload).toBeDefined()
    expect(ko.upload.dragDrop).toBeDefined()
    expect(ko.template.square).toBeDefined()
    expect(ko.background.solid).toBeDefined()
    expect(ko.preview.empty).toBeDefined()
    expect(ko.action.download).toBeDefined()
    expect(ko.toast.uploadSuccess).toBeDefined()
  })

  it('should have all required keys in English', () => {
    const en = translations.en

    expect(en.meta.title).toBeDefined()
    expect(en.header.title).toBeDefined()
    expect(en.step.upload).toBeDefined()
    expect(en.upload.dragDrop).toBeDefined()
    expect(en.template.square).toBeDefined()
    expect(en.background.solid).toBeDefined()
    expect(en.preview.empty).toBeDefined()
    expect(en.action.download).toBeDefined()
    expect(en.toast.uploadSuccess).toBeDefined()
  })

  it('should have all required keys in Japanese', () => {
    const ja = translations.ja

    expect(ja.meta.title).toBeDefined()
    expect(ja.header.title).toBeDefined()
    expect(ja.step.upload).toBeDefined()
    expect(ja.upload.dragDrop).toBeDefined()
    expect(ja.template.square).toBeDefined()
    expect(ja.background.solid).toBeDefined()
    expect(ja.preview.empty).toBeDefined()
    expect(ja.action.download).toBeDefined()
    expect(ja.toast.uploadSuccess).toBeDefined()
  })

  it('should have consistent structure across all locales', () => {
    const koKeys = Object.keys(translations.ko)
    const enKeys = Object.keys(translations.en)
    const jaKeys = Object.keys(translations.ja)

    expect(koKeys).toEqual(enKeys)
    expect(koKeys).toEqual(jaKeys)
  })
})
