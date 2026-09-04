import type { Rect } from '../physics/Aabb';

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface CameraOptions {
  /** Fraction of the viewport width the target may roam in before the camera moves. Defaults to 0.3. */
  deadZone?: number;
  /** How quickly the camera closes on its desired position, per second. Defaults to 8. */
  responsiveness?: number;
}

/** A viewport onto the world that follows a target horizontally, kept inside the world's bounds. */
export class Camera {
  x = 0;
  y = 0;
  readonly deadZone: number;
  readonly responsiveness: number;
  private settled = false;

  constructor(options: CameraOptions = {}) {
    this.deadZone = options.deadZone ?? 0.3;
    this.responsiveness = options.responsiveness ?? 8;
  }

  /** The world rectangle currently visible. */
  view(viewport: Size): Rect {
    return { x: this.x, y: this.y, width: viewport.width, height: viewport.height };
  }

  /** Jumps straight to the target, ignoring smoothing. Used on spawn and respawn. */
  snapTo(target: Rect, viewport: Size, bounds: Rect): void {
    this.x = target.x + target.width / 2 - viewport.width / 2;
    this.y = target.y + target.height / 2 - viewport.height / 2;
    this.clamp(viewport, bounds);
    this.settled = true;
  }

  /**
   * Moves toward the target if it has left the dead zone, then clamps to the bounds.
   * The first call snaps so the camera never sweeps in from the origin.
   */
  follow(target: Rect, viewport: Size, bounds: Rect, seconds: number): void {
    if (!this.settled) {
      this.snapTo(target, viewport, bounds);
      return;
    }
    const centerX = target.x + target.width / 2;
    const viewCenter = this.x + viewport.width / 2;
    const halfZone = (this.deadZone * viewport.width) / 2;
    let desiredX = this.x;
    if (centerX > viewCenter + halfZone) desiredX = centerX - halfZone - viewport.width / 2;
    else if (centerX < viewCenter - halfZone) desiredX = centerX + halfZone - viewport.width / 2;

    const blend = 1 - Math.exp(-this.responsiveness * Math.max(seconds, 0));
    this.x += (desiredX - this.x) * blend;
    this.clamp(viewport, bounds);
  }

  clamp(viewport: Size, bounds: Rect): void {
    this.x = clampAxis(this.x, bounds.x, bounds.width, viewport.width);
    this.y = clampAxis(this.y, bounds.y, bounds.height, viewport.height);
  }
}

/** Keeps a viewport of `size` inside [start, start + extent]; a viewport larger than the extent pins to start. */
function clampAxis(value: number, start: number, extent: number, size: number): number {
  const max = Math.max(start, start + extent - size);
  return Math.min(Math.max(value, start), max);
}
