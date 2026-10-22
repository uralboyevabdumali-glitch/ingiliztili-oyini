// Web Audio API bilan sintez qilingan qisqa ovozlar (tashqi fayl kerak emas)
let ctx = null;

function audio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, start, dur, { type = 'sine', gain = 0.12 } = {}) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  correct() {
    tone(660, 0, 0.12, { type: 'triangle' });
    tone(990, 0.08, 0.16, { type: 'triangle' });
  },
  wrong() {
    tone(220, 0, 0.18, { type: 'sawtooth', gain: 0.05 });
    tone(165, 0.1, 0.2, { type: 'sawtooth', gain: 0.05 });
  },
  coin() {
    tone(1320, 0, 0.07, { type: 'square', gain: 0.04 });
    tone(1760, 0.05, 0.09, { type: 'square', gain: 0.04 });
  },
  jump() {
    tone(420, 0, 0.12, { type: 'triangle', gain: 0.06 });
  },
  hit() {
    tone(140, 0, 0.2, { type: 'square', gain: 0.05 });
  },
  levelUp() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.16, { type: 'triangle', gain: 0.08 }));
  },
  kick() {
    tone(90, 0, 0.12, { type: 'sine', gain: 0.25 });
  },
  whistle() {
    tone(2100, 0, 0.18, { type: 'sine', gain: 0.06 });
    tone(2100, 0.24, 0.3, { type: 'sine', gain: 0.06 });
  },
  /** Tribuna shovqini: filtrlangan oq shovqin, ko'tarilib-pasayadi */
  crowd(duration = 1.6) {
    const a = audio();
    if (!a) return;
    const len = Math.floor(a.sampleRate * duration);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(i / 900));
    const src = a.createBufferSource();
    src.buffer = buf;
    const bp = a.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 0.6;
    const g = a.createGain();
    const t = a.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.18, t + duration * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(bp).connect(g).connect(a.destination);
    src.start(t);
    src.stop(t + duration);
    // "Gooool" ga o'xshash past ovozli xor
    [196, 247, 294].forEach((f) => tone(f, 0.05, duration * 0.7, { type: 'sawtooth', gain: 0.025 }));
  },
};
