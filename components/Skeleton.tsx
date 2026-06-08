// ══════════════════════════════════════════
// components/Skeleton.tsx
// ══════════════════════════════════════════

const T = {
  surface: '#1A1520',
  border: '#2A2530',
}

export function SkeletonLine({ width = '100%', height = '20px' }) {
  return (
    <div
      className="rounded animate-pulse"
      style={{
        width,
        height,
        background: `linear-gradient(90deg, ${T.surface} 25%, ${T.border} 50%, ${T.surface} 75%)`,
        backgroundSize: '200% 100%',
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="p-4 rounded-lg border" style={{ background: T.surface, borderColor: T.border }}>
      <SkeletonLine width="60%" height="24px" />
      <div className="mt-3 space-y-2">
        <SkeletonLine height="16px" />
        <SkeletonLine width="80%" height="16px" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} height="40px" />
      ))}
    </div>
  )
}
