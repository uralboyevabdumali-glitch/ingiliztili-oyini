import { forwardRef } from 'react';
import { PETS } from '../data/pets.js';

const INK = '#1E293B';

function Eyes({ mood, panda, accent }) {
  if (mood === 'sleep') {
    return (
      <g stroke={panda ? '#F8FAFC' : INK} strokeWidth="2.6" fill="none" strokeLinecap="round">
        {panda && (
          <>
            <ellipse cx="47" cy="51" rx="9" ry="11" transform="rotate(-20 47 51)" fill={accent} stroke="none" />
            <ellipse cx="73" cy="51" rx="9" ry="11" transform="rotate(20 73 51)" fill={accent} stroke="none" />
          </>
        )}
        <path d="M42 52 Q48 56 54 52" />
        <path d="M66 52 Q72 56 78 52" />
      </g>
    );
  }
  const happy = mood === 'happy';
  return (
    <g>
      {panda && (
        <>
          <ellipse cx="47" cy="51" rx="9.5" ry="11.5" transform="rotate(-20 47 51)" fill={accent} />
          <ellipse cx="73" cy="51" rx="9.5" ry="11.5" transform="rotate(20 73 51)" fill={accent} />
        </>
      )}
      <circle cx="48" cy="50" r="7.5" fill="#fff" />
      <circle cx="72" cy="50" r="7.5" fill="#fff" />
      <circle cx="49" cy={happy ? 50 : 51} r="4.6" fill={INK} />
      <circle cx="71" cy={happy ? 50 : 51} r="4.6" fill={INK} />
      <circle cx="50.8" cy="48.4" r="1.7" fill="#fff" />
      <circle cx="72.8" cy="48.4" r="1.7" fill="#fff" />
    </g>
  );
}

function Mouth({ type, mood, c }) {
  const happy = mood === 'happy';
  const sleep = mood === 'sleep';
  if (type === 'owl') {
    return <path d="M55 58 L65 58 L60 67 Z" fill="#F59E0B" stroke="#C2410C" strokeWidth="1.2" strokeLinejoin="round" />;
  }
  const smile = sleep ? 'M56 66 Q60 67 64 66' : happy ? 'M53 64 Q60 72 67 64' : 'M55 65 Q60 69 65 65';
  return (
    <g>
      {type === 'fox' && <ellipse cx="60" cy="63" rx="15" ry="10" fill="#FFFFFF" />}
      {type === 'dragon' && (
        <>
          <ellipse cx="60" cy="63" rx="14" ry="9" fill={c.belly} opacity=".9" />
          <circle cx="56" cy="60" r="1.3" fill={c.accent} />
          <circle cx="64" cy="60" r="1.3" fill={c.accent} />
        </>
      )}
      {(type === 'cat' || type === 'fox' || type === 'panda') && (
        <path
          d={type === 'cat' ? 'M57 59 L63 59 L60 62.5 Z' : 'M56.5 58.5 Q60 56.5 63.5 58.5 Q62 62 60 62 Q58 62 56.5 58.5 Z'}
          fill={type === 'cat' ? '#F472B6' : '#334155'}
        />
      )}
      <path d={smile} stroke={INK} strokeWidth="2.2" fill={happy ? '#F87171' : 'none'} strokeLinecap="round" strokeLinejoin="round" />
      {type === 'cat' && (
        <g stroke={c.accent} strokeWidth="1.4" strokeLinecap="round" opacity=".8">
          <path d="M40 60 L28 58" />
          <path d="M40 63 L28 65" />
          <path d="M80 60 L92 58" />
          <path d="M80 63 L92 65" />
        </g>
      )}
    </g>
  );
}

function Ears({ type, c }) {
  switch (type) {
    case 'owl':
      return (
        <g fill={c.accent}>
          <path d="M33 34 L29 12 L49 25 Z" />
          <path d="M87 34 L91 12 L71 25 Z" />
        </g>
      );
    case 'cat':
      return (
        <g>
          <path d="M33 38 L37 11 L57 26 Z" fill={c.main} stroke={c.accent} strokeWidth="2" strokeLinejoin="round" />
          <path d="M87 38 L83 11 L63 26 Z" fill={c.main} stroke={c.accent} strokeWidth="2" strokeLinejoin="round" />
          <path d="M38 31 L40 18 L50 26 Z" fill="#FBCFE8" />
          <path d="M82 31 L80 18 L70 26 Z" fill="#FBCFE8" />
        </g>
      );
    case 'fox':
      return (
        <g>
          <path d="M31 38 L33 5 L56 25 Z" fill={c.main} stroke={c.accent} strokeWidth="2" strokeLinejoin="round" />
          <path d="M89 38 L87 5 L64 25 Z" fill={c.main} stroke={c.accent} strokeWidth="2" strokeLinejoin="round" />
          <path d="M33 5 L37.5 15 L33.8 17 Z" fill={c.accent} />
          <path d="M87 5 L82.5 15 L86.2 17 Z" fill={c.accent} />
          <path d="M37 32 L38 16 L49 26 Z" fill="#FFE4D0" />
          <path d="M83 32 L82 16 L71 26 Z" fill="#FFE4D0" />
        </g>
      );
    case 'panda':
      return (
        <g fill={c.accent}>
          <circle cx="36" cy="27" r="10" />
          <circle cx="84" cy="27" r="10" />
        </g>
      );
    case 'dragon':
      return (
        <g>
          <path d="M42 26 Q36 10 44 4 Q44 16 50 22 Z" fill="#FFF7D6" stroke="#E2B13C" strokeWidth="1.5" />
          <path d="M78 26 Q84 10 76 4 Q76 16 70 22 Z" fill="#FFF7D6" stroke="#E2B13C" strokeWidth="1.5" />
          <path d="M54 22 L60 12 L66 22 Z" fill={c.accent} />
        </g>
      );
    default:
      return null;
  }
}

