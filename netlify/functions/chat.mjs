// Netlify Functions (v2) uchun: Vercel bilan bir xil handler ishlatiladi
import handler from '../../api/chat.js';

export default handler;
export const config = { path: '/api/chat' };
