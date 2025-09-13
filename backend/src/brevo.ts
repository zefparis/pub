import { config } from './config.js';
import { log } from './logger.js';

export async function addToBrevoList(email: string) {
  if (!config.brevoApiKey) {
    await log('warn', 'BREVO_API_KEY missing; skipping sync', { email });
    return;
  }
  try {
    // Minimal direct API call; in production, use official client
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.brevoApiKey,
      },
      body: JSON.stringify({ email }),
    });
    await log('info', 'Brevo sync response', { status: res.status });
  } catch (e) {
    await log('warn', 'Brevo sync failed', { email, error: String(e) });
  }
}

