import type { LucideIcon } from "lucide-react"

export interface Template {
  nameKey: "square" | "portrait" | "landscape"
  ratio: number
  icon: LucideIcon
  width: number
  height: number
}

export type TemplateType = "square" | "portrait" | "landscape"

export type BackgroundType = "solid" | "blur" | "gradient"

export interface BackgroundSettings {
  type: BackgroundType
  solidColor: string
  blurIntensity: number
  gradientColors: [string, string]
  gradientDirection: number
}

export interface ImageItem {
  id: string
  url: string
  fileName: string
  template: TemplateType
  backgroundSettings: BackgroundSettings
}

export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  type: "solid",
  solidColor: "#000000",
  blurIntensity: 20,
  gradientColors: ["#000000", "#333333"],
  gradientDirection: 0,
}
