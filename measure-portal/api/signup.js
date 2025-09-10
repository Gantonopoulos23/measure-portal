import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from './_notion.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { name, company, email, password, report_url } = req.body || {};
  if (!name || !company || !email || !password || !report_url) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  try {
    const exists = await findUserByEmail(email);
    if (exists) return res.status(409).json({ error: 'email_in_use' });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await createUser({ name, company, email, password_hash, report_url });

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ token, name: user.name, company: user.company, report_url: user.report_url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'signup_failed' });
  }
}
