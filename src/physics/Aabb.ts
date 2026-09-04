export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Side = 'top' | 'bottom' | 'left' | 'right';

export interface Overlap {
  /** The axis with the smaller penetration, which is the cheapest way apart. */
  axis: 'x' | 'y';
  /** Penetration depth along that axis, always positive. */
  amount: number;
  /** Direction along the axis that moves the first rectangle out of the second. */
  sign: 1 | -1;
}

/** True when the rectangles share area. Touching edges do not count. */
export function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

/** The minimum translation that separates `a` from `b`, or null if they do not overlap. */
export function overlap(a: Rect, b: Rect): Overlap | null {
  const dx = a.x + a.width / 2 - (b.x + b.width / 2);
  const penetrationX = (a.width + b.width) / 2 - Math.abs(dx);
  if (penetrationX <= 0) return null;
  const dy = a.y + a.height / 2 - (b.y + b.height / 2);
  const penetrationY = (a.height + b.height) / 2 - Math.abs(dy);
  if (penetrationY <= 0) return null;
  if (penetrationX < penetrationY) {
    return { axis: 'x', amount: penetrationX, sign: dx < 0 ? -1 : 1 };
  }
  return { axis: 'y', amount: penetrationY, sign: dy < 0 ? -1 : 1 };
}

/** Which side of `a` touched `b`, given the overlap between them. */
export function touchedSide(o: Overlap): Side {
  if (o.axis === 'x') return o.sign === -1 ? 'right' : 'left';
  return o.sign === -1 ? 'bottom' : 'top';
}

export function oppositeSide(side: Side): Side {
  switch (side) {
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
}
