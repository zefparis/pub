import { query } from './db';

type Level = 'debug' | 'info' | 'warn' | 'error';

export async function log(level: Level, message: string, context?: any) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${level.toUpperCase()}: ${message} ${context ? JSON.stringify(context) : ''}`;
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
  try {
    await query('insert into logs(level, message, context) values ($1,$2,$3)', [level, message, context || null]);
  } catch (e) {
    // avoid crashing logger
  }
}

