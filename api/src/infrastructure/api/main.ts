import dotenv from "dotenv";
import { ApiServer } from "./server";
import { logger } from "@/shared/utils/logger";

// Load environment variables
dotenv.config();

async function main() {
  try {
    logger.info("🚀 Starting ASTER VIBE API Server...");

    const port = parseInt(process.env.API_PORT || "3001");
    const server = new ApiServer(port);

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      logger.info("Received SIGINT, shutting down gracefully...");
      server.stop();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      logger.info("Received SIGTERM, shutting down gracefully...");
      server.stop();
      process.exit(0);
    });

    // Start the server
    await server.start();

    logger.info("✨ API Server started successfully!");
    logger.info(`📡 HTTP API: http://localhost:${port}`);
    logger.info(`🔗 WebSocket: ws://localhost:${port}`);
    logger.info("📚 API Documentation:");
    logger.info(`  Health:     GET /api/health`);
    logger.info(`  Bots:       GET/POST /api/bots`);
    logger.info(`  Positions:  GET /api/positions`);
    logger.info(`  Trades:     GET /api/trades`);
    logger.info(`  Stats:      GET /api/stats`);
  } catch (error) {
    logger.error("Failed to start API server:", error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  logger.error("Unhandled error in main:", error);
  process.exit(1);
});
