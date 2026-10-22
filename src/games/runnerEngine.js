// "So'z yo'li" o'yin mexanikasi va chizish. React'dan mustaqil, faqat canvas.
import { BY_CEFR, distractors, shuffle } from '../lib/words.js';

export const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const K = 40; // perspektiva koeffitsienti
const DRAW_FAR = 100;
const WORDS_PER_LEVEL = 6;

export function createGame() {
  return {
    t: 0,
    traveled: 0,
    speed: 15,
    levelIdx: 0,
    lives: 3,
    coins: 0,
    gatePoints: 0,
    correctInLevel: 0,
    combo: 0,
    invuln: 0,
    player: { lane: 0, x: 0, jumpY: 0, vy: 0 },
    gates: [],
    obstacles: [],
    coinsList: [],
    nextGateS: 55,
    used: new Set(),
    events: [],
    over: false,
    correctWords: [],
    wrongWords: [],
  };
}

export const score = (g) => Math.floor(g.traveled * 0.5) + g.gatePoints + g.coins * 10;

function pickWord(g) {
  const pool = BY_CEFR[CEFR[g.levelIdx]].filter((w) => w.en.length <= 18 && !g.used.has(w.id));
  const list = pool.length ? pool : BY_CEFR[CEFR[g.levelIdx]];
  const w = list[Math.floor(Math.random() * list.length)];
  g.used.add(w.id);
  return w;
}

function spawnChunk(g) {
  const prev = g.gates.length ? g.gates[g.gates.length - 1].s : 0;
  const s = g.nextGateS;
  const word = pickWord(g);
  const opts = shuffle([word, ...distractors(word, 2)]);
  g.gates.push({ s, word, opts, correct: opts.indexOf(word) - 1, passed: false, chosen: null });

  // Darvozalar orasida to'siqlar va tangalar
  const from = prev + 14;
  const to = s - 16;
  if (to > from) {
    const nObs = g.levelIdx >= 2 ? 2 : 1;
    const used = [];
    for (let i = 0; i < nObs; i++) {
      const os = from + ((i + 0.5) / nObs) * (to - from) + (Math.random() - 0.5) * 6;
      const lane = Math.floor(Math.random() * 3) - 1;
      used.push({ s: os, lane });
      g.obstacles.push({ s: os, lane, hit: false });
    }
    const coinLane = [-1, 0, 1].filter((l) => !used.some((u) => u.lane === l))[0] ?? 0;
    const cs = from + Math.random() * Math.max(1, to - from - 12);
    for (let i = 0; i < 5; i++) g.coinsList.push({ s: cs + i * 2.4, lane: coinLane, taken: false });
  }
  g.nextGateS = s + 46 + g.speed * 1.4;
}

export function currentGate(g) {
  return g.gates.find((x) => !x.passed) || null;
}

