import { requireAuth } from '../../lib/auth.js';

export default function handler(req, res) {
    if (!requireAuth(req, res)) return;
    return res.status(200).json({ ok: true });
}