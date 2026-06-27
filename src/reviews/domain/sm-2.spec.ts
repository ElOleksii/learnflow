import { applyReview } from './sm-2';

describe('applyReview', () => {
  describe('failed review (quality < 3)', () => {
    test('resets repetitions to 0 and interval to 1', () => {
      expect(
        applyReview({ easeFactor: 1.8, interval: 5, repetitions: 2 }, 2),
      ).toEqual({ easeFactor: 1.48, interval: 1, repetitions: 0 });
    });
  });

  describe('successfull review (quality > 3)', () => {
    test('first repetitione sets interval to 1', () => {
      expect(
        applyReview({ easeFactor: 1.8, interval: 5, repetitions: 2 }, 4),
      ).toEqual({ easeFactor: 1.8, interval: 9, repetitions: 3 });
    });
  });
});