export function update(g, dt, input) {
  if (g.over) return;
  g.t += dt;
  g.speed = Math.min(15 + g.levelIdx * 2.6 + Math.min(g.t * 0.02, 2), 32);
  g.traveled += g.speed * dt;
  g.invuln = Math.max(0, g.invuln - dt);

  const p = g.player;
  if (input.left) p.lane = Math.max(-1, p.lane - 1);
  if (input.right) p.lane = Math.min(1, p.lane + 1);
  if (input.jump && p.jumpY <= 0.001) {
    p.vy = 3.7;
    g.events.push({ type: 'jump' });
  }
  input.left = input.right = input.jump = false;
  p.x += (p.lane - p.x) * Math.min(1, dt * 14);
  if (p.jumpY > 0 || p.vy > 0) {
    p.vy -= 9.5 * dt;
    p.jumpY = Math.max(0, p.jumpY + p.vy * dt);
    if (p.jumpY === 0) p.vy = 0;
  }

  while (g.nextGateS - g.traveled < DRAW_FAR + 10) spawnChunk(g);

  const lane = Math.round(p.x);
  for (const c of g.coinsList) {
    const z = c.s - g.traveled;
    if (!c.taken && Math.abs(z) < 0.9 && c.lane === lane && p.jumpY < 0.7) {
      c.taken = true;
      g.coins += 1;
      g.events.push({ type: 'coin' });
    }
  }
  for (const o of g.obstacles) {
    const z = o.s - g.traveled;
    if (!o.hit && Math.abs(z) < 0.7 && o.lane === lane && p.jumpY < 0.28 && g.invuln <= 0) {
      o.hit = true;
      g.lives -= 1;
      g.invuln = 1.3;
      g.events.push({ type: 'hit' });
    }
  }
  for (const gate of g.gates) {
    if (gate.passed || gate.s - g.traveled > 0) continue;
    gate.passed = true;
    gate.chosen = lane;
    const ok = lane === gate.correct;
    if (ok) {
      g.combo += 1;
      g.gatePoints += 50 * (g.levelIdx + 1);
      g.correctWords.push(gate.word);
      g.correctInLevel += 1;
      g.events.push({ type: 'gate', ok: true, word: gate.word, combo: g.combo, points: 50 * (g.levelIdx + 1) });
      if (g.correctInLevel >= WORDS_PER_LEVEL && g.levelIdx < CEFR.length - 1) {
        g.levelIdx += 1;
        g.correctInLevel = 0;
        g.events.push({ type: 'level', level: CEFR[g.levelIdx] });
      }
    } else {
      g.combo = 0;
      g.lives -= 1;
      if (!g.wrongWords.includes(gate.word)) g.wrongWords.push(gate.word);
      g.events.push({ type: 'gate', ok: false, word: gate.word });
    }
    g.events.push({ type: 'word' });
  }
  // Orqada qolgan narsalarni tozalash
  const cut = g.traveled - 6;
  g.gates = g.gates.filter((x) => x.s > cut);
  g.obstacles = g.obstacles.filter((x) => x.s > cut);
  g.coinsList = g.coinsList.filter((x) => x.s > cut);

  if (g.lives <= 0) {
    g.lives = 0;
    g.over = true;
    g.events.push({ type: 'over' });
  }
}

/* ---------------------------- Chizish ---------------------------- */

export function makeView(W, H) {
  return { W, H, hz: H * 0.34, base: H * 0.88, cx: W / 2, lw: Math.min(W * 0.3, H * 0.24) };
}

function proj(v, lane, z, h = 0) {
  const p = K / (K + Math.max(z, -K * 0.6));
  return { x: v.cx + lane * v.lw * p, y: v.hz + (v.base - v.hz) * p - h * v.lw * p, p };
}

