"use client"

import { useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

type BackgroundType = "solid" | "blur" | "gradient"

interface BackgroundSettings {
  type: BackgroundType
  solidColor: string
  blurIntensity: number
  gradientColors: [string, string]
  gradientDirection: number
}

interface BackgroundControlsProps {
  settings: BackgroundSettings
  onSettingsChange: (settings: BackgroundSettings) => void
  disabled?: boolean
}

const COLOR_PRESETS = [
  "#000000", // Black
  "#FFFFFF", // White
  "#F3F4F6", // Light Gray
  "#1F2937", // Dark Gray
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
]

const GRADIENT_PRESETS: Array<{ colors: [string, string]; label: string }> = [
  { colors: ["#667eea", "#764ba2"], label: "Purple" },
  { colors: ["#f093fb", "#f5576c"], label: "Pink" },
  { colors: ["#4facfe", "#00f2fe"], label: "Ocean" },
  { colors: ["#43e97b", "#38f9d7"], label: "Mint" },
]

export function BackgroundControls({ settings, onSettingsChange, disabled }: BackgroundControlsProps) {
  const { t } = useI18n()

  const updateSettings = useCallback(
    (updates: Partial<BackgroundSettings>) => {
      onSettingsChange({ ...settings, ...updates })
    },
    [settings, onSettingsChange],
  )

  const handleHexInput = useCallback(
    (value: string, key: "solidColor" | "gradientStart" | "gradientEnd") => {
      const cleanValue = value.startsWith("#") ? value : `#${value}`
      if (key === "solidColor") {
        updateSettings({ solidColor: cleanValue })
      } else if (key === "gradientStart") {
        updateSettings({ gradientColors: [cleanValue, settings.gradientColors[1]] })
      } else {
        updateSettings({ gradientColors: [settings.gradientColors[0], cleanValue] })
      }
    },
    [settings.gradientColors, updateSettings],
  )

  return (
    <Tabs
      value={settings.type}
      onValueChange={(value) => updateSettings({ type: value as BackgroundType })}
      className={cn(disabled && "opacity-50 pointer-events-none")}
    >
      <TabsList className="grid w-full grid-cols-3 h-11">
        <TabsTrigger value="solid" className="text-xs touch-manipulation min-h-[40px]">
          {t.background.solid}
        </TabsTrigger>
        <TabsTrigger value="blur" className="text-xs touch-manipulation min-h-[40px]">
          {t.background.blur}
        </TabsTrigger>
        <TabsTrigger value="gradient" className="text-xs touch-manipulation min-h-[40px]">
          {t.background.gradient}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="solid" className="space-y-4 mt-4">
        <div>
          <Label className="text-xs font-medium mb-2 block text-muted-foreground">{t.background.presets}</Label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => updateSettings({ solidColor: color })}
                className={cn(
                  "w-10 h-10 rounded-lg border-2 transition-all touch-manipulation select-none",
                  "active:scale-95",
                  settings.solidColor === color
                    ? "border-primary scale-110 ring-2 ring-primary/20"
                    : "border-transparent hover:scale-105",
                )}
                style={{ backgroundColor: color, touchAction: "manipulation" }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium mb-2 block text-muted-foreground">{t.background.customColor}</Label>
          <div className="flex gap-2">
            <div className="relative w-14 h-11">
              <Input
                type="color"
                value={settings.solidColor}
                onChange={(e) => updateSettings({ solidColor: e.target.value })}
                className="absolute inset-0 w-full h-full p-1 border rounded-lg cursor-pointer touch-manipulation"
                style={{ touchAction: "manipulation" }}
              />
            </div>
            <Input
              type="text"
              value={settings.solidColor}
              onChange={(e) => handleHexInput(e.target.value, "solidColor")}
              className="flex-1 font-mono text-sm h-11"
              placeholder="#000000"
              maxLength={7}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="blur" className="space-y-4 mt-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-medium text-muted-foreground">{t.background.blurIntensity}</Label>
            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{settings.blurIntensity}px</span>
          </div>
          <div className="slider-touch-area">
            <Slider
              value={[settings.blurIntensity]}
              onValueChange={([value]) => updateSettings({ blurIntensity: value })}
              max={50}
              min={5}
              step={1}
              className="w-full touch-manipulation"
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>{t.background.subtle}</span>
            <span>{t.background.strong}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">{t.background.blurDescription}</p>
      </TabsContent>

      <TabsContent value="gradient" className="space-y-4 mt-4">
        <div>
          <Label className="text-xs font-medium mb-2 block text-muted-foreground">{t.background.presets}</Label>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updateSettings({ gradientColors: preset.colors })}
                className={cn(
                  "h-12 rounded-lg border-2 transition-all touch-manipulation select-none",
                  "active:scale-95",
                  settings.gradientColors[0] === preset.colors[0] && settings.gradientColors[1] === preset.colors[1]
                    ? "border-primary scale-105 ring-2 ring-primary/20"
                    : "border-transparent hover:scale-105",
                )}
                style={{
                  background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                  touchAction: "manipulation",
                }}
                aria-label={`Select ${preset.label} gradient`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium mb-2 block text-muted-foreground">{t.background.startColor}</Label>
            <div className="flex gap-1">
              <div className="relative w-12 h-11">
                <Input
                  type="color"
                  value={settings.gradientColors[0]}
                  onChange={(e) =>
                    updateSettings({
                      gradientColors: [e.target.value, settings.gradientColors[1]],
                    })
                  }
                  className="absolute inset-0 w-full h-full p-1 border rounded cursor-pointer touch-manipulation"
                  style={{ touchAction: "manipulation" }}
                />
              </div>
              <Input
                type="text"
                value={settings.gradientColors[0]}
                onChange={(e) => handleHexInput(e.target.value, "gradientStart")}
                className="flex-1 font-mono text-xs h-11"
                maxLength={7}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium mb-2 block text-muted-foreground">{t.background.endColor}</Label>
            <div className="flex gap-1">
              <div className="relative w-12 h-11">
                <Input
                  type="color"
                  value={settings.gradientColors[1]}
                  onChange={(e) =>
                    updateSettings({
                      gradientColors: [settings.gradientColors[0], e.target.value],
                    })
                  }
                  className="absolute inset-0 w-full h-full p-1 border rounded cursor-pointer touch-manipulation"
                  style={{ touchAction: "manipulation" }}
                />
              </div>
              <Input
                type="text"
                value={settings.gradientColors[1]}
                onChange={(e) => handleHexInput(e.target.value, "gradientEnd")}
                className="flex-1 font-mono text-xs h-11"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-medium text-muted-foreground">{t.background.direction}</Label>
            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{settings.gradientDirection}°</span>
          </div>
          <div className="slider-touch-area">
            <Slider
              value={[settings.gradientDirection]}
              onValueChange={([value]) => updateSettings({ gradientDirection: value })}
              max={360}
              min={0}
              step={15}
              className="w-full touch-manipulation"
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>0°</span>
            <span>180°</span>
            <span>360°</span>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
