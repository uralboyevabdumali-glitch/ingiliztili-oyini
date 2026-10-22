import { formatDate } from './words.js';

const CEFR_NAMES = {
  A1: "Boshlang'ich",
  A2: 'Elementar',
  B1: "O'rta",
  B2: "O'rtadan yuqori",
  C1: 'Ilg\'or',
  C2: 'Mukammal',
};

function star(ctx, cx, cy, spikes, outer, inner) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
    rot += step;
  }
  ctx.closePath();
}

function fitFont(ctx, text, weight, family, max, maxW) {
  let size = max;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    size -= 2;
  } while (ctx.measureText(text).width > maxW && size > 16);
}

/** Sertifikatni canvas'ga chizadi (1600×1130) */
export async function drawCertificate(canvas, { cefr, userName, date, code, petName }) {
  try {
    await document.fonts?.ready;
    await Promise.all([document.fonts?.load('800 40px Unbounded'), document.fonts?.load('600 20px Onest')]);
  } catch {
    /* shrift yuklanmasa ham chizamiz */
  }
  const W = 1600;
  const H = 1130;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const display = 'Unbounded, Onest, sans-serif';
  const body = 'Onest, system-ui, sans-serif';

  // fon
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.7);
  bg.addColorStop(0, '#FFFFFF');
  bg.addColorStop(1, '#EEF2FF');
  ctx.fillStyle = bg;
  ctx.fillRect(40, 40, W - 80, H - 80);

  // nuqtali naqsh
  ctx.fillStyle = 'rgba(45,85,240,.06)';
  for (let x = 70; x < W - 60; x += 26) for (let y = 70; y < H - 60; y += 26) ctx.fillRect(x, y, 2.4, 2.4);

  // ko'k ramka
  ctx.strokeStyle = '#2D55F0';
  ctx.lineWidth = 22;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.strokeStyle = '#1F3BB8';
  ctx.lineWidth = 3;
  ctx.strokeRect(62, 62, W - 124, H - 124);
  ctx.strokeStyle = '#F5B700';
  ctx.lineWidth = 2;
  ctx.strokeRect(74, 74, W - 148, H - 148);
  // burchak bezaklari
  ctx.fillStyle = '#2D55F0';
  for (const [x, y] of [
    [74, 74],
    [W - 74, 74],
    [74, H - 74],
    [W - 74, H - 74],
  ]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-14, -14, 28, 28);
    ctx.restore();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // logotip
  ctx.fillStyle = '#2D55F0';
  ctx.beginPath();
  ctx.roundRect?.(W / 2 - 34, 120, 68, 68, 18);
  if (!ctx.roundRect) ctx.rect(W / 2 - 34, 120, 68, 68);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 42px ${display}`;
  ctx.fillText('S', W / 2, 170);
  ctx.fillStyle = '#1E293B';
  ctx.font = `800 30px ${display}`;
  ctx.fillText("SO'ZLIK", W / 2, 236);

  ctx.fillStyle = '#2D55F0';
  ctx.font = `800 86px ${display}`;
  ctx.fillText('SERTIFIKAT', W / 2, 350);
  ctx.fillStyle = '#475569';
  ctx.font = `600 28px ${body}`;
  ctx.fillText(`Ingliz tili · ${cefr} darajasi — ${CEFR_NAMES[cefr] || ''}`, W / 2, 404);

  ctx.fillStyle = '#64748B';
  ctx.font = `500 26px ${body}`;
  ctx.fillText('Ushbu sertifikat', W / 2, 486);

  const name = (userName || "Ingliz tili o'quvchisi").trim();
  ctx.fillStyle = '#1E293B';
  fitFont(ctx, name, 800, display, 68, W - 420);
  ctx.fillText(name, W / 2, 576);
  ctx.strokeStyle = '#F5B700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 360, 604);
  ctx.lineTo(W / 2 + 360, 604);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = `500 27px ${body}`;
  ctx.fillText(`ga So'zlik ilovasidagi barcha klassik o'yinlarda (Viktorina, Juftlikni top,`, W / 2, 664);
  ctx.fillText(`So'z yig'ish, Gapni to'ldir) ${cefr} darajasini muvaffaqiyatli o'tgani uchun berildi.`, W / 2, 704);

  // muhr
  const sx = W / 2;
  const sy = 860;
  ctx.fillStyle = '#F5B700';
  star(ctx, sx, sy, 24, 112, 96);
  ctx.fill();
  ctx.fillStyle = '#FFD84D';
  ctx.beginPath();
  ctx.arc(sx, sy, 86, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#B98A00';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sx, sy, 72, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#8A6400';
  ctx.font = `800 54px ${display}`;
  ctx.fillText(cefr, sx, sy + 16);
  ctx.font = `800 15px ${display}`;
  ctx.fillText("SO'ZLIK", sx, sy - 34);
  ctx.fillText('★ ★ ★', sx, sy + 48);
  // lentalar
  ctx.fillStyle = '#2D55F0';
  ctx.beginPath();
  ctx.moveTo(sx - 60, sy + 80);
  ctx.lineTo(sx - 90, sy + 175);
  ctx.lineTo(sx - 62, sy + 160);
  ctx.lineTo(sx - 46, sy + 186);
  ctx.lineTo(sx - 20, sy + 96);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sx + 60, sy + 80);
  ctx.lineTo(sx + 90, sy + 175);
  ctx.lineTo(sx + 62, sy + 160);
  ctx.lineTo(sx + 46, sy + 186);
  ctx.lineTo(sx + 20, sy + 96);
  ctx.fill();

  // pastki qatorlar
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = `600 20px ${body}`;
  ctx.fillText('Sana', 180, 850);
  ctx.fillText('Sertifikat raqami', 180, 930);
  ctx.fillStyle = '#1E293B';
  ctx.font = `700 28px ${body}`;
  ctx.fillText(formatDate(date), 180, 884);
  ctx.fillText(code, 180, 964);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748B';
  ctx.font = `600 20px ${body}`;
  ctx.fillText('Topshirdi', W - 180, 850);
  ctx.fillStyle = '#1E293B';
  ctx.font = `italic 700 34px ${body}`;
  ctx.fillText(petName || 'Hamroh', W - 180, 892);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W - 420, 910);
  ctx.lineTo(W - 180, 910);
  ctx.stroke();
  ctx.fillStyle = '#64748B';
  ctx.font = `500 18px ${body}`;
  ctx.fillText("So'zlik hamrohi", W - 180, 940);
  return canvas;
}

export function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, 'image/png');
}
