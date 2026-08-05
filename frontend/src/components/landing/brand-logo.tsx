import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandLogo({
  className,
  imgClassName,
  priority = false,
  size,
}: {
  className?: string
  imgClassName?: string
  priority?: boolean
  size?: string
}) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <Image
        src="/logos/arivu-logo.png"
        alt="Arivu AI"
        width={200}
        height={200}
        priority={priority}
        className={cn('h-14 w-auto object-contain', imgClassName)}
      />
    </span>
  )
}


