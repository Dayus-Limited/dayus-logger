import winston from 'winston';
import LokiTransport from 'winston-loki';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

export interface LoggerOptions {
    jobName: string;
    appName: string;
    lokiUrl?: string;
    logLevel?: string;
    nodeEnv?: string;
}

let logger: winston.Logger | null = null;

export function createLogger(options: LoggerOptions): winston.Logger {
    const { jobName, appName, lokiUrl, logLevel = 'info', nodeEnv = 'development' } = options;

    logger = winston.createLogger({
        level: logLevel,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.label({ label: appName }),
                    winston.format.metadata({
                        fillExcept: ['message', 'level', 'timestamp', 'label'],
                    }),
                ),
            }),
            lokiUrl ? new LokiTransport({
                host: lokiUrl,
                labels: {
                    job: jobName,
                    instance: os.hostname(),
                    app: appName,
                    environment: nodeEnv,
                },
                onConnectionError: (err) => {
                    logger?.error('Loki connection error', { error: err });
                },
            }) : new winston.transports.File({
                filename: 'logs/server.log',
                format: winston.format.combine(
                    winston.format.label({ label: appName }),
                    winston.format.metadata({
                        fillExcept: ['message', 'level', 'timestamp', 'label'],
                    }),
                ),
            }),
        ],
    });

    return logger;
}

export function getLogger(): winston.Logger {
    if (!logger) {
        throw new Error('Logger not initialized. Call createLogger() first.');
    }
    return logger;
}

/**
 * Resets the logger instance (primarily for testing)
 */
export function resetLogger(): void {
    logger = null;
}
