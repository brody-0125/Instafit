"use client"

import { useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Paintbrush, RotateCcw } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

export interface MosaicBrushSettings {
  enabled: boolean
  brushSize: number     // 10-100px
  blockSize: number     // 5-50px
}

export const DEFAULT_MOSAIC_SETTINGS: MosaicBrushSettings = {
  enabled: false,
  brushSize: 30,
  blockSize: 15,
}

interface MosaicBrushControlsProps {
  settings: MosaicBrushSettings
  onSettingsChange: (settings: MosaicBrushSettings) => void
  onReset: () => void
  hasStrokes: boolean
  disabled?: boolean
}

export function MosaicBrushControls({
  settings,
  onSettingsChange,
  onReset,
  hasStrokes,
  disabled,
}: MosaicBrushControlsProps) {
  const { t } = useI18n()

  const updateSettings = useCallback(
    (updates: Partial<MosaicBrushSettings>) => {
      onSettingsChange({ ...settings, ...updates })
    },
    [settings, onSettingsChange],
  )

  return (
    <div className={cn("space-y-4", disabled && "opacity-50 pointer-events-none")}>
      <div className="flex items-center justify-between">
        <Button
          variant={settings.enabled ? "default" : "outline"}
          size="sm"
          onClick={() => updateSettings({ enabled: !settings.enabled })}
          className="touch-manipulation"
          style={{ touchAction: "manipulation" }}
        >
          <Paintbrush className="mr-2 h-4 w-4" />
          {settings.enabled ? t.mosaic.disable : t.mosaic.enable}
        </Button>
        {hasStrokes && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="touch-manipulation text-muted-foreground"
            style={{ touchAction: "manipulation" }}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            {t.mosaic.reset}
          </Button>
        )}
      </div>

      {settings.enabled && (
        <>
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs font-medium text-muted-foreground">{t.mosaic.brushSize}</Label>
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{settings.brushSize}px</span>
            </div>
            <div className="slider-touch-area">
              <Slider
                value={[settings.brushSize]}
                onValueChange={([value]) => updateSettings({ brushSize: value })}
                max={100}
                min={10}
                step={5}
                className="w-full touch-manipulation"
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>{t.mosaic.small}</span>
              <span>{t.mosaic.large}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs font-medium text-muted-foreground">{t.mosaic.blockSize}</Label>
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{settings.blockSize}px</span>
            </div>
            <div className="slider-touch-area">
              <Slider
                value={[settings.blockSize]}
                onValueChange={([value]) => updateSettings({ blockSize: value })}
                max={50}
                min={5}
                step={1}
                className="w-full touch-manipulation"
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>{t.mosaic.fine}</span>
              <span>{t.mosaic.coarse}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
