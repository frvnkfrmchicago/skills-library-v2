import { useRef, type ReactNode, type MouseEvent, type CSSProperties } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
  intensity?: number
  glare?: boolean
  style?: CSSProperties
}

export function TiltCard({ children, className = '', intensity = 8, glare = true, style }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -intensity
    const rotateY = ((x - centerX) / centerX) * intensity

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`

    if (glare) {
      const glareX = (x / rect.width) * 100
      const glareY = (y / rect.height) * 100
      card.style.background = `
        radial-gradient(circle at ${glareX}% ${glareY}%, rgba(201, 168, 76, 0.05) 0%, transparent 60%),
        rgba(10, 14, 26, 0.7)
      `
    }
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    card.style.background = ''
  }

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
