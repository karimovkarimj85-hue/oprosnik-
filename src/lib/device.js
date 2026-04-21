export function isCoarsePointer() {
  if (typeof window === 'undefined') return false;
  return (
    (typeof window.matchMedia === 'function' &&
      (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches)) ||
    // fallback
    ('ontouchstart' in window)
  );
}

