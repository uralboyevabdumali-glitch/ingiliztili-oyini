// AI bilan aloqa: so'rov backend'ga (/api/chat) ketadi, API kalit frontendda yo'q.

export class AIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AIError';
    this.status = status;
  }
}

/**
 * askAI(messages, { onText, signal, system, maxTokens })
 * messages: [{ role: 'user' | 'assistant', content: string }]
 * onText(fullText, chunk) — har bir yangi bo'lak kelganda chaqiriladi (streaming)
 * Qaytaradi: to'liq javob matni
 */
export async function askAI(messages, { onText, signal, system, maxTokens = 700 } = {}) {
  let res;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages, system, max_tokens: maxTokens }),
      signal,
    });
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    throw new AIError('network');
  }
  if (!res.ok || !res.body) {
    let msg = '';
    try {
      msg = (await res.json()).error || '';
    } catch {
      /* JSON emas */
    }
    throw new AIError(msg || `HTTP ${res.status}`, res.status);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (!chunk) continue;
    full += chunk;
    onText?.(full, chunk);
  }
  if (!full.trim()) throw new AIError('empty');
  return full;
}

/** Foydalanuvchiga ko'rsatiladigan do'stona xato matni */
export function aiErrorMessage(e) {
  if (e?.name === 'AbortError') return null;
  if (e?.message === 'network') return "Internet yoki server bilan aloqa yo'q. Birozdan so'ng qayta urinib ko'r.";
  if (e?.status === 404) return "AI xizmati hali ulanmagan (backend topilmadi). README'dagi deploy bo'limiga qara.";
  if (e?.status === 429) return "So'rovlar juda ko'p bo'lib ketdi. Bir daqiqadan so'ng qayta urin.";
  if (e?.status === 500 && /KEY/i.test(e?.message || '')) return 'AI sozlanmagan: serverda ANTHROPIC_API_KEY yo\'q.';
  return "AI hozir javob bera olmadi. Qolgan bo'limlar ishlayveradi — keyinroq qayta urinib ko'r.";
}
