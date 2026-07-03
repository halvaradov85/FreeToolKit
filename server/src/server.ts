import { createApp } from './app';
import { env } from './lib/env';
import { logger } from './lib/logger';

const app = createApp();

app.listen(env.port, () => {
  logger.info('server_started', { port: env.port, env: env.nodeEnv });
});
