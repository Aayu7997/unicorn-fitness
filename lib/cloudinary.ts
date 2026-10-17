import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,

  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

/**
 * Generate a signed upload signature for direct browser uploads.
 * This keeps the - secret server-side while allowing client uploads.
 */
export function generateUploadSignature(folder: string = 'gym'): {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
} {
  const timestamp = Math.round(Date.now() / 1000)
  const params = { timestamp, folder }

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
  }
}

/**
 * Delete an image from Cloudinary by its public ID.
 */
export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

/**
 * Upload a buffer/stream to Cloudinary.
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  folder: string = 'gym',
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(
    typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
    {
      folder,
      public_id: publicId,
      overwrite: true,
      resource_type: 'auto',
    }
  )
  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}
