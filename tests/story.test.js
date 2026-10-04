import { describe, expect, it } from 'vitest';
import { calculateScore, resolveEnding, scoreTransfer } from '../src/story.js';

describe('story branches', () => {
  it('reaches S before payment', () => {
    expect(resolveEnding('verify_before_pay')).toBe('S');
    expect(resolveEnding('leave_after_reward')).toBe('S');
  });

  it('reaches B after loss but before further harm', () => {
    expect(resolveEnding('stop_after_loss')).toBe('B');
    expect(resolveEnding('refuse_share')).toBe('B');
  });

  it('reaches C after more payment or screen sharing', () => {
    expect(resolveEnding('pay_unfreeze')).toBe('C');
    expect(resolveEnding('share_screen')).toBe('C');
  });
});

describe('learning score', () => {
  it('scores all transfer questions and caps at 100', () => {
    expect(scoreTransfer({ ticket: 1, creator: 2, game: 2 })).toBe(3);
    expect(calculateScore('S', 3)).toBe(100);
  });

  it('keeps unsafe ending visibly lower', () => {
    expect(calculateScore('C', 3)).toBeLessThan(calculateScore('B', 3));
  });
});
