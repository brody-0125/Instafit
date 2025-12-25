"use client"

import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"
import type { LucideIcon } from "lucide-react"

interface Template {
  nameKey: "square" | "portrait" | "landscape"
  ratio: number
  icon: LucideIcon
  width: number
  height: number
}

interface TemplateSelectorProps {
  templates: Record<string, Template>
  selectedTemplate: string
  onTemplateChange: (template: string) => void
  disabled?: boolean
}

export function TemplateSelector({ templates, selectedTemplate, onTemplateChange, disabled }: TemplateSelectorProps) {
  const { t } = useI18n()

  const getRatioLabel = (ratio: number) => {
    if (ratio === 1) return "1:1"
    if (ratio > 1) return "1.91:1"
    return "9:16"
  }

  return (
    <div className="grid gap-2">
      {Object.entries(templates).map(([key, template]) => {
        const Icon = template.icon
        const isSelected = selectedTemplate === key
        const templateName = t.template[template.nameKey]

        return (
          <button
            key={key}
            type="button"
            onClick={() => onTemplateChange(key)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
              "touch-manipulation select-none min-h-[56px]",
              "active:scale-[0.98]",
              "hover:bg-accent/50",
              isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            style={{ touchAction: "manipulation" }}
          >
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-colors flex-shrink-0",
                isSelected ? "bg-primary/10" : "bg-muted",
              )}
            >
              <Icon
                className={cn("h-5 w-5 transition-colors", isSelected ? "text-primary" : "text-muted-foreground")}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "font-medium text-sm transition-colors",
                  isSelected ? "text-foreground" : "text-foreground/80",
                )}
              >
                {templateName}
              </div>
              <div className="text-xs text-muted-foreground">
                {template.width} × {template.height}
              </div>
            </div>
            <div
              className={cn(
                "px-2 py-1 rounded text-xs font-mono transition-colors flex-shrink-0",
                isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {getRatioLabel(template.ratio)}
            </div>
          </button>
        )
      })}
    </div>
  )
}
