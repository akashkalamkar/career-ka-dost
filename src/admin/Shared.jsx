/** A small error or success banner, used across the staff portal panels. */
export function Message({ kind = 'error', children }) {
  if (!children) return null
  const style = kind === 'error' ? 'border-[#a40000] bg-[#fdecec] text-[#7a0000]' : 'border-[#0f6b2a] bg-[#e5f6e9] text-[#0b4f1f]'
  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`border-l-4 px-4 py-3 text-sm font-bold ${style}`}>
      {children}
    </p>
  )
}
