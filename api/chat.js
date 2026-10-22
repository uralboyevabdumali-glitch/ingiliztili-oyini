// Serverless funksiya: /api/chat
// Vercel (Edge runtime) uchun yozilgan; netlify/functions/chat.mjs ham shu faylni ishlatadi.
// API kalit faqat serverda: ANTHROPIC_API_KEY muhit o'zgaruvchisi.

export const config = { runtime: 'edge' };

const API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-5-5';
const MAX_MESSAGES = 30;
const MAX_CHARS = 4000;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function cleanMessages(list) {
  if (!Array.isArray(list)) return null;
  const out = list
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  // Suhbat foydalanuvchi xabari bilan boshlanishi kerak
  while (out.length && out[0].role !== 'user') out.shift();
  return out.length ? out : null;
}

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Faqat POST' }, 405);

  const env = typeof process !== 'undefined' ? process.env : {};
  const key = env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: 'ANTHROPIC_API_KEY sozlanmagan' }, 500);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Noto'g'ri JSON" }, 400);
  }
  const messages = cleanMessages(body?.messages);
  if (!messages) return json({ error: "Xabarlar bo'sh" }, 400);
  const system = typeof body.system === 'string' ? body.system.slice(0, 8000) : undefined;
  const maxTokens = Math.min(Math.max(Number(body.max_tokens) || 700, 50), 1500);

  let upstream;
  try {
    upstream = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: maxTokens,
        stream: true,
        ...(system ? { system } : {}),
        messages,
      }),
    });
  } catch {
    return json({ error: 'AI serveriga ulanib bo\'lmadi' }, 502);
  }

  if (!upstream.ok || !upstream.body) {
    const status = upstream.status === 429 ? 429 : 502;
    let detail = '';
    try {
      detail = (await upstream.json())?.error?.message || '';
    } catch {
      /* e'tiborsiz */
    }
    return json({ error: `AI xatosi (${upstream.status}) ${detail}`.trim() }, status);
  }

  // Anthropic SSE oqimini oddiy matn oqimiga aylantiramiz
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();
  let buffer = '';

  const stream = new ReadableStream({
    // Kamida bitta matn bo'lagi chiqquncha (yoki oqim tugaguncha) o'qiymiz,
    // aks holda pull() qayta chaqirilmay oqim osilib qoladi.
    async pull(controller) {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          let sent = false;
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            let evt;
            try {
              evt = JSON.parse(data);
            } catch {
              continue;
            }
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta' && evt.delta.text) {
              controller.enqueue(encoder.encode(evt.delta.text));
              sent = true;
            } else if (evt.type === 'error') {
              controller.close();
              reader.cancel().catch(() => {});
              return;
            }
          }
          if (sent) return;
        }
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
    },
  });
}
