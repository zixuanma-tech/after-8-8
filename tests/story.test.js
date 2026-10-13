import { describe, expect, it } from 'vitest';
import { calculateScore, QUICK_QUESTIONS, resolveEnding, resolveProfile, scoreTransfer } from '../src/story.js';

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

describe('wallet nickname profile', () => {
  it('returns a colloquial bait nickname with a wake layer', () => {
    const profile = resolveProfile({
      history: ['因为熟人背书点开兼职链接', '8.8元到账后继续查看平台证明'],
      ending: 'S',
      metrics: { bait: 3, pressure: 1, verify: 0, stop: 0, privacy: 0 },
      quickAnswers: Object.fromEntries(QUICK_QUESTIONS.map((question) => [question.id, question.id === 'first-reward' ? 0 : 0])),
      gender: 'female',
    });
    expect(profile.title).toBe('8.8大馋丫头');
    expect(profile.wake.title).toBe('小额返款');
    expect(profile.line).toContain('8.8元');
  });

  it('can unlock the hidden contradiction result', () => {
    const safeAnswers = Object.fromEntries(QUICK_QUESTIONS.map((question) => [question.id, question.options.findIndex((option) => option.safe)]));
    safeAnswers.meta = 0;
    const profile = resolveProfile({
      history: ['接受399元组合任务', '支付399元后看到平台显示返款成功', '损失399元后停止转账并求助'],
      ending: 'B',
      invested: 399,
      metrics: { bait: 2, pressure: 4, verify: 2, stop: 4, privacy: 0 },
      quickAnswers: safeAnswers,
      gender: 'male',
    });
    expect(profile.hidden).toBe(true);
    expect(profile.title).toBe('薛定谔的钱包');
  });

  it('does not allow a high-risk screen-share path to look like a safe result', () => {
    const profile = resolveProfile({
      history: ['要求退款后被引导共享屏幕', '开启屏幕共享暴露账户操作'],
      ending: 'C',
      invested: 1397,
      metrics: { bait: 5, pressure: 5, verify: 0, stop: 0, privacy: 5 },
      quickAnswers: {},
      gender: 'male',
    });
    expect(profile.title).toBe('诈骗剧情沉浸式内测员');
    expect(profile.wake.label).toBe('未在关键层醒来');
  });
});
