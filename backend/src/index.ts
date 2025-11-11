import app from "./app";
import { config } from "./config/env";
import { AppDataSource } from "./config/data-source";
import { ensureMediaBucket } from "./services/storageService";
import { logger } from "./utils/logger";

async function bootstrap() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    await ensureMediaBucket();

    app.listen(config.port, () => {
      logger.info(`Backend listening on port ${config.port}`);
    });
  } catch (error) {
    logger.error("Failed to start backend", error);
    process.exit(1);
  }
}

bootstrap();

