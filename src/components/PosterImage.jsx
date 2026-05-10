import { useState } from 'react'

/**
 * @param {{
 *   src: string
 *   fallback: string
 *   alt: string
 *   className?: string
 *   priority?: boolean
 * }} props
 */
export function PosterImage({ src, fallback, alt, className = '', priority = false }) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback)
      }}
    />
  )
}
