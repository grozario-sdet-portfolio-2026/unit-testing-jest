const express = require("express");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const logger = require("./src/utils/logger");
const routes = require("./src/infra/http/routes");

const { globalErrorHandler } = require("./src/utils/errorHandler");

const swaggerSpec = require("./src/infra/swagger");

const {
  API_DEFAULT_PORT,
  API_HEALTH_CHECK_MESSAGE,
} = require("./src/constants");

const app = express();

app.use(express.json());

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      url: "/api/docs/swagger.json",
    },
  }),
);

app.get("/api/docs/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

const SERVER_PORT = process.env.PORT || API_DEFAULT_PORT;

app.get("/", (request, response) => {
  response.json({ message: API_HEALTH_CHECK_MESSAGE });
});

app.use("/api", routes);

app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `The requested endpoint ${req.method} ${req.path} does not exist`,
  });
});

app.use(globalErrorHandler);

if (require.main === module) {
  const server = app.listen(SERVER_PORT, () => {
    logger.info(`Server started successfully`, {
      port: SERVER_PORT,
      environment: process.env.NODE_ENV || "development",
    });
  });

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM signal received: closing HTTP server");
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forcing shutdown due to timeout");
      process.exit(1);
    }, 30000);
  });

  process.on("SIGINT", async () => {
    logger.info("SIGINT signal received: closing HTTP server");
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled rejection at Promise", {
      promise,
      reason,
    });
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", error);
    process.exit(1);
  });
}

module.exports = app;
