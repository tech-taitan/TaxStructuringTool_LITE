/**
 * Lightweight spring animation utility using requestAnimationFrame.
 *
 * No React dependency — pure rAF loop with configurable stiffness,
 * damping, and precision. Returns a cancel function.
 */

export interface SpringConfig {
  /** Spring pull strength (default: 0.15) */
  stiffness?: number;
  /** Velocity decay per frame (default: 0.75) */
  damping?: number;
  /** Stop threshold for both velocity and distance (default: 0.5) */
  precision?: number;
}

const DEFAULTS: Required<SpringConfig> = {
  stiffness: 0.15,
  damping: 0.75,
  precision: 0.5,
};

/**
 * Animate a value from `from` to `to` using a spring physics model.
 * Calls `onUpdate` each frame and `onComplete` when settled.
 * Returns a cancel function that stops the animation.
 */
export function animateSpring(
  from: number,
  to: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void,
  config?: SpringConfig,
): () => void {
  return animateSpringWithVelocity(from, to, 0, onUpdate, onComplete, config);
}

/**
 * Same as `animateSpring` but seeds the initial velocity.
 * Useful for gesture release where the spring should continue
 * in the direction of the fling.
 */
export function animateSpringWithVelocity(
  from: number,
  to: number,
  initialVelocity: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void,
  config?: SpringConfig,
): () => void {
  const { stiffness, damping, precision } = { ...DEFAULTS, ...config };

  let position = from;
  let velocity = initialVelocity;
  let frameId: number | null = null;

  function tick() {
    velocity += (to - position) * stiffness;
    velocity *= damping;
    position += velocity;

    if (Math.abs(velocity) < precision && Math.abs(to - position) < precision) {
      // Snap to target and finish
      onUpdate(to);
      onComplete?.();
      frameId = null;
      return;
    }

    onUpdate(position);
    frameId = requestAnimationFrame(tick);
  }

  frameId = requestAnimationFrame(tick);

  return () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}
