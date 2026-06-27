export function applyReview(
  state: { easeFactor: number; interval: number; repetitions: number },
  quality: number,
): { easeFactor: number; interval: number; repetitions: number } {
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be in range 0 to 5');
  }

  const updatedState = { ...state };

  updatedState.easeFactor =
    updatedState.easeFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  updatedState.easeFactor = Math.max(1.3, updatedState.easeFactor);

  if (quality >= 3) {
    updatedState.repetitions++;
    if (updatedState.repetitions === 1) updatedState.interval = 1;
    else if (updatedState.repetitions === 2) updatedState.interval = 6;
    else if (updatedState.repetitions >= 3)
      updatedState.interval = Math.round(
        updatedState.easeFactor * updatedState.interval,
      );
  } else {
    updatedState.repetitions = 0;
    updatedState.interval = 1;
  }

  return updatedState;
}
