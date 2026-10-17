'use client'

import { CldUploadWidget } from 'next-cloudinary'
import { ImagePlus, Trash2, Crop, UploadCloud, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ProfileCropperModal } from './profile-cropper-modal'

interface ImageUploadProps {
  value: string
  onChange: (value: string, publicId: string) => void
  disabled?: boolean
  folder?: string
}

export function ImageUpload({ value, onChange, disabled, folder = 'gym' }: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isCropping, setIsCropping] = useState(false)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string>('')
  const [cropUploading, setCropUploading] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onUpload = (result: any) => {
    if (result?.info?.secure_url) {
      onChange(result.info.secure_url, result.info.public_id || '')
    }
  }

  const handleCropComplete = async (croppedDataUrl: string) => {
    try {
      setCropUploading(true)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: croppedDataUrl,
          folder,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          onChange(data.url, data.publicId || '')
          return
        }
      }
      // Fallback
      onChange(croppedDataUrl, '')
    } catch (err) {
      console.error('Error uploading cropped media:', err)
      onChange(croppedDataUrl, '')
    } finally {
      setCropUploading(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="w-full h-36 bg-muted/40 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-3 w-full">
      {value ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border group bg-muted/20">
          <Image
            src={value}
            alt="Upload Preview"
            fill
            unoptimized
            className="object-cover"
          />

          {cropUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-xs font-medium text-foreground">Processing cropped image...</span>
            </div>
          )}

          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCropImageSrc(value)
                setCropperOpen(true)
              }}
              disabled={disabled || cropUploading}
              className="p-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full transition-all shadow-md hover:scale-105"
              title="Crop & Adjust Photo"
            >
              <Crop className="w-4 h-4" />
            </button>

            <CldUploadWidget
              onSuccess={onUpload}
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unicorn_fitness'}
              options={{
                maxFiles: 1,
                resourceType: 'image',
                clientAllowedFormats: ['jpeg', 'png', 'jpg', 'webp'],
                sources: [
                  'local',
                  'url',
                  'camera',
                  'google_drive',
                  'dropbox',
                  'unsplash',
                  'shutterstock',
                ],
                folder: folder,
                styles: {
                  palette: {
                    window: "#13131f",
                    windowBorder: "#2a2a35",
                    tabIcon: "#f97316",
                    menuIcons: "#ffffff",
                    textDark: "#000000",
                    textLight: "#ffffff",
                    link: "#f97316",
                    action: "#f97316",
                    inactiveTabIcon: "#888888",
                    error: "#ef4444",
                    inProgress: "#f97316",
                    complete: "#22c55e",
                    sourceBg: "#0a0a0f"
                  }
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    open()
                  }}
                  disabled={disabled || cropUploading}
                  className="p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all shadow-md hover:scale-105"
                  title="Replace with Cloudinary Widget"
                >
                  <UploadCloud className="w-4 h-4" />
                </button>
              )}
            </CldUploadWidget>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange('', '')
              }}
              disabled={disabled || cropUploading}
              className="p-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full transition-all shadow-md hover:scale-105"
              title="Delete Image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <CldUploadWidget
          onSuccess={onUpload}
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unicorn_fitness'}
          options={{
            maxFiles: 1,
            resourceType: 'image',
            clientAllowedFormats: ['jpeg', 'png', 'jpg', 'webp'],
            sources: [
              'local',
              'url',
              'camera',
              'google_drive',
              'dropbox',
              'unsplash',
              'shutterstock',
            ],
            folder: folder,
            styles: {
              palette: {
                window: "#13131f",
                windowBorder: "#2a2a35",
                tabIcon: "#f97316",
                menuIcons: "#ffffff",
                textDark: "#000000",
                textLight: "#ffffff",
                link: "#f97316",
                action: "#f97316",
                inactiveTabIcon: "#888888",
                error: "#ef4444",
                inProgress: "#f97316",
                complete: "#22c55e",
                sourceBg: "#0a0a0f"
              }
            }
          }}
        >
          {({ open }) => {
            const onClick = (e: React.MouseEvent) => {
              e.preventDefault()
              open()
            }

            return (
              <button
                type="button"
                disabled={disabled}
                onClick={onClick}
                className={`
                  w-full h-36 bg-muted/40 border-2 border-dashed rounded-lg 
                  flex flex-col items-center justify-center gap-2.5 cursor-pointer
                  transition-all group select-none border-border hover:bg-muted/70 hover:border-primary/50
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="p-2.5 rounded-full bg-background border border-border shadow-xs group-hover:scale-105 transition-transform">
                  <ImagePlus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Click to upload media
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cloudinary Widget (Local, URL, Camera, Drive, Unsplash, Dropbox)
                  </p>
                </div>
              </button>
            )
          }}
        </CldUploadWidget>
      )}

      <ProfileCropperModal
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}
