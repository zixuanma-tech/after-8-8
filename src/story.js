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

export const OPENING_BAITS = Object.freeze([
  { id: 'roommate', label: '室友发来', message: '“我刚做完，8.8已经到账，链接发你？”', icon: '8.8', tone: 'violet', signals: { familiar: 2, bait: 1 } },
  { id: 'grant', label: '资助中心', message: '“奖学金资料缺失，今晚24:00前补录。”', icon: '急', tone: 'amber', signals: { rush: 2 } },
  { id: 'service', label: '平台客服', message: '“账户异常，开启屏幕共享可快速退款。”', icon: '退', tone: 'red', signals: { obedience: 2 } },
  { id: 'senior', label: '学长内推', message: '“大厂内推补录，先交299元培训保证金。”', icon: '职', tone: 'cyan', signals: { bait: 2, familiar: 1 } },
]);

export const QUICK_QUESTIONS = Object.freeze([
  {
    id: 'roommate-reply',
    tag: '室友消息',
    message: '室友突然说：“我刚做完，8.8到账，名额不多。”你第一句回什么？',
    options: [
      { text: '发我链接。', signals: { familiar: 2 } },
      { text: '真到账？截图看看。', signals: { bait: 2 } },
      { text: '哪个单位招的？我自己去官网搜。', signals: { verify: 2 }, safe: true },
      { text: '等等，我先叫上另一个室友。', signals: { referral: 2 } },
    ],
  },
  {
    id: 'group-chat',
    tag: '群聊99+',
    message: '群里突然99+，你第一眼找哪一条？',
    options: [
      { text: '最大额的收款截图。', signals: { crowd: 2, bait: 1 } },
      { text: '群主说还剩几个名额。', signals: { rush: 2 } },
      { text: '有没有人问过平台资质。', signals: { verify: 2 }, safe: true },
      { text: '拉一个同学奖励多少。', signals: { referral: 2 } },
    ],
  },
  {
    id: 'first-reward',
    tag: '8.8到账',
    message: '8.8元到账后，你最像哪句？',
    options: [
      { text: '钱都到了，还能是假？', signals: { bait: 3 } },
      { text: '再做一单就收手。', signals: { bait: 2, rush: 1 } },
      { text: '先看看钱是不是进了独立账户。', signals: { verify: 3 }, safe: true },
      { text: '发给室友，证明我没踩坑。', signals: { referral: 3 } },
    ],
  },
  {
    id: 'freeze',
    tag: '399→998',
    message: '399元卡住了，客服说再付998元解冻。哪句话最挠你？',
    options: [
      { text: '不补的话，399元就真没了。', signals: { sunk: 3 } },
      { text: '都走到这里了，就差最后一步。', signals: { sunk: 2, rush: 1 } },
      { text: '客服还在线等我，先解决问题。', signals: { obedience: 2 } },
      { text: '正常退款不会让我继续付款。', signals: { verify: 3 }, safe: true },
    ],
  },
  {
    id: 'screen-share',
    tag: '屏幕共享',
    message: '客服说：“打开屏幕共享，我一步步教你退款。”',
    options: [
      { text: '太好了，我正好不会操作。', signals: { obedience: 3 } },
      { text: '我只给他看支付页面。', signals: { obedience: 2 } },
      { text: '先让他发证件和工号。', signals: { obedience: 1, verify: 1 } },
      { text: '挂断，自己去官方App找客服。', signals: { verify: 3 }, safe: true },
    ],
  },
  {
    id: 'meta',
    tag: '最后一问',
    message: '测试说你容易被骗，你第一反应是？',
    options: [
      { text: '不可能，反诈题我都会。', meta: 'confidence' },
      { text: '重测到满意为止。', meta: 'retest' },
      { text: '发给室友，看看谁更呆。', meta: 'social' },
      { text: '看看我到底在哪一步放松了。', meta: 'reflect', safe: true },
    ],
  },
]);

