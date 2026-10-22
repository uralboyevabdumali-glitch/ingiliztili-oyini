import { CEFR_STYLE } from '../lib/words.js';

export default function CefrBadge({ level, className = '' }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-lg px-2 text-[11px] font-extrabold tracking-wide ring-1 ${CEFR_STYLE[level]} ${className}`}>
      {level}
    </span>
  );
}
