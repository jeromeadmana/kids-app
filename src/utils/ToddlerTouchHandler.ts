/**
 * Toddler Touch Handler — 4-Phase State Machine
 *
 * Handles the unique way toddlers interact with screens:
 * smashing, holding, dragging, and leaving fingers down.
 *
 * Phases:
 *   INITIAL_TAP  (0–150ms)    → Immediate visual/audio/haptic feedback
 *   SHORT_HOLD   (150–800ms)  → Element glows, particles stream
 *   LONG_HOLD    (800–3000ms) → Element transforms, richer effects
 *   SUSTAINED    (3000ms+)    → Settles to ambient mode (prevents overstimulation)
 */

export enum TouchPhase {
  IDLE = 'IDLE',
  INITIAL_TAP = 'INITIAL_TAP',
  SHORT_HOLD = 'SHORT_HOLD',
  LONG_HOLD = 'LONG_HOLD',
  SUSTAINED = 'SUSTAINED',
}

export interface TouchPoint {
  x: number;
  y: number;
}

export interface TouchCallbacks {
  onTap: (position: TouchPoint) => void;
  onShortHold: (position: TouchPoint) => void;
  onLongHold: (position: TouchPoint) => void;
  onSustained: (position: TouchPoint) => void;
  onRelease: (position: TouchPoint, heldDuration: number) => void;
  onDrag: (position: TouchPoint) => void;
  onPalmSlam: () => void;
}

export class ToddlerTouchEngine {
  private phase: TouchPhase = TouchPhase.IDLE;
  private holdStartTime: number = 0;
  private lastPosition: TouchPoint = { x: 0, y: 0 };
  private callbacks: TouchCallbacks;
  private phaseTransitioned: Set<TouchPhase> = new Set();
  private cooldownUntil: number = 0;
  private readonly COOLDOWN_MS = 300;

  // Edge dead zones (20dp from edges)
  private screenWidth: number;
  private screenHeight: number;
  private readonly DEAD_ZONE = 20;

  constructor(
    callbacks: TouchCallbacks,
    screenWidth: number,
    screenHeight: number
  ) {
    this.callbacks = callbacks;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  private isInDeadZone(position: TouchPoint): boolean {
    return (
      position.x < this.DEAD_ZONE ||
      position.x > this.screenWidth - this.DEAD_ZONE ||
      position.y < this.DEAD_ZONE ||
      position.y > this.screenHeight - this.DEAD_ZONE
    );
  }

  handleTouchStart(position: TouchPoint, touchCount: number): void {
    if (this.isInDeadZone(position)) return;

    // Palm/fist detection: 4+ simultaneous touches
    if (touchCount >= 4) {
      this.callbacks.onPalmSlam();
      return;
    }

    // Cooldown check
    const now = Date.now();
    if (now < this.cooldownUntil) return;

    this.phase = TouchPhase.INITIAL_TAP;
    this.holdStartTime = now;
    this.lastPosition = position;
    this.phaseTransitioned.clear();
    this.phaseTransitioned.add(TouchPhase.INITIAL_TAP);

    // Immediate feedback — must happen within 16ms
    this.callbacks.onTap(position);
    this.cooldownUntil = now + this.COOLDOWN_MS;
  }

  handleTouchMove(position: TouchPoint): void {
    if (this.phase === TouchPhase.IDLE) return;

    const dx = position.x - this.lastPosition.x;
    const dy = position.y - this.lastPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If finger moved significantly, treat as drag
    if (distance > 10) {
      this.callbacks.onDrag(position);
      this.lastPosition = position;
    }

    this.updatePhase(position);
  }

  handleTouchEnd(position: TouchPoint): void {
    if (this.phase === TouchPhase.IDLE) return;

    const heldDuration = Date.now() - this.holdStartTime;
    this.callbacks.onRelease(position, heldDuration);

    this.phase = TouchPhase.IDLE;
    this.phaseTransitioned.clear();
  }

  /**
   * Call this on every frame (via requestAnimationFrame or useAnimatedReaction)
   * to check for phase transitions during a hold.
   */
  update(): void {
    if (this.phase === TouchPhase.IDLE) return;

    this.updatePhase(this.lastPosition);
  }

  private updatePhase(position: TouchPoint): void {
    const elapsed = Date.now() - this.holdStartTime;

    if (elapsed >= 3000 && !this.phaseTransitioned.has(TouchPhase.SUSTAINED)) {
      this.phase = TouchPhase.SUSTAINED;
      this.phaseTransitioned.add(TouchPhase.SUSTAINED);
      this.callbacks.onSustained(position);
    } else if (
      elapsed >= 800 &&
      !this.phaseTransitioned.has(TouchPhase.LONG_HOLD)
    ) {
      this.phase = TouchPhase.LONG_HOLD;
      this.phaseTransitioned.add(TouchPhase.LONG_HOLD);
      this.callbacks.onLongHold(position);
    } else if (
      elapsed >= 150 &&
      !this.phaseTransitioned.has(TouchPhase.SHORT_HOLD)
    ) {
      this.phase = TouchPhase.SHORT_HOLD;
      this.phaseTransitioned.add(TouchPhase.SHORT_HOLD);
      this.callbacks.onShortHold(position);
    }
  }

  getPhase(): TouchPhase {
    return this.phase;
  }

  getHoldDuration(): number {
    if (this.phase === TouchPhase.IDLE) return 0;
    return Date.now() - this.holdStartTime;
  }
}
