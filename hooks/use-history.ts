"use client"

import { useState, useCallback, useEffect, useRef } from "react"

interface UseHistoryOptions<T> {
  maxHistory?: number
  initialState: T
}

interface UseHistoryReturn<T> {
  state: T
  setState: (newState: T) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  clear: () => void
}

export function useHistory<T>({
  maxHistory = 20,
  initialState,
}: UseHistoryOptions<T>): UseHistoryReturn<T> {
  const [state, setStateInternal] = useState<T>(initialState)
  const undoStackRef = useRef<T[]>([])
  const redoStackRef = useRef<T[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const updateFlags = useCallback(() => {
    setCanUndo(undoStackRef.current.length > 0)
    setCanRedo(redoStackRef.current.length > 0)
  }, [])

  const setState = useCallback(
    (newState: T) => {
      setStateInternal((prev) => {
        undoStackRef.current = [...undoStackRef.current, prev].slice(-maxHistory)
        redoStackRef.current = []
        updateFlags()
        return newState
      })
    },
    [maxHistory, updateFlags],
  )

  const undo = useCallback(() => {
    const undoStack = undoStackRef.current
    if (undoStack.length === 0) return

    setStateInternal((prev) => {
      const previousState = undoStack[undoStack.length - 1]
      undoStackRef.current = undoStack.slice(0, -1)
      redoStackRef.current = [...redoStackRef.current, prev]
      updateFlags()
      return previousState
    })
  }, [updateFlags])

  const redo = useCallback(() => {
    const redoStack = redoStackRef.current
    if (redoStack.length === 0) return

    setStateInternal((prev) => {
      const nextState = redoStack[redoStack.length - 1]
      redoStackRef.current = redoStack.slice(0, -1)
      undoStackRef.current = [...undoStackRef.current, prev]
      updateFlags()
      return nextState
    })
  }, [updateFlags])

  const clear = useCallback(() => {
    undoStackRef.current = []
    redoStackRef.current = []
    setStateInternal(initialState)
    updateFlags()
  }, [initialState, updateFlags])

  // Keyboard shortcuts: Ctrl+Z / Cmd+Z for undo, Ctrl+Shift+Z / Cmd+Shift+Z for redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.metaKey || e.ctrlKey

      if (!isModifier || e.key.toLowerCase() !== "z") return

      // Don't capture when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      e.preventDefault()

      if (e.shiftKey) {
        redo()
      } else {
        undo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo])

  return { state, setState, undo, redo, canUndo, canRedo, clear }
}