export const PROFILE_TYPES = Object.freeze({
  familiar: { id: 'little-fool', title: '熟人小呆瓜', line: '同学说“我做过”，你听成了“这不会骗人”。', note: '熟人可能没有骗你，他也可能只走到了第一笔返款。', defense: '熟人推荐可以听，项目来源还得自己查。' },
  bait: { id: 'snack', titleFemale: '8.8大馋丫头', titleMale: '8.8大馋小子', line: '一笔8.8元，替整个平台完成了实名认证。', note: '到账只能证明对方愿意支付诱饵成本。', defense: '钱到账是真的，不代表赚钱项目是真的。' },
  rush: { id: 'rush-king', title: '急急大王', line: '对方一说只剩三个名额，你比骗子还怕任务过期。', note: '催促是在替你缩短核验时间。', defense: '越催你做决定的人，越怕你有时间做决定。' },
  referral: { id: 'kind-baby', title: '热心肠宝宝', line: '你没有说谎，却替骗子说出了最有说服力的真话。', note: '未经核验的热心，可能替骗子带路。', defense: '先核验，再把机会转给同学。' },
  crowd: { id: 'crowd-baby', title: '气氛组宝宝', line: '一个人晒单你不信，十个托一起晒单你放心了。', note: '群聊人数不是证据，晒单数量也不是。', defense: '跑到群外找来源，别在群里找答案。' },
  sunk: { id: 'stubborn', title: '回本犟种', line: '399元拿不回来，你想再付998元证明自己没看错。', note: '继续付款通常不是回本，是让损失继续长大。', defense: '不用新转账抢救旧转账。' },
  obedience: { id: 'service-baby', title: '客服乖宝宝', line: '手机还在你手里，操作顺序已经交给了他。', note: '共享屏幕会暴露余额、验证码和支付操作。', defense: '退款不需要共享屏幕，验证码和支付页永不展示。' },
  verify: { id: 'serious-genius', title: '较真小天才', line: '别人研究怎么提现，你研究这个链接到底是谁发的。', note: '骗子提供证据，你负责离开他的聊天框查证据。', defense: '保留核验习惯，也提醒身边同学先查来源。' },
});

export const HIDDEN_PROFILE_TYPES = Object.freeze({
  schrodinger: { id: 'schrodinger', hidden: true, title: '薛定谔的钱包', line: '反诈题全会，诈骗剧情一集没落。', note: '知道答案和当下停下来，是两件不同的事。', defense: '把会背的规则提前用在下一次点击上。' },
  'anti-scam-debater': { id: 'anti-scam-debater', hidden: true, title: '反诈小杠精', line: '群里说得越真，你越想跑到群外查。', note: '你把核验放在了对方证据链之外。', defense: '保持较真，但也把核验方法分享给身边同学。' },
  'immersive-tester': { id: 'immersive-tester', hidden: true, title: '诈骗剧情沉浸式内测员', line: '好消息，这是H5；现实里的骗子不提供“重新开始”。', note: '这次体验已经走过多个关键止损点。', defense: '停止转账、保存证据、联系银行和学校并报警求助。' },
});

export const ALL_PROFILE_TYPES = Object.freeze({ ...PROFILE_TYPES, ...HIDDEN_PROFILE_TYPES });

const WAKE_LAYERS = Object.freeze([
  { number: 1, title: '熟人背书', match: ['熟人背书', '同学背书'] },
  { number: 2, title: '免费任务', match: ['首个免费小任务'] },
  { number: 3, title: '小额返款', match: ['8.8元到账', '收到8.8元'] },
  { number: 4, title: '伪造证明', match: ['证据链', '材料当作'] },
  { number: 5, title: '熟人扩散', match: ['转发给同学', '替平台背书', '拉新奖励'] },
  { number: 6, title: '群体施压', match: ['群聊施压', '组合任务'] },
  { number: 7, title: '沉没成本', match: ['平台数字', '账户冻结', '解冻金', '399元'] },
  { number: 8, title: '屏幕共享', match: ['屏幕共享', '支付页'] },
]);

function addSignals(target, signals = {}) {
  Object.entries(signals).forEach(([key, value]) => { target[key] = (target[key] || 0) + value; });
}

