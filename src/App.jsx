import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { loadProfileIcon, profileIconSvg, profileImageSrc, PROFILE_ICONS } from './profile-icons.js';
import {
  ALL_PROFILE_TYPES,
  ENDINGS,
  INITIAL_METRICS,
  OPENING_BAITS,
  QUICK_QUESTIONS,
  RISK_NODES,
  resolveProfile,
  scoreTransfer,
  TRANSFER_QUESTIONS,
} from './story.js';

const CHARACTER = {
  female: {
    name: '小清', pronoun: '她', image: './assets/characters/female.webp', blink: './assets/characters/female-blink.webp', portal: './assets/characters/female-portal.webp', stop: './assets/characters/female-stop.webp', alt: '扎高马尾、身穿紫白THU棒球服的女大学生',
    shots: ['./assets/film/female-shot-01.jpg', './assets/film/female-shot-02.jpg', './assets/film/female-shot-03.jpg', './assets/film/female-shot-04.jpg', './assets/film/female-shot-05.jpg', './assets/film/female-shot-06.jpg', './assets/film/female-shot-07.jpg', './assets/film/female-shot-08.jpg'],
    motionShots: ['./assets/video/female-shot-01.mp4', './assets/video/female-shot-02.mp4', './assets/video/female-shot-03.mp4', './assets/video/female-shot-04.mp4', './assets/video/female-shot-05.mp4', './assets/video/female-shot-06.mp4', './assets/video/female-shot-07.mp4', './assets/video/female-shot-08.mp4'],
  },
  male: {
    name: '小华', pronoun: '他', image: './assets/characters/male.webp', blink: './assets/characters/male-blink.webp', portal: './assets/characters/male-portal.webp', stop: './assets/characters/male-stop.webp', alt: '高个、蓬松短发、身穿紫白THU棒球服的男大学生',
    shots: ['./assets/film/male-shot-01.jpg', './assets/film/male-shot-02.jpg', './assets/film/male-shot-03.jpg', './assets/film/male-shot-04.jpg', './assets/film/male-shot-05.jpg', './assets/film/male-shot-06.jpg', './assets/film/male-shot-07.jpg', './assets/film/male-shot-08.jpg'],
    motionShots: ['./assets/video/male-shot-01.mp4', './assets/video/male-shot-02.mp4', './assets/video/male-shot-03.mp4', './assets/video/male-shot-04.mp4', './assets/video/male-shot-05.mp4', './assets/video/male-shot-06.mp4', './assets/video/male-shot-07.mp4', './assets/video/male-shot-08.mp4'],
  },
};

const OFFICIAL_CASES = [
  {
    id: 'tsinghua-police',
    issuer: '清华大学保卫部 · 北京市反诈中心案例',
    title: '100元返105元后，连续8次垫资7,600元',
    summary: '2020年9月，王某完成首单收到5元返利，随后被以“支付有误、系统故障、任务未完成”为由不断要求加码。原材料没有说明受害者是清华学生。',
    url: 'https://peace.tsinghua.edu.cn/__local/3/51/88/DCDC9E06666CEDB3075A1C257B4_CE06F1F8_680DF3.pdf',
  },
  {
    id: 'cqu-repeat',
    issuer: '重庆大学保卫部等 · 电信诈骗典型案例',
    title: '先被骗555元，回校报警后当晚又被骗3,623元',
    summary: '学生曹某参与网络刷单后，所谓客服再次以处理订单为由联系，诱导购买Q币、扫描二维码付款。二次受骗说明“已经报警”不等于骗子会停止追击。',
    url: 'https://cmse.cqu.edu.cn/__local/C/35/3D/683699A62D20B55B903C4BE680A_AD35E21A_660C4.pdf?e=.pdf',
  },
  {
    id: 'cqu-screen',
    issuer: '重庆大学官方案例汇编',
    title: '共享屏幕、借贷转账，最终损失108,500元',
    summary: '学生张某在对方指挥下通过多个平台借款；为追回第一笔5万元，又转出58,500元。沉没成本和远程“指导”共同把损失推高。',
    url: 'https://cmse.cqu.edu.cn/__local/C/35/3D/683699A62D20B55B903C4BE680A_AD35E21A_660C4.pdf?e=.pdf',
  },
  {
    id: 'sjtu-data',
    issuer: '上海交通大学官方数据',
    title: '校园电诈案件数从111起降至44起',
    summary: '上海交通大学通报，校园电信网络诈骗案件数从2021年的111起下降至2024年的44起，但单案平均损失仍达2.68万元。该数据仅代表该校统计。',
    url: 'https://icisee.sjtu.edu.cn/news/2777.html',
  },
];

const DARK_MUSIC_SCREENS = new Set(['group', 'deposit', 'wallet', 'frozen', 'share', 'ending', 'result']);
const FLOW = ['prologue', 'cover', 'select', 'classmate', 'feed', 'task', 'reward', 'proof', 'referral', 'group', 'deposit', 'wallet', 'frozen', 'share', 'ending', 'quick', 'result', 'replay', 'transfer', 'cases'];

// 开场预载清单：封面 + 角色立绘 + 前两镜视频（约 2MB），
// 其余视频由 FilmScene 的“预取下一段”接力。
const BOOT_ASSETS = [
  './assets/hero-v2.jpg',
  './assets/characters/female.webp',
  './assets/characters/female-blink.webp',
  './assets/characters/female-portal.webp',
  './assets/characters/female-stop.webp',
  './assets/characters/male.webp',
  './assets/characters/male-blink.webp',
  './assets/characters/male-portal.webp',
  './assets/characters/male-stop.webp',
  './assets/video/female-shot-01.mp4',
  './assets/video/female-shot-02.mp4',
  './assets/video/male-shot-01.mp4',
  './assets/video/male-shot-02.mp4',
];

function bootLine(progress) {
  if (progress < 30) return '骗子正在布置现场…';
  if (progress < 60) return '8.8 元正在入账…';
  if (progress < 90) return '周然正在编辑消息…';
  return '好戏开场。';
}

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem('after-8-8-session') || 'null');
  } catch {
    return null;
  }
}

