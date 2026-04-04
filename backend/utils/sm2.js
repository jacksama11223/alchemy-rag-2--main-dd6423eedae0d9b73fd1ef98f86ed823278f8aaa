
/**
 * SuperMemo-2 (SM-2) Algorithm Implementation (Node.js version)
 */
const calculateSM2 = (currentSM2, quality) => {
  // 1. Initial State (SM-2 / Anki 3 Core Variables)
  const sm2 = currentSM2 || {
    repetitions: 0,
    interval: 0, // Days
    efactor: 2.5, // Ease Factor (130% to ...)
    nextReviewDate: new Date().toISOString()
  };

  let reps = sm2.repetitions;
  let interval = sm2.interval;
  let ef = sm2.efactor;

  // 2. Anki Algorithm Logic
  // Mapping quality: 1 (Again), 3 (Hard), 4 (Good), 5 (Easy)
  if (quality < 3) {
    // AGAIN (Quên): Reset everything
    reps = 0;
    interval = 1;
    ef = Math.max(1.3, ef - 0.2);
  } else if (quality === 3) {
    // HARD (Khó nhớ): Slowly expand interval
    interval = Math.max(1, Math.round(interval * 1.2));
    ef = Math.max(1.3, ef - 0.15);
    reps++;
  } else if (quality === 4) {
    // GOOD (Nhớ bình thường): Standard expansion
    if (reps === 0) {
      interval = 1;
    } else if (reps === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    reps++;
  } else if (quality >= 5) {
    // EASY (Quá dễ): Fast expansion
    if (reps === 0) {
      interval = 4;
    } else {
      interval = Math.round(interval * ef * 1.3);
    }
    ef = ef + 0.15;
    reps++;
  }

  // 3. Calculate Next Review Date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    repetitions: reps,
    interval: interval,
    efactor: ef,
    nextReviewDate: nextDate.toISOString()
  };
};

module.exports = { calculateSM2 };
