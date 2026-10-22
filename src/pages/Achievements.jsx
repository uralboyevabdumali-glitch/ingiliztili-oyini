import { useEffect, useRef, useState } from 'react';
import { Download, Lock } from 'lucide-react';
import useProgress from '../hooks/useProgress.js';
import { BADGES, CERTS, CERT_LEVELS, CLASSIC_GAMES, TITLES } from '../data/badges.js';
import { CEFR_HEX, formatDate } from '../lib/words.js';
import { drawCertificate, downloadCanvas } from '../lib/certificate.js';
import Card, { SectionTitle } from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import CefrBadge from '../components/CefrBadge.jsx';

function CertificateModal({ cefr, onClose }) {
  const { progress, settings } = useProgress();
  const ref = useRef(null);
  const info = cefr ? progress.certs[cefr] : null;

  useEffect(() => {
    if (!cefr || !info) return;
    const t = setTimeout(() => {
      if (ref.current)
        drawCertificate(ref.current, { cefr, userName: settings.userName, date: info.date, code: info.code, petName: settings.pet?.name });
    }, 50);
    return () => clearTimeout(t);
  }, [cefr, info, settings.userName, settings.pet?.name]);

  return (
    <Modal open={!!cefr} onClose={onClose} title={`${cefr} sertifikati`} wide>
      {info && (
        <>
          <canvas ref={ref} className="h-auto w-full rounded-xl border border-slate-200 dark:border-night-line" aria-label={`${cefr} sertifikati rasmi`} />
          {!settings.userName && (
            <p className="mt-2 text-xs font-semibold text-ink-mute dark:text-night-soft">Maslahat: ismingni "Hamroh" bo'limidagi sozlamalarda yozib qo'ysang, sertifikatda chiqadi.</p>
          )}
          <div className="mt-4 flex justify-end">
            <Button onClick={() => ref.current && downloadCanvas(ref.current, `sozlik-sertifikat-${cefr}.png`)}>
              <Download size={18} /> PNG yuklab olish
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default function Achievements() {
  const { progress, titleIdx, nextTitle } = useProgress();
  const [cert, setCert] = useState(null);
  const earned = Object.keys(progress.badges).length;
  const cur = TITLES[titleIdx];
  const pct = nextTitle ? ((progress.points - cur.min) / (nextTitle.min - cur.min)) * 100 : 100;

  return (
    <div className="space-y-6">
      <SectionTitle title="Yutuqlar" subtitle={`${earned}/${BADGES.length} yorliq · ${Object.keys(progress.certs).length}/6 sertifikat`} />

      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-light text-4xl dark:bg-brand/20">{cur.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-mute dark:text-night-soft">Hozirgi unvon</p>
            <h2 className="font-display text-xl font-extrabold">{cur.name}</h2>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <p className="mt-1 text-xs font-semibold text-ink-mute dark:text-night-soft">
              {nextTitle ? `${nextTitle.icon} ${nextTitle.name} unvonigacha ${nextTitle.min - progress.points} ochko` : 'Eng yuqori unvon! 👑'}
            </p>
          </div>
        </div>
        <ol className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {TITLES.map((t, i) => (
            <li
              key={t.name}
              className={`flex flex-col items-center rounded-2xl p-2 text-center ${
                i === titleIdx ? 'bg-brand text-white shadow-[0_3px_0_#1F3BB8]' : i < titleIdx ? 'bg-brand-light dark:bg-brand/15' : 'bg-slate-100 opacity-60 dark:bg-white/5'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="mt-0.5 text-[11px] font-bold leading-tight">{t.name}</span>
              <span className={`text-[10px] font-semibold ${i === titleIdx ? 'text-blue-100' : 'text-ink-mute dark:text-night-soft'}`}>{t.min}</span>
            </li>
          ))}
        </ol>
      </Card>

      <section>
        <h2 className="mb-3 font-display text-lg font-extrabold">Sertifikatlar</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CERTS.map((c) => {
            const info = progress.certs[c.id];
            const need = CLASSIC_GAMES.length * CERT_LEVELS[c.id].length;
            const have = CLASSIC_GAMES.reduce((s, g) => s + CERT_LEVELS[c.id].filter((l) => (progress.levels[g]?.[l] || 0) > 0).length, 0);
            return (
              <Card
                key={c.id}
                as={info ? 'button' : 'div'}
                type={info ? 'button' : undefined}
                hover={!!info}
                onClick={info ? () => setCert(c.id) : undefined}
                className={`relative overflow-hidden p-4 text-left ${info ? 'ring-2 ring-brand' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl" aria-hidden>
                    {info ? '📜' : '🔒'}
                  </span>
                  <CefrBadge level={c.id} />
                </div>
                <p className="mt-2 font-bold">{c.name}</p>
                {info ? (
                  <p className="text-xs font-semibold text-brand dark:text-blue-300">
                    {formatDate(info.date)} · Ko'rish va yuklab olish
                  </p>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-ink-mute dark:text-night-soft">
                      {have}/{need} daraja o'tilgan
                    </p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${(have / need) * 100}%`, background: CEFR_HEX[c.id] }} />
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-extrabold">
          Yorliqlar <span className="text-ink-mute dark:text-night-soft">{earned}/{BADGES.length}</span>
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((b) => {
            const got = progress.badges[b.id];
            return (
              <li
                key={b.id}
                className={`flex items-start gap-3 rounded-3xl border p-3 transition ${
                  got
                    ? 'border-gold/50 bg-white shadow-card dark:border-gold/30 dark:bg-night-card'
                    : 'border-dashed border-slate-300 bg-white/40 dark:border-night-line dark:bg-white/[.03]'
                }`}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-2xl ${got ? 'bg-gold-light dark:bg-gold/20' : 'bg-slate-100 grayscale dark:bg-white/5'}`} aria-hidden>
                  {got ? b.icon : <Lock size={18} className="text-slate-400" />}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-extrabold leading-tight ${got ? '' : 'text-ink-mute dark:text-night-soft'}`}>{b.name}</span>
                  <span className="block text-xs text-ink-mute dark:text-night-soft">{b.desc}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <CertificateModal cefr={cert} onClose={() => setCert(null)} />
    </div>
  );
}