function App() {
  const restoredSession = useRef(readSession()).current;
  const [screen, setScreen] = useState(() => FLOW.includes(restoredSession?.screen) ? restoredSession.screen : 'prologue');
  const [gender, setGender] = useState(() => restoredSession?.gender === 'male' ? 'male' : 'female');
  const [soundOn, setSoundOn] = useState(true);
  const [ending, setEnding] = useState(() => ENDINGS[restoredSession?.ending] ? restoredSession.ending : null);
  const [invested, setInvested] = useState(() => Number(restoredSession?.invested) || 0);
  const [metrics, setMetrics] = useState(() => restoredSession?.metrics ?? INITIAL_METRICS);
  const [history, setHistory] = useState(() => Array.isArray(restoredSession?.history) ? restoredSession.history : []);
  const [answers, setAnswers] = useState(() => restoredSession?.answers ?? {});
  const [questionIndex, setQuestionIndex] = useState(() => Number(restoredSession?.questionIndex) || 0);
  const [quickAnswers, setQuickAnswers] = useState(() => restoredSession?.quickAnswers ?? {});
  const [quickIndex, setQuickIndex] = useState(() => Number(restoredSession?.quickIndex) || 0);
  const [quickChoice, setQuickChoice] = useState(null);
  const [nickname, setNickname] = useState(() => typeof restoredSession?.nickname === 'string' ? restoredSession.nickname : '');
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [groupPhase, setGroupPhase] = useState('intro');
  const [classmatePhase, setClassmatePhase] = useState('intro');
  const [referralPhase, setReferralPhase] = useState('intro');
  const [walletPhase, setWalletPhase] = useState('success');
  const [cardPreview, setCardPreview] = useState(null);
  const appRef = useRef(null);
  const cardRef = useRef(null);
  const toneCtxRef = useRef(null);
  const lightMusicRef = useRef(null);
  const darkMusicRef = useRef(null);
  const musicFadeRef = useRef(null);
  const bootRanRef = useRef(false);
  const [boot, setBoot] = useState(() => restoredSession?.screen && restoredSession.screen !== 'prologue'
    ? { progress: 100, done: true }
    : { progress: 0, done: false });

  const actor = CHARACTER[gender];
  const transferScore = useMemo(() => scoreTransfer(answers), [answers]);
  const profile = useMemo(() => resolveProfile({ history, ending, invested, metrics, quickAnswers, gender, nickname }), [history, ending, invested, metrics, quickAnswers, gender, nickname]);

  const progress = Math.max(2, ((FLOW.indexOf(screen) + 1) / FLOW.length) * 100);

  useEffect(() => {
    try {
      sessionStorage.setItem('after-8-8-session', JSON.stringify({ screen, gender, ending, invested, metrics, history, answers, questionIndex, quickAnswers, quickIndex, nickname }));
    } catch {
      // Local-file and privacy modes may disable storage; the H5 still works without restoration.
    }
  }, [screen, gender, ending, invested, metrics, history, answers, questionIndex, quickAnswers, quickIndex, nickname]);

  // 开场预载：真实字节进度，单项失败跳过，完成 0.6s 后自动淡出。
  // 恢复到剧情中的会话不再显示；资源已缓存时进度会瞬间走完。
  useEffect(() => {
    if (bootRanRef.current) return;
    bootRanRef.current = true;
    if (screen !== 'prologue') {
      setBoot({ progress: 100, done: true });
      return;
    }
    let loadedBytes = 0;
    let totalBytes = 0;
    let doneCount = 0;
    const update = () => {
      const bytePct = totalBytes ? loadedBytes / totalBytes : 0;
      const countPct = doneCount / BOOT_ASSETS.length;
      const pct = Math.min(99, Math.round(Math.max(bytePct, countPct) * 100));
      setBoot((current) => ({ progress: Math.max(current.progress, pct), done: false }));
    };
    Promise.all(BOOT_ASSETS.map(async (url) => {
      try {
        const response = await fetch(url);
        const length = Number(response.headers.get('content-length')) || 0;
        if (length) totalBytes += length;
        if (response.body) {
          const reader = response.body.getReader();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            loadedBytes += value ? value.length : 0;
            update();
          }
        }
      } catch {
        // 单项资源失败不阻塞开场。
      }
      doneCount += 1;
      update();
    })).then(async () => {
      setBoot({ progress: 100, done: false });
      await new Promise((resolve) => setTimeout(resolve, 600));
      setBoot({ progress: 100, done: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tone(kind = 'tap') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!soundOn || !AudioContextClass) return;
    if (!toneCtxRef.current) toneCtxRef.current = new AudioContextClass();
    const context = toneCtxRef.current;
    if (context.state === 'suspended') context.resume().catch(() => {});
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === 'danger' ? 'sawtooth' : 'sine';
    const frequency = kind === 'reward' ? 780 : kind === 'danger' ? 140 : kind === 'bubble' ? 520 : 430;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    if (kind === 'bubble') oscillator.frequency.exponentialRampToValueAtTime(980, context.currentTime + 0.2);
    gain.gain.setValueAtTime(kind === 'bubble' ? 0.055 : 0.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (kind === 'bubble' ? 0.24 : 0.16));
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + (kind === 'bubble' ? 0.25 : 0.17));
  }

  function fadeMusic(nextScreen, enabled = soundOn) {
    const light = lightMusicRef.current;
    const dark = darkMusicRef.current;
    if (!enabled || !light || !dark) return;
    if (Math.abs(light.currentTime - dark.currentTime) > 0.2) dark.currentTime = light.currentTime;
    if (light.paused) {
      light.volume = 0;
      dark.volume = 0;
    }
    light.play().catch(() => {});
    dark.play().catch(() => {});
    const darkMode = DARK_MUSIC_SCREENS.has(nextScreen);
    const lightTarget = darkMode ? 0.08 : 0.3;
    const darkTarget = darkMode ? 0.24 : 0;
    const lightStart = light.volume;
    const darkStart = dark.volume;
    const steps = 18;
    let step = 0;
    window.clearInterval(musicFadeRef.current);
    musicFadeRef.current = window.setInterval(() => {
      step += 1;
      const amount = step / steps;
      light.volume = lightStart + (lightTarget - lightStart) * amount;
      dark.volume = darkStart + (darkTarget - darkStart) * amount;
      if (step >= steps) window.clearInterval(musicFadeRef.current);
    }, 50);
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    if (next) {
      fadeMusic(screen, true);
    } else {
      window.clearInterval(musicFadeRef.current);
      lightMusicRef.current?.pause();
      darkMusicRef.current?.pause();
    }
  }

  function vibrate(pattern = 18) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }

  function go(next, event = null, patch = {}, sound = 'tap') {
    fadeMusic(next);
    if (event) setHistory((items) => [...items, event]);
    if (Object.keys(patch).length) setMetrics((current) => ({ ...current, ...patch }));
    tone(sound);
    appRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'auto' });
    setScreen(next);
  }

  function finish(rank, event, patch = {}) {
    setEnding(rank);
    go('ending', event, patch, rank === 'C' ? 'danger' : 'tap');
    vibrate(rank === 'C' ? [80, 40, 80] : 24);
  }

  function restart() {
    appRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'auto' });
    setScreen('prologue');
    fadeMusic('prologue');
    setEnding(null);
    setInvested(0);
    setMetrics(INITIAL_METRICS);
    setHistory([]);
    setAnswers({});
    setQuestionIndex(0);
    setQuickAnswers({});
    setQuickIndex(0);
    setQuickChoice(null);
    setNickname('');
    setAnswerFeedback(null);
    setShowProfile(false);
    setShowEvidence(false);
    setGroupPhase('intro');
    setClassmatePhase('intro');
    setReferralPhase('intro');
    setWalletPhase('success');
    setCardPreview(null);
  }

  function answerTransfer(optionIndex) {
    if (answerFeedback) return;
    const question = TRANSFER_QUESTIONS[questionIndex];
    const correct = optionIndex === question.answer;
    setAnswers((current) => ({ ...current, [question.id]: optionIndex }));
    setAnswerFeedback({ correct, selected: optionIndex });
    tone(correct ? 'reward' : 'danger');
    vibrate(correct ? 20 : [50, 30, 50]);
  }

  function nextTransfer() {
    if (questionIndex < TRANSFER_QUESTIONS.length - 1) {
      setQuestionIndex((index) => index + 1);
      setAnswerFeedback(null);
    } else {
      go('cases', '完成三类诈骗迁移测试', { verify: Math.max(metrics.verify, transferScore) });
    }
  }

  function answerQuick(optionIndex) {
    if (quickChoice !== null) return;
    const question = QUICK_QUESTIONS[quickIndex];
    setQuickAnswers((current) => ({ ...current, [question.id]: optionIndex }));
    setQuickChoice(optionIndex);
    tone(question.options[optionIndex].safe ? 'reward' : 'tap');
    vibrate(16);
  }

  function nextQuick() {
    if (quickChoice === null) return;
    if (quickIndex < QUICK_QUESTIONS.length - 1) {
      setQuickIndex((index) => index + 1);
      setQuickChoice(null);
      return;
    }
    go('result', '完成钱包精神状态快问');
  }

  async function buildResultCard() {
    const icon = await loadProfileIcon(profile.id);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1600);
    gradient.addColorStop(0, '#3b0543');
    gradient.addColorStop(0.56, '#660874');
    gradient.addColorStop(1, '#9a4fae');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1600);
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    for (let y = -80; y < 1600; y += 220) {
      for (let x = -60; x < 1080; x += 220) {
        ctx.beginPath();
        ctx.arc(x + (y % 440 ? 110 : 0), y, 90, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 54px system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    ctx.fillText('校园反诈互动体验', 90, 140);
    ctx.font = '900 88px system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    ctx.fillText('8.8元到账之后', 90, 265);
    ctx.fillStyle = '#ddc9eb';
    ctx.font = '500 34px system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    ctx.fillText('第一笔返款先给甜头，连环收割随后登场。', 90, 335);
    if (icon) ctx.drawImage(icon, 465, 355, 150, 150);
    ctx.fillStyle = '#e7cdf5';
    ctx.font = '900 118px system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    ctx.fillText(profile.title, 90, 630);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 46px system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    wrapCanvasText(ctx, profile.line, 90, 735, 900, 62);
    ctx.fillStyle = '#ddc9eb';
    ctx.font = '600 31px system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    ctx.fillText(`${profile.wake.label} · ${profile.wake.title}`, 90, 885);
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    roundRect(ctx, 70, 1030, 940, 330, 42);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 38px system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    ctx.fillText('骗子评语', 110, 1105);
    ctx.font = '500 32px system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    wrapCanvasText(ctx, profile.note, 110, 1180, 820, 46);
    ctx.fillStyle = '#e7cdf5';
    ctx.font = '700 30px system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    wrapCanvasText(ctx, profile.defense, 110, 1300, 820, 46);
    ctx.fillStyle = '#ddc9eb';
    ctx.font = '500 26px system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    ctx.fillText('来源可核验 · 官方案例复盘', 90, 1500);
    return canvas.toDataURL('image/png');
  }

  async function downloadCard() {
    setCardPreview(await buildResultCard());
  }

  async function shareCard() {
    const dataUrl = await buildResultCard();
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], '8.8元到账之后-骗子外号卡片.png', { type: 'image/png' });
      const shareData = {
        title: '《8.8元到账之后》',
        text: `${profile.shareLine} 第一笔返款先给甜头，连环收割随后登场。`,
        files: [file],
      };
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
    setCardPreview(dataUrl);
  }

  return (
    <main ref={appRef} className={`app tone-${ending ? ENDINGS[ending].tone : 'neutral'}`}>
      <audio ref={lightMusicRef} src="./assets/audio/trust-bubbles-light.mp3" loop preload="auto" aria-hidden="true" />
      <audio ref={darkMusicRef} src="./assets/audio/trust-bubbles-dark.mp3" loop preload="auto" aria-hidden="true" />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <AnimatePresence>
        {!boot.done && (
          <motion.div className="boot-screen" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <span className="boot-kicker">校园反诈互动短剧</span>
            <h1>演出即将开始</h1>
            <p className="boot-line">{bootLine(boot.progress)}</p>
            <div className="boot-bar"><i style={{ width: `${boot.progress}%` }} /></div>
            <span className="boot-percent">{boot.progress}%</span>
            <small>首次加载约 2MB · 之后可离线回看</small>
          </motion.div>
        )}
      </AnimatePresence>
      {!['prologue', 'cover'].includes(screen) && (
        <header className="topbar">
          <div className="brand-chip"><span className="thu-mark">THU</span><span>反诈体验</span></div>
          <div className="top-actions">
            <button className="icon-button" onClick={toggleSound} aria-label={soundOn ? '关闭声音' : '打开声音'} title={soundOn ? '关闭配乐与音效' : '打开配乐与音效'}>{soundOn ? '♪' : '×'}</button>
            <button className="icon-button" onClick={restart} aria-label="重新开始">↻</button>
          </div>
          <JourneyMap progress={progress} />
        </header>
      )}

      <AnimatePresence mode="wait">
        <motion.section key={screen} className={`screen screen-${screen}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          {screen === 'prologue' && <ScamPrelude bubbles={OPENING_BAITS} onPop={() => { tone('bubble'); fadeMusic('prologue'); }} onNext={(bait) => go('cover', `开场先点开：${bait.message}`)} />}
          {screen === 'cover' && <Cover onStart={() => go('select')} />}
          {screen === 'select' && <CharacterSelect gender={gender} setGender={setGender} onNext={() => go('classmate', `选择${actor.name}进入剧情`)} />}
          {screen === 'classmate' && <ClassmateIntro actor={actor} phase={classmatePhase} setPhase={setClassmatePhase} onOpen={() => go('feed', '因为熟人背书点开兼职链接', { bait: 1 })} onVerify={() => finish('S', '没有把同学背书当作官方证明', { verify: 3, stop: 2 })} />}
          {screen === 'feed' && <Feed actor={actor} showProfile={showProfile} setShowProfile={setShowProfile} onStart={() => go('task', '点击校园AI测评员兼职链接', { bait: 1 })} onVerify={() => finish('S', '在参与前通过官方就业渠道核验', { verify: 2, stop: 2 })} />}
          {screen === 'task' && <Task actor={actor} onFinish={() => go('reward', '完成首个免费小任务', { bait: 2 }, 'reward')} />}
          {screen === 'reward' && <Reward actor={actor} onContinue={() => go('proof', '8.8元到账后继续查看平台证明', { bait: 3, pressure: 1 }, 'reward')} onLeave={() => finish('S', '收到8.8元后仍选择退出并核验', { verify: 3, stop: 3 })} />}
          {screen === 'proof' && <ProofGate actor={actor} onTrust={() => go('referral', '把对方提供的材料当作可信证明', { bait: 4, pressure: 2 })} onVerify={() => finish('S', '跳出对方提供的证据链，独立向官方核验', { verify: 5, stop: 4 })} />}
          {screen === 'referral' && <ReferralTrap actor={actor} phase={referralPhase} setPhase={setReferralPhase} onShare={() => go('group', '用自己的8.8元到账经历替平台背书并转发给同学', { bait: 5, pressure: 3 })} onContinue={() => go('group', '得知同学拿过拉新奖励后仍继续进群', { bait: 5, pressure: 3 })} onStop={() => finish('S', '拒绝把未经核验的兼职继续转给同学', { verify: 5, stop: 5 })} />}
          {screen === 'group' && <Group actor={actor} phase={groupPhase} setPhase={setGroupPhase} onCombo={() => go('deposit', '接受399元组合任务', { pressure: 3 })} onLeave={() => finish('S', '群聊施压时退出并保留证据', { verify: 3, stop: 3 })} />}
          {screen === 'deposit' && <Deposit onPay={() => { setInvested(399); go('wallet', '支付399元后看到平台显示返款成功', { pressure: 4 }, 'reward'); vibrate([25, 20, 25]); }} onVerify={() => finish('S', '付款前暂停并从官方渠道核验', { verify: 4, stop: 4 })} />}
          {screen === 'wallet' && <FakeWallet actor={actor} phase={walletPhase} setPhase={setWalletPhase} onWithdraw={() => go('frozen', '尝试把平台余额提现后出现账户冻结', { pressure: 5 }, 'danger')} onStop={() => finish('B', '发现平台数字没有进入银行卡后立即止损', { verify: 4, stop: 5 })} />}
          {screen === 'frozen' && <Frozen actor={actor} onPay={() => { setInvested(1397); finish('C', '继续支付998元解冻金', { pressure: 5, privacy: 1 }); }} onRefund={() => go('share', '要求退款后被引导共享屏幕', { pressure: 5 })} onStop={() => finish('B', '损失399元后停止转账并求助', { stop: 4, verify: 2 })} />}
          {screen === 'share' && <Share actor={actor} onShare={() => finish('C', '开启屏幕共享暴露账户操作', { privacy: 5 })} onSingle={() => finish('C', '尝试只展示支付页，仍暴露敏感操作', { privacy: 4 })} onRefuse={() => finish('B', '拒绝屏幕共享并保留证据', { privacy: 1, stop: 5 })} />}
          {screen === 'ending' && <Ending actor={actor} rank={ending} invested={invested} history={history} onReplay={() => go('quick', '进入钱包精神状态快问')} />}
          {screen === 'quick' && <QuickTest index={quickIndex} question={QUICK_QUESTIONS[quickIndex]} selected={quickChoice} nickname={nickname} setNickname={setNickname} onAnswer={answerQuick} onNext={nextQuick} />}
          {screen === 'result' && <Result cardRef={cardRef} profile={profile} ending={ending} gender={gender} transferScore={transferScore} onShare={shareCard} onDownload={downloadCard} onRestart={restart} onReplay={() => go('replay')} onTransfer={() => { setQuestionIndex(0); setAnswerFeedback(null); go('transfer'); }} onCases={() => go('cases')} cardPreview={cardPreview} onClosePreview={() => setCardPreview(null)} />}
          {screen === 'replay' && <Replay history={history} onNext={() => go('transfer')} />}
          {screen === 'transfer' && <TransferTest index={questionIndex} feedback={answerFeedback} onAnswer={answerTransfer} onNext={nextTransfer} />}
          {screen === 'cases' && <Cases showEvidence={showEvidence} setShowEvidence={setShowEvidence} onNext={() => go('result')} />}
        </motion.section>
      </AnimatePresence>
      <div className="rotate-hint" aria-hidden="true"><b>请把手机转回竖屏</b><span>《8.8元到账之后》是为竖屏设计的互动短剧，横屏会错过很多细节。</span></div>

    </main>
  );
}

function ScamPrelude({ bubbles, onPop, onNext }) {
  const [selected, setSelected] = useState(null);
  return <div className="scam-prelude">
    <div className="prelude-grid" aria-hidden="true" />
    <motion.div className="prelude-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <span>第一反应测试 · 不公布答案</span>
      <h1>骗子的消息<br />你先点哪条？</h1>
      <p>四条消息同时弹出。选一条你最可能先打开的，系统会记住你的第一反应。</p>
    </motion.div>
    <div className="opening-messages">
      {bubbles.map((bubble, index) => <motion.button key={bubble.id} className={`opening-message opening-message-${bubble.tone} ${selected?.id === bubble.id ? 'selected' : ''}`} onClick={() => { setSelected(bubble); onPop(); }} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .1 }}>
        <span className="opening-message-meta"><b>{bubble.label}</b><small>刚刚</small></span>
        <strong>{bubble.message}</strong>
        <em>{selected?.id === bubble.id ? '已记录第一反应' : '点开看看 →'}</em>
      </motion.button>)}
    </div>
    <AnimatePresence>
      {selected && <motion.div className="prelude-complete opening-next" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <div className="challenge-result"><span>第一反应已记录</span><strong>答案暂不公布</strong></div>
        <p>接下来，你会以一名THU学生的视角，走进这条消息的后面。</p>
        <button className="primary" onClick={() => onNext(selected)}>进入《8.8元到账之后》 <span>→</span></button>
      </motion.div>}
    </AnimatePresence>
  </div>;
}

function Cover({ onStart }) {
  return <div className="cover-wrap cover-v2">
    <img className="hero-poster" src="./assets/hero-v2.jpg" alt="戴微笑面具的幕后操盘者在虚拟网络中布置返利、转账与屏幕共享陷阱" />
    <div className="cover-scan" aria-hidden="true" />
    <div className="cover-copy">
      <div className="cover-kicker">AI 互动反诈短剧 · 由你决定结局</div>
      <h1>8.8元<br />到账之后</h1>
      <p className="slogan">第一笔返款先给甜头，<br />连环收割随后登场。</p>
      <button className="primary giant" onClick={onStart}>穿过诱饵 <span>→</span></button>
    </div>
  </div>;
}

function CharacterSelect({ gender, setGender, onNext }) {
  return <div>
    <Eyebrow index="01" text="选择你的视角" />
    <h2>这一次，你是故事里的人</h2>
    <p className="lead">男女角色经历相同，选择只影响人物形象，不影响结局。</p>
    <div className="character-grid">
      {Object.entries(CHARACTER).map(([key, character]) => <button key={key} className={`character-card ${gender === key ? 'selected' : ''}`} onClick={() => setGender(key)}>
        <img src={character.portal} alt={character.alt} />
        <span className="selection-dot">{gender === key ? '✓' : ''}</span>
        <span className="character-name">{character.name}</span>
        <span className="character-role">清华园里的普通学生</span>
      </button>)}
    </div>
    <button className="primary" onClick={onNext}>以这个身份开始 <span>→</span></button>
  </div>;
}

function ClassmateIntro({ actor, phase, setPhase, onOpen, onVerify }) {
  return <div>
    <Eyebrow index="镜头 01" text="熟人发来的消息" />
    <h2>下午四点，周然突然发来一个兼职</h2>
    <FilmScene actor={actor} beat="message" captions={['手机震动', '同班同学 · 周然', '“我刚到账，你也试试？”']} />
    <div className="chat-window classmate-chat">
      <Chat name="周然" text="你不是想找灵活兼职吗？这个是学长内推的短视频标注，我刚做完，8.8已经到账。" image="¥8.80 收款成功" />
      <div className="voice-message"><i /><i /><i /><i /><span>8″</span></div>
      {phase === 'asked' && <>
        <Chat name={actor.name} text="这是学校发的吗？为什么链接不是校内平台？" />
        <Chat name="周然" text="不是官方群，但好几个同学都做了。第一单不要钱，你先拿到返款再说。" />
        <div className="director-note"><b>旁白</b><span>周然没撒谎。他只是把自己那一次到账，当成了平台可信。</span></div>
      </>}
    </div>
    <div className="choices">
      <button className="choice hot" onClick={onOpen}><b>既然同学做过，点开看看</b><span>熟人背书让陌生链接显得安全</span></button>
      {phase !== 'asked' && <button className="choice" onClick={() => setPhase('asked')}><b>先问：这是学校官方发的吗？</b><span>追问消息的真正来源</span></button>}
      <button className="choice safe" onClick={onVerify}><b>不点链接，自己找官方渠道核验</b><span>熟人只能证明他转发过，不能证明项目真实</span></button>
    </div>
  </div>;
}

function Feed({ actor, showProfile, setShowProfile, onStart, onVerify }) {
  return <div>
    <Eyebrow index="02" text="午后 · 宿舍" />
    <h2>一条“校内兼职”出现在信息流</h2>
    <FilmScene actor={actor} beat="discover" captions={['信息流划过', '“校园AI测评员”', '她停在了这一条']} />
    <div className="social-card">
      <div className="social-head"><div className="avatar-logo">AI</div><div><b>校园AI测评中心</b><span>推荐给你 · 刚刚</span></div><span className="more">•••</span></div>
      <p>招募校园 AI 测评员｜每天 20 分钟<br /><b>无需垫资，首单秒结</b>，名额仅限本校学生</p>
      <div className="poster"><span>AI CAMPUS</span><strong>轻松兼职<br />首单立返</strong><em>今日仅 30 个名额</em></div>
      <div className="social-meta"><span>♡ 286</span><span>评论 47 · 收藏 91</span></div>
    </div>
    <div className="choices">
      <button className="choice hot" onClick={onStart}><b>看看是什么任务</b><span>“先试试，反正不花钱”</span></button>
      <button className="choice" onClick={() => setShowProfile(true)}><b>先看账号主页</b><span>浏览量很高，但能证明真实吗？</span></button>
      <button className="choice safe" onClick={onVerify}><b>去官方就业渠道核验</b><span>不点击私聊链接</span></button>
    </div>
    {showProfile && <Modal onClose={() => setShowProfile(false)} title="看起来很像真的">
      <div className="profile-stats"><b>8.6万</b><span>粉丝</span><b>126</b><span>发布</span><b>99+</b><span>成功晒单</span></div>
      <p>头像、粉丝量、评论和“企业认证”截图都可以伪造。真正的核验，要离开对方提供的页面，自己找到学校或企业官方渠道。</p>
      <button className="primary" onClick={() => { setShowProfile(false); onStart(); }}>继续看看任务</button>
    </Modal>}
  </div>;
}

function Task({ actor, onFinish }) {
  return <div>
    <Eyebrow index="03" text="免费试做 · 视频热度校准" />
    <h2>看完15秒视频，标记观众流失点</h2>
    <p className="lead">任务像真的，规则也说得通。信任正是在“能做、能交、能返”里一点点建立。</p>
    <FilmScene actor={actor} beat="work" captions={['打开任务页面', '样本标注 · 3 / 3', '手指停在提交键前']} />
    <div className="task-panel">
      <div className="task-top"><span>短视频完播率标注台</span><b>样本 3 / 3</b></div>
      <div className="sample-art video-sample"><span>00:11 / 00:15</span><i /><b>观众在第几秒最可能划走？</b></div>
      <p>选择最明显的节奏断点</p>
      <div className="tag-row"><span>第 4 秒</span><span className="active">第 11 秒</span><span>无断点</span></div>
      <div className="mini-progress"><i /></div>
    </div>
    <p className="case-seed">真实套路原型：先完成简单试单并得到小额返款，再被引导连续垫资。</p>
    <button className="primary" onClick={onFinish}>提交样本并结算</button>
  </div>;
}

function Reward({ actor, onContinue, onLeave }) {
  return <div className="centered">
    <Eyebrow index="04" text="首单结算" />
    <FilmScene actor={actor} beat="reward" captions={['提示音响起', '¥8.80 已入账', '怀疑短暂消失']} />
    <motion.div className="transaction-slip" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><span>任务佣金入账</span><strong>+ ¥8.80</strong><em>首单结算成功</em></motion.div>
    <h2>钱真的到了</h2>
    <p className="lead">这一刻最危险的不是8.8元，而是它让“怀疑”显得多余。</p>
    <div className="mentor-note"><b>停一下</b><span>骗子愿意先支付小额成本，只为让下一笔399元看起来更安全。</span></div>
    <div className="choices">
      <button className="choice hot" onClick={onContinue}><b>加入高收益任务群</b><span>“已经返过一次，应该没问题”</span></button>
      <button className="choice safe" onClick={onLeave}><b>拿到返款后退出并核验</b><span>不让一次到账替对方背书</span></button>
    </div>
  </div>;
}

function ProofGate({ actor, onTrust, onVerify }) {
  return <div>
    <Eyebrow index="05" text="证据陷阱" />
    <h2>对方主动发来三份“证明”</h2>
    <p className="lead">哪一项能真正证明这份兼职可信？注意：对方给你的证据，仍由对方控制。</p>
    <FilmScene actor={actor} beat="inspect" captions={['返款是真的', '执照看起来也是真的', '但收款方是谁？']} />
    <div className="evidence-stack">
      <article><span>01 · 企业材料</span><b>营业执照照片</b><p>名称、编号齐全，右下角还有红色印章。</p><em>截图可盗用，主体也可能与收款方无关</em></article>
      <article><span>02 · 成功记录</span><b>你的 ¥8.80 到账凭证</b><p>第一笔确实到账，群里还有几十张返款截图。</p><em>真返款也可能只是获取信任的成本</em></article>
      <article className="outside"><span>03 · 独立核验</span><b>自己找到官方联系方式</b><p>退出聊天，独立搜索学校就业或企业官方渠道询问。</p><em>证据链不经过对方，才叫独立核验</em></article>
    </div>
    <div className="choices">
      <button className="choice hot" onClick={onTrust}><b>材料齐全，继续进群</b><span>把截图、返款和群友口碑合在一起判断</span></button>
      <button className="choice safe" onClick={onVerify}><b>离开页面，独立联系官方核验</b><span>不使用对方提供的电话、链接或二维码</span></button>
    </div>
  </div>;
}

function ReferralTrap({ actor, phase, setPhase, onShare, onContinue, onStop }) {
  return <div>
    <Eyebrow index="反转" text="当受害者开始替骗局说话" />
    <h2>平台让你邀请一位同学，再奖励15元</h2>
    <FilmScene actor={actor} beat="hesitate" captions={['新消息', '室友：这个兼职靠谱吗？', '你的8.8元刚刚到账']} />
    {phase === 'intro' ? <>
      <div className="referral-card">
        <span>新人助力奖励</span><strong>邀请 1 人，立返 ¥15</strong><p>好友完成免费试单即可到账，无需好友垫付。</p>
        <div className="fake-code">分享邀请码 <b>QH-8807</b></div>
      </div>
      <div className="incoming-question"><span>室友</span><b>“你自己做过吗？真的会返吗？”</b></div>
      <div className="choices">
        <button className="choice danger-soft" onClick={onShare}><b>告诉室友“我已经到账，放心做”</b><span>你没有说谎，却开始替平台承担信用</span></button>
        <button className="choice" onClick={() => setPhase('reveal')}><b>先问周然：你转给我也有奖励吗？</b><span>追查熟人背书背后的利益</span></button>
        <button className="choice safe" onClick={onStop}><b>提醒室友别点，自己也停止</b><span>不让诱饵沿熟人关系继续扩散</span></button>
      </div>
    </> : <>
      <div className="chat-window confession">
        <Chat name={actor.name} text="你把链接转给我，也拿了拉新奖励吗？" />
        <Chat name="周然" text="……有15块。但我真不是骗你，我自己也拿到8.8了。后面的399我还没做。" />
        <Chat name="周然" text="群管理员说只要你完成试单，我就算任务完成。你先进去看看，别充钱就行。" />
      </div>
      <div className="accomplice-reveal"><span>传播链</span><strong>骗子 → 周然 → 你 → 室友</strong><p>同学未必是诈骗团伙，却可能为了返利、面子或“我也成功过”的经验，无意间成为拉新链上的帮凶。</p></div>
      <div className="choices">
        <button className="choice hot" onClick={onContinue}><b>只进群看看，不转发也不付款</b><span>你已经知道规则会变，但仍想确认下一步</span></button>
        <button className="choice safe" onClick={onStop}><b>终止任务，并提醒周然和室友</b><span>截取邀请码和聊天记录，向平台及学校反馈</span></button>
      </div>
    </>}
  </div>;
}

function Group({ actor, phase, setPhase, onCombo, onLeave }) {
  const chatRef = useRef(null);
  useEffect(() => {
    if (phase === 'intro') return;
    chatRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [phase]);
  return <div>
    <Eyebrow index="05" text="高收益任务群 · 99+" />
    <h2>所有人都在晒到账截图</h2>
    <div className="chat-window" ref={chatRef}>
      <div className="chat-date">14:07</div>
      <Chat name="助教—小夏" text="恭喜新同学完成试单！平台托管组合任务马上满员，399返520。" role="admin" />
      <Chat name="A7学员" text="我刚到账，老师速度太快了！" image="¥520.00 收款成功" />
      <Chat name="认证专员" text="本期项目已完成企业备案，垫资由平台风控账户临时托管。" role="admin" />
      <Chat name="小柠檬" text="求加名额，昨天错过后悔死了😭" />
      <Chat name="助教—小夏" text={`@${actor.name} 只剩最后2个名额，现在跟单吗？`} role="admin" />
      {phase === 'why' && <Chat fresh name="助教—小夏" text="联合任务要先垫资做数据，企业完成后统一返。群里都是本校同学，放心。" role="admin" />}
      {phase === 'ordinary' && <Chat fresh name="助教—小夏" text="普通单今天已满。要继续只有399组合单，三分钟后关闭。" role="admin" />}
    </div>
    <div className="pressure-meter"><span>从众压力</span><i><b /></i><strong>升高</strong></div>
    <div className="choices">
      <button className="choice hot" onClick={onCombo}><b>抢399元组合任务</b><span>预计返款520元</span></button>
      <button className={`choice ${phase === 'why' ? 'asked' : ''}`} onClick={() => setPhase('why')} disabled={phase === 'why'}><b>{phase === 'why' ? '已追问 · 看助教怎么回' : '先问为什么要垫资'}</b><span>看看对方如何解释</span></button>
      <button className={`choice ${phase === 'ordinary' ? 'asked' : ''}`} onClick={() => setPhase('ordinary')} disabled={phase === 'ordinary'}><b>{phase === 'ordinary' ? '已追问 · 看助教怎么回' : '只做不花钱的普通单'}</b><span>对方会不会改变规则？</span></button>
      <button className="choice safe" onClick={onLeave}><b>退出群聊并保留证据</b><span>不在倒计时里做决定</span></button>
    </div>
  </div>;
}

function Deposit({ onPay, onVerify }) {
  return <div>
    <Eyebrow index="06" text="组合任务 · 支付确认" />
    <h2>399元，距离“520到账”只差一步</h2>
    <div className="pay-card">
      <span className="pay-label">任务垫资金额</span><strong>¥399.00</strong>
      <div className="return-line"><span>任务完成返还</span><b>¥520.00</b></div>
      <div className="pay-receiver"><span>收款方</span><b>数创数据服务工作室</b></div>
      <div className="fake-guarantee"><span>✓ 平台托管</span><span>✓ 超时赔付</span><span>✓ 企业认证</span></div>
      <div className="countdown">名额锁定 <b>02:59</b></div>
    </div>
    <div className="risk-strip"><b>三个矛盾点</b><span>兼职却要求先付钱</span><span>收款方与招聘账号名称不一致</span><span>用倒计时阻止你核验</span></div>
    <div className="choices">
      <button className="choice danger" onClick={onPay}><b>支付399元</b><span>继续完成组合任务</span></button>
      <button className="choice safe" onClick={onVerify}><b>暂停付款，独立核验</b><span>自己搜索官方联系方式，不用对方给的链接</span></button>
    </div>
  </div>;
}

function FakeWallet({ actor, phase, setPhase, onWithdraw, onStop }) {
  return <div>
    <Eyebrow index="假反转" text="399元之后，平台真的显示返款" />
    <h2>{phase === 'success' ? '余额变成了520.80元' : '银行余额，一分钱也没有增加'}</h2>
    <FilmScene actor={actor} beat={phase === 'success' ? 'wallet' : 'realize'} captions={phase === 'success' ? ['任务完成', '平台余额 +520.80', '“难道真的不是骗局？”'] : ['切出任务平台', '打开银行 App', '可用余额未变化']} />
    {phase === 'success' ? <>
      <div className="platform-wallet">
        <span>可提现余额</span><strong>¥520.80</strong><div><i>本金 ¥399</i><i>佣金 ¥121.80</i></div>
        <b>✓ 组合任务结算成功</b>
      </div>
      <div className="director-note"><b>这一幕故意让你松一口气</b><span>页面上的数字可以由骗子任意修改。只有银行或正规支付账户中的实际入账，才是到账。</span></div>
      <div className="choices">
        <button className="choice hot" onClick={onWithdraw}><b>立即提现520.80元</b><span>把平台余额转回银行卡</span></button>
        <button className="choice" onClick={() => setPhase('bank')}><b>先退出平台，打开银行App核对</b><span>用独立账户验证是否真正到账</span></button>
      </div>
    </> : <>
      <div className="bank-check"><span>银行卡交易记录</span><strong>无新入账</strong><p>所谓“520.80元”只存在于对方控制的任务页面。</p></div>
      <div className="incoming-call"><i>来电</i><div><b>任务财务专员</b><span>“检测到你切出任务，提现通道异常，请立即返回修复。”</span></div></div>
      <div className="choices">
        <button className="choice danger-soft" onClick={onWithdraw}><b>接听财务电话，按指导修复</b><span>对方会把“未到账”解释成你的操作问题</span></button>
        <button className="choice safe" onClick={onStop}><b>挂断电话，保存证据并止损</b><span>已经损失399元，但可以阻止下一笔</span></button>
      </div>
    </>}
  </div>;
}

function Frozen({ actor, onPay, onRefund, onStop }) {
  return <div>
    <Eyebrow index="07" text="任务异常" />
    <FilmScene actor={actor} beat="alarm" captions={['提现失败', '账户冻结', '“再付998元就能解开”']} />
    <motion.div className="alert-card" initial={{ x: -8 }} animate={{ x: [0, -5, 5, -3, 0] }}>
      <span className="alert-icon">!</span><h2>操作错误<br />账户已冻结</h2>
      <p>检测到任务顺序异常，399元暂无法返还。完成998元修复单即可一次性到账1,518元。</p>
    </motion.div>
    <div className="chat-window compact">
      <Chat name="财务专员" text="这是你个人操作造成的，系统修复有时限。现在不处理，任务金会永久冻结。" role="admin" />
      <Chat name="财务专员" text="不要联系平台客服，他们看不到内部任务数据。" role="admin" />
    </div>
    <div className="choices">
      <button className="choice danger" onClick={onPay}><b>再付998元解冻</b><span>“不然前面的399也拿不回”</span></button>
      <button className="choice" onClick={onRefund}><b>要求原路退款</b><span>看看“财务”怎么操作</span></button>
      <button className="choice safe" onClick={onStop}><b>停止转账，截图取证并求助</b><span>联系警方、银行和学校保卫部门</span></button>
    </div>
  </div>;
}

function Share({ actor, onShare, onSingle, onRefuse }) {
  return <div>
    <Eyebrow index="08" text="“退款指导”" />
    <h2>对方发来会议链接，要求共享屏幕</h2>
    <FilmScene actor={actor} beat="refuse" captions={['验证码弹出', '意识到对方正在看', '拒绝共享，立即止损']} />
    <div className="phone-share">
      <div className="share-rings"><span /><span /><span /></div>
      <strong>开启屏幕共享</strong><p>财务专员将指导你完成原路退款</p>
      <div className="permission-list"><span>可看到屏幕全部内容</span><span>可看到通知与验证码</span><span>可观察支付操作</span></div>
    </div>
    <div className="mentor-note danger-note"><b>关键提醒</b><span>“只看一眼”“只看支付页”仍可能暴露验证码、余额和操作路径。</span></div>
    <div className="choices">
      <button className="choice danger" onClick={onShare}><b>开启完整屏幕共享</b><span>让对方远程指导退款</span></button>
      <button className="choice danger-soft" onClick={onSingle}><b>只展示支付页面</b><span>看似谨慎，仍在对方控制的流程里</span></button>
      <button className="choice safe" onClick={onRefuse}><b>拒绝共享，立即止损</b><span>挂断联系，保存证据</span></button>
    </div>
  </div>;
}

function Ending({ actor, rank, invested, history, onReplay }) {
  const data = ENDINGS[rank];
  const loss = rank === 'S' ? 0 : invested;
  const endingLabel = rank === 'S' ? '你把手刹拉上了' : rank === 'B' ? '钱包受伤，但你停下了' : '骗子把这一轮做完了';
  return <div className="centered ending-wrap">
    <span className={`rank-badge ending-stamp rank-${rank}`}>{endingLabel}</span>
    <p className="ending-kicker">剧情先告一段落</p>
    <h2>{data.title}</h2>
    <p className="ending-subtitle">{data.subtitle}</p>
    {rank === 'S' && <Scene actor={actor} pose="stop" />}
    <div className="ending-ledger"><div><span>本次损失</span><strong>¥{loss.toFixed(2)}</strong></div><div><span>关键选择</span><strong>{history.length}</strong></div></div>
    <p className="ending-summary">{data.summary}</p>
    {rank !== 'S' && <div className="emergency"><b>现实中如果已经转账</b><span>立即停止后续付款，联系银行尝试止付；保存聊天、转账、账号和链接证据，并尽快报警。不要按对方要求删除记录。</span></div>}
    <button className="primary" onClick={onReplay}>拆解这场骗局 <span>→</span></button>
  </div>;
}

function Replay({ history, onNext }) {
  return <div>
    <Eyebrow index="复盘" text="骗局并不是从399元开始" />
    <h2>八个节点，把一次“试试”推向失控</h2>
    <p className="lead">点开每个节点，看看骗子在利用什么心理。</p>
    <div className="risk-timeline">
      {RISK_NODES.map((node, index) => <details key={node.id} open={index === 0}>
        <summary><span className="node-icon">{node.icon}</span><div><b>{node.title}</b><small>{node.text}</small></div><em>+</em></summary>
        <p>{node.lesson}</p>
      </details>)}
    </div>
    <div className="history-note"><b>你的路径</b><span>{history.join(' → ')}</span></div>
    <div className="rule-card"><span>记住</span><strong>兼职要求先垫资，立即停止；退款要求共享屏幕，立即拒绝。</strong></div>
    <button className="primary" onClick={onNext}>换个场景，我还能识别吗？</button>
  </div>;
}

function TransferTest({ index, feedback, onAnswer, onNext }) {
  const question = TRANSFER_QUESTIONS[index];
  return <div>
    <Eyebrow index={`${index + 1}/3`} text="反诈迁移测试" />
    <h2>换个包装，套路还认得出来吗？</h2>
    <div className="scenario-card">
      <span className="scenario-tag">{question.tag}</span>
      <div className="scenario-chat">{question.message}</div>
      <p>最关键的风险信号是：</p>
    </div>
    <div className="answer-list">
      {question.options.map((option, optionIndex) => {
        const status = feedback ? optionIndex === question.answer ? 'correct' : optionIndex === feedback.selected ? 'wrong' : 'muted' : '';
        return <button className={`answer ${status}`} key={option} onClick={() => onAnswer(optionIndex)} disabled={Boolean(feedback)}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>;
      })}
    </div>
    {feedback && <motion.div className={`feedback ${feedback.correct ? 'correct' : 'wrong'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <b>{feedback.correct ? '识别正确' : '再看一眼关键动作'}</b><p>{question.reason}</p>
      <button className="primary" onClick={onNext}>{index === TRANSFER_QUESTIONS.length - 1 ? '查看真实案例' : '下一题'}</button>
    </motion.div>}
  </div>;
}

function QuickTest({ index, question, selected, nickname, setNickname, onAnswer, onNext }) {
  const complete = index === QUICK_QUESTIONS.length - 1 && selected !== null;
  return <div className="quick-test">
    <Eyebrow index={`${index + 1}/${QUICK_QUESTIONS.length}`} text="钱包精神状态快问" />
    <h2>不考你背没背过，<br />只看你第一反应。</h2>
    <p className="lead">先选最像你的那句。没有标准答案，系统只记录你会怎么做。</p>
    <div className={`quick-card quick-card-${question.id}`}>
      <span className="scenario-tag">{question.tag}</span>
      <div className="quick-message">{question.message}</div>
      <div className="quick-options">
        {question.options.map((option, optionIndex) => <button key={option.text} className={`quick-option ${selected === optionIndex ? 'selected' : ''}`} onClick={() => onAnswer(optionIndex)} disabled={selected !== null}>
          <span>{String.fromCharCode(65 + optionIndex)}</span><b>{option.text}</b>
        </button>)}
      </div>
    </div>
    {selected !== null && <motion.div className="quick-picked" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <span>已记下</span><b>{complete ? '你的钱包外号快要揭晓了。' : '别急，下一条更像你。'}</b>
    </motion.div>}
    {complete && <div className="nickname-box">
      <label htmlFor="nickname">给结果卡写个昵称（可跳过）</label>
      <input id="nickname" value={nickname} onChange={(event) => setNickname(event.target.value.slice(0, 12))} placeholder="例如：紫操场常驻人口" maxLength={12} />
    </div>}
    {selected !== null && <button className="primary" onClick={onNext}>{complete ? '查看骗子给我的外号' : '下一条 →'}</button>}
  </div>;
}

function Cases({ showEvidence, setShowEvidence, onNext }) {
  const [selectedCase, setSelectedCase] = useState(null);

  return <div>
    <Eyebrow index="证据" text="985高校官方案例库" />
    <h2>你刚经历的每一步，都发生过</h2>
    <p className="lead">下列来源均为高校官网或校方发布材料。我们区分“高校发布的案例”和“明确为学生受害者的案例”。</p>
    <div className="stat-grid">
      <div><strong>111→44</strong><span>上海交大校园电诈案件数，2021年至2024年</span></div>
      <div><strong>2.68万</strong><span>上海交大通报的单案平均损失</span></div>
    </div>
    <p className="source-caption">上海交通大学官方数据，2025-09-18</p>
    <div className="case-list">
      {OFFICIAL_CASES.slice(0, 3).map((item, index) => <article key={item.id}>
        <span>0{index + 1} · {index === 0 ? '清华保卫部发布的警方真实案例' : '重庆大学学生真实案例'}</span>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        <button className="case-source-button" onClick={() => setSelectedCase(item)}>在本页查看案例与来源 <b>→</b></button>
      </article>)}
    </div>
    <button className="text-button" onClick={() => setShowEvidence((value) => !value)}>{showEvidence ? '收起数据说明' : '展开数据边界与来源说明'}</button>
    {showEvidence && <div className="evidence-note">
      <p><b>数据边界：</b>清华来源是校保卫部发布的北京市反诈中心案例，不能据此称受害者为清华学生；重庆大学材料明确写明“学生”；上海交大数字仅反映该校统计，不代表全国高校。</p>
      <button className="case-source-button" onClick={() => setSelectedCase(OFFICIAL_CASES[3])}>在本页查看上海交大数据来源 <b>→</b></button>
    </div>}
    <button className="primary" onClick={onNext}>回到我的骗子外号结果</button>
    <AnimatePresence>
      {selectedCase && <motion.div className="modal-backdrop" role="presentation" onClick={() => setSelectedCase(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="modal case-source-modal" role="dialog" aria-modal="true" aria-label="官方案例来源" onClick={(event) => event.stopPropagation()} initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: 30 }}>
          <button className="modal-close" onClick={() => setSelectedCase(null)} aria-label="关闭案例来源">×</button>
          <span className="source-modal-kicker">官方来源 · 默认留在 H5 内</span>
          <h3>{selectedCase.title}</h3>
          <p>{selectedCase.summary}</p>
          <div className="source-modal-issuer"><b>发布方</b><span>{selectedCase.issuer}</span></div>
          <p className="source-mobile-note">手机端建议先阅读本页摘要。只有需要核验原文件时，再打开下面的外部链接；原 H5 会保留在原标签页。</p>
          <a className="source-external-link" href={selectedCase.url} target="_blank" rel="noopener noreferrer">新标签打开官方原文件 <span>↗</span></a>
          <button className="secondary" onClick={() => setSelectedCase(null)}>留在 H5，继续体验</button>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </div>;
}

function Result({ cardRef, profile, ending, gender, transferScore, onShare, onDownload, onRestart, onReplay, onTransfer, onCases, cardPreview, onClosePreview }) {
  const [showGallery, setShowGallery] = useState(false);
  const [galleryDetail, setGalleryDetail] = useState(null);
  const endingLabel = ending === 'S' ? '付款前停下' : ending === 'B' ? '及时止损' : '连环收割';
  return <div className="centered result-wrap">
    <Eyebrow index={profile.hidden ? '隐藏' : '完成'} text="骗子给你的外号" />
    <div className="result-card" ref={cardRef}>
      <span className="result-brand">8.8元到账之后 · 操盘手通讯录</span>
      <div className="result-recipient">目标：{profile.nickname}</div>
      <div className={`profile-icon ${profile.hidden ? 'rare' : ''}`}><ProfileIcon id={profile.id} /></div>
      <h2 className="profile-title">{profile.title}</h2>
      <p className="profile-line">{profile.line}</p>
      <div className="awake-panel"><span>你在这里醒来</span><b>{profile.wake.label}</b><small>{profile.wake.title}</small></div>
      <div className="scammer-note"><span>骗子评语</span><p>“{profile.note}”</p></div>
      <blockquote>{profile.defense}</blockquote>
      <div className="result-tags"><span>剧情结局 · {endingLabel}</span><span>迁移判断 {transferScore}/3</span><span>{profile.hidden ? '隐藏结果' : '本局画像'}</span></div>
    </div>
    <button className="primary" onClick={onShare}>分享我的钱包外号</button>
    <button className="secondary" onClick={onDownload}>预览 / 保存结果卡片</button>
    <div className="result-links">
      <button className="result-link" onClick={() => setShowGallery(true)}>翻开骗子人才库 · 共11款外号</button>
      <button className="result-link" onClick={onReplay}>拆开骗子的八步剧本</button>
      <button className="result-link" onClick={onTransfer}>换三个场景再试</button>
      <button className="result-link" onClick={onCases}>查看985高校真实案例</button>
    </div>
    <button className="text-button result-restart" onClick={onRestart}>换一条路径再体验</button>
    <p className="share-note">分享时建议附上：第一笔返款先给甜头，连环收割随后登场。</p>
    {cardPreview && <Modal title="结果卡片已生成" onClose={onClosePreview}>
      <img className="card-preview-image" src={cardPreview} alt="已生成的反诈识别力结果卡片" />
      <a className="download-link" href={cardPreview} download="8.8元到账之后-骗子外号卡片.png">保存 PNG 到本机</a>
      <p className="save-tip">如果手机浏览器没有直接下载，可长按上方图片保存。</p>
    </Modal>}
    {showGallery && <Modal title={galleryDetail ? '档案详情' : '骗子人才库 · 全部外号'} onClose={() => { setShowGallery(false); setGalleryDetail(null); }}>
      {galleryDetail ? <div className="gallery-detail">
        <div className="gallery-detail-icon"><ProfileIcon id={galleryDetail.id} /></div>
        <h4>{galleryDetail.title || (gender === 'male' ? galleryDetail.titleMale : galleryDetail.titleFemale)}</h4>
        <div className="gallery-tags">
          {galleryDetail.id === profile.id && <em className="gallery-tag">本局</em>}
          {galleryDetail.hidden && <em className="gallery-tag rare-tag">隐藏款</em>}
        </div>
        <p className="gallery-detail-line">{galleryDetail.line}</p>
        <p className="gallery-detail-note">{galleryDetail.note}</p>
        <blockquote>{galleryDetail.defense}</blockquote>
        <button className="secondary" onClick={() => setGalleryDetail(null)}>← 返回人才库</button>
      </div> : <>
        <div className="gallery-grid">
          {Object.values(ALL_PROFILE_TYPES).map((type) => (
            <button key={type.id} className={`gallery-item ${type.id === profile.id ? 'current' : ''}`} onClick={() => setGalleryDetail(type)}>
              <div className="gallery-badge"><ProfileIcon id={type.id} /></div>
              <b>{type.title || (gender === 'male' ? type.titleMale : type.titleFemale)}</b>
              <div className="gallery-tags">
                {type.id === profile.id && <em className="gallery-tag">本局</em>}
                {type.hidden && <em className="gallery-tag rare-tag">隐藏款</em>}
              </div>
              <span>{type.line}</span>
            </button>
          ))}
        </div>
        <p className="gallery-note">点击任意外号查看档案。8 款常规 + 3 款隐藏，隐藏款的触发条件藏在剧情选择里。</p>
      </>}
    </Modal>}
  </div>;
}

function ProfileIcon({ id }) {
  const src = profileImageSrc(id);
  if (!src) return <span dangerouslySetInnerHTML={{ __html: profileIconSvg(id) }} />;
  const fallback = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(profileIconSvg(id));
  return <img src={src} alt={PROFILE_ICONS[id]?.label ?? '人格徽章插图'} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallback; }} />;
}

