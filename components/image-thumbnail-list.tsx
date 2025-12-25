"use client"

import { useRef, useCallback, memo } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"
import type { ImageItem } from "@/types/editor"

interface ImageThumbnailListProps {
  images: ImageItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}

// Virtualization threshold - use virtual list for 20+ images
const VIRTUALIZATION_THRESHOLD = 20
const THUMBNAIL_SIZE = 64
const THUMBNAIL_GAP = 12
const THUMBNAIL_TOTAL = THUMBNAIL_SIZE + THUMBNAIL_GAP

// Memoized thumbnail component for performance
const ThumbnailItem = memo(function ThumbnailItem({
  image,
  isSelected,
  onSelect,
  onRemove,
  selectLabel,
  deleteLabel,
}: {
  image: ImageItem
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
  selectLabel: string
  deleteLabel: string
}) {
  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
          "touch-manipulation select-none",
          "active:scale-95",
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
        style={{ touchAction: "manipulation" }}
        aria-label={`${image.fileName} ${selectLabel}`}
      >
        <img
          src={image.url || "/placeholder.svg"}
          alt={image.fileName}
          className="w-full h-full object-cover"
          draggable={false}
          loading="lazy"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-primary" />
          </div>
        )}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className={cn(
          "absolute -top-2 -right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full",
          "flex items-center justify-center shadow-md",
          "touch-manipulation select-none",
          "active:scale-90 active:bg-destructive/90"
        )}
        style={{ touchAction: "manipulation" }}
        aria-label={`${image.fileName} ${deleteLabel}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
})

// Virtualized list for large image collections
function VirtualizedThumbnailList({
  images,
  selectedId,
  onSelect,
  onRemove,
  selectLabel,
  deleteLabel,
}: {
  images: ImageItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  selectLabel: string
  deleteLabel: string
}) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: images.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => THUMBNAIL_TOTAL,
    horizontal: true,
    overscan: 5,
  })

  return (
    <div
      ref={parentRef}
      className="overflow-x-auto pb-2 -mx-1 px-1"
      style={{ touchAction: "pan-x" }}
    >
      <div
        style={{
          width: `${virtualizer.getTotalSize()}px`,
          height: `${THUMBNAIL_SIZE + 16}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const image = images[virtualItem.index]
          const isSelected = image.id === selectedId

          return (
            <div
              key={image.id}
              style={{
                position: "absolute",
                top: 8,
                left: 0,
                width: `${THUMBNAIL_SIZE}px`,
                transform: `translateX(${virtualItem.start}px)`,
              }}
            >
              <ThumbnailItem
                image={image}
                isSelected={isSelected}
                onSelect={() => onSelect(image.id)}
                onRemove={() => onRemove(image.id)}
                selectLabel={selectLabel}
                deleteLabel={deleteLabel}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Standard list for small collections
function StandardThumbnailList({
  images,
  selectedId,
  onSelect,
  onRemove,
  selectLabel,
  deleteLabel,
}: {
  images: ImageItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  selectLabel: string
  deleteLabel: string
}) {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scroll-touch"
      style={{ touchAction: "pan-x" }}
    >
      {images.map((image) => {
        const isSelected = image.id === selectedId

        return (
          <ThumbnailItem
            key={image.id}
            image={image}
            isSelected={isSelected}
            onSelect={() => onSelect(image.id)}
            onRemove={() => onRemove(image.id)}
            selectLabel={selectLabel}
            deleteLabel={deleteLabel}
          />
        )
      })}
    </div>
  )
}

export function ImageThumbnailList({ images, selectedId, onSelect, onRemove }: ImageThumbnailListProps) {
  const { t } = useI18n()

  if (images.length === 0) return null

  const useVirtualization = images.length >= VIRTUALIZATION_THRESHOLD

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {t.upload.uploaded} ({images.length}
          {t.upload.count})
        </span>
      </div>
      {useVirtualization ? (
        <VirtualizedThumbnailList
          images={images}
          selectedId={selectedId}
          onSelect={onSelect}
          onRemove={onRemove}
          selectLabel={t.action.select}
          deleteLabel={t.action.delete}
        />
      ) : (
        <StandardThumbnailList
          images={images}
          selectedId={selectedId}
          onSelect={onSelect}
          onRemove={onRemove}
          selectLabel={t.action.select}
          deleteLabel={t.action.delete}
        />
      )}
    </div>
  )
}
