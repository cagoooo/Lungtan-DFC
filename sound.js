// 共用聲效模組 — Web Audio API 合成（無外部 mp3 依賴）
// 使用方式：
//   import { Sound } from './sound.js?v=1.1.0';
//   Sound.vote();          // 加票音
//   Sound.leaderChange();  // 領先變動音
//   Sound.tie();           // 同票警示音
//   Sound.update();        // 一般更新音（給監票端）
//   Sound.toggle();        // 切換靜音
//   Sound.isMuted();       // 查詢靜音狀態

const STORAGE_KEY = 'dfc-sound-muted';
const VOLUME_KEY = 'dfc-sound-volume';

let audioCtx = null;
function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function muted() {
  return localStorage.getItem(STORAGE_KEY) === '1';
}

function setMuted(v) {
  if (v) localStorage.setItem(STORAGE_KEY, '1');
  else localStorage.removeItem(STORAGE_KEY);
}

// master volume 0~1，預設 1.0
function getVolume() {
  const raw = localStorage.getItem(VOLUME_KEY);
  if (raw === null) return 1.0;
  const v = parseFloat(raw);
  return isNaN(v) ? 1.0 : Math.max(0, Math.min(1, v));
}

function setVolumeStorage(v) {
  const clamped = Math.max(0, Math.min(1, Number(v) || 0));
  localStorage.setItem(VOLUME_KEY, String(clamped));
}

// 單音 helper：頻率、時長、波形、音量（gain 會自動乘上 master volume）
function tone({ freq = 440, duration = 0.15, type = 'sine', gain = 0.2, attack = 0.005, release = 0.08, delay = 0 } = {}) {
  const ctx = getCtx();
  if (!ctx || muted()) return;
  const vol = getVolume();
  if (vol <= 0) return;
  const g0 = gain * vol;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(g0, t0 + attack);
  g.gain.linearRampToValueAtTime(g0 * 0.7, t0 + duration - release);
  g.gain.linearRampToValueAtTime(0, t0 + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// 滑音（適合上升音效）
function slide({ from = 440, to = 880, duration = 0.2, type = 'sine', gain = 0.18, delay = 0 } = {}) {
  const ctx = getCtx();
  if (!ctx || muted()) return;
  const vol = getVolume();
  if (vol <= 0) return;
  const g0 = gain * vol;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(to, t0 + duration);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(g0, t0 + 0.01);
  g.gain.linearRampToValueAtTime(0, t0 + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const Sound = {
  // 🔔 加票音 — 清脆「叮」聲（給後台 + 監票同步）
  vote() {
    tone({ freq: 880, duration: 0.12, type: 'triangle', gain: 0.25 });
    tone({ freq: 1320, duration: 0.18, type: 'sine', gain: 0.15, delay: 0.04 });
  },

  // 🏆 領先變動音 — 戲劇性 fanfare（C-E-G 三和弦上升）
  leaderChange() {
    tone({ freq: 523.25, duration: 0.18, type: 'triangle', gain: 0.2 });             // C5
    tone({ freq: 659.25, duration: 0.18, type: 'triangle', gain: 0.2, delay: 0.12 }); // E5
    tone({ freq: 783.99, duration: 0.30, type: 'triangle', gain: 0.25, delay: 0.24 });// G5
    tone({ freq: 1046.5, duration: 0.40, type: 'sine', gain: 0.2, delay: 0.36 });     // C6
  },

  // ⚖️ 同票提示 — 兩個相同音調並列
  tie() {
    tone({ freq: 587.33, duration: 0.18, type: 'sine', gain: 0.18 });                // D5
    tone({ freq: 587.33, duration: 0.18, type: 'sine', gain: 0.18, delay: 0.22 });   // D5
  },

  // 🔄 一般更新音 — 輕柔（給監票端票數變化）
  update() {
    tone({ freq: 660, duration: 0.08, type: 'sine', gain: 0.1 });
  },

  // ❌ 減票音（誤點修正）
  unvote() {
    slide({ from: 660, to: 330, duration: 0.15, type: 'sine', gain: 0.12 });
  },

  // ✅ 登入成功音
  login() {
    tone({ freq: 523.25, duration: 0.12, type: 'sine', gain: 0.15 });
    tone({ freq: 659.25, duration: 0.18, type: 'sine', gain: 0.15, delay: 0.1 });
  },

  // 🚀 重設音
  reset() {
    slide({ from: 880, to: 220, duration: 0.4, type: 'sawtooth', gain: 0.1 });
  },

  // ----- 靜音控制 -----
  toggle() {
    setMuted(!muted());
    return !muted(); // 回傳「現在是否開啟聲音」
  },
  isMuted() { return muted(); },
  setMuted(v) { setMuted(!!v); },

  // ----- 音量控制 (0~1) -----
  getVolume,
  setVolume(v) { setVolumeStorage(v); },

  // 解鎖 AudioContext — 必須在使用者互動時呼叫一次（瀏覽器 autoplay policy）
  unlock() {
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  }
};