/** Osmon, Samarqand uslubidagi gumbaz va minoralar, o't — bir marta chiziladi */
export function renderBackground(v, dpr) {
  const c = document.createElement('canvas');
  c.width = Math.round(v.W * dpr);
  c.height = Math.round(v.H * dpr);
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const { W, H, hz } = v;

  const sky = ctx.createLinearGradient(0, 0, 0, hz);
  sky.addColorStop(0, '#9FD3FF');
  sky.addColorStop(1, '#EAF6FF');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, hz + 1);

  ctx.fillStyle = '#FFE59A';
  ctx.beginPath();
  ctx.arc(W * 0.82, hz * 0.32, Math.min(W, H) * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  [
    [0.18, 0.3, 1],
    [0.55, 0.18, 0.8],
  ].forEach(([x, y, s]) => {
    const r = W * 0.035 * s;
    ctx.beginPath();
    ctx.arc(W * x, hz * y, r, 0, Math.PI * 2);
    ctx.arc(W * x + r, hz * y - r * 0.4, r * 1.2, 0, Math.PI * 2);
    ctx.arc(W * x + r * 2.2, hz * y, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
  });

  const u = Math.min(W / 400, H / 520) * 1.0; // shkala
  const sand = '#E5C48E';
  const sandDark = '#CFA867';
  const tile = '#1FA2C8';
  const tileDark = '#157FA0';

  const minaret = (x, h) => {
    const w = 10 * u;
    ctx.fillStyle = sandDark;
    ctx.fillRect(x - w / 2, hz - h, w, h);
    ctx.fillStyle = tile;
    for (let i = 1; i <= 3; i++) ctx.fillRect(x - w / 2, hz - h + (h * i) / 5, w, 3 * u);
    ctx.fillStyle = sand;
    ctx.fillRect(x - w * 0.8, hz - h - 6 * u, w * 1.6, 6 * u);
    ctx.fillStyle = tile;
    ctx.beginPath();
    ctx.ellipse(x, hz - h - 6 * u, w * 0.7, 7 * u, 0, Math.PI, 0);
    ctx.fill();
  };
  const dome = (x, r, drumH) => {
    ctx.fillStyle = sand;
    ctx.fillRect(x - r * 0.85, hz - drumH, r * 1.7, drumH);
    ctx.fillStyle = tile;
    ctx.fillRect(x - r * 0.85, hz - drumH, r * 1.7, 3 * u);
    ctx.beginPath();
    ctx.ellipse(x, hz - drumH, r, r * 1.15, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = tileDark;
    ctx.lineWidth = 1.2 * u;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x + (i * r) / 3, hz - drumH);
      ctx.quadraticCurveTo(x + (i * r) / 5, hz - drumH - r * 0.9, x, hz - drumH - r * 1.15);
      ctx.stroke();
    }
    ctx.fillStyle = '#F5B700';
    ctx.fillRect(x - 1 * u, hz - drumH - r * 1.15 - 7 * u, 2 * u, 7 * u);
  };
  const portal = (x, w, h) => {
    ctx.fillStyle = sand;
    ctx.fillRect(x - w / 2, hz - h, w, h);
    ctx.fillStyle = tile;
    ctx.fillRect(x - w / 2, hz - h, w, 4 * u);
    ctx.fillStyle = '#2D5DA8';
    const aw = w * 0.5;
    ctx.beginPath();
    ctx.moveTo(x - aw / 2, hz);
    ctx.lineTo(x - aw / 2, hz - h * 0.55);
    ctx.quadraticCurveTo(x, hz - h * 0.95, x + aw / 2, hz - h * 0.55);
    ctx.lineTo(x + aw / 2, hz);
    ctx.fill();
    ctx.strokeStyle = tile;
    ctx.lineWidth = 2 * u;
    ctx.strokeRect(x - w / 2 + 4 * u, hz - h + 8 * u, w - 8 * u, h - 8 * u);
  };

  // Uzoqdagi past binolar
  ctx.fillStyle = '#E9D3AA';
  ctx.fillRect(0, hz - 14 * u, W, 14 * u);
  // Markaziy ansambl (Registon uslubida)
  const cx = W / 2;
  dome(cx - 70 * u, 20 * u, 26 * u);
  dome(cx + 70 * u, 20 * u, 26 * u);
  portal(cx, 72 * u, 62 * u);
  minaret(cx - 48 * u, 78 * u);
  minaret(cx + 48 * u, 78 * u);
  // Chetlar
  portal(cx - 160 * u, 46 * u, 40 * u);
  portal(cx + 160 * u, 46 * u, 40 * u);
  dome(cx - 125 * u, 14 * u, 18 * u);
  dome(cx + 125 * u, 14 * u, 18 * u);
  minaret(cx - 190 * u, 58 * u);
  minaret(cx + 190 * u, 58 * u);

  const grass = ctx.createLinearGradient(0, hz, 0, H);
  grass.addColorStop(0, '#A9DB8A');
  grass.addColorStop(1, '#6DBE5A');
  ctx.fillStyle = grass;
  ctx.fillRect(0, hz, W, H - hz);
  return c;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitLines(ctx, text, maxW, maxFont, minFont) {
  for (let f = maxFont; f >= minFont; f -= 1) {
    ctx.font = `700 ${f}px Onest, system-ui, sans-serif`;
    if (ctx.measureText(text).width <= maxW) return { lines: [text], f };
  }
  const words = text.split(' ');
  if (words.length > 1) {
    const mid = Math.ceil(words.length / 2);
    const lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
    for (let f = maxFont; f >= minFont; f -= 1) {
      ctx.font = `700 ${f}px Onest, system-ui, sans-serif`;
      if (Math.max(...lines.map((l) => ctx.measureText(l).width)) <= maxW) return { lines, f };
    }
    return { lines, f: minFont };
  }
  return { lines: [text], f: minFont };
}

function drawTree(ctx, v, side, z, kind) {
  const a = proj(v, side, z);
  const s = v.lw * a.p;
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(a.x - s * 0.05, a.y - s * 0.5, s * 0.1, s * 0.5);
  if (kind === 0) {
    ctx.fillStyle = '#3E9B4F';
    ctx.beginPath();
    ctx.ellipse(a.x, a.y - s * 1.15, s * 0.2, s * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(a.x, a.y - s * 0.75, s * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5DC163';
    ctx.beginPath();
    ctx.arc(a.x - s * 0.1, a.y - s * 0.85, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawObstacle(ctx, v, o, z) {
  const l = proj(v, o.lane - 0.42, z);
  const r = proj(v, o.lane + 0.42, z);
  const s = v.lw * l.p;
  const h = s * 0.42;
  ctx.fillStyle = '#64748B';
  ctx.fillRect(l.x + s * 0.06, l.y - h, s * 0.06, h);
  ctx.fillRect(r.x - s * 0.12, r.y - h, s * 0.06, h);
  const bw = r.x - l.x;
  const by = l.y - h;
  const bh = h * 0.5;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? '#FFFFFF' : '#EF4444';
    ctx.fillRect(l.x + (bw * i) / 6, by, bw / 6 + 0.5, bh);
  }
  ctx.strokeStyle = '#B91C1C';
  ctx.lineWidth = Math.max(1, s * 0.02);
  ctx.strokeRect(l.x, by, bw, bh);
}

function drawCoin(ctx, v, c, z, t) {
  const a = proj(v, c.lane, z, 0.35);
  const r = v.lw * a.p * 0.13;
  const sx = Math.abs(Math.cos(t * 4 + c.s));
  ctx.fillStyle = '#F5B700';
  ctx.beginPath();
  ctx.ellipse(a.x, a.y, r * Math.max(0.2, sx), r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#B98A00';
  ctx.lineWidth = Math.max(1, r * 0.2);
  ctx.stroke();
}

function drawGate(ctx, v, gate, z, isCurrent) {
  for (let i = 0; i < 3; i++) {
    const lane = i - 1;
    const l = proj(v, lane - 0.47, z);
    const r = proj(v, lane + 0.47, z);
    const s = v.lw * l.p;
    const H = s * 1.25;
    let frame = '#2D55F0';
    let panel = '#FFFFFF';
    let ink = '#1E293B';
    if (gate.passed) {
      if (lane === gate.correct) {
        frame = '#16A34A';
        panel = '#DCFCE7';
      } else if (lane === gate.chosen) {
        frame = '#EF4444';
        panel = '#FEE2E2';
      }
    }
    const pw = Math.max(2, s * 0.07);
    ctx.fillStyle = frame;
    ctx.fillRect(l.x, l.y - H, pw, H);
    ctx.fillRect(r.x - pw, r.y - H, pw, H);
    // panel
    const ph = s * 0.42;
    const px = l.x - pw * 0.3;
    const pwid = r.x - l.x + pw * 0.6;
    const py = l.y - H - ph * 0.55;
    roundRect(ctx, px, py, pwid, ph, Math.max(3, s * 0.08));
    ctx.fillStyle = panel;
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, s * 0.035);
    ctx.strokeStyle = frame;
    ctx.stroke();
    const text = isCurrent || gate.passed ? gate.opts[i].en : '?';
    const { lines, f } = fitLines(ctx, text, pwid - 8, Math.max(9, s * 0.2), Math.max(8, s * 0.1));
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lh = f * 1.05;
    lines.forEach((ln, k) => ctx.fillText(ln, px + pwid / 2, py + ph / 2 + (k - (lines.length - 1) / 2) * lh));
  }
}

export function draw(ctx, v, g, bg, petImg) {
  const { W, H, hz, cx } = v;
  ctx.clearRect(0, 0, W, H);
  if (bg) ctx.drawImage(bg, 0, 0, W, H);

  // Yo'l
  const farP = proj(v, 0, 2000);
  const near = proj(v, 0, -14);
  const halfFar = v.lw * 1.62 * farP.p;
  const halfNear = v.lw * 1.62 * near.p;
  ctx.fillStyle = '#80889A';
  ctx.beginPath();
  ctx.moveTo(cx - halfFar, hz);
  ctx.lineTo(cx + halfFar, hz);
  ctx.lineTo(cx + halfNear, near.y);
  ctx.lineTo(cx - halfNear, near.y);
  ctx.fill();
  // chekka bordyurlar
  const seg = 4;
  const startS = Math.floor((g.traveled - 10) / seg) * seg;
  for (let s = startS + Math.ceil((DRAW_FAR + 10) / seg) * seg; s >= startS; s -= seg) {
    const z1 = s - g.traveled;
    const z2 = z1 + seg;
    if (z2 < -14) continue;
    const odd = Math.round(s / seg) % 2 === 0;
    for (const side of [-1, 1]) {
      const a1 = proj(v, side * 1.5, z1);
      const a2 = proj(v, side * 1.5, z2);
      const b1 = proj(v, side * 1.62, z1);
      const b2 = proj(v, side * 1.62, z2);
      ctx.fillStyle = odd ? '#E2E8F0' : '#EF4444';
      ctx.beginPath();
      ctx.moveTo(a1.x, a1.y);
      ctx.lineTo(a2.x, a2.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.lineTo(b1.x, b1.y);
      ctx.fill();
    }
    if (odd) {
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      for (const lx of [-0.5, 0.5]) {
        const a1 = proj(v, lx - 0.025, z1);
        const a2 = proj(v, lx - 0.025, z2);
        const b1 = proj(v, lx + 0.025, z1);
        const b2 = proj(v, lx + 0.025, z2);
        ctx.beginPath();
        ctx.moveTo(a1.x, a1.y);
        ctx.lineTo(a2.x, a2.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.fill();
      }
    }
  }

  // Barcha obyektlarni uzoqdan yaqinga tartiblab chizamiz
  const items = [];
  const treeStep = 7;
  const t0 = Math.floor((g.traveled - 4) / treeStep);
  for (let i = t0 + Math.ceil(DRAW_FAR / treeStep); i >= t0; i--) {
    const z = i * treeStep - g.traveled;
    const h = (i * 7919) % 5;
    items.push({ z, fn: () => drawTree(ctx, v, -2.3 - (h % 2) * 0.4, z, h % 2) });
    items.push({ z: z + 3, fn: () => drawTree(ctx, v, 2.3 + (h % 3) * 0.25, z + 3, (h + 1) % 2) });
  }
  const cur = currentGate(g);
  for (const o of g.obstacles) items.push({ z: o.s - g.traveled, fn: (z) => drawObstacle(ctx, v, o, z) });
  for (const c of g.coinsList) if (!c.taken) items.push({ z: c.s - g.traveled, fn: (z) => drawCoin(ctx, v, c, z, g.t) });
  for (const gt of g.gates) items.push({ z: gt.s - g.traveled, fn: (z) => drawGate(ctx, v, gt, z, gt === cur) });
  items.sort((a, b) => b.z - a.z);
  for (const it of items) {
    if (it.z > DRAW_FAR || it.z < -12) continue;
    ctx.globalAlpha = it.z > DRAW_FAR - 20 ? Math.max(0, (DRAW_FAR - it.z) / 20) : 1;
    if (it.z >= -2.5) it.fn(it.z);
  }
  ctx.globalAlpha = 1;

  // Qahramon
  const p = g.player;
  const pos = proj(v, p.x, 0);
  const size = v.lw * 0.95;
  const jumpPx = p.jumpY * v.lw * 1.1;
  ctx.fillStyle = 'rgba(30,41,59,.18)';
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y, size * 0.32 * (1 - p.jumpY * 0.35), size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  const bob = p.jumpY > 0 ? 0 : Math.abs(Math.sin(g.t * 13)) * size * 0.04;
  ctx.save();
  ctx.globalAlpha = g.invuln > 0 ? 0.45 : 1;
  ctx.translate(pos.x, pos.y - jumpPx - bob);
  ctx.rotate((p.lane - p.x) * -0.25 + (p.jumpY > 0 ? 0 : Math.sin(g.t * 13) * 0.04));
  if (petImg) ctx.drawImage(petImg, -size / 2, -size * 0.97, size, size);
  else {
    ctx.fillStyle = '#2D55F0';
    ctx.beginPath();
    ctx.arc(0, -size * 0.4, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