function Tail({ type, c }) {
  if (type === 'fox')
    return (
      <g>
        <path d="M84 96 Q112 92 108 64 Q100 78 84 82 Z" fill={c.main} stroke={c.accent} strokeWidth="2" strokeLinejoin="round" />
        <path d="M108 64 Q104 74 98 77 Q104 68 103 62 Z" fill="#fff" />
      </g>
    );
  if (type === 'cat') return <path d="M86 98 Q108 96 104 72" stroke={c.accent} strokeWidth="7" fill="none" strokeLinecap="round" />;
  if (type === 'dragon')
    return (
      <g>
        <path d="M24 64 Q8 54 14 40 Q22 52 34 60 Z" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1.5" />
        <path d="M96 64 Q112 54 106 40 Q98 52 86 60 Z" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1.5" />
        <path d="M84 100 Q108 104 110 86 L104 90" stroke={c.main} strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>
    );
  return null;
}

function Egg({ c, mood }) {
  return (
    <g>
      <ellipse cx="60" cy="112" rx="26" ry="4" fill="#1E293B" opacity=".08" />
      <path d="M60 22 C82 22 92 58 92 78 C92 98 78 112 60 112 C42 112 28 98 28 78 C28 58 38 22 60 22 Z" fill="#FFFBF0" stroke="#E7DCC4" strokeWidth="2.5" />
      <circle cx="46" cy="48" r="6" fill={c.main} opacity=".55" />
      <circle cx="74" cy="88" r="8" fill={c.main} opacity=".5" />
      <circle cx="40" cy="92" r="4.5" fill={c.accent} opacity=".35" />
      <circle cx="73" cy="40" r="3.5" fill={c.accent} opacity=".35" />
      <path d="M32 72 L42 66 L50 74 L60 64 L70 74 L78 66 L88 72" stroke="#D6C7A6" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
      {mood === 'sleep' ? (
        <g stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M47 84 Q51 87 55 84" />
          <path d="M65 84 Q69 87 73 84" />
        </g>
      ) : (
        <g>
          <circle cx="51" cy="83" r="3.6" fill={INK} />
          <circle cx="69" cy="83" r="3.6" fill={INK} />
          <circle cx="52.2" cy="81.8" r="1.2" fill="#fff" />
          <circle cx="70.2" cy="81.8" r="1.2" fill="#fff" />
          <circle cx="44" cy="90" r="3.5" fill="#FDA4AF" opacity=".6" />
          <circle cx="76" cy="90" r="3.5" fill="#FDA4AF" opacity=".6" />
        </g>
      )}
    </g>
  );
}

