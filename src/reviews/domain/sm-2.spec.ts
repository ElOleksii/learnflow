import { applyReview } from './sm-2';

describe('applyReview', () => {
  describe('input boundaries', () => {
    test('throws when quality is below 0', () => {
      expect(() =>
        applyReview({ easeFactor: 2.5, interval: 1, repetitions: 0 }, -1),
      ).toThrow('Quality must be in range 0 to 5');
    });

    test('throws when quality is greater 5', () => {
      expect(() =>
        applyReview({ easeFactor: 2.5, interval: 1, repetitions: 0 }, 9),
      ).toThrow('Quality must be in range 0 to 5');
    });

    test('accepts when quality is 0 (minimum)', () => {
      const result = applyReview(
        { easeFactor: 2.5, interval: 10, repetitions: 4 },
        0,
      );
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    test('accepts when quality is 5 (maximum)', () => {
      const result = applyReview(
        { easeFactor: 2.5, interval: 1, repetitions: 0 },
        5,
      );
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
    });
  });

  describe('failed review (quality < 3)', () => {
    test('resets repetitions to 0 and interval to 1', () => {
      expect(
        applyReview({ easeFactor: 1.8, interval: 5, repetitions: 2 }, 2),
      ).toEqual({ easeFactor: 1.48, interval: 1, repetitions: 0 });
    });

    test('floors ease factor at 1.3 on a severe failure', () => {
      const result = applyReview(
        { easeFactor: 1.3, interval: 5, repetitions: 2 },
        1,
      );

      expect(result.easeFactor).toBe(1.3);
    });
  });

  describe('successful review (quality >= 3)', () => {
    test('first repetition sets interval to 1', () => {
      const result = applyReview(
        { easeFactor: 1.3, interval: 0, repetitions: 0 },
        3,
      );

      expect(result.easeFactor).toBeCloseTo(1.3, 5);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    test('second repetition sets interval to 6', () => {
      const result = applyReview(
        { easeFactor: 1.3, interval: 1, repetitions: 1 },
        5,
      );

      expect(result.easeFactor).toBeCloseTo(1.4, 5);
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    test('multiplies interval by ease factor from the third repetition onward', () => {
      const result = applyReview(
        { easeFactor: 1.8, interval: 5, repetitions: 2 },
        4,
      );

      expect(result.easeFactor).toBeCloseTo(1.8, 5);
      expect(result.interval).toBe(9);
      expect(result.repetitions).toBe(3);
    });
  });

  describe('purity', () => {
    test('does not mutate any input state', () => {
      const state = { easeFactor: 2.5, interval: 6, repetitions: 2 };
      applyReview(state, 5);
      expect(state).toEqual({ easeFactor: 2.5, interval: 6, repetitions: 2 });
    });
  });
});
