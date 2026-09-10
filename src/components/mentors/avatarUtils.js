// Deterministic initials + accent color per mentor, so avatars stay stable
// across renders without needing real photos. Colors cycle through the
// existing TRACE palette so every card still reads as one visual system.
const PALETTE = ['trail', 'way', 'gold'];

export function initialsFor(name) {
  return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function paletteFor(id) {
  return PALETTE[id % PALETTE.length];
}