function Creature({ type, c, mood, stage, shirt, gloves }) {
  const panda = type === 'panda';
  const outline = panda ? '#CBD5E1' : c.accent;
  const limb = panda ? c.accent : c.main;
  return (
    <g>
      <ellipse cx="60" cy="112" rx="30" ry="4.5" fill="#1E293B" opacity=".1" />
      <Tail type={type} c={c} />
      {/* oyoqlar */}
      <ellipse cx="47" cy="106" rx="9" ry="6" fill={limb} stroke={outline} strokeWidth="2" />
      <ellipse cx="73" cy="106" rx="9" ry="6" fill={limb} stroke={outline} strokeWidth="2" />
      {/* tana */}
      <ellipse cx="60" cy="86" rx="28" ry="23" fill={c.main} stroke={outline} strokeWidth="2.2" />
      {shirt ? (
        <g>
          <path d="M34 80 Q36 68 48 66 L72 66 Q84 68 86 80 L84 100 Q60 110 36 100 Z" fill={shirt} />
          <path d="M52 66 Q60 73 68 66" stroke="#fff" strokeWidth="2.5" fill="none" />
          <text x="60" y="95" textAnchor="middle" fontFamily="Unbounded, sans-serif" fontWeight="800" fontSize="15" fill="#fff">
            10
          </text>
        </g>
      ) : (
        <ellipse cx="60" cy="90" rx="17" ry="15" fill={c.belly} opacity={panda ? 0 : 1} />
      )}
      {/* qo'llar */}
      <ellipse cx="33" cy="84" rx="7" ry="11" transform="rotate(20 33 84)" fill={gloves ? '#F5B700' : limb} stroke={gloves ? '#B98A00' : outline} strokeWidth="2" />
      <ellipse cx="87" cy="84" rx="7" ry="11" transform="rotate(-20 87 84)" fill={gloves ? '#F5B700' : limb} stroke={gloves ? '#B98A00' : outline} strokeWidth="2" />
      {stage === 4 && <path d="M38 68 Q60 76 82 68 L86 104 Q60 92 34 104 Z" fill="#DC2626" opacity=".85" />}
      <Ears type={type} c={c} />
      {/* bosh */}
      <circle cx="60" cy="50" r="30" fill={c.main} stroke={outline} strokeWidth="2.2" />
      {type === 'owl' && (
        <>
          <circle cx="48" cy="50" r="12.5" fill={c.belly} />
          <circle cx="72" cy="50" r="12.5" fill={c.belly} />
        </>
      )}
      {type === 'dragon' && (
        <g fill={c.accent} opacity=".35">
          <circle cx="40" cy="38" r="3" />
          <circle cx="82" cy="40" r="2.5" />
          <circle cx="78" cy="31" r="2" />
        </g>
      )}
      <Eyes mood={mood} panda={panda} accent={c.accent} />
      {mood !== 'sleep' && (
        <>
          <ellipse cx="40" cy="62" rx="4.5" ry="3" fill="#FB7185" opacity=".45" />
          <ellipse cx="80" cy="62" rx="4.5" ry="3" fill="#FB7185" opacity=".45" />
        </>
      )}
      <Mouth type={type} mood={mood} c={c} />
      {stage === 3 && (
        <g>
          {/* ko'zoynak */}
          <g stroke="#1E3A8A" strokeWidth="2.2" fill="#BFDBFE" fillOpacity=".25">
            <circle cx="48" cy="50" r="10" />
            <circle cx="72" cy="50" r="10" />
          </g>
          <path d="M58 50 Q60 47 62 50" stroke="#1E3A8A" strokeWidth="2.2" fill="none" />
          {/* akademik shapka */}
          <path d="M60 10 L94 22 L60 34 L26 22 Z" fill="#2D55F0" stroke="#1F3BB8" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M44 28 L44 36 Q60 42 76 36 L76 28 L60 34 Z" fill="#1F3BB8" />
          <path d="M92 22 L92 38" stroke="#F5B700" strokeWidth="2" />
          <circle cx="92" cy="40" r="3" fill="#F5B700" />
        </g>
      )}
      {stage === 4 && (
        <g>
          <path d="M38 26 L42 6 L51 18 L60 2 L69 18 L78 6 L82 26 Z" fill="#F5B700" stroke="#B98A00" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="60" cy="16" r="3.2" fill="#EF4444" />
          <circle cx="45" cy="19" r="2.2" fill="#2D55F0" />
          <circle cx="75" cy="19" r="2.2" fill="#2D55F0" />
        </g>
      )}
    </g>
  );
}

/**
 * Hamroh hayvoncha. stage: 0 tuxum, 1 chaqaloq, 2 yosh, 3 olim, 4 qirol.
 * mood: 'happy' | 'normal' | 'sleep'. Qo'shimcha props (x, y, width...) <svg> ga uzatiladi.
 */
const PetAvatar = forwardRef(function PetAvatar(
  { type = 'owl', stage = 2, mood = 'normal', shirt = false, gloves = false, size = 96, title, className = '', ...rest },
  ref,
) {
  const pet = PETS[type] || PETS.owl;
  const c = pet.colors;
  const scale = stage === 1 ? 0.8 : stage === 2 ? 0.92 : 1;
  const shirtColor = shirt === true ? c.shirt : shirt;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {stage === 0 ? (
        <Egg c={c} mood={mood} />
      ) : (
        <g transform={`translate(${60 - 60 * scale} ${116 - 116 * scale}) scale(${scale})`}>
          <Creature type={pet.id} c={c} mood={mood} stage={stage} shirt={shirtColor} gloves={gloves} />
        </g>
      )}
      {mood === 'sleep' && (
        <g fontFamily="Unbounded, sans-serif" fontWeight="800" fill="#2D55F0">
          <text x="92" y="30" fontSize="14" className="animate-zzz">
            z
          </text>
          <text x="102" y="18" fontSize="10" className="animate-zzz [animation-delay:1.2s]">
            z
          </text>
        </g>
      )}
    </svg>
  );
});

export default PetAvatar;
