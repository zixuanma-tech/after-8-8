export const INITIAL_METRICS = Object.freeze({
  bait: 0,
  pressure: 0,
  verify: 0,
  stop: 0,
  privacy: 0,
});

export const ENDINGS = Object.freeze({
  S: {
    rank: 'S',
    title: '你在付款前停下了',
    subtitle: '独立核验，切断诱导链',
    tone: 'safe',
    summary: '你没有把“8.8元返款”当作平台可信的证明，而是离开群聊，通过官方渠道核验并举报。',
  },
  B: {
    rank: 'B',
    title: '已经损失，但及时止损',
    subtitle: '停止转账，保留证据，立即求助',
    tone: 'warn',
    summary: '你支付了399元，但在对方继续索要998元或要求共享屏幕时停下。及时止损仍然能避免损失扩大。',
  },
  C: {
    rank: 'C',
    title: '诱饵升级为连环收割',
    subtitle: '继续付款或共享屏幕，让风险失控',
    tone: 'danger',
    summary: '对方利用“解冻、退款、安全审核”等说法继续施压。共享屏幕还可能暴露验证码、账户余额和登录信息。',
  },
});

export const RISK_NODES = Object.freeze([
  { id: 'friend', icon: '人', title: '熟人背书', text: '同学确实收到过返款，但他也可能只是诱饵链上的下一环。', lesson: '熟人没有恶意，不等于信息可靠；先问清原始来源和他是否获得拉新奖励。' },
  { id: 'bait', icon: '¥', title: '小额返款', text: '先给甜头，制造“真的能提现”的错觉。', lesson: '返款只能证明对方愿意先付诱饵成本，不能证明项目真实。' },
  { id: 'referral', icon: '→', title: '拉新扩散', text: '让刚拿到返款的人邀请同学，用真实体验替平台背书。', lesson: '未经核验就说“我做过，放心”，可能让受害者无意间成为传播链上的帮凶。' },
  { id: 'crowd', icon: '···', title: '群聊造势', text: '晒单、催单、名额倒计时共同制造从众压力。', lesson: '群内账号可能由同一团伙控制，热闹不等于可信。' },
  { id: 'upgrade', icon: '↑', title: '任务升级', text: '从免费小任务跳到399元“组合单”。', lesson: '任何先垫资、充值、刷单才能返现的兼职都应立刻停止。' },
  { id: 'wallet', icon: '0', title: '平台假到账', text: '页面显示520.80元，却没有进入银行或正规支付账户。', lesson: '骗子控制的页面数字可以随时修改；到账必须去独立账户核对。' },
  { id: 'freeze', icon: '!', title: '错误与冻结', text: '把不到账归咎于你“操作失误”，再索要解冻金。', lesson: '正规平台不会用继续转账来修复上一笔转账。' },
  { id: 'share', icon: '▣', title: '屏幕共享', text: '以退款、指导为名查看验证码、余额和支付操作。', lesson: '拒绝共享屏幕；验证码、密码、支付页面绝不展示。' },
]);

export const TRANSFER_QUESTIONS = Object.freeze([
  {
    id: 'ticket',
    tag: '演唱会门票',
    message: '“内部票原价出，先加QQ，脱离平台转账，我发电子票二维码。”',
    options: ['票价接近原价，应该可信', '脱离正规平台并要求私下转账', '对方发了身份证照片'],
    answer: 1,
    reason: '脱离有担保的正规平台、要求私下转账，是高风险信号；身份证照片也可能盗用。',
  },
  {
    id: 'creator',
    tag: '素人博主招募',
    message: '“品牌免费寄衣服，先开屏幕共享，我指导你完成企业退款认证。”',
    options: ['免费寄衣服说明品牌有诚意', '企业退款流程比较复杂，正常', '以退款为名要求屏幕共享'],
    answer: 2,
    reason: '屏幕共享可能暴露余额、验证码和登录操作。正规退款无需远程查看你的账户。',
  },
  {
    id: 'game',
    tag: '游戏账号交易',
    message: '“买家已经付款，但平台说你的账户被冻结，交保证金就能提现。”',
    options: ['先交保证金，提现后会退', '换一张银行卡再试', '陌生平台以账户冻结为由索要解冻金'],
    answer: 2,
    reason: '“已付款—账户冻结—缴费解冻”是典型连环收费套路，应停止操作并从官方渠道核验。',
  },
]);

export function resolveEnding(action) {
  if (['verify_job', 'leave_after_reward', 'leave_group', 'verify_before_pay'].includes(action)) return 'S';
  if (['stop_after_loss', 'refuse_share'].includes(action)) return 'B';
  if (['pay_unfreeze', 'share_screen', 'share_single_page'].includes(action)) return 'C';
  return null;
}

export function scoreTransfer(answers) {
  return TRANSFER_QUESTIONS.reduce((score, question) => score + (answers[question.id] === question.answer ? 1 : 0), 0);
}

export function calculateScore(ending, transferScore) {
  const endingScore = { S: 70, B: 48, C: 24 }[ending] ?? 0;
  return Math.min(100, endingScore + transferScore * 10);
}

export function resultLevel(score) {
  if (score >= 90) return ['清醒核验者', '你能识别诱饵，并把核验放在付款之前。'];
  if (score >= 70) return ['及时止损者', '你能在压力升级时停下，还需把核验节点再提前。'];
  return ['风险补课者', '下一次先暂停付款，再通过官方渠道独立核验。'];
}
