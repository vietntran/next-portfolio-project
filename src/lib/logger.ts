// src/lib/logger.ts
import winston from "winston";
import path from "path";

// Create the logger
const logger = winston.createLogger({
  // Using Winston's default levels: error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
  transports: [
    // Error logs - only errors
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "error.log"),
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint()
      ),
    }),
    // Info logs - warnings and info
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "info.log"),
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint()
      ),
    }),
    // Combined logs - everything
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "combined.log"),
    }),
  ],
});

// Add console logging during development with better formatting
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += "\n" + JSON.stringify(metadata, null, 2);
          }
          return msg;
        })
      ),
    })
  );
}

export default logger;
