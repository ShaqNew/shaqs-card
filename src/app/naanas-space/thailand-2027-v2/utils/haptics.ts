function vibratePattern(pattern: number | number[]) {
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function"
  ) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore environments where vibration is blocked or unsupported
    }
  }
}

/** Light tactile tick when checking off an itinerary, packing, prep, or expense item. */
export function triggerCheckHaptic() {
  vibratePattern(10);
}

/** Distinct double-pulse vibration on destructive removal or clear actions. */
export function triggerDestructiveHaptic() {
  vibratePattern([15, 30, 15]);
}

/** Subtle micro-tap feedback when selecting a currency preset chip. */
export function triggerPresetHaptic() {
  vibratePattern(6);
}