function Scene({ actor, pose }) {
  const actionImage = pose === 'portal' ? actor.portal : pose === 'stop' ? actor.stop : actor.image;
  return <div className={`scene scene-${pose}`}>
    <div className="campus-window"><span /><span /></div>
    <div className="actor-stack">
      <motion.img className="actor-base" src={actionImage} alt={actor.alt} animate={{ y: [0, -5, 0], rotate: [-0.3, 0.4, -0.3] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }} />
      {actionImage === actor.image && <img className="actor-blink" src={actor.blink} alt="" aria-hidden="true" />}
    </div>
    {pose === 'thinking' && <div className="thought-trace" aria-hidden="true"><span>?</span><i /><i /><i /></div>}
    <div className="scene-caption"><b>{actor.name}</b><span>大二学生 · 正在找一份灵活兼职</span></div>
  </div>;
}

function FilmScene({ actor, beat, captions }) {
  const shotByBeat = {
    message: 1, discover: 2, work: 2, reward: 3, inspect: 4,
    hesitate: 5, wallet: 6, realize: 6, alarm: 7, refuse: 8,
  };
  const shot = shotByBeat[beat] || 1;
  const index = shot - 1;
  useEffect(() => {
    // 预取下一段短剧，剧情推进时视频可立即开播。
    const next = actor.motionShots[index + 1];
    if (next) fetch(next).catch(() => {});
  }, [actor, index]);
  return <div className={`film-scene film-${beat}`} aria-label={`AI短剧连续动作，第 ${shot} 镜`}>
    <div className="film-bars" aria-hidden="true" />
    <video
      className="film-video"
      key={`${actor.name}-${beat}-${shot}`}
      src={actor.motionShots[index]}
      poster={actor.shots[index]}
      autoPlay
      muted
      playsInline
      loop
      preload="auto"
      aria-label={`${actor.alt}在宿舍中的连续手部、上半身和表情动作`}
    />
    <div className="film-captions" aria-live="polite">
      {captions.map((caption, captionIndex) => <span key={`${beat}-${caption}`} style={{ '--caption-index': captionIndex }}>{caption}</span>)}
    </div>
    <div className="film-timecode">AI MOTION · SHOT {String(shot).padStart(2, '0')}</div>
  </div>;
}

