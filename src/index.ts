import winston from 'winston';
import LokiTransport from 'winston-loki';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

// Validate required environment variables
const requiredVars = ['JOB_NAME', 'APP_NAME'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const env: LoggerOptions = {
    jobName: process.env.JOB_NAME!,
    appName: process.env.APP_NAME!,
    lokiUrl: process.env.LOKI_URL,
    logLevel: process.env.LOG_LEVEL,
    nodeEnv: process.env.NODE_ENV
};

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
        logger = createLogger({
            jobName: env.jobName,
            appName: env.appName,
            lokiUrl: env.lokiUrl,
            logLevel: env.logLevel,
            nodeEnv: env.nodeEnv
        });
    }
    return logger;
}

/**
 * Resets the logger instance (primarily for testing)
 */
export function resetLogger(): void {
    logger = null;
}