function layerFromHistory(history = [], ending) {
  const last = [...history].reverse().find((item) => !item.includes('迁移测试') && !item.includes('快问')) || '';
  const found = WAKE_LAYERS.find((layer) => layer.match.some((phrase) => last.includes(phrase)));
  if (ending === 'C') return { label: '未在关键层醒来', title: found?.title || '操盘完成', number: null };
  const layer = found || (ending === 'B' ? WAKE_LAYERS[6] : WAKE_LAYERS[0]);
  return { label: `第${layer.number}层醒来`, title: layer.title, number: layer.number };
}

export function resolveProfile({ history = [], ending, invested = 0, metrics = INITIAL_METRICS, quickAnswers = {}, gender = 'female', nickname = '' }) {
  const scores = { familiar: 0, bait: 0, rush: 0, referral: 0, crowd: 0, sunk: 0, obedience: 0, verify: 0 };
  history.forEach((event) => {
    if (event.startsWith('开场先点开')) {
      const bait = OPENING_BAITS.find((item) => event.includes(item.message));
      if (bait) addSignals(scores, bait.signals);
      return;
    }
    if (event.includes('熟人背书') || event.includes('同学背书')) scores.familiar += 2;
    if (event.includes('点击校园AI') || event.includes('首个免费小任务')) scores.bait += 2;
    if (event.includes('8.8元到账后继续') || event.includes('可信证明')) scores.bait += 3;
    if (event.includes('收到8.8元') || event.includes('独立向官方核验')) scores.verify += 3;
    if (event.includes('证据链')) scores.verify += 3;
    if (event.includes('替平台背书') || event.includes('转发给同学')) scores.referral += 4;
    if (event.includes('拉新奖励')) scores.familiar += 2;
    if (event.includes('群聊施压')) scores.crowd += 2;
    if (event.includes('组合任务')) { scores.crowd += 3; scores.rush += 2; }
    if (event.includes('399元')) { scores.rush += 2; scores.bait += 1; }
    if (event.includes('平台数字') || event.includes('账户冻结')) scores.sunk += 1;
    if (event.includes('解冻金')) scores.sunk += 4;
    if (event.includes('共享屏幕') || event.includes('支付页')) scores.obedience += 3;
    if (event.includes('拒绝共享') || event.includes('付款前暂停')) scores.verify += 3;
  });
  scores.bait += Math.min(5, metrics.bait || 0);
  scores.rush += Math.min(4, metrics.pressure || 0);
  scores.verify += Math.min(6, (metrics.verify || 0) + (metrics.stop || 0));
  scores.obedience += Math.min(4, metrics.privacy || 0);

  let safeQuick = 0;
  let meta = '';
  QUICK_QUESTIONS.forEach((question) => {
    const selected = quickAnswers[question.id];
    const option = question.options[selected];
    if (!option) return;
    addSignals(scores, option.signals);
    if (option.safe) safeQuick += 1;
    if (option.meta) meta = option.meta;
  });

  const wake = layerFromHistory(history, ending);
  let type;
  let hidden = false;
  if ((ending === 'B' || ending === 'C' || invested > 0) && safeQuick >= 4 && meta === 'confidence') {
    type = HIDDEN_PROFILE_TYPES.schrodinger;
    hidden = true;
  } else if (ending === 'S' && scores.verify >= 8 && safeQuick >= 4 && meta === 'reflect') {
    type = HIDDEN_PROFILE_TYPES['anti-scam-debater'];
    hidden = true;
  } else if (ending === 'C' && (invested >= 1397 || scores.obedience >= 6)) {
    type = HIDDEN_PROFILE_TYPES['immersive-tester'];
    hidden = true;
  } else {
    const order = ['obedience', 'sunk', 'referral', 'familiar', 'bait', 'crowd', 'rush', 'verify'];
    const winner = order.reduce((best, key) => scores[key] > scores[best] ? key : best, order[0]);
    type = PROFILE_TYPES[winner];
  }
  const title = type.title || (gender === 'male' ? type.titleMale : type.titleFemale);
  return {
    ...type,
    title,
    hidden,
    scores,
    wake,
    nickname: nickname.trim() || (gender === 'male' ? '小华' : '小清'),
    shareLine: `${nickname.trim() || (gender === 'male' ? '小华' : '小清')}的骗子外号是“${title}”。${type.line}`,
  };
}

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
