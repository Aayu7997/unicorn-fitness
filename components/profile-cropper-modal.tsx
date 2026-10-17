'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, Loader2 } from 'lucide-react'

interface ProfileCropperModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedDataUrl: string) => void | Promise<void>
}

export function ProfileCropperModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: ProfileCropperModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const CANVAS_SIZE = 320
  const CROP_DIAMETER = 240
  const CROP_RADIUS = CROP_DIAMETER / 2
  const CENTER = CANVAS_SIZE / 2

  // Reset state when a new image is loaded or dialog opens
  useEffect(() => {
    if (!isOpen || !imageSrc) return

    setImageLoaded(false)
    setZoom(1)
    setRotation(0)
    setPan({ x: 0, y: 0 })

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
    }
    img.onerror = (e) => {
      console.error('Failed to load image for cropping:', e)
    }
    img.src = imageSrc

    return () => {
      imageRef.current = null
    }
  }, [isOpen, imageSrc])

  // Draw canvas preview
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !imageLoaded) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Calculate base scale to fill crop circle
    const isRotated90or270 = rotation % 180 !== 0
    const imgW = isRotated90or270 ? img.naturalHeight : img.naturalWidth
    const imgH = isRotated90or270 ? img.naturalWidth : img.naturalHeight

    const baseScale = Math.max(CROP_DIAMETER / imgW, CROP_DIAMETER / imgH)
    const currentScale = baseScale * zoom

    const drawW = img.naturalWidth * currentScale
    const drawH = img.naturalHeight * currentScale

    // Draw image with pan and rotation
    ctx.save()
    ctx.translate(CENTER + pan.x, CENTER + pan.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
    ctx.restore()

    // Semi-transparent overlay with circular cutout
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
    ctx.beginPath()
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.arc(CENTER, CENTER, CROP_RADIUS, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // Guide border for circle
    ctx.save()
    ctx.strokeStyle = '#f97316'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.arc(CENTER, CENTER, CROP_RADIUS, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }, [zoom, rotation, pan, imageLoaded])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    const touch = e.touches[0]
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.0015
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 3))
  }

  // Rotate 90deg clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Reset to default
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setPan({ x: 0, y: 0 })
  }

  // Perform final crop export
  const handleApplyCrop = async () => {
    const img = imageRef.current
    if (!img) return

    try {
      setIsProcessing(true)

      const EXPORT_SIZE = 512
      const outCanvas = document.createElement('canvas')
      outCanvas.width = EXPORT_SIZE
      outCanvas.height = EXPORT_SIZE
      const outCtx = outCanvas.getContext('2d')
      if (!outCtx) throw new Error('Could not create export canvas')

      const factor = EXPORT_SIZE / CROP_DIAMETER
      const isRotated90or270 = rotation % 180 !== 0
      const imgW = isRotated90or270 ? img.naturalHeight : img.naturalWidth
      const imgH = isRotated90or270 ? img.naturalWidth : img.naturalHeight

      const baseScale = Math.max(CROP_DIAMETER / imgW, CROP_DIAMETER / imgH)
      const currentScale = baseScale * zoom

      const outDrawW = img.naturalWidth * currentScale * factor
      const outDrawH = img.naturalHeight * currentScale * factor

      outCtx.save()
      outCtx.translate(EXPORT_SIZE / 2 + pan.x * factor, EXPORT_SIZE / 2 + pan.y * factor)
      outCtx.rotate((rotation * Math.PI) / 180)
      outCtx.drawImage(img, -outDrawW / 2, -outDrawH / 2, outDrawW, outDrawH)
      outCtx.restore()

      const croppedDataUrl = outCanvas.toDataURL('image/jpeg', 0.92)
      await onCropComplete(croppedDataUrl)
      onClose()
    } catch (err) {
      console.error('Failed to crop image:', err)
      // Fallback: send original imageSrc
      await onCropComplete(imageSrc)
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Crop & Adjust Profile Photo</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Drag to position your face within the circle. Use the controls below to zoom or rotate.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center my-2 space-y-4">
          {/* Interactive Canvas */}
          <div
            className="relative rounded-2xl overflow-hidden border border-border shadow-md bg-black/90 select-none touch-none"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            />

            {!imageLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs">Loading image...</span>
              </div>
            )}
          </div>

          {/* Controls: Zoom slider & Rotate / Reset */}
          <div className="w-full space-y-3 px-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                disabled={zoom <= 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40 p-1 rounded-md transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.05}
                onValueChange={(val) => setZoom(val[0])}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                disabled={zoom >= 3}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40 p-1 rounded-md transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span className="font-mono">{Math.round(zoom * 100)}%</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                  className="h-7 text-xs px-2.5 gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Rotate 90°
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-7 text-xs px-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing || !imageLoaded}
            className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Apply Crop
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
