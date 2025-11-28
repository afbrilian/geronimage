interface SkeletonProps {
  className?: string
  variant?: 'square' | 'circle' | 'text'
}

export function Skeleton({
  className = '',
  variant = 'square',
}: SkeletonProps) {
  const baseStyles =
    'animate-pulse bg-chat-gray-200 rounded-lg'
  const variantStyles = {
    square: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  }

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label="Loading..."
    />
  )
}

