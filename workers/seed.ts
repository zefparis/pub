import 'dotenv/config';
// Import directly from backend compiled TS using relative source for simplicity
import { ensureSchema } from '../backend/src/db.js';
import { runPipeline } from '../backend/src/pipeline.js';
import { log } from '../backend/src/logger.js';

async function main() {
  await ensureSchema();
  await log('info', 'Running seed pipeline');
  await runPipeline({ niches: ['ads','gadgets','finance','motivation'], limit: 5, targetPlatforms: ['youtube','tiktok'] });
  await log('info', 'Seed completed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