function JourneyMap({ progress }) {
  const stages = ['入口', '8.8', '围猎', '冻结', '破局'];
  return <div className="journey-map" aria-label={`剧情进度 ${Math.round(progress)}%`}>
    <div className="journey-line"><motion.i animate={{ width: `${progress}%` }} /></div>
    {stages.map((stage, index) => {
      const point = (index / (stages.length - 1)) * 100;
      return <span key={stage} className={progress >= point ? 'passed' : ''} style={{ left: `${point}%` }}><b />{stage}</span>;
    })}
    <motion.div className="journey-runner" animate={{ left: `${Math.min(98, progress)}%` }} transition={{ type: 'spring', stiffness: 90, damping: 18 }}><i>人</i></motion.div>
  </div>;
}

function Chat({ name, text, role, image, fresh }) {
  return <div className={`chat-row ${fresh ? 'fresh' : ''}`}><div className={`chat-avatar ${role || ''}`}>{name.slice(0, 1)}</div><div><span className="chat-name">{name}</span><div className="bubble">{text}{image && <div className="receipt"><small>交易成功</small><b>{image}</b></div>}</div></div></div>;
}

function Eyebrow({ index, text }) {
  return <div className="eyebrow"><span>{index}</span>{text}</div>;
}

function Modal({ title, onClose, children }) {
  return <motion.div className="modal-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}><motion.div className="modal" role="dialog" aria-modal="true" aria-label={title} initial={{ y: 80 }} animate={{ y: 0 }} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><h3>{title}</h3>{children}</motion.div></motion.div>;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  let line = '';
  let lineY = y;
  for (const character of text) {
    const test = line + character;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = character;
      lineY += lineHeight;
    } else line = test;
  }
  ctx.fillText(line, x, lineY);
}

export default App;
