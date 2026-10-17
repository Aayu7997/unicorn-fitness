/**
 * Official brand icons for third-party fitness integrations.
 * Uses the actual brand logo SVGs stored in /public/icons/.
 */
import Image from 'next/image'

export function GoogleFitIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/google-fit.svg"
      alt="Google Fit"
      width={24}
      height={24}
      className={className}
    />
  )
}

export function SamsungHealthIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/samsung-health.svg"
      alt="Samsung Health"
      width={24}
      height={24}
      className={className}
    />
  )
}
